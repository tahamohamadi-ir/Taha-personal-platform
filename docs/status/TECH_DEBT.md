# Technical Debt

> فقط debt غیرحاد را ثبت کنید. ریسک release، security یا blocker در `RISK_REGISTER.md` و آزمون deferشده در `deferred-validation.md` ثبت می‌شود.

| ID | Phase/Slice | Severity | Description | Why deferred | Owner | Target phase/date | Mitigation/fallback | Evidence/command | Status |
|---|---|---|---|---|---|---|---|---|---|
| DEBT-0001 | P1 / Design baseline alignment | Low | `docs/design.md` still documents React/shadcn/Radix/GSAP/D3/Three as the target frontend architecture while the P1 build is intentionally static-only with none of those installed. | This is a vision-vs-implementation phase gap, not a defect; P1 is a scoped subset. | Project owner | پیش از P3 (زمان معرفی islands/CMS) | ADR-0016/0018 scoped P1 static-only; P3 slices must explicitly decide which vision components enter with tested Task Specs, and must not silently re-introduce the blocked stack. | verification report LOG-0055؛ ADR-0016/0018. | OPEN |
| DEBT-0002 | P2 / About evidence scan | Medium | About used CSS radio tabs with `display: none` on inactive panels, hiding evidence from find-in-page and the accessibility tree until a tab was selected. | P2 shipped compact no-JS tabs before P4–P6 routes existed. | Project owner | P2-H closeout | Replaced exclusive tabs with stacked sections + fragment TOC in `About.astro`; `qa/about-tabs.spec.mjs` updated. | LOG-0145; `npm run check` 0 errors; Playwright about-tabs + mobile-overflow PASS. | CLOSED (2026-08-17) |
