# IA contract card — binding rules only

Goal:
You can build or review a public route without reading the full IA document.

Source:
`docs/user-journey-information-architecture.md` is the deep reference for current runtime.
`Assets/site-redesign/implementation-reference/MASTER-SPEC.md` §4–5 + `agent-kit/templates.json` is the canonical next-gen (ATLAS) brief — planning/handoff only, not live runtime (branch `p14c-visual-atlas`, commit `7d9b87f`).
This card restates only the rules that are binding. If this card and the deep
document disagree, the deep document wins and this card is a defect — report it.
For ATLAS target vs live conflicts, `MASTER-SPEC.md` outranks `reDesign_plan.md` but does not override current runtime until its packets are accepted and merged.

Normative words:
**MUST**, **MUST NOT**, **SHOULD**, **MAY**.

---

## 1. Root and locales

- `/` is the Language Gateway. It is **not** the homepage.
- `/` MUST NOT auto-redirect to `/fa/` or `/en/`, by geo, IP, or browser language.
- `/fa/` (RTL) and `/en/` (LTR) are independent locale roots.
- A visitor MAY enter any `/fa/...` or `/en/...` URL directly and skip the Gateway.
- The language switcher MUST stay visible after the Gateway.

## 2. Locale independence

- Content, slug, SEO fields, and publication status are independent per locale.
- Locales are **linked**, not copied.
- Silent fallback is forbidden. Never render `fa` content under `/en/` or the reverse.
- `hreflang` MUST be emitted only for locale versions that are actually published.
- The language switcher target MUST come from a real alternate link.
  Never build it by replacing a path segment, because slugs differ per locale.

## 3. Missing translation

When an entity is published in one locale and absent in the requested locale:

- MUST NOT return a bare 404.
- MUST NOT show the other locale's body.
- MUST show, in the requested locale: an explanation, a link to the parent
  section, and a link to the published version if one exists.

## 4. Navigation honesty

- Inactive routes MUST NOT appear as live header or footer links.
- Do not create empty category pages or placeholder shells for future content.
- A header link that 404s is a defect, not progressive disclosure.

### Live today — current runtime (2026-08-26)

Current live routes (binding today):

- `/`
- `/{locale}/` (locale home)
- `/{locale}/about/`, `/{locale}/about/{section}/`, `/{locale}/about/{section}/{slug}/` when a child row has a Latin slug and a non-empty detail body
- `/{locale}/cv/`
- `/{locale}/writing/`, `/{locale}/writing/{slug}/`, `/{locale}/writing/series/{slug}/`, `/{locale}/writing/tag/{slug}/`, `/{locale}/writing/rss.xml`
- `/{locale}/research/` (plus published statement/topics/projects/publications detail where the published child exists)
- `/{locale}/projects/` (plus `/{locale}/projects/{slug}/` when published)
- `/{locale}/publications/`, `/{locale}/books/`, `/{locale}/talks/`, `/{locale}/downloads/` (each plus `/{locale}/*/{slug}/` when published)
- `/{locale}/contact/`
- `/{locale}/search/` (Pagefind, Wave 5)
- `404` (gateway-styled)

`/{locale}/blog/**` exists only as permanent redirects to the writing tree. Blog canonical is `/{locale}/writing/` — never `/{locale}/blog/` as a content route.

**Header nav contract — live (E9/P13, owner decision option B, 2026-08-24):** top-level header = About · Research · Projects · Writing · **More▾** (Publications, Books, Talks, Downloads in a no-JS `<details>` disclosure) · CV & Resume · Contact · Search · language. The More group MUST mark `aria-current="page"` when any child route is current. Footer explore stays the full sitemap. Mobile overflow QA required after any nav change.

`KI-0002` is CLOSED in this checkout and must not regress.

### Target ATLAS navigation (not live) — planning only

Canonical intended structure per `MASTER-SPEC.md` §4 + `agent-kit/templates.json` (planning/handoff, not live). Only becomes binding when ATLAS-05 (shell/header) and ATLAS-07 (templates/route adoption) packets are accepted and merged — do not treat as live until then.

Intended primary navigation labels (localizable, route families owned by this contract):

- About
- Research, with **Publications as a child destination** in navigation (URL stays canonical — see §4b)
- Projects
- Gallery — URL family is `/{locale}/creative/` (index + `/{locale}/creative/{slug}/` detail); **label is Gallery, URL is `/creative/`**
- Blog — `/{locale}/writing/` (`/blog/**` remains redirect-only; no content duplication)
- Learning — `/{locale}/teaching/` (index + `/{locale}/teaching/{slug}/` detail) — not live today; empty-honest when adopted

Utility actions (not primary nav): CV, Contact, locale switcher, theme (`light`/`dark`/`system`). `/` remains a separate Language Gateway (not a locale home).

Rules that carry into target:

- Every meaningful published record MAY have an independent detail URL only when locale, body, privacy, rights, and route gates pass — otherwise it MUST stay index-only.
- Publication detail canonical stays `/{locale}/publications/{slug}/`; `/{locale}/research/publications/{slug}/` MUST permanently redirect there. Research may list or link publications but MUST NOT own a duplicate detail URL.
- The same canonical-family principle applies to all catalogs: one canonical detail URL per entity per locale; other sections link to it (see §5).
- Do not invent Gallery, Learning, or other detail pages before their CMS/publish gates pass. Empty modules MUST be omitted in production, not rendered as placeholder shells.

## 4b. P8 catalog URL tree (Publications / Books / Talks / Downloads)

Locale roots remain `/fa/` (RTL) and `/en/` (LTR). Content, slug, SEO, and status are independent per locale.

Canonical public paths (live today and retained in ATLAS target):

```text
/{locale}/publications/
/{locale}/publications/{slug}/
/{locale}/books/
/{locale}/books/{slug}/
/{locale}/talks/
/{locale}/talks/{slug}/
/{locale}/downloads/
/{locale}/downloads/{slug}/
```

- Publication detail canonical is `/{locale}/publications/{slug}/` only.
- `/{locale}/research/publications/{slug}/` MUST permanently redirect to the canonical publication URL (research may list or link; it MUST NOT own a duplicate detail). This remains true when Publications becomes a child of Research in ATLAS navigation — navigation nesting does not move the URL.
- Gallery (target, not live) uses `/{locale}/creative/` + `/{locale}/creative/{slug}/`; Learning (target, not live) uses `/{locale}/teaching/` + `/{locale}/teaching/{slug}/`.
- Do not invent metrics, citation counts, or catalog entries. Empty lists MUST be honest.
- Restricted or metadata-only downloads MUST NOT expose a public file URL.

## 5. Canonical URLs

- One canonical detail URL per entity per locale.
- Other sections link to it; they do not duplicate it.
- Public writing tree is `/{locale}/writing/`. `/{locale}/blog/` MAY exist only as a redirect.
- Publication detail is `/{locale}/publications/{slug}/` (see §4b). Gallery detail (target) is `/{locale}/creative/{slug}/`; Learning detail (target) is `/{locale}/teaching/{slug}/`.
- A slug change MUST leave a permanent redirect.

## 6. Dead ends

- A content detail page MUST NOT end with only the footer.
- End each detail page with related content, a contextual next step, and a path
  to the parent section or contact.
- Related content is editorial first, then topic, then recency. Never invented.

## 7. Breadcrumbs

- Required on hierarchical deep pages: research area, project, article, series, course.
  In ATLAS target this also includes publication detail, creative detail, and teaching detail per `agent-kit/templates.json` (target, not live today).
- Not used on Home, Gateway, About, Contact, Search.
- Breadcrumbs reflect IA hierarchy, not browser history.
- Locale-correct labels; emit `BreadcrumbList` structured data only on indexable pages.

## 8. Search visibility

- `/{locale}/search/` IS live as of 2026-08-26 (Pagefind, Wave 5, LOG-0215/LOG-0216). A search control in header/footer IS expected and MUST be present in the live build.
- The guard "do not show a search control until `/{locale}/search/` exists" is therefore satisfied for current runtime — do not remove the search affordance, but do not point it at a missing route in any future branch where search is re-gated.
- Navigation MUST remain fully usable without search (no-JS, keyboard, and narrow-width paths must not depend on the search field).
- Search MUST NOT index drafts, private media, internal notes, or preview/share-token URLs. Public `/api/` and `/media/` projections are published-only (`is_active` for anonymous); search indexing MUST respect the same gate.

## 9. Homepage minimum

### Live today — current homepage minimum (binding)

Allowed order today:

```text
Header → Hero → Explore by Perspective (live paths only) → Selected Evidence (only if real)
→ Short About → honest Contact state → Footer
```

- Omit a section rather than fill it with placeholder content.
- Every perspective card MUST lead somewhere real or carry no link at all.

### Target ATLAS — default narrative order (not live, MASTER-SPEC §5 + templates.json)

Planning order only — becomes binding when ATLAS-07 route/template adoption is accepted. Do not build to this order today except behind `DESIGN_ATLAS=1` specimens.

```text
1. concise PhD-focused identity lead (SectionLead)
2. interactive relationship graph plus semantic linked-list equivalent
3. research interests and Research Fit
4. Architecture → Visual Design → Software → Data → AI journey (TimelineNode)
5. selected sanitized projects and outputs (FeaturedRecord / ContentRow)
6. selected verified academic publications/outputs (PublicationRow)
7. independent Gallery, Blog and Learning previews (MediaTile / ContentRow rails)
8. collaboration, CV and Contact close (ContactCTA)
```

- CMS MAY hide/reorder approved modules within guardrails and select featured records, but it MUST NOT change typography, semantic color roles, component anatomy, focus behavior, grid, motion limits, or accessibility states (MASTER-SPEC §5, §8).
- Omit any of 2–7 rather than invent content. Empty production modules MUST be omitted; atlas-only empty examples are explicitly labelled fixtures.

## 10. Evidence rule

- Do not publish a number, citation, funding figure, client name, award, or demo
  link that is not approved and verifiable.
- If evidence is missing, remove the claim. Do not soften it.

---

## Self-check before you finish

- [ ] No header or footer link resolves to a missing page.
- [ ] `/` still offers both languages and does not redirect.
- [ ] No text from the other locale appears under this locale prefix.
- [ ] Every new detail page has a next step, not just a footer.
- [x] No search affordance unless the search route exists. *(Wave 5: `/{locale}/search/` + Header/Footer shipped together; LOG-0215 — now live, so search control is expected and indexed content is published-only)*
- [ ] `/{locale}/blog/**` is redirect-only; blog canonical is `/{locale}/writing/`.
- [ ] `/{locale}/creative/` is labelled Gallery but URL stays `/creative/`; no invented Gallery/Learning detail URL before its gate passes.
- [ ] No invented metric, link, or translation.
