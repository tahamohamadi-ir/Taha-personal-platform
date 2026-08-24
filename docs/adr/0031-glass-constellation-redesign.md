# ADR-0031 — Redesign v2 «Glass Constellation»: dark-first visual identity, component layer, and motion ladder

**Status:** ACCEPTED (owner in-session attestation, 2026-08-24)
**Decides:** the public-site visual identity switches from light-only editorial to a dark-first glassmorphism system («Glass Constellation»); the component architecture adopts primitives/ui/patterns/sections/islands layers; motion is organized in a five-tier ladder under ADR-0030 budgets.
**Supersedes (visual intent only, NOT architecture):**
- The "Solid-first + Selective Glass" surface philosophy of `docs/design.md` §12–§14 → replaced by **glass-as-signature with mandatory solid reading surfaces** (§2b of DESIGN-CONTRACT v2).
- `reDesign_plan.md` v1 (Editorial Minimal paper theme) → archived; its engineering decisions (variable fonts, build-time Jalali dates, RTL logical properties, single CatalogPage) are **absorbed into v2**, not discarded.
- `DEFER-0025` framing ("dark mode deferred") → resolved differently: the site becomes **dark-only by default** (single night theme), not dual-theme. No toggle, no prefers-color-scheme branching.

**Owner attestation (2026-08-24):** «سبک Glassmorphism دوست دارم؛ Three.js و D3 و GSAP و island و interactive؛ حتی تغییرات با هر حرکت موس؛ Hero متحرک؛ landing جذاب که مخاطب را به ادامه ترغیب کند؛ عرض متن و فضای منفی/مثبت با هم تناسب داشته باشند و از یک الگو پیروی کنند.»

## Decision

### 1. Visual identity — Glass Constellation

- **Canvas:** deep navy (`--canvas-night #071225`, sections `--canvas-deep #0B1630`) site-wide, including Gateway, header, footer, and content pages. The current light canvas (`#f7f8f5`) is retired at the end of the migration phases.
- **Ambient depth:** fixed aurora radial-gradients (turquoise/violet, ≤8% alpha) + one SVG grain overlay (≈3% opacity). Aurora is CSS-only (M1 tier), zero JS.
- **Glass surfaces** carry the identity: filled glass cards/chips/header with `backdrop-filter: blur+saturate`, 1px edge + inner top highlight, tinted shadow — full recipe in `DESIGN-CONTRACT.md` §2b v2.
- **Reading surfaces stay solid:** long-form prose, tables, forms, code render on opaque panels (`--surface-read`) on the night canvas. Contrast is computed against the opaque fallback, never against blurred content.
- **Signature accent:** turquoise brand (`#16B8A6` family) + gold signature marks (`--gold #E3B95C`, budget ≤4% of surface) + violet for research/AI nodes.
- **Hero:** the identity constellation (Design→Interaction→Engineering→Data→AI→HCIS) is the brand mark; desktop gets the upgraded Three.js island (mouse-reactive, drag-rotate, damped), mobile/reduced-motion/no-JS get the static SVG with CSS stroke-draw entrance.

### 2. Component architecture

```
components/primitives/   Btn, Chip, Kicker, MetaRow, Field, Icon
components/ui/           SiteHeader, SiteFooter, Breadcrumbs, EmptyState, Pagination, ThemeAurora
components/patterns/     ArticleCard, ProjectCard, ResearchCard, PublicationRow, CatalogPage (single), DetailShell
components/sections/     HeroSection, PerspectiveGrid, FocusStrip, EvidenceSection, JourneySection, WritingLatest, ContactCTA
components/islands/      ConstellationHero.tsx (three), TopicGraph.tsx (d3), JourneyScroll.tsx (gsap), Lightbox.tsx
lib/format.ts            formatDate / formatNumber (fa: Jalali+Persian digits at build time)
```

Page-local `<style>` blocks and per-page catalog style copies are deleted as each page migrates to the shared classes/components.

### 3. Motion ladder (normative; details in DESIGN-CONTRACT §3b)

| Tier | Tech | Scope | Budget |
|---|---|---|---|
| M0 functional | CSS transitions | all hover/focus/active | 0KB |
| M1 ambient | CSS keyframes | aurora drift, constellation stroke-draw entrance | 0KB |
| M2 pointer | ~1KB rAF + CSS vars | spotlight borders, card tilt ≤4°, magnetic CTA, hero parallax | ≤5KB, `(hover:hover) and (pointer:fine)` only |
| M3 narrative | GSAP ScrollTrigger (lazy island) | Journey timeline draw, home reveal stagger | ≤35KB gzip, home only |
| M4 signature | three / d3 (lazy islands) | ConstellationHero, TopicGraph | three ≤150KB · d3 ≤60KB gzip |

Non-negotiables carried from ADR-0030/B5 unchanged: no-JS readable everywhere; `prefers-reduced-motion` ⇒ M0 only; transform/opacity only; hero copy renders immediately; one library per interaction.

### 4. What does NOT change

Architecture (Astro static-first + React islands only), routes/slugs/IA (`IA-CONTRACT.md` untouched except none), CMS contracts, SEO/sitemap/RSS/hreflang, no-JS contract, bilingual independence, deploy pipeline, and the four owner constraints of the master board. This ADR changes **how the site looks and moves**, not what it is or serves.

## Consequences

- `docs/design.md` remains the vision reference but its §12–§14 surface philosophy and light-theme token tables are superseded by this ADR + `reDesign_plan.md` v2 until `design.md` is revised in the same task that lands Phase 0 tokens.
- `DEFER-0025` (dark mode) closes as **WONTFIX-dual-theme**: there is no second theme to build; the single night theme ships with the redesign. Ledger updated accordingly.
- The E2 hover-darker rule is re-derived for dark surfaces: on night canvas, text-bearing fills hover **lighter-or-deeper within AA** — the binding rule becomes "hover state MUST keep ≥4.5:1 against its own label", verified per pair (see contract §3).
- `KI-0003/0004/0005` fixes remain valid history; their specific hex values were light-surface decisions and do not transfer to night tokens.
- New QA specs required: `qa/glass-contrast.spec.mjs`, `qa/budget.spec.mjs`.
- Implementation proceeds phase-by-phase per `reDesign_plan.md` §8; every phase keeps `npm run check/build` green and the existing Playwright specs passing.
