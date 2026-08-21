"""Public read-only CMS API (django-ninja) — published content only, no auth.

Only fields safe for public projection are exposed: no status, no internal
notes. Unknown resources raise 404 with a JSON body and no stack trace.

Public edge exposure of ``/api/`` remains deferred (DEFER-0017); this module is
for in-process and optional build-time ``CMS_API_BASE`` consumers only.
"""

import re
from datetime import date, datetime

from ninja import Field, NinjaAPI, Schema
from ninja.errors import HttpError
from ninja.pagination import PageNumberPagination, paginate

from apps.composition.projection import public_story_document
from apps.content.html_sanitize import sanitize_html
from apps.content.models import (
    Article,
    ArticleSlugRedirect,
    Landing,
    Profile,
    Project,
    Publication,
    ResearchStatement,
    ResearchTopic,
    Series,
    TopicTag,
)
from apps.media.models import Media
from apps.media.public_urls import public_media_ref
from apps.siteconfig.models import SiteSettings

api = NinjaAPI(title="Taha CMS Public API", version="0.4.0")


_HEX_COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")


class PublicDownloadOut(Schema):
    """One current CV/resume download from the media library (active only)."""

    kind: str
    title: str
    note: str
    href: str
    mime: str
    size_bytes: int
    updated_at: datetime | None


class PublicSiteSettingsOut(Schema):
    """Public site presentation used by Astro at build time.

    Only ``primaryColor`` and active current-document downloads are projected.
    Inactive media slots are omitted (private-by-default).
    """

    primaryColor: str
    downloads: list[PublicDownloadOut] = Field(default_factory=list)


def _public_media_href(media: Media) -> str:
    name = (media.file.name or "").lstrip("/")
    return f"/media/{name}"


def _public_download(kind: str, media: Media | None) -> PublicDownloadOut | None:
    if media is None or not media.is_active:
        return None
    return PublicDownloadOut(
        kind=kind,
        title=media.title,
        note=(media.alt_text or "").strip(),
        href=_public_media_href(media),
        mime=media.mime,
        size_bytes=media.size,
        updated_at=media.updated_at,
    )





def sanitize_public_richtext(raw: str) -> str:
    """Re-sanitize rich HTML for public projection (local allowlist; ADR-0022)."""
    return sanitize_html(raw)


class LandingOut(Schema):
    """Public projection of a published landing page."""

    locale: str
    slug: str
    title: str
    body: str
    seo_title: str
    seo_description: str
    published_at: datetime | None


class ProfileOut(Schema):
    """Public projection of a published profile page."""

    locale: str
    slug: str
    title: str
    body: str
    seo_title: str
    seo_description: str
    published_at: datetime | None


class TopicTagOut(Schema):
    """Public topic tag projection."""

    name: str
    slug: str
    locale: str


class SeriesOut(Schema):
    """Public series projection (published series only)."""

    locale: str
    slug: str
    title: str
    description: str
    ordering: int
    published_at: datetime | None


class PublicMediaOut(Schema):
    """Active Media library projection (URL only when is_active)."""

    url: str
    alt: str
    mime: str = ""
    title: str = ""


class ArticleListOut(Schema):
    """Public article list card (no full body)."""

    locale: str
    slug: str
    title: str
    excerpt: str
    license: str
    reading_time_minutes: int
    published_at: datetime | None
    updated_at: datetime | None
    topic_tags: list[TopicTagOut] = Field(default_factory=list)
    series: list[SeriesOut] = Field(default_factory=list)
    featured_image: PublicMediaOut | None = None

    @staticmethod
    def resolve_topic_tags(obj: Article) -> list[TopicTag]:
        return list(obj.topic_tags.filter(locale=obj.locale).order_by("name"))

    @staticmethod
    def resolve_series(obj: Article) -> list[Series]:
        return list(obj.series.public().order_by("ordering", "slug"))

    @staticmethod
    def resolve_featured_image(obj: Article, context) -> dict | None:
        request = context.get("request") if context else None
        return public_media_ref(
            getattr(obj, "featured_image", None),
            request,
            locale=obj.locale,
        )


class StoryBlockOut(Schema):
    blockType: str
    settings: dict = Field(default_factory=dict)


class StorySectionOut(Schema):
    layout: str
    ratio: str
    blocks: list[StoryBlockOut] = Field(default_factory=list)


class StoryDocumentOut(Schema):
    locale: str
    title: str
    sections: list[StorySectionOut] = Field(default_factory=list)


class ArticleDetailOut(ArticleListOut):
    """Public article detail including sanitized rich-text body and optional story."""

    body: str
    accessibility_notes: str
    story: StoryDocumentOut | None = None

    @staticmethod
    def resolve_body(obj: Article) -> str:
        return sanitize_public_richtext(str(obj.body or ""))

    @staticmethod
    def resolve_story(obj: Article) -> dict | None:
        return public_story_document(getattr(obj, "story", None), obj.locale)


class ArticleSlugRedirectOut(Schema):
    """Public slug-redirect mapping for stable URLs after slug changes."""

    locale: str
    old_slug: str
    new_slug: str


@api.get(
    "/site",
    response=PublicSiteSettingsOut,
    summary="Public site settings (primaryColor + current CV/resume downloads)",
)
def get_public_site_settings(request) -> PublicSiteSettingsOut:
    settings = (
        SiteSettings.objects.select_related("current_cv_media", "current_resume_media")
        .filter(site_key="default")
        .first()
    )
    if settings is None:
        settings = SiteSettings.get_singleton()
    color = (settings.primary_color or "").strip()
    if not _HEX_COLOR_RE.fullmatch(color):
        color = "#1f2937"
    downloads: list[PublicDownloadOut] = []
    for kind, media in (
        ("academic_cv", settings.current_cv_media),
        ("industry_resume", settings.current_resume_media),
    ):
        item = _public_download(kind, media)
        if item is not None:
            downloads.append(item)
    return PublicSiteSettingsOut(primaryColor=color, downloads=downloads)


@api.get(
    "/landings/{locale}",
    response=list[LandingOut],
    summary="List published landing pages for a locale",
)
def list_landings(request, locale: str) -> list[Landing]:
    return list(Landing.objects.public().filter(locale=locale))


@api.get(
    "/landings/{locale}/{slug}",
    response=LandingOut,
    summary="Get one published landing page by slug",
)
def get_landing(request, locale: str, slug: str) -> Landing:
    landing = Landing.objects.public().filter(locale=locale, slug=slug).first()
    if landing is None:
        raise HttpError(404, "landing not found")
    return landing


@api.get(
    "/profiles/{locale}",
    response=list[ProfileOut],
    summary="List published profile pages for a locale",
)
def list_profiles(request, locale: str) -> list[Profile]:
    return list(Profile.objects.public().filter(locale=locale))


@api.get(
    "/profiles/{locale}/{slug}",
    response=ProfileOut,
    summary="Get one published profile page by slug",
)
def get_profile(request, locale: str, slug: str) -> Profile:
    profile = Profile.objects.public().filter(locale=locale, slug=slug).first()
    if profile is None:
        raise HttpError(404, "profile not found")
    return profile


@api.get(
    "/articles/{locale}",
    response=list[ArticleListOut],
    summary="List published articles for a locale (paginated)",
)
@paginate(PageNumberPagination, page_size=10)
def list_articles(
    request,
    locale: str,
    tag: str | None = None,
    series: str | None = None,
):
    qs = (
        Article.objects.public()
        .filter(locale=locale)
        .select_related("featured_image")
        .prefetch_related("topic_tags", "series")
        .order_by("-published_at", "slug")
    )
    if tag:
        qs = qs.filter(topic_tags__slug=tag, topic_tags__locale=locale)
    if series:
        published_series = Series.objects.public().filter(locale=locale, slug=series)
        qs = qs.filter(series__in=published_series)
    return qs.distinct()


@api.get(
    "/articles/{locale}/{slug}",
    response=ArticleDetailOut,
    summary="Get one published article by slug",
)
def get_article(request, locale: str, slug: str) -> Article:
    article = (
        Article.objects.public()
        .filter(locale=locale, slug=slug)
        .select_related("story", "featured_image")
        .prefetch_related("topic_tags", "series", "story__sections__blocks")
        .first()
    )
    if article is None:
        raise HttpError(404, "article not found")
    return article


@api.get(
    "/series/{locale}",
    response=list[SeriesOut],
    summary="List published series for a locale",
)
def list_series(request, locale: str) -> list[Series]:
    return list(
        Series.objects.public().filter(locale=locale).order_by("ordering", "slug")
    )


@api.get(
    "/tags/{locale}",
    response=list[TopicTagOut],
    summary="List topic tags for a locale",
)
def list_tags(request, locale: str) -> list[TopicTag]:
    return list(TopicTag.objects.filter(locale=locale).order_by("name"))


@api.get(
    "/article-redirects/{locale}",
    response=list[ArticleSlugRedirectOut],
    summary="List article slug redirects for a locale",
)
def list_article_redirects(request, locale: str) -> list[ArticleSlugRedirect]:
    """Only expose redirects whose target slug is currently public."""
    public_slugs = set(
        Article.objects.public().filter(locale=locale).values_list("slug", flat=True)
    )
    return [
        row
        for row in ArticleSlugRedirect.objects.filter(locale=locale).order_by("old_slug")
        if row.new_slug in public_slugs
    ]


class RelatedSlugOut(Schema):
    """Minimal related entity pointer for list/tree navigation."""

    slug: str
    title: str


class EvidenceOut(Schema):
    """Public evidence row (source required; restricted/internal omitted upstream)."""

    label: str
    value: str
    source: str
    last_verified: date | None


class CollaboratorOut(Schema):
    """Approved collaborator credit only."""

    name: str
    role: str


class FundingOut(Schema):
    """Approved funding disclosure only."""

    funder: str
    grant_id: str


class CaseStudyOut(Schema):
    """Public case study fields when extension exists."""

    depth: str
    problem: str
    constraints: str
    technical_decisions: str
    trade_offs: str
    outcomes_summary: str
    lessons_learned: str
    testing_summary: str

    @staticmethod
    def resolve_technical_decisions(obj) -> str:
        return sanitize_public_richtext(str(obj.technical_decisions or ""))


class DiagramOut(Schema):
    """Public diagram metadata with optional active Media URL."""

    title: str
    version: str
    diagram_date: date
    alt_text: str
    long_description: str
    image: PublicMediaOut | None = None


class ScreenshotOut(Schema):
    """Public screenshot metadata with optional active Media URL."""

    caption: str
    alt_text: str
    external_url: str = ""
    image: PublicMediaOut | None = None


class ResearchTopicListOut(Schema):
    """Public research topic list card."""

    locale: str
    slug: str
    title: str
    summary: str
    published_at: datetime | None
    updated_at: datetime | None


class ResearchTopicDetailOut(ResearchTopicListOut):
    """Public research topic detail with related public projects/publications."""

    motivation: str
    problems: str
    research_questions: str
    methods: str
    future_directions: str
    story: StoryDocumentOut | None = None
    projects: list[RelatedSlugOut] = Field(default_factory=list)
    publications: list[RelatedSlugOut] = Field(default_factory=list)

    @staticmethod
    def resolve_story(obj: ResearchTopic) -> dict | None:
        return public_story_document(getattr(obj, "story", None), obj.locale)

    @staticmethod
    def resolve_projects(obj: ResearchTopic) -> list[RelatedSlugOut]:
        return [
            RelatedSlugOut(slug=p.slug, title=p.title)
            for p in obj.projects.public().filter(locale=obj.locale).order_by("slug")
        ]

    @staticmethod
    def resolve_publications(obj: ResearchTopic) -> list[RelatedSlugOut]:
        pubs = (
            Publication.objects.public()
            .filter(projects__in=obj.projects.public(), locale=obj.locale)
            .distinct()
            .order_by("slug")
        )
        return [RelatedSlugOut(slug=p.slug, title=p.title) for p in pubs]


class ResearchStatementOut(Schema):
    """Public research statement (sanitized rich text)."""

    locale: str
    slug: str
    title: str
    body: str
    story: StoryDocumentOut | None = None
    published_at: datetime | None
    updated_at: datetime | None

    @staticmethod
    def resolve_body(obj: ResearchStatement) -> str:
        return sanitize_public_richtext(str(obj.body or ""))

    @staticmethod
    def resolve_story(obj: ResearchStatement) -> dict | None:
        return public_story_document(getattr(obj, "story", None), obj.locale)


class ProjectListOut(Schema):
    """Public project list card with explicit availability/license."""

    locale: str
    slug: str
    title: str
    project_type: str
    objective: str
    license: str
    code_availability: str
    data_availability: str
    demo_availability: str
    published_at: datetime | None
    updated_at: datetime | None
    has_case_study: bool = False
    case_study_depth: str | None = None

    @staticmethod
    def resolve_has_case_study(obj: Project) -> bool:
        return obj.has_case_study

    @staticmethod
    def resolve_case_study_depth(obj: Project) -> str | None:
        try:
            return obj.case_study.depth
        except Exception:
            return None


class ProjectDetailOut(ProjectListOut):
    """Public project detail with redacted evidence/collaborators/funding/URLs."""

    methods_summary: str
    role: str
    start_date: date | None
    end_date: date | None
    code_url: str
    data_url: str
    demo_url: str
    story: StoryDocumentOut | None = None
    topics: list[RelatedSlugOut] = Field(default_factory=list)
    publications: list[RelatedSlugOut] = Field(default_factory=list)
    evidence: list[EvidenceOut] = Field(default_factory=list)
    collaborators: list[CollaboratorOut] = Field(default_factory=list)
    funding: list[FundingOut] = Field(default_factory=list)
    case_study: CaseStudyOut | None = None
    diagrams: list[DiagramOut] = Field(default_factory=list)
    screenshots: list[ScreenshotOut] = Field(default_factory=list)

    @staticmethod
    def resolve_story(obj: Project) -> dict | None:
        return public_story_document(getattr(obj, "story", None), obj.locale)

    @staticmethod
    def resolve_code_url(obj: Project) -> str:
        return obj.public_code_url()

    @staticmethod
    def resolve_data_url(obj: Project) -> str:
        return obj.public_data_url()

    @staticmethod
    def resolve_demo_url(obj: Project) -> str:
        return obj.public_demo_url()

    @staticmethod
    def resolve_topics(obj: Project) -> list[RelatedSlugOut]:
        return [
            RelatedSlugOut(slug=t.slug, title=t.title)
            for t in obj.topics.public().filter(locale=obj.locale).order_by("slug")
        ]

    @staticmethod
    def resolve_publications(obj: Project) -> list[RelatedSlugOut]:
        return [
            RelatedSlugOut(slug=p.slug, title=p.title)
            for p in obj.publications.public().filter(locale=obj.locale).order_by("slug")
        ]

    @staticmethod
    def resolve_evidence(obj: Project) -> list[EvidenceOut]:
        return [
            EvidenceOut(
                label=row.label,
                value=row.value,
                source=row.source,
                last_verified=row.last_verified,
            )
            for row in obj.evidence_items.all()
            if row.is_publicly_projectable()
        ]

    @staticmethod
    def resolve_collaborators(obj: Project) -> list[CollaboratorOut]:
        return [
            CollaboratorOut(name=row.name, role=row.role)
            for row in obj.collaborators.filter(publication_approved=True)
        ]

    @staticmethod
    def resolve_funding(obj: Project) -> list[FundingOut]:
        return [
            FundingOut(funder=row.funder, grant_id=row.grant_id)
            for row in obj.funding_items.filter(publication_approved=True)
        ]

    @staticmethod
    def resolve_case_study(obj: Project):
        try:
            return obj.case_study
        except Exception:
            return None

    @staticmethod
    def resolve_diagrams(obj: Project, context) -> list[DiagramOut]:
        request = context.get("request") if context else None
        return [
            DiagramOut(
                title=row.title,
                version=row.version,
                diagram_date=row.diagram_date,
                alt_text=row.alt_text,
                long_description=row.long_description,
                image=public_media_ref(
                    getattr(row, "diagram_image", None),
                    request,
                    locale=obj.locale,
                ),
            )
            for row in obj.diagrams.all()
            if row.is_publicly_projectable()
        ]

    @staticmethod
    def resolve_screenshots(obj: Project, context) -> list[ScreenshotOut]:
        request = context.get("request") if context else None
        return [
            ScreenshotOut(
                caption=row.caption,
                alt_text=row.alt_text,
                external_url=row.public_external_url(),
                image=public_media_ref(
                    getattr(row, "screenshot_image", None),
                    request,
                    locale=obj.locale,
                ),
            )
            for row in obj.screenshots.all()
            if row.is_publicly_projectable()
        ]


def _project_detail_queryset():
    return (
        Project.objects.public()
        .select_related("story")
        .prefetch_related(
            "topics",
            "publications",
            "evidence_items",
            "collaborators",
            "funding_items",
            "diagrams__diagram_image",
            "screenshots__screenshot_image",
            "case_study",
            "story__sections__blocks",
        )
    )


def _get_public_project(locale: str, slug: str) -> Project:
    project = _project_detail_queryset().filter(locale=locale, slug=slug).first()
    if project is None:
        raise HttpError(404, "project not found")
    return project


class PublicationListOut(Schema):
    """Public publication list card (minimal P5 core)."""

    locale: str
    slug: str
    title: str
    authors: str
    venue: str
    date: date | None
    doi: str
    license: str
    published_at: datetime | None
    updated_at: datetime | None


class PublicationDetailOut(PublicationListOut):
    """Public publication detail with citation gate."""

    url: str
    pdf_url: str
    citation_count: int | None

    @staticmethod
    def resolve_citation_count(obj: Publication) -> int | None:
        return obj.public_citation_count()


@api.get(
    "/research/topics/{locale}",
    response=list[ResearchTopicListOut],
    summary="List published research topics for a locale (paginated)",
)
@paginate(PageNumberPagination, page_size=10)
def list_research_topics(request, locale: str):
    return (
        ResearchTopic.objects.public()
        .filter(locale=locale)
        .order_by("slug")
    )


@api.get(
    "/research/topics/{locale}/{slug}",
    response=ResearchTopicDetailOut,
    summary="Get one published research topic by slug",
)
def get_research_topic(request, locale: str, slug: str) -> ResearchTopic:
    topic = (
        ResearchTopic.objects.public()
        .filter(locale=locale, slug=slug)
        .select_related("story")
        .prefetch_related("projects", "story__sections__blocks")
        .first()
    )
    if topic is None:
        raise HttpError(404, "research topic not found")
    return topic


@api.get(
    "/research/statements/{locale}",
    response=list[ResearchStatementOut],
    summary="List published research statements for a locale",
)
def list_research_statements(request, locale: str) -> list[ResearchStatement]:
    return list(
        ResearchStatement.objects.public()
        .filter(locale=locale)
        .select_related("story")
        .prefetch_related("story__sections__blocks")
        .order_by("slug")
    )


@api.get(
    "/research/statements/{locale}/{slug}",
    response=ResearchStatementOut,
    summary="Get one published research statement by slug",
)
def get_research_statement(request, locale: str, slug: str) -> ResearchStatement:
    statement = (
        ResearchStatement.objects.public()
        .filter(locale=locale, slug=slug)
        .select_related("story")
        .prefetch_related("story__sections__blocks")
        .first()
    )
    if statement is None:
        raise HttpError(404, "research statement not found")
    return statement


@api.get(
    "/projects/{locale}",
    response=list[ProjectListOut],
    summary="List published projects shown on /projects/ (paginated)",
)
@paginate(PageNumberPagination, page_size=10)
def list_projects(request, locale: str, has_case_study: bool = False):
    qs = (
        Project.objects.public()
        .filter(locale=locale, show_on_projects=True)
        .order_by("-published_at", "slug")
    )
    if has_case_study:
        qs = qs.filter(case_study__isnull=False).select_related("case_study")
    return qs


@api.get(
    "/projects/{locale}/{slug}",
    response=ProjectDetailOut,
    summary="Get one published project listed on /projects/ by slug",
)
def get_project(request, locale: str, slug: str) -> Project:
    project = _get_public_project(locale, slug)
    if not project.show_on_projects:
        raise HttpError(404, "project not found")
    return project


@api.get(
    "/research/projects/{locale}",
    response=list[ProjectListOut],
    summary="List published projects for a locale (paginated)",
)
@paginate(PageNumberPagination, page_size=10)
def list_research_projects(request, locale: str):
    return (
        Project.objects.public()
        .filter(locale=locale)
        .select_related("case_study")
        .order_by("-published_at", "slug")
    )


@api.get(
    "/research/projects/{locale}/{slug}",
    response=ProjectDetailOut,
    summary="Get one published project by slug",
)
def get_research_project(request, locale: str, slug: str) -> Project:
    return _get_public_project(locale, slug)


@api.get(
    "/research/publications/{locale}",
    response=list[PublicationListOut],
    summary="List published publications for a locale (paginated)",
)
@paginate(PageNumberPagination, page_size=10)
def list_research_publications(request, locale: str):
    return (
        Publication.objects.public()
        .filter(locale=locale)
        .order_by("-date", "slug")
    )


@api.get(
    "/research/publications/{locale}/{slug}",
    response=PublicationDetailOut,
    summary="Get one published publication by slug",
)
def get_research_publication(request, locale: str, slug: str) -> Publication:
    publication = (
        Publication.objects.public().filter(locale=locale, slug=slug).first()
    )
    if publication is None:
        raise HttpError(404, "publication not found")
    return publication
