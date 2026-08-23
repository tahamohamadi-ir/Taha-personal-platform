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
| Primary hover | `--color-brand-emphasis` | `#0d9689` |
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
| Fluid rhythm | `--space-section` (section padding) · `--space-gutter` (page inset) |
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
| `.glass-light` | Sticky header only |
| `.glass-dark` | Language Gateway panel only |
| `.surface-interactive` | A card that responds to hover or focus |

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
- Minimum touch target 44×44px, including header links and CTAs.
- Every `:hover` style MUST have a matching `:focus-visible` style. Keyboard parity is not optional.
- The current page MUST be marked with `aria-current="page"` and shown with more
  than colour — the header uses weight plus a 2px rule.
- Transitions use `--duration-fast` or `--duration-base` with `--ease-out`.
- Animate `box-shadow`, `border-color`, `transform` and `opacity` only. Never
  `width`, `height`, `top` or `left` — they reflow and cause layout shift.
- A hover lift is `translateY(-2px)`, and it must be removed under
  `prefers-reduced-motion: reduce` while the colour state stays.
- Motion is never required to read content.
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
- [ ] Hover lift removed under `prefers-reduced-motion`.
- [ ] No new dependency added.
