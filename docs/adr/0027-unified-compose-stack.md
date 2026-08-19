# ADR-0027: Unified Compose stack (one service per container)

**Status:** Accepted (2026-08-19, owner: each part has its own container; architecture must stay one Compose network).  
**Date:** 2026-08-19

## Context

ADR-0008 put Caddy on the host and left public Astro on disk. ADR-0017 made the public site an immutable `release-*` directory with a `current` symlink. `infra/cms/README.md` then forbade containerizing Astro. Production today is split:

- GitHub Actions rsyncs HTML to `/opt/taha/site/current`.
- Compose `taha-cms` runs only `cms` + `db`.
- Host Caddy routes static files vs `127.0.0.1:18000`.

The owner asked to leave hardcoded static-as-source-of-truth, give **each** part its own Docker image, and have CI/CD update the live stack. Doing that while keeping “Astro is never a container” produces two deploy mechanisms forever.

Constraints that still bind:

- Public pages remain readable **without JavaScript** (`AGENTS.md`, ADR-0016).
- The public site is **not** a React SPA (ADR-0026: React is `/admin/` only).
- VPS is ~4 GiB (`RISK-0007` CLOSED). A Node SSR process next to Gunicorn + Postgres is the expensive option, not the default.
- Production CMS image `b6bea6a` is live; `content.0008` and `composition.0002` applied (owner, 2026-08-19).

## Decision

1. **One Compose project** is the runtime. Target services (each a container, one process):

   | Service | Image | Role |
   |---|---|---|
   | `db` | `postgres:17-alpine` | State |
   | `cms` | `ghcr.io/…/taha-cms:<sha>` | Django/Gunicorn, `/admin/`, `/api/`, `/media/` |
   | `web` | `ghcr.io/…/taha-web:<sha>` | **nginx** serving the Astro `dist` (no Node in production) |
   | `caddy` | official Caddy | TLS + routing (cut over after `web` is proven) |

   Internal Docker DNS only: `web`, `cms`, `db`. Public ports: Caddy `80`/`443`. CMS and web bind loopback or stay unpublished until Caddy moves in.

2. **“Dynamic” means CMS origin, not request-time Node.** CI builds `taha-web` with `CMS_API_BASE` against the live published API (or a recorded empty/honest failure). Visitors get HTML files. Rebuild of `web` (CI job or later in-cluster builder) is how publish becomes public. Astro SSR / Django HTML templates are **out of the first implementation** and need a new ADR.

3. **Host Caddy stays the edge until Slice 2.** Slice 1 adds `web` on loopback (for example `127.0.0.1:13080`) and points the **existing** Caddy `file_server` at that reverse_proxy **or** keeps the symlink until the owner switches one `handle`. Slice 2 mounts ACME data into Compose `caddy` and removes duplicate host Caddy. Do not cut TLS in the same change as the first `web` image.

4. **CD must deploy CMS and web together** (sha-pinned). Auto-migrate still requires backup + smoke; first GitHub-driven migrate is owner-attended (`RISK-0012`). HMAC loopback rebuild (`DEFER-0027`) stays off until `web` rebuild no longer needs Node on the VPS.

5. **Hardcoded snapshots** (`profile.snapshot.json` and similar) become last-known-good **build cache**, never presented as live CMS if the build contacted the API and got a newer published document. Missing translation stays the IA missing-translation page, not the other locale.

6. **ADR-0008 / ADR-0017** remain true for rollback (immutable sha, previous image, previous web tag). They are **amended** as follows: the public artifact may be an nginx image tag, not only a host directory. Host `current` symlink is the rollback path until Slice 1 cutover completes.

## Consequences

- `infra/cms/README.md` “do not containerize Astro” is superseded by this ADR.
- Public React is still forbidden. Wagtail uninstall is still `DEBT-0003`.
- Capacity: nginx `web` is cheap; do not add a production Node service without measuring RSS.
- Executable slices live in `docs/plan/cms-origin-and-full-stack-cd-task-spec.md`.
