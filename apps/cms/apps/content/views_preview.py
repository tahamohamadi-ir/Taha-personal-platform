"""Staff-only draft preview for existing content models (P3-07).

There are no Wagtail Page subclasses in this repo. Preview targets the plain
Django models Landing / Profile / Article under ``/admin/preview/``.
"""

from django.http import Http404
from django.shortcuts import get_object_or_404, render
from wagtail.admin.auth import require_admin_access
from wagtail.whitelist import Whitelister

from apps.content.models import Article, Landing, Profile

PREVIEW_KINDS = {
    "landing": Landing,
    "profile": Profile,
    "article": Article,
}


def sanitize_preview_body(raw: str) -> str:
    """Apply the same Whitelister contract used by ADR-0022 allowlist tests."""
    return Whitelister().clean(raw or "")


@require_admin_access
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
