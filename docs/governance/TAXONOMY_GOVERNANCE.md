# Taxonomy Governance — Topics, Tags and Collections (P10-01)

**Status:** Active (2026-08-24, scaffold for P10).  
**Owner:** Project owner + editorial curator (see `curator_name` on Collection).  
**Related:** `Task-list.md` §15 P10-01/P10-03, `apps/cms/apps/content/models.py` (`TopicTag`, `Collection`, `ResearchTopic`), `DEFER-0020`, ADR-0029 (P10/P11 gate).

> This file is the **single source of truth** for how editorial tags and curated collections are created, named, and frozen. If a process here disagrees with a Task Spec, this file wins for taxonomy rules; task specs win for delivery phase.

---

## 1) Purpose & Freeze Rule

- The platform uses **locale-aware editorial taxonomy**: `TopicTag` (article-level topics), `ResearchTopic` (research agenda domains), and `Collection` (curated cross-entity sets).
- **Freeze before explosion:** No bulk tag/collection creation is allowed until this governance file, the `TopicTag` glossary fields, and the `Collection` curation contract are landed and reviewed. The owner must explicitly lift the freeze by updating `Status` here and closing `G1` in `master-remaining-work-checklist.md`.
- Until freeze is lifted: tags are created only via admin SPA with review by the owner; scripts that invent tags are forbidden.

## 2) Glossary (canonical definitions)

Canonical glossary entries live in two places:

- **This file** — the durable human glossary (survives refactors).
- **`TopicTag.description`** — the per-locale editorial definition that is projected to public topic canonical pages when present (see `api.py` projection).

| Canonical slug (en) | Display name | Definition (en) | Definition (fa) | Notes |
|---|---|---|---|---|
| `human-centered-ai` | Human-Centered AI | Systems where human agency, oversight, and values shape AI design and evaluation. | هوش مصنوعی انسان‌محور | Example placeholder — replace with owner-approved terms. |
| `research-methods` | Research Methods | Methods, protocols, and reproducibility practices. | روش‌های پژوهش | — |
| `engineering-practice` | Engineering Practice | Architecture, reliability, and delivery practice for software systems. | عمل مهندسی | — |

Empty glossary is honest: list/detail pages omit the definition block when `description` is blank rather than inventing copy.

## 3) Synonym & Normalization Rules

- **One canonical tag per concept.** Synonyms are **not** separate tags — they are recorded in `TopicTag.synonyms` (comma-separated, e.g., `"AI, Artificial Intelligence"` with `slug=artificial-intelligence`).
- **Creation must check synonyms first:** admin create/update of `TopicTag` must normalize input (`lowercase`, trim, collapse whitespace, replace `&`/`+` with `and`, transliterate only when owner-approved) and reject creation if the normalized name or slug collides with an existing `name` **or** any entry in `synonyms` (case-insensitive) for the same locale.
- **Slug rules:** ASCII-only `slugify(name)` per locale, `max_length=100`, globally unique (existing constraint `unique=True`). Persian display names keep Persian script in `name`; `slug` remains ASCII (`fa` locale with Latin slug) so URLs stay stable (`/{locale}/topics/{slug}/` or `/{locale}/writing/?tag={slug}`).
- **No silent stemming:** Search/FTS `simple` only (see ADR-0029). Taxonomy handles synonyms at the editorial layer, not via index stemming.

## 4) Creation & Curation Rules

### 4.1 TopicTag
- **Who:** Owner or delegated editor via `/api/v1/admin/content/topic-tag` (staff+OTP+CSRF). Anonymous creation is impossible (admin-only SPA path).
- **Required fields:** `name` (non-empty), `slug` (derived, editable), `locale` (`fa`/`en`), `description` (may be blank at create; must be filled before `published` on the curated topic page if that page is promoted).
- **Optional:** `synonyms` (blank = none).
- **Uniqueness:** `slug` globally unique; `(locale, name)` should be treated as unique in editorial practice even if not a DB constraint — enforce in review.
- **Lifecycle:** `TopicTag` has no `status` today (all rows are editorial infrastructure). Public projection filters by `locale` only; draft-archiving is expressed by unassigning the tag from published content, not by deleting the row. A future `status` addition would be a new migration + admin work.

### 4.2 Collection (curated)
- **Model:** `Collection` (`LocalizedContentMixin` + `LifecycleMixin`) — `locale`/`slug`/`title` + `description` + **curation contract**: `curator_name`, `curator_title` (optional), `criteria` (inclusion criteria prose), `curated_date` (`DateField`, nullable until publish), `cover_media` (optional active `Media`).
- **Member relations (scaffold phase):** `articles` (M2M `Article`), `projects` (M2M `Project`), `publications` (M2M `Publication`) — all blank-allowed. Membership is **explicit editorial curation only** (no auto-queries, no AI inference). A collection never invents members.
- **Curator accountability:** `curator_name` is the human owner of the curation decision; `criteria` must state why each member belongs. `curated_date` records the last human review date. These three fields are the **P10-03 contract** and must be non-empty for `status=published` (validated in `clean()` / admin write path in a follow-up strictness slice; scaffold allows blank for draft).
- **Published projection:** `/api/collections/{locale}` and `/api/collections/{locale}/{slug}` expose only `status=published` + `published_at <= now` rows (via `public()`); member expansions are filtered to `public()` members as well — a private member never leaks via a published collection.
- **Ordering:** `ordering = ["locale", "slug"]` + index `locale/slug/status` (same pattern as `Book`/`Talk`/`Download`).

## 5) Editorial Relationships

- `Article.topic_tags` ↔ `TopicTag` (M2M, filtered by `locale` in public projection).
- `Collection` → `Article` / `Project` / `Publication` (M2M curated sets). `ResearchTopic` ↔ `Project` is a **domain** relation distinct from tags — do not conflate `TopicTag` (blog-level) with `ResearchTopic` (research agenda).
- Collections may cite a `ResearchTopic` in `criteria` prose but do not FK to it in scaffold; a future migration can add `research_topics` M2M if editorial need is proven.
- No tag may be assigned across locales with mismatched `locale`: article `fa` may only carry `fa` tags (enforced in `api.py: resolve_topic_tags` filter). This keeps locale identity independent per `AGENTS.md`.

## 6) Verification & Index Lifecycle (P10-04 preview)

- **Publish/unpublish propagation (P10-04):** member publish requires collection rebuild (same HMAC rebuild chain as articles). If a member is unpublished/archived, the next static build drops it from the collection page and from the public API expansion (`public()` filter). No stale member is kept in projection.
- **Permission leak:** public collection endpoints use `ContentQuerySet.public()` as the sole entry point; admin-only collections (draft/review/scheduled/archived) are invisible to `api.py` and therefore to Pagefind indexes.
- **Filters/paging/rate:** public list is paginated (`page_size=10` via `PageNumberPagination`); unknown filters are rejected with 400; no cursor leak.
- **Drift = disable search + fall back:** if the Pagefind static index diverges from `published_for_locale` truth (e.g., after an unpublish before rebuild), the site must not silently serve stale/private results. Rule: the build rewrites the Pagefind index per locale (`scripts/pagefind-index.mjs`); if index is absent or stale, `/{locale}/search/` shows the noscript **browse** fallback (`/writing/`, `/research/`, `/projects/`) plus an `index is unavailable` message (already implemented in both `en/fa/search`). Drift monitoring will be owner-smoke: `GET /{locale}/search/` contains browse links and no private titles; rebuild smoke must assert `cms-build-origin` and absence of draft content.

## 7) PostgreSQL FTS (deferred)

- **Not enabled in scaffold.** `Task-list.md` P10-03 requires benchmark vs Pagefind before enabling FTS.
- **If FTS is chosen:** start with `simple` configuration, document stemming choice (or none), use English `simple` first, and gate behind a new ADR + migration. Per-locale `simple` only; no Persian stemming until editorial need is proven. FTS must still respect `public()` and never index admin/private fields. This governance file plus ADR-0029 block any FTS migration until benchmark evidence is recorded.

## 8) Search Fallback

- Search is **Pagefind static** (`/{locale}/search/`, per-locale indexes `dist/{locale}/pagefind/`). It indexes only built public HTML (no draft/preview/admin paths).
- **Fallback is always browse:** the `<noscript>` browse block plus the JS `catch(() => host.textContent = "Search index is unavailable...")` ensure that a missing/broken index never leaves the user with a dead page. Every search template must keep this block.
- Keyboard/filter announcements are in the search templates (aria-live polite region) — see `apps/web/src/pages/{en,fa}/search/index.astro` for the `search-announcements` live region.

## 9) Change Process

1. Propose a new canonical term or collection in a branch with an update to this file + (if needed) a migration that adds inventory.
2. Owner reviews glossary definition + synonyms + slug for both locales (or just the target locale — they are independent).
3. Merge only after `uv run pytest` passes and CSP/search smoke passes.
4. After merge, publisher curates members via admin SPA with `curator/criteria/date` and publishes the collection (which triggers rebuild).

---

*Freeze lifts when G1 in `master-remaining-work-checklist.md` is checked with evidence LOG-____.*
