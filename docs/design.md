# docs/design.md — HISTORY

> **Status (2026-08-26): HISTORY — superseded by Assets/site-redesign/implementation-reference/MASTER-SPEC.md + agent-kit/*.json. Binding runtime tokens remain in apps/web/src/styles/global.css + docs/contracts/DESIGN-CONTRACT.md (G1 gate). Do not build from this file.**

This file is **not binding**. It is the historical visual/interaction baseline (~3557 lines, 163 sections) retained for reference only. No section is directly reusable in the P14 ATLAS rebuild without an accepted ATLAS packet.

## What this file used to define (historical summary, 20-line snapshot)

Historical direction: **Editorial-Tech Premium with Human Character**. Core identity: Deep Navy + Turquoise + Refined Gold; context accents Royal Purple + Emerald; personal accent Mascot Red. Surface: Solid-first + Selective Glass (glass only on gateway/header). Motion: functional-first; narrative only where it explains identity. Hero: meaningful identity/network visualization, never decorative 3D. Four-layer identity model: (A) Foundation — Navy/canvas/neutral/graphite, (B) Brand — Turquoise/Gold, (C) Context — Purple/Emerald, (D) Human — Mascot Red/illustration/photo. Included color hierarchy, typography (Inter+Vazirmatn), spacing/radius, components (Radix/shadcn foundation), RTL/LTR, a11y, responsive, hero/gateway, viz, and 21st.dev adaptation rules. Status at freeze: light-only, no dark, mascot not shipped, self-score retired.

## Why it was superseded

Next-generation frontend intent now lives in `Assets/site-redesign/implementation-reference/` (branch `p14c-visual-atlas`, commit `7d9b87f`). Runtime authority for current site remains `apps/web/src/styles/global.css` + `docs/contracts/DESIGN-CONTRACT.md`. Token/component/template truth for the rebuild is `MASTER-SPEC.md` + `agent-kit/*.json` validated by `agent-kit/validate.mjs`.

## Migration map — old concept → new location

Reference: `Assets/site-redesign/implementation-reference/DOCUMENT-MIGRATION-MAP.md` and `SOURCE-INVENTORY.md`.

| Old concept in this file | New canonical location |
|---|---|
| Color hierarchy (4 layers, Navy+Turquoise+Gold / Purple+Emerald / Mascot Red — tokens.json semanticLight/semanticDark) | `agent-kit/tokens.json` `primitive` + `semanticLight` (runtime) / `semanticDark` (design-target) + `docs/contracts/DESIGN-CONTRACT.md` §2; `MASTER-SPEC.md` §6 Themes |
| Type, spacing, radii, shadows, motion limits | `tokens.json: type/spacing/radius/motion/layout` + `DESIGN-CONTRACT.md` §2–3; `MASTER-SPEC.md` §6 Type/Responsive |
| Components (buttons, cards, tabs, surface) | `agent-kit/components.json` 24 primitives — components.json 24 primitives (Button, Card, Chip, etc.) + `sharedRules`; `DESIGN-CONTRACT.md` §2 upcoming primitives |
| Page templates / families | `agent-kit/templates.json` 6 templates — templates.json 6 templates: `home`, `collection-index`, `editorial-index`, `long-form-detail`, `evidence-visual-detail`, `about-contact-utility`; `MASTER-SPEC.md` §5, §7 |
| Motion, graph, visualization | `history/design-redesign/MOTION-GRAPH-HANDOFF.md` + `tokens.json:motion`; `MASTER-SPEC.md` §7–9, ATLAS-10 |
| CMS / Admin functional spec | `history/design-redesign/ADMIN-CMS-FUNCTIONAL-SPEC.md`; `MASTER-SPEC.md` §8 |
| Brand / art / concept assets, crops, alt, integrity | `Assets/site-redesign/README.md` §2–5 + `MANIFEST.md` + `SHA256SUMS.txt`; `SOURCE-INVENTORY.md: Visual and binary sources` |
| Visual Atlas / playground | `MASTER-SPEC.md` §7 + `AGENT-COORDINATION.md` + `MULTI-AGENT-TASK-LIST.md` ATLAS-06 + `ACCEPTANCE-GATES.md` G4/G5 |
| QA, gates, rubric | `ACCEPTANCE-GATES.md` (G1 tokens → G9 production adoption) |
| Docs ownership / when to update | `DOCUMENT-MIGRATION-MAP.md` |

## How to use the new reference (read order)

1. `Assets/site-redesign/implementation-reference/README.md` — entry point (read order §Read order)
2. `MASTER-SPEC.md` §1–6, §11 — product/architecture/Design System/deliverables
3. `AGENT-COORDINATION.md` — ownership, handoff, merge order
4. `MULTI-AGENT-TASK-LIST.md` — global constraints + execution board (ATLAS-01 tokens → ATLAS-11 QA)
5. `ACCEPTANCE-GATES.md` — objective completion gates
6. `agent-kit/tokens.json`, `components.json`, `templates.json` (+ `validate.mjs`)
7. `Assets/site-redesign/README.md` — approved brand/art/concepts provenance

Current runtime docs: `docs/README.md` → owner map, `docs/contracts/DESIGN-CONTRACT.md` (G1 gate), `docs/contracts/IA-CONTRACT.md`.

## Token precedence: reDesign_plan.md vs MASTER-SPEC

For tokens, **`MASTER-SPEC.md` outranks `reDesign_plan.md` §12–13 when they conflict** — i.e. MASTER-SPEC outranks reDesign_plan (`AGENTS.md` Current gate). `reDesign_plan.md` §3 token draft is superseded by `tokens.json` + `global.css` Light parity + Dark design-target. Do not build from either file directly — use `global.css` (live) and `MASTER-SPEC.md` + `agent-kit` (brief) per `DESIGN-CONTRACT.md`.

## Rebuild rule

The public frontend will be **rebuilt from scratch in `apps/web/` as Astro + TypeScript + Tailwind v4 + React islands** per `MASTER-SPEC.md` §2 and `AGENTS.md`. No section of this history file is live code and no section is reused without explicit ATLAS packet acceptance and verification (ATLAS-01 → ATLAS-07). Default `npm run build` must stay atlas-free; atlas is local-only `DESIGN_ATLAS=1 → /_design/`.

## Historical preservation

Full 3557-line content preserved in backup: `_archive/pre-redesign-backup_2026-08-26_08-37-10/docs/design.md` and consolidated history in `Assets/site-redesign/implementation-reference/history/design-redesign/` (`README.md`, `ADMIN-CMS-FUNCTIONAL-SPEC.md`, `MOTION-GRAPH-HANDOFF.md`, `QUALITY-AUDIT-v2.md`, `page-families/`). See `SOURCE-INVENTORY.md: Consolidated design-history inputs`.
