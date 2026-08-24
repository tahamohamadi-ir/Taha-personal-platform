# Task Spec — P1-T03 design-policy toolchain alignment

**Status:** Completed locally; documentation-only.  
**Date:** 2026-08-15  
**Owner:** Project owner (agent-assisted)  
**Release type:** `FAST-TRACK` (documentation only)  
**Risk level:** Low

## Goal

Make `docs/design.md` explicitly distinguish its intended motion/visual design
language from the current installed tooling state and from authorization to use
an interaction or external asset.

## Scope

- In scope: add the active-tooling boundary, per-interaction single-library
  choice, fallback/QA requirements, Design DNA role, and the external-resource
  use-right boundary to `docs/design.md`.
- Non-goals: no code, dependency, visual implementation, new design token,
  asset, route, deployment or license acquisition.
- Allowed files:
  - `docs/design.md`
  - `docs/plan/P1-T03-design-policy-toolchain-alignment-task-spec.md`
  - `docs/status/WORK_LOG.md`
- Forbidden files: every other repository and runtime path.

## Contracts and data

- Documents read: `docs/design.md`, `PROJECT_MANIFEST.md`, P1-T01, P1-T02,
  `DEFER-0012`, and ADR-0016/0018.
- Contracts changed: none; this is a clarification of existing static-first,
  progressive-enhancement and third-party-adaptation rules.
- Data, locale, visibility and security impact: none; no external asset or
  account is added.

## Verification and release

- Tests/commands to run: targeted reference search and `git diff --check`.
- Acceptance criteria: design policy says the installed libraries are inactive
  in P1; future use needs one library choice, route-local/lazy loading,
  no-JS/static and reduced-motion fallback, keyboard/RTL/LTR/mobile/performance
  QA; Design DNA cannot override the project design system; external assets
  remain blocked on source/version/use-right.
- Rollback/fallback: revert the task-owned documentation changes.
- Documentation to update: `WORK_LOG.md`.

## Handoff

- Files changed: task-owned documentation only.
- Deferred/risk IDs: `DEFER-0012` unchanged.
- Explicit blockers: a concrete approved interaction and, for external UI,
  owner-provided source/version/license evidence.
