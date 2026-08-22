# Deployment Runbook — Static P1 (Language Gateway + bilingual landing)

> Status: Active for production. Staging is decommissioned (ADR-0025, 2026-08-15); the
> mechanics below implement ADR-0017 as amended by **ADR-0027** (`web` nginx image
> is the target artifact; host Caddy until owner completes `DEFER-0031` cutover —
> Compose `caddy` + profile `edge` is in repo). Production deploys
> require owner approval, a documented rollback path and a passing release gate
> (CI web + cms workflows + production smoke; see `RELEASE_POLICY.md`). No deploy
> is performed by this file.

## Principles

- There is no Node.js public runtime. HTML is built in CI and served by nginx
  (`web`) or, until Slice 1 cutover, by Caddy `file_server` from `current`.
- CMS migrate follows `prod-cms-update-migrate.sh` (not a P1 no-container rule).
- The existing live Compose stack (frontend/backend/PostgreSQL) is never reused,
  restarted or reverse-proxied by this project.
- A failed build or deploy never removes the currently served artifact; rollback
  restores the previous `current` pointer.

## Layout (ADR-0017)

```text
$SITE_ROOT/                      # project-owned, e.g. /opt/taha/site (finalize in P0A-01)
  releases/
    release-<version>-<checksum8>/   # immutable artifact directory
  current -> releases/release-<version>-<checksum8>
  deploy.log                        # version + timestamp, non-sensitive
```

- `current` is a symlink that Caddy follows. Switching it is the atomic-ish
  deploy step.
- Retention: keep `current` plus at least the previous working release. Older
  releases are pruned only with an explicit, listed target.

## Artifact

- Built by `npm run build` in `apps/web/` (CI produces the same `dist/`).
- **Container path (ADR-0027 Slice 1+):** the `web` nginx image bakes `dist/` at build
  time (`infra/web/Dockerfile.web`, `CMS_API_BASE` build-arg). Caddy serves public
  HTML from `127.0.0.1:13080` after web cutover; until then, `file_server` on
  `/opt/taha/site/current` remains the live path.
- Version marker: `apps/web/src/data/site.ts` `version` field; `dist/health.json`
  exposes `{status, service, version}` without secrets or internal paths.
- A checksum (`sha256sum`) of the artifact is recorded in `deploy.log` at deploy
  time for traceability.

## Staging decommissioned (ADR-0025)

`staging.tahamohamadi.ir` is fully decommissioned per [ADR-0025](../adr/0025-staging-decommission.md) (2026-08-15, owner): the staging Caddy site block was removed on the VPS (owner-executed, sudo, with the deploy user account) and the staging DNS record was removed if present. Development and deployment now happen directly on `tahamohamadi.ir`; the release gate is CI (web + cms workflows) + production smoke only — no staging smoke step is required. Rollback of the removal, if ever needed: restore the timestamped Caddyfile backup, `caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy`, and re-create the DNS record.

## Production deploy (owner approval required)

- Only the owner-approved artifact, with the practiced mechanics, is deployed.
- The production switch replaces the currently served site at
  `tahamohamadi.ir`/`www`; it requires owner authorization, a documented rollback
  path and a passing release gate (see `RELEASE_POLICY.md`).
- Post-switch smoke covers HTTPS/root/gateway/fa/en/assets/health/404/headers and
  the existing unrelated services.

## Rollback

```text
# restore previous release (from a root shell, exact path per P0A-01)
ln -sfn releases/release-<previous-version>-<checksum8> "$SITE_ROOT/current"
# then re-validate and reload Caddy
```

- Caddy config rollback: restore the timestamped backup, `caddy validate`, reload.
- A deploy failure before the pointer switch leaves `current` untouched.

## Headers and SEO (P0A-06)

- HTTPS redirect and compression are handled by Caddy.
- Staging is decommissioned (ADR-0025, 2026-08-15); production uses the index
  policy from the artifact's `robots.txt`/`sitemap.xml` (reviewed at deploy).
- Security headers (CSP etc.) are validated against the real assets/fonts before
  being enabled; no permissive/placeholder header is shipped.

## Observability (P0A-11)

- Caddy access/error logs are read without exposing secrets/PII; retention is
  bounded.
- A basic external uptime check targets `/health.json`; 5xx visibility, disk
  threshold and deploy-version lookup have an owner.
- External uptime check: an external uptime provider chosen by the owner
  performs an HTTP GET on `https://tahamohamadi.ir/health.json` every 5 minutes
  (free tier acceptable; agents create no accounts).
- Alert target: the owner's email (see password manager).
- Deploy-version lookup: `curl https://<host>/health.json` returns the served
  artifact version.
- 5xx visibility: the owner reviews the Caddy error log on alert; disk
  threshold: the owner checks `df -h /` monthly (30 GB disk, alert under 20%
  free).
- No agent may sign up for any monitoring service; provider selection and
  account creation are owner-only steps.

## Incident response

For SLO definitions, monitoring points, severity classification and incident
runbooks (static site and future CMS runtime), see
[INCIDENT_RUNBOOK.md](INCIDENT_RUNBOOK.md).

## Old pre-existing stack decommission (2026-08-16)

The old pre-existing Compose stack on the VPS (`taha-prod-frontend-1`,
`taha-prod-backend-1`, `taha-prod-postgres-1`; project at
`/opt/taha/repository/`) is being brought down by the owner. It has no role in
the current site: the production site is unaffected because Caddy serves only
the static artifact from `/opt/taha/site/current` and never reverse-proxies
those containers (RISK-0004, closed 2026-08-16).

- The step-by-step runbook is `infra/deploy/decommission-old-stack.md`.
- The OWNER executes the sudo steps (the `deploy` user's NOPASSWD sudo covers
  only `/opt/taha/bin/update-release.sh` and `/opt/taha/bin/caddy-apply.sh`).
- `docker compose down` runs WITHOUT `-v`: postgres volumes are preserved and
  the restic backups under `/opt/taha/backups` are never touched.
- This section is informational; it does not change the production deploy or
  rollback mechanics above.

## CMS runtime (Caddy + versioned image + Compose)

Canonical topology (host Caddy — default until DEFER-0031 live cutover):

```text
Caddy (TLS, systemd)
  ├── public HTML (Slice 1+) → 127.0.0.1:13080 (nginx `web`; rollback: file_server on /opt/taha/site/current)
  ├── /admin* + /static*     → 127.0.0.1:18000
  └── /health/               → 127.0.0.1:18000   (NOT /health* — that steals /health.json)
```

Canonical topology (Compose edge — after owner cutover, profile `edge`):

```text
Compose caddy (TLS, ports 80/443)
  ├── public HTML → web:8080
  ├── /admin* /staff* /static* /api* /media* /health/ → cms:8000
  └── ACME data in Docker volume `caddy_data`
```

Host and Compose Caddy must proxy **`/staff/*`** (Django staff HTML: login,
preview, MFA fallback after Wagtail removal / PR #69). Do **not** rely on
`/admin-wagtail/` — that path is retired. Canonical files:
`infra/caddy/Caddyfile`, `infra/caddy/Caddyfile.compose`,
`infra/cms/Caddyfile.cms.snippet`.

- Image source of truth: `ghcr.io/<owner>/taha-cms:<git-sha>` (CI:
  `.github/workflows/ci-cms-image.yml`). Pin `CMS_IMAGE` to a sha for deploy and
  rollback; do not treat `:latest` as the release identity.
- Operator script: `infra/deploy/update-cms.sh` (pull → up → migrate → loopback
  health). Caddy snippet: `infra/cms/Caddyfile.cms.snippet` (owner sudo apply).
- Smoke after proxy is live: `infra/deploy/smoke-cms.sh https://tahamohamadi.ir`.
- **CD CMS migrate (ADR-0027 Slice 2):** not on every push. Ordinary `main`
  pushes must not migrate Postgres. Leave repository variable
  `CMS_CD_AUTO_MIGRATE` **unset** (do not enable unattended migrate).

  **Owner checklist — attended CMS migrate**

  1. Confirm GHCR has `ghcr.io/tahamohamadi-ir/taha-cms:<sha>` (Actions → **CMS
     image** workflow green for that commit sha).
  2. GitHub → Actions → **CD — Deploy to production** → **Run workflow**.
  3. Set `migrate_cms` = `true`.
  4. Set `cms_image_tag` to that exact GHCR sha (required; do not invent a tag).
  5. Wait for job **CMS image migrate (gated)** to finish **success**.
  6. In that job’s log, confirm both lines: `cd-cms-migrate PASS` and
     `CMS smoke PASS` (`smoke-cms.sh`).

  First production attended PASS: Actions
  [32407698471](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32407698471)
  (`cms_image_tag=2e200fe`, LOG-0179). `RISK-0012` CLOSED on that evidence.

  Manual equivalent (SSH as `deploy`):

  ```bash
  cd /home/deploy/cms-repo
  git pull --ff-only origin main
  export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:<sha>
  bash infra/deploy/cd-cms-migrate.sh
  ```

  Rollback: `CMS_IMAGE=<previous>` + `update-cms.sh`. **Keep
  `CMS_CD_AUTO_MIGRATE` unset** (`RISK-0012` CLOSED for the attended path only;
  do not enable unattended migrate). See § OWNER_CUTOVER for the post-merge
  schema sequence (`content.0009`–`0012`).
- Superuser (owner interactive only):
  `docker compose -f infra/cms/docker-compose.cms.yml exec cms python manage.py createsuperuser`
  (`python` inside the image is the venv — Django is on `PATH`).
- TOTP (after image with LOG-0128): open `/admin/account/` → **Two-factor authentication**
  or `/admin/account/two-factor/`; scan QR; confirm code. Subsequent logins need the
  authenticator code. Rotate any password that bypassed validators.
- Static site deploy/rollback remains `update-release.sh` / `current` symlink until
  Caddy web cutover; after cutover, public HTML rollback is a previous `WEB_IMAGE`
  tag or `rebuild-web.sh` with a pinned git ref. CMS rollback is a previous
  `CMS_IMAGE` tag. Volumes are preserved on `compose down` without `-v`.
- **After publishing in admin (story, profile, article, etc.):** when Caddy proxies
  public routes to `127.0.0.1:13080`, rebuild the web container so Astro picks up
  live CMS content:

  ```bash
  cd /home/deploy/cms-repo
  git pull --ff-only origin main
  bash infra/deploy/rebuild-web.sh
  ```

  Uses loopback `CMS_API_BASE=http://127.0.0.1:18000` by default (no public edge
  `/api/` required). Optional override: `CMS_API_BASE=https://tahamohamadi.ir`.
  Loopback smoke: `curl -fsS http://127.0.0.1:13080/health.json`. Public smoke
  runs automatically when `https://tahamohamadi.ir` is reachable from the VPS.
  While Caddy still uses `file_server`, also run `rebuild-static.sh` or rely on
  CD until cutover is complete.
- After CMS profile schema or seed changes, run `update-cms.sh` with a pinned image,
  verify `content.0005`/`0006` applied, run `import_profile_seed`, then rerun CD on
  `main` (or trigger `cd.yml`) so static About builds from live `/api/profiles/*`.
  The VPS has no Node — use CD, not `rebuild-static.sh`, on the server.
  **CMS origin honesty (ADR-0027 Slice 3):** production/CD builds set `CMS_API_BASE`.
  Transport, timeout, or 5xx from that origin **fails** `npm run build` — do not ship
  HTML that silently substitutes committed `profile.snapshot.json`. Snapshot is only
  for local/offline builds when `CMS_API_BASE` is unset. A successful empty published
  list must stay empty (no snapshot override).
- Details: `infra/cms/README.md`, `docs/plan/P3-cms-versioned-cicd-task-spec.md`.

## OWNER_CUTOVER — post-merge production gates

Single ordered owner checklist after the 2026-08-20/21 merges on `main`
(revisions/schedule, entity stories, Media rewire, RichText→TextField, HMAC
rewire, Slice 4 Compose Caddy in repo, **Wagtail uninstall PR #69** /
`DEBT-0003` CLOSED). Agents must not invent PASS for VPS steps.
**Never set `CMS_CD_AUTO_MIGRATE=true`.**

### Evidence snapshot (checked against Actions, not assumed)

| Gate | Ledger | Status | Evidence |
|---|---|---|---|
| Slice 2 attended CD migrate **path** | `RISK-0012` | **CLOSED** | workflow_dispatch [32407698471](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32407698471) job **CMS image migrate (gated)** success (`cms_image_tag=2e200fe`, LOG-0179 / LOG-0180). Auto-migrate stays **unset**. |
| Wagtail package removed (repo+prod image) | `DEBT-0003` / `RISK-0010` | **CLOSED** | PR [#69](https://github.com/tahamohamadi-ir/Taha-personal-platform/pull/69); LOG-0193; live `taha-cms:65d6c91` + migrate/smoke PASS [32554382271](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32554382271) (LOG-0196). |
| Production schema `content.0009`–`0012` (+ `siteconfig.0002`) | `RISK-0010` | **CLOSED** | Attended re-dispatch [32554382271](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32554382271) (`cms_image_tag=65d6c91`): `backup_ok`, `CMS smoke PASS`, `cd-cms-migrate PASS`. Prior attempt [32554028708](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32554028708) applied schema then failed SPA smoke (fixed in #71 / LOG-0195). Live image `taha-cms:65d6c91`. |
| HMAC rebuild enable | `DEFER-0027` | **OPEN** | Code targets `rebuild-web.sh`; `REBUILD_TRIGGER_ENABLED` remains False until owner smoke + enable. |
| Compose Caddy TLS edge | `DEFER-0031` / `RISK-0013` | **OPEN** | Repo Slice 4 ready; live edge remains host systemd Caddy until owner cutover below. Caddy must already proxy `/staff/*` before no-Wagtail image is live. |
| Scheduled-publish timer | (ops; `DEBT-0005` code CLOSED) | **OPEN** | Units in `infra/cms/taha-publish-scheduled-content.*`; no install attestation on VPS. |

Suggested CMS image pin remains `65d6c91`
([CMS image run 32552758418](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32552758418)).
Later `main` commits that are docs/smoke-only (e.g. #70/#71) may lack a matching `taha-cms:<sha>` tag — pin the last green **CMS image** sha.

### Required sequence (owner)

1. **dumpdata + backup** (`RISK-0010`): **before** deploying the no-Wagtail CMS
   image and before any schema migrate. Take a content `dumpdata` and confirm
   restic/daily backup posture. Prefer also letting `cd-cms-migrate.sh` write
   its pre-migrate `pg_dumpall` under the deploy-writable backup root.
2. **Caddy `/staff/*` proxy** (required for PR #69 runtime): ensure live host
   Caddy includes `handle /staff/*` → `127.0.0.1:18000` (same pattern as
   `/admin/*`). `/admin-wagtail/` alone is **not** sufficient after the
   no-Wagtail image. Apply from `infra/caddy/Caddyfile` /
   `infra/cms/Caddyfile.cms.snippet` with timestamped backup +
   `caddy validate` + reload. Smoke expects `/staff/login/` (`smoke-cms.sh`).
3. **Deploy no-Wagtail CMS image** (pin GHCR sha from post-#69 `main`) **and**,
   if not already applied, **attended CD migrate** for `content.0009` → `0010`
   → `0011` → `0012` (and `siteconfig.0002` if not yet applied) in that same
   pinned image:
   - Actions → **CD — Deploy to production** → **Run workflow**
   - `migrate_cms=true` when schema is still behind (skip inventing PASS if
     migrate was left skipped on ordinary pushes)
   - `cms_image_tag=<exact GHCR sha>` (do not invent)
   - Confirm job **CMS image migrate (gated)** **success** and log lines
     `cd-cms-migrate PASS` + `CMS smoke PASS` when migrate was requested
   - Or manual: `CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:<sha>` +
     `bash infra/deploy/cd-cms-migrate.sh` as `deploy`
4. **Verify** inside CMS: migrations applied
   (`content.0009`…`0012`, `siteconfig.0002` as applicable); SPA `/admin/`
   login + `/staff/login/` + `smoke-cms.sh` PASS; no dependency on
   `/admin-wagtail/`.
5. **`rebuild-web.sh`** so public HTML picks up new schema/projections:

   ```bash
   cd /home/deploy/cms-repo
   git pull --ff-only origin main
   bash infra/deploy/rebuild-web.sh
   ```

6. **Install scheduled-publish timer** (needed for `scheduled` → published):

   ```bash
   sudo install -m 755 infra/cms/publish-scheduled-content.sh /usr/local/sbin/taha-publish-scheduled-content
   sudo install -m 644 infra/cms/taha-publish-scheduled-content.service /etc/systemd/system/
   sudo install -m 644 infra/cms/taha-publish-scheduled-content.timer /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now taha-publish-scheduled-content.timer
   systemctl list-timers 'taha-publish-scheduled-content*'
   ```

7. **Optional — HMAC enable** (`DEFER-0027`): only after loopback
   `rebuild-web.sh` smoke PASS and a rehearsal that CMS can invoke the signed
   `/rebuild-trigger/` path. Keep trigger disabled until then.
8. **Optional — Caddy edge cutover** (`DEFER-0031` / `RISK-0013`): follow the
   section below; set `CADDY_EDGE=compose` only after smoke PASS. Compose
   Caddyfile must proxy `/staff/*` (not `/admin-wagtail/`).
9. **Never enable `CMS_CD_AUTO_MIGRATE`.** Leave the variable unset; use
   `workflow_dispatch` `migrate_cms=true` for each production schema change.

Detail sections for migrate mechanics, HMAC, and Caddy cutover remain below/above;
this section is the single post-merge order of operations.

## Caddy-in-Compose cutover (ADR-0027 Slice 4 / DEFER-0031 / RISK-0013)

Repo work is ready; **owner-attended VPS cutover** is the gate for live TLS.
Agents must not SSH to production for this step. Do not enable
`CMS_CD_AUTO_MIGRATE` as part of this cutover.

### Preconditions

- `web` and `cms` healthy on loopback (`13080` / `18000`).
- Repo pulled on VPS (`/home/deploy/cms-repo`) including `Caddyfile.compose` and
  compose service `caddy` (profile `edge`).
- Maintenance window accepted; Cloudflare remains Full (or Full strict only if
  origin certs stay valid).

### Cutover (owner)

1. Backup host Caddyfile:
   `sudo cp -a /etc/caddy/Caddyfile "/etc/caddy/Caddyfile.bak-$(date +%Y%m%d%H%M%S)"`
2. Optional: seed Compose ACME volume from host Caddy data dir if you want to
   avoid a fresh certificate issuance (path varies; common:
   `/var/lib/caddy`). If unsure, let Compose Caddy obtain certs via HTTP-01
   after host Caddy stops (brief TLS gap possible).
3. Stop host Caddy (ports must free): see `infra/caddy/HOST-CADDY-DISABLE.md`
   (`sudo systemctl disable --now caddy`).
4. Start Compose edge:
   ```bash
   cd /home/deploy/cms-repo
   docker compose -f infra/cms/docker-compose.cms.yml --profile edge up -d caddy
   bash infra/deploy/caddy-compose-reload.sh
   ```
5. Smoke: `bash infra/deploy/smoke-cms.sh https://tahamohamadi.ir` and
   `bash infra/deploy/smoke.sh https://tahamohamadi.ir`.
6. Only after smoke PASS: set GitHub repository variable **`CADDY_EDGE=compose`**
   so CD reloads Compose Caddy instead of calling `caddy-sync.sh`.
7. Record evidence in `WORK_LOG` and close `DEFER-0031` / resolve `RISK-0013`.

### Rollback rehearsal (restore host Caddy)

Practice before or immediately after a failed cutover:

```bash
cd /home/deploy/cms-repo
docker compose -f infra/cms/docker-compose.cms.yml --profile edge stop caddy
# Restore the timestamped backup from step 1 (use the real bak name):
sudo cp -a /etc/caddy/Caddyfile.bak-YYYYMMDDHHMMSS /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl enable --now caddy
# Clear compose CD gate if it was set:
#   GitHub → Settings → Variables → delete or unset CADDY_EDGE
bash infra/deploy/smoke-cms.sh https://tahamohamadi.ir
```

Host Caddy again proxies loopback `13080`/`18000`. Compose `web`/`cms` stay up.