# Taha Personal Platform

Bilingual Persian/English personal research, professional and knowledge platform for Taha Mohammadi, live at https://tahamohamadi.ir. The public root is a Language Gateway (`/`) with direct locale roots `/fa/` (RTL) and `/en/` (LTR). Public pages are static-first and readable without JavaScript, served as a versioned artifact by Caddy from `/opt/taha/site/current`. CMS content (About profile, blog, research, projects) is authored in Wagtail and projected through published-only APIs at build time.

This repository is a monorepo:

| Path | Role |
|---|---|
| `apps/web/` | Astro 7 static public frontend |
| `apps/cms/` | Django 5.2 / Wagtail 7.4 / Django Ninja CMS |
| `infra/` | Deploy scripts, Caddy, Compose, backup |
| `docs/` | Policies, ADRs, contracts, task specs, ledgers |

**Read first:** [AGENTS.md](AGENTS.md) → [docs/README.md](docs/README.md) → [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md).

## Repository layout

```text
apps/web/         Gateway, landing, About (+ section/detail routes), CV, blog, research, projects, 404, SEO
apps/cms/         Wagtail admin, Profile API, blog/research/project models, custom /admin/profiles/
infra/deploy/     update-release.sh, update-cms.sh, smoke-cms.sh, rebuild-static.sh, cd.yml deploy path
infra/cms/        Compose stack, Dockerfile, Caddy snippet
docs/contracts/   binding IA and design contract cards
docs/plan/        task specs + plan index (docs/plan/README.md)
docs/status/      WORK_LOG, risks, deferred work, changelog
.github/          ci.yml, ci-cms.yml, ci-cms-image.yml, cd.yml
AGENTS.md         agent contract and current gate
PROJECT_MANIFEST.md   product baseline, environments, canonical commands
Task-list.md      phased plan P0–P11
```

Do not recreate `frontend/` or `backend/`; canonical paths are `apps/web/` and `apps/cms/`.

## Getting started

**Prerequisites:** Node 24 + npm (`apps/web/`); `uv` + Python 3.12 (`apps/cms/`). The default `python` command resolves to a Hermes-owned interpreter — always use `uv`.

### Web (`apps/web/`)

```powershell
npm install
npm run check
npm run build
npm run preview
node qa/cms-profile-build.spec.mjs   # dist-only About/profile check
```

Optional CMS-backed build:

```powershell
$env:CMS_API_BASE = "http://127.0.0.1:18000"
npm run build
```

### CMS (`apps/cms/`)

```powershell
uv sync --python 3.12
$env:DJANGO_SETTINGS_MODULE = "config.settings.test"
uv run ruff check .
uv run python manage.py check
uv run pytest -q
```

## CI/CD and deployment

| Workflow | Purpose |
|---|---|
| `ci.yml` | Web: check, build, Playwright regressions, audit, artifact |
| `ci-cms.yml` | CMS: ruff, pytest, migration check |
| `ci-cms-image.yml` | Build/push `ghcr.io/tahamohamadi-ir/taha-cms:<sha>` |
| `cd.yml` | On push to `main`: build web with `CMS_API_BASE=https://tahamohamadi.ir`, rsync to VPS, `update-release.sh`, production smoke |

**CMS deploy (operator, VPS):** pin `CMS_IMAGE` to a git sha, run `infra/deploy/update-cms.sh`, then `import_profile_seed` when profile schema/seed changes. See [DEPLOY_RUNBOOK.md](docs/governance/DEPLOY_RUNBOOK.md).

**Rollback:** previous static release on disk via `update-release.sh`; CMS via previous `CMS_IMAGE` tag. Never `compose down -v`.

Staging is decommissioned (ADR-0025). Gate: CI green + production smoke. No Gitea or self-hosted runner on the VPS.

## Documentation index

- [docs/README.md](docs/README.md) — documentation entry point, read order, STOP conditions
- [docs/contracts/IA-CONTRACT.md](docs/contracts/IA-CONTRACT.md) — binding URL and navigation rules
- [docs/contracts/DESIGN-CONTRACT.md](docs/contracts/DESIGN-CONTRACT.md) — binding visual/token rules
- [docs/plan/README.md](docs/plan/README.md) — which task spec is active vs archived
- [docs/governance/DEPLOY_RUNBOOK.md](docs/governance/DEPLOY_RUNBOOK.md) — deploy, smoke, rollback
- [docs/status/WORK_LOG.md](docs/status/WORK_LOG.md) — chronological evidence of work performed

## Status snapshot (2026-08-18)

**Live on https://tahamohamadi.ir**

- Static: Gateway, `/fa/`, `/en/`, About (hybrid tabs + filters), About section/detail routes, CV, blog, research, projects, 404, robots, sitemap
- CMS: Wagtail `/admin/` + TOTP; custom `/admin/profiles/`; image `taha-cms:31c6560`; migrations through `content.0006`; profile seed `en`/`fa`
- API: published-only `/api/*` including `/api/profiles/<locale>/about`
- Static build: CD deploy **release-f11d2fc** with live CMS profile at build time

**Closed risks / defers:** `RISK-0003`, `RISK-0009`, `DEFER-0017` (public `/api/`)

**Still open (not blocking current About/profile slice):** `DEFER-0018` (RSS), `DEFER-0022` (local Playwright preview), contact persistence, media upload, remainder of P7 admin (ops dashboard, composition)

Evidence: LOG-0150 (PR #31), owner VPS migrate/seed (2026-08-18), CD rerun (Actions run 32137604292).

## Roadmap

Phased plan in [Task-list.md](Task-list.md): P0–P3 and P4–P6 public routes shipped; CMS-managed About/profile live; P7–P11 queued (professional admin remainder, publications, teaching, search, AI/semantic). Owner queue: [docs/status/BACKLOG.md](docs/status/BACKLOG.md).

## Security and governance

- Never commit secrets; report exposure in [RISK_REGISTER.md](docs/status/RISK_REGISTER.md) without repeating the secret.
- Every work item has a Task Spec; every action gets a [WORK_LOG.md](docs/status/WORK_LOG.md) entry.
- Deferred/skipped validation must have an ID in [deferred-validation.md](docs/status/deferred-validation.md).
- Non-negotiables: Language Gateway at `/`; independent `/fa/` and `/en/`; no silent locale fallback; no drafts on the public site.
