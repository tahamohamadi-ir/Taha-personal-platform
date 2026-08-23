# ADR-0028: Research relationship graph as a progressive React island

**Status:** Accepted (2026-08-22).  
**Date:** 2026-08-22  
**Supersedes / amends:** Amends ADR-0016 (first approved public interactive island); does not change static-first or no-JS readability.  
**Related:** `docs/plan/B5-VISUAL-INTERACTION-ADOPTION.md`, design.md §95 / §98 / §102, `DEFER-0020`, Task Spec `wave4-research-graph-island-task-spec.md`.

## Context

Research overview and topic/project detail pages already expose Topic ↔ Project ↔ Publication as **accessible lists and trees**. That navigation is the product requirement (P5). Visitors still cannot see the **shape** of relationships across the research corpus in one place: which topics share projects, which publications hang off which projects, and where clusters form.

The owner requested the best interactive island for this map. Three real gates apply before any public JS:

1. **UX value (design.md §98 / B5).** “Looks nicer” alone fails. The graph must answer a concrete research-map question that lists alone answer poorly.
2. **License.** `docs/plan/LICENSES.md` flags **gsap** as proprietary Standard License — it must not ship in a public bundle without explicit owner license acceptance. **motion** and **three** are MIT.
3. **Bundle budget.** B5 / design performance practice holds each interaction island to **&lt; 35KB gzip**. Core **three.js** alone exceeds that by a wide margin; raising the budget needs an explicit number and rationale in an ADR. Motion is already locked (MIT) and can animate SVG/Canvas under budget when tree-shaken and route-local.

## Decision

### UX value (passes §98)

Ship an interactive **relationship map** on `/{locale}/research/` that helps visitors:

- see Topic → Project → Publication connectivity at a glance;
- focus a node and highlight its neighborhood;
- pan/zoom a dense map without losing the underlying list navigation.

The static HTML **relationship tree** (same edges, real titles and hrefs) remains the complete product for no-JS, keyboard-first, and reduced-motion users. The island is progressive enhancement, not a content gate.

### Library and rendering stack (option B)

| Choice | Decision |
|---|---|
| **Adopt** | **SVG (primary) + `motion` (MIT)** for focus/layout transitions and reduced-motion-safe state changes |
| **Do not adopt (this slice)** | **gsap** — proprietary; deferred until owner records license acceptance in this ADR family |
| **Do not adopt (this slice)** | **three.js / WebGL** — MIT but blows the existing **35KB gzip** island budget; deferred unless a future ADR raises the budget with an explicit gzip ceiling and measurement |

**Budget:** keep the **35KB gzip per interaction island** ceiling. Do **not** raise it for this slice. Measure the research-graph chunk after build; if over budget, cut motion surface area (CSS for pan/zoom chrome) before considering a budget ADR.

### Island mechanics

- React island only, **`client:visible`**, imported from the research overview route (no global hydration).
- Data is build-time from published CMS projections only (same Topic/Project/Publication edges already used by list/detail pages). No invented nodes or edges.
- Keyboard: focusable nodes (links), visible focus, no tab trap; Esc resets view.
- RTL: logical layout and mirrored chrome on `/fa/`.
- `prefers-reduced-motion: reduce`: no spring/large transforms; static positioned SVG or tree-only presentation; content unchanged.
- No-JS: relationship tree HTML is complete and navigable.

### Explicit non-goals

- Curated collections / editorial graph curation (still deferred under `DEFER-0020`).
- D3 force simulation as a required runtime dependency.
- Hero/landing constellation rewrite; Language Gateway stays static.
- Any `gsap` or `three` import in `apps/web/src`.

## Consequences

- First public-site React island is authorized **only** for this research map under the constraints above.
- `@astrojs/react` + `react` / `react-dom` become direct web dependencies; `motion` may be imported route-locally.
- B5 brief status updates: Candidate 4 (research graph) is the authorized adoption; Candidates 1–3 remain unimplemented proposals.
- `DEFER-0020` is updated honestly: interactive relationship viz ships; curated collections remain open.
- Future three.js or gsap adoption requires a **new** ADR (budget raise and/or license acceptance) — not a silent import.

## Alternatives considered

- **(A) Raise island budget for three.js.** Rejected for this slice: no measured ceiling or owner-approved gzip number; WebGL is unnecessary for a relationship map of tens of nodes.
- **CSS-only diagram.** Insufficient for pan/zoom, neighborhood focus, and keyboard spatial navigation at useful density.
- **gsap timelines.** Blocked by license until owner acceptance is recorded.
