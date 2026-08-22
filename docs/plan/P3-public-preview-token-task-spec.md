# Task Spec — P3 public preview share token (DEFER-0016)

**Status:** DONE (2026-08-22)  
**ID:** P3-public-preview-token  
**Related:** Task-list ADM-4, ADR-0022, DEFER-0016, P3-preview-boundary-task-spec

## Goal

Allow staff to generate a short-lived, signed URL that lets external reviewers read draft Landing/Profile/Article content without a CMS session. The URL must not be indexed or cached publicly.

## Context

- Staff-session preview ships at `/staff/preview/<kind>/<pk>/` (P3-07 DONE).
- Staging is decommissioned (ADR-0025); external draft review needs a stateless token instead of a shared login.
- Public `/api/` remains published-only; preview is a separate HTML route on CMS.

## Scope

### In

- Stateless HMAC token: `HMAC-SHA256(secret, f"preview:{kind}:{pk}:{exp}")`, 15-minute TTL.
- Public route `GET /preview/share/<token>/` on CMS — no session required.
- Headers: `X-Robots-Tag: noindex, nofollow, noarchive` + `Cache-Control: no-store`.
- Kinds: `landing`, `profile`, `article` — reuse sanitization from `views_preview.py`.
- Admin SPA: “Copy preview link” on edit pages for supported entities.
- Admin API: `POST /api/v1/admin/content/{entity}/{id}/preview-link` (staff + OTP + audit).
- Caddy: proxy `/preview/share/*` → CMS on host and Compose edge configs.
- pytest: valid draft view, expired → 410, tampered → 404, XSS stripped, headers.
- Docs: close DEFER-0016, ADR-0022 addendum, Task-list ADM-4 tick, WORK_LOG, CHANGELOG.

### Out

- Database table for tokens (stateless only).
- Preview for research/project/publication entities.
- Astro-faithful / frontend-faithful preview (P7).
- VPS deploy / Caddy live cutover (owner after merge).

## Acceptance criteria

- [x] Valid token shows draft title + sanitized body for landing/profile/article.
- [x] Expired token returns HTTP 410; tampered/invalid token returns HTTP 404.
- [x] Response headers include `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store`.
- [x] XSS payloads in body are stripped (same allowlist as staff preview).
- [x] Staff+OTP can generate a preview link from the admin SPA; anonymous cannot call the API.
- [x] Caddy snippets proxy `/preview/share/*` to CMS.
- [x] `uv run pytest -q` (preview tests), `uv run ruff check .`, admin-frontend `npm run check` green.
- [x] DEFER-0016 CLOSED in deferred-validation.md; ledgers synchronized.

## Validation

```powershell
cd apps/cms
uv sync --python 3.12
$env:DJANGO_SETTINGS_MODULE = "config.settings.test"
uv run ruff check .
uv run pytest -q tests/test_preview.py tests/test_preview_share.py
cd admin-frontend
npm run check
```

## Architecture decision (this slice)

**Stateless signed URL.** Secret from `PREVIEW_SHARE_SECRET` (falls back to `SECRET_KEY` in dev/test). Token encodes kind, pk, expiry, and HMAC signature. No replay revocation beyond expiry.

## Rollback

Revert the feature branch. Remove Caddy `/preview/share/*` handle if already deployed. No migration. Production unaffected until CMS image rebuild + Caddy sync.
