# RELEASE-QA — Static P1 Release Artifact QA Report

- Date: 2026-08-15
- Artifact: `apps/web/dist/` (Astro static build, `@taha/web@0.1.0`, Astro v7.2.2)
- Command: `npm run build` in `apps/web` — exit 0, complete

## 1. Build output (tail)

```
05:13:59 [build] output: "static"
05:13:59 [build] mode: "static"
05:13:59 [build] directory: D:\Project\Taha-personal-platform\apps\web\dist\
05:13:59 [build] Collecting build info...
05:13:59 [build] ✓ Completed in 183ms.
05:13:59 [build] Building static entrypoints...
05:14:01 [vite] ✓ built in 1.92s
05:14:01 [vite] ✓ built in 25ms
05:14:01 [build] Rearranging server assets...
05:14:01   ├─ /404.html (+27ms)
05:14:01   ├─ /en/index.html (+18ms)
05:14:01   ├─ /fa/index.html (+8ms)
05:14:01   ├─ /health.json (+8ms)
05:14:01   ├─ /robots.txt (+6ms)
05:14:01   ├─ /sitemap.xml (+6ms)
05:14:01   ├─ /index.html (+8ms)
05:14:01   ✓ Completed in 106ms.
05:14:01 [build] 4 page(s) built in 2.39s
05:14:01 [build] Complete!
```

## 2. File inventory (19 files)

| Path | Bytes |
|---|---|
| `index.html` | 7,950 |
| `en/index.html` | 7,913 |
| `fa/index.html` | 8,718 |
| `404.html` | 4,008 |
| `health.json` | 52 |
| `robots.txt` | 69 |
| `sitemap.xml` | 263 |
| `favicon.svg` | 262 |
| `_astro/global.CtKXivQx.css` | 11,288 |
| `_astro/Landing.DtCdUQpc.css` | 7,845 |
| `_astro/inter-cyrillic-ext-wght-normal.BOeWTOD4.woff2` | 25,960 |
| `_astro/inter-cyrillic-wght-normal.DqGufNeO.woff2` | 18,748 |
| `_astro/inter-greek-ext-wght-normal.DlzME5K_.woff2` | 11,232 |
| `_astro/inter-greek-wght-normal.CkhJZR-_.woff2` | 18,996 |
| `_astro/inter-latin-ext-wght-normal.DO1Apj_S.woff2` | 85,068 |
| `_astro/inter-latin-wght-normal.Dx4kXJAl.woff2` | 48,256 |
| `_astro/inter-vietnamese-wght-normal.CBcvBZtf.woff2` | 10,252 |
| `_astro/vazirmatn-arabic-wght-normal.Cafbb7Zc.woff2` | 46,308 |
| `_astro/vazirmatn-latin-ext-wght-normal.tDTa1Fj6.woff2` | 21,860 |
| `_astro/vazirmatn-latin-wght-normal.BFexNX-K.woff2` | 34,524 |

All required artifacts present: index.html, en/index.html, fa/index.html, 404.html, health.json, robots.txt, sitemap.xml, favicon.svg, 2 `_astro` CSS files, 10 woff2 font files (Inter: cyrillic-ext, cyrillic, greek-ext, greek, latin-ext, latin, vietnamese; Vazirmatn: arabic, latin-ext, latin).

## 3. Content verification

| Item | Result | Evidence |
|---|---|---|
| health.json status + version | PASS | `{"status":"ok","service":"static","version":"0.1.0"}` |
| robots.txt User-agent/Allow/Sitemap | PASS | `User-agent: *`, `Allow: /`, `Sitemap: https://tahamohamadi.ir/sitemap.xml` |
| sitemap.xml 3 urls | PASS | `<loc>https://tahamohamadi.ir/</loc>`, `/en/`, `/fa/` (3 `<url>` entries) |
| en/index.html lang/dir | PASS | `<html lang="en" dir="ltr">` |
| en/index.html title | PASS | `<title>Taha Mohammadi — Human-Centered Intelligent Systems</title>` |
| en/index.html canonical | PASS | `<link rel="canonical" href="https://tahamohamadi.ir/en/">` |
| en/index.html hreflang fa | PASS | `<link rel="alternate" hreflang="fa" href="https://tahamohamadi.ir/fa/">` |
| en/index.html og:locale | PASS | `<meta property="og:locale" content="en_US">` |
| fa/index.html lang/dir | PASS | `<html lang="fa" dir="rtl">` |
| fa/index.html og:locale | PASS | `<meta property="og:locale" content="fa_IR">` |
| fa/index.html canonical + hreflang en | PASS | canonical `/fa/`; `<link rel="alternate" hreflang="en" href="https://tahamohamadi.ir/en/">` |
| fa/index.html Persian content | PASS | Valid UTF-8, Persian chars present (`[\u0600-\u06FF]` matches in title/description/body); title is Persian equivalent of English title |
| 404.html noindex | PASS | `<meta name="robots" content="noindex">` |
| index.html gateway hreflang x-default | PASS | `<link rel="alternate" hreflang="x-default" href="https://tahamohamadi.ir/">` plus hreflang en + fa |
| index.html gateway bilingual names | PASS | Body contains `gateway-name-en` `Taha Mohammadi` and `gateway-name-fa` `طه محمدی` (8 chars, UTF-8) |

## 4. Size report

| Category | Total bytes |
|---|---|
| HTML (4 files) | 11,958 |
| CSS (2 files) | 19,133 |
| Fonts (10 woff2) | 321,204 |
| Other (favicon, json, txt, xml) | 646 |
| **Total dist** | **369,572 (~361 KB)** |

Largest non-font file: `index.html` 7,950 B. Largest font: `inter-latin-ext` 85,068 B. No single file > 500 KB; fonts counted separately as required.

## 5. Secret scan

`rg -iI -c '(BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|password\s*[:=]\s*[^ ]{6,})' dist` → **0 matches** (empty). PASS.

## 6. Verdict

**RELEASE-READY**

Reasons: build completes cleanly with zero warnings/errors; all 19 expected artifacts present; every content check (locale attrs, canonical/hreflang/og, robots/sitemap/health, 404 noindex, bilingual gateway) passes; no file exceeds the 500 KB threshold; secret scan clean. No SEV issues. No NEEDS-FIX items.
