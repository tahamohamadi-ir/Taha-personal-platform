"""Public read-only CMS API (django-ninja) — published content only, no auth.

Only fields safe for public projection are exposed: no status, no internal
notes. Unknown resources raise 404 with a JSON body and no stack trace.

Public edge exposure of ``/api/`` remains deferred (DEFER-0017); this module is
for in-process and optional build-time ``CMS_API_BASE`` consumers only.
"""

from datetime import date, datetime

from ninja import Field, NinjaAPI, Schema
from ninja.errors import HttpError
from ninja.pagination import PageNumberPagination, paginate
from wagtail.whitelist import Whitelister

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

api = NinjaAPI(title="Taha CMS Public API", version="0.3.0")
_BODY_WHITELISTER = Whitelister()


def sanitize_public_richtext(raw: str) -> str:
    """Re-sanitize rich text for public projection (same Whitelister as staff preview)."""
    return _BODY_WHITELISTER.clean(raw or "")


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

    @staticmethod
    def resolve_topic_tags(obj: Article) -> list[TopicTag]:
        return list(obj.topic_tags.filter(locale=obj.locale).order_by("name"))

    @staticmethod
    def resolve_series(obj: Article) -> list[Series]:
        return list(obj.series.public().order_by("ordering", "slug"))


class ArticleDetailOut(ArticleListOut):
    """Public article detail including sanitized rich-text body."""

    body: str
    accessibility_notes: str

    @staticmethod
    def resolve_body(obj: Article) -> str:
        return sanitize_public_richtext(str(obj.body or ""))


class ArticleSlugRedirectOut(Schema):
    """Public slug-redirect mapping for stable URLs after slug changes."""

    locale: str
    old_slug: str
    new_slug: str


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
        .prefetch_related("topic_tags", "series")
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
    projects: list[RelatedSlugOut] = Field(default_factory=list)
    publications: list[RelatedSlugOut] = Field(default_factory=list)

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
    published_at: datetime | None
    updated_at: datetime | None

    @staticmethod
    def resolve_body(obj: ResearchStatement) -> str:
        return sanitize_public_richtext(str(obj.body or ""))


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


class ProjectDetailOut(ProjectListOut):
    """Public project detail with redacted evidence/collaborators/funding/URLs."""

    methods_summary: str
    role: str
    start_date: date | None
    end_date: date | None
    code_url: str
    data_url: str
    demo_url: str
    topics: list[RelatedSlugOut] = Field(default_factory=list)
    publications: list[RelatedSlugOut] = Field(default_factory=list)
    evidence: list[EvidenceOut] = Field(default_factory=list)
    collaborators: list[CollaboratorOut] = Field(default_factory=list)
    funding: list[FundingOut] = Field(default_factory=list)

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
        .prefetch_related("projects")
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
        ResearchStatement.objects.public().filter(locale=locale).order_by("slug")
    )


@api.get(
    "/research/statements/{locale}/{slug}",
    response=ResearchStatementOut,
    summary="Get one published research statement by slug",
)
def get_research_statement(request, locale: str, slug: str) -> ResearchStatement:
    statement = (
        ResearchStatement.objects.public().filter(locale=locale, slug=slug).first()
    )
    if statement is None:
        raise HttpError(404, "research statement not found")
    return statement


@api.get(
    "/research/projects/{locale}",
    response=list[ProjectListOut],
    summary="List published projects for a locale (paginated)",
)
@paginate(PageNumberPagination, page_size=10)
def list_research_projects(request, locale: str):
    return Project.objects.public().filter(locale=locale).order_by("-published_at", "slug")


@api.get(
    "/research/projects/{locale}/{slug}",
    response=ProjectDetailOut,
    summary="Get one published project by slug",
)
def get_research_project(request, locale: str, slug: str) -> Project:
    project = (
        Project.objects.public()
        .filter(locale=locale, slug=slug)
        .prefetch_related(
            "topics",
            "publications",
            "evidence_items",
            "collaborators",
            "funding_items",
        )
        .first()
    )
    if project is None:
        raise HttpError(404, "project not found")
    return project


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
