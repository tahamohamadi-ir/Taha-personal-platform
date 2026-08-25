# P14 — Personal Platform Experience Redesign Deliverables

**Status:** DONE — owner-approved direction, quality audit, and handoff complete

## Task: P14 / design foundation and handoff

- Goal: replace the failed visual direction with an approved bilingual,
  PhD-focused, dual-theme experience specification before frontend work begins.
- User/actor and journey: the owner curates content; professors and senior
  industry visitors evaluate identity, research fit, evidence, and contact.
- Release type: `STANDARD`
- Risk level: Medium — future implementation may supersede IA/design contracts.
- Owner and handoff recipient: Taha Mohammadi / future implementation agent.

## Scope

- In scope: Light/Dark Home art direction, language/RTL/mobile/detail/admin
  coverage concepts, information architecture proposal,
  canonical detail-page model, design system, admin requirements, graph/motion
  handoff, and future single-tenant white-label boundary.
- Non-goals: frontend replacement, schema migration, route migration, Figma
  component library, deployment, publishing generated content, or production
  changes.
- Allowed files:
  - `docs/design-redesign/**`
  - `docs/superpowers/specs/2026-08-25-personal-platform-experience-redesign.md`
  - `docs/plan/P14-personal-platform-experience-redesign-task-spec.md`
  - `docs/plan/README.md`
  - `docs/status/WORK_LOG.md`
- Forbidden files: `apps/**`, `infra/**`, `.github/**`, production content/data.

## Contracts and data

- Documents/ADRs/API schemas/models read: `AGENTS.md`, `PROJECT_MANIFEST.md`,
  `docs/README.md`, `docs/plan/README.md`, `docs/contracts/IA-CONTRACT.md`, and
  `docs/contracts/DESIGN-CONTRACT.md`.
- Contracts changed: none. This package identifies proposed superseding changes
  that need separate IA/ADR/design-contract approval.
- Migration/data impact: none.
- Locale, visibility and publication impact: none; proposal preserves independent
  fa/en publication and forbids silent fallback.
- Security/privacy impact: documents public/sanitized/restricted boundaries; no
  secret, private phone, or production data is included.

## Verification and release

- Tests/commands to run: image presence/dimensions, Markdown link/path scan,
  placeholder/contradiction scan, contrast preflight, `git diff --check`, and
  exact changed-file list.
- Manual QA path: inspect the v3 Home pair plus gateway, RTL mobile, project
  detail, Blog detail, and admin graph concepts; read all handoff documents.
- Acceptance criteria: dual modes share one layout; Home order is preserved;
  every substantial content type can have a gated canonical detail page; admin
  curation and locked Design System are separated; graph phases share one model.
- Rollback/fallback: remove only the new P14 files and the two ledger/index lines.
- Documentation to update: `WORK_LOG`.

## Handoff

- Files changed (task-owned only): listed in Scope.
- Verification actually run: recorded in `WORK_LOG`.
- Deferred/risk IDs: no release deferral; frontend implementation is outside this
  design task.
- Explicit blockers and next input: none for P14. Frontend implementation and
  superseding contract/route decisions require a separate authorized task.
