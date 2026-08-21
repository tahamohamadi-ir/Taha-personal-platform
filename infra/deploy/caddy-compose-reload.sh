#!/usr/bin/env bash
# Reload Compose-edge Caddy after Caddyfile.compose changes (DEFER-0031 / Slice 4).
#
# Usage (from repo root on the VPS, as deploy with docker rights):
#   bash infra/deploy/caddy-compose-reload.sh
#
# Prerequisites:
#   - Host systemd Caddy is stopped (ports 80/443 free)
#   - Compose profile `edge` caddy service is (or will be) running
#   - This script does NOT stop/start host Caddy
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/infra/cms/docker-compose.cms.yml}"
CADDYFILE="${CADDYFILE:-$ROOT/infra/caddy/Caddyfile.compose}"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "error: compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

if [ ! -f "$CADDYFILE" ]; then
  echo "error: Caddyfile.compose not found: $CADDYFILE" >&2
  exit 1
fi

cd "$(dirname "$COMPOSE_FILE")"

# Recreate so bind-mounted Caddyfile is re-read; validate inside the container.
docker compose -f "$COMPOSE_FILE" --profile edge up -d caddy

# Best-effort config check (container must be up).
if docker compose -f "$COMPOSE_FILE" --profile edge exec -T caddy \
  caddy validate --config /etc/caddy/Caddyfile 2>&1; then
  docker compose -f "$COMPOSE_FILE" --profile edge exec -T caddy \
    caddy reload --config /etc/caddy/Caddyfile 2>&1 || true
  echo "caddy-compose: up -d + validate OK"
else
  echo "error: caddy validate failed inside container" >&2
  exit 1
fi
