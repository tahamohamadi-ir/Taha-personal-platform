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


class ProjectType(models.TextChoices):
    """Canonical Project.type values (master plan / P5 Spec)."""

    RESEARCH = "research", "Research"
    ENGINEERING = "engineering", "Engineering"
    AI = "ai", "AI"
    DATA = "data", "Data"
    DESIGN = "design", "Design"
    EXPERIMENT = "experiment", "Experiment"


class Availability(models.TextChoices):
    """Code/data/demo availability (product §20 + Task-list restricted for data)."""

    PUBLIC = "public", "Public"
    AVAILABLE_ON_REQUEST = "available_on_request", "Available on request"
    PRIVATE = "private", "Private"
    NOT_AVAILABLE = "not_available", "Not available"
    NOT_APPLICABLE = "not_applicable", "Not applicable"
    RESTRICTED = "restricted", "Restricted"


class EvidenceVisibility(models.TextChoices):
    """Visibility gate for structured project evidence rows."""

    PUBLIC = "public", "Public"
    RESTRICTED = "restricted", "Restricted"
    INTERNAL = "internal", "Internal"


class ResearchTopic(LocalizedContentMixin, LifecycleMixin):
    """Research domain / agenda area (distinct from blog TopicTag)."""

    summary = models.TextField(blank=True)
    motivation = models.TextField(blank=True)
    problems = models.TextField(blank=True)
    research_questions = models.TextField(blank=True)
    methods = models.TextField(blank=True)
    future_directions = models.TextField(blank=True)

    class Meta:
        db_table = "content_research_topic"
        ordering = ["locale", "slug"]
        indexes = [
            models.Index(
                fields=["locale", "slug", "status"],
                name="research_topic_loc_slug_st_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["locale", "slug"],
                name="content_research_topic_unique_locale_slug",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.locale})"


class ResearchStatement(LocalizedContentMixin, LifecycleMixin):
    """Independent research agenda statement (rich text; PDF deferred)."""

    body = RichTextField(features=ARTICLE_RICHTEXT_FEATURES, blank=True)

    class Meta:
        db_table = "content_research_statement"
        ordering = ["locale", "slug"]
        indexes = [
            models.Index(
                fields=["locale", "slug", "status"],
                name="research_stmt_loc_slug_st_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["locale", "slug"],
                name="content_research_statement_unique_locale_slug",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.locale})"

    def clean(self) -> None:
        """P5: at most one published statement per locale."""
        from django.core.exceptions import ValidationError

        super().clean()
        if self.status != LifecycleStatus.PUBLISHED:
            return
        qs = ResearchStatement.objects.filter(
            locale=self.locale,
            status=LifecycleStatus.PUBLISHED,
        )
        if self.pk:
            qs = qs.exclude(pk=self.pk)
        if qs.exists():
            raise ValidationError(
                {"status": "Only one published ResearchStatement is allowed per locale."}
            )


class Publication(LocalizedContentMixin, LifecycleMixin):
    """Minimal publication core (P5); presentation/export expands in P8."""

    authors = models.TextField(blank=True)
    venue = models.CharField(max_length=300, blank=True)
    date = models.DateField(null=True, blank=True)
    doi = models.CharField(max_length=200, blank=True)
    url = models.URLField(blank=True)
    pdf_url = models.URLField(blank=True)
    license = models.CharField(
        max_length=32,
        choices=License.choices,
        default=License.CC_BY_NC_4,
    )
    citation_count = models.PositiveIntegerField(null=True, blank=True)
    citation_source = models.CharField(max_length=300, blank=True)
    citation_last_verified = models.DateField(null=True, blank=True)
    citation_visibility = models.CharField(
        max_length=20,
        choices=EvidenceVisibility.choices,
        default=EvidenceVisibility.INTERNAL,
    )

    class Meta:
        db_table = "content_publication"
        ordering = ["locale", "slug"]
        indexes = [
            models.Index(
                fields=["locale", "slug", "status"],
                name="publication_loc_slug_st_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["locale", "slug"],
                name="content_publication_unique_locale_slug",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.locale})"

    def public_citation_count(self) -> int | None:
        """Return citation_count only when source + verified + public visibility."""
        if self.citation_visibility != EvidenceVisibility.PUBLIC:
            return None
        if not (self.citation_source or "").strip():
            return None
        if self.citation_last_verified is None:
            return None
        return self.citation_count


class Project(LocalizedContentMixin, LifecycleMixin):
    """Canonical project entity (research/engineering/ai/…); no ResearchProject twin."""

    project_type = models.CharField(
        max_length=32,
        choices=ProjectType.choices,
        default=ProjectType.RESEARCH,
    )
    objective = models.TextField(blank=True)
    methods_summary = models.TextField(blank=True)
    role = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    license = models.CharField(
        max_length=32,
        choices=License.choices,
        default=License.CC_BY_NC_4,
    )
    code_availability = models.CharField(
        max_length=32,
        choices=Availability.choices,
        default=Availability.NOT_APPLICABLE,
    )
    data_availability = models.CharField(
        max_length=32,
        choices=Availability.choices,
        default=Availability.NOT_APPLICABLE,
    )
    demo_availability = models.CharField(
        max_length=32,
        choices=Availability.choices,
        default=Availability.NOT_APPLICABLE,
    )
    code_url = models.URLField(blank=True)
    data_url = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    topics = models.ManyToManyField(
        ResearchTopic,
        blank=True,
        related_name="projects",
    )
    publications = models.ManyToManyField(
        Publication,
        blank=True,
        related_name="projects",
    )

    class Meta:
        db_table = "content_project"
        ordering = ["locale", "slug"]
        indexes = [
            models.Index(
                fields=["locale", "slug", "status"],
                name="project_loc_slug_st_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["locale", "slug"],
                name="content_project_unique_locale_slug",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.locale})"

    def public_code_url(self) -> str:
        if self.code_availability == Availability.PUBLIC:
            return self.code_url or ""
        return ""

    def public_data_url(self) -> str:
        if self.data_availability == Availability.PUBLIC:
            return self.data_url or ""
        return ""

    def public_demo_url(self) -> str:
        if self.demo_availability == Availability.PUBLIC:
            return self.demo_url or ""
        return ""


class ProjectEvidence(models.Model):
    """Structured outcome/evidence row for a Project (visibility-gated)."""

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="evidence_items",
    )
    label = models.CharField(max_length=200)
    value = models.TextField(blank=True)
    source = models.TextField(blank=True)
    last_verified = models.DateField(null=True, blank=True)
    visibility = models.CharField(
        max_length=20,
        choices=EvidenceVisibility.choices,
        default=EvidenceVisibility.INTERNAL,
    )

    class Meta:
        db_table = "content_project_evidence"
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.label} ({self.project_id})"

    def is_publicly_projectable(self) -> bool:
        return (
            self.visibility == EvidenceVisibility.PUBLIC
            and bool((self.source or "").strip())
        )


class ProjectCollaborator(models.Model):
    """Collaborator credit; public only when publication_approved."""

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="collaborators",
    )
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=200, blank=True)
    publication_approved = models.BooleanField(default=False)

    class Meta:
        db_table = "content_project_collaborator"
        ordering = ["id"]

    def __str__(self) -> str:
        return self.name


class ProjectFunding(models.Model):
    """Funding disclosure; public only when publication_approved."""

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="funding_items",
    )
    funder = models.CharField(max_length=300)
    grant_id = models.CharField(max_length=200, blank=True)
    publication_approved = models.BooleanField(default=False)

    class Meta:
        db_table = "content_project_funding"
        ordering = ["id"]

    def __str__(self) -> str:
        return self.funder
