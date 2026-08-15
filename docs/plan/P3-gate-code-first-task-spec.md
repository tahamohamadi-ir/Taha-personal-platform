# Task Specification — P3 Gate: CMS Code-First (owner-authorized)

## Task: R4/P3 — P3 gate move + `apps/cms/` scaffold (code-first, no server deploy)

- Goal: move the repository gate from `P0-G0 (PASS for static-only P1)` to an explicit **P3 code-first** scope with a complete Task Spec, then scaffold, implement, test and CI-verify the isolated Django/Wagtail/Ninja CMS in `apps/cms/` — without deploying any CMS runtime to staging/production.
- User/actor and journey: CMS editors/owner later; this slice builds the code foundation only.
- Release type: `STANDARD` (new application scaffold)
- Risk level: Medium (new runtime code; no server exposure in this slice)
- Owner and handoff recipient: Project owner (gate authorization 2026-08-15) → main agent → CI. Owner decisions recorded: (1) P2 closes WITHOUT CV/Resume (C4 stays `BLOCKED(owner)`; C7 partial-close), (2) P3 runs code-first, real runtime deploy only after the owner's capacity decision (`RISK-0007`) with a separate Task Spec.

## Scope

- In scope:
  - Gate decision record + this Task Spec + ADRs 0020-0024 (auth/admin boundary, media provider, rich text sanitize, CMS→Astro rebuild trigger, concurrency/edit-conflict) as PROPOSED/ACCEPTED records.
  - Python 3.12.13 via `uv` (verified) + project-local `.venv` in `apps/cms/` (Hermes interpreter forbidden; `DEFER-0003` closure).
  - Pinned exact versions in `apps/cms/pyproject.toml`: Django 5.2.9, Wagtail 7.4.2, django-ninja 1.6.2, psycopg 3.3.4 (binary), uvicorn/gunicorn, pytest-django + factory_boy + ruff dev deps. Locked with `uv lock`.
  - `apps/cms/` scaffold: split settings (base/dev/test/prod), custom User model (email unique), health/readiness endpoints, structured logging, `/admin/` same-origin noindex boundary.
  - Typed localized content contracts (Landing/Profile/Media/Article shell), lifecycle (draft/review/published/archived), public projection (published+public+active media only), Django Ninja public schema (read-only, allowlist).
  - Media library with MIME+signature validation (filetype), size limit, safe storage names, private default.
  - Admin security baseline: MFA-ready hooks, CSRF/session hardening, rate limiting, audit log, negative authorization tests.
  - Rich text allowlist sanitize (Wagtail features) + noindex/no-cache preview.
  - CMS→Astro rebuild: manual rebuild/deploy fallback script + signed trigger design (implemented in code, not deployed).
  - CI workflow for `apps/cms/` (hosted runner; pytest, ruff, check, migrations check).
  - Candidate Compose/Caddy files under `infra/` marked `NOT-APPLIED` (runtime deploy explicitly blocked by `RISK-0007`/`RISK-0003` until owner decision).
  - Docs: CHANGELOG.md + BACKLOG.md (new), WORK_LOG entries per slice, RISK_REGISTER (`RISK-0007` stays BLOCKED), deferred-validation (close `DEFER-0003` with evidence), TECH_DEBT, Task-list P3 ticks (only with evidence), S-PLAN-STATE, PROJECT_MANIFEST updates (canonical CMS commands after clean-checkout verification).
- Non-goals: NO runtime deployment (staging/prod), NO PostgreSQL provisioning, NO media provider account, NO contact persistence, NO MFA enforcement on live admin, NO public CMS API exposure, NO P4+ entities (Project/Publication/Course/CreativeWork).
- Allowed files: `apps/cms/**`, `docs/plan/P3-*-task-spec.md`, `docs/adr/0020-0024*`, `docs/governance/RELEASE_POLICY.md` (gate status only), `docs/status/*`, `docs/taha-personal-platform-technology-architecture-baseline-fa.md` (baseline status rows only), `docs/taha-personal-platform-development-master-plan-fa.md` (status rows only), `PROJECT_MANIFEST.md`, `Task-list.md`, `.github/workflows/ci-cms.yml` (new), `infra/cms/` (candidate files only, NOT-APPLIED), `.gitignore`.
- Forbidden files: `.github/workflows/ci.yml` (existing web CI untouched), `apps/web/**`, `infra/**` existing files (no edits; only new `infra/cms/` files), any secret, any deploy/SSH action.

## Contracts and data

- Documents/ADRs/API schemas/models read: `PROJECT_MANIFEST.md` (gate, ownership, canonical commands), `AGENTS.md`, `docs/governance/DOCUMENTATION_POLICY.md`, `docs/governance/RELEASE_POLICY.md`, `Task-list.md` §8 (P3), ADR-0002/0008/0009/0011/0014, `docs/taha-personal-platform-technology-architecture-baseline-fa.md` (P3 sections), `docs/status/RISK_REGISTER.md` (RISK-0003/0007), `docs/status/deferred-validation.md` (DEFER-0003), django-security/django-patterns/django-tdd/postgresql-table-design/docker-compose-orchestration skills.
- Contracts changed: repository gate status (P0-G0 → P3 code-first scope, static-only remains for public site); new `apps/cms/` ownership activation; canonical CMS commands added to Manifest after clean-checkout verification.
- Migration/data impact: Django migrations created and tested in CI (no DB provisioned); staging/prod databases untouched.
- Locale, visibility and publication impact: CMS content model supports fa/en locale identity; public projections must never expose drafts/private media/internal notes.
- Security/privacy impact: admin hardened per django-security skill; no secrets committed; `.env.example` only; secrets via env vars; MFA design recorded in ADR-0020.

## Verification and release

- Tests/commands to run (canonical after clean-checkout verification):
  - `uv python` → 3.12.13; `uv sync` → clean lockfile install; `uv run manage.py check` → no issues
  - `uv run manage.py makemigrations --check` and `--check --dry-run` → no pending
  - `uv run pytest` → all PASS (models/lifecycle/projection/media/admin/rich-text/api)
  - `uv run ruff check .` → clean
  - `uv run manage.py test` sanity on a built test DB (sqlite test env)
  - `git diff --check` on every commit
- Manual QA path: local runserver with `manage.py createsuperuser` NOT performed (no fake users); health endpoint curl in dev only.
- Acceptance criteria:
  - `apps/cms/` builds and checks cleanly from a clean checkout with `uv sync`.
  - All P3 entity tests PASS; public projection returns only published+public+active records; draft/private leaks tested negative.
  - CI workflow `ci-cms.yml` green on push.
  - No CMS runtime deployed; `infra/cms/` files carry NOT-APPLIED markers; RISK-0007 stays BLOCKED.
  - Docs ledgers (CHANGELOG, BACKLOG, WORK_LOG, RISK, deferred, TECH_DEBT, S-PLAN, Manifest, Task-list) updated with real evidence.
- Rollback/fallback: CMS is code-only; revert commits; web site artifact untouched; no server state.
- Documentation to update: as listed in scope (CHANGELOG.md, BACKLOG.md, WORK_LOG, RISK_REGISTER, deferred-validation, TECH_DEBT, S-PLAN-STATE, PROJECT_MANIFEST, Task-list).

## Handoff

- Files changed (task-owned only): `apps/cms/**`, `docs/plan/P3-*-task-spec.md`, `docs/adr/0020-0024*`, `docs/status/*`, `docs/governance/RELEASE_POLICY.md`, baseline/master-plan status rows, `PROJECT_MANIFEST.md`, `Task-list.md`, `.github/workflows/ci-cms.yml`, `infra/cms/**` (NOT-APPLIED), `.gitignore`.
- Verification actually run (command + result): recorded per slice in WORK_LOG.
- Deferred/risk IDs: `RISK-0007` BLOCKED (owner capacity decision), `RISK-0003` ACCEPTED limited (DB import evidence still required before any CMS DB deploy), `DEFER-0003` → CLOSED (Python 3.12.13 + .venv evidence), C4 BLOCKED(owner), C7 partial.
- Explicit blockers and next input: owner capacity decision for runtime deploy; owner CV/Resume files for C4 (not in this scope per owner decision).
