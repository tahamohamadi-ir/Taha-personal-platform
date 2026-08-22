"""Staff-only draft preview for existing content models (P3-07).

There are no CMS Page subclasses in this repo. Preview targets the plain
Django models Landing / Profile / Article under ``/staff/preview/``.
"""

from django.http import Http404
from django.shortcuts import get_object_or_404, render

from apps.content.html_sanitize import sanitize_html
from apps.content.models import Article, Landing, Profile
from apps.security.decorators import staff_otp_required

PREVIEW_KINDS = {
    "landing": Landing,
    "profile": Profile,
    "article": Article,
}


def sanitize_preview_body(raw: str) -> str:
    """Apply the same local allowlist contract used by ADR-0022 tests."""
    return sanitize_html(raw)


@staff_otp_required
def staff_content_preview(request, kind: str, pk: int):
    """Read-only staff preview of a content row (any lifecycle status, including draft)."""
    model = PREVIEW_KINDS.get(kind)
    if model is None:
        raise Http404("Unknown preview kind")
    obj = get_object_or_404(model, pk=pk)
    return render(
        request,
        "content/staff_preview.html",
        {
            "kind": kind,
            "object": obj,
            "title": obj.title,
            "content_locale": obj.locale,
            "slug": obj.slug,
            "status": obj.status,
            "body_html": sanitize_preview_body(obj.body),
        },
    )
