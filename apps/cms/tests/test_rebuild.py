"""Rebuild trigger tests (P3-08) — HMAC signature, freshness, gating, method."""

import hashlib
import hmac
import time

from django.test import Client, SimpleTestCase, override_settings
from django.urls import reverse

from apps.rebuild.services import MAX_TRIGGER_AGE_SECONDS, build_signed_rebuild_url

SECRET = "test-rebuild-secret"


def _token(secret, timestamp):
    message = f"taha-rebuild:{timestamp}"
    return hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()


def _signed_post(client, timestamp=None, token=None, secret=SECRET):
    timestamp = int(time.time()) if timestamp is None else timestamp
    token = _token(secret, timestamp) if token is None else token
    return client.post(
        reverse("rebuild_trigger"), {"token": token, "timestamp": str(timestamp)}
    )


@override_settings(REBUILD_TRIGGER_ENABLED=True, REBUILD_TRIGGER_SECRET=SECRET)
class TestRebuildTrigger(SimpleTestCase):
    def test_valid_signature_recent_timestamp_returns_200(self):
        response = _signed_post(Client())
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "triggered": True}

    def test_invalid_token_returns_403(self):
        response = _signed_post(Client(), token="deadbeef")
        assert response.status_code == 403
        assert response.json() == {"status": "denied"}

    def test_expired_timestamp_returns_403(self):
        expired = int(time.time()) - MAX_TRIGGER_AGE_SECONDS - 60
        response = _signed_post(Client(), timestamp=expired)
        assert response.status_code == 403
        assert response.json() == {"status": "denied"}

    def test_get_returns_405(self):
        response = Client().get(reverse("rebuild_trigger"))
        assert response.status_code == 405

    @override_settings(REBUILD_TRIGGER_ENABLED=False, REBUILD_TRIGGER_SECRET=SECRET)
    def test_disabled_setting_returns_403(self):
        response = _signed_post(Client())
        assert response.status_code == 403
        assert response.json() == {"status": "denied"}


def test_build_signed_rebuild_url_shape():
    url = build_signed_rebuild_url(SECRET, "https://cms.example.com/")
    assert url.startswith("https://cms.example.com/rebuild-trigger/?token=")
    assert "timestamp=" in url
