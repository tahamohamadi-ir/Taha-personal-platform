# ADR-0010: Encrypted off-site backup on Google Drive

**Status:** Accepted as the target design; not provisioned or restore-tested.  
**Date:** 2026-08-14

## Context

The VPS has no confirmed provider backup and cannot be the sole copy of database, media or configuration. The owner approved Google Drive as the off-site destination.

## Decision

- Use a restic repository accessed through rclone on Google Drive for encrypted off-site backups.
- Back up database dumps, public/media assets when created, and versioned deployment/configuration state; never treat GitHub Actions artifacts as backup storage.
- Store the Google OAuth credential, rclone configuration and restic password outside Git in an approved password manager/secret store.
- Define retention, failure alerting and a restore rehearsal before persistent CMS data, contact submissions or a risky migration.

## Consequences

- `RISK-0003` remains open until the job, encryption, retention and restore test have real evidence.
- A laptop may hold an additional copy but is not the required primary off-site backup destination.
- No backup command, OAuth flow or server configuration is created by this ADR alone.
