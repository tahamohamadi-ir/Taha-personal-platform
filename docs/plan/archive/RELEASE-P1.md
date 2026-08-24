# Release decision: P1 / static Language Gateway + bilingual landing (R2)

> Filled from the release-decision template in `docs/governance/RELEASE_POLICY.md`
> ("قالب تصمیم release") by S-Plan task A3. All data below is real and verifiable;
> evidence pointers map to `docs/status/WORK_LOG.md` entries or live commands.

## Release decision: P1 / Language Gateway + bilingual landing (static-only)

- Type: STANDARD (new public routes `/`, `/fa/`, `/en/` and static assets; no auth,
  no data, no secret, no migration)
- Release DoD: PASS (blocking checks done; production smoke PASS — LOG-0078)
- Completion DoD: NOT MEASURED (deferred/risk items remain enumerated and open; no
  Completion percentage is claimed)

## Blocking checks and evidence

- `astro check` → 0 errors: `npm run check` → `0 error / 0 warning / 0 hint`
  (LOG-0063; also LOG-0054, LOG-0055, LOG-0058, LOG-0061, LOG-0062).
- Build → Complete: `npm run build` PASS in `apps/web/` (LOG-0063; CI runs the same
  check/build via `.github/workflows/ci.yml`).
- Staging smoke: `bash infra/deploy/smoke.sh https://staging.tahamohamadi.ir --expect-noindex`
  → 8 PASS / exit 0 (LOG-0064, LOG-0065). Re-run during this task (LOG-0076):
  `PASS root /`, `PASS locale /en/`, `PASS locale /fa/`, `PASS robots.txt`,
  `PASS sitemap.xml`, `PASS nonexistent-qa`, `PASS health.json body`,
  `PASS noindex /` — exit 0.
- CI green on `main`: LOG-0059 (GitHub Actions PASS); live check during this task
  (LOG-0076): `gh run list --branch main` → latest runs `completed success` on
  `main` (including the pushed HEAD `fa3c813`).
- Rollback path documented: `docs/governance/DEPLOY_RUNBOOK.md` §Rollback
  (restore timestamped Caddyfile backup, `caddy validate`, reload; and/or point
  `current` back to the previous release).

## Staging/prod smoke path

- Staging: `bash infra/deploy/smoke.sh https://staging.tahamohamadi.ir --expect-noindex`
  → 8 PASS (LOG-0064, LOG-0065; re-run LOG-0076).
- Production (post-switch, task A4, owner executes first):
  `bash infra/deploy/smoke.sh https://tahamohamadi.ir` (no `--expect-noindex` flag).

## Deployed artifact (staging, verified live)

- `ssh taha-nl "cat /opt/taha/site/deploy.log"` (read-only):
  `2026-08-15T07:00:36Z staged release-a2720d9 49cf1d21`
  `2026-08-15T07:29:53Z staged release-d55d44e e49e46c7`
- Served artifact (verbatim from `deploy.log` tail / `current` symlink):
  **release-d55d44e** / checksum **e49e46c7**
- `readlink /opt/taha/site/current` → `/opt/taha/site/releases/release-d55d44e`
- `releases/` contains: `release-a2720d9`, `release-d55d44e`
- `release-d55d44e/health.json` → `{"status":"ok","service":"static","version":"0.1.0"}`
- Production live: https://tahamohamadi.ir on **release-d55d44e** (checksum `e49e46c7`) since 2026-08-15; **release-d7db929** (contrast fix) staged for update, not yet deployed.
- Note (pending verification flag): the task prompt referenced `release-fa3c813`,
  which does NOT match the served artifact on staging. The verified served release
  is `release-d55d44e` (checksum `e49e46c7`). `release-fa3c813` (built from HEAD,
  same site content) is staged on the server for the production switch; A4 should
  reference the fresh artifact `release-fa3c813`.

## Open risk/deferred IDs (verbatim from the current ledgers; status NOT changed)

| ID | Status (verbatim) | One-line mitigation/fallback |
|---|---|---|
| RISK-0001 | CLOSED | Gate decision recorded; scaffold limited to static P1; CMS/DB/contact persistence remain gated to P3. |
| RISK-0004 | IN PROGRESS | Placeholder retained; real staging only with independent Compose/data/config; direct-origin TLS and stack rollback checked before Full(strict)/deploy. |
| RISK-0005 | OPEN | Inventory pending packages and maintenance/rollback window; then controlled update with service smoke. |
| RISK-0006 | OPEN | Determine canonical port and client/VPN dependencies; controlled removal of extra listener/firewall with two healthy sessions and rollback. |
| RISK-0007 | BLOCKED | Inventory topology/volume and real consumption first; static-only staging or upgrade/alternative staging chosen from measured budget and rollback. |
| DEFER-0007 | OPEN | Keep contact CTA removed/inactive until an approved destination exists. |
| DEFER-0008 | CLOSED | Fonts self-hosted (Vazirmatn Variable / Inter Variable); future replacement only via specimen and ADR. |
| DEFER-0009 | OPEN | Release without `og:image`; add only with an approved asset and context. |
| DEFER-0010 | OPEN | Manual/automated browser check before deploy; main content stays readable without JS. |
| DEFER-0011 | OPEN | Direct-origin robots artifact correct; staging kept `noindex` via `X-Robots-Tag`; production robots deploy requires zone review. |
| DEFER-0012 | OPEN | Beautiful UI used only in an approved slice with source+MIT recorded; UI8 only after owner purchase/license. |

## Rollback/fallback

- Restore the exact timestamped Caddyfile backup printed by the production script,
  e.g. `cp -a /etc/caddy/Caddyfile.pre-prod-p1.<timestamp> /etc/caddy/Caddyfile`,
  then `caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy`,
  and/or point `current` back to the previous release:
  `ln -sfn $SITE_ROOT/releases/release-<previous> $SITE_ROOT/current`.
  (DEPLOY_RUNBOOK.md §Rollback; prod-p1.sh backup suffix `.pre-prod-p1.` per LOG-0075.)
- Legacy Compose containers stay running throughout for rollback; the production
  switch replaces ONLY the `tahamohamadi.ir` site block.

## Owner approval (required, NOT granted by this record)

- This record does not itself authorize deployment.
- Status 2026-08-15: the owner EXECUTED the production switch directly by
  editing the `taha_application_routes` snippet in `/etc/caddy/Caddyfile`
  (proxies replaced with `root * /opt/taha/site/current` + `file_server`).
  `tahamohamadi.ir` now serves the static P1 site; production smoke → 7 PASS
  (LOG-0078). Served release: `release-d55d44e` (checksum `e49e46c7`).
- `infra/deploy/prod-p1.sh` is superseded for this Caddyfile (it rewrites the
  whole `tahamohamadi.ir` block, which would drop the owner's `/fonts` and
  `/presentation` handlers); updates are now done with an atomic `current`
  symlink switch, no Caddyfile change.

## Preconditions

- Production host `tahamohamadi.ir` currently serves the LEGACY Compose stack
  (frontend/backend/PostgreSQL), untouched (RISK-0004; LOG-0020, LOG-0059, LOG-0060).
- This release replaces ONLY the `tahamohamadi.ir` site block in Caddy; `www`,
  `85.192.29.196` and all other blocks remain untouched (LOG-0075).
- No sudo, no SSH write, no production change was performed by this task.
