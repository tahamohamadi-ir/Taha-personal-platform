"""Wagtail snippet registration for Article, Series, and TopicTag (P4)."""

from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet

from apps.content.models import Article, ArticleSlugRedirect, Series, TopicTag


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


register_snippet(ArticleViewSet)
register_snippet(SeriesViewSet)
register_snippet(TopicTagViewSet)
register_snippet(ArticleSlugRedirectViewSet)
