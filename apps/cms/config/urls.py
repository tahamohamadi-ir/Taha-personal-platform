"""URL configuration — /admin/ (Wagtail) same-origin, /health/ public contract."""

from django.urls import include, path
from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtail_admin_urls

from apps.api.api import api
from apps.health.views import health
from apps.rebuild.views import rebuild_trigger

urlpatterns = [
    path("health/", health, name="health"),
    path("admin/", include(wagtail_admin_urls)),
    path("api/", api.urls),
    path("rebuild-trigger/", rebuild_trigger, name="rebuild_trigger"),
    path("", include(wagtail_urls)),
]
