"""Wagtail-admin TOTP enrollment views (same-origin under /admin/)."""

from base64 import b32encode
from io import BytesIO

from django.http import Http404, HttpResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django_otp import login as otp_login
from django_otp import user_has_device
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.qr import write_qrcode_image
from wagtail.admin import messages
from wagtail.admin.auth import require_admin_access

from apps.security.forms import TOTPConfirmForm

DEVICE_NAME = "default"


@require_admin_access
def totp_setup(request):
    """Show enrollment status, QR for an unconfirmed device, or create one."""
    if user_has_device(request.user, confirmed=True):
        return render(
            request,
            "security/totp_setup.html",
            {
                "enrolled": True,
                "form": None,
                "config_url": None,
                "manual_secret": None,
                "qrcode_url": None,
            },
        )

    device = (
        TOTPDevice.objects.filter(user=request.user, confirmed=False)
        .order_by("-id")
        .first()
    )
    if device is None:
        TOTPDevice.objects.filter(user=request.user).delete()
        device = TOTPDevice.objects.create(
            user=request.user,
            name=DEVICE_NAME,
            confirmed=False,
        )

    form = TOTPConfirmForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        token = form.cleaned_data["otp_token"]
        if device.verify_token(token):
            device.confirmed = True
            device.save(update_fields=["confirmed"])
            request.session.cycle_key()
            otp_login(request, device)
            messages.success(
                request,
                "Two-factor authentication is enabled. "
                "Use your authenticator app at each sign-in.",
            )
            return redirect("wagtailadmin_home")
        form.add_error("otp_token", "Invalid code. Wait for a new code and try again.")

    manual_secret = b32encode(device.bin_key).decode("ascii")
    return render(
        request,
        "security/totp_setup.html",
        {
            "enrolled": False,
            "form": form,
            "config_url": device.config_url,
            "manual_secret": manual_secret,
            "qrcode_url": reverse("security_totp_qrcode"),
        },
    )


@require_admin_access
def totp_qrcode(request):
    """SVG QR for the current user's pending (unconfirmed) TOTP device only."""
    device = (
        TOTPDevice.objects.filter(user=request.user, confirmed=False)
        .order_by("-id")
        .first()
    )
    if device is None:
        raise Http404
    try:
        buf = BytesIO()
        write_qrcode_image(device.config_url, buf)
    except ModuleNotFoundError:
        return HttpResponse(
            "QR library unavailable",
            status=503,
            content_type="text/plain",
        )
    return HttpResponse(buf.getvalue(), content_type="image/svg+xml")
