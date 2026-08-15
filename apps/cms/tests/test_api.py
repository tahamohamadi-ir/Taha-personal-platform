"""Public API tests — published-only projection, exact field sets, JSON 404s (P3)."""

from datetime import timedelta

import pytest
from django.test import Client
from django.utils import timezone

from apps.content.models import Landing, LifecycleStatus, Locale, Profile

PUBLIC_FIELDS = {
    "locale",
    "slug",
    "title",
    "body",
    "seo_title",
    "seo_description",
    "published_at",
}
FORBIDDEN_FIELDS = {"status", "created_at", "updated_at"}


@pytest.fixture
def api_client():
    return Client()


@pytest.fixture
def published_content(db):
    landing_fa = Landing.objects.create(
        locale=Locale.FA,
        slug="home",
        title="خانه",
        body="متن خانه",
        seo_title="خانه",
        seo_description="توضیح",
        status=LifecycleStatus.PUBLISHED,
        published_at=timezone.now() - timedelta(days=2),
    )
    Landing.objects.create(
        locale=Locale.FA,
        slug="draft-page",
        title="پیش‌نویس",
        status=LifecycleStatus.DRAFT,
    )
    Landing.objects.create(
        locale=Locale.EN,
        slug="home",
        title="Home",
        body="Home body",
        status=LifecycleStatus.PUBLISHED,
        published_at=timezone.now() - timedelta(days=2),
    )
    profile_fa = Profile.objects.create(
        locale=Locale.FA,
        slug="profile",
        title="Profile",
        body="Profile body",
        status=LifecycleStatus.PUBLISHED,
        published_at=timezone.now() - timedelta(days=2),
    )
    Profile.objects.create(
        locale=Locale.FA,
        slug="draft-profile",
        title="Draft profile",
        status=LifecycleStatus.DRAFT,
    )
    return {"landing_fa": landing_fa, "profile_fa": profile_fa}


def assert_json(response, status_code):
    assert response.status_code == status_code
    assert response["content-type"].startswith("application/json")
    return response.json()


def test_list_landings_returns_only_published_for_locale(api_client, published_content):
    data = assert_json(api_client.get("/api/landings/fa"), 200)
    assert [item["slug"] for item in data] == ["home"]
    assert all(set(item) == PUBLIC_FIELDS for item in data)
    assert all(item["locale"] == Locale.FA for item in data)


def test_list_landings_locale_isolation(api_client, published_content):
    data = assert_json(api_client.get("/api/landings/en"), 200)
    assert [item["slug"] for item in data] == ["home"]
    assert data[0]["title"] == "Home"


def test_detail_landing_by_slug(api_client, published_content):
    data = assert_json(api_client.get("/api/landings/fa/home"), 200)
    assert set(data) == PUBLIC_FIELDS
    assert data["slug"] == "home"
    assert data["locale"] == Locale.FA
    assert data["published_at"] is not None
    assert FORBIDDEN_FIELDS.isdisjoint(data)


def test_detail_draft_slug_404(api_client, published_content):
    response = api_client.get("/api/landings/fa/draft-page")
    assert response.status_code == 404
    assert response["content-type"].startswith("application/json")
    assert "detail" in response.json()
    assert "Traceback" not in response.text


def test_detail_unknown_slug_404(api_client, published_content):
    response = api_client.get("/api/landings/fa/does-not-exist")
    assert response.status_code == 404
    assert "detail" in response.json()


def test_unknown_locale_returns_empty_list(api_client, published_content):
    data = assert_json(api_client.get("/api/landings/xx"), 200)
    assert data == []


def test_list_profiles_returns_only_published(api_client, published_content):
    data = assert_json(api_client.get("/api/profiles/fa"), 200)
    assert [item["slug"] for item in data] == ["profile"]
    assert all(set(item) == PUBLIC_FIELDS for item in data)


def test_detail_profile_by_slug(api_client, published_content):
    data = assert_json(api_client.get("/api/profiles/fa/profile"), 200)
    assert set(data) == PUBLIC_FIELDS
    assert data["slug"] == "profile"
    assert FORBIDDEN_FIELDS.isdisjoint(data)


def test_detail_profile_draft_404(api_client, published_content):
    response = api_client.get("/api/profiles/fa/draft-profile")
    assert response.status_code == 404
    assert "detail" in response.json()
