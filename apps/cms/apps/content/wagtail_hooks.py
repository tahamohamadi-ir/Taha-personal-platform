"""Wagtail admin hooks: staff preview URLs + Site content viewsets."""

from django.urls import path
from wagtail import hooks

from apps.content import admin as content_admin  # noqa: F401 — register snippets
from apps.content.views_preview import staff_content_preview
from apps.content.viewsets import SiteContentViewSetGroup


@hooks.register("register_admin_urls")
def register_staff_preview_urls():
    return [
        path(
            "preview/<str:kind>/<int:pk>/",
            staff_content_preview,
            name="content_staff_preview",
        ),
    ]


@hooks.register("register_admin_viewset")
def register_site_content_viewsets():
    return SiteContentViewSetGroup()
