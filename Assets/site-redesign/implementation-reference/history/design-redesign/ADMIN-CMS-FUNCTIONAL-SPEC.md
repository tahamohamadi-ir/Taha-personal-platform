# Admin and CMS Functional Specification

**Status:** proposed for implementation planning  
**Primary actor:** owner/editor  
**Secondary future actor:** trusted collaborator with limited permissions

## 1. Product boundary

The admin controls content and curation. It does not expose a free-form website
builder. Typography, component anatomy, spacing scale, accessibility rules, and
semantic color roles are locked by the Design System.

## 2. Universal content record

Every content family uses a shared editorial contract with type-specific fields.

### Identity and routing

- immutable internal ID;
- content type;
- locale-independent relationship key;
- independent Persian and English title, slug, excerpt, body, SEO, and status;
- canonical route preview;
- `detail_enabled`;
- parent/index destination;
- redirect history after a slug change;
- publication visibility and audience.

### Lifecycle

- draft, in review, scheduled, published, archived;
- author/editor, created, updated, published, and scheduled timestamps;
- optimistic concurrency and revision history;
- diff, restore, duplicate-as-draft, and audit trail;
- preview token with expiry and revocation;
- translation health without silent locale fallback.

### Editorial presentation

- preview title and excerpt;
- hero/cover media and focal point;
- list thumbnail;
- tags, topics, content collections, and relations;
- Featured state, rank, start/end window, and placement;
- CTA label and destination selected from valid routes;
- related-content overrides;
- card presentation preset selected from approved variants;
- `show_on_home`, `show_in_index`, and `show_in_search` controls.

### Evidence and safety

- source/evidence note for factual claims;
- data classification: public, sanitized/demo, restricted metadata-only;
- client/employer visibility flags;
- approved external URLs;
- media rights, credit, alt text, caption, license, and sensitivity note;
- embargo and takedown fields;
- no public phone field;
- academic email may be public; private email and phone remain admin-only.

## 3. Rich content builder

Available blocks:

- prose, heading, lead, quote, callout, divider;
- image, image comparison, gallery, audio, video, embed;
- code, downloadable file, table, diagram, formula;
- timeline, metrics/evidence list, references/footnotes;
- project contribution, constraint, result, reflection;
- learning objectives, prerequisites, steps, resources;
- related content and contextual CTA.

Each block supports locale-specific content, accessibility fields, visibility,
and reordering. Raw scripts, arbitrary HTML, arbitrary CSS, and unsafe embeds
are not available to normal editors.

## 4. Type-specific modules

### Profile and CV

Work, education, certificate, skill, volunteer, award, and affiliation records
support preview-only or independent detail pages. Records may contain sanitized
samples, media, related projects/publications, and a verified date range. CV
exports select approved records and never expose hidden contact fields.

### Research

Research topics, statement, interests, collaborations, methods, datasets, and
outputs support links to projects and publications. Research Fit on Home is a
curated view, not an automatically generated claim.

### Projects

Fields include role, context, status, dates, contribution, methods/stack,
constraints, sanitized evidence, diagrams, gallery, collaborators, external
links, and disclosure. Sensitive work can publish metadata and sanitized media
without real data or internal architecture.

### Publications

Fields include type, title, authors in order, year, venue/status, abstract,
keywords, DOI/URL, citation file, PDF/download policy, related research/project,
and cover/figure media. Citation counts are never manually invented.

### Blog

Posts support personal, diary/memoir, political/social, technology, research,
and other editorial categories. Blog relationships to projects are optional and
manual. Series, tags, archives, cover art, content warning, comments policy,
feed visibility, and scheduled publication are configurable.

### Learning

Learning items support article, tutorial, note, resource list, course, and
collection formats. Fields include audience, level, prerequisites, objectives,
estimated effort, steps/chapters, resources, downloads, completion order, and
revision/update notes.

### Gallery

Creative works support album/collection, medium, year, role, client visibility,
statement, process, before/after, ordered media, focal point, credits, license,
and color-safe thumbnails. Every work may have an independent detail page.

## 5. Home composer

The Home composer controls:

- section visibility and order within the approved narrative guardrails;
- Hero copy and three approved CTA slots;
- Featured graph version;
- Research Fit summary and selected themes;
- timeline nodes and display range;
- Featured projects and publications;
- Gallery, Blog, and Learning preview selections;
- closing collaboration CTA;
- per-locale preview and publication schedule.

Selection modes:

- **Manual:** editor pins exact records and order.
- **Rule-based:** newest/updated records filtered by type/tag/status.
- **Hybrid recommended:** editor pins priority items; remaining slots use a
  transparent rule. The preview must show why each record was selected.

The composer may not create an empty linked section. Validation blocks publish
when a CTA points to an unavailable locale route.

## 6. Graph editor

Visual reference:
`visuals/admin-graph-editor-dark-concept-v1.png`. It demonstrates the intended
Phase 1 working state—palette, 2D canvas, selected-node inspector, version,
validation, publish, minimap, and a visibly unavailable Phase 2 control. It is
not a content or API authority.

### Phase 1 — 2D editor and 2D public output

- infinite 2D canvas with pan, zoom, minimap, grid, snap, and alignment guides;
- create, duplicate, group, lock, hide, and delete nodes;
- typed nodes with title, short label, description, icon, semantic role,
  content link, dates, status, weight, and locale fields;
- multiple parents/children and cross-links;
- directed/undirected edges with label, type, weight, dates, description, and
  visibility;
- manual positioning plus deterministic auto-layout presets;
- groups/layers, focus paths, and Home/public views;
- undo/redo, keyboard shortcuts, copy/paste, multi-select, and validation;
- versioned draft, comparison, restore, preview, publish, and rollback;
- public 2D, mobile, no-JS, print, Light, Dark, English, and Persian previews.

### Phase 2 — 3D public output

- same node/edge schema; no content migration;
- optional z-position, depth group, orbit radius, and camera focus metadata;
- interactive 3D preview in admin;
- performance budget indicator and complexity warnings;
- public Three.js/WebGL renderer with an equivalent 2D fallback;
- shareable focused-node URL state where appropriate;
- reduced-motion mode disables orbiting and camera travel.

## 7. Timeline editor

- typed milestones and phases;
- dates or ranges with uncertainty labels;
- relationships to profile entries, projects, research, and media;
- manual order and chronological mode;
- branching/cross-links for overlapping disciplines;
- compact Home view and full About/CV view;
- preview in desktop/mobile, Light/Dark, and RTL/LTR.

## 8. Media library

- upload, replace, crop, focal point, variants, and responsive renditions;
- image/video/audio/document type validation and size limits;
- Persian/English alt text and captions;
- credit/license/source/consent metadata;
- duplicate detection and usage inventory;
- private, inactive, public, and restricted states;
- safe deletion blocked while referenced;
- no public URL for restricted or inactive media.

## 9. Preview and quality gates

Before publish, the admin shows:

- locale, device, theme, reduced-motion, and no-JS previews;
- missing title/slug/body/SEO/alt/caption warnings;
- broken internal/external links;
- route collision and redirect validation;
- missing relationship destinations;
- sensitive-field and restricted-media warnings;
- reading length, heading hierarchy, and basic accessibility checks;
- Home section/CTA integrity;
- graph orphan, cycle, hidden-link, and complexity checks.

Warnings are distinguishable from blocking errors. Publishing records who
overrode a nonblocking warning and why.

## 10. Roles and security

- Owner: all editorial and system operations.
- Editor: content, media, relationships, preview, and review.
- Curator: Featured/Home ordering and relationships without system settings.
- Translator: locale content only.
- Reviewer: comments and approval without direct publish.

Sensitive settings, recovery, user management, deploy/rebuild triggers, and
future brand configuration require stronger authorization. All write actions
remain CSRF protected, audited, rate-limited where appropriate, and compatible
with the existing TOTP boundary.

## 11. Future single-tenant white-label mode

The application can later be personalized for another person without becoming
a shared multi-tenant service.

Configurable Brand Profile:

- name, mark, portrait, professional descriptor;
- locale set and default language choices;
- approved Light/Dark theme preset and semantic accent mapping;
- approved font pairing;
- enabled modules and navigation labels/order;
- contact channels, social links, legal/footer copy;
- domain, metadata defaults, feed/site-map behavior;
- content-type labels and Home recipe.

Locked across deployments:

- content schema boundaries;
- Design System component anatomy;
- accessibility, privacy, security, lifecycle, and audit rules;
- separate database/media/config/secrets for every deployment.

Arbitrary CSS/JS injection, shared tenant data, runtime marketplace plugins,
billing, and cross-customer analytics are not part of this phase.
