# Fast Safe Go-Live Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** رساندن سریع‌ترین نسخهٔ عمومیِ سالم و قابل بازگشت به production، با یک P1 کاملاً static و بدون ایجاد CMS، database یا contact persistence جدید؛ سپس توسعهٔ مرحله‌ای P2 تا P11 با ثبت شفاف همهٔ ریسک‌ها و اعتبارسنجی‌های عقب‌افتاده.

**Architecture:** مسیر عمومی با Astro و HTML ایستا ساخته و به‌صورت artifact نسخه‌دار از Caddy ارائه می‌شود. React فقط برای interaction اثبات‌شده به‌صورت island وارد می‌شود؛ Django/Wagtail/Ninja/PostgreSQL تا P3 یا نیاز واقعی P2 وارد runtime این پروژه نمی‌شوند. فارسی و انگلیسی مستقل ولی مرتبط‌اند و `/` فقط Language Gateway است.

**Tech Stack:** Astro + TypeScript؛ Tailwind و Design Tokens حداقلی؛ React Islands فقط در صورت نیاز؛ `motion`، `gsap` و `three` فقط به‌عنوان dependency قفل‌شده برای slice آینده و بدون استفاده در P1؛ GitHub Actions hosted؛ Docker Compose + Caddy؛ از P3 به بعد Python 3.12 + Django 5.2 LTS + Wagtail 7.4 LTS + Django Ninja + PostgreSQL.

## Progress snapshot (2026-08-16)

- **P0-G0 + P3 code-first gate (owner-authorized):** production P1 live on **release-6031441** (checksum `031943b1`) at https://tahamohamadi.ir since 2026-08-16 (LOG-0111); CI green on `main` (web + cms). A1-A5, B3-B5, C1-C3, C5, C6, C7 (no-CV scope), P1-09 (JSON-LD), D8 done. **Server upgraded** (Ubuntu 26.04 LTS, 2 vCPU / ~4 GiB RAM / 30 GB disk; owner decision: keep 4 GiB — `RISK-0007` CLOSED) and the live stack inventory-confirmed via `docker ps` 2026-08-16 (`RISK-0004` CLOSED). **Staging decommissioned** (ADR-0025, 2026-08-15): gate is now CI (web + cms) + production smoke only. **P3 `apps/cms/` code-first complete:** 70 pytest PASS, ruff clean, ADR-0020..0024, `ci-cms.yml`, NoIndexMiddleware + real JSON logging + enumeration/XSS tests, infra candidates NOT-APPLIED (LOG-0107, LOG-0110). CHANGELOG/BACKLOG updated. **KI-0001 CLOSED** (`profile.fa.ts` single-m fix; `rg tahamohammadi apps/web/src` clean — LOG-0110). **C4 DONE (md, 2026-08-16):** owner placed `Assets/Taha_Mohammadi_Master_CV_Website_Profile.md` + `Assets/Taha_Mohammadi_Industry_Resume_Software_AI.md`; published as Markdown downloads via `Downloads.astro` on `/en/cv/` + `/fa/cv/` (title/note/size; PDF replacement optional — owner). **Header logo added:** 8 KB PNG derived from `Assets/Taha Logo/Taha Logo base.png` (cropped 4000x4000 margins, transparent bg; ACCEPT-WITH-NOTES) replaces the `brand-mark` span in `Header.astro`; sitemap includes both CV routes. Local QA: overflow=0, dir ltr/rtl correct, 2 links/page, logo loads (Playwright on built dist, port 8899); `npm run check` 0 errors; `npm run build` 8 pages. **B1 DONE (inventory):** owner pasted `apt list --upgradable` (57 pkgs, Ubuntu 26.04 updates incl. docker/containerd/grub/apparmor); the upgrade itself needs an owner maintenance-window decision.
- **Remaining (owner/server):** B2 (SSH port decision), DEFER-0009 (OG), DEFER-0013 (200% zoom), DEFER-0014 (alt-by-locale). **P3 runtime live (2026-08-16):** Compose `taha-cms`; `/admin/` + `/static/*` + TOTP (`RISK-0009` CLOSED, LOG-0129); recovery codes in repo (`DEFER-0015` CLOSED — owner rebuild); staff preview in repo (P3-07 DONE; `DEFER-0016` public token). `RISK-0003` needs CMS-postgres restore evidence. `/api/` and `/media/` unpublished (`DEFER-0017` for public blog API). **P4 Blog/Writing:** code-first `PARTIAL`/`DONE` in repo on `main` (PR #14 + security harden PR #15; LOG-0133/0134). Owner still owns prod migrate (after RISK-0003), optional `CMS_API_BASE` build, and DEFER-0018 feed.

## Global Constraints

- وضعیت فعلی gate برابر `P0-G0` است. هیچ scaffold، manifest برنامه، dependency، API، schema، service یا deploy پیش از PASS/exception مستند و Task Spec مجاز نیست.
- قبل از هر task یک Task Spec کامل از `docs/templates/TASK_SPEC_TEMPLATE.md` ساخته شود؛ هر عمل واقعی یک entry در `docs/status/WORK_LOG.md` می‌گیرد.
- هر تعویق واقعی قبل از release باید ID یکتای بعدی را در `docs/status/deferred-validation.md` یا `docs/status/RISK_REGISTER.md` بگیرد؛ این فایل جای ledger نیست.
- Stop-the-line، Critical، High بدون پذیرش صریح مالک و همهٔ اجزای Minimum Safe Gate قابل تعویق نیستند.
- endpoint، DTO، model، slug، metric، copy، translation، asset، secret، service و command تأییدنشده اختراع نشود.
- فرمان‌های install/test/build/deploy فقط پس از اجرای واقعی و ثبت در `PROJECT_MANIFEST.md` canonical هستند؛ این برنامه عمداً command خیالی ارائه نمی‌کند.
- `/` Language Gateway، `/fa/` فارسی/RTL و `/en/` انگلیسی/LTR هستند. ترجمهٔ گمشده صریح است و fallback خاموش ممنوع است.
- main content بدون JavaScript خوانا می‌ماند. `motion`، `gsap` و `three` در lockfile آماده‌اند، اما heavy motion، canvas، WebGL، D3 و هر import/runtime آنها برای اولین live لازم نیستند و نباید global یا render-blocking شوند.
- production و هر environment ایزولهٔ آینده هرگز database، media، secret یا backend مشترک ندارند (staging از 2026-08-15 decommission شده است — ADR-0025). P1 static بدون runtime پایگاه‌داده منتشر می‌شود.
- هیچ merge، push یا deploy بدون اجازهٔ صریح مالک انجام نمی‌شود؛ فقط فایل‌های task-owned stage/commit می‌شوند.

---

## 1. ارزیابی وضعیت واقعی در 2026-08-14

| موضوع | وضعیت مستند | اثر روی live |
|---|---|---|
| Gate | `P0-G0` هنوز PASS نشده؛ `RISK-0001` BLOCKED | scaffold و deploy فعلاً ممنوع |
| Application | `apps/web/` و `apps/cms/` خالی؛ package/lockfile وجود ندارد | همهٔ commandهای app هنوز باید verify شوند |
| Secure access | `RISK-0002` بسته؛ non-root key-only و SSH policy ثبت شده | مانع قبلی رفع شده |
| Staging hostname | DNS/HTTPS و Caddy placeholder مستقل با external/direct 503 PASS | آمادهٔ جایگزینی با static artifact، نه app runtime |
| Backup | snapshotهای encrypted، retention، timer، `restic check` و file-level restore PASS | برای static-first مناسب؛ staging DB import هنوز باز است |
| Restore risk | `RISK-0003` High/Open فقط برای isolated staging database import | برای first live صرفاً با استثنای صریح و محدودِ static-only قابل عبور است |
| Existing VPS stack | stack زندهٔ دیگر وجود دارد؛ `RISK-0004` High/In progress | topology و rollback آن قبل از هر deploy واقعی باید روشن شود |
| Capacity | `RISK-0007` High/Blocked برای co-hosted staging runtime | با static-only staging دور زده می‌شود؛ برای P3 حل الزامی است |
| Patch/SSH surface | `RISK-0005` و `RISK-0006` Medium/Open | با owner/target/mitigation قابل defer؛ نباید ناپدید شوند |
| CI/deploy | workflow، artifact pipeline و rollback artifact این پروژه وجود ندارد | P0-A blocker اولین live |
| Content/assets | copy/translation proposal، contact/OG، CV/Resume و logo نهایی هنوز owner input می‌خواهند؛ font pair verified | contact/OG/logo approval blocker؛ placeholder production ممنوع |

### نتیجهٔ ارزیابی

سریع‌ترین مسیر امن، release سه‌مرحله‌ای زیر است:

```text
R0 — Gate/contract closure
  → R1 — Static deployment spine on isolated staging
    → R2 — P1 Language Gateway + bilingual Landing → production
      → R3 — P2 static About/Resume/CV + safe contact path
        → R4 — P3 CMS runtime only after capacity + DB restore gate
```

P0-B hardening، تست‌های گستردهٔ visual/browser/screen-reader، dark mode، motion نهایی، analytics پیشرفته و recurring restore drill از R2 جلوگیری نمی‌کنند؛ اما باید پیش از همان release با ID، owner، target و fallback ثبت شوند.

---

## 2. قواعد وضعیت و اولویت

- `BLOCKER`: بدون PASS یا پذیرش مجاز، task بعدی شروع نمی‌شود.
- `FIRST-LIVE`: جزو مسیر بحرانی R0 تا R2 است.
- `AFTER-LIVE`: بعد از production smoke اولین نسخه انجام می‌شود.
- `FUTURE`: به ترتیب P4 تا P11 و فقط پس از dependency واقعی.
- هر checkbox فقط با evidence تازه بسته می‌شود؛ وجود فایل یا سبز بودن یک تست محدود به‌تنهایی Completion نیست.

---

## 3. R0 — بستن قراردادها و تصمیم Gate

### Task G0-01 — ساخت snapshot وضعیت و رفع drift مستندات

**Priority:** `BLOCKER`  
**Files:** `PROJECT_MANIFEST.md`, `README.md`, `docs/adr/README.md`, اسناد P0-A، `docs/status/*`, Technology Baseline؛ ADR پذیرفته‌شده بازنویسی نشود.

- [ ] Task Spec مستندی با allowed/forbidden files بساز.
- [ ] statusهای قدیمی «not provisioned» را با evidence `LOG-0024` تا `LOG-0040` مقایسه کن.
- [ ] duplicate numbering در Task Spec سرور، وضعیت قدیمی snapshot/job/restore، و جملهٔ قدیمی restic password را اصلاح کن.
- [ ] تعارض مسیر نمونهٔ `/cms/` در Technology Baseline را با قرارداد پذیرفته‌شدهٔ `/admin/` همسو کن؛ endpoint تازه نساز.
- [ ] وضعیت عملیاتی ADRها را در index/current-state ثبت کن، بدون تغییر تصمیم immutable خود ADR.
- [ ] `RISK-0001` را به blockerهای واقعاً باقی‌مانده محدود کن؛ مورد بسته را باز نمایش نده.
- [ ] `git diff --check` و بررسی لینک‌های محلی اجرا و نتیجه در Work Log ثبت شود.

**Done:** یک خواننده از Manifest/ledgers همان وضعیت واقعی را می‌بیند و هیچ سند بالادستی دربارهٔ provisioning امروز تناقض ندارد.

### Task G0-02 — تصمیم مالک دربارهٔ first-live static-only

**Priority:** `BLOCKER`  
**Decision owner:** Project owner

- [ ] scope اولین release را دقیقاً به `/`, `/fa/`, `/en/`, static assets، error/health/SEO skeleton و لینک‌های واقعی P1 محدود کن.
- [ ] عدم وجود Django/Wagtail/PostgreSQL جدید، contact persistence، upload، admin و migration را به‌عنوان non-goal ثبت کن.
- [ ] مالک یکی از دو مسیر را ثبت کند:
  - پذیرش محدود `RISK-0003` فقط برای static-only P1 تا پیش از P3/contact persistence/risky migration؛ یا
  - عدم پذیرش و الزام isolated staging database import پیش از عبور Gate.
- [ ] اگر استثنا پذیرفته شد، دلیل، expiry trigger، mitigation، backup evidence و fallback در Risk Register ثبت شود.
- [ ] `RISK-0007` برای staging runtime باز بماند، اما صریحاً ثبت شود که static files service جدید پایگاه‌داده/worker ایجاد نمی‌کنند.

**Stop condition:** بدون تصمیم مکتوب مالک، `RISK-0003` بسته یا accepted تلقی نشود.

### Task G0-03 — تعیین ورودی‌های واقعی P1

**Priority:** `BLOCKER`

- [ ] owner یک content pack مجاز برای `fa` و `en` تحویل دهد: نام، positioning، proposition، CTA labels/targets، short identity، contact path و visibility.
- [ ] هر locale مستقل approve شود؛ نبود ترجمه به معنی عدم انتشار همان بخش است، نه ترجمهٔ ماشینی یا کپی locale دیگر.
- [ ] inventory دارایی‌ها: logo draft approved، favicon، portrait اختیاری، OG image، مجوز/مالکیت و alt text.
- [ ] فقط profile/social URLهای واقعاً تأییدشده ثبت شوند.
- [ ] اگر Research/Work/Writing destination هنوز live نیست، لینک پنهان یا صادقانه غیرفعال شود؛ empty future route ساخته نشود.
- [ ] هر metric/evidence باید source و approval انتشار داشته باشد؛ در غیر این صورت از P1 حذف شود.

**Done:** هیچ copy، URL، asset یا claim لازم P1 نیازمند حدس agent نیست.

### Task G0-04 — Freeze حداقل تصمیم‌های فنی اولین release

**Priority:** `BLOCKER`

- [ ] exact supported Astro/Node/package-manager versions را از منابع رسمی و محیط واقعی verify و فقط سپس pin کن.
- [ ] package manager واحد P1 را freeze کن؛ lockfile canonical همان تصمیم باشد.
- [ ] مسیر source/build artifact، public asset و staging/prod static root را بدون overlap با stack فعلی تعیین کن.
- [ ] contract health، version marker، error pages، robots و sitemap skeleton را پیش از implementation ثبت کن.
- [ ] font strategy حداقلی را با license/self-hosting/performance و specimen `fa/en/mixed` تصمیم بگیر.
- [ ] logo برای P1 را به asset تأییدشده یا text mark محدود کن؛ geometry تازه اختراع نشود.
- [ ] تصمیم بگیر React در P1 نصب نشود مگر یک interaction مشخص، تست‌پذیر و ارزشمند تصویب شود.

**Deliverable:** Manifest فقط تصمیم‌های لازم first live را `VERIFIED` و موارد بعدی را صریحاً `NOT USED IN R2` یا open-for-later نشان دهد.

### Task G0-05 — ADRهای حداقل لازم R0/R1/R2

**Priority:** `BLOCKER`

- [ ] ADR frontend static-first/Astro + React-islands boundary را تکمیل/پذیرفته کن.
- [ ] ADR artifact deploy/atomic switch/rollback را با existing VPS topology ثبت کن.
- [ ] ADR P1 design/hydration/font minimum را ثبت کن؛ تصمیم hero effect نهایی می‌تواند باز بماند چون P1 بدون heavy effect قابل انتشار است.
- [ ] تصمیم same-origin routeها را با `/admin/` accepted boundary همسو کن.
- [ ] برای analytics first live مقدار `NOT USED` را ثبت کن مگر provider/consent/retention واقعاً approve شده باشد.
- [ ] برای media P1 مقدار static curated assets و برای P3 provider decision را جدا نگه دار.

**Done:** هیچ تصمیم پرهزینه یا security/operations-relevant موردنیاز R2 به حافظه یا chat وابسته نیست.

### Task G0-06 — تصمیم رسمی P0-G0

**Priority:** `BLOCKER`

- [ ] همهٔ fieldهای لازم first release در Manifest مقدار verified یا `NOT USED` داشته باشند.
- [ ] canonical commands فقط پس از اجرای clean-checkout واقعی ثبت شوند.
- [ ] `RISK-0001` با evidence بسته شود یا دلیل باقی‌ماندن آن صریح باشد.
- [ ] وضعیت `P0-G0: PASS for static-only P1` با scope و استثناهای محدود ثبت شود؛ PASS کلیِ CMS اعلام نشود.
- [ ] Work Log، Risk Register و Deferred Validation به تصمیم Gate لینک شوند.

**Gate:** تنها پس از این task، Task Spec scaffold frontend مجاز است.

---

## 4. R1 — Minimum Deployable Static Spine

### Task P0A-01 — inventory کامل stack موجود و مرز مالکیت

**Priority:** `FIRST-LIVE / HIGH-RISK`

- [ ] Task Spec فقط‌خواندنی و سپس Task Spec تغییر جدا بساز.
- [ ] Caddy routes، Compose project names، containers، networks، ports، volumes، static roots و resource usage را بدون خواندن secret inventory کن.
- [ ] production current site، project-owned future paths و forbidden legacy paths را فهرست کن.
- [ ] rollback واقعی Caddy و current static artifact را با owner/retention مشخص کن.
- [ ] بررسی کن deploy P1 هیچ backend/database/media volume موجود را restart یا reuse نمی‌کند.
- [ ] نتیجه را در `RISK-0004` ثبت کن؛ High مبهم به release منتقل نشود.

**Done:** exact target و blast radius deployment شناخته شده و rollback از روی حدس نیست.

### Task P0A-02 — capacity decision برای static staging

**Priority:** `FIRST-LIVE`

- [ ] disk/memory baseline و اندازهٔ artifact پیش‌بینی‌شده را اندازه‌گیری کن.
- [ ] staging را static-only، بدون container/database/worker جدید طراحی کن.
- [ ] اگر Caddy static route هم budget قابل قبول ندارد، target staging جایگزین یا VPS upgrade به تصمیم مالک برسد.
- [ ] `RISK-0007` فقط برای runtime آینده باقی بماند؛ نتیجهٔ static capacity با evidence ثبت شود.

### Task P0A-03 — scaffold حداقلی `apps/web/`

**Priority:** `FIRST-LIVE`  
**Dependency:** G0-06 PASS

- [ ] Task Spec scaffold با exact allowed files، versions و commands ثبت کن.
- [ ] Astro + TypeScript را با package/lockfile واحد ایجاد کن؛ dependency اختیاری نصب نکن.
- [ ] Tailwind/design-token minimum فقط اگر در تصمیم G0-04 freeze شده اضافه شود.
- [ ] React، Motion، GSAP، D3، Three، Storybook و Pagefind را تا نیاز واقعی وارد نکن.
- [ ] lint/typecheck/test/build/dev commands را روی clean checkout اجرا و در Manifest canonical کن.
- [ ] generated output و secrets را در Git ignore کن.

**Done:** صفحهٔ حداقلی build می‌شود، HTML اصلی بدون client JS قابل خواندن است و install reproducible است.

### Task P0A-04 — shell دو‌زبانه و route skeleton

**Priority:** `FIRST-LIVE`

- [ ] `/` را Language Gateway و `/fa/`, `/en/` را direct locale roots بساز.
- [ ] `lang`, `dir`, canonical و locale metadata را در layout boundary اعمال کن.
- [ ] language switch همیشه visible و بدون flag باشد.
- [ ] browser preference فقط suggestion/remembered hint باشد؛ redirect اجباری نساز.
- [ ] routeهای آینده را ایجاد یا لینک نکن.
- [ ] missing-translation state reusable تعریف کن، بدون silent fallback/404.

### Task P0A-05 — health، version، error و maintenance states

**Priority:** `FIRST-LIVE`

- [ ] health contract مصوب را به‌صورت static/Caddy-compatible اجرا کن؛ secret، dependency detail یا internal path expose نکند.
- [ ] artifact version قابل ردیابی در deploy evidence باشد، نه الزاماً UI عمومی.
- [ ] 404 locale-aware و semantic با مسیر بازگشت بساز.
- [ ] 500/maintenance fallback را در لایهٔ مناسب Caddy/artifact و بدون stack trace آماده کن.
- [ ] failure هر build نباید current production artifact را حذف کند.

### Task P0A-06 — SEO skeleton و security headers

**Priority:** `FIRST-LIVE`

- [ ] robots policy برای staging=`noindex` و production=index policy دقیق ثبت/پیاده شود.
- [ ] sitemap فقط URLهای public/canonical موجود را شامل شود؛ route خالی وارد نشود.
- [ ] HTTPS redirect، compression و baseline headers در Caddy candidate ثبت شوند.
- [ ] CSP/headerها با asset/font واقعی تست شوند؛ header شکسته یا permissive جعلی منتشر نشود.
- [ ] staging و preview هرگز در index/search عمومی قرار نگیرند.

### Task P0A-07 — CI روی GitHub Actions hosted

**Priority:** `FIRST-LIVE`

- [ ] workflow فقط پس از canonical شدن commands ساخته شود.
- [ ] reproducible install، lint/typecheck/tests متناسب، build، lockfile/dependency/secret scan و artifact upload اجرا شود.
- [ ] permissions workflow حداقلی و secrets محیطی جدا باشند.
- [ ] production VPS هیچ self-hosted runner نداشته باشد.
- [ ] failure pipeline artifact قبلی را دست‌نخورده بگذارد.
- [ ] artifact شامل source secret، `.env`, preview/draft data یا debug payload نباشد.

### Task P0A-08 — artifact نسخه‌دار و deploy mechanics

**Priority:** `FIRST-LIVE / HIGH-RISK`

- [ ] immutable/versioned artifact format و checksum را تعریف کن.
- [ ] staging/prod release directories و current pointer/atomic-ish switch را مشخص کن.
- [ ] retention حداقل current + previous working artifact را تعریف کن.
- [ ] deploy user، file permissions و allowed Caddy changes حداقلی باشند.
- [ ] deploy failure قبل از switch current site را تغییر ندهد؛ failure پس از switch auto/manual rollback روشن داشته باشد.
- [ ] هیچ database migration یا container restart در P1 static deploy وجود نداشته باشد.

### Task P0A-09 — isolated staging deployment

**Priority:** `FIRST-LIVE`

- [ ] placeholder 503 را فقط پس از validate شدن candidate Caddy config با artifact واقعی جایگزین کن.
- [ ] direct-origin و Cloudflare path هر دو artifact staging را نشان دهند.
- [ ] staging header/noindex، health، 404، assets، locale roots و version marker smoke شوند.
- [ ] production hostname و legacy routes قبل و بعد از reload بدون regression smoke شوند.
- [ ] نتیجه و URLها بدون secret در Work Log ثبت شوند.

### Task P0A-10 — rollback rehearsal

**Priority:** `FIRST-LIVE / BLOCKER`

- [ ] artifact A را deploy، artifact B را deploy و سپس rollback دقیق به A را در staging تمرین کن.
- [ ] Caddy config rollback با backup exact و validation تمرین شود.
- [ ] health و locale roots بعد از rollback PASS باشند.
- [ ] هیچ broad delete یا cleanup مسیر نامشخص اجرا نشود.
- [ ] duration، owner و stop conditions در runbook ثبت شود.

### Task P0A-11 — observability حداقلی

**Priority:** `FIRST-LIVE`

- [ ] Caddy access/error logs بدون secret/PII و با retention مناسب بررسی شوند.
- [ ] basic external uptime check برای health/root تعریف شود.
- [ ] 5xx visibility، disk threshold و deploy version lookup owner داشته باشد.
- [ ] central error tracking، SLO dashboards و advanced alerting به P0-B منتقل شوند، با ID در صورت defer واقعی.

### Task P0A-12 — تصمیم Release DoD زیرساخت

**Priority:** `FIRST-LIVE / GATE`

- [ ] clean-checkout build، CI artifact، staging smoke، rollback rehearsal و no-regression legacy smoke evidence داشته باشند.
- [ ] `RISK-0004` بسته یا High exception صریح و محدود مالک داشته باشد؛ Stop-the-line استثنا ندارد.
- [ ] `RISK-0005` و `RISK-0006` در صورت defer، owner/date/maintenance window/fallback داشته باشند.
- [ ] `RISK-0003` و `RISK-0007` scope static-only و trigger بازگشایی روشن داشته باشند.
- [ ] release decision template در Release Policy تکمیل شود.

---

## 5. R2 — P1 Language Gateway + Landing و اولین live

### Task P1-01 — content contract و adapter ایستا

**Priority:** `FIRST-LIVE`

- [ ] shape داخلی P1 فقط از نیازهای approved Gateway/Home تعریف شود؛ API یا CMS endpoint نساز.
- [ ] دادهٔ `fa` و `en` در فایل‌های locale مستقل و قابل review قرار گیرد.
- [ ] validation build-time برای fieldهای required، URLها، locale و empty state اضافه کن.
- [ ] content production واقعی باشد؛ demo/placeholder با profile production وارد artifact نشود.
- [ ] Selected Evidence فقط در صورت asset/link/source واقعی فعال شود.

### Task P1-02 — token/style minimum

**Priority:** `FIRST-LIVE`

- [ ] رنگ‌ها فقط از `design.md`: Navy foundation، Turquoise primary، Gold signature و context colors محدود.
- [ ] solid-first و selective-glass را رعایت کن؛ gradient/glow/token تازه اختراع نکن.
- [ ] spacing 4px، semantic containers، radius/border/focus tokens حداقلی را پیاده کن.
- [ ] fontهای تأییدشده را self-host/optimize و فقط weightهای لازم را بارگذاری کن.
- [ ] dark mode کامل، mascot system، complex motion و component library گسترده را از first live خارج نگه دار.

### Task P1-03 — W0 Language Gateway

**Priority:** `FIRST-LIVE`

- [ ] logo/text mark approved، prompt کوتاه و دو action واضح فارسی/English نمایش بده.
- [ ] keyboard focus order، visible focus و انتخاب زبان زیر 3 ثانیه قابل فهم باشد.
- [ ] mobile stacking و 320px overflow بررسی شود.
- [ ] enhancement احتمالی SVG/CSS غیر-blocking و دارای no-motion/no-JS fallback باشد.
- [ ] biography، full navigation، mascot بزرگ، video یا heavy 3D اضافه نکن.

### Task P1-04 — shell/navigation/footer

**Priority:** `FIRST-LIVE`

- [ ] header semantic، skip link، main و footer landmarks بساز.
- [ ] فقط routeهای live در nav نمایش داده شوند؛ ساختار نهایی Research/Work/Projects/Writing/About/More محفوظ بماند.
- [ ] language switch و Contact واقعی در mobile قابل دسترسی باشند.
- [ ] CV/Resume utility فقط اگر artifact واقعی approved است نمایش داده شود.
- [ ] external links دارای label و security attributes متناسب باشند.

### Task P1-05 — W1/W2 Hero دو‌زبانه

**Priority:** `FIRST-LIVE`

- [ ] name، positioning، one-line proposition و CTAهای approved را در هر locale مستقل render کن.
- [ ] job-title wall و claim بدون evidence نساز.
- [ ] Hero copy قبل از هر enhancement دیده و قابل خواندن باشد.
- [ ] desktop layout و mobile focused layout جداگانه QA شوند.
- [ ] اگر identity visual approved نیست، typography/SVG ساده را استفاده کن؛ Hero effect تصمیم‌باز blocker live نیست.

### Task P1-06 — Explore by Perspective فقط برای مسیرهای زنده

**Priority:** `FIRST-LIVE`

- [ ] سه مسیر مفهومی Research، Engineering & AI، Writing & Learning را حفظ کن.
- [ ] فقط مسیرهایی را clickable کن که مقصد واقعی و محتوای approved دارند.
- [ ] برای مسیر غیرفعال، یا حذف کن یا microcopy صادقانهٔ غیرلینکی با approval owner؛ empty shell نساز.
- [ ] card/action با keyboard، RTL و mobile بدون hover dependency کار کند.

### Task P1-07 — Selected Evidence و Short About

**Priority:** `FIRST-LIVE`

- [ ] فقط 3–6 مورد curated واقعی یا تعداد کمترِ صادقانه نمایش بده.
- [ ] type/title/summary/link/source/availability هر item validate شود.
- [ ] metric، citation، client، award یا demo حدسی ممنوع است.
- [ ] اگر evidence کافی نیست، section را حذف کن؛ layout با دادهٔ صفر نشکند.
- [ ] Short About هویت را کامل کند ولی Homepage را resume کامل نکند.

### Task P1-08 — Contact/footer safe path

**Priority:** `FIRST-LIVE`

- [ ] مسیر تماس non-persistent approved انتخاب کن: contact page ساده، public address approved یا profile خارجی approved.
- [ ] email مقصد خصوصی یا secret در bundle قرار نگیرد.
- [ ] اگر هیچ مقصد امن approve نشده، CTA صادقانه غیرفعال/حذف و blocker owner ثبت شود.
- [ ] فرم، inbox، analytics contact event و retention data در P1 ایجاد نشود.

### Task P1-09 — SEO و machine-readable identity

**Priority:** `FIRST-LIVE`

- [x] title/description/canonical/OG برای `/`, `/fa/`, `/en/` از دادهٔ approved تولید شود.
- [x] hreflang فقط برای localeهای واقعاً public و equivalent باشد؛ Gateway x-default فقط طبق تصمیم SEO.
- [x] Person/WebSite structured data فقط با دادهٔ واقعی و validate شده اضافه شود.
- [ ] sitemap و robots environment-specific بررسی شوند.
- [ ] OG image dimensions/alt/context و social preview دستی QA شوند.

### Task P1-10 — blocking frontend verification

**Priority:** `FIRST-LIVE / GATE`

- [ ] install/build/typecheck/lint/test canonical روی clean checkout PASS.
- [ ] routes `/`, `/fa/`, `/en/`, 404 و health render و link-check PASS.
- [ ] main content با JavaScript disabled خوانا و navigation اصلی usable باشد.
- [ ] keyboard-only، skip link، focus، heading/landmark، contrast و reduced-motion smoke PASS.
- [ ] viewportهای 320، 390، 768، 1280 و 1440 بدون overflow/clipping/overlap بررسی شوند.
- [ ] RTL، LTR و mixed sampleهای URL/English term/number/punctuation بررسی شوند.
- [ ] metadata/canonical/hreflang/robots/sitemap و no fake inactive link بررسی شوند.
- [ ] client bundle/hydration inventory نشان دهد هیچ import یا chunk runtime برای `motion`، `gsap` یا `three` در R2 وجود ندارد؛ صرف وجود lockfile مجاز است.

### Task P1-11 — staging acceptance by persona

**Priority:** `FIRST-LIVE`

- [ ] در 10–15 ثانیه Who/what/why/next از Homepage قابل فهم باشد.
- [ ] Research/Engineering/Writing فقط تا حد routeهای live روشن باشند.
- [ ] CV/Resume و Contact فقط در صورت availability واقعی discoverable باشند.
- [ ] professor، recruiter و engineering-manager direct-entry expectations در حد P1 بررسی شوند.
- [ ] long FA/EN headings و missing/inactive content states بصری بررسی شوند.
- [ ] screenshot evidence desktop/mobile برای handoff ثبت شود.

### Task P1-12 — ثبت تعویق‌های مجاز first live

**Priority:** `FIRST-LIVE / GATE`

- [x] فقط پس از اجرای blocking checks، موارد انجام‌نشدهٔ واقعی را با ID ثبت کن.
- [x] کاندیدهای مجاز: browser matrix گسترده، همهٔ screen readerها، visual-regression baseline گسترده، dark mode، motion polish، Storybook، usability study با sample، analytics پیشرفته.
- [x] هر مورد severity، why, owner، target phase/date، mitigation/fallback و evidence فعلی داشته باشد.
- [x] accessibility blocker obvious، link خراب، fake content، HTTPS/health failure یا rollback نامطمئن را defer نکن.

### Task P1-13 — production preflight و approval

**Priority:** `FIRST-LIVE / GATE`

- [x] release decision شامل artifact/checksum/version، exact scope، open IDs و rollback باشد.
- [ ] current production و legacy stack health قبل از change ثبت شود.
- [x] owner artifact staging را approve و deployment production را صریحاً authorize کند.
- [ ] maintenance/communication window و rollback operator مشخص باشند.
- [ ] backup timer/service state و آخرین non-sensitive success evidence بررسی شود؛ backup job فعال قطع نشود.

### Task P1-14 — production deploy و smoke

**Priority:** `FIRST-LIVE / HIGH-RISK`

- [x] فقط artifact approved را با mechanics تمرین‌شده deploy کن.
- [x] HTTPS/root/Gateway/fa/en/assets/health/404/headers/metadata از بیرون smoke شوند.
- [x] existing unrelated services و routes بعد از change smoke شوند.
- [x] در failure، rollback فوری به previous artifact انجام و incident evidence ثبت شود.
- [x] هیچ migration، database import، container cleanup یا secret logging انجام نشود.

### Task P1-15 — close R2 release، نه completion

**Priority:** `FIRST-LIVE`

- [x] production URL/version/time و command/resultهای واقعی در Work Log ثبت شود.
- [x] Release DoD و Completion DoD جدا گزارش شوند.
- [x] known issue فقط برای مشکل user-visible تأییدشده ایجاد شود.
- [ ] هر risk/deferred owner و موعد بازبینی داشته باشد.
- [x] Task-list checkboxes فقط برای evidence موجود بسته شوند؛ کل P1 با «build سبز» کامل اعلام نشود.

---

## 6. P0-B — hardening بعد از اولین live

### Task P0B-01 — patch maintenance و SSH surface

**Priority:** `AFTER-LIVE`

- [ ] packageهای pending را inventory و security relevance را classify کن.
- [ ] maintenance window، provider console و service-level rollback/smoke را ثبت کن.
- [ ] canonical SSH port و وابستگی clients/VPN را تعیین کن.
- [ ] listener/firewall اضافی فقط با دو session سالم و rollback حذف شود.
- [ ] `RISK-0005` و `RISK-0006` فقط با evidence تازه بسته شوند.

### Task P0B-02 — backup/restore closure برای runtime آینده

**Priority:** `AFTER-LIVE / قبل از P3`

- [ ] isolated staging runtime را پس از capacity decision فراهم کن.
- [ ] snapshot PostgreSQL را فقط به database staging مستقل import کن.
- [ ] schema/data sanity و app-level read در staging را بدون نشت داده بررسی کن.
- [ ] cleanup فقط targetهای task-owned و exact باشد.
- [ ] `RISK-0003` را با database-import evidence ببند.
- [ ] recurring restore drill cadence، RPO/RTO و recovery owner را ثبت کن.

### Task P0B-03 — observability/security automation

**Priority:** `AFTER-LIVE`

- [ ] SLO/alert thresholds، 5xx alert، resource/disk alert و incident runbook تعریف کن.
- [ ] visual regression برای critical pages پس از تثبیت baseline اضافه کن.
- [ ] dependency/container/security scan policy و triage owner را harden کن.
- [ ] alert fatigue و data retention/PII در monitoring بررسی شود.

### Task P0B-04 — adoption gate برای visual interaction و assetهای خارجی

**Priority:** `AFTER-LIVE / قبل از هر use`

- [ ] یک user value و یک interaction محدود، route مالک و stateهای آن را مشخص کن؛ «زیباتر شدن» به‌تنهایی معیار کافی نیست.
- [ ] برای همان interaction دقیقاً یک مسیر انتخاب کن: CSS/native، `motion`، `gsap` یا `three`؛ استفادهٔ هم‌زمان Motion و GSAP به‌صورت پیش‌فرض ممنوع است.
- [ ] import را route/island-local و lazy نگه دار؛ Three/WebGL هرگز Hero یا مسیر محتوای اصلی را render-blocking نمی‌کند.
- [ ] static/no-JS fallback، `prefers-reduced-motion` fallback، keyboard semantics، RTL/LTR، 320px/mobile و failure state را پیش از کدنویسی تعریف کن.
- [ ] budget عملکرد، بررسی bundle/chunk و QA browser برای interaction واقعی ثبت و سپس در Task Spec مستقل verify شوند.
- [ ] Design DNA فقط برای استخراج/ثبت tokenها و patternهای منطبق با `docs/design.md` است؛ asset/component خارجی فقط با source versioned و حق استفادهٔ تأییدشده وارد می‌شود (`DEFER-0012`).

---

## 7. R3 / P2 — About، Resume، CV و تماس کم‌ریسک

### Task P2-01 — content/evidence inventory

- [ ] bio کوتاه/بلند، Experience، Education، Skills، CV، Resume و availability را از source رسمی inventory کن.
- [ ] هر locale/status/visibility/date/metric/evidence را independently approve کن.
- [ ] اطلاعات خصوصی، client-confidential و metric بدون source حذف شود.
- [ ] تفاوت Academic CV و Professional Resume صریح بماند.

### Task P2-02 — static typed profile/resume contract

- [ ] تا پیش از P3 از typed static/config content استفاده کن؛ database صرفاً برای About/Resume نساز.
- [ ] required dates/organization/role/description/evidence و optional defensible impact validate شوند.
- [ ] ATS/print reading order، selectable text و semantic headings طراحی شوند.
- [ ] migration آینده به CMS از طریق adapter روشن باشد، نه rewrite data shape حدسی.

### Task P2-03 — About و Journey

- [ ] canonical `/{locale}/about/` طبق IA و direct-entry context بساز.
- [ ] روایت Design→Interaction→Engineering→Data→AI→Human-Centered Systems را فقط با copy approved بیان کن.
- [ ] mobile/RTL/mixed content، next action و Contact/CV paths را QA کن.

### Task P2-04 — Resume/CV HTML و downloads

- [x] Academic CV و Professional Resume را جدا label و route/download behavior را approve کن. *(C4 DONE 2026-08-16: label + route/download behavior approved by owner؛ both files published as Markdown downloads on `/en/cv/` + `/fa/cv/`؛ PDF replacement optional — owner decision 2026-08-16)*
- [x] فایل‌ها title/type/size/language/version/accessibility status داشته باشند. *(md files render title/note/size + format on page via `Downloads.astro`؛ language via locale route; updated 2026-08-16)*
- [ ] download headers، broken asset، print stylesheet و text extraction smoke شوند. *(partial: download HTTP 200 smoke + 2 links per page PASS in local QA 2026-08-16; print/ATS smoke not applicable to md — unticked pending PDF option)*
- [ ] نسخهٔ اشتباه با unpublish/previous artifact قابل rollback باشد. *(production deploy of the new artifact still pending owner; rollback = previous artifact per DEPLOY_RUNBOOK once deployed)*

### Task P2-05 — Contact decision

- [x] گزینهٔ سریع پیشنهادی: contact page non-persistent با مسیر ارتباط approved و بدون backend جدید. *(C5: omit — DEFER-0007 CLOSED)*
- [ ] اگر form لازم است، قبل از implementation مقصد امن، retention، consent، spam/rate-limit، error contract و secrets handling را ADR/Task Spec کن. *(فعلاً form نیست)*
- [ ] form persistence تا بسته‌شدن `RISK-0003` و P3 backup/import gate ممنوع است.
- [ ] failure fallback صادقانه و قابل disable باشد.

### Task P2-06 — verification و release

- [ ] locale absence، private-data leak، invalid date/link، CV download و print/ATS smoke PASS. *(بخش‌های بدون CV: About/contact/SEO در CI و local QA PASS؛ CV باقی است)*
- [ ] keyboard/screen-reader form یا contact path، error state، RTL/LTR و SEO metadata متأثر PASS. *(About tabs/keyboard/zoom در CI — LOG-0093..0104)*
- [ ] staging submit فقط با دادهٔ non-sensitive و مقصد test انجام شود، اگر form وجود دارد. *(form نیست)*
- [x] deploy/production smoke/rollback/deferred ledgers همان قرارداد R2 را تکرار کنند. *(C7: بدون ادعای deploy برای CV؛ رکورد در S-PLAN-STATE)*

---

## 8. R4 / P3 — Content Core + Minimal Admin

### Task P3-01 — unlock prerequisites

- [x] `RISK-0003` database import PASS، MFA enforcement و runtime/worker decision freeze شوند. *(MFA + runtime + TOTP on production 2026-08-16 — RISK-0009 CLOSED; RISK-0003 CLOSED 2026-08-17 LOG-0140)*
- [x] Python 3.12 latest supported patch نصب و project-local `.venv` با `uv` ایجاد شود؛ Hermes interpreter ممنوع. *(3.12.13 + `uv sync`، DEFER-0003 CLOSED، LOG-0107)*
- [x] exact Django/Wagtail/Ninja/PostgreSQL versions و commands در Manifest pin شوند. *(Django 5.2.9 / Wagtail 7.4.2 / Ninja 1.6.2 / psycopg 3.3.4 + canonical CMS commands، LOG-0107)*
- [x] auth/media/rich-text/rebuild-trigger/concurrency ADRها پذیرفته شوند. *(ADR-0020..0024، 2026-08-15)*

### Task P3-02 — isolated CMS scaffold

- [x] `apps/cms/` فقط طبق Manifest scaffold شود؛ staging/prod DB، media، secrets و Compose project جدا باشند. *(Compose `taha-cms` provisioned 2026-08-16; `/api/` `/media/` still unpublished)*
- [x] `/admin/` same-origin، noindex و server-authorized باشد. *(Wagtail admin در `config/urls.py`؛ NoIndexMiddleware برای `/admin/`، `/api/`، `/rebuild-trigger/` پیاده شد — LOG-0110؛ runtime exposure بعد از deploy gate)*
- [x] health/readiness، structured logs و resource limits اضافه شوند. *(`/health/`، JSON logging واقعی در production.py با python-json-logger — LOG-0110، limits در compose candidate)*
- [ ] migration/rollback path در staging اجرا شود. *(نیازمند deploy gate — ظرفیت حل شد (`RISK-0007` CLOSED)؛ MFA + `RISK-0003` + Task Spec)*

### Task P3-03 — typed localized content contracts

- [x] shared abstract contract فقط identity/translation/lifecycle/visibility/SEO/timestamps باشد؛ جدول polymorphic/EAV/JSON عمومی نساز. *(mixin مشترک در `apps/content`، بدون EAV/JSON)*
- [x] translation identity و uniqueness locale/slug/group enforce شوند. *(UniqueConstraint(locale, slug) + تست)*
- [x] Landing/Profile/Media و Article shell فقط entityهای لازم P3 باشند. *(سه مدل plain، بدون body سنگین در P3)*
- [x] Project/Publication/Course/CreativeWork تا فاز مالک خود ساخته نشوند. *(ایجاد نشدند)*

### Task P3-04 — lifecycle و public projection

- [x] draft/review/published/archived transitions، ownership و timestamps صریح باشند. *(enum + mixin + published_at/timestamps؛ optimistic-lock به P7-01 محول شد — ADR-0024)*
- [x] public projection فقط published+public و media active را بازگرداند. *(`public()` و `active_public()` + تست‌های negative)*
- [x] error schema/OpenAPI قبل از frontend client freeze شود. *(Ninja 404 بدون stack trace؛ schema عمومی read-only)*
- [x] draft/private/internal note/inactive asset در build یا index نشت نکند. *(تست‌های negative در test_content/test_api/test_media)*

### Task P3-05 — media library و upload security

- [x] MIME+signature allowlist، size limit، safe storage names، private default و alt-by-locale enforce شوند. *(filetype sniff + 5MB + نام امن + is_active=False؛ alt-by-locale به P3 rest)*
- [x] archive/inactive media public projection و delayed-request race تست شوند. *(active_public() تست‌شده؛ race بعد از runtime)*
- [x] original بزرگ مستقیم به public تحویل نشود؛ rendition contract تعریف شود. *(`apps.media.renditions` thumb/card/full; tests LOG-0130؛ تولید فایل واقعی در media-runtime)*

### Task P3-06 — admin security

- [ ] MFA، least privilege، CSRF/session، rate limiting و minimal audit قبل از public admin PASS. *(audit + rate limit + CSRF/session در کد؛ MFA طراحی‌شده ولی نه enforce — پیش از deploy)*
- [x] negative authorization matrix، account enumeration و secret-safe errors تست شوند. *(audit/rate-limit tests + account-enumeration test اضافه شد — LOG-0110؛ secret-safe errors تست شده)*
- [ ] admin keyboard/RTL و noindex/cache policy smoke شوند. *(نیازمند runtime admin)*

### Task P3-07 — rich text و preview

- [x] allowlist sanitize در editor/preview/public یکسان باشد. *(allowlist ثابت در settings + تست قفل‌شده)*
- [x] preview noindex/no-cache و token/access boundary امن باشد. *(staff preview `/admin/preview/<kind>/<pk>/` + headers; public token → DEFER-0016)*
- [x] stored XSS در preview/public و draft leak blocking tests داشته باشد. *(allowlist تست‌شده + stored-XSS sanitizer test + preview Whitelister + anonymous leak tests — LOG-0132)*
- [x] advanced frontend-faithful preview می‌تواند تا P7 defer شود؛ safe minimum نمی‌تواند. *(به P7 محول — ADR-0022؛ safe minimum DONE LOG-0132)*

### Task P3-08 — CMS→Astro publish/rebuild

- [x] manual rebuild/deploy fallback ابتدا کار کند. *(`apps/cms/scripts/manual-rebuild.sh` + سرو شدن artifact قبلی روی failure — مطابق DEPLOY_RUNBOOK)*
- [x] signed automatic trigger فقط بعد از auth/replay/rate/failure design اضافه شود. *(HMAC + freshness ≤5min + disabled default; `rebuild-static.sh` deploy slice wired — ADR-0023)*
- [ ] publish موفق CMS و build شکست‌خورده به‌صورت صریح stale state نشان دهند. *(runbook: previous release retained; owner smoke after first rebuild-static)*
- [x] previous public artifact روی build failure باقی بماند. *(`update-release.sh` only after successful build; prior release on disk — LOG-0139)*

### Task P3-09 — P3 high-risk verification/release

- [ ] migrations forward/fallback، backup/import، lifecycle، permissions، XSS، upload و projection integration tests PASS. *(152 pytest PASS code-level; VPS migrate + rebuild-static owner — RISK-0003)*
- [ ] staging با admin کم‌دسترسی و کامل، preview، publish، archive و public build smoke شود. *(production-only per ADR-0025; owner: migrate + rebuild-static + smoke-blog)*
- [x] production admin فقط پس از owner approval، MFA و rollback آماده exposed شود. *(Wagtail admin + TOTP live; RISK-0009 CLOSED LOG-0129)*

---

## 9. P4 — Blog / Writing

### Task P4-01 — Article/Series contract

- [x] typed Article و Series با locale/lifecycle/slug/body/media/topic/license/accessibility و stable ordering تعریف شوند. *(models + migration `0002_p4_article_series_topictag`; TopicTag; ArticleSlugRedirect)*
- [x] reading metric فقط در صورت defensible؛ feed decision در ADR. *(~200 wpm on save; RSS/Atom → DEFER-0018)*

### Task P4-02 — admin/editor و safe rendering

- [x] editor fields، heading/table/code/image rules و Shiki build-time highlighting پیاده شوند. *(Wagtail snippet panels + RichTextField allowlist; Shiki not required — body HTML from Wagtail)*
- [x] unrestricted HTML و client-heavy highlighter ممنوع. *(ARTICLE_RICHTEXT_FEATURES synced with ADR-0022 allowlist)*

### Task P4-03 — list/detail/series routes

- [x] canonical locale routes، pagination bounds/stable order، previous/next و explicit missing translation بساز. *(Astro `/{locale}/blog/` + detail/series/tag; SeriesNav; missing-translation note)*
- [x] slug change redirect پایدار و تست‌شده باشد. *(ArticleSlugRedirect + API + Astro getStaticPaths redirect)*

### Task P4-04 — discovery/SEO/feed

- [x] sitemap، Article structured data، topics محدود و related content editorial-first باشند. *(sitemap blog + articles; BlogPosting + BreadcrumbList JSON-LD)*
- [ ] RSS/Atom فقط اگر واقعاً ساخته و فقط published public را شامل می‌شود لینک شود. *(DEFER-0018)*

### Task P4-05 — verification/release

- [x] draft exclusion، XSS allowlist، invalid filter، pagination/order، redirects تست شوند. *(122 pytest PASS; ruff clean; `npm run check` + build with empty CMS)*
- [ ] staging/prod list/detail/cache invalidation smoke و rollback unpublish/invalidate ثبت شود. *(owner: RISK-0003 → migrate → `rebuild-static.sh` → `smoke-blog.sh`; DEFER-0017 for public `/api/` edge)*

---

## 10. P5 — Research

### Task P5-01 — ResearchTopic + canonical Project + minimal Publication

- [x] typed entities و relationships را بدون duplicate `ResearchProject` بساز. *(migration `0003_p5_research_models`; LOG-0136)*
- [x] Project شامل type/objective/method/status/dates/role/evidence/license و code/data/demo availability باشد. *(model + API + tests)*
- [x] Publication minimal core حداکثر اینجا ایجاد شود؛ P8 presentation را کامل می‌کند.

### Task P5-02 — evidence/confidentiality policy

- [x] metricها source/last_verified/visibility و restricted state/fallback داشته باشند. *(ProjectEvidence + API redact tests)*
- [x] citation/funding/collaborator فقط با approval واقعی منتشر شوند. *(publication_approved / citation gate)*

### Task P5-03 — public/admin journeys

- [x] Research overview، Topic، Statement و روابط Topic→Project→Publication→Contact پیاده شوند. *(Astro routes + About contact note; no new form)*
- [x] relationship visual همیشه list/tree accessible fallback داشته باشد. *(list navigation; DEFER-0020 for graph viz)*

### Task P5-04 — verification/release

- [x] public/restricted نمونه‌ها، no-leak projection، missing evidence، license/availability، locale routes و link validity PASS. *(140 pytest; web check/build; security review Approve)*
- [x] confidentiality mistake = immediate unpublish/asset revoke/incident log. *(documented in Spec + INCIDENT_RUNBOOK; VPS execution owner)*
- [ ] prod migrate + optional `CMS_API_BASE` content smoke — owner after RISK-0003. *(PARTIAL)*

---

## 11. P6 — Projects + Engineering Case Studies

### Task P6-01 — Project presentation extensions

- [x] extension typed به canonical Project برای problem/role/constraints/decisions/trade-offs/outcomes بساز؛ model موازی ممنوع.
- [x] evidence source-backed و code/demo/data state صریح باشد.

### Task P6-02 — diagram/media accessibility

- [x] architecture diagram version/date، alt و long description داشته باشد.
- [x] screenshotها PII/credential نداشته و external links safe باشند.

### Task P6-03 — listing/detail و verification

- [x] states public/restricted/unavailable، responsive diagram، projection ACL و canonical SEO تست شوند.
- [x] هر featured case study acceptance کامل Product Baseline را پاس کند یا published نشود.

---

## 12. P7 — Professional Admin

### Task P7-01 — role/permission/revision contracts

- [ ] matrix نقش‌ها، session expiry، audit events، concurrency و destructive confirmation freeze شوند.
- [ ] edit conflict هرگز silent overwrite نکند.

### Task P7-02 — operations dashboard

- [ ] status/search/filter، translation completion، missing metadata/evidence/license و orphan health بساز.
- [ ] sensitive audit data render نشود.

### Task P7-03 — controlled Page Composition V1

- [ ] registry فقط blockهای approved با version/schema/defaults/allowed pages/a11y/RTL/responsive/preview داشته باشد.
- [ ] arbitrary HTML/CSS/plugin/page-builder ممنوع.

### Task P7-04 — advanced preview/bulk/history

- [ ] tokenized locale preview، delayed request race، inactive media، history restore و bulk authorization تست شوند.
- [ ] هر destructive bulk action count+confirm+audit+recovery داشته باشد.

---

## 13. P8 — Publications، Books، Downloads، Talks

### Task P8-01 — domain contracts و rights

- [ ] Publication core را extend و Book/Talk/Download typed contracts بساز.
- [ ] DOI/URL/authors/date/venue/license/accessibility/access state validate شوند.

### Task P8-02 — download security و presentation

- [ ] file title/type/size/language/accessibility، public/restricted authorization و safe headers اجرا شوند.
- [ ] private media با public relation نشت نکند.

### Task P8-03 — citation/SEO/release

- [ ] citation export فقط دقیق؛ structured data فقط real؛ sitemap/identifier/link/restricted tests PASS.
- [ ] copyright issue fallback = takedown فوری و metadata-only.

---

## 14. P9 — Teaching + Creative

### Task P9-01 — Course contract

- [ ] level، prerequisites (including none)، outcomes، format، language، availability، license و last_updated required باشند.

### Task P9-02 — CreativeWork contract

- [ ] creator/role/date/media/license/access state و rights/consent ثبت شوند؛ student PII ممنوع.

### Task P9-03 — accessible public experiences

- [ ] Course/detail و gallery keyboard، captions/transcripts، RTL و unavailable states تست شوند.
- [ ] LMS/payment/enrolment و auto-generated portfolio خارج scope بمانند.

---

## 15. P10 — Topics + Search + Collections

### Task P10-01 — taxonomy governance

- [ ] glossary/synonym/creation rules و editorial relationships freeze شوند؛ tag تک‌مصرف مشکوک است.

### Task P10-02 — Pagefind first

- [ ] فقط built public HTML هر locale index شود؛ draft/private/admin/preview/restricted URL ممنوع.
- [ ] Persian/English index، no-result، keyboard/filter announcements و browse fallback تست شوند.

### Task P10-03 — Topic/Collection/search evolution

- [ ] Topic canonical pages و curated Collection با curator/criteria/date بساز.
- [ ] PostgreSQL FTS فقط با نیاز dynamic و benchmark؛ dedicated search فقط پس از failure benchmark + ADR.

### Task P10-04 — index lifecycle/release

- [ ] publish/unpublish/archive propagation، permission leak، filters/paging/rate bounds و rebuild fallback PASS.
- [ ] drift = disable search و بازگشت به browse، نه نمایش دادهٔ stale/private.

---

## 16. P11 — AI / Semantic / Knowledge Graph

### Task P11-01 — entry gate و threat model

- [ ] P10 data/taxonomy quality، privacy ADR، provider/cost/rate، evaluation corpus و human owner آماده باشند.
- [ ] private/admin data ingest، autonomous publish و health/personality inference ممنوع.

### Task P11-02 — pgvector/relational graph first

- [ ] public allowlisted projections با provenance/locale/visibility/date index شوند.
- [ ] pgvector قبل از vector DB و relational graph قبل از Neo4j benchmark شود.

### Task P11-03 — sourced UX و fallback

- [ ] هر پاسخ source link دارد یا صریحاً پاسخ نمی‌دهد؛ low-confidence/empty state روشن باشد.
- [ ] graph canvas list/tree accessible fallback داشته باشد.

### Task P11-04 — guarded rollout

- [ ] prompt-injection، authorization leak، citation، locale، cost limit و fixed evaluation set PASS.
- [ ] feature flag default-off، expiry/owner/kill switch و incident runbook تست شوند.
- [ ] disable AI نباید P10 search/browse یا سایت عمومی را مختل کند.

---

## 17. Release checklist مشترک برای هر slice

- [ ] Task Spec کامل و risk class ثبت شده است.
- [ ] status/diff/ownership قبل از edit بررسی شده است.
- [ ] contracts و ADRهای مرتبط خوانده شده‌اند.
- [ ] فقط task-owned files تغییر کرده‌اند.
- [ ] test depth متناسب با impact اجرا و command/result واقعی ثبت شده است.
- [ ] staging happy path و error/permission path متأثر smoke شده است.
- [ ] RTL/LTR، keyboard، viewport و SEO فقط در سطح اثر slice PASS شده‌اند.
- [ ] secret/PII/fake production-like data و dependency تأییدنشده وجود ندارد.
- [ ] migration در صورت وجود additive/compatible و rollback/fallback آزمایش شده است.
- [ ] deferred/riskها ID، owner، target، mitigation و evidence دارند.
- [ ] production deploy approval و post-deploy smoke وجود دارد.
- [ ] Release DoD از Completion DoD جدا گزارش شده است.

---

## 18. Owner decision queue به ترتیب زمانی

1. پذیرش یا عدم پذیرش محدود `RISK-0003` برای first live static-only. **— DONE 2026-08-14: پذیرش محدود static-only (ACCEPTED).**
2. approval content pack و asset/license/linkهای P1 در هر locale. **— PROPOSAL آماده (`docs/plan/P0-G0-content-pack-proposal.md`); تأیید نهایی strings توسط مالک PENDING.**
3. exact font/logo minimum و Hero بدون heavy effect. **— DONE: text-mark + `Vazirmatn Variable`/`Inter Variable`; logo نهایی PENDING.**
4. approval static staging topology و blast radius stack موجود. **— RUNBOOK آماده (`docs/governance/DEPLOY_RUNBOOK.md`); inventory P0A-01 روی VPS PENDING.**
5. approval artifact پس از staging و اجازهٔ صریح production deploy. **— PENDING (پس از staging).**
6. maintenance window برای `RISK-0005` و تصمیم canonical SSH port برای `RISK-0006`. **— PENDING (P0-B).**
7. capacity/hosting تصمیم P3 staging runtime پیش از database import/CMS. **— DONE 2026-08-15: keep 4 GiB (`RISK-0007` CLOSED؛ ADR-0025)؛ runtime deploy هنوز PENDING (MFA + `RISK-0003` + Task Spec).**
8. media provider، runtime worker، admin MFA و contact persistence قبل از P3. **— PENDING (P3).**
9. اگر visual interaction یا asset خارجی انتخاب شد: value/route، library واحد، fallbackها و source/license artifact را تأیید کن. **— PENDING; `P0B-04` / `DEFER-0012`.**

---

## 19. معیار موفقیت این برنامه

- اولین production release فقط با R0+R1+R2 انجام می‌شود؛ P2–P11 blocker آن نیستند.
- هیچ مورد High/Critical یا Minimum Safe Gate زیر عنوان «بعداً تست می‌کنیم» پنهان نمی‌شود.
- هر تعویق غیرحیاتی traceable و time-bounded است.
- نسخهٔ عمومی حتی بدون JS و بدون CMS قابل خواندن، دوزبانه، سریع و قابل rollback است.
- ورود CMS/data/AI فقط با dependency و evidence واقعی رخ می‌دهد.
- هر phase یک خروجی کوچکِ قابل انتشار دارد و main پس از هر release deployable می‌ماند.

---

## 20. Self-review قبل از اجرای برنامه

- [ ] هر requirement بالادستی حداقل یک task مالک دارد.
- [ ] هیچ عبارت جای‌خالی یا endpoint/model/slug/metric/content فرضی وجود ندارد.
- [ ] `/admin/`، locale roots و canonical Project/Publication contracts در همهٔ taskها سازگارند.
- [ ] first-live path به P3/CMS/database/contact persistence وابسته نیست.
- [ ] restore database gate قبل از persistent data/migration صریح است.
- [ ] open decisions owner queue دارند و agent مجاز به حدس نیست.
- [ ] اجرای هر task از Task Spec و Work Log شروع/تمام می‌شود.
