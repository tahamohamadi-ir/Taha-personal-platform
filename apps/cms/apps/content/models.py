"""Typed localized content contracts — plain Django models, lifecycle-aware.

Entities are plain Django models (no Wagtail Page subclasses). The public
projection is enforced by :meth:`ContentQuerySet.public` and the associated
manager; no other access path leaks non-public records to consumers.
"""

from __future__ import annotations

import math
import re

from django.db import models
from django.utils import timezone
from django.utils.html import strip_tags
from wagtail.fields import RichTextField

READING_WPM = 200

# Keep in sync with WAGTAIL_RICHTEXT_FEATURES in config.settings.base (ADR-0022).
ARTICLE_RICHTEXT_FEATURES = [
    "h2",
    "h3",
    "h4",
    "bold",
    "italic",
    "ol",
    "ul",
    "link",
    "document-link",
    "hr",
    "blockquote",
    "code",
]


class LifecycleStatus(models.TextChoices):
    """Publication lifecycle shared by all CMS content entities."""

    DRAFT = "draft", "Draft"
    REVIEW = "review", "Review"
    PUBLISHED = "published", "Published"
    ARCHIVED = "archived", "Archived"


class Locale(models.TextChoices):
    """Locales supported by the platform (fa/en content identity is independent)."""

    FA = "fa", "Persian"
    EN = "en", "English"


class License(models.TextChoices):
    """Editorial license choices for public articles (P4)."""

    CC_BY_4 = "cc-by-4", "CC BY 4.0"
    CC_BY_NC_4 = "cc-by-nc-4", "CC BY-NC 4.0"
    ALL_RIGHTS_RESERVED = "all-rights-reserved", "All Rights Reserved"


class ContentQuerySet(models.QuerySet):
    """QuerySet enforcing the strict public projection: published and in the past only."""

    def public(self) -> ContentQuerySet:
        """Return only records with ``status=published`` and ``published_at <= now``."""
        return self.filter(
            status=LifecycleStatus.PUBLISHED,
            published_at__lte=timezone.now(),
        )


class ContentManager(models.Manager.from_queryset(ContentQuerySet)):
    """Default manager; ``public()`` is available on both manager and queryset."""


class LifecycleMixin(models.Model):
    """Shared lifecycle fields and manager for every content entity."""

    status = models.CharField(
        max_length=20,
        choices=LifecycleStatus.choices,
        default=LifecycleStatus.DRAFT,
        db_index=True,
    )
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ContentManager()

    class Meta:
        abstract = True


class LocalizedContentMixin(models.Model):
    """Shared locale-identity fields (slug is unique per locale, not globally)."""

    locale = models.CharField(max_length=2, choices=Locale.choices, db_index=True)
    slug = models.SlugField(max_length=200)
    title = models.CharField(max_length=200)

    class Meta:
        abstract = True


def compute_reading_time_minutes(body_html: str, *, wpm: int = READING_WPM) -> int:
    """Estimate reading time from rich-text body (~200 wpm). Empty body → 0."""
    text = strip_tags(body_html or "")
    words = re.findall(r"\S+", text)
    if not words:
        return 0
    return max(1, math.ceil(len(words) / wpm))


class Landing(LocalizedContentMixin, LifecycleMixin):
    """Localized landing page content (one row per locale)."""

    body = models.TextField(blank=True)
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)

    class Meta:
        db_table = "content_landing"
        ordering = ["locale", "slug"]
        indexes = [
            models.Index(
                fields=["locale", "slug", "status"],
                name="landing_locale_slug_status_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["locale", "slug"],
                name="content_landing_unique_locale_slug",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.locale})"


class Profile(LocalizedContentMixin, LifecycleMixin):
    """Localized profile page content (one row per locale)."""

    body = models.TextField(blank=True)
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)

    class Meta:
        db_table = "content_profile"
        ordering = ["locale", "slug"]
        indexes = [
            models.Index(
                fields=["locale", "slug", "status"],
                name="profile_locale_slug_status_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["locale", "slug"],
                name="content_profile_unique_locale_slug",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.locale})"


class TopicTag(models.Model):
    """Locale-aware editorial topic tag (slug unique globally per P4 Spec)."""

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    locale = models.CharField(max_length=2, choices=Locale.choices, db_index=True)

    class Meta:
        db_table = "content_topic_tag"
        ordering = ["locale", "name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.locale})"


class Series(LocalizedContentMixin, LifecycleMixin):
    """Locale-aware article series with manual ordering within a locale."""

    description = models.TextField(blank=True)
    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "content_series"
        ordering = ["locale", "ordering", "slug"]
        indexes = [
            models.Index(
                fields=["locale", "slug", "status"],
                name="series_locale_slug_status_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["locale", "slug"],
                name="content_series_unique_locale_slug",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.locale})"


class Article(LocalizedContentMixin, LifecycleMixin):
    """Published writing unit — rich text body, tags, series, license (P4)."""

    body = RichTextField(features=ARTICLE_RICHTEXT_FEATURES, blank=True)
    excerpt = models.TextField(blank=True)
    featured_image = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    topic_tags = models.ManyToManyField(TopicTag, blank=True, related_name="articles")
    series = models.ManyToManyField(Series, blank=True, related_name="articles")
    license = models.CharField(
        max_length=32,
        choices=License.choices,
        default=License.CC_BY_NC_4,
    )
    accessibility_notes = models.TextField(blank=True)
    reading_time_minutes = models.PositiveIntegerField(default=0)
    allow_comments = models.BooleanField(default=False)

    class Meta:
        db_table = "content_article"
        ordering = ["locale", "slug"]
        indexes = [
            models.Index(
                fields=["locale", "slug", "status"],
                name="article_locale_slug_status_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["locale", "slug"],
                name="content_article_unique_locale_slug",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.locale})"

    def save(self, *args, **kwargs) -> None:
        self.reading_time_minutes = compute_reading_time_minutes(str(self.body or ""))
        super().save(*args, **kwargs)


class ArticleSlugRedirect(models.Model):
    """Stable redirect from a retired article slug to the current slug (per locale)."""

    locale = models.CharField(max_length=2, choices=Locale.choices, db_index=True)
    old_slug = models.SlugField(max_length=200)
    new_slug = models.SlugField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "content_article_slug_redirect"
        ordering = ["locale", "old_slug"]
        constraints = [
            models.UniqueConstraint(
                fields=["locale", "old_slug"],
                name="content_article_slug_redirect_unique",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.locale}:{self.old_slug} → {self.new_slug}"
