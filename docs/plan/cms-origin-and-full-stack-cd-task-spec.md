# Task Specification — Unified Compose + CMS origin + CD

**Status:** `IN_PROGRESS` (ADR-0027 accepted). Slice 0–2 done in production evidence (Slice 2 attended CD migrate PASS 2026-08-20, LOG-0179). Slice 4 Compose Caddy **in repo** (LOG-0191); live TLS cutover owner-gated (`DEFER-0031` / `RISK-0013` OPEN). Slice 3+ separate. `RISK-0012` OPEN (auto migrate still off).

## Task: One Compose network; CMS origin; CD updates cms and web

- Goal: Each runtime part is a container (`db`, `cms`, `web`, later `caddy`). Public HTML stays no-JS (nginx serves Astro `dist`). CI/CD pins sha images. CMS is the content origin.
- User/actor: Owner publishes in `/admin/`; after web image rebuild, visitors see published rows. Operator does not maintain two unrelated deploy stories forever.
- Release type: `HIGH-RISK` for CD-migrate; `STANDARD` for `web` container + smoke fix
- Risk level: High for TLS/Caddy move and auto-migrate; Medium for nginx `web` behind host Caddy
- Owner: agent implements slices → owner attends first production compose/CD migrate
- Related: ADR-0027; ADR-0008/0017 amended not rewritten; PR #46 live on CMS `b6bea6a`

## Opinion locked in ADR-0027 (do not reopen in code review)

- Unified Compose **yes**.
- Public **React SPA no**.
- Production **Node SSR no** for v1 (4 GiB). nginx + baked HTML is the dynamic path.
- Host Caddy **until `web` is live**, then Caddy-in-compose (`DEFER-0031`).

## Production evidence already true (do not re-run migrate)

Owner 2026-08-19: `CMS_IMAGE=…:b6bea6a`, backup `/home/deploy/backups/pre-migrate-20260819-133409/`, migrations `content.0008` and `composition.0002` **OK**. Loopback `/admin/login/` 200. Treebeard E001 = known Wagtail noise. Second run “No migrations to apply” is expected.

False smoke: `smoke-cms.sh` probed `/admin-wagtail/accounts/login/` (302). Real login is `/admin-wagtail/login/` (`LOGIN_URL`). Slice 0 fixes the script. **Do not treat that FAIL as a failed migrate.**

`mkdir` without sudo under `/home/deploy/backups` can 403; the migrate script creates the backup dir itself.

## Slices (execute in order; one PR per slice unless noted)

### Slice 0 — this PR

- ADR-0027 + this spec + AGENTS/README/runbook pointers.
- Fix `infra/deploy/smoke-cms.sh` to `/admin-wagtail/login/` and match Wagtail/sign-in HTML.
- Record owner migrate in WORK_LOG. No Compose layout change yet.

### Slice 1 — `web` container + Caddy cutover (**done in repo**; owner applies Caddy)

- `infra/web/Dockerfile.web`: copy `apps/web/dist` into nginx:alpine; listen 8080.
- `docker-compose.cms.yml`: service `web`, `127.0.0.1:13080:8080`, mem limit ≤256m.
- CI: build/push `taha-web:<sha>` after `npm run build` with `CMS_API_BASE`.
- CD: pull `web` image and `up -d web`; `infra/caddy/Caddyfile` `(taha_application_routes)` now `reverse_proxy 127.0.0.1:13080` (auto-sync via `caddy-sync.sh` on deploy).
- Rollback path until rsync removal: restore `file_server` on `/opt/taha/site/current` in the snippet.
- `smoke-cms.sh` checks loopback `/` and `/health.json` on 13080.
- Targeted check: `npm run check` + image build locally. No Playwright matrix.

### Slice 2 — CD updates CMS image (owner-attended first) (**done**; attended PASS LOG-0179)

- `infra/deploy/cd-cms-migrate.sh`: `pg_dumpall` → pin `CMS_IMAGE` → `update-cms.sh` → `smoke-cms.sh`.
- CD job `cms-migrate` (`.github/workflows/cd.yml`): **off** on ordinary pushes. Owner runs Actions → CD → **Run workflow** → `migrate_cms=true` (optional `cms_image_tag`). Unattended later only if repo var `CMS_CD_AUTO_MIGRATE=true` (skips when GHCR tag missing).
- First attended production CD migrate **PASS** 2026-08-20 (`2e200fe`, Actions 32407698471). `RISK-0012` CLOSED on that evidence. Leave `CMS_CD_AUTO_MIGRATE` unset. HMAC still off (`DEFER-0027`).
- Attended web rebuild path (Slice 1+): `infra/deploy/cd-rebuild-web.sh` + CD job `rebuild-web` gated by `workflow_dispatch` `rebuild_web=true` only (LOG-0197). No auto var. Production PASS not recorded until owner dispatch succeeds.

### Slice 3 — CMS origin honesty

- Build fails or emits explicit stale-cache headers/pages when API errors; do not silently prefer committed `profile.snapshot.json` over a successful empty published list.
- No invented copy.

### Slice 4 — Caddy in Compose (`DEFER-0031`) — **repo done; live cutover owner-gated**

- Compose service `caddy` (official `caddy:2.9-alpine`), profile `edge` so ordinary
  `compose up -d` / CD does not bind 80/443 while host Caddy is live.
- `infra/caddy/Caddyfile.compose`: Docker DNS upstreams `web:8080` / `cms:8000`;
  mounts `/data` (ACME), `/config`, `/var/www/html` (fonts/presentation).
- Host disable path: `infra/caddy/HOST-CADDY-DISABLE.md` (`systemctl disable --now caddy`).
- Reload helper: `infra/deploy/caddy-compose-reload.sh`.
- CD: repository variable `CADDY_EDGE=compose` switches sync from host
  `caddy-sync.sh` to Compose reload (default remains host).
- Rollback rehearsal documented in `DEPLOY_RUNBOOK` (restore host Caddyfile bak,
  stop Compose `caddy`, re-enable systemd Caddy).
- `RISK-0013` OPEN until cutover PASS. `DEFER-0031` stays OPEN until production
  TLS move is evidenced (repo readiness alone does not close it).
- **Not done by agents:** VPS cutover, setting `CADDY_EDGE`, enabling
  `CMS_CD_AUTO_MIGRATE`.

### Slice 5 — `DEFER-0030` story bodies (project, research, experience) (**done in repo**)

- Reuse `StoryBody.astro`. Independent of Slice 4.
- Code: `content.0010_entity_stories`; public/admin wiring; LOG-0181. Owner migrate before production.

## Non-goals

- Public React; Wagtail uninstall; apt/SSH port; enabling HMAC; Playwright §18; P8–P11; second unattended migrate in Slice 0.

## Allowed files by slice

- 0: `docs/**`, `AGENTS.md`, `Task-list.md`, `infra/deploy/smoke-cms.sh`
- 1+: `infra/cms/**`, `.github/workflows/**`, `apps/web/**` as needed, docs ledgers

## Verification

- Slice 0: script grep for `/admin-wagtail/login/`; no live VPS required.
- Slice 1: docker build web; compose config valid; loopback smoke `/` + `/health.json` 200; owner `caddy-sync` after pull.
- Slice 4: `docker compose -f infra/cms/docker-compose.cms.yml --profile edge config` validates; no live VPS TLS move in the PR.
- Skip full pytest/Playwright unless the slice touches CMS Python.

## Rollback

- CMS: previous sha (`9940e79` before `b6bea6a`).
- Web: previous `taha-web` tag or restore `current` symlink until cutover.
- Caddy: timestamped host Caddyfile.

## Handoff

- Slice 2 attended CD migrate is **PASS** (LOG-0179, Actions [32407698471](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32407698471)). Do **not** set `CMS_CD_AUTO_MIGRATE=true` unless owner accepts unattended migrate (`RISK-0012` still OPEN).
- Slice 4 Compose Caddy is **in repo** (LOG-0191): profile `edge`, `Caddyfile.compose`, cutover/rollback in DEPLOY_RUNBOOK. Owner must attend live TLS cutover before closing `DEFER-0031` / resolving `RISK-0013`. Do not set `CADDY_EDGE=compose` until smoke PASS after cutover.
- Next agent starts Slice 3 (CMS origin honesty) or other ADM slices on separate branches; Slice 4 live cutover is owner-only.
- After admin publish: `bash infra/deploy/rebuild-web.sh`.
- Future CMS image bumps: Actions → CD → Run workflow → `migrate_cms=true` + `cms_image_tag=<sha>` after **CMS image** workflow publishes the tag.