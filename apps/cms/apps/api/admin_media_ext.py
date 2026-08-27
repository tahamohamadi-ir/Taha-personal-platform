"""Admin media presentation API (Track AB-04).

Staff + OTP protected additive endpoints over the private-by-default
``Media`` rows: ``PATCH /{id}/presentation`` (focal point, rights
statements, license linkage, captions) and ``GET /licenses`` (reference
list backing the AF license select box). The existing media upload/list
endpoints (``apps/api/admin_media.py``) stay untouched.

Frozen contract (docs/plan/TRACK-AB-admin-backend-api-task-list.md, AB-04):

- PATCH ``/{id}/presentation`` (If-Match)
  -> body accepts a SUBSET of ``{focal_x, focal_y, rights_statement_fa,
     rights_statement_en, license_id, caption_fa, caption_en}``;
     200 ``{id, updatedAt}``; 428 PRECONDITION_REQUIRED when the header
     is missing; 409 STALE_REVISION on revision mismatch
- GET ``/licenses`` -> ``[{id, name}]`` ordered by name

Registration: the routes attach DIRECTLY to the ``NinjaAPI`` root router
group via ``register_media_ext(api)`` instead of ``add_router``. The
legacy media API registers an untyped ``media/<media_id>`` pattern, and
Django tries URL patterns in registration order -- an appended literal
``media/licenses`` route would be captured by ``media_detail`` and
rejected as 422 (``licenses`` is not an int). Direct registration puts
the literal routes in the root group, which precedes every
``add_router`` group, mirroring how ``content/<entity>/bulk-archive``
resolves before ``content/<entity>/<id>``.

Explicit-null semantics: an explicit ``null`` CLEARS the targeted field
-- ``focal_x``/``focal_y``/``license_id`` become SQL NULL; the text
fields (``rights_statement_*``, ``caption_*``, blank-default columns)
become the empty string ``""``. Omitted keys leave the stored value
untouched.

Error tokens (ProblemDetails ``{code, message, fields: {path: [token]}}``):
``UNKNOWN_FIELD`` for any body key outside the frozen subset,
``OUT_OF_RANGE`` for focal values outside 0..100, ``UNKNOWN_LICENSE``
for an unknown ``license_id``, ``TOO_LONG`` for captions over the
column bound, plus the shared If-Match pair. Focal values are accepted
at any precision and quantized to two decimal places (ROUND_HALF_UP) to
match the ``Decimal(5, 2)`` columns; the 0..100 check runs BEFORE
quantization.

Stable token constants below are declared once here; graduating them
into ``apps/api/admin_common.py`` is left to the consolidation packet
(AB-07).
"""

from __future__ import annotations

import json
from datetime import UTC, datetime
from decimal import ROUND_HALF_UP, Decimal

from django.db import transaction
from ninja import Schema

from apps.api.admin_common import (
    AdminError,
    _check_csrf,
    _client_ip,
    _require_admin_otp,
)
from apps.media.models import Media, MediaLicense
from apps.security.models import AuditLog

# Body keys accepted by PATCH /{id}/presentation (frozen AB-04 subset).
ALLOWED_PRESENTATION_FIELDS = frozenset(
    {
        "focal_x",
        "focal_y",
        "rights_statement_fa",
        "rights_statement_en",
        "license_id",
        "caption_fa",
        "caption_en",
    }
)

PATCHABLE_TEXT_FIELDS = (
    "rights_statement_fa",
    "rights_statement_en",
    "caption_fa",
    "caption_en",
)

# Stable error tokens (declared once; see module docstring).
PRECONDITION_REQUIRED = "PRECONDITION_REQUIRED"
STALE_REVISION = "STALE_REVISION"
UNKNOWN_FIELD = "UNKNOWN_FIELD"
OUT_OF_RANGE = "OUT_OF_RANGE"
UNKNOWN_LICENSE = "UNKNOWN_LICENSE"
TOO_LONG = "TOO_LONG"

FOCAL_MIN = Decimal("0")
FOCAL_MAX = Decimal("100")
FOCAL_QUANT = Decimal("0.01")
CAPTION_MAX = 300  # Media.caption_fa / caption_en CharField bound.


class MediaPresentationPatchIn(Schema):
    """Subset patch payload; explicit null clears (see module docstring)."""

    focal_x: float | None = None
    focal_y: float | None = None
    rights_statement_fa: str | None = None
    rights_statement_en: str | None = None
    license_id: int | None = None
    caption_fa: str | None = None
    caption_en: str | None = None


class MediaPresentationOut(Schema):
    """PATCH success body: row id plus the new If-Match revision."""

    id: int
    updatedAt: str


class MediaLicenseOut(Schema):
    """Reference row backing the AF license select box."""

    id: int
    name: str


def _format_revision(value: datetime) -> str:
    """ECMA-262 style ISO string at millisecond precision (mirrors admin_media)."""
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


def _require_row_revision(request, media: Media) -> None:
    """If-Match gate for one row; the row's updatedAt doubles as the revision."""
    header = request.headers.get("If-Match")
    if header is None:
        raise AdminError(
            428,
            PRECONDITION_REQUIRED,
            "An If-Match revision is required. GET the media first.",
        )
    expected = _parse_revision(header)
    if expected is None or not _revisions_match(expected, media.updated_at):
        raise AdminError(
            409, STALE_REVISION, "The media row was modified by someone else."
        )


def _quantize_focal(value: float) -> Decimal:
    """Quantize a focal percent to two decimal places (ROUND_HALF_UP)."""
    return Decimal(str(value)).quantize(FOCAL_QUANT, rounding=ROUND_HALF_UP)


def _reject_unknown_fields(request) -> None:
    """Reject any body key outside the frozen subset with UNKNOWN_FIELD."""
    try:
        raw = json.loads(request.body.decode("utf-8"))
    except (ValueError, UnicodeDecodeError):
        raise AdminError(400, "VALIDATION", "Malformed JSON body.") from None
    if not isinstance(raw, dict):
        raise AdminError(400, "VALIDATION", "A JSON object body is required.")
    unknown = sorted(str(key) for key in raw if key not in ALLOWED_PRESENTATION_FIELDS)
    if unknown:
        raise AdminError(
            400,
            "VALIDATION",
            "Unknown field(s) in payload.",
            fields={key: [UNKNOWN_FIELD] for key in unknown},
        )


def _patch_problems(data: dict) -> dict[str, list[str]]:
    """Collect every semantic problem into one ProblemDetails fields map."""
    problems: dict[str, list[str]] = {}
    for axis in ("focal_x", "focal_y"):
        value = data.get(axis)
        if value is None:
            continue
        number = Decimal(str(value))
        if number < FOCAL_MIN or number > FOCAL_MAX:
            problems.setdefault(axis, []).append(OUT_OF_RANGE)
    license_id = data.get("license_id")
    if license_id is not None and not MediaLicense.objects.filter(pk=license_id).exists():
        problems.setdefault("license_id", []).append(UNKNOWN_LICENSE)
    for field in ("caption_fa", "caption_en"):
        value = data.get(field)
        if value is not None and len(value) > CAPTION_MAX:
            problems.setdefault(field, []).append(TOO_LONG)
    return problems


def _validation_error(problems: dict[str, list[str]]) -> AdminError:
    return AdminError(
        400,
        "VALIDATION",
        "Media presentation payload failed validation.",
        fields=problems,
    )


def media_presentation_update(request, media_id: int, payload: MediaPresentationPatchIn):
    """PATCH /api/v1/admin/media/{id}/presentation (optimistic locking)."""
    _require_admin_otp(request)
    _check_csrf(request)
    _reject_unknown_fields(request)
    data = payload.model_dump(exclude_unset=True)
    problems = _patch_problems(data)
    if problems:
        raise _validation_error(problems)
    with transaction.atomic():
        media = Media.objects.select_for_update().filter(pk=media_id).first()
        if media is None:
            raise AdminError(404, "NOT_FOUND", "Media not found.")
        _require_row_revision(request, media)
        update_fields: list[str] = []
        for axis in ("focal_x", "focal_y"):
            if axis in data:
                value = data[axis]
                setattr(media, axis, None if value is None else _quantize_focal(value))
                update_fields.append(axis)
        if "license_id" in data:
            media.license_id = data["license_id"]
            update_fields.append("license")
        for field in PATCHABLE_TEXT_FIELDS:
            if field in data:
                setattr(media, field, data[field] if data[field] is not None else "")
                update_fields.append(field)
        if update_fields:
            update_fields.append("updated_at")
            media.save(update_fields=update_fields)
    AuditLog.objects.create(
        user=request.user,
        action="media.presentation_update",
        model_name="media",
        object_id=str(media_id),
        ip=_client_ip(request),
        detail=(
            f"PATCH /api/v1/admin/media/{media_id}/presentation -> 200; "
            f"fields={sorted(data)}"
        ),
    )
    return MediaPresentationOut(id=media.id, updatedAt=_format_revision(media.updated_at))


def media_licenses(request):
    """GET /api/v1/admin/media/licenses (backs the AF select box)."""
    _require_admin_otp(request)
    return list(MediaLicense.objects.order_by("name").values("id", "name"))


def register_media_ext(api) -> None:
    """Attach the AB-04 routes to the API root group (see module docstring).

    Direct ``api.get``/``api.patch`` registration (instead of ``add_router``)
    is required so the literal ``media/licenses`` path resolves before the
    legacy untyped ``media/<media_id>`` pattern.
    """
    api.get(
        "/media/licenses",
        response=list[MediaLicenseOut],
        summary="Reference list of licenses ordered by name (backs the AF select box).",
    )(media_licenses)
    api.patch(
        "/media/{media_id}/presentation",
        response=MediaPresentationOut,
        summary="Update media presentation metadata (optimistic locking via If-Match).",
    )(media_presentation_update)
