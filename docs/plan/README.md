# Plan index ? which spec do I execute?

Goal:
You pick the correct Task Spec in under one minute and never re-run finished work.

Rule:
Execute a spec only if it appears under **Active** below.
Everything under **Archived** is history. Read it for context; never execute it.

Last reconciled: 2026-08-25.

---

## 1. Active

| Spec | State | Who runs it | Notes |
|---|---|---|---|
| `wave1-web-polish-task-spec.md` | DONE (live) | agent | Writing-canonical + RSS + OG + catalog URL filters. LOG-0211; prod rebuild LOG-0216. |
| `wave2-cms-web-addons-task-spec.md` | DONE (live) | agent + owner | Statement PDF schema, lightbox, CSP Report-Only. LOG-0212; prod migrate `0013` LOG-0216. |
| `P8-publications-books-talks-downloads-task-spec.md` | DONE (live) | agent + owner | Wave 3 LOG-0213; prod migrate `0014` + rebuild LOG-0216. Catalogs empty-honest until CMS content. |
| `wave4-research-graph-island-task-spec.md` | DONE (live) | agent | ADR-0028 research graph island. LOG-0214; live after LOG-0216 rebuild. |
| `wave5-adm-qa-pagefind-task-spec.md` | DONE (live) | agent | ADM QA + service/flags + Pagefind. LOG-0215; `/search/` live LOG-0216. `DEFER-0032` PARTIAL. |
| `cms-origin-and-full-stack-cd-task-spec.md` | DONE (repo + edge) | agent | ADR-0027; Compose Caddy live; HMAC CLOSED. LOG-0210. |
| `P3-public-preview-token-task-spec.md` | DONE | agent | DEFER-0016 CLOSED (LOG-0204/0209). |
| `blog-story-composition-task-spec.md` | PARTIAL | agent | Blog/entity stories in repo; keep content publishing honest. |
| `rich-blocks-v2-task-spec.md` | DONE | agent | Six no-JS story blocks. Live via web rebuilds. |
| `ADM-6-frontend-wiring-task-spec.md` | PARTIAL | agent | Remaining: ?18 manual QA (`DEFER-0032` PARTIAL). |
| `P14-personal-platform-experience-redesign-task-spec.md` | DONE (design package) | agent + owner | Quality-audited dual-theme direction, RTL/mobile/detail/admin concepts, and UX/CMS/graph handoff complete; no frontend or route changes. |
| `P14A-redesign-asset-pack-task-spec.md` | DONE (asset pack) | agent | Authoritative logo PNGs, six standalone artworks, seven final concept references, prompt/source/crop/alt/performance documentation, and integrity hashes; no runtime changes. |
| `P14B-requested-concept-asset-extraction-task-spec.md` | DONE (asset extension) | agent | Preserved five requested concept sources and added centered Dark/Light portal plus three missing project-cover masters; dynamic UI/graph remains native. |
| `P14C-public-page-family-visual-atlas-task-spec.md` | DONE (design atlas) | agent + owner | Eight reviewed page-family concepts, 9.86/10 design-package audit, complete CMS/RTL/state/component handoff, 33 managed PNG hashes, and a 12/16 Figma-Lite recommendation; no runtime work. |
| `P0-A-stack-inventory-task-spec.md` | BLOCKED (owner) | owner | Read-only VPS inventory. Not an agent task. |
| `master-remaining-work-checklist.md` | ACTIVE board | agent + owner | Single remaining-work board (LOG-0218). Bakes in owner constraints: all content CMS-managed, complete admin UX, minimal VPS SSH, RISK-0011 de-risking. Execute items only from this board. |

Owner remaining work that is **not** a new spec: demo allowlist before CSP enforce (`DEFER-0021`); manual ADM QA remainder (`DEFER-0032` / S6); optional Research Statement PDF Media upload; contact inbox (`DEBT-0006`). Old-stack decommission **CLOSED** (LOG-0216). HMAC (`DEFER-0027`) and Compose Caddy (`DEFER-0031`) **CLOSED**. Do **not** set `CMS_CD_AUTO_MIGRATE`.

## 2. Queued ? do not start yet

| Spec | Blocked by |
|---|---|
| `P7-professional-admin-task-spec.md` | Superseded by ADM phases (ADR-0026). Remaining P7-01?P7-04 live in ADM-4/ADM-1/ADM-6. Do not execute this spec. |
| `P7-admin-detail-pages-task-spec.md` | Nested profile editor moves into the SPA; remaining bilingual detail pages for other entities stay queued. |

## 3. Reference ? not executable

| File | Role |
|---|---|
| `SAMPLES-TRANSFER-RECOMMENDATIONS.md` | Analysis catalog of `SAMP-*` IDs. Bound into `Task-list.md`. Do not create a second spec from it. |
| `SMALL-MODEL-EXECUTION-PLAN.md` | Operating playbook for small models. See ?5 caveat. |
| `S-PLAN-STATE.md` | Task state tracker for the S-Plan phases. |
| `B5-VISUAL-INTERACTION-ADOPTION.md` | Proposal only. Nothing in it is implemented or authorized (Candidate 4 research graph adopted via ADR-0028). |
| `DESIGN-UI-UX-IMPROVEMENT-REVIEW.md` | Index (2026-08-22). Points at the two files below. Nothing implemented or authorized. |
| `DESIGN-UI-CURRENT-PROBLEMS.md` | Current public UI defects (`P1`?`P19`): undefined tokens, contrast, a11y, IA drift. Ledger IDs not allocated. |
| `DESIGN-UI-UX-IMPROVEMENT-PROPOSALS.md` | Suggestions (`S1`?`S37`) including for rules already in `design.md` / contract cards. Proposals only. |
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
The active agent specs in ?1 include Wave polish/P8 follow-ups; P7 remains queued/superseded. Owner inventory stays owner-only.

If the playbook mentions an OpenCode agent you do not have, ignore the dispatch
mechanism and execute the active spec directly.

---

## 6. Adding a new spec

1. Copy `docs/templates/TASK_SPEC_TEMPLATE.md`.
2. Name it `<phase>-<short-topic>-task-spec.md`.
3. Put a `**Status:**` line directly under the title. Use `READY`, `QUEUED`, `BLOCKED`, `PARTIAL`, or `DONE`.
4. Use full repo-relative paths in Allowed files. Never a bare filename.
5. Give every verification step an exact command and an expected result.
6. Add a row to ?1 or ?2 of this file in the same change.

Expected result:
Another agent can execute your spec without asking you a question.
