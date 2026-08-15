# ADR-0018: P1 design, hydration and font minimum

**Status:** Proposed.  
**Date:** 2026-08-14

## Context

`docs/design.md` is a broad design system; the R2 (P1) release needs only the
minimum visual/hydration/font decisions to ship a safe bilingual landing without
blocking on later phases.

## Decision

- Colors use only the frozen `design.md` palette: Navy foundation, Turquoise
  primary, Gold signature, with the documented contrast rules. No new gradient,
  glow or color token is invented for R2.
- Surfaces are solid-first; selective glass is limited to the Language Gateway
  central panel if at all, with an opaque elevated-surface fallback.
- Typography uses the self-hosted, minimal-weight bilingual pair selected in
  ADR-0019; later font changes require a new specimen review and decision.
- The logo is an approved asset or a text mark only; no geometry is invented.
- Hero/landing has no heavy motion, canvas, WebGL, D3, GSAP or Three.js; any
  SVG/CSS enhancement is non-blocking with a no-motion/no-JS fallback.
- Dark mode, the full mascot system, complex motion and a broad component
  library are out of R2 scope and deferred with IDs.

## Consequences

- R2 can be visually complete and fast without a client bundle.
- The remaining owner-dependent design item is the final logo asset; the font
  family is explicit in ADR-0019 rather than guessed.
- Later phases add islands/motion/dark mode only after the corresponding
  approved, tested slice.
