# Page-family production register

**Status:** Complete — eight reviewed art-direction frames  
**Visual system:** P14 Light Editorial / Dark Scientific Atlas  
**Content authority:** published locale-specific CMS records only

## Frame register

| ID | Project filename | Theme | Primary template | Direction shown | Generation state | Review state | Dimensions | SHA-256 |
|---|---|---|---|---|---|---|---|---|
| PF-01 | `creative-index-light.png` | Light Editorial | Collection index / visual variant | LTR reference | Generated | Reviewed | 864 x 1821 | `0b07398f53ec531e9840b8f01a0000cd0e82745e563e216bb04be55ec4c521b1` |
| PF-02 | `creative-detail-dark.png` | Dark Scientific Atlas | Visual-work detail | LTR reference | Generated | Reviewed | 793 x 1983 | `a4f04e3597116c28eb82bfdbcf478e44610699862fc07ac45b00df9900774526` |
| PF-03 | `writing-index-light.png` | Light Editorial + coral | Editorial index | LTR reference | Generated | Reviewed | 888 x 1771 | `72d54716202bcfb661f3a20f1b75988fb347a44a4f0b23daa41f8f46df53a1f2` |
| PF-04 | `projects-index-dark.png` | Dark Scientific Atlas | Collection index / evidence variant | LTR reference | Generated | Reviewed | 853 x 1844 | `5edfb769e61cb11b6a8e4272cdde9218b85ef0bca5b29975a51c43ed5890303a` |
| PF-05 | `research-publications-index-light.png` | Light Editorial | Research/publication index | LTR reference | Generated | Reviewed | 863 x 1823 | `dc78c3831c2cce225f28d2a6c106e3aa82919caaea6fbc0855c396bf6956b919` |
| PF-06 | `teaching-index-dark.png` | Dark Scientific Atlas + sage | Editorial/learning index | LTR reference | Generated | Reviewed | 875 x 1798 | `fd15db30701f954e17c4600d9d3f99da9e93456d7da4174d8e93f0bfc1a942bc` |
| PF-07 | `about-cv-light.png` | Light Editorial | Profile/CV narrative | LTR reference | Generated | Reviewed | 862 x 1824 | `b26103b898b837b3dfc1574974cd9bf7b6fd7614c897a5cf3c94b56ed577a6e2` |
| PF-08 | `contact-dark.png` | Dark Scientific Atlas | Contact/collaboration | LTR reference | Generated | Reviewed | 862 x 1825 | `fb1f14d9a7d3d4ebf4b62c2570fc626dd7c5bb6f44dc223e13f3883ae6ca35f1` |

Persian RTL and mobile behavior are specified in the shared handoff rather than
redrawing all eight permutations. The existing Persian Blog-detail,
Project-detail, and mobile-Home concepts are the visual RTL references.

## Source-image roles

| Source | Role |
|---|---|
| `home-light-concept-v3-final.png` | Layout, spacing, Light surfaces, shared header/footer, academic hierarchy |
| `home-dark-concept-v3-final.png` | Dark surfaces, glow restraint, graph language, shared geometry |
| `blog-detail-fa-light-concept-v1.png` | Long-form reading measure, TOC, captions, RTL editorial behavior |
| `project-detail-fa-dark-concept-v1.png` | Evidence detail, confidentiality disclosure, outputs, related records |
| `art/gallery-ivory-forms.png` | PF-01/PF-02 visual-work media direction |
| `art/blog-coral-stairs.png` | PF-03 editorial cover direction |
| `art/learning-sage-library.png` | PF-06 learning-media direction |
| project art masters | PF-04 sanitized selected-project preview direction |

## Prompt-wide invariants

### Light Editorial

- warm ivory canvas and mineral-white surfaces;
- navy display/body hierarchy with turquoise primary action;
- gold limited to one short rule, one identity-graphic stroke, or one badge;
- architectural daylight, subtle translucent depth, and large calm margins;
- editorial lists before card walls.

### Dark Scientific Atlas

- deep navy canvas, royal raised surfaces, warm ivory text;
- turquoise identity/action with restrained orbital glow;
- violet, emerald, coral, or gold only when the content family needs it;
- borders and grouping before heavy elevation;
- scientific/architectural atmosphere without dashboard density.

### Shared

- maximum content shell approximately 1280px on a 1440px-wide concept;
- only two font families active per locale;
- one primary action per viewport;
- body reading size represented at 16px or larger;
- no browser chrome, device frame, watermark, fake analytics, or engagement
  metrics;
- no invented biography, degree, institution, employer, date, venue, result,
  metric, URL, email, phone number, or social handle;
- no meaning encoded by color alone;
- generated text is illustrative and never publishable authority;
- Light/Dark mode changes visual tokens, not content or component anatomy.

## Review states

- `Not generated`: no project-bound output exists.
- `Generated`: project-bound file exists; direct visual review is incomplete.
- `Revision required`: a visible hierarchy, claim, privacy, clipping, or family
  consistency defect prevents acceptance.
- `Reviewed`: direct inspection passed for art-direction handoff; runtime,
  browser, accessibility, CMS, and production validation remain open.

## Generation records

### PF-01 Creative index — Light Editorial

- Source result: `exec-f7a80680-e3f7-47c4-b4c4-ada11c4a154d.png`
- Direct review: hierarchy, featured-work emphasis, filter row, varied gallery
  rhythm, pagination, collaboration CTA, and shared footer passed.
- Handoff note: `Awaiting approved CMS copy` is intentional and must resolve
  from the published locale record at runtime.

### PF-02 Creative detail — Dark Scientific Atlas

- Source result: `exec-d44fe536-231d-4b99-9478-a8101dc604ce.png`
- Direct review: lead-media priority, image counter, lightbox affordance,
  thumbnail sequence, process narrative, credits/licence, related work, and
  previous/next navigation passed.
- Handoff note: metadata dashes are intentional empty states; no year, role,
  context, credit, or licence may be inferred by the public frontend.

### PF-03 Writing index — Light Editorial + coral

- Source result: `exec-e6de06d5-637d-4f1f-b65f-e4d7381b3d75.png`
- Direct review: independent-blog positioning, featured essay, topic/archive
  filters, editorial list rhythm, optional updates, pagination, CTA, and shared
  footer passed.
- Handoff note: the concept's visible contact/location values were inherited
  from supplied approved visual references; production must still bind only to
  the published locale-specific CMS contact record.

### PF-04 Projects index — Dark Scientific Atlas

- Source result: `exec-8a2e2736-e01e-4f11-8a4b-ecf476f5866c.png`
- Direct review: sanitized-work disclosure, featured project, filters, mixed
  evidence list, publication-state strip, pagination, CTA, and shared footer
  passed.
- Handoff note: titles and descriptive copy are illustrative. Public records
  must suppress confidential fields and render only the sanitized published
  project projection.

### PF-05 Research and publications index — Light Editorial

- Source result: `exec-8d40974a-9996-4c12-b245-9cdfb6fe5037.png`
- Direct review: local research navigation, constellation filtering model,
  research-fit band, direction list, selected citation records, draft/status
  disclosure, collaboration CTA, and shared footer passed.
- Handoff note: publications keep independent canonical URLs while remaining
  nested under Research in primary navigation; status, files, venue, authors,
  and dates are published-record fields only.

### PF-06 Teaching index — Dark Scientific Atlas + sage

- Source result: `exec-aed65a55-4fbf-4da2-a825-e5b8bfc969d0.png`
- Direct review: learning-library identity, filters, featured path, numbered
  sequence, mixed editorial records, path anatomy, empty state, optional
  updates, collaboration CTA, and shared footer passed.
- Handoff note: this is a publishing library, not an LMS; there are no inferred
  enrollments, learner progress, completion, ratings, testimonials, or course
  metrics.

### PF-07 About and CV — Light Editorial

- Source result: `exec-67b950c3-a542-44f8-9866-391b3155aa1a.png`
- Direct review: profile hierarchy, abstract portrait placeholder, local CV
  tabs, working principles, interdisciplinary journey, record previews, skill
  groups, selected outputs, CV CTA, collaboration CTA, and shared footer
  passed.
- Handoff note: journey labels and skills are visual taxonomy examples, not a
  substitute for owner-approved biography/CV records; public detail links exist
  only for published records.

### PF-08 Contact — Dark Scientific Atlas

- Source result: `exec-f5c05dc7-8754-4beb-a201-6be7c25c3822.png`
- Direct review: collaboration-purpose selection, CMS-bound contact methods,
  accessible form, no-database-storage disclosure, anti-spam status, send-state
  model, preparation checklist, CV alternative, FAQ, and shared footer passed.
- Handoff note: phone and Gmail are prohibited. The academic email, LinkedIn,
  ORCID, availability, attachment support, and FAQ answers render only when the
  relevant approved CMS/config record enables them.
