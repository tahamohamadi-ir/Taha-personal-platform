# Plan index — which spec do I execute?

Goal:
You pick the correct Task Spec in under one minute and never re-run finished work.

Rule:
Execute a spec only if it appears under **Active — ATLAS timeline** below **and** its `State` is `READY`.
Everything else is `BLOCKED`, `QUEUED`, or `Archived` — read for context, never execute.
Every ATLAS packet requires a **separate repository Task Spec** before runtime changes (`AGENT-COORDINATION.md` §2, §6).

Last reconciled: 2026-08-26.

Reference commit: `Assets/site-redesign/implementation-reference/` — branch `p14c-visual-atlas`, commit `7d9b87f` (`7d9b87f3c2b04542e13c189adab3b57f2108d84a`). **Frontend rebuild NOT STARTED** — reference package is planning/handoff, not live runtime. Existing `apps/web` static remains current runtime until a P14 packet is accepted and merged.

---

## 1. Active — ATLAS timeline (next-generation frontend rebuild from scratch)

Source: `Assets/site-redesign/implementation-reference/MULTI-AGENT-TASK-LIST.md` — global constraints + execution board.
Gates: `Assets/site-redesign/implementation-reference/ACCEPTANCE-GATES.md` (G0..G9).
Coordination: `Assets/site-redesign/implementation-reference/AGENT-COORDINATION.md` — one integration lead, bounded worker branches, exclusive file ownership (no two active agents on `global.css`, `Header.astro`, `BaseLayout.astro`, `astro.config.mjs`, `package.json`, or shared ledgers).
Brief: `Assets/site-redesign/implementation-reference/MASTER-SPEC.md` §1–6, §11 (deliverables) + §12 (non-goals).
Umbrella Task Spec: [`ATLAS-frontend-rebuild-task-spec.md`](ATLAS-frontend-rebuild-task-spec.md).

> **ATLAS-00 must be activated by the integration lead before any worker packet.** No packet is executable until its repository Task Spec is created and the reference validator passes. **No CMS migration before ATLAS-08 audit is approved** (MASTER-SPEC §8, §12; MULTI-AGENT-TASK-LIST global constraints; ACCEPTANCE-GATES G6).

| Packet | Name | Owner role | Depends on | Can run with | Merge gate | State |
|---|---|---|---|---|---|---|
| **ATLAS-00** | **Freeze the implementation baseline** — run `node agent-kit/validate.mjs` (PASS: 24 components, 6 templates, 10 assets), verify `SHA256SUMS.txt` per `Assets/site-redesign/README.md`, record `git status`/`HEAD`/worktree manifest, create one worktree per active packet from the same base, assign exclusive paths, commit `docs: activate component atlas implementation` | **Integration lead** | Reference package `Assets/site-redesign/implementation-reference/` | — | **G0** — Reference integrity | **READY** (needs integration-lead activation; creates per-packet Task Specs) |
| **ATLAS-01** | **Adopt the dual-theme token contract** — `apps/web/src/styles/global.css` dual-theme roles + `docs/contracts/DESIGN-CONTRACT.md` + `apps/web/src/design-system/contracts.ts` (`ThemeName`/`Direction`/`ContentState`) + `qa/design-tokens.spec.mjs` + contrast ratios | Token agent | ATLAS-00 | CMS audit (ATLAS-08 read-only) | **G1** — Token authority | **BLOCKED** until ATLAS-00 |
| **ATLAS-02** | **Build primitives, controls and feedback states** — `Button`/`IconButton`/`LinkAction`/`Chip`/`Badge`/`InputField`/`TextareaField`/`ContentState` + `qa/ui-primitives.spec.mjs` (44px, focus-visible, disabled semantics, content-state slots) | Primitive agent | ATLAS-01 | Graph payload audit | **G2** — Primitive components | **BLOCKED** until ATLAS-01 |
| **ATLAS-03** | **Rebuild the public shell and language gateway** — `BaseLayout`/`Header`/`Footer`/`Breadcrumbs`/`pages/index.astro` + `ThemeToggle` + `qa/public-shell.spec.mjs` (gateway, RTL/LTR, active-route, 44px, theme persistence, no-JS) | Shell agent | ATLAS-02 | ATLAS-04 (parallel after primitives) | **G2/G3** — Primitives / Templates & page families | **BLOCKED** until ATLAS-02 |
| **ATLAS-04** | **Build shared content components** — `SectionLead`/`FeaturedRecord`/`ContentRow`/`PublicationRow`/`MetadataGroup`/`Timeline`/`MediaTile`/`TableOfContents`/`ContactCTA` + `qa/content-components.spec.mjs` | Content agent | ATLAS-02 | ATLAS-03 | **G2/G3** | **BLOCKED** until ATLAS-02 |
| **ATLAS-05** | **Build the six shared page templates** — `HomeTemplate`/`CollectionIndexTemplate`/`EditorialIndexTemplate`/`LongFormTemplate`/`EvidenceDetailTemplate`/`UtilityTemplate` + `qa/page-templates.spec.mjs` (canonical → template mapping, no empty detail shells) | Template agent | ATLAS-03, ATLAS-04 | Atlas scaffold (ATLAS-06 interfaces) | **G3** | **BLOCKED** until ATLAS-03 + ATLAS-04 |
| **ATLAS-06** | **Build the local-only Component Playground / Visual Atlas** — `src/design-atlas/` + `scripts/design-atlas.mjs` + conditional `injectRoute` for `/_design/` + `qa/design-atlas.spec.mjs` (default build has no `/_design/`, atlas not in sitemap/Pagefind) | Atlas agent | ATLAS-01 interfaces; merges after 02–05 | CMS audit | **G4/G5** — Atlas isolation / Responsive, RTL & content states | **BLOCKED** until ATLAS-01 + 02–05 |
| **ATLAS-07** | **Adopt templates route-family by route-family** — one worker/commit per family (07A Home, 07B Research/Publications, 07C Projects, 07D Creative/Gallery, 07E Writing/Blog, 07F Learning, 07G About/CV, 07H Contact) — replace one-off presentation with accepted templates/components, preserve loaders/DTOs/slugs/gates | Route-adoption agents | ATLAS-05, ATLAS-06 | One route family per agent (disjoint files) | **G3/G5** | **BLOCKED** until ATLAS-05 + ATLAS-06 |
| **ATLAS-08** | **Audit CMS/admin gaps before schema work** — read-only `CMS-GAP-REPORT.md` (`exists \| partial \| absent \| conflicting` per field, evidence path, reversible migration packets; public-projection leakage test) | CMS audit agent | ATLAS-00 | 01–06 (read-only; no schema mutation) | **Approved gap report** (gate to ATLAS-09; ACCEPTANCE-GATES G6) | **BLOCKED** until ATLAS-00 (read-only; do not migrate before approval) |
| **ATLAS-09** | **Implement approved CMS/admin packets** — only owner-approved packets from ATLAS-08; each with dump/backup, reversible migration, DTO mapping, admin validation/preview/audit | CMS implementation agent | ATLAS-08 approval | Graph renderer (ATLAS-10) | **G6** — CMS/admin alignment | **BLOCKED** until ATLAS-08 approval |
| **ATLAS-10** | **Deliver graph Phase 1** — one published payload → semantic list (Astro, no-JS) + enhanced 2D island (pan/zoom/focus, keyboard/pointer parity); validates IDs/orphans/duplicates/labels | Graph agent | ATLAS-01, ATLAS-08 mapping | Route adoption (ATLAS-07) | **G7** — Graph Phase 1 (G8 for optional 3D) | **BLOCKED** until ATLAS-01 + ATLAS-08 mapping |
| **ATLAS-11** | **Independent QA and regression hardening** — `qa/**` + `FINAL-QA-REPORT.md`; six widths (320/390/768/1024/1280/1440) × two directions × two themes × reduced-motion; 200% zoom; no-JS; fixture/draft leak; LCP/shift budget | QA agent | Merged 01–10 | Documentation audit (ATLAS-12) | **G9** — Release candidate | **BLOCKED** until 01–10 merged |
| **ATLAS-12** | **Reconcile documents and prepare release handoff** — update only owner files in `DOCUMENT-MIGRATION-MAP.md`; compare every "current state" statement with merged source + test output; mark packets DONE/PARTIAL/BLOCKED; verify hashes/JSON; full repo verification; **stop before deploy** | Documentation / integration lead | Accepted implementation (01–11) | — | **G9** | **BLOCKED** until accepted implementation |

### How to start

1. Integration lead reads `AGENTS.md` + `docs/README.md` + `PROJECT_MANIFEST.md` + `Assets/site-redesign/implementation-reference/README.md` → `MASTER-SPEC.md` §1–6, §11 → `AGENT-COORDINATION.md` → `MULTI-AGENT-TASK-LIST.md` → `agent-kit/*.json` + `ACCEPTANCE-GATES.md`.
2. Run `node Assets/site-redesign/implementation-reference/agent-kit/validate.mjs` (must `PASS`).
3. Verify `Assets/site-redesign/README.md` binary integrity command (record count + mismatches, not only exit status).
4. Create per-packet repository Task Specs from `docs/templates/TASK_SPEC_TEMPLATE.md` (one spec per packet being activated; §6 handoff contract, file-ownership table, and merge order apply).
5. Record `git status --short`, branch, HEAD, worktree list, dirty manifest in `docs/status/WORK_LOG.md`.
6. Commit `docs: activate component atlas implementation` with baseline metadata and activated Task Specs (`ATLAS-00` Step 6).

**Reference validation (ATLAS-00 gate G0):** `node Assets/site-redesign/implementation-reference/agent-kit/validate.mjs` must PASS (24 components, 6 templates, 10 asset references, offline Figma builder) before any worker creates a branch. Default `npm run build` must stay atlas-free (no `_design/index.html`, no sitemap/Pagefind/fixture strings); `npm run atlas` (`DESIGN_ATLAS=1` via `apps/web/scripts/design-atlas.mjs`) is local-only.

**CMS boundary:** `Assets/site-redesign/implementation-reference/CMS-GAP-REPORT.md` is read-only; no CMS schema/API/migration work before owner approval of named packets from ATLAS-08 (ACCEPTANCE-GATES G6). `reDesign_plan.md` §12–13 hard limits are outranked by `MASTER-SPEC.md` for tokens (see `DOCUMENT-MIGRATION-MAP.md`).

---

## 1b. Active — Four-track execution board v2 (2026-08-26) — supersedes §1 numbering for execution

The single ATLAS numbering above is kept as the MASTER-SPEC reference mapping. Execution happens on **four conflict-free tracks**; acceptance semantics G0..G9 unchanged. Shared environment modes (SNAPSHOT / LOCAL stack on laptop / HYBRID remote) + clean-cutover deletion policy live in [`TRACK-MODE-environment-and-cutover.md`](TRACK-MODE-environment-and-cutover.md).

| Track | File | Zone (exclusive write) | Maps to | Status |
|---|---|---|---|---|
| **WF** — Public frontend | [`TRACK-WF-public-frontend-task-list.md`](TRACK-WF-public-frontend-task-list.md) | `apps/web/**` | ATLAS-01..07, 10(consumer), 11 + WF-09 assets + WF-CLEAN | WF-00 READY (integration lead) |
| **BK** — Backend CMS data | [`TRACK-BK-backend-cms-task-list.md`](TRACK-BK-backend-cms-task-list.md) | models/migrations/public-API (`apps/cms/apps/**`) + BK-L0 local settings | BK-L0 first; supersedes parts of ATLAS-08/09 with additive-by-design packets BK-00..06 + DROP-ticket protocol | BK-00 READY |
| **AB** — Admin backend API | [`TRACK-AB-admin-backend-api-task-list.md`](TRACK-AB-admin-backend-api-task-list.md) | `apps/api/admin_*.py` only | extends ADR-0026 admin surface for redesign features (home composer/timeline/media-ext/graph) | BLOCKED until BK-L0 (+per-packet BK deps) |
| **AF** — Admin frontend SPA | [`TRACK-AF-admin-spa-task-list.md`](TRACK-AF-admin-spa-task-list.md) | `apps/admin/**` | consumes frozen AB endpoint contracts; RTL-first fa/en | BLOCKED until AB-02+ |

Cross-track sequencing at a glance: DEV-00+BK-L0 → ∥(WF-00..06 ‖ BK-00..04) → AB-00..07 → ∥(AF-01.. ‖ WF-07A..H) → BK-05 → WF-08 → fillers → QA/cleanup → owner cutover per MODE §5/§7.

**Owner decision 2026-08-26 — Home v1 = **Option B (CMS-complete)**: launch gate = BK-01 (model + public read) -> AB-02 -> AF-01 -> WF-07A consumption; default-order fallback only when nothing published.

Runtime fact base merged 2026-08-26: **Waves A–C complete, ADR-0031/0032 accepted, admin SPA = independent `apps/admin` (S5 cutover LOG-0251)**; historical specs archived under `docs/plan/archive/**`.

Activation rule unchanged: each READY packet still requires the integration lead to stamp a repository Task Spec row and record it in WORK_LOG before runtime edits.

---

## 2. Queued — do not start yet

No queued ATLAS packets beyond the BLOCKED rows above. Legacy CMS/admin and content slices below remain queued or superseded; do not start them as standalone specs while ATLAS-00 is pending.

| Spec | Blocked by |
|---|---|
| `P7-professional-admin-task-spec.md` | Superseded by ADM phases (ADR-0026). Remaining P7-01…P7-04 live in ADM-4/ADM-1/ADM-6. Do not execute this spec. |
| `P7-admin-detail-pages-task-spec.md` | Nested profile editor moves into the SPA; remaining bilingual detail pages for other entities stay queued. |
| `P0-A-stack-inventory-task-spec.md` | BLOCKED — owner-only read-only VPS inventory. Not an agent task. |

---

## 3. Reference — not executable

| File | Role |
|---|---|
| `SAMPLES-TRANSFER-RECOMMENDATIONS.md` | Analysis catalog of `SAMP-*` IDs. Bound into `Task-list.md`. Do not create a second spec from it. |
| `SMALL-MODEL-EXECUTION-PLAN.md` | Operating playbook for small models. See §5 caveat. |
| `S-PLAN-STATE.md` | Task state tracker for the S-Plan phases. Historical; ATLAS board above now owns frontend state. |
| `B5-VISUAL-INTERACTION-ADOPTION.md` | Proposal only. Nothing in it is implemented or authorized (Candidate 4 research graph adopted via ADR-0028; next-gen graph is ATLAS-10). |
| `DESIGN-UI-UX-IMPROVEMENT-REVIEW.md` | Index (2026-08-22). Points at the two files below. Nothing implemented or authorized. |
| `DESIGN-UI-CURRENT-PROBLEMS.md` | Current public UI defects (`P1`…`P19`): undefined tokens, contrast, a11y, IA drift. Ledger IDs not allocated. Reference for ATLAS content components. |
| `DESIGN-UI-UX-IMPROVEMENT-PROPOSALS.md` | Suggestions (`S1`…`S37`) including for rules already in `design.md` / contract cards. Proposals only. |
| `P0-G0-content-pack-proposal.md` | Content proposal record. |
| `LICENSES.md` | Third-party licence notes. |
| `reDesign_plan.md` | Visual redesign draft (2026-08-24) — Editorial Minimal, token table, component language (§4), shell (§5), graph deletion (§6), page-by-page rewrite (§7), bilingual rules (§8), cleanup (§9), phases §10, checklist §11, hard limits §12, anti-patterns §13. **Executed via ATLAS tokens/components**; for tokens, `MASTER-SPEC.md` outranks `reDesign_plan.md` §12–13. |
| `ATLAS-frontend-rebuild-task-spec.md` | Umbrella Task Spec for the full ATLAS rebuild (this file's companion). Individual ATLAS-0N packets each need their own per-packet Task Spec before execution. |

---

## 4. Archived — completed, do not execute

These describe work that already shipped. Several still contain instructions that reference the decommissioned staging host (ADR-0025). Treat every staging command in them as obsolete. For the ATLAS frontend tranche, they are **superseded/history for frontend** — the rebuild starts from scratch per `MASTER-SPEC.md` + `agent-kit/*.json` rather than patching these specs.

### P14 design packages (DONE — planning/handoff, not live runtime)

| Spec | State |
|---|---|
| `P14-personal-platform-experience-redesign-task-spec.md` | DONE (design package) — quality-audited dual-theme direction, RTL/mobile/detail/admin concepts, UX/CMS/graph handoff complete; no frontend or route changes. |
| `P14A-redesign-asset-pack-task-spec.md` | DONE (asset pack) — authoritative logo PNGs, standalone artworks, concept references, prompt/source/crop/alt/performance docs, integrity hashes; no runtime changes. |
| `P14B-requested-concept-asset-extraction-task-spec.md` | DONE (asset extension) — preserved requested concept sources + centered Dark/Light portal + missing project-cover masters; no runtime changes. |
| `P14C-public-page-family-visual-atlas-task-spec.md` | PLAN READY — owner approved the written family/template scope; execution plan produces eight concepts and a bounded Figma decision. No runtime work. |

### Waves & CMS/public routes (DONE live, LOG-0216)

| Spec | State |
|---|---|
| `wave1-web-polish-task-spec.md` | DONE (live) — writing-canonical + RSS + OG + catalog URL filters. LOG-0211; prod rebuild LOG-0216. |
| `wave2-cms-web-addons-task-spec.md` | DONE (live) — statement PDF schema, lightbox, CSP Report-Only. LOG-0212; prod migrate `0013` LOG-0216. |
| `P8-publications-books-talks-downloads-task-spec.md` | DONE (live) — Wave 3 LOG-0213; prod migrate `0014` + rebuild LOG-0216. Catalogs empty-honest until CMS content. |
| `wave4-research-graph-island-task-spec.md` | DONE (live) — ADR-0028 research graph island. LOG-0214; live after LOG-0216 rebuild. Replaced by ATLAS-10 Phase 1 2D + semantic list. |
| `wave5-adm-qa-pagefind-task-spec.md` | DONE (live) — ADM QA + service/flags + Pagefind. LOG-0215; `/search/` live LOG-0216. `DEFER-0032` PARTIAL. |
| `cms-origin-and-full-stack-cd-task-spec.md` | DONE (repo + edge) — ADR-0027; Compose Caddy live; HMAC CLOSED. LOG-0210. |
| `P3-public-preview-token-task-spec.md` | DONE — DEFER-0016 CLOSED (LOG-0204/0209). |
| `blog-story-composition-task-spec.md` | PARTIAL — blog/entity stories in repo; keep content publishing honest. |
| `rich-blocks-v2-task-spec.md` | DONE — six no-JS story blocks. Live via web rebuilds. |
| `ADM-6-frontend-wiring-task-spec.md` | PARTIAL — remaining: §18 manual QA (`DEFER-0032` PARTIAL). |
| `master-remaining-work-checklist.md` | ACTIVE board — single remaining-work board (LOG-0218). Owner constraints: all content CMS-managed, complete admin UX, minimal VPS SSH. |

Owner remaining work that is **not** a new spec: demo allowlist before CSP enforce (`DEFER-0021`); manual ADM QA remainder (`DEFER-0032` / S6); optional Research Statement PDF Media upload; contact inbox (`DEBT-0006`). Old-stack decommission **CLOSED** (LOG-0216). HMAC (`DEFER-0027`) and Compose Caddy (`DEFER-0031`) **CLOSED**. Do **not** set `CMS_CD_AUTO_MIGRATE`.

### P0 gate and infrastructure (archived)

`P0-G0-documentation-drift-task-spec.md`,
`P0-G0-fast-safe-live-task-list-task-spec.md`,
`P0-G0-gate-decision-task-spec.md`,
`P0-G0-repository-metadata-task-spec.md`,
`P0-G0-technical-freeze-adrs-task-spec.md`,
`P0-A-web-scaffold-task-spec.md`,
`P0-A-restore-rehearsal-task-spec.md`,
`P0-A-server-access-dns-backup-task-spec.md`,
`CI-actions-node24-task-spec.md`

### P1 landing and visual (archived — superseded for frontend)

`P1-09-structured-data-task-spec.md`,
`P1-gateway-ui-review-task-spec.md`,
`P1-typography-font-task-spec.md`,
`P1-visual-elevation-task-spec.md`,
`P1-T01-visual-prototyping-tooling-task-spec.md`,
`P1-T02-visual-toolchain-documentation-alignment-task-spec.md`,
`P1-T03-design-policy-toolchain-alignment-task-spec.md`,
`RELEASE-P1.md`, `VISUAL-QA-P1.md`, `PROD-ACCEPTANCE.md`, `RELEASE-QA.md`

### P2 About and CV (archived)

`P2-honesty-closeout-task-spec.md`,
`P2-about-tabs-task-spec.md` — *superseded in part:* `P2-H` replaces exclusive tab hiding with stacked evidence. The CSS tab mechanic may stay; hiding evidence panels with `display: none` may not.
`P2-zoom-safety-task-spec.md`,
`P2-mobile-overflow-ci-regression-task-spec.md`,
`P2-evidence-state-reconciliation-task-spec.md`,
`P2-C1-CONTENT-REQUEST.md` — owner questionnaire, already filled.

### P3 CMS (archived — runtime live; next CMS work is ATLAS-08/09)

`P3-gate-code-first-task-spec.md`,
`P3-cms-deploy-task-spec.md`,
`P3-cms-versioned-cicd-task-spec.md`,
`P3-cms-backup-restore-task-spec.md` — DONE; `RISK-0003` CLOSED (`LOG-0140`).
`P3-mfa-totp-enrollment-task-spec.md`,
`P3-mfa-totp-recovery-codes-task-spec.md`,
`P3-preview-boundary-task-spec.md`,
`P3-public-preview-token-task-spec.md` — DONE; DEFER-0016 CLOSED (`LOG-0204`).
`P3-public-api-caddy-task-spec.md` — DONE; `DEFER-0017` CLOSED (`LOG-0143`).

### P4–P6 public routes (archived — still live, but ATLAS-07 will re-adopt via templates)

`P4-blog-writing-task-spec.md`,
`P5-research-task-spec.md`,
`P6-case-studies-task-spec.md`

### Other

`R0-rtk-opencode-task-spec.md`

---

## 5. Caveat on `SMALL-MODEL-EXECUTION-PLAN.md`

That playbook is still useful for its rules, escalation triggers, and Work Log template. Two parts are stale:

- Its "current snapshot" section still describes the decommissioned staging host.
- Its phase backlog lists tasks as READY that `S-PLAN-STATE.md` already marks DONE.

When they disagree, `S-PLAN-STATE.md` and this file win. The active specs in §1 are the ATLAS timeline (ATLAS-00 READY, rest BLOCKED); P7 remains queued/superseded; owner inventory stays owner-only.

If the playbook mentions an OpenCode agent you do not have, ignore the dispatch mechanism and execute the active spec directly.

---

## 6. `reDesign_plan.md` relationship

`reDesign_plan.md` (2026-08-24) is an **executed-via-ATLAS** visual draft — single-system Editorial Minimal, paper/ink/brand tokens (§3), shared component language (§4 — one button/card/empty-state system), shell decisions (§5), regional graph deletion (§6), page-by-page rewrite (§7), bilingual rules (§8), cleanup (§9), phases §10, checklist §11, hard limits §12, anti-patterns §13.

- Its phases §10 map to ATLAS-01..07 (tokens → components → shell → catalogs → home/research → About/CV/contact/search polish).
- Its checklist §11 and anti-patterns §13 inform `qa/*` assertions and reviews.
- Its hard limits §12 are **outranked by `MASTER-SPEC.md` for tokens** when they conflict (`agent-kit/tokens.json` — Light `runtime-authoritative`, Dark `design-target`; Dark activates only via ATLAS-01).

Do not execute `reDesign_plan.md` as a standalone spec. Execute ATLAS packets.

---

## 7. Adding a new spec

1. Copy `docs/templates/TASK_SPEC_TEMPLATE.md`.
2. Name it `<phase>-<short-topic>-task-spec.md` (ATLAS packets: `ATLAS-0N-*.md` or the umbrella `ATLAS-frontend-rebuild-task-spec.md` plus per-packet specs when activated by the integration lead).
3. Put a `**Status:**` line directly under the title. Use `READY`, `QUEUED`, `BLOCKED`, `PARTIAL`, or `DONE`.
4. Use full repo-relative paths in Allowed files. Never a bare filename.
5. Give every verification step an exact command and an expected result.
6. Add a row to §1 or §2 of this file in the same change.
7. Record activation/completion in `docs/status/WORK_LOG.md`; no CMS migration without ATLAS-08 gap-report approval.

Expected result:
Another agent can execute your spec without asking you a question.
