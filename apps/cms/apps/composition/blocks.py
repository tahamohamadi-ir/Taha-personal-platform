"""Typed block catalog + fail-closed validators (ADR-0026, ADM-3).

Landing pages keep the bilingual catalog. Story documents use a separate
single-locale catalog (figure/video/audio/math). Unknown types and unknown
setting keys are rejected rather than silently dropped (fail-closed).
"""

from __future__ import annotations

from apps.media.models import Media
from apps.media.sniff import mime_family

KIND_LANDING = "landing"
KIND_STORY = "story"
VALID_KINDS = (KIND_LANDING, KIND_STORY)

LANDING_BLOCK_TYPES: list[str] = [
    "hero",
    "heading",
    "text",
    "quote",
    "cta",
    "gallery",
    "divider",
]
STORY_BLOCK_TYPES: list[str] = [
    "heading",
    "text",
    "quote",
    "cta",
    "figure",
    "gallery",
    "video",
    "audio",
    "math",
    "divider",
]
# Backward-compatible alias: landing catalog (existing admin tests).
BLOCK_TYPES: list[str] = list(LANDING_BLOCK_TYPES)

BLOCK_TYPE_LABELS_FA: dict[str, str] = {
    "hero": "هرا",
    "heading": "عنوان",
    "text": "متن",
    "quote": "نقلقول",
    "cta": "فراخوان",
    "gallery": "گالری",
    "divider": "جداکننده",
    "figure": "تصویر",
    "video": "ویدیو",
    "audio": "صوت",
    "math": "فرمول",
}

LANDING_BLOCK_FIELD_SPECS: list[dict] = [
    {
        "type": "hero",
        "required": ["titleFa", "titleEn", "leadFa", "leadEn"],
        "fields": [
            {"key": "titleFa", "label": "عنوان (فارسی)", "type": "text"},
            {"key": "titleEn", "label": "عنوان (انگلیسی)", "type": "text"},
            {"key": "leadFa", "label": "مقدمه (فارسی)", "type": "textarea"},
            {"key": "leadEn", "label": "مقدمه (انگلیسی)", "type": "textarea"},
            {
                "key": "align",
                "label": "تراز",
                "type": "select",
                "options": ["left", "center", "right"],
            },
            {"key": "mediaId", "label": "تصویر", "type": "media"},
        ],
    },
    {
        "type": "heading",
        "required": ["textFa", "textEn"],
        "fields": [
            {"key": "textFa", "label": "متن (فارسی)", "type": "text"},
            {"key": "textEn", "label": "متن (انگلیسی)", "type": "text"},
            {"key": "level", "label": "سطح", "type": "select", "options": ["h2", "h3", "h4"]},
        ],
    },
    {
        "type": "text",
        "required": ["bodyFa", "bodyEn"],
        "fields": [
            {"key": "bodyFa", "label": "متن (فارسی)", "type": "textarea"},
            {"key": "bodyEn", "label": "متن (انگلیسی)", "type": "textarea"},
        ],
    },
    {
        "type": "quote",
        "required": ["bodyFa", "bodyEn", "sourceFa", "sourceEn"],
        "fields": [
            {"key": "bodyFa", "label": "متن (فارسی)", "type": "textarea"},
            {"key": "bodyEn", "label": "متن (انگلیسی)", "type": "textarea"},
            {"key": "sourceFa", "label": "منبع (فارسی)", "type": "text"},
            {"key": "sourceEn", "label": "منبع (انگلیسی)", "type": "text"},
        ],
    },
    {
        "type": "cta",
        "required": ["labelFa", "labelEn"],
        "fields": [
            {"key": "labelFa", "label": "برچسب (فارسی)", "type": "text"},
            {"key": "labelEn", "label": "برچسب (انگلیسی)", "type": "text"},
            {"key": "url", "label": "پیوند", "type": "text"},
            {"key": "style", "label": "سبک", "type": "select", "options": ["primary", "secondary"]},
        ],
    },
    {
        "type": "gallery",
        "required": ["mediaIds"],
        "fields": [
            {"key": "mediaIds", "label": "تصاویر", "type": "mediaList"},
        ],
    },
    {
        "type": "divider",
        "required": [],
        "fields": [],
    },
]

STORY_BLOCK_FIELD_SPECS: list[dict] = [
    {
        "type": "heading",
        "required": ["text"],
        "fields": [
            {"key": "text", "label": "متن", "type": "text"},
            {"key": "level", "label": "سطح", "type": "select", "options": ["h2", "h3", "h4"]},
        ],
    },
    {
        "type": "text",
        "required": ["body"],
        "fields": [
            {"key": "body", "label": "متن", "type": "textarea"},
        ],
    },
    {
        "type": "quote",
        "required": ["body", "source"],
        "fields": [
            {"key": "body", "label": "متن", "type": "textarea"},
            {"key": "source", "label": "منبع", "type": "text"},
        ],
    },
    {
        "type": "cta",
        "required": ["label"],
        "fields": [
            {"key": "label", "label": "برچسب", "type": "text"},
            {"key": "url", "label": "پیوند", "type": "text"},
            {"key": "style", "label": "سبک", "type": "select", "options": ["primary", "secondary"]},
        ],
    },
    {
        "type": "figure",
        "required": ["mediaId"],
        "fields": [
            {"key": "mediaId", "label": "تصویر", "type": "media"},
            {"key": "caption", "label": "شرح", "type": "text"},
        ],
        "mediaFamily": "image",
    },
    {
        "type": "gallery",
        "required": ["mediaIds"],
        "fields": [
            {"key": "mediaIds", "label": "تصاویر", "type": "mediaList"},
        ],
        "mediaFamily": "image",
    },
    {
        "type": "video",
        "required": ["mediaId"],
        "fields": [
            {"key": "mediaId", "label": "ویدیو", "type": "media"},
            {"key": "caption", "label": "شرح", "type": "text"},
        ],
        "mediaFamily": "video",
    },
    {
        "type": "audio",
        "required": ["mediaId"],
        "fields": [
            {"key": "mediaId", "label": "صوت", "type": "media"},
            {"key": "caption", "label": "شرح", "type": "text"},
        ],
        "mediaFamily": "audio",
    },
    {
        "type": "math",
        "required": ["html"],
        "fields": [
            {"key": "html", "label": "MathML یا متن", "type": "textarea"},
        ],
    },
    {
        "type": "divider",
        "required": [],
        "fields": [],
    },
]

BLOCK_FIELD_SPECS: list[dict] = LANDING_BLOCK_FIELD_SPECS

SECTION_LAYOUT_RATIOS: dict[str, list[str]] = {
    "1col": [""],
    "2col": ["1:1", "1:2", "2:1"],
    "3col": ["1:1:1"],
}

SECTION_LAYOUT_LABELS_FA: dict[str, str] = {
    "1col": "۱ ستون",
    "2col": "۲ ستون",
    "3col": "۳ ستون",
}

GALLERY_MAX_MEDIA = 8
MATH_HTML_MAX_LENGTH = 8000


class BlockValidationError(Exception):
    """Raised by ``validate_block_settings`` for an invalid block document."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


def allowed_block_types(kind: str) -> list[str]:
    """Block types accepted for a composition kind."""
    if kind == KIND_STORY:
        return list(STORY_BLOCK_TYPES)
    return list(LANDING_BLOCK_TYPES)


def _catalog(kind: str) -> tuple[dict[str, dict], dict[str, dict[str, dict]]]:
    specs = STORY_BLOCK_FIELD_SPECS if kind == KIND_STORY else LANDING_BLOCK_FIELD_SPECS
    spec_by_type = {spec["type"]: spec for spec in specs}
    field_by_type = {
        spec["type"]: {field["key"]: field for field in spec["fields"]}
        for spec in specs
    }
    return spec_by_type, field_by_type


def _check_media_pk(key: str, value, family: str | None = None) -> None:
    """Require ``value`` to be a real Media primary key.

    Only a strict integer is accepted — floats (``1.9``) and booleans
    (``True`` == 1) are rejected so a value cannot silently resolve to an
    existing row. Numeric strings are accepted for editor convenience.
    """
    if isinstance(value, bool) or isinstance(value, float):
        raise BlockValidationError(
            f"Setting '{key}' must reference an existing media id."
        )
    if isinstance(value, int):
        pk = value
    elif isinstance(value, str) and value.strip().isdigit():
        pk = int(value)
    else:
        raise BlockValidationError(
            f"Setting '{key}' must reference an existing media id."
        )
    media = Media.objects.filter(pk=pk).only("pk", "mime").first()
    if media is None:
        raise BlockValidationError(
            f"Setting '{key}' must reference an existing media id."
        )
    if family is not None and mime_family(media.mime) != family:
        raise BlockValidationError(
            f"Setting '{key}' must reference {family} media."
        )


def validate_block_settings(block_type: str, settings, kind: str = KIND_LANDING) -> None:
    """Fail-closed validation of a block's ``settings`` dict (raises on error)."""
    if kind not in VALID_KINDS:
        raise BlockValidationError(f"Unknown composition kind '{kind}'.")
    spec_by_type, field_by_type = _catalog(kind)
    spec = spec_by_type.get(block_type)
    if spec is None:
        raise BlockValidationError(f"Unknown block type '{block_type}'.")
    if not isinstance(settings, dict):
        raise BlockValidationError("settings must be an object.")

    allowed_keys = set(field_by_type[block_type])
    extra = sorted(key for key in settings if key not in allowed_keys)
    if extra:
        raise BlockValidationError(f"Unknown setting key(s): {', '.join(extra)}.")

    for key in spec["required"]:
        if key not in settings:
            raise BlockValidationError(f"Missing required setting '{key}'.")

    media_fam = spec.get("mediaFamily")
    for key, value in settings.items():
        field = field_by_type[block_type][key]
        ftype = field["type"]
        if ftype in ("text", "textarea"):
            if not isinstance(value, str):
                raise BlockValidationError(f"Setting '{key}' must be a string.")
            if key in spec["required"] and not value.strip():
                raise BlockValidationError(
                    f"Setting '{key}' must not be empty."
                )
            if block_type == "math" and key == "html" and len(value) > MATH_HTML_MAX_LENGTH:
                raise BlockValidationError(
                    f"Setting '{key}' must be at most {MATH_HTML_MAX_LENGTH} characters."
                )
        elif ftype == "number":
            if isinstance(value, bool) or not isinstance(value, int):
                raise BlockValidationError(f"Setting '{key}' must be a number.")
        elif ftype == "select":
            if value not in field["options"]:
                raise BlockValidationError(
                    f"Setting '{key}' must be one of: {', '.join(field['options'])}."
                )
        elif ftype == "media":
            if value is not None:
                _check_media_pk(key, value, family=media_fam)
        elif ftype == "mediaList":
            if not isinstance(value, list) or not (1 <= len(value) <= GALLERY_MAX_MEDIA):
                raise BlockValidationError(
                    f"Setting '{key}' must be a list of 1 to {GALLERY_MAX_MEDIA} media ids."
                )
            for pk in value:
                _check_media_pk(key, pk, family=media_fam)

    if block_type == "divider" and settings:
        raise BlockValidationError("divider block must have empty settings.")


def composition_schema(kind: str = KIND_LANDING) -> dict:
    """Schema metadata sent to the admin SPA (Persian labels)."""
    if kind not in VALID_KINDS:
        kind = KIND_LANDING
    specs = STORY_BLOCK_FIELD_SPECS if kind == KIND_STORY else LANDING_BLOCK_FIELD_SPECS
    return {
        "kind": kind,
        "blockTypes": [
            {
                "type": spec["type"],
                "labelFa": BLOCK_TYPE_LABELS_FA[spec["type"]],
                "required": list(spec["required"]),
                "fields": [dict(field) for field in spec["fields"]],
            }
            for spec in specs
        ],
        "sectionLayouts": [
            {
                "value": value,
                "label": SECTION_LAYOUT_LABELS_FA[value],
                "ratios": list(ratios),
            }
            for value, ratios in SECTION_LAYOUT_RATIOS.items()
        ],
    }
