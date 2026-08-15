# Task Spec — G0-01 documentation snapshot and drift fix

**Status:** In progress.  
**Date:** 2026-08-14  
**Owner:** Project owner (agent-assisted)  
**Release type:** `FAST-TRACK` documentation-only  
**Risk level:** Low  
**Risk IDs:** `RISK-0001` (description limited, not closed)

## Goal

Bring the documentation baseline in line with the P0-A evidence recorded in
`WORK_LOG.md` (LOG-0024 through LOG-0040) so a reader of the Manifest, ADRs,
policies and status ledgers sees the real provisioning state without
contradictions, without rewriting any accepted ADR decision or inventing new
content, endpoints, metrics or services.

## In scope

- Create this Task Spec.
- Align the sample admin URL route `/cms/` with the accepted `/admin/` boundary
  in `docs/taha-personal-platform-technology-architecture-baseline-fa.md`
  (URL-route examples only; `apps/cms/` as a source path is unchanged).
- Update the operational status recorded for ADR-0008 and ADR-0010 in
  `docs/adr/README.md` and in each ADR's `Status:` line (decision text is not
  changed).
- Fix the stale "restic password is still not created" sentence in
  `docs/governance/BACKUP_POLICY.md`.
- Fix the duplicate numbering and stale status in
  `docs/plan/P0-A-server-access-dns-backup-task-spec.md`.
- Limit the `RISK-0001` description in `docs/status/RISK_REGISTER.md` to the
  blockers that actually remain (formal P0-G0 PASS, frontend scaffold/CI/deploy)
  instead of restating already-closed items.
- Append one evidence entry to `docs/status/WORK_LOG.md`.

## Non-goals

- No change to any accepted ADR decision.
- No scaffolding, dependency, lockfile, API/schema, database, Docker, Caddy, DNS,
  VPS, backup, CI, deployment or production change.
- No new endpoint, model, slug, metric, copy, translation, asset, secret or
  service.
- No rewriting of the Master Plan, IA baseline, design system, or the technology
  baseline beyond the `/admin/` route alignment noted above.

## Allowed files

- `docs/plan/P0-G0-documentation-drift-task-spec.md` (this file)
- `docs/taha-personal-platform-technology-architecture-baseline-fa.md`
- `docs/adr/README.md`
- `docs/adr/0008-deployment-caddy-docker-compose.md`
- `docs/adr/0010-encrypted-google-drive-backup.md`
- `docs/governance/BACKUP_POLICY.md`
- `docs/plan/P0-A-server-access-dns-backup-task-spec.md`
- `docs/status/RISK_REGISTER.md`
- `docs/status/WORK_LOG.md`

## Forbidden files

- Application/infrastructure source and all other ADRs, the Manifest, other
  governance policies and other status ledgers.

## Verification

- `git diff --check` must pass.
- Local Markdown link/reference check on the touched files must pass.
- `rg "/cms/" docs/taha-personal-platform-technology-architecture-baseline-fa.md`
  must return no URL-route occurrence (only `apps/cms/` source path may remain).
- A WORK_LOG entry records the actual commands and results.

## Rollback

- All changes are documentation-only and reversible via Git; no runtime state is
  affected.
