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

**P3 CMS runtime (live):** Compose `taha-cms`; custom React admin SPA at `/admin/` (ADM-1 cutover, LOG-0163); Wagtail fallback at `/admin-wagtail/` (TOTP enrollment HTML, staff preview, rollback); `/static/*` proxied; `/health/` CMS JSON; `/health.json` static; TOTP enrolled (`RISK-0009` CLOSED). Hashed TOTP recovery codes are in repo (`DEFER-0015` CLOSED; owner rebuild still needed to use them on production). Staff draft preview is `/admin-wagtail/preview/` (`DEFER-0016` for public share tokens). **`RISK-0003` CLOSED** (2026-08-17, LOG-0140). Canonical Caddy: `infra/cms/Caddyfile.cms.snippet`.

**Public `/api/` (live, 2026-08-17):** Caddy proxies published-only Ninja JSON for articles, research, and projects (`DEFER-0017` CLOSED). `/media/` is proxied; contact persistence and media *upload* stay unpublished. Loopback rebuild: `rebuild-static.sh` until Caddy web cutover; after cutover use `rebuild-web.sh` (LOG-0173).

**P4–P6 public routes (live):** `/{locale}/blog/`, `/{locale}/research/`, `/{locale}/projects/`. Header/footer may link those destinations because they exist. Canonical IA writing URL remains `/{locale}/writing/`; the shipped public tree is `/{locale}/blog/` until a writing-canonical redirect ships. RSS/Atom is `DEFER-0018`.

**CMS image `b6bea6a` (live, 2026-08-19):** owner `prod-cms-update-migrate.sh`; `content.0008` + `composition.0002` applied. Blog story editor is on article edit. `smoke-cms.sh` `/admin-wagtail/accounts/login/` FAIL was a script bug (real path `/admin-wagtail/login/`).

**Runtime target (ADR-0027):** one Compose project — `db`, `cms`, `web` (nginx serving Astro HTML, no public Node/React), then `caddy`. Host Caddy remains edge until owner completes `DEFER-0031` cutover (Compose `caddy` profile `edge` is in repo; LOG-0191 / `RISK-0013`). Slice 1 cutover is **live**; Slice 2 gated CD CMS migrate attended path **PASS** (LOG-0179; keep `CMS_CD_AUTO_MIGRATE` unset). Public pages stay no-JS. Active specs: `docs/plan/cms-origin-and-full-stack-cd-task-spec.md` (Slice 3 / Slice 4 cutover next), `docs/plan/ADM-6-frontend-wiring-task-spec.md` (PARTIAL). Master plan: `docs/plan/custom-admin-rebuild-fa.md`.

**CMS-managed About + custom admin (merged 2026-08-18, PR #31):** Typed Profile aggregate, public Django views at `/api/profiles/<locale>` and `/api/profiles/<locale>/<slug>`. Nested profile write remains `GET/PUT /api/admin/profiles/<locale>/<slug>` (CSRF + TOTP + `If-Match` revision) and is edited from the React SPA. Astro About builds from that API with committed `profile.snapshot.json` fallback (Slice 3 will stop treating that as live). Gated detail routes: `/{locale}/about/{section}/` and `/{locale}/about/{section}/{slug}/` only when a child row has a Latin slug and a non-empty detail body. Local HTTP preview sign-off is `DEFER-0022`.

**Custom admin rebuild (ADR-0026):** React SPA under `/admin/` + Django Ninja `/api/v1/admin/*` (session+CSRF+TOTP+audit+rate-limit). ADM-1 cutover is done (`DEFER-0023` CLOSED): Wagtail is at `/admin-wagtail/` until ADM-0 finishes TOTP-in-SPA and schema replacement (`DEBT-0003` — RichText + `wagtailimages` still block uninstall). Public frontend stays Astro static; public published-only `/api/`/`/media/` unchanged (`/media/` is `is_active` only for anonymous). Blog articles may attach a published composition **story** body (`docs/plan/blog-story-composition-task-spec.md`). **Content preservation is non-negotiable:** branch from `origin/main`; dumpdata + backup before schema migration; fields/slugs/locales/statuses unchanged. Phases ADM-0..ADM-6: `Task-list.md` §17.

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
