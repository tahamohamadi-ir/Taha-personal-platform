# Component Playground and Visual Atlas — master specification

## 1. Goal

Build the next public frontend from a code-first Design System so multiple
agents can implement and review the same visual language without guessing from
raster concepts. The result must support the PhD-focused academic journey,
professional/industry evaluation, independent Gallery, Writing/Blog and
Learning areas, full locale parity, CMS-managed content, and an optional
interactive research/career graph.

The Component Playground/Visual Atlas is a local development surface using the
same production components and tokens. It is never a second component library,
never a public content source, and never included in a default production build.

## 2. Architecture decision

### Source of truth

```text
repository contracts
  → runtime CSS tokens
  → native Astro/React components
  → local Component Playground/Visual Atlas
  → automated screenshots and accessibility checks

machine-readable agent kit ───────────────┘
approved media assets ────────────────────┘

Figma and raster concepts = review/reference only
```

The atlas is injected only when `DESIGN_ATLAS=1`. Default `astro build` must not
contain `/_design/`, atlas fixtures, or atlas navigation. The atlas imports the
actual shared components; it does not copy their markup.

### Technology boundary

- Existing public stack: Astro, TypeScript, Tailwind v4, React islands.
- Existing installed-but-bounded motion/visual libraries may be activated only
  by the separately approved task that owns their runtime use.
- Public content remains semantic and readable without JavaScript.
- React is limited to interactive islands; Astro remains the public shell.
- No Storybook, design SaaS subscription, or new service is required.

## 3. Users and primary journeys

1. **Potential PhD supervisor:** language → identity/research fit → directions →
   publications/projects → academic CV/contact.
2. **Academic reviewer:** research → publication or evidence detail → methods,
   limitations, files and related outputs.
3. **Industry reviewer:** identity → selected sanitized work → contribution and
   systems experience → industry CV/contact.
4. **Reader:** Writing index → independent long-form post → series/archive.
5. **Learner:** Learning index → guide/path detail → resources and references.
6. **Creative viewer:** Gallery → visual-work detail → ordered media, process,
   credits and licence.

## 4. Canonical public structure

Primary navigation labels may be localized, but canonical route families stay
owned by the IA contract. The intended main navigation is:

- About
- Research, with Publications as a child destination
- Projects
- Gallery (`/{locale}/creative/`)
- Blog (`/{locale}/writing/`; `/blog/**` remains redirect-only)
- Learning (`/{locale}/teaching/`)

CV, Contact, locale and theme are utility actions. `/` remains a separate
language gateway. Every meaningful published record may have an independent
detail URL only when locale, body, privacy, rights and route gates pass.

## 5. Home composition

Default narrative order:

1. concise PhD-focused identity lead;
2. interactive relationship graph plus semantic linked-list equivalent;
3. research interests and Research Fit;
4. Architecture → Visual Design → Software → Data → AI journey;
5. selected sanitized projects and outputs;
6. selected verified academic publications/outputs;
7. independent Gallery, Blog and Learning previews;
8. collaboration, CV and Contact close.

CMS may hide/reorder approved modules within guardrails and select featured
records. It may not change typography, semantic color roles, component anatomy,
focus behavior, grid, motion limits, or accessibility states.

## 6. Design System

### Themes

- **Light Editorial:** warm ivory canvas, mineral-white surfaces, navy ink,
  turquoise action, scarce gold signature.
- **Dark Scientific Atlas:** deep navy canvas, royal raised surfaces, warm ivory
  ink, turquoise identity/action, restrained gold and contextual violet,
  emerald or coral.
- Themes change tokens, illumination and depth—not DOM anatomy or content.
- Glass is restricted to the Language Gateway panel and sticky Header.

### Type

- English display/body target: Newsreader + Inter.
- Persian display/body target: Estedad + Vazirmatn.
- Maximum two active families per locale.
- Body minimum 16px; Latin body line-height 1.6; Persian 1.9.
- Prose measure approximately 62ch; headings are never justified.

### Components

`agent-kit/components.json` defines 24 core components and shared states. Every
interactive component has rest, hover, focus-visible, active/selected where
applicable, disabled only for a real unavailable action, loading with stable
geometry, error recovery, and reduced-motion behavior.

### Responsive and direction

Required check widths: 320, 390, 768, 1024, 1280 and 1440 CSS px. Use logical
properties. Do not reverse DOM order for RTL. Logo and meaning-bearing graph
topology do not mirror. Directional travel icons flip; mail, download, external,
search and status icons do not.

## 7. Component Playground/Visual Atlas

The local atlas must contain:

- foundations: colors, type, spacing, radii, borders, shadows, focus and motion;
- every component and essential variant/state;
- Light/Dark and LTR/RTL controls;
- width controls for the six required viewport checks;
- six page-template specimens;
- representative desktop Light, desktop Dark, Persian RTL mobile, tablet
  reflow and state sheet;
- default/reduced-motion comparison;
- asset inventory with role, crop, alt and approval state;
- CMS fixture source labels and a visible warning that fixtures are unpublished;
- automated stable selectors for Playwright screenshots.

Atlas fixtures live outside public content loaders. They contain no real
private contact data, invented academic facts or production publication state.

## 8. CMS and admin boundary

Editors manage locale copy, publication, order, selected records, media, CTA
route choices, graph nodes/edges, timeline records and safe component presets.
Code locks token packs, component structure, allowed variants, route families,
accessibility behavior and validation.

The admin roadmap includes:

- Home module composition and transparent manual/rule/hybrid selection;
- 2D graph authoring with nodes, edges, groups, pan/zoom, validation, versions,
  two-locale/two-theme preview and semantic-list preview;
- later 3D preview/output using the same payload and a required 2D/list fallback;
- media rights, alt/caption, crop/focal point and usage validation;
- Light/Dark, desktop/mobile, RTL/LTR, reduced-motion and no-JS preview gates;
- future single-tenant white-label Brand Profile with versioned token packs,
  enabled modules and no arbitrary CSS/JS injection.

Before CMS schema work, an agent must compare this reference with actual models,
admin endpoints and migrations. Missing fields are gaps, not permission to
invent an endpoint or migrate data.

## 9. Accessibility and progressive enhancement

- WCAG 2.2 AA target; text 4.5:1, large text/non-text UI 3:1.
- Visible focus in both themes and over allowed glass/media.
- Minimum target 44×44px except an already documented narrow-width exception.
- Meaning never depends on color, glow, hover or position alone.
- Graph always has a semantic list; filters/pagination have ordinary URLs;
  carousel never auto-advances; lightbox retains figure links; timeline never
  gates content; contact preserves fields on failure.
- Reduced motion removes transforms, forced orbit and camera travel.

## 10. Content and privacy

- No invented biography, metrics, venues, citations, dates, employer/client
  disclosures, URLs or translations.
- Projects expose only published sanitized projections and demo/synthetic data.
- Academic email may be public when approved. Phone and personal Gmail are not
  public fields.
- Blog is editorially independent from Projects.
- Empty sections are omitted in production; atlas-only empty examples are
  explicitly labelled fixtures.

## 11. Deliverables

1. Runtime dual-theme token contract and implementation.
2. Core component library with tests.
3. Header/footer/gateway and shared templates.
4. All index/detail families migrated to shared templates.
5. Local-only Visual Atlas and deterministic screenshots.
6. CMS projection/preview alignment without content loss.
7. Phase 1 graph; Phase 2 3D only after its gate.
8. Accessibility, RTL, no-JS, performance and production adoption evidence.
9. Reconciled owner documents listed in `DOCUMENT-MIGRATION-MAP.md`.

## 12. Non-goals

- A pixel replica of generated screenshots.
- A Figma-first workflow.
- A public page builder or arbitrary editor styling.
- Fake content to make layouts look complete.
- New runtime services, deployment, migrations or production publication as
  part of this reference-package task.

