# infra/cms — CMS runtime (Docker Compose) + GHCR versioned images

## Architecture (canonical)

```text
Internet
   │
   ▼
Caddy  (TLS + routing)
   ├── /*            → static Astro artifact (/opt/taha/site/current)  [NOT containerized]
   ├── /admin*       → reverse_proxy 127.0.0.1:18000
   └── /health*      → reverse_proxy 127.0.0.1:18000

Docker Compose (this directory)
   ├── cms   ← ghcr.io/<owner>/taha-cms:<git-sha>
   └── db    ← postgres:17-alpine + named volume
```

- **Caddy** = edge HTTPS and path routing.
- **Versioned artifact (web)** = immutable static release directories + `current` symlink.
- **Versioned artifact (CMS)** = immutable container image tags on GHCR (git sha).
- **Compose** = only the CMS + PostgreSQL stateful stack.

Do **not** containerize the public Astro site: it has no Node runtime and is
served directly from disk by Caddy (lower cost, simpler rollback).

## Files

| File | Role |
|---|---|
| `Dockerfile.cms` | Multi-stage image; venv on `PATH`; gunicorn |
| `docker-compose.cms.yml` | `db` + `cms`; loopback publish `127.0.0.1:18000` |
| `Caddyfile.cms.snippet` | `/admin*` + `/health*` reverse_proxy fragment |
| `.env.example` | Template for server-side `.env` (never commit real secrets) |

## Image tags

CI workflow `.github/workflows/ci-cms-image.yml` pushes:

```text
ghcr.io/<owner>/taha-cms:<full-git-sha>
ghcr.io/<owner>/taha-cms:<short-sha>
ghcr.io/<owner>/taha-cms:main          # moving pointer on default branch
```

Production **must** set `CMS_IMAGE` to a sha tag for deploy/rollback clarity.
`:main` is a convenience pointer only.

## Deploy (operator)

Copy-paste safe (no angle-bracket placeholders):

```bash
cd /home/deploy/cms-repo
git pull --ff-only origin main

# Align required keys once (script also appends missing DJANGO_SETTINGS_MODULE / POSTGRES_HOST)
# Edit secrets in infra/cms/.env if needed:
#   ALLOWED_HOSTS=tahamohamadi.ir,www.tahamohamadi.ir

# Preferred: public GHCR image (no docker login)
export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:main
bash infra/deploy/update-cms.sh

# If GHCR is still private, either:
#   echo GITHUB_PAT | docker login ghcr.io -u tahamohamadi-ir --password-stdin
#   (PAT needs read:packages — account password will NOT work)
# Or build on the VPS:
#   export CMS_IMAGE=taha-cms:local CMS_BUILD=1
#   bash infra/deploy/update-cms.sh

# One-time / when snippet changes: merge Caddyfile.cms.snippet into site block, validate, reload
bash infra/deploy/smoke-cms.sh https://tahamohamadi.ir

docker compose -f infra/cms/docker-compose.cms.yml exec cms python manage.py createsuperuser
```

Always invoke with `bash infra/deploy/...` (scripts are executable in git, but `bash` avoids Permission denied if the bit was lost on checkout).

`python` inside the container is the image venv (Django available). Do not use a
host `python` or an unactivated interpreter.

## Rollback

```bash
export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:<previous-sha>
./infra/deploy/update-cms.sh
```

Volumes are preserved (`postgres_data`, `cms_media`, `cms_static`).

## Local build (optional)

```bash
export CMS_IMAGE=taha-cms:local
docker compose -f infra/cms/docker-compose.cms.yml build
docker compose -f infra/cms/docker-compose.cms.yml up -d
```
