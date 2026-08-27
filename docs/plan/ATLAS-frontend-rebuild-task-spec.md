# ATLAS — Frontend rebuild from scratch (umbrella Task Spec)

**Status:** READY (umbrella) — individual packets ATLAS-00..12 each require a separate per-packet Task Spec before execution per `AGENT-COORDINATION.md` §2. This umbrella tracks the whole rebuild; do not edit production code until ATLAS-00 is activated by the integration lead.

> This spec is the execution entry for the next-generation public frontend. The public site will be rebuilt from scratch in `apps/web/` from the canonical brief — not patched incrementally.

## Task: P14 ATLAS frontend rebuild — Astro + TypeScript + Tailwind v4 + React islands

- **Goal:** Rebuild the public frontend from a code-first Design System so every page family renders from shared tokens, components, and templates, with a local-only Component Playground/Visual Atlas for review, without breaking CMS/admin, routes, or content.
- **User/actor and journey:** All six journeys in `MASTER-SPEC.md` §3 — PhD supervisor (fit → directions → publications/projects → CV/contact), academic reviewer (research → evidence detail), industry reviewer (selected sanitized work), reader (writing index → post → series), learner (teaching → guide), creative viewer (gallery → visual work detail) — plus bilingual visitors who switch locale on `/` gateway and every internal page.
- **Release type:** `STANDARD` (umbrella) — each packet commits separately; production cutover is a separate owner-approved release task after ATLAS-12.
- **Risk level:** High — token drift, route overlap, and CMS coupling are the primary risks (see Risks).
- **Owner and handoff recipient:** Integration lead (ATLAS-00) → token / primitive / shell / content / template / atlas / route-adoption / CMS-audit / graph / QA agents per `AGENT-COORDINATION.md` §3. Final handoff to owner for production approval/deploy decision.

## Scope

### In scope

Umbrella covers all ATLAS packets; each packet owns a disjoint slice per `MULTI-AGENT-TASK-LIST.md` execution board and `AGENT-COORDINATION.md` §3/§6:

- **ATLAS-00 — Freeze baseline:** run `node Assets/site-redesign/implementation-reference/agent-kit/validate.mjs` (PASS: 24 components, 6 templates, 10 asset refs, offline Figma builder) + `Assets/site-redesign/README.md` binary integrity check; record `git status`/`HEAD`/worktree manifest; create one worktree per active packet from same base; assign exclusive paths (`AGENT-COORDINATION.md` §3); commit `docs: activate component atlas implementation`.
- **ATLAS-01 — Dual-theme token contract:** `apps/web/src/styles/global.css` dual-theme semantic roles (Light `runtime-authoritative` preserved byte-for-role, Dark `design-target` added under one documented selector; single glass rule), `docs/contracts/DESIGN-CONTRACT.md`, `apps/web/src/design-system/contracts.ts` (`ThemeName = "light"|"dark"|"system"`, `Direction = "ltr"|"rtl"`, `ContentState = "ready"|"loading"|"empty"|"no-results"|"error"|"unavailable-translation"`), `qa/design-tokens.spec.mjs`.
- **ATLAS-02 — Primitives:** `Button` (`primary|secondary|quiet`), `IconButton`, `LinkAction`, `Chip`, `Badge`, `InputField`, `TextareaField`, `ContentState` (+ `qa/ui-primitives.spec.mjs` — 44px targets, persistent labels, `aria-invalid`/`aria-describedby`, focus-visible, disabled semantics, no geometry shift on loading).
- **ATLAS-03 — Public shell + gateway:** `BaseLayout`, `Header`, `Footer`, `Breadcrumbs`, `ThemeToggle`, `pages/index.astro` (Language Gateway stays separate from `/{locale}/` roots), `qa/public-shell.spec.mjs`.
- **ATLAS-04 — Shared content components:** `SectionLead`, `FeaturedRecord`, `ContentRow`, `PublicationRow`, `MetadataGroup`, `Timeline` (ordered list before enhancement), `MediaTile` (aspect-ratio reserve), `TableOfContents`, `ContactCTA` (+ `qa/content-components.spec.mjs`).
- **ATLAS-05 — Six shared page templates:** `HomeTemplate`, `CollectionIndexTemplate`, `EditorialIndexTemplate`, `LongFormTemplate`, `EvidenceDetailTemplate`, `UtilityTemplate` (+ `qa/page-templates.spec.mjs` — canonical-family → template mapping, no empty detail shells, one H1, landmark order, no-JS output).
- **ATLAS-06 — Local-only Visual Atlas:** conditional `injectRoute` for `/_design/` only when `DESIGN_ATLAS=1`, `scripts/design-atlas.mjs` (`npm run atlas`, `npm run qa:atlas`), fixtures typed `AtlasFixture<T>` with `unpublished: true`, controls for theme/direction/viewport/reduced-motion, stable `[data-atlas-id]` selectors (+ `qa/design-atlas.spec.mjs` — default build has no `/_design/index.html`, no sitemap/Pagefind/fixture strings).
- **ATLAS-07 — Route-family adoption (one worker/commit per family, disjoint files):** 07A Home, 07B Research/Publications (`research`/`statement`/`topics`/`publications`), 07C Projects (sanitized disclosure), 07D Creative/Gallery (lightbox), 07E Writing/Blog (`writing` index/detail/series/tag; preserve `blog/**` redirect-only), 07F Learning (`teaching`), 07G About/CV (profile gated details), 07H Contact (no phone/Gmail) — each preserves current loaders/DTO names/slugs/publication gates.
- **ATLAS-08 — CMS/admin read-only audit:** `CMS-GAP-REPORT.md` — field-by-field `exists|partial|absent|conflicting` against real models/endpoints/migrations; DTO mapping; public-projection leakage tests; reversible migration packets with backup/import/rollback requirements. **No schema mutation in this packet.**
- **ATLAS-09 — Approved CMS/admin packets only:** each owner-approved packet from ATLAS-08 with dump/backup, reversible migration, DTO mapping, admin validation/preview/audit (no generic "redesign migration").
- **ATLAS-10 — Graph Phase 1 (2D + semantic list from one payload):** `GraphNodePublic`/`GraphEdgePublic` adapter; Astro semantic list before interactive island; keyboard/pointer parity; orphan/duplicate/missing-label validation; reduced-motion/coarse-pointer/failure paths (Phase 2 Three.js is a separately activated G8 packet after G7).
- **ATLAS-11 — Independent QA:** six-width matrix (320/390/768/1024/1280/1440) × two directions × two themes × reduced-motion; 200% zoom; keyboard/focus/headings/landmarks/contrast/media-fallback/form retention; no-JS path; fixture/draft leak; LCP/shift/bytes budget; `FINAL-QA-REPORT.md`.
- **ATLAS-12 — Documentation reconciliation:** compare every "current state" statement with merged source + test output; update only owner files in `DOCUMENT-MIGRATION-MAP.md`; mark packets DONE/PARTIAL/BLOCKED with Work Log IDs; verify hashes/JSON; full repo verification; **stop before deploy.**

Allowed files (umbrella — per-packet specs constrain further; no two active workers overlap on high-conflict paths):

- `Assets/site-redesign/implementation-reference/**` — read-only to all packets except ATLAS-00/08/12 metadata and per-`AGENT-COORDINATION.md` §3 exclusivity.
- `apps/web/src/styles/global.css` — **ATLAS-01 only** while active.
- `apps/web/src/design-system/**` — ATLAS-01.
- `apps/web/src/components/ui/**` — ATLAS-02.
- `apps/web/src/components/navigation/**`, `apps/web/src/layouts/BaseLayout.astro`, `apps/web/src/components/Header.astro`, `Footer.astro`, `Breadcrumbs.astro`, `apps/web/src/pages/index.astro` — ATLAS-03.
- `apps/web/src/components/content/**` — ATLAS-04.
- `apps/web/src/layouts/**Template.astro` — ATLAS-05.
- `apps/web/src/design-atlas/**`, `apps/web/scripts/design-atlas.mjs`, `apps/web/astro.config.mjs` (atlas integration block), `apps/web/package.json` (atlas scripts) — ATLAS-06.
- `apps/web/src/pages/**`, `apps/web/src/lib/cms/**`, `apps/web/src/data/**` — ATLAS-07 (one family per worker, disjoint).
- `Assets/site-redesign/implementation-reference/CMS-GAP-REPORT.md`, `Assets/site-redesign/implementation-reference/FINAL-QA-REPORT.md` — ATLAS-08 / ATLAS-11.
- `apps/web/src/components/research/**`, `apps/web/src/lib/cms/research-graph.ts` — ATLAS-10.
- `apps/web/qa/**` — ATLAS-01..07/10/11 respective specs.
- `docs/contracts/**`, `docs/plan/**`, `docs/status/**`, `docs/README.md`, `PROJECT_MANIFEST.md`, `AGENTS.md` — integration lead / ATLAS-12 reconciliation only via `DOCUMENT-MIGRATION-MAP.md`.

Forbidden files while ATLAS is active (without the owning packet's Task Spec + integration-lead assignment):

- Any file outside the owning packet's explicit ownership table (`AGENT-COORDINATION.md` §3 — no concurrent edits to `global.css`, `Header.astro`, `BaseLayout.astro`, `content.ts`, `astro.config.mjs`, `package.json`, or shared ledgers).
- `apps/cms/**` schema/migration/admin code before ATLAS-08 approved gap report (ATLAS-09 gate).
- Any new runtime service, deployment config, or production publication (MASTER-SPEC §12 non-goals).

### Non-goals

- Keeping `apps/cms` / `apps/admin` and `apps/web` as a shared writable worktree or merged bundle — **frontend/admin separation is invariant (ADR-0026)** and must not be violated.
- New runtime services, deployment changes, or production publishing as part of this reference-package task (`MASTER-SPEC.md` §12 — "New runtime services, deployment, migrations or production publication" are non-goals; each CMS migration needs separate owner approval + backup + rollback).
- Pixel replica of generated screenshots, Figma-first workflow, public page builder / arbitrary editor styling, fake content to make layouts look complete, or inventing routes/fields/DTOs/models/metrics/translations/links.
- Arbitrary CSS/JS injection from the CMS (code locks token packs, component structure, allowed variants, route families, accessibility behavior, validation — MASTER-SPEC §8).
- Dark mode activation before ATLAS-01 dual-theme contract is accepted (Light stays `runtime-authoritative`; Dark is `design-target` until then).

## Context

- **Reference commit:** `Assets/site-redesign/implementation-reference/` — branch `p14c-visual-atlas`, commit `7d9b87f` (`7d9b87f3c2b04542e13c189adab3b57f2108d84a`) — is **the brief** (planning/handoff, not live). Read order: repository `AGENTS.md` + `docs/README.md` + `PROJECT_MANIFEST.md` → `Assets/site-redesign/implementation-reference/README.md` → `MASTER-SPEC.md` §1–6, §11 → `AGENT-COORDINATION.md` → `MULTI-AGENT-TASK-LIST.md` (global constraints + execution board) → `agent-kit/*.json` + `ACCEPTANCE-GATES.md` → `DOCUMENT-MIGRATION-MAP.md`. Authority is brief ownership; **runtime authority remains `apps/web/src/styles/global.css` + merged source until a packet is accepted.**
- **Backup location:** `infra/backup/` — restic/rclone encrypted Google Drive backup; dumpdata + backup required before any schema migration (AGENTS.md current gate, PROJECT_MANIFEST.md environments). Keep `CMS_CD_AUTO_MIGRATE` unset. Every real action gets a `WORK_LOG.md` entry; skipped checks get `DEFER-*` in `deferred-validation.md`; blockers get `RISK-*`.
- **Phase schedule:** `reDesign_plan.md` §10 phases executed via ATLAS (Phase 0 tokens → Phase 1 components/shell → Phase 2 catalogs/details → Phase 3 home/research/projects/writing → Phase 4 About/CV/contact/search polish). For tokens, `MASTER-SPEC.md` outranks `reDesign_plan.md` §12–13.
- **State on entry:** Reference validated, but **no ATLAS packet has been merged**; current runtime is P4–P6/P8 routes + `/search/` + CMS-managed About gated details + admin SPA at `/admin/` + staff HTML at `/staff/`. Default production build must remain atlas-free. See `docs/plan/README.md` active timeline (ATLAS-00 READY, rest BLOCKED).

## Contracts and data

- **Documents/ADRs/schemas read:** `Assets/site-redesign/implementation-reference/MASTER-SPEC.md`, `MULTI-AGENT-TASK-LIST.md`, `AGENT-COORDINATION.md`, `ACCEPTANCE-GATES.md`, `DOCUMENT-MIGRATION-MAP.md`, `SOURCE-INVENTORY.md`, `WORKTREE-SNAPSHOT.md`, `REFERENCE-MANIFEST.json`, `agent-kit/README.md` + `tokens.json` + `components.json` + `templates.json` + `assets.json` + provider handoffs (`page-families/*`, `ADMIN-CMS-FUNCTIONAL-SPEC.md`, `MOTION-GRAPH-HANDOFF.md`); repository `AGENTS.md`, `docs/README.md`, `PROJECT_MANIFEST.md`, `docs/contracts/IA-CONTRACT.md`, `docs/contracts/DESIGN-CONTRACT.md`, `apps/web/src/styles/global.css`, existing Astro pages/data/CMS lib, `reDesign_plan.md` §10–13 (for phase/checklist provenance).
- **Contracts changed:** Only via their owning packet — `docs/contracts/DESIGN-CONTRACT.md` + `apps/web/src/styles/global.css` + `apps/web/src/design-system/contracts.ts` (ATLAS-01); `docs/plan/README.md` active index on each activation/completion (ATLAS-00); `Assets/site-redesign/implementation-reference/CMS-GAP-REPORT.md` (ATLAS-08); docs in `DOCUMENT-MIGRATION-MAP.md` only after evidence (ATLAS-12: `docs/design.md`, `docs/user-journey-information-architecture.md`, `PROJECT_MANIFEST.md`, `AGENTS.md`, `docs/README.md`, `Task-list.md`).
- **Migration/data impact:** **None before ATLAS-08 audit.** Before CMS schema work, compare reference with actual models/admin endpoints/migrations (MASTER-SPEC §8). Missing fields are gaps, not permission to invent an endpoint or migrate data. ATLAS-08 maps `exists|partial|absent|conflicting` + evidence path; ATLAS-09 migrates only owner-approved packets, each with hash/backup/dumpdata, smallest reversible migration, explicit public/admin DTO mapping, and rollback evidence.
- **Locale, visibility and publication impact:** Persian and English states stay independent but linked; slugs/SEO/statuses are independent per locale. Public projections are published-only (`/api/` + `/media/` `is_active` for anonymous); every meaningful detail URL only when locale + body + privacy + rights + route gates pass. Atlas fixtures live outside public content loaders, are `unpublished: true` with visible warning, and must never enter sitemap/Pagefind/index. Blog stays editorially independent from Projects.
- **Security/privacy impact:** Never expose drafts, private media, internal notes, phone/personal Gmail, credentials, or inactive assets. No new auth surface; admin stays session+CSRF+TOTP+audit+rate-limit. PUBLIC `/api/`/`/media/` remain published-only projections (verified in ATLAS-08 audit).

## Dependencies

- **ATLAS-00 first:** branch/worktree base freeze + validator PASS is the entry gate for every other packet. No worker packet starts without integration-lead activation + its own Task Spec.
- **Ordering:** ATLAS-01 (tokens) → ATLAS-02 (primitives) → ATLAS-03 + ATLAS-04 in parallel → ATLAS-05 (templates) → ATLAS-06 (atlas) → ATLAS-07 (route families, one family per agent) → ATLAS-08 (CMS audit, read-only) → ATLAS-09 (approved CMS implementation) → ATLAS-10 (graph Phase 1; optional 3D after G7) → ATLAS-11 (independent QA) → ATLAS-12 (doc reconciliation). CMS mapping in ATLAS-08 informs graph payload adapter in ATLAS-10; graph 3D must not outrun accessible Phase 1.
- **Owner gating:** CMS migrations (ATLAS-09), graph 3D (G8), and production deploy each need separate owner approval + backup/rollback. Do not set `CMS_CD_AUTO_MIGRATE`.
- **Toolchain:** Astro 7 + TypeScript 5.9 + Tailwind CSS v4 + React 19 islands + Playwright 1.62; `DESIGN_ATLAS=1` local-only launcher via `apps/web/scripts/design-atlas.mjs`; `node agent-kit/validate.mjs` before any branch.

## Verification and release

### Tests/commands to run (per packet — umbrella passes when every packet's verification passes)

```powershell
# ATLAS-00 — baseline (repo root)
node Assets/site-redesign/implementation-reference/agent-kit/validate.mjs
# expected: PASS — 24 components, 6 templates, 10 asset references, offline Figma builder
# + SHA256SUMS verification per Assets/site-redesign/README.md (record count + mismatches)
git status --short --branch; git rev-parse HEAD; git worktree list
# + per-worker exclusive-path check via AGENT-COORDINATION.md §3

# ATLAS-01 — tokens
node apps/web/qa/design-tokens.spec.mjs            # fails before, PASS after ATLAS-01 (every semantic role, no raw color, Light/Dark selector present)
npm run check; npm run build; git diff --check     # default build has no atlas route
# + contrast ratios recorded (body/secondary/boundary/focus/primary rest + hover, both themes)

# ATLAS-02 — primitives
node apps/web/qa/ui-primitives.spec.mjs

# ATLAS-03 — shell
node apps/web/qa/public-shell.spec.mjs

# ATLAS-04 — content components
node apps/web/qa/content-components.spec.mjs

# ATLAS-05 — templates
node apps/web/qa/page-templates.spec.mjs

# ATLAS-06 — atlas isolation (run BOTH)
npm run build                                      # default — PASS, no _design/index.html, no sitemap/Pagefind/fixture strings
DESIGN_ATLAS=1 npm run build                       # atlas-present — _design/ present, Playwright screenshots PASS

# ATLAS-07 — per-family adoption (example)
node apps/web/qa/page-templates.spec.mjs           # plus per-family QA: canonical + alternate locale + template regions + empty/no-results/unavailable + no-JS

# ATLAS-08 — CMS audit (read-only)
# inventory models + admin endpoints + migrations; DTO mapping; public-projection leakage tests
# produces: Assets/site-redesign/implementation-reference/CMS-GAP-REPORT.md

# ATLAS-10 — graph Phase 1
# graph contract (stable IDs, orphan endpoints, duplicate edges, missing labels) + keyboard/list parity + fallback QA

# ATLAS-11 — independent QA (full matrix)
npm run check; npm run build
# Playwright at 320/390/768/1024/1280/1440 × LTR/RTL × Light/Dark × reduced-motion
# + 200% zoom, keyboard/focus/headings/landmarks, no-JS content/filters/graph list, pipeline/output + search-index leak scan, LCP/shift/bytes

# ATLAS-12 — docs reconciliation
# compare every "current state" statement with merged source + test output; verify hashes/JSON; full repo verification
```

Each packet: `npm run check` + `npm run build` + `git diff --check` + its targeted `qa/*.spec.mjs` + any existing related route tests. No `--force` migrations.

### Manual QA path

- At 320 / 390 / 768 / 1024 / 1280 / 1440 CSS px + 200% zoom: no unintended horizontal overflow; navigation and reading order preserved.
- LTR (English, Inter + Newsreader display) and RTL (Persian, Vazirmatn + Estedad display) — logical properties, correct font per locale/role, directional-travel icons flip, mail/download/external/search/status do not; logo/graph topology do not mirror.
- Light + Dark themes — no-JS readable, focus visible over allowed glass/media, text 4.5:1 / large+UI 3:1, reduced-motion removes transforms/orbit/travel, graph semantic-list parity, carousel never auto-advances, timeline never gates content.
- Content states distinct: `empty` / `no-results` / `error` / `unavailable-translation` (not conflated).
- Every meaningful published record has an independent detail URL only when locale + body + privacy + rights + route gates pass; empty production modules are omitted (not silent white pages).

### Acceptance criteria

Gate trace is `ACCEPTANCE-GATES.md` G1..G9; umbrella acceptance when all packet gates pass:

- **G0 (ATLAS-00):** reference validator PASS + binary integrity PASS + worktree evidence recorded; no runtime/CMS/route/deployment file changed in the reference task.
- **G1 (ATLAS-01):** `DESIGN-CONTRACT.md` and `global.css` agree byte-for-role on Light + Dark; no raw color/spacing/duration outside token block; theme changes semantic roles only; contrast PASS (body/secondary/boundary/focus/primary); reduced-motion explicit.
- **G2 (ATLAS-02):** 24 required components exist or have approved mapping; hover = focus-visible parity; 44px target + keyboard + accessible name PASS; RTL/LTR + long-label fixtures PASS; loading does not shift geometry.
- **G3 (ATLAS-05/07):** six shared templates cover every canonical route family; index pages contain previews; eligible records alone receive detail URLs; blog independent from Projects; publications keep independent canonical under Research navigation; empty modules omitted in production.
- **G4 (ATLAS-06):** atlas uses real production components/tokens; runs locally with `DESIGN_ATLAS=1`; default build contains no `/_design/` output, fixtures, or imports; atlas absent from sitemap/Pagefind/public navigation; stable screenshot selectors exist.
- **G5 (ATLAS-06/07):** responsive/RTL/state spec PASS at six widths, two directions, two themes, reduced motion; mixed-direction identifiers use isolation.
- **G6 (ATLAS-08/09):** CMS gap report approved before migrations; publication/locale/privacy/rights/detail gates enforced; Home manual/rule/hybrid provenance explained; tokens/anatomy remain uneditable by editors; no phone/personal Gmail/restricted data in public DTOs.
- **G7/G8 (ATLAS-10):** 2D + semantic list consume same published payload; keyboard = pointer target; orphan/duplicate/missing-label/broken-link validation PASS; reduced-motion + no-WebGL complete; Phase 2 adds no content, passes performance budget, motion-bounded, fails back to 2D/list (optional G8 after G7).
- **G9 (ATLAS-11/12):** JS-disabled content path PASS; Astro check/build + targeted QA + Playwright PASS; a11y PASS; asset/LCP/shift/motion budgets PASS; no draft/private/internal in output/index; documents reconciled via `DOCUMENT-MIGRATION-MAP.md`; production deploy has separate approval + backup + smoke + rollback plan.
- Plus umbrella invariants: `DESIGN_ATLAS=1` isolation (default build atlas-free), no-JS readability, RTL + six-width coverage, no invented content/routes/fields/translations, no new runtime services, no shared writable worktree between `apps/web` and `apps/cms`.

### Rollback/fallback

- No production adoption before ATLAS-12. Each packet is a focused commit; review rejects handoffs with unowned files, invented content, raw visual values, public atlas routes, or skimmed RTL/state coverage. Standard rollback is the previous artifact via `infra/deploy/update-release.sh` symlink switch (no Caddy reload) — see `docs/governance/DEPLOY_RUNBOOK.md` + `RELEASE_POLICY.md`. CMS migrations are independently reversible per ATLAS-08 packet, each with dumpdata + backup before execution. Graph 3D failure falls back immediately to 2D/list. If token drift or route overlap is detected, stop-the-line and file against the owning packet.

### Documentation to update

- Every actual action: `docs/status/WORK_LOG.md` (branch/base commit, changed-file manifest, interface changes, exact commands + result, screenshots per representative state, content/privacy/RTL/a11y notes, new `DEFER-*`/`DEBT-*`/`RISK-*`, commit hash).
- Any skipped required check: `docs/status/deferred-validation.md` with new `DEFER-00NN` (explicit owner + closure condition).
- Any accepted compromise: `docs/status/TECH_DEBT.md` with new `DEBT-00NN`.
- Blockers: `docs/status/RISK_REGISTER.md` with new `RISK-00NN` (without repeating secrets / private contact data).
- Visitor-visible defects: `docs/status/known-issues.md`.
- Active index: `docs/plan/README.md` on every activation/completion (this umbrella + each per-packet spec).
- After evidence: owner files per `DOCUMENT-MIGRATION-MAP.md` only in ATLAS-12 (do not copy future tense into "current state" tables, mark Figma authoritative, claim Dark live, or claim CMS fields exist before migration evidence).
- Final handoff after ATLAS-12 reconciliation before any separate production release Task Spec.

## Handoff

- **Files changed (task-owned only):** Per-packet commit manifests above; umbrella tracks only `docs/plan/ATLAS-frontend-rebuild-task-spec.md` + `docs/plan/README.md` activation row. No production code changes in this umbrella until ATLAS-00 activation commit (`docs: activate component atlas implementation`).
- **Verification actually run (command + result):** Each packet records its exact targeted QA + `npm run check` + `npm run build` + `git diff --check` output + Playwright/screenshot evidence in its Work Log entry. Umbrella verification is the union of G1–G5 plus `DESIGN_ATLAS=1` isolation, no-JS readability, RTL correctness, and six-width coverage — cite the real outputs, not a summary.
- **Deferred/risk IDs:** Allocate via `git rev-list --all --remotes` highest `LOG-*` + 1 (defensively +10 if the scan fails) and via the highest `DEFER-*/RISK-*/DEBT-*` in the working copy + 1. List every new ID with owner and closure condition.
- **Explicit blockers and next input:** ATLAS-00 is next — integration-lead activation + per-packet Task Specs + validator PASS. Rest remains BLOCKED on dependencies. CMS work is blocked on ATLAS-08 approved gap report. Do not start graph 3D before G7. No production deploy without separate owner approval, backup, rollback, CI + smoke (`/admin/login/` + `/staff/login/` + `/health/`/`/health.json`) + post-deploy visual QA.

## Risks

| Risk | Trigger | Mitigation |
|---|---|---|
| **Token drift** (raw hex/spacing/duration outside authority, Light byte-for-role regression, Dark silently activated) | Implementing components/templates before ATLAS-01 contract or without token QA | ATLAS-01 first; `qa/design-tokens.spec.mjs` rejects raw values + checks Light/Dark selectors; `MASTER-SPEC.md` outranks `reDesign_plan.md` §12–13; contrast ratios recorded per `ACCEPTANCE-GATES.md` G1 |
| **Route overlap** (two workers editing same shell/template/config or merging from different bases) | Concurrent packets on `global.css`/`Header`/`BaseLayout`/`astro.config.mjs`/`package.json`/shared ledgers | `AGENT-COORDINATION.md` §3 exclusive paths + one worktree per packet from same verified base + integration-lead handoff rejection on unowned files |
| **Atlas leak to production** (default build ships `/_design/`, sitemap/Pagefind, fixture strings) | Missing conditional `injectRoute` or stale fixture import in public loader | ATLAS-06 `qa/design-atlas.spec.mjs` asserts default build has no `_design/index.html` / sitemap / Pagefind / fixture strings; `AGENT-COORDINATION.md` atlas-local-only rule; G4 gate before ATLAS-07 merge |
| **CMS coupling / content loss** (invented fields, slug/locale/status drift, published-only breach) | Skipping ATLAS-08 gap audit or batching unrelated schema into one migration | ATLAS-08 read-only `exists|partial|absent|conflicting` report is the sole authority; ATLAS-09 only owner-approved packets with dumpdata + backup + reversible migration + DTO mapping + leakage tests; content preservation invariant in `AGENTS.md` |
| **Accessibility / no-JS regression** (JS-gated content, keyboard trap, focus loss, graph blocks list) | Islands replace semantic output or CSS hides evidence panels with `display:none` | Semantic Astro before islands; no-JS build verification; `qa/public-shell` + `qa/content-components` + ATLAS-11 six-width/keyboard/focus/200%-zoom matrix; graph parity tests (`AGENT-COORDINATION.md` §4 `GraphNodePublic`/`GraphEdgePublic` constraints) |

> Reference is planning/handoff only — every packet ends with its own tests, Work Log entry, and focused commit. No deploy, migration, or production mutation without a separate owner-approved task and rollback path (`MULTI-AGENT-TASK-LIST.md` global constraints). After ATLAS-12, create a separate production release Task Spec if owner requests deployment.
