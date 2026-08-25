# Taha Personal Platform — Experience Redesign

**Status:** DESIGN PACKAGE COMPLETE  
**Date:** 2026-08-25  
**Audience priority:** PhD supervisors and academic reviewers first; senior
industry and LinkedIn visitors second.

## 1. Product position

This is not a project portfolio with a biography attached. It is Taha
Mohammadi's bilingual research, professional, and creative platform. Projects
change; the durable story is the progression from architecture and visual
communication through software and data toward human-centered AI.

The experience must communicate three qualities: **creative, professional,
trustworthy**. Academic evidence is primary. Visual sophistication demonstrates
design ability but never competes with claims, publications, CV, or contact.

## 2. Approved visual direction

One component system supports two equal modes:

- **Light Editorial:** warm ivory, mineral white, architectural daylight,
  paper-like calm, navy typography, selective translucent depth.
- **Dark Scientific Atlas:** deep navy, royal surfaces, warm ivory text,
  orbital relationships, restrained glow, and selective glass.

The modes use identical information architecture and component geometry. The
default follows the operating-system preference; a persistent manual toggle is
available. Theme never changes the meaning or availability of content.

Visual references:

- `docs/design-redesign/visuals/home-light-concept-v3-final.png`
- `docs/design-redesign/visuals/home-dark-concept-v3-final.png`

The images are art direction, not content authority.

### 2.1 Visual coverage

The primary Home pair is supplemented by focused concepts for the separate
language gateway, Persian RTL mobile Home, Persian project detail, Persian
long-form Blog, and the admin 2D graph editor. These screens validate the page
family and responsive/locale direction without pretending to be production
screenshots. Their inventory and authority boundary are in
`docs/design-redesign/README.md`.

## 3. Experience architecture

### 3.1 Language gateway

`/` is a separate language-selection screen. It contains the identity mark, a
short neutral line, and two explicit choices: English and فارسی. It never
auto-redirects. On locale pages, language is represented by one compact icon
that opens only real published alternates.

### 3.2 Primary navigation

The public header contains:

1. About
2. Research
3. Projects
4. Gallery
5. Blog
6. Learning

Utilities are theme and language. Search may appear only when a real search
route is shipped. CV and Contact remain high-value actions in the Hero and
closing CTA rather than permanent top-level navigation items.

Research owns a compact submenu: Overview, Research Interests, Research Fit /
Statement, Publications, and Research Outputs. Publications have an independent
canonical page and URL while remaining discoverable under Research.

### 3.3 Home narrative

Home preserves this exact order:

1. Short PhD-focused introduction.
2. Relationship graph.
3. Research interests and Research Fit.
4. Architecture → Visual Design → Software → Data → AI journey.
5. Selected projects and outputs.
6. Selected publications and academic outputs.
7. Independent Gallery, Blog, and Learning previews.
8. Collaboration, CV, and contact invitation.

These eight sections are visually organized as four chapters: Identity,
Research Fit, Evidence, and Creative Knowledge. A quiet sticky chapter index
allows direct navigation. Normal vertical scrolling remains the default; there
is no scroll-jacking or mandatory scroll snapping.

Home is an overview. It never renders complete articles, complete CV entries,
or complete case studies.

## 4. Canonical detail-page rule

Every substantial content record may expose its own independent canonical URL.
Indexes and Home show only a preview. A public detail page is created only when
all of the following are true:

- `detail_enabled` is true;
- the requested locale version is published;
- it has a valid locale-specific slug;
- the detail body contains meaningful content;
- the route does not disclose restricted or sensitive information.

The route plan below is the target proposal. Existing canonical URLs require an
explicit migration/redirect decision before implementation.

| Content family | Index | Detail pattern |
|---|---|---|
| About | `/{locale}/about/` | `/{locale}/about/{section}/{slug}/` |
| Research | `/{locale}/research/` | `/{locale}/research/{type}/{slug}/` |
| Publications | `/{locale}/publications/` | `/{locale}/publications/{slug}/` |
| Projects | `/{locale}/projects/` | `/{locale}/projects/{slug}/` |
| Gallery | `/{locale}/gallery/` | `/{locale}/gallery/{slug}/` |
| Blog | `/{locale}/blog/` | `/{locale}/blog/{slug}/` |
| Learning | `/{locale}/learning/` | `/{locale}/learning/{slug}/` |
| CV | `/{locale}/cv/` | linked About detail records + approved downloads |
| Contact | `/{locale}/contact/` | no public message archive |

The current `/writing/` tree must not be replaced silently. If `/blog/` becomes
canonical, a dedicated IA/ADR task must define permanent redirects, feeds,
canonical tags, sitemap changes, and link migration.

## 5. Page templates

### 5.1 Index template

Used by Research, Projects, Gallery, Blog, Learning, and Publications.

- concise section statement;
- optional taxonomy/filter controls;
- one editorial Featured item;
- scannable preview list;
- honest empty state;
- pagination or load-more that remains navigable without JavaScript;
- locale-correct metadata and independent translation status.

### 5.2 Evidence detail template

Used by projects, research topics, publications, work history, education, and
certificates.

- breadcrumb and entity type;
- title, role, time range, and verified metadata;
- short evidence-oriented summary;
- structured blocks for context, contribution, process, outputs, constraints,
  and reflection;
- sanitized samples, images, diagrams, documents, or external links;
- disclosure labels for simulated/sanitized work;
- related records and a contextual next step.

Sensitive client data, real operational data, private phone numbers, and
unapproved employer details are never exposed.

### 5.3 Long-form template

Used by Blog and Learning.

- reading-width column (approximately 60–70 characters);
- title, summary, published/updated dates, reading time, tags, and cover;
- semantic headings and table of contents for long material;
- rich media, captions, code, footnotes/references, downloads, and related
  material;
- Blog voice may be personal, political, social, technical, or memoir-like;
- Learning adds prerequisites, difficulty, learning objectives, and resources.

Blog content is independent from projects. Relationships are optional editorial
links, never automatic assumptions.

### 5.4 Gallery detail template

- full-bleed visual lead;
- work title, year, medium, role, and context;
- accessible image sequence/lightbox;
- process images, before/after, captions, and optional project statement;
- licensing/credit fields;
- related visual works.

### 5.5 Profile-entry detail template

Each work, education, certificate, volunteer, or significant skill record can
be preview-only or open a dedicated page. The detail page may include role
scope, selected outcomes, sanitized samples, images, technology/context, and
related projects or publications. A timeline entry is never forced to have a
detail page.

## 6. Design system

### 6.1 Token model

Use three layers: primitive → semantic → component. Content editors cannot edit
tokens. Theme mode changes semantic aliases, not component anatomy.

| Role | Light | Dark |
|---|---|---|
| Canvas | `#F7F3EB` | `#050B14` |
| Surface | `#FFFDF8` | `#0B1626` |
| Raised surface | `#F1EBE1` | `#102039` |
| Primary text | `#10243A` | `#F4EFE6` |
| Secondary text | `#526273` | `#AEBAC7` |
| Border | `#D8D0C3` | `#23354A` |
| Turquoise / action | `#087C73` | `#23C7BD` |
| Antique gold / emphasis | `#A77B28` | `#D7AE5B` |
| Violet / language-research | `#6047B8` | `#A88AF2` |
| Emerald / health-context | `#137A62` | `#67B991` |
| Coral / Blog | `#B4493E` | `#F07866` |

These are design targets. All text/background and interaction pairs must pass
contrast validation before code adoption. No viewport should use every accent
at equal weight. Turquoise is primary; gold is scarce; contextual colors are
attached to content families and reinforced by labels or icons.

### 6.2 Typography

- Latin display: Newsreader Variable.
- Latin body/UI: Inter Variable.
- Persian display: Estedad Variable.
- Persian body/UI: Vazirmatn Variable.

Only two type families are active in a locale. Persian headings are not
justified and do not inherit Latin letter spacing. Long-form pages prioritize
reading rhythm over decorative display type.

### 6.3 Layout and density

- desktop: 12-column grid, maximum content width around 1280px;
- tablet: 8 columns;
- mobile: 4 columns and one primary reading flow;
- spacing follows a 4px base with 8/12/16/24/32/48/64/96 semantic steps;
- body text never below 16px; controls target at least 44×44px;
- cards separate standalone objects only; lists use lightweight dividers;
- glass is selective and always has an opaque accessible fallback.

Responsive behavior is recomposition, not proportional scaling:

| Surface | Desktop | Tablet | Mobile |
|---|---|---|---|
| Header | six-item navigation + utilities | compact navigation | menu + one language icon + theme utility |
| Hero | two-column identity/scene | balanced split | one reading flow; scene supports rather than precedes the claim |
| Graph | graph + context panel | graph above details | focused-node map with list toggle |
| Timeline | horizontal milestones | wrapped/compact | vertical sequence |
| Preview grids | 3–5 items | 2–3 items | one primary item; swipe only for homogeneous media |
| Detail pages | reading column + sticky index | reading column + compact index | single column; in-flow table of contents |

### 6.4 Core components

Header, language popover, theme toggle, chapter index, button/link, content
preview card, evidence card, publication row, timeline node, graph node/edge,
tag, metadata row, rich-content blocks, media viewer, related-content group,
empty state, pagination, share/download, contact CTA, footer, and admin preview
badge.

Every interactive component specifies rest, hover, focus-visible, active,
disabled, loading, error, and reduced-motion behavior. RTL uses logical layout
properties and flips directional glyphs.

## 7. Interaction principles

- Core content and navigation remain readable without JavaScript.
- Motion clarifies hierarchy or relationship; it is not required to understand
  content.
- Hover has keyboard focus parity.
- The graph is a progressive enhancement with a semantic 2D fallback.
- Carousels are reserved for homogeneous previews and include buttons, status,
  keyboard access, swipe support, and a non-carousel fallback.
- No horizontal scrolling for primary navigation or prose.

Detailed behavior is specified in
`docs/design-redesign/MOTION-GRAPH-HANDOFF.md`.

## 8. Admin and curation boundary

Editors manage content, section visibility/order, Featured selections, graph
data, timeline items, CTAs, relationships, and Home previews. They cannot alter
typography, arbitrary colors, component structure, accessibility rules, or the
global spacing system.

The complete requirement is in
`docs/design-redesign/ADMIN-CMS-FUNCTIONAL-SPEC.md`.

## 9. Future white-label boundary

The reusable product should support separate single-tenant deployments after
Taha's site is complete. Each deployment has its own database, media, domain,
secrets, identity configuration, and content. A Brand Profile may select from
approved themes, fonts, navigation labels, enabled modules, identity assets,
legal copy, and contact channels. It cannot inject arbitrary CSS or bypass
accessibility/security constraints.

Multi-tenant SaaS, shared customer databases, runtime theme builders, billing,
and arbitrary plugin systems are explicitly out of scope for the first product.

## 10. Performance and accessibility targets

- target LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 on representative production pages;
- ship static content first and hydrate only interaction islands;
- lazy-load noncritical graph/media code and pause animation when off-screen;
- support keyboard, screen readers, 200% zoom, RTL/LTR, high contrast, and
  `prefers-reduced-motion`;
- provide descriptive alternative text and captions for meaningful media;
- never encode a research relationship or status by color alone.

Static token preflight on the proposed Canvas pairs produced these contrast
ratios: Light primary `14.21:1`, Light secondary `5.66:1`, Light action
`4.58:1`, Dark primary `17.23:1`, Dark secondary `10.00:1`, Dark action
`9.37:1`, and Dark gold `9.48:1`. These pass normal-text AA for the tested
pairs. Component-level hover/focus/disabled combinations still require measured
implementation QA; the preflight is not a blanket accessibility certification.

## 10.1 Mock-data and claim integrity

- Public-facing identity and evidence visuals may use only
  owner-provided/source-visible titles or an explicit `Placeholder` /
  `awaiting approved CMS copy` label. Admin-only concepts may use clearly
  generic interface mock records but never present them as approved content.
- A visual must not invent degrees, candidate status, institutions, employers,
  venues, publication years, metrics, collaborators, evaluation results, or
  contact channels.
- The public site never reads copy from design files. Only published,
  locale-specific CMS records are renderable.
- Placeholder slots demonstrate density and component behavior; they never
  create a route, sitemap entry, feed item, structured-data entity, or search
  result.

## 11. Acceptance criteria for the design phase

- Light and Dark v3 Home concepts visibly share one layout and component system.
- Home follows the approved eight-part order and stays preview-first.
- Canonical detail-page rules cover every requested content family.
- The admin boundary separates content control from locked design control.
- Graph Phase 1 and Phase 2 share one durable data model.
- Generated mockup copy is explicitly non-authoritative.
- Any implementation that changes existing canonical routes first receives an
  IA/ADR migration decision.
- A Persian RTL mobile composition, a canonical detail template, an independent
  long-form template, and the Phase 1 admin graph editor have visual evidence.
- The quality audit records an evidence-bounded score above the owner-requested
  `9.8/10` design-package threshold without claiming runtime validation.
