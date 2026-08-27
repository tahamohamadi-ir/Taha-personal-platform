# Task Spec — P0-G0 fast-safe-live task-list assessment

**Status:** Completed as a documentation/planning slice; implementation is not authorized by this Task Spec.  
**Date:** 2026-08-14  
**Owner:** Project owner  
**Release type:** `FAST-TRACK` documentation-only  
**Risk level:** Low

## Goal

Read the current project contracts and evidence, evaluate the shortest safe path
to a first public release, and create a complete, ordered implementation backlog
in root `Task-list.md` that distinguishes blocking release work from work that may
be deferred without hiding residual risk.

## Scope

- In scope: project documentation, accepted ADRs, current status ledgers, Task
  Specs, recent Git history, the infrastructure artifact inventory, and creation
  of `Task-list.md`.
- In scope: append one evidence entry to `docs/status/WORK_LOG.md`.
- Non-goals: no application scaffold, dependency or lockfile; no API, schema,
  database, Docker, Caddy, DNS, VPS, backup, CI, deployment or production change.
- Allowed files: `Task-list.md`, this Task Spec and
  `docs/status/WORK_LOG.md`.
- Forbidden files: application/infrastructure source, existing ADRs, Manifest,
  governance policies and other status ledgers.

## Contracts and data

- Documents read: `AGENTS.md`, `PROJECT_MANIFEST.md`, governance policies,
  accepted ADRs, existing P0-A Task Specs and runbooks, status ledgers, Product
  Baseline, Development Master Plan, Technology Architecture Baseline,
  User Journey/IA Baseline and `design.md`.
- Contracts changed: none; `Task-list.md` is an execution index subordinate to
  the governing documents.
- Migration/data impact: none.
- Locale, visibility and publication impact: none.
- Security/privacy impact: no secret or sensitive server output is copied; only
  non-sensitive status already recorded in the repository is summarized.

## Verification and release

- Tests/commands: `git diff --check`; targeted `rg` checks for required plan
  sections and forbidden placeholder language; `git status --short`.
- Manual QA: verify the critical path, dependencies, owner decisions, blocking
  gates, rollback requirements and deferred-validation rules are explicit.
- Acceptance criteria: `Task-list.md` covers P0-G0 through P11, identifies a
  static-only first-live path, does not weaken Stop-the-line/Minimum Safe Gate,
  does not invent endpoints/models/metrics/content, and names the evidence
  required to close each release task.
- Rollback/fallback: remove the three task-owned documentation additions; no
  runtime state is affected.
- Documentation to update: `WORK_LOG.md` only; no new risk/deferred entry is
  created because this slice performs planning rather than deferring an executed
  release obligation.

## Handoff

- Files changed (task-owned only): this Task Spec, `Task-list.md`,
  `docs/status/WORK_LOG.md`.
- Verification actually run: recorded in the Work Log after completion.
- Deferred/risk IDs: the plan references current `RISK-0001`, `RISK-0003` to
  `RISK-0007`, and `DEFER-0001` to `DEFER-0006`; their status is not changed by
  this planning slice.
- Explicit blocker: execution remains under P0-G0 until a subsequent complete
  Task Spec and owner decisions authorize the relevant slice.
