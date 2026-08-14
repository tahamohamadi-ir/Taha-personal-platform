# Project Manifest

**Status:** P0-G0 draft — `RISK-0001` و `RISK-0003` باید پیش از عبور gate بسته یا مطابق Release Policy پذیرفته شوند.  
**Last verified:** 2026-08-14  
**Source of truth for commands:** این فایل؛ دستور تأییدنشده را اجرا یا مستند نکنید.

## Product and repository

| Field | Value |
|---|---|
| Product | Taha Mohammadi Personal Research, Professional & Knowledge Platform |
| Canonical remote | `https://github.com/tahamohamadi-ir/Taha-personal-platform.git` |
| Repository visibility | Public |
| Default branch | `main` |
| Public production domain | `tahamohamadi.ir` |
| Planned staging domain | `staging.tahamohamadi.ir` — DNS/deploy not yet configured |
| Root locale | `/` Language Gateway |
| Locale roots | `/fa/` (RTL) and `/en/` (LTR) |
| Admin route | `/admin/` — app not yet deployed |

## Approved architecture

| Layer | Approved baseline | Current state |
|---|---|---|
| Public frontend | Astro + TypeScript + React Islands | Not scaffolded |
| Styling/UI | Tailwind CSS + project design system + shadcn/Radix | Not scaffolded |
| Backend/CMS/API | Python 3.12 (latest supported patch) + Django 5.2 LTS + Wagtail 7.4 LTS + Django Ninja | Not scaffolded |
| Database | PostgreSQL | Not provisioned |
| Public search | Pagefind at the approved phase | Not provisioned |
| Deployment | Docker Compose + Caddy on VPS | Existing live stack: Caddy plus a healthy frontend/backend/PostgreSQL Compose project; project-specific configuration is not provisioned and must remain isolated from it |
| Git/CI | GitHub + GitHub Actions hosted standard runners | Workflow not created; P0-A only |
| Backup | Encrypted restic repository through rclone on Google Drive | restic 0.18.1 and Ubuntu rclone 1.60.1 build installed; OAuth, repository, PostgreSQL/media/config snapshots, `restic check`, retention and an enabled/active daily systemd timer verified; staging restore remains |

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
| `staging` | `staging.tahamohamadi.ir` | DNS and isolated Caddy placeholder verified externally and direct-origin as 503; application not deployed | non-sensitive representative data |
| `prod` | `tahamohamadi.ir` | Existing VPS; application not deployed | published, approved and backed-up data only |

Production host is an active Ubuntu VPS with 1 vCPU, 2 GB RAM and 30 GB NVMe. It is sufficient for the static-first baseline and a modest Django/PostgreSQL runtime, but it is **not** approved for Gitea, a CI runner, Redis, Celery, OpenSearch, Neo4j, Kubernetes or other additional always-on services.

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
- Configure DNS/HTTPS and prove control of production and staging domains; the approved staging record is defined in the same runbook.
- Set up and test encrypted Google Drive backup, retention and restore (`RISK-0003`) after secure access and audit, per `docs/governance/BACKUP_POLICY.md`.
- Select production WSGI/ASGI server, worker count, media layout, monitoring and exact deploy mechanics in P0-A ADRs.
- Install the latest supported Python 3.12 patch and add the first locked dependency manifests only when P0-A/P3 explicitly authorizes scaffolding.
