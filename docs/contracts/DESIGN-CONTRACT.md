# Design contract card — buildable rules

> **v2 (2026-08-24, ADR-0031):** the visual identity is **dark-first «Glass Constellation»**.
> This card now describes BOTH states during the migration: §0 lists the v2 night tokens
> that land in Phase 0; the legacy light table in §2 stays valid only until each page
> migrates. When a page migrates, it consumes ONLY §0 tokens.
> Source of truth for **visual intent**: `reDesign_plan.md` v2 + `docs/design.md`.
> Source of truth for **tokens that exist today**: `apps/web/src/styles/global.css`.

Goal:
You can build a page that matches the product's visual identity without reading
`docs/design.md` end to end, and without guessing what "editorial" means.

Source of truth for **tokens that exist today**:
`apps/web/src/styles/global.css`.

---

## 0. Night token system (v2 target — ADR-0031)

These are added to `global.css` in Phase 0 and become the ONLY palette for
migrated pages:

| Purpose | Token | Value | Contrast rule |
|---|---|---|---|
| Page canvas (night) | `--canvas-night` | `#071225` | — |
| Section canvas (deep) | `--canvas-deep` | `#0B1630` | — |
| Solid reading surface | `--surface-read` | `#101F3C` | body text sits here, never on glass |
| Glass fill (resting) | `--glass-fill` | `rgba(255,255,255,.08)` | decorative/chrome only |
| Glass fill (strong) | `--glass-fill-strong` | `rgba(255,255,255,.14)` | header, overlays |
| Glass edge | `--glass-edge` | `rgba(255,255,255,.16)` | ≥3:1 vs adjacent canvas |
| Primary text on night | `--ink-hi` | `#F2F6FA` | ≥13:1 on night |
| Secondary text | `--ink-mid` | `#A8B8C8` | ≥7:1 |
| Meta/caption text | `--ink-low` | `#6E8095` | ≥4.5:1, metadata only |
| Brand (graphics/fills) | `--brand` | `#16B8A6` | large glyphs/UI ≥3:1 |
| Brand as text/link | `--brand-text` | `#3DD6C5` | ≥4.5:1 on night — link & focus colour |
| Brand deep fill | `--brand-deep` | `#0D9689` | fills only; label must pass 4.5:1 |
| Signature gold | `--gold` | `#E3B95C` | ≤4% of surface; marks/badges/rules only |
| Research/AI accent | `--violet` | `#8E75E6` | research nodes, badges |
| Danger | `--danger` | `#FF6B5E` | errors |

Scales carried unchanged from §2 below: radius, spacing (`--space-*`),
type scale, measures, motion durations/easings.

**Hover rule on night surfaces:** a text-bearing fill's hover MUST keep its
label ≥4.5:1 — verify per pair; fills may go lighter or deeper, contrast is the
binding constraint, not direction. Decorative hairlines hover toward
`--glass-edge` brightening.

**Aurora/grain:** `ThemeAurora.astro` renders fixed CSS-only radial gradients
(≤8% alpha turquoise/violet) + SVG grain ≈3%. Never behind solid reading
surfaces' text contrast computation (contrast is checked against
`--surface-read`, which aurora does not modify).

## 0b. Component layer (ADR-0031)

```
components/primitives/   Btn, Chip, Kicker, MetaRow, Field, Icon      ← atoms, zero logic
components/ui/           SiteHeader, SiteFooter, Breadcrumbs, EmptyState, Pagination, ThemeAurora
components/patterns/     ArticleCard, ProjectCard, ResearchCard, PublicationRow, CatalogPage (single), DetailShell
components/sections/     HeroSection, PerspectiveGrid, FocusStrip, EvidenceSection, JourneySection, WritingLatest, ContactCTA
components/islands/      React islands with an interaction justification ONLY
lib/format.ts            formatDate/formatNumber — fa Jalali + Persian digits at build time
```

Rules:
- No raw hex/px-gap/ms anywhere outside `global.css`. CI grep enforces this for pages/components.
- No page-local `<style>` block that duplicates a shared class; page styles compose shared classes + variants.
- A catalog page is built from `CatalogPage`; a detail page from `DetailShell`. New copies are defects.

## 1. Stack boundary (updated by ADR-0030/0031)

Authorized NOW under recorded budgets and fallbacks (see ADR-0030 table and
contract §3b): `motion`, `gsap`, `d3`, `three` inside lazy islands only.

Still forbidden without a Task Spec: shadcn/Radix in the public build,
any SSR/Node runtime, any new always-on service.

Island budgets: ≤35KB gzip default; three ≤150KB; d3 ≤60KB. Every island has a
static no-JS fallback carrying the same content.

---

## 2. Legacy light tokens (pre-v2 — valid only for not-yet-migrated pages)

> These remain defined in `global.css` until each page migrates to §0.
> A migrated page MUST NOT consume this table.

Use these names. They are defined in `global.css` under `@theme`.

| Purpose | Token | Value |
|---|---|---|
| Page background | `--color-canvas` | `#f7f8f5` |
| Card / panel | `--color-surface` | `#ffffff` |
| Muted panel | `--color-surface-muted` | `#f1f4f2` |
| Body text | `--color-ink` | `#182328` |
| Secondary text | `--color-ink-secondary` | `#657278` |
| Meta / caption text | `--color-ink-tertiary` | `#7c8a8f` |
| Text on dark | `--color-inverse` | `#ffffff` |
| Primary action | `--color-brand` | `#087c73` |
| Primary hover | `--color-brand-emphasis-hover` | `#0a6a62` |
| Control border (interactive) | `--color-control-border` | `#748682` |
| Brand tint | `--color-brand-soft` | `#e4f7f4` |
| Signature gold | `--color-signature` | `#a77b28` |
| Gold tint | `--color-signature-soft` | `#f3e8cf` |
| Research accent | `--color-research` | `#6047b8` |
| Research tint | `--color-research-soft` | `#eeeaf9` |
| Context accent | `--color-context` | `#137a62` |
| Context tint | `--color-context-soft` | `#e5f2ed` |
| Hairline border | `--color-border-subtle` | `#dde5e3` |
| Strong border | `--color-border-strong` | `#b9c7c3` |
| Focus ring | `--color-focus` | `#087c73` |
| Latin font | `--font-latin` | Inter Variable |
| Persian font | `--font-persian` | Vazirmatn Variable |

### Scales

| Group | Tokens |
|---|---|
| Radius | `--radius-xs` 4px · `--radius-sm` 8px · `--radius-md` 12px · `--radius-lg` 16px · `--radius-xl` 24px · `--radius-pill` |
| Spacing | `--space-1` … `--space-24` on a 4px rhythm (`0.25rem` → `6rem`) |
| Fluid rhythm | `--space-section` (section padding) · `--space-gutter` (page inset) · `--space-sticky-offset` (sticky header height; feeds `html { scroll-padding-top }`) |
| Type | `--text-xs` `--text-sm` `--text-base` `--text-lg` `--text-xl` `--text-2xl` `--text-3xl` `--text-display` |
| Measure | `--measure-prose` 62ch · `--measure-narrow` 42ch · `--measure-page` 1280px |
| Elevation | `--shadow-sm` (resting card) · `--shadow-md` (hover/focus) · `--shadow-lg` (overlay) |
| Motion | `--duration-fast` 140ms · `--duration-base` 200ms · `--duration-slow` 280ms · `--ease-out` · `--ease-in` |
| Glass | `--glass-blur` · `--glass-saturate` · `--glass-bg-dark` / `-light` · `--glass-border-dark` / `-light` · `--glass-shadow-dark` / `-light` · `--glass-solid-dark` / `-light` |

Use a token. Do not write a raw `rgb()`, `px` gap, or `ms` duration in a component.
If you genuinely need a value that does not exist, add it to `global.css` in the same
task and say so in the Work Log.

#### Alias tokens (defined, consume freely)

These names are defined in `global.css` as aliases into the tables above
(single-dictionary rule — do not invent a second meaning):

| Token | Resolves to |
|---|---|
| `--color-ink-muted` | `var(--color-ink-secondary)` |
| `--color-accent` | `var(--color-brand)` |
| `--color-surface-raised` | `var(--color-surface)` |
| `--font-body` / `--font-display` | `var(--font-latin)` |

`design.md` uses different names for the same roles (`--text-primary`,
`--brand-primary`, `--focus-ring`). Those names do **not** exist in the build.
Translate to the table above.

Note: `global.css` declares its token block as `@theme static` so every token
above is emitted to the built CSS even when no utility consumes it yet
(Tailwind v4 otherwise tree-shakes unused variables).

~~Dark mode is out of scope. Do not add a theme toggle.~~
**Superseded (ADR-0031):** there is no dual-theme system and no toggle; the site
adopts a single night theme (`§0`) via the phased migration. Building light-page
variants for migrated pages is a defect.

### Component classes in `global.css`

| Class | Use |
|---|---|
| `.skip-link` | Keyboard skip target, already wired in the layout |
| `.glass-surface` | Shared glass utility — header + Gateway today; v2 glass cards/chips consume it with fill variants |
| `.glass-surface--dark` | Dark chrome variant |
| `.surface-interactive` | A card that responds to hover or focus |

v2 adds (Phase 1+): `.btn` (+`--primary/--ghost/--quiet/--sm`), `.card`,
`.card--row`, `.list-row`, `.chip`, `.kicker`, `.meta-row`, `.empty-state`,
`.container`, `.section`, `.prose` — the single source of component styling;
per-page copies are deleted as pages migrate.

---

## 2b. Glass rules (v2 — ADR-0031)

The philosophy is now **glass-as-signature over solid reading surfaces**:
glass carries the identity of chrome, cards, chips and overlays; text that must
be read at length sits on opaque panels. It is still NOT "blur everything".

Where glass is allowed (v2):

- Sticky site header (strong fill).
- Cards, chips, stat/identity cards, floating controls, Lightbox, More-menu panel.
- Gateway central panel.
- Primary CTA buttons in hero/CTA sections.

Where glass MUST NOT be used:

- Prose/article body, tables, forms, code blocks → these sit on `--surface-read`.
- More than two nested glass layers (no glass-on-glass beyond depth 2).
- Anywhere the label's contrast against its own local fill is below 4.5:1.

The five-part recipe (all five required):

```css
.glass {
  background: var(--glass-fill);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid var(--glass-edge);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 16px 48px rgba(2,8,20,.45);
}
```

1. blur 12–20px + `saturate(150%)` — saturation lets the aurora read through the surface.
2. 1px light edge + inner top highlight (edge refraction).
3. Tinted shadow from the night canvas hue (`rgba(2,8,20,…)`), never raw black.
4. Text never relies on what is behind the blur: contrast is verified against the opaque fallback (`--surface-read` or ≥20% local fill), per rule 2 of the legacy list below which remains binding.
5. Mobile <768px: blur ≤10px; if QA records jank, mobile falls back to the opaque surface entirely.

Non-negotiable rules carried from v1 (still binding):

1. **Always define the opaque fallback first,** then add `backdrop-filter` inside
   `@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))`.
   The only glass `@supports` block is the `.glass-surface` utility in
   `global.css`; never write a second one in a component.
2. **The opaque fallback is the contrast reference.** If it only passes because of the blur, it does not pass.
3. Never combine glass with a drop shadow beyond the single tinted shadow above.
4. Blur is a depth cue, not decoration.

~~Where glass is allowed: … Nowhere else…~~ (legacy v1 list — superseded by the
v2 allow/deny lists above; kept for the migration window where only header and
Gateway are glass.)

Legacy light-glass notes (rule 3 "near-opaque 0.9" applied to light surfaces;
night fills use the §0 alphas instead).

---

## 3b. Motion ladder (v2 — ADR-0031, under ADR-0030 budgets)

Every interaction belongs to exactly one tier. One library per interaction;
CSS/native is evaluated first.

| Tier | Tech | Allowed uses | Budget / guard |
|---|---|---|---|
| M0 functional | CSS transitions | hover/focus/active on all controls; open/close | `--duration-fast/base`; 0KB |
| M1 ambient | CSS keyframes | aurora drift (≤60s alternate); constellation stroke-draw entrance; nothing else loops | 0KB |
| M2 pointer | ~1KB rAF + CSS custom props | spotlight card borders (`--mx/--my`), tilt ≤4°, magnetic CTA ≤6px pull, hero pointer parallax damped | ≤5KB total; `(hover:hover) and (pointer:fine)` only |
| M3 narrative | GSAP ScrollTrigger in a lazy island | Journey timeline draw + node activation; home section reveal stagger ≤6 items | ≤35KB gzip; home route only |
| M4 signature | three / d3 lazy islands | ConstellationHero (mouse-reactive, drag-rotate); TopicGraph research graph (clickable, tooltip) | three ≤150KB · d3 ≤60KB gzip |

Binding for all tiers:
- `prefers-reduced-motion: reduce` ⇒ M1–M4 off; final state rendered statically with full content.
- No JS ⇒ only M0/M1 run; every island's fallback shows the same content statically.
- Animate `transform` and `opacity` only; never layout properties.
- Hero copy renders immediately; no render-blocking imports; islands are `client:visible`.
- Easing language is shared: `--ease-out cubic-bezier(.22,1,.36,1)`; durations 120/160/240/360ms tokens.
- Every animated element must answer "what does this say about Taha or the content?" (design.md §67 anti-rule).
- New specs gate shipping: `qa/budget.spec.mjs` (chunk sizes), `qa/glass-contrast.spec.mjs` (glass label contrast).

---

## 3. Numeric rules

These replace subjective wording. They are checkable.

**Spacing**
- Section vertical padding: `var(--space-section)`.
- Page horizontal inset: `var(--space-gutter)`.
- Card internal padding: `var(--space-6)` (24px) minimum.
- Use the `--space-*` scale. Do not invent 13px or 27px values.

**Type**
- Body text: minimum 16px. Never below 12px anywhere.
- Line height: 1.6 for Latin body, 1.9 for Persian body.
- Prose line length: 60–75 characters. Set a `max-width` around `60ch`.
- One `<h1>` per page. Do not skip heading levels.
- Do not apply Latin letter-spacing to Persian text. Reset it under `[dir="rtl"]`.

**Colour discipline**
- Migrated (night) pages: body text `--ink-hi`, secondary `--ink-mid`, meta `--ink-low`, links/focus `--brand-text` — per §0.
- Legacy (light) pages during migration: body text `--color-ink`; secondary `--color-ink-secondary`;
  meta/captions `--color-ink-tertiary`.
- Maximum three accent hues visible in one viewport: brand family, one context colour, gold.
- Gold is scarce. Per page you may use at most: one short rule or divider
  (≤64px × 3px), one accent stroke inside the identity graphic, one badge.
- Gold MUST NOT be a normal button colour and MUST NOT be body text on any surface.
- Contrast: body text ≥ 4.5:1; large text and UI glyphs ≥ 3:1; night-surface
  floors per §0 (`--ink-mid` ≥7:1, `--ink-low` ≥4.5:1). Verify, do not assume.
- Never encode meaning in colour alone. Add text or a shape.

**Surfaces and elevation**
- v2 default card: `.glass` recipe on the night canvas; hover brightens edge toward `--glass-edge`.
- Reading-heavy cards/panels: opaque `--surface-read` with 1px `--glass-edge` hairline.
- `--shadow-lg` is reserved for overlays. Never on a resting card.
- Do not combine a shadow and a blur beyond the single tinted shadow of §2b.
- Glass allow/deny lists in §2b are binding.

**Interaction**
- ~~Hover-darker rule~~ → **Hover-AA rule (v2, supersedes E2 direction-only rule):**
  a text-bearing fill's hover MUST keep its label ≥4.5:1 against the hover fill —
  verified per pair, on both light (legacy) and night (§0) surfaces. On light legacy
  surfaces this still means darker (e.g. `#0a6a62`); on night surfaces either
  direction is allowed if contrast holds.
- **Control boundary:** interactive controls keep a ≥3:1 boundary vs their canvas:
  legacy `--color-control-border #748682`; night pages use `--glass-edge`
  brightening + focus ring as the boundary cue.
- Minimum touch target 44×44px, including header links and CTAs.
  Named exception (DEFER-0035): **below 224px CSS width**, 36px min-height is
  allowed for header links. Everywhere else the 44px floor holds.
- Every `:hover` style MUST have a matching `:focus-visible` style — the same
  fill, border colour and shadow/glow as hover, while keeping the outline ring.
  Ring colours: `--brand-text` on night surfaces, brand on light surfaces.
  Keyboard parity is not optional.
- The current page MUST be marked with `aria-current="page"` and shown with more
  than colour — the header uses weight plus a 2px rule.
- Transitions use `--duration-fast` or `--duration-base` with `--ease-out`.
- Animate `box-shadow`, `border-color`, `transform` and `opacity` only. Never
  `width`, `height`, `top` or `left` — they reflow and cause layout shift.
- ~~A hover lift is `translateY(-2px)`, and it must be removed under
  `prefers-reduced-motion: reduce` while the colour state stays.~~
  **Struck (DEBT-0013 closed 2026-08-23):** no hover-lift transforms exist in
  the build; hover/focus states are colour-only and are covered by
  `--duration-fast` / `--duration-base`. Reinstate this clause together with
  the first real hover lift.
- Motion is never required to read content.
- Reduced motion: the global kill switch in `global.css`
  (`prefers-reduced-motion: reduce`) zeroes animation/transition durations via
  `var(--reduced-motion-duration, 0.01ms)` — overridable per surface when
  essential feedback needs a longer floor.
- One primary call to action per screen. Secondary actions are visually quieter.

**Icons and images**
- No emoji as an icon, in any state, including empty states.
- Meaningful images need accurate `alt`. Decorative images take `alt=""`.
- Declare `width` and `height` on images to avoid layout shift.

---

## 4. Bilingual rules

- `lang` and `dir` are set on `<html>` per locale.
- Use CSS logical properties: `margin-inline`, `padding-block`, `inset-inline-start`.
  Do not use `left` / `right` for layout.
- Isolate Latin strings inside Persian text with `<bdi>` or `dir="ltr"`:
  DOI, URL, email, code, file names, version numbers.
- Persian body text may be justified. Persian headings must not be.
- Directional icons must flip in RTL.

---

## 5. What makes this site convincing

The audience is PhD admissions and senior industry readers. They scan for proof.

- Show evidence, not adjectives. A publication card with venue, year, and DOI
  beats a paragraph describing research interests.
- Answer "who, what, why, next" above the fold, in text, without JavaScript.
- Every claim should be near the artifact that supports it.
- Prefer one scannable column of real content over three columns of placeholders.
- Whitespace and typography carry the quality. Decoration does not.
- If a section has no real content yet, delete the section.

---

## 6. Definition of done for a visual change

- [ ] Renders and reads with JavaScript disabled.
- [ ] Only tokens are used — §0 (night) for migrated pages, §2 (legacy) for the rest. No raw hex, px gap or ms duration in a component.
- [ ] Checked at 320, 390, 768, 1024, 1280, 1440 px with no horizontal scroll.
- [ ] Checked in both `/fa/` and `/en/`.
- [ ] Keyboard reachable, visible focus, every hover has a focus twin, no hover-only affordance.
- [ ] Contrast verified for new colour pairs — **including hover and focus states**, which is where it usually breaks. Night pages: §0 floors (`--ink-mid` ≥7:1, `--ink-low`/labels ≥4.5:1).
- [ ] Any glass surface follows the five-part recipe, defines its opaque fallback first, and passes contrast against it; glass deny-list respected (no prose/table/form on glass).
- [ ] Motion stays inside its ladder tier (§3b); honours `prefers-reduced-motion: reduce`; island budgets verified by `qa/budget.spec.mjs`.
- [ ] No new dependency added outside ADR-0030's authorized set.
