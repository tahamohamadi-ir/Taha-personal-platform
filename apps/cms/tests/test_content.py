"""Lifecycle and locale-uniqueness tests for content models (P3)."""

from datetime import timedelta

import pytest
from django.db import IntegrityError
from django.utils import timezone

from apps.content.models import Article, Landing, LifecycleStatus, Locale, Profile


def make_landing(**overrides) -> Landing:
    defaults = {
        "locale": Locale.EN,
        "slug": "home",
        "title": "Home",
        "body": "Home body",
        "status": LifecycleStatus.PUBLISHED,
        "published_at": timezone.now() - timedelta(days=1),
    }
    defaults.update(overrides)
    return Landing.objects.create(**defaults)


def past() -> timezone.datetime:
    return timezone.now() - timedelta(days=1)


def future() -> timezone.datetime:
    return timezone.now() + timedelta(days=1)


@pytest.mark.django_db
def test_public_returns_published_only():
    make_landing(slug="draft-page", status=LifecycleStatus.DRAFT)
    published = make_landing(slug="published-page")
    assert list(Landing.objects.public()) == [published]


@pytest.mark.django_db
def test_public_excludes_future_published_at():
    make_landing(slug="scheduled", published_at=future())
    assert list(Landing.objects.public()) == []


@pytest.mark.django_db
def test_public_excludes_review_and_archived():
    make_landing(slug="in-review", status=LifecycleStatus.REVIEW, published_at=past())
    make_landing(slug="old-archive", status=LifecycleStatus.ARCHIVED, published_at=past())
    assert list(Landing.objects.public()) == []


@pytest.mark.django_db
def test_public_works_on_filtered_queryset():
    make_landing(slug="draft-page", status=LifecycleStatus.DRAFT)
    published = make_landing(slug="published-page")
    assert list(Landing.objects.filter(locale=Locale.EN).public()) == [published]


@pytest.mark.django_db
def test_public_never_leaks_draft_with_blank_published_at():
    make_landing(slug="blank-date", status=LifecycleStatus.DRAFT, published_at=None)
    assert list(Landing.objects.public()) == []


@pytest.mark.django_db
def test_same_slug_allowed_across_locales():
    fa = make_landing(locale=Locale.FA, slug="about", title="درباره")
    en = make_landing(locale=Locale.EN, slug="about", title="About")
    assert Landing.objects.filter(slug="about").count() == 2
    assert {item.locale for item in Landing.objects.filter(slug="about")} == {
        fa.locale,
        en.locale,
    }


@pytest.mark.django_db
def test_duplicate_slug_same_locale_rejected():
    make_landing(locale=Locale.EN, slug="about")
    with pytest.raises(IntegrityError):
        make_landing(locale=Locale.EN, slug="about")


@pytest.mark.django_db
def test_profile_public_shares_lifecycle():
    published = Profile.objects.create(
        locale=Locale.FA,
        slug="profile",
        title="Profile",
        body="Profile body",
        status=LifecycleStatus.PUBLISHED,
        published_at=past(),
    )
    Profile.objects.create(
        locale=Locale.FA,
        slug="draft-profile",
        title="Draft",
        status=LifecycleStatus.DRAFT,
    )
    assert list(Profile.objects.public()) == [published]


@pytest.mark.django_db
def test_profile_duplicate_slug_same_locale_rejected():
    Profile.objects.create(
        locale=Locale.FA, slug="profile", title="Profile", status=LifecycleStatus.DRAFT
    )
    with pytest.raises(IntegrityError):
        Profile.objects.create(
            locale=Locale.FA, slug="profile", title="Profile", status=LifecycleStatus.DRAFT
        )


@pytest.mark.django_db
def test_article_shell_public_only_published():
    published = Article.objects.create(
        locale=Locale.EN,
        slug="first-post",
        title="First post",
        body="Short body",
        status=LifecycleStatus.PUBLISHED,
        published_at=past(),
    )
    Article.objects.create(
        locale=Locale.EN,
        slug="draft-post",
        title="Draft",
        status=LifecycleStatus.DRAFT,
    )
    assert list(Article.objects.public()) == [published]
