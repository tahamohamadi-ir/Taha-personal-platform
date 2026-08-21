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
  ├── /admin* /static* /api* /media* /health/ /admin-wagtail* → cms:8000
  └── ACME data in Docker volume `caddy_data`
```

- Image source of truth: `ghcr.io/<owner>/taha-cms:<git-sha>` (CI:
  `.github/workflows/ci-cms-image.yml`). Pin `CMS_IMAGE` to a sha for deploy and
  rollback; do not treat `:latest` as the release identity.
- Operator script: `infra/deploy/update-cms.sh` (pull → up → migrate → loopback
  health). Caddy snippet: `infra/cms/Caddyfile.cms.snippet` (owner sudo apply).
- Smoke after proxy is live: `infra/deploy/smoke-cms.sh https://tahamohamadi.ir`.
- **CD CMS migrate (ADR-0027 Slice 2 / RISK-0012):** not on every push. Prefer
  Actions → **CD — Deploy to production** → Run workflow → enable `migrate_cms`,
  set `cms_image_tag` to a GHCR `taha-cms` sha that already exists (after **CMS
  image** workflow). That runs `cd-cms-migrate.sh` on the VPS (backup → update →
  smoke). Manual equivalent:

  ```bash
  cd /home/deploy/cms-repo
  git pull --ff-only origin main
  export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:<sha>
  bash infra/deploy/cd-cms-migrate.sh
  ```

  Unattended CD migrate only after an attended PASS and repo variable
  `CMS_CD_AUTO_MIGRATE=true`. Rollback: `CMS_IMAGE=<previous>` + `update-cms.sh`.
  **Do not enable `CMS_CD_AUTO_MIGRATE` from this Slice 4 work.**
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
  Committed `profile.snapshot.json` remains the build fallback when the API is down.
- Details: `infra/cms/README.md`, `docs/plan/P3-cms-versioned-cicd-task-spec.md`.

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