from django.urls import path, reverse
from wagtail import hooks
from wagtail.admin.menu import MenuItem

from apps.admin.views import profile_detail_page, profile_index


@hooks.register("register_admin_urls")
def register_admin_urls():
    return [
        path("profiles/", profile_index, name="admin_profile_index"),
        path(
            "profiles/<str:locale>/<slug:slug>/",
            profile_detail_page,
            name="admin_profile_detail_page",
        ),
    ]


@hooks.register("register_admin_menu_item")
def register_admin_menu_item():
    return MenuItem("Profiles", reverse("admin_profile_index"), icon_name="user", order=9000)
