"""MFA enforcement + TOTP enrollment + OTP login form tests."""

import pytest
from django.test import Client
from django.urls import reverse
from django_otp.oath import totp
from django_otp.plugins.otp_totp.models import TOTPDevice


@pytest.fixture
def admin_with_device(admin_user):
    """Superuser with a confirmed TOTP device."""
    TOTPDevice.objects.create(user=admin_user, name="default", confirmed=True)
    return admin_user


@pytest.fixture
def admin_no_otp_client(admin_with_device):
    """Client logged in as admin_with_device but NO OTP verification in session."""
    client = Client()
    client.force_login(admin_with_device)
    return client


@pytest.fixture
def admin_with_otp_client(admin_with_device):
    """Client logged in as admin_with_device WITH OTP verified in session."""
    client = Client()
    client.force_login(admin_with_device)
    device = admin_with_device.totpdevice_set.first()
    session = client.session
    session["otp_device_id"] = device.persistent_id
    session.save()
    return client


def _current_token(device: TOTPDevice) -> str:
    return f"{totp(device.bin_key):06d}"


class TestMFAEnforcement:
    def test_unauthenticated_admin_redirects_to_login(self, db):
        response = Client().get("/admin/")
        assert response.status_code in (301, 302)
        assert "/admin/login/" in response.url

    def test_admin_without_device_redirected_to_setup(self, db, admin_client):
        response = admin_client.get("/admin/")
        assert response.status_code == 302
        assert "/admin/account/two-factor/" in response.url

    def test_admin_without_device_can_open_account(self, db, admin_client):
        response = admin_client.get("/admin/account/")
        assert response.status_code == 200
        assert b"Two-factor authentication" in response.content

    def test_admin_without_device_can_open_setup(self, db, admin_client):
        response = admin_client.get("/admin/account/two-factor/")
        assert response.status_code == 200
        assert b"Confirm and enable" in response.content or b"otp_token" in response.content

    def test_admin_with_device_no_otp_blocked(self, db, admin_no_otp_client):
        response = admin_no_otp_client.get("/admin/")
        assert response.status_code == 302
        assert "/admin/login/" in response.url

    def test_admin_with_verified_otp_can_access_admin(self, db, admin_with_otp_client):
        response = admin_with_otp_client.get("/admin/")
        assert response.status_code == 200

    def test_non_admin_path_not_affected_by_mfa_guard(self, db, admin_no_otp_client):
        response = admin_no_otp_client.get("/health/")
        assert response.status_code == 200


class TestTOTPEnrollment:
    def test_setup_creates_unconfirmed_device(self, db, admin_client, admin_user):
        assert TOTPDevice.objects.filter(user=admin_user).count() == 0
        response = admin_client.get(reverse("security_totp_setup"))
        assert response.status_code == 200
        device = TOTPDevice.objects.get(user=admin_user)
        assert device.confirmed is False

    def test_confirm_enables_device_and_sets_session(self, db, admin_client, admin_user):
        admin_client.get(reverse("security_totp_setup"))
        device = TOTPDevice.objects.get(user=admin_user, confirmed=False)
        token = _current_token(device)
        response = admin_client.post(
            reverse("security_totp_setup"),
            {"otp_token": token},
        )
        assert response.status_code == 302
        device.refresh_from_db()
        assert device.confirmed is True
        assert admin_client.session.get("otp_device_id") == device.persistent_id

    def test_qrcode_svg(self, db, admin_client, admin_user):
        admin_client.get(reverse("security_totp_setup"))
        response = admin_client.get(reverse("security_totp_qrcode"))
        assert response.status_code == 200
        assert response["Content-Type"] == "image/svg+xml"
        assert b"<svg" in response.content.lower() or b"svg" in response.content.lower()

    def test_enrolled_stale_session_cannot_fetch_qr_secret(
        self, db, admin_no_otp_client
    ):
        """Confirmed device + password-only session must not read QR secret."""
        response = admin_no_otp_client.get(reverse("security_totp_qrcode"))
        assert response.status_code == 302
        assert "/admin/login/" in response.url
        response = admin_no_otp_client.get(reverse("security_totp_setup"))
        assert response.status_code == 302
        assert "/admin/login/" in response.url


class TestOTPLoginForm:
    def test_login_without_device_password_only(self, db, admin_user):
        admin_user.set_password("CorrectHorseBattery!")
        admin_user.save()
        client = Client()
        response = client.post(
            "/admin/login/",
            {
                "username": admin_user.get_username(),
                "password": "CorrectHorseBattery!",
                "next": "/admin/",
            },
        )
        assert response.status_code == 302
        # Land on MFA setup, not full admin, until enrolled.
        follow = client.get("/admin/")
        assert follow.status_code == 302
        assert "/admin/account/two-factor/" in follow.url

    def test_login_with_device_requires_otp(self, db, admin_with_device):
        admin_with_device.set_password("CorrectHorseBattery!")
        admin_with_device.save()
        device = admin_with_device.totpdevice_set.get()
        client = Client()
        # Password only — must fail OTP clean
        response = client.post(
            "/admin/login/",
            {
                "username": admin_with_device.get_username(),
                "password": "CorrectHorseBattery!",
                "next": "/admin/",
            },
        )
        assert response.status_code == 200
        assert response.context["form"].errors

        response = client.post(
            "/admin/login/",
            {
                "username": admin_with_device.get_username(),
                "password": "CorrectHorseBattery!",
                "otp_token": _current_token(device),
                "next": "/admin/",
            },
        )
        assert response.status_code == 302
        assert client.session.get("otp_device_id") == device.persistent_id
