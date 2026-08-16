# Backup and Recovery Runbook

**Status:** P0-A operational runbook; automation and an isolated file-level restore rehearsal succeeded.  
**Owner:** Project owner  
**Policy:** `BACKUP_POLICY.md`  
**Task Spec:** `../plan/P0-A-server-access-dns-backup-task-spec.md`

## What the daily job protects

The job creates separate encrypted restic snapshots for:

- a streamed `pg_dumpall` from the live CMS container `taha-cms-db-1`
  (`cms-postgres-all.sql`, tags `cms` + `postgres`) — **required**;
- optionally a dump from legacy `taha-prod-postgres-1` if that container still
  runs (`legacy-postgres-all.sql`);
- CMS media volume `taha-cms_cms_media` when present (plus legacy media volume
  if still on disk);
- the live Caddyfile and CMS `docker-compose.cms.yml` (plus legacy compose files
  if still readable).

The dump is sent directly to restic by `--stdin-from-command`; no plaintext SQL
dump is retained on the VPS. If PostgreSQL dump exits non-zero, restic fails that
snapshot instead of reporting an empty successful dump.

Operator install and `--dry-run`: `infra/backup/README.md`.
CMS isolated restore checklist: `docs/plan/P3-cms-backup-restore-task-spec.md`.

## Server files and permissions

| Server path | Source-controlled artifact | Mode | Contains secrets? |
|---|---|---:|---|
| `/usr/local/sbin/taha-platform-backup` | `infra/backup/taha-platform-backup.sh` | `0750` | No |
| `/etc/systemd/system/taha-platform-backup.service` | `infra/backup/taha-platform-backup.service` | `0644` | No |
| `/etc/systemd/system/taha-platform-backup.timer` | `infra/backup/taha-platform-backup.timer` | `0644` | No |
| `/etc/taha-backup.env` | `infra/backup/taha-backup.env.example` | `0600` | No values beyond protected paths/repository URI |
| `/root/.config/rclone/rclone.conf` | never in Git | `0600` | OAuth credential |
| `/root/.config/taha-backup/restic-password` | never in Git | `0600` | Repository password |

The timer runs daily at 03:20 UTC with up to ten minutes of randomized delay. It
uses a lock to prevent overlap and retains 7 daily, 4 weekly and 12 monthly
snapshots. The service runs as root because it must read the root-owned secret
files and Docker-managed media path.

## Normal operation checks

```bash
systemctl list-timers taha-platform-backup.timer
systemctl status taha-platform-backup.timer --no-pager
journalctl -u taha-platform-backup.service -n 100 --no-pager
```

Run a manual backup only when no scheduled execution is active:

```bash
systemctl start taha-platform-backup.service
systemctl status taha-platform-backup.service --no-pager
restic snapshots
```

## Restore procedure — isolated target only (never live Compose)

Never restore this backup directly into the live `taha-cms` project or any
shared production volume.

Canonical CMS checklist: `docs/plan/P3-cms-backup-restore-task-spec.md`.

1. Create a root-only restore directory, then restore a snapshot into it:

   ```bash
   RESTORE_DIR="/srv/taha-cms-restore-$(date +%s)"
   install -d -m 700 "$RESTORE_DIR"
   restic snapshots
   restic restore <SNAPSHOT_ID> --target "$RESTORE_DIR"
   ```

2. Import `cms-postgres-all.sql` only into a **disposable** postgres container
   (see Task Spec). Do not use the decommissioned staging hostname.

3. Validate Wagtail/Django tables, then destroy the disposable container and
   remove `$RESTORE_DIR` (owner-confirmed). Never use a broad recursive delete
   against a production path.

4. Legacy `legacy-postgres-all.sql` / old media paths are optional if those
   snapshots still exist; prefer CMS artifacts for RISK-0003 closure.

## Failure response

- Do not delete snapshots to make a failed job look clean.
- Inspect the service journal and `restic snapshots`; record actual results in
  `WORK_LOG.md`.
- For OAuth failure, re-authorize rclone with the temporary localhost SSH tunnel
  procedure; do not paste a token into chat or Git.
- For a lost restic password, recovery is impossible. Retrieve it from the
  owner's password manager; do not attempt a password reset against the
  repository.
