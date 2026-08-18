"""Typed block catalog + fail-closed validators (ADR-0026, ADM-3).

The block model is intentionally untyped (a JSON ``settings`` blob) so the
composition layout stays flexible; correctness is enforced here, server-side,
before any block is persisted. Unknown block types and unknown setting keys
are rejected rather than silently dropped (fail-closed).
"""

from __future__ import annotations

from apps.media.models import Media

BLOCK_TYPES: list[str] = ["hero", "heading", "text", "quote", "cta", "gallery", "divider"]

BLOCK_TYPE_LABELS_FA: dict[str, str] = {
    "hero": "هرا",
    "heading": "عنوان",
    "text": "متن",
    "quote": "نقلقول",
    "cta": "فراخوان",
    "gallery": "گالری",
    "divider": "جداکننده",
}

# Ordered per type: ``fields`` mirrors the schema contract sent to the SPA.
# ``type`` is one of {"text","textarea","number","select","media","mediaList"};
# ``select`` entries carry ``options``; ``media`` is a single Media pk and
# ``mediaList`` a list of Media pks (1..8). ``required`` names the setting keys
# that must be present (non-empty after strip) for the block to be valid.
BLOCK_FIELD_SPECS: list[dict] = [
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

_SPEC_BY_TYPE: dict[str, dict] = {spec["type"]: spec for spec in BLOCK_FIELD_SPECS}
_FIELD_BY_TYPE: dict[str, dict[str, dict]] = {
    spec["type"]: {field["key"]: field for field in spec["fields"]}
    for spec in BLOCK_FIELD_SPECS
}

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


class BlockValidationError(Exception):
    """Raised by ``validate_block_settings`` for an invalid block document."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


def _check_media_pk(key: str, value) -> None:
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
    if not Media.objects.filter(pk=pk).exists():
        raise BlockValidationError(
            f"Setting '{key}' must reference an existing media id."
        )


def validate_block_settings(block_type: str, settings) -> None:
    """Fail-closed validation of a block's ``settings`` dict (raises on error)."""
    spec = _SPEC_BY_TYPE.get(block_type)
    if spec is None:
        raise BlockValidationError(f"Unknown block type '{block_type}'.")
    if not isinstance(settings, dict):
        raise BlockValidationError("settings must be an object.")

    allowed_keys = set(_FIELD_BY_TYPE[block_type])
    extra = sorted(key for key in settings if key not in allowed_keys)
    if extra:
        raise BlockValidationError(f"Unknown setting key(s): {', '.join(extra)}.")

    for key in spec["required"]:
        if key not in settings:
            raise BlockValidationError(f"Missing required setting '{key}'.")

    for key, value in settings.items():
        field = _FIELD_BY_TYPE[block_type][key]
        ftype = field["type"]
        if ftype in ("text", "textarea"):
            if not isinstance(value, str):
                raise BlockValidationError(f"Setting '{key}' must be a string.")
            if key in spec["required"] and not value.strip():
                raise BlockValidationError(
                    f"Setting '{key}' must not be empty."
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
                _check_media_pk(key, value)
        elif ftype == "mediaList":
            if not isinstance(value, list) or not (1 <= len(value) <= GALLERY_MAX_MEDIA):
                raise BlockValidationError(
                    f"Setting '{key}' must be a list of 1 to {GALLERY_MAX_MEDIA} media ids."
                )
            for pk in value:
                _check_media_pk(key, pk)

    if block_type == "divider" and settings:
        raise BlockValidationError("divider block must have empty settings.")


def composition_schema() -> dict:
    """Schema metadata sent to the admin SPA (Persian labels)."""
    return {
        "blockTypes": [
            {
                "type": spec["type"],
                "labelFa": BLOCK_TYPE_LABELS_FA[spec["type"]],
                "fields": [dict(field) for field in spec["fields"]],
            }
            for spec in BLOCK_FIELD_SPECS
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
