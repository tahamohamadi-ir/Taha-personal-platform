# Task Spec — P1-T02 visual-toolchain documentation alignment

**Status:** Completed locally; documentation-only.  
**Date:** 2026-08-15  
**Owner:** Project owner (agent-assisted)  
**Release type:** `FAST-TRACK` (documentation only; no rendered-site change)  
**Risk level:** Low

## Goal

Align the architecture baseline, Manifest, roadmap, task tracker, Task Specs
and status ledgers with the verified tooling state: `motion`, `gsap` and
`three` are locked in `apps/web/`; Design DNA is installed locally for agent
use; no library is imported or active in static P1; Beautiful UI and UI8 DNA
remain external-resource decisions under `DEFER-0012`.

## Scope

- In scope:
  - resolve the accidental collision between the completed tooling Task Spec
    and roadmap task `P1-10` (frontend verification);
  - document installed-versus-authorized-versus-active state, package versions
    and the mandatory adoption gate for future interactive work;
  - update the roadmap and small-model tracker without scheduling or executing
    any visual feature;
  - record this documentation slice in the Work Log.
- Non-goals:
  - no dependency, application source, component, route, animation, WebGL,
    canvas, asset, deployment, staging or production change;
  - no component or asset acquisition from Beautiful UI or UI8 DNA;
  - no alteration of historical Task Specs or immutable ADR decisions.
- Allowed files:
  - `PROJECT_MANIFEST.md`, `README.md`
  - `Task-list.md`
  - `docs/taha-personal-platform-development-master-plan-fa.md`
  - `docs/taha-personal-platform-technology-architecture-baseline-fa.md`
  - `docs/plan/P1-T01-visual-prototyping-tooling-task-spec.md`
  - `docs/plan/P1-T02-visual-toolchain-documentation-alignment-task-spec.md`
  - `docs/plan/{SMALL-MODEL-EXECUTION-PLAN,S-PLAN-STATE}.md`
  - `docs/status/{WORK_LOG,deferred-validation}.md`
- Forbidden files:
  - every source, configuration, lockfile, deployment and runtime file;
  - all existing historical Task Specs and ADRs other than the P1-T01 rename.

## Contracts and data

- Documents/ADRs read: `AGENTS.md`, `PROJECT_MANIFEST.md`,
  `docs/governance/{RELEASE_POLICY,DOCUMENTATION_POLICY}.md`,
  `docs/design.md`, ADR-0016, ADR-0018, P1-T01 and the active roadmaps.
- Contracts changed: none. `P1-10` remains frontend verification; the tooling
  slice is renamed `P1-T01`; all future use stays optional and gated.
- Migration/data/locale/visibility impact: none.
- Security/privacy impact: no secrets, accounts, third-party assets or runtime
  behavior are added.

## Verification and release

- Tests/commands to run: documentation link/reference search, `git diff --check`
  and a scope-only diff review.
- Acceptance criteria:
  - every planning document distinguishes package availability from active P1
    use;
  - all references use `P1-T01` for completed tooling and reserve `P1-10` for
    frontend verification;
  - future adoption requires a concrete user value, a single library choice,
    no-JS/static and reduced-motion fallback, lazy/non-render-blocking loading,
    RTL/LTR/mobile/keyboard QA, performance evidence and a dedicated Task Spec;
  - Design DNA is described as an agent tool; external UI resources stay under
    `DEFER-0012` until source and rights are provided;
  - no code/configuration files change.
- Rollback/fallback: revert only the task-owned documentation changes. No
  runtime state exists.
- Documentation to update: `WORK_LOG.md`.

## Handoff

- Files changed (task-owned only): those listed above.
- Verification actually run (command + result): recorded in `WORK_LOG.md`.
- Deferred/risk IDs: `DEFER-0010`, `DEFER-0012`; no new ID expected.
- Explicit blockers and next input: a concrete interaction, approved copy or
  asset, and (where applicable) a licensed, owner-provided external resource.
