# Task Spec — P0-G0 repository metadata publish (README and ignore file)

**Status:** Executed 2026-08-14 — all four task-owned files are complete, including Work Log entry `LOG-0043`; verification passed and only owner review before push remains. `LOG-0043` is used because the primary worktree has owner-held, uncommitted `LOG-0041` and `LOG-0042` records, and this clean branch therefore continues the append-only ledger without collision.  
**Date:** 2026-08-14  
**Owner:** Project owner  
**Release type:** `FAST-TRACK` (documentation-only, low-risk, limited scope)  
**Risk level:** Low  
**Risk IDs:** none new; existing `RISK-0001` gate context unchanged

## Task

- Goal: publish accurate repository metadata for the already-public GitHub repository by making `README.md` a complete, fact-sourced entry point and by hardening `.gitignore` against local control-plane artifacts and secret-bearing backup environment files — without touching application code, infrastructure, Git state or the P0-G0 gate.
- User/actor and journey: a first-time visitor or contributor opens the public GitHub repository, reads the README, understands product, current status, layout and safety rules, and enters the documentation at `PROJECT_MANIFEST.md`/`AGENTS.md` without guessing.
- Owner and handoff recipient: project owner.

## Scope

- In scope:
  - This Task Spec at the permitted documentation path.
  - `README.md` content updated using only facts from `PROJECT_MANIFEST.md`, `AGENTS.md` and `docs/status/` ledgers.
  - `.gitignore` guard-only additions: backup environment-file guard, OS/editor artifacts, agent-local state directories.
  - `docs/status/WORK_LOG.md` entry `LOG-0043` appended in this run.
- Non-goals:
  - No scaffold, package manifest, dependency, CI workflow, endpoint, model, DNS, deploy or server change; the P0-G0 gate is unchanged.
  - No Git command, network access or push; publication to GitHub happens only through the owner's normal flow after verification.
  - No change to `PROJECT_MANIFEST.md` or to any file beyond the four task-owned paths.
- Allowed files: this spec, `README.md`, `.gitignore`, `docs/status/WORK_LOG.md`.
- Forbidden files: everything else.

## Contracts and data

- Documents/ADRs/API schemas/models read: `PROJECT_MANIFEST.md`; `AGENTS.md`; `docs/governance/DOCUMENTATION_POLICY.md`; `docs/governance/RELEASE_POLICY.md` (release-type definitions); `docs/templates/TASK_SPEC_TEMPLATE.md`; `docs/plan/P0-A-server-access-dns-backup-task-spec.md` and `docs/plan/P0-A-restore-rehearsal-task-spec.md` (format precedent); `docs/status/WORK_LOG.md` LOG-0001–LOG-0040; `docs/status/RISK_REGISTER.md`; `docs/status/deferred-validation.md`; `docs/governance/BACKUP_RUNBOOK.md` and `infra/backup/*` (confirming the secret-bearing file is `/etc/taha-backup.env` on the VPS while only `infra/backup/taha-backup.env.example` belongs in Git).
- Contracts changed: none. The README presents existing decisions; the ignore rules add no behavior for tracked files.
- Migration/data impact: none.
- Locale, visibility and publication impact: none; no public-site surface changes. Repository visibility stays public per `PROJECT_MANIFEST.md`.
- Security/privacy impact: defensive only. `.gitignore` gains an explicit guard so a local copy of the backup environment file (`infra/backup/*.env`) cannot be committed, and agent-local state directories are excluded from publication. No secret value is written anywhere.

## Verification and release

- Verification run in this task:
  - Documentation contract read: `PROJECT_MANIFEST.md`, `AGENTS.md`, `docs/governance/DOCUMENTATION_POLICY.md`, `docs/governance/RELEASE_POLICY.md`.
  - README relative documentation links — all referenced `docs/` paths exist.
  - `git diff --check` — passed, no whitespace errors.
- Optional owner pre-push sanity checks: `git status --short --branch` (only the four task-owned paths changed); `git check-ignore -v infra/backup/taha-backup.env` (must be ignored) and `git check-ignore infra/backup/taha-backup.env.example` (must not be ignored).
- Manual QA path: read the rendered README on the public repository after the owner's next push; confirm every claim traces to `PROJECT_MANIFEST.md`/ledgers and that no deployment or gate PASS is implied.
- Acceptance criteria:
  - README contains only verifiable facts (canonical remote, default branch, domains, locale roots, layout, approved baseline, current status); no invented versions, dates, endpoints or features.
  - README does not claim P0-G0 PASS, an application deployment, or closure of any open risk.
  - `.gitignore` additions are pure guards: no currently tracked file becomes ignored, and `infra/backup/taha-backup.env.example` remains trackable.
  - No secret, token, credential or private value appears in any changed file.
- Rollback/fallback: revert the four task-owned files (`docs/plan/P0-G0-repository-metadata-task-spec.md`, `README.md`, `.gitignore`, `docs/status/WORK_LOG.md`) to their previous versions. No runtime effect exists to roll back.
- Documentation to update: `WORK_LOG`, `deferred-validation`, `RISK_REGISTER`, `TECH_DEBT`, `known-issues` as applicable. The required Work Log entry is recorded as `LOG-0043` in this clean branch because the primary worktree has owner-held, uncommitted `LOG-0041` and `LOG-0042` records. No validation work is being deferred, so no new deferred/risk ID is created here.

## Handoff

- Files changed (task-owned only, four files): `docs/plan/P0-G0-repository-metadata-task-spec.md` (created), `README.md`, `.gitignore`, `docs/status/WORK_LOG.md` (LOG-0043 appended).
- Verification actually run (command + result): documentation contract read; README relative documentation links verified to exist; `git diff --check` passed. No runtime, deployment, dependency, infrastructure, secret or server change was made.
- Deferred/risk IDs: none created; no deferral or new risk. `LOG-0043` is used because the primary worktree has owner-held, uncommitted `LOG-0041` and `LOG-0042` records.
- Explicit blockers and next input: owner review of the README wording before push. On merge, the primary worktree's `LOG-0041`/`LOG-0042` records and this branch's `LOG-0043` must coexist in sequence so the append-only ledger stays collision-free.
