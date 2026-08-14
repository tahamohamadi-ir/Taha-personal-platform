#!/usr/bin/env bash
# Back up the observed production PostgreSQL, media and deployment configuration.
# Secrets are supplied only by /etc/taha-backup.env and never belong in this file.

set -Eeuo pipefail

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

readonly POSTGRES_CONTAINER='taha-prod-postgres-1'
readonly MEDIA_PATH='/var/lib/docker/volumes/taha_prod_media_data/_data'
readonly CADDYFILE_PATH='/etc/caddy/Caddyfile'
readonly COMPOSE_PATH='/opt/taha/repository/compose.yaml'
readonly PRODUCTION_COMPOSE_PATH='/opt/taha/repository/compose.production.yaml'
readonly LOCK_PATH='/run/lock/taha-platform-backup.lock'

if (( $# != 0 )); then
  echo 'This backup script accepts no arguments.' >&2
  exit 64
fi

: "${RCLONE_CONFIG:?RCLONE_CONFIG must be set by the systemd environment file}"
: "${RESTIC_PASSWORD_FILE:?RESTIC_PASSWORD_FILE must be set by the systemd environment file}"
: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY must be set by the systemd environment file}"

for required_file in "$RCLONE_CONFIG" "$RESTIC_PASSWORD_FILE" "$CADDYFILE_PATH" "$COMPOSE_PATH" "$PRODUCTION_COMPOSE_PATH"; do
  if [[ ! -r "$required_file" ]]; then
    echo "Required backup input is not readable: $required_file" >&2
    exit 1
  fi
done

if [[ ! -d "$MEDIA_PATH" ]]; then
  echo "Required media path is absent: $MEDIA_PATH" >&2
  exit 1
fi

if [[ "$(docker inspect --format '{{.State.Running}}' "$POSTGRES_CONTAINER")" != 'true' ]]; then
  echo "PostgreSQL container is not running: $POSTGRES_CONTAINER" >&2
  exit 1
fi

exec 9>"$LOCK_PATH"
if ! flock -n 9; then
  echo 'Another Taha platform backup is already running; no overlapping backup was started.' >&2
  exit 75
fi

restic backup \
  --stdin-filename postgres-all.sql \
  --stdin-from-command \
  --tag production \
  --tag postgres \
  -- \
  docker exec "$POSTGRES_CONTAINER" sh -ceu 'exec pg_dumpall -U "$POSTGRES_USER"'

restic backup \
  --tag production \
  --tag media \
  --tag config \
  "$MEDIA_PATH" \
  "$CADDYFILE_PATH" \
  "$COMPOSE_PATH" \
  "$PRODUCTION_COMPOSE_PATH"

restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune
