#!/usr/bin/env bash
# Pull a versioned CMS image and recreate the Compose stack (idempotent).
#
# Usage (on the VPS, as deploy user with Docker access):
#   export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:<git-sha>
#   ./infra/deploy/update-cms.sh
#
# Optional:
#   CMS_REPO_DIR   default: /home/deploy/cms-repo
#   CMS_PULL_POLICY default: always
#
# Does NOT: apply Caddy changes, create superusers, or print secrets.
# Does NOT: touch the static Astro artifact under /opt/taha/site.

set -euo pipefail

CMS_REPO_DIR="${CMS_REPO_DIR:-/home/deploy/cms-repo}"
COMPOSE_FILE="infra/cms/docker-compose.cms.yml"
CMS_PULL_POLICY="${CMS_PULL_POLICY:-always}"

if [[ -z "${CMS_IMAGE:-}" ]]; then
  echo "CMS_IMAGE is required (example: ghcr.io/tahamohamadi-ir/taha-cms:abc1234)" >&2
  exit 1
fi

cd "$CMS_REPO_DIR"

if [[ ! -f infra/cms/.env ]]; then
  echo "missing infra/cms/.env — copy from .env.example and set secrets on the server" >&2
  exit 1
fi

echo "Using CMS_IMAGE=${CMS_IMAGE}"
export CMS_IMAGE CMS_PULL_POLICY

docker compose -f "$COMPOSE_FILE" pull cms
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

echo "Waiting for cms health..."
for _ in $(seq 1 30); do
  if docker compose -f "$COMPOSE_FILE" exec -T cms python -c \
    "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health/', timeout=3)"; then
    break
  fi
  sleep 2
done

docker compose -f "$COMPOSE_FILE" exec -T cms python manage.py migrate --noinput
docker compose -f "$COMPOSE_FILE" ps

echo "Loopback health:"
curl -fsS "http://127.0.0.1:18000/health/" || {
  echo "loopback /health/ failed" >&2
  exit 1
}
echo
echo "CMS stack updated. Apply/verify Caddy snippet separately if /admin is not proxied yet."
echo "Create superuser (interactive, owner only):"
echo "  docker compose -f ${COMPOSE_FILE} exec cms python manage.py createsuperuser"
