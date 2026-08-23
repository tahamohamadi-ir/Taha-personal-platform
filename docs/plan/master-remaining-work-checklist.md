# چک‌لیست جامد کارهای باقی‌مانده — Master Remaining-Work Checklist

**Status:** ACTIVE — تخته‌ی واحد کارهای باز پروژه
**Created:** 2026-08-23 (`LOG-0218`)
**مالک تخته:** Project owner + agentها؛ هر آیتم فقط یک بار در همین فایل تعریف می‌شود.
**مرجع وضعیت IDهای دفتری** (`DEFER-*`, `DEBT-*`, `RISK-*`, `KI-*`) همچنان دفاتر `docs/status/` هستند؛ این فایل «کار» را تعریف می‌کند، دفتر «وضعیت» را نگه می‌دارد.
**مسترپلن مرتبط:** `docs/plan/custom-admin-rebuild-fa.md` §14، `Task-list.md` §9–§21، `docs/plan/README.md` §1.

---

## ۰) قیدهای چهارگانه‌ی مالک (بایدهای این تخته)

هر آیتم این چک‌لیست باید با این چهار قید سازگار باشد؛ آیتمی که یکی را نقض کند نباید اجرا شود:

1. **هیچ محتوایی استاتیک نمی‌ماند** — همه‌ی محتوا و نوشته‌ها از پنل ادمین مدیریت می‌شوند (`WS-A`). داده‌ی commit‌شده فقط برای بیلد آفلاین توسعه‌ای مجاز است، نه آرتیفکت پروداکشن.
2. **پنل ادمین دقیق، کامل و کارآمد** — همه‌ی بخش‌ها UI/UX خوب داشته باشند: حالت‌های loading/error/empty، اعتبارسنجی فرم، RTL/LTR، کیبورد (`WS-B`).
3. **حداقل دستور مستقل روی VPS** — عملیات روتین فقط از طریق dispatchهای GitHub Actions؛ SSH فقط اضطراری (`WS-C`).
4. **کاهش ریسک فرسایشی (RISK-0011)** — اسلایس‌های کوچک مستقلِ قابل‌انتشار، تخته‌ی واحد، DoD مشخص (`WS-D`).

> **توجه:** سیاست فعلی «`CMS_CD_AUTO_MIGRATE` unset بماند» معتبر است (RISK-0012). قید ۳ یعنی حذف SSH از عملیات روتین، نه حذف تأیید attended مالک برای مایگریشن اسکیما؛ آن مسیر از طریق `workflow_dispatch` در UI گیت‌هاب انجام می‌شود.

---

## ۱) قواعد استفاده از این فایل

- هر آیتم پس از اتمام کامل (کد + تست + مستند + دفتر) علامت `[x]` بخورد؛ اگر PARTIAL شد، `[ ]` بماند و زیر همان آیتم بنویسید چه مانده.
- خط **شواهد:** هر آیتم باید شناسه‌ی `LOG-____` واقعی بگیرد. قبل از برداشتن ID جدید، دستور تخصیص در `docs/README.md` §4 اجرا شود (آخرین ID شناخته‌شده تا ایجاد این فایل: `LOG-0217`).
- هیچ آیتمی حذف نمی‌شود؛ کار لغوشده ← `[x]` با یادداشت «CANCELLED: دلیل». کار جدید ← ID جدید در همان WS.
- پایان هر آیتم = یک ورود `WORK_LOG` + همگام‌سازی دفتر مربوطه (`deferred-validation` / `TECH_DEBT` / `known-issues`) + در صورت نیاز به‌روزرسانی سطر همین آیتم در `docs/plan/README.md` §1.
- برچسب‌ها: `P0` = عیب زنده/امنیت/درستی — فوری؛ `P1` = هسته‌ی قیدهای مالک؛ `P2` = کیفیت/پالایش؛ `P3` = آینده. حجم: `S` ≤ نیم‌روز، `M` ≤ دو روز، `L` بیش از دو روز (کار agent).
- مالکیت: `agent` = بدون تصمیم انسانی قابل اجرا؛ `owner` = فقط مالک؛ `joint` = agent آماده می‌کند، مالک تأیید/اجرا می‌کند.

---

## ۲) نقشه‌ی مایلستون‌ها (ترتیب پیشنهادی)

| مایلستون | محتوا | هدف کاربر-محور |
|---|---|---|
| **M0 — Quick wins** | F1، E0، E6(P12)، F5، C1، D1–D3 | امنیت + جلوگیری از گم‌شدن کار + اصلاح لینک‌های بازنشسته |
| **M1 — بنیان توکن طراحی** | E1–E5، E8، E10 | رفع فروپاشی layout (P1) و شکست‌های AA؛ پیش‌نیاز دارک‌مود |
| **M2 — محتوا تمام-CMS** | A1–A4، A7–A9 (+A5/A6 اختیاری) | هیچ محتوای استاتیکی در پروداکشن؛ خانه/CV/nav/footer از ادمین |
| **M3 — تکمیل پنل ادمین** | B1–B8، B11، B12 | ادمین کامل و کارآمد |
| **M4 — اتوماسیون CI/CD** | C2–C10، C5 | عملیات روتین بدون SSH |
| **M5 — بستن دیفرها** | B9، F2، F4، F6، F7، F8–F10 | دفاتر سبز |
| **M6 — فازهای آینده** | G1–G6 | P9/P10/P11 |

وابستگی کلیدی: E1 پیش‌نیاز F4 (دارک‌مود). A12 تصمیم تماس، پیش‌نیاز B10 (inbox). A1 پیش‌نیاز A2/A3 روی صفحه‌ی خانه.
**WS-H (کتابخانه‌ها)** موازی با همه‌ی مایلستون‌ها اجرا می‌شود و خروجی‌اش ورودی آیتم‌های B/E/C است؛ هر پذیرش/ردّ فقط از دروازه‌ی H0.

---

# WS-A — محتوای تمام-CMS (قید ۱ مالک)

- [ ] **A1 — CMS-driven کردن صفحه‌های خانه‌ی `/en/` و `/fa/`** — `P1` · `agent` · `L` · deps: —
  - امروز `apps/web/src/pages/{en,fa}/index.astro` داده را از فایل‌های commit‌شده‌ی `src/data/profile.{en,fa}.ts` می‌خوانند و حتی با `CMS_API_BASE` از CMS پیروی نمی‌کنند.
  - دامنه: `apps/web/src/lib/cms/landing.ts` (جدید)، `Landing.astro`، صفحات خانه؛ خواندن از `/api/landings/{locale}` یا projection پروفایل + Landing aggregate.
  - پذیرش: با base ست‌شده، قطع API ⇒ fail-build (`node qa/cms-origin-honesty.spec.mjs` الگو؛ اسپک جدید `qa/home-cms-build.spec.mjs`)؛ در HTML خروجی هیچ رشته‌ی شناساگر از `profile.en.ts` باقی نماند (`rg "Human-centered intelligent systems" apps/web/dist` → بدون نتیجه در بیلد CMS).
  - fallback آفلاین (base نامعلوم) فقط snapshot/dev بماند؛ متای `cms-build-origin` روی خانه هم ست شود.
  - شواهد: LOG-____

- [ ] **A2 — Featured spotlight روی خانه از CMS** — `P1` · `agent` · `M` · deps: A1
  - مدل+ادمین موجود است (`FeaturedItem`، `/api/v1/admin/featured`، LOG-0162) ولی projection عمومی ندارد و صفحه‌ی خانه رندر نمی‌کند.
  - دامنه: افزودن projection published-only فعال-در-پنجره‌زمانی به `/api/site` یا مسیر عمومی اختصاصی؛ رندر در `Landing.astro`.
  - پذیرش: تست pytest projection (فقط active در بازه؛ غیرفعال هرگز) + اسپک dist که المان featured را وقتی داده هست نشان می‌دهد و غیابش honest است.
  - شواهد: LOG-____

- [ ] **A3 — هدر/فوتر/برند/tagline/SEO defaults از `/api/site`** — `P1` · `agent` · `M` · deps: —
  - امروز `Footer.astro` tagline و nav را از `src/data/content.ts` ثابت می‌خواند (`content.footer.tagline`؛ Footer.astro:34)؛ nav_links/footer_text/brand_name مدل SiteSettings به وب وصل نیست.
  - دامنه: توسعه‌ی `apps/web/src/lib/cms/siteSettings.ts` (+ payload عمومی در صورت کمبود فیلد)، سیم‌کشی `BaseLayout/Header/Footer`.
  - پذیرش: با CMS_API_BASE، تغییر footer_text در ادمین پس از ریبیلد در سایت ظاهر شود؛ fail-build روی outage؛ اسپک `qa/site-settings-build.spec.mjs`.
  - شواهد: LOG-____

- [ ] **A4 — CV/Resume کاملاً ادمین-محور؛ حذف md های commit‌شده از آرتیفکت پروداکشن** — `P1` · `joint` · `S` · deps: —
  - `apps/web/public/downloads/Taha_Mohammadi_Master_CV_Website_Profile.md` و `Taha_Mohammadi_Industry_Resume_Software_AI.md` هنوز در پروداکشن سرو می‌شوند؛ سیم‌کشی «سند جاری» از ادمین انجام شده (DEFER-0029 CLOSED / LOG-0185) اما استفاده نشده.
  - گام owner: آپلود دو سند به Media + ست کردن current CV/Resume در Settings + ریبیلد.
  - گام agent: حذف فایل‌های md از مسیر public (یا انتقال به fixture توسعه)، رفتار honest-empty وقتی CMS سندی ندارد.
  - پذیرش: `/en/cv/` و `/fa/cv/` فقط مدارک CMS را لیست کنند؛ `rg -l "Master_CV" apps/web/public` → بدون نتیجه؛ smoke دانلود 200.
  - شواهد: LOG-____

- [ ] **A5 (اختیاری/تصمیم مالک) — متن‌های Gateway `/` و 404 به SiteSettings** — `P3` · `owner→agent` · `S` · deps: A3 الگو
  - Gateway صرفاً chrome انتخاب زبان است؛ اگر مالک خواست، رشته‌های prompt/kicker به SiteSettings منتقل شوند (کلیدهای gateway_*). پیش‌فرض: static بماند (محتوا نیست).
  - پذیرش در صورت اجرا: همان قرارداد fail-build؛ snapshot فقط dev.
  - شواهد: LOG-____

- [ ] **A6 — انتشار محتوای واقعی از ادمین (writing/research/projects/P8)** — `P1` · `joint` · `owner-editorial` · deps: M3 حداقل B1
  - کاتالوگ‌ها empty-honest‌اند؛ مالک محتوا را در SPA منتشر می‌کند (مقالات، بیانیه، تاپیک‌ها، پروژه‌ها، publications/books/talks/downloads)؛ ریبیلد خودکار (C1).
  - پذیرش: مسیرهای لیست/detail غیرخالی؛ sitemap شامل URLها؛ RSS شامل مقالات؛ `smoke.sh` PASS.
  - شواهد: LOG-____

- [ ] **A7 — آپلود PDF بیانیه پژوهش (باقی‌مانده‌ی تحریری DEFER-0019)** — `P2` · `owner` · `S` · deps: —
  - اسکیما `content.0013` روی پروداکشن زنده است؛ فقط Media فعال آپلود و در ادیتور بیانیه select شود + ریبیلد.
  - پذیرش: لینک دانلود در `/{locale}/research/statement/` ظاهر شود؛ headerهای nosniff/no-store در probe.
  - شواهد: LOG-____

- [x] **A8 — Reading time واقعی دوزبانه (F1)** — `P2` · `agent` · `M` · deps: —
  - امروز مدل با ~200wpm یکنواخت روی save محاسبه می‌کند (`apps/cms/apps/content/models.py:110`)؛ هدف: fa=180/en=230 wpm طبق `custom-admin-rebuild-fa.md` §14.1.
  - دامنه: `models.py` + command backfill `recompute_reading_time` + تست‌ها؛ نمایش وب بدون تغییر.
  - پذیرش: `uv run pytest -q tests/test_content*` PASS؛ backfill روی نمونه عدد موردانتظار؛ migration در صورت نیاز additive.
  - شواهد: LOG-0222 (fa=180/en=230 + `recompute_reading_time`؛ 378 pytest PASS؛ بک‌فیل پروداکشن یک گام owner در پنجره‌ی attended بعدی)

- [ ] **A9 — TOC + breadcrumb برای مقالات بلند (F6)** — `P3` · `agent` · `M` · deps: —
  - دامنه: تولید TOC سمت build از h2/h3 بدینه‌ی sanitize‌شده در `writing/[slug].astro` + Breadcrumbs موجود؛ no-JS.
  - پذیرش: `npm run check && npm run build`؛ اسپک dist وجود anchor/TOC برای مقاله‌ی دارای ≥۳ heading.
  - شواهد: LOG-____

- [x] **A10 — تصمیم بازگشتی مسیر تماس (گیت DEBT-0006/B10)** — `P1` · `owner` · `S(تصمیم)` · deps: —
  - اگر تماس عمومی باز شود ⇒ فرم non-persistent یا persistence با ADR/Task Spec (retention/consent/spam) و آنگاه B10 (inbox) باز می‌شود؛ در غیر این صورت DEBT-0006 با یادداشت CANCELLED-byscope بسته شود تا از تخته پاک‌تر شود.
  - خروجی: یک ورودی WORK_LOG تصمیم + به‌روزرسانی دفتر.
  - شواهد: LOG-0229 — **تصمیم مالک (attestation گفت‌وگوی 2026-08-23):** تماس باز شد به‌صورت فرم non-persistent ایمیلی (بدون ذخیره‌سازی) + انتشار اطلاعات تماس عمومی؛ B10/inbox ذخیره‌سازی همچنان بسته می‌ماند مگر درخواست صریح مالک (DEBT-0006 به‌روز شد).

# WS-B — تکمیل و UX پنل ادمین (قید ۲ مالک)

- [ ] **B1 — ممیزی UI/UX جامع SPA + رفع یافته‌ها** — `P1` · `agent` · `L` · deps: —
  - گام ۱ (docs): گزارش ممیزی `admin-frontend` مقابل توکن‌ها/contract: حالت loading/error/empty در همه صفحات، پیام اعتبارسنجی فیلدها، focus states، RTL/LTR، ترتیب tab، پیام‌های خطای API (`{status,code,message,fields[]}`) نمایش انسانی، responsive ≥360px.
  - گام ۲ (code): رفع به تفکیک PR کوچک؛ هر PR با اسکرین‌شات before/after در WORK_LOG.
  - پذیرش: چک‌لیست ممیزی صفر مورد بحرانی؛ `cd apps/cms/admin-frontend && npm run build && npx tsc --noEmit` PASS؛ Playwright admin matrix همچنان PASS.
  - شواهد: LOG-____

- [ ] **B2 — ادیتورهای detail دوزبانه برای سایر موجودیت‌ها (صف P7-admin-detail-pages)** — `P2` · `agent` · `L` · deps: B1
  - الگوی `ProfileNestedEditor` به ResearchStatement، ProjectCaseStudyDetails، Publication/Book/Talk/Download تعمیم یابد (تب fa/en + نشانگر completeness + If-Match conflict UX).
  - پذیرش: pytest write-path هر موجودیت + Playwright create→edit bilingual→publish happy path؛ 409 conflict پیام فارسی/انگلیسی درست.
  - شواهد: LOG-____

- [ ] **B3 — UX ادیتور Composition** — `P2` · `agent` · `M` · deps: B1
  - جابه‌جایی ترتیب Section/Block با drag یا دکمه‌های بالا/پایین با حفظ position، خطاهای schema بلوک کنار خود فیلد، پیش‌نمایش staff/share از داخل ادیتور.
  - پذیرش: تست e2e ساخت story با ۶ بلوک v2 (accordion/tabs/timeline/counters/before_after/slider) و publish → StoryBody رندر.
  - شواهد: LOG-____

- [ ] **B4 — UX کتابخانه‌ی Media** — `P2` · `agent` · `M` · deps: B5 بهتر
  - صفحه‌بندی/infinite scroll گرید، فیلتر mime/نوع، نمایش usage هر فایل (کدام entity/block استفاده کرده)، جریان replace با هشدار same-MIME-family، alt دوزبانه در فرم ویرایش.
  - پذیرش: `/api/v1/admin/media/orphans` با usage registry (B11) هم‌راستا؛ تست orphan پس از archive.
  - شواهد: LOG-____

- [ ] **B5 — پیاده‌سازی renditions رسانه (thumb/card/full webp)** — `P2` · `agent` · `L` · deps: —
  - امروز `apps/media/renditions.py` فقط spec است («original forbidden publicly») و کد تولید ندارد.
  - دامنه: تولید در upload/replace (Pillow یا کتابخانه‌ی مجاز — نیازمند Task Spec + تصمیم وابستگی)، ذخیره‌ی variantها، سرو عمومی variant، منع original برای anonymous.
  - پذیرش: pytest variant paths + headerها؛ حجم پاسخ thumb < card < full؛ original با anonymous 404/403.
  - شواهد: LOG-____

- [ ] **B6 — غنی‌سازی Dashboard ادمین** — `P2` · `agent` · `M` · deps: B1
  - فعالیت اخیر از AuditLog (read-only)، صف scheduled publish، لینک orphan report و content-health روی داشبورد؛ اعداد از `/dashboard/summary` توسعه یابد.
  - پذیرش: pytest summary فیلدهای جدید؛ SPA رندر؛ هیچ داده‌ی sensitive در payload.
  - شواهد: LOG-____

- [ ] **B7 — Vitest + تست colocated (S3) و بودجه‌ی Lighthouse (S5)** — `P2` · `agent` · `M` · deps: —
  - وب: Vitest برای utilها (`lib/cms/*`، `structured.ts`)؛ Lighthouse CI با `.lighthouserc.json` و آستانه‌های مصوب روی صفحات کلیدی.
  - پذیرش: `npx vitest run` سبز در CI وب؛ job lighthouse گزارش می‌دهد و روی رگرسیون بودجه fail می‌شود.
  - شواهد: LOG-____

- [ ] **B8 — ادامه‌ی استخراج service layer + فلگ‌ها (DEBT-0007)** — `P2` · `agent` · `M` · تکرارشونده · deps: —
  - قانون تدریجی: هر بار روتری دست خورد، منطق دامنه به `services/` برود؛ فلگ جدید فقط برای UI پرریسک.
  - پذیرش هر مرحله: ruff + pytest؛ هیچ rewrite انبوه.
  - شواهد: LOG-____

- [ ] **B9 — تکمیل QA دستی S6 ادمین (باقی‌مانده‌ی DEFER-0032)** — `P1` · `joint` · `S` · deps: B1 ترجیحاً
  - اجرای `docs/plan/manual-test-checklists/adm-qa-s6.md`: کروم کامل LTR ادمین، ماتریس viewport، reduced-motion؛ نتایج با اسکرین‌شات در WORK_LOG؛ سپس DECISION enable/disable `FEATURE_ADMIN_BULK_ARCHIVE` در پروداکشن مستند شود.
  - پذیرش: DEFER-0032 → CLOSED در دفتر.
  - شواهد: LOG-____

- [ ] **B10 — Contact inbox (DEBT-0006)** — `P3` · BLOCKED · deps: —
  - A10 resolved 2026-08-23 (LOG-0229): contact path reopened as a **non-persistent email form** (no storage); the persisted inbox is intentionally not built. Revisit only on explicit owner request.
  - شواهد: LOG-0229 (endpoint + tests + ledgers)

- [ ] **B11 — پوشش usage registry برای PKهای media داخل JSON بلوک‌های composition** — `P2` · `agent` · `S` · deps: —
  - `MEDIA_REFERENCE_FIELDS` فقط FKها را می‌شناسد؛ settings بلوک‌ها (media/mediaList) هم باید در orphan scan بیایند تا حذف اشتباه ممکن نشود.
  - پذیرش: pytest orphan که بلوک دارای media را usage می‌شمارد.
  - شواهد: LOG-0223 (`MEDIA_JSON_SETTINGS_KEYS`/`mediaIds` scan + orphan endpoint test؛ 380 pytest PASS)

- [ ] **B12 — یکپارچه‌سازی preview در SPA** — `P3` · `agent` · `S` · deps: —
  - دکمه‌ی staff preview + کپی share-link (HMAC موجود) در نوار ادیتور همه‌ی entity ها؛ راهنمای TTL ۱۵ دقیقه در tooltip.
  - پذیرش: e2e کلیک → باز شدن `/staff/preview/...` با session؛ کپی لینک share و 200 anonymous تا انقضا.
  - شواهد: LOG-____

# WS-C — اتوماسیون CI/CD با حداقل SSH (قید ۳ مالک)

- [ ] **C1 — اثبات و تثبیت زنجیره‌ی publish → rebuild خودکار بدون SSH** — `P0` · `joint` · `S` · deps: —
  - زنجیره موجود: transition به published ⇒ `invoke_static_rebuild()` (apps/api/admin_content.py:902) ⇒ POST HMAC به `/rebuild-trigger/` ⇒ `rebuild-web.sh` (VPS `REBUILD_TRIGGER_ENABLED=true`).
  - کار: یک سناریوی آزمایشی end-to-end (مقاله‌ی آزمایشی publish → مشاهده‌ی rebuild موفق → unpublish/archive) + ثبت زمان‌ها در WORK_LOG + افزودن assertion به smoke (وجود متغیر `cms-build-origin=cms`).
  - پذیرش: WORK_LOG با timestampهای rebuild و لینک لاگ؛ هیچ SSH در مسیر.
  - شواهد: PARTIAL — آماده‌سازی DONE (LOG-0225): فلگ `--expect-cms-origin` در smoke.sh + چک‌لیست `docs/plan/manual-test-checklists/publish-rebuild-chain-c1.md`؛ اجرای زنده‌ی سناریو منتشر/بازگشت مقاله‌ی آزمایشی توسط مالک.

- [ ] **C2 — سلف‌سرویس کردن عملیات روتین در `cd.yml` + Environment protection** — `P1` · `agent` · `M` · deps: —
  - همه‌ی عملیات (migrate، rebuild-web، نصب تایمر، image pull) از طریق `workflow_dispatch` موجود + افزودن GitHub Environment `production` با required reviewer تا تأیید مالک در UI باشد نه ترمینال.
  - پذیرش: مستند «هر عملیات روتین = یک کلیک dispatch» در DEPLOY_RUNBOOK؛ SSH فقط برای incident.
  - شواهد: LOG-____

- [ ] **C3 — سوخت‌گیری web از GHCR به‌جای build روی VPS** — `P2` · `agent` · `M` · deps: C2
  - `ci-web-image.yml` تصویر `taha-web` را با `CMS_API_BASE=https://tahamohamadi.ir` می‌سازد؛ جاب `rebuild_web` در cd.yml به pull تصویر sha-pinned تغییر کند (حجم/زمان VPS کمتر، reproducibility بیشتر).
  - پذیرش: یک dispatch rebuild_web با GHCR تصویر موفق؛ rollback به تصویر قبلی امتحان شود.
  - شواهد: LOG-____

- [ ] **C4 — توسعه‌ی smoke پس از deploy** — `P1` · `agent` · `S` · deps: —
  - `smoke.sh`/جاب deploy: افزودن probeهای `/{locale}/search/`، `/{locale}/publications/`، `/api/articles/{locale}`، `/health/` CMS و متای `cms-build-origin`.
  - پذیرش: run موفق روی main؛ fail عمدی در شاخه‌ی آزمایشی.
  - شواهد: LOG-____

- [ ] **C5 — پاک‌سازی اسکریپت‌های کهنه infra** — `P2` · `agent` · `S` · deps: —
  - pinهای کهنه `b369885` در `prod-cms-reset-and-migrate.sh` و `run-prod-cms-migrate.ps1`؛ انتظارات `/blog/` 200 در `smoke-blog.sh` (الان redirect دائمی است)؛ headerهای staging-era در `prod-p1.sh`؛ علامت SUPERSEDED/انتقال به پوشه‌ی reference برای `deploy.sh`/`rollback.sh`/`stage-p1.sh`/`rebuild-static.sh`/`caddy-apply.sh`.
  - پذیرش: `rg -n "b369885|staging.tahamohamadi" infra/` → فقط موارد علامت‌خورده‌ی historical؛ smokeها سبز.
  - شواهد: LOG-0224 (پین‌ها → پارامتر الزامی؛ بنر SUPERSEDED روی deploy/rollback/stage-p1/prod-p1/rebuild-static؛ static-site.caddy تاریخی؛ smoke-blog بازنویسی‌شده و روی پروداکشن PASS)

- [ ] **C6 — Runbook «zero-SSH operations»** — `P1` · `agent` · `S` · deps: C2,C4
  - بخش جدید در `docs/governance/DEPLOY_RUNBOOK.md`: جدول عملیات روتین ↔ dispatch/trigger معادل؛ فهرست مواردی که SSH مشروع است (اضطرار/سوییچ Caddy/recovery).
  - شواهد: LOG-____

- [ ] **C7 — Dependabot برای npm/uv/GHA** — `P2` · `agent` · `S` · deps: —
  - `.github/dependabot.yml` با گروه‌بندی patch/minor؛ majorها دستی. توجه: `uv.lock` — در صورت عدم پشتیبانی مستقیم، دوراهی documented.
  - پذیرش: PRهای خودکار باز می‌شوند و CI سبز/قرمز معنادار.
  - شواهد: LOG-____

- [ ] **C8 — Observability پایه (باقی‌مانده‌ی P0B-03)** — `P2` · `joint` · `M` · deps: —
  - uptime check خارجی روی `/` و `/health.json` و `/health/`؛ آلارم disk-threshold (اسکریپت+tایمر روی VPS یک‌بار نصب، سپس بی‌دست)؛ آلارم 5xx از لاگ Caddy.
  - پذیرش: یک alert آزمایشی دریافت شده مستند؛ runbook INCIDENT مرتبط.
  - شواهد: LOG-____

- [ ] **C9 — ریتم drill بازگردانی بکاپ** — `P2` · `joint` · `S` · deps: —
  - تقویم سه‌ماهه + اجرای drill طبق BACKUP_RUNBOOK در محیط disposable؛ ثبت RPO/RTO واقعی.
  - شواهد: LOG-____

- [ ] **C10 — سلامت تایمر publish زمان‌بندی‌شده** — `P2` · `agent` · `S` · deps: C2
  - بررسی دوره‌ای (Actions schedule هفتگی) که timer نصب و آخرین اجرای `publish_scheduled_content` موفق بوده (probe از طریق Overview/content-health یا endpoint وضعیت).
  - پذیرش: workflow سبز + alert در failure.
  - شواهد: LOG-____

# WS-D — کاهش ریسک فرسایشی RISK-0011 (قید ۴ مالک)

- [ ] **D1 — حاکمیت تخته: اسلایس ≤ نیم‌روز تا ۲ روز، هر آیتم مستقل قابل انتشار** — `P0` · `process` · `—`
  - هیچ آیتمی بدون خروجی user-visible/ops-visible merge نشود؛ branchها کوتاه‌عمر (≤ چند روز)؛ main همیشه سبز.
  - شواهد: LOG-____

- [ ] **D2 — اتصال تخته به ایندکس پلن** — `P0` · `agent` · `done(0218)`
  - سطر فعال در `docs/plan/README.md` §1 ثبت شد؛ در هر پایان مایلستون، ستون Notes همین سطر به‌روز شود.
  - شواهد: LOG-0218

- [ ] **D3 — DoD استاندارد آیتم‌ها** — `P0` · `process`
  - کد+تست+مستند+دفتر+WORK_LOG با خروجی واقعی؛ آیتم بدون Evidence line پرشده DONE محسوب نمی‌شود.
  - شواهد: LOG-____

- [ ] **D4 — ارزش پیوسته: هر مایلستون یک بهبود قابل‌نمایش برای مالک/بازدیدکننده دارد** — `P1` · `process`
  - M1 = سایت سالم‌تر بصری؛ M2 = مدیریت محتوا کامل؛ M3 = ادمین کامل؛ M4 = عملیات بی‌SSH؛ M5 = دفاتر سبز.
  - شواهد: LOG-____

- [ ] **D5 — آیین ماهی reconcile** — `P1` · `joint` · `S(ماهانه)`
  - مقایسه‌ی سه‌گانه: این فایل ↔ `docs/plan/README.md` ↔ دفاتر status؛ مغایرت‌ها در همان جلسه اصلاح؛ RISK-0011 با شواهد پیشرفت به‌روزرسانی شود.
  - شواهد: LOG-____

# WS-E — نواقص UI عمومی (P1–P19 از DESIGN-UI-CURRENT-PROBLEMS)

- [x] **E0 — مجوز مالک + تخصیص ID دفتری برای P1–P19** — `P0` · `owner→agent` · `S`
  - بر اساس جدول «Suggested ledger mapping» در فایل مشکلات؛ KI/DEBT/RISK/DEFER واقعی ساخته شود تا این یافته‌ها گم نشوند.
  - شواهد: LOG-0224 (KI-0002..0006، DEBT-0008..0015، DEFER-0033..0037، RISK-0014؛ مجوز مالک: attestation گفت‌وگوی 2026-08-23)

- [x] **E1 — تعریف توکن‌های گمشده در `global.css` + هم‌راستایی contract/design.md (رفع P1/P14/P2)** — `P0` · `agent` · `M`
  - تعریف: `--space-1..10, --space-section, --space-gutter, --measure-prose/page, --text-display(+scale), --font-display/body, --color-ink-muted/tertiary, --color-accent, --color-surface-raised` (+ سایه/مدت/ایزینگ/radius مطابق جدول contract).
  - سپس: `DESIGN-CONTRACT.md` §2 دقیقاً با بیلد sync شود؛ design.md به همین نام‌ها alias شود (سه دیکشنری ممنوع).
  - پذیرش: اسکریپت Compare-Object used-vs-defined در فایل مشکلات → خروجی خالی؛ اسکرین‌شات قبل/بعد از about detail routes؛ `npm run check/build` PASS.
  - شواهد: LOG-0228 (undefined: 23→0؛ `@theme static`؛ شواهد بصری قبل/بعد در `docs/status/evidence/e1-token-foundation/`؛ سهم design.md به E8 موکول شد)

- [ ] **E2 — اصلاحات کنتراست AA (P3/P4/P5)** — `P0` · `agent` · `S` · deps: E1
  - hover برند تیره‌تر (#0a6a62 یا #076e66)، توکن جدید control-border (#748682/#7f918d) جدا از hairline کارت، ink-secondary → #616e74.
  - پذیرش: جدول نسبت‌ها همگی ≥4.5 (متن) و ≥3 (boundary) در WORK_LOG + QA بصری.
  - شواهد: LOG-____

- [ ] **E3 — فوکوس/کیبورد و کف‌های لمسی-متنی (P6/P18/P7/P8)** — `P1` · `agent` · `M` · deps: E1
  - `:focus-visible` معادل همه‌ی hoverها (Gateway/Landing/Footer/404/social-link)؛ `scroll-padding-top` به اندازه‌ی هدر sticky؛ kicker ≥12px؛ تصمیم مستند برای استثنای 36px هدر (اصلاح یا amendment قرارداد 44px).
  - پذیرش: پیمایش کیبورد کامل صفحه‌ی gateway و landing با اسکرین‌شات؛ skip-link بالای هدر.
  - شواهد: LOG-____

- [ ] **E4 — انضباط توکن رنگ + بودجه‌ی طلایی (P9/P10)** — `P2` · `joint` · `S` · deps: E1
  - نشانه‌های gold primitive → `--color-signature`؛ تصمیم بودجه‌ی طلایی خانه: حذف یکی از دو rule یا اصلاح متن قرارداد.
  - شواهد: LOG-____

- [ ] **E5 — یکسان‌سازی glass و قرارداد motion (P15/P16)** — `P2` · `agent` · `S` · deps: E1
  - الگوی واحد `@supports ((backdrop-filter) or (-webkit-...))` با opaque-first و alpha 0.9؛ یا پیاده‌سازی hover-lift/duration tokens یا حذف از contract؛ بازنگری override سراسری reduced-motion (0.01ms !important) به الگوی قابل-override.
  - شواهد: LOG-____

- [ ] **E6 — جستجو: noscript `/blog/` → `/writing/` (P12) و پوسته‌سازی Pagefind (P17)** — `P1(P12)/P2(P17)` · `agent` · `S`
  - اصلاح href در `pages/{en,fa}/search/index.astro`؛ سپس themeکردن CSS صفحهfind-ui با توکن‌ها (بدون fork سنگین).
  - پذیرش: `rg "/blog/" apps/web/src/pages/*/search` → بدون نتیجه؛ اسکرین‌شات UI جستجو هم‌خوان با دیزاین.
  - شواهد: PARTIAL — P12 DONE و CLOSED (LOG-0221؛ KI-0006 CLOSED با دیپلوی LOG-0227)؛ P17 (پوسته‌ی Pagefind) باقی است.

- [ ] **E7 — اعتبارسنجی override رنگ برند CMS (P11)** — `P1` · `agent` · `M` · deps: E1
  - در بیلد Astro: محاسبه‌ی کنتراست primaryColor با سفید/canvas؛ زیر آستانه ⇒ fail-build یا clamp به نزدیک‌ترین مقدار مجاز (تصمیم در Task Spec) + مشتق emphasis/soft از brand تا hover هم تغییر کند.
  - پذیرش: تست با رنگ ناقض ⇒ بیلد fail با پیام واضح.
  - شواهد: LOG-____

- [ ] **E8 — اصلاح `design.md` (P19) و بستن/بازتعریف DEBT-0001** — `P2` · `agent` · `S`
  - حذف shadcn/Radix/Motion/GSAP/D3/Three از بلوک افتتاحیه به‌عنوان foundation؛ حذف self-score؛ بستن «final typeface open» (ADR-0019)؛ هم‌راستایی با E1.
  - شواهد: LOG-____

- [ ] **E9 — تصمیم IA برای findability کاتالوگ‌های P8 (P13)** — `P2` · `owner→agent` · `S`
  - تصمیم محصول: افزودن publications/books/talks/downloads به هدر/فوتر (یا گروه More). سپس تغییر Header/Footer + QA overflow.
  - شواهد: LOG-____

- [ ] **E10 — تأیید بصری مرورگری P1 قبل/بعد** — `P1` · `joint` · `S` · deps: E1
  - فایل مشکلات صریح می‌گوید P1 فقط از CSS cascade استنباط شده؛ اسکرین‌شات واقعی قبل و بعد لازم است (همچنین ورودی B9).
  - شواهد: LOG-____

# WS-F — ردیابی بستن دفاتر (دیفر/دیبت/ریسک باز)

> جدول ردیاب: هر ID باز ⇄ آیتم مسئول در همین تخته. بستن ID فقط با شواهد در دفتر مربوطه.

| ID باز | موضوع | آیتم مسئول | وضعیت |
|---|---|---|---|
| RISK-0008 | revoke/rotate credential 9Router | **F1** | CLOSED (2026-08-23) |
| RISK-0011 | فرسایش پروژه | WS-D (D1–D5) | OPEN |
| DEBT-0001 | drift design.md | E8 | OPEN |
| DEBT-0002 | تب‌های About و find-in-page | **F11** (تصمیم mitigation) | OPEN (mitigated) |
| DEBT-0006 | contact inbox | B10 (گیت: A10) | OPEN |
| DEBT-0007 | service layer/flags | B8 | OPEN |
| DEFER-0001 | inventory Python launcher | **F8** | OPEN |
| DEFER-0002 | Context7/MCP | **F8** | OPEN |
| DEFER-0006 | inventory مسیر restore | **F8** | OPEN |
| DEFER-0012 | حق استفاده Beautiful UI/UI8 | **F9** | OPEN |
| DEFER-0013 | zoom 200% + ماتریس موبایل واقعی | **F6** | OPEN |
| DEFER-0020 | collections پژوهش | G2 | OPEN |
| DEFER-0021 | allowlist demo + CSP enforce | **F2** | PARTIAL |
| DEFER-0022 | sign-off preview محلی About | **F7** | OPEN |
| DEFER-0025 | dark mode | **F4** | OPEN |
| DEFER-0032 | QA دستی S6 | B9 | PARTIAL |

- [x] **F1 — RISK-0008: مالک credential 9Router را revoke/rotate و فقط در password manager نگه می‌دارد** — `P0` · `owner` · `S`
  - پذیرش: attestation مالک در WORK_LOG (بدون ذکر مقدار)؛ RISK-0008 → CLOSED.
  - شواهد: LOG-0226 (attestation مالک 2026-08-23؛ دفتر ریسک به‌روز شد)

- [ ] **F2 — DEFER-0021: allowlist دامنه‌های دمو توسط مالک → پر کردن `demoEmbedAllowlist.ts` → تست click-to-load → سوییچ CSP به enforce در هر دو Caddyfile + حذف placeholder `OWNER_APPROVED_DEMO_HOST`** — `P1` · `joint` · `M` · deps: مالک
  - پذیرش: embed آزمایشی روی دامنه‌ی مجاز کار می‌کند؛ دامتهای خارج frame-src بلاک؛ smokeها سبز؛ DEFER-0021 → CLOSED.
  - شواهد: LOG-____

- [ ] **F4 — Dark mode کامل (DEFER-0025)** — `P2` · `agent` · `L` · deps: E1
  - توکن‌های dark در `@theme`، استراتژی prefers-color-scheme بدون force-redirect (IA rule)، ممیزی کنتراست مجدد، RTL/no-JS، تصمیم toggle یا auto-only در Task Spec.
  - پذیرش: QA هر دو تم روی صفحات کلیدی؛ بودجه bundle تغییری نکند.
  - شواهد: LOG-____

- [ ] **F6 — DEFER-0013: جلسه‌ی دستی مالک — zoom 200% + ماتریس موبایل واقعی (320/390/768/1024/1280/1440)** — `P2` · `owner` · `S`
  - پس از E1/E2 تا نتایج گمراه‌کننده نباشد. خروجی: اسکرین‌شات‌ها + بستن/تمدید دیفر.
  - شواهد: LOG-____

- [ ] **F7 — DEFER-0022: sign-off preview محلی routeهای About detail** — `P2` · `agent` · `S`
  - تلاش با port/host جایگزین حل bind EACCES؛ در صورت شکست دائمی، تصمیم رسمی «hosted-CI-only evidence» و بستن دیفر با همان مبنا.
  - شواهد: LOG-____

- [ ] **F8 — بستن یا لغو صریح DEFER-0001/0002/0006 (جزئیات ابزاری)** — `P3` · `joint` · `S`
  - هر سه کوچک‌اند؛ یا اجرا (چند دقیقه‌ای) یا CANCELLED با دلیل مکتوب در دفتر.
  - شواهد: LOG-____

- [ ] **F9 — DEFER-0012: احراز source+license Beautiful UI (MIT) قبل از هر adoption؛ UI8 فقط با خرید/مجوز** — `P3` · `owner` · `S`
  - شواهد: LOG-____

- [ ] **F10 — پاک‌سازی ارجاع‌های Wagtail و کامنت‌های کهنه‌ی ریپو** — `P2` · `agent` · `S`
  - `infra/cms/Dockerfile.cms` (هدر Wagtail 7.4.2)، `.env.example` (`WAGTAILADMIN_BASE_URL`)، کامنت ci-admin-frontend.yml («not yet served»)، هدر Caddyfile (edge default قدیمی).
  - پذیرش: `rg -ni wagtail infra/ .github/` → فقط موارد تاریخی علامت‌خورده.
  - شواهد: LOG-0224 (Dockerfile/.env.example/ci-admin-frontend/Caddyfile edge/README پاک‌سازی؛ فقط مارکرهای historical باقی)

- [ ] **F11 — تصمیم DEBT-0002: حفظ tabs با بهبود find-in-page (sticky toolbar + show-all toggle) یا ماندن روی mitigated** — `P3` · `owner→agent` · `S/M`
  - شواهد: LOG-____

- [ ] **F12 — همگام‌سازی checkboxهای کهنه‌ی Task-list §5/§19** — `P3` · `agent` · `S`
  - مواردی مثل sitemap/robots (P1-09) و P1-13 که عملاً انجام شده ولی تیک ندارند، با ارجاع LOG تیک بخورند تا دوباره‌کاری القا نشود.
  - شواهد: LOG-0224 (P0A-06/G0-04/P1-09 robots+sitemap؛ P1-13 سلامت استک و بکاپ؛ آیتم پنجره‌ی ارتباطی P1-13 عمداً بدون تیک ماند)

# WS-G — فازهای آینده (صف‌شده، شروع gated)

- [ ] **G1 — P10-01 حکمرانی تاکسونومی (glossary/synonym/rules)** — `P2` · `owner+agent` · `M` · پیشنهاد: قبل از انتشار انبوه محتوا (A6)
- [ ] **G2 — Collections کیوری‌شده‌ی پژوهش (باقی‌مانده‌ی DEFER-0020، P10-03)** — `P2` · `agent` · `M`
- [ ] **G3 — تکمیل جستجو: keyboard/filter announcements، lifecycle ایندکس و drift-guard (P10-04)** — `P2` · `agent` · `M`
- [ ] **G4 — P9 آموزش + خلاقیت: Course/CreativeWork contracts + routes + ادمین** — `P3` · `agent` · `L`
- [ ] **G5 — P11 AI/pgvector/graph — gated به کیفیت P10 + threat model + ADR** — `P3` · `owner-gated` · `XL`
- [ ] **G6 — باقی‌مانده‌ی صف P7 (detail pages) = B2** — cross-ref

# WS-H — حرفه‌ای‌سازی با ماژول/کتابخانه (قید مالک: هر ابزاری که کار را بهتر و حرفه‌ای‌تر می‌کند، مجاز است)

> سیاست: کتابخانه/ماژول جدید در هر لایه (وب عمومی، CMS، SPA ادمین، infra، CI) خوش‌آمد است، **به شرط عبور از دروازه‌ی H0**. پذیرش یا ردّ هر نامزد باید مستند شود تا دوباره بحث نشود. این WS موازی با مایلستون‌ها اجرا می‌شود و خروجی‌اش معمولاً ورودی آیتم‌های B/E/C است.

- [ ] **H0 — دروازه‌ی پذیرش وابستگی (اعمال به همه‌ی H1..H14)** — `P0` · `process` · دائمی
  1. ارزش مشخص: کدام آیتم همین تخته را بهتر می‌کند (ارجاع اجباری).
  2. لایسنس مجاز (MIT/Apache-2.0/BSD/ISC) + سلامت نگهداری (release اخیر، activity).
  3. هزینه سنجیده: bundle عمومی (بودجه island 35KB نشکند)، زمان build، سطح حمله.
  4. امنیت: `npm audit` / `pip-audit` بدون high+ در لحظه‌ی پذیرش.
  5. هیچ سرویس همیشه-روشن جدید روی VPS مگر با ADR صریح مالک (ممنوعیت فعلی Redis/Celery/OpenSearch/Neo4j/K8s معتبر است).
  6. قراردادهای پروژه نشکند: no-JS عمومی، RTL/LTR، reduced-motion، published-only projection.
  7. ورود فقط با Task Spec کوچک + WORK_LOG؛ نسخه pin در lockfile؛ تغییر commandهای canonical فقط از مسیر PROJECT_MANIFEST.

- [ ] **H1 — ادمین: فرم + اعتبارسنجی با `react-hook-form` + `zod`** — `P1` · `agent` · `M` · deps: B1/B2
  - جایگزینی state دستی فرم‌ها؛ اتصال خطاهای API (`fields[]`) به فیلد مربوطه؛ validation لحظه‌ای.
  - پذیرش: یک فرم نمونه (ادیتور مقاله) با تست؛ سپس بقیه فرم‌ها تدریجی.
  - شواهد: LOG-____

- [ ] **H2 — ادمین: `@tanstack/react-query` برای data-fetching/cache/invalidation** — `P1` · `agent` · `M` · deps: B1
  - حالت‌های loading/error/retry استاندارد سراسر SPA؛ حذف fetch دستی پراکنده در `api.ts`.
  - شواهد: LOG-____

- [ ] **H3 — ادمین: `@tanstack/react-table` برای ContentList و MediaLibrary** — `P2` · `agent` · `S/M` · deps: B4
  - sort/filter/pagination با پارامترهای سِروِری موجود؛ RTL-safe.
  - شواهد: LOG-____

- [ ] **H4 — ادمین: سیستم toast/notification یکپارچه (مثلاً `sonner`)** — `P2` · `agent` · `S` · deps: B1
  - بازخورد موفقیت/خطای mutationها؛ بررسی RTL و reduced-motion.
  - شواهد: LOG-____

- [ ] **H5 — ادمین: primitives دسترس‌پذیر (Radix/shadcn) فقط برای dialog/dropdown/popover تکرارشونده** — `P2` · `joint(تصمیم در ممیزی B1)` · `S`
  - با قید Manifest («تا interaction واقعی توجیه نشود نه») سازگار است چون ادمین دهها dialog دارد؛ تصمیم نهایی خروجی ممیزی B1.
  - شواهد: LOG-____

- [ ] **H6 — وب عمومی: `schema-dts` برای JSON-LD typed** — `P2` · `agent` · `S` · deps: —
  - جایگزین factory دستی `structured.ts` با type-safety کامل schema.org.
  - پذیرش: `validateStructuredData()` و اسپک‌های JSON-LD فعلی بدون تغییر PASS.
  - شواهد: LOG-____

- [ ] **H7 — وب عمومی: TOC build-time از HTML با `linkedom` یا `cheerio`** — `P3` · `agent` · `S` · deps: A9
  - parse بدنه sanitize‌شده در build؛ zero runtime client.
  - شواهد: LOG-____

- [ ] **H8 — CMS: `Pillow` برای تولید renditions (پیش‌فرض B5)** — `P2` · `agent` · `S(ارزیابی)+B5` 
  - ارزیابی حجم تصویر Docker و سرعت؛ `pyvips` فقط اگر Pillow کافی نبود؛ انتخاب مستند شود.
  - شواهد: LOG-____

- [ ] **H9 — CMS: مدیریت CSP در لایه‌ی app (`django-csp`) — فقط اگر edge-only کافی نباشد** — `P3` · `agent` · `S` · deps: F2
  - در صورت کافی بودن Caddy ⇒ ردّ مستند (edge منبع یگانه CSP بماند).
  - شواهد: LOG-____

- [ ] **H10 — Observability: Sentry SDK — فقط با مجوز مالک برای SaaS یا self-host بیرون VPS** — `P2` · `owner-gated` · `S` · deps: C8
  - بدون مجوز ⇒ ردّ مستند و ماندن روی log-based alerting (C8).
  - شواهد: LOG-____

- [ ] **H11 — CI امنیت: `gitleaks` + `zizmor`/`actionlint` + `trivy`/`pip-audit`** — `P1` · `agent` · `S`
  - جانشین اسکن pattern دستی فعلی در ci.yml/ci-cms.yml؛ fail روی high+.
  - شواهد: LOG-____

- [ ] **H12 — کیفیت کد: `mypy` (با django plugin) برای CMS + ESLint/Prettier یا Biome برای وب و SPA** — `P2` · `agent` · `M`
  - gate تدریجی: فایل‌های جدید strict، قدیمی‌ها با baseline؛ ruff موجود می‌ماند.
  - شواهد: LOG-____

- [ ] **H13 — تست: `@axe-core/playwright` (a11y خودکار) + `hypothesis` (property-based برای sanitizer/projection) + `pytest-cov`** — `P1` · `agent` · `M`
  - axe در qa specs صفحات کلیدی (ورودی E3/E10 و DEFER-0013)؛ hypothesis طبق اشاره‌ی Task-list §9/P4-02؛ آستانه‌ی coverage معقول روی `apps/content`+`apps/api`.
  - شواهد: LOG-____

- [ ] **H14 — وب: ارزیابی `@astrojs/sitemap` به‌جای sitemap.xml.ts دستی** — `P3` · `agent` · `S`
  - فقط در صورت پوشش درست multi-locale/hreflang؛ وگرنه ردّ مستند (نسخه‌ی دستی کار می‌کند).
  - شواهد: LOG-____


---

## ۳) چک‌لیست پایان کار (DoD هر آیتم — قبل از زدن [x])

- [ ] کد/مستند طبق Scope انجام شد و فقط فایل‌های همان آیتم تغییر کردند.
- [ ] دستورهای Acceptance اجرا شدند و خروجی واقعی در WORK_LOG ثبت شد.
- [ ] ID دفتری مرتبط (DEFER/DEBT/RISK/KI) در صورت وجود، در دفتر بسته/به‌روز شد.
- [ ] سطر همین آیتم: `[x]` + خط شواهد با `LOG-____` پر شد.
- [ ] اگر PARTIAL ماند: `[ ]` + فهرست دقیق باقی‌مانده زیر آیتم.
