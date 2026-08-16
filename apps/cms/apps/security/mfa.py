"""MFA enforcement middleware for Wagtail admin (minimal gate).

This middleware enforces TOTP-based MFA for authenticated staff users accessing
the Wagtail admin. It checks ``django_otp.user_has_device`` for authenticated
users on ``/admin/`` paths and blocks access when a user has a verified OTP
device but no verified OTP in the current session.

Policy:
- Staff user WITHOUT any OTP device: access allowed (first-time; they should
  set up a device via /admin/otp_totp/totpdevice/).
- Staff user WITH a verified OTP device but no OTP session verification: access
  denied (redirect to login to trigger OTP challenge).
- Staff user WITH verified OTP in session: access allowed.
- Non-admin paths are never affected.

The OTP setup URL is ``/admin/otp_totp/totpdevice/`` provided by
``django_otp`` when ``django_otp.plugins.otp_totp`` is in ``INSTALLED_APPS``.
Production MFA policy (enrollment mandate, grace period, recovery codes) is
finalized in the deploy Task Spec.
"""

from django.http import HttpResponseRedirect

ADMIN_PREFIX = "/admin/"
MFA_SETUP_PATH = "/admin/otp_totp/totpdevice/"
LOGIN_PATH = "/admin/login/"
EXEMPT_PATHS = (LOGIN_PATH, "/admin/logout/", MFA_SETUP_PATH)


class MFAEnforcementMiddleware:
    """Block admin access for users with OTP devices but no verified session."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith(ADMIN_PREFIX):
            return self.get_response(request)

        if not request.user.is_authenticated:
            return self.get_response(request)

        if not request.user.is_staff:
            return self.get_response(request)

        if request.path in EXEMPT_PATHS or request.path.startswith(MFA_SETUP_PATH):
            return self.get_response(request)

        from django_otp import user_has_device

        if not user_has_device(request.user, confirmed=True):
            return self.get_response(request)

        # OTPMiddleware (upstream) sets request.user.otp_device when verified
        if getattr(request.user, "otp_device", None) is not None:
            return self.get_response(request)

        return HttpResponseRedirect(LOGIN_PATH + "?next=" + request.path)
