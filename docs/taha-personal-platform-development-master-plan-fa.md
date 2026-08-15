# نقشه راه اجرایی سایت شخصی طه محمدی

> **برای عامل‌های توسعه (Codex، Cursor و agentها):** این سند قرارداد اجرایی است، نه فهرست ایده‌ها. قبل از هر تغییر، `AGENTS.md` و ADRهای پذیرفته‌شده را بخوانید. یک عامل حق ندارد endpoint، نام جدول، فیلد DTO، slug، نقش کاربر، سرویس ابری یا فناوری را از روی حدس بسازد. اگر قرارداد وجود ندارد، ابتدا آن را در ADR/contract پیشنهادی ثبت و برای تأیید ارائه کند.

**محصول:** Personal Research, Professional & Knowledge Platform  
**هدف راهبردی:** سریع‌ترین انتشار امن و قابل‌اعتماد نسخه عمومی؛ سپس توسعه تدریجی با sliceهای کوچک، قابل‌آزمون و قابل بازگشت.  
**ترتیب ثابت:** P0 Deployment Foundation → P1 Landing → P2 About/Resume/Contact/CV → P3 Content Core + Minimal Admin → P4 Blog → P5 Research → P6 Projects/Case Studies → P7 Professional Admin → P8 Publications/Books/Downloads/Talks → P9 Teaching/Creative → P10 Topics/Search/Collections/Knowledge Layer → P11 AI/Semantic/Knowledge Graph.  
**اصل داده:** محتوای منتشرشده از CMS/دادهٔ تأییدشده می‌آید؛ متن نمونه فقط در development یا seed محافظت‌شده مجاز است و هرگز نباید خود را دادهٔ واقعی جا بزند.

## قاعدهٔ سرعت

**Release زودهنگام، به معنی Completion کامل نیست.** هر قابلیت می‌تواند پس از عبور از «حداقل گیت ایمن» منتشر شود و بهبودهای غیرحیاتی آن با شناسه، severity، مالک، موعد/فاز هدف، mitigation و وضعیت در `docs/status/` بمانند. موردِ defer شده هرگز نباید ناپدید شود.

**توقف خط (Stop-the-line):** افشای secret، دورزدن authentication/authorization، نشت draft/private data، migration مخرب بدون recovery، احتمال جدی data loss، crash production، اجرای upload مخرب، XSS/SQL injection بحرانی، یا backup/restore غیرقابل‌اعتماد. این موارد با risk acceptance عادی قابل انتشار نیستند.

| Severity | قاعدهٔ انتشار |
|---|---|
| Critical | انتشار مسدود است تا رفع و بازبینی مستقل. |
| High | مسدود است، مگر مالک با evidence و mitigation آن را صریحاً بپذیرد. |
| Medium | قابل defer با ثبت کامل در Risk Register. |
| Low | قابل defer با ثبت کامل در deferred validation. |

---

## 0. P0-G0 — Project Manifest & Architecture Lock

**این gate بخشی از P0 است، نه یک فاز جدید.** تا وقتی PASS نشده، هیچ application code، schema، endpoint یا dependency جدیدی نوشته نمی‌شود. کار مجاز پیش از PASS فقط inventory read-only، ADR پیشنهادی و تکمیل manifest است.

**خروجی لازم:** `PROJECT_MANIFEST.md` در ریشهٔ repository با مقادیر تأییدشده یا عبارت صریح `NOT USED`؛ agent حق ندارد مقدار خالی را با حدس پر کند.

```text
Repository and monorepo/multi-repo layout:
Backend: framework, language/version, package manager, source directory,
  test/lint/typecheck/run commands
Frontend: framework, language/version, package manager, source directory,
  test/lint/typecheck/build/run commands
Database: engine/version/migration tool
Cache, search and background jobs: approved service or NOT USED
Media storage and access model:
Authentication and admin authentication:
Reverse proxy/web server and deployment target:
CI provider, production domain, staging domain, local ports:
Approved environment variables and third-party services:
Forbidden technologies/services:
Canonical commands (copy/paste executable):
```

**PASS criteria:** صاحب پروژه یا ADRهای پذیرفته‌شده، تمام تصمیم‌های لازم برای اولین release را مشخص کرده‌اند؛ فرمان‌ها روی checkout واقعی تأیید شده‌اند؛ technology/service ناشناخته به‌عنوان تصمیم باز مانده و وارد کد نشده است.

---

## 1. قواعد ضدسردرگمی (برای همهٔ فازها)

### 1.1 ترتیب کار یک vertical slice

هر کار باید یک نتیجهٔ کوچکِ قابل مشاهده در سایت بسازد و این توالی را حفظ کند:

1. مسئله، actor، مسیر و معیار پذیرش را در issue/plan همان slice بنویسید.
2. وضعیت worktree، مستندات فعلی، قرارداد API و مدل دادهٔ موجود را بخوانید.
3. اگر قرارداد تغییر می‌کند: migration-compatible typed model → validation → admin/editor → API schema → public projection → frontend → preview را به همین ترتیب طراحی کنید.
4. تست رفتار شکست‌خورده را اضافه و اجرا کنید؛ کمینهٔ تغییر لازم را پیاده‌سازی کنید؛ تست را دوباره اجرا کنید.
5. lint/typecheck/build و عمق آزمون متناسب با ریسک را اجرا کنید؛ QA دستی staging را فقط برای مسیری که تغییر کرده انجام دهید.
6. نتیجه، اسکرین/لینک staging، فرمان‌های اجراشده و موارد باقی‌مانده را در `docs/status/WORK_LOG.md` ثبت کنید. هر ریسک یا آزمون انجام‌نشده باید در `docs/status/deferred-validation.md` وارد شود.
7. فقط فایل‌های متعلق به همان slice را commit کنید. انتشار پس از release gate مجاز است.

**اندازهٔ slice:** حداکثر یک قابلیت قابل بیان در یک جمله، یک migration مستقل، و یک مسیر کاربر. refactor نامرتبط، تغییر هم‌زمان API و طراحی گسترده، و «رفع همهٔ TODOها» ممنوع است.

### 1.1.1 قرارداد آغاز task برای agent

هر slice پیش از شروع باید از `docs/templates/TASK_SPEC_TEMPLATE.md` ساخته شود و این فیلدها را داشته باشد: Goal، Non-goals، Allowed files، Forbidden files، Contracts read/changed، Data migration، Tests to run، Acceptance criteria، Rollback/fallback، Risk level، و Handoff recipient. نبود هر فیلد، task را **Blocked** می‌کند؛ agent نباید با فرض‌های خود آن را پر کند.

### 1.1.2 Fast-track release

جریان استاندارد: `SPEC → CLASSIFY RISK → IMPLEMENT MINIMUM SLICE → BLOCKING TESTS → BUILD → STAGING/SMOKE → LOG DEFERRED → DEPLOY → PRODUCTION SMOKE → HARDEN LATER`.

برای تغییر low-risk مثل copy Hero، build + render + responsive smoke کافی است. برای auth، permission، publish lifecycle، upload، migration یا دادهٔ private، unit/integration/negative authorization tests و critical-path E2E لازم است. **عمق تست با impact شکست تعیین می‌شود، نه با سهمیهٔ ثابت نوع تست.**

### 1.2 قراردادهای غیرقابل مذاکره

- هیچ محتوای `fa` و `en` نباید جای یکدیگر را پر کند. فقدان ترجمه باید به‌صورت صریح (`missing translation`) مدیریت شود، نه fallback خاموش.
- هر ترجمه عضو یک هویت محتوایی مشترک است: `translation_group_id` یا مکانیزم معادلِ تأییدشده. uniqueness باید دست‌کم `(content_type, translation_group_id, locale)` و `(content_type, locale, slug)` را تضمین کند. canonical به URL همان locale اشاره می‌کند؛ hreflang فقط translationهای واقعاً published/public همان group را اعلام می‌کند.
- هیچ عدد impact، citation، funding، client، لینک demo یا مجوزی را اختراع نکنید. **Evidence اجباری است؛ عدد فقط در صورت واقعی، قابل دفاع و قابل انتشار بودن استفاده می‌شود.**
- هر Project، Publication و Creative Work باید وضعیت مجوز (`license`) و وضعیت دسترسی (`public | restricted | unavailable`) داشته باشد؛ مقدار `restricted` دلیل کوتاه و مسیر درخواست دسترسی دارد.
- UI عمومی باید بدون JavaScript برای محتوای اصلی قابل خواندن باشد، مگر جایی که در ADR استثنا ثبت شده است.
- auth، مجوز، secrets، validation سمت سرور، rate limit و escape/sanitization با UI جایگزین نمی‌شوند.
- پیام‌های خطا نباید stack trace، secret، شناسه داخلی یا وجود حساب کاربر را فاش کنند.

### 1.3 نقشهٔ محیط‌ها و داده

| محیط | کاربرد | داده | مجوز انتشار |
|---|---|---|---|
| `dev` | توسعهٔ محلی/agent | fake یا دادهٔ پاک‌سازی‌شده | خیر |
| `staging` | یکپارچه‌سازی و QA | دادهٔ non-sensitive و نماینده | خیر |
| `prod` | سایت عمومی | دادهٔ منتشرشده و backup‌شده | فقط از مسیر release |

- `.env.example` فقط نام متغیر و توضیح دارد؛ secret هرگز commit یا log نمی‌شود.
- production و staging باید database، media bucket/container، کلیدها و analytics جدا داشته باشند.
- migration مخرب مستقیم در prod ممنوع است: ابتدا additive migration، backfill قابل‌توقف، خواندن سازگار، سپس حذف در release بعدی.
- backup mechanism، retention و restore procedure باید پیش از نخستین انتشار وجود داشته و در ADR زیرساخت/runbook مستند باشند. full restore rehearsal برای release اولیهٔ بدون دادهٔ persistent ارزشمند می‌تواند به P0-B defer شود؛ اما پیش از ورود persistent CMS data، ذخیرهٔ Contact submission، یا نخستین migration دارای ریسک داده، restore rehearsal روی staging الزامی است.
- retention دادهٔ contact/analytics باید config، purge job یا procedure قابل اجرا، privacy-request workflow و runbook داشته باشد؛ حذف تنها ادعا نیست و نتیجهٔ اجرا audit می‌شود.

### 1.4 API و مدل داده

- OpenAPI/schema یا معادل پروژه مرجع حقیقت API است؛ frontend نباید shape پاسخ را حدس بزند.
- برای هر resource: شناسهٔ پایدار، `status`، timestamps، locale، ownership/visibility، validation و error shape مستند شود.
- endpointهای public فقط دادهٔ publishable را projection می‌کنند؛ draft، note داخلی، token، asset غیرفعال یا metadata خصوصی نباید نشت کند.
- تغییر breaking نیازمند ADR، نسخه/سازگاری انتقالی، migration test و برنامهٔ حذف دارد.
- slug باید یکتا، canonical، locale-aware طبق قرارداد و تغییر آن redirect پایدار داشته باشد. هر redirect test می‌خواهد.
- `ContentItem` نام یک **قرارداد مفهومی/abstract base یا shared mixin** است، نه مجوز ساخت جدول polymorphic/EAV یا JSON blob عمومی. Article، Project، Publication، ResearchArea، Course، CreativeWork، Book و Talk مدل/aggregate typed مستقل با validation اختصاصی هستند؛ shared contract فقط identity، locale/translation group، lifecycle، visibility، SEO و timestamps را فراهم می‌کند.
- هویت canonical پروژه فقط `Project` است. `project_type` (مثلاً research، engineering، ai، data، design یا experiment) و detail extensionهای typed، تفاوت‌ها را مدل می‌کنند. ساخت Resource جداگانه به نام `ResearchProject` ممنوع است مگر ADR صریحاً نیاز ناسازگار آن را اثبات کند.
- هستهٔ Publication حداکثر در P5 همراه با relationshipهای research ایجاد می‌شود؛ P8 فقط صفحات، citation/export، downloads و قابلیت‌های publication-facing را کامل می‌کند. هیچ P5 نباید به مدلی وابسته باشد که تا P8 وجود ندارد.

### 1.5 RTL/LTR، دسترس‌پذیری و SEO

- هر route محتوایی با `lang` و `dir` صحیح رندر می‌شود؛ RTL و LTR با CSS logical properties (`margin-inline` و مانند آن) پیاده‌سازی می‌شوند، نه hackهای چپ/راست.
- keyboard-only: ترتیب focus، focus-visible، skip link، modal، menu و فرم باید قابل استفاده باشد. کنتراست و semantic headingها در CI/QA سنجیده شوند.
- تصویر معنادار `alt` دقیق دارد؛ تصویر تزئینی alt خالی؛ PDF/download عنوان، نوع فایل و حجم دارد.
- برای هر صفحهٔ indexable: title، meta description، canonical، Open Graph، robots policy و در صورت ترجمه hreflang مبتنی بر دادهٔ واقعی. Sitemap فقط URLهای public/canonical را شامل می‌شود.
- بررسی baseline: 320px، 390px، 768px، 1280px و 1440px؛ عدم scroll افقی ناخواسته، clipping یا هم‌پوشانی لازم است.

### 1.6 امنیت و حریم خصوصی

- تمام ورودی‌ها در backend validate و outputها encode/sanitize می‌شوند. rich text فقط با allowlist ثبت‌شده و در preview و public یکسان رندر می‌شود.
- endpointهای admin: authentication، authorization، CSRF/session یا روش معادل، rate limiting و audit trail حداقلی دارند.
- upload: allowlist MIME و signature، محدودیت اندازه، نام ذخیره‌سازی امن، اسکن در صورت وجود زیرساخت، private-by-default و URL مجاز/امضاشده در صورت نیاز.
- فرم contact: honeypot یا CAPTCHA متناسب، rate-limit، validation، consent/retention و عدم افشای مقصد ایمیل.
- consent analytics اختیاری، privacy notice و امکان حذف/تماس برای داده‌های فرم پیش از فعال‌سازی analytics شخصی‌سازی‌شده لازم است.
- قبل از public production admin، MFA اجباری است؛ فقط اگر معماری واقعی امکان آن را ندارد، یک ADR دارای جایگزین هم‌سطح، زمان انقضا و تأیید مالک می‌تواند استثنا بدهد.

### 1.6.1 Feature flag policy

- هر flag دارای نام، هدف، owner، محیط مجاز، default (خاموش مگر ADR خلافش)، تاریخ انقضا/حذف، fallback و kill switch است.
- enforcement برای capability حساس server-side است؛ مخفی‌کردن UI flag امنیت ایجاد نمی‌کند.
- هر release flagهای منقضی یا بدون owner را بررسی می‌کند. flag موقت پس از rollout حذف می‌شود؛ flag دائمی فقط با ADR باقی می‌ماند.

### 1.6.2 Supply-chain security

- CI باید secret scanning، dependency audit، lockfile integrity/policy و license review dependency جدید را اجرا کند. اگر deployment containerized است، image/container scan نیز blocking است.
- dependency یا service جدید بدون Task Spec، ثبت در Manifest، دلیل/license و lockfile پذیرفته نمی‌شود؛ ADR فقط برای تصمیم معماریِ غیر بدیهی، پرهزینه برای بازگشت یا عملیاتی/امنیتی لازم است.

### 1.7 Testing، release gate و Definition of Done سراسری

**هر slice:** test depth با risk تعیین می‌شود: منطق/authorization/API contract باید unit یا integration/negative coverage مناسب داشته باشد؛ UI state component coverage می‌گیرد؛ E2E فقط برای critical journey تغییرکرده. تستی که صرفاً implementation detail را می‌سنجد کافی نیست.

**Release gate:**

موارد این Release Gate بر اساس release type، risk classification و scope همان slice طبق `docs/governance/RELEASE_POLICY.md` اعمال می‌شوند. بررسی‌های non-critical خارج از scope می‌توانند ثبت و defer شوند؛ Stop-the-line و Minimum Safe Gate قابل defer نیستند.

- [ ] diff محدود به scope و `git diff --check` پاک است.
- [ ] test/lint/typecheck/build تعیین‌شده برای تغییر اجرا شده و خروجی ثبت است.
- [ ] migration forward و مسیر rollback/fallback در staging بررسی شده است.
- [ ] مسیر عمومی و مسیر خطا/permission مربوطه در staging آزموده شده است.
- [ ] QA RTL/LTR، keyboard، viewport و metadata متأثر از همان slice انجام شده است.
- [ ] هیچ secret، PII، دادهٔ fake production-like یا dependency تأییدنشده وارد نشده است.
- [ ] deferred items، ریسک‌ها و مالک پیگیری ثبت شده‌اند.

**Release DoD:** حداقل گیت ایمن و معیارهای پذیرش slice برای ship pass شده‌اند؛ موارد non-critical باقی‌مانده کامل ثبت شده‌اند.  
**Completion DoD:** همهٔ معیارهای بلوغ آن فاز، hardening و deferredهای متعلق به آن با evidence بسته شده‌اند.  
**DoD هر فاز:** release و completion را جداگانه گزارش کنید. «تست محدود سبز است» نه به معنی Completion است و نه مجوز عبور از stop-the-line.

---

## 2. حاکمیت توسعه و Agent Strategy

### 2.1 `AGENTS.md` در ریشهٔ repository

قبل از P0 ایجاد و در هر فاز به‌روز شود؛ محتوای حداقلی آن:

1. معماری و فرمان‌های تأییدشدهٔ نصب/test/lint/build/run/deploy؛ از فرمان خیالی پرهیز شود.
2. مسیرهای مالکیت (`apps/cms/`, `apps/web/`, `infra/`, `docs/`, `tests/`) و ممنوعیت ویرایش فایل خارج از scope.
3. قراردادهای locale، visibility، content lifecycle، API errors، upload و preview.
4. policy worktree/branch، commits کوچک، و ممنوعیت commit کردن secrets، lockfile نامرتبط و خروجی build.
5. قالب گزارش agent: هدف، فایل‌های خوانده‌شده، تغییرات، تست‌های واقعاً اجراشده، نتیجه، ریسک/deferred، handoff.
6. «در صورت ابهام»: توقف در نقطهٔ تصمیم، پیشنهاد کوتاه با evidence، نه پیاده‌سازی فرضی.
7. مسیر و روش استفاده از `PROJECT_MANIFEST.md`، `docs/templates/TASK_SPEC_TEMPLATE.md`، `docs/status/WORK_LOG.md`، `docs/status/RISK_REGISTER.md`، `docs/status/deferred-validation.md` و `docs/status/TECH_DEBT.md`.
8. boundary typed entities و ممنوعیت ساخت EAV/polymorphic storage بدون ADR، نام canonical `Project` و translation identity.

### 2.2 ADRها

در `docs/adr/` با نام `NNNN-kebab-case.md` نگهداری شوند. هر ADR شامل Context، Decision، Alternatives، Consequences، Security/Privacy، Migration/Rollback، Status و تاریخ است.

ADRهای لازم پیش از یا در P0: runtime/deployment، domain/DNS/HTTPS، database، media storage، auth/admin boundary/MFA، observability/backups/SLO، i18n/URL/translation identity، rich-text/sanitization، analytics/consent/retention و feature flags. ADRهای بعدی فقط هنگام تصمیم غیرقابل‌بدیهی یا دارای هزینهٔ بازگشت ثبت می‌شوند.

### 2.3 Git، branch و worktree

- `main` باید deployable باشد. توسعه روی `feat/<phase>-<slice>` یا `fix/<area>-<issue>` انجام می‌شود.
- برای کار موازی از worktree جدا با branch جدا استفاده شود؛ دو agent نباید هم‌زمان یک فایل قراردادی را تغییر دهند.
- ابتدا `git status --short`، branch و diff بررسی شود. تغییرات dirty متعلق به کاربر هستند مگر خلافش ثابت شود.
- commit کوچک و conventional: `feat:`, `fix:`, `docs:`, `test:`, `chore:`. commit فقط task-owned files.
- merge/deploy بدون تأیید صریح صاحب پروژه ممنوع؛ rollback commit یا artifact نسخه‌دار باید در دسترس باشد.
- parallel track فقط وقتی شروع می‌شود که dependency آن PASS و ownership فایل‌ها جدا باشد: P0-A و P1 می‌توانند پس از G0 هم‌زمان جلو بروند؛ P0-B hardening بعد از go-live و P4 design-system hardening بعد از P3 نیز می‌توانند parallel باشند.

### 2.4 استاندارد کدنویسی و CI/CD

- formatter/linter/type checker رسمی هر stack در CI pinned باشد؛ dependency جدید دلیل، license، lockfile تغییر مرتبط و تفکیک صریحِ «installed / authorized / active» می‌خواهد. نصب به‌تنهایی مجوز import یا release نیست.
- نام‌ها و error codes پایدار و انگلیسی فنی؛ متن UI از i18n/content layer می‌آید؛ فارسی طبیعی و قابل ویرایش است.
- CI حداقل: install reproducible → lint/typecheck/tests متناسب با risk → build → secret/dependency/lockfile scan → artifact. staging deploy پس از عبور؛ prod deploy تنها از release قابل ردگیری.
- CI نباید با secret واقعی تست کند. health check پس از deploy، ثبت release/version و alert حداقلی خطای 5xx ضروری است. visual regression برای component/pageهای critical پس از تثبیت baseline به CI افزوده می‌شود؛ blocker بودن آن در manifest/ADR تعیین می‌شود، نه به‌صورت پیش‌فرض برای P1.
- observability policy باید availability target، error-rate threshold، minimum log fields، owner alert، RPO/RTO و restore cadence را ثبت کند. P0-A فقط basic logs/health/backup/rollback می‌خواهد؛ advanced monitoring و restore drills تکرارشونده در P0-B hardening هستند.

### 2.5 Design System Track

Design System یک track سراسری است، نه deliverable صرف P1: semantic tokens، typography، primitives/components، states، spacing، motion، responsive behavior، RTL/LTR و light/dark strategy در docs تصمیم می‌گیرند؛ source code فقط ارزش‌های اجرایی مصوب را نگه می‌دارد. P1 فقط minimum token/style baseline لازم برای live را می‌سازد. Dark mode، motion کامل، visual-regression baseline گسترده و component library پرحجم می‌توانند پس از P1/P3 harden شوند، اما هیچ صفحه‌ای نباید token یا RTL rule متناقض بسازد. `motion`، `gsap` و `three` ممکن است در lockfile موجود باشند، ولی تا interaction مشخص، Task Spec، fallback و performance evidence نداشته باشند active نیستند؛ Design DNA ابزار تحلیل agent است و Beautiful UI/UI8 DNA بدون source و use-right تأییدشده وارد محصول نمی‌شوند (`DEFER-0012`).

---

---

## 3. برنامهٔ فازها

### P0 — Deployment Foundation

**هدف:** یک Minimum Deployable Production Spine قابل تکرار برای build، deploy، health check و rollback بسازید؛ هنوز محصول پرمحتوا نسازید.

**Scope:** P0-G0 PASS؛ P0-A شامل environments، domain/HTTPS، database/media strategy، configuration/secrets، CI/CD، `/health`، error pages، basic logging، backup/rollback، و SEO skeleton (`robots`, sitemap skeleton) است. P0-B hardening شامل SLO/alerts پیشرفته، recurring restore drill، advanced analytics و visual/security automation است و نباید P1 را متوقف کند مگر risk Critical/High باشد.

**Out of scope:** طراحی کامل UI، CMS کامل، search، AI، دادهٔ تولیدی فراوان.

**Dependencies:** دسترسی domain/DNS، server/host و تصمیم‌های ADR زیرساخت. نبود این دسترسی blocker بیرونی است، نه مجوز جعل deploy.

**Deliverables:** `PROJECT_MANIFEST.md` PASS، `AGENTS.md`، ADRهای P0، `docs/templates/TASK_SPEC_TEMPLATE.md`، `docs/governance/RELEASE_POLICY.md`، `docs/status/{RISK_REGISTER.md,deferred-validation.md,TECH_DEBT.md,known-issues.md}`، runbook deploy/rollback/restore، `.env.example`، pipeline، health endpoint، staging و prod قابل تفکیک.

**Data/API/UI:** مدل داده فقط در حد نیاز health/config؛ endpoint health بدون secret و با contract؛ UI شامل 404/500 و maintenance/failed state طبق ظرفیت stack.

**Security/A11y/RTL/SEO:** headers پایه و HTTPS redirect؛ عدم log secrets؛ صفحه خطا semantic و دو‌زبانه در صورت پشتیبانی locale؛ canonical domain، robots و sitemap معتبر.

**Testing:** pipeline on clean checkout؛ deploy staging؛ smoke health؛ بررسی HTTPS/headers؛ وجود backup mechanism، مستند بودن restore procedure و آزمون rollback artifact؛ smoke 404/500. full restore rehearsal به P0-B defer می‌شود، مگر پیش از ورود persistent CMS data ارزشمند، ذخیرهٔ Contact submission، یا نخستین migration با ریسک داده؛ در آن سه حالت restore rehearsal پیش از release الزامی است.

**Deployment/Verification:** ابتدا staging از artifact نسخه‌دار deploy شود؛ health، error page و rollback در همان release ثبت شوند؛ prod فقط با تأیید مالک و health check پس از deploy.

**Acceptance/DoD:** G0 PASS است؛ یک commit نسخه‌دار از مسیر CI به staging deploy می‌شود، health پاسخ expected دارد، rollback به artifact قبلی ممکن و ثبت شده است؛ prod فقط پس از تأیید مالک publish می‌شود. P0-A Release DoD می‌تواند پیش از P0-B Completion DoD PASS شود.

**Risks / rollback:** misconfiguration یا migration failure → نسخهٔ قبلی artifact و config versioned، database restore فقط با runbook و تأیید؛ هیچ پاک‌سازی bucket/database در rollback انجام نشود.

**Handoff P1:** URLهای staging/prod، commands واقعی، constraints host، design tokens اولیه و یک checklist deploy ثبت شوند.

### P1 — Landing Page

**هدف:** یک صفحهٔ عمومی سریع، معتبر و قابل اشتراک که هویت، حوزه‌ها و مسیرهای اصلی را نشان دهد.

**Scope:** hero با معرفی واقعی و قابل ویرایش، CTAهای About/Resume/Blog/Contact (غیرفعال‌ها پنهان یا صادقانه labelled)، navigation/footer، responsive layout، social metadata، analytics رویدادهای حداقلی بدون PII.

**Out of scope:** timeline رزومه کامل، listing/blog engine، dashboard و animation سنگین.

**Dependencies:** P0-G0 PASS + حداقل نیازهای P0-A برای staging/live delivery (domain/HTTPS، deploy path، env/secrets، health، rollback artifact). Completion P0-B لازم نیست؛ هویت/تصویر/لینک‌های تأییدشده و سیاست locale نیز لازم‌اند.

**Deliverables:** route landing، token/style baseline، content source قابل تغییر، empty/loading/error states و screenshot QA.

**Data/API/UI:** اگر CMS هنوز آماده نیست فقط adapter/seed development با قرارداد واضح؛ production copy در config/content source تأییدشده، نه hardcode پراکنده. API جدید فقط اگر قرارداد P0 اجازه دهد.

**Security/A11y/RTL/SEO:** تصویر بهینه و alt؛ CTA خارجی `rel` مناسب؛ semantic landmark/heading؛ fa/en مستقل؛ title/description/canonical/OG؛ performance budget مستند (بدون ادعای عددی تاییدنشده).

**Testing:** render هر locale، link checks، keyboard nav، viewport matrix، metadata snapshot/inspection و smoke staging.

**Deployment/Verification:** در staging، مسیر `/`، assetها، metadata و CTAها بررسی شوند؛ پس از release، همان URLها و analytics بدون PII دوباره smoke شوند.

**Acceptance/DoD:** در prod یا staging تأییدشده، landing در موبایل و desktop بدون overflow کار می‌کند، تمام لینک‌های visible به مقصد واقعی می‌روند و محتوای غایب صادقانه نمایش داده می‌شود.

**Minimum Safe Gate for first live:** Hero و navigation کار می‌کنند؛ content واقعی است؛ link fake وجود ندارد؛ HTTPS، metadata پایه، responsive acceptable، no obvious accessibility blocker، build و production smoke pass هستند. dark mode، animation نهایی، CMS کامل، visual regression CI، browser matrix گسترده و QA همهٔ screen readerها شرط اولین release نیستند و در صورت نیاز ثبت defer می‌شوند.

**Risks / rollback:** asset یا copy نادرست → حذف/جایگزینی از source؛ regression layout → rollback artifact P0.  
**Handoff P2:** bio کوتاه/بلند، CV منبع، راه‌های تماس و قواعد visibility تأییدشده.

### P2 — About + Resume + Contact + CV

**هدف:** معرفی معتبر و مسیر تماس/استخدام قابل استفاده بدون افشای ناخواستهٔ داده.

**Scope:** About، رزومهٔ ساختاریافته، CV/download با metadata، contact form یا مسیر تماس مورد تأیید، consent و spam protection، redirectهای مسیرهای رسمی.

**Out of scope:** editor حرفه‌ای، import خودکار رزومه، CRM/newsletter، ادعاهای اثرگذاری بدون evidence.

**Dependencies:** P1 و منبع رسمی رزومه/CV، مقصد امن پیام‌ها و retention policy.

**Deliverables:** schema/validation typed برای profile, experience, education, skill, download/contact submission به اندازهٔ نیاز؛ صفحات public؛ email/notification runbook بدون نمایش secret. P2 می‌تواند از typed static/config content یا persistence موجود استفاده کند؛ ایجاد database persistence تازه فقط برای About/Resume ممنوع است مگر ADR پذیرفته‌شده آن را لازم کند. مالکیت CMS persistence با P3 است.

**Data/API/UI:** هر Experience: عنوان، سازمان، تاریخ معتبر، locale، visibility، description، evidence و `impact` اختیاریِ دفاع‌پذیر. contact API باید error codes عمومی، rate-limit و عدم enumeration داشته باشد؛ CV asset versioned، license/accessibility metadata دارد.

**Security/A11y/RTL/SEO:** server validation + rate limit/honeypot؛ هیچ email مقصدی در client bundle؛ labels/errors قابل‌خواندن screen reader؛ تاریخ محلی بدون ابهام؛ Resume schema/JSON-LD فقط با دادهٔ واقعی و قابل انتشار.

**ATS/Print:** رزومه باید selectable text، headingهای semantic، print stylesheet، ترتیب خواندن منطقی و بدون متنِ داخل تصویر داشته باشد. parser smoke باید متن، عنوان‌ها، تاریخ و تجربه‌ها را از HTML/print output مورد تأیید استخراج‌پذیر نشان دهد؛ ادعای سازگاری با یک ATS خاص ممنوع است مگر با evidence.

**Testing:** validation/error/rate-limit؛ permission/no leak؛ form keyboard and screen reader smoke؛ download header؛ locale absence؛ E2E submit با مقصد test؛ SEO metadata.

**Deployment/Verification:** migration/config مقصد تماس در staging با secret همان محیط بررسی شود؛ پس از deploy، یک ارسال کنترل‌شدهٔ non-sensitive و مسیر fallback بررسی و نتیجه ثبت شود.

**Acceptance/DoD:** کاربر می‌تواند رزومه را بخواند/دانلود کند و پیام معتبر ارسال کند؛ invalid/spam رفتار امن دارد؛ هیچ ادعای کمی یا اطلاعات تماس خصوصی بدون تأیید منتشر نیست.

**Risks / rollback:** spam/notification outage → disable form با contact fallback صادقانه؛ CV اشتباه → unpublish asset و restore نسخه قبلی.  
**Handoff P3:** مدل minimum content، نقش admin، lifecycle draft/review/published/archived و media policy.

### P3 — Content Core + Minimal Admin

**هدف:** حداقل CMS امن بسازید تا P4 به بعد از دادهٔ مدیریت‌شده، نه hardcode، تغذیه شوند.

**Scope:** authenticated admin محدود؛ media library حداقلی؛ localized content؛ lifecycle؛ preview امن؛ audit trail ساده؛ role admin; CRUD برای Content پایه و media.

**Out of scope:** page builder آزاد، workflow چندمرحله‌ای پیچیده، autosave حرفه‌ای، bulk import، roleهای سازمانی.

**Dependencies:** auth/media/rich-text ADR، P0 backups و P2 دادهٔ اولیه.

**Deliverables:** content contract registry، migrationها، admin routes، preview/public projection، media policy/runbook، editor guide.

**Data/API/UI:** یک shared base contract برای identity, locale/translation group, title, slug, summary, lifecycle, visibility, published_at, SEO و timestamps؛ به‌علاوه `Media {id, status, mime, size, alt_by_locale, owner}`. این shared base **جدول عمومی ContentItem نیست**. P3 فقط typed entityهای لازم برای landing/profile/media و article shell را می‌سازد؛ Project/Publication/Course و دیگر domainها مدل typed مستقل در فاز نیاز خود دارند. write API schema validation و optimistic/concurrency policy صریح دارد؛ public API فقط published+public و media active را نشان می‌دهد.

**Security/A11y/RTL/SEO:** admin authorization server-side؛ preview نه indexable و نه cache عمومی؛ rich content allowlist؛ upload policy؛ editor RTL/LTR؛ alt لازم پیش از publish؛ slug/canonical/locale validation.

**Testing:** lifecycle transitions، archive media race، draft leak، XSS stored/preview/public، permission matrix، validation، API projection، upload invalid types و browser admin smoke.

**Deployment/Verification:** migration ابتدا در staging و با backup بررسی شود؛ پس از deploy، public projection، preview و login admin smoke شوند؛ در failure، feature flag یا rollback سازگار فعال شود.

**Acceptance/DoD:** admin می‌تواند محتوای `fa` و `en` مستقل را draft/publish/archive کند؛ public فقط نسخه درست را می‌بیند؛ preview داده/HTML ناامن نشت نمی‌دهد؛ media archive در public ظاهر نمی‌شود.

**Risks / rollback:** bad migration/content publish → feature flag/admin disable، restore backup یا unpublish revision؛ schema breaking → compatibility read تا migration کامل.  
**Handoff P4:** Content Type `Article`، taxonomy حداقلی، template/detail/list contracts و seed صرفاً development.

### P4 — Blog / Writing

**هدف:** انتشار و کشف نوشته‌های قابل اعتماد با صفحه فهرست و جزئیات.

**Scope:** Article list/detail، status، author/date، topics/tags محدود، `Series` با ordering و previous/next/series landing، pagination، RSS/Atom در صورت تأیید ADR، related content مبتنی بر داده، code/quote/table rendering امن.

**Out of scope:** full-text search پیشرفته، newsletter delivery، comments، paywall، multi-author workflow.

**Dependencies:** P3، style rules متن، taxonomy و feed decision.

**Deliverables:** Article و Series typed models/API/public routes/admin editor fields، sitemap/feed integration و editorial checklist.

**Data/API/UI:** Article شامل title, summary, body, cover/media, topics, optional series reference/order, published_at, updated_at, reading metadata فقط در صورت defensible، license/accessibility. Series identity/title/summary/order policy و public visibility دارد؛ API list filter/pagination contract با bounds و stable ordering؛ slug redirect هنگام تغییر.

**Security/A11y/RTL/SEO:** sanitize MD/rich text؛ heading ladder، table captions، code scroll قابل استفاده، images alt؛ Article structured data فقط دقیق؛ canonical/hreflang; RSS تنها published public.

**Testing:** page/list/series pagination و order، draft exclusion، invalid filters، changed-slug redirect، feed validity، XSS، responsive typography، keyboard links، metadata/sitemap.

**Deployment/Verification:** پس از staging deploy، list/detail، redirect، sitemap و feed (اگر فعال است) از بیرون admin بررسی شوند؛ cache/invalidation نتیجه ثبت شود.

**Acceptance/DoD:** admin مقاله را در یک یا دو locale منتشر می‌کند؛ خواننده فهرست، جزئیات و فقط محتوای public را می‌بیند؛ مسیر ترجمهٔ غایب روشن است؛ RSS تنها در صورت پیاده‌سازی واقعی لینک می‌شود.

**Risks / rollback:** محتوای نامناسب → unpublish/revision؛ feed cache مشکل‌دار → invalidate/disable feed بدون حذف مقاله.  
**Handoff P5:** Research Topic، Project link، publication relationship و evidence schema.

### P5 — Research

**هدف:** agenda پژوهشی، حوزه‌ها و ارتباط Topic → Project → Publication → Contact را قابل فهم و قابل استناد کند.

**Scope:** research overview، topic detail، agenda/research statement مستقل، research projects، collaborators only if approved، evidence/citation/funding/impact fields با disclosure policy.

**Out of scope:** ادعای clinical validation، دادهٔ حساس research، repository خصوصی، graph visual پیچیده.

**Dependencies:** P3/P4، فهرست واقعی پروژه/استنادها و approval انتشار.

**Deliverables:** ResearchTopic، canonical Project و minimal Publication typed contracts، public/admin pages، evidence policy، relationship tests.

**Data/API/UI:** `Project` canonical: project_type, objective, methods summary, status, dates, role, outcomes/evidence, links, `license`, `data_availability`, `code_availability`, `demo_availability`, related topics/publications. `Publication` minimal typed core: authors, venue, date, identifier(s), links, visibility/license. فیلدهای confidentiality باید public projection امن داشته باشند؛ numeric evidence optional و source/last_verified لازم دارد.

**Security/A11y/RTL/SEO:** redact confidential fields؛ accessible relationship navigation علاوه بر visual؛ فارسی/انگلیسی مستقل؛ scholarly schema only when accurate; no fabricated citations.

**Testing:** visibility/projection، missing evidence state، restricted data/code state، relationship integrity، locale routes، public link validation.

**Deployment/Verification:** در staging با یک مورد public و یک مورد restricted، مسیرهای Topic/Project/Publication و عدم نشت دادهٔ محدود بررسی شوند؛ سپس release و smoke مشابه انجام شود.

**Acceptance/DoD:** هر پروژه public وضعیت code/data/license را صریح می‌گوید؛ Topic به resourceهای واقعی وصل است؛ Research Statement مسیر مستقل و قابل لینک دارد.

**Risks / rollback:** confidentiality mistake → immediate unpublish/asset revoke and incident log; inaccurate metric → remove and revise source.  
**Handoff P6:** shared Project entity boundary و case-study content template.

### P6 — Projects + Work Case Studies

**هدف:** قابلیت مهندسی و outcome واقعی را با context، trade-off و evidence نشان دهد.

**Scope:** project listing/detail، work case study template، architecture diagram asset، problem/role/constraints/decision/outcome/evidence، demo/code states، license/data/code availability.

**Out of scope:** live demo اجباری، source code اجباری، numbers invented، client-confidential detail.

**Dependencies:** canonical Project P5، approvals و media policy.

**Deliverables:** Project extension/CaseStudy presentation contract، diagram accessibility rules، public routes و editor fields؛ model موازی جدید ساخته نمی‌شود.

**Data/API/UI:** typed `EngineeringCaseStudyDetails` یا extension معادلِ تأییدشده به Project متصل است؛ `evidence[]` source-backed; `demo_availability` و `code_availability` states؛ architecture diagram must have text alternative and declared version/date; trade-offs are structured text, not decorative badges.

**Security/A11y/RTL/SEO:** external demos/code safe links; no credentials/screenshots with PII; diagram alt/long description; canonical project schema as accurate.

**Testing:** restricted/unavailable states، broken external links in CI where feasible، image/diagram alt، case-study rendering، ACL/public projection.

**Deployment/Verification:** staging باید حالت‌های code/demo public، restricted و unavailable را render کند؛ پس از deploy، assetهای diagram و لینک‌های بیرونی visible مجدداً بررسی شوند.

**Acceptance/DoD:** هر case study published حداقل problem، role، approach، trade-off، outcome/evidence و availability/license state دارد؛ non-public code/demo محترمانه توضیح می‌دهد.

**Risks / rollback:** confidentiality/claim error → unpublish and revoke media; diagram stale → show version/date and update asset.  
**Handoff P7:** operational needs discovered in editors, audit requirements, role expansion proposal.

### P7 — Professional Admin Panel

**هدف:** عملیات محتوا را سریع، ایمن و قابل بازبینی کند؛ نه اینکه CMS بی‌حدومرز بسازد.

**Scope:** dashboard، content/media search/filter، status views، revision/history مناسب، scheduled publish اگر قرارداد دارد، localized completion state، bulk actions محافظت‌شده، audit log، editor UX و Page Composition V1 محدود به blockهای approved.

**Out of scope:** arbitrary plugin marketplace، unrestricted HTML، Page Builder آزاد یا block/schema دلخواه، workflow سازمانی پیچیده، destructive bulk action بدون confirmation/recovery.

**Dependencies:** P3 رفتار واقعی کاربران/admin و ADR نقش‌ها/concurrency.

**Deliverables:** role/permission matrix، admin information architecture، audit/revision policy، operations guide و block registry/versioning/preview rules برای Page Composition V1.

**Data/API/UI:** commands have idempotency/concurrency handling; history captures relevant localized/version state; list filter contracts bounded; every destructive action confirmation + affected-count + audit event.

**Security/A11y/RTL/SEO:** least privilege، session expiry، CSRF، no sensitive audit rendering; admin keyboard/RTL parity; admin routes noindex/private.

**Testing:** permission matrix، concurrent edit conflict no overwrite، bulk-action authorization، history restore، inactive media، delayed request race، block schema validation/defaults/preview و critical admin E2E.

**Deployment/Verification:** admin release ابتدا در staging با نقش کم‌دسترسی و admin کامل smoke می‌شود؛ migration/revision rollback قابل آزمایش است؛ prod پس از پنجرهٔ انتشار تأییدشده.

**Acceptance/DoD:** admin قادر است محتوای P1–P6 را بدون database/manual deploy مدیریت کند و conflict یا destructive action به دادهٔ بی‌صدا آسیب نمی‌زند.

**Risks / rollback:** UX regression → feature flag/new UI opt-in; bad bulk action → revision/backup recovery according to runbook.  
**Handoff P8:** reusable content relation and download/license policy.

### P8 — Publications + Books + Downloads + Talks

**هدف:** خروجی‌های علمی/دانشی و حضورهای عمومی با attribution و accessibility قابل کشف شوند.

**Scope:** publication, book, download, talk models/list/detail؛ citation export only if accurate؛ DOI/URL validation; cover/media; license/access restrictions; downloadable files metadata.

**Out of scope:** citation count scraping خودکار، فروش/پرداخت، DRM، ادعای رتبه/impact بدون source.

**Dependencies:** Publication core P5، licensing policy، منابع معتبر publication و files approved.

**Deliverables:** contracts، templates، download access policy، citation formatting tests.

**Data/API/UI:** Publication has authors, venue, date, identifier(s), abstract/summary, links, `license`, `data_availability`, `code_availability`, source/verified date. Book/Talk similar evidence and availability. Files need type/size/language/accessibility status.

**Security/A11y/RTL/SEO:** validate external URLs; private assets never become public due to relation; PDF accessibility declaration honest; structured data only for real objects.

**Testing:** identifier/link validation، restricted download authorization، citation rendering، missing translation، public projection and sitemap.

**Deployment/Verification:** staging با یک فایل public و یک فایل restricted، header/download/access را بررسی کند؛ پس از deploy، sitemap و asset delivery عمومی smoke شوند.

**Acceptance/DoD:** هر item published citation/availability/license شفاف دارد و فایل قابل دانلود از نظر title/type/size/access با UI و HTTP contract درست عرضه می‌شود.

**Risks / rollback:** copyright issue → immediate takedown, replace with metadata-only; broken file → disable link and retain record.  
**Handoff P9:** Course and Creative schemas، prerequisite/difficulty vocabulary.

### P9 — Teaching + Creative

**هدف:** آموزش و کار خلاقانه را بدون مخلوط‌کردن با رزومه یا research نمایش دهد.

**Scope:** Course listing/detail، teaching material links، difficulty، prerequisites، format/language; creative work gallery/detail، license and attribution.

**Out of scope:** LMS، enrolment/payment، protected student data، auto-generated portfolios.

**Dependencies:** P3، taxonomy policy، consent/rights for student/media content.

**Deliverables:** Course/CreativeWork contracts، filters metadata، content guidelines.

**Data/API/UI:** Course required fields: title, level (`introductory|intermediate|advanced` or ADR vocabulary), prerequisites explicit (including none), format, language, availability; CreativeWork needs creator/role/date/media/license/access state. Search facets only after P10.

**Security/A11y/RTL/SEO:** no student PII; captions/transcripts for media where applicable; accessible gallery keyboard behavior; accurate educational/creative metadata.

**Testing:** prerequisite/difficulty required validation، media alt/caption state، ordering/filter contract readiness، locale absence, right-to-left gallery layout.

**Deployment/Verification:** staging باید یک Course و یک Creative Work در هر حالت دسترسی لازم نمایش دهد؛ بعد از deploy، gallery keyboard و routeهای locale smoke شوند.

**Acceptance/DoD:** کاربر سطح و پیش‌نیاز هر Course را می‌بیند؛ هر Creative Work license/credit و access state دارد؛ هیچ دادهٔ دانشجو بدون consent منتشر نیست.

**Risks / rollback:** rights issue → remove media while retaining safe metadata; inaccessible media → label and correct before claiming accessibility.  
**Handoff P10:** taxonomy governance، relation index، search/privacy decision.

### P10 — Topics + Search + Collections + Knowledge Layer

**هدف:** کشف قابل پیش‌بینی محتوا با taxonomy منسجم؛ نه یک موتور مبهم.

**Scope:** Topic pages، curated collections، cross-content relations، search baseline، filters (از جمله Course difficulty/prerequisite)، empty/no-result states، index lifecycle.

**Out of scope:** LLM answer generation، opaque ranking، graph visualization اجباری، search روی draft/private data.

**Dependencies:** stable schemas/taxonomy P4–P9، search ADR، index/storage capacity.

**Deliverables:** taxonomy glossary، relation rules، search API spec، relevance/privacy policy، index operational runbook.

**Data/API/UI:** index only public/published locale-visible projections; query schema has length/rate bounds, paging, stable sort and filter definitions; result shows type/title/summary/locale/access state without leaking hidden fields; Collection has curator/criteria/date.

**Security/A11y/RTL/SEO:** throttle abuse; sanitize query echo; keyboard-accessible filters and announced result count; canonical Topic/Collection pages; noindex thin/faceted URLs according to ADR.

**Testing:** index publish/unpublish/archive propagation، permission leak، filter combinations، Persian/English token behavior, no-result, pagination, performance budget in staging.

**Deployment/Verification:** index/build در staging قابل مشاهده و زمان آن ثبت شود؛ publish/unpublish propagation و fallback browse قبل و بعد از release آزمایش شوند.

**Acceptance/DoD:** Topic→resource navigation و search/filterها فقط دادهٔ مجاز و صحیح برمی‌گردانند، نقش و locale را حفظ می‌کنند و حالت بی‌نتیجه روشن دارد.

**Risks / rollback:** index drift → rebuild/disable search with browsing fallback; relevance issue → safe chronological/type sort fallback.  
**Handoff P11:** clean relation graph export contract، provenance and consent rules.

### P11 — AI / Semantic / Knowledge Graph

**هدف:** قابلیت‌های هوشمند فقط هنگامی اضافه شوند که داده، provenance، حریم خصوصی و fallback انسانی آماده است.

**Scope:** semantic retrieval آزمایشی، graph exploration، AI-assisted discovery با citations/links، consent/configuration و evaluation set.

**Out of scope:** autonomous publishing، پاسخ قطعی بدون source، ingest private/admin data، profile/health/personality inference، هزینهٔ کنترل‌نشدهٔ model calls.

**Dependencies:** P10 taxonomy/index quality، AI/privacy ADR، budget/rate limit، evaluation corpus و human review owner.

**Deliverables:** ADR مدل/provider/data flow، threat model، evaluation protocol، feature flag، cost dashboard، incident/disable runbook.

**Data/API/UI:** semantic index only from allowlisted public data; every answer/link exposes retrieved sources and “may be incomplete” state; no source → no synthesized factual answer; graph nodes/edges store provenance, locale, visibility and updated date.

**Security/A11y/RTL/SEO:** prompt injection defenses and separation of retrieved text/instructions; rate/cost limits; no secret in prompt/log; accessible non-canvas fallback list for graph; AI pages normally noindex until quality/SEO ADR approves.

**Testing:** retrieval authorization leak، prompt-injection cases، source attribution، empty/low-confidence fallback، cost limit، locale/RTL, manual evaluation against fixed labeled set and regression set.

**Deployment/Verification:** قابلیت ابتدا با feature flag در staging و budget محدود فعال می‌شود؛ evaluation و kill-switch آزمایش می‌شوند؛ prod rollout تدریجی و قابل توقف است.

**Acceptance/DoD:** قابلیت فقط پشت feature flag و با evidence از evaluation قابل فعال‌سازی است؛ هر خروجی منبع دارد یا صریحاً از پاسخ خودداری می‌کند؛ خاموش‌کردن آن سایت را مختل نمی‌کند.

**Risks / rollback:** hallucination/privacy/cost event → immediately disable flag, preserve minimal audit evidence, purge unsafe generated cache under runbook, fall back to P10 search/browse.

---

## 4. قالب handoff و گزارش پایان slice

### 4.1 ثبت ریسک و کار deferred

هر مورد باقی‌مانده دقیقاً یک ردیف در `docs/status/RISK_REGISTER.md` یا `docs/status/deferred-validation.md` دارد، با قالب زیر. عبارت‌های کلی مانند «بعداً بررسی شود» پذیرفته نیستند. هر فعالیت انجام‌شده نیز، حتی اگر فقط تغییر ساختار یا تنظیم Git باشد، یک entry قابل‌ردیابی در `docs/status/WORK_LOG.md` می‌گیرد.

```md
| ID | Phase/Slice | Severity | Description | Why deferred | Owner | Target phase/date | Mitigation/fallback | Evidence/command | Status |
|---|---|---|---|---|---|---|---|---|---|
```

`docs/status/TECH_DEBT.md` فقط برای debt غیرحاد است و باید همان ID را ارجاع دهد. `known-issues.md` تنها مشکلات تأییدشدهٔ کاربر-visible را نگه می‌دارد. بستن هر مورد مستلزم evidence تازه است؛ انتقال آن بین فایل‌ها به معنی بسته‌شدن نیست.

هر عامل این قالب را در issue/PR یا `docs/status/` تکمیل می‌کند:

```md
## Handoff: <phase>/<slice>
- User-visible outcome:
- Scope completed:
- Contracts read/changed (ADR/API/model):
- Files changed (task-owned only):
- Migrations/configuration:
- Verification actually run (command + result):
- Staging URL / QA path (if deployed):
- Security, accessibility, RTL/LTR and SEO checks:
- Deferred validation / known risks (link to ledger):
- Rollback/fallback:
- Next phase inputs and explicit blockers:
```

### 4.2 گزارش وضعیت فاز

```md
## Phase status: <P0...P11>
- Release DoD: PASS | BLOCKED | NOT READY
- Completion DoD: <percent only if every remaining item is enumerated; otherwise NOT MEASURED>
- Latest deployed version and environment:
- Open Critical/High risk IDs:
- Deferred item IDs:
- Decision needed from owner:
```

## 5. معیار نهایی موفقیت محصول

- سایت در هر لحظهٔ توسعه یک نسخهٔ عمومی مفید، سریع و قابل بازگشت دارد.
- محتوا از مسیر مدیریت‌شده و امن منتشر می‌شود؛ تفاوت زبان، دسترسی، مجوز و evidence پنهان نمی‌ماند.
- بازدیدکننده در چند قدم می‌تواند طه محمدی، تخصص‌ها، رزومه، نوشته‌ها، پژوهش/پروژه‌ها و راه تماس را بفهمد.
- هیچ فاز بعدی، تعهد لایو بودن P0–P2 را نمی‌شکند؛ قابلیت پیچیده باید graceful fallback داشته باشد.
- وضعیت واقعی کار بر اساس evidence ثبت‌شده گزارش می‌شود، نه بر اساس ادعا یا تعداد فایل‌های تغییرکرده.
