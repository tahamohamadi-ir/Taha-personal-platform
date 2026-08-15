"""Typed localized content contracts — plain Django models, lifecycle-aware (P3 code-first).

Entities are plain Django models (no Wagtail Page subclasses) for the P3 slice.
The public projection is enforced by :meth:`ContentQuerySet.public` and the
associated manager; no other access path leaks non-public records to consumers.
"""

from django.db import models
from django.utils import timezone


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


class ContentQuerySet(models.QuerySet):
    """QuerySet enforcing the strict public projection: published and in the past only."""

    def public(self) -> "ContentQuerySet":
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


class Article(LocalizedContentMixin, LifecycleMixin):
    """Minimal article shell for P3 — the full P4 article model is out of scope."""

    body = models.TextField(blank=True)

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
