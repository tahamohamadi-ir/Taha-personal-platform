# Taha Personal Platform

Bilingual Persian/English personal research, professional and knowledge platform for Taha Mohammadi, live at https://tahamohamadi.ir. The public root is a Language Gateway (`/`) with direct locale roots `/fa/` (RTL) and `/en/` (LTR); all public content is static-first and readable without JavaScript, served as a versioned artifact by Caddy from `/opt/taha/site/current`. This repository is a monorepo: `apps/web/` is the Astro static public frontend, `apps/cms/` is the Django/Wagtail/Ninja CMS (P3 code-first, not deployed), `infra/` holds deploy scripts and NOT-APPLIED CMS runtime candidates, and `docs/` holds policies, ADRs, task specs and status ledgers. Source of truth for product, environments and commands: [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md).

## Repository layout

```text
apps/web/       Astro 7 + TypeScript static public frontend (Language Gateway, /fa/ + /en/ landing, about, cv, 404, health, robots, sitemap)
apps/cms/       Django 5.2.9 / Wagtail 7.4.2 / Django Ninja 1.6.2 / psycopg 3.3.4 on Python 3.12.13 — P3 code-first, 70 pytest PASS, not deployed
infra/deploy/   versioned artifact switch (update-release.sh), smoke.sh, rollback and Caddy-apply scripts
infra/cms/      NOT-APPLIED candidates for the future CMS runtime (Dockerfile, Compose, Caddy snippet, README)
infra/caddy/    static-site Caddy config candidate
infra/backup/   restic/rclone backup timer and .env.example
docs/adr/       accepted/proposed architecture decisions (ADR-0002..0025 + index)
docs/governance/ release, deploy, backup, server-access and documentation policies and runbooks
docs/status/    WORK_LOG, RISK_REGISTER, deferred-validation, TECH_DEBT, known-issues, CHANGELOG, BACKLOG
docs/plan/      task specs and phase plans (P0-G0, P0-A, P1, P2, P3, S-PLAN-STATE, RELEASE-P1)
docs/design.md  design tokens and visual design baseline
docs/templates/  task specification template
.github/        GitHub Actions workflows: ci.yml (web) and ci-cms.yml (CMS)
PROJECT_MANIFEST.md  product, approved baseline, environments, canonical commands
AGENTS.md       agent and developer contract, ownership boundaries, current gate
Task-list.md    phased implementation plan (P0-G0 → P11)
```

New public assets: header logo `apps/web/public/logo.png` (cropped and transparent, from the approved base asset) and CV/Resume downloads `apps/web/public/downloads/*.md`, served on the `/fa/cv/` and `/en/cv/` pages. `apps/web/` and `apps/cms/` are the canonical paths; do not recreate `frontend/` or `backend/`.

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
uv run pytest -q                        # test suite (70 passed)
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
- [docs/adr/README.md](docs/adr/README.md) — ADR index (ADR-0002..0025, including static-first Astro, versioned artifact deploy, admin security boundary, P3 auth/media/rich-text/rebuild/lifecycle, staging decommission).
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

- Live (2026-08-16): canonical remote `https://github.com/tahamohamadi-ir/Taha-personal-platform.git` (public), default branch `main`. Production serves **release-6031441** (checksum `031943b1`) at https://tahamohamadi.ir: Language Gateway `/`, `/fa/` (RTL) and `/en/` (LTR) landing pages, About and CV pages per locale, locale-aware 404, `/health.json`, robots and sitemap — static-first, readable without JavaScript, CI green on `main`. Server: Ubuntu 26.04 LTS, 2 vCPU / ~4 GiB RAM / 30 GB disk; it co-hosts the pre-existing Compose stack (taha-prod-frontend/backend/postgres, inventory-confirmed 2026-08-16), which the owner is decommissioning. Evidence: [WORK_LOG.md](docs/status/WORK_LOG.md) (LOG-0111), [CHANGELOG.md](docs/status/CHANGELOG.md).
- Code-first, not deployed: `apps/cms/` P3 code-first is complete per [docs/plan/P3-gate-code-first-task-spec.md](docs/plan/P3-gate-code-first-task-spec.md) — content lifecycle models, media upload security, admin audit + login rate limit, rich-text allowlist, Ninja public read API, rebuild trigger, 70 pytest PASS — but is deployed nowhere; `infra/cms/` files are NOT-APPLIED candidates.
- Blocked: CMS runtime deploy (MFA enforcement + `RISK-0003` DB-import evidence + a separate deploy Task Spec; `RISK-0009` BLOCKED), PostgreSQL provisioning, media/API exposure and contact persistence (`RISK-0007` CLOSED: 4 GiB plan kept). Evidence: [AGENTS.md](AGENTS.md) gate, [BACKLOG.md](docs/status/BACKLOG.md), [RISK_REGISTER.md](docs/status/RISK_REGISTER.md), [deferred-validation.md](docs/status/deferred-validation.md), [known-issues.md](docs/status/known-issues.md).

## Security and governance notes

- Never commit, log or screenshot secrets; real credentials live only in the owner's password manager or approved secret store, and exposure is reported as a Risk Register entry without repeating the secret.
- Every work item has a Task Spec (template in `docs/templates/`) and every actual action receives a `WORK_LOG.md` entry; deferred work must have an ID in `deferred-validation.md`.
- Gate rules: no deployment without owner approval, a documented rollback path and a passing release gate; no invented endpoints, DTO fields, models, content, translations, metrics or service choices.
- Non-negotiables: `/` is the Language Gateway with direct `/fa/` and `/en/` roots; main public content stays readable without JavaScript; public projections never expose drafts, private media, internal notes or credentials.

## Roadmap

Phased plan in [Task-list.md](Task-list.md): P0-G0 gate passed, static R1 spine and R2 first live done, P2 About/CV live, P3 CMS runtime gated (see snapshot above), then P4–P11: Blog/Writing, Research, Projects, Professional Admin, Publications/Books/Downloads/Talks, Teaching + Creative, Topics + Pagefind search, and AI/semantic/knowledge graph. Owner-filtered queue: [docs/status/BACKLOG.md](docs/status/BACKLOG.md).
