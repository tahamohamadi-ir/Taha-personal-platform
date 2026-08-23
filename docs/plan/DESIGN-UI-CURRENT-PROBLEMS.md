# Current design / UI problems

> Status: **findings only** — nothing here is implemented or authorized.
> Date: 2026-08-22.
> Companion: `docs/plan/DESIGN-UI-UX-IMPROVEMENT-PROPOSALS.md` (suggestions,
> including for rules that are already documented).
> Index: `docs/plan/DESIGN-UI-UX-IMPROVEMENT-REVIEW.md`.
>
> Scope: public frontend (`apps/web/`). Admin SPA is out of scope.
> Method: source + `apps/web/dist/` (built 2026-08-19) + WCAG 2.1 contrast math.
> No browser was opened. Layout collapse in P1 is inferred from CSS cascade.

This file lists **current problems**: the live site, or the documents that
agents follow, do not match each other or do not meet the project's own rules.

It does not list taste. Taste is in the companion proposals file.

Canonical ledgers (`known-issues.md`, `TECH_DEBT.md`, `RISK_REGISTER.md`) were
not written in this pass. Highest IDs in this working copy: `KI-0001`,
`DEBT-0007`, `RISK-0013`, `DEFER-0032`, `LOG-0216`.

---

## Severity key

| Level | Meaning |
|---|---|
| CRITICAL | Visitor-visible layout or hierarchy is broken on live routes |
| HIGH | Accessibility or contract failure on a primary control |
| MEDIUM | Real defect, smaller surface or workaround exists |
| LOW | Divergence that will cause the next edit to go wrong |

---

## Inventory

| ID | Severity | Kind | Problem |
|---|---|---|---|
| P1 | **CRITICAL** | live CSS | 23 custom properties used, never defined. About detail routes lose padding, measure, and heading size. |
| P2 | **HIGH** | docs | `DESIGN-CONTRACT.md` §2 lists tokens and classes that do not exist. This caused P1. |
| P3 | **HIGH** | a11y | Primary CTA hover text is 3.66:1. Fails WCAG AA. |
| P4 | **HIGH** | a11y | Ghost/secondary control border is 1.64:1. Fails SC 1.4.11. |
| P5 | MEDIUM | a11y | Secondary text on muted panels is 4.48:1. |
| P6 | MEDIUM | a11y | Language Gateway hover has no `:focus-visible` twin. |
| P7 | MEDIUM | a11y | Skip link lands behind the sticky header. |
| P8 | MEDIUM | a11y | Gateway kicker is 11.2px. Header zoom breakpoint drops targets to 36px. |
| P9 | MEDIUM | tokens | Components use primitive gold/turquoise/purple. Gold marks are 2.40:1. |
| P10 | MEDIUM | design | Landing page exceeds the documented gold budget. |
| P11 | MEDIUM | risk | CMS `--color-brand` override can break AA with no build failure. |
| P12 | MEDIUM | IA | Search `noscript` browse links still point at `/{locale}/blog/`. |
| P13 | MEDIUM | IA | Live P8 catalogs are not in header/footer. Findability vs honesty unresolved. |
| P14 | MEDIUM | visual | `--font-display` / `--color-ink-muted` undefined → type and meta colour flatten. |
| P15 | LOW | glass | Header and Gateway use two different `@supports` patterns. |
| P16 | LOW | contract | Contract constrains hover-lift motion that does not exist. |
| P17 | LOW | search | Pagefind default UI is unstyled against the design system. |
| P18 | LOW | hover | Footer, 404, social links, ghost CTA missing focus twins. |
| P19 | LOW | docs | `design.md` header still names shadcn/Radix/Motion as the UI foundation. |

---

## P1 (CRITICAL) — Undefined tokens collapse About layout

Twenty-three properties are referenced in `apps/web/src` and declared nowhere
in `global.css` or in the built CSS:

```
--space-1 … --space-8  --space-10  --space-section  --space-gutter
--measure-prose  --measure-page  --text-display
--color-ink-muted  --color-ink-tertiary  --color-accent  --color-surface-raised
--font-display  --font-body
```

In `apps/web/dist`: 38 `var(--space-section)` uses, 22 `var(--color-ink-muted)`
uses, **zero** declarations.

Non-inherited properties (`padding`, `gap`, `max-width`, `font-size`) become
`initial`. Worst files:

- `apps/web/src/pages/[locale]/about/[section]/index.astro`
- `apps/web/src/pages/[locale]/about/[section]/[slug].astro`
- `apps/web/src/components/TranslationUnavailable.astro`

Expected live result: no section padding, no page gutter, prose at full window
width, `<h1>` at browser-default 16px.

`--color-accent`, `--color-surface-raised`, `--font-body` have inline fallbacks
and are harmless. The rest are not.

**Fix direction:** define the scale in `global.css` (see P2). Do not patch 50
components.

## P2 (HIGH) — The contract documents a token system that is not in the build

`docs/contracts/DESIGN-CONTRACT.md` §2 is titled “Tokens that actually exist”
and says they live in `global.css` `@theme`. Missing entirely:

- spacing `--space-*`, `--space-section`, `--space-gutter`
- type `--text-*`
- measure `--measure-*`
- elevation `--shadow-*`
- motion `--duration-*`, `--ease-*`
- most radius tokens
- `--color-ink-tertiary`
- most glass tokens

Documented component classes `.glass-light`, `.glass-dark`,
`.surface-interactive` **do not exist**. `.skip-link` does.

Tailwind v4 supplies *some* names (`--text-sm`, `--shadow-sm`) from *its*
defaults, not from this brand. Those values are outside the design system.

`design.md` uses a third dictionary (`--text-primary`, `--brand-primary`,
`--focus-ring`). None of those names exist in the build.

Agents who follow the contract literally write `var(--space-6)` and ship P1.

**Fix direction:** implement the contract table in `global.css`, then make
`design.md` alias to those names. Do not keep three dictionaries.

## P3 (HIGH) — Primary CTA hover fails AA

| State | Pair | Ratio | AA 4.5:1 |
|---|---|---|---|
| rest | white on `--color-brand` `#087c73` | 5.07:1 | pass |
| hover | white on `--color-brand-emphasis` `#0d9689` | **3.66:1** | **fail** |

`--color-brand-emphasis` is *lighter* than brand, so hover reduces contrast.
Used by `.cta--primary` in `Landing.astro`.

`design.md` §9 never measured hover. It only lists Turquoise/White at rest.

Verified darker hover candidates: `#0a6a62` → 6.46:1, `#076e66` → 6.12:1.

## P4 (HIGH) — Ghost control boundary is 1.64:1

`--color-border-strong` `#b9c7c3` on canvas is **1.64:1**. Fine as a card
hairline. It is the *only* edge of:

- `.cta--ghost` (`Landing.astro`)
- `.social-link` (`About.astro`)
- back-links on About section/detail and `TranslationUnavailable.astro`

WCAG 2.1 SC 1.4.11 needs 3:1 for a control boundary.

Verified: `#7f918d` → 3.11:1, `#748682` → 3.60:1, or `--color-brand` → 4.76:1.
Prefer a **new** control-border token so card hairlines stay quiet.

## P5 (MEDIUM) — Secondary ink on muted surfaces is 4.48:1

`--color-ink-secondary` `#657278`:

| Surface | Ratio |
|---|---|
| canvas | 4.66:1 pass |
| white card | 4.96:1 pass |
| `--color-surface-muted` | **4.48:1 fail** |

Muted panels: `.section--muted`, `.availability`, About next-step blocks.

Verified replacement `#616e74`: canvas 4.94 / surface 5.26 / muted 4.75.

## P6 (MEDIUM) — Gateway keyboard path misses the filled state

`.gateway-action--en:hover` / `--fa:hover` fill the button. `:focus-visible`
only changes outline colour. Keyboard users never see the language choice
affordance on `/`.

Same class of gap, smaller: `Landing.astro` ghost CTA, `Footer.astro`,
`404.astro`, `.social-link` in `About.astro` (P18).

## P7 (MEDIUM) — Skip link is covered by the sticky header

`html { scroll-behavior: smooth }` with no `scroll-padding-top`. Header is
sticky ~3.5rem. `#main` (skip target in `BaseLayout`, Gateway, 404) scrolls
under the header.

Landing already has unused ids `#perspectives`, `#about`, `#focus-heading`,
`#evidence-heading` that will hit the same bug.

**Fix:** `scroll-padding-top` on `html` sized to the header.

## P8 (MEDIUM) — Type and touch floors are crossed

- `.gateway-kicker`: `0.7rem` = **11.2px**. Contract: never below 12px.
- `@media (max-width: 14rem)` `.header-link`: `min-height: 2.25rem` = **36px**,
  type `0.75rem`. Contract: 44×44px. This came from zoom-safety QA and is an
  undocumented exception, not an accident.

## P9 (MEDIUM) — Primitive colours leak; gold marks fail 3:1

`global.css` says components consume semantic tokens only. `Landing.astro` and
`index.astro` use `--color-gold-500`, `--color-turquoise-500`,
`--color-purple-500`, `--color-navy-*`.

| Gold token | On canvas | On muted |
|---|---|---|
| `--color-gold-500` `#c89b3c` (shipped) | **2.40:1** | **2.31:1** |
| `--color-signature` `#a77b28` (unused semantic) | 3.58:1 | 3.44:1 |

Marks are `aria-hidden`, so WCAG is soft. The contract still asks 3:1 for UI
marks. Switching to `--color-signature` fixes both architecture and contrast.

## P10 (MEDIUM) — Gold budget exceeded on the locale home

Contract: at most one short rule, one graphic stroke, one badge per page.

`/en/` and `/fa/` currently have:

1. `.hero-positioning::after` — 3.5rem × 3px gold rule
2. `.rule span` — 64px × 3px gold rule
3. constellation gold ring
4. constellation gold centre

Either drop one rule, or change the budget in the contract. Do not leave both.

## P11 (MEDIUM) — Unvalidated CMS brand colour

`BaseLayout.astro` injects `:root { --color-brand: ${primaryColor} }` when CMS
returns an override.

- Only `--color-brand` changes. Hover (`--color-brand-emphasis`) and tint
  (`--color-brand-soft`) stay on the old values.
- No contrast check against white or canvas.
- Build does not fail (unlike CMS transport errors under ADR-0027 Slice 3).

An editor can push the primary CTA below AA in production with no signal.

## P12 (MEDIUM) — Search no-JS browse still uses `/blog/`

`apps/web/src/pages/en/search/index.astro` and `fa/search/index.astro`:

```html
<a href={`/${locale}/blog/`}>
```

Writing is canonical (`IA-CONTRACT` §5). `/blog/` permanently redirects, so this
is not a 404, but it is the wrong URL in the only no-JS search fallback, and it
re-teaches a retired path.

## P13 (MEDIUM) — P8 catalogs are live and almost undiscoverable

Live routes: `/{locale}/publications|books|talks|downloads/` (LOG-0216).

Header and footer list: About, Research, Projects, Writing, CV, Search.

IA forbids fake nav links, which is correct. It does not say catalogs must be
hidden. They are currently reachable only by URL, in-page links, or search.
Empty-honest catalogs can still be linked; empty state copy already exists.

This is a product decision, recorded here because it is a current findability
gap, not a future idea.

## P14 (MEDIUM) — Type and meta colour flatten site-wide

`--font-display` is used on catalog titles, article cards, statements, story
headings. Undefined → inherit Inter/Vazirmatn at the same visual weight as body.

`--color-ink-muted` is used as meta/lead/empty/missing colour in ~40 files.
Undefined → inherit `--color-ink`. Secondary hierarchy disappears without a
crash.

## P15 (LOW) — Two glass fallback patterns

Contract: opaque first, then `@supports ((backdrop-filter) or (-webkit-backdrop-filter))`.

- Header: `@supports (backdrop-filter: blur(10px))` — no `-webkit-`, Safari
  15–17 never gets glass (safe, not the specified pattern).
- Gateway: blur unconditional, opaque restored in `@supports not`.

Light glass alpha is `0.82`. Contract asks `0.9`.

## P16 (LOW) — Contract describes motion that is not in the code

Hover lift `translateY(-2px)` is mandated. There is no `translateY` in
`apps/web/src`. `--duration-*` tokens do not exist. `global.css` uses a
universal `transition-duration: 0.01ms !important` under reduced motion, which
cannot be overridden later.

## P17 (LOW) — Search UI is a third-party skin

Pagefind UI CSS/JS is loaded as `/en|fa/pagefind/pagefind-ui.css`. Input,
results, and empty state do not use `--color-*` tokens. With JS off, the host
is an empty `min-height: 3rem` plus the noscript list (P12).

`design.md` §112–113 describe a command palette. That is not what shipped.

## P18 (LOW) — Remaining hover/focus gaps

| File | `:hover` | `:focus-visible` |
|---|---|---|
| `pages/index.astro` | 3 | 1 |
| `Landing.astro` | 4 | 3 |
| `Footer.astro` | 2 | 1 |
| `404.astro` | 2 | 1 |
| `About.astro` `.social-link` | hover only | none |

## P19 (LOW) — `design.md` still advertises the blocked stack

Opening block of `docs/design.md`:

> UI foundation: Tailwind CSS + custom design tokens + shadcn/ui + Radix
> Motion + GSAP + D3 + Three.js / R3F

Public build: Astro + CSS + Tailwind. `DEBT-0001` already records the vision
gap. The problem for agents is that the **first screen** of the design bible
still looks like permission to import those libraries. The contract card
forbids it; the bible's header does not.

`design.md` §2.1 self-score is **9.84 / 10** while P1–P5 exist and the token
file is incomplete. That score is a documentation defect: it will be copied
into status reports.

`design.md` §159 still lists “final English/Persian typeface” as open.
ADR-0019 already chose Inter + Vazirmatn Variable. Stale open decisions cause
re-litigation.

---

## Contrast recap (computed)

Gateway (composited `--glass-bg-dark` over navy): name 18.3:1, prompt 9.7:1,
EN/FA labels ≥ 6.5:1. **Gateway contrast is fine.** Failures are interior.

```
FAIL  3.66  white on brand-emphasis     primary CTA hover
FAIL  1.64  border-strong on canvas     ghost control edge
FAIL  4.48  ink-secondary on muted      secondary text
FAIL  2.40  gold-500 on canvas          shipped gold rule
PASS  5.07  white on brand              primary CTA rest
PASS  4.66  ink-secondary on canvas
PASS  4.76  brand on canvas             links
```

Reproduce token inventory:

```powershell
$defined = Select-String -Path "apps/web/src/styles/global.css" -Pattern "^\s*(--[a-z0-9-]+):" -AllMatches |
  ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
$used = Get-ChildItem -Recurse "apps/web/src" -Include *.astro,*.css |
  Select-String -Pattern "var\((--[a-z0-9-]+)" -AllMatches |
  ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
Compare-Object $used $defined | Where-Object { $_.SideIndicator -eq '<=' }
```

---

## Suggested ledger mapping (not allocated)

| Problem | Ledger |
|---|---|
| P1, P3, P4, P5, P12 | `docs/status/known-issues.md` |
| P2, P9, P10, P14, P15, P16, P17, P19 | `docs/status/TECH_DEBT.md` |
| P6, P7, P8, P18 | `docs/status/deferred-validation.md` |
| P11 | `docs/status/RISK_REGISTER.md` |
| P13 | product decision; then IA-CONTRACT or deferred work |

---

## What this file did not check

- Visual confirmation in a browser (P1 should be screenshotted before a fix).
- Admin SPA (`apps/cms/admin-frontend/`).
- Text over CMS `/media/` images.
- Copy quality or translation.
- `docs/design.md` end to end (forbidden by `docs/README.md` §1). Structure and
  bound sections were read; some P19 items come from the opening block, §9,
  §10, §2.1, and §159.
