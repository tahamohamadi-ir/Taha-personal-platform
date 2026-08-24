# reDesign_plan.md — نسخهٔ ۲.۰ — بازطراحی کامل: «شیشه و صورت فلکی» (Glass Constellation)

> **وضعیت:** جانشین کامل نسخهٔ ۱ (Editorial Minimal کاغذی). نسخهٔ ۱ آرشیو می‌شود؛ تصمیم‌های مهندسی سالم آن (فونت، تاریخ، RTL، کاتالوگ واحد) در همین سند ادغام شده‌اند.
> **تاریخ:** 2026-08-24 · **مالک:** Taha · **دامنه:** فقط `apps/web/` (فرانتاند عمومی). CMS، مسیرها، اسلاگ‌ها، مدل داده و SEO دست‌نخورده.
> **مبنای معماری:** Astro استاتیک + TypeScript + جزیره‌های React — طبق نظر فنی تأییدشدهٔ مالک، تعویض فریمورک (Next.js/SPA) منتفی است؛ مشکل «میکرو-معماری» است نه فریمورک.
> **مجوز حرکت:** ADR-0030 (motion / GSAP / D3 / Three.js مجاز با بودجه و fallback) — مالک صراحتاً سبک Glassmorphism، هیرو متحرک Three.js، گراف D3، GSAP اسکرول و واکنش به موس را خواسته است. این سند همان جهت را سیستم‌مند می‌کند.

---

## ۰. تشخیص (چرا سایت امروز «بدتر از افتضاح» است)

مشکل هرگز Astro نبود. مشکلات واقعی، همگی در لایهٔ سیستم طراحی‌اند:

1. **فونت‌ها هرگز لود نشده‌اند** — `global.css` استک `"Inter"`/`"Vazirmatn"` را صدا می‌زند ولی پکیج‌های fontsource با نام `'Inter Variable'`/`'Vazirmatn Variable'` ثبت شده‌اند ⇒ کل سایت با Segoe UI رندر می‌شود. (تک‌خطی‌ترین فیکس با بیشترین اثر.)
2. **هویت دوپارهٔ روشن/تاریک** — صفحهٔ ورود زبان (gateway) تیره و فضایی است، بقیهٔ سایت روشنِ بی‌روح؛ انگار دو محصول مختلف‌اند.
3. **نبود لایهٔ کامپوننت** — فقط ~۲۰ کامپوننت پراکنده؛ ≥۵ سیستم دکمه، ≥۶ سبک کارت، ۳ الگوی empty-state، ~۲۰ نسخهٔ کپی بلوک استایل کاتالوگ، عرض‌های آشوبی (1280px/44rem/48rem/42rem).
4. **حرکتِ یا ممنوع یا خودجوش** — یا هیچ (باقی سایت) یا بدون سیستم (Three.js دکوری، گراف بی‌معنا). هیچ سطح میانی «تعامل معنادار» وجود ندارد.
5. **بی‌قاعدگی زبانی/تاریخ** — برچسب انگلیسی روی صفحات فارسی، دو تقویم تاریخ، ارقام غیرفارسی روی fa.

راه‌حل v2: **یک جهان بصری تاریکِ شیشه‌ای** که gateway را به هویت کل سایت تبدیل می‌کند + **یک زبان کامپوننت** + **یک نردبان حرکت پنج‌طبقه‌ای** با fallback های الزامی.

---

## ۱. جهت‌گیری بصری: «Glass Constellation»

### ۱.۱ مفهوم

سایت = ایستگاه رصد شخصی طه. بوم عمیق سرمه‌ای (همان جهان gateway)، میدان‌های نور محو (aurora) در پس‌زمینه، و سطوح شیشه‌ای شناور که محتوا را مثل ذرات نور حمل می‌کنند. صورت فلکی هیرو (Design→Interaction→Engineering→Data→AI→HCIS) امضای برند است و با نشانگر موس زنده می‌شود.

این یعنی: **Glassmorphism امضای سایت است، نه دکور.** طبق اصل frontend-design، جسارت در یک نقطه متمرکز می‌شود؛ بقیه منظم و ساکت می‌ماند تا شیشه بدرخشد.

### ۱.۲ رنگ — بوم شب + فیروزه‌ای برند + طلای امضا

| نقش | توکن | مقدار | یادداشت |
|---|---|---|---|
| بوم صفحه (تیره) | `--canvas-night` | `#071225` | همان navy-950 فعلی؛ کل سایت یکدست می‌شود |
| بوم عمقی (بخش‌ها) | `--canvas-deep` | `#0B1630` | تناوب بخش‌ها بدون شکستن تم |
| سطح توپر خوانش | `--surface-read` | `#101F3C` | متن بلند روی این، نه روی شیشه |
| شیشهٔ پرشده | `--glass-fill` | `rgba(255,255,255,.08)` | کارت/پنل |
| شیشهٔ قوی | `--glass-fill-strong` | `rgba(255,255,255,.14)` | هدر چسبان، overlay |
| حاشیهٔ شیشه | `--glass-edge` | `rgba(255,255,255,.16)` | + هایلایت داخلی بالایی |
| جوهر اصلی روی شب | `--ink-hi` | `#F2F6FA` | کنتراست ≥ 13:1 |
| جوهر دوم | `--ink-mid` | `#A8B8C8` | ≥ 7:1 روی canvas-night |
| جوهر سوم (متادیتا) | `--ink-low` | `#6E8095` | ≥ 4.5:1 — فقط متادیتا |
| برند | `--brand` | `#16B8A6` | فیروزه‌ای موجود؛ لینک/فوکوس/CTA |
| برند روشن (متن لینک روی شب) | `--brand-text` | `#3DD6C5` | برای رسیدن به 4.5:1 روی #071225 |
| برند عمیق (پر دکمه) | `--brand-deep` | `#0D9689` | متن سفید رویش 3.66:1 ⇒ **ممنوع برای متن کوچک**؛ فقط دکمهٔ بزرگ ≥18px bold یا با `--night-ink` |
| امضا (طلای لوگو) | `--gold` | `#E3B95C` | نسخهٔ روشن‌شدهٔ gold-500 برای خوانایی روی شب؛ بودجهٔ استفاده ≤ ۴٪ سطح |
| پژوهش/AI | `--violet` | `#8E75E6` | گره AI صورت فلکی، badge پژوهش |
| خطر | `--danger` | `#FF6B5E` | |

**میدان‌های نور (aurora):** دو-سه لکهٔ radial-gradient بسیار محو (`turquoise 8% → transparent`, `violet 6% → transparent`) ثابت در پس‌زمینهٔ body با `background-attachment: fixed` معادل؛ + یک لایهٔ grain نویز SVG با opacity 0.03 برای ضدبندي. این لکه‌ها «عمقی» می‌سازند که شیشه معنا پیدا کند — شیشه بدون چیزی پشتِ خودش فقط blur خالی است.

**حذفیات:** رنگ‌های روشنِ paper/canvas سبزفام، بنفش/طلایی نسخه‌های قدیمی `--color-signature*`، سرمه‌ای‌های پراکنده — همه به جدول بالا تجمیع می‌شوند.

### ۱.۳ تایپوگرافی (ادامهٔ تصمیم درست v1)

- فیکس فونت فوراً: استک‌ها `"Vazirmatn Variable"` و `"Inter Variable"` (global.css).
- بدنه fa: 400/مهم 450، خط 1.95، اندازه 17px · بدنه en: 400، خط 1.7، 16px.
- Display: `clamp(2.6rem, 1.6rem+3vw, 4.2rem)` وزن 700، fa خط 1.35؛ en letter-spacing −0.01em؛ **حرف‌فاصلهٔ منفی روی fa ممنوع.**
- kicker: رنگ brand-text، وزن 600، uppercase فقط en.
- عرض سطر: prose ≤ 66ch · کاتالوگ/لیست ≤ 44rem · خانه/About ≤ 72rem. **این مقادیر توکن می‌شوند** (`--measure-prose/page/wide`) و همهٔ صفحات از یک `.container` پیروی می‌کنند — پاسخ مستقیم به خواستهٔ «تناسب عرض متن و فضای منفی/مثبت با یک الگو».
- اعداد/تاریخ fa با ارقام فارسی و تقویم جلالی (`Intl` با `fa-IR-u-ca-persian`) در زمان build، بدون JS. تابع مشترک `formatDate(date, locale)` در `src/lib/format.ts`. هیچ ISO خام روی fa.

### ۱.۴ شیشه — قانون کیفیت (نه blur خام)

هر سطح شیشه‌ای باید هر پنج مورد را داشته باشد:

```css
.glass {
  background: var(--glass-fill);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid var(--glass-edge);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.10),      /* انکسار لبهٔ بالا */
    0 16px 48px rgba(2,8,20,.45);             /* سایهٔ رنگ‌گرفته از شب، نه مشکی */
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass { background: var(--surface-read); } /* fallback توپر — همیشه قابل‌استفاده */
}
```

1. blur 12–20px + `saturate(150%)` — اشباع باعث می‌شود aurora از پشت شیشه زنده دیده شود.
2. حاشیهٔ 1px روشن + هایلایت داخلی بالا (edge refraction).
3. سایهٔ رنگ‌گرفته از رنگ بوم (rgba سرمه‌ای تیره)، هرگز `rgba(0,0,0,x)` خام.
4. **متن روی شیشه ممنوع مگر روی نوار توپر محلی** — متن اصلی همیشه روی `--surface-read` یا حداقل fill 20٪+ محلی؛ قانون کنتراست 4.5:1 روی شیشه هم بررسی می‌شود (چون پس‌زمینهٔ پشت شیشه متغیر است، متن بدنه روی شیشه نمی‌نشیند).
5. حداکثر ۲ لایهٔ شیشهٔ تودرتو (شیشه روی شیشه ممنوع)؛ موبایل <768px: blur → 10px؛ اگر QA جank دید، blur موبایل خاموش → fallback توپر.

**کجا شیشه مجاز است:** هدر چسبان، کارت‌های perspective/شواهد، chip های آمار هیرو، منوی More، Lightbox، نوار availability، دکمه‌های primary شناور. **کجا ممنوع:** بدنهٔ مقاله/prose، جدول‌ها، فرم‌ها (فیلدها توپر `--surface-read` با border شیشه‌ای ظریف)، بلوک کد.

### ۱.۵ حرکت — نردبان پنج‌طبقه‌ای

هر تعامل دقیقاً یک طبقه دارد؛ ترکیب کتابخانه‌ها در یک interaction ممنوع؛ اول CSS/native بررسی می‌شود.

| طبقه | ابزار | مصادیق | بودجه |
|---|---|---|---|
| **M0 عملکردی** | CSS transition | hover/focus همهٔ کنترل‌ها 160ms ease-out؛ باز/بسته 240ms؛ active scale(.98) | 0KB |
| **M1 محیطی** | CSS keyframe | drift آرام aurora (60s alternate)؛ ورود صورت فلکی SVG با stroke-draw مرحله‌ای (CSS-only، 0JS) | 0KB |
| **M2 تعاملی موس** | CSS vars + rAF JS سبک (~1KB) | **spotlight border**: حاشیهٔ کارت زیر موس روشن می‌شود (radial-gradient با `--mx/--my`)؛ **tilt ملایم** کارت perspective (≤4deg)؛ **magnetic CTA** (جذب ≤6px)؛ parallax لایه‌های هیرو نسبت به موس (damped، همان الگوی Constellation3D فعلی) | ≤5KB، فقط desktop + fine-pointer |
| **M3 روایی اسکرول** | GSAP ScrollTrigger (lazy island) | **Journey timeline** (§۷): خط مسیر Design→…→HCIS با اسکرول رسم می‌شود و گره‌ها یکی‌یکی فعال می‌شوند؛ reveal پله‌ای بخش‌های خانه (stagger ≤ 6 آیتم) | ≤35KB gzip، فقط خانه |
| **M4 امضا** | Three.js / D3 (lazy islands) | هیرو سه‌بعدی صورت فلکی (نسخهٔ ارتقایافتهٔ Constellation3D موجود — واکنش به موس + درگ آرام چرخش)؛ **گراف موضوعات پژوهش D3** جایگزین گراف حذف‌شده: force-graph تعاملی موضوع↔پروژه↔انتشار با tooltip شیشه‌ای و کلیک‌پذیری واقعی | three ≤150KB gzip · d3 ≤60KB gzip |

قواعد سراسری:
- `prefers-reduced-motion: reduce` ⇒ M1-M4 خاموش، فقط M0؛ حالت نهایی ایستا = همان محتوای کامل.
- بدون JS ⇒ M0/M1 (CSS) کار می‌کند؛ M2-M4 حذف؛ محتوا ۱۰۰٪ خوانا (fallback SVG استاتیک هیرو از قبل هست).
- Hero copy بلافاصله رندر می‌شود؛ هیچ import رندربلوک؛ islands فقط `client:visible`.
- transform/opacity فقط؛ هرگز top/left/width/height.
- یک زبان easing سراسری: `--ease-out: cubic-bezier(.22,1,.36,1)` · durations توکنی 120/160/240/360ms.
- موبایل و لمس: M2 کلاً غیرفعال (media `(hover:hover) and (pointer:fine)`)؛ M4 ساده‌سازی‌شده (هیرو: چرخش خودکار آرام بدون درگ).

---

## ۲. معماری کامپوننت (پاسخ ساختاری به نظر فنی)

```
apps/web/src/
├── styles/global.css          ← تنها منبع توکن (@theme) + لایهٔ components (.btn/.card/.glass/.prose/.section/.container/.chip/.kicker/.meta-row/.empty-state)
├── components/
│   ├── primitives/            ← اتم‌های بی‌منطق: Btn.astro, Chip.astro, Kicker.astro, MetaRow.astro, Field.astro, Icon.astro
│   ├── ui/                    ← ترکیب پوسته: SiteHeader.astro, SiteFooter.astro, Breadcrumbs.astro, EmptyState.astro, Pagination.astro, ThemeAurora.astro
│   ├── patterns/              ← الگوهای محتوایی: ArticleCard.astro, ProjectCard.astro, ResearchCard.astro, PublicationRow.astro, CatalogPage.astro (یگانه — پایان ۲۰ نسخهٔ کپی), DetailShell.astro
│   ├── sections/              ← بخش‌های صفحهٔ اصلی: HeroSection.astro, PerspectiveGrid.astro, FocusStrip.astro, EvidenceSection.astro, JourneySection.astro, WritingLatest.astro, ContactCTA.astro
│   └── islands/               ← فقط تعامل سنگین (React): ConstellationHero.tsx (three), TopicGraph.tsx (d3), JourneyScroll.tsx (gsap), Lightbox.tsx
└── lib/format.ts               ← formatDate / formatNumber دوزبانه
```

قواعد:
- هیچ رنگ hex / فونت / فاصله‌ای خارج از global.css. grep CI: `#[0-9a-fA-F]{3,6}` در صفحات/کامپوننت‌ها = فقط global.css.
- هیچ `<style>` بلوک صفحه‌ای یک‌بارمصرف — استایل صفحه فقط از کلاس‌های مشترک + variant.
- Astro برای همه‌چیزِ استاتیک؛ React فقط در islands/ با دلیل تعاملی.
- کاتالوگ‌ها (انتشارات/کتاب‌ها/سخنرانی‌ها/دانلودها/آموزش/خلق‌آفرینی) همگی از یک `CatalogPage` با prop رندر می‌شوند.

---

## ۳. پوسته (Shell)

- **Header:** چسبان، شیشهٔ strong (blur 16px)، ارتفاع 64px، حاشیهٔ پایین glass-edge. راست (RTL): لوگو+نام. چپ: About · Research · Projects · Writing · More▾(details بدون JS: Publications/Books/Talks/Downloads) · CV · Contact · Search · دکمهٔ زبان (`.btn--ghost .btn--sm` با متن زبانِ مقابل). حالت active: بخش والد هم روشن (`/fa/research/topics/x` ⇒ Research).
- **Footer:** بوم deep، سه ناحیه (ناوبری کوتاه / تماس CMS / زبان)؛ لینک‌ها min-height 44px؛ فرم مرده حذف.
- **Cover (ورود زبان):** می‌ماند اما دیگر جزیره نیست — همان توکن‌ها و `.btn`؛ نام دوجهانی بزرگ با خط طلای امضا (2px) زیرش؛ پس‌زمینه: aurora + ذرات ثابت SVG ظریف (بدون JS). دو دکمهٔ بزرگ شیشه‌ای: «فارسی» primary فیروزه‌ای / «English» ghost. 404 همان قالب با پیام کوتاه.
- **Skip link، focus-visible دوقلوی همهٔ hoverها، scroll-padding-top = ارتفاع هدر** — کف دسترس‌پذیری غیرقابل مذاکره.

## ۴. صفحهٔ اصلی — قلاب مخاطب (Landing)

هدف: بازدیدکننده در ۵ ثانیه بفهمد طه کیست و «ادامه» را بخواهد. ترتیب:

1. **Hero (M4):** چپ متن — kicker، نام بزرگ با خط طلای امضا، یک جملهٔ جایگاه‌یابی، دو CTA («مسیرهای من» primary، «دربارهٔ طه» ghost). راست: صورت فلکی Three.js — ۶ گرهٔ حوزه‌ها حول هستهٔ طلایی؛ با حرکت موس کل شبکه damped می‌چرخد، گرهٔ زیر موس بزرگ‌تر و برچسبش روشن می‌شود. زیر متن: سه chip شیشه‌ای (PhD-ready · Open to collaborate · تهران/Remote). موبایل: SVG استاتیک + ورود stroke-draw.
2. **Perspective Grid (M2):** سه کارت شیشه‌ای (Research / Engineering&AI / Writing&Learning) با مخاطب+ارزش+گام بعدی؛ spotlight border زیر موس؛ tilt ملایم.
3. **Focus Strip:** نوار باریک شیشه‌ای «تمرکز فعلی + Open to PhD».
4. **Selected Evidence (M3-reveal):** ۴-۶ مورد منتخب به‌صورت list-row با stagger ظریف؛ هر ردیف: نوع (kicker رنگ‌رمزگذاری‌شده) + عنوان + متادیتای جلالی.
5. **Journey (M3-GSAP):** تایم‌لاین عمودی مسیر Design→…→Human-Centered Intelligent Systems؛ خط با اسکرول رسم می‌شود، گره‌ها فعال می‌شوند، هر ایستگاه یک جمله. reduced-motion/no-JS: تایم‌لاین ایستای کامل.
6. **Highlights + Latest Writing:** دو ستون نامتقارن (7/5): پروژه‌های برگزیده (ProjectCard) / ۳ نوشتهٔ تازه (list-row + لینک «همه»).
7. **Contact CTA (climax):** پنل شیشه‌ای عریض با یک جملهٔ دعوت + دکمهٔ بزرگ magnetic «شروع گفتگو».

## ۵. صفحه‌به‌صفحه

| صفحه | تغییرات |
|---|---|
| cover / 404 | §۳ — هم‌سیستم شدن با شب |
| خانه | §۴ |
| پژوهش index | معرفی کوتاه + **TopicGraph (D3)**: گره‌ها=موضوعات، یال=پیوند به پروژه/انتشار؛ کلیک ⇒ فیلتر لیست زیرین؛ tooltip شیشه‌ای؛ fallback بدون JS: چیپ‌های لینک‌دار موضوعات (همان داده) |
| موضوع پژوهش | DetailShell: breadcrumb+h1+meta-row+.prose+لیست مرتبط‌ها |
| پروژه‌ها | CatalogPage واحد؛ badge نوع ترجمه‌شده از دیکشنری؛ فیلتر/مرتب‌سازی با اسکریپت مشترک واحد |
| جزئیات پروژه | DetailShell + گالری Lightbox شیشه‌ای؛ DemoEmbed click-to-load بدون تغییر رفتار |
| نوشته‌ها/مقاله | list-row با تاریخ جلالی + tag؛ مقاله: `.prose` روی `--surface-read` (پنل خوانش توپر وسط بوم شب — خوانایی حاکم) |
| رزومه/CV | تب radio-CSS هم‌سیستم؛ تولبار sticky با offset توکنی؛ دانلودها card--row + btn primary |
| تماس | برچسب‌های فارسی‌سازی‌شده؛ فرم توپر با فیلد شیشه‌لبه؛ پیام پاسخ‌دهی حفظ |
| جستجو | Pagefind با متغیرهای `--pagefind-ui-*` روی توکن‌ها؛ noscript با EmptyState |
| درباره | کارت‌های entry با Card؛ تب‌ها chip؛ حذف ~۴۰۰ خط استایل یک‌بارمصرف |
| کاتالوگ‌ها ×۶ | CatalogPage واحد + DetailShell واحد؛ پایان کپی‌ها |

## ۶. پاک‌سازی

- حذف Tailwind import از global.css (فقط ۲ کلاس مصرف — معادل دستی)؛ حذف توکن‌های مرده؛ حذف استایل فرم مردهٔ Footer.
- ادغام دو اسکریپت فیلتر کاتالوگ در یکی.
- `ResearchGraphIsland/Section` قدیمی + `lib/cms/research-graph.ts` قدیمی حذف و با TopicGraph جدید (D3، معنادار، کلیک‌پذیر) جایگزین — نه حذف بی‌جایگزین.
- `gsap` از devDependency خاموش به وابستهٔ مصرفی Journey تبدیل می‌شود (lazy import داخل island) — یا اگر Journey به تعویق افتاد، حذف.
- یکسان‌سازی notice کهربایی fa/en.

## ۷. بودجه‌ها و گیت‌های سخت (QA)

- **Bundle:** هر island ≤35KB gzip؛ three ≤150KB lazy؛ مجموع JS صفحهٔ اصلی ≤220KB gzip lazy (بدون اجرای رندربلوک). LCP = متن هیرو، فونت subset با `font-display: swap`.
- **کنتراست (روی شب):** ink-hi ≥13:1 · ink-mid ≥7:1 · ink-low ≥4.5:1 · brand-text ≥4.5:1 · حاشیهٔ کنترل ≥3:1. متن بدنه هرگز روی شیشهٔ کم‌پُر.
- **هر صفحه × هر دو زبان:** بدون JS خوانا/ناوبری‌پذیر · reduced-motion ایستا · RTL با logical properties (صفر physical property) · 320/375/768/1440 سالم · فوکوس‌رینگ دیده‌شدنی · تاریخ جلالی/میلادی درست · صفر برچسب زبان اشتباه.
- **Playwright:** mobile-overflow، sitemap/RSS/canonical، contact، p8-catalog، health — همهٔ اسپک‌های موجود سبز می‌مانند + دو اسپک جدید: `qa/glass-contrast.spec.mjs` (نمونه‌برداری کنتراست سطوح شیشه‌ای) و `qa/budget.spec.mjs` (سنگینی chunk ها).
- مسیرها/اسلاگ‌ها/محتوا/SEO تغییر نمی‌کنند — فقط نمایش.

## ۸. فازهای اجرا (هر فاز = خروجی قابل‌دیدن)

- **فاز ۰ — شالودهٔ شب (بدون تغییر layout):** فیکس نام فونت‌ها؛ توکن‌های §۱.۲/۱.۳/۱.۴ در global.css؛ aurora+grain؛ formatDate؛ پاک‌سازی §۶. ✅ build سبز، فونت Variable در DevTools، هیچ صفحه‌ای نشکسته.
- **فاز ۱ — پوسته:** Header شیشه‌ای چسبان، Footer، Breadcrumbs، cover/404 شب. ✅ ناوبری/More بدون JS، فوکوس‌ها کامل.
- **فاز ۲ — سیستم کامپوننت:** primitives/ui/patterns طبق §۲؛ مهاجرت ۸ کاتالوگ به CatalogPage؛ DetailShell. ✅ grep: یک تعریف استایل کاتالوگ؛ صفر ISO خام روی fa؛ صفر hex خارج global.css.
- **فاز ۳ — تجربهٔ خانه:** HeroSection + ConstellationHero (ارتقای Three.js موجود)، PerspectiveGrid spotlight، Evidence/Journey/Writing/CTA. ✅ بودجه‌ها؛ reduced-motion/no-JS fallback ها؛ اسپک budget سبز.
- **فاز ۴ — پژوهش تعاملی + بقیه صفحات:** TopicGraph (D3) + مهاجرت پروژه‌ها/نوشته‌ها/رزومه/تماس/جستجو/درباره. ✅ چک‌لیست §۷ کامل.
- **فاز ۵ — پولیش و مدرک:** اسکرین‌شات قبل/بعد دوزبانه دسکتاپ+موبایل در `docs/status/evidence/redesign-v2/`؛ ممیزی کنتراست شیشه؛ تیک نهایی.

## ۹. ممنوعیت‌ها (Anti-patterns v2)

- شیشهٔ بی‌قانون: blur بدون saturate/edge/fallback، متن بدنه روی شیشهٔ کم‌پُر، شیشه روی شیشه (>۲ لایه).
- رنگ hex داخل کامپوننت/صفحه؛ دکمه/کارت/چیپ/empty-state دست‌ساز خارج سیستم.
- حرکت خارج از نردبان §۱.۵ (پارالاکس خودجوش، loop تزئینی، انیمیشن layout-property).
- برچسب زبان اشتباه، تاریخ ISO خام روی fa، uppercase/letter-spacing منفی روی فارسی.
- کپی بلوک استایل بین صفحات؛ island بدون fallback ایستا؛ import رندربلوک در مسیر بحرانی.
- ذرات/ستاره‌های بیمعنا — هر عنصر متحرک باید به «چه می‌گوید دربارهٔ طه؟» جواب داشته باشد.

---

## پیوست — منابع طراحی که این سند از آنها تغذیه کرده

- `frontend-design` (Anthropic): امضای واحد + جسورت متمرکز + دوری از قالب‌های پیش‌فرض AI.
- `impeccable`: حالت Persuade برای لندینگ، craft floor، QA در پاس‌های محدود (یک راند inspect → batch fix → حداکثر یک راند confirm).
- `taste-redesign`: اولویت فیکس (فونت→رنگ→hover→layout→کامپوننت→state→polish)، تکنیک true-glassmorphism (inner border + refraction)، ممنوعیت سایهٔ مشکی خام.
- `ui-ux-pro-max`: مشخصهٔ فنی Glassmorphism (blur 10-20px، fill 15-30%، کنتراست 4.5، checklist تحویل) + پریست‌های GSAP (parallax/flip) و dial های density/motion.
- `emilkowalski-motion`: 140-220ms کنترل‌ها، transform/opacity فقط، stagger گروه کوچک، cleanup observer/instance.
- `designer-skills-pack` (motion-system, theming-system, critique-*): چارچوب توکن حرکت و ممیزی بصری.
- `gsap-core/scrolltrigger/timeline`، `d3-visualization`: الگوهای اجرای M3/M4.
- نظر فنی مالک (Option 1): Astro می‌ماند؛ لایه‌بندی primitives/ui/patterns/sections/islands/tokens عیناً پذیرفته شد؛ Next.js فقط سناریوی فرعیِ هرگز-اگر-لازم-شد.
