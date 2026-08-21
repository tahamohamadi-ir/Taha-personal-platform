"""Custom admin content API (ADR-0026, ADM-1).

Staff + OTP protected endpoints over the canonical content entities: read
(``GET /{entity}`` list, ``GET /{entity}/{id}`` detail) and the write path
(``GET /schema`` writable-field metadata, ``POST /{entity}`` create,
``PUT /{entity}/{id}`` update with optimistic locking via ``If-Match``).
Unsafe methods additionally enforce the same-origin CSRF baseline.
"""

from __future__ import annotations

import re
from datetime import UTC, datetime

from django.db import IntegrityError, models, transaction
from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone
from ninja import Field, Router, Schema

from apps.api.admin_common import (
    AdminError,
    _check_csrf,
    _client_ip,
    _require_admin_otp,
)
from apps.content.models import (
    Article,
    ContentRevision,
    Landing,
    Profile,
    Project,
    Publication,
    ResearchStatement,
    ResearchTopic,
)
from apps.content.revisions import create_revision, restore_revision_as_draft
from apps.rebuild.services import invoke_static_rebuild
from apps.security.models import AuditLog

content_router = Router()

ENTITY_MODELS = {
    "landing": Landing,
    "profile": Profile,
    "article": Article,
    "research-topic": ResearchTopic,
    "research-statement": ResearchStatement,
    "project": Project,
    "publication": Publication,
}

VALID_LOCALES = ("fa", "en")
VALID_STATUSES = ("draft", "review", "scheduled", "published", "archived")

# Allowed lifecycle transitions per current status (ADM-4 / DEBT-0005).
ALLOWED_TRANSITIONS = {
    "draft": {"review", "scheduled", "published", "archived"},
    "review": {"draft", "scheduled", "published", "archived"},
    "scheduled": {"draft", "published", "archived"},
    "published": {"archived"},
    "archived": {"draft"},
}

TRANSITION_REASON_MAX = 500

# Sentinel returned by _coerce_field_value for blank numeric fields so the
# caller leaves the field unchanged instead of failing on an empty string.
_SKIP = object()


def _parse_positive_int(request, name: str, raw: str | None, default: int, max_value: int) -> int:
    """Parse an integer query param; invalid/out-of-range returns 400 VALIDATION."""
    if raw is None or raw == "":
        return default
    try:
        value = int(raw)
    except (TypeError, ValueError):
        raise AdminError(400, "VALIDATION", f"Invalid {name}.") from None
    if value < 1 or value > max_value:
        raise AdminError(400, "VALIDATION", f"{name} must be between 1 and {max_value}.")
    return value

DETAIL_FIELD_MAPS: dict[str, dict[str, str]] = {
    "landing": {
        "body": "body",
        "seo_title": "seoTitle",
        "seo_description": "seoDescription",
    },
    "profile": {
        "short_bio": "shortBio",
        "long_bio": "longBio",
        "availability": "availability",
        "body": "body",
        "seo_title": "seoTitle",
        "seo_description": "seoDescription",
        "revision": "revision",
    },
    "article": {
        "excerpt": "excerpt",
        "body": "body",
        "license": "license",
        "reading_time_minutes": "readingTimeMinutes",
        "accessibility_notes": "accessibilityNotes",
        "story": "storyId",
    },
    "research-topic": {
        "summary": "summary",
        "motivation": "motivation",
        "problems": "problems",
        "research_questions": "researchQuestions",
        "methods": "methods",
        "future_directions": "futureDirections",
    },
    "research-statement": {"body": "body"},
    "project": {
        "project_type": "projectType",
        "objective": "objective",
        "methods_summary": "methodsSummary",
        "role": "role",
        "start_date": "startDate",
        "end_date": "endDate",
        "license": "license",
        "code_availability": "codeAvailability",
        "data_availability": "dataAvailability",
        "demo_availability": "demoAvailability",
        "code_url": "codeUrl",
        "data_url": "dataUrl",
        "demo_url": "demoUrl",
        "show_on_projects": "showOnProjects",
    },
    "publication": {
        "authors": "authors",
        "venue": "venue",
        "date": "date",
        "doi": "doi",
        "url": "url",
        "pdf_url": "pdfUrl",
        "license": "license",
    },
}

# Writable fields = DETAIL_FIELD_MAPS minus server-managed fields (profile.revision),
# preserving the map insertion order.
WRITABLE_FIELD_MAPS: dict[str, dict[str, str]] = {
    entity: {
        attr: key
        for attr, key in DETAIL_FIELD_MAPS[entity].items()
        if attr != "revision"
    }
    for entity in ENTITY_MODELS
}

# Reversed writable lookup: camelCase field key -> model attribute name.
_FIELD_ATTRS: dict[str, dict[str, str]] = {
    entity: {key: attr for attr, key in field_map.items()}
    for entity, field_map in WRITABLE_FIELD_MAPS.items()
}


def _label_for_key(key: str) -> str:
    """camelCase key -> human label, e.g. "readingTimeMinutes" -> "Reading Time Minutes"."""
    words = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", key).split()
    return " ".join(word[:1].upper() + word[1:] for word in words)


def _field_type(field) -> str:
    """Generic form widget type for a Django model field."""
    if isinstance(field, models.BooleanField):
        return "boolean"
    if isinstance(field, models.ForeignKey):
        return "number"
    if isinstance(field, models.DateField):
        return "date"
    if isinstance(field, models.IntegerField):
        return "number"
    if isinstance(field, models.TextField):
        return "textarea"
    return "text"


def _coerce_field_value(field, attr: str, key: str, value) -> object:
    """Coerce a raw JSON value to the Django field's python type.

    ``key`` is the camelCase API key used for error reporting (the SPA maps
    field errors by schema key). Returns ``_SKIP`` for blank numeric values so
    callers can leave the field unchanged instead of failing on an empty string.
    """
    if isinstance(field, models.BooleanField):
        if value in (None, ""):
            return _SKIP
        if isinstance(value, bool):
            return value
        if isinstance(value, str) and value.lower() in {"true", "1", "yes", "on"}:
            return True
        if isinstance(value, str) and value.lower() in {"false", "0", "no", "off"}:
            return False
        raise AdminError(
            400,
            "VALIDATION",
            f"Invalid boolean for '{key}'.",
            fields={"fields": [key]},
        )
    if isinstance(field, models.IntegerField):
        if value in (None, ""):
            return _SKIP
        try:
            return int(value)
        except (TypeError, ValueError):
            raise AdminError(
                400,
                "VALIDATION",
                f"Invalid integer for '{key}'.",
                fields={"fields": [key]},
            )             from None
    if isinstance(field, models.ForeignKey):
        if value in (None, ""):
            return None
        try:
            pk = int(value)
        except (TypeError, ValueError):
            raise AdminError(
                400,
                "VALIDATION",
                f"Invalid integer for '{key}'.",
                fields={"fields": [key]},
            ) from None
        related = field.related_model.objects.filter(pk=pk).first()
        if related is None:
            raise AdminError(
                400,
                "VALIDATION",
                f"Invalid reference for '{key}'.",
                fields={"fields": [key]},
            )
        if attr == "story":
            from apps.composition.blocks import KIND_STORY

            if getattr(related, "kind", None) != KIND_STORY:
                raise AdminError(
                    400,
                    "VALIDATION",
                    "storyId must reference a story composition.",
                    fields={"fields": [key]},
                )
        return related
    if isinstance(field, models.DateField):
        if value in (None, ""):
            return None
        try:
            return datetime.strptime(str(value), "%Y-%m-%d").date()
        except ValueError:
            raise AdminError(
                400,
                "VALIDATION",
                f"Invalid date for '{key}'. Expected YYYY-MM-DD.",
                fields={"fields": [key]},
            ) from None
    if isinstance(field, (models.CharField, models.TextField)):
        return "" if value is None else value
    return value


def _coerce_fields(entity: str, model, fields: dict[str, object]) -> dict[str, object]:
    """Validate + coerce a ``fields`` payload against the entity's writable map."""
    attr_map = _FIELD_ATTRS[entity]
    unknown = sorted(key for key in fields if key not in attr_map)
    if unknown:
        raise AdminError(
            400,
            "VALIDATION",
            f"Unknown field(s): {', '.join(unknown)}.",
            fields={"fields": unknown},
        )
    coerced: dict[str, object] = {}
    for key, value in fields.items():
        attr = attr_map[key]
        coerced_value = _coerce_field_value(model._meta.get_field(attr), attr, key, value)
        if coerced_value is not _SKIP:
            coerced[attr] = coerced_value
    return coerced


def _parse_if_match(header: str | None) -> datetime | None:
    """Normalize the If-Match header into an aware datetime, or None."""
    raw = (header or "").strip().strip('"')
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw)
    except ValueError:
        return None


def _serialize_updated_at(dt: datetime) -> str:
    """Format like DjangoJSONEncoder (ECMA-262, millisecond precision, Z for UTC)."""
    r = dt.isoformat()
    if dt.microsecond:
        r = r[:23] + r[26:]
    if r.endswith("+00:00"):
        r = r.removesuffix("+00:00") + "Z"
    return r


def _if_match_matches(header: str | None, item) -> bool:
    """True when the If-Match timestamp equals the row's current updated_at.

    The admin API serializes ``updatedAt`` at millisecond precision (Django's
    ECMA-262 encoder), so a round-tripped If-Match carries at most millisecond
    precision; compare both sides at that precision to tolerate the truncation.
    """
    expected = _parse_if_match(header)
    if expected is None:
        return False
    current = item.updated_at
    try:
        if expected.tzinfo is None or current.tzinfo is None:
            return False
        expected_ms = expected.astimezone(UTC).replace(
            microsecond=(expected.microsecond // 1000) * 1000
        )
        current_ms = current.astimezone(UTC).replace(
            microsecond=(current.microsecond // 1000) * 1000
        )
        return expected_ms == current_ms
    except (TypeError, ValueError):
        return False


class AdminConflictError(AdminError):
    """409 optimistic-lock conflict carrying the server's current updated_at."""

    def __init__(self, current_updated_at: str):
        super().__init__(
            409,
            "CONFLICT",
            "The record was modified by someone else.",
            fields=None,
        )
        self.current_updated_at = current_updated_at


def _admin_conflict_handler(request, exc: AdminConflictError):
    return JsonResponse(
        {
            "code": exc.code,
            "message": exc.message,
            "currentUpdatedAt": exc.current_updated_at,
        },
        status=exc.status,
    )


class ContentListItemOut(Schema):
    """Compact admin row for a content entity (list view)."""

    id: int
    locale: str
    slug: str
    title: str
    status: str
    publishedAt: datetime | None
    scheduledFor: datetime | None = None
    updatedAt: datetime


class ContentListOut(Schema):
    """Paginated content list envelope."""

    items: list[ContentListItemOut]
    page: int
    pageSize: int
    total: int


class ContentDetailOut(Schema):
    """Content detail with entity-specific fields (camelCase keys)."""

    id: int
    locale: str
    slug: str
    title: str
    status: str
    publishedAt: datetime | None
    scheduledFor: datetime | None = None
    createdAt: datetime
    updatedAt: datetime
    fields: dict[str, object]


class ContentFieldSpecOut(Schema):
    """Writable-field metadata for generic SPA form rendering."""

    key: str
    label: str
    type: str


class ContentEntitySchemaOut(Schema):
    """Writable-field schema for one content entity."""

    entity: str
    fields: list[ContentFieldSpecOut]


class ContentSchemaOut(Schema):
    """All entity schemas keyed by entity name."""

    entities: dict[str, ContentEntitySchemaOut]


class ContentCreateIn(Schema):
    """Create payload for any content entity."""

    locale: str
    slug: str
    title: str
    status: str = "draft"
    fields: dict[str, object] = Field(default_factory=dict)


class ContentUpdateIn(Schema):
    """Optimistically-locked partial update payload."""

    title: str | None = None
    slug: str | None = None
    status: str | None = None
    fields: dict[str, object] | None = None


class ContentTransitionIn(Schema):
    """Lifecycle transition request (ADM-4 / DEBT-0005)."""

    to: str
    reason: str | None = None
    scheduledFor: datetime | None = None


class ContentRevisionCreateIn(Schema):
    """Optional note when creating an immutable snapshot."""

    note: str | None = None


class ContentRevisionOut(Schema):
    """Immutable content revision metadata (snapshot omitted from list)."""

    id: int
    entityKey: str
    objectId: int
    note: str
    createdAt: datetime
    createdById: int | None = None
    snapshot: dict[str, object] | None = None


class ContentRevisionListOut(Schema):
    """Revision history for one content row."""

    items: list[ContentRevisionOut]


def _detail_response(item, model, entity: str) -> ContentDetailOut:
    """Serialize an entity row into the shared detail envelope."""
    fields: dict[str, object] = {}
    for attr, key in DETAIL_FIELD_MAPS[entity].items():
        field = model._meta.get_field(attr)
        if isinstance(field, models.ForeignKey):
            fields[key] = getattr(item, field.attname)
        else:
            fields[key] = getattr(item, attr)
    return ContentDetailOut(
        id=item.pk,
        locale=item.locale,
        slug=item.slug,
        title=item.title,
        status=item.status,
        publishedAt=item.published_at,
        scheduledFor=getattr(item, "scheduled_for", None),
        createdAt=item.created_at,
        updatedAt=item.updated_at,
        fields=fields,
    )


def _revision_out(rev: ContentRevision, *, include_snapshot: bool = False) -> ContentRevisionOut:
    return ContentRevisionOut(
        id=rev.pk,
        entityKey=rev.entity_key,
        objectId=rev.object_id,
        note=rev.note,
        createdAt=rev.created_at,
        createdById=rev.created_by_id,
        snapshot=rev.snapshot if include_snapshot else None,
    )


def _apply_lifecycle_side_effects(item, *, new_status: str, scheduled_for: datetime | None) -> None:
    """Set published_at / scheduled_for consistent with the target status."""
    if new_status == "scheduled":
        if scheduled_for is None:
            raise AdminError(
                400,
                "VALIDATION",
                "scheduledFor is required when transitioning to scheduled.",
            )
        if timezone.is_naive(scheduled_for):
            scheduled_for = timezone.make_aware(
                scheduled_for, timezone.get_current_timezone()
            )
        if scheduled_for <= timezone.now():
            raise AdminError(
                400,
                "VALIDATION",
                "scheduledFor must be in the future.",
            )
        item.scheduled_for = scheduled_for
    else:
        item.scheduled_for = None
    if new_status == "published" and item.published_at is None:
        item.published_at = timezone.now()


@content_router.get("/schema", response=ContentSchemaOut, summary="Writable-field metadata.")
def content_schema(request):
    _require_admin_otp(request)
    entities: dict[str, ContentEntitySchemaOut] = {}
    for entity, field_map in WRITABLE_FIELD_MAPS.items():
        model = ENTITY_MODELS[entity]
        entities[entity] = ContentEntitySchemaOut(
            entity=entity,
            fields=[
                ContentFieldSpecOut(
                    key=key,
                    label=_label_for_key(key),
                    type=_field_type(model._meta.get_field(attr)),
                )
                for attr, key in field_map.items()
            ],
        )
    return ContentSchemaOut(entities=entities)


@content_router.get("/{entity}", response=ContentListOut, summary="List content.")
def content_list(
    request,
    entity: str,
    locale: str | None = None,
    status: str | None = None,
    q: str | None = None,
    page: str = "1",
    pageSize: str = "20",
):
    _require_admin_otp(request)
    model = ENTITY_MODELS.get(entity)
    if model is None:
        raise AdminError(404, "NOT_FOUND", "Unknown content entity.")
    if locale is not None and locale not in VALID_LOCALES:
        raise AdminError(
            400, "VALIDATION", f"Invalid locale. Expected one of: {', '.join(VALID_LOCALES)}."
        )
    if status is not None and status not in VALID_STATUSES:
        raise AdminError(
            400, "VALIDATION", f"Invalid status. Expected one of: {', '.join(VALID_STATUSES)}."
        )
    page_num = _parse_positive_int(request, "page", page, default=1, max_value=1_000_000)
    page_size = _parse_positive_int(request, "pageSize", pageSize, default=20, max_value=100)

    qs = model.objects.all().order_by("-updated_at", "-id")
    if locale is not None:
        qs = qs.filter(locale=locale)
    if status is not None:
        qs = qs.filter(status=status)
    if q is not None:
        qs = qs.filter(Q(title__icontains=q) | Q(slug__icontains=q))

    total = qs.count()
    items = qs[(page_num - 1) * page_size : page_num * page_size]
    return ContentListOut(
        items=[
            ContentListItemOut(
                id=item.pk,
                locale=item.locale,
                slug=item.slug,
                title=item.title,
                status=item.status,
                publishedAt=item.published_at,
                scheduledFor=getattr(item, "scheduled_for", None),
                updatedAt=item.updated_at,
            )
            for item in items
        ],
        page=page_num,
        pageSize=page_size,
        total=total,
    )


@content_router.get(
    "/{entity}/{id}",
    response=ContentDetailOut,
    summary="Content detail with entity-specific fields.",
)
def content_detail(request, entity: str, id: int):
    _require_admin_otp(request)
    model = ENTITY_MODELS.get(entity)
    if model is None:
        raise AdminError(404, "NOT_FOUND", "Unknown content entity.")
    item = model.objects.filter(pk=id).first()
    if item is None:
        raise AdminError(404, "NOT_FOUND", "Content not found.")
    return _detail_response(item, model, entity)


@content_router.post(
    "/{entity}",
    response={201: ContentDetailOut},
    summary="Create content.",
)
def content_create(request, entity: str, payload: ContentCreateIn):
    _require_admin_otp(request)
    _check_csrf(request)
    model = ENTITY_MODELS.get(entity)
    if model is None:
        raise AdminError(404, "NOT_FOUND", "Unknown content entity.")
    if payload.locale not in VALID_LOCALES:
        raise AdminError(
            400, "VALIDATION", f"Invalid locale. Expected one of: {', '.join(VALID_LOCALES)}."
        )
    if payload.status not in VALID_STATUSES:
        raise AdminError(
            400, "VALIDATION", f"Invalid status. Expected one of: {', '.join(VALID_STATUSES)}."
        )
    if payload.status == "scheduled":
        raise AdminError(
            400,
            "VALIDATION",
            "Use POST .../transition with scheduledFor to schedule publishing.",
        )
    slug = payload.slug.strip()
    title = payload.title.strip()
    if not slug:
        raise AdminError(400, "VALIDATION", "slug must not be empty.")
    if not title:
        raise AdminError(400, "VALIDATION", "title must not be empty.")
    set_fields = _coerce_fields(entity, model, payload.fields)
    if model.objects.filter(locale=payload.locale, slug=slug).exists():
        raise AdminError(409, "DUPLICATE", "A record with this locale and slug already exists.")
    if payload.status == "published" and hasattr(model, "published_at"):
        set_fields["published_at"] = timezone.now()
    try:
        with transaction.atomic():
            item = model.objects.create(
                locale=payload.locale,
                slug=slug,
                title=title,
                status=payload.status,
                **set_fields,
            )
    except IntegrityError:
        raise AdminError(
            409, "DUPLICATE", "A record with this locale and slug already exists."
        ) from None
    return _detail_response(item, model, entity)


@content_router.put(
    "/{entity}/{id}",
    response=ContentDetailOut,
    summary="Update content (optimistic locking).",
)
def content_update(request, entity: str, id: int, payload: ContentUpdateIn):
    _require_admin_otp(request)
    _check_csrf(request)
    model = ENTITY_MODELS.get(entity)
    if model is None:
        raise AdminError(404, "NOT_FOUND", "Unknown content entity.")
    try:
        with transaction.atomic():
            # Row lock (Postgres) so two concurrent PUTs cannot both pass
            # If-Match; the compare happens under the lock.
            item = model.objects.select_for_update().get(pk=id)
            if not _if_match_matches(request.headers.get("If-Match"), item):
                raise AdminConflictError(_serialize_updated_at(item.updated_at))
            if payload.title is not None:
                title = payload.title.strip()
                if not title:
                    raise AdminError(400, "VALIDATION", "title must not be empty.")
                item.title = title
            if payload.slug is not None:
                slug = payload.slug.strip()
                if not slug:
                    raise AdminError(400, "VALIDATION", "slug must not be empty.")
                if model.objects.filter(locale=item.locale, slug=slug).exclude(pk=item.pk).exists():
                    raise AdminError(
                        409, "DUPLICATE", "A record with this locale and slug already exists."
                    )
                item.slug = slug
            if payload.status is not None:
                if payload.status not in VALID_STATUSES:
                    raise AdminError(
                        400,
                        "VALIDATION",
                        f"Invalid status. Expected one of: {', '.join(VALID_STATUSES)}.",
                    )
                if payload.status == "scheduled":
                    raise AdminError(
                        400,
                        "VALIDATION",
                        "Use POST .../transition with scheduledFor to schedule publishing.",
                    )
                item.status = payload.status
                if payload.status != "scheduled":
                    item.scheduled_for = None
            if payload.fields is not None:
                for attr, value in _coerce_fields(entity, model, payload.fields).items():
                    setattr(item, attr, value)
            if entity == "article":
                story = getattr(item, "story", None)
                if story is not None and story.locale != item.locale:
                    raise AdminError(
                        400,
                        "VALIDATION",
                        "storyId locale must match the article locale.",
                        fields={"fields": ["storyId"]},
                    )
            if (
                payload.status == "published"
                and hasattr(model, "published_at")
                and item.published_at is None
            ):
                item.published_at = timezone.now()
            try:
                item.save()
            except IntegrityError:
                raise AdminError(
                    409, "DUPLICATE", "A record with this locale and slug already exists."
                ) from None
    except model.DoesNotExist:
        raise AdminError(404, "NOT_FOUND", "Content not found.") from None
    return _detail_response(item, model, entity)


@content_router.post(
    "/{entity}/{id}/transition",
    response=ContentDetailOut,
    summary="Transition content lifecycle state.",
)
def content_transition(request, entity: str, id: int, payload: ContentTransitionIn):
    _require_admin_otp(request)
    _check_csrf(request)
    model = ENTITY_MODELS.get(entity)
    if model is None:
        raise AdminError(404, "NOT_FOUND", "Unknown content entity.")
    if payload.to not in VALID_STATUSES:
        raise AdminError(
            400,
            "VALIDATION",
            f"Invalid status. Expected one of: {', '.join(VALID_STATUSES)}.",
        )
    reason = (payload.reason or "").strip()[:TRANSITION_REASON_MAX]
    try:
        with transaction.atomic():
            # Row lock (Postgres) so concurrent transitions cannot both
            # validate against the same stale status; audit is written in the
            # same transaction as the status change.
            item = model.objects.select_for_update().get(pk=id)
            old_status = item.status
            if payload.to not in ALLOWED_TRANSITIONS.get(old_status, set()):
                raise AdminError(
                    400,
                    "VALIDATION",
                    f"Invalid transition from {old_status} to {payload.to}.",
                )
            _apply_lifecycle_side_effects(
                item,
                new_status=payload.to,
                scheduled_for=payload.scheduledFor,
            )
            item.status = payload.to
            try:
                item.save()
            except IntegrityError:
                raise AdminError(
                    409, "DUPLICATE", "A record with this locale and slug already exists."
                ) from None
            detail = f"reason={reason}"
            if payload.to == "scheduled" and item.scheduled_for is not None:
                detail = f"{detail}; scheduledFor={item.scheduled_for.isoformat()}"
            AuditLog.objects.create(
                user=request.user,
                action=f"lifecycle.{old_status}->{payload.to}",
                model_name=entity,
                object_id=str(id),
                ip=_client_ip(request),
                detail=detail,
            )
    except model.DoesNotExist:
        raise AdminError(404, "NOT_FOUND", "Content not found.") from None
    if payload.to == "published":
        invoke_static_rebuild()
    return _detail_response(item, model, entity)


@content_router.get(
    "/{entity}/{id}/revisions",
    response=ContentRevisionListOut,
    summary="List immutable content revisions.",
)
def content_revisions_list(request, entity: str, id: int):
    _require_admin_otp(request)
    model = ENTITY_MODELS.get(entity)
    if model is None:
        raise AdminError(404, "NOT_FOUND", "Unknown content entity.")
    if not model.objects.filter(pk=id).exists():
        raise AdminError(404, "NOT_FOUND", "Content not found.")
    revs = ContentRevision.objects.filter(entity_key=entity, object_id=id)[:100]
    return ContentRevisionListOut(items=[_revision_out(rev) for rev in revs])


@content_router.post(
    "/{entity}/{id}/revisions",
    response={201: ContentRevisionOut},
    summary="Create an immutable content snapshot.",
)
def content_revisions_create(request, entity: str, id: int, payload: ContentRevisionCreateIn):
    _require_admin_otp(request)
    _check_csrf(request)
    model = ENTITY_MODELS.get(entity)
    if model is None:
        raise AdminError(404, "NOT_FOUND", "Unknown content entity.")
    item = model.objects.filter(pk=id).first()
    if item is None:
        raise AdminError(404, "NOT_FOUND", "Content not found.")
    rev = create_revision(
        entity_key=entity,
        item=item,
        field_attrs=DETAIL_FIELD_MAPS[entity],
        user=request.user,
        note=payload.note or "",
    )
    AuditLog.objects.create(
        user=request.user,
        action="revision.create",
        model_name=entity,
        object_id=str(id),
        ip=_client_ip(request),
        detail=f"revision_id={rev.pk}; note={rev.note}",
    )
    return _revision_out(rev, include_snapshot=True)


@content_router.post(
    "/{entity}/{id}/revisions/{revision_id}/restore",
    response=ContentDetailOut,
    summary="Restore a revision as draft (never overwrites live published).",
)
def content_revisions_restore(request, entity: str, id: int, revision_id: int):
    _require_admin_otp(request)
    _check_csrf(request)
    model = ENTITY_MODELS.get(entity)
    if model is None:
        raise AdminError(404, "NOT_FOUND", "Unknown content entity.")
    try:
        with transaction.atomic():
            item = model.objects.select_for_update().get(pk=id)
            revision = ContentRevision.objects.filter(
                pk=revision_id, entity_key=entity, object_id=id
            ).first()
            if revision is None:
                raise AdminError(404, "NOT_FOUND", "Revision not found.")
            pre = restore_revision_as_draft(
                entity_key=entity,
                item=item,
                revision=revision,
                field_attrs=DETAIL_FIELD_MAPS[entity],
                user=request.user,
            )
            AuditLog.objects.create(
                user=request.user,
                action="revision.restore_as_draft",
                model_name=entity,
                object_id=str(id),
                ip=_client_ip(request),
                detail=f"restored_revision_id={revision_id}; pre_restore_revision_id={pre.pk}",
            )
    except model.DoesNotExist:
        raise AdminError(404, "NOT_FOUND", "Content not found.") from None
    except ValueError as exc:
        raise AdminError(400, "VALIDATION", str(exc)) from None
    return _detail_response(item, model, entity)


from apps.api.admin_api import admin_api  # noqa: E402

admin_api.exception_handler(AdminConflictError)(_admin_conflict_handler)
