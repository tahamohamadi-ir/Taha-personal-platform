"""Story composition catalog, article FK, and published-only public projection."""

import json

import pytest
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client
from django.utils import timezone

from apps.composition.blocks import KIND_STORY, BlockValidationError, validate_block_settings
from apps.composition.models import CompositionBlock, CompositionPage, CompositionSection
from apps.content.models import Article, LifecycleStatus, Locale
from apps.media.models import Media

PNG_1X1 = (
    b"\x89PNG\r\n\x1a\n"
    b"\x00\x00\x00\rIHDR"
    b"\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
    b"\x00\x00\x00\rIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4"
    b"\x00\x00\x00\x00IEND\xaeB`\x82"
)


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def media_root(tmp_path, settings):
    settings.MEDIA_ROOT = str(tmp_path / "media")


@pytest.fixture
def totp_device(db, admin_user):
    from django_otp.plugins.otp_totp.models import TOTPDevice

    return TOTPDevice.objects.create(user=admin_user, name="default", confirmed=True)


@pytest.fixture
def admin_api_client(media_root, admin_user, totp_device):
    client = Client(enforce_csrf_checks=True)
    client.force_login(admin_user)
    session = client.session
    session["otp_device_id"] = totp_device.persistent_id
    session.save()
    token = client.get("/api/v1/admin/auth/csrf").json()["csrfToken"]
    client.defaults["HTTP_X_CSRFTOKEN"] = token
    return client


def test_landing_schema_unchanged(admin_api_client):
    response = admin_api_client.get("/api/v1/admin/composition/schema")
    assert response.status_code == 200
    types = {item["type"] for item in response.json()["blockTypes"]}
    assert "hero" in types
    assert "figure" not in types
    assert response.json()["kind"] == "landing"


def test_story_schema_is_single_locale(admin_api_client):
    response = admin_api_client.get("/api/v1/admin/composition/schema?kind=story")
    assert response.status_code == 200
    body = response.json()
    assert body["kind"] == "story"
    types = {item["type"] for item in body["blockTypes"]}
    assert {"figure", "video", "audio", "math", "text"} <= types
    assert "hero" not in types
    text = next(item for item in body["blockTypes"] if item["type"] == "text")
    keys = {field["key"] for field in text["fields"]}
    assert keys == {"body"}


def test_story_blocks_reject_landing_keys(db):
    with pytest.raises(BlockValidationError):
        validate_block_settings(
            "text", {"bodyFa": "x", "bodyEn": "y"}, kind=KIND_STORY
        )


def test_story_figure_requires_image_media(db, media_root):
    image = Media.objects.create(
        file=SimpleUploadedFile("photo.png", PNG_1X1, content_type="image/png"),
        title="Photo",
        is_active=True,
    )
    validate_block_settings("figure", {"mediaId": image.pk, "caption": "c"}, kind=KIND_STORY)
    with pytest.raises(BlockValidationError):
        validate_block_settings("video", {"mediaId": image.pk}, kind=KIND_STORY)


def _put_json(client, path, payload, updated_at):
    return client.put(
        path,
        data=json.dumps(payload),
        content_type="application/json",
        HTTP_IF_MATCH=f'"{updated_at}"',
    )


def test_story_page_rejects_hero_block(admin_api_client):
    created = admin_api_client.post(
        "/api/v1/admin/composition",
        data=json.dumps(
            {
                "key": "article-1-story",
                "locale": "en",
                "title": "Story",
                "kind": "story",
            }
        ),
        content_type="application/json",
    )
    assert created.status_code == 201
    assert created.json()["kind"] == "story"
    page_id = created.json()["id"]
    updated_at = created.json()["updatedAt"]
    response = _put_json(
        admin_api_client,
        f"/api/v1/admin/composition/{page_id}",
        {
            "sections": [
                {
                    "layout": "1col",
                    "ratio": "",
                    "enabled": True,
                    "blocks": [
                        {
                            "blockType": "hero",
                            "settings": {
                                "titleFa": "t",
                                "titleEn": "t",
                                "leadFa": "l",
                                "leadEn": "e",
                            },
                            "enabled": True,
                        }
                    ],
                }
            ]
        },
        updated_at,
    )
    assert response.status_code == 400


def test_public_article_story_published_only(db, media_root):
    image = Media.objects.create(
        file=SimpleUploadedFile("photo.png", PNG_1X1, content_type="image/png"),
        title="Photo",
        is_active=True,
    )
    draft_story = CompositionPage.objects.create(
        key="draft-story",
        kind=KIND_STORY,
        locale="en",
        title="Draft story",
        status="draft",
    )
    article = Article.objects.create(
        locale=Locale.EN,
        slug="story-post",
        title="Story post",
        body="<p>Fallback body</p>",
        status=LifecycleStatus.PUBLISHED,
        published_at=timezone.now(),
        story=draft_story,
    )
    client = Client()
    draft_json = client.get("/api/articles/en/story-post").json()
    assert draft_json["story"] is None
    assert "Fallback body" in draft_json["body"]

    draft_story.status = "published"
    draft_story.published_at = timezone.now()
    draft_story.save()
    section = CompositionSection.objects.create(
        page=draft_story, position=0, layout="1col", enabled=True
    )
    CompositionBlock.objects.create(
        section=section,
        position=0,
        block_type="text",
        settings={"body": "<p>Story text</p><script>x</script>"},
        enabled=True,
    )
    CompositionBlock.objects.create(
        section=section,
        position=1,
        block_type="figure",
        settings={"mediaId": image.pk, "caption": "A photo"},
        enabled=True,
    )
    published = client.get("/api/articles/en/story-post").json()
    assert published["story"] is not None
    assert published["story"]["sections"][0]["blocks"][0]["blockType"] == "text"
    assert "<script>" not in published["story"]["sections"][0]["blocks"][0]["settings"]["body"]
    figure = published["story"]["sections"][0]["blocks"][1]
    assert figure["settings"]["media"]["url"].endswith(image.file.name)
    assert article.slug == "story-post"
