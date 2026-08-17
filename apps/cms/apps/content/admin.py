"""Wagtail snippet registration for Article/Series and P5 research entities."""

from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet

from apps.content.models import (
    Article,
    ArticleSlugRedirect,
    Project,
    ProjectCaseStudyDetails,
    ProjectCollaborator,
    ProjectDiagram,
    ProjectEvidence,
    ProjectFunding,
    ProjectScreenshot,
    Publication,
    ResearchStatement,
    ResearchTopic,
    Series,
    TopicTag,
)


class ArticleViewSet(SnippetViewSet):
    model = Article
    icon = "doc-full"
    menu_label = "Articles"
    menu_order = 200
    list_display = ["title", "locale", "status", "published_at", "reading_time_minutes"]
    list_filter = ["locale", "status", "license"]
    search_fields = ["title", "slug", "excerpt"]
    panels = [
        MultiFieldPanel(
            [
                FieldPanel("title"),
                FieldPanel("slug"),
                FieldPanel("locale"),
                FieldPanel("status"),
                FieldPanel("published_at"),
            ],
            heading="Identity & lifecycle",
        ),
        FieldPanel("body"),
        FieldPanel("excerpt"),
        FieldPanel("featured_image"),
        FieldPanel("topic_tags"),
        FieldPanel("series"),
        FieldPanel("license"),
        FieldPanel("accessibility_notes"),
        FieldPanel("reading_time_minutes", read_only=True),
        FieldPanel("allow_comments"),
    ]


class SeriesViewSet(SnippetViewSet):
    model = Series
    icon = "list-ul"
    menu_label = "Series"
    menu_order = 210
    list_display = ["title", "locale", "ordering", "status"]
    list_filter = ["locale", "status"]
    search_fields = ["title", "slug", "description"]
    panels = [
        FieldPanel("title"),
        FieldPanel("slug"),
        FieldPanel("locale"),
        FieldPanel("description"),
        FieldPanel("ordering"),
        FieldPanel("status"),
        FieldPanel("published_at"),
    ]


class TopicTagViewSet(SnippetViewSet):
    model = TopicTag
    icon = "tag"
    menu_label = "Topic tags"
    menu_order = 220
    list_display = ["name", "slug", "locale"]
    list_filter = ["locale"]
    search_fields = ["name", "slug"]
    panels = [
        FieldPanel("name"),
        FieldPanel("slug"),
        FieldPanel("locale"),
    ]


class ArticleSlugRedirectViewSet(SnippetViewSet):
    model = ArticleSlugRedirect
    icon = "redirect"
    menu_label = "Article slug redirects"
    menu_order = 230
    list_display = ["locale", "old_slug", "new_slug"]
    list_filter = ["locale"]
    search_fields = ["old_slug", "new_slug"]
    panels = [
        FieldPanel("locale"),
        FieldPanel("old_slug"),
        FieldPanel("new_slug"),
    ]


class ResearchTopicViewSet(SnippetViewSet):
    model = ResearchTopic
    icon = "site"
    menu_label = "Research topics"
    menu_order = 240
    list_display = ["title", "locale", "status", "published_at"]
    list_filter = ["locale", "status"]
    search_fields = ["title", "slug", "summary"]
    panels = [
        MultiFieldPanel(
            [
                FieldPanel("title"),
                FieldPanel("slug"),
                FieldPanel("locale"),
                FieldPanel("status"),
                FieldPanel("published_at"),
            ],
            heading="Identity & lifecycle",
        ),
        FieldPanel("summary"),
        FieldPanel("motivation"),
        FieldPanel("problems"),
        FieldPanel("research_questions"),
        FieldPanel("methods"),
        FieldPanel("future_directions"),
    ]


class ResearchStatementViewSet(SnippetViewSet):
    model = ResearchStatement
    icon = "doc-full-inverse"
    menu_label = "Research statements"
    menu_order = 250
    list_display = ["title", "locale", "status", "published_at"]
    list_filter = ["locale", "status"]
    search_fields = ["title", "slug"]
    panels = [
        MultiFieldPanel(
            [
                FieldPanel("title"),
                FieldPanel("slug"),
                FieldPanel("locale"),
                FieldPanel("status"),
                FieldPanel("published_at"),
            ],
            heading="Identity & lifecycle",
        ),
        FieldPanel("body"),
    ]


class PublicationViewSet(SnippetViewSet):
    model = Publication
    icon = "doc-empty"
    menu_label = "Publications"
    menu_order = 260
    list_display = ["title", "locale", "venue", "date", "status"]
    list_filter = ["locale", "status", "license"]
    search_fields = ["title", "slug", "authors", "doi"]
    panels = [
        MultiFieldPanel(
            [
                FieldPanel("title"),
                FieldPanel("slug"),
                FieldPanel("locale"),
                FieldPanel("status"),
                FieldPanel("published_at"),
            ],
            heading="Identity & lifecycle",
        ),
        FieldPanel("authors"),
        FieldPanel("venue"),
        FieldPanel("date"),
        FieldPanel("doi"),
        FieldPanel("url"),
        FieldPanel("pdf_url"),
        FieldPanel("license"),
        MultiFieldPanel(
            [
                FieldPanel("citation_count"),
                FieldPanel("citation_source"),
                FieldPanel("citation_last_verified"),
                FieldPanel("citation_visibility"),
            ],
            heading="Citation (public only with source + verified + public visibility)",
        ),
    ]


class ProjectViewSet(SnippetViewSet):
    model = Project
    icon = "folder-open-inverse"
    menu_label = "Projects"
    menu_order = 270
    list_display = ["title", "locale", "project_type", "status", "published_at"]
    list_filter = ["locale", "status", "project_type", "license"]
    search_fields = ["title", "slug", "objective"]
    panels = [
        MultiFieldPanel(
            [
                FieldPanel("title"),
                FieldPanel("slug"),
                FieldPanel("locale"),
                FieldPanel("status"),
                FieldPanel("published_at"),
            ],
            heading="Identity & lifecycle",
        ),
        FieldPanel("project_type"),
        FieldPanel("objective"),
        FieldPanel("methods_summary"),
        FieldPanel("role"),
        FieldPanel("start_date"),
        FieldPanel("end_date"),
        FieldPanel("license"),
        MultiFieldPanel(
            [
                FieldPanel("code_availability"),
                FieldPanel("code_url"),
                FieldPanel("data_availability"),
                FieldPanel("data_url"),
                FieldPanel("demo_availability"),
                FieldPanel("demo_url"),
            ],
            heading="Availability (URLs only public when availability=public)",
        ),
        FieldPanel("topics"),
        FieldPanel("publications"),
    ]


class ProjectCaseStudyDetailsViewSet(SnippetViewSet):
    model = ProjectCaseStudyDetails
    icon = "doc-full"
    menu_label = "Project case studies"
    menu_order = 275
    list_display = ["project", "depth"]
    list_filter = ["depth"]
    search_fields = ["problem", "trade_offs", "outcomes_summary"]
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


class ProjectDiagramViewSet(SnippetViewSet):
    model = ProjectDiagram
    icon = "image"
    menu_label = "Project diagrams"
    menu_order = 276
    list_display = ["title", "project", "version", "visibility"]
    list_filter = ["visibility"]
    search_fields = ["title", "alt_text", "long_description"]
    panels = [
        FieldPanel("project"),
        FieldPanel("title"),
        FieldPanel("version"),
        FieldPanel("diagram_date"),
        FieldPanel("alt_text"),
        FieldPanel("long_description"),
        FieldPanel("diagram_image"),
        FieldPanel("visibility"),
    ]


class ProjectScreenshotViewSet(SnippetViewSet):
    model = ProjectScreenshot
    icon = "image"
    menu_label = "Project screenshots"
    menu_order = 277
    list_display = ["caption", "project", "visibility"]
    list_filter = ["visibility"]
    search_fields = ["caption", "alt_text"]
    panels = [
        FieldPanel("project"),
        FieldPanel("caption"),
        FieldPanel("alt_text"),
        FieldPanel("external_url"),
        FieldPanel("screenshot_image"),
        FieldPanel("visibility"),
    ]


class ProjectEvidenceViewSet(SnippetViewSet):
    model = ProjectEvidence
    icon = "pick"
    menu_label = "Project evidence"
    menu_order = 280
    list_display = ["label", "project", "visibility"]
    list_filter = ["visibility"]
    search_fields = ["label", "source", "value"]
    panels = [
        FieldPanel("project"),
        FieldPanel("label"),
        FieldPanel("value"),
        FieldPanel("source"),
        FieldPanel("last_verified"),
        FieldPanel("visibility"),
    ]


class ProjectCollaboratorViewSet(SnippetViewSet):
    model = ProjectCollaborator
    icon = "group"
    menu_label = "Project collaborators"
    menu_order = 290
    list_display = ["name", "project", "publication_approved"]
    list_filter = ["publication_approved"]
    search_fields = ["name", "role"]
    panels = [
        FieldPanel("project"),
        FieldPanel("name"),
        FieldPanel("role"),
        FieldPanel("publication_approved"),
    ]


class ProjectFundingViewSet(SnippetViewSet):
    model = ProjectFunding
    icon = "pilcrow"
    menu_label = "Project funding"
    menu_order = 300
    list_display = ["funder", "project", "publication_approved"]
    list_filter = ["publication_approved"]
    search_fields = ["funder", "grant_id"]
    panels = [
        FieldPanel("project"),
        FieldPanel("funder"),
        FieldPanel("grant_id"),
        FieldPanel("publication_approved"),
    ]


register_snippet(ArticleViewSet)
register_snippet(SeriesViewSet)
register_snippet(TopicTagViewSet)
register_snippet(ArticleSlugRedirectViewSet)
register_snippet(ResearchTopicViewSet)
register_snippet(ResearchStatementViewSet)
register_snippet(PublicationViewSet)
register_snippet(ProjectViewSet)
register_snippet(ProjectCaseStudyDetailsViewSet)
register_snippet(ProjectDiagramViewSet)
register_snippet(ProjectScreenshotViewSet)
register_snippet(ProjectEvidenceViewSet)
register_snippet(ProjectCollaboratorViewSet)
register_snippet(ProjectFundingViewSet)
