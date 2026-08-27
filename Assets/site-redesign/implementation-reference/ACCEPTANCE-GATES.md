# Acceptance gates

## G0 — Reference integrity

- [ ] Agent-kit validator passes.
- [ ] Asset hashes and dimensions pass existing pack verification.
- [ ] Reference branch, commit and dirty manifest are recorded.
- [ ] No runtime, CMS, route or deployment file changed in the reference task.

## G1 — Token authority

- [ ] Design Contract and `global.css` agree byte-for-role on Light and Dark.
- [ ] No component contains an unapproved raw color, spacing gap or duration.
- [ ] Theme changes content-neutral semantic roles only.
- [ ] Light/Dark text, control, focus and hover pairs pass contrast.
- [ ] Reduced-motion values are explicit.

## G2 — Primitive components

- [ ] Twenty-four required components exist or have an approved mapping to an
  existing component.
- [ ] Hover and focus-visible have parity.
- [ ] 44px target, keyboard operation and accessible names pass.
- [ ] RTL/LTR and long-label fixtures pass.
- [ ] Loading does not shift geometry.

## G3 — Templates and page families

- [ ] Six shared templates cover every canonical route family.
- [ ] Index pages contain previews; eligible records alone receive detail URLs.
- [ ] Blog remains independent from Projects.
- [ ] Publications keep independent canonical URLs under Research navigation.
- [ ] Empty production modules are omitted.

## G4 — Visual Atlas isolation

- [ ] Atlas uses real production components and tokens.
- [ ] Atlas runs locally with `DESIGN_ATLAS=1`.
- [ ] Default build contains no `/_design/` output or atlas fixture import.
- [ ] Atlas is absent from sitemap, Pagefind and public navigation.
- [ ] Stable screenshot selectors exist.

## G5 — Responsive, RTL and content states

- [ ] 320/390/768/1024/1280/1440 have no unintended horizontal overflow.
- [ ] English LTR and Persian RTL render with correct font and logical layout.
- [ ] Empty, no-results, error and unavailable-translation remain distinct.
- [ ] 200% zoom preserves navigation and reading order.
- [ ] Mixed-direction identifiers use isolation.

## G6 — CMS/admin alignment

- [ ] Actual model/API gap report is approved before migrations.
- [ ] Publication, locale, privacy, rights and detail-page gates are enforced.
- [ ] Home selections explain manual/rule/hybrid provenance.
- [ ] Design tokens and component anatomy remain uneditable by content editors.
- [ ] No phone/personal Gmail or restricted project data reaches public DTOs.

## G7 — Graph Phase 1

- [ ] 2D and semantic-list views consume the same published payload.
- [ ] Keyboard selection reaches the same related records as pointer selection.
- [ ] Orphan, duplicate-edge, missing-label and broken-link validation passes.
- [ ] Reduced motion and no-WebGL paths remain complete.
- [ ] Phase 2 controls are visibly unavailable until separately accepted.

## G8 — Optional graph Phase 2

- [ ] 3D adds no content or relationship unavailable in 2D/list.
- [ ] Complexity/performance budget passes on representative devices.
- [ ] Camera motion is bounded and disabled under reduced motion.
- [ ] Runtime failure immediately returns to 2D/list.

## G9 — Release candidate

- [ ] JavaScript-disabled content path passes.
- [ ] Astro check/build, targeted QA and Playwright suites pass.
- [ ] Accessibility checks and manual keyboard/screen-reader path pass.
- [ ] Asset formats/sizes, LCP, layout shift and motion budgets pass.
- [ ] No draft/private/internal data appears in built output or search index.
- [ ] Project owner documents are reconciled via `DOCUMENT-MIGRATION-MAP.md`.
- [ ] Production deploy has a separate approval, backup, smoke and rollback plan.

