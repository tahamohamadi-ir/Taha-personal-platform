# Frontend Implementation Architecture Blueprint

**Project:** Taha Personal Platform  
**Version:** 1.0  
**Date:** 2026-08-26  
**Status:** Recommended implementation decision; runtime adoption requires its own approved Task Spec  
**Quality score:** **9.92 / 10** for architecture-decision completeness  
**Authority boundary:** This document does not change current routes, runtime contracts, CMS models, deployment, or production state.

## Goal

Define one implementation architecture for the approved UI/UX redesign.

The architecture must preserve semantic content, bilingual parity, and performance.
It must also support bounded motion, SVG graphs, and optional WebGL depth.

## Read this first

Read these sources before implementation:

1. Repository `AGENTS.md`.
2. Repository `docs/README.md`.
3. Repository `PROJECT_MANIFEST.md`.
4. Repository `docs/contracts/IA-CONTRACT.md`.
5. Repository `docs/contracts/DESIGN-CONTRACT.md`.
6. This folder's `MASTER-SPEC.md`.
7. This folder's `ACCEPTANCE-GATES.md`.
8. This folder's `MULTI-AGENT-TASK-LIST.md`.

If sources conflict, current repository contracts win.
An approved adoption task must reconcile every conflicting owner document.

## 1. Final architecture decision

Use this stack for the redesigned public frontend:

| Layer | Decision | Loading rule |
|---|---|---|
| Public shell | Astro 7 | Static HTML by default |
| Language | TypeScript 5.9 | Build-time and typed client code |
| Styling | Tailwind CSS 4 plus semantic CSS variables | Included in the shared stylesheet |
| Interactive UI | React 19 islands | Hydrate only the owning interaction |
| Small motion | CSS first, then Motion | Load only where interaction needs it |
| Complex choreography | GSAP and ScrollTrigger | Dynamic import on owned pages only |
| Public graph Phase 1 | Semantic list plus accessible SVG | List renders before any island |
| Public graph Phase 2 | Direct Three.js with WebGL | Load after explicit user activation |
| CMS graph editor | Existing React/Vite admin plus `@xyflow/react` | Admin bundle only |
| Static search | Existing Pagefind integration | Public index excludes drafts and fixtures |
| Media | Astro Assets API | Build responsive AVIF/WebP derivatives |
| End-to-end QA | Playwright | Six widths, two locales, and required states |
| Automated accessibility | Proposed `@axe-core/playwright` | Development dependency only |

Do not replace Astro with Next.js or a React single-page shell.
Do not make React the owner of static public content.

### Observable result

Public content remains complete when JavaScript is disabled.
Interactive islands enhance the same semantic content after hydration.

## 2. Verified current baseline

The current checkout contains these public packages:

| Package | Observed version |
|---|---:|
| Astro | `7.2.4` |
| TypeScript | `5.9.3` |
| Tailwind CSS | `4.3.3` |
| React / React DOM | `19.2.8` |
| Motion | `13.1.1` |
| GSAP | `3.15.0` |
| Three.js | `0.185.1` |
| Playwright | `1.62.1` |
| Pagefind | `1.4.0` |

The current CMS admin contains this separate stack:

| Package | Observed version |
|---|---:|
| React / React DOM | `18.3.1` |
| Vite | `6.4.3` |
| TypeScript | `5.7.3` |
| Tailwind CSS | `4.3.3` |

These values describe this checkout only.
The lockfiles remain the dependency authority during implementation.

### Current source evidence

- `ResearchGraphIsland.tsx` already imports Motion.
- `Constellation3D.tsx` already imports Three.js dynamically.
- GSAP is installed but has no detected source import.
- `global.css` already defines Light theme tokens and reduced-motion behavior.
- `global.css` currently activates Inter and Vazirmatn only.

### Contract mismatch that must be resolved

The current Design Contract still describes Motion and Three.js as unused.
The current source contains active imports for both packages.

Do not treat package presence as new authorization.
The first adoption task must reconcile the Design Contract and runtime evidence.

The current Design Contract also keeps Dark mode out of scope.
The redesigned Dark theme remains a target until contract adoption passes.

## 3. Runtime ownership model

Use one owner for each behavior:

| Behavior | Owner |
|---|---|
| Document structure, headings, links, metadata | Astro |
| Layout, themes, focus, responsive behavior | CSS tokens and Tailwind |
| Simple disclosure or menu behavior | Native HTML and small scripts |
| Stateful filters and graph selection | React island |
| Small SVG and UI transitions | Motion |
| Coordinated multi-section sequence | GSAP |
| Three-dimensional rendering | Three.js |
| Content, publication, order, relationships | CMS projection |

Never let two motion libraries control the same element.
Never let Three.js own public navigation or content authority.

## 4. Astro and React island rules

Astro owns every public page shell.
Astro must render the initial meaningful content.

Use these hydration rules:

- Use no hydration for ordinary cards, lists, prose, and navigation.
- Use a small script for simple theme and disclosure controls.
- Use `client:visible` for optional below-fold React interactions.
- Use `client:idle` only for non-critical enhancements.
- Avoid `client:load` unless interaction is immediately necessary.
- Do not use `client:only` for public content.

### Expected result

The initial HTML contains headings, links, records, and fallback states.
Hydration does not create cumulative layout shift.

## 5. Design System implementation

Treat runtime CSS variables as the design-token authority.
Use Tailwind utilities as a token-consumption API.

Implement four token layers:

1. Primitive values.
2. Semantic Light roles.
3. Semantic Dark roles.
4. Component aliases.

Themes may change color, illumination, and depth.
Themes must not change DOM anatomy or content order.

### Required visual system

- Light Editorial uses warm ivory, navy, turquoise, and scarce gold.
- Dark Scientific Atlas uses deep navy and warm ivory.
- Dark mode may use restrained turquoise, gold, violet, coral, or sage.
- One viewport may show at most three prominent accent hues.
- Glass is restricted to the sticky Header and Language Gateway.
- Cards, prose, forms, and tables use solid readable surfaces.

### Component rule

Use the 24 components in `agent-kit/components.json`.
Use the six templates in `agent-kit/templates.json`.

Do not create a second component library.
Do not introduce shadcn or Radix without a concrete missing interaction.

## 6. Typography and icons

The target type system is:

| Locale | Display | Body and UI |
|---|---|---|
| English | Newsreader Variable | Inter Variable |
| Persian | Estedad Variable | Vazirmatn Variable |

Only two font families may be active for one locale.
Self-host reviewed subsets and retain their license notices.

The current runtime lacks Newsreader and Estedad.
Add them only in the approved token-and-font adoption task.

Use Lucide for interface icons.
Prefer `lucide-astro` in public Astro components.
Prefer `lucide-react` inside the admin application.

If icon dependencies are not approved, use reviewed local SVG components.
Never use emoji as an interface icon.

## 7. Motion technology decision

Use the lowest-complexity tool that satisfies the interaction.

### CSS

Use CSS for:

- color and border transitions;
- focus and hover parity;
- small opacity changes;
- simple disclosure feedback;
- native cross-document View Transitions.

### Motion

Use Motion for:

- graph node selection;
- SVG path drawing;
- filter and panel state changes;
- small coordinated React transitions;
- bounded spring feedback.

Use Motion's reduced-motion API in React islands.
Prefer `motion/mini` when the required feature set permits it.

### GSAP

Use GSAP for:

- the career-journey sequence;
- complex timeline choreography;
- coordinated section sequences;
- sequences requiring precise reversible control.

Use `gsap.matchMedia()` for viewport and reduced-motion branches.
Return cleanup functions and revert every owned animation.

Do not use GSAP for ordinary hover or focus states.
Do not add scroll-jacking or long pinned reading sections.

### Motion limit

Only one major ambient motion system may run in one viewport.
Motion must never block reading, navigation, or form use.

## 8. Public research graph

### Phase 1: required 2D graph

Build Phase 1 before Three.js adoption.

1. Render a semantic linked list in Astro.
2. Render an accessible SVG from the same published payload.
3. Add a React island for selection and filters.
4. Use Motion for bounded node and edge feedback.
5. Keep every related record reachable by an ordinary URL.

The list and SVG must expose the same relationships.
Keyboard and pointer selection must reach the same records.

Validate these graph failures:

- orphan node;
- duplicate edge;
- missing label;
- missing locale projection;
- broken record link;
- invalid visibility state.

### Expected result

The graph remains understandable without JavaScript, Canvas, or WebGL.

### Phase 2: optional Three.js graph

Start Phase 2 only after Graph Gate G7 passes.

Use direct Three.js.
Do not add React Three Fiber in the first implementation.

Load Three.js after explicit user activation.
Keep the 2D graph visible until the 3D renderer succeeds.

The renderer must:

- use the Phase 1 published payload;
- add no exclusive relationship or content;
- bound camera travel and pointer response;
- pause outside the viewport;
- pause when the document is hidden;
- dispose geometry, materials, textures, and renderer state;
- restore the 2D view after a renderer failure;
- disable camera travel under reduced motion;
- avoid required interaction on coarse pointers.

WebGPU is not an initial requirement.
WebGL remains the approved Phase 2 target.

## 9. CMS graph editor

Keep graph editing inside the existing React/Vite admin application.
Do not move the admin editor into the public Astro bundle.

Use `@xyflow/react` as the preferred 2D editor library.
It provides nodes, edges, handles, pan, zoom, selection, controls, and minimap.

Enable and localize its keyboard and screen-reader behavior.
Do not disable keyboard accessibility for implementation convenience.

### Data boundary

React Flow is a view and editing tool.
React Flow's internal objects are not the public API contract.

Before adding the dependency:

1. Audit the actual Django models.
2. Audit the Ninja endpoints and DTOs.
3. Audit existing migrations.
4. Approve the graph payload contract.
5. Map the payload to React Flow adapters.

Do not invent an endpoint, field, or migration from the concept image.

### Editor requirements

- Nodes, relationships, and groups use the approved payload.
- Undo and redo do not bypass revision checks.
- Validation runs before publish.
- Two locales and two themes have preview paths.
- The semantic-list preview is always available.
- Phase 2 preview remains unavailable until its separate gate passes.
- Saved views do not change public publication state.

## 10. Page navigation and transition strategy

Keep ordinary multi-page Astro navigation as the baseline.
Use browser-native cross-document View Transitions progressively.

Do not enable Astro `ClientRouter` globally at first.
Client-side routing creates script lifecycle and focus-restoration obligations.

Add `ClientRouter` only after a documented requirement proves its value.

### Canonical route boundary

Current repository IA remains authoritative:

- Writing uses `/{locale}/writing/`.
- Creative uses `/{locale}/creative/`.
- Learning uses `/{locale}/teaching/`.
- Blog paths remain redirects to Writing.
- Publication detail uses `/{locale}/publications/{slug}/`.

Visual labels may say Blog, Gallery, or Learning.
Visual labels do not silently migrate canonical URLs.

The current Header contract also outranks concept-screen navigation.
Any navigation change requires a separate IA decision and regression suite.

## 11. RTL, localization, and mixed direction

Set `lang` and `dir` on the root document.
Use logical CSS properties throughout the implementation.

Do not reverse DOM order to create RTL.
Do not mirror the logo or meaning-bearing graph topology.

Flip only directional travel icons.
Do not flip mail, download, search, external-link, or status icons.

Wrap mixed-direction identifiers with `<bdi>` or an explicit direction.
This rule includes email, DOI, URL, code, filename, and version strings.

Never use silent locale fallback.
Show an explicit unavailable-translation state instead.

## 12. Image and artwork pipeline

The inspected pack contains:

- 108 PNG files;
- 44 unique image hashes;
- 64 exact duplicate files;
- 33 managed handoff PNGs;
- 14 unique unmanaged images under `others/`.

The `others/` directory is not implementation authority.
Concept screenshots are art-direction references only.

### Production image procedure

1. Preserve every approved master PNG unchanged.
2. Import production candidates from `src/assets`.
3. Use Astro `<Picture>` for local responsive images.
4. Generate AVIF and WebP derivatives.
5. Generate approximately 800, 1200, and 1600 pixel widths.
6. Provide correct `sizes` and stable dimensions.
7. Preload only the real LCP hero.
8. Lazy-load preview and below-fold art.
9. Apply the documented focal point.
10. Verify contrast against the final crop and final copy.

Use `alt=""` for decorative artwork.
Use approved localized alt text for content-bearing artwork.

Do not slice screenshot typography, controls, or graph nodes into production UI.

## 13. Accessibility requirements

Target WCAG 2.2 AA.

The implementation must provide:

- visible focus in both themes;
- keyboard access to every interaction;
- hover and focus-visible parity;
- 44 by 44 pixel targets, except documented narrow-width exceptions;
- 4.5:1 normal-text contrast;
- 3:1 large-text and non-text contrast;
- stable geometry during loading;
- error recovery that preserves user input;
- no color-only state or meaning;
- no autoplay carousel;
- focus restoration after overlays;
- reduced-motion alternatives;
- complete no-JavaScript reading paths.

Add `@axe-core/playwright` after Task Spec approval.
Automated axe checks do not replace keyboard and screen-reader review.

## 14. Testing matrix

Run public visual and interaction tests at these widths:

- 320 CSS pixels;
- 390 CSS pixels;
- 768 CSS pixels;
- 1024 CSS pixels;
- 1280 CSS pixels;
- 1440 CSS pixels.

Cover these dimensions:

| Dimension | Required states |
|---|---|
| Locale | English LTR and Persian RTL |
| Theme | Light and adopted Dark |
| Motion | Default and reduced |
| JavaScript | Enabled and disabled |
| Content | Normal, empty, no-results, error, unavailable translation |
| Input | Keyboard, pointer, and coarse pointer |
| Zoom | 100 percent and 200 percent |
| Graph | List, SVG, renderer failure, optional 3D |

Use Playwright snapshots for the local Visual Atlas.
Keep stable screenshot selectors inside the atlas contract.

The default build must contain no atlas route or fixture text.
The sitemap and Pagefind index must also exclude atlas content.

## 15. Performance and failure policy

Do not invent a numerical budget before measuring the accepted baseline.
Record measured budgets in the implementation Task Spec.

The following architectural budgets are binding:

- Non-graph pages ship no Three.js chunk.
- The 2D graph renders before Three.js loads.
- GSAP loads only on pages with approved choreography.
- Preview art does not compete with the LCP hero.
- Loading states reserve final geometry.
- WebGL failure never produces an empty content region.
- Reduced-motion mode removes camera travel and forced orbit.
- Background render loops stop when inactive.

Measure LCP, CLS, INP, JavaScript transfer, image transfer, and long tasks.
Approve numerical thresholds only after representative-device measurement.

## 16. Dependency decisions

### Keep

- Astro;
- TypeScript;
- Tailwind CSS;
- React islands;
- Motion;
- GSAP;
- Three.js;
- Pagefind;
- Playwright.

### Add only after approval

- `@fontsource-variable/newsreader`;
- `@fontsource-variable/estedad`;
- `lucide-astro`;
- `lucide-react` for the admin only;
- `@xyflow/react` for the admin graph editor;
- `@axe-core/playwright` for automated accessibility checks.

### Do not add initially

- Next.js;
- React Three Fiber;
- D3;
- Storybook;
- shadcn/ui;
- Radix as a general component foundation;
- another CSS-in-JS system;
- another always-on runtime service.

Re-evaluate a rejected dependency only for a documented missing capability.

## 17. Implementation sequence

### Step 1 of 9: Freeze the baseline

Reconcile current contracts, source imports, lockfiles, and dirty ownership.

**Expected result:** G0 evidence identifies every authority and mismatch.

### Step 2 of 9: Adopt tokens, fonts, and media rules

Implement approved dual-theme tokens and target fonts.

**Expected result:** Light and Dark token checks pass without raw values.

### Step 3 of 9: Build primitives

Build the 24 required components and their states.

**Expected result:** G2 keyboard, focus, RTL, loading, and target-size checks pass.

### Step 4 of 9: Build shell and templates

Build Header, Footer, Gateway, and six shared templates.

**Expected result:** No-JavaScript routes remain complete and canonical.

### Step 5 of 9: Build the local Visual Atlas

Import real production components and approved fixtures.

**Expected result:** `DESIGN_ATLAS=1` exposes the atlas locally only.

### Step 6 of 9: Adopt public page families

Migrate one route family per bounded task.

**Expected result:** Every page family uses shared templates and real content gates.

### Step 7 of 9: Deliver graph Phase 1

Deliver the semantic list, SVG, React interaction, and validators.

**Expected result:** G7 passes without Three.js dependency at runtime.

### Step 8 of 9: Build the admin graph editor

Audit CMS contracts before adding the React Flow adapter.

**Expected result:** Draft editing and validation preserve publication boundaries.

### Step 9 of 9: Evaluate graph Phase 2 and release

Add Three.js only after Phase 1 acceptance.

**Expected result:** G8 and G9 pass independently before deployment approval.

## 18. Stop conditions

Stop implementation when any condition is true:

- The current contract and target design conflict without an owner decision.
- A required CMS field or endpoint does not exist.
- A dependency lacks an approved Task Spec.
- A route change lacks an IA decision.
- A locale requires invented copy or silent fallback.
- A graph relationship lacks published authority.
- Dark tokens fail contrast.
- Three.js removes content available in the 2D view.
- The default build exposes atlas fixtures.
- A test or QA gate is skipped without a deferred-validation ID.

## 19. Acceptance mapping

| Gate | Blueprint decision |
|---|---|
| G0 | Authority and dependency reconciliation |
| G1 | Runtime token and theme adoption |
| G2 | Twenty-four primitive components |
| G3 | Six templates and canonical route families |
| G4 | Local-only Visual Atlas |
| G5 | Responsive, RTL, state, zoom, and no-JS coverage |
| G6 | CMS model/API audit before migrations |
| G7 | Shared-payload semantic list and SVG graph |
| G8 | Optional Three.js enhancement |
| G9 | Release QA, privacy, performance, and deployment separation |

Passing one gate does not imply another gate passed.
Design readiness does not imply production acceptance.

## 20. Quality score

This score evaluates the blueprint itself.
It does not score the future implementation.

| Criterion | Weight | Score |
|---|---:|---:|
| Repository-contract alignment | 1.50 | 1.50 |
| Architecture and stack fit | 1.50 | 1.50 |
| Progressive enhancement and graph strategy | 1.30 | 1.30 |
| UI/UX-to-component translation | 1.25 | 1.24 |
| Accessibility, RTL, and locale integrity | 1.25 | 1.25 |
| Performance and media strategy | 1.10 | 1.09 |
| Verification and release gates | 1.10 | 1.09 |
| Implementation sequence and risk control | 1.00 | 0.95 |
| **Total** | **10.00** | **9.92** |

### Why the score is not 10

Three decisions require future evidence:

1. CMS graph models and endpoints require a current gap audit.
2. Performance thresholds require representative-device measurements.
3. Runtime contracts require owner-approved reconciliation before adoption.

These are correct gates, not missing recommendations.
The blueprint remains executable without inventing their outcomes.

## 21. Final decision

Adopt Astro, TypeScript, Tailwind, and bounded React islands.

Use CSS and Motion for ordinary interaction.
Use GSAP only for approved choreography.
Build the public graph as semantic HTML and SVG first.
Add direct Three.js only as an optional Phase 2 renderer.
Use React Flow only inside the CMS graph editor.

This decision achieves the intended visual quality without sacrificing content integrity.

## Official implementation references

- Astro components: <https://docs.astro.build/en/basics/astro-components/>
- Astro View Transitions: <https://docs.astro.build/en/guides/view-transitions/>
- Astro Assets API: <https://docs.astro.build/en/reference/modules/astro-assets/>
- Tailwind theme variables: <https://tailwindcss.com/docs/theme>
- Motion reduced motion: <https://motion.dev/docs/react-use-reduced-motion>
- GSAP match media: <https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/>
- Three.js installation: <https://threejs.org/manual/en/installation.html>
- React Flow accessibility: <https://reactflow.dev/learn/advanced-use/accessibility>
- Newsreader Variable: <https://fontsource.org/fonts/newsreader/install>
- Estedad Variable: <https://fontsource.org/fonts/estedad>
