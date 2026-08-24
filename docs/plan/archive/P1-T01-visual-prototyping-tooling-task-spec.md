# Task Spec — P1-T01 visual-prototyping tooling

**Status:** Completed locally; no public-site behavior changed.  
**Date:** 2026-08-15  
**Owner:** Project owner (agent-assisted)  
**Release type:** `FAST-TRACK` (tooling-only; no rendered-site change)  
**Risk level:** Low

## Goal

Make the user-requested open-source animation and 3D libraries available to
future, explicitly approved Astro islands without changing the static P1
experience. Install the supplied Design DNA agent skill separately. Do not
claim that non-package design-resource sites have been acquired or licensed.

## Scope

- In scope:
  - add `motion`, `gsap`, and `three` to `apps/web/` production dependencies
    and refresh the npm lockfile;
  - install `zanwei/design-dna` into the local Codex skills directory;
  - verify the unchanged static artifact with the Manifest commands;
  - record the unavailable Beautiful UI and UI8 DNA resources as a deferred
    owner-input/licensing step.
- Non-goals:
  - no React island, animation, WebGL/canvas, generated asset, UI component,
    route, content, font, CSS, or public bundle behavior;
  - no download, copy, or use of Beautiful UI or UI8 DNA assets;
  - no deployment, staging change, or production release.
- Allowed files:
  - `apps/web/package.json`
  - `apps/web/package-lock.json`
  - `docs/plan/P1-T01-visual-prototyping-tooling-task-spec.md`
  - `docs/status/WORK_LOG.md`
  - `docs/status/deferred-validation.md`
- Forbidden files:
  - every other repository path, including public source and deployment files.

## Contracts and data

- Documents/ADRs read: `AGENTS.md`, `PROJECT_MANIFEST.md`,
  `docs/governance/{RELEASE_POLICY,DOCUMENTATION_POLICY}.md`,
  `docs/design.md`, ADR-0016, ADR-0018 and ADR-0019.
- Contracts changed: none. The P1 public page remains static-first and readable
  without JavaScript. A future implementation requires its own Task Spec and
  must follow the selective-motion, reduced-motion, lazy-loading and
  non-render-blocking requirements in `docs/design.md`.
- Migration/data impact: none.
- Locale, visibility and publication impact: none.
- Security/privacy impact: no secret, account, purchase or third-party asset
  is added. Dependency audit is required.

## Verification and release

- Tests/commands to run: `npm install`, `npm run check`, `npm run build` and
  `npm audit` in `apps/web/`.
- Manual QA path: inspect the build output and confirm no public source file
  changed; browser-level visual QA remains `DEFER-0010` because this slice has
  no visual behavior.
- Acceptance criteria:
  - the three npm packages resolve in `package-lock.json`;
  - Design DNA is installed as a Codex skill;
  - check, build and audit pass;
  - no page source or shipped behavior is changed;
  - UI8/Beautiful UI use remains deferred pending a licensed/source-provided
    artifact and a separate implementation slice (`DEFER-0012`).
- Rollback/fallback: restore the task-owned package manifests from the previous
  Git revision and remove the installed Design DNA skill directory. No runtime
  or deployment state exists.
- Documentation to update: `WORK_LOG.md`, `deferred-validation.md`.

## Handoff

- Files changed (task-owned only): package manifests plus this Task Spec and
  the required status ledgers.
- Verification actually run (command + result): recorded in `WORK_LOG.md`.
- Deferred/risk IDs: `DEFER-0010`, `DEFER-0012`.
- Explicit blockers and next input: approved source files and license/use
  rights for any Beautiful UI or UI8 DNA artifact; a concrete interaction and
  its reduced-motion/static fallback before using the installed libraries.
