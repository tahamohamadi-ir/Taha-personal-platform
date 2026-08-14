# ADR-0015: Isolated staging placeholder before application deployment

**Status:** Accepted; placeholder applied and externally verified on 2026-08-14.  
**Date:** 2026-08-14

## Context

The production VPS already runs an unrelated live frontend/backend/PostgreSQL Compose stack. `staging.tahamohamadi.ir` now resolves through Cloudflare to the same origin, but Caddy has no staging hostname route and Cloudflare returns 525.

## Decision

- Add a dedicated Caddy site block for `staging.tahamohamadi.ir` that uses Caddy's existing automatic public-certificate management and returns a static HTTP 503 response.
- Do not proxy the staging hostname to the existing production frontend, backend or PostgreSQL services.
- Back up the current Caddyfile, validate the candidate configuration, reload only after validation, and prove both direct-origin and Cloudflare responses.
- Keep Cloudflare zone encryption at Full during this temporary placeholder. Move to Full (strict) only after every origin hostname has a matching valid public or Cloudflare Origin CA certificate and the owner approves the zone-wide change.

## Consequences

- The public staging hostname becomes deliberately unavailable rather than leaking or sharing production data.
- The initial 525 is replaced by an explicit external 503. Direct-origin TLS probe investigation remains required before Full (strict) or a real staging application.
- A future real staging app must remain an isolated Compose project with independent data/configuration; it can replace this placeholder only after capacity and backup gates pass.
- Rollback is restoring the timestamped Caddyfile backup, validating it and reloading Caddy.
