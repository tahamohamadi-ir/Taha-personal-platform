# Task Specification — Unified Compose + CMS origin + CD

**Status:** `IN_PROGRESS` (ADR-0027 accepted). Slice 0 done; Slice 1 cutover **live** on VPS (2026-08-20, PR #50 / `a29838d`, LOG-0174). Later slices are separate PRs.

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

### Slice 2 — CD updates CMS image (owner-attended first)

- After `ci-cms-image` success, CD SSH: `pg_dumpall` → `CMS_IMAGE` pin → `update-cms.sh` → `smoke-cms.sh`.
- New `RISK-0012`. First production run is not unattended. HMAC still off (`DEFER-0027`).

### Slice 3 — CMS origin honesty

- Build fails or emits explicit stale-cache headers/pages when API errors; do not silently prefer committed `profile.snapshot.json` over a successful empty published list.
- No invented copy.

### Slice 4 — Caddy in Compose (`DEFER-0031`)

- Mount certs; single public 80/443; host Caddy disabled for this site. Separate rollback rehearsal.

### Slice 5 — `DEFER-0030` story bodies (project, research, experience)

- Reuse `StoryBody.astro`. Independent of Slice 4.

## Non-goals

- Public React; Wagtail uninstall; apt/SSH port; enabling HMAC; Playwright §18; P8–P11; second unattended migrate in Slice 0.

## Allowed files by slice

- 0: `docs/**`, `AGENTS.md`, `Task-list.md`, `infra/deploy/smoke-cms.sh`
- 1+: `infra/cms/**`, `.github/workflows/**`, `apps/web/**` as needed, docs ledgers

## Verification

- Slice 0: script grep for `/admin-wagtail/login/`; no live VPS required.
- Slice 1: docker build web; compose config valid; loopback smoke `/` + `/health.json` 200; owner `caddy-sync` after pull.
- Skip full pytest/Playwright unless the slice touches CMS Python.

## Rollback

- CMS: previous sha (`9940e79` before `b6bea6a`).
- Web: previous `taha-web` tag or restore `current` symlink until cutover.
- Caddy: timestamped host Caddyfile.

## Handoff

- Slice 1 Caddy cutover is **live** (LOG-0174): owner `caddy-sync` + `smoke-cms.sh` PASS on 2026-08-20.
- Next agent starts Slice 2 (CD CMS image migrate) from this spec; first run owner-attended (`RISK-0012`).
- Owner: after admin publish, `bash infra/deploy/rebuild-web.sh` (not `rebuild-static.sh`).
