# Personal Platform Experience Redesign

Status: **visual direction ready for owner review** (2026-08-25).

This folder is the handoff package for the new public experience. It is a
proposal for the next design generation and does not silently change the live
IA, current routes, or published content.

## Visual target

- `visuals/home-light-concept-v1.png` — the light editorial mode.
- `visuals/home-dark-concept-v1.png` — the dark scientific-atlas mode.

The two images describe one product, not two visual directions. Layout,
hierarchy, components, and content order stay the same; theme tokens change
surface, contrast, illumination, and depth.

Generated words, project names, publication names, metrics, dates, and contact
details inside the images are visual placeholders only. They are never content
authority and must not be published without an approved CMS record.

## Documents

- The overall experience and design-system decision is in
  `../superpowers/specs/2026-08-25-personal-platform-experience-redesign.md`.
- Admin and CMS behavior is in `ADMIN-CMS-FUNCTIONAL-SPEC.md`.
- Motion, interaction, and graph behavior is in `MOTION-GRAPH-HANDOFF.md`.

## Working rule

All index and Home surfaces show previews. Every substantial entity may have a
canonical independent detail page. Whether a record receives a public detail
page is controlled by its publication state and `detail_enabled`; empty shells
and invented placeholder pages are forbidden.
