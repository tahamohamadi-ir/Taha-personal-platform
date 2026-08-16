# Task Specification — P4 Blog/Writing

## Task: P4 — Blog/Writing with Article/Series, list/detail, feed

- Goal: extend the P3 Article shell to a full blog/writing section with Article (body rich text, media attachments, topic tags, license, accessibility metadata, reading metrics), a Series model, locale-aware list/detail routes, sitemap entries, structured data, and an optional RSS/Atom feed.
- User/actor and journey: CMS editors create and publish articles with rich text, series grouping, topic tags and metadata via Wagtail admin. Public visitors browse `/fa/blog/` and `/en/blog/`, read article detail pages, navigate by series and tags, and optionally subscribe to an RSS/Atom feed.
- Release type: `STANDARD`
- Risk level: Low–Medium (model extensions to P3 shell, no new runtime services; requires P3 CMS runtime deployed)
- Owner and handoff recipient: Project owner (gate authorization) → agent executes code changes → CI → owner review.

## Prerequisites

| # | Prerequisite | Evidence required | Status |
|---|---|---|---|
| P1 | P3 CMS runtime deployed | RISK-0009 CLOSED; `/admin/` accessible with MFA; `ci-cms.yml` green | Required |
| P2 | P3 Article shell exists | `apps/cms/apps/content/models.py:127` — `Article` model with `LocalizedContentMixin + LifecycleMixin` | Already in place |
| P3 | Wagtail rich-text features configured | `WAGTAIL_RICHTEXT_FEATURES` in `apps/cms/config/settings/base.py:116` | Already in place |

## Scope

- In scope:
  - Extend `Article` model: replace `body = TextField` with `body = RichTextField(features=...)`, add `excerpt` (TextField), `featured_image` (FK to `wagtailimages.Image`, nullable), `topic_tags` (M2M to `TopicTag`), `license` (CharField choices), `accessibility_notes` (TextField), `reading_time_minutes` (PositiveIntegerField, computed on save), `allow_comments` (BooleanField, default False — future-proofing only).
  - Create `Series` model: title, slug (unique per locale), locale, description, ordering (positive integer), lifecycle status, timestamps. M2M from Article to Series (ordered, optional).
  - Create `TopicTag` model: name, slug (unique), locale. M2M from Article to TopicTag.
  - Wagtail snippet registration for Article, Series, TopicTag with rich-text editor, field panels, search fields.
  - Ninja public API: list/detail for Article (published only, locale-filtered, paginated), list for Series, list for TopicTag. Exclude drafts, internal notes, inactive media.
  - Astro frontend pages: `/{locale}/blog/` (article list with pagination, tag filter), `/{locale}/blog/{slug}/` (article detail with reading time, tags, series navigation, license note).
  - SEO: Article structured data (schema.org/BlogPosting), sitemap entries for all published articles, breadcrumb navigation.
  - Optional RSS/Atom feed at `/{locale}/blog/feed.xml` — only if implemented; published public articles only.
  - Slug change redirect: stable redirect from old slug to new slug (stored in a simple redirect table or Wagtail redirects).
  - Tests: content model tests (lifecycle, projection, reading time computation, tag/series relationships), API tests (list, detail, pagination, draft exclusion, locale filtering), admin security tests (draft exclusion, ACL), SEO tests (structured data, sitemap entries).
- Non-goals:
  - Comment system (deferred; `allow_comments` field is future-proofing only).
  - Social sharing analytics.
  - Paywalled / subscriber-only content.
  - Dynamic / client-side rendering of article body.
  - Advanced search (Pagefind integration deferred to P10).
  - Media upload / image management beyond FK to existing Wagtail images.
- Allowed files: `apps/cms/apps/content/models.py`, `apps/cms/apps/content/tests/**`, `apps/cms/apps/api/**`, `apps/cms/apps/content/admin.py` (snippet registration), `apps/web/src/pages/{locale}/blog/**`, `apps/web/src/content/**` (if using content collections), `docs/plan/P4-blog-writing-task-spec.md`, `docs/status/*`, `Task-list.md`.
- Forbidden files: `apps/web/src/pages/index.astro`, `apps/web/src/layouts/**` (no shell changes), `apps/cms/config/settings/base.py` (no settings changes unless adding wagtail-localize or similar — not in scope), `infra/**`, `.github/workflows/**`, any secret file.

## Contracts and data

- Documents/ADRs/API schemas/models read: `PROJECT_MANIFEST.md`, `AGENTS.md`, `docs/templates/TASK_SPEC_TEMPLATE.md`, `apps/cms/apps/content/models.py` (existing Article shell, LifecycleMixin, LocalizedContentMixin, ContentQuerySet), `apps/cms/config/settings/base.py` (INSTALLED_APPS, WAGTAIL_RICHTEXT_FEATURES, MEDIA settings), `Task-list.md` §9 (P4-01 through P4-05).
- Contracts changed:
  - Article model: `body` type change (TextField → RichTextField), new fields (excerpt, featured_image, topic_tags, license, accessibility_notes, reading_time_minutes, allow_comments).
  - New models: `Series`, `TopicTag`.
  - New M2M relationships: Article↔Series, Article↔TopicTag.
  - Ninja API: new endpoints for article list/detail, series list, topic tag list.
  - Sitemap: new entries for published articles.
  - Astro routes: new `/{locale}/blog/` and `/{locale}/blog/{slug}/` pages.
- Migration/data impact:
  - Django migration for Article field changes (body type change is non-destructive for PostgreSQL — TextField and RichTextField both map to `text`; new fields are nullable or have defaults).
  - New tables: `content_series`, `content_topic_tag`, M2M junction tables.
  - No data loss: P3 Article shell has no production data (CMS not deployed).
- Locale, visibility and publication impact:
  - Articles are locale-specific (fa/en); slug unique per locale.
  - Public projection: only `status=published` + `published_at <= now` (inherited from `ContentQuerySet.public()`).
  - Series and TopicTag are locale-aware; public API returns only published-series metadata.
- Security/privacy impact:
  - Rich text body sanitized via existing Wagtail allowlist (`WAGTAIL_RICHTEXT_FEATURES` in base.py:116).
  - Draft/private articles never exposed via public API or frontend.
  - No new secrets, endpoints or auth changes.

## Data contracts

### Article (extended from P3 shell)

| Field | Type | Notes |
|---|---|---|
| title | CharField(200) | inherited from LocalizedContentMixin |
| slug | SlugField(200) | inherited; unique per locale |
| locale | CharField(2) | inherited; fa/en |
| body | RichTextField | features from WAGTAIL_RICHTEXT_FEATURES: h2, h3, h4, bold, italic, ol, ul, link, document-link, hr, blockquote, code |
| excerpt | TextField(blank=True) | short summary for list view and meta description |
| featured_image | FK(Image, null=True, blank=True) | optional hero image via Wagtail images |
| topic_tags | M2M(TopicTag, blank=True) | editorial topic classification |
| series | M2M(Series, blank=True) | ordered series grouping |
| license | CharField(choices=LICENSE_CHOICES, default="cc-by-nc-4") | e.g., CC-BY-4, CC-BY-NC-4, All Rights Reserved |
| accessibility_notes | TextField(blank=True) | e.g., "alt text for figures provided" |
| reading_time_minutes | PositiveIntegerField(default=0) | computed on save from body word count (~200 wpm) |
| allow_comments | BooleanField(default=False) | future-proofing; no comment system in P4 |
| status | CharField | inherited from LifecycleMixin |
| published_at | DateTimeField | inherited |
| created_at / updated_at | DateTimeField | inherited |

### Series

| Field | Type | Notes |
|---|---|---|
| title | CharField(200) | |
| slug | SlugField(200) | unique per locale |
| locale | CharField(2) | fa/en |
| description | TextField(blank=True) | |
| ordering | PositiveIntegerField(default=0) | for manual sort within locale |
| status | CharField | inherited from LifecycleMixin |
| published_at / created_at / updated_at | DateTimeField | inherited |

### TopicTag

| Field | Type | Notes |
|---|---|---|
| name | CharField(100) | display name |
| slug | SlugField(100) | unique globally |
| locale | CharField(2) | fa/en |

## Admin

- Register Article, Series, TopicTag as Wagtail snippets via `wagtail.snippets`.
- Article admin panels: title, slug, locale, body (rich text editor), excerpt, featured_image (image chooser), topic_tags (tag widget), series (multi-select), license (dropdown), accessibility_notes, reading_time_minutes (read-only, computed), allow_comments, status, published_at.
- Series admin panels: title, slug, locale, description, ordering, status.
- TopicTag admin panels: name, slug, locale.
- Search fields on all snippets for admin discoverability.
- No new Wagtail Page subclasses; all entities remain plain Django models managed as snippets.

## Frontend (Astro)

### Routes

| Route | Description |
|---|---|
| `/{locale}/blog/` | Article list — paginated (10 per page), sorted by `published_at` desc, shows title, excerpt, reading time, tags, date |
| `/{locale}/blog/{slug}/` | Article detail — full body, reading time, tags, series navigation (prev/next in series), license note, structured data |
| `/{locale}/blog/series/{slug}/` | Series listing — articles in series, ordered |
| `/{locale}/blog/tag/{slug}/` | Tag listing — articles with tag |
| `/{locale}/blog/feed.xml` | RSS/Atom feed (optional; only if implemented) |

### Components

- `ArticleCard.astro` — list item (title, excerpt, date, reading time, tags).
- `ArticleDetail.astro` — full article body, metadata bar (date, reading time, license, tags).
- `SeriesNav.astro` — prev/next navigation within a series.
- `TagList.astro` — rendered tag pills with links.
- `Breadcrumbs.astro` — reusable breadcrumb component (Home > Blog > Article).

### Behavior

- Reading time computed server-side (no client JS).
- Tag and series links are static routes.
- No client-side hydration required; article body is pure HTML from rich text.
- Missing translation state: if article exists in one locale but not the other, show honest "not yet translated" message — no silent fallback.

## SEO

- Article structured data: `schema.org/BlogPosting` JSON-LD on detail pages (headline, datePublished, dateModified, author, image if featured_image set, wordCount).
- Sitemap: `<url>` entry for every published article with `<lastmod>`, `<changefreq>`, `<priority>`.
- Meta: title, description (from excerpt or first 160 chars of body), canonical URL, Open Graph tags.
- Breadcrumb: `Blog > Article Title` in structured data (BreadcrumbList).
- Feed: if RSS/Atom implemented, `<link rel="alternate" type="application/rss+xml">` in article detail `<head>`.

## Verification and release

- Tests/commands to run:
  - `uv run pytest apps/cms/apps/content/tests/` — model lifecycle, projection, reading time, tag/series relationships, slug uniqueness.
  - `uv run pytest apps/cms/apps/api/tests/` — list/detail/pagination/draft-exclusion/locale-filter.
  - `uv run pytest apps/cms/apps/security/tests/` — draft exclusion, ACL.
  - `uv run ruff check .` — clean.
  - `npm run check` (apps/web/) — typecheck.
  - `npm run build` (apps/web/) — build succeeds with new routes.
- Manual QA path:
  - Create article via `/admin/` → verify rich text renders correctly.
  - Publish article → verify appears at `/{locale}/blog/{slug}/`.
  - Verify draft article NOT visible at public URL.
  - Verify sitemap includes new article URL.
  - Verify structured data validates (Google Rich Results Test).
  - Verify reading time displays correctly.
  - Verify series navigation works (prev/next).
  - Verify tag filtering works.
- Acceptance criteria:
  - All new tests PASS; existing tests unaffected.
  - Published articles visible at public routes; drafts excluded.
  - Rich text renders without unrestricted HTML or XSS vectors.
  - Sitemap and structured data present and valid.
  - Reading time computed correctly (~200 wpm).
  - Series ordering respected.
  - Locale isolation: fa and en articles independent.
  - `npm run build` produces all expected pages.
- Rollback/fallback:
  - Revert all P4 commits — Article model returns to P3 shell (no data loss since no P3 production data exists).
  - Remove new Astro pages and components.
  - No database migration rollback needed (new fields are nullable/defaults; tables dropped with model removal).
  - No impact on existing static site routes.
- Documentation to update: `WORK_LOG.md`, `deferred-validation.md` (if any P4 items deferred), `CHANGELOG.md`, `BACKLOG.md`, `PROJECT_MANIFEST.md` (if canonical commands change), `Task-list.md` (P4 checkboxes).

## Deferred items

| ID | Item | Why deferred | Target |
|---|---|---|---|
| DEFER-P4-COMMENTS | Comment system | Complex; needs auth, moderation, spam protection | P7+ or owner decision |
| DEFER-P4-SOCIAL | Social sharing analytics | Needs provider/consent decision | Owner decision |
| DEFER-P4-PAYWALL | Paywalled content | Needs subscription/auth infrastructure | Not planned |
| DEFER-P4-SEARCH | Pagefind integration for blog | Deferred to P10 (Topics + Search) | P10 |

## Handoff

- Files changed (task-owned only): `apps/cms/apps/content/models.py`, `apps/cms/apps/content/tests/`, `apps/cms/apps/api/`, `apps/cms/apps/content/admin.py` (snippet registration), `apps/web/src/pages/{locale}/blog/`, `apps/web/src/components/` (ArticleCard, ArticleDetail, SeriesNav, TagList, Breadcrumbs), `docs/plan/P4-blog-writing-task-spec.md` (this file), `docs/status/*`, `Task-list.md`.
- Verification actually run (command + result): recorded in WORK_LOG after each step.
- Deferred/risk IDs: DEFER-P4-COMMENTS, DEFER-P4-SOCIAL, DEFER-P4-PAYWALL, DEFER-P4-SEARCH.
- Explicit blockers and next input: P3 CMS runtime must be deployed (RISK-0009 CLOSED) before P4 can begin. Owner provides topic tags, series structure, license preference and any content for initial articles.
