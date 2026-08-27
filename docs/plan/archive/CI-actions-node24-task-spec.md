# Task Specification — CI Action Version Bump (Node 24 runtime)

## Task: P0A-07 follow-up — bump GitHub Actions to node24-runtime majors

- Goal: remove the GitHub Actions runner deprecation annotation ("Node.js 20 is deprecated … forced to run on Node.js 24") that appeared on CI run `31907246943` for `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4` by upgrading to the latest majors that run on the `node24` runtime.
- User/actor and journey: CI pipeline only; no app behavior, no artifact contract change, no deploy.
- Release type: `FAST-TRACK`
- Risk level: Low (actions bump; verified majors run on `node24`; unchanged workflow semantics)
- Owner and handoff recipient: main agent → CI verification.

## Scope

- In scope: `actions/checkout@v4` → `v7.0.1`, `actions/setup-node@v4` → `v7.0.0`, `actions/upload-artifact@v4` → `v7.0.1` in `.github/workflows/ci.yml`; Task Spec; `WORK_LOG` entry.
- Non-goals: no workflow restructuring, no new steps, no runner change, no `apps/` or `infra/` change, no dependency or lockfile change.
- Allowed files: `.github/workflows/ci.yml`, `docs/plan/CI-actions-node24-task-spec.md` (this file), `docs/status/WORK_LOG.md`.
- Forbidden files: everything else; no secrets.

## Contracts and data

- Documents/ADRs/API schemas/models read: ADR-0009 (GitHub Actions hosted CI), `.github/workflows/ci.yml`, GitHub Actions runner deprecation changelog (2025-09-19: Node 20 actions forced onto Node 24), action releases verified via `gh api` (`checkout v7.0.1`, `setup-node v7.0.0`, `upload-artifact v7.0.1` — all `runs.using: node24`).
- Contracts changed: none (workflow inputs/outputs unchanged; setup-node cache behavior and artifact upload semantics preserved by the majors).
- Migration/data impact: none.
- Locale, visibility and publication impact: none.
- Security/privacy impact: none; actions are the same publishers, latest major tags.

## Verification and release

- Tests/commands to run:
  - `git diff --check` (and `--cached --check`)
  - push → watch GitHub Actions run; require: type check, build, smoke, both Playwright suites, `npm audit`, artifact completeness/no-secret, upload all PASS, and no Node-20 deprecation annotation.
- Manual QA path: none beyond CI.
- Acceptance criteria:
  - The pushed CI run is green with zero deprecation annotations.
  - Workflow step semantics unchanged (same 13 steps, same artifact name `web-dist-${{ github.sha }}`).
- Rollback/fallback: revert the single-file commit; the previous v4 pins remain valid.
- Documentation to update: `WORK_LOG` (new LOG entry with run ID and result).

## Handoff

- Files changed (task-owned only): `.github/workflows/ci.yml`, this Task Spec, `WORK_LOG.md`.
- Verification actually run (command + result): filled in the `WORK_LOG` entry after CI completes.
- Deferred/risk IDs: none new.
- Explicit blockers and next input: none; no deploy is performed.
