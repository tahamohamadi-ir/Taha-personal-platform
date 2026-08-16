"""MFA enforcement middleware for Wagtail admin (TOTP enrollment + session).

Policy for authenticated staff on ``/admin/`` paths:

- No confirmed TOTP device: allow login/logout, ``/admin/account/`` (password),
  and TOTP enrollment; redirect all other admin paths to setup.
- Confirmed device but session not OTP-verified: allow only login/logout;
  enrollment/QR paths are NOT exempt (prevents secret leakage via stale sessions).
- Confirmed device and ``request.user.otp_device`` set: allow.
- Non-``/admin/`` paths are never affected.
"""

from django.http import HttpResponseRedirect
from django.urls import reverse

ADMIN_PREFIX = "/admin/"
LOGIN_PATH = "/admin/login/"
LOGOUT_PATH = "/admin/logout/"
ACCOUNT_PREFIX = "/admin/account/"
MFA_SETUP_PATH = "/admin/account/two-factor/"


def _mfa_setup_url() -> str:
    try:
        return reverse("security_totp_setup")
    except Exception:
        return MFA_SETUP_PATH


class MFAEnforcementMiddleware:
    """Require TOTP enrollment and verified OTP session for Wagtail admin."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith(ADMIN_PREFIX):
            return self.get_response(request)

        if not request.user.is_authenticated or not request.user.is_staff:
            return self.get_response(request)

        path = request.path
        if path in (LOGIN_PATH, LOGOUT_PATH):
            return self.get_response(request)

        from django_otp import user_has_device

        has_device = user_has_device(request.user, confirmed=True)
        otp_ok = getattr(request.user, "otp_device", None) is not None

        if not has_device:
            if path.startswith(MFA_SETUP_PATH) or path.startswith(ACCOUNT_PREFIX):
                return self.get_response(request)
            return HttpResponseRedirect(_mfa_setup_url())

        if otp_ok:
            return self.get_response(request)

        return HttpResponseRedirect(LOGIN_PATH + "?next=" + path)
