# P14C — Public page-family visual atlas

**Status:** DONE — VISUAL ATLAS AND HANDOFF COMPLETE

## Task: Complete the public-site UI/UX family before frontend replacement

- Goal: extend the approved P14 Home direction into a coherent set of public
  index and detail-page concepts, then decide whether a bounded Figma library
  adds enough handoff value beyond the visual references and written system.
- User/actor and journey: PhD supervisors, academic reviewers, senior industry
  visitors, readers, learners, and visual-work viewers evaluate identity,
  evidence, writing, learning material, creative work, and contact paths.
- Release type: `STANDARD`
- Risk level: Low for this design-only phase; later route, schema, frontend, and
  deployment work remains separately authorized.
- Owner and handoff recipient: Taha Mohammadi; future frontend/CMS agent.

## Scope

- In scope:
  - eight new high-fidelity public-page concepts covering the remaining page
    families;
  - reuse of the approved Blog-detail and Project-detail concepts;
  - a route/template/component matrix that respects current canonical URLs;
  - Light/Dark, RTL/LTR, responsive, interaction, motion, accessibility, and
    CMS-curation requirements;
  - an evidence-based Figma decision and, only if justified and separately
    approved, a bounded Figma-Lite library plan.
- Non-goals:
  - no public frontend replacement, CMS/API/schema change, route migration,
    deployment, production publication, or live-site mutation;
  - no invented biography, degree, position, date, metric, venue, employer,
    result, URL, or contact value;
  - no slicing raster concepts into buttons, typography, icons, graph nodes,
    or other production UI.
- Allowed files for the design-atlas phase:
  - `docs/design-redesign/page-families/**`
  - `docs/superpowers/specs/2026-08-25-public-page-family-visual-atlas.md`
  - `Assets/site-redesign/concepts/page-families/**`
  - `Assets/site-redesign/{README.md,MANIFEST.md,PROMPTS.md,SHA256SUMS.txt}`
  - `docs/plan/P14C-public-page-family-visual-atlas-task-spec.md`
  - `docs/plan/README.md`
  - `docs/status/WORK_LOG.md`
- Forbidden files: `apps/**`, `infra/**`, `.github/**`, CMS migrations,
  production content/data, and existing owner files outside the allowed paths.

## Contracts and data

- Documents read: `AGENTS.md`, `PROJECT_MANIFEST.md`, `docs/README.md`, active
  plan index, IA and Design contract cards, P14/P14A/P14B specifications, the
  approved experience-redesign specification, asset catalog, and existing
  Home/Blog-detail/Project-detail/admin-graph visuals.
- Contracts changed: none. Current canonical paths remain `/writing/`,
  `/creative/`, and `/teaching/`; visual labels such as Blog, Gallery, and
  Learning do not silently migrate routes.
- Migration/data impact: none.
- Locale, visibility and publication impact: none; all mock records remain
  explicitly illustrative and unpublished. Persian and English publication
  states remain independent.
- Security/privacy impact: no private phone, Gmail address, sensitive employer
  data, real operational data, or restricted project evidence may appear.

## Verification and release

- Tests/commands to run:
  - decode and dimension-check every new PNG;
  - inspect every concept directly for clipping, hierarchy, consistency,
    placeholder honesty, and accidental claims;
  - verify prompt/source/role/hash records;
  - scan authoritative documents for unresolved placeholders and route drift;
  - run exact-scope, staged-file, and whitespace checks.
- Manual QA path: inspect all eight new concepts plus the existing Home pair,
  Blog detail, Project detail, RTL mobile Home, language gateway, and graph
  editor as one visual family.
- Acceptance criteria:
  - all requested content families have an index or detail visual target;
  - similar pages share explicit templates instead of unrelated compositions;
  - Light/Dark modes preserve structure and meaning;
  - Blog remains editorially independent from Projects;
  - every long-form or evidence record may have a gated canonical detail page;
  - CMS controls content/order/relationships while Design System structure and
    tokens stay locked;
  - the Figma decision is based on handoff value, not fashion or completeness
    theatre;
  - no runtime file or production state changes.
- Rollback/fallback: revert only P14C-owned visual and documentation paths.
- Documentation to update: asset catalog, prompt log, manifest, hashes, plan
  index, and Work Log after visual production.

## Handoff

- Current phase output: eight reviewed page-family concepts, complete route and
  component matrix, responsive/RTL/state/motion specification, CMS/admin-panel
  mapping, prompt/manifest/hash provenance, and a scored Figma decision.
- Decision: `FIGMA_LITE_RECOMMENDED` at 12/16, bounded to foundations, reusable
  components, six templates, representative responsive/RTL frames, and one
  prototype path. Figma does not block frontend implementation.
- Next phase: separately authorize Figma Lite or native frontend implementation;
  neither is part of this design-only completion.
- Deferred/risk IDs: none opened for this design-only phase.
- Explicit blocker: none for design handoff. Runtime/browser/CMS/accessibility/
  performance/production validation remains open by design.
