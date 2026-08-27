# Motion, Interaction, and Research Graph Handoff

**Status:** implementation handoff proposal

## 1. Motion language

Motion is architectural: reveal structure, show relationships, and preserve a
sense of depth. It is not a continuous spectacle.

- base UI feedback: 140–220ms;
- section/route transitions: approximately 280–500ms;
- graph camera transitions: approximately 500–900ms when motion is allowed;
- easing favors smooth deceleration and avoids elastic/bouncy academic UI;
- only one major ambient motion system is active in a viewport.

Exact values become tokens and are validated during implementation. Reduced
motion collapses decorative animation to immediate state changes.

## 2. Home behavior

### Hero

- name and research position render immediately as static HTML;
- a faint pointer-reactive light field may move behind the architectural scene;
- CTAs use color/border/depth feedback, not layout-changing movement;
- theme transition cross-fades semantic surfaces without a full-page flash.

### Chapter index

- becomes sticky after the Hero;
- marks the current chapter with label + shape, not color alone;
- anchor navigation is native and respects reduced motion;
- it never obscures headings at 200% zoom.

### Preview cards

- resting state is stable;
- hover/focus adds one depth step, stronger border, and image parallax of only a
  few pixels when motion is allowed;
- the entire card is not an inaccessible nested link; one clear title/action
  owns navigation;
- touch devices receive equivalent pressed/focus feedback.

### Timeline

- static line and milestones remain readable without JavaScript;
- entering the viewport reveals the path sequentially once;
- selecting a milestone focuses related graph nodes and preview records;
- on mobile it becomes a vertical timeline, not a horizontally clipped strip.

## 3. Graph data contract

One durable model drives the admin editor, public 2D renderer, and future 3D
renderer.

### Node

- stable ID and version;
- type and semantic role;
- locale title, short label, and description;
- optional icon/media;
- optional canonical content relationship;
- status, visibility, date range, weight, group/layer;
- x/y manual position and optional z/depth metadata;
- accessible text label and fallback order.

### Edge

- stable ID;
- source and target node IDs;
- directed state and relationship type;
- locale label/description;
- weight, status, date range, visibility, and style role;
- optional curvature/routing hint;
- accessible relationship sentence.

Colors are renderer decisions derived from semantic roles. Editors do not enter
arbitrary hex values.

## 4. Public 2D graph — Phase 1

Use an SVG-first or canvas-enhanced island with a semantic list fallback.

- initial view communicates the main research constellation without interaction;
- keyboard traversal follows a deterministic node order;
- selecting a node emphasizes its direct relationships and opens a concise
  side/bottom detail panel;
- Enter follows the canonical linked content when one exists;
- Escape clears focus; focus is never lost during filtering;
- pan/zoom controls are explicit and resettable;
- mobile prioritizes focus paths and a list/map toggle;
- the URL may store a selected node through a query/hash only when it remains
  stable and shareable;
- print/no-JS output is a readable relationship list or static SVG.

## 5. Public 3D graph — Phase 2

Three.js/WebGL is an optional enhancement loaded after primary content.

- 3D does not change the data contract or canonical links;
- camera begins in a legible restrained perspective, not an endless fly-through;
- pointer/touch/keyboard selection shares one focus state;
- node labels avoid overlap through prioritization and distance thresholds;
- camera travel is interruptible and resettable;
- background animation pauses off-screen or when the tab is hidden;
- renderer quality scales with device capability;
- excessive node/edge counts trigger clustering or fall back to 2D;
- WebGL failure, data failure, reduced motion, and low-power mode use the 2D
  experience automatically.

## 6. Suggested implementation ownership

- Astro owns semantic page shell, content, links, and no-JS fallbacks.
- A small React island may own interactive graph state and controls.
- GSAP is reserved for coordinated chapter/timeline sequences that cannot be
  expressed clearly with CSS; simple feedback stays CSS.
- Three.js owns only the 3D renderer, never navigation or content authority.
- The CMS API supplies published graph versions and canonical content links.

This is a boundary description, not approval to add/import a library in the
current build. Dependency activation requires its own task specification and
verification.

## 7. Performance budget

- primary HTML, heading, and CTA arrive without graph JavaScript;
- graph code and data are lazy-loaded near the viewport;
- media uses explicit dimensions and responsive sources;
- no layout shift when 2D/3D content hydrates;
- interaction remains responsive while graph simulation runs;
- target page metrics follow the master design spec;
- animation work stops when invisible.

## 8. Accessibility and failure states

- every graph relationship is available as text;
- selected, focused, loading, empty, error, and unavailable states have labels;
- no meaning depends only on color, glow, size, or spatial position;
- all controls have 44px targets and visible focus;
- motion never blocks reading or navigation;
- errors offer a 2D/list fallback rather than a blank canvas;
- RTL changes layout direction but not scientific relationship semantics.

## 9. Visual QA states

Verify at minimum:

- English Light and Dark at 1440px and 390px;
- Persian Light and Dark at 1440px and 390px;
- keyboard-only graph traversal;
- 200% zoom;
- reduced motion;
- no JavaScript;
- WebGL unavailable;
- long labels and missing media;
- empty graph and orphaned node validation;
- high node density with clustering/fallback.

