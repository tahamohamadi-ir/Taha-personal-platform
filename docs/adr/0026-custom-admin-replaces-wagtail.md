# ADR-0026: Custom admin panel replaces the Wagtail admin

**Status:** Accepted (2026-08-18, owner decision).

## Context

The current `/admin/` is the stock Wagtail 7.4 admin. It is unusable for the
owner's stated requirement that the admin must fully manage and customize the
site — pages, layouts, tabs, tags, filters and content:

- The actual content models (`Landing`, `Profile`, `Article` plus the P4/P5/P6
  models) are plain Django models, not Wagtail Pages or snippets; nothing is
  registered in any admin surface (`apps/cms/apps/content/` had no `admin.py`
  in the reviewed branch).
- Wagtail's own dependencies are a thin shell: only three files import wagtail
  (`apps/security/views_totp.py`, `apps/security/wagtail_hooks.py`,
  `apps/security/forms.py`); security middleware, content, media validation,
  the Ninja API and the rebuild trigger are all plain Django.
- The admin UI is English/LTR only; the owner works in Persian/RTL.
- Two Wagtail-session admin surfaces already exist on `main` and are superseded
  by this decision: the site-content admin (PR #24) and the CMS-managed About
  profile admin at `/admin/profiles/` (PR #31, 2026-08-18). Their functionality
  moves into the custom admin during ADM-1; the underlying Django models stay.
- Public published-only `/api/` and `/media/` are already live on production
  (`DEFER-0017` CLOSED, 2026-08-17); this decision does not change public
  exposure.
- The owner's two previous projects built custom admin panels with the exact
  UX now required (dashboard, lists, media picker, composition, translation
  status); those patterns are in `Samples/` and were verified during the
  2026-08-18 review.
- Seeded content must be preserved: seed data lives on `origin/main`
  (`apps/cms/apps/content/data/site_content.py`, `seed_site_content.py`,
  `seeds/profile.seed.json`, migrations up to `0006`) and in the production
  PostgreSQL volume; the working branch used for the 2026-08-18 review was
  behind `origin/main`.

## Decision

- **Remove Wagtail from runtime and admin.** The Wagtail shell (`wagtail.*`
  apps, `wagtail_admin_urls`, `wagtail_urls`, `WAGTAIL_*` settings, wagtail
  hooks, and the Wagtail-session admin pages from PR #24 / PR #31) is replaced
  by a dedicated admin. Django, Django Ninja, the custom `User` model,
  content/media/security apps and Postgres stay.
- **New admin = React SPA under `/admin/` + Django Ninja admin APIs under
  `/api/v1/admin/*`**, same-origin, session auth + CSRF, preserving the
  existing security baseline: TOTP login, `MFAEnforcementMiddleware`,
  `AuditLog`, login rate limit, noindex/cache policy.
- **The admin fully manages the site:** content entities, media, page
  composition (Section/Block with layout presets: 1/2/3 columns and column
  ratios), tags and filters, lifecycle workflow, fa/en translation status,
  site settings (navigation, header/footer, design tokens), SEO and the
  contact inbox.
- **Public frontend stays Astro static** with the existing HMAC-signed
  rebuild trigger; public `/api/`/`/media/` published-only exposure stays as-is.
- **Content preservation is non-negotiable:** all admin work branches from
  `origin/main`; seed commands are kept as the idempotent import path; a
  `dumpdata` fixture plus a fresh `infra/backup/taha-platform-backup.sh`
  snapshot are taken before any schema migration; existing fields, slugs,
  locales and lifecycle statuses are not changed.
- **Cutover:** Wagtail keeps serving `/admin/` until ADM-1 replaces it; the
  swap is atomic via Caddy (`handle /admin/*` already points at the CMS) and
  reversible.

## Consequences

- ADR-0002's Wagtail baseline part, ADR-0014, ADR-0020 and ADR-0022 are
  superseded by this decision for the admin surface; their security contracts
  (custom User, Argon2, audit, rate limit, TOTP, noindex, private media
  default) carry over unchanged to the Django-level implementation.
- The work is phased (ADM-0..ADM-6, see `Task-list.md` §17); each phase is
  independently usable, tested and reversible, so the admin improves
  incrementally instead of replacing everything at once.
- Wagtail-related test expectations (`test_security.py` admin.site usage) and
  settings are updated during ADM-0; no content rows or media files are
  migrated between systems — the database remains the single source of truth.
- Estimated effort is 2–4 months of phased work; value starts from ADM-1
  (a real, Persian/RTL, content-managing admin).

## Cutover (2026-08-18)

The custom React admin SPA is now served at `/admin/` in production.  Wagtail admin
has been moved to `/admin-wagtail/` as a fallback path for staff
preview (`/admin-wagtail/preview/`), profile HTML admin, LOGIN_URL, and MFA HTML
rollback. SPA TOTP enrollment (`/admin/security` + `/api/v1/admin/auth/mfa/*`) is
the primary path (LOG-0165 / LOG-0188); Wagtail HTML MFA is rollback-only until
`DEBT-0003` fully closes.

- `Dockerfile.cms` multi-stage build includes a Node.js stage that builds the admin
  frontend and bakes the dist into the CMS image.
- `MFAEnforcementMiddleware` intercepts `/admin-wagtail/` paths only; the SPA handles
  its own OTP via the Ninja `/api/v1/admin/auth/login` endpoint.
- `LOGIN_URL` points to `/admin-wagtail/login/` (Wagtail's Django login view).
- Smoke script checks both `/admin/` (SPA 200) and `/admin-wagtail/login/` (Wagtail 200).
- Rollback: re-point `/admin/` to `include(wagtail_admin_urls)` and remove the SPA
  serving route; Wagtail is still installed and functional.
- Uninstall progress (LOG-0188): RichTextField → TextField; local HTML sanitizer;
  content snippet viewsets retired. Wagtail remains in `INSTALLED_APPS` (`DEBT-0003` PARTIAL).
