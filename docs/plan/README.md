# Plan index ? which spec do I execute?

Goal:
You pick the correct Task Spec in under one minute and never re-run finished work.

Rule:
Execute a spec only if it appears under **Active** below.
Everything under **Archived** is history. Read it for context; never execute it.

Last reconciled: 2026-08-22.

---

## 1. Active

| Spec | State | Who runs it | Notes |
|---|---|---|---|
| `wave1-web-polish-task-spec.md` | DONE (merged) | agent | Writing-canonical + RSS + OG + catalog URL filters (Wave 1). LOG-0211. |
| `wave2-cms-web-addons-task-spec.md` | DONE (merged) | agent | Statement PDF, lightbox, CSP Report-Only demos. LOG-0212. Owner migrate `content.0013`. |
| `P8-publications-books-talks-downloads-task-spec.md` | DONE (merged, migrate pending) | agent ? owner | Wave 3 LOG-0213. Migration `content.0014` (depends on `0013`). Attended migrate + rebuild-web required. |
| `cms-origin-and-full-stack-cd-task-spec.md` | DONE (repo + edge) | agent | ADR-0027 Slices 0?5; Compose Caddy live (`DEFER-0031`/`RISK-0013` CLOSED, LOG-0210); HMAC `DEFER-0027` CLOSED. |
| `P3-public-preview-token-task-spec.md` | DONE | agent | DEFER-0016 CLOSED 2026-08-22 (LOG-0204 repo; LOG-0209 production secret + CMS recreate). |
| `blog-story-composition-task-spec.md` | PARTIAL | agent | Blog story live; entity stories Slice 5 (`DEFER-0030` CLOSED in ledger). Owner migrate + rebuild. |
| `rich-blocks-v2-task-spec.md` | DONE | agent | Six no-JS story blocks (accordion/tabs/timeline/counters/before_after/slider). Owner static rebuild after merge. |
| `ADM-6-frontend-wiring-task-spec.md` | PARTIAL | agent | Featured?Media + Wagtail uninstall closed; HMAC `DEFER-0027` CLOSED. Remaining: §18 QA matrix only (`DEFER-0032`). |
| `P0-A-stack-inventory-task-spec.md` | BLOCKED (owner) | owner | Read-only VPS inventory. Not an agent task. |

Owner remaining work that is **not** a new spec: attended migrate `content.0013` then `content.0014` + Caddy reload + `rebuild-web.sh`; demo allowlist before CSP enforce (`DEFER-0021`); merge Waves 4?5 then rebuild. HMAC (`DEFER-0027`) and Compose Caddy (`DEFER-0031`) are **CLOSED** (LOG-0210). Do **not** set `CMS_CD_AUTO_MIGRATE`.

## 2. Queued ? do not start yet

| Spec | Blocked by |
|---|---|
| `P7-professional-admin-task-spec.md` | Superseded by ADM phases (ADR-0026). Remaining P7-01?P7-04 live in ADM-4/ADM-1/ADM-6. Do not execute this spec. |
| `P7-admin-detail-pages-task-spec.md` | Nested profile editor moves into the SPA; remaining bilingual detail pages for other entities stay queued. |

## 3. Reference ? not executable

| File | Role |
|---|---|
| `SAMPLES-TRANSFER-RECOMMENDATIONS.md` | Analysis catalog of `SAMP-*` IDs. Bound into `Task-list.md`. Do not create a second spec from it. |
| `SMALL-MODEL-EXECUTION-PLAN.md` | Operating playbook for small models. See §5 caveat. |
| `S-PLAN-STATE.md` | Task state tracker for the S-Plan phases. |
| `B5-VISUAL-INTERACTION-ADOPTION.md` | Proposal only. Nothing in it is implemented or authorized. |
| `P0-G0-content-pack-proposal.md` | Content proposal record. |
| `LICENSES.md` | Third-party licence notes. |

## 4. Archived ? completed, do not execute

These describe work that already shipped. Several still contain instructions
that reference the decommissioned staging host (ADR-0025). Treat every staging
command in them as obsolete.

**P0 gate and infrastructure**
`P0-G0-documentation-drift-task-spec.md`,
`P0-G0-fast-safe-live-task-list-task-spec.md`,
`P0-G0-gate-decision-task-spec.md`,
`P0-G0-repository-metadata-task-spec.md`,
`P0-G0-technical-freeze-adrs-task-spec.md`,
`P0-A-web-scaffold-task-spec.md`,
`P0-A-restore-rehearsal-task-spec.md`,
`P0-A-server-access-dns-backup-task-spec.md`,
`CI-actions-node24-task-spec.md`

**P1 landing and visual**
`P1-09-structured-data-task-spec.md`,
`P1-gateway-ui-review-task-spec.md`,
`P1-typography-font-task-spec.md`,
`P1-visual-elevation-task-spec.md`,
`P1-T01-visual-prototyping-tooling-task-spec.md`,
`P1-T02-visual-toolchain-documentation-alignment-task-spec.md`,
`P1-T03-design-policy-toolchain-alignment-task-spec.md`,
`RELEASE-P1.md`, `VISUAL-QA-P1.md`, `PROD-ACCEPTANCE.md`, `RELEASE-QA.md`

**P2 About and CV**
`P2-honesty-closeout-task-spec.md`,
`P2-about-tabs-task-spec.md` ? *superseded in part:* `P2-H` replaces exclusive
tab hiding with stacked evidence. The CSS tab mechanic may stay; hiding evidence
panels with `display: none` may not.
`P2-zoom-safety-task-spec.md`,
`P2-mobile-overflow-ci-regression-task-spec.md`,
`P2-evidence-state-reconciliation-task-spec.md`,
`P2-C1-CONTENT-REQUEST.md` ? owner questionnaire, already filled.

**P3 CMS**
`P3-gate-code-first-task-spec.md`,
`P3-cms-deploy-task-spec.md`,
`P3-cms-versioned-cicd-task-spec.md`,
`P3-cms-backup-restore-task-spec.md` ? DONE; `RISK-0003` CLOSED (`LOG-0140`).
`P3-mfa-totp-enrollment-task-spec.md`,
`P3-mfa-totp-recovery-codes-task-spec.md`,
`P3-preview-boundary-task-spec.md`,
`P3-public-preview-token-task-spec.md` ? DONE; DEFER-0016 CLOSED (`LOG-0204`).
`P3-public-api-caddy-task-spec.md` ? DONE; `DEFER-0017` CLOSED (`LOG-0143`).

**P4?P6 public routes**
`P4-blog-writing-task-spec.md`,
`P5-research-task-spec.md`,
`P6-case-studies-task-spec.md`

**Other**
`R0-rtk-opencode-task-spec.md`

## 5. Caveat on `SMALL-MODEL-EXECUTION-PLAN.md`

That playbook is still useful for its rules, escalation triggers, and Work Log
template. Two parts are stale:

- Its "current snapshot" section still describes the decommissioned staging host.
- Its phase backlog lists tasks as READY that `S-PLAN-STATE.md` already marks DONE.

When they disagree, `S-PLAN-STATE.md` and this file win.
The active agent specs in §1 include Wave polish/P8 follow-ups; P7 remains queued/superseded. Owner inventory stays owner-only.

If the playbook mentions an OpenCode agent you do not have, ignore the dispatch
mechanism and execute the active spec directly.

---

## 6. Adding a new spec

1. Copy `docs/templates/TASK_SPEC_TEMPLATE.md`.
2. Name it `<phase>-<short-topic>-task-spec.md`.
3. Put a `**Status:**` line directly under the title. Use `READY`, `QUEUED`, `BLOCKED`, `PARTIAL`, or `DONE`.
4. Use full repo-relative paths in Allowed files. Never a bare filename.
5. Give every verification step an exact command and an expected result.
6. Add a row to §1 or §2 of this file in the same change.

Expected result:
Another agent can execute your spec without asking you a question.
