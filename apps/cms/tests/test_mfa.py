"""MFA enforcement middleware tests — TOTP guard for /admin/ paths."""

import pytest
from django.test import Client
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


class TestMFAEnforcement:
    def test_unauthenticated_admin_redirects_to_login(self, db):
        """Unauthenticated request to /admin/ redirects to login."""
        response = Client().get("/admin/")
        assert response.status_code in (301, 302)
        assert "/admin/login/" in response.url

    def test_admin_without_device_can_access_admin(self, db, admin_client):
        """Superuser WITHOUT TOTP device can access /admin/ (first-time setup)."""
        response = admin_client.get("/admin/")
        assert response.status_code == 200

    def test_admin_with_device_no_otp_blocked(self, db, admin_no_otp_client):
        """Superuser WITH TOTP device but no OTP session is blocked from /admin/."""
        response = admin_no_otp_client.get("/admin/")
        assert response.status_code == 302
        assert "/admin/login/" in response.url

    def test_admin_with_verified_otp_can_access_admin(self, db, admin_with_otp_client):
        """Superuser WITH verified OTP can access /admin/."""
        response = admin_with_otp_client.get("/admin/")
        assert response.status_code == 200

    def test_non_admin_path_not_affected_by_mfa_guard(self, db, admin_no_otp_client):
        """Non-admin path /health/ is not affected by MFA guard."""
        response = admin_no_otp_client.get("/health/")
        assert response.status_code == 200
