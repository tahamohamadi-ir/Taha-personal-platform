# Agent and Developer Contract

Read this file, `PROJECT_MANIFEST.md`, `docs/governance/RELEASE_POLICY.md`, `docs/governance/DOCUMENTATION_POLICY.md`, relevant ADRs and a Task Spec before changing this repository.

## Current gate

P0-G0 is **PASS for static-only P1** (2026-08-14). The Astro public frontend (`apps/web/`) scaffold and the static P1 release (Language Gateway + bilingual landing) are authorized with a complete Task Spec. Static-only VPS staging/production deployment of that artifact is authorized only with owner approval, a documented rollback path and a passing release gate.

**Staging is decommissioned** per ADR-0025 (2026-08-15): `staging.tahamohamadi.ir` has no Caddy block or DNS record, and deploy now requires CI green (web + cms workflows) + production smoke only — no staging smoke step exists. Development and deployment happen directly on `tahamohamadi.ir`.

**P3 CMS runtime (2026-08-16, owner-authorized, PARTIAL):** Compose `taha-cms` live; `/admin/login/` Wagtail; `/static/*` proxied; `/health/` CMS JSON; `/health.json` static. TOTP enrollment UI is in repo (`/admin/account/two-factor/`, Account panel) — production needs image rebuild then owner enroll. Residual (`RISK-0009` OPEN): rotate bypassed admin password; complete TOTP on production. Public `/api/`, `/media/`, contact persistence and media upload remain blocked. `RISK-0003` still covers CMS postgres backup/restore evidence. Canonical Caddy handles: `infra/cms/Caddyfile.cms.snippet`.

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
