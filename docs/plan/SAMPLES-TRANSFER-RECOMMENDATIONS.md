# پیشنهادهای انتقال از Samples به پلتفرم فعلی

Goal:
خواننده بداند از سه نمونهٔ قبلی چه چیزی را باید به `tahamohamadi.ir` اضافه، اصلاح یا تکمیل کند.

این سند قرارداد اجرا نیست.
هر مورد قبل از پیاده‌سازی به Task Spec جدا نیاز دارد.

You need:
- این سند
- `AGENTS.md` و ADR-0011 / ADR-0016
- `docs/user-journey-information-architecture.md`
- `docs/plan/P4-blog-writing-task-spec.md`

وضعیت سند:
تحلیل 2026-08-17.
از 2026-08-17 وارد مسیر کانونی شد (`LOG-0133`): `Task-list.md`، master plan، IA URL freeze، `P2-honesty-closeout-task-spec.md`، `P7-professional-admin-task-spec.md`، P4 spec.
این فایل دیگر قرارداد اجرا نیست؛ برای IDهای SAMP-* به آن ارجاع دهید.

---

## 1. چه چیزهایی بررسی شد

پنج پوشه در `Samples/` وجود دارد.
سه تای آن محصول هستند.
دو تای دیگر ابزارند و اینجا وارد کاتالوگ محصول نمی‌شوند.

| نمونه | مسیر | استک واقعی | بلوغ |
|---|---|---|---|
| A | `Samples/tahamohamadi-ir` | Spring Boot + Vue/Quasar SSR | محصول دوزبانهٔ کامل‌تر: blog، portfolio، publications، resume، contact، admin، تست زیاد |
| B | `Samples/tahamohamadi-website` | Django/DRF + Next.js 15 | CMS دوزبانه + Composer + identity typed + Playwright + Lighthouse config |
| C | `Samples/Tahamohamadi-ir 2` | Spring Boot 3 + Vue/Quasar SPA | مدل محتوایی آکادمیک غنی؛ admin ناقص؛ بدون تست |
| — | `Samples/automation` | خروجی تست | محصول نیست |
| — | `Samples/awesome-codex-skills` | مهارت‌های Codex | محصول سایت نیست |

پلتفرم هدف امروز:
Language Gateway + `/fa/` + `/en/` landing + About + CV downloads.
CMS Wagtail زنده است.
`/api/` و `/media/` و فرم تماس عمومی هنوز بسته هستند.

منبع وضعیت فعلی:
`apps/web/src/pages/`، `apps/web/src/components/Header.astro`، `apps/cms/apps/content/models.py`، `PROJECT_MANIFEST.md`.

یادداشت هم‌ترازی:
`LOG-0131` می‌گوید روی production CMS مهاجرت‌های P4–P6 اعمال شده است.
در همین checkout، `models.py` هنوز Article پوسته است و صفحهٔ عمومی blog/research/projects وجود ندارد.
اسکیمای CMS و سایت استاتیک ممکن است از هم جلوتر/عقب‌تر باشند.
قبل از P4 عمومی، این فاصله باید در یک Task Spec بسته شود.

---

## 2. خط قرمزها — این‌ها را کپی نکنید

این موارد در نمونه‌ها وجود دارند و با قرارداد ما در تضادند.

| مورد | چرا ممنوع است |
|---|---|
| Spring / Quasar / Next.js به‌عنوان پوستهٔ عمومی | ADR-0016: سایت عمومی استاتیک Astro است؛ محتوا بدون JS خوانا می‌ماند |
| ریدایرکت `/` به `/fa` | نمونه B این کار را می‌کند؛ Gateway ما محصول است |
| سوئیچ زبان با جایگزینی slug | نمونه B این کار را می‌کند؛ اسلاگ fa و en مستقل‌اند |
| fallback خاموش `titleFa \|\| titleEn` | نمونه C؛ ADR-0011 ممنوع کرده است |
| publish که هر دو زبان را به هم قفل کند | نمونه A برای schedule هر دو SEO را اجباری می‌کند |
| ادمین SPA جدا روی `/admin` | Wagtail زنده است؛ ادمین دوم نسازید |
| page builder سفارشی / Composer / Canvas | Wagtail کافی است؛ نمونه B حتی دو builder موازی دارد |
| Postgres FTS به‌عنوان جستجوی عمومی | P10 = Pagefind روی HTML استاتیک |
| Redis / Celery / Elasticsearch / K8s روی VPS | Manifest ممنوع کرده است |
| فرم تماس فقط با JS | باید `<form method="post">` باشد |
| Telegram bot، کامنت، view count، dark-mode ناقص | خارج از فاز فعلی یا ضد کیفیت |
| برند VTD و صفحهٔ محصول Kubernetes | با هویت فعلی و محدودیت VPS در تضاد است |

قانون انتقال:
قرارداد، فیلد، و الگوی UX را بردارید.
استک را برندارید.

---

## 3. آنچه ما الان بهتر از Samples داریم

این‌ها را حفظ کنید و تضعیف نکنید.

1. Language Gateway در `/` بدون ریدایرکت اجباری.
2. `lang` و `dir` مستقل برای `/fa/` و `/en/`.
3. فونت Vazirmatn + Inter و توکن‌های editorial-tech.
4. About بدون JS با دادهٔ typed در `profile.ts`.
5. CV آکادمیک و Resume صنعتی به‌صورت دو فایل جدا.
6. JSON-LD `Person` + `WebSite` در `structured.ts`.
7. `ContentQuerySet.public()` در CMS: فقط published و `published_at <= now`.
8. یک ردیف محتوا per locale، نه ستون‌های `_en`/`_fa`.
9. Wagtail + TOTP به‌جای JWT در `localStorage`.
10. کپی `missingTranslation` از قبل در `content.ts` هست.

نمونه‌ها در listing/detail، metadata علمی، و recovery state از ما جلوترند.
ما در هویت ریشه، قرارداد locale، و static-first از آن‌ها جلوتریم.

---

## 4. شکاف فعلی در یک نگاه

| لایه | ما امروز | نمونهٔ بالغ |
|---|---|---|
| Nav | لینک Research / Projects / Blog به صفحه‌های ناموجود | فقط مسیر published |
| Home | Hero + perspective بدون لینک + About کوتاه | Latest writing + selected work + publications + Now |
| About | تب CSS؛ پنل غیرفعال `display:none` | تایم‌لاین قابل اسکن + فیلدهای غنی |
| Publication | `title` + `status` | authors، venue، year، DOI، stage، abstract |
| Project | کپی در `content.ts`؛ صفحه نیست | Role / Problem / Outcome / Limitations / gallery+alt |
| Writing | کپی و P4 spec؛ صفحه نیست | list/detail، TOC، reading time، related، JSON-LD |
| Contact | «منتشر نشده» صادقانه | inbox + honeypot + rate limit |
| 404 | دوزبانه؛ `lang="en"`؛ فقط Gateway | locale از URL؛ مسیر بازگشت به بخش والد |
| SEO | canonical/hreflang/OG بدون تصویر؛ sitemap هفت URL | `lastmod`، og:image، BlogPosting، ScholarlyArticle |
| Admin editorial | Wagtail خام برای Landing/Profile/Article در این tree | translation queue، content-health، featured slots |

---

## 5. اولویت اجرا

ترتیب پیشنهادی برای تبدیل PhD و industry:

1. FIX اعتماد: nav صادق، 404 محلی، CV در hero.
2. FIX About: evidence قابل اسکن، نه پشت تب مخفی.
3. COMPLETE home: perspective لینک‌دار، Selected Evidence، Current Focus.
4. COMPLETE P4 Writing با completion bar نمونه‌ها.
5. ADD Research + Publication catalog.
6. ADD Project case-study.
7. ADD Wagtail editorial jobs، نه ادمین جدید.
8. ADD تماس فقط بعد از Task Spec و RISK-0003.
9. ADD Pagefind در P10؛ knowledge graph در P11 از نو، نه از graphify نمونه.

---

## 6. کاتالوگ ADD / FIX / COMPLETE

هر ID پایدار است.
`نوع` یکی از این سه است:

- **FIX** — الان در سایت هست و باید اصلاح شود.
- **COMPLETE** — در plan/copy/CMS هست و باید به سطح نمونه برسد.
- **ADD** — در محصول فعلی نیست و ارزش اضافه شدن دارد.

### 6.1 الان — قبل از P4 عمومی

این‌ها بدون باز کردن `/api/` هم قابل انجام‌اند.

#### SAMP-FIX-01 — Nav صادق

نوع: FIX  
اولویت: P0 اعتماد

مشکل:
`Header.astro` به `/{locale}/research/`، `/projects/`، `/blog/` لینک می‌دهد.
این صفحه‌ها در `apps/web/src/pages/` نیستند.
بازدیدکنندهٔ حرفه‌ای 404 می‌بیند.

کار:
تا وقتی صفحه وجود ندارد، لینک را رندر نکنید.
IA می‌گوید بخش خالی را زنده نشان ندهید.

شواهد ما: `apps/web/src/components/Header.astro` خط 39–47.  
شواهد نمونه: نمونه A `SiteHeader.vue`؛ نمونه B nav از CMS published.

مسیر: `apps/web/src/components/Header.astro`  
قرارداد: IA §116 / §159

شناسهٔ مسئله: `KI-0002`

---

#### SAMP-FIX-02 — Hero به مقصد واقعی

نوع: FIX / COMPLETE  
اولویت: P0 سفر

مشکل:
CTA اصلی به `#perspectives` می‌رود.
CTA دوم به `#about` می‌رود.
CV در hero نیست.

کار:
سه لینک استاتیک بسازید: About یا Research، Work/Projects وقتی وجود دارد، `/cv/`.
Perspective باید مسیر مخاطب باشد، نه لنگر تزئینی.

شواهد ما: `Landing.astro` خط 20–21.  
شواهد نمونه: نمونه A `PublicHomePage.vue`.  
قرارداد: IA §72 و design.md §63.

---

#### SAMP-FIX-03 — Perspective بدون لینک

نوع: COMPLETE  
اولویت: P0 محصول

مشکل:
سه کارت Research / Engineering / Writing مخاطب دارند اما `href` ندارند.
زیرشان نوشته شده مسیر بعداً باز می‌شود.

کار:
وقتی مسیر زنده نیست، کارت را لینک نکنید یا کارت را نشان ندهید.
وقتی About نزدیک‌ترین مسیر Research است، کارت Research به `/about/#research` برود.
کل کارت یک لینک باشد، نه دکمه تو در تو.

شواهد ما: `Landing.astro` بخش `#perspectives`.  
قرارداد: IA §69.

---

#### SAMP-FIX-04 — About evidence پشت تب مخفی

نوع: FIX  
اولویت: P0 اعتماد علمی

مشکل:
تب‌های CSS با `display: none` پنل غیرفعال را از درخت دسترسی و Find-in-page حذف می‌کنند.
کمیته و recruiter باید Experience / Education / Research / Publications را اسکن کنند.

کار:
بخش‌ها را پشت سر هم در سند بگذارید.
nav داخلی با fragment کافی است: `#experience`، `#publications`.
اگر تب بماند، پنل باید در DOM بماند.
`role="radiogroup"` الگوی tab نیست.

شواهد ما: `About.astro` خط 34–61.  
شواهد نمونه: نمونه A `ResumeTimeline.vue`.  
شناسهٔ بدهی: `DEBT-0002`

---

#### SAMP-FIX-05 — 404 محلی

نوع: FIX  
اولویت: P1 بازیابی

مشکل:
`404.astro` همیشه `lang="en"` است.
فقط Gateway / EN / FA را پیشنهاد می‌دهد.
استاد روی URL فارسی نباید quiz زبان ببیند.

کار:
locale را از path حدس بزنید: `/fa/...` → chrome فارسی.
مقصدهای زنده را در همان زبان بدهید: Home، About، CV.
Search را تا P10 نشان ندهید.

شواهد ما: `apps/web/src/pages/404.astro`.  
شواهد نمونه: نمونه A `NotFoundPage.vue`.  
قرارداد: IA §114.

---

#### SAMP-FIX-06 — Footer به‌عنوان IA ثانویه

نوع: COMPLETE  
اولویت: P1 راهیابی

مشکل:
Footer فقط برند، سوئیچ زبان، و «تماس منتشر نشده» دارد.
CV و About از پایین صفحه در دسترس نیستند.

کار:
گروه Explore / Resources را با مسیرهای زنده بسازید.
جملهٔ تماس صادقانه بماند تا فرم مجاز شود.

شواهد ما: `Footer.astro`.  
شواهد نمونه: نمونه A `SiteFooter.vue`.  
قرارداد: IA §79.

---

#### SAMP-FIX-07 — سوئیچ زبان: وضعیت فعلی و مسیر جایگزین

نوع: FIX  
اولویت: P1 دوزبانگی

وضعیت خوب:
فلگ نداریم.
`hreflang` و `lang` روی لینک هست.
About و CV `alternateHref` می‌فرستند.

ضعف:
اگر `alternateHref` نباشد، همیشه به home زبان دیگر می‌رویم.
وقتی اسلاگ‌ها جدا شوند، این رفتار باید از CMS بیاید نه از replace رشته.
اعلان «زبان فعلی» برای screen reader کم است.

کار:
از الگوی نمونه A استفاده کنید: `alternatePath` یا home.
الگوی نمونه B را کپی نکنید.

شواهد ما: `Header.astro` خط 13.  
شواهد نمونه: A `LanguageSwitch.vue`؛ B `LanguageSwitcher.tsx` = ضدالگو.

---

#### SAMP-FIX-08 — قرارداد URL Writing

نوع: FIX  
اولویت: P1 قرارداد

مشکل:
IA می‌گوید `/{locale}/writing/`.
Header و P4 spec می‌گویند `/{locale}/blog/`.
سومین درخت نسازید.

کار:
قبل از P4 عمومی، یک تصمیم در Task Spec قفل شود.
**Freeze 2026-08-17:** عمومی `writing/` مطابق IA؛ `/blog/` فقط redirect (`LOG-0133`).

شواهد: IA § writing tree؛ `docs/plan/P4-blog-writing-task-spec.md`؛ `Header.astro`.

---

#### SAMP-COMPLETE-01 — CV در مسیر دوکلیکی

نوع: COMPLETE  
اولویت: P0 تبدیل

وضعیت خوب:
دو فایل جدا در `/cv/` هست: Master CV و Industry Resume.

ضعف:
هدر برچسب عمومی «CV & Resume» دارد.
Hero لینک CV ندارد.
Research/Work نمی‌توانند به فایل مشخص deep-link بدهند.
فایل‌ها Markdown هستند، نه HTML قابل چاپ.

کار:
`/cv/` را chooser نگه دارید با لنگر `#academic` و `#professional`.
لینک دانلود نام فایل و نوع را در accessible name بگوید.
نام لاتین فایل را با `<bdi>` جدا کنید.
HTML print برای CV بعداً؛ الان حداقل CTA واضح است.

شواهد ما: `Downloads.astro`، `profile` downloads.  
شواهد نمونه: B `resume/page.tsx` با variant academic/industry/general.

---

#### SAMP-COMPLETE-02 — منوی موبایل بدون JS

نوع: ADD  
اولویت: P1 موبایل

مشکل:
هدر لینک‌ها را wrap می‌کند.
با اضافه شدن بخش‌ها، هدف لمسی و wayfinding خراب می‌شود.

کار:
از `<details>`/`<summary>` نمونه B استفاده کنید.
Drawer کوasar را نیاورید.
زبان و CV داخل منو باشند.
سمت باز شدن از `dir` پیروی کند.

شواهد نمونه: B `Header.tsx` details؛ A drawer با Escape و restore focus.

---

#### SAMP-ADD-01 — صفحهٔ translation-unavailable

نوع: ADD  
اولویت: P1 قرارداد locale

کپی در `content.ts` هست.
صفحه‌ای که آن را نشان دهد نیست.

کار:
اگر موجودیت در زبان دیگر published است و در این زبان نیست، 404 خام ندهید.
صفحهٔ صریح: پیام + ماندن + رفتن به ترجمهٔ موجود در صورت وجود alternate + بازگشت به home همین locale.
بدنهٔ زبان دیگر را زیر prefix غلط نشان ندهید.

شواهد نمونه: A `TranslationUnavailable.vue`.  
قرارداد: ADR-0011، IA §61.

---

#### SAMP-ADD-02 — Selected Evidence روی landing

نوع: ADD  
اولویت: P1 اثبات

مشکل:
Landing هویت است، نه evidence.
بازدید تکراری باید بدون باز کردن تب About مدرک ببیند.

کار:
۳ تا ۶ مورد curated: project / publication / writing.
اگر موردی نیست، بخش را نشان ندهید.
نوع را با متن بگویید نه فقط رنگ.

شواهد نمونه: A `PublicHomePage.vue` بخش‌های خالی را حذف می‌کند.  
قرارداد: IA §74.

تا قبل از وجود محتوا، از دادهٔ موجود About می‌توان ۲–۳ مورد دستی انتخاب کرد.
آمار ساختگی نگذارید.

---

#### SAMP-ADD-03 — Current Focus / Now

نوع: ADD  
اولویت: P1 بازدید تکراری

`profile.availability` پایین About است.
Homepage آن را نشان نمی‌دهد.

کار:
یک بلوک ۳–۵ خطی روی landing: currently / researching / available for.
eyebrow انگلیسی سخت را روی فارسی کپی نکنید.

شواهد نمونه: A `HomeHero.vue` status card.  
قرارداد: IA §75 / §78.

---

#### SAMP-FIX-09 — Sitemap و OG

نوع: FIX / COMPLETE  
اولویت: P1 SEO

مشکل:
Sitemap فقط هفت URL دارد و `lastmod` ندارد.
OG image نیست (`DEFER-0009`).
با P4+ باید از همان `public()` ساخته شود.

کار:
`lastmod` برای URLهای موجود.
بعد از هر بخش جدید، همان queryset عمومی را به sitemap بدهید.
`og:image` فقط با asset مالک.

شواهد ما: `sitemap.xml.ts`؛ `DEFER-0009`.  
شواهد نمونه: A `SitemapDataService`؛ B `sitemap.ts` با تقاطع locale.

---

#### SAMP-COMPLETE-03 — صورت‌فلکی با برچسب

نوع: COMPLETE  
اولویت: P2 روایت

SVG الان `aria-hidden` و بدون برچسب گره است.
اگر تزئینی بماند، همان نام‌ها باید در HTML کنارش باشند.

کار:
برچسب Design → AI در locale جاری.
motion بعداً و فقط روی همین SVG استاتیک.

قرارداد: design.md §64–71؛ brief B5.

---

### 6.2 P4 Writing

P4 spec از قبل Article / Series / TopicTag / reading time / license / BlogPosting را دارد.
نمونه‌ها completion bar UX هستند، نه مدل جایگزین.

#### SAMP-COMPLETE-04 — Listing Writing با GET

نوع: COMPLETE  
فاز: P4

الزام:
- لیست HTML استاتیک
- فیلتر tag به‌صورت لینک یا `<form method="get">`
- empty «هنوز نوشته نشده» جدا از empty «فیلتر چیزی پیدا نکرد»
- featured اختیاری
- pagination با `?page=` نه JS
- emoji در empty state ممنوع

شواهد: B `blog/page.tsx`؛ A `BlogPage.vue`.  
Spec: P4 list + tag.

جستجوی `q` زیررشته صادق است.
رتبه‌بندی ادعایی نکنید تا P10.

---

#### SAMP-COMPLETE-05 — Detail مقاله

نوع: COMPLETE  
فاز: P4

الزام که spec دارد و نمونه نشان می‌دهد چگونه دیده شود:
- تاریخ published/updated با `<time>`
- reading time
- TOC از heading اگر بیش از یک heading هست
- Series prev/next
- license و accessibility notes
- BlogPosting JSON-LD از دادهٔ typed
- related editorial نه «you may also like»
- breadcrumb فقط روی detail
- sanitize در مرز Wagtail؛ `set:html` خام ممنوع

شواهد: A `BlogPostPage.vue`؛ B `[slug]/page.tsx`.  
Reading progress JS اختیاری است و هرگز لازم برای خواندن نیست.

---

#### SAMP-ADD-04 — JSON-LD XSS-safe

نوع: ADD  
فاز: P4

نمونه A JSON-LD را مشخص کرد و فایل `jsonLd.js` را نساخت.
نمونه B `<` را escape می‌کند.

ما `validateStructuredData` داریم.
همان الگو را برای BlogPosting و بعد ScholarlyArticle ادامه دهید.

---

### 6.3 P5 Research

#### SAMP-ADD-05 — Research به‌عنوان نوع اول، نه پست وبلاگ

نوع: ADD  
فاز: P5

نمونه C و B research interest و research project جدا دارند.
About ما `researchProjects` با title/summary/url دارد.

کار:
صفحهٔ `/{locale}/research/` با agenda، interests، projects، پیوند publications.
statement مستقل اگر در P5 DoD هست.
slug مستقل per locale.
بدون fallback زبان.

شواهد: B `ResearchProject`؛ C `ResearchInterest.java`؛ A `ResearchPage.vue`.

تا صفحه ساخته نشده، لینک هدر را نشان ندهید (`SAMP-FIX-01`).

---

### 6.4 P6 Projects / case study

#### SAMP-ADD-06 — قرارداد روایی case study

نوع: ADD / COMPLETE  
فاز: P6

کپی ما در `content.ts` از نمونه جلوتر است: problem، constraints، decisions، trade-offs، evidence.

نمونه فیلد اجرایی دارد که ما باید به مدل اضافه کنیم:

| فیلد | منبع |
|---|---|
| role | A `role_text`؛ B role |
| client / team | A |
| outcome | A/B |
| limitations | B — سیگنال اعتماد |
| dates | A/B |
| repo / demo / docs URL | C Project |
| gallery + alt per locale | A/B |
| skills/tech به‌عنوان taxonomy مشترک | A Skill M2M |
| `isFeatured` | C/A |

ترتیب UX: روایت قبل از گالری (نمونه B بهتر از A).
چیپ تکنولوژی تنها رمز روش نباشد.

صفحهٔ VTD Edge نمونه C را به‌عنوان یک case study بازنویسی کنید.
ادعاهای Kubernetes/Redis را وارد سایت زنده نکنید.

---

### 6.5 P8 Publications و Downloads

#### SAMP-ADD-07 — کارت هویت کتابشناختی

نوع: ADD  
فاز: P5 حداقلی، P8 کامل

`PublicationEntry` امروز فقط `title` و `status` است.
این برای استاد کافی نیست.

حداقل فیلد عمومی:

- title
- authors_display
- venue_display
- year
- type (journal / conference / book / manuscript)
- academic stage جدا از CMS status
- DOI با لینک `https://doi.org/…` بدون JS
- ISBN وقتی کتاب است
- abstract
- citation
- PDF/external URL فقط http(s)
- slug per locale

CMS status و academic stage دو فیلدند.
یک preprint می‌تواند `content_status=published` باشد.

DOI را داخل لینک کل کارت نگذارید.
`<dl>` + `<bdi dir="ltr">` برای DOI.

شواهد: A `PublicationDetailPage.vue`؛ B `Publication` model؛ C `Publication.java`.  
هدف: هویت کتابشناختی زیر ۱۰ ثانیه.

---

#### SAMP-COMPLETE-06 — کتابخانهٔ Downloads

نوع: COMPLETE  
فاز: P8

امروز دو Markdown روی `/cv/`.
نمونه C دسته دارد: CV / Publication / Code / Dataset + version + size.

کار:
کاتالوگ با نوع، حجم، زبان، سطح دسترسی.
tracking دانلود اختیاری و privacy-aware است؛ پیش‌فرض بدون لاگ IP در محصول عمومی.

---

#### SAMP-COMPLETE-07 — گواهی و تحصیل غنی‌تر

نوع: COMPLETE  
فاز: P2 داده / بعداً CMS

`EducationEntry` thesis را رشته دارد؛ GPA هست.
نمونه C `thesisUrl` و highlighted دارد.
`Certificate` فقط name/detail است؛ نمونه C issuer، credentialId، credentialUrl دارد.

این‌ها را به `profile.ts` اضافه کنید اگر دادهٔ مالک موجود است.
بعد به CMS Profile map کنید.

تجربهٔ کاری تو در تو با impact metric فقط اگر evidence واقعی باشد.
درصد مهارت جعلی نسازید؛ نمونه A هم proficiency را defer کرده است.

---

### 6.6 P7 Admin داخل Wagtail

ادمین Vue/Next را پورت نکنید.
شغل‌های ویرایشی را پورت کنید.

#### SAMP-ADD-08 — صف ترجمه و سلامت محتوا

نوع: ADD  
فاز: P7

نمونه A: locale tabs با badge ناقص + صف MISSING/INCOMPLETE/OUTDATED.
نمونه B: content-health برای ترجمه ناقص، alt مفقود، media یتیم، schedule شکست‌خورده.

معادل Wagtail:
- ستون locale + status در snippet
- گزارش داشبورد
- نه SPA دوم

---

#### SAMP-ADD-09 — Featured slots

نوع: ADD  
فاز: بعد از وجود محتوا

یک رکورد با `slot_key=home` و دقیقاً یک هدف: article یا project یا publication.
Home را بدون تغییر کد pin کنید.
Constraint exactly-one-target را از نمونه A بردارید.

---

#### SAMP-ADD-10 — Nav و chrome از CMS در build time

نوع: ADD  
فاز: P7 یا وقتی چند بخش زنده شد

نمونه B `SiteSettings` + `NavigationItem`.
Astro در CI از projection عمومی snapshot بگیرد.
پوستهٔ عمومی را client `/site` نکنید.

این همان راه جلوگیری از لینک مرده است.

---

#### SAMP-COMPLETE-08 — Schedule per locale

نوع: COMPLETE  
فاز: P7

`scheduled_for` مفید است.
شرط نمونه A که هر دو زبان SEO داشته باشند را کپی نکنید.
fa و en مستقل زمان‌بندی می‌شوند.

Celery/Redis برای این کار روی VPS نیاورید.
Wagtail scheduled pages یا cron سبک اگر لازم شد در Task Spec جدا.

---

#### SAMP-ADD-11 — Preview noindex

نوع: ADD  
فاز: با draft preview

نمونه A/B: preview token، `X-Robots-Tag: noindex`، `Cache-Control: no-store`.
Wagtail preview کافی است اگر همین هدرها روی URL پیش‌نمایش باشند.

---

### 6.7 تماس و رسانه — الان مسدود

`DEFER-0007` CLOSED: تماس در P2 منتشر نمی‌شود.
`AGENTS.md`: `/api/` و `/media/` و persistence تماس تا Task Spec بعدی بسته است.
`RISK-0003` هنوز restore CMS را اثبات نکرده است.

وقتی باز شد:

#### SAMP-ADD-12 — فرم تماس HTML-first

نوع: ADD  
مسدود تا Task Spec + RISK-0003

الزام محصول از نمونه‌ها:

- `<form method="post">`؛ island فقط enhancement
- label可见؛ placeholder به‌جای label ممنوع
- intent: research / collab / job / speaking / general
- honeypot فیلد `website` با موفقیت جعلی بدون ارسال واقعی (نمونه B)
- rate limit (نمونه A 5/hour؛ نمونه B 429)
- inbox `new/read/archived`
- پیام در لاگ نیاید
- CSRF
- `dir="ltr"` روی email
- noscript: mailto یا ارجاع به About
- موفقیت، متن پیام کاربر را echo نکند

شواهد: A `ContactPage.vue` + inbox؛ B `test_contact_api.py`.

---

#### SAMP-ADD-13 — Media: alt per locale و usage

نوع: ADD  
فاز: media runtime  
مرتبط: `DEFER-0014`

نمونه A/B: alt/caption per locale، hash dedupe، usage index، orphan report.
تصویر بدون alt locale درخواست‌شده را unlabeled نشان ندهید.
Rendition WebP را ADR-0021 نگه می‌دارد؛ S3 و pipeline سفارشی نیاورید.

---

### 6.8 P10 Search و P11 Graph

#### SAMP-ADD-14 — Search گروهی

نوع: ADD  
فاز: P10

تا وجود ندارد در هدر و 404 نشان ندهید (IA §115).

وقتی آمد:
- `/{locale}/search/`
- Pagefind island
- گروه نتایج: Research / Projects / Writing / Publications
- ایندکس فقط published همان locale
- draft نشت نکند

جستجوی `icontains` نمونه B را به‌عنوان رتبه‌بندی نفروشید.

---

#### SAMP-ADD-15 — `llms.txt`

نوع: ADD  
فاز: هر زمان بعد از پایدار شدن URLهای published

نمونه A آن را could-have گذاشت و نساخت.
فایل استاتیک از URLهای published.
ارزان برای AI-search.

---

#### Knowledge graph عمومی

نوع: SKIP از Samples / ADD در P11 از نو

`graphify-out` در نمونه‌ها ابزار توسعه است.
در نمونه B با dump وردپرس آلوده است.
محصول P11 را از هویت/research/blog links طراحی کنید، نه از HTML گراف نمونه.

---

### 6.9 کیفیت که باید بدزدیم نه استک

#### SAMP-ADD-16 — نوار تست قرارداد عمومی

نوع: ADD  
فاز: همراه هر slice محتوا

نمونه‌ها این را خوب بلدند:

- draft هرگز در لیست عمومی نیست
- locale filter سخت
- hreflang فقط مسیر هم‌locale
- تماس CSRF / honeypot
- markdown/HTML sanitize
- Playwright: `/en/*` در `main` فارسی ندارد
- anonymous فقط published

این تست‌ها را در pytest + Astro/Playwright بازسازی کنید.
JUnit را پورت نکنید.

---

#### SAMP-ADD-17 — Lighthouse بودجه در CI

نوع: ADD  
فاز: بعد از چند مسیر واقعی

نمونه B `.lighthouserc.json` سخت دارد و در GitHub Actions اجرا نمی‌شود.
فایل بدون CI تئاتر است.

اگر آوردید: Performance error زیر 0.9؛ a11y/SEO تا وجود محتوا warn.
URLهای Astro خودمان، نه Next.

---

#### SAMP-ADD-18 — Redirect به‌عنوان داده

نوع: ADD  
فاز: وقتی URL پایدار شد

نمونه B `RedirectRule`.
Wagtail redirects از قبل نصب است و استفاده نمی‌شود.
برای تغییر slug مقاله از همین استفاده کنید؛ سرویس سوم نسازید.

P4 spec همین را گفته است.

---

## 7. مدل محتوا — چه فیلدی را بردارید

شکل جدول ما را عوض نکنید.
یک ردیف per locale بماند.

این فیلدها را به مدل‌های بعدی بدهید.

### مشترک هر موجودیت عمومی

`title`، `slug` locale-specific، `seo_title`، `seo_description`، `canonical`، `og` media published، lifecycle، `published_at`.

### Article (P4 spec + نمونه)

excerpt، featured_image، tags، series، reading_time، license، accessibility_notes.
بدنه: یک RichText Wagtail.
`article_document_json` نمونه A را نیاورید؛ دو فرمت بدن بدهی است.

### Project

role، client/team، problem، constraints، decisions، outcome، limitations، gallery+alt، skill M2M، URLs، featured.

### Publication

authors_display، venue_display، year، type، academic_stage، doi، isbn، abstract، citation، external_url.
`content_status` ≠ `publication_stage`.

### Profile / CV

timeline typed + یک فایل CV published per locale per variant.
SocialLink با ORCID / Scholar / GitHub به‌صورت لیست قابل خاموش شدن.

### Skill

یک taxonomy؛ About و Project و Research آن را reuse کنند.
جدول موازی «technologies» نسازید.

### Contact

sender_name، sender_email، message، source_language، status، timestamps.
بدنه در log نباشد.

---

## 8. ضدالگوهای UX که دیده شد

| ضدالگو | کجا | کار ما |
|---|---|---|
| emoji به‌عنوان empty state | B blog empty | متن + لینک مرور |
| hover-zoom اجباری روی تصویر مقاله | B | CSS اختیاری؛ hover-only ممنوع |
| hardcode انگلیسی روی صفحهٔ فارسی | A HomeHero | همهٔ chrome از `content.ts` |
| لینک Hire Me به hash غلط | C | مقصد واقعی یا حذف |
| dark mode `ThemeProvider` در MVP روشن | B | تا theme کامل، toggle نسازید |
| کارت perspective بدون مقصد | ما | FIX-03 |
| nav به آینده | ما | FIX-01 |
| JSON-LD فقط در client SPA | C | فقط در Astro build |
| آمار جعلی / skill bar بدون evidence | هر سه نمونه در docs رد کرده‌اند | ما هم رد می‌کنیم |

---

## 9. نگاشت به فازهای خودمان

| فاز ما | از Samples | عمل |
|---|---|---|
| همین الان | nav، hero، About، 404، footer، CV CTA | FIX / COMPLETE |
| P2 باقی | فیلدهای CV/cert/education؛ HTML print CV | COMPLETE |
| باز شدن API | DTO published-only، Problem Details، no fallback | ADD روی Ninja موجود |
| P4 | listing GET، TOC، series، BlogPosting، unavailable | COMPLETE spec + UX نمونه |
| P5 | research entity + publication card حداقلی | ADD |
| P6 | case-study facts + gallery alt + featured | ADD |
| P7 | content-health، locale badges، featured، chrome CMS | ADD در Wagtail |
| P8 | DOI/stage/year/citation + downloads taxonomy | ADD |
| تماس | honeypot، 429، inbox، HTML form | ADD بعد از گیت |
| P9 Teaching | در نمونه‌ها نیست | از Samples چیزی نبرید |
| P10 | Pagefind؛ نه FTS عمومی | COMPLETE |
| P11 | KG محصول جدید | SKIP کپی graphify |

---

## 10. منابع شواهد

Agentهای موازی روی این درخت‌ها خواندند:

- [تحلیل tahamohamadi-ir](bd831964-5a33-4821-92ea-532c71cb4151)
- [تحلیل tahamohamadi-website](807d0c89-ed8c-401d-ac1a-ee79fc555d1c)
- [تحلیل Tahamohamadi-ir 2](970534f0-dd4c-45ff-ace7-6e32939e61fa)
- [موجودی پلتفرم فعلی](325d9781-a6d3-4f31-83ff-710357f4a04a)
- [ممیزی UI/UX](577baba6-1e7b-499b-865b-9fcf423202bb)

فایل‌های لنگر در همین repo:

- `apps/web/src/components/Header.astro`
- `apps/web/src/components/Landing.astro`
- `apps/web/src/components/About.astro`
- `apps/web/src/data/profile.ts`
- `apps/cms/apps/content/models.py`
- `docs/plan/P4-blog-writing-task-spec.md`
- `docs/user-journey-information-architecture.md`

Documentation impact:
این فایل منبع توصیه‌ها است.
پیاده‌سازی جداگانه است.

---

## Done

خروجی این کار یک کاتالوگ ردیابی‌پذیر است، نه کد.

Next:
Task Spec مربوطه از قبل ساخته شده است: `docs/plan/P2-honesty-closeout-task-spec.md`.
آن spec موارد `SAMP-FIX-01` تا `SAMP-FIX-06` را پوشش می‌دهد.
Spec دوم برای همین کار نسازید.
