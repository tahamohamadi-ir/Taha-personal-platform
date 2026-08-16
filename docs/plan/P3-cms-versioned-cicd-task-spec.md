# Task Specification — P3 CMS versioned CI/CD + deploy hardening

## Task: P3 — Versioned CMS image pipeline and production proxy/health fixes

- Goal: replace ad-hoc `taha-cms:latest` + `docker save/load` with a traceable **GHCR versioned image** pipeline; fix the production Django settings that caused `/health/` **400** and bare-`python` **ModuleNotFoundError**; document the **Caddy + static artifact + Compose CMS** deploy contract.
- User/actor: owner deploys a specific image digest/tag; editors reach `/admin/` via Caddy; ops probe `/health/` without false 400s.
- Release type: `HIGH-RISK` (production settings, CI package publish, deploy path)
- Risk level: High
- Owner: Project owner (approve GHCR package visibility + first pull on VPS)

## Root-cause (owner log 2026-08-16)

| Symptom | Cause |
|---|---|
| `curl http://127.0.0.1:18000/health/` → HTML **400** | Production `ALLOWED_HOSTS` excludes `127.0.0.1` **and** `SECURE_SSL_REDIRECT=True` without proxy/health exemptions |
| `exec cms python manage.py …` → **No module named django** | Image venv is at `./.venv`; `PATH` did not include it; bare `python` is system Python |
| `https://…/admin/login/` → **301**, site `/` → **200** | CMS Caddy snippet not yet applied (static site still owns unmatched paths) |

## Scope

- In scope: `apps/cms/config/settings/production.py` (proxy + health exemptions + host parsing); `apps/cms/tests/test_production_*.py`; `infra/cms/*` (Dockerfile PATH, compose image tag, `.env.example`, README, Caddy snippet headers); `infra/deploy/update-cms.sh` + smoke helpers; `.github/workflows/ci-cms-image.yml`; docs (DEPLOY_RUNBOOK CMS section, Manifest, WORK_LOG, this Task Spec); `.dockerignore` hygiene.
- Non-goals: containerizing the static Astro site; public `/api/` exposure; Redis/Celery; self-hosted runners; auto-SSH deploy from GitHub to VPS (pull remains owner/operator-run).
- Allowed files: listed above + `docs/status/*`, `AGENTS.md`, `PROJECT_MANIFEST.md`.
- Forbidden: inventing secrets; force-push; changing `apps/web/` routes.

## Acceptance criteria

1. Container `python` resolves to the image venv (Django importable).
2. In-container `GET /health/` with Host `127.0.0.1` returns JSON 200 (no SSL redirect loop / DisallowedHost).
3. Behind Caddy with `X-Forwarded-Proto: https`, admin CSRF/session secure cookies remain valid.
4. CI builds and pushes `ghcr.io/<owner>/taha-cms:<git-sha>` (and moving `main` tag) after tests pass.
5. Compose defaults to a **pinned** `CMS_IMAGE` (not anonymous `latest` as the source of truth).
6. Deploy script documents: pull → up → migrate → smoke; rollback = previous image tag.
7. WORK_LOG entry records commands actually run locally; VPS re-smoke remains owner-executed.

## Validation

- `uv run pytest -q` (apps/cms) including new production proxy/health tests
- `uv run ruff check .`
- `docker build -f infra/cms/Dockerfile.cms -t taha-cms:localtest .` when Docker available
- `bash -n infra/deploy/update-cms.sh`

## Documentation impact

Update CMS README, DEPLOY_RUNBOOK (CMS section), PROJECT_MANIFEST canonical commands, WORK_LOG, RISK-0009 notes (still open until VPS smoke PASS).
