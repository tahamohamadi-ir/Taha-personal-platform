"""Wagtail admin viewsets for plain Django content models (not Wagtail Pages)."""

from __future__ import annotations

from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.admin.viewsets.base import ViewSetGroup
from wagtail.admin.viewsets.model import ModelViewSet

from apps.content.models import (
    Article,
    Landing,
    Profile,
    Project,
    ProjectCaseStudyDetails,
    Publication,
    ResearchStatement,
    ResearchTopic,
    Series,
    TopicTag,
)

_LOCALE_STATUS_PANELS = [
    FieldPanel("locale"),
    FieldPanel("slug"),
    FieldPanel("title"),
    FieldPanel("status"),
    FieldPanel("published_at"),
]


class LandingViewSet(ModelViewSet):
    model = Landing
    icon = "home"
    menu_label = "Landing pages"
    list_display = ["title", "locale", "status", "published_at", "updated_at"]
    list_filter = ["locale", "status"]
    search_fields = ["title", "slug", "body"]
    ordering = ["locale", "slug"]
    panels = [
        MultiFieldPanel(_LOCALE_STATUS_PANELS, heading="Identity & lifecycle"),
        FieldPanel("body"),
        FieldPanel("seo_title"),
        FieldPanel("seo_description"),
    ]


class ProfileViewSet(ModelViewSet):
    model = Profile
    icon = "user"
    menu_label = "Profiles"
    list_display = ["title", "locale", "status", "published_at", "updated_at"]
    list_filter = ["locale", "status"]
    search_fields = ["title", "slug", "body"]
    ordering = ["locale", "slug"]
    panels = [
        MultiFieldPanel(_LOCALE_STATUS_PANELS, heading="Identity & lifecycle"),
        FieldPanel("body"),
        FieldPanel("seo_title"),
        FieldPanel("seo_description"),
    ]


class ArticleViewSet(ModelViewSet):
    model = Article
    icon = "doc-full"
    menu_label = "Articles"
    list_display = [
        "title",
        "locale",
        "status",
        "published_at",
        "reading_time_minutes",
        "updated_at",
    ]
    list_filter = ["locale", "status", "license"]
    search_fields = ["title", "slug", "excerpt", "body"]
    ordering = ["-published_at", "locale", "slug"]
    panels = [
        MultiFieldPanel(_LOCALE_STATUS_PANELS, heading="Identity & lifecycle"),
        FieldPanel("excerpt"),
        FieldPanel("body"),
        FieldPanel("license"),
        FieldPanel("featured_image"),
        FieldPanel("topic_tags"),
        FieldPanel("series"),
        FieldPanel("accessibility_notes"),
        FieldPanel("allow_comments"),
    ]


class SeriesViewSet(ModelViewSet):
    model = Series
    icon = "list-ul"
    menu_label = "Series"
    list_display = ["title", "locale", "ordering", "status", "published_at"]
    list_filter = ["locale", "status"]
    search_fields = ["title", "slug", "description"]
    ordering = ["locale", "ordering", "slug"]
    panels = [
        MultiFieldPanel(_LOCALE_STATUS_PANELS, heading="Identity & lifecycle"),
        FieldPanel("description"),
        FieldPanel("ordering"),
    ]


class TopicTagViewSet(ModelViewSet):
    model = TopicTag
    icon = "tag"
    menu_label = "Topic tags"
    list_display = ["name", "slug", "locale"]
    list_filter = ["locale"]
    search_fields = ["name", "slug"]
    ordering = ["locale", "name"]
    panels = [FieldPanel("name"), FieldPanel("slug"), FieldPanel("locale")]


class ResearchTopicViewSet(ModelViewSet):
    model = ResearchTopic
    icon = "search"
    menu_label = "Research topics"
    list_display = ["title", "locale", "status", "published_at", "updated_at"]
    list_filter = ["locale", "status"]
    search_fields = ["title", "slug", "summary"]
    ordering = ["locale", "slug"]
    panels = [
        MultiFieldPanel(_LOCALE_STATUS_PANELS, heading="Identity & lifecycle"),
        FieldPanel("summary"),
        FieldPanel("motivation"),
        FieldPanel("problems"),
        FieldPanel("research_questions"),
        FieldPanel("methods"),
        FieldPanel("future_directions"),
    ]


class ResearchStatementViewSet(ModelViewSet):
    model = ResearchStatement
    icon = "openquote"
    menu_label = "Research statements"
    list_display = ["title", "locale", "status", "published_at"]
    list_filter = ["locale", "status"]
    search_fields = ["title", "slug", "body"]
    ordering = ["locale", "slug"]
    panels = [
        MultiFieldPanel(_LOCALE_STATUS_PANELS, heading="Identity & lifecycle"),
        FieldPanel("body"),
    ]


class PublicationViewSet(ModelViewSet):
    model = Publication
    icon = "doc-empty"
    menu_label = "Publications"
    list_display = ["title", "locale", "status", "published_at", "venue"]
    list_filter = ["locale", "status"]
    search_fields = ["title", "slug", "authors", "venue"]
    ordering = ["locale", "slug"]
    panels = [
        MultiFieldPanel(_LOCALE_STATUS_PANELS, heading="Identity & lifecycle"),
        FieldPanel("authors"),
        FieldPanel("venue"),
        FieldPanel("date"),
        FieldPanel("doi"),
        FieldPanel("url"),
        FieldPanel("pdf_url"),
        FieldPanel("license"),
        FieldPanel("citation_count"),
        FieldPanel("citation_source"),
        FieldPanel("citation_last_verified"),
        FieldPanel("citation_visibility"),
    ]


class ProjectViewSet(ModelViewSet):
    model = Project
    icon = "folder-open-1"
    menu_label = "Projects"
    list_display = ["title", "locale", "project_type", "status", "published_at"]
    list_filter = ["locale", "status", "project_type"]
    search_fields = ["title", "slug", "objective"]
    ordering = ["locale", "slug"]
    panels = [
        MultiFieldPanel(_LOCALE_STATUS_PANELS, heading="Identity & lifecycle"),
        FieldPanel("project_type"),
        FieldPanel("objective"),
        FieldPanel("methods_summary"),
        FieldPanel("role"),
        FieldPanel("start_date"),
        FieldPanel("end_date"),
        FieldPanel("license"),
        FieldPanel("code_availability"),
        FieldPanel("data_availability"),
        FieldPanel("demo_availability"),
        FieldPanel("code_url"),
        FieldPanel("data_url"),
        FieldPanel("demo_url"),
        FieldPanel("topics"),
        FieldPanel("publications"),
    ]


class ProjectCaseStudyViewSet(ModelViewSet):
    model = ProjectCaseStudyDetails
    icon = "pick"
    menu_label = "Case studies"
    list_display = ["project", "depth"]
    list_filter = ["depth"]
    search_fields = ["project__title", "problem"]
    panels = [
        FieldPanel("project"),
        FieldPanel("depth"),
        FieldPanel("problem"),
        FieldPanel("constraints"),
        FieldPanel("technical_decisions"),
        FieldPanel("trade_offs"),
        FieldPanel("outcomes_summary"),
        FieldPanel("lessons_learned"),
        FieldPanel("testing_summary"),
    ]


class SiteContentViewSetGroup(ViewSetGroup):
    """Editorial content served via Ninja API + Astro build (not Wagtail Pages)."""

    menu_label = "Site content"
    menu_icon = "edit"
    menu_order = 150
    items = (
        LandingViewSet("landing"),
        ProfileViewSet("profile"),
        ArticleViewSet("articles"),
        SeriesViewSet("series"),
        TopicTagViewSet("topic-tags"),
        ResearchTopicViewSet("research-topics"),
        ResearchStatementViewSet("research-statements"),
        PublicationViewSet("publications"),
        ProjectViewSet("projects"),
        ProjectCaseStudyViewSet("case-studies"),
    )
