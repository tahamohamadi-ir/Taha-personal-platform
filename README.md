# Taha Personal Platform

Bilingual Persian/English personal research, professional and knowledge platform for Taha Mohammadi, live at https://tahamohamadi.ir. The public root is a Language Gateway (`/`) with direct locale roots `/fa/` (RTL) and `/en/` (LTR); all public content is static-first and readable without JavaScript, served as a versioned artifact by Caddy from `/opt/taha/site/current`. This repository is a monorepo: `apps/web/` is the Astro static public frontend, `apps/cms/` is the Django/Ninja CMS (Compose `taha-cms`), `infra/` holds deploy scripts and the CMS Compose stack, and `docs/` holds policies, ADRs, task specs and status ledgers. Source of truth for product, environments and commands: [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md).

> **Next generation (planning, not live):** The public frontend will be **rebuilt from scratch in `apps/web/` as Astro 7 + TypeScript 5.9 + Tailwind CSS v4 + React 19 islands** from the canonical brief at [`Assets/site-redesign/implementation-reference/README.md`](Assets/site-redesign/implementation-reference/README.md) (branch `p14c-visual-atlas`, commit `7d9b87f` — `7d9b87f3c2b04542e13c189adab3b57f2108d84a`). That directory is **planning/handoff only** — no token, component, template, or route from it is live. Existing `apps/web` static routes remain current runtime until an ATLAS packet is accepted and merged. See [docs/plan/README.md](docs/plan/README.md) and [`docs/plan/ATLAS-frontend-rebuild-task-spec.md`](docs/plan/ATLAS-frontend-rebuild-task-spec.md).

## Architecture overview

| Layer | Stack | Location | Status |
|---|---|---|---|
| **Public frontend** | **Astro 7 + TypeScript 5.9 + Tailwind CSS v4 + React 19 islands** — dual-theme Design System (24 components + 6 templates per `agent-kit/*.json`), semantic Astro shell, React only as progressive-enhancement islands. Public pages stay no-JS readable (MASTER-SPEC §2–3, §9). | `apps/web/` | **Rebuild from scratch per `Assets/site-redesign/implementation-reference/` — NOT STARTED.** Current runtime is the existing static build (Language Gateway + `/fa/` + `/en/` + P4–P6 + P8 catalogs + `/search/` Pagefind + CMS-managed About gated details). Next-gen adoption is packetized as ATLAS-00..12 per `MULTI-AGENT-TASK-LIST.md`. |
| **Backend / CMS** | Python 3.12.13 + Django 5.2.9 LTS + Django Ninja 1.6.2 + PostgreSQL 17 — custom React admin SPA at `/admin/` + Django staff HTML at `/staff/` (`LOGIN_URL`, preview, MFA fallback — Wagtail removed, `DEBT-0003` CLOSED) | `apps/cms/` (+ `apps/cms/admin-frontend/`) — Compose project `taha-cms` (`db` + `cms` + `web` nginx + `caddy` profile `edge`, live TLS) | **Live (2026-08-23, image `116c241`, `content.0013` + `content.0014`).** Public projections `/api/` + `/media/` are published-only (`is_active` for anonymous; `DEFER-0017` CLOSED). Contact persistence, drafts, private media, phone/personal Gmail, and inactive assets are never exposed. |
| **Visual Atlas** | Local-only conditional Astro integration — `DESIGN_ATLAS=1` → `/_design/` via `apps/web/scripts/design-atlas.mjs` + `injectRoute` in `apps/web/astro.config.mjs`. Imports production components/tokens; never a second library, never a content source. | `apps/web/src/design-atlas/` (created by ATLAS-06) | **Local-only, not in default production build.** Default `npm run build` must not contain `/_design/`, atlas fixtures, or atlas navigation. |

### Invariant — frontend / admin separation (ADR-0026)

> `apps/web` (public Astro frontend, including the local-only Visual Atlas) and `apps/cms` + `apps/cms/admin-frontend` (custom React admin SPA + Django staff HTML) remain **separate projects, separate builds, separate routes**. No shared writable worktree, no merged bundle. This invariant must not be violated. The Visual Atlas is never deployed; it imports production components for review only.

Current runtime token authority is `apps/web/src/styles/global.css`. Next-gen token intent is `Assets/site-redesign/implementation-reference/agent-kit/tokens.json` (Light `runtime-authoritative`, Dark `design-target`); `MASTER-SPEC.md` outranks `reDesign_plan.md` §12–13 on conflicts (see [DOCUMENT-MIGRATION-MAP.md](Assets/site-redesign/implementation-reference/DOCUMENT-MIGRATION-MAP.md)). CMS-managed About is live (PR #31): typed Profile aggregate at `/api/profiles/<locale>`; Astro About builds from `CMS_API_BASE` when set, otherwise `profile.snapshot.json` (local/offline only).

## Repository layout

```text
apps/web/       Astro 7 + TypeScript static public frontend (Language Gateway, /fa/ + /en/ landing, about, cv, 404, health, robots, sitemap)
                — next-gen rebuild target per Assets/site-redesign/implementation-reference/ (ATLAS-00..12, not started)
apps/cms/       Django 5.2.9 / Django Ninja 1.6.2 / psycopg 3.3.4 on Python 3.12.13 — runtime on 127.0.0.1:18000
apps/cms/admin-frontend/  React SPA → /admin/ (ADM-1 cutover, LOG-0163)
infra/deploy/   versioned artifact switch (update-release.sh), smoke.sh, update-cms.sh, smoke-cms.sh
infra/cms/      CMS Compose + Dockerfile + Caddy snippet (apply `/static*` before file_server)
infra/caddy/    static-site Caddy config candidate
infra/backup/   restic/rclone backup timer and .env.example
Assets/site-redesign/implementation-reference/  next-gen frontend brief only — MASTER-SPEC.md, agent-kit/*.json, AGENT-COORDINATION.md, MULTI-AGENT-TASK-LIST.md, ACCEPTANCE-GATES.md (planning/handoff, not live; branch p14c-visual-atlas 7d9b87f)
docs/adr/       accepted/proposed architecture decisions (ADR-0002..0029 + index)
docs/governance/ release, deploy, backup, server-access and documentation policies and runbooks
docs/contracts/ IA-CONTRACT.md + DESIGN-CONTRACT.md (current runtime contracts; next-gen in MASTER-SPEC + agent-kit)
docs/status/    WORK_LOG, RISK_REGISTER, deferred-validation, TECH_DEBT, known-issues, CHANGELOG, BACKLOG
docs/plan/      active Task Spec index + ATLAS packets (see docs/plan/README.md)
docs/design.md  history / deep reference (superseded by MASTER-SPEC + agent-kit)
.github/        GitHub Actions workflows: ci.yml (web) and ci-cms.yml (CMS)
PROJECT_MANIFEST.md  product, approved baseline, environments, canonical commands
AGENTS.md       agent and developer contract, ownership boundaries, current gate (P14 ATLAS)
Task-list.md    phased implementation plan (P0-G0 → ATLAS)
```

New public assets: header logo `apps/web/public/logo.png` and CV/Resume downloads `apps/web/public/downloads/*.md`, served on `/fa/cv/` and `/en/cv/`. `apps/web/` and `apps/cms/` are the canonical paths; do not recreate `frontend/` or `backend/`.

## Getting started

Prerequisites: Node 24 + npm for `apps/web/`; `uv` + Python 3.12 for `apps/cms/`. The default `python` command resolves to a Hermes-owned interpreter and is not the project interpreter — always use `uv`.

### Web — current runtime (`apps/web/`)

```powershell
npm install        # reproducible install from package-lock.json
npm run check      # astro check (typecheck) — 0 errors / 0 warnings
npm run build      # astro build — static output in dist/ (default build must NOT contain /_design/)
npm run preview    # serve the built artifact locally
npm audit          # dependency security scan
```

### Web — next-generation reference validation

The reference package is planning/handoff, not live. Validate it before any ATLAS packet:

```powershell
# from repository root
node Assets/site-redesign/implementation-reference/agent-kit/validate.mjs
# expected: PASS — 24 components, 6 templates, 10 asset references, offline Figma builder (ATLAS-00 gate G0)

# local-only Visual Atlas (never in default production build)
npm run atlas                                   # launches Astro with DESIGN_ATLAS=1 via apps/web/scripts/design-atlas.mjs
DESIGN_ATLAS=1 npm run build                    # atlas-present build (local only) — verify default build stays atlas-free
```

No work packet is executable until the integration lead activates its repository Task Spec (`Assets/site-redesign/implementation-reference/AGENT-COORDINATION.md` §6; see [`docs/plan/README.md`](docs/plan/README.md)).

### CMS (`apps/cms/`, with `$env:DJANGO_SETTINGS_MODULE = "config.settings.test"`)

```powershell
uv sync --python 3.12                    # reproducible install from pyproject.toml + uv.lock
uv run ruff check .                      # lint
uv run python manage.py check           # Django system check
uv run python manage.py makemigrations --check --dry-run   # migration consistency
uv run pytest -q                        # test suite
```

## CI/CD and deployment

- `ci.yml` (web): Node 24; `npm ci` → `npm run check` → `npm run build` → build fingerprint → local-preview smoke via `infra/deploy/smoke.sh` → Playwright mobile-overflow and About-tabs regressions → `npm audit` → artifact completeness and no-secret check → artifact upload.
- `ci-cms.yml` (CMS): `uv sync --python 3.12` → `manage.py check` → `makemigrations --check --dry-run` → `ruff check` → `pytest` → `manage.py test` → `git diff --check` → secret scan.
- Artifact deploy mechanics: build a static artifact from a clean HEAD, upload it to the VPS, then run `sudo /opt/taha/bin/update-release.sh` (repo copy: [infra/deploy/update-release.sh](infra/deploy/update-release.sh)), which switches the `/opt/taha/site/current` symlink atomically; the deployed Caddy snippet `taha_application_routes` serves that root, so no Caddy reload is needed and the previous release stays on disk for rollback. Production smoke: `infra/deploy/smoke.sh https://tahamohamadi.ir` (7 PASS).
- Release gate: CI green on `main` (web + cms workflows) plus production smoke only; no deploy without owner approval and a documented rollback path. Rollback and release mechanics: [DEPLOY_RUNBOOK.md](docs/governance/DEPLOY_RUNBOOK.md) and [RELEASE_POLICY.md](docs/governance/RELEASE_POLICY.md).
- Runtime target (ADR-0027): one Compose project `taha-cms` (`db` + `cms` + `web` nginx + `caddy` profile `edge`, live TLS since LOG-0210). Old `/opt/taha/repository` `taha-prod-*` stack gone (LOG-0216). Host systemd Caddy inactive/disabled. Keep `CMS_CD_AUTO_MIGRATE` unset.
- Staging is decommissioned (ADR-0025, 2026-08-15): `staging.tahamohamadi.ir` has no Caddy block or DNS record; development and deployment happen directly on `tahamohamadi.ir`.
- GitHub Actions hosted runners are the CI baseline; no Gitea or self-hosted runner on the production VPS.
- **ATLAS production adoption:** no ATLAS deploy without separate owner approval, backup, rollback, CI + smoke + post-deploy visual QA (`ACCEPTANCE-GATES.md` G9). See [`docs/plan/ATLAS-frontend-rebuild-task-spec.md`](docs/plan/ATLAS-frontend-rebuild-task-spec.md) and `MULTI-AGENT-TASK-LIST.md` global constraints.

## Documentation index

- [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md) — product, approved baseline, environments, canonical verified commands.
- [AGENTS.md](AGENTS.md) — agent and developer contract, ownership boundaries, current gate (P14 ATLAS).
- [Assets/site-redesign/implementation-reference/README.md](Assets/site-redesign/implementation-reference/README.md) — **canonical next-generation frontend brief** (MASTER-SPEC §1–6, §11 + `AGENT-COORDINATION.md` + `MULTI-AGENT-TASK-LIST.md` + `ACCEPTANCE-GATES.md` + `agent-kit/*.json`; branch `p14c-visual-atlas`, commit `7d9b87f`; planning/handoff, not live).
- [Assets/site-redesign/implementation-reference/MASTER-SPEC.md](Assets/site-redesign/implementation-reference/MASTER-SPEC.md) — product, architecture, UX, CMS, a11y and delivery contract (§11 deliverables, §12 non-goals).
- [Assets/site-redesign/implementation-reference/MULTI-AGENT-TASK-LIST.md](Assets/site-redesign/implementation-reference/MULTI-AGENT-TASK-LIST.md) — dependency-aware executable work packets ATLAS-00..12 (global constraints + execution board).
- [Assets/site-redesign/implementation-reference/ACCEPTANCE-GATES.md](Assets/site-redesign/implementation-reference/ACCEPTANCE-GATES.md) — objective gates G0..G9.
- [Assets/site-redesign/implementation-reference/DOCUMENT-MIGRATION-MAP.md](Assets/site-redesign/implementation-reference/DOCUMENT-MIGRATION-MAP.md) — which owner file is reconciled when (ATLAS-12).
- [docs/README.md](docs/README.md) — documentation entry point; read order, ownership table, stop conditions (already rewritten for ATLAS).
- [docs/plan/README.md](docs/plan/README.md) — **active plan index** — ATLAS timeline (ATLAS-00 READY, rest BLOCKED) + archived P1..P11 plans.
- [docs/plan/ATLAS-frontend-rebuild-task-spec.md](docs/plan/ATLAS-frontend-rebuild-task-spec.md) — Task Spec for the frontend rebuild from scratch.
- [docs/adr/README.md](docs/adr/README.md) — ADR index (ADR-0002..0029, including static-first Astro, versioned artifact deploy, admin security boundary, P3 auth/media/rich-text/rebuild/lifecycle, staging decommission, custom admin replacing Wagtail, runtime target).
- [docs/governance/RELEASE_POLICY.md](docs/governance/RELEASE_POLICY.md) — release gate and DoD.
- [docs/governance/DEPLOY_RUNBOOK.md](docs/governance/DEPLOY_RUNBOOK.md) — deploy, smoke and rollback procedure.
- [docs/governance/BACKUP_POLICY.md](docs/governance/BACKUP_POLICY.md) and [docs/governance/BACKUP_RUNBOOK.md](docs/governance/BACKUP_RUNBOOK.md) — encrypted Google Drive backup policy and runbook.
- [docs/governance/SERVER_ACCESS_RUNBOOK.md](docs/governance/SERVER_ACCESS_RUNBOOK.md) — key-only non-root SSH access.
- [docs/governance/DOCUMENTATION_POLICY.md](docs/governance/DOCUMENTATION_POLICY.md) — documentation contract.
- [docs/status/](docs/status/) — ledgers: [WORK_LOG.md](docs/status/WORK_LOG.md), [RISK_REGISTER.md](docs/status/RISK_REGISTER.md), [deferred-validation.md](docs/status/deferred-validation.md), [TECH_DEBT.md](docs/status/TECH_DEBT.md), [known-issues.md](docs/status/known-issues.md), [CHANGELOG.md](docs/status/CHANGELOG.md), [BACKLOG.md](docs/status/BACKLOG.md).
- [docs/contracts/](docs/contracts/) — `IA-CONTRACT.md` (routing/URLs) + `DESIGN-CONTRACT.md` (visual/tokens, current runtime).
- [docs/templates/TASK_SPEC_TEMPLATE.md](docs/templates/TASK_SPEC_TEMPLATE.md) — task specification template.
- [docs/design.md](docs/design.md) — **history / deep reference** (superseded by `MASTER-SPEC.md` + `agent-kit/*.json`).
- [reDesign_plan.md](reDesign_plan.md) — visual redesign draft; executed via ATLAS tokens/components. Its §12–13 hard limits are **outranked by `MASTER-SPEC.md`** for tokens when they conflict.
- [Task-list.md](Task-list.md) — phased implementation plan and progress snapshot (P0-G0 → ATLAS).

## Status snapshot

- Live (2026-08-17/18/23): static site at https://tahamohamadi.ir (Language Gateway, P4–P6 + P8 catalogs + `/search/` Pagefind) plus CMS Compose `taha-cms` (`116c241`, `content.0013` + `content.0014`); public published-only `/api/` + `/media/` live (`DEFER-0017` CLOSED). Custom admin SPA at `/admin/` (ADM-1 cutover, LOG-0163); Django staff HTML at `/staff/` (Wagtail removed, `DEBT-0003` CLOSED / LOG-0193). Evidence: [WORK_LOG.md](docs/status/WORK_LOG.md).
- **P14 ATLAS — next-generation frontend: NOT STARTED.** Reference package `Assets/site-redesign/implementation-reference/` validated (commit `7d9b87f`); no token, component, template, or route from it is live. Existing `apps/web` static remains current runtime until ATLAS packets are accepted and merged. Plan index: [docs/plan/README.md](docs/plan/README.md).
- Open: `RISK-0010/RISK-0011` (admin cutover/content preservation, from ADR-0026); `DEFER-0032` PARTIAL (manual ADM QA remainder). `RISK-0003` CLOSED; `DEFER-0017` CLOSED; `RISK-0009` CLOSED; `DEFER-0015` CLOSED (recovery codes in repo; owner rebuild).

## Security and governance notes

- Never commit, log or screenshot secrets; real credentials live only in the owner's password manager or approved secret store, and exposure is reported as a Risk Register entry without repeating the secret.
- Every work item has a Task Spec (template in `docs/templates/`) and every actual action receives a `WORK_LOG.md` entry; deferred work must have an ID in `deferred-validation.md`.
- Gate rules: no deployment without owner approval, a documented rollback path and a passing release gate; no invented endpoints, DTO fields, models, content, translations, metrics or service choices.
- Non-negotiables: `/` is the Language Gateway with direct `/fa/` and `/en/` roots; main public content stays readable without JavaScript; public projections never expose drafts, private media, internal notes or credentials.
- ATLAS constraints (global): no deploy, migration, or production mutation without a separate owner-approved task and rollback path; default production build must not contain the atlas route or fixtures; do not invent content, routes, fields, metrics, translations or links; use CMS-published locale projections.

## Roadmap

Phased plan in [Task-list.md](Task-list.md) and [docs/plan/README.md](docs/plan/README.md): P0-G0 gate passed, static R1 spine and R2 first live done, P2 About/CV live, P3–P6 CMS/public API live, custom admin rebuild authorized (ADR-0026, phases ADM-0..ADM-6 in Task-list §17; Wagtail removal done), P8–P11 catalogs/search and AI/semantic deferred per plan, **P14 ATLAS next-generation frontend brief is canonical (planning, not live) — rebuild from scratch in `apps/web/` as ATLAS-00..12 packets** (tokens → primitives → shell/gateway → content components → 6 templates → local-only Visual Atlas → route-family adoption → CMS audit → CMS implementation → graph Phase 1 → QA → documentation reconciliation). Owner-filtered queue: [docs/status/BACKLOG.md](docs/status/BACKLOG.md).
