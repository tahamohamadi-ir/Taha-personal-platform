# Public Page-Family Visual Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce and verify eight high-fidelity public-page concepts that extend the approved P14 Home direction, complete the written implementation handoff, and make an evidence-based Figma decision.

**Architecture:** Treat the existing Light Editorial / Dark Scientific Atlas Home pair as the visual source of truth. Generate only unique page families; reuse the approved Blog-detail and Project-detail concepts, and express repeated responsive, RTL, CMS, state, and motion behavior in shared specifications instead of drawing every permutation.

**Tech Stack:** OpenAI built-in Image Generation, project-local PNG masters, Markdown handoff documents, PowerShell integrity checks, Git exact-scope commits.

**Spec:** `docs/superpowers/specs/2026-08-25-public-page-family-visual-atlas.md`

## Global Constraints

- No changes under `apps/**`, `infra/**`, `.github/**`, CMS models/APIs/migrations, production content, routes, or deployment.
- Current canonical routes remain `/writing/`, `/creative/`, and `/teaching/`; visitor-facing labels do not authorize route migration.
- Do not invent institutions, degrees, positions, employers, collaborators, venues, dates, metrics, results, links, Gmail addresses, phone numbers, or contact values.
- Use only owner-approved/source-visible titles; otherwise render `Awaiting approved CMS copy` or structurally neutral sample labels.
- Generated concepts are reference images, not production UI or content authority.
- The approved owner logo is reused exactly; do not redraw it inside generated images.
- Light and Dark concepts must preserve one component geometry and information hierarchy.
- Blog remains editorially independent from Projects.
- Public content must remain semantically readable without JavaScript; graph, filters, lightbox, motion, and pointer effects are progressive enhancement.
- The Design System remains locked; CMS manages content, ordering, relationships, selected items, and locale-specific publication data.

---

### Task 1: Establish the page-family production register

**Files:**
- Create: `docs/design-redesign/page-families/README.md`
- Create: `docs/design-redesign/page-families/PRODUCTION-REGISTER.md`
- Read: `Assets/site-redesign/concepts/home-light-concept-v3-final.png`
- Read: `Assets/site-redesign/concepts/home-dark-concept-v3-final.png`
- Read: `Assets/site-redesign/concepts/blog-detail-fa-light-concept-v1.png`
- Read: `Assets/site-redesign/concepts/project-detail-fa-dark-concept-v1.png`

**Interfaces:**
- Consumes: approved P14 visual authority and the eight-frame list from the specification.
- Produces: one row per frame with ID, filename, theme, locale direction, template, source references, prompt state, review state, dimensions, and hash.

- [ ] **Step 1: Create the register with fixed IDs and filenames**

Use these immutable IDs:

```text
PF-01 creative-index-light
PF-02 creative-detail-dark
PF-03 writing-index-light
PF-04 projects-index-dark
PF-05 research-publications-index-light
PF-06 teaching-index-dark
PF-07 about-cv-light
PF-08 contact-dark
```

- [ ] **Step 2: Inspect the four reference concepts directly**

Open each source image at high detail and record hierarchy, typography role,
surface treatment, accent balance, header/footer geometry, and reusable media.

- [ ] **Step 3: Record the prompt-wide visual invariants**

Document the exact Light Editorial and Dark Scientific Atlas rules, two-font
locale limit, turquoise primary action, scarce gold, contextual accent colors,
maximum 1280px shell, no card wall, and no browser chrome in generated frames.

- [ ] **Step 4: Verify the register**

Run:

```powershell
rg -n "PF-0[1-8]" docs/design-redesign/page-families/PRODUCTION-REGISTER.md
```

Expected: exactly eight distinct frame rows.

- [ ] **Step 5: Commit**

```powershell
git add docs/design-redesign/page-families/README.md docs/design-redesign/page-families/PRODUCTION-REGISTER.md
git commit -m "docs: register public page family concepts"
```

### Task 2: Generate the Creative/Gallery family

**Files:**
- Create: `Assets/site-redesign/concepts/page-families/creative-index-light.png`
- Create: `Assets/site-redesign/concepts/page-families/creative-detail-dark.png`
- Modify: `docs/design-redesign/page-families/PRODUCTION-REGISTER.md`

**Interfaces:**
- Consumes: PF-01/PF-02 rows, `art/gallery-ivory-forms.png`, approved Home pair.
- Produces: the Collection-index media variant and Visual-work detail geometry used by later documentation.

- [ ] **Step 1: Generate PF-01 as one independent built-in Image Generation call**

Prompt requirements:

```text
Use case: ui-mockup
Asset type: 1440px-wide scrollable desktop website concept
Primary request: Creative/Gallery collection index for Taha Mohammadi's bilingual personal research and design platform
Visual authority: match the approved Light Editorial Home system; warm ivory canvas, mineral surfaces, navy type, turquoise action, scarce antique gold, subtle violet and teal visual-work accents
Hierarchy: compact shared header; editorial collection statement; one featured visual work; accessible filter row; asymmetric but calm image grid; medium/year/role metadata; collection pagination; collaboration close and shared footer
Text policy: use only neutral structural labels and "Awaiting approved CMS copy" where content would assert a fact
Constraints: no invented biography, dates, employers, awards, metrics, links, or contact values; no browser chrome; no dashboard density; no masonry overlap; no watermark
```

- [ ] **Step 2: Inspect PF-01**

Check readable hierarchy, balanced negative space, coherent Light tokens, stable
grid, non-dashboard filters, no malformed logo/text claim, and no clipping.

- [ ] **Step 3: Generate PF-02 as one independent built-in Image Generation call**

Prompt requirements:

```text
Use case: ui-mockup
Asset type: 1440px-wide scrollable desktop website concept
Primary request: individual visual-work detail page with full-bleed lead, medium/year/role/context metadata, captioned image sequence, process strip, credits/licence, related works, and collaboration close
Visual authority: match Dark Scientific Atlas; deep navy, royal surfaces, warm ivory text, turquoise action, scarce gold, restrained violet visual accents
Interaction cues: keyboard-safe lightbox affordance, image counter, previous/next work links, reduced-motion-compatible transitions
Text policy: neutral labels and "Awaiting approved CMS copy"
Constraints: no invented artwork title, year, client, exhibition, award, metric, or identity claim; no browser chrome; no watermark
```

- [ ] **Step 4: Inspect PF-02 and update the register**

Record output paths, dimensions, generation result paths, visual-review notes,
and approval state. Reject any output that embeds a factual claim or unusable UI.

- [ ] **Step 5: Commit**

```powershell
git add -f Assets/site-redesign/concepts/page-families/creative-index-light.png Assets/site-redesign/concepts/page-families/creative-detail-dark.png
git add docs/design-redesign/page-families/PRODUCTION-REGISTER.md
git commit -m "design: add creative page family concepts"
```

### Task 3: Generate the Writing/Blog index

**Files:**
- Create: `Assets/site-redesign/concepts/page-families/writing-index-light.png`
- Modify: `docs/design-redesign/page-families/PRODUCTION-REGISTER.md`

**Interfaces:**
- Consumes: PF-03 row, `art/blog-coral-stairs.png`, existing Blog-detail concept.
- Produces: Editorial-index geometry shared with Learning notes.

- [ ] **Step 1: Generate PF-03**

```text
Use case: ui-mockup
Asset type: 1440px-wide scrollable desktop website concept
Primary request: independent Writing/Blog index for essays, memories, daily notes, political-social writing, and technical reflections
Visual authority: Light Editorial Home geometry with a restrained coral section identity; turquoise remains the global action color
Hierarchy: section statement; one featured essay; recent writing as a refined list rather than a card wall; topic and series filters; archive and RSS links; honest empty/no-result behavior; shared collaboration close and footer
Text policy: neutral structural labels and "Awaiting approved CMS copy"
Constraints: Blog is independent from Projects; no engagement metrics, fake dates, fake popularity, invented topics attributed to the owner, contact data, browser chrome, or watermark
```

- [ ] **Step 2: Inspect the index next to the existing Blog-detail concept**

Verify the same header, typography hierarchy, coral identity, reading rhythm,
metadata treatment, and footer geometry. Ensure the detail page still reads as
the natural next screen.

- [ ] **Step 3: Update the register and commit**

```powershell
git add -f Assets/site-redesign/concepts/page-families/writing-index-light.png
git add docs/design-redesign/page-families/PRODUCTION-REGISTER.md
git commit -m "design: add writing index concept"
```

### Task 4: Generate the Projects index

**Files:**
- Create: `Assets/site-redesign/concepts/page-families/projects-index-dark.png`
- Modify: `docs/design-redesign/page-families/PRODUCTION-REGISTER.md`

**Interfaces:**
- Consumes: PF-04 row, project art masters, existing Project-detail concept.
- Produces: evidence-focused Collection-index variant.

- [ ] **Step 1: Generate PF-04**

```text
Use case: ui-mockup
Asset type: 1440px-wide scrollable desktop website concept
Primary request: selected Projects index that proves research, engineering, data, and visual-design work without making the owner reducible to projects
Visual authority: Dark Scientific Atlas; deep navy and royal surfaces, warm ivory type, turquoise actions, scarce gold, contextual violet/emerald accents
Hierarchy: concise durable positioning; one selected evidence feature; restrained type/topic/status filters; project catalogue with sanitized/confidentiality labels and case-study availability; related research path; shared collaboration close
Text policy: only source-visible project names already present in approved references; every other record says "Awaiting approved CMS copy"
Constraints: no real operational data, client-sensitive details, invented results, metrics, employers, dates, browser chrome, or watermark
```

- [ ] **Step 2: Compare PF-04 with the Project-detail concept**

Confirm compatible hero, disclosure labels, evidence blocks, related-project
cards, Dark surfaces, and canonical navigation hierarchy.

- [ ] **Step 3: Update the register and commit**

```powershell
git add -f Assets/site-redesign/concepts/page-families/projects-index-dark.png
git add docs/design-redesign/page-families/PRODUCTION-REGISTER.md
git commit -m "design: add projects index concept"
```

### Task 5: Generate the Research + Publications index

**Files:**
- Create: `Assets/site-redesign/concepts/page-families/research-publications-index-light.png`
- Modify: `docs/design-redesign/page-families/PRODUCTION-REGISTER.md`

**Interfaces:**
- Consumes: PF-05 row, Home research graph direction, current publication route contract.
- Produces: academic-evidence hierarchy and Publication-row design.

- [ ] **Step 1: Generate PF-05**

```text
Use case: ui-mockup
Asset type: 1440px-wide scrollable desktop website concept
Primary request: PhD-focused Research and Publications overview showing research fit, interests, connected themes, outputs, and publication rows
Visual authority: Light Editorial system; warm ivory, navy typography, turquoise primary, violet language-research accent, emerald health context, scarce gold
Hierarchy: research-fit lead; compact accessible graph preview; research-interest groups; publication list with metadata slots; research outputs; collaboration CTA
Text policy: use the already approved research-area labels only; publication metadata must say "Awaiting approved CMS copy" unless source-visible
Constraints: no invented venue, year, DOI, institution, supervisor, status, citation count, metric, browser chrome, or watermark
```

- [ ] **Step 2: Inspect academic credibility and density**

Ensure publication rows beat decorative cards, metadata is scannable, the graph
supports rather than dominates, and the primary PhD-fit story appears without
claiming candidacy or institutional affiliation.

- [ ] **Step 3: Update the register and commit**

```powershell
git add -f Assets/site-redesign/concepts/page-families/research-publications-index-light.png
git add docs/design-redesign/page-families/PRODUCTION-REGISTER.md
git commit -m "design: add research publications concept"
```

### Task 6: Generate the Teaching/Learning index

**Files:**
- Create: `Assets/site-redesign/concepts/page-families/teaching-index-dark.png`
- Modify: `docs/design-redesign/page-families/PRODUCTION-REGISTER.md`

**Interfaces:**
- Consumes: PF-06 row, `art/learning-sage-library.png`, Editorial-index geometry.
- Produces: Learning-path and resource-list treatment.

- [ ] **Step 1: Generate PF-06**

```text
Use case: ui-mockup
Asset type: 1440px-wide scrollable desktop website concept
Primary request: Learning/Teaching hub for tutorials, notes, courses, resources, and reading paths
Visual authority: Dark Scientific Atlas with restrained sage/emerald identity; turquoise remains the global action color
Hierarchy: learning statement; featured path; tutorial and course groups; level/prerequisite/format metadata; resource list; honest empty state; shared collaboration close
Text policy: neutral labels and "Awaiting approved CMS copy"
Constraints: no fake enrollment, progress tracking, certificate claim, course count, institution, date, rating, browser chrome, or watermark
```

- [ ] **Step 2: Inspect PF-06 for separation from Blog**

Verify Learning includes objectives/prerequisites/resources while Writing does
not, yet both inherit a compatible editorial rhythm and shared navigation.

- [ ] **Step 3: Update the register and commit**

```powershell
git add -f Assets/site-redesign/concepts/page-families/teaching-index-dark.png
git add docs/design-redesign/page-families/PRODUCTION-REGISTER.md
git commit -m "design: add teaching index concept"
```

### Task 7: Generate About/CV and Contact

**Files:**
- Create: `Assets/site-redesign/concepts/page-families/about-cv-light.png`
- Create: `Assets/site-redesign/concepts/page-families/contact-dark.png`
- Modify: `docs/design-redesign/page-families/PRODUCTION-REGISTER.md`

**Interfaces:**
- Consumes: PF-07/PF-08 rows, approved Home journey, public-contact privacy boundary.
- Produces: Profile/timeline and collaboration/conversion templates.

- [ ] **Step 1: Generate PF-07**

```text
Use case: ui-mockup
Asset type: 1440px-wide scrollable desktop website concept
Primary request: About and CV narrative page centered on durable identity and the trajectory Architecture to Visual Design to Software to Data to AI
Visual authority: Light Editorial system with turquoise identity, restrained contextual accents, and architectural negative space
Hierarchy: short identity statement; values and research direction; visual journey timeline; separate work, education, certificates, skills, and approved downloads; collaboration close
Text policy: only the approved role line "Researcher · Engineer · Designer" and neutral structural labels; all record details say "Awaiting approved CMS copy"
Constraints: no degree, institution, employer, date, duration, certificate title, skill rating, metric, email, phone, browser chrome, or watermark
```

- [ ] **Step 2: Generate PF-08**

```text
Use case: ui-mockup
Asset type: 1440px-wide desktop website concept
Primary request: focused Contact and research-collaboration page for PhD supervisors, academic collaborators, and senior industry visitors
Visual authority: Dark Scientific Atlas; quiet orbital/portal atmosphere, warm ivory reading text, turquoise primary action, scarce gold detail
Hierarchy: collaboration statement; areas of conversation; academic-email action represented as an unlabeled safe CMS slot; optional approved social-link slots; location at city/country granularity only; CV action; concise privacy note
Text policy: "Academic email from approved CMS" and neutral labels only
Constraints: no Gmail, phone, unapproved email, social URL, employer, calendar integration, fake form success, browser chrome, or watermark
```

- [ ] **Step 3: Inspect conversion clarity and privacy**

Confirm one primary action, no fake contact form, no exposed identifier, clear
PhD/research priority, usable focus hierarchy, and consistent shared footer.

- [ ] **Step 4: Update the register and commit**

```powershell
git add -f Assets/site-redesign/concepts/page-families/about-cv-light.png Assets/site-redesign/concepts/page-families/contact-dark.png
git add docs/design-redesign/page-families/PRODUCTION-REGISTER.md
git commit -m "design: add profile and contact concepts"
```

### Task 8: Complete implementation handoff documents

**Files:**
- Create: `docs/design-redesign/page-families/PAGE-FAMILY-COMPONENT-MATRIX.md`
- Create: `docs/design-redesign/page-families/RESPONSIVE-RTL-STATE-SPEC.md`
- Create: `docs/design-redesign/page-families/CMS-CONTENT-MAPPING.md`
- Modify: `docs/design-redesign/page-families/README.md`

**Interfaces:**
- Consumes: eight reviewed concepts plus existing Home, Blog-detail, Project-detail, gateway, mobile, and graph-editor concepts.
- Produces: implementation-level template/component/state/CMS requirements independent of raster text.

- [ ] **Step 1: Write the template-to-route matrix**

For every current route family, identify its template, required blocks, optional
blocks, no-JavaScript baseline, enhanced interaction, related-content behavior,
empty/no-result/error states, and canonical/alternate-locale rule.

- [ ] **Step 2: Write the component matrix**

For Header, Breadcrumbs, SectionLead, FeaturedRecord, FilterBar, ContentRow,
MediaGrid, PublicationRow, MetadataGroup, Timeline, TOC, RelatedContent,
ContactCTA, and Footer, specify anatomy plus rest/hover/focus/active/disabled/
loading/error/reduced-motion behavior.

- [ ] **Step 3: Write responsive and RTL rules**

Specify exact recomposition at 320, 390, 768, 1024, 1280, and 1440 CSS pixels,
logical properties, directional-icon flipping, `<bdi>` boundaries, mobile TOC,
vertical timeline, filter disclosure, gallery sequence, and graph list fallback.

- [ ] **Step 4: Write CMS mapping**

Map every visual slot to owner-managed content, selection/order, relationships,
featured windows, locale publication, SEO, media, CTA route picker, detail-page
gate, graph data, and timeline data. Mark design tokens, typography, spacing,
component anatomy, arbitrary CSS/JS, and accessibility behavior as locked.

- [ ] **Step 5: Verify and commit**

```powershell
rg -n "T(BD)|TO(DO)|FIX(ME)|PhD Candidate|@gmail\.com|09\d{9}|\+98" docs/design-redesign/page-families
git diff --check
git add docs/design-redesign/page-families
git commit -m "docs: complete public page family handoff"
```

Expected: the content/privacy scan returns no match; whitespace check passes.

### Task 9: Package assets and make the Figma decision

**Files:**
- Create: `docs/design-redesign/page-families/FIGMA-DECISION.md`
- Modify: `Assets/site-redesign/README.md`
- Modify: `Assets/site-redesign/MANIFEST.md`
- Modify: `Assets/site-redesign/PROMPTS.md`
- Modify: `Assets/site-redesign/SHA256SUMS.txt`
- Modify: `docs/plan/P14C-public-page-family-visual-atlas-task-spec.md`
- Modify: `docs/plan/README.md`
- Modify: `docs/status/WORK_LOG.md`

**Interfaces:**
- Consumes: final eight concepts, prompt/result provenance, written handoff, and the Figma rubric from the specification.
- Produces: final integrity catalog and a decision of `IMAGES_DOCS_SUFFICIENT` or `FIGMA_LITE_RECOMMENDED` with evidence.

- [ ] **Step 1: Record prompt and provenance**

For each concept, record built-in generation mode, final prompt, source images,
generated-result path, project path, dimensions, review notes, and approval state.

- [ ] **Step 2: Update the manifest and SHA-256 register**

Include only managed `art/`, `brand/`, and `concepts/` PNGs. Exclude the
unmanaged `Assets/site-redesign/others/` drop folder.

- [ ] **Step 3: Score Figma value**

Score 0–2 for each criterion: inspectable measurements, reusable component
variants, multi-person coordination, clickable flow value, responsive ambiguity,
RTL ambiguity, motion/prototype ambiguity, and future white-label reuse.

Decision rule:

```text
0–6   -> IMAGES_DOCS_SUFFICIENT
7–10  -> OPTIONAL_FIGMA_LITE
11–16 -> FIGMA_LITE_RECOMMENDED
```

Even at the highest score, do not build every route or content permutation in
Figma. Limit scope to foundations, 20–30 components, six templates,
representative desktop/mobile/RTL frames, and one prototype path.

- [ ] **Step 4: Run binary and scope verification**

```powershell
git diff --check
git status --short --branch
```

Additionally decode every managed PNG, compare every SHA-256 entry, verify the
eight PF files, and confirm no staged path contains `/others/` or `apps/`.

- [ ] **Step 5: Update P14C status and Work Log with actual evidence**

Record exact image count, dimensions, hash count, direct visual-review result,
privacy/content scan, Figma score, final decision, commit scope, and remaining
runtime gates. Do not claim browser, accessibility, performance, CMS, or
production validation.

- [ ] **Step 6: Commit**

```powershell
git add Assets/site-redesign/README.md Assets/site-redesign/MANIFEST.md Assets/site-redesign/PROMPTS.md Assets/site-redesign/SHA256SUMS.txt docs/design-redesign/page-families docs/plan/P14C-public-page-family-visual-atlas-task-spec.md docs/plan/README.md docs/status/WORK_LOG.md
git add -f Assets/site-redesign/concepts/page-families/*.png
git commit -m "design: complete public page family atlas"
```

### Task 10: Final verification and owner handoff

**Files:**
- Read: all P14C-owned files and final Git commit.

**Interfaces:**
- Consumes: committed visual atlas and handoff package.
- Produces: evidence-bounded completion report and clickable project paths.

- [ ] **Step 1: Re-run managed PNG decode and hash verification**

Expected: every managed PNG decodes with positive dimensions and every
`SHA256SUMS.txt` entry matches.

- [ ] **Step 2: Re-run exact-scope verification**

Confirm the final commit contains only P14C-owned concepts, handoff documents,
asset catalog files, plan index, task spec, and Work Log.

- [ ] **Step 3: Review the complete visual family**

Inspect the eight new concepts together with the approved Home pair, Blog
detail, Project detail, gateway, mobile RTL, and graph editor. Record visible
inconsistency or reject completion.

- [ ] **Step 4: Deliver**

Report the visual folder, handoff folder, prompt/manifest/hash paths, Figma
decision, verification counts, commit hash, and confirmation that no push,
deploy, runtime, route, CMS, or production change occurred.
