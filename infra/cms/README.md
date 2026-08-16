# infra/cms — candidate deployment files (NOT-APPLIED)

All files here are candidates only: no CMS runtime is deployed anywhere and none
of them may be used until MFA enforcement, the `RISK-0003` DB-import evidence and
a separate deploy Task Spec authorize the runtime (see `RISK-0009`).

## Why the public web site is NOT containerized (decision)

The public site (`apps/web/`) is a **static Astro artifact** served directly by
Caddy from `/opt/taha/site/current`. It has no runtime: no Node.js process, no
database, no container restart and no migration. Containerizing it would add an
image build, a registry pull and a container lifecycle on the VPS with zero
runtime benefit — so the static-on-Caddy deployment stands as the honest, lower
cost option. No Docker image exists for the web app and none is planned. The
old pre-existing frontend/backend containers have no role in the current site
(see `RISK-0004`, closed 2026-08-16; decommission runbook:
`infra/deploy/decommission-old-stack.md`).

## What the CMS candidates would deploy (when the gate opens)

Capacity is **resolved**: the owner decided 2026-08-15 to keep the 4 GiB VPS
plan (`RISK-0007` CLOSED), so the CMS runtime co-hosts on the same host with
the static site and Caddy. The remaining blockers are process gates
(`RISK-0009`), not capacity.

When a deploy Task Spec authorizes the runtime, these files deploy:

- `Dockerfile.cms` — multi-stage image for `apps/cms/` (Django 5.2.9 / Wagtail
  7.4.2 / Django Ninja 1.6.2 on Python 3.12); build context is the repository
  root; runs non-root (`uid 10001`); build-time-only dummy env for
  `collectstatic`; gunicorn on 0.0.0.0:8000.
- `docker-compose.cms.yml` — `db` (postgres:17-alpine, no published port) and
  `cms` services on the private `cms_internal` network with conservative
  resource limits (512 MB / 0.50 CPU each); Caddy joins that network and
  reverse-proxies `/admin/*` and `/health/*` only.
- `Caddyfile.cms.snippet` — illustrative reverse proxy snippet for the site
  block; NOT applied to the live Caddyfile.

Secrets (`DJANGO_SECRET_KEY`, `POSTGRES_*`, …) come from `infra/cms/.env` at
runtime — never baked into images and never committed.
