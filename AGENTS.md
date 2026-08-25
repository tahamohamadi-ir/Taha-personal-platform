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

**P3 CMS runtime (live):** Compose `taha-cms`; admin SPA at `/admin/` served by the **independent `apps/admin` container** (ADR-0032, S5 cutover 2026-08-25 / LOG-0251); Django staff HTML at `/staff/` (LOGIN_URL, preview — Wagtail removed, `DEBT-0003` CLOSED / LOG-0193); `/static/*` proxied; `/health/` CMS JSON; `/health.json` static; TOTP enrolled (`RISK-0009` CLOSED). Hashed TOTP recovery codes are in repo (`DEFER-0015` CLOSED; owner rebuild still needed to use them on production). Staff draft preview is `/staff/preview/`; public share tokens at `/preview/share/<token>/` (DEFER-0016 CLOSED, LOG-0204). **`RISK-0003` CLOSED** (2026-08-17, LOG-0140). Canonical Caddy: `infra/caddy/Caddyfile.compose` (live edge) / `infra/cms/Caddyfile.cms.snippet`.

**Public `/api/` (live, 2026-08-17):** Caddy proxies published-only Ninja JSON for articles, research, and projects (`DEFER-0017` CLOSED). `/media/` is proxied; contact persistence and media *upload* stay unpublished. Web rebuilds: `cd-rebuild-web.sh` (owner-attended, post-migrate publish path).

**P4–P6 public routes (live):** `/{locale}/writing/`, `/{locale}/research/`, `/{locale}/projects/`. Header/footer may link those destinations because they exist. `/{locale}/blog/` permanently redirects to the writing tree (IA writing-canonical). RSS/Atom is `/{locale}/writing/rss.xml` (`DEFER-0018` CLOSED). Home v2 (Glass Constellation) is live: Hero + PerspectiveGrid + FocusStrip + EvidenceSection + WritingLatest + ContactCTA (sections/ composition); Journey slot reserved.

**P8 catalog routes (live, LOG-0216):** `/{locale}/publications/`, `/{locale}/books/`, `/{locale}/talks/`, `/{locale}/downloads/` (+ detail slugs). Empty-honest until CMS content. Legacy `/{locale}/research/publications/{slug}/` permanently redirects to `/{locale}/publications/{slug}/`. Search: `/{locale}/search/` (Pagefind, Wave 5).

**CMS image `116c241` (live, 2026-08-23, LOG-0216):** attended `cd-cms-migrate.sh` applied `content.0013` + `content.0014`; web rebuilt as `taha-web:local`. Previous pin examples (`b6bea6a`, `65d6c91`, `e2cd1b6`) are historical. Smoke uses `/admin/login/` + `/staff/login/`.

**Runtime target (ADR-0027 + ADR-0032):** one Compose project `taha-cms` — `db`, `cms`, `web` (nginx serving Astro HTML), **`admin`** (independent admin SPA, ADR-0032), **`caddy`** (profile `edge`, live TLS since LOG-0210). Old `/opt/taha/repository` `taha-prod-*` stack **gone** (LOG-0216). Host systemd Caddy inactive/disabled. Keep `CMS_CD_AUTO_MIGRATE` unset. Public pages stay no-JS. Active specs: `docs/plan/README.md`. Admin rebuild history: `docs/plan/custom-admin-rebuild-fa.md` (historical).

**CMS-managed About + custom admin (merged 2026-08-18, PR #31):** Typed Profile aggregate, public Django views at `/api/profiles/<locale>` and `/api/profiles/<locale>/<slug>`. Nested profile write remains `GET/PUT /api/admin/profiles/<locale>/<slug>` (CSRF + TOTP + `If-Match` revision) and is edited from the React SPA. Astro About builds from that API when `CMS_API_BASE` is set; committed `profile.snapshot.json` is **local/offline only** (unset base). With base set, transport/5xx/timeout fails `npm run build` — no silent snapshot as live CMS (ADR-0027 Slice 3). Gated detail routes: `/{locale}/about/{section}/` and `/{locale}/about/{section}/{slug}/` only when a child row has a Latin slug and a non-empty detail body. Local HTTP preview sign-off is `DEFER-0022`.

**Custom admin rebuild (ADR-0026 + ADR-0032):** React SPA is the **independent `apps/admin/` project** (own Dockerfile/nginx image, `ci-admin.yml`, compose `admin` service) served at `/admin/` via Caddy → `admin:80`; Django Ninja `/api/v1/admin/*` (session+CSRF+TOTP+audit+rate-limit). ADM-1 cutover done (`DEFER-0023` CLOSED); S5 production cutover done 2026-08-25 (`infra/deploy/s5-admin-cutover.sh`, LOG-0251). Django keeps an `ADMIN_SPA_ROOT` env fallback for e2e/transition only. Wagtail package removed (`DEBT-0003` CLOSED / LOG-0193); staff HTML under `/staff/`. Public frontend stays Astro static; public published-only `/api/`/`/media/` unchanged. Blog articles may attach a published composition **story** body (`docs/plan/archive/pending/blog-story-composition-task-spec.md`). **Content preservation is non-negotiable:** branch from `origin/main`; dumpdata + backup before schema migration; fields/slugs/locales/statuses unchanged. Phases ADM-0..ADM-6: `Task-list.md` §17.

## Ownership

- `apps/web/`: public frontend only.
- `apps/admin/`: admin SPA project (independent since ADR-0032 — own build, image and CI; served at `/admin/`).
- `apps/cms/`: Django/Ninja only (Wagtail removal authorized per ADR-0026).
- `infra/`: deploy, Caddy, Compose and backup only.
- `docs/`: policies, ADRs, planning and status only.
- `.github/`: GitHub Actions and repository automation only.

Do not recreate `frontend/` or `backend/`; the canonical paths are `apps/web/`, `apps/admin/` and `apps/cms/`.

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

GitHub Actions hosted runners are the CI baseline: `ci.yml` (web), `ci-admin.yml` (admin SPA), `ci-cms.yml` (+ Playwright content lifecycle), `ci-cms-image.yml`, `cd.yml`. Do not install Gitea or a self-hosted runner on the production VPS. No deployment occurs without owner approval, a documented rollback path and passing release gate.
