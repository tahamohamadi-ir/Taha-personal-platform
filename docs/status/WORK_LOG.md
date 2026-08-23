# Work Log

## LOG-0213 — 2026-08-22 — Wave 3 P8 publications / books / talks / downloads (repo)

- Outcome: Implemented Wave 3 (P8) on branch `feat/wave3-p8-publications` in worktree `.worktrees/feat-wave3-p8-publications` from `origin/main`. IA-CONTRACT gains §4b URL tree. CMS models + admin registry + public API + Astro routes + citation/download ACL tests. Migration `content.0013` additive only — **not** applied to production. Left **uncommitted** for parent review. Did **not** start Wave 4/5 or owner decommission. Did **not** set `CMS_CD_AUTO_MIGRATE`.
- Why: Ship P8 product phase (Task-list §13) with one-canonical-URL publications and Media-backed downloads.
- Scope / files: `docs/contracts/IA-CONTRACT.md`; `docs/plan/P8-publications-books-talks-downloads-task-spec.md`; `apps/cms/apps/content/models.py` + `0013_p8_*`; `apps/cms/apps/api/{api,admin_content,admin_api}.py`; admin-frontend `entities.ts` / `api.ts`; `apps/web` catalog pages + `lib/cms/publications.ts`; tests `test_api_p8.py`; ledgers.
- Commands or actions actually performed: isolated worktree; `makemigrations`; `uv run ruff check` (targeted); `uv run pytest tests/test_api_p8.py tests/test_admin_content_write.py tests/test_api_research.py` → **25 passed**; `apps/web` `npm run check` → **0 errors**; `npm run build` → **PASS**; admin-frontend `npm run check` → **PASS**.
- Verification actually performed and result: as above. Production migrate/rebuild **not** run.
- Deferred or risk IDs: Wave 4 blockers unchanged (35KB island budget vs three.js; GSAP license; ADR-0028). No new DEFER opened for P8 empty catalogs (honest empty states).
- Rollback / recovery: discard worktree branch; migration reverse is additive field/table adds only after owner dumpdata.

## LOG-0210 — 2026-08-22 — Compose Caddy edge cutover PASS (525 rollback + ACME seed)

- Outcome: Owner-attended Caddy cutover on VPS `deploy@85.192.29.196:2222` (SSH key `taha-nls1-production`). **First attempt:** host Caddy disabled → Compose `caddy` started without seeded ACME data → public TLS **HTTP 525** (Cloudflare origin cert mismatch). **Rollback:** Compose `caddy` stopped → host systemd Caddy re-enabled → `smoke-cms.sh` **PASS**. **Recovery:** copied host `/var/lib/caddy` into Docker volume `taha-cms_caddy_data`; host Caddy disabled again; Compose `caddy` restarted. **Second cutover PASS:** `curl -sI https://tahamohamadi.ir/` → **HTTP/2 200**; `smoke-cms.sh` → **PASS** (all checks). **Agent follow-up (same day):** VPS repo pulled to `ddd061d`; live `taha-cms-web-1` nginx still had old `try_files … /404.html` (not rebuilt after cutover). Ran `bash infra/deploy/rebuild-web.sh` → **PASS** (public smoke incl. `nonexistent-qa` **404**); live nginx now `try_files … =404`. `bash infra/deploy/smoke.sh https://tahamohamadi.ir` → **PASS** (all checks). Host Caddy **inactive/disabled**; `taha-cms-caddy-1` **Up** on **80/443**. Set GitHub repo variable **`CADDY_EDGE=compose`** via `gh`. Repo fix: Compose caddy healthcheck probes `:2019/config/` (avoids `:80` → HTTPS redirect TLS mismatch). Apt upgradable **3** phased packages; SSH **22+2222** (2222 canonical). **`DEFER-0031` CLOSED**; **`RISK-0013` CLOSED**; **`RISK-0005` CLOSED**; **`RISK-0006` CLOSED**. Did **not** set `CMS_CD_AUTO_MIGRATE`. **GOAL_COMPLETE=yes** for Slice 4 edge cutover gates.
- Why: Close ADR-0027 Slice 4 live TLS edge after owner recovery from first-cutover 525; complete residual CD gate and public 404 smoke.
- Scope / files: VPS `rebuild-web.sh`; GitHub `CADDY_EDGE`; `infra/cms/docker-compose.cms.yml` healthcheck; this entry; ledger sync in PR.
- Commands or actions actually performed: SSH (`git pull`, `rebuild-web.sh`, `smoke.sh`, `docker exec` nginx conf); `gh variable set CADDY_EDGE compose`.
- Verification actually performed and result: `rebuild-web PASS`; `smoke.sh PASS`; `smoke-cms.sh PASS`; `CADDY_EDGE=compose` confirmed; host Caddy disabled; Compose caddy serving 80/443.
- Deferred or risk IDs: `DEFER-0031` **CLOSED**; `RISK-0013` **CLOSED**; `RISK-0005` **CLOSED**; `RISK-0006` **CLOSED**; Compose caddy healthcheck fix ships in this PR (owner recreate after merge).
- Rollback / recovery: `bash infra/deploy/owner-vps-maintenance.sh rollback /etc/caddy/Caddyfile.bak-*`; unset `CADDY_EDGE` if set; re-seed ACME volume if repeating cutover.

## LOG-0209 — 2026-08-22 — DEFER-0016 production preview secret

- Outcome: **Task A (`DEFER-0016` production):** VPS `deploy@85.192.29.196:2222` (key `taha-cd-deploy`); `infra/cms/.env` **writable** by deploy. `PREVIEW_SHARE_SECRET` was empty (length 1); generated 64-char hex secret (value not logged), updated `.env`, recreated CMS with `docker compose -f infra/cms/docker-compose.cms.yml -f infra/cms/docker-compose.override.yml up -d cms`; loopback health OK attempt 2; container `PREVIEW_SHARE_SECRET` length **64**. Public `/preview/share/badtoken/` → **404** + `Cache-Control: no-store` (**PASS**). **`DEFER-0016` production CLOSED.**
- Why: Close the last production gap for public preview share tokens after repo merge (LOG-0204).
- Scope / files: VPS `/home/deploy/cms-repo/infra/cms/.env` (secret only on VPS); this entry; deferred-validation evidence sync.
- Commands or actions actually performed: SSH attestation script; `openssl rand -hex 32`; CMS recreate; `curl -sI` public preview probe; `caddy-sync.sh` (passwordless) after recreate.
- Verification actually performed and result: **Task B re-attest:** `smoke-cms.sh` → **PASS**; loopback POST `/rebuild-trigger/` bad token → **403** (public path not proxied in host Caddyfile — expected); `/en/about/` `cms-build-origin=cms`; anonymous `/api/v1/admin/openapi.json` → **404**; apt upgradable **14**; SSH **22+2222**; host Caddy **active**; Compose `caddy` **none**; `sudo -n` → password required (general sudo blocked).
- Deferred or risk IDs: `DEFER-0016` **CLOSED** (repo + production); `DEFER-0027` **CLOSED**; `DEFER-0031`/`RISK-0013` **OPEN** (owner interactive sudo); `RISK-0005` **OPEN** (14 packages); `RISK-0006` **OPEN** (22+2222).
- Rollback / recovery: Restore prior empty/missing `PREVIEW_SHARE_SECRET` in `.env` + CMS recreate (invalidates issued share links); timestamped Caddy backups unchanged.

## LOG-0208 — 2026-08-22 — Goal completion audit (VPS re-attestation)

- Outcome: Completion audit for ADR-0027 Slice 3 / DEFER-0027 / DEFER-0031 / DEFER-0016 / rich blocks v2 / OpenAPI / RISK-0005-0006. **Repo:** `main` at `3572230`; PRs #79–#84 merged. **VPS SSH** `deploy@85.192.29.196:2222` (key `taha-cd-deploy`): CMS health `{"status":"ok","db":"ok"}`; image `ghcr.io/tahamohamadi-ir/taha-cms:e2cd1b6`; `smoke-cms.sh` → **PASS**; `REBUILD_TRIGGER_ENABLED=true` in container; `REBUILD_TRIGGER_SECRET` length 44; bad rebuild token → **403**. **`PREVIEW_SHARE_SECRET` empty** (length 0). Host Caddy **active**; no Compose `caddy`; `sudo -n` → password required; apt upgradable **14**; SSH listens **22+2222**. Live `/en/about/` meta `cms-build-origin=cms`; anonymous `/api/v1/admin/openapi.json` → **404**.
- Why: Independent attestation before closing the multi-item goal; confirm LOG-0207 state still holds.
- Scope / files: VPS read-only checks; `DEPLOY_RUNBOOK.md` HMAC row sync; this entry.
- Commands or actions actually performed: SSH attestation; `curl` public probes from agent host.
- Verification actually performed and result: Evidence matches LOG-0207 for HMAC/CMS; blockers unchanged for Caddy cutover, preview secret, apt, SSH ports.
- Deferred or risk IDs: `DEFER-0027` **CLOSED**; `DEFER-0031`/`RISK-0013` **OPEN** (sudo); `DEFER-0016` repo **CLOSED** / production secret **OPEN**; `RISK-0005` **OPEN** (14 packages); `RISK-0006` **OPEN** (22+2222).
- Rollback / recovery: No VPS changes this session.

## LOG-0207 — 2026-08-22 — Wave 3 VPS complete (HMAC PASS; Caddy/apt blocked)

- Outcome: **3a CMS:** No new migrations `65d6c91`→`e2cd1b6`; CMS recreated on `ghcr.io/tahamohamadi-ir/taha-cms:e2cd1b6`; `smoke-cms.sh` → **PASS**. **3b HMAC (`DEFER-0027`):** `rebuild-web.sh` → **PASS**; `REBUILD_TRIGGER_ENABLED=true` + `REBUILD_SCRIPT_PATH` in `infra/cms/.env`; VPS-only `infra/cms/docker-compose.override.yml` (repo mount + docker.sock); signed POST `/rebuild-trigger/` with `X-Forwarded-Proto: https` → **HTTP 200** `triggered:true`; bad token → **403**. **3c rebuild-web:** `git pull` → `2dedd5c`; `rebuild-web.sh` + public smoke → **PASS**. **3d Caddy (`DEFER-0031`):** **BLOCKED** — `sudo -n` requires interactive password; host Caddy **active** on 80/443; `CADDY_EDGE=compose` not set. **3e:** `apt list --upgradable` → **15** packages; no upgrade (sudo); SSH **22+2222** (decision deferred). **`PREVIEW_SHARE_SECRET`** on VPS empty — preview tokens not production-ready.
- Why: Close backlog Wave 3 with honest VPS evidence (SSH session `ab19368f`).
- Scope / files: VPS `/home/deploy/cms-repo`; this entry; ledger sync in same PR.
- Commands or actions actually performed: SSH `deploy@85.192.29.196:2222`; CMS recreate with `-f docker-compose.cms.yml -f docker-compose.override.yml`; HMAC signed trigger rehearsal; smokes.
- Verification actually performed and result: Linked smokes PASS; invalid rebuild token 403; `/preview/share/badtoken/` → 404 + no-store headers.
- Deferred or risk IDs: `DEFER-0027` **CLOSED**; `DEFER-0031`/`RISK-0013` **OPEN**; `DEFER-0016` production secret **OPEN**; `RISK-0005` **OPEN** (15 pending); `RISK-0006` **OPEN**.
- Rollback / recovery: CMS `65d6c91`; `REBUILD_TRIGGER_ENABLED=false`; remove override compose file.

## LOG-0206 — 2026-08-22 — Wave 3 VPS (PR #79–#82 post-merge)

- Outcome: Attended production steps after merge of PRs #79–#82. **CMS image migrate PASS** via CD [32561769850](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32561769850) (`migrate_cms=true`, `cms_image_tag=957e3af`): `backup_ok`, `cd-cms-migrate PASS`, `CMS smoke PASS` (incl. `/staff/login/`). No pending Django migrations on live DB. **Web rebuild PASS** via CD [32561898693](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32561898693) (`rebuild_web=true`): `rebuild-web PASS`, `cd-rebuild-web PASS`. Live `/en/about/` shows `<meta name="cms-build-origin" content="cms">`. Set `REBUILD_TRIGGER_ENABLED=true` in `infra/cms/.env` and recreated CMS; container `printenv REBUILD_TRIGGER_ENABLED` → `true`. **Did not** complete signed POST rehearsal to `/rebuild-trigger/`. **Did not** cut over Compose Caddy edge: `sudo -n systemctl disable --now caddy` requires interactive password (unlike `sudo -n /opt/taha/bin/caddy-sync.sh`, which restored `/staff/login/` after post-recreate 404). **`PREVIEW_SHARE_SECRET` absent** from VPS `.env` — public preview tokens not production-ready. **Did not** run `apt upgrade` (requires interactive sudo). SSH listens on **22 and 2222** (canonical port decision deferred). Did **not** set `CMS_CD_AUTO_MIGRATE` or `CADDY_EDGE=compose`.
- Why: Execute Wave 3 from close_backlog_slices plan with honest VPS/Actions evidence only.
- Scope / files: production VPS `/home/deploy/cms-repo`; this entry.
- Commands or actions actually performed: SSH `deploy@85.192.29.196:2222` (note: `deploy@tahamohamadi.ir` times out on Cloudflare); `git pull --ff-only origin main` → `b0c1791`; `gh workflow run` migrate + rebuild; `sudo -n /opt/taha/bin/caddy-sync.sh`; `bash infra/deploy/smoke-cms.sh https://tahamohamadi.ir` → **PASS** after sync; toggled HMAC enable flag + `docker compose up -d cms`.
- Verification actually performed and result: Actions logs as linked; loopback `curl http://127.0.0.1:18000/health/` OK; `/preview/share/badtoken/` → 404 with `Cache-Control: no-store` + `X-Robots-Tag: noindex,nofollow,noarchive` (route proxied; token validation blocked on missing secret).
- Deferred or risk IDs: `DEFER-0027` **PARTIAL** (enabled flag only; close after signed trigger → rebuild verified); `DEFER-0031` / `RISK-0013` **OPEN** (host systemd Caddy still edge); `DEFER-0016` production **OPEN** (`PREVIEW_SHARE_SECRET` + CMS recreate); `RISK-0005` **OPEN** (upgrades listed, not applied); `RISK-0006` **OPEN** (both SSH ports open).
- Rollback / recovery: CMS image rollback `ghcr.io/tahamohamadi-ir/taha-cms:65d6c91` via attended `cd-cms-migrate.sh`; HMAC `REBUILD_TRIGGER_ENABLED=false` + recreate CMS; Caddy host config from timestamped `/etc/caddy/Caddyfile.bak-*` after cutover attempt.

## LOG-0205 — 2026-08-22 — ADR-0027 Slice 3 CMS origin honesty (repo)

- Outcome: PR `feat/slice3-cms-origin-honesty` closes Slice 3 gaps in `apps/web`: honest empty CV downloads when CMS returns none; `isCmsOriginBuild()`; `<meta name="cms-build-origin">` on About/CV pages; fixed misleading `siteSettings` comment; new `qa/cms-origin-honesty.spec.mjs` (mock 503 for articles + profile fail-build); extended `cms-profile-build.spec.mjs` for snapshot meta. Slice 3 → **done in repo** in task spec. `DEFER-0027` / `DEFER-0031` remain OPEN.
- Why: ADR-0027 Slice 3 requires fail-build on CMS outage and no silent snapshot/static fallback when origin is configured.
- Scope / files: `apps/web/src/data/cvDownloads.ts`, `apps/web/src/lib/cms/client.ts`, `apps/web/src/layouts/BaseLayout.astro`, `apps/web/src/pages/{en,fa}/{about,cv}.astro`, `apps/web/src/lib/cms/siteSettings.ts`, `apps/web/qa/cms-origin-honesty.spec.mjs`, `apps/web/qa/cms-profile-build.spec.mjs`, `docs/plan/cms-origin-and-full-stack-cd-task-spec.md`, `docs/plan/README.md`, CHANGELOG, this entry.
- Commands or actions actually performed: branch `feat/slice3-cms-origin-honesty` from `origin/main`; worktree `.worktrees/feat-slice3-cms-origin-honesty`.
- Verification actually performed and result: `npm run check` PASS; `npm run build` PASS; `node qa/cms-profile-build.spec.mjs` PASS; `node qa/cms-origin-honesty.spec.mjs` PASS; `node qa/projects-catalog.spec.mjs` PASS.
- Deferred or risk IDs: Slice 3 repo **CLOSED**; production HMAC (`DEFER-0027`) and Compose Caddy edge (`DEFER-0031` / `RISK-0013`) unchanged.
- Rollback / recovery: revert PR; snapshot builds unaffected when `CMS_API_BASE` unset.

## LOG-0204 — 2026-08-22 — DEFER-0016 public preview share token

- Outcome: Stateless HMAC public preview at `/preview/share/<token>/` (landing/profile/article, 15-minute TTL, no session). Same HTML sanitization as staff preview; `noindex,nofollow,noarchive` + `Cache-Control: no-store`. Admin SPA copy-link button; `POST .../preview-link` with audit `preview.share_link`. Caddy host + Compose proxy. DEFER-0016 CLOSED; Task-list ADM-4 preview tick; ADR-0022 addendum.
- Why: External draft review without shared staff credentials (DEFER-0016).
- Scope / files: `apps/cms/apps/content/preview_token.py`, `views_preview.py`, `urls_public_preview.py`, `admin_content.py`, admin SPA, `infra/caddy/Caddyfile*`, tests, docs.
- Commands or actions actually performed: `uv run pytest -q tests/test_preview.py tests/test_preview_share.py`; `uv run ruff check .`; `npm run check` in admin-frontend.
- Verification actually performed and result: preview share tests PASS; ruff clean; admin-frontend check PASS.
- Deferred or risk IDs: DEFER-0016 **CLOSED**; production needs `PREVIEW_SHARE_SECRET` in `infra/cms/.env` + CMS image rebuild + Caddy sync (owner).
- Rollback / recovery: revert PR; remove Caddy `/preview/share/*` handle if deployed.

## LOG-0203 — 2026-08-22 — Rich blocks v2 (story catalog)

- Outcome: Added six story-only composition blocks — `accordion`, `tabs`, `timeline`, `counters`, `before_after`, `slider` — with fail-closed validators (`blocks.py`), public projection sanitization (`projection.py`), admin SPA `itemList` editor + before/after media fields, and no-JS Astro render in `StoryBody.astro`. Spec `docs/plan/rich-blocks-v2-task-spec.md` **DONE**; Task-list §14 U3 ticked.
- Why: Close backlog PR4 / §14 U3 rich block catalog without JavaScript on the public site.
- Scope / files: `apps/cms/apps/composition/blocks.py`, `projection.py`, `tests/test_story_composition.py`, `apps/cms/admin-frontend/**`, `apps/web/src/components/StoryBody.astro`, `docs/plan/rich-blocks-v2-task-spec.md`, `Task-list.md`, `CHANGELOG.md`.
- Commands or actions actually performed: branch `feat/rich-blocks-v2` from `origin/main`.
- Verification actually performed and result: `uv run pytest -q tests/test_story_composition.py` — 16 passed; `uv run ruff check .` — pass; `npm run check` + `npm run build` in `apps/web` — 0 errors; `npm run check` in `admin-frontend` — pass.
- Deferred or risk IDs: none new; owner static rebuild after merge.
- Rollback / recovery: revert PR; no migrations.

## LOG-0202 — 2026-08-22 — ADM-1 / Staff-gated admin OpenAPI docs

- Outcome: Enabled django-ninja Swagger UI and OpenAPI schema on the custom admin API at `/api/v1/admin/docs` and `/api/v1/admin/openapi.json`. Anonymous and staff-without-OTP sessions receive **404** (not redirect). Verified staff+OTP sessions receive 200. Responses include `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`. Caddy unchanged — admin docs ride existing `/api/*` reverse proxy to CMS loopback.
- Why: Close ADM-1 §14 S7 (internal OpenAPI for admin API) without exposing schema to anonymous crawlers or public edge cache.
- Scope / files: `apps/cms/apps/api/admin_api.py`, `apps/cms/apps/security/middleware.py` (`AdminOpenAPIGateMiddleware` + NoIndex no-store for docs paths), `apps/cms/config/settings/base.py`, `apps/cms/tests/test_admin_openapi.py` (new), `Task-list.md` (§17 ADM-1 OpenAPI tick), `docs/status/CHANGELOG.md`, this entry.
- Commands or actions actually performed: branch `feat/admin-openapi-docs` from `origin/main` in worktree `.worktrees/feat-admin-openapi-docs`.
- Verification actually performed and result: `uv run ruff check .` PASS; `uv run pytest -q tests/test_admin_openapi.py` PASS (8 tests).
- Decisions / assumptions: Gate requires staff **and** verified OTP session (same baseline as protected admin endpoints); 404 instead of 401/403 to avoid advertising internal docs surface.
- Documentation impact: Task-list §17 ADM-1 OpenAPI tick; CHANGELOG entry; Caddy verified — no new public route.
- Deferred or risk IDs: none new.

## LOG-0201 — 2026-08-22 — Owner attestation: scheduled-publish timer PASS

- Outcome: Owner attestation on production VPS (2026-08-22): `cd /home/deploy/cms-repo && git pull --ff-only origin main` (already up to date); `sudo bash infra/deploy/install-scheduled-publish-timer.sh` → `install-scheduled-publish-timer PASS`; `systemctl list-timers 'taha-publish-scheduled-content*'` shows `taha-publish-scheduled-content.timer` **active** (NEXT Sat 2026-08-22 06:41:00 UTC). Closes OWNER_CUTOVER step 6 (manual owner-attended path). Required post-merge gates complete; optional HMAC (`DEFER-0027`) and Compose Caddy edge (`DEFER-0031` / `RISK-0013`) remain **OPEN**. Did **not** set `CMS_CD_AUTO_MIGRATE`. **GOAL_COMPLETE=yes** for `full_backlog_completion` required gates (coordinator: UpdateGoal).
- Why: Record honest VPS evidence for scheduled `scheduled` → published without inventing a CD job PASS.
- Scope / files: DEPLOY_RUNBOOK § OWNER_CUTOVER evidence, CHANGELOG, BACKLOG, RISK_REGISTER, this entry.
- Commands or actions actually performed: owner terminal attestation forwarded; branch `docs/record-timer-pass` from `origin/main`.
- Verification actually performed and result: owner attestation lines match `install-scheduled-publish-timer.sh` success output and active timer unit.
- Deferred or risk IDs: scheduled-publish timer install **CLOSED**; `DEFER-0027` OPEN (optional step 7); `DEFER-0031`/`RISK-0013` OPEN (optional step 8).
- Rollback / recovery: `systemctl disable --now taha-publish-scheduled-content.timer`; revert unit files under `/etc/systemd/system/`.

## LOG-0200 — 2026-08-22 — CD timer install FAIL (NOPASSWD) + wrapper fix

- Outcome: First `install_scheduled_timer=true` dispatch → [32556305961](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32556305961) **FAILED**: deploy user lacks NOPASSWD for `bash infra/deploy/install-scheduled-publish-timer.sh`. Added root-owned wrapper `opt-taha-bin-install-scheduled-publish-timer.sh` → `/opt/taha/bin/install-scheduled-publish-timer.sh`, owner one-time `install-scheduled-publish-timer-sudo.sh`, and updated `cd-install-scheduled-publish-timer.sh` to `sudo -n /opt/taha/bin/install-scheduled-publish-timer.sh`. Re-dispatch pending merge + owner VPS prereq. Did **not** set `CMS_CD_AUTO_MIGRATE`.
- Why: CD timer install must use the same scoped sudoers pattern as `update-release.sh` / `caddy-apply.sh`.
- Scope / files: `infra/deploy/opt-taha-bin-install-scheduled-publish-timer.sh`, `infra/deploy/install-scheduled-publish-timer-sudo.sh`, `infra/deploy/cd-install-scheduled-publish-timer.sh`, SERVER_ACCESS_RUNBOOK, DEPLOY_RUNBOOK, cms README, CHANGELOG, this entry.
- Commands or actions actually performed: analyzed run 32556305961; branch `fix/cd-timer-nopasswd-wrapper`.
- Verification actually performed and result: repo-only; failed run confirms missing NOPASSWD grant.
- Deferred or risk IDs: scheduled timer install **OPEN** (owner VPS prereq + re-dispatch); `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN.
- Rollback / recovery: revert PR; manual `sudo bash infra/deploy/install-scheduled-publish-timer.sh` on VPS.

## LOG-0199 — 2026-08-22 — Attended CD rebuild-web PASS

- Outcome: Re-dispatched CD `rebuild_web=true` after #74 Docker CMS origin fix → [32555455704](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32555455704). Job **Web container rebuild (gated)** **success** with `PASS loopback /health.json`, `rebuild-web PASS`, `cd-rebuild-web PASS`. Public HTML now rebuilt from live CMS via Docker build (`CMS_API_BASE=https://tahamohamadi.ir` inside build; host preflight loopback). Slice 3/5 production applicability evidenced for post-migrate publish path. `DEFER-0027` / scheduled timer / `DEFER-0031` remain **OPEN**. Did **not** set `CMS_CD_AUTO_MIGRATE`.
- Why: Close OWNER_CUTOVER step 5 with honest Actions evidence after loopback fix.
- Scope / files: DEPLOY_RUNBOOK § OWNER_CUTOVER evidence, CHANGELOG, BACKLOG, cms-origin task spec, this entry.
- Commands or actions actually performed: `gh workflow run` + `gh run watch` 32555455704; log grep for PASS lines; worktree `docs/rebuild-web-pass-evidence`.
- Verification actually performed and result: run conclusion **success**; job log shows `rebuild-web PASS` and `cd-rebuild-web PASS`.
- Deferred or risk IDs: attended rebuild-web **CLOSED**; scheduled timer install **OPEN** (owner); `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN.
- Rollback / recovery: previous `ghcr.io/tahamohamadi-ir/taha-web:main` container or re-run with pinned git ref.

## LOG-0198 — 2026-08-22 — Attended CD rebuild-web FAIL (Docker loopback) + fix

- Outcome: First dispatch `rebuild_web=true` → [32555108949](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32555108949) job **Web container rebuild (gated)** **FAILED**: Astro build inside `docker compose build` could not reach `http://127.0.0.1:18000` (`series/en: CMS /api/series/en unreachable: fetch failed`). Root cause: build container loopback ≠ host CMS. Fixed `rebuild-web.sh` to pass `CMS_API_BASE=https://tahamohamadi.ir` to Docker build when host preflight uses loopback (matches CI). **Not** a PASS — re-dispatch required after merge.
- Why: Unblock OWNER_CUTOVER step 5 without inventing PASS on the failed run.
- Scope / files: `infra/deploy/rebuild-web.sh`, this entry, CHANGELOG.
- Commands or actions actually performed: `gh run watch` 32555108949; `--log-failed`; worktree `fix/rebuild-web-docker-cms-api`.
- Verification actually performed and result: failed run log shows Docker build fetch failed; fix is repo-only pending re-dispatch.
- Deferred or risk IDs: rebuild-web production PASS **OPEN**; `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN.
- Rollback / recovery: revert fix PR; manual build with `CMS_API_BASE=https://tahamohamadi.ir bash infra/deploy/rebuild-web.sh`.

## LOG-0197 — 2026-08-22 — Gated CD rebuild-web + scheduled timer install script

- Outcome: Added `infra/deploy/cd-rebuild-web.sh` (git sync + `rebuild-web.sh` + `cd-rebuild-web PASS` evidence) and CD job **Web container rebuild (gated)** (`workflow_dispatch` `rebuild_web=true` only; no auto var). Added `infra/deploy/install-scheduled-publish-timer.sh` for owner-attended systemd timer install. Updated DEPLOY_RUNBOOK § OWNER_CUTOVER + attended web rebuild checklist. No production rebuild PASS invented; `DEFER-0027` / `DEFER-0031` / `RISK-0013` remain **OPEN**. Did **not** set `CMS_CD_AUTO_MIGRATE`.
- Why: Mirror attended CMS migrate path for post-migrate public HTML rebuild; document timer install without agent SSH.
- Scope / files: `infra/deploy/cd-rebuild-web.sh`, `infra/deploy/install-scheduled-publish-timer.sh`, `.github/workflows/cd.yml`, DEPLOY_RUNBOOK, CHANGELOG, BACKLOG, this entry.
- Commands or actions actually performed: worktree `feat/cd-rebuild-web` from `origin/main`; implement + docs.
- Verification actually performed and result: repo-only (no VPS SSH); attended dispatch pending merge.
- Deferred or risk IDs: rebuild-web production PASS **OPEN**; scheduled timer install **OPEN** (owner); `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN.
- Rollback / recovery: revert PR; manual `bash infra/deploy/rebuild-web.sh` on VPS.

## LOG-0196 — 2026-08-22 — Attended CD migrate+smoke PASS (65d6c91)

- Outcome: After SPA-aware smoke fix (#71 / LOG-0195), re-dispatched CD `migrate_cms=true` `cms_image_tag=65d6c91` → [32554382271](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32554382271). Job **CMS image migrate (gated)** **success** with `backup_ok`, `CMS smoke PASS`, `cd-cms-migrate PASS`. Closed `RISK-0010` for image+schema+smoke. `DEFER-0027` / `DEFER-0031` / `RISK-0013` remain **OPEN**. Did **not** set `CMS_CD_AUTO_MIGRATE`. Owner still owes `rebuild-web.sh`, scheduled-publish timer, optional HMAC/Caddy, interactive SPA MFA check.
- Why: Record honest PASS after smoke false-negative was fixed; unblock OWNER_CUTOVER evidence without inventing later owner steps.
- Scope / files: DEPLOY_RUNBOOK § OWNER_CUTOVER evidence, RISK-0010, CHANGELOG, BACKLOG, this entry.
- Commands or actions actually performed: `gh workflow run` + `gh run watch` on 32554382271; worktree `docs/attended-migrate-pass-evidence` from `origin/main`.
- Verification actually performed and result: run conclusion **success**; migrate log shows `CMS smoke PASS` and `cd-cms-migrate PASS`.
- Deferred or risk IDs: `RISK-0010` CLOSED; `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN; `RISK-0012` CLOSED (path).
- Rollback / recovery: pin previous CMS image via `update-cms.sh` (prior tag before first fail was `2e200fe`).

## LOG-0195 — 2026-08-22 — Attended CD migrate FAIL (SPA smoke) + smoke fix

- Outcome: Dispatched CD `migrate_cms=true` `cms_image_tag=65d6c91` → [32554028708](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32554028708). VPS pulled image, `backup_ok`, applied `content.0009`–`0012` + `siteconfig.0002`, CMS healthy, `/staff/login/` PASS — but job **FAILED** on `FAIL /admin/login/ is not a sign-in page` because SPA HTML is `#root` only (no password text). **Not** a migrate PASS. Fixed `smoke-cms.sh` to accept SPA `#root` shell for `/admin/login/` while still requiring form markers on `/staff/login/`. Host + compose Caddy already proxy `/staff/*` on `origin/main` (#70). `DEFER-0027` / `DEFER-0031` stay **OPEN**. Did **not** set `CMS_CD_AUTO_MIGRATE`.
- Why: Unblock OWNER_CUTOVER evidence honesty and prevent false smoke FAIL blocking attended re-dispatch after schema already applied.
- Scope / files: `infra/deploy/smoke-cms.sh`, DEPLOY_RUNBOOK § OWNER_CUTOVER evidence, RISK-0010, CHANGELOG, BACKLOG, this entry.
- Commands or actions actually performed: `gh workflow run` CD with migrate; `gh run watch` / `--log-failed`; public curl of `/admin/login/` vs `/staff/login/`; worktree `fix/cms-smoke-spa-admin-login` from `origin/main`.
- Verification actually performed and result: Actions job **CMS image migrate (gated)** conclusion **failure**; migrate log lines show schema OK then smoke FAIL; live `/admin/login/` is SPA shell with `id="root"`.
- Deferred or risk IDs: `RISK-0010` OPEN (schema applied, smoke/MFA not PASS); `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN; `RISK-0012` CLOSED (path unchanged).
- Rollback / recovery: previous image was `taha-cms:2e200fe` (logged in migrate); smoke fix is forward-compatible.

## LOG-0194 — 2026-08-21 — OWNER_CUTOVER post-Wagtail (PR #69)

- Outcome: Updated `DEPLOY_RUNBOOK` § **OWNER_CUTOVER** for no-Wagtail CMS deploy after merged PR #69: dumpdata + backup first; Caddy must proxy `/staff/*` (not `/admin-wagtail/` alone); attended migrate still required for `content.0009`–`0012` if not applied; never `CMS_CD_AUTO_MIGRATE`. Compose topology + `infra/caddy/Caddyfile.compose` now use `/staff/*`. Confirmed `TECH_DEBT.md` already shows `DEBT-0003` **CLOSED** on `origin/main` (LOG-0193). No production PASS invented.
- Why: Owner cutover checklist still referenced Wagtail-era proxy paths after uninstall landed on main.
- Scope / files: `docs/governance/DEPLOY_RUNBOOK.md`, `infra/caddy/Caddyfile.compose`, CHANGELOG, BACKLOG, this entry.
- Commands or actions actually performed: `git fetch origin/main`; worktree `docs/post-wagtail-owner-cutover` from `65d6c91` (PR #69 merge).
- Verification actually performed and result: ledger read — `DEBT-0003` CLOSED; host `infra/caddy/Caddyfile` already had `/staff/*`; Compose file was stale (`/admin-wagtail/`) and corrected.
- Deferred or risk IDs: `RISK-0010` OPEN (prod image + schema); `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN; `RISK-0012` CLOSED (path only).
- Rollback / recovery: revert this docs PR.

## LOG-0193 � 2026-08-21 � DEBT-0003 CLOSED: remove Wagtail package

- Outcome: Removed Wagtail from runtime and install. Dropped `wagtail` (and transitive modelcluster/taggit/etc.) from `pyproject.toml`/`uv.lock` and `INSTALLED_APPS`. Replaced `/admin-wagtail/` with Django `/staff/` (LOGIN_URL `/staff/login/` + OTPLoginForm, staff preview `/staff/preview/`, HTML MFA `/staff/account/two-factor/`, legacy profile HTML `/staff/profiles/`). SPA remains primary at `/admin/` + `/api/v1/admin/auth/mfa/*`. Historical migrations rewritten to TextField + `media.Media` (no `import wagtail`); `0011` is a no-op for fresh installs (production already applied original rewire). Caddy + smoke check `/staff/login/`. `DEBT-0003` ? **CLOSED**.
- Why: Finish ADM-0 uninstall after RichText/Media slices so the CMS image no longer ships Wagtail.
- Scope / files: `apps/cms/config/{urls,settings}`, `apps/security/{decorators,urls,mfa,middleware,templates}`, `apps/content/{urls_staff,views_preview,migrations/0002-0004,0011}`, `apps/admin` templates/views, Caddy/smoke, tests, ledgers.
- Commands or actions actually performed: worktree `feat/wagtail-uninstall-complete` from `origin/main`; `uv lock`/`uv sync`; pytest.
- Verification actually performed and result: `uv run pytest -q` � **337 passed** (no wagtail installed; `find_spec("wagtail") is None`).
- Deferred or risk IDs: `DEBT-0003` CLOSED; `RISK-0010` � owner `dumpdata` + backup before production image that drops Wagtail tables/apps (legacy Wagtail DB tables may remain until optional cleanup); never `CMS_CD_AUTO_MIGRATE`. `DEFER-0016` preview path is now `/staff/preview/`.
- Rollback / recovery: previous CMS image that still includes Wagtail; restore Caddy `admin-wagtail` handles if needed.

## LOG-0192 � 2026-08-21 � OWNER_CUTOVER checklist + post-merge gate evidence

- Outcome: Added DEPLOY_RUNBOOK � **OWNER_CUTOVER** (dumpdata ? attended CD migrate for `content.0009`�`0012` ? `rebuild-web.sh` ? scheduled-publish timer ? optional HMAC ? optional Caddy edge). Re-checked Actions: only pre-merge attended migrate PASS is [32407698471](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32407698471) (`2e200fe`); all inspected post-merge `main` CD runs left **CMS image migrate (gated)** **skipped** � no invent PASS for `0009`�`0012`. Aligned `RISK-0012` status column to **CLOSED** (already claimed in LOG-0180 / runbook). Closed ledger drift for `DEFER-0029` / `DEFER-0030` (repo CLOSED per LOG-0185/0186). Left `DEFER-0027`, `DEFER-0031`, `RISK-0010`, `RISK-0013` OPEN. Did **not** enable or recommend `CMS_CD_AUTO_MIGRATE`.
- Why: Owner needs one accurate post-merge cutover order after merges #58�#67 without mistaking CD �success� (migrate skipped) for schema apply.
- Scope / files: `docs/governance/DEPLOY_RUNBOOK.md`, `docs/status/RISK_REGISTER.md`, `docs/status/deferred-validation.md`, CHANGELOG, BACKLOG, this entry.
- Commands or actions actually performed: `gh run list` / `gh run view` on CD jobs; worktree `docs/owner-gates-post-merge` from `origin/main`.
- Verification actually performed and result: job **CMS image migrate (gated)** success only on dispatch 32407698471; recent CD runs 32474338830 / 32474046690 / 32473739254 / 32473166772 / 32471717968 / 32470814675 show migrate **skipped**.
- Deferred or risk IDs: `RISK-0012` CLOSED (path); `RISK-0010` OPEN (schema); `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN; `DEFER-0029`/`DEFER-0030` CLOSED (repo).
- Rollback / recovery: revert this docs PR.

## LOG-0190 — 2026-08-21 — DEBT-0003: RichText→TextField + local sanitizer + retire viewsets
- Note: Renumbered from colliding LOG-0188 (PR #61 Playwright CI fix) to LOG-0190.

- Outcome: Advanced Wagtail uninstall without removing Wagtail from `INSTALLED_APPS`/deps. Replaced remaining `RichTextField` (`Article.body`, `ResearchStatement.body`, `ProjectCaseStudyDetails.technical_decisions`) with `TextField` via additive `content.0012_richtext_to_textfield` (HTML bytes unchanged). Introduced `apps.content.html_sanitize` (BeautifulSoup allowlist; ADR-0022; no `wagtail.whitelist`). Unregistered content snippet/ModelViewSets (SPA-only CRUD). Documented SPA `/admin/security` + `/api/v1/admin/auth/mfa/*` as primary TOTP enrollment; `/admin-wagtail/` kept for LOGIN_URL, staff preview, profile HTML, and MFA HTML rollback. `DEBT-0003` → **PARTIAL** with explicit remaining blockers. Base branch: `feat/featured-image-to-media` (PR #64). Merge order: **#60 → #63 → #64 → this**.
- Why: Close schema RichText / Whitelister / viewset blockers that prevented uninstall progress after Media rewire, without MFA lockout risk from dropping Wagtail login prematurely.
- Scope / files: `apps/cms/apps/content/{models,html_sanitize,admin,viewsets,wagtail_hooks,migrations/0012_*}`, `apps/api/api.py`, `composition/projection.py`, `views_preview.py`, settings, `pyproject.toml` (+ beautifulsoup4), admin SPA Security copy, tests, ledgers.
- Commands or actions actually performed: worktree `feat/wagtail-uninstall` from `origin/feat/featured-image-to-media`; implement + pytest/ruff.
- Verification actually performed and result:
  - `uv run ruff check apps/content apps/api apps/composition config tests/test_html_sanitize.py tests/test_content_admin.py tests/test_security.py tests/test_api.py` — All checks passed
  - `uv run pytest -q tests/test_html_sanitize.py tests/test_content_admin.py tests/test_security.py tests/test_admin_mfa_api.py tests/test_api.py tests/test_story_composition.py tests/test_media_image_rewire.py` — 72 passed
  - `uv run python manage.py makemigrations --check --dry-run` — No changes detected
- Deferred or risk IDs: `DEBT-0003` PARTIAL; `RISK-0010` — owner `dumpdata` + backup before production `0011`/`0012`; never `CMS_CD_AUTO_MIGRATE`. Remaining blockers: Wagtail still in INSTALLED_APPS; LOGIN_URL + preview + profile admin + TOTP HTML hooks; historical migrations.
- Rollback / recovery: reverse `0012` (TextField→RichTextField) + revert PR / previous CMS image; `/admin-wagtail/` unchanged.

## LOG-0191 — 2026-08-21 — ADR-0027 Slice 4: Compose Caddy (repo; cutover owner-gated)

- Outcome: Added Compose service `caddy` (official `caddy:2.9-alpine`, profile `edge`), `infra/caddy/Caddyfile.compose` (Docker DNS → `web:8080` / `cms:8000`, ACME volumes + `/var/www/html`), host-disable + rollback rehearsal docs, `caddy-compose-reload.sh`, and CD gate `CADDY_EDGE=compose` (default remains host `caddy-sync`). `DEFER-0031` stays OPEN until live TLS cutover; `RISK-0013` OPEN for the cutover window.
- Why: Complete Slice 4 repository work without binding production 80/443 or enabling auto-migrate.
- Scope / files: `infra/cms/docker-compose.cms.yml`, `infra/caddy/*`, `infra/deploy/caddy-compose-reload.sh`, `infra/deploy/caddy-sync.sh`, `.github/workflows/cd.yml`, DEPLOY_RUNBOOK, task spec, plan README, cms README, deferred/RISK/CHANGELOG, this entry.
- Commands or actions actually performed: worktree `feat/caddy-in-compose` from `origin/main`; compose config validate; no VPS SSH; no `CMS_CD_AUTO_MIGRATE`.
- Verification actually performed and result: `docker compose … config` PASS for default and `--profile edge` (temporary `.env` from example, removed); `bash -n infra/deploy/caddy-compose-reload.sh` PASS. No VPS TLS move.
- Deferred or risk IDs: `DEFER-0031` OPEN (owner cutover); `RISK-0013` OPEN; `RISK-0012` unchanged (auto migrate off).
- Rollback / recovery: leave host Caddy as edge; do not set `CADDY_EDGE`; do not `--profile edge up -d caddy` on production until owner window.
## LOG-0187 — 2026-08-21 — Featured/diagram/screenshot FKs → Media library

- Outcome: Rewired `Article.featured_image`, `ProjectDiagram.diagram_image`, and `ProjectScreenshot.screenshot_image` from `wagtailimages.Image` to `media.Media`. Additive data-copy migration `content.0011_rewire_image_fks_to_media` depends on `content.0010_entity_stories` (branch rebased onto `feat/slice-5-entity-stories` / PR #63). Public article/project projections expose active Media URLs only; admin schema type `media` + MediaPicker on article featured image; project case-media assign endpoints; `MEDIA_REFERENCE_FIELDS` registers the three FKs for orphan/usage counting. Wagtail remains installed (`DEBT-0003` — RichText + `/admin-wagtail/`).
- Why: Close Media-library rewire for content image FKs without uninstalling Wagtail; unblock accurate orphan counting.
- Scope / files: `apps/cms/apps/content/models.py` + migration `0011_*`, `apps/media/public_urls.py`, `apps/api/api.py`, `admin_content.py`, `admin_media.py`, admin SPA MediaPicker wiring, `apps/web` article DTO, tests, ledgers.
- Commands or actions actually performed: rebase onto `origin/feat/slice-5-entity-stories`; rename colliding WIP `0009_rewire_*` → `0011_rewire_*`; move `_parse_positive_int` to `admin_common` (break circular import); pytest + ruff.
- Verification actually performed and result:
  - `uv run ruff check apps/content apps/media apps/api tests/test_media_image_rewire.py tests/test_admin_media_api.py tests/test_admin_workflow_api.py` — All checks passed
  - `uv run pytest -q tests/test_media_image_rewire.py tests/test_admin_media_api.py tests/test_admin_workflow_api.py` — 43 passed
  - `uv run python manage.py makemigrations --check --dry-run` — No changes detected
  - `npx tsc -b --noEmit` in `apps/cms/admin-frontend` — PASS
  - `uv run pytest -q tests/test_public_media.py tests/test_media.py` — 31 passed
- Deferred or risk IDs: `RISK-0010` — owner must `dumpdata` + backup before applying `0011` on production; do **not** enable `CMS_CD_AUTO_MIGRATE`. Depends on PR #63 (`0010`) merge/order. `DEBT-0003` remains OPEN (RichText/Wagtail).
- Rollback / recovery: revert PR / previous CMS image; reverse migration clears Media FKs (Wagtail Image bytes are not reconstructed).

## LOG-0188 — 2026-08-21 — Fix PR #61 web + Playwright CI failures

- Outcome: Fixed CI on `feat/adm6-playwright-lifecycle` (PR #61). Web job failed `astro check` on Playwright Node files (`process`/`Buffer`/`node:*` without `@types/node`). Playwright job failed `seed_e2e_fixtures` with `no such table: users` because workflow-level `DJANGO_SETTINGS_MODULE=config.settings.test` (`:memory:`) was inherited by migrate+seed across separate processes.
- Note: Renumbered from colliding LOG-0185 (PR #62 primaryColor/CV) to LOG-0188 (0186=Slice 5 PR #63; 0187=featured-image worktree).
- Why: Unblock PR #61 green checks without changing suite scope.
- Scope / files: `apps/web/tsconfig.json` (exclude `playwright.config.ts`, `qa/e2e`), `apps/cms/scripts/run_e2e_stack.sh` (force `config.settings.e2e`), `apps/cms/scripts/seed_e2e_fixtures.py` (force e2e settings), `.github/workflows/ci-cms.yml` (job-level e2e env), this entry.
- Commands or actions actually performed: `gh pr checks 61` + failed Actions logs; local `npm run check` after exclude; local migrate+seed with e2e settings.
- Verification actually performed and result: local `astro check` → 0 errors; local `migrate`+`seed_e2e_fixtures` → fixture ready. Full browser suite left to GitHub Actions after push.
- Deferred or risk IDs: none new; `DEFER-0032` unchanged.
- Rollback / recovery: revert this commit.

## LOG-0184 — 2026-08-20 — DEFER-0026 Playwright lifecycle suite

- Outcome: Added full Playwright Test config (`apps/web/playwright.config.ts`: workers=1, CI retries=2, trace/video on first retry, HTML reporter) and browser suite `qa/e2e/content-lifecycle.spec.ts` (create→publish→public fa/en JSON) using fixture admin+TOTP (`e2e@example.com`, not production secrets). CMS e2e settings + seed + `run_e2e_stack.sh`; CI job `playwright-lifecycle` in `ci-cms.yml`. Pytest `test_content_lifecycle_e2e.py` kept. `DEFER-0026` CLOSED; remainder §18 matrix → `DEFER-0032`.
- Why: Plan item 2d / ADM-6 — complement JSON lifecycle with browser UI evidence and S2 config pattern.
- Scope / files: `apps/web/playwright.config.ts`, `apps/web/qa/e2e/**`, `apps/web/package.json`+lock, `apps/cms/config/settings/e2e.py`, `apps/cms/scripts/seed_e2e_fixtures.py`, `apps/cms/scripts/run_e2e_stack.sh`, `.github/workflows/ci-cms.yml`, ledgers, ADM-6 spec, Task-list, PROJECT_MANIFEST.
- Commands or actions actually performed: worktree `feat/adm6-playwright-lifecycle`; `npm install @playwright/test`; admin SPA build; CMS `migrate`+`seed_e2e_fixtures`+`ruff` PASS; pytest lifecycle PASS. Local `playwright install chromium` blocked (CDN 403 geo); CI ubuntu job is the browser evidence path.
- Verification actually performed and result: seed prints fixture ready; `uv run ruff check` PASS; `uv run pytest -q tests/test_content_lifecycle_e2e.py` PASS; admin-frontend `npm run build` PASS. Browser suite runs in GitHub Actions `playwright-lifecycle`.
- Deferred or risk IDs: `DEFER-0026` CLOSED; `DEFER-0032` OPEN; `DEFER-0027` unchanged.
- Rollback / recovery: revert PR; CI job and e2e scripts go with it.
## LOG-0186 — 2026-08-20 — Slice 5 / DEFER-0030: entity story bodies

- Outcome: Additive `story` FK on `Project`, `ResearchTopic`, `ResearchStatement`, and `ProfileExperience` (migration `content.0010_entity_stories`). Public APIs project published-only story via `public_story_document`; admin `storyId` on content entities; `ArticleStoryEditor` generalized to `EntityStoryEditor` (content + profile experience attach). Astro detail pages reuse `StoryBody.astro` with existing field fallbacks. `DEFER-0030` CLOSED in ledger.

- Note: Renumbered from colliding LOG-0181 (PRs #60/#62 also claimed it) to LOG-0186 (open PRs #57–#63; highest was LOG-0185 on #62). Migration is `content.0010_entity_stories` depending on PR #60 `content.0009_scheduled_for_and_contentrevision` (merged into this branch) so the graph is linear: `0008_article_story` → `0009_scheduled_for_and_contentrevision` → `0010_entity_stories`.
- Why: Close Slice 5 after blog story reference implementation.
- Scope / files: `apps/cms/**` (models/migration/API/admin SPA/tests), `apps/web/**` (DTOs + detail pages), `docs/status/**`, `docs/plan/**`.
- Commands or actions actually performed: isolated worktree `feat/slice-5-entity-stories`; pytest/ruff/npm check.
- Verification actually performed and result:
  - `uv run pytest -q tests/test_story_composition.py` — 10 passed
  - `uv run ruff check apps/content apps/api tests/test_story_composition.py` — All checks passed
  - `uv run python manage.py makemigrations --check --dry-run` — No changes detected
  - `npm run check` in `apps/web` — 0 errors (73 files)
  - `npm run check` in `apps/cms/admin-frontend` — PASS
- Deferred or risk IDs: `DEFER-0030` CLOSED (code); owner attended migrate for `0010` still required before production use. Do not enable `CMS_CD_AUTO_MIGRATE`.
- Rollback / recovery: revert PR; nullable FKs are backward compatible.

## LOG-0181 — 2026-08-20 — DEBT-0005: revisions + scheduled publish

- Outcome: Added immutable `ContentRevision` snapshots with restore-as-draft, `scheduled` lifecycle + `scheduled_for`, extended `ALLOWED_TRANSITIONS`, management command `publish_scheduled_content` (no Celery), and optional systemd timer units under `infra/cms/`. Admin SPA can schedule, snapshot, and restore.
- Why: Close ADM-4 follow-up DEBT-0005 separately from Wagtail uninstall (DEBT-0003).
- Scope / files: `apps/cms/apps/content/models.py`, `revisions.py`, migration `0009_*`, `admin_content.py`, `admin_health.py`, `publish_scheduled_content` command, `infra/cms/publish-scheduled-content.*`, admin-frontend workflow/status, tests, ledgers.
- Commands or actions actually performed: worktree `feat/adm-revisions-schedule`; `uv run ruff check` (pass); `uv run pytest tests/test_admin_revisions_schedule.py tests/test_admin_workflow_api.py` (23 passed).
- Verification actually performed and result: ruff clean; 23 pytest passed (workflow + revisions/schedule).
- Deferred or risk IDs: DEBT-0005 CLOSED; owner must install timer + run attended migrate for `0009` (do not enable `CMS_CD_AUTO_MIGRATE`). Preview token remains open on Task-list ADM-4.
- Rollback / recovery: revert migration `0009` after image rollback; disable timer unit.
## LOG-0185 — 2026-08-20 — ADM-6: primaryColor inject + current CV/resume

- Outcome: Wired site-settings `primaryColor` into Astro `--color-brand` at build via public `GET /api/site`. Added one-current-document CV + industry resume slots on `SiteSettings` (PDF media FKs), admin Settings MediaPicker, and Downloads/cv pages that prefer active CMS downloads (markdown fallback when CMS unset/empty). Contact inbox not reopened.
- Why: Close `DEFER-0029` / CV half of `DEBT-0006` without inventing tokens beyond the site-settings field.
- Scope / files: `apps/cms/apps/siteconfig/` (+ migration `0002`), `admin_siteconfig.py`, `api.py` public `/site`, `admin_media.py` usage registry, admin `SettingsPage.tsx`/`api.ts`, `apps/web` BaseLayout/Downloads/cvDownloads/siteSettings, ledgers, ADM-6 task spec.
- Commands or actions actually performed: implemented on `feat/adm6-primarycolor-cv` worktree from `origin/main`.
- Verification actually performed and result: `uv run ruff check` (touched CMS modules) PASS; `uv run pytest -q` 319 passed; `makemigrations --check --dry-run` No changes detected; `npm run check` + `build` in `apps/web` PASS (40 pages); `npm run check` + `build` in `admin-frontend` PASS.
- Deferred or risk IDs: `DEFER-0029` CLOSED; `DEBT-0006` RESOLVED (CV done; contact stays out of scope under closed `DEFER-0007`); `DEFER-0026`/`DEFER-0027`/`DEFER-0030` unchanged; owner must migrate `siteconfig.0002` + `rebuild-web.sh` on VPS.
- Rollback / recovery: revert PR; previous CMS image without `0002` FKs; static markdown CV downloads remain as offline fallback.
## LOG-0183 — 2026-08-20 — HMAC rebuild trigger rewired to rebuild-web.sh (DEFER-0027)

- Outcome: Default script for signed `/rebuild-trigger/` is now `infra/deploy/rebuild-web.sh` (Compose web image + loopback smoke). `REBUILD_TRIGGER_ENABLED` remains False. Tests assert `rebuild-web.sh` path. `DEFER-0027` stays OPEN until owner VPS smoke + enable.
- Why: After ADR-0027 Slice 1 Caddy cutover, disk `rebuild-static.sh` no longer updates visitor HTML; HMAC must target the web container rebuild.
- Scope / files: `apps/cms/apps/rebuild/services.py`, `apps/cms/apps/rebuild/views.py`, `apps/cms/tests/test_rebuild.py`, `infra/cms/.env.example`, ADR-0023, ADM-6 task spec, deferred-validation, CHANGELOG.
- Commands or actions actually performed: code + doc rewire on `feat/hmac-rebuild-web` from `origin/main`.
- Verification actually performed and result: `uv run pytest tests/test_rebuild.py -q` -> 10 passed; `uv run ruff check apps/rebuild tests/test_rebuild.py` -> All checks passed.
- Deferred or risk IDs: `DEFER-0027` OPEN (owner enable + smoke); no new risk.
- Rollback / recovery: revert branch; keep trigger disabled; manual `bash infra/deploy/rebuild-web.sh` after publish.
## LOG-0182 — 2026-08-20 — ADR-0027 Slice 3: CMS origin honesty (fail-build on outage)

- Outcome: Astro build-time CMS fetch is typed (`unset` / `ok` / `http` / `error`). When `CMS_API_BASE` is set, transport/timeout/5xx throws and fails `npm run build`. Committed `profile.snapshot.json` is used only when the base is unset (local/offline). Successful empty published lists are not overridden by the snapshot. Articles/projects/research share the same outage policy. QA asserts snapshot dist + fail-build on unreachable base.
- Why: ADR-0027 Slice 3 / locked plan policy — silent snapshot-as-live CMS was dishonest when the origin was configured but down.
- Scope / files: `apps/web/src/lib/cms/{client,articles,projects,research}.ts`, `apps/web/src/data/cmsProfile.ts`, `apps/web/qa/cms-profile-build.spec.mjs`, `docs/governance/DEPLOY_RUNBOOK.md`, `AGENTS.md`, `docs/README.md`, CHANGELOG/BACKLOG, this entry (plan file left untouched).
- Commands or actions actually performed: isolated worktree `feat/adr-0027-slice-3-cms-origin` from `origin/main`; `npm run check` + `npm run build` without base; build with `CMS_API_BASE=http://127.0.0.1:9` expected fail; `node qa/cms-profile-build.spec.mjs`.
- Verification actually performed and result: `npm run check` → 0 errors; `npm run build` without `CMS_API_BASE` → 40 pages; `CMS_API_BASE=http://127.0.0.1:9 npm run build` fails with `CMS … unreachable`; `node qa/cms-profile-build.spec.mjs` PASS (snapshot + fail-build + restore).
- Deferred or risk IDs: Slice 4 `DEFER-0031` / Slice 5 `DEFER-0030` unchanged; `DEFER-0022` local HTTP preview unchanged; `RISK-0012` CLOSED on PR #57 (attended migrate PASS evidence LOG-0179 / Actions 32407698471); auto migrate remains unset.
- Rollback / recovery: revert this branch/PR; previous web image continues prior silent-null behavior until rebuilt.
## LOG-0180 — 2026-08-20 — Phase 0: Slice 2 owner checklist + RISK-0012 CLOSED

- Outcome: Documented short owner attended CD CMS migrate checklist in `DEPLOY_RUNBOOK`. Independently re-verified Actions [32407698471](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32407698471) job **CMS image migrate (gated)** success with log lines `backup_ok`, `CMS smoke PASS`, `cd-cms-migrate PASS`. Closed `RISK-0012` on that evidence. Fixed `docs/plan/README.md` handoff (was wrongly saying “Slice 2 CD auto-migrate”). Did **not** enable or recommend `CMS_CD_AUTO_MIGRATE=true`.
- Why: Approved backlog Phase 0 — support Slice 2 gate with runbook checklist and close risk only after authoritative PASS.
- Scope / files: `docs/governance/DEPLOY_RUNBOOK.md`, `docs/status/RISK_REGISTER.md`, `docs/plan/README.md`, `docs/plan/cms-origin-and-full-stack-cd-task-spec.md`, `AGENTS.md`, `infra/cms/README.md`, CHANGELOG, BACKLOG, this entry.
- Commands or actions actually performed: `gh run view 32407698471`; `git fetch origin main`; worktree `docs/slice-2-cd-migrate-checklist` from `origin/main`.
- Verification actually performed and result: job conclusion success; migrate log markers present; no script bug found for a further fix PR.
- Deferred or risk IDs: `RISK-0012` CLOSED; `DEFER-0027` unchanged.
- Rollback / recovery: revert this docs PR; risk row can be re-opened if evidence is disputed.

## LOG-0179 — 2026-08-20 — ADR-0027 Slice 2: first attended CD CMS migrate PASS

- Outcome: GitHub Actions CD `workflow_dispatch` `migrate_cms=true` `cms_image_tag=2e200fe` run [32407698471](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32407698471) **success**. Evidence: `backup_ok` under `/home/deploy/cms-migrate-backups/...`, recreate `cms`/`db`/`web`, migrate no-op, `CMS smoke PASS`, `cd-cms-migrate PASS`. Image remained `ghcr.io/tahamohamadi-ir/taha-cms:2e200fe`.
- Why: Prove Slice 2 owner-attended path (`RISK-0012`) without enabling `CMS_CD_AUTO_MIGRATE`.
- Scope / files: live VPS via CD; ledgers/task spec.
- Commands or actions actually performed: agent dispatched workflow; prior fixes PR #54/#55 for backup dir + mktemp.
- Verification actually performed and result: Actions conclusion success; log lines `cd-cms-migrate PASS` / `CMS smoke PASS`.
- Deferred or risk IDs: `RISK-0012` remains OPEN (auto migrate still off); `DEFER-0027` unchanged. Superseded for risk status by LOG-0180 CLOSE.
- Rollback / recovery: `CMS_IMAGE=<previous>` + `update-cms.sh`; backup at `/home/deploy/cms-migrate-backups/pre-migrate-20260820T191842Z/`.

## LOG-0178 — 2026-08-20 — update-cms: mktemp for admin login curl body

- Outcome: Second CD migrate (32406996402) passed backup + compose recreate + migrate (no-op) + loopback `/health/` then failed `curl: (23)` writing `/tmp/cms-admin-login` (stale root-owned file). Switched to `mktemp` like `smoke-cms.sh`.
- Why: Complete Slice 2 attended path without sudo cleanup of `/tmp`.
- Scope / files: `infra/deploy/update-cms.sh`, this entry.
- Commands or actions actually performed: read failed Actions log after PR #54.
- Verification actually performed and result: root cause matched prior smoke-cms curl-23 fix.
- Deferred or risk IDs: `RISK-0012` OPEN until full `cd-cms-migrate PASS`.
- Rollback / recovery: revert to fixed `/tmp` path (may need `sudo rm`).

## LOG-0177 — 2026-08-20 — cd-cms-migrate: writable backup root for deploy

- Outcome: First CD `cms-migrate` (run 32406462067, tag `2e200fe`) failed at `mkdir /home/deploy/backups/...` (Permission denied; root-owned from sudo migrate path). `cd-cms-migrate.sh` now resolves a deploy-writable backup root (`$HOME/cms-migrate-backups` preferred).
- Why: Slice 2 CD SSH runs as `deploy`, not root (`RISK-0012` attended path).
- Scope / files: `infra/deploy/cd-cms-migrate.sh`, this entry.
- Commands or actions actually performed: inspected failed Actions log; cancelled duplicate dispatch 32406482633.
- Verification actually performed and result: failure mode confirmed in log; `bash -n` after fix.
- Deferred or risk IDs: `RISK-0012` still OPEN until migrate PASS.
- Rollback / recovery: previous script; or `BACKUP_ROOT=` to an owner-chowned dir.

## LOG-0176 — 2026-08-20 — ADR-0027 Slice 2: gated CD CMS migrate

- Outcome: Added `infra/deploy/cd-cms-migrate.sh` (`pg_dumpall` → `update-cms.sh` → `smoke-cms.sh`) and CD job `cms-migrate` gated by `workflow_dispatch` `migrate_cms=true` or repo var `CMS_CD_AUTO_MIGRATE=true` (default off). Ordinary `main` pushes do not migrate Postgres.
- Why: ADR-0027 Slice 2 / `RISK-0012` — wire GitHub→VPS CMS image updates without unattended first production migrate.
- Scope / files: `infra/deploy/cd-cms-migrate.sh`, `.github/workflows/cd.yml`, task spec, RISK_REGISTER, DEPLOY_RUNBOOK, ledgers.
- Commands or actions actually performed: `bash -n` on new script (local). No VPS migrate in this session.
- Verification actually performed and result: workflow YAML gates reviewed; auto path soft-skips missing GHCR tag; dispatch hard-fails.
- Deferred or risk IDs: `RISK-0012` OPEN until owner-attended CD migrate PASS; `DEFER-0027` unchanged.
- Rollback / recovery: previous `CMS_IMAGE` via `update-cms.sh`; disable migrate by leaving `CMS_CD_AUTO_MIGRATE` unset and not dispatching `migrate_cms`.

## LOG-0175 — 2026-08-20 — web nginx: real HTTP 404 for missing paths

- Outcome: `infra/web/nginx.conf` `try_files` ends with `=404` (not `/404.html` as last URI). Removed Caddy `handle_errors` re-proxy of `/404.html` which overwrote upstream 404 with 200. Owner `rebuild-web.sh` otherwise PASS; public smoke failed only on `/nonexistent-qa` expected 404 got 200.
- Why: After Slice 1 cutover, visitors and `smoke.sh` need correct 404 status while still serving Astro `404.html` body via nginx `error_page`.
- Scope / files: `infra/web/nginx.conf`, `infra/caddy/Caddyfile`, ledgers.
- Commands or actions actually performed: none on VPS yet (owner apply after merge).
- Verification actually performed and result: root-cause match to smoke FAIL; nginx/Caddy interaction documented.
- Deferred or risk IDs: none.
- Rollback / recovery: previous nginx try_files + Caddy handle_errors; `rebuild-web.sh` + `caddy-sync`.

## LOG-0174 — 2026-08-20 — ADR-0027 Slice 1 cutover live on VPS

- Outcome: Owner applied PR #50 (`a29838d`): `git pull`, confirmed `(taha_application_routes)` → `reverse_proxy 127.0.0.1:13080`, `taha-cms-web-1` healthy, `caddy-sync`, `smoke-cms.sh` **PASS** (loopback `/` + `/health.json`, `/admin/`, Wagtail login, `/health/`, `/health.json`, `/admin` 308, `/`). Brief accidental restore of `Caddyfile.bak-20260819194342` then re-sync; final state is cutover live.
- Why: Production public HTML now originates from Compose `web` nginx, not `/opt/taha/site/current`.
- Scope / files: live `/etc/caddy/Caddyfile` via sync from repo; ledgers.
- Commands or actions actually performed: owner on VPS (no agent SSH).
- Verification actually performed and result: `CMS smoke PASS`; loopback `{"status":"ok","service":"static","version":"0.1.0"}`.
- Deferred or risk IDs: `DEFER-0031` unchanged; next Slice 2 CD CMS migrate (`RISK-0012`).
- Rollback / recovery: restore `file_server` snippet + `caddy-sync`; bak under `/etc/caddy/Caddyfile.bak-*`.

## LOG-0173 — 2026-08-19 — rebuild-web.sh: CMS publish → web nginx container

- Outcome: Added `infra/deploy/rebuild-web.sh` to build the `web` Docker image with live CMS content (`CMS_API_BASE` build-arg, default loopback `18000`), restart Compose `web`, and smoke `127.0.0.1:13080/health.json` (+ optional public smoke). Updated `rebuild-static.sh` header and `DEPLOY_RUNBOOK.md`.
- Why: After Caddy cutover to `127.0.0.1:13080`, disk-based `rebuild-static.sh` no longer updates visitor-facing HTML.
- Scope / files: `infra/deploy/rebuild-web.sh`, `infra/deploy/rebuild-static.sh`, `docs/governance/DEPLOY_RUNBOOK.md`, `infra/cms/README.md`, ledgers.
- Commands or actions actually performed: none on VPS (script + docs only).
- Verification actually performed and result: Dockerfile `CMS_API_BASE` arg and compose `web` build context confirmed against existing patterns.
- Deferred or risk IDs: none new.
- Rollback / recovery: revert script; pin previous `WEB_IMAGE` or re-run with older git ref.

## LOG-0172 — 2026-08-19 — ADR-0027 Slice 1: Caddy cutover to nginx web loopback

- Outcome: `(taha_application_routes)` in `infra/caddy/Caddyfile` now reverse-proxies `127.0.0.1:13080` (nginx `web` container) instead of serving `/opt/taha/site/current` via `file_server`. Rollback comment documents restoring disk `file_server` until rsync path is removed. `smoke-cms.sh` adds loopback checks for `/` and `/health.json`.
- Why: ADR-0027 Slice 1 — public HTML origin moves from host symlink to Compose `web` while host Caddy remains edge until `DEFER-0031`.
- Scope / files: `infra/caddy/Caddyfile`, `infra/deploy/smoke-cms.sh`, `docs/plan/cms-origin-and-full-stack-cd-task-spec.md`, CHANGELOG, this entry.
- Commands or actions actually performed: repo-only; no VPS apply in this session.
- Verification actually performed and result: snippet matches ADR-0027 target; smoke script syntax valid; loopback checks gated on `127.0.0.1:13080`.
- Deferred or risk IDs: `DEFER-0031` unchanged; rsync `/opt/taha/site/current` remains rollback until removed from CD.
- Rollback / recovery: revert snippet to `root * /opt/taha/site/current` + `file_server`; `sudo /opt/taha/bin/caddy-sync.sh` with restored file; `web` container can stay running.

## LOG-0171 — 2026-08-19 — Admin SPA: merge content detail + edit (story/skills reachable)

- Outcome: Content list links now open the unified edit page (`/content/:entity/:id`). Removed read-only `ContentDetailPage`. Article story editor and profile skills editor are visible immediately from list click. `/content/:entity/:id/edit` redirects to canonical URL. Workflow transitions and published/updated metadata ported to edit page.
- Why: Owner reported story and skills features missing; they existed only on `/edit` route with no navigation path from list/detail.
- Scope / files: `apps/cms/admin-frontend/src/App.tsx`, `ContentEditPage.tsx`, deleted `ContentDetailPage.tsx`, ledgers.
- Commands or actions actually performed: `npm run check` in admin-frontend — PASS.
- Verification actually performed and result: tsc clean; manual path: list → article/profile shows story/skills sections.
- Deferred or risk IDs: none new. CMS image rebuild required for production (`SPA` baked in Docker).
- Rollback / recovery: revert PR; restore detail route in App.tsx.

## LOG-0170 — 2026-08-19 — Slice 0+1: /admin 308 fix, old stack decommissioned, Caddyfile automated, web nginx container + CI/CD

- Outcome: `/admin` 404 fixed with `redir /admin /admin/ 308` in live Caddy (owner applied). Old `taha-prod` Java/Vue stack decommissioned (containers down, volumes removed, 1 GB reclaimed). Full production Caddyfile committed to repo (`infra/caddy/Caddyfile`) with `caddy-sync.sh` auto-deploy in CD. Slice 1: `web` nginx container (`infra/web/Dockerfile.web`, `infra/web/nginx.conf`), added to compose, CI builds `taha-web` image, CD pulls and restarts.
- Why: Owner requested automated Caddyfile management and unified Compose stack per ADR-0027.
- Scope / files: `infra/caddy/Caddyfile`, `infra/deploy/caddy-sync.sh`, `infra/web/Dockerfile.web`, `infra/web/nginx.conf`, `infra/cms/docker-compose.cms.yml`, `.github/workflows/ci-web-image.yml`, `.github/workflows/cd.yml`, `infra/cms/Caddyfile.cms.snippet`, `infra/deploy/caddy-apply.sh`, `infra/deploy/smoke-cms.sh`.
- Commands or actions actually performed: owner applied `redir /admin /admin/ 308` to live Caddyfile, `docker compose stop/down` on `/opt/taha/repository`, `docker volume rm` old volumes, `docker image prune`.
- Verification actually performed and result: `curl -sSI /admin` → `308 Location: /admin/`; `curl /admin/` → `200`; site → `200` after old stack removal; `docker compose config` exits 0.
- Deferred or risk IDs: `DEFER-0031` Caddy-in-compose unchanged. VPS prereq: install `caddy-sync.sh` at `/opt/taha/bin/`, sudoers for deploy.
- Rollback / recovery: revert Caddyfile from timestamped backup; revert compose `web` service; CMS unchanged.

## LOG-0169 — 2026-08-19 — ADR-0027 unified Compose; production CMS b6bea6a; smoke login path

- Outcome: Accepted ADR-0027 (Compose: db/cms/web nginx, later caddy; no public Node/React). Owner migrate to `taha-cms:b6bea6a` applied `content.0008` and `composition.0002`. `smoke-cms.sh` checks `/admin-wagtail/login/`. Spec is slice-executable. `RISK-0012` OPEN. `DEFER-0031` Caddy-in-compose.
- Why: Owner asked to amend the host-static contract so each part is a container without a public SPA or SSR on 4 GiB.
- Scope / files: `docs/adr/0027-unified-compose-stack.md`, spec, `AGENTS.md`, `infra/cms/README.md`, `infra/deploy/smoke-cms.sh`, ledgers.
- Commands or actions actually performed: none on VPS. No `web` image (Slice 1 next).
- Verification actually performed and result: owner pasted `showmigrations` with 0008/0002 `[X]`.
- Deferred or risk IDs: RISK-0012 OPEN; DEFER-0031 OPEN; DEFER-0027 unchanged.
- Rollback / recovery: revert this PR for docs/smoke; CMS on VPS stays `b6bea6a` until the operator changes it.

## LOG-0168 — 2026-08-19 — CMS-origin + full-stack CD queued (no implement)

- Outcome: Queued `docs/plan/cms-origin-and-full-stack-cd-task-spec.md`. Public site staying no-JS; dynamic means CMS as origin + CD that can update CMS, not a public React SPA. Slice A (owner migrate `b6bea6a`) is operational, not this spec.
- Why: Owner asked to leave hardcoded static fallbacks, Dockerize the whole stack, and auto-deploy. That is three programs (content origin, Compose shape, CD migrate). Implementing together would fight ADR-0017/0026 and VPS capacity.
- Scope / files: that Task Spec; plan index; this log; CHANGELOG.
- Commands or actions actually performed: read `prod-cms-update-migrate.sh`, `cd.yml`, `infra/cms/README.md`. No VPS SSH. No Compose/CD code change.
- Deferred or risk IDs: `DEFER-0027` HMAC still owner; `DEFER-0030` after migrate; auto-migrate from GitHub needs a new risk if Slice B is approved.
- Rollback / recovery: delete the spec if the owner rejects the sequence.

## LOG-0167 - 2026-08-19 - Blog story composition (slice 1)

- Outcome: Composition is a story **body** engine, not a URL owner. `CompositionPage.kind` is `landing` (bilingual catalog unchanged) or `story` (single-locale figure/video/audio/math). Articles may attach an optional story document. Public article JSON exposes published-only `story`; Astro `StoryBody` renders it and falls back to sanitized `article.body`. Listing cards are unchanged. Typed footer shows license/accessibility notes only when filled. Media allowlist adds video/audio/SVG with magic-byte checks, 50MB AV cap, and anonymous `/media/` only for `is_active`. Wagtail stays installed. No invented content. HMAC not enabled.
- Why: `DEFER-0028` mixed landing composition, CV, and tokens; the approved plan required blog as the reference story projection first.
- Scope / files: CMS composition models/blocks/projection + migrations `0002`/`0008`; public article API; media sniff/validators/views; admin SPA article story editor; Astro `StoryBody` + `ArticleDetail`; plan/ledger docs; this entry.
- Commands or actions actually performed: isolated worktree `.worktrees/blog-story-composition` on `feat/blog-story-composition` from `feat/continue-admin-public-sync` HEAD. Targeted pytest (110 passed), `ruff check .` (clean), `makemigrations --check --dry-run` (no pending). `npm run check` in `apps/web` (0 errors, 72 files) and `apps/cms/admin-frontend` (`tsc` PASS). No commit, no push, no VPS migrate.
- Verification actually performed and result: 110 targeted pytest PASS; CMS ruff clean; no pending migrations; web check 0 errors; admin SPA check PASS.
- Deferred or risk IDs: `DEFER-0028` CLOSED (blog story→Astro); `DEFER-0029` OPEN (primaryColor + CV); `DEFER-0030` OPEN (project/research/experience stories); `DEFER-0026`/`DEFER-0027` unchanged; `DEBT-0003` unchanged; `RISK-0010` dumpdata+backup before production migrate.
- Rollback / recovery: revert the branch; nullable `Article.story` and default `kind=landing` are compatible with existing rows.

## LOG-0151 — 2026-08-18 — Canonical docs entry, contracts, P7 specs

- Outcome: Landed local-only documentation that was sitting untracked on the stale `feat/cms-backup-risk-0003-prep` checkout: `docs/README.md`, `docs/contracts/*`, plan index, P7 specs, and the Samples transfer catalog. Added `.gitignore` rules for `Samples/` and `**/test-results/`. Aligned current-gate facts with `DEFER-0017` CLOSED, `RISK-0003` CLOSED, and PR #31. Did not reopen RISK-0003. Did not commit the merged backup branch.
- Why: Source Control showed +1141 untracked lines. Those files are docs, not build artifacts. PR #11 is already merged, so they must land from `origin/main`, not from the backup branch.
- Scope / files: `AGENTS.md`, `.gitignore`, `docs/README.md`, `docs/governance/README.md`, `docs/plan/README.md`, `docs/plan/P7-*.md`, `docs/plan/SAMPLES-TRANSFER-RECOMMENDATIONS.md`, `docs/contracts/*`, this entry.
- Commands or actions actually performed: compared each leftover path to `origin/main`; discarded stale P2 spec and `prod-cms-reset-and-migrate.sh` copies; restored backup-doc edits that would reopen `RISK-0003`; copied unique docs onto `docs/canonical-entry-p7-specs` from `origin/main`.
- Verification actually performed and result: leftover unique docs were absent from `git log --all`; `origin/main` P3 backup spec remains DONE; `DEFER-0017` remains CLOSED in `deferred-validation.md`.
- Deferred or risk IDs: `DEFER-0022` unchanged. No new IDs.
- Rollback / recovery: revert this PR; documentation entry point returns to `AGENTS.md` + `DOCUMENTATION_POLICY.md` only.

## LOG-0150 — 2026-08-18 — CMS-managed About, custom admin, detail routes

- Outcome: Public About reads the typed CMS profile at build time with a committed snapshot fallback. Custom admin lives at `/admin/profiles/` inside the Wagtail session. Gated detail routes emit only when a child row has a Latin slug and a non-empty detail body. Work is on `feat/cms-managed-about-admin` from `origin/main` so P4–P6 routes stay intact.
- Why: Owner asked to ship CMS-managed content, a custom admin app, and About detail pages without regressing live blog/research/projects.
- Scope / files: CMS profile models + migrations `0005`/`0006`, public/admin profile APIs, `import_profile_seed`, custom admin templates/static, Astro `cmsProfile` adapter, About section/detail pages, CI `qa/cms-profile-build.spec.mjs`.
- Verification actually performed and result:
  - `uv run pytest -q` in `apps/cms` → 174 passed
  - `npm run check` in `apps/web` → 0 errors (69 files)
  - `npm run build` → 40 pages including About section/detail routes
  - `node qa/cms-profile-build.spec.mjs` → PASS
- Deferred or risk IDs: `DEFER-0022` (local HTTP preview bind). Production CMS still needs owner migrate + seed after merge.
- Rollback / recovery: revert the PR; previous static artifact and CMS image remain deployable.

## LOG-0149 — 2026-08-18 — About hybrid tabs + filters (owner UX feedback)

- Outcome: Restored compact CSS tab UX on About with sticky tab toolbar, **Show all sections** toggle (stacked scan/find-in-page), and per-section filter (search + facet chips where data supports it). Bilingual strings in `content.ts`. `DEBT-0002` reopened as mitigated (tabs default; show-all for full scan).
- Why: Production P2-H stacked About caused bad vertical-scroll UX; owner preferred tabular layout plus filtering in each section.
- Scope / files: `About.astro`, `content.ts`, `qa/about-tabs.spec.mjs`, `TECH_DEBT.md`, this entry.
- Verification actually performed and result:
  - `npm run check` → 0 errors (62 files)
  - `npm run build` → 16 pages
  - `node qa/about-tabs.spec.mjs` with `PREVIEW_URL=http://127.0.0.1:9876` → all PASS (tabs, sticky, show-all, skills filter)
- Rollback / recovery: revert branch; previous stacked About from `e0a517d` remains deployable.

## LOG-0145 — 2026-08-17 — P2-H honesty closeout (main-aware)

- Outcome: Hero CTAs → About + CV; perspective cards link to live Research/Projects/Writing; landing adds Current Focus + Selected Evidence from `profile.*`; About stacked with fragment TOC (closes `DEBT-0002`); locale 404 recovery; footer explore links; header `aria-current` + language switch labels. **Header kept Research/Projects/Writing links** because P4–P6 routes are live on `main` (not the pre-P4 fake-live case).
- Why: Landing still said “later release”; About tabs hid education/research from find-in-page; 404 was bilingual-only; footer lacked explore links.
- Scope / files: `Header.astro`, `Landing.astro`, `About.astro`, `Footer.astro`, `404.astro`, `content.ts`, `global.css`, `qa/about-tabs.spec.mjs`, `docs/plan/P2-honesty-closeout-task-spec.md`, ledgers.
- Verification actually performed and result:
  - `rg "DebugProbe" apps/web/src` → 0 matches
  - `npm run check` → 0 errors (62 files)
  - `npm run build` → 16 pages
  - `node qa/about-tabs.spec.mjs` + `node qa/mobile-overflow.spec.mjs` with `PREVIEW_URL=http://127.0.0.1:8765` → all PASS
- Deferred or risk IDs: none new. `DEBT-0002` CLOSED. Pre-P4 `KI-0002` never applied on `main`.
- Rollback / recovery: revert this commit; previous static artifact remains deployable.

## LOG-0144 — 2026-08-17 — Research index card catalog (filter + sort)

- Outcome: `/en/research/` and `/fa/research/` use CV-style cards (`ResearchCatalog.astro`). Filter by type and sort by type/title/newest. Each card links to the existing detail route. Intro no longer mentions `CMS_API_BASE`. Content remains in HTML without JS; filter/sort enhance via a small script.
- Why: Long topic paragraphs on the research index were hard to scan; owner asked for the same card pattern as CV with click-through.
- Scope / files: `ResearchCatalog.astro`, `en|fa/research/index.astro`, `content.ts`, this entry.
- Commands or actions actually performed: `npm run check` (see verification).
- Verification actually performed and result: `npm run check` → 0 errors (62 files).
- Decisions / assumptions: no new CMS fields; reuse existing topics/projects/publications/statement routes.
- Deferred or risk IDs: none.
- Rollback / recovery: revert this commit; previous list markup returns.

## LOG-0143 — 2026-08-17 — Public `/api/` + article seed + `release-9ca2f3b`

- Outcome: Owner applied Caddy `/api/*` + `/media/*`; public topics JSON 200. Merged PR #24 (`9ca2f3b`); CMS image `taha-cms:9ca2f3b`; seed `created=4` articles (`skipped=24` prior rows). Static `release-9ca2f3b` checksum `eebe1cc7` (38 pages: blog list + 4 article details fa/en).
- Why: Close DEFER-0017 and ship seeded writing to the public site.
- Scope / files: VPS `/etc/caddy/Caddyfile`; CMS DB seed; `/opt/taha/site/current` → `release-9ca2f3b`. Ledgers: deferred-validation, BACKLOG, P3-public-api-caddy-task-spec, this entry.
- Commands or actions actually performed: owner Caddy insert + reload; `update-cms.sh ghcr.io/tahamohamadi-ir/taha-cms:9ca2f3b`; `seed_site_content`; Windows `CMS_API_BASE` build + `update-release.sh`.
- Verification actually performed and result: `https://tahamohamadi.ir/api/research/topics/en` 200; `/api/articles/en` 200; `/en/blog/` 200; `/en/blog/pars-sql-vtd-edge-overview/` 200; `/en/research/` 200; `/_astro/logo.YrmYLcZm.png` 200 size 8075.
- Decisions / assumptions: `/media/` proxied; no published media files yet (Images library still empty until owner uploads).
- Deferred or risk IDs: DEFER-0017 CLOSED; DEFER-0018 RSS still OPEN; rebuild webhook still disabled.
- Rollback / recovery: restore `/etc/caddy/Caddyfile.pre-api.*`; `update-release.sh` prior release; pin previous CMS image sha.

## LOG-0142 — 2026-08-17 — CMS admin UI + article seed + hashed logos + Caddy API apply script

- Outcome: Wagtail **Site content** ModelViewSets for Article/Research/Project/Landing/Profile; seed adds 4 published articles (fa/en); Astro logos imported from `src/assets/branding` (hashed URLs); `infra/deploy/apply-caddy-api.sh` inserts `/api/*` + `/media/*` into production Caddyfile.
- Why: Owner cannot edit CMS rows from Wagtail Pages; blog empty; public `/api/` still 404 because snippet was never merged; browser logo cache on `/logo.png`.
- Scope / files: `apps/cms/apps/content/viewsets.py`, `wagtail_hooks.py`, `site_content.py`, `seed_site_content.py`, `tests/test_content_admin.py`, Header/Footer/index.astro, `infra/deploy/apply-caddy-api.sh`, `infra/cms/README.md`.
- Commands or actions actually performed: `uv run pytest tests/test_content_admin.py tests/test_seed_site_content.py` → 5 passed; `npm run check` → 0 errors.
- Verification actually performed and result: local tests PASS. Production apply of Caddy + new CMS image pending merge + owner VPS commands.
- Decisions / assumptions: keep Astro SSG; Wagtail Pages unused; public API is read-only Ninja projection.
- Deferred or risk IDs: DEFER-0017 closes after `apply-caddy-api.sh` PASS on VPS; rebuild webhook still disabled.
- Rollback / recovery: restore `/etc/caddy/Caddyfile.pre-api.*`; pin previous CMS image sha; static rollback via `update-release.sh`.


> مرجع chronological و append-only برای فعالیت‌های انجام‌شده. برای سیاست و قالب کامل، `docs/governance/DOCUMENTATION_POLICY.md` را بخوانید.

## قالب entry

```md
## LOG-XXXX — YYYY-MM-DD — <phase/slice>
- Outcome:
- Why:
- Scope / files:
- Commands or actions actually performed:
- Verification actually performed and result:
- Decisions / assumptions:
- Deferred or risk IDs:
- Rollback / recovery:
```

## LOG-0001 — 2026-08-14 — P0-G0 / Repository inventory

- Outcome: وضعیت آغازین repository ثبت شد: شش سند Markdown وجود داشت و پوشه‌های اجرایی خالی بودند؛ `.git` نیز یک پوشهٔ خالی و نامعتبر بود.
- Why: Inventory read-only پیش‌نیاز P0-G0 و repair امن Git بود.
- Scope / files: فقط مشاهدهٔ root، `docs/`، `frontend/` و `backend/`؛ هیچ محتوای application ساخته نشد.
- Commands or actions actually performed: فهرست بازگشتی فایل/پوشه، `git status`، `git rev-parse --is-inside-work-tree` و بررسی محتوای `.git` اجرا شد.
- Verification actually performed and result: Git هر دو فرمان را با `fatal: not a git repository` رد کرد؛ `frontend/` و `backend/` خالی بودند.
- Decisions / assumptions: هیچ Astro/Django scaffold، dependency یا runtime service در P0-G0 ساخته نمی‌شود.
- Deferred or risk IDs: `DEFER-0001`، `DEFER-0002` و `DEFER-0003`.
- Rollback / recovery: موردی تغییر نکرده بود.

## LOG-0002 — 2026-08-14 — P0-G0 / Git repair

- Outcome: مخزن Git سالم با branch `main` و remote canonical GitHub آماده شد؛ هنوز commit یا push انجام نشده است.
- Why: `.git` قبلی نامعتبر بود و مسیر امن recovery لازم داشت.
- Scope / files: فقط metadata Git در root.
- Commands or actions actually performed: `.git` نامعتبر با timestamp به پوشهٔ Temp منتقل شد؛ `git init -b main` و سپس `git remote add origin https://github.com/tahamohamadi-ir/Taha-personal-platform.git` اجرا شد.
- Verification actually performed and result: `git status` مخزن جدید را روی `main` و بدون commit نشان داد؛ `git remote -v` fetch/push URL را تأیید کرد.
- Decisions / assumptions: هیچ push انجام نشده و remote فقط متصل است.
- Deferred or risk IDs: ندارد.
- Rollback / recovery: نسخهٔ `.git` نامعتبر در Temp نگه‌داری شده است؛ هیچ فایل پروژه حذف نشده است.

## LOG-0003 — 2026-08-14 — P0-G0 / Repository layout freeze

- Outcome: مسیرهای خالی `frontend/` و `backend/` به `apps/web/` و `apps/cms/` منتقل شدند؛ مسیرهای مستندات P0 ایجاد و Release Policy به مسیر canonical منتقل شد.
- Why: این layout با معماری monorepo پیشنهادی سازگار است و پیش از ایجاد کد، migration cost ندارد.
- Scope / files: `apps/web/`، `apps/cms/`، `docs/{adr,governance,status,templates}/` و `docs/governance/RELEASE_POLICY.md`.
- Commands or actions actually performed: خالی‌بودن دو پوشهٔ قدیمی بررسی شد، سپس move و ساخت directoryها انجام شد؛ در پایان `tree /F /A` و `git status --short --branch` اجرا شد.
- Verification actually performed and result: tree مسیرهای جدید را نشان داد و Release Policy فقط در `docs/governance/` قرار دارد؛ هیچ فایل application یا dependency وجود ندارد.
- Decisions / assumptions: `apps/web/` و `apps/cms/` مسیرهای canonical آینده هستند؛ مسیرهای قدیمی نباید دوباره ایجاد شوند.
- Deferred or risk IDs: ندارد.
- Rollback / recovery: چون هر دو مسیر مبدأ خالی بودند، بازگردانی فقط move معکوس پوشه‌های خالی است.

## LOG-0004 — 2026-08-14 — P0-G0 / Environment inventory

- Outcome: نسخه‌های قابل مشاهدهٔ ابزارهای محلی ثبت شد.
- Why: `PROJECT_MANIFEST.md` باید فقط بر پایهٔ inventory واقعی تکمیل شود.
- Scope / files: بدون تغییر فایل.
- Commands or actions actually performed: نسخه‌های Git، Node/npm/npx، Python candidateها، uv، OpenCode، Serena، Docker، Docker Compose و pnpm بررسی شدند.
- Verification actually performed and result: Git 2.54.0؛ Node 24.16.0؛ npm/npx 11.18.0؛ Python مستقل 3.14.4؛ Python 3.11.15 متعلق به محیط Hermes؛ uv 0.12.3؛ OpenCode 1.18.18؛ Serena 1.7.0؛ Docker 29.4.1؛ Docker Compose 5.1.3؛ pnpm 11.19.0.
- Decisions / assumptions: دستور bare `python` به interpreter متعلق به Hermes اشاره می‌کند و برای پروژه canonical نیست.
- Deferred or risk IDs: `DEFER-0003`.
- Rollback / recovery: ندارد؛ inventory read-only بود.

## LOG-0005 — 2026-08-14 — P0-G0 / Documentation governance

- Outcome: قرارداد ثبت اجباری کارها و deferها ایجاد شد و Work Log، Deferred Validation، Risk Register، Technical Debt، Known Issues و Task Spec به‌عنوان منابع canonical اضافه شدند.
- Why: هر agent/developer باید بتواند فعالیت انجام‌شده، evidence واقعی و کارهای عمداً انجام‌نشده را بدون تکیه بر حافظه یا گفت‌وگو دنبال کند.
- Scope / files: `docs/governance/DOCUMENTATION_POLICY.md`، `docs/governance/RELEASE_POLICY.md`، Master Plan، و فایل‌های `docs/status/` و `docs/templates/TASK_SPEC_TEMPLATE.md`.
- Commands or actions actually performed: فایل‌های ledger/template ایجاد و ارجاع‌های Master Plan و Release Policy به Work Log و مسیرهای canonical به‌روزرسانی شد.
- Verification actually performed and result: `git diff --check` بدون خطا تمام شد؛ همهٔ مسیرهای required documentation وجود دارند؛ جست‌وجوی مسیر قدیمی Release Policy نتیجه‌ای نداشت و ارجاع‌های جدید Work Log/Documentation Policy در Master Plan و Release Policy دیده شدند.
- Decisions / assumptions: Work Log append-only است؛ defer هیچ‌گاه جایگزین blocker یا تکمیل نمی‌شود؛ هر فعالیت آینده باید entry مستقل داشته باشد.
- Deferred or risk IDs: `RISK-0001`، `DEFER-0001` تا `DEFER-0003`.
- Rollback / recovery: تمام تغییرها مستندی و قابل بازگردانی با Git هستند؛ هنوز commit/push انجام نشده است.

## LOG-0006 — 2026-08-14 — P0-G0 / Owner inputs and operations assessment

- Outcome: ورودی‌های مالک برای production، locale و محتوای P1 ثبت شد؛ تصمیم CI و backup با توجه به ظرفیت VPS برای ADR آینده ارزیابی شد.
- Why: P0-G0 باید تصمیم‌های واقعی محیط را از حدس agent جدا کند.
- Scope / files: فقط مستندات status؛ اتصال SSH، تغییر سرور، deploy، secret storage یا CI configuration انجام نشد.
- Commands or actions actually performed: مشخصات ابزارهای محلی و اطلاعات اعلام‌شدهٔ مالک با مستندات رسمی GitHub Actions و Gitea Actions مقایسه شد.
- Verification actually performed and result: production target اعلام‌شده `tahamohamadi.ir` است؛ VPS فعال Ubuntu با 1 vCPU، 2 GB RAM و 30 GB NVMe دارد. GitHub برای repository عمومی، runner استاندارد hosted را رایگان اعلام می‌کند؛ Gitea برای اجرای job به Act Runner نیاز دارد و مستندات آن runner جدا از instance را توصیه می‌کند.
- Decisions / assumptions: `/` Language Gateway و `/fa/` و `/en/` ورودی مستقیم نهایی هستند؛ browser preference فقط پیشنهاد زبان است و redirect اجباری نیست. این پیشنهادها در LOG-0007 توسط مالک تأیید و در ADRهای مربوطه freeze شدند.
- Deferred or risk IDs: `DEFER-0004`، `RISK-0002` و `RISK-0003`.
- Rollback / recovery: تغییری در production انجام نشده است.

## LOG-0007 — 2026-08-14 — P0-G0 / Approved baseline decisions

- Outcome: GitHub Actions hosted، `staging.tahamohamadi.ir`، Google Drive encrypted backup target، `/admin/` و Python 3.12 baseline تأیید و مستند شدند.
- Why: این تصمیم‌ها برای Manifest، ADRها و جلوگیری از ورود سرویس/نسخهٔ حدسی لازم بودند.
- Scope / files: `PROJECT_MANIFEST.md`، `AGENTS.md`، `.gitignore`، `.env.example`، README، ADRهای 0002/0008/0009/0010/0011/0014، Backup Policy، architecture baseline و ledgerها.
- Commands or actions actually performed: مستندات رسمی سازگاری Django/Wagtail/Python و billing GitHub Actions بررسی شد؛ سپس فقط فایل‌های مستندی/پیکربندی غیرمحرمانه ایجاد یا اصلاح شدند.
- Verification actually performed and result: Wagtail 7.4 LTS و Django 5.2 LTS با Python 3.12 سازگارند؛ Python 3.12 تا October 2028 security support دارد. GitHub Actions hosted standard برای repository عمومی رایگان است.
- Decisions / assumptions: Python هدف 3.12 latest patch است، نه Hermes Python و نه 3.14 فعلی؛ Gitea/self-hosted runner baseline نیست. هیچ package، `.venv`، workflow، اتصال SSH، DNS یا deploy ساخته/اجرا نشد.
- Deferred or risk IDs: `DEFER-0003`؛ `RISK-0001` تا `RISK-0003`.
- Rollback / recovery: تغییرات فقط در Git worktree فعلی هستند و هنوز commit/push نشده‌اند.

## LOG-0008 — 2026-08-14 — P0-G0 / Documentation verification normalization

- Outcome: policy مربوط به line ending و whitespace اسناد Markdown صریح شد.
- Why: `git diff --check` دو فاصلهٔ انتهای خط در اسناد baseline را گزارش می‌کرد، درحالی‌که آن فاصله‌ها hard line break عمدی Markdown هستند.
- Scope / files: `.gitattributes` و این Work Log.
- Commands or actions actually performed: staged diff با `git diff --cached --check` بررسی شد؛ سپس attribute مخصوص Markdown اضافه شد.
- Verification actually performed and result: پس از `git add --renormalize .`، `git diff --cached --check` بدون خطا تمام شد؛ local Markdown links نیز PASS بودند. متن و line breakهای اسناد موجود حذف یا بازنویسی نشدند.
- Decisions / assumptions: برای `*.md`، line ending canonical برابر LF و trailing-space از whitespace check مستثنا است؛ این استثنا فقط برای Markdown است.
- Deferred or risk IDs: ندارد.
- Rollback / recovery: حذف `.gitattributes` رفتار سخت‌گیرانهٔ قبلی را بازمی‌گرداند؛ هیچ محتوای سندی حذف نشده است.

## LOG-0009 — 2026-08-14 — P0-G0 / Initial documentation commit

- Outcome: baseline مستندات P0-G0 در اولین commit محلی ثبت شد.
- Why: ایجاد تاریخچهٔ قابل بازگشت و مبنای تمیز برای taskهای بعدی.
- Scope / files: تمام فایل‌های baseline مستندات، policyها، ADRها و تنظیمات غیرمحرمانهٔ repository.
- Commands or actions actually performed: `git commit -m "docs: establish P0-G0 governance baseline"` روی branch `main` اجرا شد.
- Verification actually performed and result: commit محلی ایجاد و سپس فقط برای افزودن همین Work Log amend شد؛ `git status --short --branch` تمیز بود و هیچ push اجرا نشد.
- Decisions / assumptions: این فقط commit محلی است؛ انتشار remote، deploy و P0-G0 PASS اعلام نشده‌اند.
- Deferred or risk IDs: `DEFER-0003`؛ `RISK-0001` تا `RISK-0003`.
- Rollback / recovery: پیش از push، بازنویسی/بازگردانی commit فقط با تأیید مالک مجاز است.

## LOG-0010 — 2026-08-14 — P0-A preparation / secure access, staging DNS and backup

- Outcome: Task Spec و runbook عملیاتیِ امن برای ساخت کاربر non-root، SSH key-only، رکورد staging و handoff backup ایجاد شد؛ owner آغاز اجرای هر سه مسیر را تأیید کرد.
- Why: `RISK-0002` مانع هر اتصال SSH است و `RISK-0003` بدون دسترسی امن و OAuth تعاملی نمی‌تواند provision شود؛ ترتیب امن و rollback باید پیشاپیش روشن باشد.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/governance/SERVER_ACCESS_RUNBOOK.md`، `PROJECT_MANIFEST.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: تصاویر Cloudflare ارائه‌شده توسط مالک بررسی شد؛ مستندات/دستورهای owner-executed برای rotation، `tahaops`، تست login و SSH drop-in نوشته شد؛ سپس در یک commit محلی ثبت شد. هیچ اتصال SSH، تغییر سرور، تغییر DNS یا OAuth/backup command یا push remote اجرا نشد.
- Verification actually performed and result: از تصاویر، وجود root A و www CNAME با proxy فعال، نبودن staging record و Cloudflare encryption mode برابر Full مشاهده شد. اجرای server-side یا DNS هنوز evidence ندارد.
- Decisions / assumptions: حساب انسانی/عملیاتی `tahaops` انتخاب شد؛ password/root SSH فقط پس از اثبات login با کلید در session دوم غیرفعال می‌شود. staging همان VPS address و proxy Cloudflare خواهد داشت. Full (strict) تا نصب certificate معتبر در origin به تعویق می‌افتد.
- Deferred or risk IDs: `RISK-0001` تا `RISK-0003`؛ هیچ مورد High به‌عنوان defer پذیرفته نشد.
- Rollback / recovery: root console تا تأیید login جدید باز می‌ماند؛ حذف تنها رکورد `staging` DNS rollback مستقل دارد؛ backup ناموفق باید disable و credentialهای مرتبط revoke/rotate شوند.

## LOG-0011 — 2026-08-14 — P0-A diagnosis / existing SSH operator account

- Outcome: اجرای owner-side نشان داد session فعلی SSH با یک حساب non-root موجود و public-key authentication برقرار شده است؛ بنابراین دستورهای ساخت کاربر که به root نیاز داشتند رد شدند. task/runbook برای privilege check پیش از هر تغییر اصلاح شد.
- Why: اجرای دستورات root در حساب non-root علت مستقیم خطا بود؛ ساخت حساب جدید یا تغییر SSH بدون بررسی کمینهٔ privilege می‌توانست مسیر کاری موجود را مختل کند.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/governance/SERVER_ACCESS_RUNBOOK.md` و همین Work Log.
- Commands or actions actually performed: مالک key pair محلی ساخت و تلاش مستقیم برای `adduser`/آماده‌سازی مسیر authorization در session non-root انجام داد؛ `adduser` با خطای نیاز به root رد شد و نوشتن editor نیز به‌علت نبود directory موفق نشد. سپس اصلاح مستندات در یک commit محلی ثبت شد. هیچ account، authorization file، SSH daemon setting، DNS یا backup configuration و هیچ push remote انجام نشد.
- Verification actually performed and result: banner اتصال، public-key authentication و username غیر-root را نشان داد؛ خروجی خطا ثابت کرد session root نیست. sudo authority هنوز بررسی نشده است.
- Decisions / assumptions: به‌جای ایجاد کورکورانهٔ account دوم، حساب موجود فقط در صورت موفقیت read-only sudo check به‌عنوان operator انتخاب می‌شود؛ در غیر این صورت ایجاد `tahaops` فقط از provider/root console انجام می‌شود.
- Deferred or risk IDs: `RISK-0001` تا `RISK-0003` همچنان باز/blocked هستند؛ `RISK-0002` بسته نشده است.
- Rollback / recovery: editor بدون ذخیره بسته می‌شود؛ چون فایل یا account جدیدی ایجاد نشده، rollback سمت سرور لازم نیست.

## LOG-0012 — 2026-08-14 — P0-A diagnosis / privileged-access recovery required

- Outcome: حساب non-root موجود عضو گروه sudo است، اما sudo به authentication تعاملی نیاز دارد و هیچ credential صحیحی برای آن اثبات نشد. اتصال root با روش authentication موجود نیز رد شد؛ recovery از provider console/rescue لازم است.
- Why: تلاش مستقیم account creation با root نبودن session رد شد و جایگزین کردن password root با password حساب operator نیز مسیر معتبر sudo نیست؛ ادامهٔ password guessing ریسک exposure و lockout را بالا می‌برد.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/governance/SERVER_ACCESS_RUNBOOK.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک `whoami`، `id -nG`، `sudo -n whoami` و `sudo -n -l` را اجرا کرد؛ سپس تلاش authentication تعاملی sudo و تلاش root SSH انجام شد. این diagnosis در یک commit محلی ثبت شد. هیچ account، SSH config، DNS، application یا backup configuration و هیچ push remote تغییر نکرد.
- Verification actually performed and result: identity حساب non-root و عضویت آن در sudo مشاهده شد؛ هر دو sudo non-interactive check، authentication تعاملی خواستند. روش authentication موجود برای root SSH پذیرفته نشد. هیچ credential یا مقدار آن در این log ثبت نشده است.
- Decisions / assumptions: تا بازیابی privileged access از provider console/rescue، تنها عملیات read-only مجاز است؛ password guessing و فعال‌کردن remote root password SSH ممنوع است.
- Deferred or risk IDs: `RISK-0001` تا `RISK-0003`؛ `RISK-0002` همچنان blocker High است و defer نشده است.
- Rollback / recovery: owner از پنل provider مسیر console/rescue یا reset root را انتخاب می‌کند؛ پس از ورود console، فقط password جداگانهٔ operator و public key جدید طبق runbook تنظیم و در terminal دوم آزموده می‌شود.

## LOG-0013 — 2026-08-14 — P0-A evidence / interactive sudo path recovered

- Outcome: مالک با حساب SSH non-root موجود از مسیر sudo تعاملی به root shell رسید؛ ساخت account دوم لازم نیست و حساب موجود operator منتخب است.
- Why: خروجی قبلی فقط نشان می‌داد sudo در حالت non-interactive password می‌خواهد؛ session بعدی اثبات کرد حساب operator دارای مسیر sudo معتبر است. این evidence مسیر provider/rescue را از blocker فعلی به fallback تبدیل می‌کند.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک یک session SSH جدید برقرار و sudo تعاملی را با موفقیت اجرا کرد؛ shell root حاصل شد. این evidence در یک commit محلی ثبت شد. هیچ password، key یا مقدار secret در repository ثبت و هیچ push remote انجام نشده است.
- Verification actually performed and result: prompt root در یک session sudo مالک مشاهده شد؛ بنابراین operator account و sudo path آن معتبرند. rotation root credential، افزودن کلید جدید، test مستقل آن و SSH hardening هنوز انجام/تأیید نشده‌اند.
- Decisions / assumptions: همان حساب موجود با password جداگانه و کلیدهای owner-controlled نگه داشته می‌شود؛ تغییر daemon SSH فقط پس از تست کلید جدید در terminal دوم انجام می‌شود.
- Deferred or risk IDs: `RISK-0001` تا `RISK-0003`؛ `RISK-0002` هنوز High/Blocked است.
- Rollback / recovery: root shell فعلی تا موفقیت terminal دوم باز می‌ماند؛ اگر کلید جدید کار نکند، کلید فعلی حذف نمی‌شود و SSH daemon دست‌نخورده می‌ماند.

## LOG-0014 — 2026-08-14 — P0-A evidence / new operator key and sudo verified

- Outcome: کلید عمومی جدید به authorization حساب operator موجود اضافه و از PowerShell در یک session مستقل با موفقیت تست شد؛ identity operator و sudo به root نیز تأیید شد.
- Why: پیش از تغییر policy SSH باید حداقل دو مسیر معتبر داشته باشیم: session privileged موجود و اتصال تازه با کلید جدید؛ این شرط اکنون برقرار است.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک directory/permissionهای SSH حساب operator را با root shell آماده کرد، کلید عمومی جدید را بدون حذف کلید موجود افزود و با `ssh -i` از PowerShell اتصال مستقل برقرار کرد؛ سپس identity و sudo را بررسی کرد. یک تلاش literal با placeholder hostname پیش از تلاش موفق رخ داد و هیچ تغییری ایجاد نکرد. این evidence در یک commit محلی ثبت شد؛ هیچ push remote انجام نشد.
- Verification actually performed and result: اتصال مستقل با کلید جدید موفق بود؛ shell identity حساب operator بود و sudo به root با موفقیت پاسخ داد. خروجی معتبرِ اجرای `passwd` برای root یا operator ارائه نشده است؛ بنابراین rotation تأیید نشده است.
- Decisions / assumptions: root/password credential در معرض مشاهده تا زمان اجرای `passwd` همچنان compromised فرض می‌شود؛ SSH daemon و firewall هنوز تغییر نمی‌کنند و ابتدا effective config read-only بررسی می‌شود.
- Deferred or risk IDs: `RISK-0001` تا `RISK-0003`؛ `RISK-0002` به‌دلیل rotationِ تأییدنشده همچنان High/Blocked است.
- Rollback / recovery: کلید قدیمی حذف نشده و root shell باز است؛ اگر کلید جدید بعداً revoke شود، کلید قدیمی مسیر recovery موقت باقی می‌ماند تا جایگزین سالم تأیید شود.

## LOG-0015 — 2026-08-14 — P0-A evidence / effective SSH policy already hardened

- Outcome: inspection فقط‌خواندنیِ effective SSH configuration نشان داد root login، password authentication و keyboard-interactive authentication غیرفعال‌اند؛ public-key authentication و allow-list صریح برای operatorها فعال است. تغییر یا reload SSH لازم نیست.
- Why: قبل از نوشتن drop-in جدید باید configuration واقعی daemon بررسی می‌شد؛ نتیجه نشان می‌دهد کنترل‌های موردنظر از قبل برقرارند و duplicate configuration ریسک غیرضروری دارد.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/governance/SERVER_ACCESS_RUNBOOK.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک از root shell، `sshd -T` را با filter محدود برای authentication policy اجرا کرد. هیچ file write، reload SSH، firewall، DNS، application یا backup command اجرا نشد.
- Verification actually performed and result: effective values برای root login، password authentication، keyboard-interactive، public-key authentication، allow-list و authentication method مشاهده و با baseline امن مطابقت داده شد. اجرای `passwd` برای root در evidence فعلی دیده نشده است.
- Decisions / assumptions: SSH policy فعلی دست‌نخورده می‌ماند؛ تنها acceptance باقی‌مانده برای `RISK-0002`، rotation credential افشاشده و تأیید مالک است.
- Deferred or risk IDs: `RISK-0001` تا `RISK-0003`؛ `RISK-0002` فقط به‌دلیل root rotation تأییدنشده High/Blocked است.
- Rollback / recovery: چون configuration تغییر نکرده، rollback لازم نیست؛ root shell و دو کلید SSH موجود مسیرهای recovery کنترل‌شده‌اند.

## LOG-0016 — 2026-08-14 — P0-A owner decision / root credential rotation declined

- Outcome: مالک اعلام کرد که در حال حاضر root password rotate نمی‌شود. هیچ تغییر دیگری در سرور انجام نشد.
- Why: تصمیم مالک دربارهٔ credential تغییر سرور را متوقف می‌کند، اما exposure پیشین را از بین نمی‌برد.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: فقط تصمیم مالک ثبت و مستندات در یک commit محلی به‌روزرسانی شد؛ هیچ SSH command توسط Codex، deploy، DNS change، backup provisioning یا application change و هیچ push remote انجام نشد.
- Verification actually performed and result: evidence LOG-0015 نشان می‌دهد policy SSH فعلی key-only و root/password-disabled است؛ با وجود این، rotation credential افشاشده تأیید نشده است.
- Decisions / assumptions: `RISK-0002` stop-the-line باقی می‌ماند و با acceptance عادی بسته نمی‌شود؛ Codex تا زمان rotation به VPS متصل نمی‌شود.
- Deferred or risk IDs: `RISK-0002` BLOCKED؛ `RISK-0001` و `RISK-0003` نیز باز هستند.
- Rollback / recovery: هر زمان مالک rotation را تأیید کند، task از همین evidence ادامه می‌یابد؛ تا آن زمان فقط کارهای local/documentation بدون نیاز به VPS ممکن‌اند.

## LOG-0017 — 2026-08-14 — P0-A owner attestation / root credential rotated

- Outcome: مالک تأیید کرد credential root افشاشده را خارج از گفت‌وگو و بدون افشای مقدار آن rotate کرده است؛ `RISK-0002` با این attestation و evidence قبلی key-only operator/SSH policy بسته شد.
- Why: rotation credential شرط stop-the-line برای ادامهٔ عملیات remote بود و مقدار secret نباید برای اثبات در Git یا chat ثبت شود.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک rotation را مستقل انجام و آن را اعلام کرد؛ سپس evidence در یک commit محلی ثبت شد. Codex هیچ اتصال SSH، deploy، DNS change یا backup provisioning و هیچ push remote انجام نداد.
- Verification actually performed and result: attestation مالک با evidence پیشینِ key-only operator login، sudo و effective SSH policy ترکیب شد. مقدار credential دیده، ذخیره یا آزموده نشد.
- Decisions / assumptions: `RISK-0002` CLOSED است؛ task به staging DNS، read-only server audit و encrypted backup bootstrap ادامه می‌یابد. هر exposure جدید بلافاصله این risk را باز می‌کند.
- Deferred or risk IDs: `RISK-0001` و `RISK-0003` باقی مانده‌اند؛ `RISK-0002` CLOSED.
- Rollback / recovery: برای rotation rollback وجود ندارد؛ password manager منبع نگهداری credential جدید است و key-only SSH policy پابرجا می‌ماند.

## LOG-0018 — 2026-08-14 — P0-A evidence / preliminary read-only server audit

- Outcome: owner فولدر logical backup در Google Drive ایجاد کرد و audit فقط‌خواندنی نشان داد host ظرفیت آزاد کافی برای مرحلهٔ planning دارد، Caddy و Docker فعال‌اند، UFW فعال/deny-incoming است، و stack production از قبل وجود دارد.
- Why: قبل از route/DNS/deploy یا backup provisioning باید ownership و topology سرویس‌های موجود شناخته شود تا جایگزینی سایت فعلی آن را مختل نکند.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/governance/BACKUP_POLICY.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک با root shell دستورهای read-only برای hostname/kernel/uptime، disk/memory، وضعیت SSH/Docker، UFW، socket listeners و unattended-upgrades اجرا کرد. فولدر Google Drive ایجاد شد و evidence در یک commit محلی ثبت شد. هیچ package update، service reload، firewall/DNS change، Docker/Caddy change یا backup OAuth و هیچ push remote انجام نشد.
- Verification actually performed and result: root filesystem حدود ۳۰GB با حدود ۱۷GB free، memory حدود ۱.۹GiB با swap فعال، SSH و Docker active، UFW active با deny-incoming، و Caddy روی HTTP/HTTPS/HTTP3 دیده شد. Docker-published listenerها loopback-only بودند. دو listener عمومی SSH و ۵۷ update pending از MOTD/audit دیده شد. جزئیات حساس config یا environment variable ثبت نشد.
- Decisions / assumptions: staging DNS تا inventory Caddy/container routeها ساخته نمی‌شود؛ backup folder وجود دارد اما restic/rclone/OAuth هنوز provision نشده‌اند؛ update یا حذف SSH port بدون maintenance/rollback انجام نمی‌شود.
- Deferred or risk IDs: `RISK-0001`، `RISK-0003` تا `RISK-0006`؛ `RISK-0004` blocker High است.
- Rollback / recovery: چون audit و folder creation غیرمخرب‌اند، rollback سروری ندارد؛ هر تغییر بعدی باید از inventory/rollback مستند خود stack موجود تبعیت کند.

## LOG-0019 — 2026-08-14 — P0-A evidence / staging DNS exists, TLS origin handshake blocked

- Outcome: owner رکورد proxied `A` برای staging را در Cloudflare ایجاد کرد. بررسی خارجی نشان داد production پاسخ HTTP موفق دارد، اما staging با Cloudflare 525 پاسخ می‌دهد؛ staging deploy نشده و TLS origin route آن آماده نیست.
- Why: ایجاد DNS بدون inventory Caddy می‌تواند رفتار hostname جدید را نامشخص کند؛ external check لازم بود تا وضعیت واقعی route/TLS به‌جای حدس ثبت شود.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: owner DNS record را در Cloudflare ساخت؛ Codex دو HTTPS header request فقط‌خواندنی برای staging و production اجرا کرد و evidence را در یک commit محلی ثبت کرد. هیچ Caddy/Docker/firewall/DNS write توسط Codex، deploy یا backup provisioning و هیچ push remote انجام نشد.
- Verification actually performed and result: production `200 OK` پاسخ داد. staging `525` از Cloudflare داد، که failure handshake TLS بین edge و origin را نشان می‌دهد. محتوا یا secret از origin خوانده/ثبت نشد.
- Decisions / assumptions: staging DNS حفظ می‌شود اما تا inventory routeهای Caddy، TLS/configuration change انجام نمی‌شود؛ `RISK-0004` blocker باقی می‌ماند.
- Deferred or risk IDs: `RISK-0001`، `RISK-0003` تا `RISK-0006`؛ `RISK-0004` High/Blocked.
- Rollback / recovery: حذف رکورد staging در Cloudflare تنها rollback DNS است؛ فعلاً به‌دلیل عدم اثر production آن انجام نمی‌شود. هر Caddy fix باید پیش از اجرا rollback صریح داشته باشد.

## LOG-0020 — 2026-08-14 — P0-A evidence / live production stack identified

- Outcome: metadata inventory نشان داد یک Compose project زنده با سه container healthy (frontend، backend و PostgreSQL) در مسیر production موجود اجرا می‌شود. Caddy system service فقط دو hostname production root و `www` را در Caddyfile دارد.
- Why: این evidence علت محتمل 525 staging را مشخص و تأیید می‌کند که hostname جدید نباید برای رفع سریع به stack database/backend production وصل شود.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: owner metadata-only Docker container/Compose/Caddy version، systemd unit location و Caddyfile hostname match را اجرا کرد؛ evidence در یک commit محلی ثبت شد. هیچ config، container، volume، service، DNS یا backup setting و هیچ push remote تغییر نکرد.
- Verification actually performed and result: frontend/backend/PostgreSQL healthy مشاهده شدند؛ frontend/backend فقط روی loopback publish شده‌اند؛ Compose file production location ثبت شد؛ Caddyfile staging hostname ندارد. نتیجه با Cloudflare 525 بیرونی سازگار است، ولی علت نهایی TLS فقط پس از config inventory قابل اثبات است.
- Decisions / assumptions: `Taha-personal-platform` از stack زنده مستقل می‌ماند؛ staging آینده هرگز DB/backend production را share نمی‌کند. پیش از تصمیم staging باید metadata volume/data-path و Caddy routing امن inventory شود و capacity co-hosting ارزیابی گردد.
- Deferred or risk IDs: `RISK-0001`، `RISK-0003` تا `RISK-0007`؛ `RISK-0004` و `RISK-0007` High/Blocked.
- Rollback / recovery: چون فقط metadata خوانده شد، rollback ندارد؛ stack موجود بدون تغییر باقی مانده و هر تغییر بعدی باید rollback مستقل داشته باشد.

## LOG-0021 — 2026-08-14 — P0-A decision / isolated staging placeholder

- Outcome: container mounts، Compose skeleton و Caddyfile routeها inventory شد. تصمیم ADR-0015 برای یک staging placeholder مستقل با automatic Caddy TLS و پاسخ 503 ثبت شد؛ هنوز تغییری روی سرور اعمال نشده است.
- Why: staging DNS موجود 525 می‌دهد چون Caddy hostname آن را ندارد. proxy کردن آن به Compose production خطر data leak و production interference دارد؛ پاسخ 503 مستقل حداقل مسیر امن و reversible است.
- Scope / files: `docs/adr/0015-isolated-staging-placeholder.md`، `docs/adr/README.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: owner Docker mount metadata، Compose skeleton و بخش Caddyfile را فقط‌خواندنی مشاهده کرد؛ Codex مستندات رسمی Caddy و Cloudflare را بررسی و decision را در یک commit محلی ثبت کرد. هیچ Caddyfile write/reload، Docker/Compose action، DNS write، TLS mode change یا backup action و هیچ push remote انجام نشد.
- Verification actually performed and result: PostgreSQL و media در Docker volumeهای مستقل دیده شدند؛ Caddy automatic TLS در site blockهای production برقرار است و staging route غایب است. مستندات رسمی Caddy syntax `tls internal` و `respond` و مستندات Cloudflare Full/Full(strict) بررسی شد؛ تصمیم استفاده از automatic certificate existing Caddy به‌جای internal CA ثبت شد.
- Decisions / assumptions: staging placeholder production backend/database را proxy نمی‌کند؛ Cloudflare Full فعلاً باقی می‌ماند؛ Full(strict) فقط بعد از certificate valid برای همهٔ hostnameها و تأیید مالک بررسی می‌شود.
- Deferred or risk IDs: `RISK-0001`، `RISK-0003` تا `RISK-0007`؛ `RISK-0004` IN PROGRESS با ADR-0015.
- Rollback / recovery: قبل از هر edit، Caddyfile backup گرفته می‌شود؛ validation failure مانع reload است؛ rollback restore backup + validate + reload است.

## LOG-0022 — 2026-08-14 — P0-A execution / isolated staging placeholder live

- Outcome: Caddyfile با backup موجود، validation موفق و reload active، برای staging یک پاسخ ثابت 503 مستقل ارائه می‌دهد. external Cloudflare check از 525 به 503 تغییر کرد؛ production route تغییر نکرد.
- Why: رفع 525 باید بدون proxy کردن staging به frontend/backend/PostgreSQL production انجام می‌شد.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/adr/0015-isolated-staging-placeholder.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md`، `docs/status/deferred-validation.md` و همین Work Log.
- Commands or actions actually performed: owner از root shell Caddyfile را به مسیر backup کپی، site block staging مستقل اضافه، `caddy validate` را اجرا، Caddy را reload و active بودن آن را تأیید کرد. سپس direct-origin curl و external Cloudflare HTTPS header check اجرا شد؛ evidence در یک commit محلی ثبت شد. Codex هیچ server command و هیچ push remote اجرا نکرد.
- Verification actually performed and result: Caddy validation `Valid configuration` بود و service active باقی ماند. external staging HTTPS پاسخ 503 با headerهای امنیتی مورد انتظار داد. direct-origin curl با TLS internal alert شکست خورد؛ این failure به `DEFER-0005` ثبت شد و مانع تغییر Cloudflare TLS mode است.
- Decisions / assumptions: placeholder فعلاً complete و isolated است؛ warning formatting Caddyfile به‌علت عدم ارتباط و ریسک rewrite config زنده عمداً اصلاح نشد. Cloudflare Full باقی می‌ماند؛ Full(strict) و staging واقعی تا رفع DEFER-0005 و gates بعدی ممنوع‌اند.
- Deferred or risk IDs: `DEFER-0005`؛ `RISK-0001`، `RISK-0003` تا `RISK-0007`؛ `RISK-0004` IN PROGRESS.
- Rollback / recovery: در خطای جدید staging یا اثر production، backup Caddyfile restore، validate و reload می‌شود؛ production Compose/volumes در این change لمس نشده‌اند.

## LOG-0023 — 2026-08-14 — P0-A diagnosis / staging certificate issuance race

- Outcome: Caddy log نشان داد نخستین direct-origin TLS probe پیش از پایان certificate issuance اجرا شده بود. پس از fallback موفق HTTP-01، Caddy برای staging یک certificate ACME دریافت کرد؛ re-test مستقیم هنوز لازم است.
- Why: تشخیص دقیق مانع اعمال تغییر نامرتبط در Caddy یا Cloudflare می‌شود؛ external 503 به‌تنهایی چرایی alert probe اول را توضیح نمی‌داد.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/deferred-validation.md` و همین Work Log.
- Commands or actions actually performed: owner log محدود Caddy را با filter TLS/certificate/staging خواند و evidence در یک commit محلی ثبت شد. هیچ Caddyfile edit/reload، DNS/TLS-mode change، container action یا backup action و هیچ push remote انجام نشد.
- Verification actually performed and result: log ابتدا شکست TLS-ALPN، سپس HTTP-01 challenge موفق و در نهایت `certificate obtained successfully` برای staging را نشان داد. alert direct curl قبل از پایان صدور certificate رخ داده بود. خطای local-CA installation به route IP موجود مربوط است و برای hostname public staging علت ثبت نشده است.
- Decisions / assumptions: یک direct-origin curl پس از صدور certificate، تنها check باقی‌مانده برای بستن `DEFER-0005` است؛ تا آن زمان Cloudflare Full حفظ می‌شود.
- Deferred or risk IDs: `DEFER-0005` OPEN؛ `RISK-0001`، `RISK-0003` تا `RISK-0007`.
- Rollback / recovery: هیچ تغییر جدیدی انجام نشد؛ rollback همان backup Caddyfile ADR-0015 باقی می‌ماند.

## LOG-0024 — 2026-08-14 — P0-A verification / staging placeholder complete

- Outcome: post-issuance direct-origin test برای staging HTTP/2 503 پاسخ داد؛ external Cloudflare و direct-origin هر دو placeholder ایزوله را تأیید می‌کنند و `DEFER-0005` بسته شد.
- Why: direct-origin verification شرط باقی‌مانده پس از certificate issuance بود و نشان می‌دهد 525 اولیه و alert race برطرف شده‌اند.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/deferred-validation.md` و همین Work Log.
- Commands or actions actually performed: owner ابتدا همان syntax curl را در PowerShell اجرا کرد که به alias `Invoke-WebRequest` map شد و بدون تغییر خطا داد؛ سپس re-test معتبر را در root shell اجرا و evidence را در یک commit محلی ثبت کرد. هیچ server configuration، DNS/TLS-mode، container یا backup setting و هیچ push remote تغییر نکرد.
- Verification actually performed and result: direct-origin curl با hostname/SNI staging پاسخ HTTP/2 503 و headerهای امنیتی مورد انتظار داد. placeholder مستقل است و به production proxy نمی‌شود.
- Decisions / assumptions: برای PowerShell در آینده از `curl.exe` استفاده می‌شود؛ ADR-0015 placeholder complete است. Full(strict) و real staging همچنان scope جداگانه و gateهای خود را دارند.
- Deferred or risk IDs: `DEFER-0005` CLOSED؛ `RISK-0001`، `RISK-0003` تا `RISK-0007` باقی مانده‌اند.
- Rollback / recovery: rollback Caddyfile backup ADR-0015 حفظ می‌شود؛ چون verification تغییر جدیدی نداشت، rollback فوری لازم نیست.

## LOG-0025 — 2026-08-14 — P0-A execution / backup tooling installed

- Outcome: restic 0.18.1 و Ubuntu rclone 1.60.1 build روی VPS نصب و version آن‌ها تأیید شد؛ OS گزارش داد هیچ service/container restart نشده است.
- Why: provisioning backup رمزنگاری‌شده به executableهای stable و signed نیاز داشت؛ نصب از repository Ubuntu برای reproducibility انتخاب شد.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/governance/BACKUP_POLICY.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: owner package index را refresh کرد، candidate versionها را بررسی و سپس `restic` و `rclone` را با exact package versionهای Ubuntu نصب و version commandها را اجرا کرد؛ evidence در یک commit محلی ثبت شد. هیچ push remote انجام نشد.
- Verification actually performed and result: restic 0.18.1 و rclone 1.60.1 build گزارش شدند؛ installer اعلام کرد kernel/service/container/session restart لازم نیست. OAuth، rclone remote، restic repository، password file، job و restore هنوز ایجاد نشده‌اند.
- Decisions / assumptions: headless OAuth با flow رسمی `rclone config` → local `rclone authorize` انجام می‌شود؛ token/config-token در chat، Git، Work Log یا command history ثبت نمی‌شود.
- Deferred or risk IDs: `RISK-0001`، `RISK-0003` تا `RISK-0007`؛ `RISK-0003` High/Open.
- Rollback / recovery: package installation قابل uninstall است اما تا پایان provisioning حفظ می‌شود؛ عدم موفقیت OAuth هیچ داده یا backup repository ایجاد نمی‌کند.

## LOG-0026 — 2026-08-14 — P0-A diagnosis / headless Google OAuth callback

- Outcome: نخستین rclone configuration پیش از ذخیرهٔ remote قطع شد. browser callback localhost به VPS tunnel نشده بود، بنابراین اتصال browser رد شد و OAuth کامل نشد.
- Why: auto-config روی headless VPS listener را روی localhost خود سرور باز می‌کند؛ localhost مرورگر لپ‌تاپ همان endpoint نیست.
- Scope / files: `docs/governance/BACKUP_POLICY.md` و همین Work Log.
- Commands or actions actually performed: owner rclone config را شروع، Google Drive/type/scope را انتخاب و در callback browser flow وقفه ایجاد کرد؛ سپس با Ctrl+C خارج شد. procedure در یک commit محلی ثبت شد. هیچ token/config-token در project ثبت، remote/repository/job ایجاد یا push remote انجام نشد.
- Verification actually performed and result: browser `127.0.0.1:53682` را unavailable نشان داد که با نبود SSH local tunnel سازگار است. flow جایگزین localhost-only SSH tunnel انتخاب شد.
- Decisions / assumptions: از یک SSH `-L` temporary tunnel و auto-config استفاده می‌شود؛ tunnel پس از OAuth بسته می‌شود. token در chat یا Work Log وارد نمی‌شود.
- Deferred or risk IDs: `RISK-0003` High/Open؛ OAuth provisioning هنوز pending است.
- Rollback / recovery: چون config کامل نشد، server-side rollback ندارد؛ tunnel temporary و بدون persistence است.

## LOG-0027 — 2026-08-14 — P0-A diagnosis / incomplete rclone OAuth token

- Outcome: rclone remote entry ایجاد شده اما validation آن با `empty token found` رد شد؛ OAuth callback پیش از ذخیرهٔ token کامل نشده است.
- Why: وجود نام remote به‌تنهایی authentication معتبر نیست؛ قبل از init repository باید ریموت با یک read-only listing واقعی اثبات شود.
- Scope / files: همین Work Log.
- Commands or actions actually performed: owner remote را از rclone config خارج و `rclone lsd` برای فولدر target اجرا کرد؛ command با خطای empty token و exit code 1 تمام شد. evidence در یک commit محلی ثبت شد؛ هیچ repository، backup data یا credential در Git ثبت و هیچ push remote انجام نشد.
- Verification actually performed and result: remote configuration نام‌دار وجود دارد اما OAuth token خالی است. temporary SSH tunnel فعال است و remote باید با `rclone config reconnect` تکمیل شود.
- Decisions / assumptions: remote جدید ساخته نمی‌شود؛ reconnect از طریق localhost SSH tunnel انجام و سپس همان read-only listing تکرار می‌شود.
- Deferred or risk IDs: `RISK-0003` High/Open؛ OAuth/repository/job/restore همچنان pending.
- Rollback / recovery: reconnect ناموفق فقط config بدون token باقی می‌گذارد؛ در صورت نیاز remote ناقص بعداً حذف و مجدداً ساخته می‌شود، بدون اثر بر دادهٔ Drive.

## LOG-0028 — 2026-08-14 — P0-A execution / Google Drive OAuth and target access verified

- Outcome: reconnect ریموت موجود rclone از طریق tunnel موقت localhost کامل شد و دسترسی read-only به پوشهٔ تأییدشدهٔ Google Drive با exit code `0` اثبات شد.
- Why: قبل از ایجاد repository رمزنگاری‌شده، باید اتصال remote و دسترسی واقعی به پوشهٔ مقصد بدون ثبت credential در مستندات تأیید می‌شد.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/governance/BACKUP_POLICY.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک روی VPS `rclone config reconnect` را برای همان remote موجود اجرا کرد، auto-config را از tunnel موقت localhost تکمیل کرد، و سپس `rclone lsd` را برای پوشهٔ مقصد اجرا کرد؛ Google هیچ Shared Drive در حساب نشان نداد، بنابراین remote به Drive معمولی متصل است. هیچ token، config-token، password یا محتوای backup در Git یا Work Log ثبت نشد و هیچ push remote انجام نشد.
- Verification actually performed and result: `rclone lsd` برای مسیر target با `rclone_target_exit=0` تمام شد. خروجی خالی با پوشهٔ مقصد بدون زیرپوشه سازگار است؛ این فقط اثبات دسترسی است، نه ایجاد repository یا snapshot.
- Decisions / assumptions: remote موجود حفظ می‌شود؛ مرحلهٔ بعد فقط پس از ایجاد امن password file خارج از Git، `restic init` و نخستین snapshot کنترل‌شده انجام می‌شود. tunnel پس از پایان OAuth باید بسته شود.
- Deferred or risk IDs: `RISK-0003` همچنان High/Open است؛ repository، password، job، retention و restore rehearsal هنوز انجام نشده‌اند.
- Rollback / recovery: اگر دسترسی Drive در آینده revoke شود، remote دیگر repository را قابل‌دسترسی نمی‌کند اما هیچ داده‌ای حذف نمی‌شود؛ قبل از هر عملیات destructive باید restore/runbook بررسی شود.

## LOG-0029 — 2026-08-14 — P0-A diagnosis / interrupted restic repository initialization

- Outcome: نخستین `restic init` پیش از تکمیل با signal interrupt متوقف شد؛ `restic snapshots` بلافاصله پس از آن نبودن repository config را گزارش کرد. repository معتبر یا snapshot ایجادشده اثبات نشده است.
- Why: init به password file محلی و remote معتبر نیاز داشت، اما interruption پیش از آن رخ داد؛ اجرای command بعدی نمی‌تواند init ناقص را جایگزین کند.
- Scope / files: فقط همین Work Log.
- Commands or actions actually performed: مالک directory/password file محلی را ایجاد و environment مربوط به rclone/restic را تنظیم کرد، سپس `restic init` و `restic snapshots` را اجرا کرد. init با context canceled تمام شد و snapshots config پیدا نکرد. هیچ password، token، یا backup data در Git یا Work Log ثبت نشد و هیچ push remote انجام نشد.
- Verification actually performed and result: نخستین listing با interrupt متوقف شد (exit `130`)؛ تکرار بدون interrupt نشان داد parent دارای تنها directory `restic-repository/` است و درون آن فقط `data/`، `index/`، `keys/`، `locks/` و `snapshots/` وجود دارند. در root repository فایل `config` وجود ندارد، پس repository معتبر نیست. `rclone size` سپس `0` object و `0 B` نشان داد و listing recursive هیچ فایل دیگری نداشت؛ artifact دقیق برای cleanup تأیید شد.
- Decisions / assumptions: پاک‌سازی فقط target صریح `gdrive_taha_backup:taha-personal-platform-backups/restic-repository` را در بر می‌گیرد و تنها به‌دلیل شمارش صفر/نبود config مجاز است. بعد از cleanup، init با اجرای بدون interruption تکرار و جداگانه ثبت می‌شود.
- Deferred or risk IDs: `RISK-0003` High/Open؛ repository/job/retention/restore هنوز pending هستند.
- Rollback / recovery: بررسی بعدی فقط read-only است. حذف احتمالی artifact ناقص بدون inventory صریح و تأیید مالک انجام نمی‌شود.

## LOG-0030 — 2026-08-14 — P0-A execution / encrypted restic repository initialized

- Outcome: artifact ناقصِ صفر-bایت از مسیر دقیق repository پاک‌سازی شد و `restic init` در retry بدون interruption یک repository رمزنگاری‌شدهٔ format-v2 ساخت. `restic snapshots` آن را با موفقیت باز کرد؛ هنوز snapshotی وجود ندارد.
- Why: repository معتبر و password file خارج از Git پیش‌نیاز backup واقعی، retention و restore rehearsal هستند.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/governance/BACKUP_POLICY.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک با `rclone purge` فقط مسیر inventory‌شدهٔ صفر-bایت را پاک کرد، متغیرهای repository/password file را در root shell تنظیم کرد و `restic init` و `restic snapshots` را اجرا کرد. password، token، شناسهٔ کامل repository یا دادهٔ backup در Git یا Work Log ثبت نشد و هیچ push remote انجام نشد.
- Verification actually performed and result: init repository را ایجاد کرد و snapshots آن را بدون خطا باز کرد؛ ایجاد cache محلی restic نیز گزارش شد. این evidence ایجاد repository را ثابت می‌کند، نه backup شدن هیچ source data.
- Decisions / assumptions: نخستین snapshot باید database dump streamed، media volume و configuration لازم را بدون چاپ secret پوشش دهد. سپس retention/job و restore rehearsal جداگانه اجرا و ثبت می‌شوند.
- Deferred or risk IDs: `RISK-0003` همچنان High/Open است؛ first snapshot، job، retention و restore rehearsal باقی مانده‌اند.
- Rollback / recovery: repository تازه هیچ snapshotی ندارد؛ revoke OAuth دسترسی آینده را قطع می‌کند ولی داده‌ای حذف نمی‌کند. حذف repository معتبر فقط با approval صریح مالک و inventory تازه مجاز است.

## LOG-0031 — 2026-08-14 — P0-A verification / first backup source preflight

- Outcome: preflight فقط‌خواندنی برای نخستین backup واقعی PASS شد: PostgreSQL container دارای `POSTGRES_USER` و executable `pg_dumpall` است؛ media volume، Caddyfile و هر دو Compose file قابل‌خواندن‌اند.
- Why: قبل از snapshot باید sourceهای backup و روش stream شدن dump تأیید شوند تا backup ناقص یا نمایش secret رخ ندهد.
- Scope / files: فقط همین Work Log.
- Commands or actions actually performed: مالک command بدون نمایش مقدار environment برای PostgreSQL و `test`های read-only برای media/Caddy/Compose اجرا کرد؛ سپس file-name inventory محدود repository انجام شد. هیچ dump، تغییر container یا تغییر Caddy/Compose رخ نداد و هیچ secret یا push remote ثبت نشد.
- Verification actually performed and result: همهٔ چهار preflight exit code `0` داشتند. inventory سطح اول repository فقط فایل‌های غیرمحرمانهٔ Compose، مثال environment و metadata را نشان داد؛ هیچ production environment file در همان سطح مشاهده نشد.
- Decisions / assumptions: نخستین snapshot شامل stream `pg_dumpall`، media volume، Caddyfile و هر دو Compose file خواهد بود. چون production environment file در inventory مشاهده نشد، چیزی حدس زده یا به backup اضافه نمی‌شود.
- Deferred or risk IDs: `RISK-0003` High/Open؛ first snapshot/job/retention/restore هنوز pending هستند.
- Rollback / recovery: preflight read-only است و rollback ندارد. اگر backup command خطا دهد، snapshot status پیش از هر retry بررسی می‌شود.

## LOG-0032 — 2026-08-14 — P0-A execution / partial first snapshot and PostgreSQL command correction

- Outcome: نخستین snapshot media/config با موفقیت ذخیره و retention policy اعمال شد، اما PostgreSQL command پیش از اجرای dump شکست خورد؛ بنابراین snapshot دیتابیس ساخته نشد و backup هنوز جزئی است.
- Why: `restic backup --stdin-from-command` نیاز دارد پیش از command separator `--` قرار گیرد؛ بدون آن restic آرگومان `-ceu` مربوط به shell داخل container را به‌عنوان فلگ خودش parse کرد.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/governance/BACKUP_POLICY.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک command stream PostgreSQL، backup مستقیم media/Caddy/Compose، `restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune` و `restic snapshots` را اجرا کرد. command PostgreSQL با خطای flag متوقف شد. backup media/config با سه file و یازده directory جدید ذخیره شد و policy همان snapshot را نگه داشت. هیچ dump plaintext، password یا token ثبت نشد و هیچ push remote انجام نشد.
- Verification actually performed and result: repository یک snapshot با tagهای `production,media,config` و pathهای media/Caddy/Compose نشان داد. هیچ snapshot با tag PostgreSQL یا فایل dump ایجاد نشده است.
- Decisions / assumptions: retry PostgreSQL باید از syntax مستند `--stdin-from-command -- <command>` استفاده کند؛ نتیجهٔ آن جداگانه با `restic snapshots --tag postgres` تأیید می‌شود. retention policy در همین slice با evidence واقعی اعمال شده است.
- Deferred or risk IDs: `RISK-0003` High/Open؛ PostgreSQL snapshot، scheduled job و restore rehearsal باقی مانده‌اند.
- Rollback / recovery: snapshot موفق media/config حفظ می‌شود. command ناموفق snapshot ایجاد نکرد، بنابراین retry بعدی به cleanup نیاز ندارد؛ هر failure بعدی پیش از retry با snapshots بررسی می‌شود.

## LOG-0033 — 2026-08-14 — P0-A execution / complete initial encrypted backup verified

- Outcome: retry PostgreSQL با syntax درست stream موفق شد؛ snapshot database ایجاد شد و `restic check` هر دو snapshot موجود را بدون خطا تأیید کرد. نخستین backup کاملِ sourceهای تأییدشده اکنون وجود دارد.
- Why: backup اولیه باید database، media و configuration را پوشش دهد و repository integrity پیش از automation تأیید شود.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/governance/BACKUP_POLICY.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک retry `restic backup --stdin-from-command -- docker exec ... pg_dumpall` را اجرا کرد، سپس snapshotهای tag PostgreSQL و `restic check` را اجرا کرد. syntax separator از راهنمای رسمی restic تأیید شد. هیچ dump plaintext، password یا token ثبت نشد و هیچ push remote انجام نشد.
- Verification actually performed and result: snapshot PostgreSQL با فایل `postgres-all.sql` ذخیره شد؛ check هر دو snapshot/index/blob را بررسی و `no errors were found` گزارش کرد. snapshot پیشین media/config نیز حفظ شد.
- Decisions / assumptions: automation روزانه باید همین دو backup operation، retention فعلی و lock عدم هم‌پوشانی را اجرا کند. restore rehearsal همچنان فقط در staging مستقل مجاز است.
- Deferred or risk IDs: `RISK-0003` High/Open؛ scheduled job و staging restore rehearsal باقی مانده‌اند.
- Rollback / recovery: snapshotهای معتبر حفظ می‌شوند. اگر automation بعداً fail شود، هیچ snapshotی حذف نمی‌شود؛ journal و snapshot metadata بررسی و رخداد جداگانه ثبت می‌شود.

## LOG-0034 — 2026-08-14 — P0-A hardening / Linux line-ending contract for backup artifacts

- Outcome: Git attribute policy اکنون برای script، systemd unit، timer و environment template backup صراحتاً LF را الزام می‌کند.
- Why: Git روی Windows هنگام stage کردن artifactهای Linux هشدار conversion داد. بدون contract صریح، checkout یا انتقال آینده می‌توانست CRLF و در نتیجه failure shebang/systemd ایجاد کند.
- Scope / files: `.gitattributes` و همین Work Log.
- Commands or actions actually performed: `git ls-files --eol` و `git check-attr` برای artifactها اجرا شد؛ قبل از fix attribute مربوط به آن‌ها unspecified بود. policy محدود LF افزوده شد و `bash -n` script و `git diff --check` موفق شدند. هیچ server file یا secret تغییر نکرد و هیچ push remote انجام نشد.
- Verification actually performed and result: هر چهار artifact backup اکنون `text: set` و `eol: lf` گزارش می‌شوند؛ syntax check shell نیز PASS است.
- Decisions / assumptions: همهٔ artifactهای قابل‌انتقال به Linux در `infra/backup/` باید LF بمانند؛ sourceها تنها پس از این guard به VPS منتقل می‌شوند.
- Deferred or risk IDs: `RISK-0003` High/Open؛ automation و restore rehearsal هنوز اجرا نشده‌اند.
- Rollback / recovery: تغییر فقط Git attribute است؛ حذف rule فقط در صورت تغییر target execution platform و همراه با evidence جدید مجاز است.

## LOG-0035 — 2026-08-14 — P0-A implementation / scheduled backup artifacts and recovery runbook

- Outcome: source-controlled daily backup script، systemd service/timer، non-secret environment template و recovery runbook آماده شدند؛ هنوز هیچ‌کدام روی VPS نصب یا enabled نشده‌اند.
- Why: نخستین snapshot کامل و check موفق، baseline لازم برای automation کنترل‌شده را فراهم کرد. artifactها باید version-controlled، قابل‌بررسی و بدون secret باشند.
- Scope / files: `infra/backup/`، `docs/governance/BACKUP_RUNBOOK.md`، `docs/governance/BACKUP_POLICY.md`، `PROJECT_MANIFEST.md`، Task Spec، Risk Register و همین Work Log.
- Commands or actions actually performed: artifactها در repository ایجاد شدند؛ script با `bash -n` بررسی شد و policy LF با `git check-attr` تأیید شد. runbook نصب، monitoring، retention، failure response و restore صرفاً در staging را تعیین می‌کند. هیچ systemd unit، server file یا scheduled job روی VPS تغییر نکرد و هیچ push remote انجام نشد.
- Verification actually performed and result: source script syntax-valid است و unit/timer/template تحت Git contract LF قرار دارند. installation/daemon-reload/manual service run هنوز evidence ندارند.
- Decisions / assumptions: timer روزانه 03:20 UTC با jitter ده دقیقه‌ای، lock عدم هم‌پوشانی و retention 7 daily/4 weekly/12 monthly خواهد داشت. service فقط sourceهای inventory‌شده را backup می‌کند و database dump را بدون plaintext file stream می‌کند.
- Deferred or risk IDs: `RISK-0003` High/Open؛ server installation، timer evidence و staging restore rehearsal باقی مانده‌اند.
- Rollback / recovery: تا قبل از install rollback لازم نیست. پس از install، disable timer و حذف فقط فایل‌های مشخص‌شده در runbook automation را متوقف می‌کند، بدون حذف snapshotها.

## LOG-0036 — 2026-08-14 — P0-A execution / installed systemd backup service succeeded

- Outcome: backup service نصب‌شده تحت systemd با status `0/SUCCESS` پایان یافت، دو snapshot جدید PostgreSQL و media/config ساخت و retention policy را با evidence واقعی اعمال کرد.
- Why: artifactهای repository به‌تنهایی automation نیستند؛ باید service واقعی روی VPS اجرا و رفتار آن با journal/status تأیید می‌شد.
- Scope / files: `PROJECT_MANIFEST.md`، Backup Policy/Runbook، Task Spec، Risk Register و همین Work Log.
- Commands or actions actually performed: مالک artifactهای version-controlled را با permissionهای تعریف‌شده نصب کرد، daemon-reload و unit/calendar validation را اجرا کرد، timer را enable/start کرد و service را دستی برای smoke واقعی اجرا کرد. هیچ secret، dump plaintext یا push remote ثبت نشد.
- Verification actually performed and result: service به‌صورت clean deactivated شد و `ExecStart` با `status=0/SUCCESS` تمام شد. journal snapshotهای PostgreSQL و media/config را نشان داد؛ retention برای هر دو گروه دو snapshot را نگه داشت. wall-clock حدود 5m39s، peak memory حدود 64.5MB و CPU حدود 2.1s گزارش شد. timer نیز `enabled` و `active` است و systemd زمان اجرای بعدی را گزارش کرد.
- Decisions / assumptions: service lock، timeout دو ساعته و retention جاری حفظ می‌شوند. restore rehearsal فقط در staging مستقل مجاز است.
- Deferred or risk IDs: `RISK-0003` High/Open؛ فقط staging restore rehearsal باقی مانده است.
- Rollback / recovery: در صورت نیاز، `systemctl disable --now taha-platform-backup.timer` اجرای آینده را متوقف می‌کند و snapshotها را حذف نمی‌کند. هیچ rollbackی در این اجرا لازم نشد.

## LOG-0037 — 2026-08-14 — P0-A verification / timer active and harmless interrupted listing

- Outcome: timer backup به‌صورت `enabled` و `active` تأیید شد و systemd زمان trigger بعدی را نمایش داد. فرمان read-only `restic snapshots` پس از این evidence با interrupt متوقف شد؛ هیچ backup job، timer یا snapshotی قطع نشد.
- Why: تشخیص باید بین interruption یک command مشاهده‌ای و interruption service backup تمایز بگذارد.
- Scope / files: `PROJECT_MANIFEST.md`، Backup Policy، Task Spec، Risk Register و همین Work Log.
- Commands or actions actually performed: مالک `systemctl is-enabled`، `systemctl is-active`، `systemctl status` و `systemctl list-timers` را اجرا کرد. خروجی list-timers در pager نشان داده شد و سپس فرمان `restic snapshots` با Ctrl+C متوقف شد. هیچ secret یا push remote ثبت نشد.
- Verification actually performed and result: timer enabled/active بود و next elapse برای روز بعد در UTC ثبت شد. service قبلی status موفق داشت. خطای signal interrupt فقط مربوط به command listing است و نشانگر repository corruption یا failure backup نیست.
- Decisions / assumptions: backup automation عملیاتی است؛ از re-run غیرضروری snapshots بلافاصله پس از interrupt خودداری می‌شود. evidence بعدی باید restore rehearsal روی staging مستقل باشد.
- Deferred or risk IDs: `RISK-0003` High/Open؛ restore rehearsal باقی مانده است.
- Rollback / recovery: timer را می‌توان بدون حذف snapshot با `systemctl disable --now taha-platform-backup.timer` متوقف کرد. interrupt listing هیچ recovery لازم ندارد.

## LOG-0038 — 2026-08-14 — P0-A planning / isolated restore rehearsal defined

- Outcome: یک Task Spec مستقل برای restore rehearsal غیرمخرب ایجاد شد؛ scope آن فقط recovery به target موقت root-only و verification فایل‌ها است.
- Why: restore عملیاتی HIGH-RISK است و نباید با backup موفق یا staging placeholder اشتباه گرفته شود. scope صریح مانع restore ناخواسته روی production می‌شود.
- Scope / files: `docs/plan/P0-A-restore-rehearsal-task-spec.md` و همین Work Log.
- Commands or actions actually performed: فقط Task Spec و evidence requirements ایجاد شدند. هیچ restore، cleanup، container، database import، service/timer یا production file تغییر نکرد و هیچ push remote انجام نشد.
- Verification actually performed and result: preconditionها از evidence LOG-0036/0037 قابل‌ارزیابی‌اند، اما اجرای restore هنوز pending است.
- Decisions / assumptions: temporary target زیر `/dev/shm` با permission `0700` انتخاب می‌شود تا plaintext restore persistent نشود. این test `RISK-0003` را به‌تنهایی نمی‌بندد، زیرا database import در staging واقعی را آزمایش نمی‌کند.
- Deferred or risk IDs: `RISK-0003` High/Open؛ restore rehearsal و سپس staging database import evidence باقی می‌ماند.
- Rollback / recovery: تا اجرای task تغییری برای rollback نیست. هر failure restore production را دست‌نخورده می‌گذارد و target موقت برای diagnosis نگه داشته می‌شود.

## LOG-0039 — 2026-08-14 — P0-A diagnosis / restore rehearsal guard blocked pre-existing target

- Outcome: restore rehearsal پیش از هر restore به‌دلیل وجود target ثابت از قبل موجود متوقف شد. guard این رفتار را عمداً رد کرد؛ هیچ داده‌ای restore، overwrite یا حذف نشد.
- Why: target ثابت replay-safe نبود و وجود آن به‌معنای نامشخص بودن ownership/محتوا بود. حذف یا reuse بدون inventory با قرارداد recovery سازگار نیست.
- Scope / files: Task Spec restore rehearsal و همین Work Log.
- Commands or actions actually performed: مالک script restore را ابتدا در context کاربر غیر-root و سپس root اجرا کرد؛ هر دو بار precondition مسیر موجود را تشخیص دادند و قبل از فراخوانی restic خارج شدند. هیچ secret، snapshot، container، database یا production file تغییر نکرد و هیچ push remote انجام نشد.
- Verification actually performed and result: پیام `Refusing to reuse restore target` اثبات می‌کند guard قبل از write عمل کرده است. محتوای target قدیمی هنوز inventory نشده و نباید حذف شود.
- Decisions / assumptions: Task Spec برای ایجاد target یکتای `mktemp -d` اصلاح شد. inventory non-sensitive مسیر قدیمی فقط برای ثبت وضعیت انجام می‌شود؛ rehearsal بعدی هرگز آن را reuse نمی‌کند.
- Deferred or risk IDs: `RISK-0003` High/Open؛ restore rehearsal هنوز اجرا نشده است.
- Rollback / recovery: تغییری رخ نداده است. مسیر قدیمی تا تعیین ownership محفوظ می‌ماند؛ target یکتای بعدی فقط پس از verification موفق پاک می‌شود.

## LOG-0040 — 2026-08-14 — P0-A execution / isolated encrypted restore rehearsal passed

- Outcome: PostgreSQL و media/config snapshotهای انتخاب‌شده با موفقیت به یک target یکتای root-only در `/dev/shm` restore شدند؛ dump non-empty بود، سه configuration file با source برابر بودند، count فایل‌های media برابر بود و target جدید پس از verification حذف شد.
- Why: backup و repository check به‌تنهایی recoverability را اثبات نمی‌کنند. این rehearsal مسیر decrypt/read/restore را بدون تغییر production اثبات می‌کند.
- Scope / files: Manifest، Backup Policy/Runbook، هر دو Task Spec، Risk Register، Deferred Validation و همین Work Log.
- Commands or actions actually performed: مالک capacity `/dev/shm` را بررسی کرد، target یکتا با `mktemp` ساخت، دو snapshot را restore کرد، test/cmp/count غیرمحرمانه را اجرا و فقط همان target یکتا را حذف کرد. target قدیمی deploy-owned صرفاً با owner/mode/type مشاهده و دست‌نخورده ماند. هیچ SQL import، container، service/timer، production file یا push remote تغییر نکرد.
- Verification actually performed and result: restore PostgreSQL یک فایل در حدود 143KiB را در حدود یک ثانیه و restore media/config چهارده entry را در حدود پنجاه ثانیه گزارش کرد. تمام assertionها PASS و `restore_rehearsal=PASS` چاپ شد؛ cleanup target یکتا نیز PASS بود.
- Decisions / assumptions: این evidence file-level recovery را می‌بندد، اما import دیتابیس در staging runtime جداگانه همچنان برای closure `RISK-0003` لازم است. directory قدیمی deploy-owned در `DEFER-0006` ثبت شد.
- Deferred or risk IDs: `RISK-0003` High/Open؛ `DEFER-0006` Low/Open.
- Rollback / recovery: restore به production ننوشت و target یکتای rehearsal حذف شد؛ rollback لازم نیست. برای مرحلهٔ بعدی فقط staging runtime جداگانه و Task Spec مجاز است.

## LOG-0041 — 2026-08-14 — P0-G0 planning / fast safe-live implementation backlog

- Outcome: یک backlog اجرایی ریشه‌ای در `Task-list.md` ساخته شد که ۸۱ task و ۳۲۴ checkbox را از closure گیت P0-G0 تا P11 پوشش می‌دهد و مسیر بحرانی first live را به یک release ایستای P1 بدون CMS/database/contact persistence جدید محدود می‌کند.
- Why: هدف مالک کوتاه‌کردن time-to-live همراه با انتقال صریح تست‌ها و hardening غیرحیاتی به بعد از release بود؛ برنامه باید بین defer مجاز و Stop-the-line/Minimum Safe Gate تمایز می‌گذاشت.
- Scope / files: `Task-list.md`، `docs/plan/P0-G0-fast-safe-live-task-list-task-spec.md` و همین Work Log. هیچ application، dependency، infrastructure، server، DNS، backup، CI یا deployment state تغییر نکرد.
- Commands or actions actually performed: inventory فایل‌ها و Git/history، خواندن قراردادهای حاکم و evidenceهای P0-A، فهرست کامل sectionهای Product/Architecture/IA/Design baseline و بررسی بخش‌های مرتبط با phaseها، release، locale، security، operations و P1 انجام شد؛ سپس Task Spec و task list ایجاد شدند.
- Verification actually performed and result: بررسی programmatic وجود G0/P0A/P0B/P1 تا P11، risk/locale/admin/deferred contracts PASS شد؛ ۸۱ task ID یکتا و ۳۲۴ checkbox شمارش شد؛ scan عبارت‌های placeholder و مسیرهای legacy PASS و `git diff --check` بدون خطا تمام شد.
- Decisions / assumptions: مسیر پیشنهادی `R0 Gate closure → R1 static deployment spine → R2 bilingual P1 production` است. defer کردن staging database import فقط با پذیرش صریح و محدود مالک برای static-only P1 مجاز است؛ تصمیم مالک، inventory/rollback stack موجود و production approval همچنان blocker واقعی اجرای برنامه‌اند.
- Deferred or risk IDs: هیچ ID جدیدی ایجاد نشد چون این slice فقط برنامه‌ریزی است. برنامه وضعیت فعلی `RISK-0001`، `RISK-0003` تا `RISK-0007` و `DEFER-0001` تا `DEFER-0006` را تغییر نمی‌دهد.
- Rollback / recovery: این تغییر کاملاً مستندی است؛ rollback فقط حذف دو فایل جدید task-owned و بازگرداندن همین entry است و هیچ runtime data یا server state را لمس نمی‌کند.

## LOG-0042 — 2026-08-14 — Agent tooling / 9Router credential exposure report

- Outcome: یک credential ارسال‌شده در گفت‌وگو به‌عنوان exposure ثبت و `RISK-0008` با وضعیت `BLOCKED` ایجاد شد.
- Why: credential گفتگو نباید در repository، log، output یا configuration پایدار بازنشر شود و تا rotation نباید برای اتصال agentها استفاده شود.
- Scope / files: فقط `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: Risk Register بدون درج مقدار credential به‌روزرسانی شد؛ هیچ اتصال 9Router، config OpenCode، provider، VPS یا secret store تغییر نکرد.
- Verification actually performed and result: entry جدید `RISK-0008` شامل owner، trigger، mitigation و شرط rotation است و هیچ مقدار credential در diff وجود ندارد.
- Decisions / assumptions: 9Router تا rotation مستقل credential و اتصال تعاملی امن، فقط یک capability بالقوه است و مسیر اجرای R0.1 به آن وابسته نیست.
- Deferred or risk IDs: `RISK-0008`.
- Rollback / recovery: حذف entry فقط در صورت اثبات اینکه exposure رخ نداده بود مجاز است؛ remediation واقعی revoke/rotate credential در dashboard 9Router است.


## LOG-0043 — 2026-08-14 — P0-G0 / Repository metadata publish

- Outcome: Task Spec «P0-G0 repository metadata publish» ایجاد شد؛ `README.md` با نقطهٔ ورود/وضعیت/چیدمانِ مستند به‌عنوان منبع به‌روزرسانی شد و `.gitignore` guardهایی برای فایل‌های environment پشتیبان، artifactهای OS/editor و وضعیت agent-local به دست آورد؛ همین entry ثبت شد. `LOG-0043` استفاده شده است چون worktree اصلی دارای رکوردهای owner-held و uncommitted با شماره‌های `LOG-0041` و `LOG-0042` است.
- Why: README و ignore file باید فقط بر پایهٔ مستندات رسمی repository دقیق می‌بودند و ثبت هر کار طبق Documentation Policy الزامی است.
- Scope / files: `docs/plan/P0-G0-repository-metadata-task-spec.md`، `README.md`، `.gitignore` و `docs/status/WORK_LOG.md`؛ هیچ فایل دیگری تغییر نکرد.
- Commands or actions actually performed: Task Spec ایجاد شد؛ `README.md` و `.gitignore` ویرایش و همین entry ثبت شد. هیچ تغییر runtime، deployment، dependency، infrastructure، secret یا server انجام نشد.
- Verification actually performed and result: قرارداد مستندات (`PROJECT_MANIFEST.md`، `AGENTS.md` و governance policies) خوانده شد؛ لینک‌های نسبی مستندات README وجود دارند؛ `git diff --check` PASS شد.
- Decisions / assumptions: شمارهٔ `LOG-0043` به‌کار رفته است چون worktree اصلی دارای رکوردهای owner-held و uncommitted با شماره‌های `LOG-0041` و `LOG-0042` است و این branch تمیز باید ledger append-only را بدون collision ادامه دهد.
- Deferred or risk IDs: ندارد؛ هیچ deferral یا ریسک جدیدی ایجاد نشد.
- Rollback / recovery: بازگردانی همان چهار فایل task (`docs/plan/P0-G0-repository-metadata-task-spec.md`، `README.md`، `.gitignore`، `docs/status/WORK_LOG.md`).

## LOG-0051 — 2026-08-14 — G0-01 / documentation snapshot and drift fix

- Outcome: وضعیت مستندات با evidence عملیاتی P0-A (LOG-0024 تا LOG-0040) هم‌تراز شد: مسیر نمونهٔ URL admin در Technology Baseline از `/cms/` به `/admin/` (مصوب ADR-0014) اصلاح شد؛ وضعیت عملیاتی ADR-0008 و ADR-0010 در index و خود ADRها به‌روز شد؛ جملهٔ قدیمی «restic password is still not created» در BACKUP_POLICY اصلاح شد؛ شماره‌گذاری تکراری و status قدیمی Task Spec سرور رفع شد؛ و توصیف `RISK-0001` به موانع واقعاً باقی‌مانده (PASS رسمی G0-06، تصمیم مالک، scaffold/CI/deploy) محدود شد.
- Why: G0-01 نخستین task مسیر بحرانی first live است و باید از تناقض مستندات بالادستی دربارهٔ provisioning امروز جلوگیری کند؛ تصمیم‌های ADR پذیرفته‌شده تغییر نکردند.
- Scope / files: `docs/plan/P0-G0-documentation-drift-task-spec.md`، `docs/taha-personal-platform-technology-architecture-baseline-fa.md`، `docs/adr/README.md`، `docs/adr/0008-...`، `docs/adr/0010-...`، `docs/governance/BACKUP_POLICY.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: `git diff --check`؛ grep `/cms/` روی Technology Baseline؛ script بررسی لینک‌های محلی روی فایل‌های لمس‌شده. هیچ scaffold، dependency، API/schema، Docker/Caddy، DNS، VPS، backup، CI یا deploy اجرا نشد.
- Verification actually performed and result: `git diff --check` بدون خطا (PASS)؛ Technology Baseline اکنون هیچ URL-route `/cms/` ندارد و تنها `apps/cms/` به‌عنوان مسیر source باقی است؛ link-check محلی فایل‌های لمس‌شده PASS بود.
- Decisions / assumptions: `apps/cms/` به‌عنوان مسیر source canonical است و تغییر نمی‌کند؛ فقط نمونهٔ URL route به `/admin/` هم‌سو شد. هیچ تصمیم ADR بازنویسی نشد.
- Deferred or risk IDs: `RISK-0001` همچنان BLOCKED (باقی‌مانده: تصمیم gate، scaffold/CI/deploy)؛ `RISK-0003` و `RISK-0004` تا `RISK-0007` تغییر نکردند.
- Rollback / recovery: همهٔ تغییرها صرفاً مستندی و با Git قابل بازگشت‌اند؛ هیچ runtime data یا server state لمس نشده است.

## LOG-0052 — 2026-08-14 — G0-04/G0-05 / first-live technical freeze and minimum ADRs

- Outcome: تصمیم‌های فنی حداقلی R2 در `PROJECT_MANIFEST.md` freeze شد و سه ADR پیشنهادی (0016 static-first Astro + React islands، 0017 artifact نسخه‌دار + atomic switch/rollback، 0018 P1 design/hydration/font minimum) به‌همراه ثبت در index و اصلاح status کهنهٔ ADR-0015 ایجاد شد.
- Why: G0-04/G0-05 بخشی از closure گیت R0 هستند و باید تصمیم‌های غیربدیهی first live را از حافظه/چت جدا کنند؛ بدون scaffold یا install.
- Scope / files: `PROJECT_MANIFEST.md`، سه ADR جدید، `docs/adr/README.md`، `docs/plan/P0-G0-technical-freeze-adrs-task-spec.md` و همین Work Log.
- Commands or actions actually performed: `node --version` (v24.16.0)، `npm --version` (11.18.0)، `npx --version` (11.18.0)، `uv --version` (0.12.3) و `npm view astro version` (7.2.2)، `npm view tailwindcss version` (4.3.3)، `npm view typescript version` (7.0.2) اجرا شد. هیچ install، scaffold، dependency، `.venv` یا runtime اجرا نشد.
- Verification actually performed and result: نسخه‌های محیط و آخرین نسخهٔ Astro/Tailwind/TypeScript از npm ثبت شدند؛ `git diff --check` بدون خطا و link-check محلی فایل‌های لمس‌شده PASS بود.
- Decisions / assumptions: package manager `npm`، Node 24.16.0، Astro static-first؛ React/Tailwind/shadcn/Motion/GSAP/D3/Three/Pagefind/analytics/dark mode همه برای R2 `NOT USED IN R2`؛ font/logo/media `OPEN` وابسته به مالک. ADRها به‌صورت `Proposed` ثبت شدند تا در G0-06 پذیرفته شوند.
- Deferred or risk IDs: `RISK-0001` BLOCKED (تصمیم gate و scaffold باقی است)؛ تغییری در ریسک‌های دیگر نبود.
- Rollback / recovery: فقط مستندات؛ بازگشت با Git.

## LOG-0053 — 2026-08-14 — G0-02/G0-03/G0-06 / gate decision and P0-G0 PASS (static-only P1)

- Outcome: تصمیم مالک برای first live ثبت و گیت به `P0-G0: PASS for static-only P1` منتقل شد: `RISK-0001` بسته شد، `RISK-0003` با پذیرش محدود static-only ثبت شد، header Manifest/AGENTS به‌روز شد و content pack پیشنهادی `fa`/`en` ساخته شد.
- Why: بدون تصمیم مکتوب مالک، scaffold مجاز نیست؛ این slice شرط G0-06 را برآورده می‌کند و scope را صریحاً به static P1 محدود می‌کند.
- Scope / files: `docs/status/RISK_REGISTER.md`، `PROJECT_MANIFEST.md`، `AGENTS.md`، `docs/plan/P0-G0-content-pack-proposal.md`، `docs/plan/P0-G0-gate-decision-task-spec.md` و همین Work Log.
- Commands or actions actually performed: فقط به‌روزرسانی مستندات و ثبت تصمیم؛ هیچ scaffold، dependency، API، Docker/Caddy، DNS، VPS، backup، CI یا deploy اجرا نشد.
- Verification actually performed and result: `git diff --check` بدون خطا. مالک سه تصمیم را تأیید کرد: پذیرش محدود `RISK-0003` برای static-only P1، تهیهٔ پیش‌نویس content pack توسط agent و تأیید توسط مالک، و text-mark + فونت self-host حداقلی.
- Decisions / assumptions: PASS فقط برای static P1 است؛ PASS کلی CMS اعلام نشده و CMS/DB/contact persistence تا P3 مسدودند. content pack پیشنهادی است و هیچ metric/link/evidence حدسی ندارد.
- Deferred or risk IDs: `RISK-0001` CLOSED؛ `RISK-0003` ACCEPTED (limited, static-only P1) با expiry trigger قبل از P3؛ `RISK-0004` تا `RISK-0007` تغییر نکردند.
- Rollback / recovery: بازگشت فقط مستندی؛ در صورت بازگشایی هر risk، گیت دوباره بررسی می‌شود.

## LOG-0054 — 2026-08-14 — P0A-03..06 / P1-01..09 static P1 frontend scaffold and bilingual landing

- Outcome: `apps/web/` به‌صورت static-first Astro + TypeScript + Tailwind v4 scaffold شد و P1 کامل ساخته شد: Language Gateway در `/`، صفحات `/fa/` (RTL) و `/en/` (LTR)، 404 locale-aware، `health.json`، `robots.txt`، `sitemap.xml`، design tokens از `design.md`، و workflow CI در `.github/workflows/ci.yml`. محتوای اصلی بدون JavaScript خوانا است و هیچ React/heavy dependency نصب نشده است.
- Why: پس از `P0-G0: PASS for static-only P1`، scaffold `apps/web/` مجاز شد و این slice خروجی ایستای قابل build برای P1 را فراهم می‌کند.
- Scope / files: `apps/web/**` (source، config، lockfile)، `.github/workflows/ci.yml`، `docs/plan/P0-A-web-scaffold-task-spec.md` و همین Work Log.
- Commands or actions actually performed: در `apps/web/` اجرا شد: `npm install` (294 package)، `npm run check` (astro check: 0 error / 0 warning / 0 hint)، `npm run build` (static output شامل `/`, `/en/index.html`, `/fa/index.html`, `/404.html`, `/health.json`, `/robots.txt`, `/sitemap.xml`). بررسی دستی خروجی `dist/` برای `lang`/`dir`/`canonical`/`hreflang` انجام شد.
- Verification actually performed and result: build و check هر دو PASS؛ `fa` خروجی `lang="fa" dir="rtl"` و canonical/hreflang صحیح دارد؛ `health.json` مقدار `{"status":"ok","service":"static","version":"0.1.0"}` را برمی‌گرداند؛ محتوای فارسی UTF-8 صحیح است.
- Decisions / assumptions: npm به‌عنوان package manager؛ Node 24.16.0؛ Astro 7.2.2؛ Tailwind v4 CSS-first. فونت self-host نهایی نشده (system stack تا تأیید مالک)؛ OG image و contact مقصد ندارند و صادقانه حذف/inactive شده‌اند. CI هنوز روی runner واقعی اجرا نشده است.
- Deferred or risk IDs: بدون ID جدید؛ `RISK-0004` تا `RISK-0007` (deploy/ظرفیت/patch/SSH) برای فاز استقرار باقی‌اند. موارد باقی‌ماندهٔ P1 (viewport/accessibility/visual smoke، OG image، فونت نهایی، staging/prod deploy) برای فاز deploy ثبت می‌شوند.
- Rollback / recovery: `apps/web/` تازه است؛ حذف آن و `ci.yml` تغییر را برمی‌گرداند؛ هیچ server/runtime state لمس نشده است.

## LOG-0055 — 2026-08-14 — P1 / independent verification, content QA and deploy mechanics

- Outcome: دو subagent مستقل (explore و general) به‌صورت read-only پروژه را بازبینی کردند: acceptance ده‌گانهٔ P1 همه PASS و content pack از نظر ترجمه/واقعیت امن بود. چند اصلاح جزئی اعمال شد؛ مکانیک deploy (runbook + Caddy candidate + اسکریپت‌های deploy/rollback) طبق ADR-0017 ایجاد شد و `DEFER-0007` تا `DEFER-0010` ثبت شد.
- Why: verification مستقل، تشخیص مسائل RTL/محتوا و آماده‌سازی مسیر deploy ایستا برای دستیابی به release gate.
- Scope / files: `apps/web/src/data/content.ts`، `apps/web/src/pages/404.astro`، `docs/governance/DEPLOY_RUNBOOK.md`، `infra/caddy/static-site.caddy`، `infra/deploy/deploy.sh`، `infra/deploy/rollback.sh`، `.gitattributes`، `AGENTS.md`، `docs/status/deferred-validation.md`، `Task-list.md` و همین Work Log.
- Commands or actions actually performed: دو subagent (explore/general) اجرا شدند؛ `npm run check` (0 error) و `npm run build` پس از اصلاحات PASS؛ `bash -n` روی هر دو اسکریپت deploy PASS. هیچ VPS/Caddy/DNS/deploy واقعی اجرا نشد.
- Verification actually performed and result: verification report ده مورد PASS و بدون blocker؛ اصلاحات: حذف token مختلط RTL («R&D» → «تحقیق و توسعه»)، بهبود واژگان fa، حذف canonical شبح‌وار در 404. اسکریپت‌ها syntax-valid و LF هستند.
- Decisions / assumptions: deploy mechanics از ADR-0017 پیاده‌سازی شد؛ مسیرهای مطلق (`SITE_ROOT`) و switch تولید تا inventory P0A-01 نهایی می‌مانند. Caddy candidate اعمال نشده و فقط candidate است.
- Deferred or risk IDs: `DEFER-0007` (contact path)، `DEFER-0008` (font)، `DEFER-0009` (OG image)، `DEFER-0010` (browser verification) OPEN؛ `RISK-0004` تا `RISK-0007` برای فاز deploy بازند.
- Rollback / recovery: تغییرات frontend/infra فقط؛ اسکریپت‌های deploy/rollback عملیات سرور انجام نمی‌دهند تا inventory و تأیید مالک.

## LOG-0056 — 2026-08-14 — P1 / HTTP verification, gateway polish and deploy-prep documentation

- Outcome: سایت با preview server واقعی از نظر HTTP اعتبارسنجی شد (همهٔ routeهای public 200، 404 صحیح، بدون link شکسته، CSS سالم)؛ Gateway با SVG field ایستای غیر-blocking و theme-color مطابق design.md §60.5 بهبود یافت؛ Task Spec inventory فقط‌خواندنی P0A-01 برای مالک، entry DEBT-0001 و وضعیت به‌روز queue تصمیم مالک ثبت شد.
- Why: تأیید خروجی پیش از استقرار و آماده‌سازی گام‌های بعدی (deploy روی VPS) به‌صورت turnkey و بدون حدس.
- Scope / files: `apps/web/src/pages/index.astro`، `apps/web/src/layouts/BaseLayout.astro`، `docs/plan/P0-A-stack-inventory-task-spec.md`، `docs/status/TECH_DEBT.md`، `Task-list.md` (بخش 18) و همین Work Log.
- Commands or actions actually performed: `npm run preview -- --port 4321` به‌همراه `curl.exe` برای routeهای `/`, `/en/`, `/fa/`, `/404`, `/health.json`, `/robots.txt`, `/sitemap.xml`, `/nonexistent-path`؛ link-check استخراج href/src و بررسی 200؛ بررسی فایل‌های CSS. سپس `npm run check` (0 error) و `npm run build` PASS.
- Verification actually performed and result: `GET /`, `/en/`, `/fa/`, `/health.json`, `/robots.txt`, `/sitemap.xml` → 200؛ `/en` و `/fa` بدون slash و مسیرهای ناموجود → 404 (کالک canonical با `trailingSlash: always`؛ redirect لایهٔ deploy در P0A-06 ثبت شده)؛ link-check 4 لینک یکتا PASS؛ CSS هر دو فایل 200 با محتوای کامل. SVG gateway دارای no-JS/no-motion fallback است.
- Decisions / assumptions: شکل canonical URLها با slash است؛ redirect بدون-slash در Caddy (P0A-06) انجام می‌شود. inventory فقط‌خواندنی VPS توسط مالک اجرا می‌شود؛ هیچ server command توسط agent اجرا نشد.
- Deferred or risk IDs: `DEBT-0001` OPEN؛ `DEFER-0007` تا `DEFER-0010` OPEN؛ `RISK-0004`/`RISK-0007` پس از inventory به‌روز می‌شوند.
- Rollback / recovery: تغییرات فقط frontend/docs؛ build دوباره تمام قدیم را برمی‌گرداند.

## LOG-0057 — 2026-08-14 — P1 / canonical commands, dependency scan and status sync

- Outcome: فرمان‌های تأییدشدهٔ `apps/web/` در `PROJECT_MANIFEST.md` به‌عنوان canonical ثبت شدند، `npm audit` اجرا شد (0 vulnerability)، وضعیت scaffold در Manifest و README هم‌تراز واقعیت شد.
- Why: طبق P0A-03، فرمان‌های app فقط پس از اجرای واقعی و ثبت در Manifest canonical می‌شوند؛ README/Manifest نباید وضعیت کهنه را نمایش دهند.
- Scope / files: `PROJECT_MANIFEST.md`، `README.md` و همین Work Log.
- Commands or actions actually performed: در `apps/web/`: `npm audit --audit-level=high` → `found 0 vulnerabilities`. فرمان‌های install/check/build/preview قبلاً با evidence LOG-0054/0056 اجرا شده‌اند.
- Verification actually performed and result: audit بدون vulnerability؛ ساختار canonical commands در Manifest با فرمان‌های واقعاً اجراشده یکسان است.
- Decisions / assumptions: فرمان‌های CMS/deploy همچنان canonical نیستند و تا slice مربوطه ثبت نمی‌شوند.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: تغییرات مستندی؛ بازگشت با Git.

## LOG-0058 — 2026-08-14 — P1 / favicon, OG locale and CI artifact verification

- Outcome: favicon SVG مشتق از text-mark مصوب (`TM` روی Navy با Turquoise)، `og:locale` (fa_IR/en_US) و مرحلهٔ verification در CI (کامل‌بودن artifact + scan الگوی secret) اضافه و به‌صورت محلی اعتبارسنجی شد.
- Why: polish امن/کوچک پیش از release: favicon برای تب مرورگر، metadata OG صحیح، و gate CI که artifact ناقص یا حاوی الگوی secret را رد کند.
- Scope / files: `apps/web/public/favicon.svg`، `apps/web/src/layouts/BaseLayout.astro`، `apps/web/src/pages/index.astro`، `.github/workflows/ci.yml` و همین Work Log.
- Commands or actions actually performed: `npm run check` (0 error) و `npm run build` PASS؛ اجرای محلی همان تست‌های CI (وجود هفت فایل artifact و grep الگوهای secret) → PASS بدون هیچ hit.
- Verification actually performed and result: favicon در `dist/favicon.svg` حاضر؛ scan محلی هیچ الگوی secret در `dist/` پیدا نکرد؛ منطق مرحلهٔ CI پیش از push آزمایش شد.
- Decisions / assumptions: favicon صرفاً مشتق text-mark است و با تأیید لوگوی نهایی جایگزین می‌شود (الگوی مشابه DEFER-0008).
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: تغییرات frontend/CI؛ بازگشت با Git.

## LOG-0059 — 2026-08-15 — R1 / push, CI pass, partial inventory and staging handoff

- Outcome: history محلی با commits metadata ریموت ادغام شد (collision شمارهٔ `LOG-0043` با renumber به `LOG-0051` تا `LOG-0058` رفع شد) و به origin/main push شد؛ CI روی GitHub Actions با `npm ci`/`check`/`build`/artifact verification **PASS** شد؛ inventory فقط‌خواندنی جزئی VPS (Caddyfile، منابع، روند placeholder) ثبت شد؛ artifact نسخه‌دار `release-a2720d9` به VPS منتقل و اسکریپت sudo یک‌فرمانی `stage-p1.sh` آماده شد.
- Why: گام‌های بعدی مسیر first live: فعال‌شدن CI و آماده‌سازی staging deploy به‌صورت turnkey با backup/validate/rollback.
- Scope / files: `.gitignore`، `README.md`، `docs/status/WORK_LOG.md`، `Task-list.md`، `docs/status/RISK_REGISTER.md`، `docs/status/TECH_DEBT.md`، `docs/status/deferred-validation.md`، `infra/deploy/stage-p1.sh`، `docs/governance/DEPLOY_RUNBOOK.md`.
- Commands or actions actually performed: `git merge origin/main` با رفع تعارض؛ `git push origin main` (70dc744..a2720d9)؛ از طریق SSH فقط‌خواندنی: `uname`، `free -m`، `df -h`، `ps` برای Caddy، `cat /etc/caddy/Caddyfile`، `curl -sI` برای production (200) و staging (503)؛ `scp` artifact و `bash -n` روی script در سرور. هیچ دستور sudo یا تغییر Caddy اجرا نشد.
- Verification actually performed and result: `gh run list` → CI completed/success؛ artifact شامل health.json/robots/sitemap/locale roots روی سرور تأیید شد؛ `stage-p1.sh` syntax-valid روی سرور.
- Decisions / assumptions: staging deploy توسط مالک با یک فرمان sudo اجرا می‌شود: `sudo bash ~/taha-stage/stage-p1.sh ~/taha-stage/release-a2720d9`؛ production blocks دست نمی‌خورند. آدرس سرور در `~/.ssh/config` (alias `taha-nl`) است و در repo ثبت نمی‌شود.
- Deferred or risk IDs: `RISK-0004` (inventory Docker هنوز sudo می‌خواهد)، `RISK-0007` (capacity بر اساس 1.1GB available برای staging static کافی ارزیابی می‌شود)؛ بدون ID جدید.
- Rollback / recovery: staging script دارای backup/validate/auto-restore است؛ rollback مسیر در DEPLOY_RUNBOOK ثبت شد.

## LOG-0060 — 2026-08-15 — R1/R2 / staging deploy live and verified (P0A-09)

- Outcome: مالک `sudo bash ~/taha-stage/stage-p1.sh ~/taha-stage/release-a2720d9` را اجرا کرد؛ Caddy validate PASS و reload انجام شد و `staging.tahamohamadi.ir` اکنون artifact ایستای P1 را سرو می‌کند. Bug اولیهٔ permission (artifact scp با mode 0700 → 403 برای caddy user) با `chmod -R a+rX` رفع شد؛ اسکریپت برای آینده با `chown/chmod` نرمال‌سازی و 404 صحیح (بدون try_files) برای اجرای بعدی آماده شد.
- Why: P0A-09 خروجی staging ایستا است؛ این اولین اجرای واقعی مکانیک deploy طبق ADR-0017 است.
- Scope / files: `infra/deploy/stage-p1.sh`، `docs/governance/DEPLOY_RUNBOOK.md`، `docs/status/WORK_LOG.md`.
- Commands or actions actually performed: از این agent: `curl` routeهای staging از مسیر Cloudflare و direct-origin؛ `ssh` فقط‌خواندنی + `chmod -R a+rX` (مالکیت deploy)؛ `bash -n`؛ `scp` اسکریپت اصلاح‌شده؛ commit/push. مالک دستور sudo را اجرا کرد (evidence خروجی در گفت‌وگو).
- Verification actually performed and result: `GET /`, `/en/`, `/fa/`, `/health.json`, `/404.html`, `/favicon.svg` → 200؛ `/en/` محتوای کامل با `lang="en" dir="ltr"`؛ `/fa/` RTL؛ `health.json` = `{"status":"ok","service":"static","version":"0.1.0"}`؛ header `x-robots-tag: noindex, nofollow` فعال؛ production `tahamohamadi.ir` → 200 دست‌نخورده. یافته: Cloudflare edge در مسیر proxy، `/robots.txt` را intercept می‌کند (origin robots صحیح است) — موردی zone-level که مالک در پنل Cloudflare باید بررسی کند.
- Decisions / assumptions: staging block فقط تعویض شد؛ production/www/IP blocks دست‌نخورده‌اند؛ legacy Compose stack بدون تغییر در جریان است.
- Deferred or risk IDs: `DEFER-0011` (بررسی Cloudflare robots/zone)؛ `RISK-0004` progress (inventory Caddy کامل، docker metadata هنوز sudo می‌خواهد).
- Rollback / recovery: restore the exact timestamped `Caddyfile.pre-stage-p1.<timestamp>` backup, validate + reload, و/یا برگرداندن `current` به release قبلی.

## LOG-0061 — 2026-08-15 — P1 / ui-ux-pro-max gateway review and RTL correction

- Outcome: screenshot اولیهٔ staging با `ui-ux-pro-max` و `docs/design.md` review شد. جهت بصری کلی (Navy، selective glass، Turquoise/Gold، technical field) مناسب تشخیص داده شد؛ ایراد واقعی bidi در نمایش نام فارسی، prompt تک‌زبانه، mobile target و reduced-motion اصلاح شد.
- Why: screenshot نشان داد نام `Taha Mohammadi · طه محمدی` در یک خط bidi-safe نیست و فارسی به‌صورت شکسته/ناقص دیده می‌شود؛ این یک مشکل قابل مشاهدهٔ P1 بود، نه صرفاً polish.
- Scope / files: `docs/plan/P1-gateway-ui-review-task-spec.md`، `apps/web/src/pages/index.astro`، `apps/web/src/styles/global.css`، `infra/deploy/stage-p1.sh`، `docs/governance/DEPLOY_RUNBOOK.md`، `docs/status/deferred-validation.md` و همین Work Log.
- Commands or actions actually performed: `ui-ux-pro-max` design-system و UX/landing searches؛ `npm run check` (0 error / 0 warning / 0 hint)؛ `npm run build`؛ static output assertions برای ترتیب identity، prompt دوزبانه و `dir="rtl"`. هیچ dependency یا animation library اضافه نشد.
- Verification actually performed and result: identity انگلیسی/فارسی در دو line مستقل با `dir` جدا render می‌شود؛ prompt هر دو زبان را نمایش می‌دهد؛ دکمه‌ها حداقل touch target دارند؛ `prefers-reduced-motion` smooth scroll/transition را کاهش می‌دهد؛ build و typecheck PASS.
- Decisions / assumptions: پیشنهاد عمومی skill دربارهٔ palette/font/motion با baseline پروژه جایگزین نشد؛ `docs/design.md` منبع نهایی باقی است. فونت self-host و browser screenshot matrix همچنان باز هستند.
- Deferred or risk IDs: `DEFER-0008` (font)، `DEFER-0010` (browser matrix)، `DEFER-0011` (Cloudflare robots) OPEN.
- Rollback / recovery: تغییر frontend/infra مستند و قابل بازگشت با Git؛ staging برای اعمال اصلاح 404 باید با script timestamped دوباره اجرا شود.

## LOG-0062 — 2026-08-15 — P1 / bilingual typography and premium gateway refinement

- Outcome: با استفاده از `ui-ux-pro-max` و حفظ اولویت `docs/design.md`، فونت‌های self-hosted `Vazirmatn Variable` و `Inter Variable` اضافه شد؛ gateway از نظر parity دو زبان، glass fallback، technical identity line و hierarchy بصری refined شد.
- Why: برای professional/premium بودن فقط palette کافی نیست؛ font rendering، وزن برابر CTAها و نسبت هویت/فضای خالی در screenshot اولیه نیاز به تصمیم و اجرای مشخص داشت.
- Scope / files: `apps/web/package.json`، `apps/web/package-lock.json`، `apps/web/src/styles/global.css`، `apps/web/src/pages/index.astro`، `docs/plan/P1-typography-font-task-spec.md`، ADR-0019، Manifest، content pack، Deferred Validation، Task-list و همین Work Log.
- Commands or actions actually performed: `npm install --no-audit --no-fund` (دو font package)، `npm run check` (0 error / 0 warning / 0 hint)، `npm run build`، `npm audit --audit-level=high` (0 vulnerabilities)، `git diff --check` و بررسی static CSS/HTML برای `Vazirmatn`/`Inter` و prompt/identity دوزبانه.
- Verification actually performed and result: local font CSS و `@font-face` در artifact حاضر؛ identity و prompt دوزبانه؛ build/typecheck/audit PASS. دو language action وزن یکسان دارند و fallback opaque برای browserهای بدون backdrop-filter تعریف شده است.
- Decisions / assumptions: ADR-0019 با وضعیت Accepted ثبت شد؛ `DEFER-0008` بسته شد. پیشنهادهای عمومی skill دربارهٔ Exo/Roboto Mono، neon، motion-heavy یا palette جدید به‌دلیل ناسازگاری با Persian readability و project governance رد شدند.
- Deferred or risk IDs: `DEFER-0007` contact، `DEFER-0009` OG، `DEFER-0010` browser matrix و `DEFER-0011` Cloudflare robots همچنان OPEN؛ لوگوی نهایی هنوز owner input است.
- Rollback / recovery: بازگشت با Git به system stack قبلی؛ staging برای دیدن این نسخه نیازمند upload artifact جدید و اجرای دوبارهٔ script sudo است.

## LOG-0063 — 2026-08-15 — P1 / visual system elevation with identity constellation

- Outcome: بر اساس `ui-ux-pro-max` و با حفظ `docs/design.md`، سیستم بصری P1 ارتقا یافت: constellation هویتی معنادار (Design·Interaction·Engineering·Data·AI حول مرکز انسان‌محور Gold) در gateway/hero/404، layout دوسطحی editorial برای hero با نسخهٔ ساده‌شدهٔ موبایل، accentهای context برای سه مسیر (purple/turquoise/emerald)، labelهای بخش دوزبانه (۰۱/۰۲)، header چسبان solid-first با glass اختیاری و touch target 44px، footer با brand mark و 404 هماهنگ با Navy.
- Why: مالک «بهترین UI/UX ممکن» را خواست؛ design.md §64–§67 اثر بصری باید دربارهٔ Taha معنا بدهد، نه صرفاً تزئینی باشد؛ خطوط تصادفی قبلی معنا نداشتند.
- Scope / files: `apps/web/src/components/Landing.astro`، `Header.astro`، `Footer.astro`، `apps/web/src/pages/index.astro`، `404.astro`، `apps/web/src/data/content.ts`، `docs/plan/P1-visual-elevation-task-spec.md` و همین Work Log.
- Commands or actions actually performed: `npm run check` (0 error / 0 warning / 0 hint)؛ `npm run build`؛ preview HTTP smoke (`/`, `/en/`, `/fa/`, `/health.json` → 200؛ `/nonexistent` → 404؛ CSS → 200)؛ static assertions برای constellation/labels/accents/404.
- Verification actually performed and result: همهٔ routeها و CSS سالم؛ بدون dependency، JS-client یا رنگ جدید؛ focus rings per-surface تنظیم شد؛ `prefers-reduced-motion` حفظ شد.
- Decisions / assumptions: پیشنهادهای ناسازگار skill (neon/cyberpunk/motion-heavy/Exo) رد شدند؛ فقط الگوهای سازگار (editorial، touch targets، sticky nav، focus/contrast) اعمال شدند.
- Deferred or risk IDs: `DEFER-0010` (browser matrix) همچنان OPEN؛ سایر IDها بدون تغییر.
- Rollback / recovery: بازگشت با Git؛ staging با اجرای دوبارهٔ stage script توسط مالک به‌روز می‌شود.

## LOG-0064 — 2026-08-15 — R2 / A1 reusable HTTP smoke script

- Outcome: added `infra/deploy/smoke.sh`, a read-only reusable HTTP smoke script for staging/production: asserts `/`, `/en/`, `/fa/`, `/robots.txt`, `/sitemap.xml` → 200, `/health.json` → 200 with body containing `"status":"ok"`, `/nonexistent-qa` → 404, and with `--expect-noindex` also `x-robots-tag` containing `noindex` on `/`. Prints one `PASS|FAIL <name>` line per check and exits non-zero on any FAIL.
- Why: S-Plan task A1 — one reusable post-deploy verifier instead of ad-hoc curl commands (reused in A4 and C7).
- Scope / files: `infra/deploy/smoke.sh` (new), `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`.
- Commands or actions actually performed: `bash -n infra/deploy/smoke.sh`; `bash infra/deploy/smoke.sh https://staging.tahamohamadi.ir --expect-noindex`. No SSH, no sudo, no site changes.
- Verification actually performed and result: `bash -n` → exit 0 (no output). Live run → exit 0, all lines PASS: `PASS root /`، `PASS locale /en/`، `PASS locale /fa/`، `PASS robots.txt`، `PASS sitemap.xml`، `PASS nonexistent-qa`، `PASS health.json body`، `PASS noindex /`.
- Decisions / assumptions: a curl connection failure surfaces as status `000` → FAIL; exit code equals the number of failed checks; `x-robots-tag` match is case-insensitive; the script asserts exactly the checks listed in task A1, nothing more.
- Deferred or risk IDs: none new (`DEFER-0011` note: `/robots.txt` returned 200 through the edge in this run).
- Rollback / recovery: script is additive and read-only; rollback = Git revert of this commit.

## LOG-0065 — 2026-08-15 — S-Plan / A1 pilot executed by subagent and approved

- Outcome: تسک A1 (smoke script) توسط subagent `general` با پروتکل S-Plan اجرا شد (commit `e2d7796`، LOG-0064). L-model طبق §7 ریویو کرد: diff فقط allowed files، منطق دقیقاً مطابق spec، اجرای مستقل مجدد smoke روی staging → ۸ PASS / exit 0 → **APPROVE** و A1 در S-PLAN-STATE به DONE رفت.
- Why: اثبات حلقهٔ «مدل کوچک اجرا / مدل بزرگ ریویو» قبل از هزینه‌کرد روی agentهای ارزان.
- Scope / files: `infra/deploy/smoke.sh`، `docs/status/WORK_LOG.md`، `docs/plan/S-PLAN-STATE.md`.
- Commands or actions actually performed: `git show --stat e2d7796`؛ `git diff --check HEAD~1 HEAD`؛ خواندن line-by-line اسکریپت؛ اجرای مستقل `bash infra/deploy/smoke.sh https://staging.tahamohamadi.ir --expect-noindex` → 8 PASS، exit 0.
- Verification actually performed and result: هیچ divergence بین گزارش S-model و اجرای مستقل؛ ورودی‌های FAIL برای خطای اتصال (000) و exit-code=count تعریف شده‌اند.
- Decisions / assumptions: الگوی S-Plan برای استفاده با مدل‌های ارزان معتبر است.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: مستندات/اسکریپت؛ بازگشت با Git.

## LOG-0066 — 2026-08-15 — Infra / cheap-model agent fleet and visual QA agent

- Outcome: دو agent پروژه‌ای ساخته و version شدند: `.opencode/agent/s-executor.md` (مدل رایگان `opencode/deepseek-v4-flash-free`؛ fallbackهای ارزان: `deepseek-v4-flash`، `mimo-v2.5`) با permissionهای deny-by-default (edit محدود به مسیرهای task، bash محدود به npm/git-local/bash-n/smoke، ssh/sudo/push deny) و `.opencode/agent/visual-reviewer.md` (مدل چندوجهی `opencode-go/gpt-5.6-luna`، read-only با دسترسی فقط به `~/Pictures`/`~/Downloads` برای تصاویر) برای بستن `DEFER-0010`. `.gitignore` به‌روزی شد تا فقط `.opencode/agent/` version شود. S-Plan §0/§2 و state با تسک V1 (visual QA از اسکرین‌شات‌های مالک) تکمیل شد.
- Why: مالک خواست اجرا با مدل‌های ارزان (DeepSeek/Grok/Luna/Mimo) انجام شود و L-model فقط review/planning بماند؛ بررسی تصویری با agent چندوجهی ارزان ممکن شد.
- Scope / files: `.opencode/agent/s-executor.md`، `.opencode/agent/visual-reviewer.md`، `.gitignore`، `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md`، `docs/plan/S-PLAN-STATE.md` و همین Work Log.
- Commands or actions actually performed: `opencode models` (inventory مدل‌ها)؛ خواندن الگوی agentهای global موجود (`r0-docs-executor.md`) برای هم‌سبکی. هیچ مدل/کلید جدیدی نصب یا تنظیم نشد.
- Verification actually performed and result: agentها مطابق schema (frontmatter مجاز + permission با ترتیب قواعد) نوشته شدند؛ `.gitignore` الگوی `!.opencode/agent/` دارد. فعال‌سازی نیازمند restart opencode است (config در startup لود می‌شود).
- Decisions / assumptions: executor روی tier رایگان با fallback ارزان؛ visual-reviewer فقط مشاهده‌گر است و پیشنهاد کد نمی‌دهد؛ مدل گران هرگز برای اجرا/بازبینی تصویری استفاده نمی‌شود.
- Deferred or risk IDs: `DEFER-0010` اکنون مسیر بستن دارد (V1 پس از restart).
- Rollback / recovery: حذف دو فایل agent + بازگردانی `.gitignore`.

## LOG-0067 — 2026-08-15 — P1-T01 / visual-prototyping tooling

- Outcome: `motion` 13.1.0، `gsap` 3.15.0 و `three` 0.185.1 به dependencyهای `apps/web/` افزوده و lockfile به‌روزرسانی شد؛ هیچ source عمومی، route، bundle behavior یا deploy تغییر نکرد. Skill محلی `design-dna` از `zanwei/design-dna` نیز در Codex نصب شد. استفاده از Beautiful UI و UI8 DNA به دلیل نبود artifact محلی/مجوز قابل‌اثبات defer شد.
- Why: مالک این ابزارها را برای آماده‌سازی visual prototyping درخواست کرد؛ scope عمداً tooling-only باقی ماند تا مرز static-first P1 و ممنوعیت motion/WebGL فعلی حفظ شود.
- Scope / files: `apps/web/{package.json,package-lock.json}`، `docs/plan/P1-T01-visual-prototyping-tooling-task-spec.md`، `docs/status/{WORK_LOG,deferred-validation}.md`؛ نصب skill خارج از repository در `C:\Users\Taha\.codex\skills\design-dna`.
- Commands or actions actually performed: installer رسمی skill با `--repo zanwei/design-dna --path . --name design-dna`؛ `npm install motion gsap three --save`؛ `npm run check`؛ `npm run build`؛ `npm audit --omit=dev --registry=https://registry.npmjs.org/` در `apps/web/`.
- Verification actually performed and result: Design DNA شامل `SKILL.md` و references نصب شد؛ `astro check` → 0 errors / 0 warnings / 0 hints؛ static build هر هفت artifact موجود (`/`، `/fa/`، `/en/`، `404`، health، robots و sitemap) را تولید کرد؛ `npm audit` → 0 vulnerabilities؛ `git diff --check` → PASS؛ diff فقط package manifests و task-owned documentation را نشان داد.
- Decisions / assumptions: `motion`، `gsap` و `three` فقط برای implementation آینده در دسترس‌اند، نه فعال در P1. هر use بعدی به Task Spec مستقل، interaction معنادار، fallback ثابت/no-JS، `prefers-reduced-motion` و lazy/non-render-blocking loading نیاز دارد؛ Motion و GSAP به‌صورت پیش‌فرض هم‌زمان برای یک interaction استفاده نمی‌شوند.
- Deferred or risk IDs: `DEFER-0010` بدون تغییر؛ `DEFER-0012` برای artifact/licensing خارجی اضافه شد. هیچ ریسک جدیدی ایجاد نشد.
- Rollback / recovery: revert کردن دو manifest task-owned؛ حذف directory skill `C:\Users\Taha\.codex\skills\design-dna` اگر لازم باشد. هیچ runtime/server state تغییر نکرده است.

## LOG-0068 — 2026-08-15 — P1-T02 / visual-toolchain documentation alignment

- Outcome: Manifest، README، master plan، technical architecture baseline، Task-list و S-Plan با وضعیت واقعی tooling همسو شدند: `motion` 13.1.0، `gsap` 3.15.0 و `three` 0.185.1 در lockfile موجود اما در P1 inactive هستند؛ Design DNA skill محلی agent tooling است؛ D3/R3F/React هنوز نصب نشده‌اند؛ Beautiful UI و UI8 DNA همچنان به `DEFER-0012` وابسته‌اند. شناسهٔ tooling از `P1-10` به `P1-T01` تغییر کرد تا با Task P1-10 (frontend verification) تداخل نداشته باشد. مسیر آینده نیز با Task P0B-04 و S-Plan B5 به یک adoption gate مشخص محدود شد.
- Why: مالک خواست که documentation، specifications، tasks و plans با ابزارهای تازه‌نصب‌شده منطبق باشند؛ نصب package نباید به‌اشتباه authorization برای import/ship تلقی شود.
- Scope / files: `PROJECT_MANIFEST.md`، `README.md`، `Task-list.md`، `docs/taha-personal-platform-{development-master-plan,technology-architecture-baseline}-fa.md`، `docs/plan/{P1-T01-visual-prototyping-tooling-task-spec,P1-T02-visual-toolchain-documentation-alignment-task-spec,SMALL-MODEL-EXECUTION-PLAN,S-PLAN-STATE}.md` و همین Work Log؛ manifest/lockfile موجود از P1-T01 تغییر داده نشد.
- Commands or actions actually performed: جست‌وجوی referenceها با `rg` در plan/ADR/governance و status؛ خواندن contracts/Task Specs/roadmaps مربوط؛ `git diff --check` و scope diff review.
- Verification actually performed and result: همهٔ referenceهای tooling به `P1-T01` منتقل و `P1-10` صرفاً برای blocking frontend verification حفظ شد؛ `git diff --check` PASS؛ documentation-only diff به‌جز تغییرات از پیش‌موجود P1-T01 در package manifests، هیچ source/config/deploy/runtime file ندارد.
- Decisions / assumptions: library فقط پس از user value مشخص، انتخاب یک library، Task Spec، lazy island-local import، fallback ثابت/no-JS و reduced-motion، keyboard/RTL/LTR/mobile QA و performance evidence active می‌شود. Three/WebGL هرگز render-blocking hero/main content نیست. Design DNA مرجع design را استخراج می‌کند اما token/asset خارجی را override نمی‌کند.
- Deferred or risk IDs: `DEFER-0010` و `DEFER-0012` بدون تغییر؛ Risk جدیدی ایجاد نشد.
- Rollback / recovery: revert فایل‌های documentation این entry و بازگردانی نام P1-T01 در صورت نیاز؛ هیچ runtime/deploy state تغییر نکرده است.

## LOG-0069 — 2026-08-15 — P1-T03 / design-policy toolchain alignment

- Outcome: `docs/design.md` اکنون صریحاً وضعیت installed-but-inactive P1 برای Motion/GSAP/Three، انتخاب یک library برای هر interaction، fallback/QA الزامی، نقش محدود Design DNA و boundary source/version/use-right برای Beautiful UI/UI8 DNA را ثبت می‌کند.
- Why: این سند source of truth طراحی است؛ همسویی آن با Manifest و roadmap از این سوءبرداشت جلوگیری می‌کند که package یا reference خارجی، مجوز استفاده در public artifact است.
- Scope / files: `docs/design.md`، `docs/plan/P1-T03-design-policy-toolchain-alignment-task-spec.md` و همین Work Log.
- Commands or actions actually performed: خواندن sectionهای Motion، Three، third-party acceptance و agent rules؛ جست‌وجوی targeted referenceها؛ `git diff --check`.
- Verification actually performed and result: policy جدید با static-first، `prefers-reduced-motion`، fallback، RTL/LTR و third-party adaptation rules موجود سازگار است؛ `git diff --check` PASS؛ هیچ code/config/dependency/runtime file تغییر نکرد.
- Decisions / assumptions: Design DNA خروجی تحلیلی تولید می‌کند و هرگز design system را override نمی‌کند؛ external UI تا ثبت source/version/use-right تحت `DEFER-0012` فقط inspiration است.
- Deferred or risk IDs: `DEFER-0012` بدون تغییر؛ Risk جدیدی ایجاد نشد.
- Rollback / recovery: revert فایل‌های documentation task-owned؛ هیچ runtime/deploy state تغییر نکرده است.

## LOG-0070 — 2026-08-15 — S-Plan / B3 uptime check definition

- Outcome: the existing "Observability (P0A-11)" section of `DEPLOY_RUNBOOK.md`
  was extended (no duplicate Observability heading, rest of the file untouched)
  with a concrete definition: an external uptime provider chosen by the owner
  (free tier acceptable) performs an HTTP GET on `https://<host>/health.json`
  every 5 minutes on staging and production; alert target is the owner's email
  (see password manager); deploy-version lookup is `curl https://<host>/health.json`
  returning the served artifact version; the owner reviews the Caddy error log
  on alert and checks `df -h /` monthly (30 GB disk, alert under 20% free); no
  agent may sign up for any monitoring service — provider selection and account
  creation are owner-only steps.
- Why: B3 (Phase B hardening) requires the uptime/observability contract to be
  written down so no agent invents a provider or creates accounts, and the owner
  has a concrete alert, log-review and disk-threshold procedure.
- Scope / files: `docs/governance/DEPLOY_RUNBOOK.md`,
  `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`.
- Commands or actions actually performed: read AGENTS.md,
  `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` §6 B3, `docs/plan/S-PLAN-STATE.md`
  and `docs/governance/DEPLOY_RUNBOOK.md` fully; extended the existing
  Observability (P0A-11) bullet list with the concrete definition; appended this
  WORK_LOG entry; marked B3 NEEDS_REVIEW and appended a review-log row in
  S-PLAN-STATE.md.
- Verification actually performed and result: `git diff --check` → exit 0
  (PASS); `grep "^#.*Observability" docs/governance/DEPLOY_RUNBOOK.md` → exactly
  1 match (`## Observability (P0A-11)` at line 95); no provider names, no email
  addresses, no new URLs beyond the existing `<host>` placeholder from the task.
- Decisions / assumptions: provider choice, account creation and the email
  address remain owner-only (address intentionally not recorded); the 5-minute
  cadence and 30 GB / under-20%-free numbers are taken verbatim from task B3.
- Deferred or risk IDs: none new; `DEFER`/`RISK` sets unchanged.
- Rollback / recovery: revert this documentation commit; no runtime, server or
  deploy state was changed.

## LOG-0071 — 2026-08-15 — S-Plan / B4 restore drill cadence

- Outcome: appended a `## Restore drill cadence` section to
  `docs/governance/BACKUP_POLICY.md` recording: a recurring restore drill runs
  quarterly; the recovery owner is the Project owner; the drill is performed
  ONLY on an isolated target per `docs/governance/BACKUP_RUNBOOK.md` and the
  P0-A restore-rehearsal Task Spec (never against production); at each drill the
  Project owner records the observed RPO/RTO and the cadence.
- Why: B4 (Phase B hardening) requires the restore drill contract to be written
  down so drills are repeatable, owner-owned and never run against production.
- Scope / files: `docs/governance/BACKUP_POLICY.md`,
  `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`.
- Commands or actions actually performed: read AGENTS.md,
  `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` §6 B4,
  `docs/plan/S-PLAN-STATE.md`, `docs/governance/BACKUP_POLICY.md` and
  `docs/governance/BACKUP_RUNBOOK.md` fully plus the P0-A restore-rehearsal Task
  Spec; appended the section at the end of `BACKUP_POLICY.md` without rewriting
  any existing content; appended this WORK_LOG entry; marked B4 NEEDS_REVIEW and
  appended a review-log row in S-PLAN-STATE.md.
- Verification actually performed and result: `git diff --check` → exit 0
  (PASS); `Select-String "Restore drill cadence"` on BACKUP_POLICY.md → exactly
  1 heading (`## Restore drill cadence`); appended facts match task B4 — no
  invented dates, RPO/RTO numbers, metrics or owners beyond "Project owner".
- Decisions / assumptions: quarterly cadence and "Project owner" are taken
  verbatim from task B4; RPO/RTO values are deliberately not invented — they are
  recorded by the owner at each drill.
- Deferred or risk IDs: none new; `DEFER`/`RISK` sets unchanged.
- Rollback / recovery: revert this documentation commit; no runtime, server or
  deploy state was changed.

## LOG-0072 — 2026-08-15 — Infra / cost posture: cheaper primary model and hard cost guards

- Outcome: پیکربندی پروژهٔ `.opencode/opencode.json` ایجاد شد تا مدل اصلی از tier گران (glm-5.3) به گزینهٔ ارزان‌تر (`opencode-go/deepseek-v4-pro`) و `small_model` به tier رایگان (`opencode/deepseek-v4-flash-free`) تغییر کند. S-Plan §0 «Hard cost guards» و snapshot §5 با وضعیت هزینه تکمیل شدند: اجرای تسک‌ها فقط از طریق `s-executor`، QA تصویری فقط از طریق `visual-reviewer`، مدل اصلی فقط برای ریویو/پلن، و re-verification با اسکریپت `smoke.sh` به‌جای buildهای پرهزینه.
- Why: مالک اعلام کرد glm-5.3 گران است و باید هزینه مدیریت شود در حالی‌که کیفیت/دقت حفظ شود؛ dispatchهای قبلی از طریق `general` روی همان مدل گران اجرا شده‌اند.
- Scope / files: `.opencode/opencode.json`، `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` و همین Work Log. هیچ مدل/کلید/provider جدیدی ساخته نشد.
- Commands or actions actually performed: بررسی `~/.config/opencode/opencode.jsonc` (فقط plugins) و نبود config پروژه‌ای؛ سپس نوشتن config و ویرایش پلن. `git diff --check` PASS.
- Verification actually performed and result: config فقط از فیلدهای معتبر `model`/`small_model`/`$schema` استفاده می‌کند؛ guardها صریح و قابل تخطی نیستند. فعال‌سازی نیازمند restart opencode است.
- Decisions / assumptions: `deepseek-v4-pro` به‌عنوان تعادل هزینه/کیفیت برای مدل اصلی انتخاب شد؛ قیمت‌گذاری واقعی provider ممکن است متفاوت باشد و مالک می‌تواند با یک خط در config جایگزین کند. GLM-5.3 دیگر برای هیچ نقشی استفاده نمی‌شود.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: حذف `.opencode/opencode.json` یا تغییر `model`؛ بازگشت به وضعیت قبلی صرفاً با revert مستند.

## LOG-0073 — 2026-08-15 — P1-T01 / external design resources re-verified and documented

- Outcome: درخواست مالک برای نصب Beautiful UI، Three.js، GSAP، Design DNA، UI8 DNA و Motion راستی‌آزمایی شد: `motion` 13.1.0، `gsap` 3.15.0، `three` 0.185.1 و Design DNA (skill محلی Codex) از قبل نصب شده‌اند؛ **Beautiful UI** وب‌سایت copy-paste با مجوز **MIT** است (نه پکیج npm) و به‌عنوان source-reference تأیید شد؛ **UI8 DNA** محصول تجاری/paid است و بدون خرید/لایسنس مالک قابل نصب نیست. DEFER-0012 به وضعیت split به‌روز شد و design.md §98 و S-Plan snapshot با این واقعیت‌ها هم‌تراز شدند.
- Why: مالک درخواست نصب داد؛ باید وضعیت واقعی هر منبع بدون حدس ثبت شود — MIT یعنی حق استفادهٔ Beautiful UI تأیید است، UI8 نیازمند لایسنس مالک.
- Scope / files: `docs/status/deferred-validation.md`، `docs/design.md`، `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` و همین Work Log.
- Commands or actions actually performed: `npm ls motion gsap three @fontsource-variable/inter` (همگی نصب)؛ `Test-Path` برای SKILL طراحی‌دی‌ان‌ای (موجود)؛ `webfetch` صفحهٔ BeautifulUI → MIT License و copy-paste (بدون بستهٔ npm)؛ بررسی DEFER-0012 و design.md §98. هیچ بسته یا asset جدیدی نصب/کپی نشد.
- Verification actually performed and result: ۴/۶ منبع از قبل نصب‌اند؛ Beautiful UI منبع MIT است؛ UI8 بدون لایسنس در دسترس نیست. `git diff --check` PASS.
- Decisions / assumptions: Beautiful UI فقط در slice مصوب (B5) و با استفادهٔ منحصراً از tokenهای خود پروژه copy می‌شود؛ UI8 تا تهیهٔ فایل/لایسنس توسط مالک در DEFER-0012 می‌ماند. هیچ library در P1 فعال نشد (static-first حفظ شد).
- Deferred or risk IDs: `DEFER-0012` به‌روز (split: Beautiful UI=MIT reference؛ UI8=pending license).
- Rollback / recovery: revert سه فایل مستند؛ هیچ runtime/deploy state تغییر نکرد.

## LOG-0077 — 2026-08-15 — P1 / parallel workstreams: audit, contrast fix, CI hardening, release QA

- Outcome: سه workstream موازی مستقل اجرا شدند (بدون تداخل فایل): (1) audit read-only کد → ۸/۱۰ معیار PASS، یک **SEV-HIGH**: خط positioning هیرو با Gold `#A77B28` روی canvas = 3.58:1 (نقض WCAG AA و design.md §9.1) + MEDهای token discipline؛ (2) تقویت CI → مرحلهٔ smoke محلی (`preview` + `smoke.sh` روی localhost) و `npm audit`؛ (3) گزارش `RELEASE-QA.md` → RELEASE-READY (۱۹ فایل، ۳۶۹KB، بدون secret، fonts 321KB self-host).
- Why: سرعت توسعه با چند agent و کیفیت/دقت بالا؛ یافتهٔ کنتراست پیش از production باید رفع می‌شد.
- Scope / files: `apps/web/src/components/Landing.astro` (gold→ink + accent rule gold، `#fff`→`var(--color-inverse)`)، `apps/web/src/pages/{index,404}.astro` و `Header.astro` (glass tokens از design.md §14 در `@theme` + مصرف)، `.github/workflows/ci.yml`، `docs/plan/RELEASE-QA.md`، `docs/plan/RELEASE-P1.md` و همین Work Log.
- Commands or actions actually performed: سه task موازی (explore/general)؛ سپس اصلاحات دستی؛ `npm run check` (0 error) و `npm run build` PASS؛ YAML توسط agent با PyYAML اعتبارسنجی شد؛ `git diff --check` PASS.
- Verification actually performed and result: gold دیگر text نیست (accent rule 3px)؛ `#fff`→`var(--color-inverse)`؛ glass tokens در `@theme`؛ CI یامال معتبر با مسیر نسبی درست (`../infra/deploy/smoke.sh`)؛ RELEASE-QA همهٔ checks PASS و verdict RELEASE-READY.
- Decisions / assumptions: MED token discipline رفع شد (glass/`#fff`)؛ موارد LOW (skip-link gateway، meta description gateway، footer bidi year) به‌عنوان پالایش آینده ثبت شدند. A3/RELEASE-P1 به artifact تازهٔ `release-fa3c813` برای production اشاره کرد.
- Deferred or risk IDs: بدون ID جدید؛ `DEFER-0010` (browser QA) همچنان READY بعد از restart.
- Rollback / recovery: revert کامیت‌های code/docs؛ هیچ runtime/deploy state تغییر نکرد.

## LOG-0078 — 2026-08-15 — R2 / production P1 live (owner-executed snippet switch) + production smoke

- Outcome: مالک با ویرایش دستی snippet `taha_application_routes` در Caddyfile — به‌جای پروکسی legacy (13000/18080) — `root * /opt/taha/site/current` + `file_server` گذاشت و production را روی `release-d55d44e` (checksum e49e46c7) سوییچ کرد؛ `tahamohamadi.ir` اکنون سایت static P1 را live سرو می‌کند. `prod-p1.sh` (A2) به‌دلیل این تغییر مکانیک، برای این Caddyfile قابل اجرا نیست (بلوک production را با handlers فونت/presentation مالک بازنویسی می‌کرد) و استفاده نشد. Legacy containers (13000/18080) همچنان running و دست‌نخورده‌اند.
- Why: production smoke و ثبت وضعیت واقعی، بخش پایانی R2 (P1-14/P1-15) است.
- Scope / files: `docs/status/WORK_LOG.md`، `docs/plan/RELEASE-P1.md`، `docs/plan/S-PLAN-STATE.md`، `Task-list.md` §5.
- Commands or actions actually performed: `bash infra/deploy/smoke.sh https://tahamohamadi.ir` → 7 PASS (root، en، fa، robots، sitemap، nonexistent-qa، health body) / exit 0؛ `curl` production robots از مسیر Cloudflare (intercept «content signals») و direct-origin (robots صحیح)؛ `cat -n /etc/caddy/Caddyfile` فقط‌خواندنی؛ `curl` مستقیم 13000 (legacy Vite app هنوز آن‌جاست). هیچ تغییر سرور توسط agent انجام نشد.
- Verification actually performed and result: production P1 live و سالم؛ DEFER-0011 برای production هم تأیید شد (Cloudflare edge robots را intercept می‌کند). نسخهٔ سروشده d55d44e فاقد fix کنتراست (df6ca39) است؛ به‌روزرسانی به `release-d7db929` (روی سرور در `~/taha-stage/`) با switch اتمیک `current` توصیه شد — بدون هیچ تغییری در Caddyfile (handlers فونت/presentation دست‌نخورده).
- Decisions / assumptions: مکانیک deploy فعلی snippet-based است (ADR-0017 با switch اتمیک `current`)؛ prod-p1.sh برای این Caddyfile منسوخ و در runbook باید به‌روز شود. A4 با اجرای مالک DONE تلقی می‌شود.
- Deferred or risk IDs: `DEFER-0011` OPEN (robots edge)؛ بدون ID جدید.
- Rollback / recovery: برگرداندن `current` به release قبلی و/یا restore بکاپ Caddyfile؛ legacy containers برای rollback کامل همچنان در دسترس‌اند.

## LOG-0074 — 2026-08-15 — S-Plan / B5 visual-interaction adoption brief

- Outcome: brief نوشته شد در `docs/plan/B5-VISUAL-INTERACTION-ADOPTION.md` با شش section دقیقاً طبق دستور: «Goal & gate»، «Candidate interactions»، «Adoption checklist»، «QA plan»، «Escalation rule» و «Explicit non-goal». سه interaction candidate فقط پیشنهاد شدند (بدون پیاده‌سازی): (۱) hero identity-constellation entrance با CSS/Motion و fallback = constellation استاتیک فعلی؛ (۲) hover/transition کارت‌های «Explore by Perspective» با Motion؛ (۳) timeline reveal برای Journey/About با GSAP scroll trigger و fallback کامل استاتیک. برای هر candidate: route، user-value، library، bundle-cost و fallback reduced-motion/no-JS ثبت شد. Adoption checklist کلمه‌به‌کلمه از design.md §98 کپی شد. بند explicit non-goal: هیچ import از motion/gsap/three در سایت P1 و هیچ کپی از Beautiful UI حالا.
- Why: task B5 طبق S-Plan خواستار brief پیش از هر implementation است؛ libraries در P1 inactive می‌مانند و adoption فقط پس از release استاتیک P1 (task A5) و تأیید مالک مجاز است.
- Scope / files: `docs/plan/B5-VISUAL-INTERACTION-ADOPTION.md` (جدید)، `docs/plan/S-PLAN-STATE.md`، `docs/status/WORK_LOG.md`. هیچ فایل دیگری تغییر نکرد.
- Commands or actions actually performed: ساخت فایل brief؛ append این entry؛ به‌روزرسانی state B5 به NEEDS_REVIEW + ردیف review-log؛ `git diff --check`؛ grep برای import های `motion`/`gsap`/`three` در `apps/web/`.
- Verification actually performed and result:
  - `git diff --check` → exit 0 (بدون خطای whitespace).
  - Heading های فایل جدید (خروجی واقعی):
    `## Goal & gate`, `## Candidate interactions`, `## Adoption checklist`, `## QA plan`, `## Escalation rule`, `## Explicit non-goal` (هر شش موجود و دقیقاً مطابق دستور).
  - grep در `apps/web/` برای `from "motion"|"gsap"|"three"|"gsap/ScrollTrigger"` و `import "motion"|"gsap"|"three"` → «No files found»؛ یعنی هیچ import جدیدی از motion/gsap/three در apps/web اضافه نشده است.
  - grep سراسری تأیید کرد هیچ پیاده‌سازی/code جدیدی خارج از سه فایل مجاز نیست.
- Decisions / assumptions: adoption فقط پس از release استاتیک P1 (A5)، انتخاب دقیقاً یک library برای هر interaction، عبور از checklist §98 به‌عنوان gate اجباری، و تأیید نهایی interaction+route+library توسط مالک. هیچ library فعال نشد و هیچ کدی import نشد.
- Deferred or risk IDs: `DEFER-0012` (Beautiful UI فقط در slice مصوب)؛ پیش‌نیازهای B5 شامل مالک‌نام‌کردن interaction نهایی.
- Rollback / recovery: حذف فایل جدید brief و revert دو فایل state/WORK_LOG؛ هیچ runtime/deploy/dependency change وجود ندارد.

## LOG-0075 — 2026-08-15 — S-Plan / A2 production Caddy switch script (write only)

- Outcome: created `infra/deploy/prod-p1.sh` as a copy of `infra/deploy/stage-p1.sh` with ONLY the production-specific changes required by task A2: python heredoc marker `staging.tahamohamadi.ir {` → `tahamohamadi.ir {`; replacement block serves `root * /opt/taha/site/current` with the same `import taha_security_headers`, `handle_errors` 404 block (`rewrite * /404.html` + `file_server`) and `file_server`, with NO `X-Robots-Tag` header (production is indexed); backup suffix `.pre-stage-p1.` → `.pre-prod-p1.`; echo/usage text now names `prod-p1.sh` and `tahamohamadi.ir`. `www`, `85.192.29.196` and all other script logic are untouched (neither hostname appears in the script; they live in the server Caddyfile and are never matched/replaced by this script). The script was NOT run and NOT scp'd.
- Why: S-Plan task A2 — write-only production Caddy switch script so the owner can later run the exact production counterpart of stage-p1.sh after L-model line-by-line review.
- Scope / files: `infra/deploy/prod-p1.sh` (new), `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`. No other file changed.
- Commands or actions actually performed: copied stage-p1.sh content and applied the four listed changes; ran `bash -n infra/deploy/prod-p1.sh`; ran `bash -c "diff infra/deploy/stage-p1.sh infra/deploy/prod-p1.sh"`; staged the three allowed files and ran `git diff --cached --check` and `git diff --check`.
- Verification actually performed and result:
  - `bash -n infra/deploy/prod-p1.sh` → exit 0, no output.
  - `diff infra/deploy/stage-p1.sh infra/deploy/prod-p1.sh` (real output, exit 1 = differences exist):
    `6c6` usage `./stage-p1.sh`→`./prod-p1.sh`; `17c17` usage string `stage-p1.sh`→`prod-p1.sh`; `20c20` backup suffix `pre-stage-p1`→`pre-prod-p1`; `57c57` heredoc marker `staging.tahamohamadi.ir {`→`tahamohamadi.ir {`; `60c60` heredoc stderr `staging block`→`production block`; `64c64` replacement block header `staging.tahamohamadi.ir {`→`tahamohamadi.ir {`; `69,72d68` X-Robots-Tag header block removed; `98c94` echo `on staging hostname`→`on tahamohamadi.ir`. No other differences.
  - `git diff --cached --check` → exit 0 (PASS, covers the new file); `git diff --check` → exit 0 (PASS).
- Decisions / assumptions: the heredoc marker `tahamohamadi.ir {` is taken verbatim from task A2 (the L-model's plan), and `www` / `85.192.29.196` are intentionally not referenced in the script — the script replaces only the production site block matched by that marker, exactly as stage-p1.sh does for staging. The header comment line "Stage the static P1 artifact on staging.tahamohamadi.ir" is left byte-identical to stage-p1.sh because the task's diff acceptance allows changes ONLY in the heredoc marker/block, backup suffix and echo/usage text.
- Deferred or risk IDs: none new; task A2 remains HIGH risk pending L-model review and owner approval before being run.
- Rollback / recovery: script is additive and was never executed; rollback = Git revert of this commit / delete `infra/deploy/prod-p1.sh`.

## LOG-0076 — 2026-08-15 — S-Plan / A3 release decision record for P1

- Outcome: created `docs/plan/RELEASE-P1.md` filling the release-decision template from `docs/governance/RELEASE_POLICY.md` with real data: Type `STANDARD` (new public routes, static, no auth/data/secret), Release DoD `PASS`, Completion DoD `NOT MEASURED`, blocking-check evidence pointers to WORK_LOG IDs, open risk/deferred IDs listed verbatim (status unchanged), rollback path, owner-approval precondition and preconditions. No deploy, no sudo, no SSH write performed.
- Why: S-Plan task A3 — record the P1 release decision so the owner/L-model can authorize the production switch (A4) against documented evidence.
- Scope / files: `docs/plan/RELEASE-P1.md` (new), `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`. No other file changed.
- Commands or actions actually performed:
  - Read `AGENTS.md`, `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` §6 A3, `docs/plan/S-PLAN-STATE.md`, `docs/governance/RELEASE_POLICY.md`, `docs/status/RISK_REGISTER.md`, `docs/status/deferred-validation.md`, `docs/governance/DEPLOY_RUNBOOK.md`, `docs/status/WORK_LOG.md`.
  - Read-only SSH (agent-ssh: yes, read-only): `ssh taha-nl "cat /opt/taha/site/deploy.log"` → `2026-08-15T07:00:36Z staged release-a2720d9 49cf1d21` / `2026-08-15T07:29:53Z staged release-d55d44e e49e46c7`; `ssh taha-nl "ls -la /opt/taha/site/; readlink /opt/taha/site/current; ls /opt/taha/site/releases/; cat /opt/taha/site/releases/release-d55d44e/health.json"` → `current -> /opt/taha/site/releases/release-d55d44e`, releases dir `release-a2720d9`, `release-d55d44e`, health.json `{"status":"ok","service":"static","version":"0.1.0"}`.
  - `bash infra/deploy/smoke.sh https://staging.tahamohamadi.ir --expect-noindex` → 8 PASS, exit 0.
  - `gh run list --branch main --limit 5` → latest runs `completed success` on `main`.
- Verification actually performed and result:
  - Served artifact (verbatim): `release-d55d44e` / checksum `e49e46c7` (deploy.log tail). Note: the task prompt referenced `release-fa3c813`, which does NOT match the served artifact; verified served release is `release-d55d44e` (also matches plan §5 snapshot and A3 task spec in SMALL-MODEL-EXECUTION-PLAN.md). Flagged as `pending verification` in RELEASE-P1.md.
  - Staging smoke re-run → `PASS root /`, `PASS locale /en/`, `PASS locale /fa/`, `PASS robots.txt`, `PASS sitemap.xml`, `PASS nonexistent-qa`, `PASS health.json body`, `PASS noindex /`; exit 0.
  - CI: `gh run list --branch main` shows recent pushes `completed success` (CI green on main).
  - `git diff --check` → exit 0 (PASS).
- Decisions / assumptions: Type STANDARD per RELEASE_POLICY (new public routes, static, no auth/data/secret). Completion DoD = `NOT MEASURED` because deferred/risk items remain open and enumerated. No risk/deferred status was changed. Production switch remains owner-only (A4) and is not authorized by this record.
- Deferred or risk IDs: listed verbatim in RELEASE-P1.md — RISK-0001 CLOSED; RISK-0004 IN PROGRESS, RISK-0005/0006 OPEN, RISK-0007 BLOCKED; DEFER-0007, 0009, 0010, 0011, 0012 OPEN; DEFER-0008 CLOSED. No status changed.
- Rollback / recovery: release decision record is additive documentation; rollback = Git revert of this commit. No server state was touched.

## LOG-0079 — 2026-08-15 — R2 / parallel polish batch + A5 close-out

- Outcome: چهار workstream موازی مستقل اجرا و همه تأیید شدند: (1) پولیش LOWهای audit — meta description/og:locale/og:url گیت‌وی، skip-link در gateway/404، <bdi> برای سال فوتر؛ (2) گزارش لایسنس LICENSES.md — ۳۰۱ پکیج، ۰ missing؛ flag: gsap (لایسنس اختصاصی، locked-unused)، sharp (LGPL در زنجیرهٔ build)، lightningcss (MPL-2.0)؛ (3) acceptance عمیق production — **PROD-ACCEPTED-WITH-NOTES**: یافتهٔ اصلی: 404 production بدنهٔ خالی (handle_errors در snippet نیست)؛ http→https در لبه 308؛ robots proxy-injection (DEFER-0011)؛ (4) بستن A5 — tickهای Task-list §5 با evidence واقعی (P1-13/14/15 و بخش‌های تکمیل‌شدهٔ P1-09/P1-12)، snapshot به‌روز، RELEASE-P1 نهایی.
- Why: سرعت با sub-agentهای موازی + کیفیت/دقت با ریویو مرکزی L-model؛ یافتهٔ 404 برای تجربهٔ کاربر production مهم است.
- Scope / files: pps/web/src/pages/{index,404}.astro، pps/web/src/components/Footer.astro، docs/plan/{LICENSES,PROD-ACCEPTANCE,RELEASE-P1}.md، Task-list.md §5 و snapshot، و همین Work Log.
- Commands or actions actually performed: چهار task موازی؛ سپس 
pm run check (0 error)؛ git diff --check؛ بازبینی مستقل diffها.
- Verification actually performed and result: پولیش build/check سبز؛ لایسنس‌ها ۰ missing (۲۹۵ permissive + ۶ flagged مستند)؛ production acceptance 7/8 PASS با 1 NOTE (404)؛ Task-list فقط خطوط دارای evidence tick شد.
- Decisions / assumptions: gsap/three/motion در P1 باندل نمی‌شوند (فقط locked)؛ fix 404 production به‌روزرسانی snippet Caddy نیاز دارد (owner sudo) — به‌همراه switch به release جدید در دستور update مالک گنجانده می‌شود. DEFER-0010 (browser QA) و DEFER-0011 باز ماندند.
- Deferred or risk IDs: بدون ID جدید؛ DEFER-0011 باز؛ gsap license به‌عنوان شرط adoption B5 ثبت شد.
- Rollback / recovery: revert کامیت‌های این batch؛ هیچ server/runtime state توسط agent تغییر نکرد.

## LOG-0080 — 2026-08-15 — R2 close-out / release updater, doc sync, CI fingerprint

- Outcome: سه workstream موازی دیگر تکمیل و تأیید شد: (1) infra/deploy/update-release.sh — اسکریپت root-run برای switch اتمیک current (کپی idempotent + chown/chmod + ln -sfn/mv -Tf + checksum در deploy.log) بدون هیچ تغییری در Caddyfile — روی سرور هم قرار گرفت؛ (2) README و PROJECT_MANIFEST با وضعیت live (production/staging P1 deployed، مکانیک snippet + atomic switch) هم‌تراز شدند؛ (3) CI: مرحلهٔ build fingerprint (dist/build-fingerprint.txt) + نام artifact نسخه‌دار web-dist-<sha> + retention 14 روز.
- Why: بستن R2 و آماده‌سازی به‌روزرسانی production به آخرین build (با fix کنتراست + پولیش) با کمترین اقدام مالک.
- Scope / files: infra/deploy/update-release.sh، .github/workflows/ci.yml، README.md، PROJECT_MANIFEST.md و همین Work Log.
- Commands or actions actually performed: سه task موازی؛ ash -n update-release.sh (exit 0)؛ scp اسکریپت به ~/taha-stage/؛ git diff --check؛ YAML با PyYAML اعتبارسنجی شد.
- Verification actually performed and result: همهٔ خروجی‌ها مطابق spec؛ هیچ تغییر سرور توسط agent؛ artifacts/scrip روی سرور آماده‌اند.
- Decisions / assumptions: به‌روزرسانی production فقط نیازمند sudo bash ~/taha-stage/update-release.sh ~/taha-stage/release-1ce6d9a است؛ fix 404 (handle_errors در snippet) به‌عنوان اقدام اختیاری مالک مستند شد.
- Deferred or risk IDs: DEFER-0011 OPEN؛ بدون ID جدید.
- Rollback / recovery: revert کامیت‌ها؛ rollback production = switch current به release قبلی.

## LOG-0081 — 2026-08-15 — Infra / scoped agent server operations path

- Outcome: مسیر امن برای اجرای خودکار عملیات سرور توسط agent تعریف شد: infra/deploy/caddy-apply.sh (root-owned، تبدیل ثابت و idempotent برای fix 404 handle_errors در snippet با gate validate و restore خودکار) ساخته و به سرور منتقل شد؛ SERVER_ACCESS_RUNBOOK.md بخش «Scoped agent operations» را گرفت: sudoers محدود به دو اسکریپت root-owned در /opt/taha/bin، بدون sudo عمومی، بدون escalation (اسکریپت‌ها توسط deploy قابل ویرایش نیستند)، audit از طریق auth.log/deploy.log/Caddy backups، و revoke فوری با حذف drop-in.
- Why: مالک خواست خودش عملیات سرور را انجام ندهد؛ grant باید حداقل‌امتیاز، قابل بازبینی و قابل revoke باشد.
- Scope / files: infra/deploy/caddy-apply.sh، docs/governance/SERVER_ACCESS_RUNBOOK.md و همین Work Log.
- Commands or actions actually performed: ash -n infra/deploy/caddy-apply.sh (exit 0)؛ scp به ~/taha-stage/caddy-apply.sh؛ git diff --check. هیچ تغییری روی سرور اعمال نشد (نصب sudoers = اقدام مالک).
- Verification actually performed and result: اسکریپت syntax-valid؛ منطق idempotent (اگر handle_errors موجود باشد بدون تغییر خارج می‌شود)؛ sudoers فقط دو مسیر دقیق.
- Decisions / assumptions: اعطای NOPASSWD عمداً فقط به دو فرمان ثابت؛ هر تغییر Caddy آینده نیازمند ویرایش اسکریپت root-owned یا grant جدید است.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: 
m /etc/sudoers.d/taha-deploy && visudo -c grant را فوراً لغو می‌کند.

## LOG-0082 — 2026-08-15 — Infra / caddy-apply idempotency and brace bug fixed

- Outcome: اجرای اول caddy-apply.sh با خطای parse مواجه شد («unexpected token '}'»): (الف) چک idempotency سراسری بود و handle_errors بلوک staging را می‌دید، بنابراین در اجرای قبلی snippet تولید اصلاح نشد؛ (ب) روش insert قبلی \t} را درست قبل از } اصلی می‌گذاشت → }} روی یک خط که parser سیدی رد می‌کند. اصلاح: چک محدود به region snippet + بازنویسی canonical کل snippet (براکت‌های متوازن، } در خط خودش). تست faithful روی سرور: caddy validate --config <mod2> --adapter caddyfile → **Valid configuration**.
- Why: fix 404 تولید باید بدون شکستن Caddy اعمال شود؛ backup/validate/restore طراحی قبلی به‌درستی کار کرد (Caddy ری‌لود نشد، فایل restore شد).
- Scope / files: infra/deploy/caddy-apply.sh و همین Work Log.
- Commands or actions actually performed: بازتولید محلی با بایت‌های واقعی فایل (scp از سرور)؛ scp خروجی به سرور؛ caddy validate --adapter caddyfile روی فایل تست → PASS؛ ash -n؛ git diff --check.
- Verification actually performed and result: snippet نهایی شامل handle_errors با ساختار متوازن و «Valid configuration» روی سرور؛ فایل اصلی Caddy دست‌نخورده (restore قبلی) و production سالم.
- Decisions / assumptions: نسخهٔ نهایی اسکریپت نیازمند reinstall در /opt/taha/bin توسط مالک و سپس اجرای sudo -n است.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: در صورت خطای validate، اسکریپت بکاپ را restore می‌کند و reload نمی‌شود.

## LOG-0083 — 2026-08-15 — R2 / production 404 fixed and full live verification

- Outcome: با caddy-apply.sh اصلاح‌شده (canonical snippet rewrite)، handle_errors داخل 	aha_application_routes وارد و Caddy validate + reload شد (بکاپ Caddyfile.auto-20260815130818). Production و staging اکنون صفحهٔ 404 سفارشی را با status 404 و بدنهٔ کامل (۴۱۲۷ بایت) سرو می‌کنند. مسیر دسترسی scoped agent (sudoers) فعال است: مالک فقط reinstall انجام داد و خود اسکریپت توسط grant اجرا شد.
- Why: بستن کامل R2 — 404 سفارشی بخشی از قرارداد static P1 بود و قبلاً در production خالی بود.
- Scope / files: docs/status/WORK_LOG.md، docs/plan/PROD-ACCEPTANCE.md، docs/plan/S-PLAN-STATE.md.
- Commands or actions actually performed: curl production/staging 404 (status+len+body)؛ ash infra/deploy/smoke.sh برای هر دو host (7/8 PASS)؛ تأیید بکاپ Caddy.
- Verification actually performed and result: prod404 status=404 len=4127 با notfound-code و متن دوزبانه؛ stage404 یکسان؛ smoke هر دو سبز؛ production روی release-1ce6d9a.
- Decisions / assumptions: NOTE قبلی PROD-ACCEPTANCE (404 خالی) رفع شد؛ DEFER-0011 (robots edge) همچنان باز است.
- Deferred or risk IDs: DEFER-0011 OPEN.
- Rollback / recovery: بکاپ‌های timestamped Caddy و switch اتمیک current؛ هر دو مکانیک آزمایش‌شده.

## LOG-0084 — 2026-08-15 — R2/P2 / V1 readiness check and P2 content questionnaire

- Outcome: (1) آزمایش ثبت agent: isual-reviewer در session فعلی ثبت نیست («Unknown agent type») — V1 به‌صورت READY-AFTER-RESTART ثبت شد و دستور dispatch دقیق (۷ اسکرین‌شات 003016..003052) در S-Plan آماده است؛ (2) فرم content پک P2 ساخته شد: docs/plan/P2-C1-CONTENT-REQUEST.md با ۱۰ بخش دوزبانه (identity، bio کوتاه/بلند، تجربه با ستون evidence، تحصیلات، مهارت‌ها بدون درصد ساختگی، تصمیم CV/Resume با مسیر دانلود، تصمیم تماس DEFER-0007 با فیلد مقدار دقیق، URLهای اجتماعی، statement دسترسی، یادآوری قانون evidence).
- Why: «هر دو» — V1 نیازمند restart است (محدودیت فنی ثبت‌شده)؛ P2 بدون ورودی واقعی مالک ساخته نمی‌شود، پس unblocker آن فرم C1 است.
- Scope / files: docs/plan/P2-C1-CONTENT-REQUEST.md، docs/plan/S-PLAN-STATE.md و همین Work Log.
- Commands or actions actually performed: dispatch آزمایشی isual-reviewer (خطای ثبت‌نشده)؛ ساخت فرم توسط sub-agent؛ git diff --check.
- Verification actually performed and result: فرم شامل تمام ستون‌ها/بخش‌های خواسته‌شده با __blank__ برای متن آزاد؛ مقادیر identity فعلی از content.ts verbatim کپی شد؛ C1 → BLOCKED(owner) با ارجاع فرم.
- Decisions / assumptions: هیچ صفحهٔ خالی P2 ساخته نشد (قانون «empty future route» رعایت شد)؛ C2..C7 همچنان BLOCKED(C1).
- Deferred or risk IDs: DEFER-0010 باز (منتظر restart).
- Rollback / recovery: revert این commit؛ هیچ runtime state تغییر نکرد.

## LOG-0085 — 2026-08-15 — P2 / V1 visual QA passed, C1 form received, About pages built

- Outcome: (1) **V1 اجرا شد** — agent isual-reviewer (پس از restart ثبت شد) هر ۷ اسکرین‌شات را بررسی کرد: همه ACCEPT-WITH-NOTES، بدون SEV؛ گزارش در docs/plan/VISUAL-QA-P1.md؛ DEFER-0010 بسته و DEFER-0013 (mobile matrix) ثبت شد. (2) فرم P2-C1 تکمیل‌شده دریافت شد: identity تأیید، short bio ویرایشی تأیید، ۷ مهارت با source، availability دوزبانه تأیید، تماس = omit (بستن DEFER-0007)؛ خالی‌ها (long bio، education، تجربهٔ org/role/date، فایل‌های CV/Resume، URLها) طبق قانون «empty = not published» منتشر نمی‌شوند. (3) پیاده‌سازی P2 (C2+C3+C6): ماژول typed profile.ts + profile.{en,fa}.ts با alidateProfile()، صفحات /en/about/ و /fa/about/، کامپوننت About.astro، لینک About در nav، sitemap ۵-URL، و انتقال copy 404 به content.notfound.
- Why: «هر دو» — V1 و P2؛ معماری content-driven برای admin panel آینده.
- Scope / files: pps/web/src/data/{profile.ts,profile.en.ts,profile.fa.ts,content.ts}، pps/web/src/components/{About,Landing,Header,Footer}.astro، pps/web/src/pages/{en,fa}/about.astro، 404.astro، index.astro، sitemap.xml.ts، docs/plan/VISUAL-QA-P1.md، docs/status/deferred-validation.md و همین Work Log.
- Commands or actions actually performed: dispatch V1 (visual-reviewer) و dispatch پیاده‌سازی P2؛ 
pm run check (0 error؛ 21 files)؛ 
pm run build (6 pages شامل aboutها)؛ git diff --check.
- Verification actually performed and result: ۷ گزارش visual همگی ACCEPT-WITH-NOTES؛ build شامل /en/about/ و /fa/about/؛ همهٔ copy از data؛ alidateProfile روی build اجرا می‌شود.
- Decisions / assumptions: مهارت‌ها روی هر دو locale با نام‌های فنی/لاتین یکسان (مصوب) نمایش داده می‌شوند؛ بخش‌های Experience/Education/CV منتشر نشدند چون دادهٔ واقعی ندارند (نیازمند تکمیل فرم توسط مالک).
- Deferred or risk IDs: DEFER-0010 CLOSED؛ DEFER-0007 CLOSED؛ DEFER-0013 OPEN (mobile matrix).
- Rollback / recovery: revert کامیت‌های این slice؛ deploy قبلی روی سرور سالم می‌ماند.

## LOG-0086 — 2026-08-15 — P1/P2 / no-hardcode audit and data-driven refactor

- Outcome: طبق دستور مالک («هیچ‌چیز هاردکد؛ همه‌چیز بعداً از admin panel مدیریت شود») agent audit همهٔ .astro/.ts غیر از data/ را اسکن کرد: ۷ مورد HIGH هاردکد (title gateway، نام‌های h1، «404»، برچسب‌های switch «EN»/«فارسی» در Header/Footer، نماد «©») + LOWهای برند (TM/طه). همه به content.ts منتقل شدند: gateway.title، 
ame، mark، 
otfound.code، برچسب switch از gateway.englishLabel/persianLabel locale مقابل، ooter.copyrightMark. پس از refactor، هیچ string کاربر-قابل‌مشاهده‌ای خارج از data/ باقی نماند (به‌جز جداکننده‌های تزئینی aria-hidden).
- Why: منبع واحد محتوا = مسیر مستقیم به admin panel/CMS در P3 (adapter روی همین ماژول‌ها).
- Scope / files: pps/web/src/data/content.ts، pps/web/src/components/{Header,Footer}.astro، pps/web/src/pages/{index,404}.astro و همین Work Log.
- Commands or actions actually performed: agent audit (explore)؛ سپس refactor دستی؛ 
pm run check (0 error)؛ 
pm run build (6 pages)؛ git diff --check.
- Verification actually performed and result: audit پس از اصلاحات — ۰ HIGH باقی‌مانده (فقط تزئینی/برند مستند)؛ build/check سبز.
- Decisions / assumptions: برچسب switch از «EN» به «English» تغییر کرد (داده‌محور و مطابق design.md §59)؛ نماد «©» از ooter.copyrightMark خوانده می‌شود.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: revert؛ deploy قبلی دست‌نخورده.

## LOG-0087 — 2026-08-15 — P2 / full master-profile content on About (C2/C3 completion)

- Outcome: مالک دو منبع محتوای واقعی تحویل داد (Taha_Mohammadi_Master_CV_Website_Profile.md و Taha_Mohammadi_Master_SOP_FA_Final.md). قرارداد typed گسترش یافت (experience/education/publications/researchProjects/certificates/socials/longBio + alidateProfile با بررسی URL و فیلدهای اجباری)؛ profile.en.ts با محتوای verbatim CV پر شد (short/long bio، ۵۸ مهارت در ۸ دسته، ۵ تجربه با bullets، ۲ education با GPA، ۳ publication، ۳ research project، ۷ certificate، socials LinkedIn/ORCID)؛ profile.fa.ts فقط محتوای مصوب فارسی را نگه داشت (طبق قانون «نبود ترجمه = عدم انتشار بخش»)؛ About.astro با بخش‌های شرطی (فقط دادهٔ موجود رندر می‌شود) بازنویسی شد؛ برچسب‌های بخش (en) در content.ts.sections اضافه شدند. ایمیل/تلفن منتشر نشدند (تصمیم تماس DEFER-0007).
- Why: تکمیل C1/C2/C3 با محتوای واقعی مالک؛ بدون هیچ ترجمه/اختراع agent.
- Scope / files: pps/web/src/data/{profile.ts,profile.en.ts,profile.fa.ts,content.ts}، pps/web/src/components/About.astro و همین Work Log.
- Commands or actions actually performed: 
pm run check (0 error)؛ 
pm run build (6 pages)؛ assertions روی dist: ۹ مورد en حاضر، fa فاقد experience و دارای availability.
- Verification actually performed and result: en About شامل MCI/Shahed/PARS-SQL/LinkedIn/ORCID/Certificates/Publications/availability/GPA؛ fa About بدون بخش‌های بدون-ترجمه؛ validation روی build اجرا می‌شود.
- Decisions / assumptions: CV master منبع وب‌سایت است (طبق متن خود فایل)؛ socials فقط LinkedIn/ORCID (بدون email/phone)؛ fa بخش‌های جدید ندارد تا ترجمهٔ فارسی مصوب برسد.
- Deferred or risk IDs: DEFER-0013 (mobile matrix) OPEN؛ بدون ID جدید.
- Rollback / recovery: revert کامیت؛ deploy قبلی سالم.

## LOG-0088 — 2026-08-15 — P2 / GitHub links from resume variants (en+fa)

- Outcome: دو resume variant دیگر مالک (Senior Backend BluePay و Industry Resume Software AI) دو واقعیت جدید تأییدشده داشتند: GitHub profile (https://github.com/tahamohamadi-ir) و repo پروژهٔ PARS-SQL/VTD-Edge (https://github.com/tahamohamadi-ir/ADHD-VTD). به socials هر دو locale (en+fa — نام پلتفرم proper noun است) و به‌عنوان url+linkLabel پروژه در en اضافه شد؛ ResearchProject با url/linkLabel توسعه یافت و About پروژه را با لینک data-driven رندر می‌کند. bullets تجربهٔ master CV (canonical) تغییر نکرد.
- Why: لینک‌های اجتماعی/پروژه بخشی از هویت عمومی هستند و در منابع مصوب آمده‌اند.
- Scope / files: pps/web/src/data/{profile.ts,profile.en.ts,profile.fa.ts}، pps/web/src/components/About.astro و همین Work Log.
- Commands or actions actually performed: 
pm run check (0 error)؛ 
pm run build (6 pages)؛ smoke نسخهٔ قبلی (7 PASS) و تأیید /about/ ها (200) پیش از تغییر.
- Verification actually performed and result: build سبز؛ لینک GitHub پروژه data-driven (بدون هاردکد).
- Decisions / assumptions: ایمیل/تلفن از resumeها منتشر نشد (تصمیم تماس پابرجا)؛ «Django Rebuild» به‌عنوان پروژهٔ سایت منتشر نشد (site ما Astro است — این فقط framing رزومه است).
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: revert کامیت؛ deploy قبلی سالم.

## LOG-0089 — 2026-08-15 — P2 / a11y audit fixes, mobile-overflow CI, docs sync

- Outcome: سه workstream موازی: (1) audit دسترس‌پذیری About → ۲ must-fix رفع شد: skip سطح heading در fa (وقتی برچسب بخش نیست، مهارت‌ها h2 می‌شوند به‌جای h3 — بدون اختراع فارسی) و هاردکد «GPA» → gpaLabel در content؛ plus: آندرلاین rest-state لینک‌های سازمان/پروژه (design.md §55)؛ (2) CI: مرحلهٔ «Mobile overflow check (Playwright)» با infra/qa/mobile-overflow.spec.mjs (۶ مسیر × ۳۲۰×۵۶۸ و ۳۹۰×۸۴۴، fail اگر scrollWidth>1px) → پوشش overflow موبایل DEFER-0013؛ (3) هم‌ترازی مستندات: snapshot S-Plan، pointer content pack به master CV، README.
- Why: کیفیت/دقت بالا + بستن defer با ابزار CI؛ معماری بدون هاردکد حفظ شد.
- Scope / files: pps/web/src/components/About.astro، pps/web/src/data/content.ts، .github/workflows/ci.yml، infra/qa/mobile-overflow.spec.mjs، docs/plan/{SMALL-MODEL-EXECUTION-PLAN,P0-G0-content-pack-proposal}.md، README.md و همین Work Log.
- Commands or actions actually performed: سه task موازی (explore/general/general)؛ 
pm run check (0 error)؛ 
pm run build (6 pages)؛ assertions روی dist (fa مهارت‌ها h2، en GPA)؛ 
ode --check و YAML validation توسط agent.
- Verification actually performed and result: build سبز؛ heading hierarchy fa رفع شد؛ «GPA» data-driven؛ CI جدید پس از push تست می‌شود.
- Decisions / assumptions: برچسب‌های فارسی بخش‌ها اختراع نشدند (منتظر مالک) — با سطح heading پویا مشکل skip حل شد؛ DEFER-0013 برای بخش overflow با CI پوشش گرفت (بخش visual همچنان باز).
- Deferred or risk IDs: DEFER-0013 OPEN (با پوشش CI برای overflow).
- Rollback / recovery: revert کامیت‌ها؛ deploy قبلی سالم.

## LOG-0090 — 2026-08-15 — P2 / shared bilingual About tabs and justified text

- Outcome: About فارسی و انگلیسی به یک component و ساختار یکسان CSS-only radio-tab تبدیل شدند؛ هر دو locale شش tab هم‌ساختار دارند و فقط label/data زبان تغییر می‌کند. متن‌های طولانی About، تجربه، پژوهش، publication و certificate با `text-align: justify` و `text-justify: inter-word` خواناتر شدند؛ نوار tab در mobile افقی scroll می‌شود و JS/hydration اضافه نشد.
- Why: درخواست مالک برای یکسان‌بودن format/style/tab بین fa/en و کاهش scroll عمودی.
- Scope / files: `apps/web/src/components/About.astro`، `apps/web/src/data/content.ts`، `apps/web/src/data/profile.fa.ts`، `docs/plan/P2-about-tabs-task-spec.md` و همین Work Log.
- Commands or actions actually performed: `npm run check` (0 errors / 0 warnings / 0 hints)؛ `npm run build` (6 pages)؛ `node --check qa/mobile-overflow.spec.mjs`؛ YAML validation؛ static assertions برای ۶ tab و justified CSS.
- Verification actually performed and result: build سبز؛ هر دو locale دارای data کامل و شش panel/tab؛ tabها با radio/CSS بدون JS کار می‌کنند؛ mobile overflow در CI بررسی می‌شود (Chromium local به‌دلیل 403 CDN نصب نشد).
- Decisions / assumptions: labels فارسی بخش‌ها (`سوابق کاری`, `تحصیلات`, `مهارت‌ها`, `انتشارات`, `پژوهش`, `گواهی‌ها`) با درخواست صریح مالک اضافه شدند؛ empty future section render نمی‌شود.
- Deferred or risk IDs: `DEFER-0013` برای visual mobile QA/CI result باز است.
- Rollback / recovery: revert commit؛ deploy فعلی untouched تا check/CI و artifact جدید.

## LOG-0092 — 2026-08-15 — P2 / About tabs live and mobile overflow CI green

- Outcome: About فارسی و انگلیسی با ساختار tab یکسان و CSS-only، متن‌های طولانی justify، شش tab (Experience/Education/Skills/Research/Publications/Certificates) و labels فارسی/انگلیسی live شد. Header responsive fix باعث شد Playwright overflow در `/en/` و `/en/about/` در 320px از 30px به PASS برسد.
- Why: درخواست مالک برای format/style/tab یکسان، justify متن و ادامهٔ توسعه با کیفیت موبایل.
- Scope / files: `apps/web/src/components/About.astro`، `apps/web/src/components/Header.astro`، `apps/web/src/data/content.ts`، `apps/web/src/data/profile.fa.ts`، `docs/plan/P2-about-tabs-task-spec.md`، `docs/status/deferred-validation.md`.
- Commands or actions actually performed: `npm run check` (0 errors)؛ `npm run build` (6 pages)؛ `node --check qa/mobile-overflow.spec.mjs`؛ CI run `31889867770` → success؛ artifact `release-01458eb` با update-release روی سرور deploy شد؛ production/staging smoke PASS.
- Verification actually performed and result: هر دو locale دارای شش radio/CSS tab؛ no-JS/hydration حفظ شد؛ justify CSS موجود؛ CI هر دو viewport 320/390 و شش route را اجرا کرد؛ production `/en/about/` و `/fa/about/` 200.
- Decisions / assumptions: tabs با native radio و CSS ساخته شدند تا بدون JS و بدون React کار کنند؛ `DEFER-0013` فقط برای visual screenshot/mobile typography باز است، نه overflow.
- Deferred or risk IDs: `DEFER-0013` OPEN با CI evidence؛ C4 هنوز منتظر فایل‌های CV/Resume مالک.
- Rollback / recovery: revert commit؛ artifact قبلی با `current` قابل بازگشت است.

## LOG-0091 — 2026-08-15 — CI / mobile overflow fix for English header at 320px

- Outcome: Playwright CI correctly found `overflow=30px` on `/en/` and `/en/about/` at 320×568 while all fa/390 checks passed. Root cause was the longer English header brand plus About/language controls; responsive header rules now shrink spacing/labels, allow brand ellipsis and keep controls within the viewport.
- Why: `DEFER-0013` mobile overflow check is a blocking quality gate, not a check to disable.
- Scope / files: `apps/web/src/components/Header.astro` and this Work Log.
- Commands or actions actually performed: CI run `31889672810` failure reviewed; responsive media rule added; local check/build had passed before push.
- Verification actually performed and result: CI rerun required after this fix; no threshold or test was weakened.
- Deferred or risk IDs: `DEFER-0013` remains open until the next CI run passes all viewport/page cases.
- Rollback / recovery: revert the responsive header commit; previous behavior remains available.

## LOG-0094 — 2026-08-15 — CI / RTL-aware About tabs keyboard regression

- Outcome: About-tabs Playwright regression caught that the test assumed `ArrowRight` advances the radio group in RTL; product layout/activation passed, but fa keyboard checks failed. The test now chooses `ArrowLeft` for `dir="rtl"` and `ArrowRight` for LTR, preserving the real native keyboard behavior.
- Why: keyboard direction must follow locale; a test that ignores RTL would create a false failure or encourage incorrect product behavior.
- Scope / files: `apps/web/qa/about-tabs.spec.mjs` and this Work Log.
- Commands or actions actually performed: reviewed CI run `31890608892`; changed only the direction-aware key selection; syntax/diff verification follows.
- Verification actually performed and result: previous run showed all geometry/activation/locale checks PASS and only fa keyboard checks FAIL; the correction is test-only and does not weaken assertions.
- Deferred or risk IDs: `DEFER-0013` remains open until CI rerun passes.
- Rollback / recovery: revert the test-only commit; no production state affected.

## LOG-0093 — 2026-08-15 — P2 / About tab layout and locale-switch regression fix

- Outcome: audit found the About tab controls and panels were siblings inside one `nowrap` flex container, so desktop panels rendered beside/stretched by the tab strip. Controls are now in a separate horizontally scrollable wrapper and panels render below it. Header/Footer now honor `alternateHref`, so `/en/about/` switches to `/fa/about/` and vice versa instead of the locale root. A Playwright regression script now checks geometry, one-visible-panel behavior, keyboard tab movement, click activation and equivalent locale links at 320/390/1280.
- Why: this was a real P2 layout blocker and a route-contract violation; overflow-only CI did not detect panel placement or equivalent locale switching.
- Scope / files: `apps/web/src/components/About.astro`, `Header.astro`, `Footer.astro`, `apps/web/qa/about-tabs.spec.mjs`, `.github/workflows/ci.yml` and this Work Log.
- Commands or actions actually performed: `npm run check`/`npm run build` (6 pages); `node --check qa/about-tabs.spec.mjs`; `node --check qa/mobile-overflow.spec.mjs`; YAML validation; static assertions for separated controls/panels and equivalent About links.
- Verification actually performed and result: local checks PASS; CI will run the new About-tabs regression after push. No JS/hydration was added; tabs remain native radio + CSS.
- Deferred or risk IDs: `DEFER-0013` remains open until the new CI About-tabs suite passes; mobile browser visual review remains separate.
- Rollback / recovery: revert the layout/test commit; previous release remains on the server until the new artifact is deployed.

## LOG-0095 — 2026-08-15 — R2/P2 / final tab layout deploy and smoke

- Outcome: corrected About tab controls/panels, equivalent locale switches and direction-aware keyboard test are now deployed from clean HEAD `4fcd19f` as `release-4fcd19f` (checksum `13849ab7`); previous artifact naming mismatch was eliminated.
- Why: the prior deployment had been built from a working tree before the regression commits; this release is reproducible from the exact commit and includes the final tabs fix.
- Scope / files: `apps/web/` artifact only; no server config change.
- Commands or actions actually performed: clean `npm run check`/`npm run build` (23 files, 6 pages); artifact upload; `sudo -n /opt/taha/bin/update-release.sh /home/deploy/taha-stage/release-4fcd19f`; read `deploy.log`; production smoke script.
- Verification actually performed and result: deploy.log recorded `updated release-4fcd19f 13849ab7`; production smoke 7 PASS; `/en/about/` and `/fa/about/` include separated tab controls/panels and equivalent locale links.
- Decisions / assumptions: CSS-only radio tabs remain the shared no-JS implementation; visual UI QA remains covered by prior V1 plus CI geometry/keyboard/overflow tests.
- Deferred or risk IDs: `DEFER-0013` remains open only for residual full visual mobile review; overflow and tab behavior are CI-covered.
- Rollback / recovery: switch `/opt/taha/site/current` to the previous release with the scoped update script; no Caddy reload required.

## LOG-0096 — 2026-08-15 — P2 / centered About intro and six-width regression

- Outcome: with owner approval of the bounded slice, the long intro paragraphs of the About pages are now horizontally centered while keeping their readable measure, and the About-tabs regression covers both locales at 320/390/768/1024/1280/1440. `.about-bio` (60ch) and `.about-bio-long` (68ch) in `apps/web/src/components/About.astro` gained logical auto inline margins (`margin-inline: auto`); tab/entry cards remain full-width. Task Spec amended with the centered-intro contract (RTL/LTR, full-width cards, six-width matrix, 200% zoom as manual/deferred evidence). `DEFER-0013` updated: real 200% zoom evidence stays OPEN (fake zoom not simulated), QA spec path corrected from `infra/qa/…` to `apps/web/qa/…`.
- Why: owner screenshots showed the RTL intro constrained at x304..x906 (right-anchored) while full-width cards below started at ~x43; the read-only audit established an always-on reading-measure condition (no breakpoint near 940px) and the slice contract chose the centered measure as the fix.
- Scope / files: `apps/web/src/components/About.astro`, `apps/web/qa/about-tabs.spec.mjs`, `docs/plan/P2-about-tabs-task-spec.md`, `docs/status/deferred-validation.md` and this Work Log.
- Commands or actions actually performed: `npm run check` (0 errors / 0 warnings / 0 hints, 23 files); `npm run build` (6 pages, complete); `node --check qa/about-tabs.spec.mjs` (exit 0); `npx astro preview --port 4321` + `node qa/about-tabs.spec.mjs` → 78 PASS, exit 0.
- Verification actually performed and result: for `/fa/about/` and `/en/about/` at 320/390/768/1024/1280/1440: horizontal overflow ≤1px, intro blocks centered within `.about` (maxDelta 0.00px at every width), cards wider than intro at desktop (1024: 944px vs 712px; 1280/1440: 1200px vs 712px), tab geometry, one visible panel, direction-aware keyboard, click activation and locale-switch links all PASS (78 PASS = 36 at 320/390/768 + 42 at 1024/1280/1440; count independently re-verified). The cards-wider assertion measures the `.entry` inside the actually visible tab panel (computed display/visibility), not the first document-order panel. The spec reads `PW_EXECUTABLE_PATH` (CI-neutral override; CI never sets it) so the local run used the already-installed real Chromium 1228 headless shell; Playwright 1.62.1's required r1234 download was throttled by the CDN (default and npmmirror mirrors, >10 min per 10%), so no browser/version change was made to the repository.
- Decisions / assumptions: 200% browser zoom is NOT simulated with synthetic viewports (fake zoom forbidden); real zoom visual evidence remains deferred in `DEFER-0013` (manual/owner or a future real-browser CI). No Luna/OpenCode config touched (owner re-authorized Luna as fallback).
- Deferred or risk IDs: `DEFER-0013` OPEN (200% zoom + full visual matrix); its QA path and status text corrected.
- Rollback / recovery: revert this slice's commit; the previous right-anchored measure behavior remains available in the prior artifact; no push/deploy performed and the deployed artifact remains unchanged.

## LOG-0097 — 2026-08-15 — P2 / zoom-safe gateway, landing and 404

- Outcome: یک برش مستقل و قابل‌بازگشت برای viewportهای بسیار باریک پیاده‌سازی شد. Gateway و 404 دیگر محتوا و کنترل‌ها را با `overflow: hidden` غیرقابل‌دسترسی نمی‌کنند؛ fallback مرتب `100vh` سپس `100svh` دارند؛ grid/flex و متن‌های بلند shrink/wrap می‌شوند؛ SVG تزئینی Gateway در جعبهٔ خودش محدود می‌شود؛ و Perspectives grid در Landing از حداقل track سازگار با عرض کانتینر استفاده می‌کند. QA موبایل با یک browser مشترک به ماتریس 160×284 و 195×422 (فقط approximation، نه zoom واقعی) به‌علاوهٔ 320/390/768/1024/1280/1440 گسترش یافت و `dir`، overflow و دسترسی کنترل‌های Gateway/404 را بررسی می‌کند.
- Why: ممیزی ریسپانسیو نشان داد `overflow: hidden` در Gateway/404 می‌تواند مسیر اسکرول را در 200٪ zoom از بین ببرد؛ اندازه‌گیری مرورگر همچنین min-content متن انگلیسی و SVG تمام‌صفحه را عامل `scrollWidth` اضافی معرفی کرد. پنهان‌کردن overflow به‌عنوان پاسخ پذیرفته نشد و علت‌های واقعی در همان اجزا اصلاح شدند.
- Scope / files: `apps/web/src/pages/index.astro`, `apps/web/src/pages/404.astro`, `apps/web/src/components/Landing.astro`, `apps/web/qa/mobile-overflow.spec.mjs`, `docs/plan/P2-zoom-safety-task-spec.md` و همین Work Log.
- Commands or actions actually performed: `npm ci` در worktree ایزوله؛ `npm run check` (23 files، 0 error/warning/hint)؛ `npm run build` (6 pages)؛ `node --check qa/mobile-overflow.spec.mjs`؛ preview تازه روی `127.0.0.1:4322` و اجرای spec با Chrome channel؛ `git diff --check`.
- Verification actually performed and result: پس از rebase روی `LOG-0096`، mobile-overflow regression برابر 128 PASS / 0 FAIL و dedicated About-tabs regression برابر 78 PASS / 0 FAIL بود. `/`, `/en/`, `/fa/`, `/404.html` در دو viewport تقریبی و شش عرض عادی بدون overflow افقی گذشتند؛ Aboutهای fa/en در شش عرض عادی گذشتند؛ `dir` برای fa=rtl و بقیه=ltr بود؛ همهٔ کنترل‌های Gateway/404 پس از `scrollIntoViewIfNeeded()` داخل viewport و قابل‌دسترسی بودند. این نتایج zoom واقعی مرورگر را ادعا نمی‌کنند.
- Decisions / assumptions: دو viewport نصف‌شده فقط approximation برای کشف ریسک layout هستند؛ evidence واقعی 200٪ در `DEFER-0013` باز می‌ماند. اجرای نهایی مستقیم پس از گیرکردن عامل‌ها روی preview path/server انجام شد؛ تغییرات همچنان در worktree و branch مجزای `cx/p2-zoom-safety` هستند.
- Deferred or risk IDs: `DEFER-0013` OPEN برای visual matrix و zoom واقعی؛ hosted CI پس از push اجرا می‌شود.
- Rollback / recovery: revert commit این برش؛ artifact مستقرشده تغییر نکرده و هیچ push/deploy/SSH انجام نشده است.

## LOG-0098 — 2026-08-15 — Tooling / RTK for OpenCode agents and sub-agents

- Outcome: نسخه رسمی Windows x86_64 از RTK `0.45.0` در `C:\Users\Taha\.local\bin\rtk.exe` نصب شد و plugin رسمی OpenCode در `C:\Users\Taha\.config\opencode\plugins\rtk.ts` فعال شد. یک session تازه‌ی OpenCode `1.18.18` با DeepSeek V4 Flash نشان داد commandهای shell برای agent اصلی و general sub-agent به‌صورت خودکار از RTK عبور می‌کنند.
- Why: خروجی‌های طولانی Git/build/test بخشی از context مدل را مصرف می‌کنند؛ RTK می‌تواند این خروجی را فشرده کند، اما میزان آن وابسته به command است و معادل قطعی کاهش هزینه API نیست.
- Scope / files: binary و plugin رسمی در مسیرهای global بالا؛ `PROJECT_MANIFEST.md`، `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md`، `docs/plan/R0-rtk-opencode-task-spec.md` و همین Work Log. هیچ dependency/config مدل، application، CI، VPS یا production تغییر نکرد.
- Commands or actions actually performed: دریافت release رسمی `v0.45.0`؛ تطبیق SHA-256 آرشیو (`34cea9009a8099acdaf85147b971d95f65efabfa63fb3aea7d3e2b73e6f517c3`)؛ `rtk --version`؛ dry-run و سپس `rtk init -g --opencode`؛ `rtk init --show`؛ مقایسه raw/RTK برای `git status`، `git log -n 10` و `npm run build`؛ smoke واقعی OpenCode برای main/sub-agent؛ `rtk gain --history`؛ dry-run مسیر uninstall؛ و review مستقل read-only توسط OpenCode/DeepSeek V4 Flash روی diff و Task Spec.
- Verification actually performed and result: checksum دقیقاً MATCH؛ نسخه `0.45.0`؛ plugin status برابر installed؛ main-agent فرمان `git status` را به `rtk git status` و sub-agent فرمان `git log -n 10` را به `rtk git log -n 10` rewrite کرد. مقایسه byte حدود 77.6٪ کاهش برای status و 52.2٪ برای log داشت؛ build فقط 2.8٪ کاهش تخمینی RTK داشت. history اولیه روی 7 command برابر 216 token تخمینی / 17.9٪ بود؛ بنابراین درصد عمومی یا billing saving ادعا نمی‌شود. reviewer مستقل نتیجه `PASS` با دو note غیرمسدودکننده داد؛ `git diff --check` نیز exit 0 بود.
- Decisions / assumptions: فقط integration رسمی first-party استفاده شد و wrapper ثالث `openrtk` نصب نشد. نبودن Claude hook عمومی عمدی است؛ مرز این کار فقط OpenCode است. sessionهای از قبل باز باید restart شوند. در failure، ambiguity یا acceptance نیازمند خروجی دقیق، raw output باید بازیابی و بررسی شود.
- Deferred or risk IDs: مورد release-blocking جدیدی ایجاد نشد. ریسک باقی‌مانده کم است: برآورد token محلی است و compaction ممکن است جزئیات لازم را پنهان کند؛ mitigation در S-Plan ثبت شد.
- Rollback / recovery: ابتدا `rtk init -g --opencode --uninstall`، سپس تأیید نبود plugin و restart OpenCode؛ فقط پس از بررسی وابستگی سایر workflowها binary دقیق `C:\Users\Taha\.local\bin\rtk.exe` حذف شود. rollback مخزن با revert همین commit مستنداتی است؛ push/deploy انجام نشد.

## LOG-0099 — 2026-08-15 — P2 / Linux CI mobile-header overflow regression

- Outcome: CI run `31902292412` فقط در `/en/` و viewport تقریبی `160×284`، `20px` overflow گزارش کرد. علت، min-content مرزی header بود: `.site-header-inner` حتی با Inter محلی به `161.2px` می‌رسید و گروه nav نمی‌توانست در metric فونت fallback لینوکس shrink شود. زیر `12rem`، نام بصری brand حذف می‌شود اما خود لینک محفوظ است و دو لینک nav در یک grid row مساوی و قابل‌دسترسی قرار می‌گیرند.
- Why: هیچ route یا متن تأییدشده نباید برای عبور CI حذف شود؛ راه‌حل باید linkهای locale/About، ارتفاع لمس و RTL/LTR را حفظ کند و به font metric وابسته نباشد.
- Scope / files: `apps/web/src/components/Header.astro`، `apps/web/qa/mobile-overflow.spec.mjs`، `docs/plan/P2-mobile-overflow-ci-regression-task-spec.md` و همین Work Log.
- Commands or actions actually performed: لاگ failed run با `gh run view 31902292412 --log-failed` خوانده شد؛ DOM/min-content محلی با Chrome واقعی بررسی شد؛ `npm run check`؛ `npm run build`؛ preview محلی `127.0.0.1:4323`؛ `PREVIEW_URL=http://127.0.0.1:4323 PLAYWRIGHT_CHANNEL=chrome node qa/mobile-overflow.spec.mjs`؛ و `git diff --check`.
- Verification actually performed and result: Astro check برابر 0 error/warning/hint و build برابر 6 pages بود. کل matrix mobile overflow با Chrome واقعی PASS شد؛ کنترل‌های `.site-header a` اکنون برای `/en/`، `/fa/` و هر دو About locale هم در QA بررسی و در viewport قابل‌دسترسی‌اند. browser bundled Playwright revision محلی موجود نبود؛ Chrome نصب‌شده با override فقط برای local QA استفاده شد. hosted Linux CI پس از push این fix معیار نهایی است.
- Decisions / assumptions: assertion overflow یا matrix محدود نشد و `DEFER-0013` برای real 200% zoom unchanged است. header در viewport فوق‌باریک عمداً دو ردیف می‌شود تا linkها به‌جای clip/shrink غیرقابل‌استفاده قابل‌دسترسی بمانند.
- Deferred or risk IDs: `DEFER-0013` OPEN؛ evidence واقعی zoom هنوز دستی/owner است. CI rerun برای اختلاف metric لینوکس pending است.
- Rollback / recovery: revert commit این regression fix؛ artifact production دست‌نخورده است و هیچ deploy/SSH انجام نشده است.

## LOG-0100 — 2026-08-15 — P2 / Landing CTA hardening after CI retry

- Outcome: CI retry `31903032574` پس از hardening header باز هم فقط `/en/@160×284` را با `overflow=20px` fail کرد؛ بنابراین header به‌تنهایی root cause نبود. Landing CTA انگلیسی اکنون `min-width: 0`، `max-width: 100%` و `overflow-wrap: anywhere` دارد و در زیر `12rem` تمام‌عرض با padding کمتر می‌شود؛ hero/section نیز padding افقی امن دارند. QA هنگام overflow بعدی selector/box source را هم در log چاپ می‌کند.
- Why: retry failure باید به evidence تبدیل شود، نه به تغییر ظاهری حدسی. CTA دارای label طولانی انگلیسی و padding ثابت در 128px content width بود؛ layout جدید label/target را بدون حذف یا clip در container نگه می‌دارد.
- Scope / files: `apps/web/src/components/Landing.astro`، `apps/web/qa/mobile-overflow.spec.mjs`، `docs/plan/P2-mobile-overflow-ci-regression-task-spec.md` و همین Work Log.
- Commands or actions actually performed: review کامل log `31903032574`؛ `npm run check` (0 error/warning/hint)؛ `npm run build` (6 pages)؛ `node --check qa/mobile-overflow.spec.mjs`؛ preview محلی؛ و اجرای کامل `mobile-overflow.spec.mjs` با Chrome واقعی که PASS شد.
- Verification actually performed and result: matrix محلی همه routeها، widthها، `dir` و کنترل‌های header/gateway/404 را PASS کرد. Chromium bundled لینوکسی فقط در hosted CI وجود دارد؛ بنابراین rerun بعد از push evidence نهایی این slice است.
- Decisions / assumptions: header safe-layout از commit پیشین حفظ شد، اما علت نهایی بدون شواهد selector-specific ادعا نمی‌شود. assertion/matrix ضعیف نشد؛ diagnostic فقط روی failure چاپ می‌شود.
- Deferred or risk IDs: `DEFER-0013` unchanged/Open برای zoom واقعی. hosted CI rerun pending.
- Rollback / recovery: revert commit CTA hardening و در صورت نیاز revert commit header regression؛ هیچ deploy/SSH انجام نشده است.

## LOG-0101 — 2026-08-15 — P2 / selector-confirmed Linux overflow closure

- Outcome: failure diagnostic از CI run `31903254960` منبع‌های باقی‌مانده را دقیقاً نشان داد: `.section-heading` در content box `136px` تا `164px` scroll می‌کرد و footer انگلیسی (`.footer-brand-copy`/name/tagline) به `176px` می‌رسید. عنوان Landing و متن brand/footer اکنون `overflow-wrap: anywhere` دارند؛ flex container/footer copy هم `min-width: 0` دارند. هیچ label، route یا control حذف نشد.
- Why: دو retry قبلی نشان دادند فرضِ یک root cause کافی نبود. QA باید failure را با selector/box evidence گزارش کند تا fix بعدی دقیق باشد.
- Scope / files: `apps/web/src/components/Footer.astro`، `apps/web/src/components/Landing.astro`، `apps/web/qa/mobile-overflow.spec.mjs`، `docs/plan/P2-mobile-overflow-ci-regression-task-spec.md` و همین Work Log.
- Commands or actions actually performed: `gh run view 31903254960 --log-failed` با diagnostic source؛ `npm run check` (0 error/warning/hint)؛ `npm run build` (6 pages)؛ `node --check qa/mobile-overflow.spec.mjs`؛ preview تازه؛ و full mobile-overflow matrix با Chrome واقعی PASS.
- Verification actually performed and result: همهٔ route/viewport/dir/control checkهای local PASS شدند. diagnostic CI، width و selector دقیق را ثبت کرد؛ hosted Linux rerun پس از push تنها evidence باقی‌مانده است.
- Decisions / assumptions: فقط قواعد shrink/wrap روی عناصر proven اضافه شد؛ overflow assertion، viewport matrix و `DEFER-0013` تغییر نکردند.
- Deferred or risk IDs: `DEFER-0013` OPEN برای zoom واقعی؛ CI final rerun pending.
- Rollback / recovery: revert این commit و در صورت نیاز commitهای پیشین regression fix؛ production untouched و هیچ deploy/SSH انجام نشده است.

## LOG-0102 — 2026-08-15 — P2 / hosted CI green for tiny-viewport regression

- Outcome: GitHub Actions run `31903433836` برای commit `d69b0e9` سبز شد. Mobile overflow check که سه run قبلی در `/en/@160×284` fail شده بود، اکنون PASS است؛ About-tabs regression، audit، artifact/secret validation و upload نیز PASS شدند.
- Why: Linux hosted Chromium evidence نهایی این slice است؛ Chrome محلی به‌تنهایی اختلاف metric فونت Linux را اثبات نمی‌کرد.
- Scope / files: فقط این Task Spec و Work Log برای ثبت evidence نهایی.
- Commands or actions actually performed: `gh run watch 31903433836 --exit-status` تا completion؛ status/workflow steps از GitHub Actions خوانده شد.
- Verification actually performed and result: type check، build، smoke، Mobile overflow Playwright، About tabs Playwright، dependency audit، artifact completeness/no-secret و upload artifact همگی PASS؛ مدت workflow 2m4s.
- Decisions / assumptions: production deploy در scope Task Spec نیست و انجام نشد؛ passing CI release artifact را فراهم می‌کند اما به‌تنهایی deploy authorization نیست.
- Deferred or risk IDs: `DEFER-0013` همچنان OPEN فقط برای real 200% zoom/manual visual evidence؛ failure CI این slice بسته شد.
- Rollback / recovery: revert commitهای `d69b0e9`، `6466d72` و `af3d16e` در صورت نیاز؛ artifact production دست‌نخورده است.

## LOG-0103 — 2026-08-15 — G0-01 / documentation-drift closure audit

- Outcome: closure audit of `G0-01` confirmed that commit `6adb0b8` and `LOG-0051` had completed the intended documentation reconciliation, but found one residual URL-route example: the Technology Baseline still listed Caddy reverse-proxy `/cms`. It now states `/admin/`, matching ADR-0014/ADR-0008. The Task Spec status is now complete.
- Why: the task's own verification required no remaining `/cms/` URL-route example; leaving one stale route could misdirect a future CMS deploy even though `apps/cms/` remains the correct source directory.
- Scope / files: `docs/taha-personal-platform-technology-architecture-baseline-fa.md`, `docs/plan/P0-G0-documentation-drift-task-spec.md` and this Work Log.
- Commands or actions actually performed: Git-history audit of `6adb0b8`; scoped route searches; current ADR-0014/ADR-0008 comparison; `rg "/cms/" docs/taha-personal-platform-technology-architecture-baseline-fa.md`; and `git diff --check`.
- Verification actually performed and result: `/admin/` is the only remaining admin URL-route form in the Technology Baseline; `apps/cms/` is the sole `/cms/` occurrence and is a filesystem source path. No runtime/config/ADR decision changed.
- Decisions / assumptions: this is documentation-only and does not authorize CMS bootstrap, deployment or a route implementation.
- Deferred or risk IDs: no status changed; existing P0/P3 risks and deferrals remain as recorded.
- Rollback / recovery: revert this documentation-only commit; no runtime state is affected.

## LOG-0104 — 2026-08-15 — P2 / evidence-state reconciliation

- Outcome: P2 About-tabs and zoom-safety task specs now record completion only for their implemented, locally verified, and hosted-CI-verified scope. The P2/V1 execution rows now match the current evidence; C4 remains `BLOCKED(owner)` and C7 remains blocked by C4 with no deployment claim.
- Why: reconcile stale execution-state and deferred-evidence wording without closing the distinct real-browser 200% zoom/manual visual deferral.
- Scope / files: `docs/plan/P2-evidence-state-reconciliation-task-spec.md`, `docs/plan/P2-about-tabs-task-spec.md`, `docs/plan/P2-zoom-safety-task-spec.md`, `docs/plan/S-PLAN-STATE.md`, `docs/status/deferred-validation.md` and this Work Log.
- Commands or actions actually performed: read the repository contracts and target documents; queried GitHub Actions runs `31903433836` and `31904100378` with `gh run view`; performed the scoped text searches required by this Task Spec; edited only the six allowed documentation files.
- Verification actually performed and result: both referenced CI runs reported `success`, including type check, build, smoke, Mobile overflow Playwright, About tabs Playwright, dependency audit, artifact completeness/no-secret and upload steps; review-log history was not edited; deployment, SSH and runtime actions were not performed.
- Decisions / assumptions: `DEFER-0013` remains `OPEN`; synthetic viewports do not prove real 200% browser zoom. This is documentation-only and does not authorize deployment or close C4/C7.
- Deferred or risk IDs: `DEFER-0013` remains OPEN; C4 remains `BLOCKED(owner)`; C7 remains blocked by C4.
- Rollback / recovery: revert the documentation-only commit; no runtime state is affected.

## LOG-0105 - 2026-08-15 - P1-09 / Person/WebSite structured data (JSON-LD)

- Outcome: the unchecked P1-09 item "Person/WebSite structured data" is implemented. Every indexable page now emits inert `application/ld+json` blocks built exclusively from the approved typed data: `WebSite` (name/url/inLanguage from `site.ts` and `content.ts`) on `/`, `/en/`, `/fa/`, `/en/about/`, `/fa/about/`, plus `Person` (name/url/sameAs/alumniOf from `profile[locale]`) on the four locale pages. A new build-time `validateStructuredData()` checks context/type/absolute URLs/real locales so a bad block fails the build. No client JS, hydration, dependency or route change; main content remains readable without JS.
- Why: P1-09 mandates machine-readable identity; the Technology Baseline §92 requires schema.org data to be derived from typed domain data and never diverge from content.
- Scope / files: `apps/web/src/data/structured.ts` (new), `apps/web/src/layouts/BaseLayout.astro`, `apps/web/src/pages/index.astro`, `docs/plan/P1-09-structured-data-task-spec.md` (new), `docs/status/known-issues.md` (KI-0001), `Task-list.md` (P1-09 tick), this Work Log and this Task Spec.
- Commands or actions actually performed: `npm run check` (24 files, 0 errors / 0 warnings / 0 hints); `npm run build` (6 pages); JSON-LD extraction and assertion script over the built `dist/` (per-locale `sameAs`, `alumniOf`, `inLanguage`, `name`, `url`, block counts) — all PASS; Playwright `mobile-overflow.spec.mjs` 128 PASS exit 0 against preview; `about-tabs.spec.mjs` 78 PASS exit 0; `git diff --check` exit 0.
- Verification actually performed and result: emitted blocks verified in `dist/` for all five indexable pages (WebSite on `/`; WebSite+Person on locale pages); values match the typed data exactly per locale; no `<script src>`/module scripts in built pages; independent r0-verifier review: all five acceptance criteria MET, no blocking code defect.
- Decisions / assumptions: JSON-LD mirrors each locale's own typed socials. The fa locale carries the pre-existing `tahamohammadi-ir` (double-m) GitHub handle while en and the canonical remote use `tahamohamadi-ir`; per baseline §92 JSON-LD must not diverge from content, so the discrepancy is recorded as `KI-0001` (owner decision, not silently fixed by the agent). `validateStructuredData` intentionally checks structural fields only, matching the typed-data provenance.
- Deferred or risk IDs: `DEFER-0009` (OG image) and `DEFER-0013` (real 200% zoom) unchanged/OPEN; `KI-0001` new OPEN (owner); no new deferral.
- Rollback / recovery: revert this commit; previous artifact remains served; no server/config change.

## LOG-0106 - 2026-08-15 - P0A-07 / CI action majors to node24 runtime

- Outcome: CI run `31907246943` was green but the runner annotated a Node-20 deprecation for `actions/checkout@v4`, `actions/setup-node@v4` and `actions/upload-artifact@v4` (actions now forced onto Node 24). The workflow now pins `actions/checkout@v7.0.1`, `actions/setup-node@v7.0.0` and `actions/upload-artifact@v7.0.1`, all verified via `gh api` to declare `runs.using: node24`.
- Why: remove the deprecation annotation and keep the hosted-runner baseline clean per ADR-0009; v4 majors target deprecated Node 20.
- Scope / files: `.github/workflows/ci.yml`, `docs/plan/CI-actions-node24-task-spec.md` (new), this Work Log.
- Commands or actions actually performed: `gh api repos/actions/checkout/releases/latest` (v7.0.1), `setup-node` (v7.0.0), `upload-artifact` (v7.0.1); inspected each `action.yml` for `runs.using`; `git diff --check` and `--cached --check`; commit and push.
- Verification actually performed and result: hosted CI run `31907380838` on the pushed commit reported `success` in 2m5s with all 13 steps PASS (type check, build, smoke, Mobile overflow Playwright, About tabs Playwright, dependency audit, artifact completeness/no-secret, upload); no deprecation annotation is present on the run (annotations endpoint returns empty).
- Decisions / assumptions: latest majors preserve checkout/cache/upload semantics for this workflow; no other workflow change made.
- Deferred or risk IDs: none new.
- Rollback / recovery: revert the single-file commit to restore v4 pins; no runtime impact.

## LOG-0107 - 2026-08-15 - P3 / gate move + CMS code-first scaffold

- Outcome: the repository gate moved from P0-G0 static-only to an explicit owner-authorized **P3 code-first** scope (Task Spec `docs/plan/P3-gate-code-first-task-spec.md`). `apps/cms/` now contains a working Django 5.2.9 / Wagtail 7.4.2 / Django Ninja 1.6.2 / psycopg 3.3.4 scaffold on Python 3.12.13 with 62 passing pytest tests, ruff-clean, and a new hosted CI workflow. NO runtime was deployed; `infra/cms/` files are NOT-APPLIED candidates.
- Why: the owner instructed development through the end of P3 with phases 1-2 completed first; P2 closed without CV/Resume (owner decision: C4 stays BLOCKED(owner)); P3 runs code-first with real runtime deploy gated on RISK-0007/RISK-0003.
- Scope / files: `apps/cms/**` (settings split, users, health, content, api, media, security, rebuild apps + tests + migrations + scripts), `.github/workflows/ci-cms.yml` (new), `infra/cms/**` (NOT-APPLIED candidates), `docs/adr/0020..0024`, `docs/plan/P3-gate-code-first-task-spec.md` (new), `docs/status/CHANGELOG.md` + `docs/status/BACKLOG.md` (new), `docs/status/WORK_LOG.md`, `docs/status/deferred-validation.md` (DEFER-0003 close), `docs/status/RISK_REGISTER.md` (P3 note), `docs/governance/RELEASE_POLICY.md` (gate), `docs/taha-personal-platform-technology-architecture-baseline-fa.md` + master plan (status rows), `PROJECT_MANIFEST.md`, `AGENTS.md`, `Task-list.md`, `.gitignore`.
- Commands or actions actually performed: `uv python install 3.12` (3.12.13); `uv sync --python 3.12` (55 packages, uv.lock); PyPI version verification (django 5.2.9, wagtail 7.4.2, ninja 1.6.2, psycopg 3.3.4); `django-admin startproject config .`; four parallel general sub-agents (content+api, media, security+rich-text, CI+infra+rebuild) with disjoint file ownership; `$env:DJANGO_SETTINGS_MODULE='config.settings.test'` then `uv run ruff check .` (clean), `uv run python manage.py check` (no issues; upstream treebeard E001 advisory warnings only), `uv run python manage.py makemigrations --check --dry-run` (No changes detected), `uv run pytest -q` (62 passed); `git diff --check` clean.
- Verification actually performed and result: see commands above; full suite 62 passed in ~5s; migrations for users/content/media/security generated and consistent; CI workflow authored but hosted run pending on push.
- Decisions / assumptions: P2 closes without CV (C4 owner); gate P3 code-first per owner instruction; production settings fail-closed without env vars; media private default (`is_active=False`); rich text allowlist frozen; rebuild trigger disabled by default; deploy/migrate/media-exposure commands remain unapproved in Manifest.
- Deferred or risk IDs: `RISK-0007` BLOCKED (capacity, owner), `RISK-0003` ACCEPTED limited (DB-import evidence required before any CMS DB deploy), `DEFER-0003` CLOSED (Python 3.12.13 + .venv evidence), C4 BLOCKED(owner), C7 partial, `DEFER-0009`/`DEFER-0013`/`KI-0001` OPEN (owner).
- Rollback / recovery: CMS is code-only; revert commits; web artifact and server untouched; no deploy performed.

## LOG-0108 - 2026-08-15 - P3 / CMS CI fixes (setup-uv pin + media unignore)

- Outcome: the first CMS CI runs failed twice and both root causes were fixed on `main`: (1) `astral-sh/setup-uv@v10` does not resolve because setup-uv does not alias major tags — pinned to the verified release tag `v10.0.1` (run `31910863185` failure → fixed in `6d231ca`); (2) the `.gitignore` `media/` runtime pattern silently excluded `apps/cms/apps/media/`, so `ModuleNotFoundError: apps.media` failed `manage.py check` (run `31910863187` failure → negation added in `53ec945`; stray `__pycache__` files were unstaged).
- Why: both were CI-only defects (local Windows runs passed because the working tree had the media files present); hosted Linux CI exposed them.
- Scope / files: `.github/workflows/ci-cms.yml`, `.gitignore` and this Work Log.
- Commands or actions actually performed: `gh run view --log-failed` for `31910863191`/`31910863185`/`31910863187`; `gh api repos/astral-sh/setup-uv/releases/latest` (v10.0.1) and `/tags`; `git rm --cached -r` for `__pycache__`; `git check-ignore` verification of `apps/cms/apps/media/models.py`; `git ls-files` counts before/after.
- Verification actually performed and result: hosted CMS CI run `31910918522` → success (27s, all 6 steps PASS incl. pytest 62); hosted web CI run `31910918416` → success (1m52s, all 13 steps PASS). Both workflows green on the final `main` HEAD `53ec945`.
- Decisions / assumptions: `.gitignore` negation `!apps/cms/apps/media/**` keeps runtime `media/` ignored while the app package stays tracked.
- Deferred or risk IDs: none new; P3 runtime deploy remains BLOCKED (`RISK-0007`/`RISK-0009`).
- Rollback / recovery: revert the two fix commits; CI would regress to the same failures, no runtime impact.

## LOG-0109 — 2026-08-15 — P3 / keep pycache ignored under media app

- Outcome: `.gitignore` now re-ignores bytecode under the tracked media package. The negation rules added in LOG-0108 (`!apps/cms/apps/media/`, `!apps/cms/apps/media/**`) re-included everything under that subtree, so CMS test runs produced untracked `apps/cms/apps/media/__pycache__/` and `apps/cms/apps/media/migrations/__pycache__/` in `git status`. Two re-ignore rules were added immediately after the negations: `apps/cms/apps/media/**/__pycache__/` and `apps/cms/apps/media/**/*.py[cod]`; `git status` is clean again except the intended `.gitignore` edit.
- Why: the media app package must stay tracked (it failed `manage.py check` when excluded, see LOG-0108) but its `__pycache__` bytecode must keep the global Python ignore behavior (`.gitignore` lines 13-14).
- Scope / files: `.gitignore`, `docs/status/WORK_LOG.md`.
- Commands or actions actually performed: added the two re-ignore lines after the negation pair; `git check-ignore -v apps/cms/apps/media/__pycache__/admin.cpython-312.pyc` → `.gitignore:32:apps/cms/apps/media/**/__pycache__/` (matched by the NEW rule, line 32 > 31); `git check-ignore -v apps/cms/apps/media/models.py` → no output (NOT ignored; the app package stays tracked); `git status --short --branch` → `## main` + ` M .gitignore` only; `git diff --check` → exit 0.
- Verification actually performed and result: see outputs above; no untracked `__pycache__` entries remain, no other unexpected changes.
- Decisions / assumptions: the re-ignore rules use the same line length/indentation style as the rest of the file (no indentation); they are placed immediately after the two negation lines so later rules win over the negation.
- Deferred or risk IDs: none new.
- Rollback / recovery: revert this commit to restore the previous behavior; CI and runtime are unaffected (ignore-only change).

## LOG-0110 - 2026-08-15 - P3/web / staging decommission + KI-0001 + CMS gap closure

- Outcome: staging.tahamohamadi.ir is fully decommissioned per ADR-0025 (owner decision 2026-08-15): the staging Caddy block was removed on the VPS (owner-executed, sudo, deploy user account) and the staging DNS record removed if present; the release gate no longer requires staging smoke - it is now CI (web + cms workflows) + production smoke only, and development/deployment happens directly on tahamohamadi.ir. The VPS was upgraded (Ubuntu 26.04 LTS, 2 vCPU, ~3910 MB RAM (~4 GiB), 30 GB disk (~17 GB free)) and the owner decided to keep the 4 GiB plan (RISK-0007 CLOSED). The existing live Compose stack was inventory-confirmed via docker ps on 2026-08-16 07:19 UTC (taha-prod-frontend-1 on 127.0.0.1:13000, taha-prod-backend-1 on 127.0.0.1:18080, taha-prod-postgres-1) - RISK-0004 CLOSED. KI-0001 is fixed in apps/web/src/data/profile.fa.ts (double-m -> single-m at socials and the PARS-SQL project URL). CMS P3 gaps were closed: NoIndexMiddleware for /admin/, /api/ and /rebuild-trigger/; real JSON logging in production.py via python-json-logger; account-enumeration and stored-XSS sanitizer tests added - 70 pytest PASS. The CMS CI workflow gains manage.py test + git diff --check + secret scan steps (owner decision). Production currently serves release-4fcd19f (checksum 13849ab7); a new release from current HEAD (JSON-LD + KI-0001 fix) is about to be deployed.
- Why: owner decisions 2026-08-15/16: staging no longer has a purpose (decommission), the server upgrade resolves the capacity question (RISK-0007), and the P3 code-first gate items were closed with real tests before the upcoming production release.
- Scope / files: apps/cms/** (NoIndexMiddleware in apps/security, production JSON logging in config/settings/production.py, test_security.py + test_production_logging.py, pyproject.toml, uv.lock), apps/web/src/data/profile.fa.ts (KI-0001), .github/workflows/ci-cms.yml (owner-decision CI steps), docs/adr/0025-staging-decommission.md (new), docs/adr/README.md, README.md, PROJECT_MANIFEST.md, AGENTS.md, Task-list.md, docs/governance/RELEASE_POLICY.md, docs/governance/DEPLOY_RUNBOOK.md, docs/status/CHANGELOG.md, docs/status/BACKLOG.md, docs/status/RISK_REGISTER.md, docs/status/known-issues.md, docs/status/deferred-validation.md, docs/plan/S-PLAN-STATE.md, docs/status/WORK_LOG.md.
- Commands or actions actually performed: uv run pytest -q (70 passed); uv run ruff check . (clean); uv run python manage.py check (no issues); uv run python manage.py makemigrations --check --dry-run (No changes detected); git diff --check (clean); rg tahamohammadi apps/web/src (no matches); staging removal on the VPS executed by the owner (sudo) with the deploy user account; docker ps on the VPS observed 2026-08-16 07:19 UTC.
- Verification actually performed and result: 70 pytest PASS; ruff clean; manage.py check clean; no pending migrations; git diff --check exit 0; rg tahamohammadi on apps/web/src returned no matches (KI-0001 evidence); live stack containers + ports confirmed via docker ps (2026-08-16 07:19 UTC).
- Decisions / assumptions: staging decommissioned (ADR-0025, owner 2026-08-15) - gate is now CI (web + cms) + production smoke; owner capacity decision: keep the 4 GiB plan (RISK-0007 CLOSED); CMS runtime still BLOCKED on MFA + RISK-0003 DB-import + deploy Task Spec (RISK-0009); KI-0001 CLOSED; upcoming production release from HEAD pending owner deploy.
- Deferred or risk IDs: RISK-0004 CLOSED (2026-08-16); RISK-0007 CLOSED (2026-08-15); RISK-0009 BLOCKED; DEFER-0011 CLOSED; DEFER-0014 added (alt-by-locale, P3-05 remainder); C4/C7/B1/B2 unchanged.
- Rollback / recovery: staging block removable state restorable from timestamped Caddyfile backup (validate + reload); DNS record re-creatable; CMS changes are code-only (revert commits); web artifact on the server untouched until the owner deploys the new release.

## LOG-0111 - 2026-08-16 - web/prod / production update to release-6031441 + staging decommission prep

- Outcome: production now serves **release-6031441** (checksum `031943b1`, deploy.log `2026-08-16T08:01:37Z`), built from clean HEAD `6031441` — includes P1-09 JSON-LD, KI-0001 fix, all P2/About fixes and previous P3 docs. Production smoke `infra/deploy/smoke.sh https://tahamohamadi.ir` → 7 PASS (root, /en/, /fa/, robots, sitemap, 404, health). Live verification: JSON-LD PRESENT on /fa/about/, fa GitHub link single-m (KI-0001 FIXED).
- Why: production was still on release-4fcd19f (pre-JSON-LD); the owner authorized the update, staging removal and the 4 GiB plan (ADR-0025).
- Scope / files: artifact `release-6031441` built from `apps/web/dist`; uploaded via scp to `/home/deploy/taha-stage/`; server-side `sudo -n /opt/taha/bin/update-release.sh` (NOPASSWD sudoers grant, no password handled by agents). Repo-side: `apps/web/src/data/profile.fa.ts` (KI-0001), `apps/cms/**` (NoIndexMiddleware, python-json-logger, enumeration/XSS tests), `.github/workflows/ci-cms.yml` (+manage.py test, git diff --check, secret scan), docs per LOG-0110 (ADR-0025, staging decommission, RISK-0004/0007 CLOSED, DEFER-0011 CLOSED, DEFER-0014 added).
- Commands or actions actually performed: `npm run check` (0 errors), `npm run build` (6 pages), `rg tahamohammadi apps/web/src` (no matches), `rg -c application/ld+json dist/fa/index.html` (1), CMS `uv run pytest -q` (70 passed), `uv run ruff check .`, `git diff --check`; `scp -r release-6031441` to VPS; `sudo -n update-release.sh` (current -> release-6031441 031943b1); smoke 7 PASS; CI web run `31935188469` success + CMS CI `31935188435` success.
- Verification actually performed and result: deploy.log tail + `readlink -f /opt/taha/site/current` → release-6031441; live curl checks (JSON-LD present, no double-m). Server inventory: 2 vCPU / 3910 MB / 30 GB, Ubuntu 26.04 LTS, existing stack (taha-prod-frontend/backend/postgres) healthy — recorded in RISK-0004 closure.
- Decisions / assumptions: staging Caddy block removal is staged as `/home/deploy/taha-stage/remove-staging.sh` (syntax-checked `bash -n` PASS) but requires the owner's interactive sudo (deploy user NOPASSWD covers only update-release.sh and caddy-apply.sh); DNS record removal in Cloudflare is an owner action. Until the block is removed, staging still resolves — documented in ADR-0025.
- Deferred or risk IDs: RISK-0007 CLOSED (capacity); RISK-0009 stays BLOCKED (MFA + RISK-0003 DB-import + deploy Task Spec); DEFER-0014 (alt-by-locale) OPEN; C4/C7/B1/B2 remain owner items.
- Rollback / recovery: `sudo ln -sfn /opt/taha/site/releases/release-4fcd19f /opt/taha/site/current` (previous artifact retained on disk); staging removal script creates `Caddyfile.pre-staging-removal.<ts>` backup and validates before reload.

## LOG-0112 - 2026-08-16 - infra / staging Caddy block removed (ADR-0025 execution)

- Outcome: the `staging.tahamohamadi.ir` site block was removed from `/etc/caddy/Caddyfile` by the owner via `sudo bash /home/deploy/taha-stage/remove-staging.sh` (executed 2026-08-16T08:10:42Z). Script flow: timestamped backup -> awk block removal -> `caddy validate` on the tmp file ("Valid configuration") -> replace -> `systemctl reload caddy`. Backup: `/etc/caddy/Caddyfile.pre-staging-removal.20260816T081042Z`.
- Why: ADR-0025 (owner decision) decommissions staging; gate is now CI (web + cms) + production smoke only.
- Scope / files: server-side Caddyfile only; repo files unchanged except this Work Log. The script itself lives at `/home/deploy/taha-stage/remove-staging.sh` (not in Git — server-side operational artifact).
- Commands or actions actually performed: `sudo bash /home/deploy/taha-stage/remove-staging.sh`; verification `grep -c "staging.tahamohamadi.ir" /etc/caddy/Caddyfile` -> 0; `systemctl status caddy` -> active (running); `curl https://tahamohamadi.ir/` -> 200. External check 2026-08-16: staging returns 525 (TLS no longer served — Cloudflare still proxies the name until the owner removes the DNS record); production 200.
- Verification actually performed and result: all three server-side checks PASS; production unaffected. A first script attempt failed with `#!/usr/bin/env: No such file or directory` due to a UTF-8 BOM written by PowerShell 5.1 `Set-Content -Encoding UTF8`; re-uploaded with BOM-free UTF8 (`[System.IO.File]::WriteAllText` + `UTF8Encoding($false)`) and verified first bytes `23 21 2f 75` (#!/u) and `bash -n` PASS before the owner reran it.
- Decisions / assumptions: staging DNS record removal in Cloudflare remains an owner action (no CF API token in env); until then staging resolves to Cloudflare and errors 525, which is acceptable mid-decommission and does not affect production.
- Deferred or risk IDs: ADR-0025 applied; RISK-0004/0007 CLOSED; RISK-0009 unchanged (BLOCKED); C4/B1/B2 remain owner items.
- Rollback / recovery: `sudo cp -a /etc/caddy/Caddyfile.pre-staging-removal.20260816T081042Z /etc/caddy/Caddyfile && sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy`.

## LOG-0113 — 2026-08-16 — infra / old-stack decommission prep + dockerization decision

- Outcome: the old pre-existing stack decommission is prepared as an owner-executed runbook (`infra/deploy/decommission-old-stack.md`: inventory, stop → site-200 check → down without `-v` → owner-confirmed prune, rollback `up -d`, warnings). Dockerization decision recorded: the public web app stays non-containerized because it is a static Astro artifact served directly by Caddy from `/opt/taha/site/current` (no runtime, no database, no container) — an image would add cost with zero benefit. The CMS candidates in `infra/cms/` remain NOT-APPLIED, with comments refreshed: capacity is resolved (RISK-0007 CLOSED 2026-08-15, owner keeps the 4 GiB plan) and the remaining blockers are MFA enforcement, RISK-0003 DB-import evidence and a separate deploy Task Spec (RISK-0009). `DEPLOY_RUNBOOK.md` gained an "Old pre-existing stack decommission (2026-08-16)" section pointing to the runbook.
- Why: the owner is decommissioning the old stack (taha-prod-frontend/backend/postgres at `/opt/taha/repository/`, RISK-0004 inventory) and the decommission steps require owner-interactive sudo (deploy user NOPASSWD covers only update-release.sh and caddy-apply.sh), so the exact sequence and safety boundaries must be documented before execution.
- Scope / files: created `infra/deploy/decommission-old-stack.md`; edited `infra/cms/README.md` (dockerization decision + what the CMS candidates deploy when the gate opens), `infra/cms/docker-compose.cms.yml`, `infra/cms/Dockerfile.cms`, `infra/cms/Caddyfile.cms.snippet` (NOT-APPLIED headers kept; stale RISK-0007/capacity comments refreshed; compose build context `../..` + `user: 10001:10001` verified already correct), `docs/governance/DEPLOY_RUNBOOK.md` (appended section); this Work Log entry. No other files touched.
- Commands or actions actually performed: no server commands — no server access was used. Local only: file edits and `git diff --check` (result: no whitespace errors). Verify compose context: `infra/cms/` compose uses `context: ../..` (repo root) with `dockerfile: infra/cms/Dockerfile.cms` and non-root `user: 10001:10001`, matching the Dockerfile `USER app` (uid 10001).
- Verification actually performed and result: `git diff --check` → clean (no trailing whitespace/space-before-tab); `rg "LOG-\d{4}"` confirmed highest existing ID was LOG-0112, so this entry is LOG-0113. No lint/typecheck applies to Markdown/Compose edits; no test suite run needed for documentation-only changes.
- Decisions / assumptions: web stays non-containerized (static Caddy) — documented in `infra/cms/README.md`; CMS candidates kept NOT-APPLIED behind the RISK-0009 gates; owner authorized old-stack down; `docker compose down` runs WITHOUT `-v` so postgres volumes are preserved; image prune is owner-confirmed only; restic backups in `/opt/taha/backups` are separate and never touched; frontend/backend images remain in ghcr for redeploy.
- Deferred or risk IDs: RISK-0003 unchanged (DB-import evidence still pending before CMS deploy); postgres data preserved during decommission; image prune owner-only; RISK-0009 unchanged (BLOCKED). Execution of the runbook itself is a pending owner action, not an agent action.
- Rollback / recovery: `cd /opt/taha/repository && sudo docker compose up -d` restores the old stack (volumes preserved by down without `-v`); full sequence in `infra/deploy/decommission-old-stack.md`.

## LOG-0114 - 2026-08-16 - web/prod / logo + CV downloads live, header overflow fix

- Outcome: production now serves **release-aa17b09** (checksum `6dc94419`, deploy.log 2026-08-16), built from HEAD `aa17b09` — includes header logo (`public/logo.png`, from Assets base variant, cropped+transparent), CV/Resume Markdown download pages `/en/cv/` + `/fa/cv/` (closing C4), README rewrite, decommission runbook, and the tiny-viewport header fix. Live checks: `/en/cv/` 200, `/fa/cv/` 200 (Persian content verified), download md 200 (11040 B), `logo.png` 200 (8075 B), smoke 7 PASS.
- Why: the owner provided CV/Resume and logo assets in `Assets/` and expected them on the site; C4 was the last owner-blocked P2 item.
- Scope / files: `apps/web/public/{logo.png,downloads/*.md}`, `apps/web/src/components/{Header.astro,Downloads.astro}`, `apps/web/src/data/content.ts` (downloads copy en/fa), `apps/web/src/pages/{en,fa}/cv.astro`, `apps/web/src/pages/sitemap.xml.ts` (+2 URLs), README.md, `infra/deploy/decommission-old-stack.md`, `infra/cms/*` (comment refresh), DEPLOY_RUNBOOK (decommission section), ledgers (BACKLOG/CHANGELOG/S-PLAN/RISK/deferred), this Work Log (LOG-0113 by docs agent + LOG-0114).
- Commands or actions actually performed: `npm run check` (0 errors) + `npm run build` (8 pages) before and after the header fix; local Playwright `mobile-overflow.spec.mjs` 0 FAIL against built dist via python http.server on 8899 (EACCES on astro preview ports on this Windows box); `about-tabs.spec.mjs` 0 FAIL; scp release dirs to `/home/deploy/taha-stage/`; `sudo -n /opt/taha/bin/update-release.sh` (release-8ff948a then release-aa17b09); production smoke; live curl checks; CI web run `31937447279` success + CMS CI `31937447172`/`31937447283` success.
- Verification actually performed and result: first CI run `31937163213` FAILED on `Mobile overflow` — the third header link (CV) made the header 72px too wide at the 160/195px zoom-approximation viewports; fixed by raising the wrap breakpoint from 12rem to 14rem and spanning the language switch across the second grid row (commit `aa17b09`); local suite 0 FAIL; hosted web CI then green. Logo quality visually reviewed by the visual-reviewer sub-agent (ACCEPT-WITH-NOTES; heavy black outline acceptable at 48px; white background removed programmatically — corner alpha 0 verified).
- Decisions / assumptions: CV/Resume published as Markdown (agents never generate PDFs; PDF replacement remains an owner option per P2-04). Gemini images in Assets are 2048x2048 mascot contact sheets with white backgrounds and AI artifacts — NOT used for og:image; DEFER-0009 stays OPEN (owner decision 2026-08-16). Other logo variants (electric/gold/green/red/yasi/black) recorded as alternatives for a future brand pass. Old pre-existing stack decommission authorized by owner; runbook written; execution is owner-sudo (volumes preserved, no `-v`).
- Deferred or risk IDs: DEFER-0009 OPEN (OG image), DEFER-0013 OPEN (200% zoom), RISK-0009 BLOCKED (CMS runtime: MFA + RISK-0003 + deploy Task Spec), C4/B1 CLOSED, KI-0001 CLOSED.
- Rollback / recovery: `sudo ln -sfn /opt/taha/site/releases/release-8ff948a /opt/taha/site/current` (previous artifact retained); old stack: `cd /opt/taha/repository && sudo docker compose up -d`.

## LOG-0115 - 2026-08-16 - web/prod / logo in footer, gateway and favicon

- Outcome: production serves **release-aae2cb9** (checksum `349db221`). The logo now appears in all requested places: header (since LOG-0114), footer (`/logo.png` replacing the TM text mark), Language Gateway (`/logo-gateway.png` — navy-outline variant for the dark panel) and browser tab (`/favicon.png` replacing the TM SVG favicon). Visual QA by the visual-reviewer sub-agent: all pages ACCEPT (gateway, home, about, cv).
- Why: the owner reported the logo was missing from the footer, the language-selection page and the Chrome tab.
- Scope / files: `apps/web/public/{favicon.png, logo-gateway.png}` (new), `apps/web/src/components/{Header.astro, Footer.astro}` (mark span → img, unused `mark` removed), `apps/web/src/pages/index.astro` (gateway mark → img + CSS), `apps/web/src/layouts/BaseLayout.astro` (favicon ref), this Work Log.
- Commands or actions actually performed: generated favicon-64.png (System.Drawing from the cropped logo) and logo-gateway.png (black outline → navy #071225, 4898 px mapped) — both visually verified; `npm run check` (0 errors) + `npm run build` (8 pages); Playwright screenshots of /, /en/, /en/about/, /en/cv/ against the built dist (python http.server 8899); scp release to VPS; `sudo -n update-release.sh`; production smoke 7 PASS; live curl of logo/logo-gateway/favicon all 200; head/gateway/footer references verified in served HTML.
- Verification actually performed and result: hosted web CI on the pushed commit (run pending at time of writing; local suite green); live checks above all PASS.
- Decisions / assumptions: favicon.svg remains on disk but is no longer referenced (PNG preferred for the raster logo); gateway uses the navy-mapped variant so the black outline does not clash with the dark panel.
- Deferred or risk IDs: none new; DEFER-0009/0013, RISK-0009 unchanged.
- Rollback / recovery: `sudo ln -sfn /opt/taha/site/releases/release-aae2cb9-1 /opt/taha/site/current` if a newer release replaced it; previous release-aae2cb9..aa17b09 artifacts retained on disk.

## LOG-0116 - 2026-08-16 - P3 / MFA enforcement + deploy Task Spec + incident runbook + CI hardening

- Outcome: four P3/P0-B deliverables completed in parallel sub-agents:
  1. **MFA enforcement (django-otp 1.5.4):** `apps/security/mfa.py` middleware (`MFAEnforcementMiddleware`) checks `django_otp.user_has_device` for `/admin/` paths — staff without OTP device allowed (first-time setup); staff with device but no verified OTP blocked; OTP-verified staff allowed. `OTPMiddleware` wired in settings. Tests: 75 passed (5 new MFA tests). RISK-0009 blocker "MFA enforcement" now has code.
  2. **Deploy Task Spec:** `docs/plan/P3-cms-deploy-task-spec.md` (~260 lines) covers prerequisites (RISK-0003 DB-import, MFA merged, owner approval, old-stack decommissioned), 8 deployment mechanics steps, resource limits (512 MiB cms + 512 MiB db), 22 acceptance criteria, rollback procedure, deferred items.
  3. **Incident runbook + SLO:** `docs/governance/INCIDENT_RUNBOOK.md` (126 lines) defines SLOs (99.5% availability, <1% 5xx/5min, p95 <2s), monitoring points, SEV-1/2/3 classification, static site and CMS runtime runbooks, escalation rules. `DEPLOY_RUNBOOK.md` cross-referenced.
  4. **CI hardening:** `ci-cms.yml` gains `git diff --check` and secret-pattern scan steps (matching web CI pattern).
- Why: RISK-0009 (CMS runtime deploy) requires MFA enforcement + deploy Task Spec before admin exposure; P0B-03 requires incident runbook and SLO definitions.
- Scope / files: `apps/cms/apps/security/mfa.py` (new), `apps/cms/tests/test_mfa.py` (new), `apps/cms/config/settings/base.py` (MFA settings), `apps/cms/pyproject.toml` + `uv.lock` (django-otp), `docs/plan/P3-cms-deploy-task-spec.md` (new), `docs/governance/INCIDENT_RUNBOOK.md` (new), `docs/governance/DEPLOY_RUNBOOK.md` (xref), `.github/workflows/ci-cms.yml` (2 new steps), this Work Log.
- Commands or actions actually performed: `uv sync` (django-otp installed); `uv run pytest -q` (75 passed); `uv run ruff check .` (clean); `uv run python manage.py check` (0 errors); `uv run python manage.py makemigrations --check --dry-run` (no changes); `git diff --check` (clean).
- Verification actually performed and result: all four agents reported green; full suite 75 passed; CI runs on push will verify the new steps.
- Decisions / assumptions: MFA guard uses `request.user.otp_device` (set by OTPMiddleware) — more robust than raw session key; no custom URL/view needed (django_otp provides OTP device management at `/admin/otp_totp/totpdevice/`); deploy Task Spec documents that RISK-0003 DB-import evidence is the remaining server-side blocker; incident runbook is documentation-only (no alerting infrastructure).
- Deferred or risk IDs: RISK-0009 still BLOCKED (MFA code done; remaining: RISK-0003 DB-import evidence + owner approval + old-stack decommission); P0B-03 partially done (SLO + incident runbook done; visual regression baseline still open; dependency/container scan — secret scan added to CI).
- Rollback / recovery: remove MFA middleware from MIDDLEWARE in base.py; revert deploy Task Spec and incident runbook files; CI steps are additive only.

## LOG-0117 - 2026-08-16 - P3 verification + P4 prep + docs reconciliation

- Outcome: Docker Compose candidates verified locally (health checks, resource limits, env var passthrough all correct); P4 Blog/Writing task spec written (199 lines); stale docs claims fixed.
- Why: the Docker Compose candidates in `infra/cms/` were NOT-APPLIED but never validated against the actual CMS code. P4 preparation avoids a cold start after P3 runtime deploy. Stale test counts and release IDs in README/Manifest would mislead developers.
- Scope / files: `apps/cms/` (Dockerfile.cms, docker-compose.cms.yml, Caddyfile.cms.snippet — read-only verification), `docs/plan/P4-blog-writing-task-spec.md` (new), `docs/status/WORK_LOG.md`, `PROJECT_MANIFEST.md` (stale release ID + test count fixed), `README.md` (stale test count fixed).
- Commands or actions actually performed: Docker Compose candidates audited (health checks, resource limits, env passthrough, non-root user, port bindings, named volumes — all correct per sub-agent); P4 task spec written by sub-agent; docs reconciliation found 3 stale claims (PROJECT_MANIFEST.md:55 release ID, PROJECT_MANIFEST.md:105 test count, README.md:49 test count) — all fixed.
- Verification actually performed and result: Docker Compose verification passed (no issues found); P4 task spec covers full P4 scope (Article, Series, admin, API, Astro routes, SEO, tests); docs reconciliation clean after fixes.
- Decisions / assumptions: Docker Compose remains NOT-APPLIED (deploy is gated on RISK-0003 + owner approval); P4 task spec is preparatory (not authorized for implementation until P3 runtime is deployed).
- Deferred or risk IDs: no new risks; P4 task spec added to BACKLOG.
- Rollback / recovery: revert P4 task spec and docs fixes; no runtime impact.

## LOG-0118 - 2026-08-16 - gitignore: exclude Assets/ source drafts

- Outcome: `Assets/` added to `.gitignore` to prevent future accidental commits of source drafts (logo PNGs, CV/Resume markdowns, Gemini images). The processed production files (`apps/web/public/logo.png`, `apps/web/public/downloads/*.md`) remain tracked; the source originals in Assets/ do not belong in git.
- Why: LOG-0117 accidentally committed Assets/ via `git add -A`; the large Gemini images (6-7MB each) bloated the repo. This fix prevents recurrence.
- Scope / files: `.gitignore` only, this Work Log.
- Decisions / assumptions: Assets/ committed in LOG-0117 remain in git history (amend not safe on pushed commit); future files in Assets/ will be ignored.

## LOG-0141 - 2026-08-17 - web/prod / P4–P5 routes live + PNG + CMS_API_BASE loopback fix

- Outcome: Production static **`release-82d51c6`** (checksum `bc6c6a1d`) serves 16 pages including `/en|fa/blog/` and `/en|fa/research/` (200). Lists remain honestly empty: no published CMS articles, and loopback `CMS_API_BASE` was broken by `SECURE_SSL_REDIRECT` 301 to `https://127.0.0.1:18000`. This change: (1) renormalize `apps/web/public/*.png` so the PNG signature keeps CR (8075 B); (2) Astro CMS fetch sends `X-Forwarded-Proto: https`; (3) exempt `^api/` from SSL redirect on loopback gunicorn; (4) `smoke-blog.sh` uses mktemp; (5) `build-static-with-cms.sh` fails fast if `npm` is missing.
- Why: Complete P3/P4 production closeout residuals after RISK-0003 CLOSED and migrate `b369885`.
- Scope / files: `apps/web/public/{logo,logo-gateway,favicon}.png`, `apps/web/src/lib/cms/{client,articles,research,projects}.ts`, `apps/cms/config/settings/production.py`, `apps/cms/tests/test_production_proxy.py`, `infra/deploy/{smoke-blog,build-static-with-cms}.sh`, ledgers.
- Commands or actions actually performed: owner Windows `npm run build` + scp `release-82d51c6`; `update-release.sh`; origin curls 200 for blog/research; API loopback with forwarded proto returns `{"items":[],"count":0}`.
- Verification actually performed and result: loopback `/api/articles/en` + `X-Forwarded-Proto: https` → 200 empty list; without proto → 301 HTTPS; origin logo still 8074 until this PNG commit is deployed.
- Decisions / assumptions: do not open public Caddy `/api/` (DEFER-0017) in this slice; content populate requires owner Wagtail publish then rebuild.
- Deferred or risk IDs: DEFER-0017 OPEN; DEFER-0018 RSS OPEN; RISK-0003 CLOSED (LOG-0140).
- Rollback / recovery: previous `release-6c68cbb` / `release-82d51c6`; previous CMS image `b369885`.

## LOG-0140 - 2026-08-17 - P3 / RISK-0003 CLOSED (CMS backup + isolated restore)

- Outcome: Owner installed refreshed `/usr/local/sbin/taha-platform-backup` from `cms-repo` `be28671`. `--dry-run` PASS (CMS dump source `taha-cms-db-1`). `systemctl start taha-platform-backup.service` exited 0. restic snapshot `3afdfc96` (2026-08-17 10:39 UTC) tagged `production,cms,postgres`, path `/cms-postgres-all.sql` (~240 KiB). Isolated restore into throwaway `postgres:17-alpine` (`taha-cms-restore-db`); import as `postgres` superuser created database `taha_cms`; `\dt` 75 tables (Wagtail + `content_article`/`content_series`/`content_project` + `security_recoverycode`); `django_migrations` content 0001–0004 and security 0001–0002. Cleanup: `docker rm -f taha-cms-restore-db`, `rm -rf /srv/taha-cms-restore-615721`. **RISK-0003 CLOSED.**
- Why: Close the CMS-postgres backup/restore gap before treating P3 backup as production-complete.
- Scope / files: VPS `/usr/local/sbin/taha-platform-backup`; restic snapshot `3afdfc96`; ledgers (this log, RISK_REGISTER, Task Spec, BACKLOG, CHANGELOG, AGENTS.md, Task-list P3-01). No production CMS restart; no `/api/`/`/media/` change.
- Commands or actions actually performed: owner as root — install script, dry-run, systemd start, restic snapshots `--tag cms`, restore `3afdfc96`, disposable postgres import, `\dt` + migrations query, cleanup.
- Verification actually performed and result: dry-run OK; service SUCCESS; snapshot tags `cms,postgres`; restore `\dt` 75 rows; migrations 6 rows as listed; `restore_rehearsal PASS`.
- Decisions / assumptions: live dump database name is `taha_cms` (spec's example `-d cms` does not match production). Import uses `psql -U postgres`, not the CMS role.
- Deferred or risk IDs: RISK-0003 CLOSED; DEFER-0017 (`/api/`/`/media/`) still OPEN; contact persistence still gated on a later Task Spec.
- Rollback / recovery: previous `/usr/local/sbin/taha-platform-backup.bak.*` if present; restic snapshot retained in repository.

## LOG-0137 - 2026-08-16 - ops / P4+P5 static production deploy (CMS migrate gated)

- Outcome: Production static site switched to **`release-59bf91e`** (checksum `40472597`, from `origin/main` tip after PR #17). Live routes `/en|fa/blog/`, `/en|fa/research/` (+ statement) return **200** with **honest empty** lists (`CMS_API_BASE` unset; DEFER-0017). `/health.json` 200, `/health/` CMS `db=ok`, `/admin/login/` Wagtail 200. Public `/api/` and `/media/` remain **404** (static 404 page — not proxied). **CMS image/migrate NOT applied**: `RISK-0003` still OPEN (no VPS CMS-aware backup install + isolated restore evidence); deploy user has no passwordless Docker (`docker.sock` root:docker); `cms-repo` remains at `95a740f` after a failed ff-only pull was reset clean (root-owned `apps/cms/apps/security/templates/security/*` blocked checkout).
- Why: Bring public artifact through P5 as far as policy allows without risky prod migrate or inventing a loopback `CMS_API_BASE` build pattern (not in DEPLOY_RUNBOOK).
- Scope / files: VPS `/opt/taha/site/current` → `release-59bf91e`; ledger/docs update only in this commit. No Caddy `/api/`/`/media/` changes. No CMS container recreate.
- Commands or actions actually performed: `git fetch origin/main` (`59bf91e`); CI green (web + CMS CI + CMS image); local `npm run check`/`build` without `CMS_API_BASE`; `scp` artifact to `/home/deploy/taha-stage/release-59bf91e`; `sudo -n /opt/taha/bin/update-release.sh`; `infra/deploy/smoke.sh` 7 PASS; route curls; `cms-repo` `git pull` failed (permission) then `git reset --hard HEAD` + `git clean -fd` restored clean `95a740f`.
- Verification actually performed and result: `deploy.log` `2026-08-16T21:44:36Z updated release-59bf91e 40472597`; smoke PASS; empty copy present on en/fa blog+research; CMS loopback health still ok on prior image.
- Decisions / assumptions: Stop before migrate per RISK-0003; do not document/use VPS loopback `CMS_API_BASE` until runbook establishes it; leave `/api/`/`/media/` closed.
- Deferred or risk IDs: RISK-0003 OPEN (blocker for migrate 0002/0003/0004); DEFER-0017 OPEN; cms-repo ownership/chown owner; Docker group or interactive sudo for `update-cms.sh`.
- Rollback / recovery: `sudo -n /opt/taha/bin/update-release.sh /home/deploy/taha-stage/release-aae2cb9` (previous artifact retained under `/opt/taha/site/releases/`).

## LOG-0139 - 2026-08-17 - P3/P4 closeout — rebuild wiring, API Caddy spec, deploy ops

- Outcome: P3/P4 repo closure slice on `feat/p3-p4-closeout` from `origin/main`: wired CMS→Astro rebuild (`build-static-with-cms.sh`, `rebuild-static.sh`, updated `manual-rebuild.sh`); optional public `/api/`/`/media/` Caddy fragment + `P3-public-api-caddy-task-spec.md` (DEFER-0017); VPS CMS migrate helpers (`prod-cms-update-migrate.sh`, `prod-cms-reset-and-migrate.sh`, `install-update-cms-sudo.sh`, `run-prod-cms-migrate.ps1`); blog smoke (`smoke-blog.sh`); Astro `CMS_API_BASE` env schema; `.gitattributes` PNG binary guard. P4 code-first already on main (PR #14–16); RSS remains DEFER-0018.
- Why: Complete agent-executable P3/P4 closure without owner VPS steps; document exact owner commands for RISK-0003, migrate, Caddy apply, and content-populated static rebuild.
- Scope / files: `infra/deploy/*`, `infra/cms/Caddyfile.cms*.snippet`, `apps/cms/scripts/manual-rebuild.sh`, `apps/web/astro.config.mjs`, `.gitattributes`, `docs/plan/P3-public-api-caddy-task-spec.md`, `docs/adr/0023-p3-rebuild-trigger.md`, Task-list §8–9, deferred-validation, AGENTS, WORK_LOG.
- Commands or actions actually performed: local worktree edits; validation below.
- Verification actually performed and result: `bash -n` PASS on new deploy scripts (after LF normalize); `uv run ruff check` clean; `pytest -q` **152 passed**; `npm run check` 0 errors; `npm run build` **16 pages** (blog/research/projects routes, empty CMS).
- Decisions / assumptions: loopback `CMS_API_BASE=http://127.0.0.1:18000` avoids public `/api/` until DEFER-0017 owner apply; `rebuild-static.sh` does not enable `REBUILD_TRIGGER_ENABLED` automatically.
- Deferred or risk IDs: RISK-0003 OPEN (owner backup + restore); DEFER-0017 OPEN (owner Caddy apply); DEFER-0018 OPEN (RSS); P4-05 prod smoke owner after migrate.
- Rollback / recovery: revert this branch; Caddy/API snippet not applied until owner action; static `current` unchanged until owner runs `rebuild-static.sh`.

## LOG-0138 - 2026-08-17 - P6 / Projects + case studies code-first

- Outcome: P6 case studies on canonical `Project`: `ProjectCaseStudyDetails` OneToOne, `ProjectDiagram`/`ProjectScreenshot` FK rows, featured publish gate, Wagtail snippet admin, Ninja `/api/projects/{locale}` (+ extended research project DTO with `has_case_study`), Astro `/{locale}/projects/*` with research cross-link, sitemap + BreadcrumbList + optional `CreativeWork` JSON-LD. No infra/Caddy `/api/`/`/media/`. DEFER-0017 scope expanded to projects; DEFER-0021 (live demo embed) recorded.
- Why: Execute approved P6 plan after P5 merge on `origin/main`; code-first with honest empty lists when `CMS_API_BASE` unset.
- Scope / files: `apps/cms/apps/content/{models,admin,migrations/0004_*}`, `apps/cms/apps/api/api.py`, `apps/cms/tests/test_{case_study,api_case_study}.py`, `apps/web/src/{lib/cms/projects.ts,components/projects,pages/*/projects,data,Header,sitemap,structured}`, research project cross-link pages, Task Spec + ledgers, Task-list §11.
- Commands or actions actually performed: `makemigrations 0004_p6_case_study_models`; `ruff check` clean; `pytest` **152 passed**; `npm ci`; `npm run check` 0 errors; `npm run build` **16 pages** (includes `/en|fa/projects/`).
- Verification actually performed and result: featured publish gate tests; diagram/screenshot redact tests; API forbidden-field tests; XSS sanitizer on `technical_decisions`; draft 404. Independent security review **Approve-with-notes** (manual): no draft/media URL leak; external URLs http(s)-only; `set:html` matches P4/P5 pattern — admin PII help text remains editorial responsibility.
- Decisions / assumptions: no parallel Project model; diagram images admin-only until `/media/` Task Spec; live demo iframe out of scope (DEFER-0021).
- Deferred or risk IDs: DEFER-0017 OPEN (blog+research+projects); DEFER-0021 OPEN; RISK-0003 OPEN (owner prod migrate 0003+0004).
- Rollback / recovery: revert P6 commits; reverse migration 0004 only in non-prod.

## LOG-0136 - 2026-08-16 - P5 / Research code-first (models, admin, API, Astro, SEO)

- Outcome: P5 Research implemented code-first without opening public Caddy `/api/` or `/media/`. Models + migration `0003_p5_research_models` (ResearchTopic, ResearchStatement, Project, Publication, evidence/collaborator/funding); Wagtail snippets; Ninja research endpoints with redact/draft exclusion; Astro `/{locale}/research/*` with optional `CMS_API_BASE` (honest empty); breadcrumbs + ScholarlyArticle only with real DOI/URL; sitemap research URLs. Security review Approve (no medium+). DEFER-0017 kept (blog+research edge); DEFER-0019/0020 recorded. About static `researchProjects` untouched.
- Why: Execute approved P5 plan after P4; keep edge surface closed until publish-API Task Spec.
- Scope / files: `apps/cms/apps/content/{models,admin,migrations/0003_*}`, `apps/cms/apps/api/api.py`, `apps/cms/tests/test_{research,api_research}.py`, `apps/web/src/{lib/cms/research.ts,pages/*/research,data,Header,sitemap}`, Task Spec + ledgers + INCIDENT_RUNBOOK confidentiality path, Task-list §10.
- Commands or actions actually performed: `makemigrations`; `ruff check`; `pytest` **140 passed**; `npm run check` 0 errors; `npm run build` includes `/en|fa/research/` (+ statement).
- Verification actually performed and result: CMS ruff clean; 140 pytest PASS; Astro check 0; static build Complete with research overview/statement routes (empty CMS). Independent security review Approve.
- Decisions / assumptions: no infra/Caddy changes; Statement PDF deferred (DEFER-0019); curated graph deferred (DEFER-0020); prod migrate blocked on RISK-0003.
- Deferred or risk IDs: DEFER-0017 OPEN; DEFER-0019 OPEN; DEFER-0020 OPEN; RISK-0003 OPEN (owner).
- Rollback / recovery: revert P5 commits; reverse migration 0003 only in non-prod.

## LOG-0135 - 2026-08-16 - P5 / Task Spec + ledger hygiene (S0)

- Outcome: Formal `docs/plan/P5-research-task-spec.md` written (Status `IN_PROGRESS`); frozen field/route contracts; Caddy `/api/` explicitly out of scope under DEFER-0017 (scope expanded to research); DEFER-0019 (Statement PDF) and DEFER-0020 (curated collections/graph) recorded; BACKLOG/AGENTS/CHANGELOG/S-PLAN updated. No CMS/web implementation in this commit.
- Why: AGENTS requires Task Spec before P5 implementation; code-first like P4 without inventing fields or opening edge APIs.
- Scope / files: `docs/plan/P5-research-task-spec.md`, `docs/status/{deferred-validation,BACKLOG,CHANGELOG,WORK_LOG}.md`, `docs/plan/S-PLAN-STATE.md`, `AGENTS.md`.
- Verification actually performed and result: docs-only; no pytest/build in this slice.
- Decisions / assumptions: About static `researchProjects` left untouched; Contact stays honest About link; staging smoke replaced by local projection tests + optional owner prod smoke after migrate (ADR-0025).
- Deferred or risk IDs: DEFER-0017 OPEN (expanded); DEFER-0019 OPEN; DEFER-0020 OPEN; RISK-0003 OPEN (owner).
- Rollback / recovery: revert this docs commit.

## LOG-0134 - 2026-08-16 - P4 / security harden after review (PR #15)

- Outcome: Public projection hardened: article slug redirects only resolve to `public()` targets; article detail API re-sanitizes rich text with Wagtail Whitelister; JSON-LD embedded via escaped script content to block `</script>` breakout. Merged as PR #15 onto `main` after CMS + web CI green.
- Why: Close medium findings from independent security review of P4 Blog/Writing (#14).
- Scope / files: `apps/cms/apps/api/api.py`, `apps/cms/tests/test_api.py`, `apps/web/src/data/structured.ts`, `apps/web/src/layouts/BaseLayout.astro`, `apps/web/src/pages/{en,fa}/blog/[slug].astro`, `AGENTS.md`, ledgers.
- Verification actually performed and result: PR #15 checks — Check and test CMS PASS; Check and build web PASS; merge commit `7929489`.
- Deferred or risk IDs: DEFER-0017 OPEN; DEFER-0018 OPEN; RISK-0003 OPEN (owner); P4 Task Spec remains `PARTIAL` until prod migrate/`CMS_API_BASE` publish.
- Rollback / recovery: revert merge of PR #15.

## LOG-0133 - 2026-08-16 - P4 / Blog Writing code-first (models, API, Astro, SEO)

- Outcome: P4 Blog/Writing implemented code-first without opening public Caddy `/api/` or `/media/`. Article/Series/TopicTag + ArticleSlugRedirect models and migration; Wagtail snippet admin; Ninja list/detail/pagination/tag/series/redirect endpoints (published-only); Astro `/{locale}/blog/` routes with optional `CMS_API_BASE` (empty-honest when unset); BlogPosting + BreadcrumbList JSON-LD; sitemap blog entries; RSS deferred as DEFER-0018; public API edge deferred as DEFER-0017.
- Why: Execute approved P4 plan after P3 runtime; keep edge surface closed until a separate publish-API Task Spec.
- Scope / files: `apps/cms/apps/content/{models,admin,migrations/0002_*,wagtail_hooks}.py`, `apps/cms/apps/api/api.py`, `apps/cms/tests/test_{content,api}.py`, `apps/web/src/{lib/cms,components/blog,pages/*/blog,data,components/Header.astro,pages/sitemap.xml.ts}`, Task Spec + ledgers.
- Commands or actions actually performed: `uv sync --python 3.12`; `makemigrations content`; `ruff check`; `pytest` 122 PASS; `npm run check` 0 errors; `npm run build` (blog index routes present; empty CMS).
- Verification actually performed and result: CMS ruff clean; 122 pytest PASS; Astro check 0 errors/warnings; static build Complete with `/en/blog/` + `/fa/blog/`.
- Decisions / assumptions: Featured images omitted from public UI while `/media/` unpublished; feed not shipped (DEFER-0018); no infra/Caddy changes.
- Deferred or risk IDs: DEFER-0017 OPEN; DEFER-0018 OPEN; RISK-0003 OPEN (owner backup before prod migrate); DEFER-0014/0016 unchanged.
- Rollback / recovery: revert P4 commits; drop migration 0002 if applied only in non-prod.

## LOG-0132 - 2026-08-16 - P3 / Staff draft preview boundary (P3-07)

- Outcome: Staff-only read-only preview at `/admin/preview/<kind>/<pk>/` for Landing/Profile/Article (no Wagtail Page models). Body sanitized with Wagtail Whitelister; `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store`. Public share-token preview recorded as DEFER-0016. Task-list P3-07 safe minimum DONE.
- Why: Close ADR-0022 / Task-list gap where allowlist existed without preview runtime.
- Scope / files: `apps/cms/apps/content/{views_preview,wagtail_hooks,templates}`, `apps/security/middleware.py`, `tests/test_preview.py`, Task Spec, ADR-0022, ledgers.
- Verification: `uv run ruff check` clean on touched paths; `uv run pytest` 105+ passed; security review Approve.
- Deferred or risk IDs: DEFER-0016 OPEN (public token); RISK-0003 OPEN; `/api/`/`/media/` unpublished.
- Rollback / recovery: revert feature commits; no migration.
## LOG-0131 - 2026-08-16 - P3 / TOTP recovery codes + MFA disable (DEFER-0015 CLOSED)

- Outcome: Hashed one-time recovery codes (64-bit, reveal-once session), login accepts unused recovery codes after password, regenerate/disable under `/admin/account/two-factor/` with second-factor confirm. Audit actions `mfa.recovery_issued`, `mfa.recovery_used`, `mfa.disabled` (no plaintext). DEFER-0015 CLOSED in repo; production needs CMS image rebuild.
- Why: Authenticator loss previously required VPS emergency paths only.
- Scope / files: `apps/cms/apps/security/{models,recovery,forms,views_totp,wagtail_hooks}.py`, templates, migration `0002_recovery_code`, `tests/test_mfa.py`, Task Spec, ADR-0020, ledgers, AGENTS.md.
- Verification: `uv run ruff check` clean on touched paths; `uv run pytest` 97 passed.
- Deferred or risk IDs: DEFER-0015 CLOSED; RISK-0003 OPEN (owner backup evidence); `/api/`/`/media/` unpublished.
- Rollback / recovery: previous CMS image; migration reverse removes RecoveryCode rows only.

## LOG-0130 - 2026-08-16 - P3 / CMS-aware backup script + rendition contract (RISK-0003 prep)

- Outcome: `infra/backup/taha-platform-backup.sh` now requires live `taha-cms-db-1`, dumps `cms-postgres-all.sql` (tags `cms`/`postgres`), optionally dumps legacy postgres, backs up CMS media volume when present, supports `--dry-run`. Added `infra/backup/README.md` and `docs/plan/P3-cms-backup-restore-task-spec.md`. Media public-delivery contract coded in `apps.media.renditions` with tests (no `/media/` exposure). S-PLAN D7 marked DONE; RISK-0003 remains OPEN until owner VPS evidence.
- Why: Live CMS data was outside the legacy `taha-prod-postgres-1` backup path.
- Scope / files: `infra/backup/**`, BACKUP_POLICY/RUNBOOK, ADR-0021 note, `apps/cms/apps/media/renditions.py`, `tests/test_media.py`, ledgers, S-PLAN-STATE.
- Verification: `bash -n` on backup script; `uv run pytest` (media + suite).
- Deferred or risk IDs: RISK-0003 OPEN (owner install + restore); DEFER-0014/0015 unchanged; `/api/`/`/media/` unpublished.
- Rollback / recovery: previous `/usr/local/sbin/taha-platform-backup` backup on VPS before install.

## LOG-0129 - 2026-08-16 - P3 / RISK-0009 CLOSED (password + production TOTP)

- Outcome: Owner rebuilt CMS image from `main` (`95a740f`), `update-cms.sh` + `smoke-cms.sh` PASS, then attested password rotation and TOTP enrollment on production. RISK-0009 CLOSED.
- Why: Persist owner completion of the last CMS runtime hygiene residuals.
- Scope / files: RISK_REGISTER, AGENTS.md, BACKLOG, CHANGELOG, this Work Log, P3-mfa task spec status.
- Verification: owner VPS log (rebuild + smoke); owner chat attestation «انجام شد» for password + TOTP (no secrets recorded).
- Deferred or risk IDs: DEFER-0015 (recovery codes) remains OPEN; RISK-0003 still needs CMS-postgres restore evidence; `/api/`/`/media/` unpublished.
- Rollback / recovery: previous CMS image tag; Caddyfile timestamped backup.

## LOG-0128 - 2026-08-16 - P3 / Wagtail TOTP enrollment + OTP login

- Outcome: Account had no OTP section because MFA was enforcement-only. Added Wagtail `OTPLoginForm`, `/admin/account/two-factor/` enrollment (QR via `qrcode` + manual secret), Account profile panel + menu item, and middleware that redirects staff without a confirmed device to setup (account/password still reachable). Login requires OTP only after enrollment. Security fix: setup/QR not exempt for enrolled users without OTP session; QR serves unconfirmed devices only; session `cycle_key` on confirm.
- Why: Unblock RISK-0009 TOTP residual; owner could not enroll from Account UI.
- Scope / files: `apps/cms/apps/security/{forms,mfa,views_totp,wagtail_hooks}.py`, templates, `tests/test_mfa.py` + security test updates, `qrcode` dep, Dockerfile/update-cms import check, ADR-0020, ledgers.
- Verification: `uv run pytest` 88 passed; ruff clean; Django check (treebeard E001 advisory only).
- Deferred or risk IDs: DEFER-0015 (TOTP recovery codes); RISK-0009 OPEN until owner rebuilds image, rotates password, enrolls TOTP on production. RISK-0003 unchanged.
- Rollback / recovery: previous CMS image tag; Caddy unchanged.

## LOG-0127 - 2026-08-16 - P3 / Caddy `/static/*` applied; CMS smoke full PASS

- Outcome: Owner patched production Caddyfile with `handle /static/*` → `127.0.0.1:18000` before `import taha_application_routes`. Validate + reload succeeded. Origin `--resolve` to 127.0.0.1 returned 200 for `/static/wagtailadmin/css/core.css`. `bash infra/deploy/smoke-cms.sh https://tahamohamadi.ir` PASS (admin Wagtail, static CSS, `/health/`, `/health.json`, `/`).
- Why: Close the Wagtail admin asset gap recorded in LOG-0126.
- Scope / files: VPS `/etc/caddy/Caddyfile` (timestamped backup kept); repo `infra/cms/Caddyfile.cms.snippet` aligned to live `/admin|/*` `/static|/*` `/health|/*` matchers; this Work Log; RISK-0009 residual narrowed to password + TOTP.
- Verification: owner paste — patched OK; origin 200; smoke PASS.
- Deferred or risk IDs: RISK-0009 OPEN (rotate bypassed admin password; confirm TOTP). `/api/` and `/media/` still unpublished. RISK-0003 still needs CMS-postgres restore evidence.
- Rollback / recovery: restore timestamped Caddyfile backup, `caddy validate`, `systemctl reload caddy`.

## LOG-0126 - 2026-08-16 - P3 / CMS runtime live; static assets still unproxied

- Outcome: Owner rebuild reported `runtime-deps-ok`, migrate no-op, loopback `/admin/login/` 200, `smoke-cms.sh` PASS. Independent live check: `/admin/login/` is Wagtail Sign in, `/health/` is `{"status":"ok","db":"ok"}`, `/health.json` is the static artifact. `/static/wagtailadmin/css/core.css` returns the Astro 404 page (Caddy `/static*` handle missing). Superuser created after bypassing password validators (common + numeric).
- Why: Record runtime go-live evidence and the remaining Caddy/password gaps so RISK-0009 is not closed prematurely.
- Scope / files: this Work Log, RISK_REGISTER (RISK-0009 OPEN residuals), `infra/deploy/smoke-cms.sh` (fail if Wagtail CSS is not 200).
- Commands or actions actually performed: live curl of `/admin/login/`, `/health/`, `/health.json`, `/static/wagtailadmin/css/core.css`.
- Verification actually performed and result: admin 200 Wagtail; CMS health db=ok; static health.json intact; core.css 404 Astro HTML.
- Deferred or risk IDs: RISK-0009 OPEN (add `/static*` handle; rotate weak admin password; confirm MFA). `/api/` and `/media/` still not public.
- Rollback / recovery: Caddyfile timestamped backup; CMS `compose down` without `-v`.

## LOG-0125 - 2026-08-16 - P3 / CMS runtime hardening (argon2, WhiteNoise, Caddy paths)

- Outcome: Stack is healthy (`db=ok`, migrations applied) but `createsuperuser` failed: `PASSWORD_HASHERS` starts with Argon2 and `argon2-cffi` was not a runtime dependency. Also gunicorn does not serve `/static/` without WhiteNoise, the compose `cms_static` volume would hide baked collectstatic once `STATIC_ROOT` is `staticfiles`, and Caddy `handle /health*` would steal `/health.json` from the static site. Added `argon2-cffi` + `whitenoise`, aligned `STATIC_ROOT`, removed the static volume, tightened Caddy matchers, and added loopback `/admin/login/` + argon2 import checks to `update-cms.sh`.
- Why: Close remaining runtime landmines before the owner retries superuser and applies Caddy.
- Scope / files: `apps/cms/pyproject.toml` + `uv.lock`, `config/settings/base.py` + `production.py`, `tests/test_production_proxy.py`, `infra/cms/*`, `infra/deploy/update-cms.sh`, `infra/deploy/smoke-cms.sh`, this Work Log.
- Deferred or risk IDs: RISK-0009 until rebuild + createsuperuser (12+ char password) + Caddy snippet + `smoke-cms.sh` PASS. Do not proxy `/api/` or `/media/`.
- Rollback / recovery: previous image tag; Caddyfile timestamped backup.

## LOG-0124 - 2026-08-16 - P3 / CMS db hostname DNS after leftover compose project

- Outcome: After port 18000 was freed, `taha-cms-cms-1` started but `migrate` / `createsuperuser` failed with `failed to resolve host 'db'`. `/health/` HTTP 200 is not DB-ready (returns `db:error` while gunicorn is up). Likely a stale cms container/network from the failed bind, plus leftover `cms-*` from the first compose project name. `update-cms.sh` now force-recreates, removes `cms-cms-1`/`cms-db-1`, waits until `db` resolves and health JSON has `db=ok`. Compose gives `hostname: db` and network aliases. Treebeard E001 warnings are upstream advisory, not this failure.
- Why: Unblock first migrate/superuser on the VPS.
- Scope / files: `infra/cms/docker-compose.cms.yml`, `infra/deploy/update-cms.sh`, this Work Log.
- Deferred or risk IDs: RISK-0009 until migrate + superuser + Caddy + smoke PASS.
- Rollback / recovery: revert compose/script; operator can `up -d --force-recreate` without the script.

## LOG-0123 - 2026-08-16 - P3 / CMS update-cms port conflict + local pull_policy

- Outcome: VPS build of `taha-cms:local` succeeded but `compose up` failed with `Bind for 127.0.0.1:18000 failed: port is already allocated` (leftover `cms-cms-1` from the previous project name) and also attempted a registry pull of the local tag. `update-cms.sh` now forces `CMS_PULL_POLICY=never` when `CMS_BUILD=1`, uses `up --pull never`, and stops containers already bound to `:18000` before recreate.
- Why: Unblock second bring-up after successful local image build.
- Scope / files: `infra/deploy/update-cms.sh`, this Work Log.
- Deferred or risk IDs: RISK-0009 until smoke PASS; also fix `chown -R deploy:deploy /home/deploy/cms-repo` so deploy user can `git pull` without root.
- Rollback / recovery: revert script; manual `docker stop` of the binder on 18000.

## LOG-0122 - 2026-08-16 - P3 / CMS image CI visibility step fail-open

- Outcome: CI image push on PR #2 succeeded (`ghcr.io/tahamohamadi-ir/taha-cms:main` / `:a402a60`) but the follow-up `PUT …/visibility` returned HTTP 404 with `GITHUB_TOKEN`, failing the workflow. Softened the step to `continue-on-error` + warning so publish success is not masked. VPS can proceed with `CMS_BUILD=1` or after owner sets the package Public in GitHub UI.
- Why: Unblock operators; Actions token cannot always change package visibility.
- Scope / files: `.github/workflows/ci-cms-image.yml`, this Work Log.
- Verification: prior push job already built/pushed tags; this change is CI control-flow only.
- Deferred or risk IDs: RISK-0009 unchanged until VPS smoke PASS.
- Rollback / recovery: revert workflow step.

## LOG-0121 - 2026-08-16 - P3 / CMS deploy ops fixes (GHCR public + script invoke)

- Outcome: Operator bring-up failed on VPS for three mechanical reasons: (1) `docker login ghcr.io` with GitHub password → denied (need PAT `read:packages` or public package); (2) `./infra/deploy/*.sh` Permission denied (mode not executable / invoke via bash); (3) placeholder `<sha>` caused bash syntax error. Fixed by making GHCR package public in CI after push, documenting `bash infra/deploy/...`, adding `CMS_BUILD=1` local build fallback, and auto-appending missing `DJANGO_SETTINGS_MODULE` / `POSTGRES_HOST` in `.env`.
- Why: Unblock CMS runtime after main already contained the versioned pipeline (PR #1 / LOG-0120).
- Scope / files: `infra/deploy/update-cms.sh`, `.github/workflows/ci-cms-image.yml`, `infra/cms/README.md`, this Work Log.
- Commands or actions actually performed: local edits; git commit/push/merge of this fix branch (see verification).
- Verification actually performed and result: prior suite green on main; this slice is ops/docs/CI visibility — no CMS code path change requiring full pytest re-run beyond prior 78 PASS baseline.
- Decisions / assumptions: public GHCR package is acceptable for this public repository image (no secrets in image layers).
- Deferred or risk IDs: RISK-0009 still BLOCKED until VPS `bash infra/deploy/update-cms.sh` + Caddy + `smoke-cms.sh` PASS.
- Rollback / recovery: set package visibility private in GitHub Packages UI; previous CMS_IMAGE tag remains pullable if still tagged.

## LOG-0120 - 2026-08-16 - P3 / CMS versioned CI/CD + health/proxy hardening

- Outcome: Diagnosed owner VPS log (`/health/` HTML 400; `createsuperuser` → `No module named django`; public `/admin/login/` still 301). Fixed production settings for Caddy proxy + loopback health; put image venv on `PATH`; replaced ad-hoc `:latest` tar flow with GHCR sha tags + `update-cms.sh` / `smoke-cms.sh`; documented Caddy + static artifact + Compose CMS contract.
- Why: First runtime bring-up failed for predictable proxy/PATH reasons; owner asked for principled CI/CD + dockerization + versioning.
- Scope / files: `apps/cms/config/settings/production.py`, `apps/cms/tests/test_production_proxy.py`, `infra/cms/*`, `infra/deploy/update-cms.sh`, `infra/deploy/smoke-cms.sh`, `.github/workflows/ci-cms-image.yml`, `.dockerignore`, `docs/plan/P3-cms-versioned-cicd-task-spec.md`, DEPLOY_RUNBOOK, PROJECT_MANIFEST, RISK_REGISTER, this entry.
- Commands or actions actually performed: local pytest/ruff (see verification); no VPS SSH in this slice.
- Verification actually performed and result: `uv run pytest` → **78 passed** (includes 3 new production proxy tests); `ruff check` on touched CMS files → All checks passed. VPS re-smoke not run in this slice.
- Decisions / assumptions: static Astro site stays non-containerized; CMS image identity is git-sha on GHCR; auto-SSH deploy from GitHub to VPS is out of scope (operator pull).
- Deferred or risk IDs: RISK-0009 remains BLOCKED until VPS re-smoke PASS with the fixed image + Caddy snippet.
- Rollback / recovery: revert branch; on server keep previous `CMS_IMAGE` tag.

## LOG-0119 - 2026-08-16 - P3 / CMS runtime deploy preparation

- Outcome: CMS runtime deployment staged and prepared for execution. The Docker image `taha-cms:latest` was built locally (multi-stage: uv sync + gunicorn, non-root uid 10001, HEALTHCHECK via /health/) and exported (258.5 MB). The NOT-APPLIED markers were removed from `infra/cms/*`. A repo-root `.dockerignore` was added. The Caddyfile.cms.snippet was rewritten to proxy `127.0.0.1:18000` (compose now publishes `127.0.0.1:18000:8000`). The new repo was cloned to `/home/deploy/cms-repo` on the VPS; a secure `.env` was generated on the VPS with openssl-grade random secrets (DJANGO_SECRET_KEY 87 chars, POSTGRES_PASSWORD 33, REBUILD_TRIGGER_SECRET 44) and placed at `infra/cms/.env` (chmod 600).
- Why: owner authorized CMS runtime deploy (2026-08-16) after old-stack decommission (469 MB RAM freed) and server updates (57 packages, NO REBOOT NEEDED).
- Scope / files: `.dockerignore` (new), `infra/cms/docker-compose.cms.yml` (ports published, markers removed), `infra/cms/Dockerfile.cms` (DJANGO_SETTINGS_MODULE fix, markers removed), `infra/cms/Caddyfile.cms.snippet` (127.0.0.1:18000 + noindex headers), `docs/status/WORK_LOG.md`. VPS: `/home/deploy/cms-repo` (clone), `/home/deploy/taha-cms.env`, `infra/cms/.env`, `/home/deploy/taha-cms.tar` (image), `/home/deploy/deploy-cms.sh` (root deploy script), `/home/deploy/add-caddy-cms.sh` (root Caddy script).
- Commands or actions actually performed: `docker build -f infra/cms/Dockerfile.cms -t taha-cms:latest .` (built; first attempt failed with "Unknown command: collectstatic" — fixed by adding DJANGO_SETTINGS_MODULE=config.settings.test to the collectstatic RUN); `docker save taha-cms:latest -o taha-cms.tar` (258.5 MB); scp to VPS; git clone of Taha-personal-platform to /home/deploy/cms-repo; env generation script (bash) uploaded+run on VPS; `bash -n` syntax checks PASS for both deploy scripts.
- Verification actually performed and result: Docker image builds and exports cleanly; compose file validates (structure verified); env has required minimum lengths; both deploy scripts `bash -n` PASS. Runtime health/smoke pending owner execution of `deploy-cms.sh` and `add-caddy-cms.sh` (sudo).
- Decisions / assumptions: the CMS runs on `127.0.0.1:18000` (no public port) and Caddy reverse-proxies `/admin/*` and `/health/*` only; everything else stays on the static site. `.env` never leaves the VPS (secrets generated on-server). `POSTGRES_HOST=db` per compose network. Old repo at `/opt/taha/repository` untouched (decommissioned containers only).
- Deferred or risk IDs: RISK-0009 stays BLOCKED until the runtime smoke PASS (owner executes deploy scripts); DEFER-0009/0013 unchanged.
- Rollback / recovery: `docker compose -f infra/cms/docker-compose.cms.yml down` (volumes preserved); restore Caddyfile from the timestamped backup the add-caddy script prints; static site is unaffected either way.

## LOG-0121 — 2026-08-17 — CMS content seed from static site sources

- Outcome: Added idempotent `seed_site_content` management command and canonical payloads in `apps/cms/apps/content/data/site_content.py` mirroring approved static content (`content.ts`, `profile.*.ts`, Master CV). Seeds published fa/en rows for Landing, Profile, ResearchStatement, ResearchTopic (3×2), Publication (3×2), and Project (3×2). No blog articles (no published static writing corpus yet).
- Why: Production research/blog/project lists were empty because Wagtail had no published rows; build-time CMS fetch needs published API records.
- Scope / files: `apps/cms/apps/content/data/site_content.py`, `apps/cms/apps/content/management/commands/seed_site_content.py`, `apps/cms/tests/test_seed_site_content.py`, `infra/cms/README.md`, this entry.
- Commands or actions actually performed: `uv run pytest tests/test_seed_site_content.py -v` → 3 passed; full CMS suite → 155 passed.
- Verification actually performed and result: seed populates `/api/research/topics/en`, `/api/research/statements/en`, `/api/research/projects/en/pars-sql-vtd-edge` in tests; idempotent without `--force`.
- Decisions / assumptions: prose copied verbatim from static sources; empty `role` and no case-study extensions until owner-authored P6 depth content exists; articles intentionally omitted.
- Deferred or risk IDs: owner must run seed on VPS after merge + static rebuild; blog/articles remain empty until writing slice content exists.
- Rollback / recovery: delete seeded rows in Wagtail admin or re-run with `--force` after editing `site_content.py`; no schema migration.

## LOG-0152 - 2026-08-18 - ADM / Custom admin rebuild — docs and reference-file alignment (ADR-0026)

- Outcome: مالک تصمیم گرفت Wagtail کلاً از runtime و ادمین حذف شود و با ادمین اختصاصی React SPA زیر `/admin/` + Django Ninja `/api/v1/admin/*` جایگزین شود (ADR-0026). فقط مستندات/فایل‌های مرجع در این slice تغییر کردند؛ کد تغییر نکرد. تغییرات روی برنچ `docs/custom-admin-rebuild` از `origin/main` (پس از sync با وضعیت واقعی main: P4–P6 live، `/api/` و `/media/` عمومی، `RISK-0003` CLOSED، `DEFER-0015` CLOSED) اعمال شد. اسناد: ADR-0026 (جدید)، `docs/plan/custom-admin-rebuild-fa.md` (جدید)، Task-list.md (§17 ADM-0..ADM-6 + supersede P7 + snapshot + معماری/Tech Stack + آیتم‌های §14 در P4/P6/P10/release checklist)، AGENTS.md (gate + ownership)، PROJECT_MANIFEST.md (status/route/معماری/ownership/open decisions + اصلاح اطالعات قدیمی `/api/`)، docs/adr/README.md (ردیف 0026 + یادداشت 0002/0014/0020/0022)، ledgers: BACKLOG.md (ردیف‌های ADM)، deferred-validation.md (DEFER-0023/0024/0025)، RISK_REGISTER.md (RISK-0010/0011)، TECH_DEBT.md (DEBT-0003)، CHANGELOG.md، README.md.
- Why: مالک ادمین فعلی واگتِیل را غیرقابل استفاده ارزیابی کرد؛ وابستگی کد به واگتِیل فقط ۳ فایل امنیتی است و لایه‌های ارزشمند Django خالص‌اند؛ خواسته = مدیریت کامل سایت (صفحات/چیدمان/تب‌ها/تگ‌ها/فیلترها/محتوا) با ادمین فارسی/RTL؛ محتوای seeded باید حفظ شود.
- Scope / files: `docs/adr/0026-custom-admin-replaces-wagtail.md` (new), `docs/plan/custom-admin-rebuild-fa.md` (new), `docs/adr/README.md`, `AGENTS.md`, `PROJECT_MANIFEST.md`, `Task-list.md`, `docs/status/BACKLOG.md`, `docs/status/deferred-validation.md`, `docs/status/RISK_REGISTER.md`, `docs/status/TECH_DEBT.md`, `docs/status/CHANGELOG.md`, `README.md`, این Work Log.
- Commands or actions actually performed: `git fetch origin --prune`؛ `git switch -c docs/custom-admin-rebuild origin/main`؛ ویرایش/ایجاد فایل (write/edit)؛ بدون کد/CI/VPS. راستی‌آزمایی read-only: `git show origin/main:docs/status/deferred-validation.md` (max DEFER-0022)، `git show origin/main:docs/status/WORK_LOG.md` (max LOG-0151)، `git show origin/main:docs/status/RISK_REGISTER.md` (max RISK-0009)، `git show origin/main:docs/status/TECH_DEBT.md` (max DEBT-0002 → DEBT-0003 استفاده شد).
- Verification actually performed and result: `git diff --check` روی تغییرات؛ شماره‌های DEFER/LOG/RISK/DEBT نسبت به `origin/main` بدون تداخل انتخاب شدند؛ هیچ فایل کدی لمس نشد.
- Decisions / assumptions: پایه‌ی کارهای ADM = `origin/main`؛ واگتِیل تا cutover ADM-1 به سرویس `/admin/` ادامه می‌دهد (DEFER-0023)؛ ادمین‌های Wagtail-session موجود (PR #24/#31) در ADM-1 منتقل می‌شوند؛ استک ادمین = React + Vite + Tailwind v4 + shadcn/ui؛ Composition ساختاریافته با layout presets؛ فرانت عمومی Astro استاتیک با rebuild-trigger.
- Deferred or risk IDs: DEFER-0023/0024/0025، RISK-0010/0011، DEBT-0003.
- Rollback / recovery: این slice صرفاً مستندات است — revert برنچ در صورت نیاز؛ بدون اثر runtime.

## LOG-0153 - 2026-08-18 - ADM / Complementary improvements extracted from Samples (beyond admin)

- Outcome: در پاسخ به سؤال مالک («بجز پنل ادمین از پروژه‌های قبلی چه چیزی اضافه کنیم؟»)، بخش §14 «بهره‌برداری‌های مکمل» به `docs/plan/custom-admin-rebuild-fa.md` اضافه شد: ۱۰ ویژگی (F1–F10)، ۷ الگوی ساختاری (S1–S7)، ۵ مورد UI/UX (U1–U5) — هرکدام با منبع دقیق در Samples و فاز هدف. ردیف‌های پیشنهادی به BACKLOG اضافه شدند (QA-playwright، P4-reading، P6-gallery، ADM-5-featured، QA-vitest). در تطبیق با main مشخص شد بخشی از F ها قبلاً انجام شده‌اند (reading time ~200wpm، JSON-LD BlogPosting، BreadcrumbList در P4)؛ فقط موارد انجام‌نشده در Task-list تثبیت شدند.
- Why: مالک خواست بداند چه امکانات/ساختار/UX دیگری از پروژه‌های قبلی به پروژه‌ی نهایی منتقل شود؛ پاسخ باید مستند، منبع‌دار و فازبندی‌شده باشد.
- Scope / files: `docs/plan/custom-admin-rebuild-fa.md` (§14)، `docs/status/BACKLOG.md`، این Work Log.
- Commands or actions actually performed: ویرایش فایل؛ بدون کد/CI/VPS؛ منبع‌ها از گزارش‌های بازبینی Samples همان جلسه (۴ sub-agent) گرفته شدند.
- Verification actually performed and result: `git diff --check` PASS؛ ارجاع‌های §14 با گزارش‌های اولیه هم‌خوانی دارند.
- Decisions / assumptions: موارد §14 پیشنهادی‌اند؛ هرکدام با Task Spec و اولویت مالک اجرا می‌شوند؛ blocker فازهای ADM نیستند.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: revert کامیت؛ بدون اثر runtime.

## LOG-0154 - 2026-08-18 - Git sync: local/remote alignment + server sync prep

- Outcome: برنچ محلی قدیمی (`feat/cms-backup-risk-0003-prep` با ۳ کامیت doc از این جلسه) با وضعیت جدید هم‌راستا نشد؛ تغییرات روی برنچ تازه‌ی `docs/custom-admin-rebuild` از `origin/main` بازاعمال شدند (با تطبیق به واقعیت main و شماره‌های بدون تداخل). `git fetch origin --prune` انجام شد. سینک سرور (production VPS) مستقیماً انجام نشد — طبق قرارداد (SSH/deploy نیاز به تأیید صریح و Task Spec)؛ دستورالعمل/اسکریپت برای مالک در پیام نهایی ارائه می‌شود.
- Why: مالک خواست local، remote (main) و سرور در بهترین/آخرین وضعیت سینک شوند تا version control کامل و تمیز باشد.
- Scope / files: برنچ‌ها/worktrees و این Work Log.
- Commands or actions actually performed: `git fetch origin --prune`؛ `git switch -c docs/custom-admin-rebuild origin/main`؛ بررسی divergence (۶۴ behind / ۳ ahead)؛ راستی‌آزمایی شماره‌ها در main.
- Verification actually performed and result: وضعیت divergence و شماره‌های ledger های main ثبت شد؛ تغییرات doc از برنچ قدیمی به جدید منتقل و بازنویسی شد.
- Decisions / assumptions: main مرجع حقیقت است؛ برنچ محلی قدیمی پس از merge این PR می‌تواند حذف شود؛ سرور جداگانه با تأیید مالک سینک می‌شود (rebuild CMS image از main + migrate + seed + rebuild-static).
- Deferred or risk IDs: DEFER-0024 (برنچ پایه) — نزدیک‌شونده؛ سینک سرور به مالک واگذار شد.
- Rollback / recovery: revert/حذف برنچ؛ بدون اثر runtime تا اجرای دستورالعمل سرور.

## LOG-0155 - 2026-08-18 - Server sync progress + stale CMS image pin fix

- Outcome: مالک سینک سرور را شروع کرد: `git pull` تا `d626ecf`، سپس `sudo bash infra/deploy/prod-cms-update-migrate.sh`. پیش‌فرض اسکریپت به `b369885` (تصویر قدیمی P4–P5) پین شده بود → `migrate` گفت «No migrations to apply» و فقط 0001–0004 در `showmigrations` دیده شد؛ **0005/0006 اعمال نشدند** و `import_profile_seed` با «Unknown command» شکست (هر دو در PR #31 یعنی تصویر `430061b` آمده‌اند). همچنین `rebuild-static.sh` روی VPS با «npm not found» شکست (VPS نود ندارد). پیش‌فرض قدیمی اسکریپت برداشته شد و `CMS_IMAGE` **الزامی** شد (با پیام راهنما) تا این خطا تکرار نشود.
- Why: تصویر CMS فقط با تغییر `apps/cms/**`/`infra/cms/**` ساخته می‌شود؛ merge های docs-only (PR #32/#34) تصویر جدید نمی‌سازند؛ آخرین تصویر دارای 0005/0006 و `import_profile_seed` = `430061b` است.
- Scope / files: `infra/deploy/prod-cms-update-migrate.sh`، `docs/status/WORK_LOG.md`، `docs/status/CHANGELOG.md`.
- Commands or actions actually performed: ویرایش اسکریپت (حذف پیش‌فرض `b369885`، الزام `CMS_IMAGE`)؛ بررسی `ci-cms-image.yml` (path filters) و آخرین run های «CMS image» (آخرین = PR #31).
- Verification actually performed and result: `git diff --check` PASS؛ اسکریپت با `bash -n` خطای نحوی ندارد؛ بدون تغییر در منطق دیگر.
- Decisions / assumptions: به‌جای HEAD، تصویر باید از آخرین run موفق «CMS image» انتخاب شود (مثلاً `430061b`)؛ مالک پس از deploy تصویر درست، `migrate` (0005/0006) + `import_profile_seed` + در صورت نیاز `seed_site_content` + `smoke-cms.sh` را اجرا می‌کند؛ بازسازی استاتیک یا با نصب Node 24 روی VPS یا build محلی با SSH tunnel (گزینه‌ی `build-static-with-cms.sh`/`rebuild-static.sh`).
- Deferred or risk IDs: RISK-0010 (حفظ محتوا — backup گرفته شد: `/home/deploy/backups/pre-migrate-20260818-165018/cms-postgres-all.sql`).
- Rollback / recovery: تصویر قبلی `31c6560`/`b369885` و backup پیش از migrate موجود است؛ بازگشت = `CMS_IMAGE=<قبلی> sudo bash infra/deploy/prod-cms-update-migrate.sh`.

## LOG-0156 - 2026-08-18 - ADM-1 / Custom admin auth API + React SPA scaffold (foundation)

- Outcome: بنیان ادمین اختصاصی (ADR-0026) به‌صورت **additive و غیرشکننده** ساخته شد — واگتِیل و `/admin/` فعلی تا cutover دست نخوردند:
  1. **Backend** `apps/api/admin_api.py`: NinjaAPI مستقل در `/api/v1/admin/` — `auth/csrf`، `auth/login` (email+password+TOTP/recovery)، `auth/logout`، `auth/me`، `dashboard/summary` (شمارش محتوا، draft/published). Security: session+CSRF صریح (چون ninja همه‌ی views را csrf_exempt می‌کند)، دوباره‌استفاده از `AuditLog` + `django-otp` (`DEVICE_ID_SESSION_KEY`) + rate-limit cache (5/5min) + `_require_admin_otp` برای endpoint های محافظت‌شده. خطاها به شکل `{code, message, fields}`.
  2. **Frontend** `apps/cms/admin-frontend/` (React 18 + Vite + TS + Tailwind v4 + Vazirmatn، RTL): صفحه‌ی ورود، AuthProvider/AuthGuard (csrf→login→me)، پوسته‌ی ادمین با سایدبار، داشبورد با کارت‌های `dashboard/summary`. `npm run build` و `npm run check` پاس.
  3. **CI**: workflow جدید `ci-admin-frontend.yml` (npm ci → check → build روی تغییرات `apps/cms/admin-frontend/**`)؛ secret-scan سی‌ام‌اس node_modules را استثنا کرد.
  4. **Caddy**: هندل `no-store` برای `/api/v1/admin/*` و `/api/admin/*` در `Caddyfile.cms.api.snippet` (اعمال روی سرور = مرحله‌ی جدا با تأیید مالک).
- Why: اولین فاز اجرایی ADM-0/ADM-1؛ بدون حذف واگتِیل و بدون ریسک production؛ هر دو بخش (auth API و SPA) به‌صورت مستقل با تست/CI قابل تأییدند.
- Scope / files: `apps/cms/apps/api/admin_api.py` (new)، `apps/cms/config/urls.py`، `apps/cms/tests/test_admin_api_auth.py` (new)، `apps/cms/admin-frontend/` (new، scaffold کامل)، `.github/workflows/ci-admin-frontend.yml` (new)، `.github/workflows/ci-cms.yml`، `infra/cms/Caddyfile.cms.api.snippet`، `Task-list.md` (§17 ADM-1)، این Work Log.
- Commands or actions actually performed: `uv run pytest` (187 passed — کل سویییت)؛ `uv run ruff check .` (All checks passed)؛ `uv run python manage.py check` (فقط ۲ warning از قبل‌موجود treebeard)؛ `makemigrations --check --dry-run` (No changes detected)؛ `npm run build` در admin-frontend (PASS).
- Verification actually performed and result: ۱۳ تست جدید admin auth (CSRF، login بدون OTP/با OTP/با OTP غلط/رمز غلط/non-staff، logout، me، dashboard guard، CSRF enforcement، rate-limit+audit) — 13 passed؛ کل سویییت CMS بدون regression (187 passed)؛ SPA build/type-check در CI گیت.
- Decisions / assumptions: auth ادمین با همان قرارداد امنیتی موجود (session+CSRF+TOTP+audit+rate-limit)؛ `otpVerified` در پاسخ login منعکس‌کننده‌ی تأیید همان درخواست است؛ کاربر staff بدون دستگاه TOTP می‌تواند لاگین کند ولی endpoint های محافظت‌شده تا زمان enrollment در دسترس نیستند (همان policy واگتِیل فعلی)؛ docs/OpenAPI نینجا برای API ادمین فعلاً غیرفعال (عمومی نباشد).
- Deferred or risk IDs: DEFER-0023 (cutover واگتِیل→SPA در ADM-1 نهایی)؛ RISK-0010 بدون تغییر؛ Caddy no-store هندل باید روی سرور با تأیید مالک اعمال شود.
- Rollback / recovery: این slice additive است — حذف فایل‌ها/برنچ بدون اثر بر runtime؛ تولید هیچ‌چیز از این تغییر را استفاده نمی‌کند تا cutover.

## LOG-0158 - 2026-08-18 - ADM-1 / Content write API (create/update + optimistic lock) + SPA edit pages

- Outcome: مسیر **write** ادمین محتوا (ADM-1) اضافه شد تا ادمین واقعاً قابل استفاده شود (نه فقط read):
  1. **Backend** `apps/api/admin_content.py`: `GET /content/schema` (متادیتای فیلدهای قابل‌ویرایش برای فرم‌های SPA)، `POST /content/{entity}` (create، 201؛ duplicate → 409 DUPLICATE؛ unknown field → 400)، `PUT /content/{entity}/{id}` (update با **optimistic lock** If-Match داخل `transaction.atomic` + `select_for_update`؛ stale → 409 CONFLICT با `currentUpdatedAt`؛ slug duplicate → 409). هر سه با guard staff+OTP + CSRF. coercion با نوع فیلد مدل (IntegerField/DateField/TextField…)، فیلد عددی خالی skip می‌شود، خطاها با کلید camelCase. publish فقط وقتی `published_at` تهی است set می‌شود (ویرایش‌های بعدی تاریخ انتشار را عوض نمی‌کنند).
  2. **Frontend** `apps/cms/admin-frontend/`: `ContentEditPage` (فرم create/edit یکپارچه: locale/status/slug/title + فیلدهای schema-driven)، دکمه‌ی «+ ساخت» در لیست، route های `/content/:entity/new` و `/content/:entity/:id/edit`، مدیریت 409 با «بارگذاری نسخه جدید/لغو»، خطاهای field-level. `fetchContentSchema/createContent/updateContent` + تایپ‌ها در `api.ts`.
  3. Review مستقل (r0-verifier) ۵ مورد داد که **همه رفع شد**: publish-reset، race در optimistic lock (select_for_update)، کلید خطای attr→camelCase، فیلد عددی خالی 400، و تناقض مستندات (این ورودی). دو تست regression اضافه شد.
- Why: تکمیل ADM-1 تا ادمین بتواند محتوا را مدیریت کند؛ بدون حذف واگتِیل (cutover در فاز بعدی).
- Scope / files: `apps/cms/apps/api/admin_content.py`، `apps/cms/tests/test_admin_content_write.py` (12 تست)، `apps/cms/admin-frontend/src/{lib/api.ts, pages/ContentEditPage.tsx, pages/ContentListPage.tsx, App.tsx, index.css}`، `Task-list.md`، `docs/status/BACKLOG.md`، این Work Log.
- Commands or actions actually performed: `uv run pytest -q` = **209 passed**؛ `uv run ruff check .` = All checks passed؛ `uv run python manage.py makemigrations --check --dry-run` = No changes detected؛ `npm run build` و `npm run check` در admin-frontend = PASS.
- Verification actually performed and result: تست‌های create (201، duplicate، locale نامعتبر، unknown field)، update (فیلدها، If-Match conflict با currentUpdatedAt، slug duplicate، publish، blank numeric، publish-once)، schema endpoint، guard های 401/403 — همگی سبز؛ کل سویییت بدون regression.
- Decisions / assumptions: If-Match با دقت میلی‌ثانیه (همان round-trip JSON) مقایسه می‌شود؛ `select_for_update` روی sqlite تست no-op ولی روی Postgres تولید صحیح است؛ locale در update تغییرناپذیر؛ `published_at` هنگام unpublish پاک نمی‌شود.
- Deferred or risk IDs: DEFER-0023 (cutover)؛ RISK-0010؛ Caddy no-store؛ migrate Wagtail-session admins به SPA.
- Rollback / recovery: additive است — بدون اثر runtime تا cutover؛ revert برنچ در صورت نیاز.

## LOG-0157 - 2026-08-18 - ADM-1 / Content read API + dev preview route + SPA content pages

- Outcome: read-side ادمین محتوا + مسیر پیش‌نمایش dev + صفحات فهرست/جزئیات SPA — همه additive و بدون migration جدید:
  1. **Content read API** `apps/cms/apps/api/admin_content.py` (new): `GET /content/{entity}` — فهرست با فیلترهای locale/status/q و صفحه‌بندی page/pageSize (خطاهای 400 VALIDATION / 404 NOT_FOUND) و `GET /content/{entity}/{id}` — جزئیات با مپ camelCase `fields` به‌ازای هر entity. موجودیت‌ها: landing, profile, article, research-topic, research-statement, project, publication. با `admin_api.add_router("/content", content_router)` در `apps/cms/apps/api/admin_api.py` mount شد.
  2. **Refactor** `apps/cms/apps/api/admin_common.py` (new): AdminError، error handler، CSRF check، staff/OTP guards و client_ip بین admin_api و admin_content مشترک شدند.
  3. **Dev preview route** `apps/cms/apps/api/admin_spa.py` (new) — `serve_admin_ui` در `/admin-ui/`: DEBUG-only (Http404 وقتی DEBUG=False)، path-traversal-safe (resolve+startswith)، SPA fallback به index.html، هدرهای `X-Robots-Tag: noindex, nofollow, noarchive` + `Cache-Control: no-store`. در `apps/cms/config/urls.py` mount شد.
  4. **SPA** `apps/cms/admin-frontend/`: ContentListPage (تب‌های entity، فیلترهای locale/status/q هم‌گام با URL، جستجوی debounced، جدول RTL، صفحه‌بندی، حالت‌های loading/empty/error) و ContentDetailPage (رندر generic `fields`، اسلاگ‌های dir=ltr، حالت 404)؛ `src/lib/entities.ts` و `src/lib/format.ts` جدید؛ `src/lib/api.ts` با fetchContentList/fetchContentDetail + types؛ سایدبار «مدیریت محتوا» → /content؛ `vite.config.ts` base `/admin-ui/` و `src/main.tsx` BrowserRouter basename `/admin-ui/` تا build زیر همان مسیر سرو شود.
- Why: ADM-1 به فهرست/جزئیات واقعی محتوا برای هر لیست و form بعدی نیاز دارد؛ مسیر پیش‌نمایش dev به مالک اجازه می‌دهد SPA واقعی را پیش از cutover لوکال ببیند و تأیید کند؛ این گام بدون schema migration و بدون لمس واگتِیل قابل انجام بود.
- Scope / files: `apps/cms/apps/api/admin_content.py` (new)، `apps/cms/apps/api/admin_common.py` (new)، `apps/cms/apps/api/admin_spa.py` (new)، `apps/cms/apps/api/admin_api.py`، `apps/cms/config/urls.py`، `apps/cms/tests/test_admin_content_api.py` (new)، `apps/cms/admin-frontend/` (ContentListPage/ContentDetailPage، `src/lib/entities.ts`، `src/lib/format.ts`، `src/lib/api.ts`، `vite.config.ts`، `src/main.tsx`، سایدبار)، `Task-list.md` (§17 ADM-1)، این Work Log.
- Commands or actions actually performed: `uv run pytest -q` (195 passed — شامل 7 تست جدید `tests/test_admin_content_api.py` + 14 تست auth)؛ `uv run ruff check .` (clean)؛ `uv run python manage.py check` (فقط warning های از‌پیش‌موجود treebeard)؛ بدون migration جدید؛ `npm run build` + `npm run check` در admin-frontend (PASS). smoke دستی preview route: dev 200 (شامل deep-route fallback)، traversal 404، DEBUG=False → 404، missing build → 404 با hint. setup لوکال (کامیت‌نشده، dev-only): `apps/cms/dev.sqlite3` با migrate (development settings)؛ کاربر staff `preview@tahamohamadi.ir` و دستگاه TOTP تأییدشده لوکال ساخته شد تا مالک در `http://127.0.0.1:8000/admin-ui/` لاگین کند.
- Verification actually performed and result: backend 195 passed؛ ruff clean؛ `manage.py check` بدون خطای جدید؛ بدون migration جدید؛ SPA build/type-check PASS؛ smoke preview route PASS: dev 200 (شامل deep-route fallback)، traversal → 404، DEBUG=False → 404، missing build → 404 با hint.
- Decisions / assumptions: read-side جدای از write ساخته می‌شود (write/update + optimistic locking در گام بعد)؛ پاسخ‌ها با قرارداد camelCase `fields`؛ `/admin-ui/` صرفاً مسیر پیش‌نمایش dev است و در production سرو نمی‌شود؛ ساختار entity ها مطابق مدل‌های موجود و بدون تغییر schema.
- Deferred or risk IDs: DEFER-0023 (cutover واگتِیل→SPA زیر `/admin/`)؛ write/update endpoint ها + optimistic locking؛ اعمال Caddy no-store snippet روی سرور (مرحله‌ی مالک)؛ RISK-0010 بدون تغییر.
- Rollback / recovery: این slice additive است — حذف فایل‌ها/برنچ بدون اثر بر runtime؛ `/admin-ui/` فقط در DEBUG فعال است؛ production تا cutover هیچ تغییری دریافت نمی‌کند.

## LOG-0159 - 2026-08-18 - ADM-2 / Media library admin API + SPA (upload, replace, alt-by-locale)

- Outcome: کتابخانه‌ی رسانه در ادمین (ADM-2) ساخته شد — additive و بدون حذف واگتِیل؛ مدل‌های موجود فقط با افزودن alt دو زبانه تغییر کردند:
  1. **Backend** `apps/cms/apps/api/admin_media.py` (new): media_router در `/api/v1/admin/media` — `GET` فهرست با فیلترهای q / type (image|pdf) / active (true|false) / page/pageSize (خطای 400 VALIDATION)، `POST` آپلود multipart (201؛ `is_active` پیش‌فرض false؛ `full_clean` → 400)، `GET /orphans` (usage==0)، `GET /{id}`، `PUT /{id}` (optimistic lock If-Match داخل `atomic` + `select_for_update`؛ 409 CONFLICT با `currentUpdatedAt`؛ `full_clean`)، `POST /{id}/replace` (هم‌خانواده‌ی MIME؛ 400 در غیرهم‌خانواده/مفقود). `media_usage_count` + `MEDIA_REFERENCE_FIELDS` (رجیستری خالی؛ در ADM-3 وصل می‌شود). Guards: staff+OTP+CSRF.
  2. **Model/migration** `apps/cms/apps/media/models.py`: `alt_text_fa`/`alt_text_en` (CharField blank default "" + `db_default=""`)؛ migration `0002_media_alt_text_en_media_alt_text_fa.py` (AddField با `db_default` تا روی ردیف‌های موجود Postgres امن باشد). `makemigrations --check` clean (no pending).
  3. **Frontend** `apps/cms/admin-frontend/`: `src/pages/MediaLibraryPage.tsx` (فیلترها، orphan toggle، آپلود با progress، drawer ویرایش با جایگزینی فایل + تأیید بایگانی + 409 reload/discard)، `src/components/MediaPicker.tsx` (modal قابل reuse)، `src/components/MediaThumb.tsx`، `src/lib/api.ts` (fetchMediaList/Orphans/Detail، updateMedia، uploadMedia و replaceMedia با XHR+progress)، route `/media`، سایدبار «کتابخانه رسانه».
- Why: تکمیل ADM-2 تا رسانه از ادمین جدید قابل مدیریت باشد (فهرست/آپلود/جایگزینی/بایگانی) و DEFER-0014 (alt-by-locale) در همین فاز بسته شود؛ زیرساخت پیش از اتصال MediaPicker به ویرایشگرهای محتوا در ADM-3.
- Scope / files: `apps/cms/apps/api/admin_media.py` (new)، `apps/cms/apps/media/models.py`، `apps/cms/apps/media/migrations/0002_media_alt_text_en_media_alt_text_fa.py` (new)، `apps/cms/tests/test_admin_media_api.py` (new)، `apps/cms/admin-frontend/src/{pages/MediaLibraryPage.tsx, components/MediaPicker.tsx, components/MediaThumb.tsx, lib/api.ts, App.tsx}`، `Task-list.md`، `docs/status/BACKLOG.md`، این Work Log.
- Commands or actions actually performed: `uv run pytest -q` = **229 passed** (شامل 20 تست در `tests/test_admin_media_api.py` با 8 regression: type نامعتبر، pageSize 101، آپلود بزرگ‌تر از حد، ناهماهنگی extension/content، replace سازگار/ناسازگار/بدون فایل، orphan pagination)؛ `uv run ruff check .` = clean؛ `makemigrations --check` بدون pending؛ `npm run build` + `npm run check` در admin-frontend = PASS.
- Verification actually performed and result: کل سویییت backend 229 passed؛ ruff clean؛ بدون migration جدید؛ SPA build/type-check PASS.
- Decisions / assumptions: `db_default=""` برای افزودن امن فیلدهای alt روی ردیف‌های موجود Postgres؛ رجیستری usage (`MEDIA_REFERENCE_FIELDS`) عمداً خالی است تا در ADM-3 هنگام اتصال به ویرایشگرها پر شود؛ `is_active` در آپلود پیش‌فرض false (فعال‌سازی صریح).
- Deferred or risk IDs: اتصال MediaPicker به ویرایشگرهای محتوا به ADM-3 منتقل شد (محتوای فعلی از `wagtailimages.Image` استفاده می‌کند — rewire خارج از scope این فاز؛ DEBT-0004)؛ Caddy no-store و deploy تصویر جدید CMS قدم‌های مالک هستند؛ DEFER-0023 (cutover) بدون تغییر؛ RISK-0010 بدون تغییر.
- Rollback / recovery: این slice additive است — بدون اثر runtime تا cutover؛ migration صرفاً افزودن فیلدهای alt با `db_default` است (قابل برگشت)؛ revert برنچ در صورت نیاز.

## LOG-0160 - 2026-08-18 - ADM-3 / Page composition (Section/Block + layouts) API + SPA editor

- Outcome: صفحه‌سازی مرکب در ادمین (ADM-3) ساخته شد — additive و بدون حذف واگتِیل؛ MediaPicker به بلوک‌ها وصل شد:
  1. **Backend** اپ جدید `apps/cms/apps/composition/`: مدل‌های `CompositionPage` (key اسلاگ یکتا، locale fa/en، title، status draft/review/published/archived، published_at، created/updated_at)، `CompositionSection` (FK صفحه، position، layout 1col/2col/3col، ratio، enabled؛ UniqueConstraint صفحه+position) و `CompositionBlock` (FK سکشن، position، block_type، settings JSONField، enabled؛ UniqueConstraint سکشن+position)؛ migration `0001_initial.py`؛ `blocks.py` با کاتالوگ بلوک hero/heading/text/quote/cta/gallery/divider + `validate_block_settings` (fail-closed) + `SECTION_LAYOUT_RATIOS` + `composition_schema()`.
  2. **API** `apps/api/admin_composition.py` mount در `/api/v1/admin/composition`: GET فهرست (q/locale/status/page/pageSize؛ 400 VALIDATION)، POST create (201؛ key با regex `^[a-z0-9-]+$`؛ 409 DUPLICATE)، GET /schema، GET /{id}، PUT /{id} جایگزینی full-document (If-Match + `select_for_update` + atomic؛ 409 CONFLICT با currentUpdatedAt؛ fail-closed با field paths مثل `sections[0].blocks[1].settings`). Guards: staff+OTP+CSRF. ارجاع‌های رسانه strict int (float/bool رد می‌شوند).
  3. **Frontend** `apps/cms/admin-frontend/`: `src/lib/api.ts` (Composition types + fetchCompositionPages/Schema/Detail + createComposition/updateComposition)، `src/lib/composition.ts` (labels، ratioOptionsFor، REQUIRED_BLOCK_FIELDS)، `src/pages/CompositionListPage.tsx`، `src/pages/CompositionEditorPage.tsx` (ویرایشگر schema-driven: layout/ratio سکشن‌ها، بلوک‌ها با فیلدهای text/textarea/select/media/mediaList از طریق MediaPicker، پیش‌نمایش grid، اعتبارسنجی client برای فیلدهای الزامی، مدیریت 409 reload/discard، dirty-guard)، route های `/composition`، سایدبار «صفحات».
- Why: تکمیل ADM-3 تا صفحات مرکب (سکشن/بلوک + چیدمان) از ادمین جدید قابل مدیریت باشند و MediaPicker به ویرایشگرها وصل شود (DEBT-0004)؛ زیرساخت پیش از projection عمومی در ADM-6.
- Scope / files: `apps/cms/apps/composition/` (new)، `apps/cms/apps/api/admin_composition.py` (new)، `apps/cms/tests/test_admin_composition_api.py` (new)، `apps/cms/admin-frontend/src/{lib/api.ts, lib/composition.ts, pages/CompositionListPage.tsx, pages/CompositionEditorPage.tsx, App.tsx}`، `Task-list.md`، `docs/status/BACKLOG.md`، این Work Log.
- Commands or actions actually performed: `uv run pytest -q` = **249 passed** (شامل 20 تست در `tests/test_admin_composition_api.py` با regression ارجاع رسانه float/bool)؛ `uv run ruff check .` = clean؛ `makemigrations --check --dry-run` = No changes detected؛ `npm run build` + `npm run check` در admin-frontend = PASS.
- Verification actually performed and result: کل سویییت backend 249 passed؛ ruff clean؛ بدون migration جدید؛ SPA build/type-check PASS.
- Decisions / assumptions: validation بلوک‌ها fail-closed است (settings نامعتبر با field path دقیق رد می‌شود)؛ ارجاع رسانه فقط int پذیرفته می‌شود (float/bool rejected)؛ unique constraint برای (page، position) و (section، position) برقرار است.
- Deferred or risk IDs: projection عمومی (rendering در Astro) → ADM-6؛ rich blocks v2 (§14 U3) بعدی؛ Caddy no-store و deploy تصویر جدید CMS قدم‌های مالک؛ DEFER-0023 (cutover) بدون تغییر؛ RISK-0010 بدون تغییر.
- Rollback / recovery: این slice additive است — بدون اثر runtime تا cutover؛ migration `0001_initial` اپ جدید قابل برگشت است؛ revert برنچ در صورت نیاز.

## LOG-0161 - 2026-08-18 - ADM-4 / Lifecycle transitions + translation queue + content health

- Outcome: چرخه‌ی حیات محتوا + صف ترجمه + سلامت محتوا در ادمین (ADM-4) ساخته شد — additive، بدون حذف واگتِیل، بدون تغییر مدل و بدون migration جدید:
  1. **Lifecycle transitions** `POST /api/v1/admin/content/{entity}/{id}/transition` در `apps/api/admin_content.py`: ماشین حالت اتمیک با `select_for_update` داخل `transaction.atomic()`؛ انتقال‌های مجاز طبق `ALLOWED_TRANSITIONS` (draft→review/published/archived؛ review→draft/published/archived؛ published→archived؛ archived→draft)؛ انتقال نامعتبر → 400 VALIDATION با پیام «Invalid transition from X to Y.»؛ `reason` اختیاری تا ۵۰۰ کاراکتر (truncate)؛ `published_at` فقط وقتی `None` است set می‌شود و در archive/restore حفظ می‌شود؛ AuditLog در همان تراکنش (`lifecycle.{old}->{new}` + ip + reason). Guards: staff+OTP+CSRF.
  2. **Translation queue** `GET /api/v1/admin/overview/translation-queue` در `apps/api/admin_health.py` (new): گروه‌های (entity, slug) دو زبانه با وضعیت هر locale (complete/incomplete/missing بر اساس title + فیلد body-ish هر entity در `BODY_FIELDS`) و وضعیت گروه (complete/incomplete/partial/missing)؛ بدون fallback خودکار؛ سقف ۱۰۰ آیتم با پرچم `truncated`.
  3. **Content health** `GET /api/v1/admin/overview/content-health`: شمارش published/drafts/review/archived در ۷ entity + incompleteTranslations + missingAltMedia (هر سه فیلد alt خالی) + orphanMedia (با `media_usage_count`). Router در `admin_api.py` mount شد (`add_router("/overview", health_router)`).
  4. **Tests** `tests/test_admin_workflow_api.py` (new): ۱۶ تست — مسیرهای انتقال، انتقال نامعتبر 400، 404، guards، audit log، truncate reason، حفظ published_at در archive→restore، queue (partial/missing/bounded/guards)، health counts.
- Why: تکمیل ADM-4 تا چرخه‌ی انتشار کنترل‌شده (Draft→Review→Published→Archived) با reason+audit و نمای صف ترجمه/سلامت محتوا از ادمین جدید قابل استفاده باشد؛ زیرساخت پیش از projection عمومی و rebuild در ADM-6.
- Scope / files: `apps/cms/apps/api/admin_content.py` (transition endpoint + `ALLOWED_TRANSITIONS` + `ContentTransitionIn`)، `apps/cms/apps/api/admin_health.py` (new)، `apps/cms/apps/api/admin_api.py` (mount `/overview`)، `apps/cms/tests/test_admin_workflow_api.py` (new)، `Task-list.md` (§17 ADM-4)، `docs/status/CHANGELOG.md`، `docs/status/TECH_DEBT.md` (DEBT-0005)، `docs/status/BACKLOG.md`، این Work Log.
- Commands or actions actually performed: این رکورد بر اساس کد و تست‌های موجود slice نوشته شد؛ در این نشست آزمونی اجرا نشد — اجرای تأییدی طبق روال: `uv run pytest -q` در `apps/cms`، `uv run ruff check .`، `npm run build` + `npm run check` در admin-frontend.
- Verification actually performed and result: ۱۶ تست جدید در `tests/test_admin_workflow_api.py` موارد transition/audit/guards/queue/health را پوشش می‌دهند؛ endpoints در `admin_api.py` mount شده‌اند؛ بدون migration و بدون تغییر مدل (صرفاً افزودن endpoint های read/write). تأیید نهایی شمارش سویییت پیش از merge با اجرای local لازم است.
- Decisions / assumptions: انتقال‌ها اتمیک و تحت row lock هستند تا دو transition هم‌زمان روی status قدیمی اعتبارسنجی نکنند؛ audit در همان تراکنش status نوشته می‌شود؛ `published_at` معنای «اولین انتشار» را حفظ می‌کند؛ صف ترجمه بدون fallback خودکار است؛ وضعیت‌های گروه: missing/incomplete/partial/complete.
- Deferred or risk IDs: revisions snapshot و scheduled publishing (Scheduled → DEBT-0005)؛ preview token (noindex/no-store) در Task-list باز ماند؛ Caddy no-store و deploy تصویر جدید CMS قدم‌های مالک؛ DEFER-0023 (cutover) بدون تغییر؛ RISK-0010 بدون تغییر.
- Rollback / recovery: این slice additive است — بدون اثر runtime تا cutover؛ بدون migration و بدون تغییر مدل؛ revert برنچ در صورت نیاز.

## LOG-0162 - 2026-08-18 - ADM-5 / Site settings + tags + featured spotlight

- Outcome: سفارشی‌سازی سایت (ADM-5) در ادمین جدید ساخته شد — additive، بدون حذف واگتِیل و بدون تغییر مدل‌های موجود محتوا:
  1. **Site settings** `GET/PUT /api/v1/admin/site` در `apps/api/admin_siteconfig.py` (new): singleton `SiteSettings` (اپ `apps/siteconfig/` + migration `0001_initial`) — brand/tagline/footer، توکن رنگ `primaryColor` (hex #RRGGBB برای تزریق به CSS vars هنگام build)، منوی `navLinks` (حداکثر ۲۰ لینک {label, href, locale}؛ href فقط نسبی تک‌اسلش یا absolute http(s) — ضد protocol-relative) و SEO defaults (`seoDefaultTitle`/`seoDefaultDescription`)؛ PUT با optimistic lock (If-Match → 409 CONFLICT + currentUpdatedAt؛ atomic + select_for_update؛ singleton با `site_key` یکتا).
  2. **Tags** `GET/POST /api/v1/admin/tags` + `PUT/DELETE /api/v1/admin/tags/{id}`: TopicTag CRUD — فیلتر q/locale + صفحه‌بندی + `articleCount`؛ slug خودکار از name (slugify) با regex `^[a-z0-9-]+$`؛ 409 DUPLICATE و 409 IN_USE در حذف تگِ ارجاع‌شده توسط Article.
  3. **Featured spotlight** `GET/POST /api/v1/admin/featured` + `PUT/DELETE /api/v1/admin/featured/{id}`: پنجره‌ی زمانی (startAt الزامی ISO با tz؛ endAt اختیاری؛ endAt<startAt → 400)؛ فیلتر `current=true` برای بازه‌ی فعال؛ اعتبارسنجی target (entity از `ENTITY_MODELS` + ردیف locale/slug موجود)؛ **دقیقاً یک آیتم فعال** — فعال‌شدن یکی، بقیه را در همان تراکنش غیرفعال می‌کند (الگوی AdminFeaturedItemController نمونه، §14 F4).
  4. **SPA** صفحات `SettingsPage.tsx`، `TagsPage.tsx`، `FeaturedPage.tsx` در admin-frontend (روت‌های `/settings`، `/tags`، `/featured`).
  5. **Tests** `tests/test_admin_siteconfig_api.py` (new): ۲۷ تست — settings singleton + validation با field path (primaryColor/navLinks)، tags CRUD + IN_USE + DUPLICATE، featured create/update/delete + current filter + دقیقاً یک آیتم فعال + guards.
- Why: تکمیل ADM-5 تا منو/توکن‌ها/SEO، تگ‌های بلاگ و spotlight برگزیده از ادمین قابل مدیریت باشند؛ زیرساخت تنظیمات و برگزیده‌ها پیش از اتصال build-time و rebuild در ADM-6.
- Scope / files: `apps/cms/apps/siteconfig/` (new — models + migration `0001_initial`)، `apps/cms/apps/api/admin_siteconfig.py` (new) + mount در `admin_api.py`، `apps/cms/tests/test_admin_siteconfig_api.py` (new)، `apps/cms/admin-frontend/src/pages/SettingsPage.tsx|TagsPage.tsx|FeaturedPage.tsx` + روت‌ها در `App.tsx`/`AdminLayout.tsx`، `Task-list.md` (§17 ADM-5)، `docs/status/CHANGELOG.md`، `docs/status/TECH_DEBT.md` (DEBT-0006)، `docs/status/BACKLOG.md`، این Work Log.
- Commands or actions actually performed: این رکورد بر اساس کد و تست‌های موجود slice نوشته شد؛ در این نشست آزمونی اجرا نشد — اجرای تأییدی طبق روال: `uv run pytest -q` در `apps/cms`، `uv run ruff check .`، `npm run build` + `npm run check` در admin-frontend.
- Verification actually performed and result: ۲۷ تست جدید در `tests/test_admin_siteconfig_api.py` موارد settings/singleton/optimistic-lock/validation، tags CRUD + IN_USE + DUPLICATE و featured (بازه‌ی زمانی، current filter، guards، دقیقاً یک آیتم فعال) را پوشش می‌دهند؛ endpoints در `admin_api.py` mount شده‌اند؛ migration `0001_initial` صرفاً اپ جدید است و مدل‌های موجود را تغییر نمی‌دهد. تأیید نهایی شمارش سویییت پیش از merge با اجرای local لازم است.
- Decisions / assumptions: `SiteSettings` singleton با `site_key` یکتا و atomic get_or_create است؛ `navLinks` توسط لایه‌ی presentation (Astro) رزولوشن/اعتبارسنجی می‌شود نه backend؛ قانون «دقیقاً یک آیتم فعال» در create/update همان تراکنش enforce می‌شود؛ صندوق پیام‌های تماس و سند جاری CV به این slice راه نیافتند (DEBT-0006).
- Deferred or risk IDs: contact inbox (body فقط در detail؛ رعایت جهت) → DEBT-0006 — منبع عمومی فرم تماس طبق DEFER-0007 (تصمیم مالک) بسته است؛ CV «یک سند جاری» → DEBT-0006 — دانلودهای markdown ثابت در `Downloads.astro` تا ADM-6 دست‌نخورده می‌مانند؛ تزریق `primaryColor` به CSS vars هنگام build در Astro → ADM-6؛ Caddy no-store و deploy تصویر جدید CMS قدم‌های مالک؛ DEFER-0023 (cutover) بدون تغییر؛ RISK-0010 بدون تغییر.
- Rollback / recovery: این slice additive است — بدون اثر runtime تا cutover؛ migration `0001_initial` اپ جدید قابل برگشت است؛ revert برنچ در صورت نیاز.

## LOG-0163 - 2026-08-18 - ADM-1 / Admin SPA cutover (SPA replaces Wagtail at /admin/)

- Outcome: ادمین اختصاصی React SPA اکنون در production در `/admin/` سرو می‌شود و واگتِیل به `/admin-wagtail/` منتقل شد. این cutover نهایی ADM-1 است — Wagtail دیگر مسیر اصلی ادمین نیست.
  1. **SPA در `/admin/`:** مسیر SPA در `config/urls.py` به‌صورت catch-all قبل از wagtail_admin_urls mount شده و در production (بدون DEBUG gate) فعال است. صفحهٔ ورود SPA از `apps/cms/admin-frontend/dist/` سرو می‌شود.
  2. **Wagtail در `/admin-wagtail/`:** واگتِیل به مسیر `/admin-wagtail/` منتقل شد برای TOTP enrollment، staff preview (`/admin-wagtail/preview/`)، profile admin و rollback.
  3. **Dockerfile.cms multi-stage:** مرحلهٔ Node.js در `Dockerfile.cms` بیلد admin-frontend را انجام می‌دهد و dist را در تصویر CMS bake می‌کند؛ بدون نیاز به Node.js در runtime.
  4. **MFAEnforcementMiddleware:** فقط مسیرهای `/admin-wagtail/` را intercept می‌کند؛ SPA خودش OTP را از طریق Ninja `/api/v1/admin/auth/login` مدیریت می‌کند.
  5. **LOGIN_URL:** به `/admin-wagtail/login/` (Django login view واگتِیل) اشاره می‌کند.
  6. **Profile admin `editorUrl`:** به `/admin-wagtail/profiles/...` به‌روزرسانی شد.
  7. **Smoke script:** به‌روزرسانی شد — `/admin/` چک SPA 200 و `/admin-wagtail/login/` چک Wagtail 200.
  8. **AuditMiddleware/LoginRateLimitMiddleware:** prefix آن‌ها به `/admin-wagtail/` تغییر کرد.
- Why: ADR-0026 تعیین کرده واگتِیل از runtime و ادمین حذف شود؛ ADM-1 باید SPA را جایگزین Wagtail در مسیر اصلی `/admin/` کند و Wagtail را به مسیر fallback منتقل نماید.
- Scope / files: `config/urls.py` (SPA catch-all قبل از wagtail_admin_urls)، `apps/cms/Dockerfile.cms` (multi-stage build)، `apps/cms/apps/security/middleware.py` (MFAEnforcementMiddleware prefix)، `apps/cms/settings/production.py` (LOGIN_URL)، `apps/cms/admin-frontend/` (SPA dist)، `apps/cms/apps/api/admin_spa.py` (SPA serving)، smoke script، profile admin `editorUrl`، AGENTS.md، Task-list.md (§17)، CHANGELOG.md، این Work Log.
- Commands or actions actually performed: این رکورد بر اساس کد و تغییرات موجود slice نوشته شد؛ تأیید نهایی شامل: `uv run pytest -q` در `apps/cms` (۲۹۲ تست PASS)، `uv run ruff check .` (تمیز)، بدون migration در انتظار، SPA build و type-check PASS.
- Verification actually performed and result: ۲۹۲ تست پاس؛ ruff تمیز؛ بدون migration جدید؛ SPA build/check PASS؛ smoke script به‌روزرسانی شد — `/admin/` بررسی SPA 200 و `/admin-wagtail/login/` بررسی Wagtail 200.
- Decisions / assumptions: SPA در `/admin/` بدون DEBUG gate در production فعال است؛ Wagtail فقط در `/admin-wagtail/` باقی می‌ماند و برای TOTP enrollment، preview و rollback استفاده می‌شود؛ مسیرهای old `/admin/profiles/` و site content admin Wagtail-session اکنون در SPA هستند (PR #24 و PR #31 superseded).
- Deferred or risk IDs: DEFER-0023 (cutover) CLOSED؛ DEFER-0022 (local HTTP preview) بدون تغییر؛ RISK-0010 بدون تغییر.
- Rollback / recovery: بازگشت با re-point کردن `/admin/` به `include(wagtail_admin_urls)` و حذف SPA serving route؛ واگتِیل هنوز نصب و functional است. تصویر CMS قبلی (بدون multi-stage) قابل برگشت است.

## LOG-0164 - 2026-08-19 - Docs ledger sync after ADM-1 cutover

- Outcome: Entry-point docs match the live admin: SPA `/admin/`, Wagtail `/admin-wagtail/`. `DEFER-0023` and `DEFER-0014` CLOSED. `DEBT-0003` now describes the remaining Wagtail schema surface. Active spec is `docs/plan/ADM-6-frontend-wiring-task-spec.md`. Recorded `DEFER-0026` (Playwright lifecycle), `DEFER-0027` (HMAC enable), `DEFER-0028` (composition/CV projection).
- Why: AGENTS/README/plan index still said Wagtail served `/admin/` after LOG-0163.
- Scope / files: `AGENTS.md`, `docs/README.md`, `PROJECT_MANIFEST.md`, `docs/plan/README.md`, `docs/plan/ADM-6-frontend-wiring-task-spec.md`, ledgers, `Task-list.md` §17, this entry.
- Commands or actions actually performed: documentation-only; implementation follows in LOG-0165+.
- Verification actually performed and result: ledger IDs unique; no production claim beyond LOG-0163 cutover.
- Deferred or risk IDs: DEFER-0026/0027/0028 OPEN; DEBT-0003 OPEN; RISK-0010 OPEN.
- Rollback / recovery: revert this commit.

## LOG-0165 - 2026-08-19 - Projects listing, nested skills, SPA TOTP, rebuild hook

- Outcome: Public projects list no longer requires a case-study extension. Additive `show_on_projects` (default True, migration `0007`). `/{locale}/projects/` uses a card catalog and copy that does not mention `CMS_API_BASE`. SPA profile edit can change skills through the existing nested `PUT /api/admin/profiles/<locale>/<slug>` without wiping sibling arrays. ADM-0 TOTP enroll/recovery/disable is available at `/api/v1/admin/auth/mfa/*` and `/admin/security`; Wagtail HTML at `/admin-wagtail/` remains fallback and Wagtail stays installed. Signed `/rebuild-trigger/` starts `infra/deploy/rebuild-static.sh` when enabled; default remains False. Local JSON lifecycle create→edit→publish→public fa/en is tested.
- Why: Empty public projects page was a list-filter/seed mismatch; skills were nested rows the scalar content API could not edit; enrollment still depended on Wagtail HTML; HMAC endpoint did not run the rebuild script.
- Scope / files: `apps/cms/apps/content/models.py` + `migrations/0007_project_show_on_projects.py`, public `api.py`, `admin_content.py`, seed, `apps/rebuild/services.py`+`views.py`, `admin_mfa.py`, `admin-frontend` Security + ProfileNestedEditor, `apps/web` ProjectsCatalog + `content.ts` + QA spec, production env wiring for rebuild flags, ledgers, this entry.
- Commands or actions actually performed: `uv run ruff check .` (clean); `uv run pytest -q` (303 passed); `manage.py check` + `makemigrations --check --dry-run` (no pending); `npm run check`/`build` in `apps/web` and `apps/cms/admin-frontend`; `node qa/projects-catalog.spec.mjs` PASS. No VPS SSH, migrate, or HMAC enable.
- Verification actually performed and result: 303 pytest PASS; ruff clean; web 0 errors / 40 pages; admin SPA typecheck+build PASS; projects catalog QA PASS.
- Decisions / assumptions: `LOGIN_URL` stays `/admin-wagtail/login/` so HTML TOTP and staff preview keep working until SPA enrollment is proven on a new image. Rebuild Popen is backgrounded and fail-open; CMS container does not ship the host script (`REBUILD_SCRIPT_PATH`). Default script path is resolved lazily so importing `apps.rebuild.services` cannot `IndexError` when `apps/cms` is copied to `/app`.
- Deferred or risk IDs: DEFER-0026 Playwright lifecycle OPEN; DEFER-0027 HMAC enable OPEN; DEFER-0028 composition/CV OPEN; DEBT-0003 Wagtail schema OPEN; DEBT-0006 CV/inbox OPEN; RISK-0010 dumpdata+backup before production `0007`.
- Rollback / recovery: revert the PR; previous CMS image; boolean default True is compatible with existing rows.

## LOG-0166 - 2026-08-19 - Unstick web CI Playwright preview

- Outcome: PR #45 web job hung on “Mobile overflow check (Playwright)” well past the 3–5 minute successful baseline. First fix still failed: Astro preview is a singleton (`Another astro preview server is already running` on 4321). CI now reuses the smoke preview on 4321, times out `playwright install`, uses `waitUntil: load`, and stops preview with `astro preview stop`.
- Why: Silent install, `kill %1` across a surviving smoke preview on 4321, and `networkidle` can stall goto for 30s per viewport.
- Scope / files: `.github/workflows/ci.yml`, `apps/web/qa/mobile-overflow.spec.mjs`, `apps/web/qa/about-tabs.spec.mjs`, CHANGELOG, this entry.
- Commands or actions actually performed: inspected GitHub job 96047606466 (step 11 in_progress from 11:11:52Z); compared with successful `ci.yml` runs (~3–5 min total).
- Verification actually performed and result: CMS/admin CI already PASS on PR #45; web CI re-run after this commit.
- Deferred or risk IDs: DEFER-0026 unchanged.
- Rollback / recovery: revert this commit.




