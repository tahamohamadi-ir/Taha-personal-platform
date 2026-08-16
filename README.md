# Taha Personal Platform

Public repository for the replacement of `tahamohamadi.ir`: a bilingual Persian/English personal research, professional and knowledge platform.

## Repository metadata

| Field | Value |
|---|---|
| Canonical remote | `https://github.com/tahamohamadi-ir/Taha-personal-platform.git` (public) |
| Default branch | `main` |
| Production domain | `tahamohamadi.ir` — serves the static P1 site (release-4fcd19f, checksum `13849ab7`) |
| Staging domain | Decommissioned 2026-08-15 (ADR-0025) — `staging.tahamohamadi.ir` Caddy block and DNS removed |
| Public locale roots | `/` Language Gateway, `/fa/` (RTL) and `/en/` (LTR) |
| Admin route | `/admin/` — app not yet deployed |

Source of truth for these values: [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md).

## Current status

P1 production is LIVE at https://tahamohamadi.ir (2026-08-15): the static P1 site (release-4fcd19f, checksum `13849ab7`) from `/opt/taha/site/current` serves the Language Gateway at `/` with `/fa/` (RTL) and `/en/` (LTR) landing pages, 404, health, robots and sitemap — static-first and readable without JavaScript. P2 About pages (/en/about/, /fa/about/) are live; CV/Resume downloads pending owner files. **Staging is decommissioned** (ADR-0025, 2026-08-15): development/deploy happens directly on `tahamohamadi.ir`, the release gate is CI (web + cms workflows) + production smoke, and CI is green on `main`. Deployment uses the Caddy snippet `taha_application_routes` (root + `file_server`) with a versioned atomic `current` symlink switch via [infra/deploy/update-release.sh](infra/deploy/update-release.sh); rollback is documented in the [Deploy Runbook](docs/governance/DEPLOY_RUNBOOK.md) and production smoke checks passed (7 PASS). The server was upgraded (Ubuntu 26.04 LTS, 2 vCPU, ~4 GiB RAM, 30 GB disk) and the live Compose stack (taha-prod-frontend-1 on 127.0.0.1:13000, taha-prod-backend-1 on 127.0.0.1:18080, taha-prod-postgres-1) was inventory-confirmed on 2026-08-16. A new release from current HEAD (JSON-LD + KI-0001 fix) is about to be deployed; legacy Compose containers still run on the VPS but are no longer routed from the public hostnames. CMS (Django/Wagtail) is P3 code-first scaffolded but not deployed; contact persistence and media remain gated until a later phase; PostgreSQL/Pagefind are not provisioned for this project.

## Where to start

1. [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md) — product, approved baseline, environments, verified commands.
2. [AGENTS.md](AGENTS.md) — agent and developer contract, ownership boundaries, current gate.
3. [Documentation Policy](docs/governance/DOCUMENTATION_POLICY.md) and [Release Policy](docs/governance/RELEASE_POLICY.md).
4. [Development Master Plan](docs/taha-personal-platform-development-master-plan-fa.md) and the [ADR index](docs/adr/README.md).

## Repository layout

```text
apps/web/   Astro public website — static P1 built (Language Gateway + bilingual landing)
apps/cms/   Django/Wagtail/Django Ninja application — P3 code-first scaffold (not deployed)
infra/      deploy runbook, Caddy candidate, deploy scripts and backup automation
docs/       product, design, architecture, governance, plan and status
.github/    GitHub Actions and repository automation (CI workflow created)
```

`apps/web/` and `apps/cms/` are the canonical paths; do not recreate `frontend/` or `backend/`.

## Approved baseline

Astro + TypeScript (static-first, no client JS in P1) with Tailwind CSS and project design tokens for the public frontend — static P1 is implemented and live; `motion`, `gsap` and `three` are locked for future, approved islands only and are inactive in P1. Python 3.12 with Django 5.2 LTS, Wagtail 7.4 LTS and Django Ninja for the CMS/API are P3 code-first scaffolded in `apps/cms/` (not deployed); PostgreSQL and Pagefind search remain future phases (not provisioned); Docker Compose + Caddy on the VPS; GitHub Actions hosted runners for CI; encrypted restic/rclone backups to Google Drive (daily timer verified; staging database-import rehearsal remains). Exact dependency versions are locked in the `apps/web/` and `apps/cms/` lockfiles.

## Safety

Do not add secrets to this repository. `.env.example` documents that no project environment variable is approved yet; real credentials live only in the owner's password manager or approved secret store. Report any exposure as a Risk Register entry without repeating the secret. Deployment, DNS and server operations remain gated by the Task Spec and release policies.
