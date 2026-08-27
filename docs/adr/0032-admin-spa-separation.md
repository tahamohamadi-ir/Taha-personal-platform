# Admin SPA Separation — Plan (ADR-0032 draft)

**Goal:** `taha-admin` becomes a fully independent frontend project (own repo location, own CI, own release artifact) — the public site (`apps/web`) and CMS backend (`apps/cms` Django) must not depend on its source to build/deploy.

## Current coupling map (verified)

| Point | File | Coupling |
|---|---|---|
| Source lives inside CMS app | `apps/cms/admin-frontend/` | directory placement only |
| Docker multi-stage build | `infra/cms/Dockerfile.cms:22-25,37` | bakes `dist` into cms image |
| Django serves dist | `apps/cms/apps/api/admin_spa.py` (`SPA_ROOT = BASE_DIR/admin-frontend/dist`) | runtime file dependency |
| CI | `.github/workflows/ci-admin-frontend.yml`, `ci-cms.yml:75,82` | builds SPA inside CMS pipeline |
| API contract | same-origin `/api/v1/admin/*` + CSRF cookie | SPA↔Django (runtime only, keep) |

## Target architecture

1. **New top-level project:** `apps/admin/` (sibling of `apps/web`, NOT inside cms)
   - own `package.json` (name `taha-admin`), own lockfile, tsconfig, vite config
   - `base: "/admin/"` unchanged; `VITE_ADMIN_API_BASE` for cross-origin option later
2. **Decouple Django serving:** `admin_spa.py` reads an env-configurable dir:
   `ADMIN_SPA_ROOT` (default keeps old path for transition). Compose mounts a
   shared volume OR Caddy serves `/admin/*` directly from the admin image.
   - **Chosen:** Caddy serves `/admin/*` from the new `taha-admin` static image;
     Django drops SPA serving (admin_spa.py kept as fallback behind env flag).
3. **Own pipelines:** `ci-admin.yml` (check+build on PR) and admin image job in
   `cd-cms-image` flow; Dockerfile.admin multi-stage → nginx serving dist.
4. **CMS slim-down:** remove frontend-builder stage from Dockerfile.cms; drop
   ci-cms steps referencing admin-frontend.

## Execution order (each step = one green commit)

- [ ] S1: move `apps/cms/admin-frontend` → `apps/admin` (git mv), fix paths, build green locally
- [ ] S2: add `Dockerfile.admin` (nginx) + `ci-admin.yml`; point cd image flow at it
- [ ] S3: Caddyfile.cms.snippet: `/admin/*` → taha-admin container; compose service `admin`
- [ ] S4: Django `ADMIN_SPA_ROOT` env fallback; Dockerfile.cms loses frontend-builder; ci-cms cleanup
- [ ] S5: docs sync (PROJECT_MANIFEST ownership row, AGENTS.md, ADR-0032 record) + WORK_LOG

## Risks / notes

- Same-origin CSRF currently relies on `/admin` being served by Django host.
  Moving to Caddy-served `/admin/*` on the SAME domain preserves this (cookie domain unchanged). No CORS needed.
- Transition keeps `ADMIN_SPA_ROOT` override so rollback = flip env var.
- Public site untouched throughout.
