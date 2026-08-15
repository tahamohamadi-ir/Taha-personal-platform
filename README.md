# Taha Personal Platform

The repository for the replacement of `tahamohamadi.ir`: a bilingual Persian/English personal research, professional and knowledge platform.

## Current status

P0-G0 passed for static-only P1 (2026-08-14). The Astro public frontend (`apps/web/`) is scaffolded and the static P1 release — a Language Gateway at `/` with `/fa/` (RTL) and `/en/` (LTR) landing pages, 404, health, robots and sitemap — is built and verified locally with CI in `.github/workflows/ci.yml`. Deployment to staging/production on the VPS is not yet performed and requires owner approval per the deploy runbook. Django/Wagtail/PostgreSQL and contact persistence remain blocked until a later phase.

Start with [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md), then [AGENTS.md](AGENTS.md), [Documentation Policy](docs/governance/DOCUMENTATION_POLICY.md) and the [Master Plan](docs/taha-personal-platform-development-master-plan-fa.md).

## Repository layout

```text
apps/web/   Astro public website (static P1)
apps/cms/   future Django/Wagtail/Django Ninja application
infra/      deployment and operations files (deploy runbook, Caddy candidate, backup)
docs/       product, design, architecture, governance and status
```

## Safety

Do not add secrets to this repository. The production server is not configured by this repository yet; deployment and backup remain gated work.
