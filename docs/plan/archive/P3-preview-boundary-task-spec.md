# Task Spec — P3-07 staff draft preview boundary

**Status:** DONE (code + tests 2026-08-16; optional CMS rebuild for production)  
**ID:** P3-preview-boundary  
**Related:** Task-list P3-07, ADR-0022, DEFER-0016, LOG-0132

## Goal

Staff can read draft (and any lifecycle status) content inside Wagtail admin under an access boundary, with search/cache headers that prevent indexing and shared caching. Close the P3-07 gap where allowlist/XSS tests exist but preview runtime does not.

## Context

- There are **no Wagtail `Page` subclasses** in this repo. P3 content uses plain Django models: `Landing`, `Profile`, `Article` (`apps.content.models`).
- Staging is decommissioned (ADR-0025). Public share-tokens need replay/leak design and are **out of scope** (`DEFER-0016`).
- Public `/api/` and `/media/` remain unpublished on Caddy.

## Scope

### In

- Staff-only read-only preview under `/admin/preview/<kind>/<pk>/` for existing models (`landing`, `profile`, `article`).
- `@require_admin_access` + existing MFA middleware (OTP-verified staff).
- Body sanitized with Wagtail `Whitelister` (same allowlist contract as ADR-0022 / pytest).
- `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store` on preview responses.
- pytest covering: anonymous → login, non-staff denied, staff without OTP blocked, staff+OTP sees draft, headers, XSS stripped, unknown kind/pk → 404.
- Docs: Task Spec, WORK_LOG, CHANGELOG, BACKLOG, Task-list P3-07 ticks, ADR-0022 note, DEFER-0016.

### Out

- Public preview tokens / signed URLs.
- New Caddy routes for `/api/` or `/media/`.
- Astro-faithful / frontend-faithful preview (P7).
- Inventing Wagtail Page models or new content entities.
- VPS ops, restic, contact persistence.

## Acceptance criteria

- [x] Authenticated staff with verified OTP can GET `/admin/preview/landing/<pk>/` (and profile/article) and see draft title + sanitized body.
- [x] Unauthenticated request redirects to Wagtail login (no draft body in response).
- [x] Non-staff authenticated user cannot read preview (denied / redirect; no draft leak).
- [x] Preview response headers include `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store`.
- [x] XSS payloads in body are stripped in preview HTML (Whitelister).
- [x] No public token URL; no Caddy change for preview.
- [x] `uv run ruff check` and `uv run pytest -q` green under `apps/cms`.
- [x] Docs ledgers synchronized; public token deferred as DEFER-0016.

## Validation

```powershell
cd apps/cms
uv sync --python 3.12
$env:DJANGO_SETTINGS_MODULE = "config.settings.test"
uv run ruff check .
uv run pytest -q
```

## Architecture decision (this slice)

**Staff-session preview only under `/admin/`.** Access boundary = Wagtail admin auth + MFA. Public token deferred to DEFER-0016.

## Rollback

Revert the feature branch / commit that adds preview URLs, middleware header changes, and tests. No migration expected. Production unaffected until CMS image rebuild (optional; admin-only path).
