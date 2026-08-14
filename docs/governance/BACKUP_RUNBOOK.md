# Backup and Recovery Runbook

**Status:** P0-A operational runbook; automation and an isolated file-level restore rehearsal succeeded.  
**Owner:** Project owner  
**Policy:** `BACKUP_POLICY.md`  
**Task Spec:** `../plan/P0-A-server-access-dns-backup-task-spec.md`

## What the daily job protects

The job creates separate encrypted restic snapshots for:

- a streamed `pg_dumpall` from the running `taha-prod-postgres-1` container;
- the verified Docker media volume;
- the live Caddyfile and both observed Compose files.

The dump is sent directly to restic by `--stdin-from-command`; no plaintext SQL
dump is retained on the VPS. If PostgreSQL dump exits non-zero, restic fails that
snapshot instead of reporting an empty successful dump.

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

## Restore procedure — staging only

Never restore this backup directly into the live production Compose project.

1. Confirm a distinct staging Compose project, database, volumes, ports and
   Caddy route exist. Stop if staging would share any production data path.
2. Set the three protected restic/rclone environment variables as the root user.
3. Inspect snapshots and restore into an empty, root-owned staging-only target:

   ```bash
   restic snapshots
   install -d -m 700 /srv/taha-staging-restore
   restic restore <SNAPSHOT_ID> --target /srv/taha-staging-restore
   ```

4. Validate restored media/config files and import `postgres-all.sql` only into
   the isolated staging database using the target application's documented
   restore command. Record the result in `WORK_LOG.md`.
5. Remove the staging restore directory only after the owner accepts the test;
   never use a broad recursive delete or a production path.

## Failure response

- Do not delete snapshots to make a failed job look clean.
- Inspect the service journal and `restic snapshots`; record actual results in
  `WORK_LOG.md`.
- For OAuth failure, re-authorize rclone with the temporary localhost SSH tunnel
  procedure; do not paste a token into chat or Git.
- For a lost restic password, recovery is impossible. Retrieve it from the
  owner's password manager; do not attempt a password reset against the
  repository.
