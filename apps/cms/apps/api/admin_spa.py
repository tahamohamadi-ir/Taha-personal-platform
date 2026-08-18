"""Dev-only preview route for the built React admin SPA (ADR-0026, pre-ADM-1).

Serves the static build at ``apps/cms/admin-frontend/dist`` under ``/admin-ui/``
with SPA client-side fallback to ``index.html``. DEV-ONLY: the view raises 404
when ``settings.DEBUG`` is False so the route cannot expose the admin UI in
production before the real cutover under ``/admin/`` (ADM-1). Public exposure
under ``/admin/`` is a later phase; do not gate on auth here.
"""

from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404
from django.views.decorators.http import require_GET

SPA_ROOT = Path(settings.BASE_DIR) / "admin-frontend" / "dist"


@require_GET
def serve_admin_ui(request, spa_path: str = "index.html"):
    """Serve a built admin SPA asset, falling back to ``index.html`` for routes.

    Path traversal is blocked by resolving the requested path and checking it
    stays inside the SPA root. Missing builds produce a 404 with a build hint.
    """
    if not settings.DEBUG:
        raise Http404("Admin UI preview is only available in development.")

    resolved_root = SPA_ROOT.resolve()
    target = (resolved_root / spa_path).resolve()
    try:
        target.relative_to(resolved_root)
    except ValueError:
        raise Http404("Not found.") from None

    if not target.is_file():
        target = SPA_ROOT / "index.html"
    if not target.is_file():
        raise Http404(
            "Admin frontend not built — run `npm run build` in apps/cms/admin-frontend."
        )

    response = FileResponse(target.open("rb"))
    response["X-Robots-Tag"] = "noindex, nofollow, noarchive"
    response["Cache-Control"] = "no-store"
    return response
