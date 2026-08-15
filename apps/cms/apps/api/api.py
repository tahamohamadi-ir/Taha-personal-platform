"""Public read-only CMS API (django-ninja) — published content only, no auth.

Only fields safe for public projection are exposed: no status, no internal
timestamps beyond ``published_at``, no internal notes. Unknown resources raise
404 with a JSON body and no stack trace.
"""

from datetime import datetime

from ninja import NinjaAPI, Schema
from ninja.errors import HttpError

from apps.content.models import Landing, Profile

api = NinjaAPI(title="Taha CMS Public API", version="0.1.0")


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
