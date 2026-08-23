# ADM QA manual checklist (S6 / DEFER-0032 remainder)

Use after the Playwright suite in `apps/web/qa/e2e/admin-qa-matrix.spec.ts`
and `content-lifecycle.spec.ts`. Mark each row with date and evidence URL/screenshot
path (no secrets).

| ID | Check | Automated? | Manual steps | Pass? |
|---|---|---|---|---|
| QA-RTL-01 | Admin shell `dir=rtl` `lang=fa` | Yes (Playwright) | Spot-check live `/admin/login` | |
| QA-LTR-01 | English content slug/fields `dir=ltr` | Yes (Playwright) | Create EN article; confirm slug LTR | |
| QA-LTR-02 | Full LTR admin chrome | No — SPA is Persian-first | N/A until bilingual admin shell ships | |
| QA-KB-01 | Login fields reachable by Tab | Yes (Playwright) | Also verify Esc closes dialogs on edit | |
| QA-KB-02 | Content list filters + pagination keyboard | Partial | Tab through locale/status/search; Enter activates links | |
| QA-NI-01 | `/admin/` `X-Robots-Tag: noindex` + `Cache-Control: no-store` | Yes (Playwright + pytest) | `curl -sI https://tahamohamadi.ir/admin/` | |
| QA-NI-02 | Preview/share paths noindex/no-store | Existing pytest | Spot-check one share URL headers | |
| QA-BULK-01 | Bulk archive toolbar when flag on | Yes (e2e settings) | Production: confirm toolbar **absent** with flag off | |
| QA-BULK-02 | Confirm dialog includes selection count | Yes (Playwright) | Cancel once; confirm once; verify statuses | |
| QA-BULK-03 | Audit summary `lifecycle.bulk_archive` | Yes (pytest) | Staff DB/audit UI if available | |
| QA-VP-01 | Admin usable at 320–1280 CSS px | Manual | Resize; no horizontal trap on content list | |
| QA-RM-01 | `prefers-reduced-motion` | Manual | OS reduce-motion; no essential info only-in-motion | |

## Feature flag

- Name: `FEATURE_ADMIN_BULK_ARCHIVE` / settings `FEATURE_ADMIN_BULK_ARCHIVE`
- Default: **off** (production must stay off until owner enables)
- E2E: on in `config.settings.e2e`

## Out of scope here

- Contact inbox (`DEBT-0006`)
- Owner old-stack decommission (`infra/deploy/decommission-old-stack.md`)
