# Plan index — which spec do I execute?

Goal:
You pick the correct Task Spec in under one minute and never re-run finished work.

Rule:
Execute a spec only if it appears under **Active** below.
Everything under **Archive** is history. Read it for context; never execute it.

Last reconciled: 2026-08-24 (docs reorg — 56 finished/stale specs moved to `archive/`).

---

## 1. Active

| Spec | State | Who runs it | Notes |
|---|---|---|---|
| **`PARALLEL_EXECUTION_PLAN.md`** | **ACTIVE — execution order & agent assignment** | N agents | Phase waves A→B→C/D→X(parallel)→Z; file-domain locks so tasks never collide. |
| `master-remaining-work-checklist.md` | Ledger of item details + evidence | agent + owner | Single ledger (LOG-0218); redesign phases now expressed as Waves A–Z in the parallel plan. |
| `reDesign_plan.md` (repo root) | ACTIVE — binding redesign v2 plan | agent | Glass Constellation identity; ADR-0031. |

> The canonical board file is `master-remaining-work-checklist.md` — item-level
> acceptance criteria and evidence lines live there; scheduling lives in
> `PARALLEL_EXECUTION_PLAN.md`. When they disagree on *order*, the parallel plan wins;
> when they disagree on *acceptance*, the checklist wins.

Owner remaining work that is **not** a new spec: demo allowlist before CSP enforce (`DEFER-0021`); manual ADM QA remainder (`DEFER-0032`); contact inbox (`DEBT-0006`).
Do **not** set `CMS_CD_AUTO_MIGRATE`.

### Pending / partial (kept at root of `archive/pending/`)

| Spec | State | Notes |
|---|---|---|
| `archive/pending/ADM-6-frontend-wiring-task-spec.md` | PARTIAL | Remaining: §18 manual QA (`DEFER-0032`). |
| `archive/pending/blog-story-composition-task-spec.md` | PARTIAL | Blog/entity stories in repo; keep content publishing honest. |
| `archive/pending/P0-A-stack-inventory-task-spec.md` | BLOCKED (owner) | Read-only VPS inventory. Not an agent task. |

## 2. Archive — completed, superseded, or stale (do not execute)

Lives in `docs/plan/archive/`. Contents:

- **P0 gate & infrastructure** — G0 gate docs-drift/fast-safe-live/gate-decision/repo-metadata/tech-freeze ADRs, web scaffold, restore rehearsal, server access/DNS/backup, CI Node24 upgrade.
- **P0-G0 extras** — content-pack proposal, r0-1 opencode governance.
- **P1 landing & visual** — structured data, gateway UI review, typography/fonts, visual elevation, T01–T03 toolchain alignment, RELEASE-P1, VISUAL-QA-P1, PROD-ACCEPTANCE, RELEASE-QA.
- **P2 About/CV** — honesty closeout, about tabs, zoom safety, mobile overflow CI, evidence reconciliation, C1 content request.
- **P3 CMS** — gate code-first, deploy, versioned CI/CD, backup/restore, MFA/TOTP ×2, preview boundary, public preview token, public API Caddy.
- **P4–P6** — blog/writing, research, case studies.
- **Waves 1–5** — web polish, CMS/web addons, research graph island (ADR-0028 — island since removed from code, to be replaced by D3 TopicGraph per ADR-0031), ADM QA + Pagefind.
- **Superseded** — P7 professional admin + detail pages (folded into ADM phases via ADR-0026), CMS origin/full-stack CD (ADR-0027, live).
- **Design review set (2026-08-22)** — `DESIGN-UI-CURRENT-PROBLEMS.md` (P1–P19) + proposals (S1–S37) + index. All P-findings now carry ledger IDs and the E-series fixes are CLOSED on the master board; kept as evidence/history. Visual direction has moved on to ADR-0031.
- **B5-VISUAL-INTERACTION-ADOPTION.md** — superseded by ADR-0030 (authorization) + ADR-0031 (ladder). Kept as history.
- **Process artifacts** — S-PLAN-STATE (S-plan tracker, all DONE/BLOCKED-owner), SMALL-MODEL-EXECUTION-PLAN, SAMPLES-TRANSFER-RECOMMENDATIONS, P0-G0-content-pack-proposal.

Staging-host instructions inside archived specs are obsolete (ADR-0025).

## 3. Reference — not executable

| File | Role |
|---|---|
| `custom-admin-rebuild-fa.md` | Master plan for the custom admin rebuild (ADM-0..ADM-6 context, §14 remaining work). Reference for board items B*/A*. |
| `LICENSES.md` | Third-party licence notes incl. GSAP acceptance (ADR-0030). |
| `manual-test-checklists/` | S6 ADM QA checklist + publish/rebuild chain checklist (used by DEFER-0032 remainder). |

## 4. Caveat on `SMALL-MODEL-EXECUTION-PLAN.md`

Historical operating playbook for small models (archived). If a small-model run
is ever attempted again, re-read it with the caveat that staging references are
obsolete and the active board is `master-remaining-work-checklist.md`.
