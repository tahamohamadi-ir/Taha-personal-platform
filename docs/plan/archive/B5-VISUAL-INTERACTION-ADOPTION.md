# B5 — Visual-interaction adoption brief

> Status: **AUTHORIZED (2026-08-23, ADR-0030)** — owner in-session attestation
> accepts `motion`, `gsap` (license), `d3`, and `three` (with explicit
> ≤150KB-gzip lazy budget for the single 3D signature experience). Candidates
> 1–3 below are now authorized; Candidate 5 (3D identity constellation) is
> added. Every interaction still follows the gate + checklist + QA plan below.
> Grounds: `docs/design.md` §64–§71, §73–§84, §93–§95, §98, §102;
> `ADR-0028`; **`ADR-0030`**; `DEFER-0012`; Task `P0B-04`; S-Plan task B5.

## Goal & gate

Adoption of a visual-interaction library (`motion`, `gsap` or `three`) happens
ONLY when every condition below holds:

- **Static P1 production release is done.** Task A5 must be complete
  (production serving the static bilingual artifact) before any interaction is
  adopted.
- **A concrete, user-valuable interaction on a real route.** The interaction
  must solve a real UX problem on an existing public route (`/`, `/en/`, `/fa/`).
  “Looks nicer” alone is insufficient (Task `P0B-04`; design.md §67 hero
  anti-rule).
- **One library per interaction.** CSS/native is always evaluated first
  (design.md §73, §94); if it cannot meet the value, exactly ONE of `motion`,
  `gsap` or `three` is chosen. Motion and GSAP are not combined by default.
- **Mandatory checklist.** The candidate must pass the full adoption checklist
  copied from design.md §98 below; no compromises.
- **Owner approval.** The final interaction + route + library choice requires
  explicit owner approval (S-Plan B5 precondition; Task `P0B-04`).
- **Task Spec first.** Adoption is only ever implemented inside a dedicated Task
  Spec with its own QA and browser evidence. Nothing in this brief is
  implemented.

## Candidate interactions

The three candidates below are PROPOSALS ONLY — not implemented. Each names a
route that exists today or is already designed in `docs/design.md`.

### Candidate 1 — Hero identity-constellation entrance

- **Route:** locale landing pages `/en/` and `/fa/` — hero `.constellation` SVG
  in `apps/web/src/components/Landing.astro`. The Language Gateway `/` stays
  fully static.
- **Why user-value:** the constellation is the “Editorial-Tech Constellation /
  Identity Network” (design.md §64). A subtle one-time path/node draw on
  entrance explains identity and connection without any click, and answers
  “what does this say about Taha?” (§67). It is narrative motion used
  sparingly (§76) and never required to understand content.
- **Library:** CSS/SVG first (stroke-dashoffset / keyframes on the existing SVG
  paths); `motion` only if CSS cannot reach the value. Never defaults to two
  libraries.
- **Bundle-cost note:** a CSS-only entrance adds 0 JS. A `motion` island would
  be route/local and lazy (`client:visible`); the interaction chunk must stay
  under the 35KB gzip budget (QA plan below; design.md §95).
- **Reduced-motion / no-JS fallback:** static by default — both
  `prefers-reduced-motion: reduce` and no-JS render the current static
  constellation exactly as shipped today (no animation, full content); the
  entrance never delays hero copy (design.md §95 “Hero copy: available
  immediately”).

### Candidate 2 — “Explore by Perspective” card hover/transition polish

- **Route:** locale landing pages `/en/` and `/fa/` — `#perspectives` section
  (`content.perspectives.items` in `apps/web/src/data/content.ts`, rendered in
  `apps/web/src/components/Landing.astro`).
- **Why user-value:** the three perspective cards are the primary entry paths
  (design.md §69: each must communicate audience, value, next step). A subtle
  transition on hover/focus makes the card feel interactive and supports
  wayfinding without adding content.
- **Library:** `motion` (functional motion is “Prefer CSS or Motion”,
  design.md §75). CSS is tried first; Motion only if the transition cannot be
  achieved acceptably in CSS.
- **Bundle-cost note:** island-local, lazy import confined to the perspectives
  section only; the interaction chunk must stay under the 35KB gzip budget.
- **Reduced-motion / no-JS fallback:** hover/focus state change is preserved
  without large transforms (design.md §84: preserve state changes, remove large
  transforms); no-JS renders the static cards exactly as today; no keyboard or
  focus regression.

### Candidate 3 — Journey / About timeline reveal

- **Route:** the Journey section on the locale landing pages `/en/` and `/fa/`
  per design.md §71 (homepage architecture §68). A future About page route
  would be scoped in its own Task Spec when that route exists (Phase C / P2).
  This brief creates no route.
- **Why user-value:** the Journey is the career/intellectual progression
  (Design → Interaction → Engineering → Data → AI → Human-Centered Intelligent
  Systems) and is “an ideal place for a signature narrative motion”
  (design.md §71). A scroll-triggered reveal explains progression and evolution.
- **Library:** `gsap` (narrative motion — §76 “GSAP is allowed”; §78 good use =
  coordinated scroll sequence / multi-part narrative / complex timeline),
  with ScrollTrigger only if required. Route-level/lazy loading per §78.
- **Bundle-cost note:** `gsap` 3.15.0 + ScrollTrigger are locked in `apps/web`;
  the import must be route/island-local and lazy; the interaction chunk must
  stay under the 35KB gzip budget.
- **Reduced-motion / no-JS fallback:** MUST degrade to a readable static
  timeline (design.md §71). Reduced-motion and no-JS both render the static
  timeline; the scroll trigger never blocks content.

Note: all three candidates reuse existing tokens only — no new palette,
typography or assets. External assets (Beautiful UI, UI8 DNA) remain governed
by `DEFER-0012` and are not part of any candidate.

### Candidate 4 — Research relationship map (AUTHORIZED — ADR-0028)

- **Route:** `/{locale}/research/` overview — Topic↔Project↔Publication edges
  already projected by the CMS; interactive SVG island + static relationship
  tree. Spec: `docs/plan/wave4-research-graph-island-task-spec.md`.
- **Why user-value:** answers “how do topics, projects, and publications
  connect?” in one spatial view (design.md §102 Research Map). Lists alone
  remain the product for no-JS; the island is progressive enhancement for
  neighborhood focus, pan/zoom, and keyboard spatial navigation.
- **Library:** `motion` (MIT) + SVG. **Not** gsap (proprietary per
  `LICENSES.md`). **Not** three.js (exceeds 35KB gzip island budget — keep
  budget; see ADR-0028).
- **Bundle-cost note:** route-local React island, `client:visible`; interaction
  chunk must stay under the **35KB gzip** budget (unchanged).
- **Reduced-motion / no-JS fallback:** static HTML relationship tree always
  present with real hrefs; reduced-motion skips spring/pan animation and keeps
  focus/state changes.

## Adoption checklist

Mandatory gate — a candidate is adoptable only if every item passes. Copied
verbatim from `docs/design.md` §98:

- [ ] Does it solve a real UX problem?
- [ ] Does it match visual direction?
- [ ] Can it use our tokens?
- [ ] Is it accessible?
- [ ] Does it support RTL?
- [ ] Is bundle/runtime cost acceptable?
- [ ] Does it degrade without effect?
- [ ] Is maintenance acceptable?
- [ ] Does it duplicate existing Radix/shadcn primitive?
- [ ] Is license/source acceptable?
- [ ] Source/version/use-right در workspace یا record مالک قابلتأیید است؟
- [ ] no-JS/static و Reduced Motion fallback تعریف شده است؟
- [ ] اگر effect runtime دارد، import route/island-local و lazy است؟

## QA plan

Any adopted interaction is verified with evidence recorded in its Task Spec and
`WORK_LOG.md`, across:

- **Keyboard:** full operation via keyboard; visible focus-visible indicator
  (design.md §83); no tab traps; state changes announced.
- **RTL/LTR:** `/fa/` (RTL) and `/en/` (LTR) both pass; logical properties used;
  direction-sensitive icons/chevrons reverse or adapt correctly (§88, §89).
- **Mobile:** viewports 320, 390, 768, 1280, 1440 px; mobile-simplified visual
  per §86; content hierarchy wins.
- **Reduced motion:** `prefers-reduced-motion: reduce` → static/functional-only
  (§84); no large transforms, continuous loops, parallax or smooth-scroll
  effects; state changes and content preserved.
- **No-JS:** public content is complete and readable with JavaScript disabled
  (§93); the interaction is absent but nothing breaks.
- **Lighthouse / perf budget:** any single interaction bundle < 35KB gzip; hero
  copy and primary content are never delayed; Three/WebGL (if ever) is never
  render-blocking (§95).
- **Visual regression baseline:** a committed baseline screenshot set (viewport
  matrix above, both locales, reduced-motion, no-JS) is captured before and
  after the interaction; the diff must be reviewable.

## Escalation rule

- If a candidate cannot meet every adoption-checklist item, it is DROPPED — no
  compromise, no partial adoption.
- The final interaction + route + library choice requires owner approval; the
  S-model never activates a library on its own.
- Any ambiguity, missing route or failed verification stops the task and
  escalates (`ESCALATE: <reason>`).

## Explicit non-goal

- ~~Do NOT import `gsap` or `three` anywhere in the public site without a new ADR~~
  **SUPERSEDED by ADR-0030 (2026-08-23):** gsap (license accepted by owner), d3,
  and three (≤150KB lazy budget, single signature experience) are authorized.
  `motion` remains the default for functional micro-interactions.
- Do NOT copy Beautiful UI code outside an approved slice with registered
  source and project-owned tokens (`DEFER-0012`; design.md §98).
- ~~Candidates 1–3 remain unimplemented until separately authorized~~ —
  authorized via ADR-0030; implement with per-interaction QA evidence.
