# Master Execution Plan v3 — فازبندی موازی‌پذیر برای چند ایجنت

**Status:** ACTIVE — Wave A ✅ DEPLOYED (PRs #99–103: tokens/format/Tailwind-removal/budget+demo specs) · Wave B ✅ DEPLOYED (#104–107: admin UX audit, primitives, gateway/404 night, CatalogPage+DetailShell) · Wave C ✅ HOME LIVE (#108 hero+drag-rotate, #110 home-CMS honesty spec, #111 sections split, #112 hotfix night header/footer). **Wave D (page migrations) = next.** X-01/A1 partial done via qa/home-cms-build.spec.mjs.
**Created:** 2026-08-24 (LOG-0246+) · آخرین sync: 2026-08-25 (LOG-0251) · **مالک تخته:** Project owner + agentها
**هدف:** اجرای همزمان توسط N ایجنت بدون تداخل فایل؛ هر تسک = یک branch مستقل، یک دامنهٔ فایل، یک خروجی قابل انتشار.
**مجوز حرکت/هویت:** ADR-0030 + ADR-0031 · **پلن بازطراحی:** `reDesign_plan.md` v2

---

## ۰. قواعد اجرای موازی (برای هر ایجنت)

1. **هر تسک از جدول = یک branch از `main` با نام `task/<ID>`؛ merge فقط با CI سبز.**
2. **قفل فایل:** هر تسک فقط فایل‌های ستون «دامنه» را لمس می‌کند. اگر دو تسک فایل مشترک دارند، در ستون «هم‌زمان با» علامت ⚠️ خورده‌اند و نباید هم‌زمان اجرا شوند.
3. `apps/web/src/styles/global.css` = گلوگاه مشترک. فقط تسک‌هایی که آن را تغییر می‌دهند با هم تداخل دارند؛ بقیه آزادند. توکن‌های §0 در R0 **یک بار** اضافه می‌شوند و بعد از آن هیچ تسکی global.css را نمی‌شکند مگر صریح نوشته شود.
4. DoD هر تسک: کد + تست/QA + `npm run check && npm run build` یا pytest سبز + WORK_LOG entry + به‌روزرسانی سطر همین جدول.
5. اندازه‌ها: S ≤ نیم‌روز · M ≤ ۱ روز · L ≤ ۲ روز (کار یک ایجنت).
6. هیچ تسکی منتظر تسک دیگری نمی‌ماند مگر ستون deps پر باشد.

---

## ۱) فاز ۰ — شالوده و زیرساخت موازی (Wave A — همه هم‌زمان قابل شروع)

| ID | تسک | دامنهٔ فایل (انحصاری) | deps | حجم | ایجنت |
|---|---|---|---|---|---|
| **A-01** | R0: توکن‌های شب §0 قرارداد → `global.css` (@theme static: canvas-night/deep, surface-read, glass*, ink-hi/mid/low, brand-text, gold, violet, danger + aurora/grain CSS + فیکس نام فونت‌ها Variable) | `apps/web/src/styles/global.css` | — | S | web-1 |
| **A-02** | `lib/format.ts`: formatDate/formatNumber دوزبانه (fa جلالی+ارقام فارسی build-time) + تست | `apps/web/src/lib/format.ts`, `apps/web/src/lib/format.test.ts` | — | S | web-2 |
| **A-03** | حذف Tailwind import از global.css (معادل دستی ۲ کلاس) — **بعد از merge شدن A-01** | `global.css`, `BaseLayout.astro` | A-01 ⚠️ | S | web-1 |
| **A-04** | ThemeAurora component (CSS-only aurora + grain overlay) | `components/ui/ThemeAurora.astro` جدید | A-01 | S | web-2 |
| **A-05** | `qa/budget.spec.mjs` (سنگینی chunk ها ≤ بودجه‌ها) + wire به CI | `apps/web/qa/budget.spec.mjs` | — | S | qa-1 |
| **A-06** | C7: Dependabot config (npm/GHA; uv دوراهی documented) | `.github/dependabot.yml` | — | S | ops-1 |
| **A-07** | F10-remainder: پاک‌سازی نهایی ارجاع‌های Wagtail در docs/governance runbooks (کامنت‌محور) | `docs/governance/*.md` | — | S | docs-1 |
| **A-08** | C4: توسعهٔ smoke پس از deploy (probe های search/publications/api/health) | `infra/deploy/smoke.sh` | — | S | ops-2 |
| **A-09** | B11-verify + H11: gitleaks/actionlint/trivy به CI (fail روی high+) | `.github/workflows/ci*.yml` | — | M | ops-1 |
| **A-10** | KI-0007: غیرفعال‌سازی Email Obfuscation در Cloudflare (toggle داشبورد — دست مالک) | خارج ریپو | — | XS | owner |

## ۲) فاز ۱ — سیستم کامپوننت + پوسته (Wave B — پس از A-01/A-02)

| ID | تسک | دامنهٔ فایل | deps | حجم | ایجنت |
|---|---|---|---|---|---|
| **B-01** | Primitives: `Btn/Chip/Kicker/MetaRow/Field/Icon` (Astro) با استایل از کلاس‌های جدید global.css (.btn/.chip/.kicker/.meta-row) | `components/primitives/*` جدید, `global.css` (افزودن کلاس‌ها ⚠️ تنها نقطهٔ اشتراک) | A-01 | M | web-1 |
| **B-02** | UI shell: `SiteHeader/SiteFooter/Breadcrumbs/EmptyState/Pagination` نسخهٔ شب شیشه‌ای (Header چسبان blur16) | `components/ui/*` جدید + جایگزین Header/Footer فعلی | A-01, B-01 ⚠️(global.css) | M | web-2 |
| **B-03** | Cover (`pages/index.astro`) + 404 هم‌سیستم شب (بدون constellation قدیمی، aurora + خط طلای امضا) | `pages/index.astro`, `pages/404.astro` | A-01, A-04 | M | web-3 |
| **B-04** | Pattern واحد `CatalogPage.astro` + `DetailShell.astro` (طراحی، هنوز بدون مهاجرت صفحات) | `components/patterns/CatalogPage.astro`, `DetailShell.astro` جدید | B-01 | M | web-3 |
| **B-05** | `qa/glass-contrast.spec.mjs` (نمونه‌برداری کنتراست لیبل‌های شیشه‌ای ≥4.5:1 روی fallback توپر) | `apps/web/qa/glass-contrast.spec.mjs` | A-01 | S | qa-1 |

## ۳) فاز ۲ — تجربهٔ خانه (Wave C — قلب ریدیزاین؛ پس از Wave B)

| ID | تسک | دامنهٔ فایل | deps | حجم | ایجنت |
|---|---|---|---|---|---|
| **C-01** | `HeroSection.astro` (copy + خط برند + chips شیشه‌ای) + حذف هیروی فعلی Landing | `components/sections/HeroSection.astro`, `Landing.astro` ⚠️ | B-01,B-02 | M | web-1 |
| **C-02** | `ConstellationHero.tsx` (ارتقای Constellation3D موجود: واکنش موس + drag-rotate damped + dispose کامل؛ three lazy ≤150KB) | `components/islands/ConstellationHero.tsx` | A-01 | L | r3f-1 |
| **C-03** | `PerspectiveGrid.astro` (۳ کارت شیشه‌ای + spotlight border + tilt ≤4° با ~1KB rAF) | `components/sections/PerspectiveGrid.astro` + `scripts/pointer.ts` | B-01 | M | web-2 |
| **C-04** | `FocusStrip` + `EvidenceSection` (list-row stagger ظریف) + `WritingLatest` + `ContactCTA` (magnetic) | `components/sections/{FocusStrip,EvidenceSection,WritingLatest,ContactCTA}.astro` | B-01 | M | web-3 |
| **C-05** | `JourneySection.astro` + `JourneyScroll.tsx` island (GSAP ScrollTrigger رسم مسیر؛ محتوا فعلاً از design.md §71 draft؛ reduced-motion ایستا) | `components/sections/JourneySection.astro`, `islands/JourneyScroll.tsx` | B-01 | M | gsap-1 |
| **C-06** | مونتاژ خانهٔ جدید: بازنویسی `pages/{en,fa}/index.astro` با ترتیب IA §9-v2 + QA موبایل/RTL/reduced-motion | `pages/en/index.astro`, `pages/fa/index.astro` ⚠️ | C-01..C-05 | M | lead-web |

## ۴) فاز ۳ — کاتالوگ‌ها و صفحات محتوایی (Wave D — کاملاً موازی بین صفحات)

> هر تسک مستقل؛ ترتیب آزاد؛ چند ایجنت هم‌زمان چون فایل‌های صفحه جدا هستند.

| ID | تسک | دامنهٔ فایل | deps | حجم | ایجنت |
|---|---|---|---|---|---|
| **D-01** | مهاجرت Publications list+detail به CatalogPage/DetailShell (دوزبانه) | `pages/{en,fa}/publications/**` | B-04 | M | web-a |
| **D-02** | مهاجرت Books | `pages/{en,fa}/books/**` | B-04 | S | web-b |
| **D-03** | مهاجرت Talks | `pages/{en,fa}/talks/**` | B-04 | S | web-c |
| **D-04** | مهاجرت Downloads | `pages/{en,fa}/downloads/**` | B-04 | S | web-a |
| **D-05** | مهاجرت Projects index+detail (+ badge ترجمه‌شده + ادغام دو اسکریپت فیلتر در یکی) | `pages/{en,fa}/projects/**`, `components/projects/*` | B-04 | M | web-b |
| **D-06** | مهاجرت Writing index + مقاله (`.prose` روی surface-read) + tag/series pages | `pages/{en,fa}/writing/**`, `components/blog/*` | B-04 | M | web-c |
| **D-07** | TopicGraph.tsx (D3 force graph موضوعات↔پروژه↔انتشار، کلیک‌پذیر، tooltip شیشه‌ای؛ ≤60KB lazy) + جایگزینی در research index | `components/islands/TopicGraph.tsx`, `pages/{en,fa}/research/index.astro` ⚠️ | B-04 | L | d3-1 |
| **D-08** | مهاجرت Research topics/detail + statement به DetailShell | `pages/{en,fa}/research/**` (غیر index) ⚠️D-07 | B-04 | M | d3-1 |
| **D-09** | مهاجرت About (تب‌ها chip + کارت‌های Card؛ حذف ~۴۰۰ خط استایل یک‌بارمصرف) | `pages/{en,fa}/about*`, `components/About.astro` | B-01 | M | web-a |
| **D-10** | مهاجرت CV/Résumé (radio tabs هم‌سیستم + دانلودها card--row) | `pages/{en,fa}/cv.astro` | B-01 | S | web-b |
| **D-11** | مهاجرت Contact (برچسب‌سازی fa کامل + فرم توپر هم‌توکن) | `pages/{en,fa}/contact.astro` | B-01 | S | web-c |
| **D-12** | تم Pagefind با متغیرهای `--pagefind-ui-*` روی توکن‌های شب | `pages/{en,fa}/search/index.astro`, `global.css` ⚠️ | A-01 | S | qa-1 |
| **D-13** | Teaching / Creative / Courses catalogs → CatalogPage | `pages/{en,fa}/{teaching,creative}/**` | B-04 | M | web-d |

## ۵) فاز موازی — CMS و عملیات (Wave X — مستقل از فرانت، همیشه قابل اجرا)

| ID | تسک | دامنهٔ فایل | deps | حجم | ایجنت |
|---|---|---|---|---|---|
| **X-01** | A1: خانهٔ CMS-driven (`lib/cms/landing.ts` + fail-build spec `qa/home-cms-build.spec.mjs`) | `apps/web/src/lib/cms/landing.ts`, `pages/{en,fa}/index.astro` ⚠️C-06 | C-06 | L | fullstack-1 |
| **X-02** | A3: هدر/فوتر/tagline/SEO از `/api/site` | `lib/cms/siteSettings.ts` مصرف‌کننده‌ها | — | M | fullstack-2 |
| **X-03** | A4: CV ادمین‌محور + حذف md های commit‌شده از artifact | `apps/web/src/data/profile*`, `lib/cms/*` | — | S | fullstack-2 |
| **X-04** | B1: ممیزی UI/UX جامع SPA + رفع یافته‌ها (گزارش + fix batch اول) | `admin-frontend/src/**` | — | L | spa-1 |
| **X-05** | H1/H2: react-hook-form+zod + react-query در SPA (یک فرم نمونه→بقیه تدریجی) | `admin-frontend/src/**` ⚠️X-04 | X-04 | M | spa-2 |
| **X-06** | B5: renditions رسانه (Pillow ارزیابی طبق H8) + تست | `apps/cms/apps/content/media*` | — | L | django-1 |
| **X-07** | C2+C6: Environment protection در cd.yml + Runbook zero-SSH | `.github/workflows/cd.yml`, `docs/governance/DEPLOY_RUNBOOK.md` | — | M | ops-lead |
| **X-08** | C8: Observability پایه (uptime خارجی + disk alert + 5xx alarm) | infra scripts + governance docs | — | M | ops-2 |
| **X-09** | G1: حکمرانی تاکسونومی (glossary/synonym/rules — پیش‌نیاز انتشار انبوه محتوا) | `apps/cms/apps/content/taxonomy*`, docs | — | M | django-2 |
| **X-10** | F2-part: `demoEmbedAllowlist.ts` آمادهٔ پر شدن + تست click-to-load (سوییچ CSP نهایی با مالک) | `apps/web/src/lib/demoEmbedAllowlist.ts` | — | S | web-2 |

## ۶) فاز پایانی — پولیش و مدرک (Wave Z — پس از Waves C/D)

| ID | تسک | دامنهٔ فایل | deps | حجم |
|---|---|---|---|---|
| **Z-01** | اسکرین‌شات قبل/بعد دوزبانه × desktop/mobile → `docs/status/evidence/redesign-v2/` | qa evidence scripts | C,D | M |
| **Z-02** | ممیزی نهایی کنتراست + reduced-motion/no-JS pass روی همهٔ مسیرها (چک‌لیست DoD قرارداد) | manual+specs | C,D | M |
| **Z-03** | حذف نهایی توکن‌ها/کلاس‌های legacy روشن از global.css + grep hex خارج از global.css = صفر | `global.css` ⚠️ | همه | S |
| **Z-04** | به‌روزرسانی `design.md` به وضعیت in-force جدید (بستن شکاف vision/v2) | `docs/design.md` | Z-03 | M |
| **Z-05** | F6: جلسهٔ zoom200%/موبایل واقعی مالک (320–1440) — ثبت نتایج | manual | Z-01 | S(owner) |
| **Z-06** | WORK_LOG جمع‌بندی wave + sync دفاتر (known-issues/TECH_DEBT) + tag release | ledgers | همه | S |

## ۷) کارهای غیر-فرانت که در همین چارچوب می‌مانند (ارجاع به تختهٔ قبلی)

- B9 (QA دستی S6 ادمین — joint)، C1 (اثبات زنجیره publish→rebuild — نیاز dispatch مالک)، C3 (GHCR web image — پس از X-07)، C9 (drill بکاپ — تقویم سه‌ماهه)، C10 (سلامت تایمر publish — پس از C2)، G2/G3/G4 (پس از X-09)، G5 (owner-gated XL)، H6/H7/H12/H14 (S-size، هر وقت ظرفیت آزاد شد)، A5/A7 (تصمیم/آپلود مالک).

## ۸) نقشهٔ هم‌زمانی پیشنهادی (۳ ایجنت نمونه)

```text
Agent-1:  A-01 → A-03 → B-01 → C-01 ─┐
Agent-2:  A-02 → A-04 → B-02 → C-03 ─┼─→ C-06(mount) → D-01 → D-05 → D-09 → …
Agent-3:  A-05 → B-05 → B-03 → C-04 ─┘        ↘ X-wave جداگانه (fullstack/ops agents)
موازی همیشه: X-01..X-10 (CMS/ops) با ایجنت‌های جدا — صفر تداخل فایل با web waves
```

**سنگین‌ترین گره:** C-06 (مونتاژ خانه) — فقط این یکی انتظار دارد؛ بقیهٔ D-wave قبل از آن هم می‌تواند شروع شود.
