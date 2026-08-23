"""Typed localized content contracts — plain Django models, lifecycle-aware.

Entities are plain Django models (no Wagtail Page subclasses). The public
projection is enforced by :meth:`ContentQuerySet.public` and the associated
manager; no other access path leaks non-public records to consumers.
"""

from __future__ import annotations

import math
import re
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.html import strip_tags

READING_WPM = 200

# ADR-0022 allowlist — editor/docs contract; storage is plain TextField HTML.
# Keep in sync with RICHTEXT_ALLOWED_FEATURES in config.settings.base.
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
    SCHEDULED = "scheduled", "Scheduled"
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
    scheduled_for = models.DateTimeField(null=True, blank=True, db_index=True)
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
    translation_key = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    revision = models.PositiveIntegerField(default=1)
    short_bio = models.TextField(blank=True)
    long_bio = models.TextField(blank=True)
    availability = models.TextField(blank=True)

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

    def available_locales(self) -> list[str]:
        return list(
            Profile.objects.public()
            .filter(translation_key=self.translation_key)
            .order_by("locale")
            .values_list("locale", flat=True)
        )


class OrderedProfileItem(models.Model):
    """Abstract ordered child row for typed profile sections."""

    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        abstract = True
        ordering = ["ordering", "id"]


class ProfileDetailItem(OrderedProfileItem):
    """Child rows that may expose public About detail routes."""

    slug = models.SlugField(max_length=200, blank=True)
    translation_key = models.UUIDField(null=True, blank=True, db_index=True)
    detail_body = models.TextField(blank=True)

    class Meta(OrderedProfileItem.Meta):
        abstract = True


class ProfileSkill(ProfileDetailItem):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="skills",
    )
    category = models.CharField(max_length=200)
    name = models.CharField(max_length=200)
    source = models.CharField(max_length=300)

    class Meta(OrderedProfileItem.Meta):
        db_table = "content_profile_skill"


class ProfileExperience(ProfileDetailItem):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="experience_entries",
    )
    organization = models.CharField(max_length=300)
    role = models.CharField(max_length=300)
    period = models.CharField(max_length=100)
    location = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)
    bullets = models.JSONField(default=list, blank=True)
    story = models.ForeignKey(
        "composition.CompositionPage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="attached_profile_experiences",
    )

    class Meta(OrderedProfileItem.Meta):
        db_table = "content_profile_experience"


class ProfileEducation(ProfileDetailItem):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="education_entries",
    )
    institution = models.CharField(max_length=300)
    degree = models.CharField(max_length=200)
    field = models.CharField(max_length=200)
    period = models.CharField(max_length=100)
    gpa = models.CharField(max_length=50, blank=True)
    thesis = models.TextField(blank=True)

    class Meta(OrderedProfileItem.Meta):
        db_table = "content_profile_education"


class ProfilePublication(ProfileDetailItem):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="publication_entries",
    )
    title = models.CharField(max_length=300)
    status = models.TextField(blank=True)

    class Meta(OrderedProfileItem.Meta):
        db_table = "content_profile_publication"


class ProfileResearchProject(ProfileDetailItem):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="research_projects",
    )
    title = models.CharField(max_length=300)
    summary = models.TextField(blank=True)
    url = models.URLField(blank=True)
    link_label = models.CharField(max_length=100, blank=True)

    class Meta(OrderedProfileItem.Meta):
        db_table = "content_profile_research_project"


class ProfileCertificate(ProfileDetailItem):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="certificate_entries",
    )
    name = models.CharField(max_length=300)
    detail = models.CharField(max_length=300, blank=True)

    class Meta(OrderedProfileItem.Meta):
        db_table = "content_profile_certificate"


class ProfileSocialLink(OrderedProfileItem):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="social_links",
    )
    platform = models.CharField(max_length=100)
    url = models.URLField()

    class Meta(OrderedProfileItem.Meta):
        db_table = "content_profile_social_link"


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

    body = models.TextField(blank=True)
    excerpt = models.TextField(blank=True)
    featured_image = models.ForeignKey(
        "media.Media",
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
    story = models.ForeignKey(
        "composition.CompositionPage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="attached_articles",
    )

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


class AccessState(models.TextChoices):
    """Public file/link access for P8 publications, books, talks, downloads."""

    PUBLIC = "public", "Public"
    RESTRICTED = "restricted", "Restricted"
    METADATA_ONLY = "metadata_only", "Metadata only"


class PublicationType(models.TextChoices):
    """Bibliographic kind (orthogonal to CMS lifecycle status)."""

    JOURNAL = "journal", "Journal article"
    CONFERENCE = "conference", "Conference paper"
    BOOK_CHAPTER = "book_chapter", "Book chapter"
    MANUSCRIPT = "manuscript", "Manuscript"
    OTHER = "other", "Other"


class AcademicStage(models.TextChoices):
    """Academic publication stage (orthogonal to CMS lifecycle status)."""

    PREPRINT = "preprint", "Preprint"
    IN_PRESS = "in_press", "In press"
    PUBLISHED = "published", "Published"
    OTHER = "other", "Other"


class DownloadType(models.TextChoices):
    """Typed download catalog categories (Media-backed)."""

    PDF = "pdf", "PDF"
    DATASET = "dataset", "Dataset"
    CODE = "code", "Code archive"
    ARCHIVE = "archive", "Archive"
    OTHER = "other", "Other"


class ResearchTopic(LocalizedContentMixin, LifecycleMixin):
    """Research domain / agenda area (distinct from blog TopicTag)."""

    summary = models.TextField(blank=True)
    motivation = models.TextField(blank=True)
    problems = models.TextField(blank=True)
    research_questions = models.TextField(blank=True)
    methods = models.TextField(blank=True)
    future_directions = models.TextField(blank=True)
    story = models.ForeignKey(
        "composition.CompositionPage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="attached_research_topics",
    )

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
    """Independent research agenda statement (HTML text + optional PDF)."""

    body = models.TextField(blank=True)
    statement_pdf = models.ForeignKey(
        "media.Media",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="Optional downloadable PDF (Media library; public only when active).",
    )
    story = models.ForeignKey(
        "composition.CompositionPage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="attached_research_statements",
    )

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
    """Publication core (P5) extended for P8 abstract/identifiers/access."""

    authors = models.TextField(blank=True)
    venue = models.CharField(max_length=300, blank=True)
    date = models.DateField(null=True, blank=True)
    doi = models.CharField(max_length=200, blank=True)
    url = models.URLField(blank=True)
    pdf_url = models.URLField(blank=True)
    abstract = models.TextField(blank=True)
    publication_type = models.CharField(
        max_length=32,
        choices=PublicationType.choices,
        default=PublicationType.OTHER,
    )
    academic_stage = models.CharField(
        max_length=32,
        choices=AcademicStage.choices,
        default=AcademicStage.OTHER,
    )
    isbn = models.CharField(max_length=32, blank=True)
    preprint_url = models.URLField(blank=True)
    code_url = models.URLField(blank=True)
    dataset_url = models.URLField(blank=True)
    access_state = models.CharField(
        max_length=32,
        choices=AccessState.choices,
        default=AccessState.PUBLIC,
    )
    accessibility_notes = models.TextField(blank=True)
    citation_text = models.TextField(
        blank=True,
        help_text="Editor-supplied citation export text only; never auto-fabricated.",
    )
    pdf_media = models.ForeignKey(
        "media.Media",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
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

    def allows_public_file(self) -> bool:
        return self.access_state == AccessState.PUBLIC

    def public_citation_count(self) -> int | None:
        """Return citation_count only when source + verified + public visibility."""
        if self.citation_visibility != EvidenceVisibility.PUBLIC:
            return None
        if not (self.citation_source or "").strip():
            return None
        if self.citation_last_verified is None:
            return None
        return self.citation_count

    def public_citation_text(self) -> str | None:
        """Return citation text only when editor-supplied with authors + title."""
        text = (self.citation_text or "").strip()
        if not text:
            return None
        if not (self.title or "").strip():
            return None
        if not (self.authors or "").strip():
            return None
        return text

    def public_pdf_url(self) -> str:
        """External PDF URL only when access_state is public."""
        if not self.allows_public_file():
            return ""
        return (self.pdf_url or "").strip()

    def public_external_url(self) -> str:
        return (self.url or "").strip()


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
    show_on_projects = models.BooleanField(
        default=True,
        db_default=True,
        help_text="When false, a published project is omitted from the public /projects/ list.",
    )
    story = models.ForeignKey(
        "composition.CompositionPage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="attached_projects",
    )
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

    def clean(self) -> None:
        """P6: featured case study publish gate when extension exists."""
        from django.core.exceptions import ValidationError

        super().clean()
        if self.status != LifecycleStatus.PUBLISHED:
            return
        try:
            case_study = self.case_study
        except ProjectCaseStudyDetails.DoesNotExist:
            return
        try:
            case_study.validate_featured_publish_gate()
        except ValidationError as exc:
            raise ValidationError(exc.message_dict) from exc

    def save(self, *args, **kwargs) -> None:
        if self.status == LifecycleStatus.PUBLISHED:
            self.full_clean()
        super().save(*args, **kwargs)

    @property
    def has_case_study(self) -> bool:
        try:
            return self.case_study is not None
        except ProjectCaseStudyDetails.DoesNotExist:
            return False


class CaseStudyDepth(models.TextChoices):
    """Case study presentation depth (product §30)."""

    FEATURED = "featured_case_study", "Featured case study"
    STANDARD = "standard", "Standard"
    EXPERIMENT = "experiment", "Experiment"


class ProjectCaseStudyDetails(models.Model):
    """Typed case-study extension for canonical Project (P6); no parallel model."""

    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name="case_study",
    )
    depth = models.CharField(
        max_length=32,
        choices=CaseStudyDepth.choices,
        default=CaseStudyDepth.STANDARD,
    )
    problem = models.TextField(blank=True)
    constraints = models.TextField(blank=True)
    technical_decisions = models.TextField(blank=True)
    trade_offs = models.TextField(blank=True)
    outcomes_summary = models.TextField(blank=True)
    lessons_learned = models.TextField(blank=True)
    testing_summary = models.TextField(blank=True)

    class Meta:
        db_table = "content_project_case_study_details"

    def __str__(self) -> str:
        return f"Case study ({self.project_id})"

    def validate_featured_publish_gate(self) -> None:
        """Reject publish when featured baseline is incomplete."""
        from django.core.exceptions import ValidationError

        if self.depth != CaseStudyDepth.FEATURED:
            return
        if self.project.status != LifecycleStatus.PUBLISHED:
            return
        errors: dict[str, str] = {}
        if not (self.problem or "").strip():
            errors["problem"] = (
                "Required for published featured case studies."
            )
        if not (self.project.role or "").strip():
            errors["role"] = (
                "Project role is required for published featured case studies."
            )
        if not (self.trade_offs or "").strip():
            errors["trade_offs"] = (
                "Required for published featured case studies."
            )
        if not (self.outcomes_summary or "").strip():
            errors["outcomes_summary"] = (
                "Required for published featured case studies."
            )
        if not (self.project.license or "").strip():
            errors["license"] = (
                "License is required for published featured case studies."
            )
        for field in (
            "code_availability",
            "data_availability",
            "demo_availability",
        ):
            if not getattr(self.project, field):
                errors[field] = (
                    "Availability state is required for published featured case studies."
                )
        if errors:
            raise ValidationError(errors)

    def clean(self) -> None:
        super().clean()
        self.validate_featured_publish_gate()

    def save(self, *args, **kwargs) -> None:
        if self.project.status == LifecycleStatus.PUBLISHED:
            self.full_clean()
        super().save(*args, **kwargs)


class ProjectDiagram(models.Model):
    """Architecture diagram metadata for a Project (image admin-only until /media/)."""

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="diagrams",
    )
    title = models.CharField(max_length=200)
    version = models.CharField(max_length=50)
    diagram_date = models.DateField()
    alt_text = models.TextField(blank=True)
    long_description = models.TextField(blank=True)
    diagram_image = models.ForeignKey(
        "media.Media",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    visibility = models.CharField(
        max_length=20,
        choices=EvidenceVisibility.choices,
        default=EvidenceVisibility.INTERNAL,
    )

    class Meta:
        db_table = "content_project_diagram"
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.title} ({self.project_id})"

    def is_publicly_projectable(self) -> bool:
        return (
            self.visibility == EvidenceVisibility.PUBLIC
            and bool((self.alt_text or "").strip())
            and bool((self.title or "").strip())
            and bool((self.version or "").strip())
            and self.diagram_date is not None
        )


class ProjectScreenshot(models.Model):
    """Optional screenshot row; no PII/credentials in public projection."""

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="screenshots",
    )
    caption = models.CharField(max_length=300, blank=True)
    alt_text = models.TextField(blank=True)
    external_url = models.URLField(blank=True)
    screenshot_image = models.ForeignKey(
        "media.Media",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    visibility = models.CharField(
        max_length=20,
        choices=EvidenceVisibility.choices,
        default=EvidenceVisibility.INTERNAL,
    )

    class Meta:
        db_table = "content_project_screenshot"
        ordering = ["id"]

    def __str__(self) -> str:
        return f"Screenshot ({self.project_id})"

    def is_publicly_projectable(self) -> bool:
        return (
            self.visibility == EvidenceVisibility.PUBLIC
            and bool((self.alt_text or "").strip())
            and bool((self.caption or "").strip())
        )

    def public_external_url(self) -> str:
        url = (self.external_url or "").strip()
        if not url or not self.is_publicly_projectable():
            return ""
        if url.startswith("http://") or url.startswith("https://"):
            return url
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


class Book(LocalizedContentMixin, LifecycleMixin):
    """Typed book catalog entity (P8)."""

    authors = models.TextField(blank=True)
    isbn = models.CharField(max_length=32, blank=True)
    publisher = models.CharField(max_length=300, blank=True)
    publication_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    url = models.URLField(blank=True)
    license = models.CharField(
        max_length=32,
        choices=License.choices,
        default=License.ALL_RIGHTS_RESERVED,
    )
    access_state = models.CharField(
        max_length=32,
        choices=AccessState.choices,
        default=AccessState.METADATA_ONLY,
    )
    accessibility_notes = models.TextField(blank=True)
    cover_media = models.ForeignKey(
        "media.Media",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    class Meta:
        db_table = "content_book"
        ordering = ["locale", "slug"]
        indexes = [
            models.Index(
                fields=["locale", "slug", "status"],
                name="book_loc_slug_st_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["locale", "slug"],
                name="content_book_unique_locale_slug",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.locale})"

    def allows_public_file(self) -> bool:
        return self.access_state == AccessState.PUBLIC


class Talk(LocalizedContentMixin, LifecycleMixin):
    """Typed talk / presentation catalog entity (P8)."""

    speakers = models.TextField(blank=True)
    event_name = models.CharField(max_length=300, blank=True)
    event_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=300, blank=True)
    abstract = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    slides_url = models.URLField(blank=True)
    license = models.CharField(
        max_length=32,
        choices=License.choices,
        default=License.CC_BY_NC_4,
    )
    access_state = models.CharField(
        max_length=32,
        choices=AccessState.choices,
        default=AccessState.PUBLIC,
    )
    accessibility_notes = models.TextField(blank=True)
    slides_media = models.ForeignKey(
        "media.Media",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    class Meta:
        db_table = "content_talk"
        ordering = ["locale", "slug"]
        indexes = [
            models.Index(
                fields=["locale", "slug", "status"],
                name="talk_loc_slug_st_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["locale", "slug"],
                name="content_talk_unique_locale_slug",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.locale})"

    def allows_public_file(self) -> bool:
        return self.access_state == AccessState.PUBLIC

    def public_video_url(self) -> str:
        if not self.allows_public_file():
            return ""
        return (self.video_url or "").strip()

    def public_slides_url(self) -> str:
        if not self.allows_public_file():
            return ""
        return (self.slides_url or "").strip()


class Download(LocalizedContentMixin, LifecycleMixin):
    """Media-backed download catalog entry (P8) — never a bare external URL."""

    description = models.TextField(blank=True)
    media = models.ForeignKey(
        "media.Media",
        on_delete=models.PROTECT,
        related_name="+",
    )
    download_type = models.CharField(
        max_length=32,
        choices=DownloadType.choices,
        default=DownloadType.OTHER,
    )
    language = models.CharField(
        max_length=16,
        blank=True,
        help_text="Language of the file contents (fa/en/…), not CMS locale identity.",
    )
    access_state = models.CharField(
        max_length=32,
        choices=AccessState.choices,
        default=AccessState.PUBLIC,
    )
    accessibility_notes = models.TextField(blank=True)
    license = models.CharField(
        max_length=32,
        choices=License.choices,
        default=License.ALL_RIGHTS_RESERVED,
    )

    class Meta:
        db_table = "content_download"
        ordering = ["locale", "slug"]
        indexes = [
            models.Index(
                fields=["locale", "slug", "status"],
                name="download_loc_slug_st_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["locale", "slug"],
                name="content_download_unique_locale_slug",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.locale})"

    def allows_public_file(self) -> bool:
        return self.access_state == AccessState.PUBLIC

    def public_media_is_downloadable(self) -> bool:
        media = self.media
        return bool(
            self.allows_public_file()
            and media is not None
            and media.is_active
            and media.file
        )


class ContentRevision(models.Model):
    """Immutable content snapshot for restore-as-draft (ADM-4 / DEBT-0005).

    ``entity_key`` matches admin content API keys (``landing``, ``article``, …).
    Snapshots never mutate after create; restore always forces draft and keeps
    a fresh pre-restore snapshot of the live row.
    """

    entity_key = models.CharField(max_length=64, db_index=True)
    object_id = models.PositiveIntegerField(db_index=True)
    snapshot = models.JSONField()
    note = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="content_revisions",
    )

    class Meta:
        db_table = "content_revision"
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(
                fields=["entity_key", "object_id", "-created_at"],
                name="content_rev_entity_obj_created",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.entity_key}:{self.object_id}@{self.pk}"
