# Public page-family visual atlas

Status: **visual atlas reviewed / implementation handoff ready**.

This folder extends the approved P14 Home direction across the remaining public
page families. The PNG concepts are layout and art-direction references. They
are not production screenshots, CMS content, route authority, or a source from
which UI controls should be sliced.

## Visual authority

- Light Editorial: `Assets/site-redesign/concepts/home-light-concept-v3-final.png`
- Dark Scientific Atlas: `Assets/site-redesign/concepts/home-dark-concept-v3-final.png`
- Long-form detail: `Assets/site-redesign/concepts/blog-detail-fa-light-concept-v1.png`
- Evidence detail: `Assets/site-redesign/concepts/project-detail-fa-dark-concept-v1.png`
- Production register: `PRODUCTION-REGISTER.md`
- Route and component matrix: `PAGE-FAMILY-COMPONENT-MATRIX.md`
- Responsive, RTL, state, and motion specification:
  `RESPONSIVE-RTL-STATE-SPEC.md`
- CMS and admin-panel mapping: `CMS-CONTENT-MAPPING.md`
- Figma decision: `FIGMA-DECISION.md`
- Scored visual-atlas audit: `QUALITY-AUDIT.md`

## Delivery boundary

- Use native HTML/CSS/SVG/WebGL and CMS data for production UI.
- Preserve `/writing/`, `/creative/`, and `/teaching/` as current canonical
  routes unless a later IA/ADR explicitly migrates them.
- Use owner-approved/source-visible content only. Neutral structural labels and
  `Awaiting approved CMS copy` are the only permitted mock-content substitutes.
- The exact owner mark stays a separate brand asset; generated screens do not
  redefine its geometry.
- The unmanaged `Assets/site-redesign/others/` folder is outside this atlas.

## Review rule

Every PF frame must be inspected directly for hierarchy, visual-family fit,
clipping, malformed text, accidental claims, privacy leakage, and realistic
implementation structure before it can move from `Generated` to `Reviewed`.

All eight PF frames are reviewed art-direction references. Runtime browser,
accessibility, performance, CMS integration, route, and production validation
remain separate implementation gates.
