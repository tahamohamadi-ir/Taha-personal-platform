# Taha Personal Platform — Public Page-Family Visual Atlas

**Status:** OWNER REVIEW REQUIRED  
**Date:** 2026-08-25  
**Parent direction:** `2026-08-25-personal-platform-experience-redesign.md`

## 1. Decision

Extend the approved Light Editorial / Dark Scientific Atlas system through a
small number of reusable page families. Do not design every route as a unique
composition. Produce eight additional high-fidelity concepts, reuse the two
approved detail concepts, and document all repeated states that do not justify
another full-page image.

The target is a coherent implementation reference, not a gallery of unrelated
screens. Academic evidence remains the primary hierarchy; expressive visual
work demonstrates design capability without reducing readability or trust.

## 2. Visual deliverables

The eight new concepts are:

1. **Creative/Gallery index — Light Editorial**
   - editorial collection lead;
   - asymmetric but orderly masonry/grid preview;
   - medium, year, role, and collection filters;
   - featured work and accessible non-JavaScript list fallback.
2. **Creative/Gallery detail — Dark Scientific Atlas**
   - full-bleed visual lead;
   - work context and role;
   - captioned sequence, process strip, credits/licence, and related work;
   - lightbox affordance with keyboard/focus/reduced-motion requirements.
3. **Writing/Blog index — Light Editorial with coral identity**
   - independent editorial identity;
   - featured essay, recent writing, topic/series filters, archive, and RSS;
   - personal, political, social, technical, and memoir content may coexist;
   - no automatic relationship to projects.
4. **Projects index — Dark Scientific Atlas**
   - selected evidence first, then a restrained project catalogue;
   - filters for type/topic/status without dashboard-like density;
   - sanitized/confidentiality labels and explicit case-study availability;
   - no invented outcomes or metrics.
5. **Research + Publications index — Light Editorial**
   - research-fit statement, interests, outputs, and publication rows;
   - venue/year/DOI only when published by the CMS;
   - publications retain their independent canonical detail route;
   - graph relationships appear as a supporting navigation device.
6. **Teaching/Learning index — Dark Scientific Atlas with sage identity**
   - learning paths, notes, tutorials, resources, and course previews;
   - level, prerequisites, format, and progress are descriptive metadata, not
     visitor tracking;
   - empty states are honest when no approved item exists.
7. **About + CV narrative — Light Editorial**
   - durable identity and research trajectory rather than a project inventory;
   - visual timeline for Architecture → Visual Design → Software → Data → AI;
   - work, education, certificates, skills, and values remain separate groups;
   - each eligible record may link to its own approved detail page.
8. **Contact + collaboration — Dark Scientific Atlas**
   - PhD/research collaboration is the primary action;
   - academic email may be public; Gmail and phone remain absent;
   - LinkedIn, GitHub, and ORCID appear only when owner-approved;
   - contact form is shown only if the real persistence/delivery flow is
     published; otherwise the page uses an honest direct-email path.

Existing visual targets remain authoritative for:

- Home Light/Dark;
- Persian Blog/post detail in Light mode;
- Persian Project/case-study detail in Dark mode;
- Persian mobile Home;
- language gateway;
- admin 2D graph editor.

The new Gallery detail and index/evidence concepts establish enough geometry
to derive Light/Dark companions without generating every permutation.

## 3. Current canonical route boundary

The design may use visitor-facing labels such as Blog, Gallery, and Learning,
but implementation must preserve the current canonical routes until an IA/ADR
explicitly changes them.

| Visitor concept | Current canonical route | Detail route |
|---|---|---|
| Blog | `/{locale}/writing/` | `/{locale}/writing/{slug}/` |
| Gallery / creative work | `/{locale}/creative/` | `/{locale}/creative/{slug}/` |
| Learning / teaching | `/{locale}/teaching/` | `/{locale}/teaching/{slug}/` |
| Projects | `/{locale}/projects/` | `/{locale}/projects/{slug}/` |
| Research | `/{locale}/research/` | existing typed research routes |
| Publications | `/{locale}/publications/` | `/{locale}/publications/{slug}/` |
| About | `/{locale}/about/` | approved section/detail routes |
| CV | `/{locale}/cv/` | approved downloads and About records |
| Contact | `/{locale}/contact/` | no public message archive |

`/{locale}/blog/**` remains redirect-only. Generated mockup labels do not
authorize a route migration, sitemap change, canonical change, or feed change.

## 4. Reusable page templates

### 4.1 Collection index

Used by Projects, Creative/Gallery, Research, Publications, and Learning.

- breadcrumb/section identity;
- concise statement and one primary action;
- one featured record only when editorially selected;
- URL-addressable filters and sort;
- semantic list/grid with real links;
- pagination that works without JavaScript;
- honest empty/no-result/error states;
- related collection or contact close.

Variation comes from content density and media, not a new component system.

### 4.2 Editorial index

Used by Writing/Blog and Learning notes.

- featured story or path;
- recent items as a readable list, not a card wall;
- topics, series, archive, RSS or resource taxonomy where real;
- readable dates and reading time derived from content;
- no invented popularity, likes, views, or engagement metrics.

### 4.3 Long-form detail

Used by Blog posts, Learning notes, publication explanations, and selected
research statements.

- 60–70 character reading measure;
- cover/title/summary/metadata;
- optional sticky table of contents on wide viewports and in-flow TOC on mobile;
- semantic heading ladder, quotes, media, code, footnotes, citations, and
  downloads;
- related items selected by CMS, never inferred from similar words alone;
- print-friendly and no-JavaScript readable.

Learning adds objectives, prerequisites, difficulty, and resources. Blog does
not inherit those fields. Publication pages add citation/export/identifier
metadata only when verified.

### 4.4 Evidence/case-study detail

Used by Projects, research outputs, work history, education, certificates, and
substantial About records.

- problem/context;
- role and contribution;
- approach/process;
- outputs or artifacts;
- limitations/confidentiality;
- reflection and next direction;
- sanitized media and related records.

No client-sensitive data, operational metrics, private documents, or implied
endorsements appear. An entity without meaningful detail remains preview-only.

### 4.5 Visual-work detail

Used only when media is the primary evidence.

- visual lead and caption;
- medium/year/role/context;
- sequence/process/before-after blocks;
- credits/licence/alt text;
- keyboard-safe lightbox enhancement;
- related creative works.

## 5. Shared anatomy and state model

All page families share:

- header, language popover, theme toggle, breadcrumb, locale availability,
  section lead, metadata, filters, pagination, related content, contact CTA,
  and footer;
- rest, hover, focus-visible, active, disabled, loading, empty, no-results,
  recoverable error, unavailable-translation, and reduced-motion states;
- one primary action per viewport;
- real links for canonical navigation and progressive enhancement for filters,
  media viewers, graph exploration, and carousels.

Skeletons are allowed only during client-enhanced transitions; server-rendered
public pages should return content or an honest state rather than permanent
skeleton UI.

## 6. Responsive and bilingual composition

Desktop concepts show hierarchy, but implementation is defined at 320, 390,
768, 1024, 1280, and 1440 CSS pixels.

- desktop uses a maximum 1280px content shell and 12-column grid;
- tablet uses 8 columns and moves sticky side content into compact bands;
- mobile uses 4 columns and a single reading flow;
- filters collapse into a labelled disclosure, never an unlabeled icon;
- horizontal timelines become vertical sequences;
- gallery grids become one strong lead plus a stable list/grid;
- long-form TOC enters the document flow;
- all directional icons flip in RTL;
- Latin identifiers inside Persian content use `<bdi>`/LTR isolation;
- English and Persian content/status/slug/SEO remain independent.

The mobile design is recomposed, not a proportionally scaled desktop image.

## 7. Color and visual-family rules

- Turquoise is the global action/identity color.
- Antique gold is scarce and never a normal button fill.
- Coral identifies Writing/Blog.
- Sage/emerald identifies Learning and health-related context.
- Violet identifies language/NLP/research context.
- Royal/deep navy anchors Dark mode.
- At most three accent hues are prominent in one viewport.
- Meaning is always reinforced by labels, symbols, or structure.
- Glass is limited to gateway/header/selected overlays with opaque fallbacks.
- Similar page families preserve geometry between Light and Dark modes.

The generated concepts are visual direction. Production components must use
the binding token contract and measured contrast states.

## 8. Motion and interaction

- page entrance: restrained opacity/transform choreography, never required for
  reading;
- collection items: border/shadow/color response with focus parity;
- gallery: cross-fade or spatial transition only after explicit activation;
- graph: 2D semantic SVG first, optional WebGL/Three.js depth second;
- timeline: progressive reveal tied to visibility, with a fully visible
  reduced-motion state;
- pointer glow/parallax is decorative, desktop-only, bounded, and disabled for
  coarse pointers or reduced motion;
- no scroll-jacking, mandatory horizontal scrolling, or hidden navigation.

## 9. CMS and admin requirements

Editors may manage:

- section visibility and order;
- featured selections and date windows;
- preview copy/media;
- tags, series, collection, and taxonomy;
- related records;
- graph nodes, edges, groups, visual roles, and content links;
- timeline entries and relationships;
- CTA label/target from an allowlisted route/content picker;
- locale-specific SEO, slug, publication status, and social image;
- detail-page enablement and structured content blocks.

Editors may not manage arbitrary colors, fonts, spacing, CSS, component
anatomy, animation code, accessibility behavior, or raw HTML/JavaScript.

Every substantial record may have an independent URL only when detail is
enabled, the locale is published, the slug is valid, meaningful detail exists,
and the public projection is safe.

## 10. Mock-content integrity

- Use only owner-approved/source-visible names and titles.
- Otherwise use visible labels such as `Placeholder` or `Awaiting approved CMS
  copy`.
- Do not invent institutions, degrees, positions, employers, collaborators,
  venues, dates, metrics, evaluations, links, or contact values.
- Placeholder visuals demonstrate layout only and never create a route,
  structured-data entity, feed item, search result, or publication claim.

## 11. Figma decision rubric

### Images + documentation are sufficient when

- one implementation agent owns the frontend;
- shared anatomy/tokens/states are written precisely;
- visual concepts cover each unique page family;
- responsive behavior is specified rather than manually drawn at every width;
- the implementation will be validated in the browser against the references.

### A bounded Figma file adds value when

- a human designer and developer need inspectable spacing and components;
- several agents/developers work in parallel;
- component variants and prototype transitions need a shared visual source;
- owner review benefits from clickable page-to-page flows;
- the implementation requires a durable design-library handoff beyond this
  project.

### Recommended decision

Do **not** recreate every route in Figma. After the eight concepts are approved,
create Figma only if the scorecard below shows material handoff value. The
recommended maximum is **Figma Lite**:

1. Foundations: Light/Dark tokens, typography, grid, spacing, icons.
2. Components: roughly 20–30 core components and relevant states.
3. Templates: Home, Collection index, Long-form detail, Evidence detail,
   Gallery detail, About/CV.
4. Responsive references: one desktop and one mobile frame for the most complex
   index and detail templates, including one Persian RTL frame.
5. Prototype: language gateway → Home → Research/Project → Contact.

Figma must not become a second CMS, a complete content archive, or a duplicate
of every Light/Dark/locale/page permutation.

## 12. Acceptance checklist

- Eight new concepts match the approved Home system.
- Existing Blog and Project detail concepts remain compatible.
- Every requested content family maps to an index/detail template.
- Current canonical routes are stated correctly.
- Blog is independent from Projects.
- Light/Dark structure and meaning remain identical.
- Desktop, mobile, RTL, keyboard, reduced motion, empty, error, and translation
  states are specified.
- CMS-managed content is separated from locked design-system behavior.
- No invented personal or academic facts appear.
- Figma recommendation is limited, testable, and justified by handoff value.

