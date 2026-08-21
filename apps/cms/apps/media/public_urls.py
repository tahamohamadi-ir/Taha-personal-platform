"""Build public (or build-time) URLs for Media library rows."""

from __future__ import annotations

from django.conf import settings

from apps.media.models import Media


def public_media_url(media: Media, request=None) -> str:
    """Return an absolute URL when ``request`` is set; otherwise a site-relative path."""
    relative = media.file.url
    if request is not None:
        return request.build_absolute_uri(relative)
    media_url = str(settings.MEDIA_URL)
    prefix = media_url if media_url.startswith("/") else f"/{media_url}"
    return prefix.rstrip("/") + "/" + str(media.file.name).lstrip("/")


def public_media_ref(
    media: Media | None, request=None, *, locale: str | None = None
) -> dict | None:
    """Published-only media payload, or ``None`` when missing/inactive."""
    if media is None or not media.is_active:
        return None
    alt = media.alt_text or ""
    if locale == "fa" and (media.alt_text_fa or "").strip():
        alt = media.alt_text_fa
    elif locale == "en" and (media.alt_text_en or "").strip():
        alt = media.alt_text_en
    return {
        "url": public_media_url(media, request),
        "alt": alt,
        "mime": media.mime or "",
        "title": media.title or "",
    }
