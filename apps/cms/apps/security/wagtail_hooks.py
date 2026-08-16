"""Wagtail hooks: TOTP account panel, admin URLs, and login form wiring."""

from django import forms
from django.urls import path, reverse
from django.utils.translation import gettext_lazy as _
from django_otp import user_has_device
from wagtail import hooks
from wagtail.admin.views.account import BaseSettingsPanel, profile_tab

from apps.security.views_totp import (
    recovery_codes_reveal,
    totp_disable,
    totp_qrcode,
    totp_regenerate,
    totp_setup,
)


class _EmptyStatusForm(forms.Form):
    """Unbound placeholder so AccountView media/post loops stay valid."""


class TwoFactorSettingsPanel(BaseSettingsPanel):
    name = "two_factor"
    title = _("Two-factor authentication")
    order = 550
    tab = profile_tab
    form_class = _EmptyStatusForm
    template_name = "security/account_two_factor_panel.html"

    def get_form(self):
        return self.form_class(prefix=self.name)

    def get_context_data(self):
        return {
            "form": self.get_form(),
            "has_totp": user_has_device(self.user, confirmed=True),
            "setup_url": reverse("security_totp_setup"),
        }


@hooks.register("register_admin_urls")
def register_totp_urls():
    return [
        path("account/two-factor/", totp_setup, name="security_totp_setup"),
        path("account/two-factor/qrcode/", totp_qrcode, name="security_totp_qrcode"),
        path(
            "account/two-factor/recovery-codes/",
            recovery_codes_reveal,
            name="security_recovery_codes_reveal",
        ),
        path(
            "account/two-factor/regenerate/",
            totp_regenerate,
            name="security_totp_regenerate",
        ),
        path(
            "account/two-factor/disable/",
            totp_disable,
            name="security_totp_disable",
        ),
    ]


@hooks.register("register_account_settings_panel")
def register_two_factor_panel(request, user, profile):
    return TwoFactorSettingsPanel(request, user, profile)


@hooks.register("register_account_menu_item")
def register_two_factor_menu_item(request):
    return {
        "url": reverse("security_totp_setup"),
        "label": _("Two-factor authentication"),
        "help_text": _("Set up or review authenticator-app (TOTP) protection."),
    }
