# Design contract card — buildable rules

Goal:
You can build a page that matches the product's visual identity without reading
`docs/design.md` end to end, and without guessing what "editorial" means.

Source of truth for **tokens — Light is live, Dark is design-target**:
`apps/web/src/styles/global.css` is the **runtime authority**; `Assets/site-redesign/implementation-reference/agent-kit/tokens.json` v1.1.0 is the **contract** that defines both Light (runtime-authoritative) and Dark (design-target) semantic roles. They MUST agree byte-for-role on Light; Dark becomes runtime only when ATLAS-01 is accepted. See `MASTER-SPEC.md` §6.

Source of truth for **visual intent (next-gen)**:
`Assets/site-redesign/implementation-reference/MASTER-SPEC.md` §6 + `agent-kit/tokens.json` / `components.json` / `templates.json`.
`docs/design.md` is **history / deep reference** and does not own current runtime tokens — `global.css` does.

---

## 1. Stack boundary

Target public stack (ATLAS, `MASTER-SPEC.md` §2): **Astro 7 + TypeScript + Tailwind v4 + React islands only.** Public content MUST remain semantic and readable without JavaScript; React is an island, never the public-site shell.

Bounded motion/visual libraries — **installed but not active without an approved packet:**

- `motion`, `gsap`, and `three` appear in `apps/web/package.json` as locked, unused dependencies. **Presence is not permission.** They MAY be activated only by the packet that owns their runtime use (ATLAS-10 graph tasks: `MASTER-SPEC.md` §7–8, G7/G8). Do not import them in any other task without a Task Spec and owner sign-off.
- `shadcn/ui` / Radix primitives are **admin-only** (custom React SPA at `/admin/`) if used at all — never in the public Astro build without an approved Task Spec.

What you may use today in `apps/web` public routes:
Astro components, plain CSS, Tailwind v4 utilities, and the tokens in §2. No Storybook, no design SaaS, no new always-on service.

---

## 2. Tokens that actually exist

### 2.0 Authority

- `tokens.json: authority.runtime = apps/web/src/styles/global.css`
- `tokens.json: semanticLight.status = "runtime-authoritative"` — Dark is `"design-target"` until ATLAS-01 lands.
- Themes change **tokens, illumination, and depth — not DOM anatomy or content** (`MASTER-SPEC.md` §6).

Use token names. They are defined in `global.css` under `@theme static` and in `tokens.json`.

### 2.1 Light — runtime-authoritative (live)

This table is live. `global.css` and `tokens.json:semanticLight` MUST agree byte-for-role. Dark values in §2.2 are not live yet.

| Purpose | Token | Value |
|---|---|---|
| Page background | `--color-canvas` | `#f7f8f5` |
| Card / panel | `--color-surface` | `#ffffff` |
| Muted panel | `--color-surface-muted` | `#f1f4f2` |
| Body text | `--color-ink` | `#182328` |
| Secondary text | `--color-ink-secondary` | `#616e74` |
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
| Danger / destructive | `--color-danger` | `#b3261e` |
| Latin font (runtime) | `--font-latin` | `Inter Variable` |
| Persian font (runtime) | `--font-persian` | `Vazirmatn Variable` |

Runtime bilingual pair (live): **Inter Variable** (EN) + **Vazirmatn Variable** (FA) — 2 families max per locale. Display targets per `MASTER-SPEC.md` §6 / `tokens.json:type` — **Newsreader** (EN) + **Estedad** (FA) — are **design-target, pending ATLAS token task**. Do not activate display fonts until that packet lands; when they do, the per-locale 2-family cap still holds (body + display).

### 2.2 Dark — runtime-ready behind [data-theme="dark"] (WF-01)

Dark semantic roles are now LANDED in `global.css` behind `[data-theme="dark"]` (runtime-ready) and MUST match `tokens.json:semanticDark` byte-for-role — enforced by `apps/web/qa/design-tokens.spec.mjs`. Default theme activation is `system` per owner decision 2026-08-26; the ThemeToggle UI itself is WF-03 scope. Do not ship Dark values by hand-editing a component.

| Purpose | Token | Dark target |
|---|---|---|
| Page background | `--color-canvas` | `#071225` |
| Card / panel | `--color-surface` | `#0b1630` |
| Muted panel | `--color-surface-muted` | `#122343` |
| Body text | `--color-ink` | `#f7f3ea` |
| Secondary text | `--color-ink-secondary` | `#b8c5cc` |
| Meta / caption text | `--color-ink-tertiary` | `#8797a0` |
| Text on dark | `--color-inverse` | `#071225` |
| Primary action | `--color-brand` | `#16b8a6` |
| Primary hover | `--color-brand-emphasis-hover` | `#42d1c2` |
| Brand tint | `--color-brand-soft` | `#103b40` |
| Signature gold | `--color-signature` | `#c89b3c` |
| Gold tint | `--color-signature-soft` | `#332b1c` |
| Research accent | `--color-research` | `#8b75dc` |
| Research tint | `--color-research-soft` | `#272341` |
| Context accent | `--color-context` | `#42a98c` |
| Context tint | `--color-context-soft` | `#17372f` |
| Hairline border | `--color-border-subtle` | `#263955` |
| Strong border | `--color-border-strong` | `#405476` |
| Control border | `--color-control-border` | `#71839e` |
| Focus ring | `--color-focus` | `#6be6d9` |
| Danger / destructive | `--color-danger` | `#ef6b68` |

Primitive reference (both themes): `navy950 #071225`, `navy900 #0b1630`, `navy800 #122343`, `turquoise500 #16b8a6`, `turquoise600 #0d9689`, `turquoise700 #087c73`, `gold500 #c89b3c`, `gold600 #a77b28`, `purple500 #6047b8`, `emerald500 #137a62`, `coral500 #d45f45`.

### Scales (live contract — `tokens.json:spacing/radius/type/motion/layout`)

| Group | Tokens |
|---|---|
| Radius | `--radius-xs` 4px · `--radius-sm` 8px · `--radius-md` 12px · `--radius-lg` 16px · `--radius-xl` 24px · `--radius-pill` 999px |
| Spacing | `--space-1` … `--space-24` on a 4px rhythm (`0.25rem` → `6rem`: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96) |
| Fluid rhythm | `--space-section` (section padding) · `--space-gutter` (page inset) · `--space-sticky-offset` (sticky header height; feeds `html { scroll-padding-top }`) |
| Type | `--text-xs` 12px · `--text-sm` 14px · `--text-base` 16px · `--text-lg` 18px · `--text-xl` 20px · `--text-2xl` 24px · `--text-3xl` 30px · `--text-display` clamp(32→48px) |
| Measure | `--measure-prose` 62ch · `--measure-narrow` 42ch · `--measure-page` 1280px |
| Elevation | `--shadow-sm` (resting card) · `--shadow-md` (hover/focus) · `--shadow-lg` (overlay) |
| Motion | `--duration-fast` 140ms · `--duration-base` 200ms · `--duration-slow` 280ms · `--ease-out` cubic-bezier(0.2, 0.8, 0.2, 1) · `--ease-in` cubic-bezier(0.4, 0, 1, 1) · scale max 1.02 |
| Layout | `--space-gutter` / `--space-section` + breakpoint checks 320 / 390 / 768 / 1024 / 1280 / 1440 · columns 4/8/12 · card padding min 24px · touch target min 44px |
| Glass | `--glass-blur`/`--glass-blur-light` 10px · `--glass-blur-dark` 16px · `--glass-saturate` 120% · `--glass-bg-dark`/`-light` · `--glass-border-dark`/`-light` · `--glass-shadow-dark`/`-light` · `--glass-solid-dark` `#0b1630` / `-light` `#f7f8f5` |

Use a token. Do not write a raw `rgb()`, `px` gap, or `ms` duration in a component.
If you genuinely need a value that does not exist, add it to `global.css` + `tokens.json` in the same ATLAS-01 task and say so in the Work Log.

#### Alias tokens (defined in `global.css`, consume freely)

These names are defined in `global.css` as aliases into the tables above
(single-dictionary rule — do not invent a second meaning):

| Token | Resolves to |
|---|---|
| `--color-ink-muted` | `var(--color-ink-secondary)` |
| `--color-ink-tertiary` | `#7c8a8f` (Light) — Dark target `#8797a0` |
| `--color-accent` | `var(--color-brand)` |
| `--color-surface-raised` | `var(--color-surface)` |
| `--font-body` / `--font-display` | `var(--font-latin)` (until display-font packet lands) |

`design.md` uses different names for the same roles (`--text-primary`,
`--brand-primary`, `--focus-ring`). Those names do **not** exist in the build.
Translate to the table above.

Note: `global.css` declares its token block as `@theme static` so every token
above is emitted to the built CSS even when no utility consumes it yet
(Tailwind v4 otherwise tree-shakes unused variables).

### Component classes in `global.css` (live)

| Class | Use |
|---|---|
| `.skip-link` | Keyboard skip target, already wired in the layout |
| `.glass-surface` | Sticky header only (light variant; opaque-first fallback built in) |
| `.glass-surface--dark` | Language Gateway panel only — adds dark chrome + shadow to `.glass-surface` |
| `.surface-interactive` | A card that responds to hover or focus (documented, not yet in build — E8) |
| `.empty-state` | Honest empty panel for catalog indexes (max 60ch, muted surface) |
| `.visually-hidden` | Screen-reader only |

### Upcoming primitives (ATLAS, not yet built — `agent-kit/components.json` v1.0.0)

24 core components — **design-target**, tracked by G2. Do not hand-roll a second button/card outside these when the packet is active; map to the primitive instead.

`Button` (primary/secondary/quiet) · `IconButton` · `Link` · `Chip` (neutral/selected/taxonomy) · `Badge` · `ThemeToggle` · `LanguageToggle` · `Header` · `Breadcrumbs` · `LocalTabs` · `FilterBar` · `Pagination` · `SectionLead` · `Card` (default/research/editorial/visual) · `FeaturedRecord` · `ContentRow` · `PublicationRow` · `MetadataGroup` · `TimelineNode` · `MediaTile` · `TOCItem` · `ContactCTA` · `Input` · `Textarea`

Shared states every interactive primitive MUST handle: `rest` / `hover` / `focus-visible` / `active`(+`selected`) / `disabled` (only for a real unavailable action) / `loading` (stable geometry) / `empty` / `no-results` / `error` (recovery) / `unavailable-translation` / `reduced-motion`. See `components.json:sharedRules` and G2/G5 gates.

---

## 2b. Glass rules

The philosophy is **solid-first with selective glass**, not a glassmorphism site (`MASTER-SPEC.md` §6: "Glass is restricted to the Language Gateway panel and sticky Header").

Where glass is allowed:

- The Language Gateway panel, over the dark constellation field.
- The sticky site header, over scrolling page content.

Nowhere else. Never behind prose, tables, forms, or anything that must stay
readable over arbitrary content. A theme change swaps tokens, illumination, and depth — never DOM anatomy to achieve glass.

Non-negotiable rules:

1. **Always define the opaque fallback first,** then add `backdrop-filter` inside
   `@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))`.
   A browser without blur support must get a solid, readable surface — not a
   washed-out translucent one.
   **Implemented once (DEBT-0012 closed 2026-08-23):** the only glass
   `@supports` block in the build is the `.glass-surface` /
   `.glass-surface--dark` utility in `apps/web/src/styles/global.css`. Header
   and Gateway consume it; never write a second `@supports` glass pattern in a
   component. Dark variant uses `--glass-bg-dark`/`--glass-border-dark`/`--glass-shadow-dark`/`--glass-solid-dark`; light header uses `--glass-bg-light`/`--glass-border-light`/`--glass-shadow-light`/`--glass-solid-light`.
2. **The opaque fallback is the contrast reference.** Verify text contrast against
   the solid colour in **both** Light and Dark. If it only passes because of the blur, it does not pass.
3. **Light glass stays near-opaque** (`0.82–0.9` in token). The header scrolls over unknown
   content, and `--color-ink-secondary` on canvas is about 4.6:1 in Light — there is no
   headroom to spend on transparency. Dark glass (`0.62`) is chrome over a known navy field and still MUST pass its own contrast floor.
4. **Never combine glass with a drop shadow on the same element** beyond the
   single `--glass-shadow-*` token.
5. Blur is a depth and dismissal cue, not decoration. Content MUST remain readable with `backdrop-filter` disabled.

---

## 3. Numeric rules

These replace subjective wording. They are checkable.

**Spacing**
- Section vertical padding: `var(--space-section)`.
- Page horizontal inset: `var(--space-gutter)`.
- Card internal padding: `var(--space-6)` (24px) minimum.
- Use the `--space-*` scale (1–24: 4px → 96px, §2). Do not invent 13px or 27px values.

**Type**
- Body text: minimum 16px (`--text-base`). Never below 12px anywhere.
- Line height: **1.6 for Latin body, 1.9 for Persian body** (`tokens.json:type.lineHeight`) — see §4.
- Prose line length: **62ch** (`--measure-prose`). Set `max-width: var(--measure-prose)`. Narrow measures: `42ch` for side panels.
- Page measure: `1280px` (`--measure-page`).
- One `<h1>` per page. Do not skip heading levels.
- Do not apply Latin letter-spacing to Persian text. Reset it under `[dir="rtl"]` / `:lang(fa)`.
- Type scale: `xs` 12 → `display` clamp 32–48px (§2). Never hand-tune a size outside the scale.

**Colour discipline**
- Body text uses `--color-ink`. Secondary uses `--color-ink-secondary`.
  Meta, captions, and file sizes use `--color-ink-tertiary`.
- Maximum three accent hues visible in one viewport: brand, one context colour, gold.
- Gold is scarce. Per page you may use at most: one short rule or divider
  (≤64px × 3px), one accent stroke inside the identity graphic, one badge.
- Gold MUST NOT be a normal button colour and MUST NOT be body text on white.
- Contrast (WCAG 2.2 AA, `MASTER-SPEC.md` §9, G1): body text ≥ 4.5:1; large text (≥18px bold or ≥24px) and non-text UI glyphs ≥ 3:1. Verify **both** Light and Dark pairs once Dark is active — do not assume Dark passes because Light did.
- Never encode meaning in colour alone. Add text or a shape (`Badge` rule: "meaning never color-only").

**Surfaces and elevation**
- Default card: `--color-surface` on `--color-canvas`, 1px `--color-border-subtle`, `--shadow-sm`.
- Hover or focus raises exactly one step: `--shadow-md` plus `--color-border-strong`.
- `--shadow-lg` is reserved for overlays. Never on a resting card.
- Do not combine a shadow and a blur on the same element (except the single `--glass-shadow-*` on the two allowed glass surfaces).
- Glass tokens are for the Gateway and the header only. See §2b.

**Interaction**
- **Hover-darker rule (E2/KI-0003, 2026-08-23):** on light surfaces, a
  text-bearing fill's hover MUST be **darker** than its rest state, never
  lighter. Primary hover = `--color-brand-emphasis-hover` `#0a6a62`
  (white-on-hover 5.4:1). `#0d9689`/`#16b8a6` are for dark surfaces and large
  graphics only. In Dark, hover pairs are `#16b8a6` → `#42d1c2` per `tokens.json:semanticDark` — still verify contrast.
- **Control boundary (E2/KI-0004):** interactive controls (buttons, inputs,
  selects, ghost CTAs) use `--color-control-border` `#748682` Light / `#71839e` Dark (≥3:1 on canvas).
  `--color-border-subtle/strong` remain for decorative card hairlines.
- Minimum touch target **44×44px** (`tokens.json:layout.touchTargetMin`), including header links and CTAs.
  Named exception (DEFER-0035): **below 224px CSS width** (`max-width: 14rem`
  zoom-safety grid in `Header.astro`), 36px min-height is allowed for header
  links. Everywhere else the 44px floor holds. ATLAS `components.json:sharedRules.targetMin = 44px` restates this.
- Every `:hover` style MUST have a matching `:focus-visible` style — the same
  fill, border colour and shadow/glow as hover, while keeping the outline ring.
  Ring colours: inverse/white on navy surfaces, brand on light surfaces
  (the global `--color-focus` outline is the default; Dark focus is `#6be6d9`). Keyboard parity is not optional (G2).
- The current page MUST be marked with `aria-current="page"` and shown with more
  than colour — the header uses weight plus a 2px rule.
- Transitions use `--duration-fast` 140ms or `--duration-base` 200ms with `--ease-out`; `--duration-slow` 280ms for open/close only. Scale max 1.02 where allowed.
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
  essential feedback needs a longer floor. `tokens.json:motion.reduced` restates: `0.01ms`, `transform: none`, `continuousMotion: false`, graph falls back to `2d-or-list`.
- One primary call to action per screen. Secondary actions are visually quieter (`Button` variants `primary`/`secondary`/`quiet`).

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
- Line-height: **Latin 1.6, Persian 1.9** (`tokens.json:type.lineHeight`). Measure `62ch` for prose; headings are never justified.
- Persian body text may be justified. Persian headings must not be.
- Directional icons must flip in RTL. Logo and meaning-bearing graph topology do not mirror; mail/download/external/search/status icons do not flip (`MASTER-SPEC.md` §6).
- Do not apply Latin `letter-spacing` to Persian text. Reset it under `[dir="rtl"]`.

---

## 4b. Atlas isolation

The Component Playground / Visual Atlas is **local-only**:

- It runs only with `DESIGN_ATLAS=1` (e.g. `npm run atlas` via `apps/web/scripts/design-atlas.mjs` → conditional `injectRoute` for `/_design/` in `apps/web/astro.config.mjs`).
- Default `npm run build` MUST NOT contain `/_design/`, atlas fixtures, or atlas navigation. Atlas is absent from sitemap, Pagefind, and public navigation (G4).
- Atlas imports real production components and tokens; it MUST NOT copy their markup into a second library and MUST NOT be a content source.
- Atlas fixtures live outside public content loaders, are labelled `unpublished: true`, and contain no real private contact data or invented academic facts (`AGENT-COORDINATION.md: AtlasFixture`).
- Stable selectors for Playwright screenshots MUST exist (`MASTER-SPEC.md` §7).
- Approval gate: **G4 — Visual Atlas isolation** in `ACCEPTANCE-GATES.md`.

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
- [ ] Only tokens from §2 are used. No raw hex, px gap or ms duration in a component. Light and Dark roles (when Dark is active) agree with `tokens.json` byte-for-role (G1).
- [ ] Checked at **320, 390, 768, 1024, 1280, 1440 px** (`tokens.json:layout.breakpointChecks`) with no horizontal scroll.
- [ ] Checked in both `/fa/` and `/en/` (RTL/LTR logical properties, correct font, isolated LTR strings).
- [ ] Keyboard reachable, visible focus in both themes and over allowed glass, every hover has a focus twin, no hover-only affordance (G2, G9).
- [ ] Contrast verified for new colour pairs — **including hover and focus states and both themes once Dark is active** (G1).
- [ ] Any glass surface defines its opaque fallback first and passes contrast against it (G1, §2b).
- [ ] Motion honours `prefers-reduced-motion: reduce` (global overridable kill switch; graph falls back to 2D/list).
- [ ] No new dependency added unless its packet owns it (motion/GSAP/Three → ATLAS-10 only).
- [ ] Default `npm run build` contains no `/_design/` output (G4).
- [ ] If a new primitive was needed, it maps to `components.json` 24 and satisfies G2 states (rest/hover/focus-visible/active/disabled/loading/empty/no-results/error/unavailable-translation/reduced-motion).
