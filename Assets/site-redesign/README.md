# Taha Personal Platform — implementation asset pack

Status: **design handoff / owner review**, 2026-08-25. These files are stored in
the project for implementation. They are not evidence that the redesigned
frontend or any CMS record is live.

## 1. Folder contract

| Folder | Meaning | May be served directly? |
|---|---|---|
| `brand/` | Exact derivatives of the existing owner logo | Yes, after route/theme QA |
| `art/` | Standalone, text-free generated artwork | Only after owner approval and responsive optimization |
| `concepts/` | Art-direction references for layout and interaction | No; rebuild as native components |

The generated images contain no intended UI copy, logo, CV claim, contact data,
employer data, or real project data. Text visible in the concept screenshots is
illustrative only; the CMS remains the only source for publishable content.

## 2. Brand assets

| File | Source and authority | Intended use | Constraint |
|---|---|---|---|
| `brand/taha-mark-primary.png` | Exact byte copy of `apps/web/public/logo.png` | Header, footer, gateway brand mark | Do not redraw, recolor, stretch, or add effects without owner approval |
| `brand/taha-mark-favicon.png` | Exact byte copy of `apps/web/public/favicon.png` | Browser/app icon fallback | Keep square; verify 16/32/48/64 px rendering |

There is no verified native SVG of the current owner mark in the inspected
project. `apps/web/public/favicon.svg` contains a different `TM` text mark and is
therefore excluded. An auto-trace or hand-built imitation would change the
geometry and is not an acceptable substitute. If SVG is required, request the
original vector source from the logo designer/owner and compare it visually
against `taha-mark-primary.png` before replacing the PNG.

## 3. Standalone artwork

| File | Primary role | Crop / focal guidance | Accessibility guidance | State |
|---|---|---|---|---|
| `art/portal-orbit-dark.png` | Dark language gateway or Home hero atmosphere | Prefer `object-position: 72% 50%`; preserve the right arch and left negative space | Decorative when paired with adjacent heading: empty `alt` | Candidate approved for integration |
| `art/portal-orbit-light.png` | Light companion for gateway/Home | Prefer `object-position: 74% 50%`; preserve arch and orbit center | Decorative when paired with adjacent heading: empty `alt` | Candidate approved for integration |
| `art/project-data-architecture.png` | Research/project preview or detail hero | Center crop; keep cube cluster and database cylinder together | Describe only if it carries meaning beyond the project title | Candidate approved for integration |
| `art/blog-coral-stairs.png` | Blog preview and editorial landing artwork | Center-right focal crop; the figure is anonymous and is not Taha | `Abstract coral arch and stairs with an anonymous figure` when content-bearing | Candidate approved for integration |
| `art/learning-sage-library.png` | Learning preview/library landing artwork | Center crop; keep arch, sphere, and book forms | `Sculptural green and ivory library forms` when content-bearing | Candidate approved for integration |
| `art/gallery-ivory-forms.png` | Gallery preview/collection placeholder | Center crop; retain violet form and turquoise glass plane | `Ivory geometric gallery installation with violet and turquoise forms` when content-bearing | Candidate approved for integration |

Generated artwork is project-specific visual material produced with OpenAI's
built-in image generation. It has no external stock-source URL. The exact prompt
and generation/edit mode are recorded in `PROMPTS.md`. Owner review is still
required before public publication.

### Delivery rule

The PNG files are masters, not a performance strategy. During frontend
implementation:

1. preserve the master PNG unchanged;
2. generate AVIF and WebP derivatives at roughly 800, 1200, and 1600 px widths;
3. use responsive `srcset`/`sizes` and retain PNG only as a fallback where needed;
4. preload only the actual LCP hero for the chosen theme; lazy-load preview art;
5. retain a CSS/color fallback when images or motion are unavailable;
6. re-check Light/Dark contrast with real copy over the final crop.

## 4. Concept references

The seven files in `concepts/` are convenience copies of the authoritative P14
references in `docs/design-redesign/visuals/`:

- matching Light/Dark Home v3 finals;
- separate language gateway;
- Persian RTL mobile Home;
- Persian project detail;
- Persian long-form Blog detail;
- Phase 1 admin 2D graph editor.

They must not be sliced into production UI. Rebuild the design with semantic
components, CMS fields, real typography, logical RTL properties, accessible
focus states, reduced-motion fallbacks, and data-driven SVG/WebGL graph output.

## 5. Official dependency sources

These links are implementation sources, not bundled binaries in this pack.
Pin versions and retain each upstream license when the frontend task adopts
them.

| Dependency | Proposed role | Official source | License noted upstream |
|---|---|---|---|
| Newsreader Variable | English display | <https://github.com/productiontype/Newsreader> | SIL OFL 1.1 |
| Inter Variable | English body/UI and technical labels | <https://github.com/rsms/inter> | SIL OFL 1.1 |
| Estedad Variable | Persian display | <https://github.com/aminabedi68/Estedad> | SIL OFL 1.1 |
| Vazirmatn Variable | Persian body/UI | <https://github.com/rastikerdar/vazirmatn> | SIL OFL 1.1 |
| Lucide | Interface icons only; brand marks remain custom | <https://lucide.dev/> | ISC; some inherited Feather icons are MIT |

Only two font families are active for a locale: Newsreader + Inter for English,
Estedad + Vazirmatn for Persian. Fonts should be self-hosted after license and
subset review; do not introduce a third active UI font for decoration.

## 6. Inspiration links — reference only

No image, logo, CSS, code, or 3D model was copied from these sites. They remain
visual-behavior references supplied by the owner:

- <https://www.apple.com/>
- <https://www.spacex.com/>
- <https://benjamincreative.me/>
- <https://www.awwwards.com/sites/benjamin-hoang>
- <https://mattchansky.com/>
- <https://vanlent.dev/>
- <https://nicoborja.com/#/nico>
- <https://haoqi.design/>

## 7. Dynamic visuals that should not be static assets

- The research/career graph is CMS data rendered as accessible SVG plus an
  optional progressive Three.js layer. Its nodes, edges, groups, weights, and
  visibility come from the graph schema; no raster graph is authoritative.
- Timeline, theme illumination, cursor response, and GSAP sequences are runtime
  behavior. Their rules are documented in
  `docs/design-redesign/MOTION-GRAPH-HANDOFF.md`.
- CTA labels, Home order, selected projects, preview records, and alt text remain
  admin/CMS-managed within the locked design-system boundaries documented in
  `docs/design-redesign/ADMIN-CMS-FUNCTIONAL-SPEC.md`.

## 8. Reviewed owner assets not promoted into this pack

The six 2048×2048 Gemini mascot sprite sheets under
`Assets/کاراکتر های کارتونی/` were visually reviewed and left untouched. They
are **not approved implementation assets** for the current PhD-focused public
experience because:

- the red-hoodie cartoon language competes with the serious academic first
  impression and the turquoise/gold system;
- headphones, face details, proportions, and props vary across sheets;
- several cells contain generated text, UI fragments, or a third-party Apple
  logo;
- they are composite sprite sheets, not clean transparent single-state assets;
- the character has not been confirmed as an owner likeness or an approved
  symbolic mascot.

They may be revisited for optional Blog reactions, empty states, or a playful
sub-experience only after a separate mascot brief, consistent model sheet,
single-pose transparent exports, rights/content cleanup, and owner approval.

The three older `Assets/exec-*.png` page mockups are also not promoted: they
contain superseded layout direction and/or invented claims/contact/publication
content. The P14 v3 final pair is the only Home art-direction authority.

## 9. Integrity

`MANIFEST.md` records dimensions and roles. `SHA256SUMS.txt` records every
binary asset in this pack at handoff. If a file is
re-generated, edited, recompressed, or replaced with an original SVG, update its
source note, approval state, prompt/history where applicable, dimensions, and
hash in the same change.
