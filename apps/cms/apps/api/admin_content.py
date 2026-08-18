"""Custom admin content read API (ADR-0026, ADM-1).

Staff + OTP protected read endpoints over the canonical content entities:
``GET /api/v1/admin/content/{entity}`` (filterable, paginated list) and
``GET /api/v1/admin/content/{entity}/{id}`` (detail with entity-specific
fields). Read-only; mutations arrive in later ADM phases.
"""

from __future__ import annotations

from datetime import datetime

from django.db.models import Q
from ninja import Router, Schema

from apps.api.admin_common import AdminError, _require_admin_otp
from apps.content.models import (
    Article,
    Landing,
    Profile,
    Project,
    Publication,
    ResearchStatement,
    ResearchTopic,
)

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
VALID_STATUSES = ("draft", "review", "published", "archived")


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


class ContentListItemOut(Schema):
    """Compact admin row for a content entity (list view)."""

    id: int
    locale: str
    slug: str
    title: str
    status: str
    publishedAt: datetime | None
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
    createdAt: datetime
    updatedAt: datetime
    fields: dict[str, object]


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
    fields: dict[str, object] = {
        key: getattr(item, attr)
        for attr, key in DETAIL_FIELD_MAPS[entity].items()
    }
    return ContentDetailOut(
        id=item.pk,
        locale=item.locale,
        slug=item.slug,
        title=item.title,
        status=item.status,
        publishedAt=item.published_at,
        createdAt=item.created_at,
        updatedAt=item.updated_at,
        fields=fields,
    )
