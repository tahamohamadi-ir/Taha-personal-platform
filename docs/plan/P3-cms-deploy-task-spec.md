# Task Specification — P3 CMS Runtime Deploy (owner-authorized)

## Task: P3 — CMS runtime deployment to production VPS

- Goal: deploy the P3 code-first CMS (`apps/cms/`) as a running Docker Compose stack on the production VPS (`tahamohamadi.ir`), with PostgreSQL, Caddy admin reverse-proxy, MFA-enforced admin access, health endpoint and smoke verification — while preserving the live static site and co-hosted resources.
- User/actor and journey: CMS editors/owner authenticate at `/admin/`, complete TOTP MFA setup on first login, then create/edit/publish content. Public visitors continue to reach the static site at `/fa/` and `/en/` unchanged.
- Release type: `HIGH-RISK` (auth, database provisioning, production deploy, MFA enforcement)
- Risk level: High (new runtime on production VPS, PostgreSQL provisioning, admin exposure, co-hosted resource contention)
- Owner and handoff recipient: Project owner (gate authorization) → agent executes deploy steps on VPS with owner SSH approval → owner verifies admin login + MFA → gate updated.

## Prerequisites (all must PASS before any deploy action)

| # | Prerequisite | Evidence required | Status |
|---|---|---|---|
| P1 | P3 code-first gate complete | `ci-cms.yml` green on `main`; 70+ pytest PASS; ruff clean | Required |
| P2 | MFA enforcement merged | MFA middleware exists in `apps/security/mfa.py`; unit tests PASS | Required |
| P3 | RISK-0003 DB-import evidence | `systemctl status taha-backup.timer` active on VPS; at least one successful PostgreSQL snapshot + isolated restore rehearsal documented in RISK_REGISTER | Required |
| P4 | Owner approval for admin exposure | Explicit owner sign-off recorded in WORK_LOG with date | Required |
| P5 | Rollback plan documented | This Task Spec § Rollback section; Caddyfile backup confirmed | Required |
| P6 | Old stack decommissioned | Owner executed `infra/deploy/decommission-old-stack.md`; `docker ps` shows no `taha-prod-*` containers | Required |
| P7 | `infra/cms/` NOT-APPLIED markers removed | Files updated to remove `NOT-APPLIED` header comments | Required |

## Scope

- In scope:
  - Remove `NOT-APPLIED` markers from `infra/cms/Dockerfile.cms`, `infra/cms/docker-compose.cms.yml`, `infra/cms/Caddyfile.cms.snippet` and `infra/cms/README.md`.
  - Create `.dockerignore` at repo root (exclude `apps/cms/.venv`, `*.sqlite3`, `__pycache__`, `.git`, `node_modules`, `.venv`).
  - Create `infra/cms/.env.example` (template with placeholder values; never commit real `.env`).
  - Build the CMS Docker image (multi-stage `Dockerfile.cms`) on the VPS or locally + upload.
  - Create `infra/cms/.env` on VPS with production values (owner provides or confirms secrets).
  - `docker compose -f infra/cms/docker-compose.cms.yml up -d` on VPS.
  - Run migrations: `docker compose exec cms python manage.py migrate`.
  - Owner creates superuser: `docker compose exec cms python manage.py createsuperuser`.
  - MFA verification: first admin login triggers TOTP setup gate (enforced by MFA middleware in `apps/security/mfa.py`).
  - Caddy: integrate admin reverse-proxy snippet into the main Caddyfile with `noindex` header (`X-Robots-Tag: noindex, nofollow`), validate, reload.
  - Smoke tests: `/admin/` → redirect to login (anonymous), `/health/` → 200, `/admin/` with OTP-verified staff session → 200.
  - Documentation updates: WORK_LOG, RISK_REGISTER (RISK-0009 → CLOSED), deferred-validation, PROJECT_MANIFEST (canonical deploy commands), AGENTS.md (gate status), RELEASE_POLICY gate status.
- Non-goals:
  - Media upload exposure (needs security hardening beyond P3; deferred).
  - Public CMS API exposure (needs auth review; deferred).
  - Contact persistence (needs separate Task Spec + form; deferred).
  - P4+ entities (Project/Publication/Course/CreativeWork).
  - Redis, Celery, Elasticsearch or any additional always-on service.
  - Gitea or self-hosted CI runner.
  - Any change to `apps/web/` or the static site artifact.
- Allowed files: `infra/cms/**` (remove NOT-APPLIED markers, add `.env.example`), repo-root `.dockerignore` (new), `infra/caddy/static-site.caddy` (add admin snippet), `docs/plan/P3-cms-deploy-task-spec.md` (this file), `docs/status/*`, `PROJECT_MANIFEST.md`, `AGENTS.md`, `docs/governance/RELEASE_POLICY.md` (gate status only).
- Forbidden files: `apps/web/**`, `apps/cms/**` (no code changes in this slice), `.github/workflows/ci.yml`, any secret file, any file outside the allowed list.

## Contracts and data

- Documents/ADRs/API schemas/models read: `PROJECT_MANIFEST.md`, `AGENTS.md`, `docs/governance/RELEASE_POLICY.md`, `docs/governance/DOCUMENTATION_POLICY.md`, ADR-0020 (auth/admin boundary), ADR-0025 (staging decommission), `docs/status/RISK_REGISTER.md` (RISK-0003/0007/0009), `docs/status/deferred-validation.md`, `infra/cms/docker-compose.cms.yml`, `infra/cms/Dockerfile.cms`, `infra/cms/Caddyfile.cms.snippet`.
- Contracts changed: `infra/cms/` files transition from NOT-APPLIED candidates to applied infrastructure; repository gate status updated to reflect CMS runtime deployed; canonical deploy commands added to PROJECT_MANIFEST.
- Migration/data impact: PostgreSQL 17 provisioned on VPS with named volume `postgres_data`; Django migrations applied against empty database; no existing data to migrate.
- Locale, visibility and publication impact: CMS admin exposed at `/admin/` behind MFA; public site (`/fa/`, `/en/`) unchanged; no public CMS content published until owner creates and publishes via admin.
- Security/privacy impact: admin protected by MFA (TOTP enforced by `apps/security/mfa.py` middleware); Caddy snippet adds `X-Robots-Tag: noindex, nofollow` to `/admin/` and `/health/`; no ports published to host (Caddy joins `cms_internal` network); `.env` never committed; secrets via env vars only.

## Deployment mechanics

### Step 1: Build the CMS Docker image

Build on VPS (preferred — avoids image transfer):

```bash
cd /opt/taha/Taha-personal-platform
git pull origin main
docker compose -f infra/cms/docker-compose.cms.yml build
```

### Step 2: Create `.env` on VPS

```bash
cat > infra/cms/.env << 'EOF'
POSTGRES_DB=taha_cms
POSTGRES_USER=taha_cms
POSTGRES_PASSWORD=<OWNER_PROVIDED>
DJANGO_SECRET_KEY=<OWNER_GENERATED_50_PLUS_CHARS>
ALLOWED_HOSTS=tahamohamadi.ir
WAGTAILADMIN_BASE_URL=https://tahamohamadi.ir/admin/
REBUILD_TRIGGER_ENABLED=false
REBUILD_TRIGGER_SECRET=
EOF
chmod 600 infra/cms/.env
```

Owner must provide `POSTGRES_PASSWORD` and `DJANGO_SECRET_KEY`. Agent never generates, guesses or records these values.

### Step 3: Start the stack

```bash
docker compose -f infra/cms/docker-compose.cms.yml up -d
```

Verify both containers healthy:

```bash
docker compose -f infra/cms/docker-compose.cms.yml ps
docker compose -f infra/cms/docker-compose.cms.yml logs db --tail=20
docker compose -f infra/cms/docker-compose.cms.yml logs cms --tail=20
```

### Step 4: Run migrations

```bash
docker compose -f infra/cms/docker-compose.cms.yml exec cms python manage.py migrate
```

### Step 5: Create superuser (owner executes interactively)

```bash
docker compose -f infra/cms/docker-compose.cms.yml exec cms python manage.py createsuperuser
```

Owner provides email and password. Agent does not execute this step.

### Step 6: Verify MFA enforcement

After superuser creation, owner logs in at `https://tahamohamadi.ir/admin/`. The MFA middleware (`apps/security/mfa.py`) must redirect to TOTP setup before granting admin access. Owner scans QR code with authenticator app, verifies OTP, then gains full admin access.

### Step 7: Caddy integration

Add admin reverse-proxy snippet to the main Caddyfile (`infra/caddy/static-site.caddy` or deployed `/etc/caddy/Caddyfile`):

```caddyfile
# CMS admin reverse-proxy (P3 deploy)
handle /admin/* {
    reverse_proxy cms:8000
    header X-Robots-Tag "noindex, nofollow"
}

handle /health/* {
    reverse_proxy cms:8000
}
```

The Caddy container must join the `cms_internal` network to reach the `cms` service by name. Add to the Caddy service in compose or use Caddy's `--network` flag.

Validate and reload:

```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```

### Step 8: Smoke tests

```bash
# Anonymous /admin/ → redirect to login
curl -s -o /dev/null -w "%{http_code}" https://tahamohamadi.ir/admin/
# Expected: 302 (redirect to /admin/login/)

# /health/ → 200
curl -s -o /dev/null -w "%{http_code}" https://tahamohamadi.ir/health/
# Expected: 200

# /admin/ with valid staff session (owner verifies in browser after OTP)
# Expected: 200 + Wagtail admin dashboard

# Verify noindex header
curl -sI https://tahamohamadi.ir/admin/ | grep -i x-robots-tag
# Expected: X-Robots-Tag: noindex, nofollow
```

## Resource limits

The VPS has 2 vCPU / ~4 GiB RAM / 30 GB disk co-hosting the static site + CMS runtime. The old stack is decommissioned (RISK-0004 CLOSED). Suggested allocation:

| Service | Memory limit | CPU limit | Rationale |
|---|---|---|---|
| `db` (PostgreSQL 17) | 512 MiB | 0.50 | Lightweight CMS database; no heavy queries expected |
| `cms` (Django/gunicorn) | 512 MiB | 0.50 | 2 gunicorn workers; Wagtail admin + API |
| Caddy | (system) | (system) | Reverse-proxy + static file serving; lightweight |
| OS + other | ~3 GiB | — | Remaining headroom for OS, SSH, backup timer, Docker daemon |

Total CMS stack: 1 GiB reserved. Headroom: ~3 GiB for OS + Caddy + other processes. If memory pressure observed (`docker stats`, `free -h`), reduce gunicorn workers to 1 or lower `mem_limit` with monitoring.

## Rollback

Full rollback is non-destructive (PostgreSQL volume preserved):

1. Stop the CMS stack:
   ```bash
   docker compose -f infra/cms/docker-compose.cms.yml down
   ```
   Volumes (`postgres_data`, `cms_static`, `cms_media`) are preserved by default.

2. Remove admin Caddy snippet from the Caddyfile (restore from backup):
   ```bash
   cp /etc/caddy/Caddyfile.backup-<timestamp> /etc/caddy/Caddyfile
   caddy validate --config /etc/caddy/Caddyfile
   systemctl reload caddy
   ```

3. Verify static site restored:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://tahamohamadi.ir/
   # Expected: 200
   curl -s -o /dev/null -w "%{http_code}" https://tahamohamadi.ir/admin/
   # Expected: 404 (no reverse-proxy)
   ```

4. Optional: remove Docker volumes (destructive — all CMS data lost):
   ```bash
   docker compose -f infra/cms/docker-compose.cms.yml down -v
   ```

Rollback does NOT affect the static site, the Git repository or CI workflows.

## Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| AC-01 | `infra/cms/` NOT-APPLIED markers removed | `grep -r "NOT-APPLIED" infra/cms/` returns nothing |
| AC-02 | `.dockerignore` exists at repo root with correct exclusions | File present; excludes `.venv`, `*.sqlite3`, `__pycache__`, `.git`, `node_modules` |
| AC-03 | `.env.example` exists in `infra/cms/` with all required keys (placeholder values) | File present; keys match compose `env_file` reference |
| AC-04 | Docker image builds successfully on VPS | `docker compose -f infra/cms/docker-compose.cms.yml build` exits 0 |
| AC-05 | Both containers (`db`, `cms`) healthy | `docker compose ps` shows `healthy` for both |
| AC-06 | Django migrations applied | `docker compose exec cms python manage.py migrate` exits 0; no pending migrations |
| AC-07 | Owner creates superuser | Owner confirms interactive `createsuperuser` completed |
| AC-08 | MFA enforced on first admin login | Owner confirms TOTP setup required before admin access; middleware in `apps/security/mfa.py` active |
| AC-09 | `/admin/` anonymous → 302 redirect to login | `curl -s -o /dev/null -w "%{http_code}" https://tahamohamadi.ir/admin/` returns 302 |
| AC-10 | `/health/` → 200 | `curl -s -o /dev/null -w "%{http_code}" https://tahamohamadi.ir/health/` returns 200 |
| AC-11 | `/admin/` with OTP-verified staff → 200 | Owner verifies in browser |
| AC-12 | `X-Robots-Tag: noindex, nofollow` header on `/admin/` | `curl -sI https://tahamohamadi.ir/admin/` includes header |
| AC-13 | Static site unchanged | `curl -s -o /dev/null -w "%{http_code}" https://tahamohamadi.ir/` returns 200; `/fa/` and `/en/` unchanged |
| AC-14 | Caddyfile validated and reloaded | `caddy validate` exits 0; `systemctl reload caddy` exits 0 |
| AC-15 | No ports published to host | `docker port <cms_container>` returns empty; Caddy reaches cms via `cms_internal` network only |
| AC-16 | Resource limits set per compose file | `docker inspect` confirms `Memory` limits on both services |
| AC-17 | Backup timer still active | `systemctl status taha-backup.timer` shows active on VPS |
| AC-18 | Rollback tested (dry-run) | Agent documents rollback commands; owner confirms rollback path is clear |
| AC-19 | WORK_LOG entry created | Entry in `docs/status/WORK_LOG.md` with scope, commands, results, decisions |
| AC-20 | RISK-0009 → CLOSED | `docs/status/RISK_REGISTER.md` updated with evidence |
| AC-21 | PROJECT_MANIFEST updated | Canonical deploy commands added; gate status reflects CMS runtime deployed |
| AC-22 | AGENTS.md gate updated | Gate section reflects CMS runtime deployed (if gate moves) |

## Deferred items

| ID | Item | Why deferred | Target |
|---|---|---|---|
| DEFER-MEDIA | Media upload exposure | Needs security hardening beyond P3 (MIME validation exists but runtime media serving needs review) | Separate media runtime Task Spec |
| DEFER-API | Public CMS API exposure | Needs auth review (Ninja schema exists but public endpoint not authorized) | Separate API exposure Task Spec |
| DEFER-CONTACT | Contact persistence | Needs separate Task Spec + contact form design + spam protection | P4 or later |
| DEFER-0014 | Media alt-by-locale | Requires media runtime phase | After CMS deploy |

## Documentation to update

- `docs/status/WORK_LOG.md` — new entry with deploy scope, commands executed, results, decisions.
- `docs/status/RISK_REGISTER.md` — RISK-0009 status → CLOSED with evidence.
- `docs/status/deferred-validation.md` — any new deferred items from this deploy.
- `PROJECT_MANIFEST.md` — canonical CMS deploy/migrate commands; gate status.
- `AGENTS.md` — gate status update (if gate moves from P3 code-first).
- `docs/governance/RELEASE_POLICY.md` — gate status reference (if applicable).
- `Task-list.md` — P3 deploy checkbox ticked.

## Handoff

- Files changed (task-owned only): `infra/cms/Dockerfile.cms`, `infra/cms/docker-compose.cms.yml`, `infra/cms/Caddyfile.cms.snippet`, `infra/cms/README.md`, `infra/cms/.env.example` (new), repo-root `.dockerignore` (new), `infra/caddy/static-site.caddy`, `docs/plan/P3-cms-deploy-task-spec.md` (this file), `docs/status/*`, `PROJECT_MANIFEST.md`, `AGENTS.md`.
- Verification actually run (command + result): recorded in WORK_LOG after each step.
- Deferred/risk IDs: RISK-0009 → CLOSED (CMS runtime deployed), RISK-0003 → evidence required before deploy (P3 prerequisite), DEFER-MEDIA, DEFER-API, DEFER-CONTACT, DEFER-0014.
- Explicit blockers and next input: all prerequisites (P1–P7) must PASS before any deploy action. Owner provides `POSTGRES_PASSWORD` and `DJANGO_SECRET_KEY`. Owner executes `createsuperuser` interactively. Owner verifies MFA setup + admin login.
