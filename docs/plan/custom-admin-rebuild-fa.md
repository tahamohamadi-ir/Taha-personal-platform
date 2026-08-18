# پلن جامع بازطراحی پنل ادمین و بهبود پروژه

**وضعیت:** پیشنهاد تأییدشده توسط مالک (2026-08-18، ADR-0026).
**محدوده:** کل پروژه؛ تمرکز اصلی روی جایگزینی پنل ادمین واگتِیل با ادمین اختصاصی.
**مرجع تصمیم:** `docs/adr/0026-custom-admin-replaces-wagtail.md`؛ فازهای اجرایی در `Task-list.md` §17 (ADM-0..ADM-6).
**قانون محتوا:** پایه‌ی همه‌ی کارها `origin/main` است؛ محتوای seeded از دست نمی‌رود.

---

## 1. خلاصه مدیریتی

پروژه از نظر زیرساخت، امنیت و CI در وضعیت خوبی است؛ تنها حلقه‌ی گمشده **پنل ادمین کاربردی** است. واگتِیلِ فعلی یک پوسته‌ی خالی است: مدل‌های محتوایی در آن به‌صورت کامل ثبت نشده‌اند، داشبورد/جستجو/ابزار ترجمه ندارد، فقط انگلیسی/LTR است و عملاً «قابل استفاده نیست». مالک تصمیم گرفت واگتِیل را کلاً حذف کند و ادمین اختصاصی بسازد — دقیقاً همان UX که در دو پروژه‌ی قبلی (که اکنون در `Samples/` هستند) ساخته و به آن مسلط است. این پلن نشان می‌دهد:

1. مشکل واقعی ادمین امروز چیست (با شواهد فایل‌محور)؛
2. محتوای seeded چگونه بدون از دست رفتن منتقل می‌شود؛
3. معماری هدف چیست (React SPA + Django/Ninja، حذف واگتِیل، حفظ همه‌ی قراردادهای امنیتی)؛
4. هر ماژول ادمین چه مشخصاتی دارد؛
5. از هر ۴ نمونه‌ی `Samples/` چه الگویی برداشته می‌شود؛
6. کار در ۷ فاز مستقل (ADM-0..ADM-6) چگونه پیش می‌رود.

> **وضعیت 2026-08-18 روی `origin/main`:** P3..P6 کد و مسیرهای عمومی live هستند؛ `/api/` و `/media/` عمومی (published-only) روی production زنده‌اند (DEFER-0017 CLOSED)؛ `RISK-0003` CLOSED (LOG-0140)؛ `DEFER-0015` (recovery codes) CLOSED در repo؛ ادمین‌های Wagtail-session موجود (`/admin/profiles/` از PR #31 و site content admin از PR #24) با این تصمیم در ADM-1 جایگزین می‌شوند.

---

## 2. تشخیص وضعیت فعلی (با شواهد)

### 2.1 چرا پنل ادمین فعلی غیرقابل استفاده است

| # | مشکل | شواهد |
|---|---|---|
| ۱ | مدل‌های محتوای اصلی (`Landing`، `Profile`، `Article` + P4–P6) در هیچ سطح ادمینی به‌صورت کامل ثبت نشده‌اند — نه Wagtail Page، نه snippet جامع | `apps/cms/apps/content/` بدون `admin.py` در برنچ بازبینیشده؛ فقط ثبت‌های جزئی Wagtail-session (PR #24/PR #31) |
| ۲ | ثبت‌های Django admin (`MediaAdmin`، `AuditLogAdmin`) در برخی برنچ‌ها مونت نشده‌اند — `admin.site.urls` در `config/urls.py` نبود | `config/urls.py` (برنچ بازبینیشده)؛ `apps/cms/apps/media/admin.py`؛ `apps/cms/apps/security/admin.py` (dead code) |
| ۳ | بعد از لاگین کاربر به واگتِیل استوک می‌رسد: داشبورد/منوی سفارشی/ابزار ترجمه‌ی کامل وجود ندارد | تنها سفارشی‌سازی‌ها در `apps/security/wagtail_hooks.py:36-54` (فقط TOTP) |
| ۴ | رابط UI فقط انگلیسی است بدون RTL برای مالک فارسی‌زبان | `LANGUAGE_CODE = "en-us"` در `config/settings/base.py:107` |
| ۵ | هیچ rich-text editor کامل، پیش‌نمایش، bulk action یا lifecycle workflow UI واحد وجود ندارد | فیلدهای `body` از نوع `TextField` ساده؛ WORK_LOG فقط امنیت‌سازی ادمین را ثبت کرده (LOG-0116..0129) |

### 2.2 چرا حذف واگتِیل هزینه‌ی واقعی پایینی دارد (مهم‌ترین یافته)

وابستگی کد به واگتِیل فقط **۳ فایل** است (همه در app امنیت):

- `apps/security/views_totp.py` (`wagtail.admin.messages` و `require_admin_access`)
- `apps/security/wagtail_hooks.py` (hook ها و `BaseSettingsPanel`)
- `apps/security/forms.py` (`wagtail.admin.forms.auth.LoginForm`)

همه‌ی چیزهای ارزشمند — مدل‌های محتوا، اعتبارسنجی رسانه با امضا، `MFAEnforcementMiddleware`، `AuditLog`، rate-limit، NoIndex، Ninja API، rebuild-trigger — **Django خالص هستند**. هیچ Wagtail Page یا داده‌ی واگتِیلی وجود ندارد که مهاجرت بخواهد (فقط ادمین‌های Wagtail-session که در ADM-1 جایگزین می‌شوند). یعنی حذف واگتِیل = حذف پوسته + بازنویسی ۳ فایل کوچک، نه بازسازی اکوسیستم.

### 2.3 درس از پروژه‌های قبلی (Samples)

دو پروژه‌ی قبلی مالک ادمین اختصاصی ساختند و رها شدند. درس این است که **الگوهای UX آن‌ها عالی و تکرارشدنی است**، اما معماری‌های سنگین (Spring+Quasar، موتور بیلدر ۳۸۰۰ خطی) عامل رها شدن بود. این پلن همان UX را با شانه‌ی Django/Ninja/React سبک می‌سازد و فازبندی می‌کند تا از همان هفته‌ی اول ارزش بدهد (ریسک رها شدن → RISK-0011).

---

## 3. حفظ محتوا (غیرقابل مذاکره)

### 3.1 موجودی محتوای seeded (تأییدشده 2026-08-18)

| منبع | محل | وضعیت |
|---|---|---|
| Seed data (میرآینه‌ی محتوای سایت: Landing/Profile/Project/Publication/Research) | `apps/cms/apps/content/data/site_content.py` روی **`origin/main`** | ✅ موجود |
| کامند seed (idempotent، skip-by-slug، `--force`) | `apps/cms/apps/content/management/commands/seed_site_content.py` روی `origin/main` | ✅ موجود |
| Seed پروفایل + ابزار import | `apps/cms/apps/content/seeds/profile.seed.json` + `import_profile_seed.py` روی `origin/main` | ✅ موجود |
| مدل‌ها و migrations (P4: Article/Series/TopicTag؛ P5: Research؛ P6: CaseStudy؛ تا `0006`) | `apps/cms/apps/content/migrations/0001..0006` روی `origin/main` | ✅ موجود |
| ردیف‌های production DB | PostgreSQL روی VPS (بکاپ رستیک فعال؛ `RISK-0003` CLOSED با شواهد isolated restore — LOG-0140) | ✅ پشتیبان‌گیری‌شده |
| محتوای متنی CV/SOP/Resume | `Assets/*.md` در repo | ✅ موجود |
| محتوای منتشرشده‌ی فعلی سایت (استاتیک + API) | `apps/web/src/data/*` (content.ts, profile.*.ts, site.ts, structured.ts) + `/api/` عمومی | ✅ موجود |

### 3.2 پروتکل انتقال

1. **پایه = `origin/main`:** همه‌ی کارهای ADM از `origin/main` branch/worktree می‌شوند. قبل از هر edit: `git ls-tree -r origin/main -- apps/cms/apps/content/` برای راستی‌آزمایی حضور seed.
2. **پشتیبان‌گیری قبل از هر migration:** `infra/backup/taha-platform-backup.sh` (اجرای موفق + تأیید snapshot) و در صورت امکان `pg_dump` جداگانه. این گیت پیش از ADM-0 است (RISK-0010).
3. **خروجی نسخه‌بندی‌شده:** `dumpdata` از app های `content/media/security` به فیکسچر در repo (مسیر فرار نهایی) قبل از اولین تغییر schema.
4. **seed command حفظ می‌شود** و به‌عنوان ابزار import در معماری جدید باقی می‌ماند؛ قرارداد `(locale, slug)` و lifecycle فعلی عوض نمی‌شود؛ افزودن مدل‌های جدید (Composition و…) فقط **additive** است.
5. **بدون تغییر قرارداد موجود:** فیلدها، اسلاگ‌ها، locale ها و status ها دست نمی‌خورند؛ فقط سطح ادمین جایگزین می‌شود.
6. `Assets/` و `apps/web/src/data/*` تا فاز ADM-6 دست نمی‌خورند.

---

## 4. معماری هدف

```
                    ┌──────────────────────────────────────┐
                    │  Django CMS (Postgres) — بدون واگتِیل  │
                    │  apps: content, media, security,     │
                    │        api, rebuild, health, users   │
                    │  middleware: TOTP/audit/rate/noindex │
                    └───────▲──────────────────▲───────────┘
                            │ /api/v1/admin/*  │ published-only (Ninja)
              session+CSRF+TOTP                │ (عمومی فقط هنگام build)
                            │                  │
              ┌─────────────┴──────────┐  ┌────┴─────────────────┐
              │ React SPA /admin/      │  │ Astro static public  │
              │ (Vite + Tailwind v4 +  │  │ /fa/ /en/ (بدون JS)  │
              │ shadcn/ui، RTL فارسی)  │  │ fetch هنگام build +  │
              └────────────────────────┘  │ rebuild-trigger HMAC  │
                                          └──────────────────────┘
```

- **فرانت عمومی:** Astro استاتیک می‌ماند (SEO، سرعت، بدون JS) — تصمیم تأییدشده‌ی مالک؛ API عمومی published-only فعلی بدون تغییر.
- **بک‌اند:** Django + Ninja؛ API های ادمین `/api/v1/admin/*` (همان‌خاستگاه، session+CSRF+TOTP)؛ API های عمومی فقط published-only.
- **ادمین:** React SPA (ساختارمند و کاربردی، نه تزئینی — تصمیم مالک) که در `apps/cms/admin-frontend/` اسکلت می‌گیرد و از مسیر `/admin/` سرو می‌شود.
- **اتصال داده:** build-time fetch + rebuild-trigger موجود (بدون افشای عمومی `/api/v1/admin/*`).

### 4.1 استک ادمین (تصمیم مالک)

| لایه | انتخاب | دلیل |
|---|---|---|
| فریم‌ورک | React + Vite | مطابق مهارت فعلی (shadcn/ui، Tailwind v4)؛ هم‌هزینه با Quasar در زمان توسعه با کامپوننت‌های آماده |
| UI | shadcn/ui + Tailwind v4 | کامپوننت‌های آماده، ساختارمند، RTL-capable؛ ظاهر ادمین ساده و کاربردی است |
| API client | fetch با `withCredentials` + CSRF header | الگوی نمونه‌ی `httpClient.js`/`admin-fetch.ts` |
| زبان/جهت | فارسی + RTL کامل (فونت Vazirmatn) | خواسته‌ی اصلی مالک |

---

## 5. مشخصات ماژول‌های ادمین

### 5.1 Auth (ADM-0/ADM-1)

- لاگین/خروج/`me`/CSRF با Django session + CSRF + TOTP (`django-otp`)؛ جایگزینی `OTPLoginForm` با فرم Django خالص؛ TOTP enrollment با همان منطق فعلی بدون hook واگتِیل.
- قوانین موجود حفظ می‌شوند: `min_length=12`، Argon2-first، rate limit (5/5min → 429)، `AuditLog`، noindex.
- bootstrap ادمین: prime CSRF → `GET /api/v1/admin/auth/me` → redirect امن `/admin/login` (الگوی sample `adminAuth.js`).

### 5.2 داشبورد action-oriented (ADM-1)

- کارت‌های شمارشی که **هر کدام به یک لیست فیلترشده لینک دارند** (نه دکوراسیون):
  - پیشنویس‌ها → `/admin/content?status=draft`
  - زمان‌بندی‌شده → `/admin/content?status=scheduled`
  - ترجمه‌ی ناقص fa/en → `/admin/translation-queue`
  - رسانه بدون alt → `/admin/media?missing_alt=1`
  - پیام‌های جدید تماس → `/admin/contact`
  - (فاز بعدی) شکست زمان‌بندی / orphan media
- «ادامه‌ی ویرایش»: آخرین اقلام ویرایش‌شده با لینک مستقیم.
- منبع الگو: `Samples/tahamohamadi-website/backend/apps/core/views.py` (`AdminDashboardView`) و `Samples/tahamohamadi-ir/docs/.../Section 10`.

### 5.3 مدیریت محتوا (ADM-1)

- CRUD کامل برای همه‌ی مدل‌های موجود (Landing/Profile/Article + P4–P6) با:
  - لیست: paging (page/size ≤100)، sort allowlist، فیلتر status/locale، خلاصه‌ی کامل بودن ترجمه، badge وضعیت.
  - فرم: تب‌های fa/en با نشان کامل/ناقص، SEO panel، sticky actions (ذخیره/پیش‌نمایش/انتشار).
  - validation به‌صورت field-level از سرور (Problem Details-style: `{status, code, message, path, fields[]}`).
- حالت‌های loading/empty/error با retry برای همه‌ی لیست‌ها (`AdminStatePanel`).
- ادمین‌های Wagtail-session موجود (site content admin PR #24 و `/admin/profiles/` PR #31) در این فاز به SPA منتقل می‌شوند.

### 5.4 رسانه (ADM-2)

- **MediaPicker واحد** در همه‌ی ویرایشگرها: modal با search/type filter/pagination/آپلود-در-همان‌فلوی با progress؛ بازگشت focus به trigger.
- کتابخانه: grid/list، thumb، alt دو زبانه (بستن DEFER-0014)، usage، orphan report، replace (MIME-family-safe)، archive با تأیید اثر.
- قوانین موجود حفظ می‌شوند: signature validation، private default (`is_active=False`)، `active_public()`.
- منبع الگو: `Samples/tahamohamadi-website/frontend/src/components/admin/media/MediaPicker.tsx` + پلن `Samples/tahamohamadi-ir/plans/007-*`.

### 5.5 ترکیب صفحات — Composition (ADM-3، مهم‌ترین نیاز مالک)

الگوی ساختاریافته (نه کانواس بصری آزاد) با تنوع کامل چیدمان:

- **Page → Section → Block** با JSON Schema سمت سرور (`additionalProperties: false`، fail-closed، UUID برای ارجاع رسانه).
- **Layout presets برای هر Section:** ۱ ستون / ۲ ستون / ۳ ستون، **نسبت ستون‌ها** (مثلاً ۱:۱، ۱:۲، ۲:۱، ۱:۱:۱)، ترتیب بلوک‌ها (کنار هم یا زیر هم)، enabled toggle.
- **کاتالوگ بلوک‌های v1** (از `composer-block-catalog` نمونه‌ی tahamohamadi-website): hero، text (rich)، gallery، cta، quote، divider، collection، media+text. بلوک‌های انیمیشنی با محدودیت‌های کران‌دار (duration/delay/trigger allowlist) برای فاز بعدی.
- پیش‌نمایش: همان renderer عمومی (بعداً در Astro؛ در ادمین iframe/پیش‌نمایش HTML ساده) با noindex/no-store.
- داده‌ها **additive** هستند؛ مدل‌های موجود دست نمی‌خورند.

### 5.6 Workflow و نسخه‌ها (ADM-4)

- ماشین حالات موجود (draft/review/published/archived) + افزودن **scheduled** و انتقال‌های کنترل‌شده با reason + audit (الگوی ماشین نمونه‌ها: `DRAFT → IN_REVIEW → SCHEDULED → PUBLISHED → ARCHIVED`).
- **بازیابی‌به‌صورت-پیش‌نویس:** restore هرگز live را overwrite نمی‌کند (snapshot جدید).
- **Optimistic locking:** `version` روی هر entity؛ 409 → دیالوگ reload/discard، هرگز auto-overwrite.
- زمان‌بندی انتشار idempotent + گزارش شکست.
- منبع الگو: `Samples/tahamohamadi-website/backend/apps/workflow/`.

### 5.7 صف ترجمه (ADM-4)

- وضعیت per-entity per-locale: Missing / Incomplete / Complete / Outdated.
- تغییر منبع فقط target را Outdated می‌کند؛ **هرگز auto-copy** (قرارداد پروژه: بدون fallback خاموش).
- نمای دو-پنل: لیست اقلام + چک‌لیست تکمیل (title/slug/body/SEO) + لینک باز کردن ویرایشگر.

### 5.8 سفارشی‌سازی سایت (ADM-5)

- Site settings: منو/هدر/فوتر، توکن‌های طراحی (رنگ اصلی از CMS → CSS variables هنگام build در Astro — الگوی `[locale]/layout.tsx` + `color-utils.ts` نمونه)، SEO global (title/description/canonical/OG/sitemap).
- تگ‌ها و فیلترها: مدیریت TopicTag و فیلترهای بلاگ/پورتفولیو.
- صندوق پیام‌های تماس: تب‌های NEW/READ/ARCHIVED؛ body فقط در detail؛ جهت RTL/LTR از روی locale؛ هرگز body در لیست/audit (قرارداد).

### 5.9 قواعد UX مشترک (از نمونه‌ها)

- CTA ساخت در header صفحه؛ فرم در route/drawer جدا؛ یکی دکمه‌ی primary؛ sticky action bar.
- ID خام هیچ‌جا نمایش داده نمی‌شود؛ badge استاندارد وضعیت؛ empty state = آیکون + توضیح + CTA.
- خطاها هم کنار فیلد هم در summary؛ aria-live برای save/saving/error/conflict.
- حریم: admin در کل `noindex, nofollow`؛ هیچ localStorage برای auth.

---

## 6. کاتالوگ الگوهای انتقالی از Samples

> منبع‌ها با مسیر دقیق؛ «ارزش» اولویت پیشنهادی برای پذیرش.

| # | الگو | منبع | ارزش | هزینه | فاز |
|---|---|---|---|---|---|
| ۱ | داشبورد action-oriented (کارت→لیست فیلترشده) | `tahamohamadi-website/backend/apps/core/views.py` (AdminDashboardView) | ★★★ | کم | ADM-1 |
| ۲ | صف ترجمه Missing/Incomplete/Complete/Outdated | `tahamohamadi-website/frontend/src/components/admin/workflow/TranslationQueue.tsx` | ★★★ | متوسط | ADM-4 |
| ۳ | MediaPicker واحد + alt دو زبانه + orphan | `tahamohamadi-website/frontend/src/components/admin/media/MediaPicker.tsx` | ★★★ | متوسط | ADM-2 |
| ۴ | Workflow transitions + audit + restore-as-draft | `tahamohamadi-website/backend/apps/workflow/` | ★★★ | متوسط | ADM-4 |
| ۵ | Optimistic lock + 409 ConflictDialog | `tahamohamadi-website/frontend/src/components/admin/composer/ConflictDialog.tsx` | ★★ | کم | ADM-4 |
| ۶ | Block registry با JSON Schema (fail-closed) | `tahamohamadi-website/backend/apps/cms/block_registry.py` (۱۶ بلوک) | ★★ | متوسط | ADM-3 |
| ۷ | Layout presets سکشن (ستون‌ها/نسبت‌ها) | `tahamohamadi-website/backend/apps/cms/models.py` (Section) + پلن cms-v2 §9 | ★★★ | متوسط | ADM-3 |
| ۸ | Preview token (۱۵ دقیقه، noindex/no-store) | `tahamohamadi-website/backend/apps/workflow/preview.py` | ★★ | کم | ADM-4 |
| ۹ | Contact inbox (بدون body در لیست/audit) | `tahamohamadi-ir/frontend/src/pages/admin/AdminContactMessagesPage.vue` | ★★ | کم | ADM-5 |
| ۱۰ | فرم API: paging/sort allowlist/Problem Details/409/422 | `tahamohamadi-ir/plans/005-backend-admin-application-apis.md` | ★★★ | کم | ADM-1 |
| ۱۱ | Auth bootstrap: CSRF prime → me → guard | `tahamohamadi-ir/frontend/src/services/csrf.js` + `adminAuth.js` | ★★ | کم | ADM-1 |
| ۱۲ | Admin shell: سایدبار گروه‌بندی‌شده + badges + noindex | `tahamohamadi-ir/frontend/src/layouts/AdminLayout.vue` | ★★ | کم | ADM-1 |
| ۱۳ | Sticky top/bottom bars + status/dirty chips | `tahamohamadi-ir/frontend/src/components/admin/AdminEditorShell.vue` | ★★ | کم | ADM-1 |
| ۱۴ | LifecycleActions با تأیید inline | `tahamohamadi-ir/frontend/src/components/admin/AdminLifecycleActions.vue` | ★★ | کم | ADM-4 |
| ۱۵ | E2E lifecycle یکپارچه (create→publish→public fa/en) | `tahamohamadi-website/e2e/article-lifecycle.spec.ts` | ★★ | متوسط | ADM-6 |
| ۱۶ | E2E anonymous published-only (بدون status badge در DOM عمومی) | `tahamohamadi-website/e2e/anonymous-visitor-published-only.spec.ts` | ★★ | کم | ADM-6 |
| ۱۷ | خط‌مشی cache به‌ازای مسیر (admin no-store؛ static immutable) | `tahamohamadi-website/infra/nginx/conf.d/default.conf` → Caddy | ★ | کم | ADM-1 |
| ۱۸ | backup با metadata + rotation؛ restore با `--no-owner --no-acl` | `tahamohamadi-website/scripts/backup.sh` + `restore.sh` | ★ | کم | ADM-0 |
| ۱۹ | Import idempotent با status mapping | `tahamohamadi-website/scripts/import_legacy_data.py` | ★ | متوسط | ADM-0 |
| ۲۰ | Content health (ترجمه/alt/orphan، سقف ۱۰۰ با truncated) | `tahamohamadi-website/backend/apps/core/content_health.py` | ★★ | متوسط | ADM-4 |
| ۲۱ | توکن‌های طراحی از CMS → CSS vars هنگام build | `tahamohamadi-website/frontend/src/app/[locale]/layout.tsx` | ★★ | کم | ADM-5 |
| ۲۲ | Media upload policy مشترک client/server (allowlist) | `tahamohamadi-ir/frontend/src/services/mediaUploadPolicy.js` | ★ | کم | ADM-2 |

**چیزهایی که عمداً کپی نمی‌شوند** (درس Anti-pattern های نمونه‌ها): generic schema-driven CRUD UI؛ JSON-only storage؛ free HTML/CSS برای ادمین؛ silent fa/en fallback؛ موتور بیلدر بصری کامل در v1 (پس از ADM-3 تصمیم جداگانه).

---

## 7. فرانت عمومی (Astro)

- **فعلاً بدون تغییر.** `apps/web/src/data/*` منبع انتشار فعلی می‌ماند تا ADM-6.
- ADM-6: fetch از API منتشرشده هنگام build (`CMS_API_BASE` الگو موجود است) + اجرای `rebuild-static.sh`/rebuild-trigger بعد از انتشار؛ خروجی نهایی همچنان HTML ایستا بدون JS.
- از نمونه‌ها: `safe-media-url` guard، BlockRenderer typed، تزریق توکن‌های طراحی از CMS.

---

## 8. زیرساخت

- **Caddy:** مسیر `/admin/*` در حال حاضر به CMS پروکسی می‌شود — بدون تغییر در ADM-0/ADM-1 (SPA از همان پورت سرو می‌شود). پس از cutover: `/api/v1/admin/*` هم به CMS پروکسی (loopback)، با `no-cache, no-store, must-revalidate`؛ `/static/*` ادمین immutable. API عمومی `/api/` و `/media/` موجود (published-only، DEFER-0017 CLOSED) دست نمی‌خورند.
- **Compose:** همان `taha-cms`؛ ادمین SPA در image CMS (collectstatic + build در Dockerfile چندمرحله‌ای).
- **Backup:** `RISK-0003` CLOSED است (نصب و isolated restore ثبت شد — LOG-0140)؛ پیش از هر migration در ADM، یک `taha-platform-backup.sh` تازه اجرا و snapshot تأیید می‌شود.

---

## 9. آزمون

- **پایتون (pytest-django):** تست‌های موجود + منفی‌های API ادمین (401/403/404/409)، optimistic lock، lifecycle transitions، projection بدون نشت draft.
- **E2E (Playwright):** الگوی نمونه‌ها — lifecycle یکپارچه در steps سریال با slug یکتا + پاک‌سازی in `afterAll`؛ anonymous published-only (absence آزمون status badge در DOM عمومی)؛ RTL/LTR، keyboard، viewport.
- **QA ادمین:** keyboard-first (move/duplicate با focus restoration)، RTL کامل، noindex/cache policy، bulk destructive با count+confirm+audit.

---

## 10. فرایند، مهارت‌ها و درس‌های governance

- **مهارت‌های مفید از `Samples/awesome-codex-skills`:** `webapp-testing` (Playwright)، `gh-fix-ci` (triage CI)، `deploy-pipeline` (الگوی deploy)، `changelog-generator`، `create-plan`، `theme-factory` (توکن‌ها). نصب فقط در صورت نیاز و با تأیید.
- **مستندات نمونه:** vocabulary `VERIFY/FIX/BUILD/SPIKE/DEFER` و gap-analysis (claims vs. code) — الگوی خوب برای `deferred-validation.md` پروژه.
- **قراردادهای پروژه حفظ می‌شوند:** هر فاز Task Spec جدا؛ هر عمل WORK_LOG؛ deferred با ID؛ بدون اختراع endpoint/DTO/مدل؛ بدون نشت draft/media خصوصی.
- **تغییرات governance (همین مرور):** ADR-0026 (جدید، لغو بخش Wagtail از 0002/0014/0020/0022)، AGENTS.md، PROJECT_MANIFEST.md، Task-list §17، ledgers (RISK-0010/0011، DEFER-0023/0024، DEBT-0003)، README، CHANGELOG.

---

## 11. فازهای اجرایی (ADM-0..ADM-6)

| فاز | محتوا | خروجی قابل استفاده | وابسته به |
|---|---|---|---|
| **ADM-0** | بازنویسی ۳ فایل امنیتی به Django خالص؛ لاگین/CSRF/me؛ dumpdata + backup؛ حذف Wagtail از settings/urls (پس از green CI)؛ واگتِیل تا cutover روی production | پایه‌ی پاک، بدون وابستگی | backup تأییدشده |
| **ADM-1** | Ninja admin auth + CRUD کامل محتوا + پوسته‌ی SPA (سایدبار/داشبورد/لیست/فرم/RTL) + انتقال ادمین‌های Wagtail-session موجود + **cutover** | ادمین واقعاً کار می‌کند (فارسی، بدون واگتِیل) | ADM-0 |
| **ADM-2** | MediaPicker + alt دو زبانه + usage/orphan/replace (بستن DEFER-0014) | مدیریت رسانه کامل | ADM-1 |
| **ADM-3** | Composition: Section/Block + layout presets + preview | ساخت صفحه و چیدمان (خواسته‌ی کلیدی مالک) | ADM-1 |
| **ADM-4** | Workflow + scheduled + revisions + optimistic lock + صف ترجمه + content health | چرخه‌ی انتشار حرفه‌ای | ADM-2/ADM-3 |
| **ADM-5** | Site settings (منو/هدر/فوتر/توکن‌ها/SEO) + تگ/فیلتر + صندوق پیام | کنترل کامل سایت | ADM-4 |
| **ADM-6** | اتصال Astro build-time + rebuild + E2E + QA + release checklist | تحویل نهایی | ADM-4/ADM-5 |

**ترتیب پیشنهادی شروع:** ADM-0 → ADM-1 (ارزش از اینجا دیده می‌شود) → ADM-2 → ADM-3 → ADM-4 → ADM-5 → ADM-6. هر فاز در برنچ/وورک‌تری از `origin/main` با Task Spec جداگانه.

---

## 12. ریسک‌ها و کنترل

| ریسک | شدت | کنترل |
|---|---|---|
| RISK-0010: از دست رفتن محتوا / شکستن دسترسی مالک در cutover | High | پایه origin/main؛ dumpdata+backup پیش از migration؛ seed idempotent؛ cutover با Caddy موجود و rollback به image قبلی؛ واگتِیل تا ADM-1 پابرجا |
| RISK-0011: رها شدن پروژه‌ی بلندمدت مثل نمونه‌ها | Medium | فازهای مستقل با ارزش از هفته‌ی اول؛ هر فاز Testable + Reversible؛ release checklist هر slice |
| شکست E2E/QA در هر فاز | Medium | همان release checklist §18 (هر slice) |

---

## 13. اولویت‌بندی نهایی

1. **ADM-0 + ADM-1** (ادمینِ واقعاً کار با RTL فارسی) — باارزش‌ترین و اولین.
2. **ADM-2** (رسانه) و **ADM-3** (چیدمان/بلوک‌ها) — نیازهای مستقیم «مدیریت کامل سایت».
3. **ADM-4** (workflow/ترجمه) — حرفه‌ای‌سازی.
4. **ADM-5/ADM-6** (سفارشی‌سازی و اتصال فرانت) — تحویل کامل.

> **یک جمله‌ی پایانی:** با این مسیر، ادمین از «افتضاح» به «کارکردی» (ADM-1)، «کامل» (ADM-3/ADM-4) و «حرفه‌ای» (ADM-5/ADM-6) می‌رسد؛ در تمام طول مسیر محتوای seeded، امنیت موجود و سایت عمومی زنده دست‌نخورده می‌مانند.

---

## 14. بهره‌برداری‌های مکمل از پروژه‌های قبلی (بیرون از پنل ادمین)

> یافته‌های 2026-08-18 از بازبینی کامل `Samples/`؛ این موارد جدا از ماژول‌های ادمین قابل اضافه شدن‌اند. اولویت: ★★★ = کوتاه‌مدت، ★★ = میانه، ★ = بعدی/اختیاری.

### 14.1 امکانات (Features)

| # | ویژگی | منبع | فاز هدف | اولویت |
|---|---|---|---|---|
| F1 | **Reading time واقعی** از محتوای منتشرشده (۱۸۰ wpm فارسی / ۲۳۰ wpm انگلیسی) | `Samples/tahamohamadi-website/scripts/import_legacy_data.py` | P4 بلاگ | ★★★ |
| F2 | **JSON-LD افزوده**: BlogPosting/Article/Project (الان فقط Person/WebSite در P1-09) | نمونه‌ها + سند `docs/plan/P1-09-structured-data-task-spec.md` | P4/P6 | ★★★ |
| F3 | **فیلترهای URL-driven** برای بلاگ/پورتفولیو (تگ/دسته → URL؛ بدون state تنها در JS) | `Samples/tahamohamadi-ir/plans/012-cms-v2-wordpress-capability-task-list.md` (R4) | P6/P10 | ★★ |
| F4 | **Featured spotlight با پنجره‌ی زمانی** (دقیقاً یک target فعال + بازه) — مثلاً پروژه/نوشته‌ی برگزیده در لندینگ | `Samples/tahamohamadi-ir/.../content/featured/api/admin/AdminFeaturedItemController.java` | ADM-5 | ★★ |
| F5 | **CV/Resume: سیاست «یک سند جاری»** — جای دانلودهای markdown ثابت در `Downloads.astro`، سند جاری از ادمین مدیریت شود | `Samples/tahamohamadi-ir/.../resume/api/admin/AdminResumeDocumentController.java` | ADM-5 | ★★ |
| F6 | **TOC + Breadcrumbs** برای مقالات بلند | کاتالوگ ماژول Divi 5 (`TableOfContents`, `Breadcrumbs`) | P4 | ★★ |
| F7 | **گالری lightbox پروژه‌ها** (progressive enhancement؛ JS فقط به‌صورت island با focus/reduced-motion) | `Samples/tahamohamadi-website/sample/phlox-pro` (PhotoSwipe) | P6 | ★★ |
| F8 | **RSS/Atom** | DEFER-0018 موجود | P4 | ★★ |
| F9 | **PostgreSQL FTS فارسی** (`simple` با نرمال‌سازی) کنار/به‌جای Pagefind | `Samples/tahamohamadi-ir` (پلن ۰۰۶) | P10 | ★ |
| F10 | **ایمیل اعلان پیام تماس** به مالک | `Samples/Tahamohamadi-ir 2` (`contact`) | فقط اگر تماس باز شود (DEFER-0007) | ★ |

### 14.2 ساختار (Structure / Engineering)

| # | الگو | منبع | فاز هدف | اولویت |
|---|---|---|---|---|
| S1 | **سرویسلایه**: logic در service، views/controllers نازک، transactional | `Samples/tahamohamadi-website/docs/conventions.md` | ADM-1 به بعد | ★★★ |
| S2 | **Playwright config کامل**: `workers=1`، retries=2 در CI، trace/video در retry اول، html reporter (QA فعلی spec های خام است) | `Samples/tahamohamadi-website/e2e/playwright.config.ts` | همین حالا (QA) | ★★★ |
| S3 | **Vitest + تست‌های colocated + property-based** برای کامپوننت‌های وب (BlockRenderer، composables) | `Samples/tahamohamadi-website/frontend/**/*.test.tsx` | P4 | ★★ |
| S4 | **Feature flags** (adminNewShell، mediaPickerV2، pageBuilder، …) برای rollback کنترل‌شده | پلن cms-v2 §28 (`Samples/tahamohamadi-ir/docs/...`) | ADM-1..6 | ★★ |
| S5 | **Lighthouse CI budget** (`.lighthouserc.json`) | `Samples/tahamohamadi-website/.lighthouserc.json` | P4 | ★★ |
| S6 | **manual-test checklists**: keyboard-nav، responsive، rtl-ltr، reduced-motion، accessibility، performance | `Samples/tahamohamadi-website/docs/manual-test-*.md` | هر release | ★★ |
| S7 | **OpenAPI/Swagger داخلی Ninja** (admin-only، نه عمومی) | `Samples/Tahamohamadi-ir 2` (Swagger) | ADM-1 | ★ |

### 14.3 UI/UX

| # | الگو | منبع | فاز هدف | اولویت |
|---|---|---|---|---|
| U1 | **توکن‌های طراحی CMS-driven → CSS variables هنگام build** (رنگ اصلی سایت از ادمین) | `Samples/tahamohamadi-website/frontend/src/app/[locale]/layout.tsx` + `color-utils.ts` | ADM-5 | ★★★ |
| U2 | **محدودیت‌های انیمیشن کران‌دار** برای islands آینده (duration 50–3000ms، delay 0–2000ms، easing/trigger allowlist) | `Samples/tahamohamadi-website/backend/apps/cms/block_registry.py` | فاز islands | ★★ |
| U3 | **بلوک‌های غنی برای ترکیب صفحات v2** از کاتالوگ Divi: accordion، tabs، timeline، counters، before/after، slider | کاتالوگ ماژول Divi 5 (۸۲ ماژول) | ADM-3 v2 | ★★ |
| U4 | **وضعیت‌های skeleton/empty/error+retry** در صفحات وب (در ادمین الزامی است) | `Samples/tahamohamadi-ir/frontend/src/components/admin/AdminStatePanel.vue` | P4 به بعد | ★ |
| U5 | **dark mode** — فقط با ID و فاز جداگانه (DEFER-0025) | tokens نمونه‌ها | بعدی | ★ |

### 14.4 ردیف‌های پیشنهادی برای BACKLOG

- QA: ارتقای Playwright به config کامل (S2) — پیش از P4.
- P4: reading time + TOC/breadcrumbs + JSON-LD BlogPosting (F1/F2/F6).
- P6: lightbox گالری + فیلتر URL-driven (F3/F7).
- ADM-5: featured spotlight + سند جاری CV (F4/F5).
- QA/ساختار: Vitest + Lighthouse budget (S3/S5).
