"""URL configuration — /admin/ React SPA, /admin-wagtail/ legacy Wagtail, /health/."""

from django.urls import include, path
from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtail_admin_urls

from apps.api.admin_api import admin_api
from apps.api.admin_spa import serve_admin_ui
from apps.api.api import api
from apps.content.admin_api import admin_profile_create_sibling, admin_profile_detail
from apps.content.public_api import public_profile_detail, public_profile_list
from apps.health.views import health
from apps.rebuild.views import rebuild_trigger

urlpatterns = [
    path("health/", health, name="health"),
    # Custom React admin SPA (ADR-0026, ADM-1 cutover).
    path("admin/", serve_admin_ui, name="admin_spa"),
    path("admin/<path:spa_path>", serve_admin_ui, name="admin_spa_path"),
    # Legacy Wagtail admin preserved at /admin-wagtail/ for TOTP enrollment,
    # staff preview, profile admin, and rollback.  Will be removed in ADM-0.
    path("admin-wagtail/", include(wagtail_admin_urls)),
    path("api/v1/admin/", admin_api.urls),
    path("api/profiles/<str:locale>", public_profile_list, name="public_profile_list"),
    path(
        "api/profiles/<str:locale>/<slug:slug>",
        public_profile_detail,
        name="public_profile_detail",
    ),
    path(
        "api/admin/profiles/<str:locale>/<slug:slug>",
        admin_profile_detail,
        name="admin_profile_detail",
    ),
    path(
        "api/admin/profiles/<str:locale>/<slug:slug>/siblings/<str:target_locale>",
        admin_profile_create_sibling,
        name="admin_profile_create_sibling",
    ),
    path("api/", api.urls),
    path("rebuild-trigger/", rebuild_trigger, name="rebuild_trigger"),
    path("", include(wagtail_urls)),
]
