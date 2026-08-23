# Design / UI / UX improvement proposals

> Status: **proposals only** — nothing here is implemented or authorized.
> Date: 2026-08-22.
> Companion (defects): `docs/plan/DESIGN-UI-CURRENT-PROBLEMS.md`.
> Index: `docs/plan/DESIGN-UI-UX-IMPROVEMENT-REVIEW.md`.
>
> This file is judgement. It includes suggestions for rules that are already
> written in `docs/design.md`, `DESIGN-CONTRACT.md`, and `IA-CONTRACT.md`, not
> only for gaps. If a change would contradict a frozen contract, it says so.

Audience for the public site (contract §5): PhD admissions and senior industry
readers. They scan for proof. Every proposal below is filtered through that,
not through “more premium” or “more motion”.

IDs: `S-` = suggestion. Cross-links to `P-` are current problems.

---

## How to use this file

1. Do not execute it. Promote one cluster into a Task Spec if the owner agrees.
2. Prefer fixing `DESIGN-UI-CURRENT-PROBLEMS.md` P1–P5 before any visual
   invention. Broken tokens make new UI look accidental.
3. `docs/README.md` §3: visual tokens are owned by `DESIGN-CONTRACT.md` +
   `global.css`. `design.md` is deep reference. If a suggestion changes a
   binding rule, update the contract card in the same task.

---

## Cluster 0 — Make the written system true

The design bible is long and often good. Its failure mode is that it still
describes a future product as if it were the current one.

### S1. Split `design.md` into “now” and “later”

`design.md` §0 calls itself the source of truth. `docs/README.md` says the
contract card wins. Agents follow whichever file they opened first.

Proposal: add a 20-line status block at the top of `design.md`:

- **In force today:** Astro, CSS, Tailwind utilities, tokens in `global.css`,
  no public React shell, no shadcn, dark mode out of scope, mascot not shipped.
- **Aspirational:** islands, motion libraries, dark theme tokens, mascot bible,
  command palette, Journey GSAP, Three.js.
- **Owner of binding numbers:** `DESIGN-CONTRACT.md`.

`DEBT-0001` already names the stack gap. Putting the same sentence in the
bible’s header stops the next agent from importing Radix “because design.md
said so”.

### S2. Kill the 9.84 self-score

`design.md` §2.1 scores token completeness 0.99 and accessibility 0.98 while
the live token file is missing the spacing/type/measure scales and CTA hover
fails AA (`P3`).

Proposal: replace the numeric self-score with “unscored until a visual QA pass
against the contract checklist”. A fake 9.7+ target trains agents to protect
the document instead of the site.

### S3. One token dictionary

Today:

| Role | `design.md` | Contract | `global.css` |
|---|---|---|---|
| Body text | `--text-primary` | `--color-ink` | `--color-ink` |
| Brand | `--brand-primary` | `--color-brand` | `--color-brand` |
| Gold | `--signature` | `--color-signature` | defined, unused |
| Focus | `--focus-ring` | `--color-focus` | `--color-focus` |

Proposal: freeze the `global.css` / contract names. In `design.md`, either
rename every example or add a one-way alias table (“`--text-primary` means
`--color-ink` — do not emit `--text-primary` in CSS”). Three names for one
role is how P1 happened.

### S4. Close stale open decisions

`design.md` §159 still lists final English/Persian typefaces as open.
ADR-0019 already chose Inter Variable + Vazirmatn Variable.

Proposal: mark typefaces **decided**. Keep open: logo geometry, portrait,
mascot production, Journey motion, 3D (all still true). An “open” list that
rewrites settled ADRs will be re-opened by the next agent.

### S5. Homepage architecture: defer to IA

`design.md` §68 wants Hero → Perspectives → Focus → Evidence → Journey →
highlights → writing → Now → contact.

`IA-CONTRACT.md` §9 allows a shorter honest page and forbids placeholder
sections. That IA rule is the better product rule for this audience.

Proposal: `design.md` §68 becomes “target when content exists”. Binding order
stays the IA card. Journey / mascot / Now stay deferred, not “missing from the
homepage”.

---

## Cluster 1 — Colour, even where the palette is already specified

The palette (navy, turquoise, gold, purple, emerald) is coherent. The *usage
rules* around it should be tighter.

### S6. Hover must be darker than rest on light surfaces

`design.md` §10.1 sets `--brand-primary-emphasis: #0D9689`, which is
turquoise-600: lighter than turquoise-700. On a light page, “emphasis” was
implemented as “brighter”, which fails AA (`P3`).

Proposal: add an explicit rule to both `design.md` §9 and the contract:

> On light surfaces, interactive emphasis for text-bearing fills MUST be
> darker than rest, never lighter. Bright turquoise (`#16B8A6`) is for dark
> surfaces and large graphics only.

That is already implied by §9.1 (“MUST NOT as small body text on white”) but
it never said “and not as a white-label button hover”. Spell it out.

Suggested rest/hover pair on light: rest `#087c73` (keep), hover `#0a6a62` or
`#076e66`. Keep `#0d9689` / `#16b8a6` for Gateway and constellation only.

### S7. Stop using gold as a primary language action

`design.md` §53 / §134: gold MUST NOT be the everyday primary button.
`index.astro` uses gold for the فارسی Gateway button — one of two equal
primary actions on the whole site.

Proposal: both language actions share one chrome (turquoise outline + fill on
hover, or inverse text on a single navy button style). Keep gold as the
small divider between the two prompts (`·` / `/`), which already exists.
Persian is not “the gold locale”. Flags are already forbidden; a gold/turquoise
split is a colour-as-language cue, which the contract also forbids (“never
encode meaning in colour alone”).

### S8. Emerald should not mean Writing

`design.md` §136: emerald = health, wearables, sustainability, contextual
success. `Landing.astro` paints the Writing perspective with `--color-context`
(emerald). Writing is not health.

Proposal:

| Perspective | Accent |
|---|---|
| Research | purple (`--color-research`) — already correct |
| Engineering | turquoise (`--color-brand`) — already correct |
| Writing | ink + one hairline, or signature gold in the 2–4% budget — **not** emerald |

Reserve emerald until a health/wearables artifact actually exists. Using it
early spends the context colour on the wrong meaning, then you have nothing
left when that content arrives.

### S9. Measure hover, muted, and control borders in §9

`design.md` §9 is a good table that only covers rest colours on navy or white.
It missed:

- white on brand-emphasis (P3)
- slate on `--bg-surface-muted` (P5)
- `--border-strong` as a control edge (P4)

Proposal: extend the table with those three rows and a rule: “any pair used as
text or as a control boundary MUST appear in this table.” Decorative hairlines
can stay at ~1.2:1; they must be labelled decorative in the table so agents
do not reuse them on buttons.

### S10. Dark theme: document as unauthorized, or delete the tokens

§10.2 and §133 specify a full dark theme and even recommend a dark/mixed
homepage. The contract forbids a theme toggle. Live interior pages are light;
only `/` is navy.

Proposal: freeze **Gateway dark / interior light** as the identity (it already
is). Move §10.2 to an appendix titled “not authorized”. A second theme before
the light theme’s hover states pass AA is the wrong sequence. If dark reading
pages are wanted later, they need their own contrast table — copying light
tokens onto navy will recreate P3 in reverse.

### S11. Gold budget: pick a number that matches the hero

The scarcity rule (§134, contract §3) is right. The hero identity graphic
almost has to use gold at the centre if gold is “signature”. That already
consumes the graphic slot. A second gold rule under the name *and* a third
under About is what P10 records.

Proposal for a revised budget that still feels scarce:

- **One** gold graphic moment per page (constellation centre, or a 64px rule,
  not both).
- **Zero** gold in body text, buttons, and icons.
- Badge only on a real selected-evidence item (publication, award), never as
  decoration.

That is stricter than today’s contract and more honest than the live page.

---

## Cluster 2 — Type, even though roles are already frozen

§25’s role list (Display … Citation … Code) is the right architecture.
Implementation uses two fonts for every role (`P14`).

### S12. Cap display size below 6.2rem

`--text-display: clamp(3.2rem, 2rem + 4.2vw, 6.2rem)` in §26 is a poster size.
Persian Vazirmatn at 6.2rem on a 320px screen will wrap the name into a stack
of syllables. The live hero already caps near **4.5rem**, which is better than
the spec.

Proposal: display max **4.5rem**; H1 max **2.5rem** on interior pages. Use the
large display only on locale home. Interior catalogs currently aim at
`clamp(1.75rem, 4vw, 2.4rem)` — keep that as H1, do not “fix” them up to
`--text-display` after P1 is resolved.

### S13. One bilingual measure, not three

| Source | Latin | Persian |
|---|---|---|
| `design.md` §27–28 | 55–75ch | 50–68 characters |
| Contract §3 | 60–75ch | (same sentence) |
| Live | `max-width: 60ch` or `42ch` on the proposition | same CSS |

Proposal: **body 60ch**, **narrow 42ch**, **page 1280px**. Persian justification
may stay; do not also shorten the measure “because Persian” unless a specimen
shows overflow. Three overlapping ranges guarantee agents pick at random.

### S14. Map roles to the two actual fonts

There is no display face. Inter/Vazirmatn must carry Display, H1, and Caption.

Proposal: encode that as a rule, not a disappointment:

- Display/H1: same family, weight 700, tracking 0 in RTL, slight negative
  tracking in LTR (already done on `.hero-name`).
- Caption/Label: weight 600, size `text-sm`, colour `ink-secondary` — never a
  third colour.
- Metadata: `text-sm` + `ink-tertiary` (once that token exists).
- Code: keep `ui-monospace` stack until a licensed mono is chosen; do not
  pretend a “code font” shipped.

Then `--font-display` in components becomes an alias of `--font-latin` /
`--font-persian`, not a missing file.

### S15. Tighten `overflow-wrap`

`anywhere` on `.hero-name` and body copy (from P2 zoom-safety) will split
Persian words and DOIs. Contract §4 already asks `<bdi>` for DOI/URL/code.

Proposal: `overflow-wrap: anywhere` only on known unbreakable strings (URLs,
DOIs, file names) inside `<bdi>`. Headings and body use `break-word` or
`min-width: 0`. Keep the zoom QA tests; change the CSS, not the policy.

---

## Cluster 3 — Structure and navigation

### S16. Header: seven items is already a mobile problem; catalogs make eight

Live header: About, Research, Projects, Writing, CV, Search, plus language.
`design.md` §58 wanted Research, Work, Projects, Writing, About, More, CV,
language — which is worse (Work vs Projects duplicated, “More” undefined).

Proposal, public nav:

```text
About · Research · Writing · Work · CV
```

- **Work** = `/{locale}/projects/` (engineering case studies). Do not also say
  “Projects” if Research already has research-projects.
- **Publications / Books / Talks / Downloads** do not each get a header slot.
  Put Publications under Research (it already redirects from the old research
  publications URL). Put Books/Talks/Downloads in footer explore, About,
  and search. Empty catalogs in the top nav look like a CMS demo.
- **Search** as an icon or as the last text item, not as a peer of Research.
- Language switch stays. Never flags (`design.md` §59 is correct — keep it).

This contradicts neither IA honesty nor P8 liveness. It *is* a change to
`design.md` §58, which should be rewritten to match IA, not the other way around.

### S17. Gateway is the strongest screen; keep it quieter

§60 is already good: brand moment, two actions, no biography. Live Gateway
mostly follows it.

Proposals on top of that (beyond P6/P7/S7):

- Raise kicker from 0.7rem to `text-sm` (P8).
- One identity line is enough; the bilingual kicker + bilingual prompt +
  bilingual name is three bilingual pairs. Consider name + one bilingual
  prompt + two buttons. The kicker duplicates the prompt’s job.
- Do not add shader / kinetic field (`design.md` §60.5 “possible
  enhancement”). The dotted SVG is already at the right intensity.

### S18. Hero: answer “where do I go next?” with Research, not only About

§62–63 want Research CTA + Work CTA + CV. Live primary CTA is About, secondary
is CV. For PhD readers, About is a biography detour. Research or Publications
is the proof path.

Proposal:

- Primary: Research (or Publications once the catalog has rows).
- Secondary: CV.
- About stays in the header and in the short About band lower on the page.

That is a copy/IA choice more than a visual one, and it is the highest
credibility change after fixing Selected Evidence (S19).

### S19. Selected Evidence must look like a publication card

Contract §5 and `design.md` §70 already require venue, year, DOI, 3–6 curated
items. Live list is titles + a status, research items link to the *index*,
publications are not links (`P` in the earlier review, still true).

Proposal — one card template for evidence, no new component library:

```text
title (link to canonical detail)
venue · year · type
DOI or PDF as <bdi dir="ltr">
```

Three items beat six adjectives. Do not build a “featured” carousel.

### S20. Perspectives: one next step each, visually quieter cards

§69 is correct (audience, value, next step). Live cards are three equal
outlined boxes with a 3px accent bar. They compete with Evidence.

Proposal: keep three routes; make the card a heading + one sentence + a text
link (“View research”), not a coloured panel that looks like a dashboard
widget. Editorial, not SaaS (`design.md` §4.3 already bans “template-like SaaS
UI” — the live cards lean that way).

### S21. Focus strip is a caption, not an H2

Live: `<h2 class="focus-label">` at 12px uppercase. Outline noise for
screen-reader users; visually a kicker.

Proposal: `aria-labelledby` on the `<aside>` with a visually-hidden heading,
or a `<p>` label. Do not add another gold rule here (P10).

### S22. Sticky header wrap vs disclosure

On narrow `/fa/`, six wrapped text links in a sticky header steal vertical
space on every page.

Proposal: below ~40rem, `<details>` “Menu” (no JS) containing the same links,
brand + language remaining visible. Must pass the existing mobile-overflow QA.
`design.md` §58 already says mobile should be compact and not a mega-menu —
a `<details>` is that, and is still missing.

---

## Cluster 4 — Components the bible specifies too broadly

### S23. Public component vocabulary is too large

§53 lists Primary, Secondary, Ghost, Text, Destructive, Icon, plus loading.
The public site needs **Primary, Ghost, Text link**. Destructive belongs in
admin. Loading belongs in admin.

Proposal: contract a public subset. Admin may have the rest. Agents currently
can “complete” §54 by adding disabled/loading styles to the locale landing
page, which helps nobody.

### S24. Cards: prefer list + rule, not box

§56 says not every item needs a card; editorial layouts may omit boxes. Live
article cards (`ArticleCard.astro`) already do this well (title, excerpt,
meta, hairline). Catalog pages and evidence lists regress to boxed panels.

Proposal: **writing and publications = list + hairline** (ArticleCard pattern).
**Projects and research topics = optional left accent** only if the row is a
link. Feature cards reserved for homepage perspectives after S20.

### S25. Links in body: underline by default

§55 says content links should be underlined or unmistakable. Many interior
catalog titles are `text-decoration: none` until hover. Keyboard users get
focus rings; pointer users get mystery clickable headings.

Proposal: body and card titles that are the sole link keep underline offset
3px in rest state, or a persistent bottom weight. Hover may darken; it must
not be the first signal.

### S26. Search: skin Pagefind, do not wait for a command palette

§112–113 describe a command palette. What shipped is Pagefind (`P17`). A
palette would be a React island and needs a Task Spec.

Proposal: CSS-override Pagefind to tokens (canvas, ink, brand, radius-md,
44px input). Keep noscript browse links on **canonical** writing/research/
projects/publications URLs (`P12`). Do not add `Cmd+K` until the public shell
is allowed to have JS for that.

### S27. Empty catalogs

P8 pages are empty-honest. Good. They still look like a missing template:
H1, lead, “empty” in the same muted colour as everything else (`P14`).

Proposal: one sentence that names the content type and points back to Research
or About. No illustration, no mascot (`design.md` §72 already says mascot
should not dominate; it also should not fill empty research catalogs).

---

## Cluster 5 — Motion, mascot, 3D: keep the philosophy, cut the invitation

§73–80 and §67 (hero anti-rule) are the best pages in the bible. The problem
is volume: hundreds of lines invite implementation.

### S28. Keep “functional first”; move GSAP/Three to an appendix

The live site needs zero narrative motion until tokens and contrast pass.
`B5-VISUAL-INTERACTION-ADOPTION.md` already gates libraries.

Proposal: `design.md` motion chapter stays as philosophy (functional /
narrative / decorative, reduced-motion, no width/height animation). Named
libraries and Journey choreography move under “Appendix — not authorized”.
That preserves the thinking without looking like a backlog.

### S29. Mascot bible as deferred identity work

§18–23 are a real character system and should not be deleted. They should not
sit between logo and typography either; agents hit them on the way to type.

Proposal: relocate mascot + mascot-red to `docs/plan/` or a `design.md`
appendix. Public pages stay human through photography, name, and evidence —
which §5 already allows — until assets exist.

### S30. Do not dark-mode the homepage “to match the Gateway”

§133 recommends dark or mixed editorial for the homepage. A dark `/en/` after
a dark `/` removes the only spatial cue that the visitor has *entered* the
site. Gateway navy → canvas light is already a successful threshold.

Proposal: freeze that threshold. If a dark reading theme is ever built, it is
a user preference on long-form, not a default home.

---

## Cluster 6 — Accessibility rules to add (the current ones are good, incomplete)

Contract §3 and `design.md` §83–84, §91 are strong (44px, focus-visible,
reduced motion, no hover-only). Add:

### S31. Contrast checklist must include hover, muted, and 1.4.11

Copy into the contract definition of done:

- [ ] Text on `--color-surface-muted` ≥ 4.5:1
- [ ] Primary fill hover ≥ 4.5:1
- [ ] Control boundary (not decorative hairline) ≥ 3:1
- [ ] CMS `--color-brand` override rejected at build if white-on-brand < 4.5:1

### S32. `scroll-padding-top` as a token

One token `--space-sticky-offset` matching header height, applied on `html`.
Fixes P7 and future in-page headings.

### S33. Zoom exception, named

The 14rem header breakpoint that drops 44px targets (`P8`) should be an
explicit contract exception: “below 224px CSS width / extreme zoom, 36px is
allowed.” Absolute rules with silent exceptions get “fixed” by agents who
then fail zoom QA.

---

## Cluster 7 — Page-level polish (implemented screens)

These assume P1–P5 are fixed first.

### S34. About tabs (`DEBT-0002`)

Stacked evidence vs tabs is already a recorded compromise. If tabs stay:

- do not use colour alone for the selected tab (weight + 2px rule, like the
  header current-page treatment);
- “Show all” should look like a secondary control, not another tab.

### S35. Duplicate breadcrumb components

`components/Breadcrumbs.astro` and `components/blog/Breadcrumbs.astro` both
exist. Catalog pages import the blog one. Unify on the tokenised one after
`--space-*` exists, and emit `BreadcrumbList` only on indexable pages
(`IA-CONTRACT` §7).

### S36. Footer as sitemap, header as wayfinding

Footer already repeats the header. After S16, footer is the right place for
Publications, Books, Talks, Downloads, Search, language, and the honest
contact line. Header stays five destinations. That is standard IA and matches
“homepage is not a CV” (`design.md` §68).

### S37. Constellation: fewer accents in one viewport

Contract: max three accent hues. Live hero SVG uses navy, turquoise, purple,
and gold together. That is four.

Proposal: navy lines + turquoise nodes + **one** gold centre. Drop the purple
node, or keep purple and drop gold from the SVG (gold then lives only in the
text rule). Either reading still says “network + signature”.

---

## Suggested order if any of this is approved

| Step | What | Depends on |
|---|---|---|
| 1 | P1–P5, P2 token file | owner: implement scale vs shrink contract |
| 2 | S6, S9, S31 (hover/muted/border rules) | step 1 |
| 3 | S19 + S18 (evidence cards, Research as primary CTA) | content exists |
| 4 | S7, S8, S11, S37 (gold/emerald/constellation discipline) | step 2 |
| 5 | S16, S22, S36 (nav) | IA-CONTRACT edit |
| 6 | S1–S5, S4 (honest bible) | docs-only |
| 7 | S26, P12 (search skin + `/writing/` noscript) | low risk |
| 8 | S28–S30 (appendices) | docs-only |
| 9 | Anything with motion, mascot, dark theme, command palette | separate specs |

---

## Explicit non-goals

These are documented in `design.md` and should **not** be started from this
file:

- shadcn / Radix on the public site
- GSAP Journey section
- Three.js / WebGL Gateway
- Dark mode toggle
- Mascot on homepage
- Command palette
- 21st.dev / Awwwards pattern adoption (`design.md` §97–106)

`B5-VISUAL-INTERACTION-ADOPTION.md` remains the gate for any library.
