# ADR-0030 — Visual-interaction library authorization (motion / GSAP / D3 / Three.js)

**Status:** ACCEPTED (owner in-session attestation, 2026-08-23)
**Decides:** which visual-interaction libraries are authorized on the public site, on which routes, and under which budgets/fallbacks.
**Supersedes:** the restrictive reading of `B5-VISUAL-INTERACTION-ADOPTION.md` (candidates 1–3 "proposals only"); refines ADR-0028 scope.
**Owner attestation (2026-08-23, in-session):** «ظاهر سایت باید حرفه‌ای و مدرن و تعاملی بشه — GSAP (proprietary) و Three.js و D3 رو راحت استفاده کن؛ motion هم هر جا لازمه باشه.» This attestation satisfies the B5 owner-approval gate and the GSAP license-acceptance requirement.

## Decision

| Library | Status | Authorized use | Budget / constraints |
|---|---|---|---|
| `motion` (MIT) | AUTHORIZED (was ADR-0028) | Functional micro-interactions + research graph island (existing) + hero constellation entrance if CSS insufficient | Island-local, lazy (`client:visible`), ≤35KB gzip per interaction island |
| `gsap` 3.15 (standard license) | **AUTHORIZED** — owner accepts license terms | Narrative scroll sequences ONLY: Journey timeline reveal (design.md §71), multi-part coordinated reveals | Route/island-local, lazy import, ScrollTrigger only if required; ≤35KB gzip island budget; never on simple hovers/modals (design.md §78) |
| `d3` | **AUTHORIZED** | Custom data/relationship visualization where a concrete need exists (topic graphs, evidence networks) | Island-local, lazy; do not use where SVG/HTML suffices (design.md §79); ≤35KB gzip island budget |
| `three` / R3F | **AUTHORIZED** — budget raise accepted | ONE signature experience: 3D identity constellation on locale home hero (`/{locale}/`) | **Lazy chunk ≤150KB gzip** (explicit raise per design.md §95), `client:visible`, never render-blocking, mobile → static SVG, `prefers-reduced-motion` → static SVG, no-JS → existing static SVG (already shipped) |

## Non-negotiables (unchanged)

- Public content stays readable without JavaScript — every animated component has a static/no-JS fallback that is the *same content* (design.md §93).
- `prefers-reduced-motion: reduce` → static/functional-only; no loops, parallax, or smooth-scroll (§84).
- One library per interaction; CSS/native evaluated first (§73).
- Hero copy renders immediately; no render-blocking imports (§95).
- RTL/LTR, keyboard, and 320–1440px QA for every interaction (B5 QA plan).

## Consequences

- `B5-VISUAL-INTERACTION-ADOPTION.md` is updated: candidates 1–3 become AUTHORIZED under this ADR; the escalation "no gsap/three without ADR" is satisfied by this document.
- Each implemented interaction still needs its Task Spec + QA evidence per B5 (keyboard/RTL/mobile/reduced-motion/no-JS/budget).
- `LICENSES.md` gains the GSAP standard-license acceptance note referencing this ADR.
