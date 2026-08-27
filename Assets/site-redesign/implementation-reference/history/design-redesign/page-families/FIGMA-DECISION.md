# Figma decision

**Decision:** `FIGMA_LITE_RECOMMENDED`  
**Score:** 12/16  
**Date:** 2026-08-26

The eight reviewed page-family images plus the written handoff are sufficient
to begin implementation. A bounded Figma library is still recommended because
this project combines two themes, two text directions, reusable templates,
interactive graph/contact flows, and future white-label reuse. A full Figma
replica of every route would add maintenance cost without proportional value.

## Scorecard

| Criterion | Score | Evidence |
|---|---:|---|
| Inspectable measurements | 2 | Raster frames convey hierarchy but not exact auto-layout, spacing, and token inspection |
| Reusable component variants | 2 | Six templates and shared header/filter/row/timeline/CTA states need inspectable variants |
| Multi-person coordination | 1 | Current handoff can support one implementation agent; designer/developer review benefits from one shared library |
| Clickable flow value | 1 | Home → graph → research and index → detail flows merit one prototype; most routes do not |
| Responsive ambiguity | 1 | Written 320–1440 rules are precise, but representative reflow frames reduce implementation interpretation |
| RTL ambiguity | 1 | Existing Persian references plus the RTL spec are strong; a few component examples still add value |
| Motion/prototype ambiguity | 2 | Graph focus, filter changes, lightbox, timeline, theme, and reduced-motion behavior benefit from prototype timing |
| Future white-label reuse | 2 | Versioned token packs, tenant identity, and module configuration benefit materially from a reusable library |
| **Total** | **12/16** | `11–16` maps to `FIGMA_LITE_RECOMMENDED` |

## Authorized scope for a later Figma-Lite task

Do not recreate every content page. Limit the file to:

1. foundations: Light/Dark tokens, typography, spacing, grid, radius, border,
   shadow, focus, icon, and motion variables;
2. approximately 24 reusable components with essential states and RTL-safe
   auto-layout;
3. six templates: Home, Collection index, Editorial index, Long-form detail,
   Evidence/visual detail, About/Contact utility;
4. representative frames: desktop Light, desktop Dark, mobile Light Persian,
   one tablet reflow, one empty/error state sheet;
5. one clickable path: language gateway → Home → graph node → Research →
   publication detail → Contact;
6. one motion sheet for default and reduced-motion timing.

## Not authorized by this decision

- no route, CMS, schema, frontend, deployment, or production change;
- no full duplication of all locales, themes, breakpoints, and content states;
- no raster slicing into production controls;
- no Figma-generated facts or replacement for approved CMS copy;
- no design-token changes without a separate owner decision.

## Practical handoff choice

- If one implementation agent starts now, use the images and documents first;
  Figma does not block implementation.
- If visual QA will involve multiple people or the platform is prepared for
  reusable white-label delivery, create Figma Lite before component build-out.
- Production remains native semantic components with CMS data, accessible SVG,
  and optional progressive WebGL; Figma is a coordination artifact only.

