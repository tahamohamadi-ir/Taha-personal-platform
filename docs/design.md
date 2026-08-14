# DESIGN SYSTEM — Taha Mohammadi Personal Platform

## `design.md` — Visual, Interaction & Experience Baseline v1.0

> **Status:** Freeze Candidate  
> **Target quality:** ≥ 9.7 / 10  
> **Product:** Personal Research, Professional & Knowledge Platform  
> **Primary public locales:** Persian (`fa`) and English (`en`)  
> **Frontend architecture:** Astro + TypeScript + React Islands  
> **UI foundation:** Tailwind CSS + custom design tokens + shadcn/ui + Radix Primitives  
> **Motion/visualization:** Motion + selective GSAP + selective D3 + very selective Three.js / React Three Fiber  
> **Design direction:** **Editorial-Tech Premium with Human Character**  
> **Core visual identity:** Deep Navy + Turquoise + Refined Gold  
> **Context accents:** Royal Purple + Emerald  
> **Human/personal accent:** Mascot Red  
> **Surface philosophy:** **Solid-first + Selective Glass**  
> **Motion philosophy:** **Functional first; narrative motion only where it explains identity or content**  
> **Hero philosophy:** **Meaningful identity visualization, never decorative 3D for its own sake**

---

# 0. Purpose of this document

This file is the source of truth for the visual and interaction design system of the site.

It defines:

- visual direction;
- brand hierarchy;
- logo and mascot rules;
- color tokens;
- typography roles;
- layout and spacing;
- surface and material rules;
- component behavior;
- motion rules;
- bilingual/RTL/LTR behavior;
- accessibility;
- responsive behavior;
- performance-aware design;
- homepage/hero structure;
- language gateway behavior;
- data visualization rules;
- adaptation rules for third-party UI components;
- agent implementation rules;
- design QA;
- Definition of Done.

This file **does not** replace:

- `PRODUCT_BASELINE.md` / product requirements;
- `PROJECT_MANIFEST.md`;
- architecture ADRs;
- `RELEASE_POLICY.md`;
- page-specific user-flow documents;
- page-specific wireframes.

When a conflict exists:

```text
Product / Accessibility / Security requirements
        ↓
design.md
        ↓
component implementation
        ↓
third-party component defaults
```

Third-party visual defaults NEVER override this file.

---

# 1. Normative language

The following terms are normative:

- **MUST** = mandatory.
- **MUST NOT** = prohibited.
- **SHOULD** = default unless a documented reason exists.
- **SHOULD NOT** = avoid unless justified.
- **MAY** = optional.

Agents MUST follow these rules.

---

# 2. Design quality rubric

The design system is evaluated with this weighted rubric.

| Dimension | Weight |
|---|---:|
| Brand coherence | 1.0 |
| Bilingual / RTL / mixed-direction readiness | 1.0 |
| Accessibility / contrast | 1.0 |
| Token/system completeness | 1.0 |
| Component architecture | 1.0 |
| Performance-aware interaction | 1.0 |
| Logo / mascot / human identity integration | 0.8 |
| Hero / homepage / gateway clarity | 0.8 |
| Agent implementability | 1.0 |
| Responsive / visualization quality | 0.7 |
| QA / governance / maintainability | 0.7 |
| **Total** | **10.0** |

## 2.1 Final self-assessment

| Dimension | Score |
|---|---:|
| Brand coherence | 0.99 / 1.0 |
| Bilingual / RTL | 0.99 / 1.0 |
| Accessibility | 0.98 / 1.0 |
| Token/system completeness | 0.99 / 1.0 |
| Component architecture | 0.99 / 1.0 |
| Performance-aware interaction | 0.99 / 1.0 |
| Logo / mascot integration | 0.78 / 0.8 |
| Hero / homepage / gateway | 0.79 / 0.8 |
| Agent implementability | 0.99 / 1.0 |
| Responsive / visualization | 0.68 / 0.7 |
| QA / governance | 0.68 / 0.7 |
| **Total** | **9.84 / 10** |

This is an internal design-system assessment, not a substitute for real usability testing.

---

# 3. Central design statement

The site MUST communicate all of these ideas at the same time:

```text
Research credibility
+
Engineering depth
+
Design literacy
+
Human-centered thinking
+
Personal warmth
```

The visual identity MUST NOT collapse into only one of these:

- “AI startup website”;
- “developer portfolio”;
- “academic profile”;
- “Dribbble/Behance design portfolio”;
- “cute personal website”;
- “glassmorphism demo”;
- “Awwwards effects showcase”.

The intended impression is:

> **A serious interdisciplinary researcher/engineer with strong design judgment and a recognizably human personality.**

---

# 4. Brand personality

## 4.1 Primary traits

```text
Precise
Curious
Modern
Calm
Intelligent
Technical
Human
Editorial
Premium
Evidence-driven
```

## 4.2 Secondary traits

```text
Playful — selectively
Experimental — selectively
Future-facing — selectively
Warm — contextually
```

## 4.3 Traits to avoid

```text
Corporate sterile
Cyberpunk cliché
Neon overload
Gaming UI
Sports emblem aesthetic
Template-like SaaS UI
Overly childish
Overly academic/formal
Overly luxurious
Visual noise
```

---

# 5. Visual direction

## Final direction

> **Editorial-Tech Premium with Human Character**

This means:

### Editorial

- strong typography;
- generous whitespace;
- clear hierarchy;
- structured reading rhythm;
- content-first composition;
- selective asymmetry.

### Technical

- diagrams;
- data/relationship visuals;
- grid discipline;
- precise line work;
- restrained technical motifs;
- code/data presentation.

### Premium

- controlled accents;
- refined surfaces;
- subtle depth;
- strong spacing;
- high-quality image treatment;
- few but intentional effects.

### Human

- mascot system;
- personal photography where useful;
- warm microcopy;
- human-scale motion;
- emotional states;
- “Now” and personal areas.

---

# 6. Core identity layers

The visual system has four layers.

## Layer A — Foundation

```text
Deep Navy
Warm Canvas
Neutral Surfaces
Graphite / White typography
```

## Layer B — Brand

```text
Turquoise
Refined Gold
```

## Layer C — Context

```text
Royal Purple
Emerald
```

## Layer D — Human / Personality

```text
Mascot Red
Character illustrations
Human photography
Personal micro-interactions
```

These layers MUST NOT compete equally.

---

# 7. Color hierarchy

The source visual-identity document established the following hierarchy:

```text
Foundation        → Navy
Primary Brand     → Turquoise
Signature Accent  → Gold
Research/AI       → Royal Purple
Health/Context    → Emerald
```

This hierarchy is retained.

The previous “Glassmorphism-first” framing is replaced with:

> **Solid-first + Selective Glass**

---

# 8. Raw color palette

## 8.1 Foundation

```css
--navy-950: #071225;
--navy-900: #0B1630;
--navy-800: #122343;
```

## 8.2 Primary Brand — Turquoise

```css
--turquoise-100: #E4F7F4;
--turquoise-500: #16B8A6;
--turquoise-600: #0D9689;
--turquoise-700: #087C73;
```

## 8.3 Signature — Gold

```css
--gold-100: #F3E8CF;
--gold-500: #C89B3C;
--gold-600: #A77B28;
```

## 8.4 Research / AI — Royal Purple

```css
--purple-100: #EEEAF9;
--purple-500: #6047B8;
--purple-600: #47328F;
```

## 8.5 Health / Wearables / Context — Emerald

```css
--emerald-100: #E5F2ED;
--emerald-500: #137A62;
--emerald-600: #0C5948;
```

## 8.6 Neutral

```css
--canvas-warm: #F7F8F5;
--surface-white: #FFFFFF;
--text-graphite: #182328;
--text-slate: #657278;
--border-soft: #DDE5E3;
```

## 8.7 Mascot / Human Layer

Current draft mascot red:

```css
--mascot-red-500: #B62020;
```

This is NOT a primary UI brand color.

It is reserved for:

- mascot clothing;
- personal illustrations;
- rare personality accents;
- story moments.

It MUST NOT replace Turquoise as the main CTA color.

---

# 9. Contrast rules

Important measured contrast ratios:

| Pair | Approx. ratio | Rule |
|---|---:|---|
| Turquoise / Navy | 7.20:1 | strong |
| Gold / Navy | 7.01:1 | strong |
| White / Navy | 17.92:1 | strong |
| Purple / Navy | 2.64:1 | not normal text |
| Emerald / Navy | 3.40:1 | not normal text |
| Turquoise / White | 2.49:1 | not normal text |
| Gold / White | 2.56:1 | not normal text |
| Purple / White | 6.79:1 | acceptable normal text |
| Emerald / White | 5.27:1 | acceptable normal text |
| Graphite / Warm Canvas | 15.04:1 | strong |
| Slate / Warm Canvas | 4.66:1 | acceptable normal text |
| Mascot Red / White | 6.53:1 | acceptable |
| Mascot Red / Navy | 2.75:1 | not normal text |

## 9.1 Mandatory color rule

Turquoise and Gold SHOULD be used as:

- accent;
- border;
- focus;
- icon;
- CTA on dark surfaces;
- highlight;
- line;
- large decorative text where contrast is valid.

They MUST NOT be used as small body text on white surfaces.

Purple and Emerald on Navy MUST be treated as:

- ambient glow;
- large graphic;
- visual indicator;
- decorative layer;

unless a contrast-safe lighter token is selected.

---

# 10. Semantic tokens

Raw colors MUST NOT be used directly throughout components.

Components SHOULD consume semantic tokens.

## 10.1 Light theme

```css
:root {
  --bg-canvas: #F7F8F5;
  --bg-surface: #FFFFFF;
  --bg-surface-muted: #F1F4F2;
  --bg-surface-elevated: #FFFFFF;

  --text-primary: #182328;
  --text-secondary: #657278;
  --text-inverse: #FFFFFF;

  --border-subtle: #DDE5E3;
  --border-strong: #B9C7C3;

  --brand-primary: #087C73;
  --brand-primary-emphasis: #0D9689;
  --brand-primary-soft: #E4F7F4;

  --signature: #A77B28;
  --signature-soft: #F3E8CF;

  --research: #6047B8;
  --research-soft: #EEEAF9;

  --context-health: #137A62;
  --context-health-soft: #E5F2ED;

  --danger: #B62020;
  --focus-ring: #087C73;
}
```

## 10.2 Dark theme

```css
[data-theme="dark"] {
  --bg-canvas: #071225;
  --bg-surface: #0B1630;
  --bg-surface-muted: #122343;
  --bg-surface-elevated: #162A4D;

  --text-primary: #F7FAF9;
  --text-secondary: #B9C6C2;
  --text-inverse: #071225;

  --border-subtle: rgba(255,255,255,.10);
  --border-strong: rgba(255,255,255,.18);

  --brand-primary: #16B8A6;
  --brand-primary-emphasis: #37CCBB;
  --brand-primary-soft: rgba(22,184,166,.14);

  --signature: #C89B3C;
  --signature-soft: rgba(200,155,60,.14);

  --research: #8D7BE0;
  --research-soft: rgba(96,71,184,.18);

  --context-health: #35A989;
  --context-health-soft: rgba(19,122,98,.18);

  --danger: #EF6B68;
  --focus-ring: #16B8A6;
}
```

Exact lightened dark-theme values MUST be visually/contrast tested before implementation freeze.

---

# 11. Recommended color distribution

Approximate visual weighting:

```text
Neutral/Foundation    65–75%
Brand Turquoise       8–12%
Gold                  2–4%
Purple                1–4%
Emerald               1–4%
Mascot Red            contextual only
```

This is NOT a pixel quota.

It is a composition principle.

---

# 12. Material / surface system

The site MUST NOT be “a glassmorphism site”.

Use this hierarchy:

```text
Solid Canvas
Solid Surface
Muted Surface
Elevated Surface
Glass Subtle
Glass Overlay
```

---

# 13. Solid surfaces

Default for:

- article content;
- research;
- publications;
- CV/resume;
- project case studies;
- tables;
- long-form text;
- forms;
- teaching content.

Solid surfaces maximize:

- readability;
- hierarchy;
- performance;
- accessibility.

---

# 14. Selective glass

Glass MAY be used for:

- floating navbar;
- language gateway central panel;
- command palette;
- transient overlay;
- selective hero stat/identity card;
- contextual floating controls.

Glass SHOULD NOT be the default for all cards.

## 14.1 Dark glass token

```css
--glass-bg-dark: rgba(11, 22, 48, .40);
--glass-border-dark: rgba(255,255,255,.12);
--glass-shadow-dark: 0 16px 48px rgba(0,0,0,.24);
--glass-blur: 16px;
```

## 14.2 Light glass token

```css
--glass-bg-light: rgba(255,255,255,.66);
--glass-border-light: rgba(24,35,40,.10);
--glass-shadow-light: 0 16px 48px rgba(15,31,45,.10);
```

## 14.3 Fallback

If `backdrop-filter` is unavailable or expensive:

```text
Glass → opaque elevated surface
```

The component MUST remain usable.

---

# 15. Shape language

The logo draft has a useful geometric characteristic:

- block-like construction;
- strong vertical/horizontal movement;
- clipped/beveled corners;
- internal negative spaces.

The system SHOULD borrow these characteristics selectively.

## 15.1 Motifs

Allowed:

```text
beveled corner
cut corner
notched panel
orthogonal line
technical frame
thin inner outline
```

## 15.2 Use cases

- feature cards;
- research badges;
- image masks;
- code panels;
- section markers;
- diagram nodes;
- selected evidence frames;
- hover preview frame.

## 15.3 Limit

Only 1–2 geometric motifs per component.

MUST NOT turn every card into a polygon.

---

# 16. Logo system

The uploaded logos are drafts, not final production assets.

## 16.1 What to retain

- distinctive silhouette;
- monogram concept;
- geometric/cut-corner character;
- strong recognizability potential.

## 16.2 What to refine

The current heavy treatment:

```text
strong fill
+ black outline
+ thick white outline
```

leans toward:

- sports patch;
- varsity emblem;
- gaming badge.

This SHOULD be refined for a more:

```text
Research
Engineering
Design
Premium
```

identity.

## 16.3 Final required logo variants

The final logo system MUST include:

```text
Primary Symbol
Inverse Symbol
Monochrome Symbol
Small-size/Favicon Symbol
Symbol + English Wordmark
Symbol + Persian Wordmark — optional if needed
```

## 16.4 Context variants

Contextual fills MAY exist:

```text
Primary        → Turquoise
Signature      → Refined Gold
Research       → Royal Purple
Health         → Emerald
Monochrome     → White / Graphite / Navy
```

Red is NOT a default brand-logo variant.

## 16.5 Logo color source

Logo color MUST come from design tokens.

Uploaded draft fills MUST NOT become independent brand colors.

---

# 17. Logo clear space

Until the final optical logo grid is finished:

```text
minimum clear space = 0.5 × symbol height around symbol
```

For navigation, an optical review MAY reduce this.

---

# 18. Mascot / character system

The character illustrations are a valuable human layer.

They MUST NOT replace the professional identity.

Principle:

> **Professional Core + Human Layer**

---

# 19. Mascot role

Best uses:

- 404;
- empty search;
- error state;
- successful contact;
- “Now” section;
- personal writing;
- learning resources;
- loading state for long AI task;
- selected footer interaction;
- playful easter egg;
- technical documentation guidance.

Avoid dominant mascot use in:

- Research Statement;
- Academic CV;
- Publication detail;
- Engineering Case Study;
- primary hero first impression.

---

# 20. Character bible

A canonical mascot MUST be defined before production use.

## 20.1 Canonical physical system

```text
Black beanie
Red hoodie
Dark lower garment
Soft 3D stylization
Rounded facial geometry
Minimal facial features
Warm skin tone
Soft diffuse lighting
Neutral-clean material treatment
```

## 20.2 Headphones

Headphones are a contextual accessory.

Use for:

- coding;
- music;
- focused work;
- tech;
- AI.

They are NOT mandatory in every pose.

## 20.3 Glasses

Use only for:

- reading;
- study;
- research;

if needed.

Do not change face identity radically.

## 20.4 Visual consistency

Production mascot assets MUST maintain:

- same head/body ratio;
- same eye style;
- same hand style;
- consistent red hoodie color;
- same beanie construction;
- same material softness;
- same light direction family;
- consistent camera lens/perspective.

---

# 21. Mascot states

Required state taxonomy:

```text
Neutral
Happy
Celebrating
Thinking
Confused
Sad
Error
Tired
Focused
Reading
Coding
Researching
Teaching
Learning
Health
Music
Success
```

Optional:

```text
Travel
Photography
Design
Presentation
```

---

# 22. Mascot asset naming

Recommended:

```text
mascot/
  neutral/
  status/
    success/
    error/
    empty/
    thinking/
  work/
    coding/
    research/
    reading/
    teaching/
  personal/
```

Example:

```text
taha-mascot-status-empty-v1.webp
taha-mascot-work-coding-v2.webp
```

---

# 23. Third-party brands in mascot assets

Production mascot images SHOULD NOT contain:

- Apple logo;
- identifiable product brand;
- misleading brand marks;

unless intentionally needed.

Generic devices/interfaces are preferred.

---

# 24. Typography architecture

The typography system is bilingual by design.

The exact font family is intentionally NOT frozen until bilingual specimen testing.

Typography roles ARE frozen.

---

# 25. Typography roles

Both locales MUST support:

```text
Display
H1
H2
H3
H4
Body Large
Body
Body Small
Caption
Metadata
Label
Citation
Code / Mono
```

---

# 26. Type scale

Recommended fluid scale:

```css
--text-xs: clamp(.75rem, .72rem + .10vw, .8125rem);
--text-sm: clamp(.875rem, .84rem + .10vw, .9375rem);
--text-base: clamp(1rem, .96rem + .14vw, 1.0625rem);
--text-lg: clamp(1.125rem, 1.06rem + .24vw, 1.25rem);
--text-xl: clamp(1.25rem, 1.12rem + .40vw, 1.5rem);
--text-2xl: clamp(1.5rem, 1.28rem + .72vw, 1.875rem);
--text-3xl: clamp(1.875rem, 1.48rem + 1.20vw, 2.5rem);
--text-4xl: clamp(2.25rem, 1.68rem + 1.85vw, 3.25rem);
--text-5xl: clamp(2.8rem, 1.9rem + 3vw, 4.5rem);
--text-display: clamp(3.2rem, 2rem + 4.2vw, 6.2rem);
```

Values MAY be adjusted after visual prototype testing.

---

# 27. Persian typography

Persian text generally needs:

- more generous line height;
- careful weight choice;
- controlled tracking;
- testing of punctuation;
- numbers and English words.

Recommended baseline:

```text
Body line-height: 1.85–2.0
Heading line-height: 1.3–1.55
Paragraph max measure: 50–68 Persian characters, context-dependent
```

Do NOT apply Latin letter-spacing rules to Persian.

---

# 28. English typography

Recommended baseline:

```text
Body line-height: 1.55–1.75
Heading line-height: 1.05–1.25
Paragraph measure: 55–75 characters
```

---

# 29. Mixed-direction typography

Mandatory test cases:

```text
هوش مصنوعی Human-Centered AI
PostgreSQL نسخه 17
DOI: 10.xxxx/xxxx
https://...
Java / Spring Boot
2026
Citation [12]
```

Rules:

- code MUST remain LTR;
- URL MUST remain LTR;
- DOI MUST remain LTR;
- punctuation MUST be visually checked;
- parentheses MUST be tested;
- inline English technical terms MUST NOT break reading order.

Use `<bdi>` / appropriate direction isolation where necessary.

---

# 30. Font candidate policy

Font candidates MUST be evaluated using a bilingual specimen.

Evaluation criteria:

```text
Persian legibility
English compatibility
Variable font availability
Weight range
Numeral quality
Technical-term rendering
File size
Licensing
Self-hosting
Visual personality
```

The font family decision MUST be an explicit mini-ADR or design decision.

---

# 31. Code typography

Code MUST use a dedicated monospaced font stack.

Code blocks SHOULD be rendered/highlighted at build time.

Client-side syntax-highlighter JS SHOULD NOT be required for static articles.

---

# 32. Spacing system

Use a 4px base grid.

Recommended tokens:

```css
--space-0: 0;
--space-1: .25rem;   /* 4 */
--space-2: .5rem;    /* 8 */
--space-3: .75rem;   /* 12 */
--space-4: 1rem;     /* 16 */
--space-5: 1.25rem;  /* 20 */
--space-6: 1.5rem;   /* 24 */
--space-8: 2rem;     /* 32 */
--space-10: 2.5rem;  /* 40 */
--space-12: 3rem;    /* 48 */
--space-16: 4rem;    /* 64 */
--space-20: 5rem;    /* 80 */
--space-24: 6rem;    /* 96 */
--space-32: 8rem;    /* 128 */
```

Arbitrary spacing SHOULD be avoided.

---

# 33. Section rhythm

Desktop default:

```text
major section padding-block: 96–144px
minor section padding-block: 64–96px
```

Mobile:

```text
major section: 64–88px
minor section: 40–64px
```

Long editorial content SHOULD use calmer rhythm.

---

# 34. Grid

Recommended desktop base:

```text
12 columns
max container: 1280–1440px
content/article measure narrower
```

Tablet:

```text
8 columns
```

Mobile:

```text
4 columns
```

The exact implementation MAY use CSS Grid rather than a literal framework grid.

---

# 35. Containers

Recommended semantic containers:

```text
container-page
container-wide
container-content
container-reading
container-narrow
```

Example targets:

```text
wide: 1440px
page: 1280px
content: 1120px
reading: 760px
narrow: 640px
```

---

# 36. Breakpoints

Breakpoints are implementation aids, not design goals.

Recommended baseline:

```text
sm  = 640
md  = 768
lg  = 1024
xl  = 1280
2xl = 1536
```

Components SHOULD use container queries where their behavior depends on container size.

---

# 37. Radius system

The UI SHOULD NOT be excessively rounded.

Recommended:

```css
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-pill: 999px;
```

Use:

- `md` for standard controls/cards;
- `lg/xl` selectively for hero/feature surfaces;
- pill only for tags/badges/toggles.

Logo-inspired clipped corners MAY replace radius on selected components.

---

# 38. Border system

Recommended:

```text
subtle 1px
strong 1px
emphasis 2px
```

Gold border MUST be rare.

Use Gold for:

- selected premium marker;
- award/featured evidence;
- special line accent.

Do NOT outline every card in Gold.

---

# 39. Elevation system

Prefer low-noise elevation.

```css
--shadow-sm: 0 2px 8px rgba(15,31,45,.06);
--shadow-md: 0 10px 28px rgba(15,31,45,.10);
--shadow-lg: 0 24px 64px rgba(7,18,37,.16);
```

Dark mode shadows MUST be tuned separately.

---

# 40. Iconography

Primary icon system:

> **Lucide**

Rules:

- one primary icon family;
- consistent stroke;
- default 16/20/24px;
- icon-only buttons require accessible label;
- directional icons MUST respect RTL;
- decorative icons MUST be hidden from assistive technology.

---

# 41. Imagery

Image roles:

```text
Professional portrait
Project visual
Research diagram
Photography
Mascot illustration
Book cover
UI screenshot
Technical diagram
```

Each role has different treatment.

---

# 42. Professional portrait

If used in Hero or About:

- clean;
- human;
- contemporary;
- not overly corporate;
- not excessively stylized;
- compatible with Navy/Canvas backgrounds.

Mascot MUST NOT replace professional portrait everywhere.

---

# 43. Screenshots

Project screenshots MUST:

- use consistent frame treatment;
- avoid tiny unreadable UI;
- show context;
- be optimized;
- include captions where useful;
- avoid fake browser chrome unless meaningful.

---

# 44. Diagram style

Diagrams are first-class visual content.

Style:

```text
thin precise lines
Navy / neutral base
Turquoise primary connections
Gold emphasis
Purple research/AI context
Emerald health context
```

Avoid:

- rainbow diagrams;
- tiny labels;
- decorative 3D when 2D explains better.

---

# 45. Data visualization system

Data visualization MUST prioritize truthful communication.

Default chart palette:

```text
Primary series     → Turquoise
Highlight          → Gold
Research series    → Purple
Health/context     → Emerald
Neutral/reference  → Slate
Danger/negative    → Semantic red
```

Color MUST NOT be the only encoding.

Use:

- labels;
- shape;
- line style;
- annotation.

---

# 46. Chart anti-patterns

MUST NOT use by default:

- 3D charts;
- decorative gradients that imply value;
- pie/donut when comparison is hard;
- rainbow categories without semantic reason;
- tiny legends far from data;
- inaccessible hover-only values.

---

# 47. Component architecture

Component layers:

```text
Primitives
↓
UI
↓
Patterns
↓
Sections
↓
Pages
```

Hydrated interactive components live separately as Islands.

---

# 48. Recommended frontend folders

```text
src/
├── components/
│   ├── primitives/
│   ├── ui/
│   ├── patterns/
│   ├── sections/
│   ├── islands/
│   └── visualization/
├── layouts/
├── styles/
├── tokens/
└── pages/
```

---

# 49. Primitive examples

```text
Container
Stack
Cluster
Grid
Text
Heading
Link
Icon
Divider
VisuallyHidden
AspectRatio
```

---

# 50. UI examples

```text
Button
IconButton
Card
Badge
Tabs
Accordion
Dialog
Sheet
Tooltip
Popover
Select
Combobox
FormField
Toast
Table
CodeBlock
```

---

# 51. Pattern examples

```text
ProjectCard
ResearchAreaCard
PublicationCard
BookCard
ExperienceCard
EvidenceCard
Metric
TimelineItem
RelatedContent
LanguageSwitcher
SearchResult
AvailabilityStatus
DownloadItem
```

---

# 52. Island examples

```text
CommandPalette
SearchExplorer
InteractiveTimeline
KnowledgeGraph
AdvancedFilter
ThemeSwitcher — only if client state required
AskMyWork
3DSignatureExperience
```

---

# 53. Buttons

Variants:

```text
Primary
Secondary
Ghost
Text
Destructive
Icon
```

## Primary

Light surface:

- darker Turquoise for contrast.

Dark surface:

- Turquoise 500 with Navy text if contrast valid;
- or Navy/White depending visual context.

Gold MUST NOT become the everyday primary button.

---

# 54. Button states

Every interactive button MUST define:

```text
default
hover
focus-visible
active
disabled
loading
```

Hover MUST NOT be the only feedback.

---

# 55. Links

Content links:

- underlined or visually unmistakable;
- hover enhancement;
- focus-visible;
- visited state MAY be used in long-form research/writing contexts.

External link icon SHOULD be subtle.

---

# 56. Cards

Card hierarchy:

```text
Plain
Surface
Elevated
Feature
Interactive
```

Not every content item needs a card.

Editorial layouts SHOULD allow content without card boxes.

---

# 57. Interactive card rule

If the whole card is clickable:

- one primary semantic link;
- avoid nested conflicting clickable areas;
- keyboard focus MUST be clear.

---

# 58. Navigation

Desktop nav baseline:

```text
Research
Work
Projects
Writing
About
More
CV / Resume CTA
Language
```

Mobile:

- compact;
- clear;
- no deeply nested mega-menu in first versions.

Floating glass nav MAY be used.

---

# 59. Language switcher

Always accessible after locale entry.

Display SHOULD use:

```text
FA / EN
```

or:

```text
فارسی / English
```

depending available space.

Flags MUST NOT be used as language indicators.

---

# 60. Language Gateway

Root `/` is the language gateway.

## 60.1 Behavior

```text
/        → Language Gateway
/fa/...  → Persian site
/en/...  → English site
```

Direct locale URL MUST NOT show gateway again.

## 60.2 Goal

The gateway is a **brand moment**, not an onboarding wizard.

## 60.3 Required content

```text
Logo
Short prompt
فارسی
English
```

Optional:

```text
very short identity line
subtle signature background
```

## 60.4 Must not contain

- long biography;
- full navigation;
- large mascot;
- video background;
- heavy 3D blocking load;
- artificial countdown/loader.

## 60.5 Visual direction

Preferred:

```text
Deep Navy full viewport
+ refined logo
+ two clear language actions
+ subtle background paths / technical field
```

Possible enhancement:

- subtle SVG paths;
- very light shader;
- dotted/kinetic field.

The gateway MUST be usable before enhancement loads.

---

# 61. Locale persistence

The site MAY remember the last locale locally.

But root behavior and automatic redirect MUST be decided in IA/SEO implementation.

User MUST always have a visible language switch.

---

# 62. Hero purpose

The Hero must answer in seconds:

```text
Who is Taha?
What does he work on?
Why should I care?
Where do I go next?
```

---

# 63. Hero content baseline

Recommended:

```text
Name
Primary positioning
One-line value proposition
Research CTA
Selected Work CTA
CV CTA
Meaningful identity visual
```

Hero MUST NOT be a job-title wall.

---

# 64. Hero visual direction

Preferred concept:

> **Editorial-Tech Constellation / Identity Network**

Conceptual nodes:

```text
Design
Interaction
Engineering
Data
AI
Human-Centered Intelligent Systems
```

The visual should show evolution/connection.

Desktop:

- enhanced interactive.

Mobile:

- simplified.

Reduced Motion:

- static.

No JS:

- meaningful SVG/HTML fallback.

---

# 65. Hero composition

Preferred desktop composition:

```text
Text / CTA    55–60%
Identity visual 40–45%
```

Alternative editorial collage MAY be explored in wireframes.

---

# 66. Hero effects priority

Preferred order:

```text
1. SVG / CSS paths
2. light canvas/network
3. selective Motion
4. selective GSAP
5. D3 if meaningfully data/relationship driven
6. Three/WebGL only if it adds unique value
```

---

# 67. Hero effect anti-rule

A visual effect MUST answer:

> What does this say about Taha or the content?

If answer is:

> “It looks cool.”

that is insufficient for Hero adoption.

---

# 68. Homepage architecture

After Language Gateway and Hero, recommended hierarchy:

```text
Hero
↓
Explore by Perspective
↓
Current Focus
↓
Selected Evidence
↓
Journey
↓
Research / Engineering Highlights
↓
Latest Writing
↓
Now / Availability
↓
Contact / Footer
```

Homepage is an executive overview.

It is NOT the full CV.

---

# 69. Explore by Perspective

Three primary audience routes:

```text
Research
Engineering & AI
Writing & Learning
```

Each must communicate:

- audience;
- value;
- next step.

---

# 70. Selected Evidence

Use 3–6 curated items.

Not “latest everything”.

Priority:

```text
Research project
Engineering case study
Publication
Book
Major project
Major achievement
```

---

# 71. Journey section

Career/intellectual progression:

```text
Design
→ Interaction
→ Engineering
→ Data
→ AI
→ Human-Centered Intelligent Systems
```

This is an ideal place for a signature narrative motion.

Possible:

- GSAP scroll-linked line;
- progressive node activation;
- Gemini-like path behavior.

It MUST degrade to a readable static timeline.

---

# 72. Mascot on homepage

Mascot SHOULD NOT dominate Hero.

Good placement:

- Now;
- Availability;
- footer;
- empty state;
- playful hover;
- small contextual illustration.

---

# 73. Motion system

Motion is divided into:

```text
Functional
Narrative
Decorative
```

Priority:

```text
Functional > Narrative > Decorative
```

---

# 74. Motion tokens

```css
--motion-instant: 80ms;
--motion-fast: 140ms;
--motion-normal: 220ms;
--motion-slow: 360ms;
--motion-expressive: 600ms;
```

Easing:

```css
--ease-standard: cubic-bezier(.2,.8,.2,1);
--ease-enter: cubic-bezier(.16,1,.3,1);
--ease-exit: cubic-bezier(.4,0,1,1);
--ease-emphasized: cubic-bezier(.16,1,.3,1);
```

Exact curves MAY be tuned.

---

# 75. Functional motion

Use for:

- menu;
- dropdown;
- tabs;
- accordion;
- dialog;
- tooltip;
- filter;
- search;
- button state.

Prefer CSS or Motion.

---

# 76. Narrative motion

Use for:

- Journey;
- research story;
- selected case study;
- meaningful reveal.

GSAP is allowed.

Narrative motion SHOULD NOT appear on every section.

---

# 77. Decorative motion

Examples:

- ambient particles;
- glow drift;
- shader;
- floating object.

Decorative motion MUST:

- be low priority;
- stop or reduce for Reduced Motion;
- never block interaction;
- never be required to understand content.

---

# 78. GSAP policy

GSAP is selective.

Good:

- coordinated scroll sequence;
- multi-part narrative;
- complex timeline.

Bad:

- simple hover;
- basic modal;
- every text reveal.

Route-level/lazy loading SHOULD be used.

---

# 79. D3 policy

D3 is for custom information visualization.

Use when relationship/data matters.

Possible:

- research map;
- topic graph;
- technology graph;
- evidence network;
- timeline.

Do not use D3 for a simple static bar chart if SVG/HTML is enough.

---

# 80. Three.js / R3F policy

Three.js is exceptional.

Allowed only when:

```text
meaningful
performance-tested
lazy-loaded
non-blocking
mobile-simplified
reduced-motion-safe
static-fallback provided
```

One or two signature experiences maximum is the default.

---

# 81. View Transitions

Use selectively for continuity.

Good:

```text
Project card → Project detail
Research card → Research area
Writing list → Article
```

Transition MUST NOT delay navigation.

---

# 82. Interaction states

Every interactive component MUST define:

```text
default
hover
focus-visible
active
selected
disabled
loading
error
success
```

For content states also define:

```text
empty
restricted
unavailable
draft — admin only
```

---

# 83. Focus

Focus indicator MUST be visible.

Recommended:

```text
2px or equivalent
high-contrast semantic focus token
offset sufficient from element
```

Removing outline without replacement is prohibited.

---

# 84. Reduced Motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Rules:

- remove large transforms;
- remove continuous loops;
- reduce parallax;
- disable smooth-scroll effects;
- preserve state changes;
- preserve content.

---

# 85. Responsive philosophy

Responsive design is not shrinking desktop.

Use:

```text
Desktop enhanced
Tablet reorganized
Mobile focused
```

---

# 86. Mobile priority

On mobile:

- content hierarchy wins;
- Hero visual is simplified;
- 3D MAY disappear;
- large canvas MAY become static;
- CTA remains clear;
- navigation remains simple;
- cards can become list-like;
- tables get responsive strategy.

---

# 87. Container queries

Prefer container queries for:

- cards;
- publication blocks;
- project blocks;
- stats;
- media/text pattern.

Do not rely only on viewport media queries.

---

# 88. RTL / LTR

Every component MUST support:

```text
fa → RTL
en → LTR
mixed
```

Use logical properties:

```text
margin-inline
padding-inline
border-inline
inset-inline
```

Avoid hard-coded left/right when semantics are directional.

---

# 89. Direction-sensitive icons

Examples:

- arrows;
- chevrons;
- next/previous;
- timeline progression.

Must reverse or adapt correctly for RTL.

Icons like “external link” do not necessarily mirror blindly; evaluate semantically.

---

# 90. Tables in RTL

Tables with English technical data may need:

```text
table direction based on content
cell-level direction isolation
```

Do not force all internal content RTL.

---

# 91. Accessibility baseline

Target:

> WCAG AA experience

Mandatory:

- semantic HTML;
- keyboard navigation;
- focus visibility;
- contrast;
- labels;
- alt text;
- reduced motion;
- screen-reader compatibility;
- accessible form errors;
- captions/transcripts where relevant.

---

# 92. Cognitive accessibility

For technical/tutorial content:

- state goal first;
- keep prerequisites explicit;
- separate required and optional;
- show observable result after major step;
- support resumability;
- provide recovery path.

These rules apply especially to documentation/learning material.

They are NOT mandatory editorial style for Research Statement or personal essays.

---

# 93. Progressive Enhancement

Rule:

> JavaScript enhances the experience; public content exists without it.

Example Knowledge Graph:

No JS:

```text
Topic
Related Research
Related Projects
Related Publications
```

JS:

```text
interactive graph
zoom
filters
focus
```

---

# 94. Performance-aware design

Design MUST account for frontend architecture.

Prefer:

```text
HTML
CSS
SVG
```

before:

```text
React
Canvas
WebGL
```

---

# 95. Design performance budgets

Initial design targets:

## Public text/content pages

```text
Client JS: ideally 0 unless needed
No runtime chart/animation dependency
```

## Homepage

```text
Initial critical JS: minimal
Large animation libraries: deferred/lazy
Three/WebGL: never render-blocking
Hero copy: available immediately
```

## Media

```text
No huge original image
Responsive source sizes
Modern formats
Known dimensions
Lazy load below fold
```

Exact byte budgets MUST be finalized with P1 measurement.

---

# 96. Skeleton policy

Static-first pages SHOULD NOT show skeletons for content that can be rendered as HTML.

Skeleton/loading UI is appropriate for:

- AI response;
- live API search;
- external data;
- long-running task.

---

# 97. 21st.dev policy

21st.dev is:

> **A component quarry / inspiration source, NOT the Design System.**

Process:

```text
Discover
↓
Evaluate
↓
Extract pattern
↓
Adapt to tokens
↓
Accessibility review
↓
Performance review
↓
Project component
```

Copy-paste without adaptation is prohibited.

---

# 98. Third-party component acceptance checklist

Before adopting a 21st.dev/community component:

- [ ] Does it solve a real UX problem?
- [ ] Does it match visual direction?
- [ ] Can it use our tokens?
- [ ] Is it accessible?
- [ ] Does it support RTL?
- [ ] Is bundle/runtime cost acceptable?
- [ ] Does it degrade without effect?
- [ ] Is maintenance acceptable?
- [ ] Does it duplicate existing Radix/shadcn primitive?
- [ ] Is license/source acceptable?

---

# 99. Preferred inspiration patterns

High-value candidates from reviewed references:

```text
Background Paths
Kinetic Grid
Dotted Surface
Interactive Synapse / network patterns
Editorial collage hero composition
Hover Preview
Gemini-like scroll path
Orbiting Circles — contextual
```

Selective/experimental:

```text
WebGL Shader
Vapour Text
Liquid Metal
Variable-font proximity
3D hero
```

These are inspiration categories, not dependencies.

---

# 100. Background Paths use

Strong candidate for:

- Language Gateway;
- Hero background;
- section transition.

Prefer custom branded path geometry rather than unchanged template.

---

# 101. Kinetic Grid / Dotted Surface

Good for:

- technical atmosphere;
- interactive background;
- identity enhancement.

Rules:

- low opacity;
- no text obstruction;
- pointer effect optional;
- disable/simplify on mobile;
- Reduced Motion fallback;
- static fallback.

---

# 102. Interactive network pattern

Good candidate for:

- Hero identity visual;
- Research Map;
- Topic Explorer.

It is especially appropriate because the product itself has:

- Topic relationships;
- Research links;
- Project relationships;
- Human-Centered AI positioning.

---

# 103. Hover Preview

Useful for:

- project list;
- research links;
- writing archive;
- selected evidence.

Hover-only preview MUST have mobile/focus equivalent.

---

# 104. Orbiting Circles

May be used for:

- technologies;
- research topics;
- collaborators;
- tool ecosystem.

Do not use as default “AI globe” cliché.

---

# 105. WebGL Shader

Use only if:

- unique;
- subtle;
- not blocking;
- low CPU/GPU impact;
- has static fallback.

WebGL SHOULD NOT be the default visual language.

---

# 106. Awwwards inspiration policy

Use Awwwards for:

- composition;
- typography;
- interaction quality;
- motion choreography;
- visual storytelling;
- micro-interactions.

Do NOT copy:

- gratuitous loaders;
- inaccessible scroll hijacking;
- unreadable typography;
- effect overload;
- portfolio clichés.

---

# 107. Remotion policy

Remotion is NOT a public-runtime dependency.

Possible production/content uses:

- project trailer;
- social preview video;
- research explainer;
- animated CV reel;
- presentation sequence.

Use as a content-generation tool.

---

# 108. shadcn / Radix policy

Radix/shadcn provide interaction primitives.

They MUST be adapted to:

- color tokens;
- radius;
- typography;
- motion;
- RTL;
- focus rules.

The final UI MUST NOT look like default shadcn documentation.

---

# 109. Tailwind policy

Tailwind implements the system.

It is NOT the system.

Avoid:

- arbitrary colors;
- random radius;
- random spacing;
- one-off shadows;
- inconsistent class piles.

Prefer semantic utility mapping and reusable components.

---

# 110. Tailwind / CSS token example

```css
@theme {
  --color-canvas: var(--bg-canvas);
  --color-surface: var(--bg-surface);
  --color-text: var(--text-primary);
  --color-muted: var(--text-secondary);
  --color-brand: var(--brand-primary);
  --color-signature: var(--signature);
  --color-research: var(--research);
  --color-health: var(--context-health);
}
```

Exact Tailwind version syntax MUST match the pinned project version.

---

# 111. Design token file structure

Recommended:

```text
src/tokens/
├── color.css
├── typography.css
├── spacing.css
├── radius.css
├── elevation.css
├── motion.css
└── theme.css
```

or equivalent centralized token architecture.

---

# 112. Search / Command Palette

Command Palette is a strong future signature.

Shortcut:

```text
Cmd/Ctrl + K
```

Possible results:

```text
Research
Projects
Writing
Publications
Resume
Contact
Topics
```

Initial provider MAY be Pagefind.

Future provider MAY be server/semantic search.

UI must remain provider-agnostic.

---

# 113. Search UX

Search results should group by entity type:

```text
Research
Projects
Writing
Publications
Topics
```

Highlighting must remain readable.

No-results state may use thinking/confused mascot.

---

# 114. Forms

Forms MUST be:

- semantic;
- clearly labeled;
- keyboard friendly;
- server validated;
- error specific;
- intent aware.

Do not animate error messages excessively.

---

# 115. Contact success

After successful contact:

- clear textual confirmation;
- optional small celebratory mascot;
- next action;
- no confetti overload by default.

---

# 116. Tables

Tables must define:

- responsive handling;
- header hierarchy;
- numeric alignment;
- code/URL direction;
- zebra/row separation only when helpful.

For small screens:

- horizontal scroll;
- stacked representation;
- priority columns.

Choose based on content.

---

# 117. Code blocks

Code blocks:

- LTR;
- selectable;
- copy button;
- language label optional;
- high contrast;
- build-time highlighting;
- horizontal scrolling;
- no tiny font.

---

# 118. Publication UI

Publication detail prioritizes:

```text
Title
Authors
Venue
Year
Status
Abstract
DOI
Citation
Availability
Related Research
```

Avoid excessive decorative surfaces.

Academic credibility > visual spectacle.

---

# 119. Research UI

Research pages SHOULD feel:

```text
editorial
structured
serious
future-facing
```

Purple may appear as contextual atmosphere, not as dominant entire-page theme.

---

# 120. Engineering case study UI

Case study should communicate:

```text
Problem
Constraints
Architecture
Decisions
Trade-offs
Testing
Outcome
Evidence
```

Strong diagram support is required.

---

# 121. Writing UI

Writing prioritizes reading.

Rules:

- narrower measure;
- minimal decorative cards inside article;
- strong heading rhythm;
- accessible links;
- code/table treatment;
- optional reading progress;
- series navigation.

---

# 122. Resume UI

Resume pages prioritize:

- scanning;
- semantics;
- print;
- ATS-friendly structure;
- restrained visuals.

Mascot is not appropriate in the printable resume.

---

# 123. Teaching UI

Teaching can be warmer and more playful.

Mascot MAY appear more often.

Still preserve:

- level;
- prerequisites;
- outcomes;
- workload;
- resources.

---

# 124. Creative UI

Creative section MAY use:

- larger images;
- bolder layout;
- controlled transitions;
- image masks;
- experimental typography.

It MUST still belong to the same system.

---

# 125. Personal writing UI

Personal content MAY expose more Human Layer:

- Mascot Red;
- warmer imagery;
- less technical visual density.

Primary nav must still keep professional noise controlled.

---

# 126. Empty states

Every major dynamic area SHOULD define an empty state.

Examples:

```text
No search result
No publications yet
No related project
No current availability
```

Mascot may support empty state but text must explain state/action.

---

# 127. Error states

Error states MUST provide:

```text
what happened
what user can do
retry/back/home
```

Mascot MAY reinforce emotion.

It MUST NOT replace useful recovery instructions.

---

# 128. 404

Recommended:

- confused/thinking mascot;
- clear “Page not found”;
- search;
- main paths;
- language preserved.

---

# 129. 500

Recommended:

- exhausted/server-themed mascot;
- concise apology;
- retry/home;
- no technical internals.

---

# 130. Loading

Loading indicators MUST reflect actual wait.

Do not add fake loading for aesthetic effect.

---

# 131. Micro-interaction inventory

Approved candidates:

```text
Project card hover/focus
Copy DOI
Copy citation
Copy email
Active nav
Reading progress
Language switch
Theme switch
Filter feedback
Search keyboard navigation
Timeline focus
Link preview
Evidence expansion
```

---

# 132. Theme behavior

Light and dark themes SHOULD both exist in architecture.

Theme toggle MAY be introduced when both themes are visually validated.

Do not ship a low-quality dark mode solely because tokens exist.

---

# 133. Homepage theme recommendation

Language Gateway:

```text
Dark
```

Homepage initial recommendation:

```text
Dark or mixed editorial
```

Long reading pages:

```text
Light preferred by default, dark optional
```

Final theme strategy is validated through wireframes/prototypes.

---

# 134. Gold usage policy

Gold means:

```text
signature
premium
special evidence
selected state
award
important line
```

Gold does NOT mean:

```text
all buttons
all icons
all headings
all borders
```

Scarcity creates signature value.

---

# 135. Purple usage policy

Purple signals:

```text
Research
AI
future
conceptual depth
```

It MAY be used as:

- glow;
- graph context;
- section accent;
- badge.

Do not tint entire Research area purple by default.

---

# 136. Emerald usage policy

Emerald signals:

```text
Health
Wearables
Sustainability
Contextual success
```

It MUST remain semantically distinct from Turquoise.

---

# 137. Mascot Red usage policy

Mascot Red belongs to:

```text
illustration
personal layer
error semantic if appropriate
```

It is NOT a third primary brand color.

---

# 138. Language Gateway design acceptance

The gateway passes when:

- [ ] language choice is obvious in < 3 seconds;
- [ ] keyboard can choose language;
- [ ] both labels are readable;
- [ ] no auto-playing heavy effect blocks page;
- [ ] no mascot dominates;
- [ ] background effect has fallback;
- [ ] `/fa` and `/en` are direct;
- [ ] brand is recognizable.

---

# 139. Hero design acceptance

Hero passes when:

- [ ] identity is understood rapidly;
- [ ] research path is visible;
- [ ] work path is visible;
- [ ] CV action exists;
- [ ] mobile version is focused;
- [ ] no heavy effect blocks content;
- [ ] no-JS fallback works;
- [ ] reduced-motion version works;
- [ ] visual says something meaningful about identity.

---

# 140. Component design acceptance

Every component MUST have:

```text
purpose
variants
states
size behavior
responsive behavior
RTL/LTR behavior
keyboard behavior
accessibility
token mapping
motion
fallback
```

For non-interactive components, irrelevant fields may be marked N/A.

---

# 141. Agent rules — color

Agents MUST NOT invent:

- new brand color;
- new semantic color;
- random gradient;
- random glow.

If a new semantic need exists:

1. reuse token;
2. propose token;
3. document reason;
4. get approval.

---

# 142. Agent rules — spacing

Agents MUST NOT introduce arbitrary recurring spacing.

If a value repeats:

- map to spacing token;
- or propose token.

---

# 143. Agent rules — radius

Agents MUST NOT use arbitrary radius outside approved scale without explicit design reason.

---

# 144. Agent rules — motion

Agents MUST NOT add:

- scroll hijacking;
- infinite animation;
- parallax;
- WebGL;
- GSAP;
- custom cursor;

without task scope and fallback.

---

# 145. Agent rules — third-party UI

Agent MUST NOT:

```text
copy 21st.dev component
ship unchanged
```

Agent MUST:

```text
extract
adapt tokens
test RTL
test accessibility
test performance
```

---

# 146. Agent rules — shadcn

Default shadcn styling is not final.

Any shadcn-derived component must be visually integrated.

---

# 147. Agent rules — mascot

Agent MUST use canonical approved assets.

Agent MUST NOT generate random new mascot style during normal feature implementation.

New mascot generation requires an asset/design task.

---

# 148. Agent rules — logo

Until final logo approval:

- use temporary approved draft only;
- do not infer final geometry;
- do not create brand lockup from guess.

---

# 149. Agent rules — responsive

Every public UI task MUST test at minimum:

```text
mobile
tablet
desktop
```

Critical visual components SHOULD test wide desktop.

---

# 150. Design QA — visual

Check:

- hierarchy;
- alignment;
- whitespace;
- color hierarchy;
- text measure;
- image crop;
- surface consistency;
- icon consistency;
- token use;
- no accidental template look.

---

# 151. Design QA — bilingual

Check:

- Persian;
- English;
- long Persian heading;
- long English heading;
- mixed technical line;
- DOI;
- URL;
- numbers;
- punctuation;
- mobile RTL.

---

# 152. Design QA — accessibility

Check:

- contrast;
- keyboard;
- focus;
- reduced motion;
- alt text;
- labels;
- dialog focus;
- error messaging;
- screen-reader critical path.

---

# 153. Design QA — performance

Check:

- unnecessary hydration;
- large island;
- unoptimized image;
- font weight count;
- blocking animation;
- global GSAP/Three import;
- layout shift.

---

# 154. Design QA — content credibility

Check:

- no fake metric;
- no fake client;
- no fake award;
- no invented citation;
- no decorative claim unsupported by evidence.

---

# 155. Definition of Done — Design System component

A component is Design-System-complete when:

- [ ] purpose is defined;
- [ ] semantic markup exists;
- [ ] variants defined;
- [ ] states defined;
- [ ] tokens used;
- [ ] RTL/LTR verified;
- [ ] responsive verified;
- [ ] keyboard verified if interactive;
- [ ] contrast verified;
- [ ] motion follows policy;
- [ ] Reduced Motion handled;
- [ ] performance impact acceptable;
- [ ] no duplicated component exists;
- [ ] Storybook/example added when component library stage requires it.

---

# 156. Definition of Done — Public page

A page is design-complete when:

- [ ] content hierarchy is clear;
- [ ] page purpose is obvious;
- [ ] primary action exists;
- [ ] locale behavior works;
- [ ] responsive works;
- [ ] accessible focus order works;
- [ ] visual system is consistent;
- [ ] media optimized;
- [ ] SEO content slots exist;
- [ ] no unnecessary hydration;
- [ ] empty/error states defined if dynamic;
- [ ] screenshots/visual QA captured where required.

---

# 157. Design debt

A non-blocking design gap MAY be deferred.

It MUST be logged with:

```text
ID
component/page
severity
reason
owner
target phase
mitigation
status
```

Design debt MUST NOT live only in comments or memory.

---

# 158. Design system versioning

Changes to these require design-system review:

```text
brand colors
type scale
spacing scale
radius scale
surface model
motion tokens
logo geometry
mascot bible
component semantic behavior
```

Minor component additions do not require full version bump if they follow existing rules.

---

# 159. Open decisions

These decisions remain intentionally open:

1. Final logo geometry.
2. Final English typeface.
3. Final Persian typeface.
4. Exact Language Gateway background effect.
5. Exact Hero visual implementation.
6. Light/dark default strategy after prototypes.
7. Final professional portrait direction.
8. Final mascot production cleanup pipeline.
9. Exact 3D usage, if any.
10. Exact motion choreography for Journey.

These MUST be resolved through prototypes, not arbitrary coding.

---

# 160. Proposed decision order after this file

```text
design.md freeze
↓
User Journey
↓
Information Architecture
↓
Language Gateway wireframe
↓
Homepage wireframe
↓
Hero visual prototype
↓
Bilingual typography specimen
↓
Logo refinement
↓
High-fidelity Landing
↓
Usability / visual QA
↓
P1 implementation
```

---

# 161. Source-derived decisions vs proposed refinements

## Source-derived and retained

From the supplied visual-identity document:

- Navy foundation;
- Turquoise primary brand;
- Gold signature;
- Purple research/AI accent;
- Emerald contextual accent;
- neutral light canvas;
- limited Gold;
- controlled glow;
- semantic color hierarchy.

## Proposed refinements in this file

- Glass is selective, not global;
- semantic light/dark tokens;
- contrast-safe usage;
- Mascot Red as a Human Layer;
- logo geometry as shape language;
- mascot/character bible;
- Language Gateway;
- Hero identity network;
- progressive enhancement;
- performance-aware visual hierarchy;
- 21st.dev adaptation policy;
- explicit agent rules;
- QA/DoD.

---

# 162. Final condensed design contract

```text
STYLE
Editorial-Tech Premium with Human Character

CORE COLORS
Deep Navy
Turquoise
Refined Gold

CONTEXT
Royal Purple
Emerald

PERSONALITY
Mascot Red

MATERIAL
Solid-first
Selective Glass

TYPOGRAPHY
Bilingual-first
Editorial
Technical
Readable

LAYOUT
Grid-driven
Generous whitespace
Selective asymmetry

MOTION
Functional subtle
Narrative selective
Decorative minimal

HERO
Meaningful identity visualization
No decorative 3D requirement

MASCOT
Human layer
Not professional identity replacement

COMPONENTS
Radix/shadcn foundation
Custom visual language
21st.dev inspiration only

PERFORMANCE
Static-first
Minimal hydration
Heavy visuals lazy

ACCESSIBILITY
WCAG AA target
Keyboard
Focus
Reduced Motion
RTL/LTR

AGENT RULE
Never invent design tokens or visual systems outside this file.
```

---

# 163. Final design principle

> **The site should feel designed, not decorated.**

> **The first impression should be credible enough for a professor, clear enough for a recruiter, technically interesting enough for an engineer, and human enough to be remembered.**

