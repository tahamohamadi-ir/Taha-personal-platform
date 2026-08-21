"""Wagtail admin hooks: staff preview URLs only (content viewsets retired)."""

from django.urls import path
from wagtail import hooks

from apps.content.views_preview import staff_content_preview


@hooks.register("register_admin_urls")
def register_staff_preview_urls():
    return [
        path(
            "preview/<str:kind>/<int:pk>/",
            staff_content_preview,
            name="content_staff_preview",
        ),
    ]
