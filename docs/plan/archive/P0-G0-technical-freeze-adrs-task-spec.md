# Task Spec — G0-04/G0-05 first-live technical freeze and minimum ADRs

**Status:** Completed as a documentation/decision slice; scaffold is not authorized by this Task Spec.  
**Date:** 2026-08-14  
**Owner:** Project owner (agent-assisted)  
**Release type:** `FAST-TRACK` documentation-only  
**Risk level:** Low  
**Risk IDs:** `RISK-0001` (unaffected)

## Goal

Freeze the minimum first-live technical decisions needed for R2 (P1 static-only
release) and record the three non-obvious ADRs that R0/R1/R2 require, without
scaffolding or installing anything and without inventing content, versions or
assets.

## In scope

- Record the P1 technical decisions in `PROJECT_MANIFEST.md` (G0-04 freeze),
  marking items not required for R2 as `NOT USED IN R2` and owner-dependent
  items (font/logo/media) as `OPEN`.
- Create ADR-0016 (static-first Astro + React islands), ADR-0017 (versioned
  static artifact deploy + atomic switch/rollback) and ADR-0018 (P1
  design/hydration/font minimum) as **Proposed**.
- Register the three ADRs in `docs/adr/README.md`, including correcting the
  stale ADR-0015 "not yet applied" status to "applied and externally verified".
- Append WORK_LOG entries.

## Non-goals

- No scaffold, dependency, lockfile, `.venv`, API/schema, Docker/Caddy, DNS, VPS,
  backup, CI or deployment.
- No accepted ADR decision rewritten.
- No font/logo asset or content invented.

## Allowed files

- `PROJECT_MANIFEST.md`
- `docs/adr/0016-frontend-static-first-astro-react-islands.md`
- `docs/adr/0017-versioned-static-artifact-deploy.md`
- `docs/adr/0018-p1-design-hydration-font-minimum.md`
- `docs/adr/README.md`
- `docs/plan/P0-G0-technical-freeze-adrs-task-spec.md` (this file)
- `docs/status/WORK_LOG.md`

## Verification

- `git diff --check` passes.
- `node --version`, `npm --version` and `npm view astro version` were actually
  run (recorded in WORK_LOG).
- Local link check on the touched files passes.

## Rollback

- Documentation-only; reversible via Git.
