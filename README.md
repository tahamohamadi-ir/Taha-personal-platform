# Taha Personal Platform

Bilingual Persian/English personal research, professional and knowledge platform for Taha Mohammadi, live at https://tahamohamadi.ir. The public root is a Language Gateway (`/`) with direct locale roots `/fa/` (RTL) and `/en/` (LTR); all public content is static-first and readable without JavaScript, served by the Compose Caddy edge. This repository is a modular monorepo: `apps/web/` is the Astro static public frontend (Glass Constellation night identity per ADR-0031), `apps/admin/` is the independent React admin SPA served at `/admin/` (own image + CI, ADR-0032), `apps/cms/` is the Django/Ninja CMS backend (Wagtail removed, `DEBT-0003` CLOSED), `infra/` holds deploy scripts and the Compose stack, and `docs/` holds policies, ADRs, contracts, task specs and status ledgers. Source of truth for product, environments and commands: [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md).

## Repository layout

```text
apps/web/       Astro 7 + TypeScript static public frontend (Language Gateway, /fa/ + /en/ home, about, cv, research, projects, writing, catalogs, contact, search, 404, health, robots, sitemap)
apps/admin/     React 18 + Vite admin SPA — independent project per ADR-0032 (served at /admin/, own Dockerfile/nginx + ci-admin.yml)
apps/cms/       Django 5.2.9 / Django Ninja 1.6.2 / psycopg 3.3.4 on Python 3.12.13 — CMS backend (Wagtail removed per ADR-0026 / DEBT-0003 CLOSED)
infra/deploy/   deploy scripts (cd-cms-migrate.sh, cd-rebuild-web.sh, caddy-compose-reload.sh, s5-admin-cutover.sh, smoke.sh)
infra/cms/      Compose stack: db + cms + web + admin + caddy edge (Dockerfile.cms has no SPA stage per ADR-0032)
infra/caddy/    Caddyfile.compose (live edge) + Caddyfile.cms.snippet
infra/backup/   restic/rclone backup timer and .env.example
Assets/         owner design sources for future frontend work (logo masters, CV originals, character art) — PROTECTED: tracked, never cleaned, never served raw; crops/optimized copies go to apps/web/public
docs/adr/       accepted/proposed architecture decisions (ADR-0002..0032 + index)
docs/governance/ release, deploy, backup, server-access and documentation policies and runbooks
docs/status/    WORK_LOG, RISK_REGISTER, deferred-validation, TECH_DEBT, known-issues, CHANGELOG
docs/plan/      active plans: PARALLEL_EXECUTION_PLAN.md (waves), REMAINING-WORK-CONSOLIDATED.md, master-remaining-work-checklist.md; finished specs under archive/
docs/design.md  design tokens and visual design baseline
docs/IDEA-vision.md  original platform vision note (historical)
docs/templates/  task specification template
.github/        GitHub Actions workflows: ci.yml (web), ci-cms.yml (+e2e lifecycle), ci-admin.yml (admin SPA), ci-cms-image.yml, cd.yml
PROJECT_MANIFEST.md  product, approved baseline, environments, canonical commands
AGENTS.md       agent and developer contract, ownership boundaries, current gate
Task-list.md    phased implementation plan (P0-G0 → P11)
```

New public assets: header logo `apps/web/public/logo.png` (cropped and transparent, from the approved base asset) and CV/Resume downloads `apps/web/public/downloads/*.md`, served on the `/fa/cv/` and `/en/cv/` pages. `apps/web/`, `apps/admin/` and `apps/cms/` are the canonical paths; do not recreate `frontend/` or `backend/`.

## Getting started

Prerequisites: Node 24 + npm for `apps/web/`; `uv` + Python 3.12 for `apps/cms/`. The default `python` command resolves to a Hermes-owned interpreter and is not the project interpreter — always use `uv`.

Web (`apps/web/`):

```powershell
npm install        # reproducible install from package-lock.json
npm run check      # astro check (typecheck)
npm run build      # astro build — static output in dist/
npm run preview    # serve the built artifact locally
npm audit          # dependency security scan
```

CMS (`apps/cms/`, with `$env:DJANGO_SETTINGS_MODULE = "config.settings.test"`):

```powershell
uv sync --python 3.12                    # reproducible install from pyproject.toml + uv.lock
uv run ruff check .                      # lint
uv run python manage.py check           # Django system check
uv run python manage.py makemigrations --check --dry-run   # migration consistency
uv run pytest -q                        # test suite (75 passed)
```

## CI/CD and deployment

- `ci.yml` (web): Node 24; `npm ci` → `npm run check` → `npm run build` → build fingerprint → local-preview smoke via `infra/deploy/smoke.sh` → Playwright mobile-overflow and About-tabs regressions → `npm audit` → artifact completeness and no-secret check → artifact upload.
- `ci-cms.yml` (CMS): `uv sync --python 3.12` → `manage.py check` → `makemigrations --check --dry-run` → `ruff check` → `pytest` → `manage.py test` → `git diff --check` → secret scan.
- Artifact deploy mechanics: build a static artifact from a clean HEAD, upload it to the VPS, then run `sudo /opt/taha/bin/update-release.sh` (repo copy: [infra/deploy/update-release.sh](infra/deploy/update-release.sh)), which switches the `/opt/taha/site/current` symlink atomically; the deployed Caddy snippet `taha_application_routes` serves that root, so no Caddy reload is needed and the previous release stays on disk for rollback. Production smoke: `infra/deploy/smoke.sh https://tahamohamadi.ir` (7 PASS).
- Release gate: CI green on `main` (web + cms workflows) plus production smoke only; no deploy without owner approval and a documented rollback path. Rollback and release mechanics: [DEPLOY_RUNBOOK.md](docs/governance/DEPLOY_RUNBOOK.md) and [RELEASE_POLICY.md](docs/governance/RELEASE_POLICY.md).
- Staging is decommissioned (ADR-0025, 2026-08-15): `staging.tahamohamadi.ir` has no Caddy block or DNS record; development and deployment happen directly on `tahamohamadi.ir`.
- GitHub Actions hosted runners are the CI baseline; no Gitea or self-hosted runner on the production VPS.

## Documentation index

- [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md) — product, approved baseline, environments, canonical verified commands.
- [AGENTS.md](AGENTS.md) — agent and developer contract, ownership boundaries, current gate.
- [docs/adr/README.md](docs/adr/README.md) — ADR index (ADR-0002..0026, including static-first Astro, versioned artifact deploy, admin security boundary, P3 auth/media/rich-text/rebuild/lifecycle, staging decommission, custom admin replacing Wagtail).
- [docs/governance/RELEASE_POLICY.md](docs/governance/RELEASE_POLICY.md) — release gate and DoD.
- [docs/governance/DEPLOY_RUNBOOK.md](docs/governance/DEPLOY_RUNBOOK.md) — deploy, smoke and rollback procedure.
- [docs/governance/BACKUP_POLICY.md](docs/governance/BACKUP_POLICY.md) and [docs/governance/BACKUP_RUNBOOK.md](docs/governance/BACKUP_RUNBOOK.md) — encrypted Google Drive backup policy and runbook.
- [docs/governance/SERVER_ACCESS_RUNBOOK.md](docs/governance/SERVER_ACCESS_RUNBOOK.md) — key-only non-root SSH access.
- [docs/governance/DOCUMENTATION_POLICY.md](docs/governance/DOCUMENTATION_POLICY.md) — documentation contract.
- [docs/status/](docs/status/) — ledgers: [WORK_LOG.md](docs/status/WORK_LOG.md), [RISK_REGISTER.md](docs/status/RISK_REGISTER.md), [deferred-validation.md](docs/status/deferred-validation.md), [TECH_DEBT.md](docs/status/TECH_DEBT.md), [known-issues.md](docs/status/known-issues.md), [CHANGELOG.md](docs/status/CHANGELOG.md), [BACKLOG.md](docs/status/BACKLOG.md).
- [docs/plan/](docs/plan/) — task specs and phase plans; template in [docs/templates/TASK_SPEC_TEMPLATE.md](docs/templates/TASK_SPEC_TEMPLATE.md).
- [docs/design.md](docs/design.md) — design tokens and visual baseline.
- [Task-list.md](Task-list.md) — phased implementation plan and progress snapshot.

## Status snapshot

- Live (2026-08-17/18): static site at https://tahamohamadi.ir plus CMS Compose `taha-cms`; public published-only `/api/` + `/media/` live (`DEFER-0017` CLOSED); P4–P6 public routes live. `/admin/login/` is Wagtail (to be replaced by a custom React admin per ADR-0026, 2026-08-18). Evidence: [WORK_LOG.md](docs/status/WORK_LOG.md).
- Open: `RISK-0010/RISK-0011` (admin cutover/content preservation, from ADR-0026); `DEFER-0023/0024/0025` (admin transition, branch base, dark mode). `RISK-0003` CLOSED; `DEFER-0017` CLOSED; `RISK-0009` CLOSED; `DEFER-0015` CLOSED (recovery codes in repo; owner rebuild).

## Security and governance notes

- Never commit, log or screenshot secrets; real credentials live only in the owner's password manager or approved secret store, and exposure is reported as a Risk Register entry without repeating the secret.
- Every work item has a Task Spec (template in `docs/templates/`) and every actual action receives a `WORK_LOG.md` entry; deferred work must have an ID in `deferred-validation.md`.
- Gate rules: no deployment without owner approval, a documented rollback path and a passing release gate; no invented endpoints, DTO fields, models, content, translations, metrics or service choices.
- Non-negotiables: `/` is the Language Gateway with direct `/fa/` and `/en/` roots; main public content stays readable without JavaScript; public projections never expose drafts, private media, internal notes or credentials.

## Roadmap

Phased plan in [Task-list.md](Task-list.md): P0-G0 gate passed, static R1 spine and R2 first live done, P2 About/CV live, P3–P6 CMS/public API live, **custom admin rebuild authorized (ADR-0026, phases ADM-0..ADM-6 in Task-list §17)**, then P8–P11: Publications/Books/Downloads/Talks, Teaching + Creative, Topics + Pagefind search, and AI/semantic/knowledge graph. Owner-filtered queue: [docs/status/BACKLOG.md](docs/status/BACKLOG.md).
