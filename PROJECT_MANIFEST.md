# Project Manifest

**Status:** P0-G0 — `PASS for static-only P1` (2026-08-14) **+ P3 CMS runtime PARTIAL (2026-08-16)**. Wagtail `/admin/login/` and CMS `/health/` are live on `tahamohamadi.ir`; `/static*` Caddy proxy, password hygiene and MFA first-login remain (`RISK-0009` OPEN). `RISK-0003` still lacks CMS-postgres restore evidence. Staging از 2026-08-15 decommission شده است (ADR-0025).  
**Last verified:** 2026-08-16  
**Source of truth for commands:** این فایل؛ دستور تأییدنشده را اجرا یا مستند نکنید.

## Product and repository

| Field | Value |
|---|---|
| Product | Taha Mohammadi Personal Research, Professional & Knowledge Platform |
| Canonical remote | `https://github.com/tahamohamadi-ir/Taha-personal-platform.git` |
| Repository visibility | Public |
| Default branch | `main` |
| Public production domain | `tahamohamadi.ir` |
| Staging domain | DECOMMISSIONED (ADR-0025, 2026-08-15) — `staging.tahamohamadi.ir` Caddy block and DNS removed; dev/deploy directly on production |
| Root locale | `/` Language Gateway |
| Locale roots | `/fa/` (RTL) and `/en/` (LTR) |
| Admin route | `/admin/` — Wagtail live; `/static/*` proxied (smoke CSS 200); RISK-0009 residual = password + TOTP |

## Approved architecture

| Layer | Approved baseline | Current state |
|---|---|---|
| Public frontend | Astro + TypeScript + React Islands | Scaffolded; static-only P1 built and deployed (static P1 live on tahamohamadi.ir) — Language Gateway + `/fa/` + `/en/` landing |
| Styling/UI | Tailwind CSS + project design system + shadcn/Radix | Tailwind v4 + project design tokens applied; shadcn/Radix not used in P1 |
| Backend/CMS/API | Python 3.12.13 + Django 5.2.9 LTS + Wagtail 7.4.2 LTS + Django Ninja 1.6.2 | Runtime live as Compose `taha-cms` on `127.0.0.1:18000`; public `/admin*` + `/health/` proxied; `/static*` not yet; `/api/` and `/media/` not public |
| Database | PostgreSQL 17 (Compose `taha-cms-db-1`) | Provisioned for CMS only; restic restore/import evidence still `RISK-0003` |
| Public search | Pagefind at the approved phase | Not provisioned |
| Deployment | Docker Compose + Caddy on VPS | Static artifact via `/opt/taha/site/current`; CMS Compose live; Caddy `/static*` handle still required |
| Git/CI | GitHub + GitHub Actions hosted standard runners | Workflows `ci.yml` (web) and `ci-cms.yml` (CMS) green on hosted runners on `main` |
| Backup | Encrypted restic repository through rclone on Google Drive | restic 0.18.1 and Ubuntu rclone 1.60.1 build installed; OAuth, repository, PostgreSQL/media/config snapshots, `restic check`, retention, enabled daily timer and isolated file-level restore verified; staging database import remains |

Python 3.12 is selected for ecosystem maturity and remains security-supported through October 2028. Wagtail 7.4 LTS and Django 5.2 LTS officially support this combination. Exact patch versions are selected together in the first dependency lockfile, not guessed in this Manifest.

## Repository ownership

```text
apps/web/               Astro public frontend
apps/cms/               Django, Wagtail and Django Ninja
infra/                  Caddy, Compose, deploy and backup infrastructure
docs/adr/               accepted/proposed architecture decisions
docs/governance/        durable project policies
docs/status/            work, risk, deferred and debt ledgers
docs/templates/         task specifications
.github/                GitHub Actions workflows and repository automation
```

## Environments and infrastructure

| Environment | Purpose | State | Data rule |
|---|---|---|---|
| `dev` | Local Windows control plane; WSL only for Linux/Docker tests | Available | fake/sanitized only |
| `staging` | DECOMMISSIONED (ADR-0025, 2026-08-15) | `staging.tahamohamadi.ir` Caddy block and DNS removed; dev/deploy directly on production | — |
| `prod` | `tahamohamadi.ir` | Static P1 deployed (2026-08-16, release-aae2cb9, checksum `349db221`) | published, approved and backed-up data only |

Production host is an active Ubuntu 26.04 LTS VPS with 2 vCPU, ~3910 MB RAM (~4 GiB, owner decision 2026-08-15: keep the 4 GiB plan — `RISK-0007` CLOSED) and 30 GB disk. It co-hosts the static site and Compose `taha-cms` (cms + postgres on `127.0.0.1:18000`). The VPS is **not** approved for Gitea, a CI runner, Redis, Celery, OpenSearch, Neo4j, Kubernetes or other additional always-on services.

## Security and operations constraints

- Any Codex SSH connection or deployment requires explicit owner approval and a completed Task Spec. `RISK-0002` is closed on the owner's attestation that the exposed root credential was independently rotated; the key-only named non-root operator path is verified.
- SSH VPN is additional access protection, not a replacement for SSH key authentication, firewall policy, patching or least privilege.
- The backup destination is Google Drive, but its OAuth credential, restic password and rclone configuration must live outside Git in a password manager/approved secret store.
- GitHub Actions artifacts and caches are CI outputs, never the backup system of record.
- Browser locale preference may be suggested or remembered; it must never force a redirect or hide the visible language switcher.

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

No application install, test, lint, build, run, migration, deployment or backup command is approved yet. Those commands are added only after the corresponding app/infrastructure exists and is verified on a clean checkout.

## Canonical commands — `apps/web/` (P1 static frontend, verified 2026-08-14)

```powershell
# working directory: apps/web/
npm install        # reproducible install with package-lock.json
npm run check      # astro check (typecheck) — verified: 0 errors / 0 warnings
npm run build      # astro build — verified: static output in dist/
npm run preview    # serve built artifact locally — verified with curl (routes 200)
npm audit          # dependency security scan — verified: 0 vulnerabilities
```

CMS runtime operator commands are in the image block below (`update-cms.sh`, `smoke-cms.sh`). Code-verification commands in the `apps/cms/` block remain the local CI baseline.

## Canonical commands — `apps/cms/` (P3 code-first, verified 2026-08-15)

```powershell
# working directory: apps/cms/ (Python 3.12.13 via uv; Hermes interpreter forbidden)
uv sync --python 3.12          # reproducible install from pyproject.toml + uv.lock
$env:DJANGO_SETTINGS_MODULE = "config.settings.test"
uv run ruff check .            # verified: All checks passed
uv run python manage.py check  # verified: no issues (only upstream treebeard E001 advisory warnings)
uv run python manage.py makemigrations --check --dry-run   # verified: No changes detected
uv run pytest -q               # verified locally; count grows with suite
```

### Canonical commands — CMS runtime image (P3, operator)

```bash
# pin immutable tag from GHCR (CI: ci-cms-image.yml)
export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:<git-sha>
./infra/deploy/update-cms.sh
./infra/deploy/smoke-cms.sh https://tahamohamadi.ir

# inside container — venv is on PATH
docker compose -f infra/cms/docker-compose.cms.yml exec cms python manage.py migrate --noinput
docker compose -f infra/cms/docker-compose.cms.yml exec cms python manage.py createsuperuser
```

Architecture: Caddy edge + versioned static artifact + Compose only for CMS/Postgres.
See `infra/cms/README.md`. `RISK-0009` stays OPEN until `/static*` is proxied, the
admin password is rotated, and TOTP first-login is confirmed.

## Agent tooling (developer workstation, verified 2026-08-15)

| Tool | Verified state | Boundary |
|---|---|---|
| OpenCode | `1.18.18`; project config remains under `.opencode/` | Developer tooling only; it does not enter the application artifact |
| RTK | Official Windows `rtk-ai/rtk` `0.45.0` binary at `C:\Users\Taha\.local\bin\rtk.exe`; official OpenCode plugin installed at `C:\Users\Taha\.config\opencode\plugins\rtk.ts` | Global OpenCode shell-output compaction only; no Claude shell-wide hook, project dependency, provider/model change, CI change or production effect |

RTK's token figures are local estimates of compacted command output, not a
billing guarantee. Fresh OpenCode main-agent and delegated general sub-agent
sessions both demonstrated automatic rewriting; already-running sessions must
be restarted to load the plugin. Operational rules and rollback are in
`docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` and
`docs/plan/R0-rtk-opencode-task-spec.md`.

## P1 first-live technical decisions (G0-04 freeze)

> Exact patch versions are fixed in the first dependency lockfile at scaffold time, not here. This table freezes the *decisions* needed for the R2 static-only release; anything not required for R2 is explicitly `NOT USED IN R2`.

| Decision | Value | Status |
|---|---|---|
| Package manager | npm (npm/npx 11.18.0) | VERIFIED |
| Node runtime | Node.js 24.16.0 (active LTS line, present in environment) | VERIFIED |
| Frontend framework | Astro static-first; latest stable `7.2.2` observed via `npm view astro version`; exact patch pinned in first lockfile | VERIFIED for decision |
| TypeScript | Project source is typed; version pinned in first lockfile (Astro-supported) | VERIFIED for decision |
| Styling | Tailwind CSS v4 + project design tokens from `docs/design.md` | VERIFIED for decision |
| React islands | Not installed in R2 (no single approved, tested, valuable interaction) | NOT USED IN R2 |
| shadcn/Radix | Not added until a concrete P1 interaction justifies it | NOT USED IN R2 |
| Motion / GSAP / Three.js | Locked in `apps/web/` for a future, explicitly approved island; `motion` 13.1.0, `gsap` 3.15.0 and `three` 0.185.1 are installed but have no import, client bundle or R2 behavior | AVAILABLE, NOT USED IN R2 |
| D3 / React Three Fiber | Not installed; evaluate only for a documented visualization requirement | NOT USED IN R2 |
| Design DNA / external UI resources | Design DNA is a local Codex skill, not a production dependency; Beautiful UI and UI8 DNA have no approved local artifact or verified use-right | TOOLING ONLY; `DEFER-0012` |
| Search (Pagefind) | Not used in R2 | NOT USED IN R2 |
| Analytics | Not used in R2 (no provider/consent/retention approved) | NOT USED IN R2 |
| Dark mode | Not in R2; full dark mode deferred with ID | NOT USED IN R2 |
| Fonts | Self-hosted `Vazirmatn Variable` for `fa`/Arabic script + `Inter Variable` for `en`/Latin script; both OFL-1.1 and locked in `apps/web/` | VERIFIED |
| Logo | Approved asset or a text mark only; no invented geometry | OPEN (owner) |
| Media | Static curated assets only (portrait/OG optional) | OPEN (owner) |
| Health/SEO skeleton | Static `/health`, locale-aware 404, robots + sitemap skeleton | VERIFIED for decision |

Remaining owner/release decisions: final logo asset, approved contact path, OG image and production deploy authorization for the upcoming release from HEAD. The P1 font decision is recorded in ADR-0019. Staging and its Cloudflare robots edge behavior are resolved by ADR-0025 (DEFER-0011 CLOSED).

## Explicitly not used initially

```text
Gitea / Gitea Actions / self-hosted CI runner
Redis / Celery / dedicated queue
Elasticsearch / OpenSearch / Neo4j / dedicated vector database
Kubernetes / microservices
Node.js public production runtime
```

## Open decisions and gate blockers

- Rotate root credential and define non-root SSH-key access (`RISK-0002`) via `docs/governance/SERVER_ACCESS_RUNBOOK.md`.
- Set up and test encrypted Google Drive backup, retention and restore (`RISK-0003`) after secure access and audit, per `docs/governance/BACKUP_POLICY.md`.
- Select production WSGI/ASGI server, worker count, media layout, monitoring and exact deploy mechanics in P0-A ADRs.
- `RISK-0007` (staging capacity) is CLOSED. `RISK-0009` is OPEN (live admin without `/static*` proxy, weak-password bypass, MFA first-login unconfirmed). `RISK-0003` still needs CMS-postgres restore/import evidence before contact persistence. `/api/` and `/media/` stay unpublished.
