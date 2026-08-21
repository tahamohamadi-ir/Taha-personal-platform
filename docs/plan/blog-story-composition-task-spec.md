# Task Specification — Blog story composition (slice 1)

**Status:** `PARTIAL`

## Task: Blog story body via composition engine

- Goal: Use composition as a **story body engine** (not a URL owner). Blog articles can attach a single-locale story document; Astro renders it with a RichText `body` fallback. Landing bilingual catalog stays unchanged.
- User/actor and journey: Owner edits an article in the React admin, creates/publishes a story of blocks (text, figure, video, audio, math). After static rebuild, visitors read `/{locale}/blog/{slug}/` without JavaScript for native media and math.
- Release type: `STANDARD`
- Risk level: Medium (additive schema; public `/media/` now gated on `is_active`)
- Owner and handoff recipient: agent implements → CI → owner VPS migrate + static rebuild
- Related: LOG-0167; ADR-0026; former `DEFER-0028` story projection

## Scope

- In scope:
  - `CompositionPage.kind` = `landing` | `story`; story catalog is single-locale (`figure`/`video`/`audio`/`math`).
  - Optional `Article.story` FK; story editor on article edit (not only `/composition`).
  - Media allowlist adds video/audio and SVG with magic-byte validation, 50MB AV cap, public `/media/` only for `is_active` (staff may preview inactive).
  - Public article JSON includes published-only `story`; Astro `StoryBody` + `ArticleDetail` fallback to sanitized `body`.
  - Typed footer (license / accessibility notes) only when filled; listing cards unchanged.
- Non-goals:
  - Project / research / experience story bodies (later slices).
  - `primaryColor` CSS injection and admin-managed current CV (`DEFER-0029` CLOSED LOG-0181).
  - HMAC production enable (`DEFER-0027`), full Playwright matrix (`DEFER-0026`).
  - Uninstalling Wagtail (`DEBT-0003`). Inventing content. Enabling HMAC.
- Allowed files: `apps/cms/**`, `apps/web/**`, `docs/plan/**`, `docs/status/**`, `Task-list.md`, `AGENTS.md`, `docs/plan/README.md`.
- Forbidden files: secret files; the Cursor plan file; production live Caddy host files.

## Contracts and data

- Documents/ADRs/API schemas/models read: ADR-0026; ADM-3 composition; public `/api/articles/`; media validators.
- Contracts changed: public article detail may include `story`; `/media/<path>` is Django-gated.
- Migration/data impact: additive `composition.0002_compositionpage_kind`, `content.0008_article_story`. Existing composition rows default `kind=landing`. Existing articles have `story=null`.
- Locale, visibility and publication impact: story JSON only if composition `kind=story`, `status=published`, locale matches article; drafts never public. Inactive media 404 for anonymous `/media/`.
- Security/privacy impact: magic-byte allowlist; SVG script rejection; published-only projection.

## Verification and release

- Tests/commands to run:
  - `uv run pytest` on composition/media/public article tests in `apps/cms`
  - `uv run ruff check .` in `apps/cms`
  - `npm run check` in `apps/web` and `apps/cms/admin-frontend`
- Manual QA path: owner migrate, upload an active video, attach a published story on an article, rebuild static, open `/{locale}/blog/{slug}/` with JS disabled.
- Acceptance criteria:
  - Landing schema still includes bilingual `hero`; story schema does not.
  - Draft story → public `story: null` and fallback `body`.
  - Inactive media 404 anonymously.
  - Article listing cards still title/excerpt/tags (no story dump).
- Rollback/fallback: revert PR; previous CMS image; nullable FK and default `kind=landing` are compatible.
- Documentation to update: `WORK_LOG`, `deferred-validation`, `CHANGELOG`, `docs/plan/README.md`, `Task-list.md`.

## Handoff

- Files changed (task-owned only): recorded in WORK_LOG LOG-0167.
- Verification actually run (command + result):
  - `uv run pytest -q tests/test_media.py tests/test_public_media.py tests/test_story_composition.py tests/test_api.py tests/test_admin_composition_api.py tests/test_admin_content_write.py tests/test_admin_media_api.py` — 110 passed
  - `uv run ruff check .` in `apps/cms` — All checks passed
  - `uv run python manage.py makemigrations --check --dry-run` — No changes detected
  - `npm run check` in `apps/web` — 0 errors (72 files)
  - `npm run check` in `apps/cms/admin-frontend` — PASS
- Deferred/risk IDs: `DEFER-0028` CLOSED (blog story→Astro); `DEFER-0029` CLOSED (primaryColor + CV, LOG-0181); `DEFER-0030` OPEN (story bodies for project/research/experience); `DEFER-0026`/`DEFER-0027` unchanged; `DEBT-0003` unchanged.
- Explicit blockers and next input: owner dumpdata + backup, migrate `0002`/`0008`, CMS image rebuild, `rebuild-static.sh`. Not DONE for production until migrate + rebuild.
