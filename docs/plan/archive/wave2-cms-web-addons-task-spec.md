# Task: Wave 2 — statement PDF, lightbox, iframe demo CSP

- Goal: Close DEFER-0019 (Research Statement PDF upload), ship F7 native lightbox for case-study/story images, and advance DEFER-0021 with CSP Report-Only plus click-to-load demo embeds without inventing demo hosts.
- User/actor and journey: Public readers download an optional statement PDF; view screenshots/figures with progressive-enhancement lightbox; load approved demos only after click. Editors attach PDF via MediaPicker on research-statement. Owner attends migrate `content.0013` and later confirms CSP frame-src hosts before enforce.
- Release type: `STANDARD`
- Risk level: Medium (additive migration + edge CSP header; no auto-migrate)
- Owner and handoff recipient: Agent implements; owner dumpdata/backup + attended migrate + Caddy reload; owner confirms demo allowlist before CSP enforce.

## Scope

- In scope:
  - Nullable `ResearchStatement.statement_pdf` → `media.Media` + migration `content.0013_*`
  - Public projection via `public_media_ref()` (active only; title/mime/size)
  - Admin schema MediaPicker for `statementPdfId`; usage registry
  - Astro statement pages (fa/en) honest download link
  - Real screenshot/diagram images + native `<dialog>` lightbox on CaseStudyDetail + StoryBody figure/gallery
  - CSP `Content-Security-Policy-Report-Only` on Compose + host Caddyfiles; click-to-load iframe gated by empty owner allowlist placeholders
- Non-goals:
  - Wave 1 web polish, Wave 3+ P8/graph/ADM QA/Pagefind
  - CSP enforce mode
  - Invented demo URLs or allowlist hosts
  - Setting `CMS_CD_AUTO_MIGRATE`
- Allowed files: `apps/cms/**`, `apps/web/**`, `infra/caddy/**`, `docs/plan/**`, `docs/status/**`, `Task-list.md`
- Forbidden files: Wave 1 worktree; plan file under `.cursor/plans/`

## Contracts and data

- Documents/ADRs/API schemas/models read: AGENTS.md, P5/P6 specs, CV Media pattern, public_media_ref, Caddy security headers
- Contracts changed: public ResearchStatement DTO gains `statement_pdf`; PublicMediaOut gains `size`; CSP Report-Only header
- Migration/data impact: additive nullable FK only (`content.0013`). Owner dumpdata + backup before prod migrate.
- Locale, visibility and publication impact: inactive Media never projected; demo iframe only when public `demo_url` host is owner-allowlisted (empty until confirmed)
- Security/privacy impact: CSP Report-Only with `'unsafe-inline'` for existing JSON-LD/About scripts; iframe `sandbox` + allowlist; enforce deferred

## Verification and release

- Tests/commands to run:
  - `uv run pytest apps/cms/tests/test_statement_pdf.py apps/cms/tests/test_media_image_rewire.py -q`
  - `uv run ruff check .` in `apps/cms`
  - `npm run check` + `npm run build` in `apps/web`
  - Admin SPA: schema-driven MediaPicker (no separate SPA package change required beyond CMS schema)
- Manual QA path: attach active PDF in admin → rebuild → statement download; screenshot with active image → lightbox; inactive media omitted from API
- Acceptance criteria:
  - Inactive statement PDF never appears in public JSON
  - Screenshots render `<img>` when Media active; no-JS keeps direct file links
  - CSP Report-Only present; enforce not enabled; allowlist empty/placeholder
- Rollback/fallback: reverse `0013` AddField; remove CSP header line; remove lightbox/DemoEmbed components
- Documentation to update: WORK_LOG LOG-0212, deferred-validation, CHANGELOG, Task-list, plan README, RISK if needed

## Handoff

- Files changed (task-owned only): see WORK_LOG LOG-0212
- Verification actually run (command + result):
  - `uv run pytest tests/test_statement_pdf.py tests/test_media_image_rewire.py -q` → 9 passed
  - `uv run ruff check .` in `apps/cms` → All checks passed
  - `npm run check` + `npm run build` in `apps/web` → 0 errors; 40 pages built
- Deferred/risk IDs: DEFER-0019 CLOSED (repo); DEFER-0021 PARTIAL; no new CRITICAL risk
- Explicit blockers and next input: owner demo host confirmation before CSP enforce / frame-src expansion; prod migrate `content.0013` **DONE** (LOG-0216)
