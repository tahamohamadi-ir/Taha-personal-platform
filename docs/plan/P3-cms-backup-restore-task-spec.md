# Task Spec — P3 CMS backup + isolated restore evidence (RISK-0003)

**Status:** DONE (owner VPS evidence 2026-08-17; RISK-0003 CLOSED, LOG-0140)  
**ID:** P3-cms-backup-restore  
**Related:** RISK-0003, ADR-0010, BACKUP_POLICY, BACKUP_RUNBOOK, LOG-0130, LOG-0140

## Goal

Ensure the live Compose CMS PostgreSQL (`taha-cms-db-1`) and CMS media volume are
in the daily restic set, and record isolated restore/import evidence so
`RISK-0003` can close before contact persistence or risky migrations.

## Scope

- In: update `infra/backup/taha-platform-backup.sh`, README, policy/runbook notes,
  owner checklist for dry-run + restore into a disposable postgres container.
- Out: running restic with real passwords from an agent; restoring into production;
  exposing `/api/` or `/media/`; P4 content.

## Acceptance criteria

### Repo (agent)

- [x] Backup script fails if `taha-cms-db-1` is not running.
- [x] CMS dump tagged `cms` + `postgres`; filename `cms-postgres-all.sql`.
- [x] Legacy postgres dump is optional if container still exists.
- [x] `--dry-run` inventories sources without invoking restic.
- [x] Docs warn that `.env` secrets are not backed up via this job.

### Owner (VPS) — required to CLOSE RISK-0003

- [x] Install refreshed `/usr/local/sbin/taha-platform-backup` and reload systemd.
- [x] `taha-platform-backup --dry-run` prints CMS postgres + expected paths.
- [x] One successful `systemctl start taha-platform-backup.service` (journal OK).
- [x] `restic snapshots` shows a recent snapshot tagged `cms` (do not paste secrets).
- [x] Isolated restore rehearsal:
  1. `RESTORE_DIR=/srv/taha-cms-restore-$$; install -d -m 700 "$RESTORE_DIR"`
  2. `restic restore <id> --target "$RESTORE_DIR"`
  3. Start a disposable postgres:  
     `docker run -d --name taha-cms-restore-db -e POSTGRES_PASSWORD=temp postgres:17-alpine`
  4. Import as the container superuser (`pg_dumpall` format):  
     `docker exec -i taha-cms-restore-db psql -U postgres < dump` (live DB name is `taha_cms`, not `cms`)
  5. Smoke: `\dt` on `taha_cms` shows Wagtail/Django tables; then  
     `docker rm -f taha-cms-restore-db` and `rm -rf "$RESTORE_DIR"` (owner-confirmed).
- [x] Record non-secret evidence in WORK_LOG (commands + PASS/FAIL only).

## Validation (repo)

```bash
bash -n infra/backup/taha-platform-backup.sh
```

## Rollback

Keep the previous `/usr/local/sbin/taha-platform-backup` binary as
`*.bak.<timestamp>` before install; restore that file and `daemon-reload` if needed.
