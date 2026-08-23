# ADR Index

ADRها immutable هستند: تغییر تصمیم با ADR جدید انجام می‌شود، نه با بازنویسی تصمیم پذیرفته‌شده.

| ADR | Decision | Status |
|---|---|---|
| 0002 | Python 3.12 + Django 5.2 LTS + Wagtail 7.4 LTS baseline | Accepted; Wagtail part superseded by ADR-0026 (2026-08-18) |
| 0008 | Docker Compose + Caddy deployment | Accepted; public serving amended by ADR-0027 (nginx `web`, still no public Node) |
| 0009 | GitHub Actions hosted CI | Accepted |
| 0010 | Encrypted Google Drive backup | Accepted target; provisioned and file-level restore-tested on 2026-08-14; staging DB import remains |
| 0011 | Bilingual URL behavior | Accepted |
| 0014 | `/admin/` boundary | Accepted for route; boundary redefined by ADR-0026 (2026-08-18); hardening deferred |
| 0015 | Isolated staging placeholder | Accepted P0-A route; applied and externally verified; superseded by ADR-0025 |
| 0016 | Static-first Astro + React islands boundary | Proposed |
| 0017 | Versioned static artifact deploy + atomic switch/rollback | Proposed |
| 0018 | P1 design/hydration/font minimum | Proposed |
| 0019 | P1 bilingual font selection | Accepted |
| 0020 | P3 admin auth and authorization boundary (custom User, audit, rate limit, MFA designed) | Accepted 2026-08-15 (P3 code-first); admin surface moves from Wagtail to custom React admin per ADR-0026 (2026-08-18); security contracts retained |
| 0021 | P3 media library and upload security (filetype allowlist, private default, safe names) | Accepted 2026-08-15 (P3 code-first) |
| 0022 | P3 rich text sanitization and preview (Wagtail feature allowlist, noindex preview) | Accepted 2026-08-15 (P3 code-first); sanitization moves to the custom admin editor per ADR-0026 (2026-08-18) |
| 0023 | P3 CMS→Astro rebuild trigger (HMAC-signed, freshness, disabled default) | Accepted 2026-08-15 (P3 code-first) |
| 0024 | P3 content lifecycle and edit-concurrency (draft/review/published/archived, public() only) | Accepted 2026-08-15 (P3 code-first) |
| 0025 | Staging decommissioning (staging.tahamohamadi.ir removed; gate = CI + production smoke) | Accepted 2026-08-15 (owner) |
| 0026 | Custom admin panel replaces the Wagtail admin (React SPA + Django Ninja `/api/v1/admin/*`; Wagtail removed; content preserved) | Accepted 2026-08-18 (owner) |
| 0027 | Unified Compose: `db` + `cms` + `web` (nginx/Astro dist) + later `caddy`; CMS origin; no public React/SSR in v1 | Accepted 2026-08-19 (owner) |
| 0028 | Research relationship graph as progressive React island (SVG + `motion`, 35KB gzip budget; no gsap/three) | Accepted 2026-08-22 |

The technology baseline still governs the remaining architecture decisions. Create a new ADR only when a decision is non-obvious, expensive to reverse, security/operations relevant, or changes a frozen contract.
