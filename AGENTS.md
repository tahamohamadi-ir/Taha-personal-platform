# Agent and Developer Contract

Read this file first, then **`docs/README.md`** — it is the documentation entry point
and tells you which file owns which fact, where to record outcomes, and when to stop.

Then read `PROJECT_MANIFEST.md`, the active Task Spec (`docs/plan/README.md`), and
only the contract cards your task needs:
`docs/contracts/IA-CONTRACT.md` for routing and URLs,
`docs/contracts/DESIGN-CONTRACT.md` for visual and token rules.

`docs/design.md` and `docs/user-journey-information-architecture.md` are deep
reference. Do not read them end to end; the contract cards restate their binding rules.

## Current gate

P0-G0 is **PASS for static-only P1** (2026-08-14). Staging is decommissioned (ADR-0025). Deploy requires CI green (web + cms) + production smoke. Development and deployment happen directly on `tahamohamadi.ir`.

**P3 CMS runtime (live):** Compose `taha-cms`; Wagtail `/admin/login/`; `/static/*` proxied; `/health/` CMS JSON; `/health.json` static; TOTP enrolled (`RISK-0009` CLOSED). Hashed TOTP recovery codes are in repo (`DEFER-0015` CLOSED; owner rebuild still needed to use them on production). Staff draft preview is `/admin/preview/` (`DEFER-0016` for public share tokens). **`RISK-0003` CLOSED** (2026-08-17, LOG-0140). Canonical Caddy: `infra/cms/Caddyfile.cms.snippet`.

**Public `/api/` (live, 2026-08-17):** Caddy proxies published-only Ninja JSON for articles, research, and projects (`DEFER-0017` CLOSED). `/media/` is proxied; contact persistence and media *upload* stay unpublished. Loopback static rebuild: `infra/deploy/rebuild-static.sh`.

**P4–P6 public routes (live):** `/{locale}/blog/`, `/{locale}/research/`, `/{locale}/projects/`. Header/footer may link those destinations because they exist. Canonical IA writing URL remains `/{locale}/writing/`; the shipped public tree is `/{locale}/blog/` until a writing-canonical redirect ships. RSS/Atom is `DEFER-0018`.

**CMS-managed About + custom admin (merged 2026-08-18, PR #31):** Typed Profile aggregate, public Django views at `/api/profiles/<locale>` and `/api/profiles/<locale>/<slug>`, same-origin admin at `/admin/profiles/` inside the Wagtail session (CSRF + TOTP + `If-Match` revision). Astro About builds from that API with committed `profile.snapshot.json` fallback. Gated detail routes: `/{locale}/about/{section}/` and `/{locale}/about/{section}/{slug}/` only when a child row has a Latin slug and a non-empty detail body. **Production CMS still needs owner `migrate` through `0005`/`0006` and `import_profile_seed` before `/admin/profiles/` and live `/api/profiles/<locale>/about` return the seeded bilingual profile.** Until then the static site uses the snapshot. Local HTTP preview sign-off is `DEFER-0022`.

**Custom admin rebuild (2026-08-18, owner-authorized, ADR-0026):** Wagtail is being removed from runtime and admin; the replacement is a dedicated React SPA under `/admin/` + Django Ninja admin APIs under `/api/v1/admin/*`, keeping the existing Django-level security baseline (session+CSRF+TOTP+audit+rate-limit). The Wagtail-session admin surfaces (`/admin/profiles/` PR #31, site content admin PR #24) are superseded and move into the React admin during ADM-1. Public frontend stays Astro static with the HMAC rebuild trigger; public published-only `/api/`/`/media/` exposure is unchanged. **Content preservation is non-negotiable:** all admin work branches from `origin/main` (seed data and P4–P6 models live there), a `dumpdata` fixture + fresh backup precede any schema migration, and existing fields/slugs/locales/statuses are unchanged. Wagtail keeps serving `/admin/` until ADM-1 cutover. Phases ADM-0..ADM-6 are defined in `Task-list.md` §17; each phase gets its own Task Spec. Master plan: `docs/plan/custom-admin-rebuild-fa.md`.

## Ownership

- `apps/web/`: public frontend only.
- `apps/cms/`: Django/Ninja only (Wagtail removal authorized per ADR-0026; custom React admin SPA lives under `apps/cms/admin-frontend/` once scaffolded).
- `infra/`: deploy, Caddy, Compose and backup only.
- `docs/`: policies, ADRs, planning and status only.
- `.github/`: GitHub Actions and repository automation only.

Do not recreate `frontend/` or `backend/`; the canonical paths are `apps/web/` and `apps/cms/`.

## Non-negotiable contracts

- Public root is a Language Gateway; `/fa/` and `/en/` are direct locale roots. Persian and English content, slug, SEO and status are independent but linked.
- Main public content remains readable without JavaScript. React is an island, not the public-site shell.
- Do not invent endpoints, DTO fields, models, metrics, content, translations, secret values or service choices.
- Public projections never expose drafts, private media, internal notes, credentials or inactive assets.
- Every work item has a Task Spec and every actual action receives a `WORK_LOG.md` entry. Deferred work must have an ID in `deferred-validation.md`.
- Never print, commit, log or screenshot secrets. Report exposure as a Risk Register entry without repeating the secret.

## Verified tooling and commands

Use the commands and versions in `PROJECT_MANIFEST.md`. The default `python` command currently resolves to a Hermes-owned interpreter and is not the project interpreter. When an authorized CMS bootstrap begins, install/use the latest supported Python 3.12 patch and create a project-local `.venv` with `uv`.

## CI and deployment

GitHub Actions hosted runners are the CI baseline. Do not install Gitea or a self-hosted runner on the production VPS. No deployment occurs without owner approval, a documented rollback path and passing release gate.
