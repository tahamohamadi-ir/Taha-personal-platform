# Design contract card — buildable rules

Goal:
You can build a page that matches the product's visual identity without reading
`docs/design.md` end to end, and without guessing what "editorial" means.

Source of truth for **tokens that exist today**:
`apps/web/src/styles/global.css`.

Source of truth for **visual intent**:
`docs/design.md`. That file also describes a future stack. See §1.

---

## 1. Stack boundary (DEBT-0001)

`docs/design.md` documents the P3+ target architecture: React islands,
shadcn/ui, Radix, Motion, GSAP, D3, Three.js.

**None of that is installed or used in the public build.**

You MUST NOT import React, shadcn, Radix, GSAP, D3, Three, or Motion without an
approved Task Spec and owner sign-off.

`gsap`, `motion`, and `three` appear in `apps/web/package.json` as locked, unused
dependencies (`DEBT-0003`). Their presence is not permission to use them.

What you may use today:
Astro components, plain CSS, Tailwind v4 utilities, and the tokens below.

---

## 2. Tokens that actually exist

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

Dark mode is out of scope. Do not add a theme toggle.

### Component classes in `global.css`

| Class | Use |
|---|---|
| `.skip-link` | Keyboard skip target, already wired in the layout |
| `.glass-surface` | Sticky header only (light variant; opaque-first fallback built in) |
| `.glass-surface--dark` | Language Gateway panel only — adds dark chrome + shadow to `.glass-surface` |
| `.surface-interactive` | A card that responds to hover or focus (documented, not yet in build — E8) |

---

## 2b. Glass rules

The philosophy is **solid-first with selective glass**, not a glassmorphism site.

Where glass is allowed:

- The Language Gateway panel, over the dark constellation field.
- The sticky site header, over scrolling page content.

Nowhere else. Never behind prose, tables, forms, or anything that must stay
readable over arbitrary content.

Non-negotiable rules:

1. **Always define the opaque fallback first,** then add `backdrop-filter` inside
   `@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))`.
   A browser without blur support must get a solid, readable surface — not a
   washed-out translucent one.
   **Implemented once (DEBT-0012 closed 2026-08-23):** the only glass
   `@supports` block in the build is the `.glass-surface` /
   `.glass-surface--dark` utility in `apps/web/src/styles/global.css`. Header
   and Gateway consume it; never write a second `@supports` glass pattern in a
   component.
2. **The opaque fallback is the contrast reference.** Verify text contrast against
   the solid colour. If it only passes because of the blur, it does not pass.
3. **Light glass stays near-opaque** (`0.9`). The header scrolls over unknown
   content, and `--color-ink-secondary` on canvas is about 4.6:1 — there is no
   headroom to spend on transparency.
4. **Never combine glass with a drop shadow on the same element** beyond the
   single `--glass-shadow-*` token.
5. Blur is a depth and dismissal cue, not decoration.

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
- Body text uses `--color-ink`. Secondary uses `--color-ink-secondary`.
  Meta, captions, and file sizes use `--color-ink-tertiary`.
- Maximum three accent hues visible in one viewport: brand, one context colour, gold.
- Gold is scarce. Per page you may use at most: one short rule or divider
  (≤64px × 3px), one accent stroke inside the identity graphic, one badge.
- Gold MUST NOT be a normal button colour and MUST NOT be body text on white.
- Contrast: body text ≥ 4.5:1; large text and UI glyphs ≥ 3:1. Verify, do not assume.
- Never encode meaning in colour alone. Add text or a shape.

**Surfaces and elevation**
- Default card: `--color-surface` on `--color-canvas`, 1px `--color-border-subtle`, `--shadow-sm`.
- Hover or focus raises exactly one step: `--shadow-md` plus `--color-border-strong`.
- `--shadow-lg` is reserved for overlays. Never on a resting card.
- Do not combine a shadow and a blur on the same element.
- Glass tokens are for the Gateway and the header only. See §2b.

**Interaction**
- **Hover-darker rule (E2/KI-0003, 2026-08-23):** on light surfaces, a
  text-bearing fill's hover MUST be **darker** than its rest state, never
  lighter. Primary hover = `--color-brand-emphasis-hover` `#0a6a62`
  (white-on-hover 5.4:1). `#0d9689`/`#16b8a6` are for dark surfaces and large
  graphics only.
- **Control boundary (E2/KI-0004):** interactive controls (buttons, inputs,
  selects, ghost CTAs) use `--color-control-border` `#748682` (3:1 on canvas).
  `--color-border-subtle/strong` remain for decorative card hairlines.
- Minimum touch target 44×44px, including header links and CTAs.
  Named exception (DEFER-0035): **below 224px CSS width** (`max-width: 14rem`
  zoom-safety grid in `Header.astro`), 36px min-height is allowed for header
  links. Everywhere else the 44px floor holds.
- Every `:hover` style MUST have a matching `:focus-visible` style — the same
  fill, border colour and shadow/glow as hover, while keeping the outline ring.
  Ring colours: inverse/white on navy surfaces, brand on light surfaces
  (the global `--color-focus` outline is the default). Keyboard parity is not optional.
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
- [ ] Only tokens from §2 are used. No raw hex, px gap or ms duration in a component.
- [ ] Checked at 320, 390, 768, 1024, 1280, 1440 px with no horizontal scroll.
- [ ] Checked in both `/fa/` and `/en/`.
- [ ] Keyboard reachable, visible focus, every hover has a focus twin, no hover-only affordance.
- [ ] Contrast verified for new colour pairs — **including hover and focus states**,
      which is where it usually breaks.
- [ ] Any glass surface defines its opaque fallback first and passes contrast against it.
- [ ] Motion honours `prefers-reduced-motion: reduce` (global overridable kill switch).
- [ ] No new dependency added.
