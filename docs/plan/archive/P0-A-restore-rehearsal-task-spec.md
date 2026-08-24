# Task Spec — P0-A isolated backup restore rehearsal

**Status:** Completed for file-level restore integrity; staging database import remains out of scope.  
**Date:** 2026-08-14  
**Owner:** Project owner  
**Type:** HIGH-RISK operational verification  
**Risk ID:** `RISK-0003`

## Goal

Prove that the latest verified PostgreSQL and media/config snapshots can be
read from the encrypted Google Drive repository and restored to an isolated,
root-only temporary target without changing production files, containers,
database, Caddy configuration, or the scheduled backup timer.

## In scope

- Verify no `taha-platform-backup.service` execution is active.
- Restore the selected PostgreSQL snapshot and selected media/config snapshot
  to one new, unique `0700` directory created by `mktemp -d` under `/dev/shm`.
- Verify the SQL dump is non-empty and restored configuration matches the
  current source files byte-for-byte.
- Record only non-sensitive success/failure metadata and remove the exact
  temporary restore target after verification.

## Explicit non-goals

- No PostgreSQL import, Docker container, migration, web deployment or Caddy
  change.
- No restore to `/`, `/opt/taha/repository`, Docker volumes, production paths,
  or any persistent staging path.
- No display, logging, commit or chat paste of SQL dump content, OAuth token or
  password.

## Preconditions

1. `taha-platform-backup.timer` is enabled and active; its service is inactive.
2. The selected snapshot IDs are listed from the successful systemd run.
3. `/dev/shm` has sufficient free space for the selected restore set.
4. `mktemp -d -p /dev/shm taha-platform-restore-XXXXXXXX` creates a unique
   root-owned target; no pre-existing target may be reused.

## Acceptance criteria

- Both `restic restore` commands exit successfully.
- Restored `postgres-all.sql` exists and is non-empty.
- `cmp` succeeds for Caddyfile and both Compose files.
- No production source, container, service, timer or configuration changes.
- The exact temporary target is removed only after the above checks pass.

## Known limit and follow-up

This rehearsal proved encrypted recovery and file-level integrity on
2026-08-14, but does **not** prove a database import into an isolated staging
runtime. That later step remains the open portion of `RISK-0003` and must not
be replaced by this temporary-target test.

## Rollback / failure handling

- A restore failure leaves production untouched; retain snapshots and inspect
  the failure without retry loops or deletion.
- If verification fails, preserve the root-only temporary target for diagnosis
  and record the failure. Do not import any SQL or alter the live service.
- Cleanup is permitted only for the exact `mktemp` path created by this Task
  Spec after a successful verification.
