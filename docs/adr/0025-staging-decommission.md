# ADR-0025: Staging decommissioning (staging.tahamohamadi.ir removed)

**Status:** Accepted (2026-08-15, owner).  
**Date:** 2026-08-15

## Context

ADR-0015 established an isolated Caddy placeholder for `staging.tahamohamadi.ir`; the static P1 site was later served on both staging and production. The owner decided to fully decommission staging: development and deployment now happen directly on `tahamohamadi.ir`, and the staging Caddy block was removed on the VPS (owner, sudo, with the deploy user account) with the staging DNS record removed if present.

The production VPS was upgraded: Ubuntu 26.04 LTS, 2 vCPU, ~3910 MB RAM (~4 GiB), 30 GB disk (~17 GB free). It co-hosts the static site and the existing live Compose stack (confirmed running on 2026-08-16: `taha-prod-frontend-1` on 127.0.0.1:13000, `taha-prod-backend-1` on 127.0.0.1:18080, `taha-prod-postgres-1`). A future CMS runtime will use the same host per the RISK-0007 resolution.

## Decision

- Remove the staging site block from the production Caddyfile (owner-executed, sudo, deploy user account) and remove the staging DNS record if present; no staging hostname is served anymore.
- The release gate no longer requires staging smoke: the gate is now CI (web + cms workflows) + production smoke only.
- Development and deployment happen directly on `tahamohamadi.ir`.
- Keep the 4 GiB plan: the owner's capacity decision (2026-08-15) is to keep the current VPS plan; the upgraded host co-hosts the static site and the existing stack, and a future CMS runtime uses the same host per RISK-0007 resolution.
- ADR-0015's staging placeholder route is superseded for the public hostname; any future isolated test environment requires a new ADR.

## Consequences

- `RISK-0007` is CLOSED (owner capacity decision 2026-08-15: keep the 4 GiB plan).
- `RISK-0009` remains BLOCKED: capacity is solved, but CMS runtime deploy still requires MFA enforcement, the RISK-0003 DB-import evidence and a separate deploy Task Spec.
- `DEFER-0011` is CLOSED: the Cloudflare staging robots edge behavior is moot; production robots is reviewed at deploy.
- Release policy: no staging smoke step; deploy mistakes are caught by CI (web + cms workflows) and production smoke.
- Rollback: restore the timestamped Caddyfile backup, validate the config and reload Caddy; the DNS record can be re-created if ever needed.
