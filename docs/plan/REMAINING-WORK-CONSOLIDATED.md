# Master Remaining-Work Checklist — consolidated view (2026-08-24)

> این جدول، نمای یکپارچهٔ همهٔ کارهای باز پروژه به‌جز موج‌های ریدیزاین فرانت است
> (ریدیزاین = Waves A–Z در `PARALLEL_EXECUTION_PLAN.md`؛ A و B انجام و دیپلوی شده‌اند).
> جزئیات پذیرش هر ID در همین فایل (بخش‌های WS-*) و دفاتر `docs/status/` باقی است.
> مالک‌ها: `agent` = بدون تصمیم انسانی · `joint` = agent آماده می‌کند، مالک تأیید/اجرا می‌کند · `owner` = فقط مالک.

## ۱) محتوای تمام-CMS (WS-A) — مالک: agent

| ID | آیتم | وضعیت |
|---|---|---|
| A1 | خانهٔ `/en/`,`/fa/` از CMS (`landing.ts` + fail-build honesty spec) | PARTIAL — data layer + `qa/home-cms-build.spec.mjs` shipped (#110); CMS-fed content wiring remains |
| A2 | Featured spotlight خانه از CMS | OPEN |
| A3 | هدر/فوتر/tagline/SEO defaults از `/api/site` | OPEN |
| A4 | CV کاملاً ادمین‌محور؛ حذف md های commit‌شده از آرتیفکت | OPEN |
| A5 | متن‌های Gateway/404 → SiteSettings | OPEN (P3, اختیاری) |
| A7 | آپلود PDF بیانیه پژوهش | OPEN (owner upload) |
| A8 | Reading time دوزبانه | DONE (LOG-0238 batch) |
| A9 | TOC + breadcrumb مقالات بلند (+H7 linkedom build-time TOC) | OPEN |

## ۲) تکمیل UX پنل ادمین (WS-B) — مالک: agent

| ID | آیتم | وضعیت |
|---|---|---|
| B1 | ممیزی جامع UI/SPA + رفع یافته‌ها | PARTIAL → اسلیس اول = X-04 (PR #104، UX_AUDIT.md؛ ۱۵ یافته باقی) |
| B2 | ادیتورهای detail دوزبانه سایر موجودیت‌ها | OPEN |
| B3 | UX ادیتور Composition | OPEN |
| B4 | UX کتابخانه Media | OPEN |
| B5 | renditions رسانه (thumb/card/full webp) | OPEN |
| B6 | غنی‌سازی Dashboard ادمین | OPEN |
| B7 | Vitest colocated (S3) + بودجه Lighthouse (S5) | OPEN |
| B8 | ادامه service layer + فلگ‌ها (DEBT-0007) | OPEN |
| B9 | QA دستی S6 (DEFER-0032 remainder) | OPEN (joint) |
| B11 | usage registry PK media داخل JSON بلوک‌ها | verify: LOG-0223 says done — confirm & close |
| B12 | یکپارچه‌سازی preview/share-link در SPA | OPEN |

## ۳) CI/CD بی‌SSH (WS-C) — مالک: agent

| ID | آیتم | وضعیت |
|---|---|---|
| C1 | اثبات زنجیره publish→rebuild بدون SSH | PARTIAL (نیاز dispatch آزمایشی مالک؛ چک‌لیست آماده) |
| C2 | سلف‌سرویس cd.yml + GitHub Environment protection | OPEN |
| C3 | web image از GHCR به‌جای build روی VPS | OPEN (deps C2) |
| C4 | توسعه smoke پس از deploy | OPEN |
| C5 | ~~پاک‌سازی اسکریپت‌های کهنه infra~~ | DONE (LOG-0224) — CLOSED |
| C6 | Runbook zero-SSH operations | OPEN (deps C2,C4) |
| C7 | Dependabot npm/GHA (+uv دوراهی documented) | OPEN |
| C8 | Observability پایه (uptime/disk/5xx alert) | OPEN (joint) |
| C9 | ریتم drill بکاپ سه‌ماهه | OPEN (owner اجرا) |
| C10 | سلامت تایمر publish زمان‌بندی‌شده | OPEN (deps C2) |

## ۴) دفاتر باز / ریسک‌ها — مالک: joint/owner

| ID | آیتم | مالک |
|---|---|---|
| F2 | allowlist دمو: مالک دامنه‌ها را بدهد → تست click-to-load → CSP enforce | owner→agent (ساختار آماده: X-10) |
| F6 | جلسه zoom200% + ماتریس موبایل واقعی 320–1440 | owner |
| F7 | sign-off preview محلی About detail | agent |
| F8 | بستن/لغو DEFER-0001/0002/0006 | joint |
| F9 | احراز لایسنس Beautiful UI/UI8 قبل از adoption | owner |
| F10 | پاک‌سازی ارجاع Wagtail در runbooks | عمدتاً DONE (A-07/C5) — residual sweep |
| F11 | تصمیم DEBT-0002 tabs/find-in-page | owner→agent |
| F12 | sync checkboxهای کهنه Task-list §5/§19 | PARTIAL (LOG-0224) |
| KI-0007 | ~~Cloudflare Email Obfuscation خاموش شود~~ **CLOSED 2026-08-25** — مالک toggle را زد؛ mailto لایو تمیز است (LOG-0247) | — |

## ۵) فازهای آینده (WS-G) — مالک: owner-gated

G1 تاکسونومی (glossary/synonym/rules) · G2 collections کیوری‌شده پژوهش · G3 تکمیل جستجو (keyboard/lifecycle/drift-guard) · G4 آموزش+خلق‌آفرینی (Course/CreativeWork contracts) · G5 AI/pgvector/graph (XL، threat model لازم).

## ۶) کتابخانه‌ها (WS-H) — مالک: agent

H1 react-hook-form+zod · H2 react-query · H3 react-table · H4 toast (sonner) · H5 Radix/shadcn ادمین-only · H6 schema-dts · H7 TOC build-time · H13 axe/hypothesis/pytest-cov · H14 @astrojs/sitemap ارزیابی. همه مشمول گیت H0 (ارزش، لایسنس، بودجه، audit، no-JS/RTL).

## ۷) کیفیت دادهٔ پروفایل (جدید ۲۰۲۶-۰۸-۲۴) — مالک: joint

هماهنگ‌سازی محتوای سایت با CVهای جدید مالک:
- پروژه‌های ۲۰۲۶: User Behavior Platform (Kafka/Apicurio/ClickHouse) · Enterprise AI Capability Strategy · Human Digital Assessment (proposed) — تصمیم اینکه کدام‌ها public شوند با مالک (قانون §10 IA: فقط شواهد تأییدشده).
- ایمیل رسمی: **فقط `taha.mohammadi@shahed.ac.ir` در فضای عمومی** — الان لایو همین است (CMS `/api/site`)؛ gmail هرگز public نشود. CVهای offline هم یکدست شوند.
- ORCID `0009-0006-7736-7638` و لینک ADHD-VTD روی صفحهٔ پژوهش/تماس.
- Stanford AI in Healthcare (54.5h) در CV page.
