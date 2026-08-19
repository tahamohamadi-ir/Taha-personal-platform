# infra/cms — CMS runtime (Docker Compose) + GHCR versioned images

## Architecture (canonical)

```text
Internet
   │
   ▼
Caddy  (TLS + routing)
   ├── /*            → static Astro artifact (/opt/taha/site/current)  [NOT containerized]
   ├── /admin*       → reverse_proxy 127.0.0.1:18000
   ├── /static*      → reverse_proxy 127.0.0.1:18000
   └── /health/      → reverse_proxy 127.0.0.1:18000
       /health.json  → static artifact (do not glob /health*)

Docker Compose (this directory)
   ├── cms   ← ghcr.io/<owner>/taha-cms:<git-sha>
   └── db    ← postgres:17-alpine + named volume
```

- **Caddy** = edge HTTPS and path routing.
- **Versioned artifact (web)** = immutable static release directories + `current` symlink.
- **Versioned artifact (CMS)** = immutable container image tags on GHCR (git sha).
- **Compose** = only the CMS + PostgreSQL stateful stack.

Do **not** run a Node.js public runtime in production (ADR-0027). The public
`web` service is nginx serving a prebuilt Astro `dist`. Host Caddy remains the
TLS edge until Compose `caddy` (`DEFER-0031`). The sentence “do not containerize
Astro” is superseded: the **artifact** is containerized; the **runtime** is not Node.

## Files

| File | Role |
|---|---|
| `Dockerfile.cms` | Multi-stage image; venv on `PATH`; gunicorn |
| `docker-compose.cms.yml` | `db` + `cms`; loopback publish `127.0.0.1:18000` |
| `Caddyfile.cms.snippet` | `/admin*` + `/static*` + `/health/` reverse_proxy fragment |
| `Caddyfile.cms.api.snippet` | **Optional** `/api*` + `/media*` (DEFER-0017; owner apply) |
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

# One-time / when snippet changes: merge Caddyfile.cms.snippet into site block
# (before file_server). Required handles: /admin* /static* /health/
# Do not use handle /health* — it would steal /health.json.
# Then: sudo caddy validate && sudo systemctl reload caddy
# Evidence 2026-08-16: without /static*, Wagtail CSS 404s on the Astro 404 page.
bash infra/deploy/smoke-cms.sh https://tahamohamadi.ir

# Password must be at least 12 characters (do not bypass validation).
docker compose -f infra/cms/docker-compose.cms.yml exec cms python manage.py createsuperuser

# One-time (or after static-site content changes): load published CMS rows from repo seed data
docker compose -f infra/cms/docker-compose.cms.yml exec cms python manage.py seed_site_content
# Refresh existing canonical slugs: add --force

## Edit content in Wagtail admin

Public pages are **Astro static**; CMS stores editorial data exposed via `/api/*`.
Wagtail **Pages** (default “Welcome…”) are not used for the public site.

After login at `/admin/`, open **Site content** in the sidebar:

| Menu item | What it edits |
|-----------|----------------|
| Articles | Blog / writing (`/en/blog/`, `/fa/blog/`) |
| Research topics, statements, publications, projects | Research section |
| Landing / Profiles | CMS copies of hero/about (static rebuild required) |
| Case studies | P6 project depth pages |

Set **Status = Published** and **Published at** in the past, then rebuild static
(`rebuild-static.sh` or local build with `CMS_API_BASE` tunnel).

Upload images via **Images** (Wagtail library) and attach to articles as needed.

## Public `/api/` and `/media/` (DEFER-0017)

Optional: expose read-only API at the edge for RSS, ISR, or off-VPS builds.

```bash
# Backup Caddyfile first
sudo cp -a /etc/caddy/Caddyfile /etc/caddy/Caddyfile.pre-api.$(date -u +%Y%m%dT%H%M%SZ)

# Merge infra/cms/Caddyfile.cms.api.snippet into tahamohamadi.ir block
# BEFORE import taha_application_routes / file_server (order matters).

sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy

curl -fsS https://tahamohamadi.ir/api/research/topics/en | head -c 200
curl -fsS -o /dev/null -w '%{http_code}\n' https://tahamohamadi.ir/api/articles/en
```

See `docs/plan/P3-public-api-caddy-task-spec.md` for rollback and smoke steps.

# After this image is running: Account → Two-factor authentication
# (or https://tahamohamadi.ir/admin/account/two-factor/) — scan QR, confirm code.
```

## Static rebuild with CMS content (P3-08 / P4+)

Loopback build on the VPS (no public `/api/` required):

```bash
cd /home/deploy/cms-repo
git pull --ff-only origin main
bash infra/deploy/rebuild-static.sh
# build-only: SKIP_DEPLOY=1 bash infra/deploy/rebuild-static.sh
```

Uses `CMS_API_BASE=http://127.0.0.1:18000` by default. See
`infra/deploy/build-static-with-cms.sh` and `docs/plan/P3-public-api-caddy-task-spec.md`
for public-edge builds after DEFER-0017.

Always invoke with `bash infra/deploy/...` (scripts are executable in git, but `bash` avoids Permission denied if the bit was lost on checkout).

`python` inside the container is the image venv (Django available). Do not use a
host `python` or an unactivated interpreter.

## Rollback

```bash
export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:<previous-sha>
./infra/deploy/update-cms.sh
```

Volumes are preserved (`postgres_data`, `cms_media`). Admin static files are baked into the image (`STATIC_ROOT=/app/staticfiles`); do not mount an empty volume over that path.

## Local build (optional)

```bash
export CMS_IMAGE=taha-cms:local
docker compose -f infra/cms/docker-compose.cms.yml build
docker compose -f infra/cms/docker-compose.cms.yml up -d
```
