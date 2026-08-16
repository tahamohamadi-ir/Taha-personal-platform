# Known Issues

> فقط مشکل‌های تأییدشده و قابل مشاهده برای کاربر در نسخهٔ deployشده را ثبت کنید.

| ID | First seen | Affected environment | User-visible behavior | Severity | Owner | Workaround | Evidence | Status |
|---|---|---|---|---|---|---|---|---|
| KI-0001 | 2026-08-15 | Production, `/fa/about/` (social links) and profile data | The fa GitHub handle is `tahamohammadi-ir` (double "m") which resolves to a non-existent repository; the en handle and canonical remote use `tahamohamadi-ir` (single "m"). The fa About social link and the PARS-SQL/VTD-Edge GitHub link were broken until corrected. | Medium | Project owner | None until data correction; JSON-LD and page content intentionally mirror the approved typed data and must not diverge from it. | **Fixed 2026-08-15:** `apps/web/src/data/profile.fa.ts` socials + PARS-SQL project URL corrected to single-m; `rg tahamohammadi apps/web/src` → no matches; LOG-0110. Original evidence: `git ls-remote https://github.com/tahamohammadi-ir/ADHD-VTD.git` → repository not found; single-m handle resolves (`434145a…`); canonical remote `PROJECT_MANIFEST.md:12`. | CLOSED (2026-08-15) |
