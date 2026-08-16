# Deployment Runbook — Static P1 (Language Gateway + bilingual landing)

> Status: Active for production. Staging is decommissioned (ADR-0025, 2026-08-15); the
> mechanics below implement ADR-0017. Production deploys require owner approval, a
> documented rollback path and a passing release gate (CI web + cms workflows +
> production smoke; see `RELEASE_POLICY.md`). No deploy is performed by this file.

## Principles

- The public site is a plain static artifact served by Caddy; there is no
  Node.js runtime, no database, no container restart and no migration in P1.
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
