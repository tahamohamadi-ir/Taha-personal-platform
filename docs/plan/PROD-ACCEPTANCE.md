# PROD-ACCEPTANCE — Live Production Acceptance Check

- **Date (UTC):** 2026-08-15 12:31–12:33 (host clock)
- **Executor:** read-only acceptance pass (no writes; WORK_LOG.md / S-PLAN-STATE.md untouched; no commits)
- **Scope:** https://tahamohamadi.ir (production) and https://staging.tahamohamadi.ir (staging reference)
- **Method:** `curl.exe` real requests over the public internet; direct-origin probes use `curl.exe --resolve tahamohamadi.ir:443:85.192.29.196`
- **Gate status:** P0-G0 PASS for static-only P1 — this report checks the deployed artifact only.

## 1. PASS/FAIL table

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1a | `/` gateway 200 + hreflang x-default | PASS | HTTP 200, 7950 B. `<link rel="alternate" hreflang="x-default" href="https://tahamohamadi.ir/">` + hreflang `en`/`fa` links present. |
| 1b | `/en/` lang= en, dir=ltr | PASS | HTTP 200. `<!DOCTYPE html><html lang="en" dir="ltr">` |
| 1c | `/fa/` lang= fa, dir=rtl | PASS | HTTP 200. `<!DOCTYPE html><html lang="fa" dir="rtl">` |
| 1d | `/health.json` status ok + version | PASS | HTTP 200. `{"status":"ok","service":"static","version":"0.1.0"}` |
| 1e | `/favicon.svg` | PASS | HTTP 200, 262 B |
| 1f | `/robots.txt` via proxy AND direct-origin | PASS (content differs — see §3) | 200 both routes. Proxy body includes Cloudflare-managed content; origin body is the plain file. |
| 1g | `/sitemap.xml` lists exactly `/`, `/en/`, `/fa/` | PASS | HTTP 200. `<loc>` entries are exactly `https://tahamohamadi.ir/`, `.../en/`, `.../fa/` (no other URLs). |
| 2a | `/` HTTP status | PASS | `HTTP/1.1 200 OK` |
| 2b | Strict-Transport-Security | PASS | `strict-transport-security: max-age=31536000; includeSubDomains; preload` |
| 2c | X-Content-Type-Options | PASS | `x-content-type-options: nosniff` |
| 2d | X-Frame-Options | PASS | `x-frame-options: DENY` |
| 2e | Referrer-Policy | PASS | `referrer-policy: strict-origin-when-cross-origin` |
| 2f | Server header | PASS | `Server: cloudflare` (CDN in front; origin is Caddy, confirmed via direct probe: `Server: Caddy`) |
| 2g | cf-cache-status | OBSERVED | `cf-cache-status: DYNAMIC` — HTML not edge-cached; acceptable for P1, note only |
| 3a | `https://www.tahamohamadi.ir/` → 301 | PASS | `HTTP/1.1 301 Moved Permanently`, `location: https://tahamohamadi.ir/` |
| 3b | `http://tahamohamadi.ir/` → 301 | PASS WITH NOTE | `HTTP/1.1 308 Permanent Redirect` (not 301), `Location: https://tahamohamadi.ir/` — Cloudflare's automatic HTTP→HTTPS upgrade uses 308. Target is correct. |
| 4a | PROD `/definitely-missing-xyz` status | PASS (status) | `HTTP/1.1 404 Not Found` |
| 4b | PROD 404 body | FAIL | Body is **EMPTY** (Content-Length: 0) — neither the custom Astro 404 page nor a Caddy text 404. Direct-origin probe (Server: Caddy) also empty → origin-side issue (see §2). |
| 4c | STAGING `/definitely-missing-xyz` status + body | PASS (reference) | `404 Not Found`, 4008 B custom page: `<title>Page not found · Taha Mohammadi</title>`, contains `Page not found` and `notfound-code`, `x-robots-tag: noindex, nofollow`. Staging serves the custom page because `handle_errors` is enabled there. |
| 5 | Fonts (`/_astro/*.woff2`) | PASS (note) | woff2 URLs are **not inline in `/en/` HTML**; they are loaded via `@font-face` in `/_astro/global.CtKXivQx.css` (10 files, Inter + Vazirmatn). Sampled `/_astro/vazirmatn-arabic-wght-normal.Cafbb7Zc.woff2` → HTTP 200, `font/woff2`, 46308 B. |

## 2. 404 finding (called out)

- **PRODUCTION:** `GET /definitely-missing-xyz` → `404 Not Found` with an **empty body** (Content-Length: 0), both via the Cloudflare proxy and via direct origin (`--resolve …:85.192.29.196`, `Server: Caddy`). It is neither the custom page ("Page not found" / "صفحه پیدا نشد" / "notfound-code" — all absent) nor a plain Caddy 404 text. Cause: `handle_errors` is **not enabled** in the production Caddy config, so Caddy emits an empty 404 for missing static files.
- **STAGING (reference, has `handle_errors`):** same URL → `404 Not Found` with the **custom Astro 404 page** (4008 B): `<title>Page not found · Taha Mohammadi</title>`, markers `Page not found` + `notfound-code` present, `x-robots-tag: noindex, nofollow`. The `/fa/definitely-missing-xyz` variant also returns the custom page (`notfound-code` present).
- **Difference (explicit):** prod = empty 404; staging = custom 404 page. The custom `404` page artifact exists (staging proves it) but is not served in production. Action: enable `handle_errors` in the production Caddyfile (deploy-side change, out of scope for this read-only check).

## 3. robots.txt proxy-vs-origin difference

- **Via Cloudflare proxy:** Cloudflare injects its managed block — license preamble (EU Directive 2019/790 Content-Signal), `Content-Signal: search=yes,ai-train=no,use=reference`, `Disallow: /` for AI crawlers (Amazonbot, Applebot-Extended, Bytespider, CCBot, ClaudeBot, CloudflareBrowserRenderingCrawler, Google-Extended, GPTBot, meta-externalagent), then the site rules and `Sitemap:` line. This is expected Cloudflare "Managed robots.txt" behavior, not an origin file change.
- **Direct origin (`curl.exe --resolve tahamohamadi.ir:443:85.192.29.196`):** plain file only:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://tahamohamadi.ir/sitemap.xml
  ```
- Both return 200. No functional issue; the difference is CDN-layer content injection. Note only.

## 4. Verdict: **PROD-ACCEPTED** (updated 2026-08-15)

The static P1 artifact (Language Gateway, `/en/`, `/fa/`, health, sitemap, security headers, redirects, fonts, CDN edge) is live and working.

Notes (updated):

1. ~~Prod 404 has an empty body~~ — **RESOLVED 2026-08-15**: `caddy-apply.sh` inserted `handle_errors` into `taha_application_routes`; production and staging now serve the custom 404 (status 404, body 4127 B, bilingual). Verified (LOG-0083).
2. **`http://tahamohamadi.ir/` returns 308, not 301** — Cloudflare's automatic HTTP→HTTPS upgrade. Location (`https://tahamohamadi.ir/`) is correct; a literal 301 is only needed if an external contract requires it.
3. **robots.txt differs proxy vs origin** — Cloudflare injects its managed content-signal/AI-crawler block over the origin's plain `User-agent: * / Allow: /` + Sitemap. Expected CDN behavior; tracked as `DEFER-0011`.
4. **woff2 fonts are not inline in the HTML** — they are `@font-face` URLs inside `/_astro/global.CtKXivQx.css`; all sampled fetches return 200. Deviates from the check's assumption, not a defect.
5. `cf-cache-status: DYNAMIC` on HTML — no edge caching for pages; acceptable for static P1, candidate for `Cache-Control` tuning later.
