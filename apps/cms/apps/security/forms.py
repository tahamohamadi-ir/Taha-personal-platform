"""Wagtail login form with optional TOTP when the user has a confirmed device."""

from django import forms
from django.utils.translation import gettext_lazy as _
from django_otp import user_has_device
from django_otp.forms import OTPAuthenticationFormMixin
from wagtail.admin.forms.auth import LoginForm


class OTPLoginForm(OTPAuthenticationFormMixin, LoginForm):
    """Password login; require OTP only when the user already enrolled a TOTP device."""

    otp_device = forms.CharField(required=False, widget=forms.Select)
    otp_token = forms.CharField(
        label=_("Authentication code"),
        required=False,
        widget=forms.TextInput(
            attrs={
                "autocomplete": "one-time-code",
                "inputmode": "numeric",
                "placeholder": _("6-digit code from your authenticator app"),
            }
        ),
    )
    otp_challenge = forms.CharField(required=False)

    def clean(self):
        cleaned_data = super().clean()
        user = self.get_user()
        if user is not None and user_has_device(user, confirmed=True):
            self.clean_otp(user)
        return cleaned_data


class TOTPConfirmForm(forms.Form):
    """Confirm an unconfirmed TOTP device with a current authenticator code."""

    otp_token = forms.CharField(
        label=_("Authentication code"),
        min_length=6,
        max_length=8,
        widget=forms.TextInput(
            attrs={
                "autocomplete": "one-time-code",
                "inputmode": "numeric",
                "autofocus": True,
            }
        ),
    )
