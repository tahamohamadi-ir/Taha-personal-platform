# ADR-0017: Versioned static artifact deploy with atomic switch and rollback

**Status:** Proposed; public artifact form amended by ADR-0027 (nginx `web` image is an allowed immutable artifact, not only a host directory).  
**Date:** 2026-08-14

## Context

The production VPS already runs an unrelated live Caddy + Compose stack. The
project's static artifact must be deployed without disturbing that stack, and a
failed build or deploy must never delete or corrupt the currently served
artifact.

## Decision

- Builds produce an immutable, versioned static artifact (directory named by
  content/version marker, e.g. `release-<version>-<short-checksum>`) whose
  version is recorded in deploy evidence and readable in a static health path.
- Caddy serves the public site from a stable `current` pointer/symlink to the
  latest verified artifact; switching the pointer is the atomic-ish deploy step.
- Retention keeps at least `current` plus the previous working artifact;
  rollback restores the previous pointer and re-validates the Caddy config.
- A failed build or deploy leaves `current` untouched; a failure after switch
  has an explicit manual/automatic rollback path.
- P1 static deploy performs no database migration and no container restart, and
  never touches the existing production Compose/volumes.

## Consequences

- Deployment becomes reproducible and reversible without a Node runtime on the
  server.
- Caddy config changes are minimal and covered by the backup/validate/reload
  procedure already proven for the staging placeholder (ADR-0015).
- Exact artifact path, deploy user, permissions and Caddy candidate are P0-A
  deliverables recorded in the deployment runbook, not guessed here.
