# Backup Policy

**Status:** P0-A target design — not provisioned or restore-tested.  
**Decision ADR:** `docs/adr/0010-encrypted-google-drive-backup.md`

## Scope

The backup set covers PostgreSQL dumps once PostgreSQL exists, CMS/media assets once stored, and deployment/configuration state needed to rebuild or restore the service. Git history stays in GitHub but does not replace operational backups.

## Target design

- Tooling: Ubuntu-signed `restic` 0.18.1 and `rclone` 1.60.1 build are installed on the VPS; no credentials, repository or scheduled job exist yet.
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

1. Secret handling and Google Drive access configured without logging sensitive values.
2. A scheduled job completes and records a non-sensitive success/failure result.
3. Retention is observed and documented.
4. A restore to staging is performed and verified against expected files/database state.
5. Runbook and recovery owner are recorded in `WORK_LOG.md`.
