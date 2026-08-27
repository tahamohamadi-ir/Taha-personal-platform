# Project Manifest

**Status:** P14 ATLAS — implementation reference canonical (planning, not live). Reference root `Assets/site-redesign/implementation-reference/` — branch `p14c-visual-atlas`, commit `7d9b87f` (`7d9b87f3c2b04542e13c189adab3b57f2108d84a`). Frontend rebuild from scratch in `apps/web` (Astro 7 + TypeScript 5.9 + Tailwind CSS 4 + React 19 islands) **NOT STARTED**; existing `apps/web` static remains live runtime until ATLAS packets are accepted and merged. **+ P3..P8 live (2026-08-17/18/23):** custom React admin SPA at `/admin/` (ADM-1 cutover LOG-0163); Django staff HTML at `/staff/` (LOGIN_URL, preview, MFA fallback — Wagtail removed, `DEBT-0003` CLOSED / LOG-0193); `/static/*` + CMS `/health/` proxied; TOTP enrolled (`RISK-0009` CLOSED); public published-only `/api/` + `/media/` (`DEFER-0017` CLOSED); P4–P6/P8 routes live. `RISK-0003` CLOSED (2026-08-17, LOG-0140); `DEFER-0015` CLOSED (hashed recovery codes in repo; owner rebuild to activate on prod); `DEFER-0023` CLOSED. Staging decommissioned (ADR-0025). **Public pages stay no-JS readable; React remains an island, not the public-site shell** (MASTER-SPEC §2–3, §9). **Frontend/admin separation is invariant (ADR-0026) and must not be violated.**
**Last verified:** 2026-08-26
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
| Admin route | `/admin/` — custom React SPA (ADM-1 cutover); Django staff HTML at `/staff/` (LOGIN_URL, preview, MFA fallback — Wagtail removed `DEBT-0003` CLOSED); `/api/v1/admin/*` (ADR-0026); `/static/*` proxied; TOTP enrolled (`RISK-0009` CLOSED) |
| Implementation reference root | `Assets/site-redesign/implementation-reference/` — **next-generation frontend brief only** (planning/handoff, not live runtime) — branch `p14c-visual-atlas`, commit `7d9b87f` (`7d9b87f3c2b04542e13c189adab3b57f2108d84a`); read order `README.md` → `MASTER-SPEC.md` §1–6, §11 → `AGENT-COORDINATION.md` → `MULTI-AGENT-TASK-LIST.md` → `agent-kit/*.json` + `ACCEPTANCE-GATES.md` |

## Approved architecture

| Layer | Approved baseline | Current state |
|---|---|---|
| Public frontend | **Astro 7 + TypeScript 5.9 + Tailwind CSS 4 + React 19 islands** — next-gen dual-theme Design System (24 components per `agent-kit/components.json` + 6 templates per `agent-kit/templates.json`) + local Visual Atlas (`DESIGN_ATLAS=1` → `/_design/` local-only, not in prod). Public content remains semantic and readable without JavaScript (MASTER-SPEC §2, §9). | **NOT STARTED** (next-gen rebuild). Existing `apps/web` static remains live runtime until ATLAS packets merged — Language Gateway + `/fa/` + `/en/` landing + P4–P6 (`/{locale}/writing/`, `/{locale}/research/`, `/{locale}/projects/`) + P8 (`/{locale}/publications/`, `/{locale}/books/`, `/{locale}/talks/`, `/{locale}/downloads/`) + `/{locale}/search/` (Pagefind) + CMS-managed About gated details. **Invariant (ADR-0026):** `apps/web` is a separate project/build/route from `apps/cms`; no shared writable worktree, no merged bundle. Default `npm run build` must not contain `/_design/`, atlas fixtures, or atlas nav. |
| Styling/UI | Tailwind CSS v4 + `agent-kit/tokens.json` — Light `runtime-authoritative` (`#f7f8f5` canvas, `#ffffff` surface, `#182328` ink…), Dark `design-target` (`#071225` canvas, `#0b1630` surface, `#f7f3ea` ink…) + spacing/radius/type/motion/layout tokens; glass restricted to Language Gateway + sticky Header | Current runtime token authority remains `apps/web/src/styles/global.css`; next-gen semantic roles defined in `agent-kit/tokens.json` (`authority.runtime` / `semanticLight.status=runtime-authoritative`, `semanticDark.status=design-target`). `MASTER-SPEC.md` outranks `reDesign_plan.md` §12–13 on conflicts. Dark not active in production until ATLAS-01 establishes dual-theme contract (`docs/contracts/DESIGN-CONTRACT.md` + `apps/web/src/design-system/contracts.ts` + `qa/design-tokens.spec.mjs`). |
| Backend/CMS/API | Python 3.12.13 + Django 5.2.9 LTS + Django Ninja 1.6.2; custom React admin SPA (`apps/cms/admin-frontend/` → `/admin/`) + Django staff HTML (`/staff/`, `LOGIN_URL`, preview, MFA fallback) per ADR-0026; public published-only projections `/api/` + `/media/` (`is_active` only for anonymous) | Runtime live as Compose `taha-cms` on `127.0.0.1:18000`; public `/admin*`, `/static*`, `/health/`, published-only `/api/` + `/media/` proxied. CMS image `116c241` live (2026-08-23, LOG-0216, `content.0013` + `content.0014`). **Invariant (ADR-0026):** `apps/cms` (+ `admin-frontend`) is a separate project, separate build, separate route from `apps/web`; no shared writable worktree, no merged bundle. Profile aggregate at `/api/profiles/<locale>` (+ slug) gated detail routes only with Latin slug + non-empty body. |
| Database | PostgreSQL 17 (Compose `taha-cms-db-1`) | Provisioned for CMS only; `RISK-0003` CLOSED (2026-08-17, LOG-0140). Dumpdata + backup required before any schema migration; ATLAS-08 audit is the gate before any CMS migration (ATLAS-09). |
| Public search | Pagefind at the approved phase | Live: `/{locale}/search/` (Wave 5). Atlas fixtures, drafts and private media must never enter the production Pagefind index; local-only fixtures live outside public loaders. |
| Deployment | Docker Compose + Caddy on VPS | **Runtime target (ADR-0027):** one Compose project `taha-cms` = `db` + `cms` + `web` (nginx serving Astro HTML) + **`caddy`** (profile `edge`, live TLS since LOG-0210). Old `/opt/taha/repository` `taha-prod-*` stack **gone** (LOG-0216); host systemd Caddy inactive/disabled. `CMS_CD_AUTO_MIGRATE` remains unset. Deploy still requires **CI green (web + cms) + production smoke** (`/admin/login/` + `/staff/login/` + `/health/` / `/health.json`). No ATLAS production deploy without separate owner approval, backup, rollback and smoke. |
| Git/CI | GitHub + GitHub Actions hosted standard runners | Workflows `ci.yml` (web) and `ci-cms.yml` (CMS) green on hosted runners on `main`. ATLAS packets use `AGENT-COORDINATION.md` branching/ownership + `ATLAS-00` baseline freeze before workers. |
| Backup | Encrypted restic repository through rclone on Google Drive | restic 0.18.1 and Ubuntu rclone 1.60.1 build installed; OAuth, repository, PostgreSQL/media/config snapshots, `restic check`, retention, enabled daily timer and isolated file-level restore verified. |

Python 3.12 is selected for ecosystem maturity and remains security-supported through October 2028. Django 5.2 LTS officially supports this combination; Wagtail 7.4 LTS removal is complete per ADR-0026 / LOG-0193 (`DEBT-0003` CLOSED). Exact patch versions are selected together in the first dependency lockfile, not guessed in this Manifest. Next-gen public stack is Astro 7 / TypeScript 5.9 / Tailwind CSS 4 / React 19 per `MULTI-AGENT-TASK-LIST.md` Tech Stack (validated in reference — not invented here).

## Repository ownership

```text
apps/web/               Astro public frontend only — next-gen rebuild from Assets/site-redesign/implementation-reference/ (Astro+TS+Tailwind v4+React islands); Visual Atlas (DESIGN_ATLAS=1 -> /_design/) is local-only and must NOT appear in default production build
apps/cms/               Django + Django Ninja only (Wagtail removed, DEBT-0003 CLOSED); custom React admin SPA (admin-frontend/) at /admin/ + Django staff HTML at /staff/
Assets/site-redesign/implementation-reference/   next-gen frontend brief only (planning/handoff, not live) — MASTER-SPEC.md, agent-kit/*.json, AGENT-COORDINATION.md, MULTI-AGENT-TASK-LIST.md, ACCEPTANCE-GATES.md; authority is brief ownership — runtime authority remains apps/web/src/styles/global.css + merged source until a packet is accepted
infra/                  Caddy, Compose, deploy and backup infrastructure (canonical Caddy: infra/cms/Caddyfile.cms.snippet / infra/caddy/Caddyfile)
docs/adr/               accepted/proposed architecture decisions (ADR-0026 frontend/admin separation, ADR-0027 runtime target, ADR-0025 staging decommissioned)
docs/governance/        durable project policies
docs/status/            work, risk, deferred and debt ledgers
docs/templates/         task specifications
docs/contracts/         IA-CONTRACT.md and DESIGN-CONTRACT.md — runtime contracts until ATLAS packets reconcile them
docs/plan/              active Task Spec index and plans (ATLAS packets activated by integration lead per AGENT-COORDINATION.md)
.github/                GitHub Actions workflows and repository automation
```

Do not recreate `frontend/` or `backend/`; the canonical paths are `apps/web/` and `apps/cms/`.

Do not invent a new infrastructure service (Redis, Celery, OpenSearch, Neo4j, Kubernetes, self-hosted runner, or other always-on service) — VPS is Compose `taha-cms` + Caddy + static web only. The local-only Visual Atlas (`DESIGN_ATLAS=1` → `/_design/`) imports production components for review; it is **never a second library, never a content source, and never in a default production build**.

## Environments and infrastructure

| Environment | Purpose | State | Data rule |
|---|---|---|---|
| `dev` | Local Windows control plane; WSL only for Linux/Docker tests | Available | fake/sanitized only |
| `staging` | DECOMMISSIONED (ADR-0025, 2026-08-15) | `staging.tahamohamadi.ir` Caddy block and DNS removed; dev/deploy directly on production | — |
| `prod` | `tahamohamadi.ir` | Static P4+P5+P8 routes live; CMS `116c241` live with public `/api/` + `/media/` (DEFER-0017 CLOSED); custom admin at `/admin/` + `/staff/`; next-gen ATLAS rebuild **NOT STARTED** (planning only) | published, approved and backed-up data only |

Production host is an active Ubuntu 26.04 LTS VPS with 2 vCPU, ~3910 MB RAM (~4 GiB, owner decision 2026-08-15: keep the 4 GiB plan — `RISK-0007` CLOSED) and 30 GB disk. It co-hosts the current stack as Compose `taha-cms` (`db` + `cms` + `web` + `caddy` profile `edge` at `127.0.0.1:18000`). The VPS is **not** approved for Gitea, a CI runner, Redis, Celery, OpenSearch, Neo4j, Kubernetes or other additional always-on services.

## Security and operations constraints

- Any Codex SSH connection or deployment requires explicit owner approval and a completed Task Spec. `RISK-0002` is closed on the owner's attestation that the exposed root credential was independently rotated; the key-only named non-root operator path is verified.
- SSH VPN is additional access protection, not a replacement for SSH key authentication, firewall policy, patching or least privilege.
- The backup destination is Google Drive, but its OAuth credential, restic password and rclone configuration must live outside Git in a password manager/approved secret store.
- GitHub Actions artifacts and caches are CI outputs, never the backup system of record.
- Browser locale preference may be suggested or remembered; it must never force a redirect or hide the visible language switcher.
- **Frontend/admin separation is invariant (ADR-0026):** `apps/web` (public Astro frontend, including local-only Visual Atlas) and `apps/cms` + `apps/cms/admin-frontend` remain **separate projects, separate builds, separate routes**. No shared writable worktree, no merged bundle — must not be violated.
- Public pages stay no-JS readable; React is an island, not the public-site shell (MASTER-SPEC §2–3, §9). The Visual Atlas is local-only (`DESIGN_ATLAS=1`); default `npm run build` output is atlas-free (no `/_design/`, no fixture strings in sitemap/Pagefind/index).
- Public projections never expose drafts, private media, internal notes, credentials, phone/personal Gmail, or inactive assets. Loopback rebuild: `rebuild-static.sh` until Caddy web cutover; after cutover `rebuild-web.sh` (LOG-0173).

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

No application install, test, lint, build, run, migration, deployment or backup command is approved yet unless listed in the `apps/web/` or `apps/cms/` blocks below or in `AGENTS.md`. Do not invent commands.

## Canonical commands — `apps/web/` (P1 static frontend, verified 2026-08-14; P14 ATLAS — rebuild NOT STARTED)

```powershell
# working directory: apps/web/
npm install        # reproducible install with package-lock.json
npm run check      # astro check (typecheck) — verified: 0 errors / 0 warnings
npm run build      # astro build — verified: static output in dist/ (default build MUST NOT contain /_design/)
npm run preview    # serve built artifact locally — verified with curl (routes 200)
npm run test:e2e   # Playwright lifecycle (create→publish→public fa/en); needs admin SPA build + uv CMS — see apps/web/qa/e2e/README.md
npm audit          # dependency security scan — verified: 0 vulnerabilities
```

ATLAS local-only commands (not part of default production build):

```powershell
# working directory: repository root or apps/web/
npm run atlas                                   # local-only Visual Atlas — launches Astro with DESIGN_ATLAS=1 via apps/web/scripts/design-atlas.mjs → conditional injectRoute for /_design/ in apps/web/astro.config.mjs (Windows/Linux cross-platform)
node Assets/site-redesign/implementation-reference/agent-kit/validate.mjs   # reference-kit validator — expected PASS: 24 components, 6 templates, 10 asset references, offline Figma builder (ATLAS-00 gate G0)
DESIGN_ATLAS=1 npm run build                    # atlas-present build (local only) — verify default build stays atlas-free per G4
```

Default `npm run build` must produce no `_design/index.html`, no sitemap entry, no Pagefind entry and no fixture string. Atlas fixtures live outside public content loaders, contain no real private contact data or invented academic facts, and render a visible `unpublished: true` warning. Validate the kit with `node Assets/site-redesign/implementation-reference/agent-kit/validate.mjs`.

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
See `infra/cms/README.md`. `RISK-0009` is CLOSED (static proxy + password rotate +
production TOTP). `DEFER-0015` is CLOSED (recovery codes in repo; owner rebuild for prod).
`RISK-0003` is CLOSED (2026-08-17, LOG-0140). Public `/api/`/`/media/` are live
published-only (`DEFER-0017` CLOSED). Custom admin rebuild phases per ADR-0026 (§17).

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

## P1 first-live technical decisions (G0-04 freeze) + P14 ATLAS next-gen decisions

> Exact patch versions are fixed in the first dependency lockfile at scaffold time, not here. G0-04 freezes the *decisions* needed for the R2 static-only release; anything not required for R2 is explicitly `NOT USED IN R2`. ATLAS rows below record the next-generation decisions validated in `Assets/site-redesign/implementation-reference/` (planning, not live) — they do NOT change runtime until their ATLAS packet is accepted and merged.

| Decision | Value | Status |
|---|---|---|
| Package manager | npm (npm/npx 11.18.0) | VERIFIED |
| Node runtime | Node.js 24.16.0 (active LTS line, present in environment) | VERIFIED |
| Frontend framework (P1) | Astro static-first; latest stable `7.2.2` observed via `npm view astro version`; exact patch pinned in first lockfile | VERIFIED for decision |
| Frontend rebuild (ATLAS) | **Astro 7 + TypeScript 5.9 + Tailwind CSS 4 + React 19 islands** per `MULTI-AGENT-TASK-LIST.md` Tech Stack (validated in reference) — semantic Astro shell, React limited to interactive islands | **NOT STARTED** — existing `apps/web` static remains runtime; rebuild is ATLAS-01..07 packets, NOT USED IN PROD until merged |
| TypeScript | Project source is typed; version pinned in first lockfile (Astro-supported) | VERIFIED for decision; ATLAS target TypeScript 5.9 |
| Styling (P1) | Tailwind CSS v4 + project design tokens from `docs/design.md` | VERIFIED for decision |
| Tokens (ATLAS) | **Light `runtime-authoritative`** (`#f7f8f5` canvas, `#ffffff` surface, `#182328` ink…) + **Dark `design-target`** (`#071225` canvas, `#0b1630` surface, `#f7f3ea` ink…) per `agent-kit/tokens.json` (`authority.runtime=apps/web/src/styles/global.css`, `semanticLight.status=runtime-authoritative`, `semanticDark.status=design-target`) | **NOT STARTED** — runtime authority remains `apps/web/src/styles/global.css`; `MASTER-SPEC.md` outranks `reDesign_plan.md` §12–13. Dark activates only via ATLAS-01 (`global.css` + `docs/contracts/DESIGN-CONTRACT.md` + `contracts.ts` + `qa/design-tokens.spec.mjs`) |
| Components / Templates (ATLAS) | **24 components** (`agent-kit/components.json`) + **6 templates** (`agent-kit/templates.json`: home, collection-index, editorial-index, long-form-detail, evidence-visual-detail, about-contact-utility) | **NOT STARTED** — none built; 24/6 covered by acceptance gates G2/G3; ATLAS-02..05 packets |
| Visual Atlas (ATLAS) | Local-only `DESIGN_ATLAS=1` → `/_design/` via `apps/web/scripts/design-atlas.mjs` + conditional `injectRoute` in `apps/web/astro.config.mjs`; imports production components/tokens, not a second library | **NOT STARTED** — ATLAS-06 packet; G4 gate requires default build has no `/_design/` output, sitemap or fixture; validate via `node agent-kit/validate.mjs` |
| React islands (P1) | Not installed in R2 (no single approved, tested, valuable interaction) | NOT USED IN R2 — ATLAS target is React 19 islands (public pages stay no-JS readable) |
| shadcn/Radix | Not added until a concrete P1 interaction justifies it | NOT USED IN R2 |
| Motion / GSAP / Three.js (P1 + ATLAS) | Locked in `apps/web/` for a future, explicitly approved island; `motion` 13.1.0, `gsap` 3.15.0 and `three` 0.185.1 are installed but have no import, client bundle or R2 behavior | AVAILABLE, NOT USED IN R2 — ATLAS bound to separately approved task(s) only (ATLAS-10 Phase 1 2D; 3D via optional G8 packet after G7) |
| D3 / React Three Fiber | Not installed; evaluate only for a documented visualization requirement | NOT USED IN R2 |
| Design DNA / external UI resources | Design DNA is a local Codex skill, not a production dependency; Beautiful UI and UI8 DNA have no approved local artifact or verified use-right | TOOLING ONLY; `DEFER-0012` |
| Search (Pagefind) | Not used in R2 | NOT USED IN R2 — now live at `/{locale}/search/` (Wave 5); ATLAS fixtures excluded from index |
| Analytics | Not used in R2 (no provider/consent/retention approved) | NOT USED IN R2 |
| Dark mode | Not in R2; full dark mode deferred with ID | NOT USED IN R2 — now design-target in `tokens.json`; implementation is ATLAS-01 (G1 gate) |
| Fonts (P1) | Self-hosted `Vazirmatn Variable` for `fa`/Arabic script + `Inter Variable` for `en`/Latin script; both OFL-1.1 and locked in `apps/web/` | VERIFIED (ADR-0019) |
| Fonts (ATLAS) | Per MASTER-SPEC §6: English display **Newsreader** + body **Inter Variable**; Persian display **Estedad** + body **Vazirmatn Variable**; max 2 families per locale; body 16px min, Latin 1.6 / Persian 1.9 line-height, ~62ch measure | **TARGET** — ATLAS-01/03 adopts Newsreader/Estedad for display alongside existing Inter/Vazirmatn; no locale exceeds 2 families |
| Logo | Approved asset or a text mark only; no invented geometry | OPEN (owner) — existing authoritative logo reused without redrawing (ATLAS-03) |
| Media | Static curated assets only (portrait/OG optional) | OPEN (owner) |
| Health/SEO skeleton | Static `/health`, locale-aware 404, robots + sitemap skeleton | VERIFIED for decision |

Remaining owner/release decisions: final logo asset, approved contact path, OG image and production deploy authorization for the upcoming release from HEAD. The P1 font decision is recorded in ADR-0019. Staging and its Cloudflare robots edge behavior are resolved by ADR-0025 (DEFER-0011 CLOSED). Next-gen delivery is packetized as **ATLAS-00..12** per `MULTI-AGENT-TASK-LIST.md`; no CMS migration, graph work, or production cutover without its explicit gate, owner approval, backup and rollback.

## Explicitly not used initially

```text
Gitea / Gitea Actions / self-hosted CI runner
Redis / Celery / dedicated queue
Elasticsearch / OpenSearch / Neo4j / dedicated vector database
Kubernetes / microservices
Node.js public production runtime
Storybook / design SaaS subscription
New runtime services, arbitrary CMS migrations, or production publication as part of the reference-package task (MASTER-SPEC §12)
Default production exposure of /_design/ Visual Atlas (local-only DESIGN_ATLAS=1 per MASTER-SPEC §2, §7 — G4 gate)
Figma as implementation input (review/reference only — MASTER-SPEC §2)
```

## Open decisions and gate blockers

- Rotate root credential and define non-root SSH-key access (`RISK-0002`) via `docs/governance/SERVER_ACCESS_RUNBOOK.md`.
- Select production WSGI/ASGI server, worker count, media layout, monitoring and exact deploy mechanics in P0-A ADRs.
- `RISK-0007` (staging capacity) is CLOSED. `RISK-0009` is CLOSED (admin/static/health + password + TOTP on production). `RISK-0003` CLOSED (2026-08-17, LOG-0140). `/api/` and `/media/` are live published-only (`DEFER-0017` CLOSED). `DEFER-0015` CLOSED (recovery codes in repo; owner rebuild).
- **Custom admin rebuild (ADR-0026, 2026-08-18):** Wagtail removal and the React admin SPA + `/api/v1/admin/*` are owner-authorized; execution is phased ADM-0..ADM-6 (see `Task-list.md` §17), each phase with its own Task Spec. All admin work branches from `origin/main`; content is preserved (seed data, dumpdata fixture, backup before migrations). Wagtail package removal complete (`DEBT-0003` CLOSED / LOG-0193); CMS image `116c241` live.
- **P14 ATLAS next-generation frontend (planning, not live):** Reference `Assets/site-redesign/implementation-reference/` (branch `p14c-visual-atlas`, commit `7d9b87f`) is canonical. Execution is **ATLAS-00..12** per `MULTI-AGENT-TASK-LIST.md` global constraints + execution board; no packet is executable until the integration lead activates its repository Task Spec (AGENT-COORDINATION.md). Progress gates are `ACCEPTANCE-GATES.md` **G0..G9**:
  - **ATLAS-00** Freeze baseline — `node agent-kit/validate.mjs` PASS (24 components, 6 templates, 10 assets) + worktree evidence (G0).
  - **ATLAS-01..07** Tokens → primitives → shell/gateway → content components → 6 templates → local-only atlas → route-family adoption; each with its own tests, Work Log entry and focused commit. Concurrent packets must not overlap on `global.css`, shell, `astro.config.mjs`, `package.json` or shared ledgers.
  - **ATLAS-08 CMS audit before schema** — read-only `CMS-GAP-REPORT.md` mapping `MASTER-SPEC.md` CMS boundary against actual models/admin endpoints/migrations (`exists | partial | absent | conflicting`); **no CMS migration before approved gap report** (G6).
  - **ATLAS-09** CMS implementation only of owner-approved packets from ATLAS-08, each with dump/backup, reversible migration, DTO mapping and audit validation.
  - **ATLAS-10** Graph Phase 1 (2D + semantic list from one published payload) before optional 3D (G7/G8); motion/gsap/three only via this task.
  - **ATLAS-11..12** Independent QA + documentation reconciliation via `DOCUMENT-MIGRATION-MAP.md` (G9); **no production deploy without separate owner approval, backup, rollback, CI + smoke**.
- **Frontend/admin separation invariant (ADR-0026) — non-negotiable:** `apps/web` and `apps/cms` (`+ admin-frontend`) remain separate projects, separate builds, separate routes. No shared writable worktree, no merged bundle — any proposal that merges them must be rejected.
- **Complementary improvements (proposals, `docs/plan/custom-admin-rebuild-fa.md` §14):** reading time, JSON-LD additions, URL-driven filters, lightbox gallery, FTS Persian, service layer, Playwright config, Vitest, feature flags, Lighthouse CI, manual-test checklists — integrated into `Task-list.md` (P4/P6/P10/ADM/release checklist) and BACKLOG; each accepted via its own Task Spec and owner priority. Next-gen document reconciliation owners are listed in `Assets/site-redesign/implementation-reference/DOCUMENT-MIGRATION-MAP.md` (ATLAS-12).
