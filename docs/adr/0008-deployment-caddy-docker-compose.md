# ADR-0008: Deployment baseline — Docker Compose and Caddy

**Status:** Accepted for P0-A implementation; existing live Caddy and Compose stack audited on 2026-08-14, project-specific Compose/Caddy configuration not yet provisioned.  
**Date:** 2026-08-14

## Context

Production is a 1 vCPU / 2 GB RAM Ubuntu VPS. The public site must remain static-first, support staging and production, and have a simple rollback path without introducing Kubernetes or microservices.

## Decision

- Use Caddy for HTTPS, HTTP-to-HTTPS redirect, static artifact serving and reverse proxying `/api/` and `/admin/` when the CMS exists.
- Use Docker Compose as the deployment orchestrator in P0-A.
- Serve public Astro artifacts directly from Caddy; do not require a Node.js public runtime.
- Keep staging at `staging.tahamohamadi.ir` and production at `tahamohamadi.ir`.
- Provision only Caddy initially; add Django and PostgreSQL only when the approved phase requires them.

## Consequences

- Compose/Caddy files, DNS, TLS, health check, rollback and resource limits remain P0-A deliverables.
- No Gitea, CI runner, Redis, Celery, search engine or graph database is installed on this VPS.
- The server must be audited and its exposed root credential rotated before access or deployment.
