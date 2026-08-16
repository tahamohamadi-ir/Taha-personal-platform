#!/usr/bin/env bash
# Pull (or build) a versioned CMS image and recreate the Compose stack.
#
# Preferred (GHCR, public or authenticated):
#   export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:main
#   bash infra/deploy/update-cms.sh
#
# Pin for production:
#   export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:573db28
#   bash infra/deploy/update-cms.sh
#
# Offline / registry auth failure — build on the VPS:
#   export CMS_IMAGE=taha-cms:local CMS_BUILD=1
#   bash infra/deploy/update-cms.sh
#
# Optional env:
#   CMS_REPO_DIR     default /home/deploy/cms-repo
#   CMS_PULL_POLICY  default always (ignored when CMS_BUILD=1)
#
# Does NOT apply Caddy, create superusers, or print secrets.

set -euo pipefail

CMS_REPO_DIR="${CMS_REPO_DIR:-/home/deploy/cms-repo}"
COMPOSE_FILE="infra/cms/docker-compose.cms.yml"
CMS_PULL_POLICY="${CMS_PULL_POLICY:-always}"
CMS_BUILD="${CMS_BUILD:-0}"

if [[ -z "${CMS_IMAGE:-}" ]]; then
  echo "CMS_IMAGE is required." >&2
  echo "Example: export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:main" >&2
  echo "Or build locally: export CMS_IMAGE=taha-cms:local CMS_BUILD=1" >&2
  exit 1
fi

cd "$CMS_REPO_DIR"

if [[ ! -f infra/cms/.env ]]; then
  echo "missing infra/cms/.env — copy from infra/cms/.env.example and set secrets" >&2
  exit 1
fi

# Ensure required production keys exist (do not overwrite existing values).
ensure_env_key() {
  local key="$1"
  local value="$2"
  if ! grep -qE "^${key}=" infra/cms/.env; then
    printf '%s=%s\n' "$key" "$value" >> infra/cms/.env
    echo "appended missing ${key} to infra/cms/.env"
  fi
}
ensure_env_key DJANGO_SETTINGS_MODULE config.settings.production
ensure_env_key POSTGRES_HOST db

echo "Using CMS_IMAGE=${CMS_IMAGE} CMS_BUILD=${CMS_BUILD}"
export CMS_IMAGE CMS_PULL_POLICY

if [[ "$CMS_BUILD" == "1" ]]; then
  docker compose -f "$COMPOSE_FILE" build cms
else
  if ! docker compose -f "$COMPOSE_FILE" pull cms; then
    echo "GHCR pull failed. Re-run with CMS_BUILD=1 to build on this host, or:" >&2
    echo "  echo YOUR_GITHUB_PAT | docker login ghcr.io -u tahamohamadi-ir --password-stdin" >&2
    echo "PAT needs read:packages (GitHub password will NOT work)." >&2
    exit 1
  fi
fi

docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

echo "Waiting for cms health..."
ready=0
for _ in $(seq 1 40); do
  if docker compose -f "$COMPOSE_FILE" exec -T cms python -c \
    "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health/', timeout=3)" \
    >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done
if [[ "$ready" != "1" ]]; then
  echo "cms health did not become ready; recent logs:" >&2
  docker compose -f "$COMPOSE_FILE" logs cms --tail=80 >&2 || true
  exit 1
fi

docker compose -f "$COMPOSE_FILE" exec -T cms python manage.py migrate --noinput
docker compose -f "$COMPOSE_FILE" ps

echo "Loopback health:"
curl -fsS "http://127.0.0.1:18000/health/"
echo
echo "CMS stack updated."
echo "If https://tahamohamadi.ir/admin/login/ is still not Wagtail, merge infra/cms/Caddyfile.cms.snippet into the site block, then:"
echo "  bash infra/deploy/smoke-cms.sh https://tahamohamadi.ir"
echo "Create superuser (owner interactive):"
echo "  docker compose -f ${COMPOSE_FILE} exec cms python manage.py createsuperuser"
