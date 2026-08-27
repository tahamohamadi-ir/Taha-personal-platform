"""Admin timeline records API (Track AB-03).

Staff + OTP protected CRUD over the BK-02 ``TimelineRecord`` rows of one
locale under ``/api/v1/admin/timeline/*``. Draft and published rows are both
admin-visible here; the public gate stays ``published_for_locale``.

Frozen contract (docs/plan/TRACK-AB-admin-backend-api-task-list.md, AB-03):

- GET    ``/{locale}?profile=<id>``    -> 200 ``[item, ...]`` ordered by
                                        (order, id); the optional ``profile``
                                        query param filters to rows attached
                                        to that Profile id; unknown locale ->
                                        404
- POST   ``/{locale}``                 -> create; position=append (order =
                                        max + 1) by default; optional body
                                        ``after_id`` inserts after that row
                                        by shifting every later row of the
                                        locale by +1 (integers only)
- PATCH  ``/{locale}/{id}`` (If-Match) -> field edit; 428 PRECONDITION_REQUIRED
                                        when the header is missing; 409
                                        STALE_REVISION on revision mismatch
- DELETE ``/{locale}/{id}`` (If-Match) -> hard delete (the model has no
                                        soft-delete convention); 204 empty
                                        body
- POST   ``/{locale}/reorder``         -> body ``{"ids": [...]}`` must be a
                                        full permutation of the locale's row
                                        ids; orders become 1..n by position

Errors are ProblemDetails ``{code, message, fields: {path: [token]}}`` bodies
with the stable field tokens ``BAD_TYPE | INVALID_DETAIL_URL | BAD_WEIGHT |
UNKNOWN_ID | DUPLICATE_ORDER`` plus the shared If-Match pair. Validation runs
before any write, so an atomic reject keeps prior rows.

Each item carries ``updatedAt`` (ECMA-262 ISO, millisecond precision) which
doubles as the per-row ``If-Match`` revision.

``attach`` accepts a Profile id of the same locale only; ``null``/omitted
keeps the record standalone; on PATCH an explicit ``null`` clears it.
``order`` is deliberately not PATCH-editable: reordering is the dedicated
``/reorder`` operation.

Stable token constants below are declared once here; graduating them into
``apps/api/admin_common.py`` is left to the consolidation packet (AB-07).
"""

from __future__ import annotations

from datetime import UTC, datetime

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import F, Max
from django.http import HttpResponse
from django.utils import timezone
from ninja import Field, Router, Schema

from apps.api.admin_common import (
    AdminError,
    _check_csrf,
    _client_ip,
    _require_admin_otp,
)
from apps.content.models import (
    Locale,
    Profile,
    TimelineRecord,
    TimelineRecordType,
    validate_detail_url,
)
from apps.security.models import AuditLog

timeline_router = Router()

VALID_LOCALES = tuple(Locale.values)
VALID_TYPES = tuple(TimelineRecordType.values)

# Stable error tokens (declared once; see module docstring).
PRECONDITION_REQUIRED = "PRECONDITION_REQUIRED"
STALE_REVISION = "STALE_REVISION"
BAD_TYPE = "BAD_TYPE"
INVALID_DETAIL_URL = "INVALID_DETAIL_URL"
BAD_WEIGHT = "BAD_WEIGHT"
UNKNOWN_ID = "UNKNOWN_ID"
DUPLICATE_ORDER = "DUPLICATE_ORDER"

WEIGHT_MAX = 32767  # PositiveSmallIntegerField storage bound.


class TimelineCreateIn(Schema):
    """Create payload (position=append default; optional after_id insert)."""

    type: str
    label: str = Field(min_length=1, max_length=200)
    period_label: str = Field(default="", max_length=100)
    body: str = ""
    role: str = Field(default="", max_length=300)
    weight: int = 0
    detail_url: str = Field(default="", max_length=300)
    attach: int | None = None
    after_id: int | None = None


class TimelinePatchIn(Schema):
    """Partial field edit; an explicit null ``attach`` clears the attachment."""

    type: str | None = None
    label: str | None = Field(default=None, min_length=1, max_length=200)
    period_label: str | None = Field(default=None, max_length=100)
    body: str | None = None
    role: str | None = Field(default=None, max_length=300)
    weight: int | None = None
    detail_url: str | None = Field(default=None, max_length=300)
    attach: int | None = None


class TimelineReorderIn(Schema):
    """Full id permutation of one locale's rows."""

    ids: list[int]


class TimelineAdminOut(Schema):
    """Admin projection of one TimelineRecord row."""

    id: int
    type: str
    label: str
    period_label: str
    body: str
    role: str
    weight: int
    detail_url: str
    order: int
    attach: int | None
    updatedAt: str


def _locale_rows(locale: str) -> list[TimelineRecord]:
    return list(TimelineRecord.objects.for_locale(locale))


def _format_revision(value: datetime) -> str:
    """ECMA-262 style ISO string at millisecond precision (mirrors admin_home)."""
    text = value.isoformat()
    if value.microsecond:
        text = text[:23] + text[26:]
    if text.endswith("+00:00"):
        text = text.removesuffix("+00:00") + "Z"
    return text


def _parse_revision(header: str | None) -> datetime | None:
    raw = (header or "").strip().strip('"')
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw)
    except ValueError:
        return None


def _revisions_match(expected: datetime, current: datetime) -> bool:
    """Compare both sides at millisecond precision (JS Date round-trip safety)."""
    try:
        expected_ms = expected.astimezone(UTC).replace(
            microsecond=(expected.microsecond // 1000) * 1000
        )
        current_ms = current.astimezone(UTC).replace(
            microsecond=(current.microsecond // 1000) * 1000
        )
    except (TypeError, ValueError):
        return False
    return expected_ms == current_ms


def _require_valid_locale(locale: str) -> None:
    if locale not in VALID_LOCALES:
        raise AdminError(404, "NOT_FOUND", "Unknown locale.")


def _require_row_revision(request, row: TimelineRecord) -> None:
    """If-Match gate for one row; the row's updatedAt doubles as the revision."""
    header = request.headers.get("If-Match")
    if header is None:
        raise AdminError(
            428,
            PRECONDITION_REQUIRED,
            "An If-Match revision is required. GET the timeline first.",
        )
    expected = _parse_revision(header)
    if expected is None or not _revisions_match(expected, row.updated_at):
        raise AdminError(
            409, STALE_REVISION, "The timeline record was modified by someone else."
        )


def _to_out(row: TimelineRecord) -> TimelineAdminOut:
    return TimelineAdminOut(
        id=row.id,
        type=row.type,
        label=row.label,
        period_label=row.period_label,
        body=row.body,
        role=row.role,
        weight=row.weight,
        detail_url=row.detail_url,
        order=row.order,
        attach=row.attach_id,
        updatedAt=_format_revision(row.updated_at),
    )


def _validation_error(problems: dict[str, list[str]]) -> AdminError:
    return AdminError(
        400,
        "VALIDATION",
        "Timeline record payload failed validation.",
        fields=problems,
    )


def _field_problems(
    *, type_: str, weight: int, detail_url: str, locale: str, attach: int | None
) -> dict[str, list[str]]:
    """Collect every field problem into one ProblemDetails fields map.

    ``attach`` must be an existing Profile id of the same locale (a Profile of
    another locale is not a valid attach target within this locale's scope).
    """
    problems: dict[str, list[str]] = {}
    if type_ not in VALID_TYPES:
        problems.setdefault("type", []).append(BAD_TYPE)
    if weight < 0 or weight > WEIGHT_MAX:
        problems.setdefault("weight", []).append(BAD_WEIGHT)
    try:
        validate_detail_url(detail_url)
    except ValidationError:
        problems.setdefault("detail_url", []).append(INVALID_DETAIL_URL)
    if attach is not None:
        profile = Profile.objects.filter(pk=attach).first()
        if profile is None or profile.locale != locale:
            problems.setdefault("attach", []).append(UNKNOWN_ID)
    return problems


@timeline_router.get(
    "/{locale}",
    response=list[TimelineAdminOut],
    summary="Every timeline record of a locale (draft+published), ordered; "
    "optional profile filter.",
)
def timeline_list(request, locale: str, profile: int | None = None):
    _require_admin_otp(request)
    _require_valid_locale(locale)
    rows = _locale_rows(locale)
    if profile is not None:
        rows = [row for row in rows if row.attach_id == profile]
    return [_to_out(row) for row in rows]


@timeline_router.post(
    "/{locale}",
    response=TimelineAdminOut,
    summary="Create a timeline record (append, or insert after after_id).",
)
def timeline_create(request, locale: str, payload: TimelineCreateIn):
    _require_admin_otp(request)
    _check_csrf(request)
    _require_valid_locale(locale)
    problems = _field_problems(
        type_=payload.type,
        weight=payload.weight,
        detail_url=payload.detail_url,
        locale=locale,
        attach=payload.attach,
    )
    if problems:
        raise _validation_error(problems)
    with transaction.atomic():
        if payload.after_id is not None:
            anchor = (
                TimelineRecord.objects.select_for_update()
                .filter(locale=locale, pk=payload.after_id)
                .first()
            )
            if anchor is None:
                raise _validation_error({"after_id": [UNKNOWN_ID]})
            target_order = anchor.order + 1
            TimelineRecord.objects.filter(
                locale=locale, order__gte=target_order
            ).update(order=F("order") + 1, updated_at=timezone.now())
        else:
            target_order = (
                TimelineRecord.objects.filter(locale=locale).aggregate(
                    max_order=Max("order")
                )["max_order"]
                or 0
            ) + 1
        row = TimelineRecord.objects.create(
            locale=locale,
            attach_id=payload.attach,
            type=payload.type,
            label=payload.label,
            period_label=payload.period_label,
            body=payload.body,
            role=payload.role,
            weight=payload.weight,
            detail_url=payload.detail_url,
            order=target_order,
        )
    AuditLog.objects.create(
        user=request.user,
        action="timeline.create",
        model_name="timeline",
        object_id=str(row.id),
        ip=_client_ip(request),
        detail=f"POST /api/v1/admin/timeline/{locale} -> 200; order={row.order}",
    )
    return _to_out(row)


@timeline_router.post(
    "/{locale}/reorder",
    response=list[TimelineAdminOut],
    summary="Reorder the locale's records; ids must be a full permutation.",
)
def timeline_reorder(request, locale: str, payload: TimelineReorderIn):
    _require_admin_otp(request)
    _check_csrf(request)
    _require_valid_locale(locale)
    ids = payload.ids
    with transaction.atomic():
        rows = list(TimelineRecord.objects.select_for_update().for_locale(locale))
        if len(set(ids)) != len(ids):
            raise _validation_error({"ids": [DUPLICATE_ORDER]})
        if set(ids) != {row.id for row in rows}:
            raise _validation_error({"ids": [UNKNOWN_ID]})
        by_id = {row.id: row for row in rows}
        for position, row_id in enumerate(ids, start=1):
            row = by_id[row_id]
            row.order = position
            row.save(update_fields=["order", "updated_at"])
    fresh = _locale_rows(locale)
    AuditLog.objects.create(
        user=request.user,
        action="timeline.reorder",
        model_name="timeline",
        object_id=locale,
        ip=_client_ip(request),
        detail=f"POST /api/v1/admin/timeline/{locale}/reorder -> 200; count={len(ids)}",
    )
    return [_to_out(row) for row in fresh]


@timeline_router.patch(
    "/{locale}/{id}",
    response=TimelineAdminOut,
    summary="Edit timeline record fields (optimistic locking via If-Match).",
)
def timeline_update(request, locale: str, id: int, payload: TimelinePatchIn):
    _require_admin_otp(request)
    _check_csrf(request)
    _require_valid_locale(locale)
    data = payload.model_dump(exclude_unset=True)
    # Explicit null only means something for attach (clear); every other
    # null-valued field is treated as unset so the merged value stays valid.
    data = {key: value for key, value in data.items() if value is not None or key == "attach"}
    with transaction.atomic():
        row = (
            TimelineRecord.objects.select_for_update()
            .filter(locale=locale, pk=id)
            .first()
        )
        if row is None:
            raise AdminError(404, "NOT_FOUND", "Timeline record not found.")
        _require_row_revision(request, row)
        merged = {
            "type": data.get("type", row.type),
            "label": data.get("label", row.label),
            "period_label": data.get("period_label", row.period_label),
            "body": data.get("body", row.body),
            "role": data.get("role", row.role),
            "weight": data.get("weight", row.weight),
            "detail_url": data.get("detail_url", row.detail_url),
            "attach": data.get("attach", row.attach_id),
        }
        problems = _field_problems(
            type_=merged["type"],
            weight=merged["weight"],
            detail_url=merged["detail_url"],
            locale=locale,
            attach=merged["attach"],
        )
        if problems:
            raise _validation_error(problems)
        row.type = merged["type"]
        row.label = merged["label"]
        row.period_label = merged["period_label"]
        row.body = merged["body"]
        row.role = merged["role"]
        row.weight = merged["weight"]
        row.detail_url = merged["detail_url"]
        row.attach_id = merged["attach"]
        row.save(
            update_fields=[
                "type",
                "label",
                "period_label",
                "body",
                "role",
                "weight",
                "detail_url",
                "attach",
                "updated_at",
            ]
        )
    AuditLog.objects.create(
        user=request.user,
        action="timeline.update",
        model_name="timeline",
        object_id=str(row.id),
        ip=_client_ip(request),
        detail=f"PATCH /api/v1/admin/timeline/{locale}/{row.id} -> 200; fields={sorted(data)}",
    )
    return _to_out(row)


@timeline_router.delete(
    "/{locale}/{id}",
    summary="Delete a timeline record (hard delete; 204 no content).",
)
def timeline_delete(request, locale: str, id: int):
    _require_admin_otp(request)
    _check_csrf(request)
    _require_valid_locale(locale)
    with transaction.atomic():
        row = (
            TimelineRecord.objects.select_for_update()
            .filter(locale=locale, pk=id)
            .first()
        )
        if row is None:
            raise AdminError(404, "NOT_FOUND", "Timeline record not found.")
        _require_row_revision(request, row)
        row.delete()
    AuditLog.objects.create(
        user=request.user,
        action="timeline.delete",
        model_name="timeline",
        object_id=str(id),
        ip=_client_ip(request),
        detail=f"DELETE /api/v1/admin/timeline/{locale}/{id} -> 204",
    )
    return HttpResponse(status=204)

