# Taha Personal Platform

Public repository for the replacement of `tahamohamadi.ir`: a bilingual Persian/English personal research, professional and knowledge platform.

## Repository metadata

| Field | Value |
|---|---|
| Canonical remote | `https://github.com/tahamohamadi-ir/Taha-personal-platform.git` (public) |
| Default branch | `main` |
| Production domain | `tahamohamadi.ir` — not yet served from this repository |
| Staging domain | `staging.tahamohamadi.ir` — isolated 503 placeholder, no application deployed |
| Public locale roots | `/` Language Gateway, `/fa/` (RTL) and `/en/` (LTR) |
| Admin route | `/admin/` — app not yet deployed |

Source of truth for these values: [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md).

## Current status

P0-G0 documentation baseline. Application code has not been scaffolded and no service is deployed from this repository. The production VPS already runs a separate live stack that this repository must not disturb. Secure server access, the isolated staging placeholder and the encrypted Google Drive backup pipeline are recorded in the [Work Log](docs/status/WORK_LOG.md); the current gate and open risks are tracked in the [Risk Register](docs/status/RISK_REGISTER.md).

## Where to start

1. [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md) — product, approved baseline, environments, verified commands.
2. [AGENTS.md](AGENTS.md) — agent and developer contract, ownership boundaries, current gate.
3. [Documentation Policy](docs/governance/DOCUMENTATION_POLICY.md) and [Release Policy](docs/governance/RELEASE_POLICY.md).
4. [Development Master Plan](docs/taha-personal-platform-development-master-plan-fa.md) and the [ADR index](docs/adr/README.md).

## Repository layout

```text
apps/web/    reserved: Astro public frontend (not yet scaffolded)
apps/cms/    reserved: Django/Wagtail/Django Ninja application (not yet scaffolded)
infra/       deploy, Caddy, Compose and backup infrastructure (backup automation sources exist)
docs/        product, design, architecture, governance, plan and status
.github/     reserved: GitHub Actions and repository automation (not yet created)
```

`apps/web/` and `apps/cms/` are the canonical future paths; do not recreate `frontend/` or `backend/`.

## Approved baseline (not yet implemented)

Astro + TypeScript with React islands and Tailwind CSS for the public frontend; Python 3.12 with Django 5.2 LTS, Wagtail 7.4 LTS and Django Ninja for the CMS/API; PostgreSQL; Docker Compose + Caddy on the VPS; GitHub Actions hosted runners for CI; encrypted restic/rclone backups to Google Drive (daily timer verified; staging database-import rehearsal remains). Exact dependency versions are locked only when scaffolding is authorized.

## Safety

Do not add secrets to this repository. `.env.example` documents that no project environment variable is approved yet; real credentials live only in the owner's password manager or approved secret store. Report any exposure as a Risk Register entry without repeating the secret. Deployment, DNS and server operations remain gated by the Task Spec and release policies.
