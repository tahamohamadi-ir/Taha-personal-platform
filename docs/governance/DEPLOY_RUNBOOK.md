# Deployment Runbook — Static P1 (Language Gateway + bilingual landing)

> Status: Candidate. The mechanics below implement ADR-0017; the concrete paths
> and the production switch are finalized only after the P0A-01 read-only stack
> inventory and explicit owner approval. No deploy is performed by this file.

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

## Staging deploy (isolated, no production change)

1. P0A-01 inventory confirms the Caddy service unit, Caddyfile path and that the
   staging hostname still serves the ADR-0015 503 placeholder.
2. Stage the artifact under `$SITE_ROOT/releases/`, verify `dist/health.json`
   and locale roots locally, then point `current` at the new release.
3. Add/replace the `staging.tahamohamadi.ir` site block with static serving from
   `current`, following backup → `caddy validate` → reload (ADR-0015 procedure).
4. Smoke from outside: gateway `/`, `/fa/`, `/en/`, `/health.json`, `/404`,
   assets, and confirm `noindex`/robots behavior for staging. Confirm the
   production hostname and legacy routes are unchanged.

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
- Staging must stay out of public search (`noindex`); production uses the index
  policy from the artifact's `robots.txt`/`sitemap.xml`.
- Security headers (CSP etc.) are validated against the real assets/fonts before
  being enabled; no permissive/placeholder header is shipped.

## Observability (P0A-11)

- Caddy access/error logs are read without exposing secrets/PII; retention is
  bounded.
- A basic external uptime check targets `/health.json`; 5xx visibility, disk
  threshold and deploy-version lookup have an owner.
