# Project Manifest

**Status:** P0-G0 `PASS for static-only P1` (2026-08-14) **+ P3 CMS runtime live** (2026-08-16) **+ P4–P6 public routes live** (2026-08-17) **+ CMS-managed About/profile live** (2026-08-18). Staging decommissioned (ADR-0025, 2026-08-15).  
**Last verified:** 2026-08-18 (production CMS migrate/seed + CD redeploy; LOG-0150, owner VPS 2026-08-18)  
**Source of truth for commands:** این فایل؛ دستور تأییدنشده را اجرا یا مستند نکنید.

## Product and repository

| Field | Value |
|---|---|
| Product | Taha Mohammadi Personal Research, Professional & Knowledge Platform |
| Canonical remote | `https://github.com/tahamohamadi-ir/Taha-personal-platform.git` |
| Repository visibility | Public |
| Default branch | `main` |
| Public production domain | `tahamohamadi.ir` |
| Staging domain | DECOMMISSIONED (ADR-0025, 2026-08-15) — dev/deploy directly on production |
| Root locale | `/` Language Gateway |
| Locale roots | `/fa/` (RTL) and `/en/` (LTR) |
| Admin routes | `/admin/` Wagtail + TOTP; `/admin/profiles/` custom Profile editor (same-origin session) |
| Public CMS API | `/api/*` published-only Ninja JSON (`DEFER-0017` CLOSED); profile at `/api/profiles/<locale>/about` |

## Approved architecture

| Layer | Approved baseline | Current state (2026-08-18) |
|---|---|---|
| Public frontend | Astro + TypeScript + React Islands | Static artifact live: Gateway, landing, About (CMS-backed + snapshot fallback), About section/detail routes, CV, blog, research, projects, 404, health, robots, sitemap |
| Styling/UI | Tailwind CSS + project design system + shadcn/Radix | Tailwind v4 + design tokens; shadcn/Radix not used |
| Backend/CMS/API | Python 3.12.13 + Django 5.2.9 LTS + Wagtail 7.4.2 LTS + Django Ninja 1.6.2 | Compose `taha-cms` on `127.0.0.1:18000`; image `ghcr.io/tahamohamadi-ir/taha-cms:31c6560`; `/admin*`, `/static*`, `/health/`, `/api/*` proxied; `/media/` proxied; upload/contact persistence unpublished |
| Database | PostgreSQL 17 (`taha-cms-db-1`) | CMS postgres live; migrations through `content.0006`; Profile seed imported (`en`, `fa`); isolated restore evidence `RISK-0003` CLOSED |
| Public search | Pagefind at the approved phase | Not provisioned |
| Deployment | Docker Compose + Caddy on VPS | Static via `/opt/taha/site/current` (CD on `main` push); CMS via `update-cms.sh`; VPS has no Node — use CD or off-box build for static |
| Git/CI | GitHub Actions hosted runners | `ci.yml`, `ci-cms.yml`, `ci-cms-image.yml`, `cd.yml` green on `main` |
| Backup | Encrypted restic via rclone on Google Drive | Daily job includes CMS postgres dump; isolated restore rehearsal CLOSED (`RISK-0003`, LOG-0140) |

Python 3.12 is selected for ecosystem maturity and remains security-supported through October 2028. Wagtail 7.4 LTS and Django 5.2 LTS officially support this combination. Exact patch versions are pinned in lockfiles.

## Repository ownership

```text
apps/web/               Astro public frontend
apps/cms/               Django, Wagtail and Django Ninja
infra/                  Caddy, Compose, deploy and backup infrastructure
docs/                   policies, ADRs, contracts, planning, status ledgers
docs/adr/               accepted/proposed architecture decisions
docs/contracts/         binding IA and design contract cards
docs/governance/        durable project policies and runbooks
docs/plan/              task specs and plan index (docs/plan/README.md)
docs/status/            work, risk, deferred and debt ledgers
docs/templates/         task specifications
.github/                GitHub Actions workflows and repository automation
```

Read order for agents: `AGENTS.md` → `docs/README.md` → this file → active Task Spec.

## Environments and infrastructure

| Environment | Purpose | State | Data rule |
|---|---|---|---|
| `dev` | Local Windows control plane; WSL for Linux/Docker tests | Available | fake/sanitized only |
| `staging` | DECOMMISSIONED (ADR-0025) | — | — |
| `prod` | `tahamohamadi.ir` | Static **release-f11d2fc** (CD 2026-08-18, built with `CMS_API_BASE=https://tahamohamadi.ir`); CMS image **31c6560** with profile seed | published, approved and backed-up data only |

Production host: Ubuntu 26.04 LTS VPS, 2 vCPU, ~4 GiB RAM (`RISK-0007` CLOSED), 30 GB disk. Co-hosts static site and Compose `taha-cms`. The VPS is **not** approved for Gitea, a CI runner, Redis, Celery, OpenSearch, Neo4j, Kubernetes or other additional always-on services. **Node/npm are not installed on the VPS** — static builds run in GitHub Actions (`cd.yml`) or on a developer machine.

## Security and operations constraints

- Codex SSH or deployment requires explicit owner approval and a completed Task Spec. `RISK-0002` CLOSED (key-only operator path).
- Backup OAuth/restic credentials live outside Git in an approved secret store.
- GitHub Actions artifacts are CI outputs, not the backup system of record.
- Browser locale preference may be suggested; it must never force redirect or hide the language switcher.

## Canonical commands verified at P0-G0

```powershell
git status --short --branch
git diff --check
rg --files
node --version
npm --version
npx --version
uv --version
docker --version
docker compose version
```

## Canonical commands — `apps/web/` (verified 2026-08-18)

```powershell
# working directory: apps/web/
npm install
npm run check      # astro check — verified: 0 errors (69 files)
npm run build      # astro build — verified: 40 pages with CMS_API_BASE set
npm run preview
npm audit

# optional CMS-backed local build
$env:CMS_API_BASE = "http://127.0.0.1:18000"
npm run build

# dist-only About/profile regression (no HTTP server)
node qa/cms-profile-build.spec.mjs
```

## Canonical commands — `apps/cms/` (verified 2026-08-18)

```powershell
# working directory: apps/cms/ (Python 3.12.13 via uv)
uv sync --python 3.12
$env:DJANGO_SETTINGS_MODULE = "config.settings.test"
uv run ruff check .
uv run python manage.py check
uv run python manage.py makemigrations --check --dry-run
uv run pytest -q               # verified: 174 passed
```

### Canonical commands — CMS runtime (operator, VPS `/home/deploy/cms-repo`)

```bash
export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:31c6560   # pin immutable sha
./infra/deploy/update-cms.sh    # pull, up, migrate --noinput, loopback health
./infra/deploy/smoke-cms.sh https://tahamohamadi.ir

# one-time or after deploy when schema/seed changed
docker compose -f infra/cms/docker-compose.cms.yml exec -T cms python manage.py showmigrations content
docker compose -f infra/cms/docker-compose.cms.yml exec -T cms python manage.py import_profile_seed

# static site after CMS content changes (VPS has no Node — prefer CD rerun on main)
# bash infra/deploy/rebuild-static.sh   # requires Node 24 on host
```

Architecture: Caddy edge + versioned static artifact + Compose for CMS/Postgres only.  
See `infra/cms/README.md` and `docs/governance/DEPLOY_RUNBOOK.md`.  
`RISK-0009` CLOSED. `RISK-0003` CLOSED. `DEFER-0017` CLOSED (public `/api/`).  
Contact persistence and media *upload* remain unpublished. `DEFER-0015` CLOSED in repo; owner rebuild for prod recovery codes if needed.

## Agent tooling (developer workstation, verified 2026-08-15)

| Tool | Verified state | Boundary |
|---|---|---|
| OpenCode | `1.18.18`; project config under `.opencode/` | Developer tooling only |
| RTK | `rtk-ai/rtk` `0.45.0` at `C:\Users\Taha\.local\bin\rtk.exe` | OpenCode output compaction only |

## P1 first-live technical decisions (G0-04 freeze)

> Decisions for R2 static-only release. Items not required for R2 are `NOT USED IN R2`.

| Decision | Value | Status |
|---|---|---|
| Package manager | npm 11.18.0 | VERIFIED |
| Node runtime | Node.js 24.16.0 | VERIFIED |
| Frontend framework | Astro 7.2.2 (pinned in lockfile) | VERIFIED |
| TypeScript | Astro-supported, pinned in lockfile | VERIFIED |
| Styling | Tailwind CSS v4 + design tokens | VERIFIED |
| React islands | Not used in public shell | NOT USED IN R2 |
| shadcn/Radix | Not added until justified | NOT USED IN R2 |
| Motion / GSAP / Three.js | Locked, unused in public build | AVAILABLE, NOT USED IN R2 |
| Search (Pagefind) | Later phase | NOT USED IN R2 |
| Analytics | Not in R2 | NOT USED IN R2 |
| Dark mode | Deferred | NOT USED IN R2 |
| Fonts | Vazirmatn Variable (fa) + Inter Variable (en), self-hosted | VERIFIED |
| Logo | PNG in `apps/web/public/logo.png` | VERIFIED (2026-08-16) |
| Health/SEO skeleton | Static health, locale 404, robots, sitemap | VERIFIED |

## Explicitly not used initially

```text
Gitea / self-hosted CI runner on VPS
Redis / Celery / dedicated queue
Elasticsearch / OpenSearch / Neo4j
Kubernetes / microservices
Node.js on production VPS
```

## Open decisions and remaining work

| ID / area | Status | Notes |
|---|---|---|
| `RISK-0002` SSH access | CLOSED | Key-only `deploy` operator |
| `RISK-0003` backup/restore | CLOSED | CMS postgres in daily restic; isolated import evidence LOG-0140 |
| `RISK-0007` capacity | CLOSED | 4 GiB plan retained |
| `RISK-0009` CMS runtime | CLOSED | Admin, static proxy, TOTP |
| `DEFER-0017` public `/api/` | CLOSED | LOG-0143 |
| `DEFER-0015` TOTP recovery | CLOSED in repo | Owner rebuild on prod if not yet deployed |
| `DEFER-0018` RSS/Atom | OPEN | Blog feed |
| `DEFER-0022` local Playwright preview | OPEN | Dist-only `qa/cms-profile-build.spec.mjs` + CI cover build |
| Contact form persistence | BLOCKED | Honest unpublished copy; no backend until Task Spec |
| Media upload (public) | BLOCKED | `/media/` proxied; no published uploads yet |
| P7 professional admin (remainder) | QUEUED | `/admin/profiles/` shipped; ops dashboard, composition, advanced preview remain |
| `P0-A-stack-inventory` | BLOCKED (owner) | Read-only VPS inventory |
