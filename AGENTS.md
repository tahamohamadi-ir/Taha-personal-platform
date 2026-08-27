# Agent and Developer Contract

Read this file first, then **`Assets/site-redesign/implementation-reference/README.md`** — it is the canonical next-generation frontend brief (P14 ATLAS, branch `p14c-visual-atlas`, commit `7d9b87f`) — then **`docs/README.md`** — it is the documentation entry point and tells you which file owns which fact, where to record outcomes, and when to stop.

Then read `PROJECT_MANIFEST.md`, the active Task Spec (`docs/plan/README.md`), and
only the contract cards your task needs:
`docs/contracts/IA-CONTRACT.md` for routing and URLs,
`docs/contracts/DESIGN-CONTRACT.md` for visual and token rules.

`docs/design.md` and `docs/user-journey-information-architecture.md` are **history / deep reference**. Do not read them end to end; the contract cards restate their binding rules for current runtime. Next-generation design intent is now owned by `Assets/site-redesign/implementation-reference/MASTER-SPEC.md` and `Assets/site-redesign/implementation-reference/agent-kit/*.json` (see `DOCUMENT-MIGRATION-MAP.md`). For tokens, `MASTER-SPEC.md` outranks `reDesign_plan.md` §12–13 when they conflict.

## Current gate

**P14 / ATLAS — next-generation frontend brief is canonical (planning, not live).** The public frontend will be **rebuilt from scratch in `apps/web/` as Astro + TypeScript + Tailwind v4 + React islands**, based exclusively on `Assets/site-redesign/implementation-reference/` (read order: `README.md` → `MASTER-SPEC.md` §1–6, §11 → `AGENT-COORDINATION.md` → `MULTI-AGENT-TASK-LIST.md` global constraints + execution board → `agent-kit/*.json` + `ACCEPTANCE-GATES.md`). Reference package: branch `p14c-visual-atlas`, commit `7d9b87f` (`7d9b87f3c2b04542e13c189adab3b57f2108d84a`) — `Assets/site-redesign/implementation-reference/` is the brief. **No P14 frontend rebuild has started; the reference is planning/handoff, not live.** Existing live routes and CMS projections below remain current runtime until a P14 packet is accepted and merged.

Staging remains **decommissioned** (ADR-0025). Deploy still requires **CI green (web + cms) + production smoke** (`/admin/login/` + `/staff/login/` + `/health/` / `/health.json`). Development and deployment happen directly on `tahamohamadi.ir`. **Public pages stay no-JS readable; React remains an island, not the public-site shell** (MASTER-SPEC §2–3, §9).

**Frontend / admin separation is invariant (ADR-0026):** `apps/web` (public Astro frontend) and `apps/cms` + `apps/admin` (custom React admin SPA at `/admin/`, Django staff HTML at `/staff/` under `LOGIN_URL`) remain **separate projects, separate builds, separate routes**. No shared writable worktree, no merged bundle. The local-only Visual Atlas (`DESIGN_ATLAS=1` → `/_design/`) imports production components for review; it is **never a second library, never a content source, and never in a default production build**.

**Public `/api/` and `/media/` remain published-only projections (live, 2026-08-17, `DEFER-0017` CLOSED).** Caddy proxies Ninja JSON for articles, research, and projects only when published; `/media/` is proxied as `is_active` only for anonymous. Contact persistence, media *upload*, drafts, private notes, phone/personal Gmail, and inactive assets are never exposed. Loopback rebuild: `rebuild-static.sh` until Caddy web cutover; after cutover use `rebuild-web.sh` (LOG-0173).

**P3 CMS runtime (live):** Compose `taha-cms`; admin SPA at `/admin/` served by the independent `apps/admin` container (ADR-0032, ADM-1 cutover LOG-0163, S5 production cutover 2026-08-25 / LOG-0251); Django staff HTML at `/staff/` (LOGIN_URL, preview, MFA fallback — Wagtail removed, `DEBT-0003` CLOSED / LOG-0193); `/static/*` proxied; `/health/` CMS JSON; `/health.json` static; TOTP enrolled (`RISK-0009` CLOSED). Hashed TOTP recovery codes are in repo (`DEFER-0015` CLOSED; owner rebuild still needed to use them on production). Staff draft preview is `/staff/preview/`; public share tokens at `/preview/share/<token>/` (DEFER-0016 CLOSED, LOG-0204). **`RISK-0003` CLOSED** (2026-08-17, LOG-0140). Canonical Caddy: `infra/cms/Caddyfile.cms.snippet` / `infra/caddy/Caddyfile`.

**P4–P6 public routes (live):** `/{locale}/writing/`, `/{locale}/research/`, `/{locale}/projects/`. Header/footer may link those destinations because they exist. `/{locale}/blog/` permanently redirects to the writing tree (IA writing-canonical). RSS/Atom is `/{locale}/writing/rss.xml` (`DEFER-0018` CLOSED).

**P8 catalog routes (live, LOG-0216):** `/{locale}/publications/`, `/{locale}/books/`, `/{locale}/talks/`, `/{locale}/downloads/` (+ detail slugs). Empty-honest until CMS content. Legacy `/{locale}/research/publications/{slug}/` permanently redirects to `/{locale}/publications/{slug}/`. Search: `/{locale}/search/` (Pagefind, Wave 5).

**CMS image `116c241` (live, 2026-08-23, LOG-0216):** attended `cd-cms-migrate.sh` applied `content.0013` + `content.0014`; web rebuilt as `taha-web:local`. Previous pin examples (`b6bea6a`, `65d6c91`, `e2cd1b6`) are historical. Smoke uses `/admin/login/` + `/staff/login/`.

**Runtime target (ADR-0027 + ADR-0032):** one Compose project `taha-cms` — `db`, `cms`, `web` (nginx serving Astro HTML), **`caddy`** (profile `edge`, live TLS since LOG-0210). Old `/opt/taha/repository` `taha-prod-*` stack **gone** (LOG-0216). Host systemd Caddy inactive/disabled. Keep `CMS_CD_AUTO_MIGRATE` unset. Public pages stay no-JS. Active specs: `docs/plan/README.md`. Master plan: `docs/plan/custom-admin-rebuild-fa.md`.

**CMS-managed About + custom admin (merged 2026-08-18, PR #31):** Typed Profile aggregate, public Django views at `/api/profiles/<locale>` and `/api/profiles/<locale>/<slug>`. Nested profile write remains `GET/PUT /api/admin/profiles/<locale>/<slug>` (CSRF + TOTP + `If-Match` revision) and is edited from the React SPA. Astro About builds from that API when `CMS_API_BASE` is set; committed `profile.snapshot.json` is **local/offline only** (unset base). With base set, transport/5xx/timeout fails `npm run build` — no silent snapshot as live CMS (ADR-0027 Slice 3). Gated detail routes: `/{locale}/about/{section}/` and `/{locale}/about/{section}/{slug}/` only when a child row has a Latin slug and a non-empty detail body. Local HTTP preview sign-off is `DEFER-0022`.

**Custom admin rebuild (ADR-0026 + ADR-0032):** independent `apps/admin` SPA image under `/admin/` (Caddy ? `admin:80`; Django keeps `ADMIN_SPA_ROOT` env fallback for e2e/transition only) + Django Ninja `/api/v1/admin/*` (session+CSRF+TOTP+audit+rate-limit). ADM-1 cutover is done (`DEFER-0023` CLOSED); S5 independent-admin cutover done 2026-08-25 (`infra/deploy/s5-admin-cutover.sh`, LOG-0251). Wagtail package removed (`DEBT-0003` CLOSED / LOG-0193); staff HTML under `/staff/`. Public frontend stays Astro static; public published-only `/api/`/`/media/` unchanged (`/media/` is `is_active` only for anonymous). Blog articles may attach a published composition **story** body (`docs/plan/archive/pending/blog-story-composition-task-spec.md`). **Content preservation is non-negotiable:** branch from `origin/main`; dumpdata + backup before schema migration; fields/slugs/locales/statuses unchanged. Phases ADM-0..ADM-6: `Task-list.md` §17.

## Ownership

- `apps/web/`: public frontend only. Next-gen rebuild is Astro + TypeScript + Tailwind v4 + React islands from `Assets/site-redesign/implementation-reference/`; the conditional Visual Atlas (`DESIGN_ATLAS=1` → `/_design/`) is **local-only and must not appear in a default production build** (no atlas route, fixtures, or nav in `npm run build` output).
- `apps/cms/`: Django/Ninja only (Wagtail removed per ADR-0026; `DEBT-0003` CLOSED).
- `infra/`: deploy, Caddy, Compose and backup only.
- `docs/`: policies, ADRs, planning and status only.
- `.github/`: GitHub Actions and repository automation only.
- `Assets/site-redesign/implementation-reference/`: **next-gen frontend brief only** (planning/handoff, not live runtime) — `MASTER-SPEC.md`, `agent-kit/*.json`, `AGENT-COORDINATION.md`, `MULTI-AGENT-TASK-LIST.md`, `ACCEPTANCE-GATES.md`. Authority is brief ownership; runtime authority remains `apps/web/src/styles/global.css` and the merged source until a packet is accepted.

Do not recreate `frontend/` or `backend/`; the canonical paths are `apps/web/` and `apps/cms/`.

Do not invent a new infrastructure service (Redis, Celery, OpenSearch, Neo4j, Kubernetes, self-hosted runner, or other always-on service) — VPS is Compose `taha-cms` + Caddy + static web only per `PROJECT_MANIFEST.md`.

## Non-negotiable contracts

- Public root is a Language Gateway; `/fa/` and `/en/` are direct locale roots. Persian and English content, slug, SEO and status are independent but linked.
- Main public content remains readable without JavaScript. React is an island, not the public-site shell. The Visual Atlas is local-only; default production output is atlas-free.
- Do not invent endpoints, DTO fields, models, metrics, content, translations, secret values or service choices.
- Public projections never expose drafts, private media, internal notes, credentials or inactive assets.
- Every work item has a Task Spec and every actual action receives a `WORK_LOG.md` entry. Deferred work must have an ID in `deferred-validation.md`.
- Never print, commit, log or screenshot secrets. Report exposure as a Risk Register entry without repeating the secret.

## Verified tooling and commands

Use the commands and versions in `PROJECT_MANIFEST.md`. The default `python` command currently resolves to a Hermes-owned interpreter and is not the project interpreter. When an authorized CMS bootstrap begins, install/use the latest supported Python 3.12 patch and create a project-local `.venv` with `uv`.

`DESIGN_ATLAS=1` is the **local-only** Visual Atlas launcher (`npm run atlas` via `apps/web/scripts/design-atlas.mjs` → conditional `injectRoute` for `/_design/` in `apps/web/astro.config.mjs`). Default `npm run build` must not contain `/_design/`, atlas fixtures, or atlas navigation. Validate the kit with `node Assets/site-redesign/implementation-reference/agent-kit/validate.mjs`.

## CI and deployment

GitHub Actions hosted runners are the CI baseline. Do not install Gitea or a self-hosted runner on the production VPS. No deployment occurs without owner approval, a documented rollback path and passing release gate (CI green for `web` + `cms` plus production smoke).
