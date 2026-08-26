# Personal Platform Experience Redesign

> Canonical implementation planning has moved to
> `Assets/site-redesign/implementation-reference/`. This folder remains the
> design-history and evidence source; future agents start from the asset-pack
> reference entry point.

Status: **quality-audited design package complete** (2026-08-25).

This folder is the handoff package for the new public experience. It is a
proposal for the next design generation and does not silently change the live
IA, current routes, or published content.

## Primary visual target

- `visuals/home-light-concept-v3-final.png` — the Light Editorial Home.
- `visuals/home-dark-concept-v3-final.png` — the Dark Scientific Atlas Home.

The two images describe one product, not two visual directions. Layout,
hierarchy, components, and content order stay the same; theme tokens change
surface, contrast, illumination, and depth.

The final Home concepts remove invented venues, years, credentials, metrics, and
contact data. Known titles are limited to owner-provided/source-visible records;
explicitly labelled empty slots remain design placeholders. No mockup is content
authority: the implementation must render only approved CMS records.

## Coverage concepts

- `visuals/language-gateway-dark-concept-v1.png` — separate explicit language
  entry route.
- `visuals/home-mobile-fa-light-concept-v1.png` — Persian RTL mobile
  recomposition, not a scaled desktop page.
- `visuals/project-detail-fa-dark-concept-v1.png` — evidence-oriented project
  detail template with a sanitized-data disclosure.
- `visuals/blog-detail-fa-light-concept-v1.png` — independent Persian long-form
  Blog template and its coral editorial identity.
- `visuals/admin-graph-editor-dark-concept-v1.png` — Phase 1 2D graph editor,
  validation, versioning, and public-preview boundary.

The earlier `home-*-concept-v1.png` and `home-*-concept-v2-safe.png` pairs remain
only as design history and are superseded by the v3 final pair.

Because these are generated art-direction images, minor glyph rendering and
microcopy spacing are illustrative. Native implementation must use the named
fonts, CMS copy, logical RTL layout, and measured component tokens rather than
pixel-copying raster text.

## Documents

- The overall experience and design-system decision is in
  `../superpowers/specs/2026-08-25-personal-platform-experience-redesign.md`.
- Admin and CMS behavior is in `ADMIN-CMS-FUNCTIONAL-SPEC.md`.
- Motion, interaction, and graph behavior is in `MOTION-GRAPH-HANDOFF.md`.
- The scored review, corrections, and evidence limits are in
  `QUALITY-AUDIT-v2.md`.
- The implementation-ready logo/art/concept pack, source links, prompt log,
  crop/alt guidance, and integrity hashes are in
  `../../Assets/site-redesign/README.md`.

## Working rule

All index and Home surfaces show previews. Every substantial entity may have a
canonical independent detail page. Whether a record receives a public detail
page is controlled by its publication state and `detail_enabled`; empty shells
and invented placeholder pages are forbidden.
