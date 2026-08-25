# IA contract card — binding rules only

Goal:
You can build or review a public route without reading the full IA document.

Source:
`docs/user-journey-information-architecture.md`. That file is the deep reference.
This card restates only the rules that are binding. If this card and the deep
document disagree, the deep document wins and this card is a defect — report it.

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
- Current live routes: `/`, `/{locale}/`, `/{locale}/about/`, `/{locale}/about/{section}/`, `/{locale}/about/{section}/{slug}/` when detail content exists, `/{locale}/cv/`, `/{locale}/writing/`, `/{locale}/writing/{slug}/`, `/{locale}/writing/series/{slug}/`, `/{locale}/writing/tag/{slug}/`, `/{locale}/writing/rss.xml`, `/{locale}/research/` (plus published statement/topics/projects/publications detail), `/{locale}/projects/` (plus detail), `/{locale}/publications/`, `/{locale}/books/`, `/{locale}/talks/`, `/{locale}/downloads/` (plus detail), `/{locale}/contact/`, `404`. `/{locale}/blog/**` exists only as permanent redirects to writing.
- **Header nav contract (E9/P13, owner decision option B, 2026-08-24):** top-level header = About · Research · Projects · Writing · **More▾** (Publications, Books, Talks, Downloads in a no-JS `<details>` disclosure) · CV & Resume · Contact · Search · language. The More group MUST mark `aria-current="page"` when any child route is current. Footer explore stays the full sitemap. Mobile overflow QA required after any nav change.
- `KI-0002` is CLOSED in this checkout and must not regress.

## 4b. P8 catalog URL tree (Publications / Books / Talks / Downloads)

Locale roots remain `/fa/` (RTL) and `/en/` (LTR). Content, slug, SEO, and status are independent per locale.

Canonical public paths (list + detail):

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
- `/{locale}/research/publications/{slug}/` MUST permanently redirect to the canonical publication URL (research may list or link; it MUST NOT own a duplicate detail).
- Do not invent metrics, citation counts, or catalog entries. Empty lists MUST be honest.
- Restricted or metadata-only downloads MUST NOT expose a public file URL.

## 5. Canonical URLs

- One canonical detail URL per entity per locale.
- Other sections link to it; they do not duplicate it.
- Public writing tree is `/{locale}/writing/`. `/{locale}/blog/` MAY exist only as a redirect.
- Publication detail is `/{locale}/publications/{slug}/` (see §4b).
- A slug change MUST leave a permanent redirect.

## 6. Dead ends

- A content detail page MUST NOT end with only the footer.
- End each detail page with related content, a contextual next step, and a path
  to the parent section or contact.
- Related content is editorial first, then topic, then recency. Never invented.

## 7. Breadcrumbs

- Required on hierarchical deep pages: research area, project, article, series, course.
- Not used on Home, Gateway, About, Contact, Search.
- Breadcrumbs reflect IA hierarchy, not browser history.
- Locale-correct labels; emit `BreadcrumbList` structured data only on indexable pages.

## 8. Search visibility

- Do not show a search control, field, or CTA until `/{locale}/search/` exists.
- Navigation MUST remain fully usable without search.
- Search MUST NOT index drafts, private media, internal notes, or preview URLs.

## 9. Homepage minimum

Allowed order today:

```text
Header → Hero → Explore by Perspective (live paths only) → Selected Evidence (only if real)
→ Short About → honest Contact state → Footer
```

**Redesign v2 order (ADR-0031) — LIVE since #111/#112:**

```text
Header (night glass) → HeroSection (constellation identity + drag-rotate island)
→ PerspectiveGrid → FocusStrip → Selected Evidence → [JourneySection slot, reserved]
→ Latest Writing → ContactCTA → Footer (night)
```

- Omit a section rather than fill it with placeholder content.
- Every perspective card MUST lead somewhere real or carry no link at all.
- JourneySection ships in a later wave into the reserved slot; until then the
  order above is the shipped reality (no legacy sections remain on home).
- JourneySection and any evidence-backed numbers follow §10; no invented milestones.

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
- [x] No search affordance unless the search route exists. *(Wave 5: `/{locale}/search/` + Header/Footer shipped together; LOG-0215)*
- [ ] No invented metric, link, or translation.
