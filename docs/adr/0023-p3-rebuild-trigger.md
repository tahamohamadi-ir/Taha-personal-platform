# ADR-0023: CMS→Astro publish/rebuild trigger

**Status:** Accepted (2026-08-15, P3 code-first gate).

## Context

P3-08: a CMS publish must be able to trigger an Astro rebuild/redeploy, but a
misconfigured or unauthenticated trigger is dangerous. The repo has no
invented endpoints; builds must never replace the current artifact on failure.

## Decision

- Manual rebuild/deploy fallback first: `apps/cms/scripts/manual-rebuild.sh`
  (documented; run by an operator), and previous public artifact remains
  served on build failure.
- Signed automatic trigger (`apps/rebuild`): POST-only
  `/rebuild-trigger/`, HMAC-SHA256 over `taha-rebuild:<timestamp>` with a
  shared secret, freshness ≤ 5 minutes, gated by `REBUILD_TRIGGER_ENABLED`
  (default `False`) and `REBUILD_TRIGGER_SECRET` (env-only in production).
  Generic 403 on failure (no detail leakage).
- The actual build hook (calling the Astro pipeline) is wired in the deploy
  slice, never in this code-first slice.

## Consequences

- A publish trigger cannot be forged without the secret and cannot be replayed
  after 5 minutes; disabled by default.
- No secret is committed; the default is an empty string that always rejects.
- Stale-state semantics (publish ok + build failed) are handled by the
  artifact pointer rules of the static deploy runbook.
