# Known Issues

> فقط مشکل‌های تأییدشده و قابل مشاهده برای کاربر در نسخهٔ deployشده را ثبت کنید.

| ID | First seen | Affected environment | User-visible behavior | Severity | Owner | Workaround | Evidence | Status |
|---|---|---|---|---|---|---|---|---|
| KI-0001 | 2026-08-15 | Production and staging, `/fa/about/` (social links) and profile data | The fa GitHub handle is `tahamohammadi-ir` (double "m") which resolves to a non-existent repository; the en handle and canonical remote use `tahamohamadi-ir` (single "m"). The fa About social link and the PARS-SQL/VTD-Edge GitHub link are broken until corrected. | Medium | Project owner | None until data correction; JSON-LD and page content intentionally mirror the approved typed data and must not diverge from it. | `git ls-remote https://github.com/tahamohammadi-ir/ADHD-VTD.git` → repository not found; single-m handle resolves (`434145a…`); `apps/web/src/data/profile.fa.ts:192,165` vs `profile.en.ts:197,170`; canonical remote `PROJECT_MANIFEST.md:12`. | OPEN (owner decision) |
