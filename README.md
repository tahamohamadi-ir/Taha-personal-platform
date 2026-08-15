# Taha Personal Platform

Public repository for the replacement of `tahamohamadi.ir`: a bilingual Persian/English personal research, professional and knowledge platform.

## Repository metadata

| Field | Value |
|---|---|
| Canonical remote | `https://github.com/tahamohamadi-ir/Taha-personal-platform.git` (public) |
| Default branch | `main` |
| Production domain | `tahamohamadi.ir` — not yet served from this repository |
| Staging domain | `staging.tahamohamadi.ir` — isolated placeholder; static P1 deploy pending |
| Public locale roots | `/` Language Gateway, `/fa/` (RTL) and `/en/` (LTR) |
| Admin route | `/admin/` — app not yet deployed |

Source of truth for these values: [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md).

## Current status

P0-G0 passed for static-only P1 (2026-08-14). The Astro public frontend (`apps/web/`) is scaffolded and the static P1 release — a Language Gateway at `/` with `/fa/` (RTL) and `/en/` (LTR) landing pages, 404, health, robots and sitemap — is built and verified locally with CI in `.github/workflows/ci.yml`. Deployment to staging/production on the VPS is not yet performed and requires owner approval per the [Deploy Runbook](docs/governance/DEPLOY_RUNBOOK.md). The production VPS already runs a separate live stack that this repository must not disturb; secure access, the isolated staging placeholder and the encrypted Google Drive backup pipeline are recorded in the [Work Log](docs/status/WORK_LOG.md), and open risks are tracked in the [Risk Register](docs/status/RISK_REGISTER.md). Django/Wagtail/PostgreSQL and contact persistence remain blocked until a later phase.

## Where to start

1. [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md) — product, approved baseline, environments, verified commands.
2. [AGENTS.md](AGENTS.md) — agent and developer contract, ownership boundaries, current gate.
3. [Documentation Policy](docs/governance/DOCUMENTATION_POLICY.md) and [Release Policy](docs/governance/RELEASE_POLICY.md).
4. [Development Master Plan](docs/taha-personal-platform-development-master-plan-fa.md) and the [ADR index](docs/adr/README.md).

## Repository layout

```text
apps/web/   Astro public website — static P1 built (Language Gateway + bilingual landing)
apps/cms/   reserved: Django/Wagtail/Django Ninja application (not yet scaffolded)
infra/      deploy runbook, Caddy candidate, deploy scripts and backup automation
docs/       product, design, architecture, governance, plan and status
.github/    GitHub Actions and repository automation (CI workflow created)
```

`apps/web/` and `apps/cms/` are the canonical paths; do not recreate `frontend/` or `backend/`.

## Approved baseline

Astro + TypeScript (static-first, no client JS in P1) with Tailwind CSS and project design tokens for the public frontend; Python 3.12 with Django 5.2 LTS, Wagtail 7.4 LTS and Django Ninja for the CMS/API (not yet implemented); PostgreSQL; Docker Compose + Caddy on the VPS; GitHub Actions hosted runners for CI; encrypted restic/rclone backups to Google Drive (daily timer verified; staging database-import rehearsal remains). Exact dependency versions are locked in the `apps/web/` lockfile; CMS versions are locked only when CMS scaffolding is authorized.

## Safety

Do not add secrets to this repository. `.env.example` documents that no project environment variable is approved yet; real credentials live only in the owner's password manager or approved secret store. Report any exposure as a Risk Register entry without repeating the secret. Deployment, DNS and server operations remain gated by the Task Spec and release policies.
