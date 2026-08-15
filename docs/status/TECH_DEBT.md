# Technical Debt

> فقط debt غیرحاد را ثبت کنید. ریسک release، security یا blocker در `RISK_REGISTER.md` و آزمون deferشده در `deferred-validation.md` ثبت می‌شود.

| ID | Phase/Slice | Severity | Description | Why deferred | Owner | Target phase/date | Mitigation/fallback | Evidence/command | Status |
|---|---|---|---|---|---|---|---|---|---|
| DEBT-0001 | P1 / Design baseline alignment | Low | `docs/design.md` still documents React/shadcn/Radix/GSAP/D3/Three as the target frontend architecture while the P1 build is intentionally static-only with none of those installed. | This is a vision-vs-implementation phase gap, not a defect; P1 is a scoped subset. | Project owner | پیش از P3 (زمان معرفی islands/CMS) | ADR-0016/0018 scoped P1 static-only; P3 slices must explicitly decide which vision components enter with tested Task Specs, and must not silently re-introduce the blocked stack. | verification report LOG-0047؛ ADR-0016/0018. | OPEN |
