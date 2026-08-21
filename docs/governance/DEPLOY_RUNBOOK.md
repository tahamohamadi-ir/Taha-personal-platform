# Deployment Runbook — Static P1 (Language Gateway + bilingual landing)

> Status: Active for production. Staging is decommissioned (ADR-0025, 2026-08-15); the
> mechanics below implement ADR-0017 as amended by **ADR-0027** (`web` nginx image
> is the target artifact; host Caddy until `DEFER-0031`). Production deploys
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

Canonical topology:

```text
Caddy (TLS)
  ├── public HTML (Slice 1+) → 127.0.0.1:13080 (nginx `web`; rollback: file_server on /opt/taha/site/current)
  ├── /admin* + /static*     → 127.0.0.1:18000
  └── /health/               → 127.0.0.1:18000   (NOT /health* — that steals /health.json)
```

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

  Rollback: `CMS_IMAGE=<previous>` + `update-cms.sh`.
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
