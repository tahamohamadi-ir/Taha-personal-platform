# Agent-ready design kit

This directory is the implementation bridge. **Figma is a view, not the source
of truth.** A coding agent should read these sources in order:

1. `AGENTS.md`, `PROJECT_MANIFEST.md`, and the active implementation Task Spec.
2. `docs/contracts/IA-CONTRACT.md` for routes and navigation.
3. `docs/contracts/DESIGN-CONTRACT.md` and
   `apps/web/src/styles/global.css` for tokens that exist in runtime.
4. `tokens.json`, `components.json`, `templates.json`, and `assets.json` here.
5. Page-family, responsive/RTL/state, CMS, and motion handoff documents linked
   below.
6. Raster concepts only for hierarchy and art direction.

## Status vocabulary

- `runtime-authoritative`: exists in the current CSS/contract and may be used.
- `design-target`: approved visual direction, but requires a separately
  authorized implementation task before changing runtime tokens.
- `reference-only`: inspect for intent; never copy pixels or generated text.
- `cms-owned`: content comes from a published locale record, not source code.

## Machine-readable files

- `tokens.json` — current Light runtime values plus proposed Dark design roles.
- `components.json` — shared anatomy, states, accessibility and CMS slots.
- `templates.json` — six reusable page templates and representative frames.
- `assets.json` — stable references to approved local images and documents.

## Binding handoff

- Page families: `../page-families/PAGE-FAMILY-COMPONENT-MATRIX.md`
- Responsive/RTL/states: `../page-families/RESPONSIVE-RTL-STATE-SPEC.md`
- CMS mapping: `../page-families/CMS-CONTENT-MAPPING.md`
- Admin behavior: `../ADMIN-CMS-FUNCTIONAL-SPEC.md`
- Motion/graph: `../MOTION-GRAPH-HANDOFF.md`

## Agent rules

- Never create a route, field, fact, CTA destination, metric, or translation
  that is absent from its authority source.
- Render only published locale-specific CMS projections.
- Use semantic components and tokens; do not slice mockups into UI images.
- Keep all content readable without JavaScript. Graph, motion, lightbox, filters,
  and 3D are progressive enhancement.
- Implement Light and Dark from the same component anatomy. RTL changes logical
  direction and alignment, not source order or graph meaning.
- Treat `empty`, `no-results`, `error`, and `unavailable-translation` as distinct
  states.

## Figma Lite

The free local builder is in `figma-plugin/`. It creates visual documentation
from this contract and does not replace it. See its README for three import
steps.

Before implementation, run
`node Assets/site-redesign/implementation-reference/agent-kit/validate.mjs`
from the repository root. It fails on missing assets, authority drift, an
unexpected component/template count, or a network-enabled builder.
