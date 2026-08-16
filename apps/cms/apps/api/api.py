"""Public read-only CMS API (django-ninja) — published content only, no auth.

Only fields safe for public projection are exposed: no status, no internal
notes. Unknown resources raise 404 with a JSON body and no stack trace.

Public edge exposure of ``/api/`` remains deferred (DEFER-0017); this module is
for in-process and optional build-time ``CMS_API_BASE`` consumers only.
"""

from datetime import datetime

from ninja import Field, NinjaAPI, Schema
from ninja.errors import HttpError
from ninja.pagination import PageNumberPagination, paginate

from apps.content.models import (
    Article,
    ArticleSlugRedirect,
    Landing,
    Profile,
    Series,
    TopicTag,
)

api = NinjaAPI(title="Taha CMS Public API", version="0.2.0")


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
        return str(obj.body or "")


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
    return list(
        ArticleSlugRedirect.objects.filter(locale=locale).order_by("old_slug")
    )
