"""Shared security primitives for the custom admin API (ADR-0026, ADM-1).

Same-origin session auth + CSRF + TOTP (django-otp) building blocks shared by
the auth API and the content admin API. Kept in one module so every admin
router enforces the identical security baseline.
"""

from __future__ import annotations

import secrets

from django.http import JsonResponse
from django.middleware.csrf import InvalidTokenFormat, _unmask_cipher_token


class AdminError(Exception):
    """Structured API error carrying status + Problem-Details-style body."""

    def __init__(self, status: int, code: str, message: str, fields: dict | None = None):
        self.status = status
        self.code = code
        self.message = message
        self.fields = fields or {}


def _api_error_handler(request, exc):
    if isinstance(exc, AdminError):
        payload: dict = {"code": exc.code, "message": exc.message}
        if exc.fields:
            payload["fields"] = exc.fields
        return JsonResponse(payload, status=exc.status)
    return None


def _client_ip(request) -> str:
    return (request.META.get("REMOTE_ADDR") or "unknown")[:45]


def _check_csrf(request) -> None:
    """Verify the same-origin CSRF token (ninja views are csrf_exempt at the
    Django middleware level, so we enforce CSRF explicitly for unsafe methods).

    Mirrors Django's CsrfViewMiddleware token check: unmask the header token and
    compare it constant-time with the csrftoken cookie.
    """
    header = request.META.get("HTTP_X_CSRFTOKEN", "")
    cookie = request.COOKIES.get("csrftoken", "")
    try:
        secret = _unmask_cipher_token(header)
    except InvalidTokenFormat:
        secret = ""
    if not secret or not cookie or not secrets.compare_digest(secret, cookie):
        raise AdminError(403, "CSRF_FAILED", "CSRF token missing or invalid.")


def _require_staff_session(request) -> None:
    """Authenticated + staff guard (used by ``auth/me`` and login-less reads)."""
    if not request.user.is_authenticated:
        raise AdminError(401, "AUTH_REQUIRED", "Authentication is required.")
    if not request.user.is_staff:
        raise AdminError(403, "FORBIDDEN", "Staff access is required.")


def _require_admin_otp(request) -> None:
    """Authenticated + staff + verified OTP session guard for protected endpoints."""
    _require_staff_session(request)
    if getattr(request.user, "otp_device", None) is None:
        raise AdminError(403, "OTP_REQUIRED", "A verified TOTP session is required.")
