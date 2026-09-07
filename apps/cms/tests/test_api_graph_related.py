"""Public graph related-record URL resolution (BK-05 follow-up).

GET /api/graph/{locale}/related/{family}/{pk} -> {family, id, locale, url}.

Contract: published row in the requested locale resolves to its canonical
public path (verbatim — the web renders it as-is, never invents links);
anything else (draft, other locale, missing row, family without a detail
route) is 200 with url null so list consumers never fail a build over it.
Unknown family or locale is fail-closed 404, mirroring get_graph.
"""

from datetime import timedelta

import pytest
from django.test import Client
from django.utils import timezone

from apps.content.models import (
    Article,
    LifecycleStatus,
    Locale,
    ResearchStatement,
    Series,
)

_counter = {"n": 0}


def past():
    return timezone.now() - timedelta(days=1)


def _next():
    _counter["n"] += 1
    return _counter["n"]


def make_article(locale=Locale.FA, **overrides):
    n = _next()
    defaults = {
        "locale": locale,
        "slug": f"related-fixture-{n}",
        "title": f"Related fixture {n}",
        "status": LifecycleStatus.PUBLISHED,
        "published_at": past(),
    }
    defaults.update(overrides)
    return Article.objects.create(**defaults)


def make_series(locale=Locale.FA, **overrides):
    n = _next()
    defaults = {
        "locale": locale,
        "slug": f"related-series-{n}",
        "title": f"Related series {n}",
        "status": LifecycleStatus.PUBLISHED,
        "published_at": past(),
    }
    defaults.update(overrides)
    return Series.objects.create(**defaults)


def make_statement(locale=Locale.FA, **overrides):
    n = _next()
    defaults = {
        "locale": locale,
        "slug": f"related-statement-{n}",
        "title": f"Related statement {n}",
        "status": LifecycleStatus.PUBLISHED,
        "published_at": past(),
    }
    defaults.update(overrides)
    return ResearchStatement.objects.create(**defaults)


@pytest.fixture
def api_client():
    return Client()


def get(api_client, locale, family, pk):
    response = api_client.get(f"/api/graph/{locale}/related/{family}/{pk}")
    assert response["content-type"].startswith("application/json")
    return response


def test_published_article_resolves_canonical_url(api_client, db):
    article = make_article()
    response = get(api_client, "fa", "article", article.pk)
    assert response.status_code == 200
    assert response.json() == {
        "family": "article",
        "id": str(article.pk),
        "locale": "fa",
        "url": f"/fa/writing/{article.slug}/",
    }


def test_series_resolves_series_canonical_url(api_client, db):
    series = make_series()
    response = get(api_client, "fa", "series", series.pk)
    assert response.status_code == 200
    assert response.json()["url"] == f"/fa/writing/series/{series.slug}/"


def test_statement_resolves_singleton_url(api_client, db):
    statement = make_statement()
    response = get(api_client, "fa", "researchstatement", statement.pk)
    assert response.status_code == 200
    assert response.json()["url"] == "/fa/research/statement/"


def test_cross_locale_isolation_returns_null(api_client, db):
    article = make_article(locale=Locale.EN)
    response = get(api_client, "fa", "article", article.pk)
    assert response.status_code == 200
    assert response.json()["url"] is None


def test_draft_row_returns_null(api_client, db):
    article = make_article(status=LifecycleStatus.DRAFT, published_at=None)
    response = get(api_client, "fa", "article", article.pk)
    assert response.status_code == 200
    assert response.json()["url"] is None


def test_missing_pk_returns_null(api_client, db):
    response = get(api_client, "fa", "article", 999999)
    assert response.status_code == 200
    assert response.json() == {
        "family": "article",
        "id": "999999",
        "locale": "fa",
        "url": None,
    }


def test_non_integer_pk_returns_null_without_500(api_client, db):
    response = get(api_client, "fa", "article", "not-a-pk")
    assert response.status_code == 200
    assert response.json()["url"] is None


def test_family_without_detail_route_returns_null(api_client, db):
    response = get(api_client, "fa", "profile", 999999)
    assert response.status_code == 200
    assert response.json()["url"] is None


def test_unknown_family_is_404(api_client, db):
    assert get(api_client, "fa", "nope", 1).status_code == 404


def test_bad_locale_is_404(api_client, db):
    article = make_article()
    assert get(api_client, "xx", "article", article.pk).status_code == 404
