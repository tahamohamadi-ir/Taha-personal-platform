# Agent and Developer Contract

Read this file, `PROJECT_MANIFEST.md`, `docs/governance/RELEASE_POLICY.md`, `docs/governance/DOCUMENTATION_POLICY.md`, relevant ADRs and a Task Spec before changing this repository.

## Current gate

P0-G0 is **PASS for static-only P1** (2026-08-14). Scaffolding the Astro public frontend (`apps/web/`) for the static P1 release (Language Gateway + bilingual landing) is authorized with a complete Task Spec. Django/Wagtail/PostgreSQL, contact persistence, media upload, API/schema, Docker services for this project, VPS connection, DNS changes and deployment remain blocked until a subsequent phase (P3 or later) explicitly moves the gate with a complete Task Spec.

## Ownership

- `apps/web/`: public frontend only.
- `apps/cms/`: Django/Wagtail/Ninja only.
- `infra/`: deploy, Caddy, Compose and backup only.
- `docs/`: policies, ADRs, planning and status only.
- `.github/`: GitHub Actions and repository automation only.

Do not recreate `frontend/` or `backend/`; the canonical paths are `apps/web/` and `apps/cms/`.

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

GitHub Actions hosted runners are the CI baseline. Do not install Gitea or a self-hosted runner on the production VPS. No deployment occurs without owner approval, a documented rollback path and passing release gate.
