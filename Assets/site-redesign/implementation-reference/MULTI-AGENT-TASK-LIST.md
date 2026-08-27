# Component Playground and Visual Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved dual-theme public experience and a local-only
Component Playground/Visual Atlas from one code-first Design System.

**Architecture:** Runtime Astro components and CSS tokens are authoritative. A
conditional Astro integration injects the atlas only when `DESIGN_ATLAS=1`, so
the default production build exposes no atlas route or fixtures. CMS provides
published locale data; optional React/Three islands progressively enhance
semantic Astro output.

**Tech Stack:** Astro 7, TypeScript 5.9, Tailwind CSS 4, React 19 islands,
Playwright 1.62, existing Inter/Vazirmatn packages; optional already-installed
Motion/GSAP/Three only in their explicitly owned tasks.

**Spec:** `Assets/site-redesign/implementation-reference/MASTER-SPEC.md`

## Global Constraints

- Read and obey repository `AGENTS.md`, docs entry point, manifest and active
  Task Spec before edits.
- No work packet is executable until the integration lead activates its
  repository Task Spec.
- Public content must remain readable without JavaScript.
- Do not invent content, routes, fields, metrics, translations or links.
- Do not expose drafts, private media, internal notes, phone, personal Gmail or
  restricted project data.
- Use CMS-published locale projections; Persian and English states are
  independent.
- Use token names; component code does not introduce arbitrary visual values.
- Default production build must not contain the atlas route or fixtures.
- Each packet ends with its own tests, Work Log entry and focused commit.
- No deploy, migration or production mutation without a separate owner-approved
  task and rollback path.

---

## Execution board

| Packet | Owner role | Depends on | Can run with | Merge gate |
|---|---|---|---|---|
| ATLAS-00 | Integration lead | Reference package | — | G0 |
| ATLAS-01 | Token agent | ATLAS-00 | CMS audit | G1 |
| ATLAS-02 | Primitive agent | ATLAS-01 | Graph payload audit | G2 |
| ATLAS-03 | Shell agent | ATLAS-02 | ATLAS-04 | G2/G3 |
| ATLAS-04 | Content agent | ATLAS-02 | ATLAS-03 | G2/G3 |
| ATLAS-05 | Template agent | ATLAS-03, ATLAS-04 | Atlas scaffold | G3 |
| ATLAS-06 | Atlas agent | ATLAS-01 interfaces; merges after 02–05 | CMS audit | G4/G5 |
| ATLAS-07 | Route-adoption agents | ATLAS-05, ATLAS-06 | One route family per agent | G3/G5 |
| ATLAS-08 | CMS audit agent | ATLAS-00 | 01–06 | approved gap report |
| ATLAS-09 | CMS implementation agent | ATLAS-08 approval | Graph renderer | G6 |
| ATLAS-10 | Graph agent | ATLAS-01, ATLAS-08 mapping | Route adoption | G7 |
| ATLAS-11 | QA agent | merged 01–10 | Documentation audit | G9 |
| ATLAS-12 | Documentation/integration lead | accepted implementation | — | G9 |

## Task ATLAS-00: Freeze the implementation baseline

**Files:**
- Verify: `Assets/site-redesign/implementation-reference/**`
- Create: repository Task Specs for the packets being activated
- Modify: `docs/plan/README.md`, `docs/status/WORK_LOG.md`

**Interfaces:**
- Consumes: this reference package and repository contracts.
- Produces: named integration base commit and non-overlapping worker ownership.

- [ ] **Step 1:** Run the reference validator.

  Run: `node Assets/site-redesign/implementation-reference/agent-kit/validate.mjs`  
  Expected: `PASS` with 24 components, 6 templates, 10 asset references and an
  offline Figma builder.

- [ ] **Step 2:** Verify managed binary integrity using the exact command in
  `Assets/site-redesign/README.md`; record count and mismatches, not only exit
  status.

- [ ] **Step 3:** Record `git status --short`, branch, HEAD, worktree list and
  exact dirty manifest in the new Work Log entry.

- [ ] **Step 4:** Create one worktree per concurrently active packet from the
  same verified base. Do not create workers from different unpublished commits.

- [ ] **Step 5:** Assign exclusive paths using `AGENT-COORDINATION.md`; reject
  any overlap in `global.css`, shell files, `astro.config.mjs`, `package.json` or
  shared ledgers.

- [ ] **Step 6:** Commit the baseline metadata and activated Task Specs.

  Commit message: `docs: activate component atlas implementation`

## Task ATLAS-01: Adopt the dual-theme token contract

**Files:**
- Modify: `apps/web/src/styles/global.css`
- Modify: `docs/contracts/DESIGN-CONTRACT.md`
- Create: `apps/web/src/design-system/contracts.ts`
- Test: `apps/web/qa/design-tokens.spec.mjs`

**Interfaces:**
- Consumes: `agent-kit/tokens.json` and current Light CSS tokens.
- Produces: `ThemeName`, `Direction`, `ContentState`, documented semantic CSS
  variables for both themes and stable theme attributes.

- [ ] **Step 1:** Write a failing token QA that parses `global.css`, checks every
  runtime semantic role, rejects raw component colors outside the token block,
  and checks Light/Dark selector presence.

- [ ] **Step 2:** Run `node qa/design-tokens.spec.mjs`.  
  Expected before implementation: FAIL listing missing Dark semantic roles.

- [ ] **Step 3:** Add Dark semantic aliases under one documented theme selector;
  preserve current Light values byte-for-role and the single glass implementation.

- [ ] **Step 4:** Add these exact public types:

  ```ts
  export type ThemeName = "light" | "dark" | "system";
  export type Direction = "ltr" | "rtl";
  export type ContentState =
    | "ready" | "loading" | "empty" | "no-results"
    | "error" | "unavailable-translation";
  ```

- [ ] **Step 5:** Verify contrast for body, secondary, control boundary, focus,
  primary rest and primary hover in both themes; record calculated ratios.

- [ ] **Step 6:** Run token QA, `npm run check`, `npm run build`, and
  `git diff --check`. Expected: all PASS; default build has no atlas route.

- [ ] **Step 7:** Update Design Contract and Work Log; commit.

  Commit message: `feat(web): establish dual-theme design tokens`

## Task ATLAS-02: Build primitives, controls and feedback states

**Files:**
- Create: `apps/web/src/components/ui/Button.astro`
- Create: `apps/web/src/components/ui/IconButton.astro`
- Create: `apps/web/src/components/ui/LinkAction.astro`
- Create: `apps/web/src/components/ui/Chip.astro`
- Create: `apps/web/src/components/ui/Badge.astro`
- Create: `apps/web/src/components/ui/InputField.astro`
- Create: `apps/web/src/components/ui/TextareaField.astro`
- Create: `apps/web/src/components/ui/ContentState.astro`
- Test: `apps/web/qa/ui-primitives.spec.mjs`

**Interfaces:**
- Consumes: theme/direction/state types and runtime tokens from ATLAS-01.
- Produces: typed primitives used by shell, content and templates.

- [ ] **Step 1:** Write failing structural tests for allowed variants, 44px
  targets, persistent labels, focus-visible styling, disabled semantics and
  distinct content-state copy slots.

- [ ] **Step 2:** Run `node qa/ui-primitives.spec.mjs`.  
  Expected: FAIL because the component files do not exist.

- [ ] **Step 3:** Implement `Button` variants `primary | secondary | quiet` with
  optional icon slot and native element semantics; do not create a clickable
  `div` or one giant card link.

- [ ] **Step 4:** Implement input/textarea with required persistent label,
  description/error IDs and `aria-invalid`/`aria-describedby` mapping.

- [ ] **Step 5:** Implement `ContentState` with exact kinds from `ContentState`;
  each kind accepts a heading, explanation and at most one recovery action.

- [ ] **Step 6:** Add English/Persian, long-label, keyboard, disabled, loading
  and reduced-motion fixtures to the QA file.

- [ ] **Step 7:** Run targeted QA, `npm run check`, `npm run build`, and
  `git diff --check`; update Work Log and commit.

  Commit message: `feat(web): add accessible design-system primitives`

## Task ATLAS-03: Rebuild the public shell and language gateway

**Files:**
- Modify: `apps/web/src/layouts/BaseLayout.astro`
- Modify: `apps/web/src/components/Header.astro`
- Modify: `apps/web/src/components/Footer.astro`
- Modify: `apps/web/src/components/Breadcrumbs.astro`
- Modify: `apps/web/src/pages/index.astro`
- Create: `apps/web/src/components/navigation/ThemeToggle.astro`
- Modify: `apps/web/src/data/site.ts` only when required by verified current data
- Test: `apps/web/qa/public-shell.spec.mjs`

**Interfaces:**
- Consumes: ATLAS-01 tokens and ATLAS-02 controls.
- Produces: shared shell, explicit locale/theme utilities and separate gateway.

- [ ] **Step 1:** Write failing tests for `/` language gateway, `/fa/` RTL,
  `/en/` LTR, active-route marker, 44px targets, theme persistence, no missing
  nav destination and default no-JS readability.

- [ ] **Step 2:** Preserve canonical route families from IA Contract. Display
  labels may say Gallery/Blog/Learning while URLs remain creative/writing/teaching.

- [ ] **Step 3:** Implement one shared header/footer anatomy for both themes;
  use the existing authoritative logo asset without redrawing it.

- [ ] **Step 4:** Keep glass restricted to Header and Gateway, with the existing
  opaque-first fallback and visible focus over both surfaces.

- [ ] **Step 5:** Verify at 320, 390, 768, 1024, 1280, 1440 and 200% zoom; save
  Light/Dark and FA/EN screenshots.

- [ ] **Step 6:** Run shell QA, Astro check/build and existing navigation tests;
  update Work Log and commit.

  Commit message: `feat(web): rebuild bilingual public shell`

## Task ATLAS-04: Build shared content components

**Files:**
- Create: `apps/web/src/components/content/SectionLead.astro`
- Create: `apps/web/src/components/content/FeaturedRecord.astro`
- Create: `apps/web/src/components/content/ContentRow.astro`
- Create: `apps/web/src/components/content/PublicationRow.astro`
- Create: `apps/web/src/components/content/MetadataGroup.astro`
- Create: `apps/web/src/components/content/Timeline.astro`
- Create: `apps/web/src/components/content/MediaTile.astro`
- Create: `apps/web/src/components/content/TableOfContents.astro`
- Create: `apps/web/src/components/content/ContactCTA.astro`
- Test: `apps/web/qa/content-components.spec.mjs`

**Interfaces:**
- Consumes: ATLAS-01/02 types and primitives.
- Produces: route-neutral, CMS-shaped presentation components.

- [ ] **Step 1:** Write failing component-contract tests from
  `agent-kit/components.json`, including optional-field collapse and separate
  title/action focus targets.

- [ ] **Step 2:** Implement components with typed props that accept already
  approved data; no component fetches CMS data or invents a fallback fact.

- [ ] **Step 3:** Ensure publication fields are optional and omitted when
  unverified; do not render em-dash facts in production.

- [ ] **Step 4:** Ensure Timeline is an ordered list before enhancement, MediaTile
  reserves aspect ratio, and failed media retains caption/record link.

- [ ] **Step 5:** Add Light/Dark, FA/EN, missing-media and missing-optional-data
  tests; verify heading order and definition-list semantics.

- [ ] **Step 6:** Run targeted QA, Astro check/build and diff check; update Work
  Log and commit.

  Commit message: `feat(web): add shared evidence and editorial components`

## Task ATLAS-05: Build the six shared page templates

**Files:**
- Create: `apps/web/src/layouts/HomeTemplate.astro`
- Create: `apps/web/src/layouts/CollectionIndexTemplate.astro`
- Create: `apps/web/src/layouts/EditorialIndexTemplate.astro`
- Create: `apps/web/src/layouts/LongFormTemplate.astro`
- Create: `apps/web/src/layouts/EvidenceDetailTemplate.astro`
- Create: `apps/web/src/layouts/UtilityTemplate.astro`
- Test: `apps/web/qa/page-templates.spec.mjs`

**Interfaces:**
- Consumes: accepted shell and content components.
- Produces: slot contracts used by all route-family adoption packets.

- [ ] **Step 1:** Write failing tests that map every current canonical route to
  exactly one template and reject empty linked detail shells.

- [ ] **Step 2:** Implement templates as semantic composition only. CMS loading,
  canonical construction and route-specific policy remain in route/data layers.

- [ ] **Step 3:** Add named slots for required/optional regions from
  `agent-kit/templates.json`; optional absent regions produce no wrapper gap.

- [ ] **Step 4:** Verify one H1, landmark order, breadcrumb placement, reading
  measure, contact/next action and no-JS output.

- [ ] **Step 5:** Run template QA, Astro check/build and diff check; update Work
  Log and commit.

  Commit message: `feat(web): add shared public page templates`

## Task ATLAS-06: Build the local-only Component Playground/Visual Atlas

**Files:**
- Create: `apps/web/src/design-atlas/integration.ts`
- Create: `apps/web/src/design-atlas/pages/index.astro`
- Create: `apps/web/src/design-atlas/components/Specimen.astro`
- Create: `apps/web/src/design-atlas/components/ViewportFrame.astro`
- Create: `apps/web/src/design-atlas/fixtures/index.ts`
- Create: `apps/web/scripts/design-atlas.mjs`
- Modify: `apps/web/astro.config.mjs`
- Modify: `apps/web/package.json`
- Create: `apps/web/qa/design-atlas.spec.mjs`

**Interfaces:**
- Consumes: runtime components, templates and `AtlasFixture<T>`.
- Produces: conditional local route and stable `[data-atlas-id]` screenshot hooks.

- [ ] **Step 1:** Write a failing QA that runs default build and asserts no
  `_design/index.html`, sitemap entry, Pagefind entry or fixture string exists.

- [ ] **Step 2:** Implement a conditional Astro integration that calls
  `injectRoute` for `/_design/` only when `process.env.DESIGN_ATLAS === "1"`.

- [ ] **Step 3:** Implement `scripts/design-atlas.mjs` to launch Astro with
  `DESIGN_ATLAS=1` through Node's child-process API, preserving cross-platform
  Windows/Linux behavior.

- [ ] **Step 4:** Add `npm run atlas` and `npm run qa:atlas`; do not add a new
  design-service dependency.

- [ ] **Step 5:** Build foundation, component, template, responsive, state,
  motion and asset sections using actual production imports. Every fixture sets
  `unpublished: true` and renders a visible fixture label.

- [ ] **Step 6:** Add controls for theme, direction, viewport and reduced motion;
  controls affect only the specimen boundary, not global editor state.

- [ ] **Step 7:** Run both builds:

  - Default: atlas route absent.
  - `DESIGN_ATLAS=1`: atlas route present and Playwright screenshots pass.

- [ ] **Step 8:** Update Work Log and commit.

  Commit message: `feat(web): add isolated component visual atlas`

## Task ATLAS-07: Adopt templates route-family by route-family

Create a separate worker/commit for each row; workers may run concurrently only
when they own disjoint route/component files.

| Packet | Routes/components | Required visual reference |
|---|---|---|
| 07A Home | locale index, Landing/Home composition | Home Light/Dark + RTL mobile |
| 07B Research/Publications | research, statement, topics, publications index/detail | PF-05 |
| 07C Projects | projects index/detail and sanitized disclosure | PF-04 + Persian detail |
| 07D Creative/Gallery | creative index/detail, Lightbox integration | PF-01/PF-02 |
| 07E Writing/Blog | writing index/detail/series/tag; preserve redirect-only blog | PF-03 + Persian detail |
| 07F Learning | teaching index/detail | PF-06 |
| 07G About/CV | About sections/details and CV | PF-07 |
| 07H Contact | Contact page/form state; no phone/Gmail | PF-08 |

For each packet:

- [ ] Write a failing route-family QA for canonical, alternate locale,
  template regions, empty/no-results/unavailable translation and no-JS content.
- [ ] Replace one-off presentation with accepted templates/components while
  preserving current loaders, DTO names, slugs and publication gates.
- [ ] Bind only actual CMS fields; omit absent optional data.
- [ ] Capture Light/Dark desktop and Persian/English narrow screenshots.
- [ ] Run targeted QA, Astro check/build, existing route tests and diff check.
- [ ] Add Work Log evidence and commit as
  `feat(web): adopt <family> design template`.

## Task ATLAS-08: Audit CMS/admin gaps before schema work

**Files:**
- Create: `Assets/site-redesign/implementation-reference/CMS-GAP-REPORT.md`
- Read only: `apps/cms/**`, public/admin API tests, current migrations
- Modify: repository Task Spec/index/Work Log only for the audit

**Interfaces:**
- Consumes: Master Spec CMS boundary and actual current models/endpoints.
- Produces: field-by-field status `exists | partial | absent | conflicting`,
  evidence path and separately approvable migration packets.

- [ ] Inventory actual content families, locale fields, status, featured,
  media, relationships, profile/CV, contact and graph payloads.
- [ ] Map current DTO names to template/component inputs without renaming code.
- [ ] Test public projections for draft/private/restricted leakage.
- [ ] Identify which Home composer, media, graph, timeline and preview features
  already exist and which require model/API/admin changes.
- [ ] Split required implementation into independently reversible migration
  packets with backup/import/rollback requirements.
- [ ] Record audit commands and results; commit the report without CMS mutation.

  Commit message: `docs(cms): map redesign requirements to current contracts`

## Task ATLAS-09: Implement approved CMS/admin packets

This task starts only after owner approval of named packets from ATLAS-08.

For every approved packet:

- [ ] Hash/backup or dump controlled production-shaped inputs before migration
  work as required by repository policy.
- [ ] Write failing model/API/admin tests for exact approved fields and privacy
  projection.
- [ ] Add the smallest reversible migration and explicit public/admin DTO mapping.
- [ ] Add admin validation, preview and audit behavior without arbitrary CSS/JS.
- [ ] Run CMS tests, lint, Django checks, migration dry-run, admin build/check and
  public-web contract tests.
- [ ] Record rollback and content-preservation evidence; commit one packet.

No generic “redesign migration” may combine unrelated Home, graph, media,
contact and white-label schema changes.

## Task ATLAS-10: Deliver graph Phase 1

**Files:**
- Modify/create within: `apps/web/src/components/research/**`
- Modify/create within: `apps/web/src/lib/cms/research-graph.ts`
- Test: graph contract, keyboard/list parity and fallback QA
- Admin files: only after ATLAS-08/09 explicitly assigns their paths

**Interfaces:**
- Consumes: mapped current graph DTO and `GraphNodePublic`/`GraphEdgePublic`
  adapter approved in CMS gap resolution.
- Produces: one published payload consumed by semantic list and enhanced 2D view.

- [ ] Write failing tests for stable IDs, orphan endpoints, duplicate edges,
  missing locale/accessibility labels and unpublished related records.
- [ ] Render semantic linked list in Astro before loading the interactive island.
- [ ] Implement keyboard and pointer selection that resolve identical related
  record URLs.
- [ ] Implement 2D pan/zoom/focus without blocking list navigation or no-JS.
- [ ] Add reduced-motion, coarse-pointer and renderer-failure tests.
- [ ] Verify performance budget and representative theme/RTL screenshots.
- [ ] Record evidence and commit.

  Commit message: `feat(web): deliver accessible research graph phase one`

Phase 2 Three.js remains a separately activated packet after G7. It consumes
the same payload, adds no content and must pass G8.

## Task ATLAS-11: Independent QA and regression hardening

**Files:**
- Modify/create: `apps/web/qa/**`
- Create: `Assets/site-redesign/implementation-reference/FINAL-QA-REPORT.md`
- Fixes: returned to owning packet unless integration lead assigns exact files

- [ ] Run Astro check/build and every targeted QA script.
- [ ] Run Playwright at six widths, two directions, two themes and reduced motion
  using a risk-based representative matrix.
- [ ] Verify 200% zoom, keyboard path, focus visibility, headings, landmarks,
  names, contrast, media fallback and form state retention.
- [ ] Build with JavaScript disabled/blocked for core routes and confirm content,
  filters/pagination URLs, graph list, figures and contact alternatives remain.
- [ ] Inspect output/search index for fixture strings, drafts, private media,
  internal notes and forbidden contact fields.
- [ ] Measure LCP, layout shift and asset bytes against the accepted budget.
- [ ] File each defect against its owning packet; rerun only after evidence-backed
  correction.
- [ ] Publish exact pass/fail/deferred table. Do not convert skipped checks to PASS.

## Task ATLAS-12: Reconcile documents and prepare release handoff

**Files:**
- Modify only the owner files listed in `DOCUMENT-MIGRATION-MAP.md`
- Modify: relevant ledgers and active plan index
- Create: a separate production release Task Spec if owner requests deployment

- [ ] Compare every “current state” statement with merged source and test output.
- [ ] Update Design/IA/Manifest/AGENTS only where accepted implementation changed
  their owned facts.
- [ ] Mark each packet DONE/PARTIAL/BLOCKED honestly and link its Work Log ID.
- [ ] Verify all reference paths, asset hashes and machine JSON.
- [ ] Run full repository verification and exact changed-file review.
- [ ] Commit documentation reconciliation.

  Commit message: `docs: reconcile component atlas implementation evidence`

- [ ] Stop before deploy. Production adoption requires separate owner approval,
  backup, rollback, CI, smoke and post-deploy visual QA.

## Self-review checklist

- [ ] Every Master Spec requirement maps to at least one packet.
- [ ] No two concurrent packets own the same high-conflict file.
- [ ] Interfaces used by later packets are declared in ATLAS-01/coordination.
- [ ] CMS migration is preceded by an evidence-only gap audit.
- [ ] Atlas is local-only and imports production components.
- [ ] Graph 3D is optional and cannot outrun accessible Phase 1.
- [ ] Documentation is changed after evidence, not before it.

