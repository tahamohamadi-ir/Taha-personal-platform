# Backup Policy

**Status:** P0-A partially provisioned — PostgreSQL/media/config snapshots, repository check, retention, enabled timer and isolated file-level restore rehearsal exist; **CMS postgres (`taha-cms-db-1`) must be included in the daily job** (script updated 2026-08-16) and an isolated CMS DB import remains before closing `RISK-0003`.  
**Decision ADR:** `docs/adr/0010-encrypted-google-drive-backup.md`
**Operational runbook:** `BACKUP_RUNBOOK.md`
**CMS restore Task Spec:** `docs/plan/P3-cms-backup-restore-task-spec.md`

## Scope

The backup set covers PostgreSQL dumps once PostgreSQL exists, CMS/media assets once stored, and deployment/configuration state needed to rebuild or restore the service. Git history stays in GitHub but does not replace operational backups.

## Target design

- Tooling: Ubuntu-signed `restic` 0.18.1 and `rclone` 1.60.1 build are installed on the VPS. Google Drive OAuth/read access and a restic format-v2 repository are verified; separate PostgreSQL and media/config snapshots exist, `restic check` passed, and the installed systemd service completed a real backup/retention run successfully.
- Source: production VPS only after its access hardening is complete.
- Destination: encrypted restic repository accessed through rclone in the owner-created `taha-personal-platform-backups` folder on the approved Google Drive account.
- Credentials: Google OAuth, rclone configuration and restic password live only in an approved password manager/secret store; never in Git, a shell history, CI log or `WORK_LOG.md`.
- Headless OAuth: use a temporary localhost-only SSH tunnel from the owner's laptop to the VPS rclone callback; do not paste an OAuth token, callback URL state or config-token into chat.
- Schedule: daily automated backup, with failure recorded and owner alerting configured in P0-A.
- Retention proposal: 7 daily, 4 weekly and 12 monthly snapshots; adjust only after storage use is measured.
- Restore: a staging restore rehearsal is mandatory before persistent CMS data, contact submissions or a risky migration. A successful backup is not completion without restore evidence.

## Exclusions

- GitHub Actions artifacts and caches.
- Any secret copied into repository documentation.
- A laptop as the sole recovery destination; it may be a supplementary copy only.

## Required evidence before closing `RISK-0003`

1. Secret handling and Google Drive access configured without logging sensitive values. **Completed for the rclone OAuth/access portion and the restic repository password on 2026-08-14; the password value itself is never recorded here.**
2. A scheduled job completes and records a non-sensitive success/failure result.
3. Retention is observed and documented.
4. A restore to staging is performed and verified against expected files/database state. **The file-level encrypted restore and source-file comparison passed on 2026-08-14; an isolated CMS database import of `cms-postgres-all.sql` is still required (see P3-cms-backup-restore-task-spec).**
5. Runbook and recovery owner are recorded in `WORK_LOG.md`.

## Restore drill cadence

- A recurring restore drill is executed quarterly.
- The recovery owner is the Project owner.
- The drill is performed ONLY on an isolated target, per
  `docs/governance/BACKUP_RUNBOOK.md` and the P0-A restore-rehearsal Task Spec;
  it is never performed against production.
- At each drill the Project owner records the observed RPO/RTO and the cadence.
