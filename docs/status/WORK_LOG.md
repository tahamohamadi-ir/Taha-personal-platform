# Work Log

> مرجع chronological و append-only برای فعالیت‌های انجام‌شده. برای سیاست و قالب کامل، `docs/governance/DOCUMENTATION_POLICY.md` را بخوانید.

## قالب entry

```md
## LOG-XXXX — YYYY-MM-DD — <phase/slice>
- Outcome:
- Why:
- Scope / files:
- Commands or actions actually performed:
- Verification actually performed and result:
- Decisions / assumptions:
- Deferred or risk IDs:
- Rollback / recovery:
```

## LOG-0001 — 2026-08-14 — P0-G0 / Repository inventory

- Outcome: وضعیت آغازین repository ثبت شد: شش سند Markdown وجود داشت و پوشه‌های اجرایی خالی بودند؛ `.git` نیز یک پوشهٔ خالی و نامعتبر بود.
- Why: Inventory read-only پیش‌نیاز P0-G0 و repair امن Git بود.
- Scope / files: فقط مشاهدهٔ root، `docs/`، `frontend/` و `backend/`؛ هیچ محتوای application ساخته نشد.
- Commands or actions actually performed: فهرست بازگشتی فایل/پوشه، `git status`، `git rev-parse --is-inside-work-tree` و بررسی محتوای `.git` اجرا شد.
- Verification actually performed and result: Git هر دو فرمان را با `fatal: not a git repository` رد کرد؛ `frontend/` و `backend/` خالی بودند.
- Decisions / assumptions: هیچ Astro/Django scaffold، dependency یا runtime service در P0-G0 ساخته نمی‌شود.
- Deferred or risk IDs: `DEFER-0001`، `DEFER-0002` و `DEFER-0003`.
- Rollback / recovery: موردی تغییر نکرده بود.

## LOG-0002 — 2026-08-14 — P0-G0 / Git repair

- Outcome: مخزن Git سالم با branch `main` و remote canonical GitHub آماده شد؛ هنوز commit یا push انجام نشده است.
- Why: `.git` قبلی نامعتبر بود و مسیر امن recovery لازم داشت.
- Scope / files: فقط metadata Git در root.
- Commands or actions actually performed: `.git` نامعتبر با timestamp به پوشهٔ Temp منتقل شد؛ `git init -b main` و سپس `git remote add origin https://github.com/tahamohamadi-ir/Taha-personal-platform.git` اجرا شد.
- Verification actually performed and result: `git status` مخزن جدید را روی `main` و بدون commit نشان داد؛ `git remote -v` fetch/push URL را تأیید کرد.
- Decisions / assumptions: هیچ push انجام نشده و remote فقط متصل است.
- Deferred or risk IDs: ندارد.
- Rollback / recovery: نسخهٔ `.git` نامعتبر در Temp نگه‌داری شده است؛ هیچ فایل پروژه حذف نشده است.

## LOG-0003 — 2026-08-14 — P0-G0 / Repository layout freeze

- Outcome: مسیرهای خالی `frontend/` و `backend/` به `apps/web/` و `apps/cms/` منتقل شدند؛ مسیرهای مستندات P0 ایجاد و Release Policy به مسیر canonical منتقل شد.
- Why: این layout با معماری monorepo پیشنهادی سازگار است و پیش از ایجاد کد، migration cost ندارد.
- Scope / files: `apps/web/`، `apps/cms/`، `docs/{adr,governance,status,templates}/` و `docs/governance/RELEASE_POLICY.md`.
- Commands or actions actually performed: خالی‌بودن دو پوشهٔ قدیمی بررسی شد، سپس move و ساخت directoryها انجام شد؛ در پایان `tree /F /A` و `git status --short --branch` اجرا شد.
- Verification actually performed and result: tree مسیرهای جدید را نشان داد و Release Policy فقط در `docs/governance/` قرار دارد؛ هیچ فایل application یا dependency وجود ندارد.
- Decisions / assumptions: `apps/web/` و `apps/cms/` مسیرهای canonical آینده هستند؛ مسیرهای قدیمی نباید دوباره ایجاد شوند.
- Deferred or risk IDs: ندارد.
- Rollback / recovery: چون هر دو مسیر مبدأ خالی بودند، بازگردانی فقط move معکوس پوشه‌های خالی است.

## LOG-0004 — 2026-08-14 — P0-G0 / Environment inventory

- Outcome: نسخه‌های قابل مشاهدهٔ ابزارهای محلی ثبت شد.
- Why: `PROJECT_MANIFEST.md` باید فقط بر پایهٔ inventory واقعی تکمیل شود.
- Scope / files: بدون تغییر فایل.
- Commands or actions actually performed: نسخه‌های Git، Node/npm/npx، Python candidateها، uv، OpenCode، Serena، Docker، Docker Compose و pnpm بررسی شدند.
- Verification actually performed and result: Git 2.54.0؛ Node 24.16.0؛ npm/npx 11.18.0؛ Python مستقل 3.14.4؛ Python 3.11.15 متعلق به محیط Hermes؛ uv 0.12.3؛ OpenCode 1.18.18؛ Serena 1.7.0؛ Docker 29.4.1؛ Docker Compose 5.1.3؛ pnpm 11.19.0.
- Decisions / assumptions: دستور bare `python` به interpreter متعلق به Hermes اشاره می‌کند و برای پروژه canonical نیست.
- Deferred or risk IDs: `DEFER-0003`.
- Rollback / recovery: ندارد؛ inventory read-only بود.

## LOG-0005 — 2026-08-14 — P0-G0 / Documentation governance

- Outcome: قرارداد ثبت اجباری کارها و deferها ایجاد شد و Work Log، Deferred Validation، Risk Register، Technical Debt، Known Issues و Task Spec به‌عنوان منابع canonical اضافه شدند.
- Why: هر agent/developer باید بتواند فعالیت انجام‌شده، evidence واقعی و کارهای عمداً انجام‌نشده را بدون تکیه بر حافظه یا گفت‌وگو دنبال کند.
- Scope / files: `docs/governance/DOCUMENTATION_POLICY.md`، `docs/governance/RELEASE_POLICY.md`، Master Plan، و فایل‌های `docs/status/` و `docs/templates/TASK_SPEC_TEMPLATE.md`.
- Commands or actions actually performed: فایل‌های ledger/template ایجاد و ارجاع‌های Master Plan و Release Policy به Work Log و مسیرهای canonical به‌روزرسانی شد.
- Verification actually performed and result: `git diff --check` بدون خطا تمام شد؛ همهٔ مسیرهای required documentation وجود دارند؛ جست‌وجوی مسیر قدیمی Release Policy نتیجه‌ای نداشت و ارجاع‌های جدید Work Log/Documentation Policy در Master Plan و Release Policy دیده شدند.
- Decisions / assumptions: Work Log append-only است؛ defer هیچ‌گاه جایگزین blocker یا تکمیل نمی‌شود؛ هر فعالیت آینده باید entry مستقل داشته باشد.
- Deferred or risk IDs: `RISK-0001`، `DEFER-0001` تا `DEFER-0003`.
- Rollback / recovery: تمام تغییرها مستندی و قابل بازگردانی با Git هستند؛ هنوز commit/push انجام نشده است.

## LOG-0006 — 2026-08-14 — P0-G0 / Owner inputs and operations assessment

- Outcome: ورودی‌های مالک برای production، locale و محتوای P1 ثبت شد؛ تصمیم CI و backup با توجه به ظرفیت VPS برای ADR آینده ارزیابی شد.
- Why: P0-G0 باید تصمیم‌های واقعی محیط را از حدس agent جدا کند.
- Scope / files: فقط مستندات status؛ اتصال SSH، تغییر سرور، deploy، secret storage یا CI configuration انجام نشد.
- Commands or actions actually performed: مشخصات ابزارهای محلی و اطلاعات اعلام‌شدهٔ مالک با مستندات رسمی GitHub Actions و Gitea Actions مقایسه شد.
- Verification actually performed and result: production target اعلام‌شده `tahamohamadi.ir` است؛ VPS فعال Ubuntu با 1 vCPU، 2 GB RAM و 30 GB NVMe دارد. GitHub برای repository عمومی، runner استاندارد hosted را رایگان اعلام می‌کند؛ Gitea برای اجرای job به Act Runner نیاز دارد و مستندات آن runner جدا از instance را توصیه می‌کند.
- Decisions / assumptions: `/` Language Gateway و `/fa/` و `/en/` ورودی مستقیم نهایی هستند؛ browser preference فقط پیشنهاد زبان است و redirect اجباری نیست. این پیشنهادها در LOG-0007 توسط مالک تأیید و در ADRهای مربوطه freeze شدند.
- Deferred or risk IDs: `DEFER-0004`، `RISK-0002` و `RISK-0003`.
- Rollback / recovery: تغییری در production انجام نشده است.

## LOG-0007 — 2026-08-14 — P0-G0 / Approved baseline decisions

- Outcome: GitHub Actions hosted، `staging.tahamohamadi.ir`، Google Drive encrypted backup target، `/admin/` و Python 3.12 baseline تأیید و مستند شدند.
- Why: این تصمیم‌ها برای Manifest، ADRها و جلوگیری از ورود سرویس/نسخهٔ حدسی لازم بودند.
- Scope / files: `PROJECT_MANIFEST.md`، `AGENTS.md`، `.gitignore`، `.env.example`، README، ADRهای 0002/0008/0009/0010/0011/0014، Backup Policy، architecture baseline و ledgerها.
- Commands or actions actually performed: مستندات رسمی سازگاری Django/Wagtail/Python و billing GitHub Actions بررسی شد؛ سپس فقط فایل‌های مستندی/پیکربندی غیرمحرمانه ایجاد یا اصلاح شدند.
- Verification actually performed and result: Wagtail 7.4 LTS و Django 5.2 LTS با Python 3.12 سازگارند؛ Python 3.12 تا October 2028 security support دارد. GitHub Actions hosted standard برای repository عمومی رایگان است.
- Decisions / assumptions: Python هدف 3.12 latest patch است، نه Hermes Python و نه 3.14 فعلی؛ Gitea/self-hosted runner baseline نیست. هیچ package، `.venv`، workflow، اتصال SSH، DNS یا deploy ساخته/اجرا نشد.
- Deferred or risk IDs: `DEFER-0003`؛ `RISK-0001` تا `RISK-0003`.
- Rollback / recovery: تغییرات فقط در Git worktree فعلی هستند و هنوز commit/push نشده‌اند.

## LOG-0008 — 2026-08-14 — P0-G0 / Documentation verification normalization

- Outcome: policy مربوط به line ending و whitespace اسناد Markdown صریح شد.
- Why: `git diff --check` دو فاصلهٔ انتهای خط در اسناد baseline را گزارش می‌کرد، درحالی‌که آن فاصله‌ها hard line break عمدی Markdown هستند.
- Scope / files: `.gitattributes` و این Work Log.
- Commands or actions actually performed: staged diff با `git diff --cached --check` بررسی شد؛ سپس attribute مخصوص Markdown اضافه شد.
- Verification actually performed and result: پس از `git add --renormalize .`، `git diff --cached --check` بدون خطا تمام شد؛ local Markdown links نیز PASS بودند. متن و line breakهای اسناد موجود حذف یا بازنویسی نشدند.
- Decisions / assumptions: برای `*.md`، line ending canonical برابر LF و trailing-space از whitespace check مستثنا است؛ این استثنا فقط برای Markdown است.
- Deferred or risk IDs: ندارد.
- Rollback / recovery: حذف `.gitattributes` رفتار سخت‌گیرانهٔ قبلی را بازمی‌گرداند؛ هیچ محتوای سندی حذف نشده است.

## LOG-0009 — 2026-08-14 — P0-G0 / Initial documentation commit

- Outcome: baseline مستندات P0-G0 در اولین commit محلی ثبت شد.
- Why: ایجاد تاریخچهٔ قابل بازگشت و مبنای تمیز برای taskهای بعدی.
- Scope / files: تمام فایل‌های baseline مستندات، policyها، ADRها و تنظیمات غیرمحرمانهٔ repository.
- Commands or actions actually performed: `git commit -m "docs: establish P0-G0 governance baseline"` روی branch `main` اجرا شد.
- Verification actually performed and result: commit محلی ایجاد و سپس فقط برای افزودن همین Work Log amend شد؛ `git status --short --branch` تمیز بود و هیچ push اجرا نشد.
- Decisions / assumptions: این فقط commit محلی است؛ انتشار remote، deploy و P0-G0 PASS اعلام نشده‌اند.
- Deferred or risk IDs: `DEFER-0003`؛ `RISK-0001` تا `RISK-0003`.
- Rollback / recovery: پیش از push، بازنویسی/بازگردانی commit فقط با تأیید مالک مجاز است.

## LOG-0010 — 2026-08-14 — P0-A preparation / secure access, staging DNS and backup

- Outcome: Task Spec و runbook عملیاتیِ امن برای ساخت کاربر non-root، SSH key-only، رکورد staging و handoff backup ایجاد شد؛ owner آغاز اجرای هر سه مسیر را تأیید کرد.
- Why: `RISK-0002` مانع هر اتصال SSH است و `RISK-0003` بدون دسترسی امن و OAuth تعاملی نمی‌تواند provision شود؛ ترتیب امن و rollback باید پیشاپیش روشن باشد.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/governance/SERVER_ACCESS_RUNBOOK.md`، `PROJECT_MANIFEST.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: تصاویر Cloudflare ارائه‌شده توسط مالک بررسی شد؛ مستندات/دستورهای owner-executed برای rotation، `tahaops`، تست login و SSH drop-in نوشته شد؛ سپس در یک commit محلی ثبت شد. هیچ اتصال SSH، تغییر سرور، تغییر DNS یا OAuth/backup command یا push remote اجرا نشد.
- Verification actually performed and result: از تصاویر، وجود root A و www CNAME با proxy فعال، نبودن staging record و Cloudflare encryption mode برابر Full مشاهده شد. اجرای server-side یا DNS هنوز evidence ندارد.
- Decisions / assumptions: حساب انسانی/عملیاتی `tahaops` انتخاب شد؛ password/root SSH فقط پس از اثبات login با کلید در session دوم غیرفعال می‌شود. staging همان VPS address و proxy Cloudflare خواهد داشت. Full (strict) تا نصب certificate معتبر در origin به تعویق می‌افتد.
- Deferred or risk IDs: `RISK-0001` تا `RISK-0003`؛ هیچ مورد High به‌عنوان defer پذیرفته نشد.
- Rollback / recovery: root console تا تأیید login جدید باز می‌ماند؛ حذف تنها رکورد `staging` DNS rollback مستقل دارد؛ backup ناموفق باید disable و credentialهای مرتبط revoke/rotate شوند.

## LOG-0011 — 2026-08-14 — P0-A diagnosis / existing SSH operator account

- Outcome: اجرای owner-side نشان داد session فعلی SSH با یک حساب non-root موجود و public-key authentication برقرار شده است؛ بنابراین دستورهای ساخت کاربر که به root نیاز داشتند رد شدند. task/runbook برای privilege check پیش از هر تغییر اصلاح شد.
- Why: اجرای دستورات root در حساب non-root علت مستقیم خطا بود؛ ساخت حساب جدید یا تغییر SSH بدون بررسی کمینهٔ privilege می‌توانست مسیر کاری موجود را مختل کند.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/governance/SERVER_ACCESS_RUNBOOK.md` و همین Work Log.
- Commands or actions actually performed: مالک key pair محلی ساخت و تلاش مستقیم برای `adduser`/آماده‌سازی مسیر authorization در session non-root انجام داد؛ `adduser` با خطای نیاز به root رد شد و نوشتن editor نیز به‌علت نبود directory موفق نشد. سپس اصلاح مستندات در یک commit محلی ثبت شد. هیچ account، authorization file، SSH daemon setting، DNS یا backup configuration و هیچ push remote انجام نشد.
- Verification actually performed and result: banner اتصال، public-key authentication و username غیر-root را نشان داد؛ خروجی خطا ثابت کرد session root نیست. sudo authority هنوز بررسی نشده است.
- Decisions / assumptions: به‌جای ایجاد کورکورانهٔ account دوم، حساب موجود فقط در صورت موفقیت read-only sudo check به‌عنوان operator انتخاب می‌شود؛ در غیر این صورت ایجاد `tahaops` فقط از provider/root console انجام می‌شود.
- Deferred or risk IDs: `RISK-0001` تا `RISK-0003` همچنان باز/blocked هستند؛ `RISK-0002` بسته نشده است.
- Rollback / recovery: editor بدون ذخیره بسته می‌شود؛ چون فایل یا account جدیدی ایجاد نشده، rollback سمت سرور لازم نیست.

## LOG-0012 — 2026-08-14 — P0-A diagnosis / privileged-access recovery required

- Outcome: حساب non-root موجود عضو گروه sudo است، اما sudo به authentication تعاملی نیاز دارد و هیچ credential صحیحی برای آن اثبات نشد. اتصال root با روش authentication موجود نیز رد شد؛ recovery از provider console/rescue لازم است.
- Why: تلاش مستقیم account creation با root نبودن session رد شد و جایگزین کردن password root با password حساب operator نیز مسیر معتبر sudo نیست؛ ادامهٔ password guessing ریسک exposure و lockout را بالا می‌برد.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/governance/SERVER_ACCESS_RUNBOOK.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک `whoami`، `id -nG`، `sudo -n whoami` و `sudo -n -l` را اجرا کرد؛ سپس تلاش authentication تعاملی sudo و تلاش root SSH انجام شد. این diagnosis در یک commit محلی ثبت شد. هیچ account، SSH config، DNS، application یا backup configuration و هیچ push remote تغییر نکرد.
- Verification actually performed and result: identity حساب non-root و عضویت آن در sudo مشاهده شد؛ هر دو sudo non-interactive check، authentication تعاملی خواستند. روش authentication موجود برای root SSH پذیرفته نشد. هیچ credential یا مقدار آن در این log ثبت نشده است.
- Decisions / assumptions: تا بازیابی privileged access از provider console/rescue، تنها عملیات read-only مجاز است؛ password guessing و فعال‌کردن remote root password SSH ممنوع است.
- Deferred or risk IDs: `RISK-0001` تا `RISK-0003`؛ `RISK-0002` همچنان blocker High است و defer نشده است.
- Rollback / recovery: owner از پنل provider مسیر console/rescue یا reset root را انتخاب می‌کند؛ پس از ورود console، فقط password جداگانهٔ operator و public key جدید طبق runbook تنظیم و در terminal دوم آزموده می‌شود.

## LOG-0013 — 2026-08-14 — P0-A evidence / interactive sudo path recovered

- Outcome: مالک با حساب SSH non-root موجود از مسیر sudo تعاملی به root shell رسید؛ ساخت account دوم لازم نیست و حساب موجود operator منتخب است.
- Why: خروجی قبلی فقط نشان می‌داد sudo در حالت non-interactive password می‌خواهد؛ session بعدی اثبات کرد حساب operator دارای مسیر sudo معتبر است. این evidence مسیر provider/rescue را از blocker فعلی به fallback تبدیل می‌کند.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک یک session SSH جدید برقرار و sudo تعاملی را با موفقیت اجرا کرد؛ shell root حاصل شد. این evidence در یک commit محلی ثبت شد. هیچ password، key یا مقدار secret در repository ثبت و هیچ push remote انجام نشده است.
- Verification actually performed and result: prompt root در یک session sudo مالک مشاهده شد؛ بنابراین operator account و sudo path آن معتبرند. rotation root credential، افزودن کلید جدید، test مستقل آن و SSH hardening هنوز انجام/تأیید نشده‌اند.
- Decisions / assumptions: همان حساب موجود با password جداگانه و کلیدهای owner-controlled نگه داشته می‌شود؛ تغییر daemon SSH فقط پس از تست کلید جدید در terminal دوم انجام می‌شود.
- Deferred or risk IDs: `RISK-0001` تا `RISK-0003`؛ `RISK-0002` هنوز High/Blocked است.
- Rollback / recovery: root shell فعلی تا موفقیت terminal دوم باز می‌ماند؛ اگر کلید جدید کار نکند، کلید فعلی حذف نمی‌شود و SSH daemon دست‌نخورده می‌ماند.

## LOG-0014 — 2026-08-14 — P0-A evidence / new operator key and sudo verified

- Outcome: کلید عمومی جدید به authorization حساب operator موجود اضافه و از PowerShell در یک session مستقل با موفقیت تست شد؛ identity operator و sudo به root نیز تأیید شد.
- Why: پیش از تغییر policy SSH باید حداقل دو مسیر معتبر داشته باشیم: session privileged موجود و اتصال تازه با کلید جدید؛ این شرط اکنون برقرار است.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک directory/permissionهای SSH حساب operator را با root shell آماده کرد، کلید عمومی جدید را بدون حذف کلید موجود افزود و با `ssh -i` از PowerShell اتصال مستقل برقرار کرد؛ سپس identity و sudo را بررسی کرد. یک تلاش literal با placeholder hostname پیش از تلاش موفق رخ داد و هیچ تغییری ایجاد نکرد. این evidence در یک commit محلی ثبت شد؛ هیچ push remote انجام نشد.
- Verification actually performed and result: اتصال مستقل با کلید جدید موفق بود؛ shell identity حساب operator بود و sudo به root با موفقیت پاسخ داد. خروجی معتبرِ اجرای `passwd` برای root یا operator ارائه نشده است؛ بنابراین rotation تأیید نشده است.
- Decisions / assumptions: root/password credential در معرض مشاهده تا زمان اجرای `passwd` همچنان compromised فرض می‌شود؛ SSH daemon و firewall هنوز تغییر نمی‌کنند و ابتدا effective config read-only بررسی می‌شود.
- Deferred or risk IDs: `RISK-0001` تا `RISK-0003`؛ `RISK-0002` به‌دلیل rotationِ تأییدنشده همچنان High/Blocked است.
- Rollback / recovery: کلید قدیمی حذف نشده و root shell باز است؛ اگر کلید جدید بعداً revoke شود، کلید قدیمی مسیر recovery موقت باقی می‌ماند تا جایگزین سالم تأیید شود.

## LOG-0015 — 2026-08-14 — P0-A evidence / effective SSH policy already hardened

- Outcome: inspection فقط‌خواندنیِ effective SSH configuration نشان داد root login، password authentication و keyboard-interactive authentication غیرفعال‌اند؛ public-key authentication و allow-list صریح برای operatorها فعال است. تغییر یا reload SSH لازم نیست.
- Why: قبل از نوشتن drop-in جدید باید configuration واقعی daemon بررسی می‌شد؛ نتیجه نشان می‌دهد کنترل‌های موردنظر از قبل برقرارند و duplicate configuration ریسک غیرضروری دارد.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/governance/SERVER_ACCESS_RUNBOOK.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک از root shell، `sshd -T` را با filter محدود برای authentication policy اجرا کرد. هیچ file write، reload SSH، firewall، DNS، application یا backup command اجرا نشد.
- Verification actually performed and result: effective values برای root login، password authentication، keyboard-interactive، public-key authentication، allow-list و authentication method مشاهده و با baseline امن مطابقت داده شد. اجرای `passwd` برای root در evidence فعلی دیده نشده است.
- Decisions / assumptions: SSH policy فعلی دست‌نخورده می‌ماند؛ تنها acceptance باقی‌مانده برای `RISK-0002`، rotation credential افشاشده و تأیید مالک است.
- Deferred or risk IDs: `RISK-0001` تا `RISK-0003`؛ `RISK-0002` فقط به‌دلیل root rotation تأییدنشده High/Blocked است.
- Rollback / recovery: چون configuration تغییر نکرده، rollback لازم نیست؛ root shell و دو کلید SSH موجود مسیرهای recovery کنترل‌شده‌اند.

## LOG-0016 — 2026-08-14 — P0-A owner decision / root credential rotation declined

- Outcome: مالک اعلام کرد که در حال حاضر root password rotate نمی‌شود. هیچ تغییر دیگری در سرور انجام نشد.
- Why: تصمیم مالک دربارهٔ credential تغییر سرور را متوقف می‌کند، اما exposure پیشین را از بین نمی‌برد.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: فقط تصمیم مالک ثبت و مستندات در یک commit محلی به‌روزرسانی شد؛ هیچ SSH command توسط Codex، deploy، DNS change، backup provisioning یا application change و هیچ push remote انجام نشد.
- Verification actually performed and result: evidence LOG-0015 نشان می‌دهد policy SSH فعلی key-only و root/password-disabled است؛ با وجود این، rotation credential افشاشده تأیید نشده است.
- Decisions / assumptions: `RISK-0002` stop-the-line باقی می‌ماند و با acceptance عادی بسته نمی‌شود؛ Codex تا زمان rotation به VPS متصل نمی‌شود.
- Deferred or risk IDs: `RISK-0002` BLOCKED؛ `RISK-0001` و `RISK-0003` نیز باز هستند.
- Rollback / recovery: هر زمان مالک rotation را تأیید کند، task از همین evidence ادامه می‌یابد؛ تا آن زمان فقط کارهای local/documentation بدون نیاز به VPS ممکن‌اند.

## LOG-0017 — 2026-08-14 — P0-A owner attestation / root credential rotated

- Outcome: مالک تأیید کرد credential root افشاشده را خارج از گفت‌وگو و بدون افشای مقدار آن rotate کرده است؛ `RISK-0002` با این attestation و evidence قبلی key-only operator/SSH policy بسته شد.
- Why: rotation credential شرط stop-the-line برای ادامهٔ عملیات remote بود و مقدار secret نباید برای اثبات در Git یا chat ثبت شود.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک rotation را مستقل انجام و آن را اعلام کرد؛ سپس evidence در یک commit محلی ثبت شد. Codex هیچ اتصال SSH، deploy، DNS change یا backup provisioning و هیچ push remote انجام نداد.
- Verification actually performed and result: attestation مالک با evidence پیشینِ key-only operator login، sudo و effective SSH policy ترکیب شد. مقدار credential دیده، ذخیره یا آزموده نشد.
- Decisions / assumptions: `RISK-0002` CLOSED است؛ task به staging DNS، read-only server audit و encrypted backup bootstrap ادامه می‌یابد. هر exposure جدید بلافاصله این risk را باز می‌کند.
- Deferred or risk IDs: `RISK-0001` و `RISK-0003` باقی مانده‌اند؛ `RISK-0002` CLOSED.
- Rollback / recovery: برای rotation rollback وجود ندارد؛ password manager منبع نگهداری credential جدید است و key-only SSH policy پابرجا می‌ماند.

## LOG-0018 — 2026-08-14 — P0-A evidence / preliminary read-only server audit

- Outcome: owner فولدر logical backup در Google Drive ایجاد کرد و audit فقط‌خواندنی نشان داد host ظرفیت آزاد کافی برای مرحلهٔ planning دارد، Caddy و Docker فعال‌اند، UFW فعال/deny-incoming است، و stack production از قبل وجود دارد.
- Why: قبل از route/DNS/deploy یا backup provisioning باید ownership و topology سرویس‌های موجود شناخته شود تا جایگزینی سایت فعلی آن را مختل نکند.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/governance/BACKUP_POLICY.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک با root shell دستورهای read-only برای hostname/kernel/uptime، disk/memory، وضعیت SSH/Docker، UFW، socket listeners و unattended-upgrades اجرا کرد. فولدر Google Drive ایجاد شد و evidence در یک commit محلی ثبت شد. هیچ package update، service reload، firewall/DNS change، Docker/Caddy change یا backup OAuth و هیچ push remote انجام نشد.
- Verification actually performed and result: root filesystem حدود ۳۰GB با حدود ۱۷GB free، memory حدود ۱.۹GiB با swap فعال، SSH و Docker active، UFW active با deny-incoming، و Caddy روی HTTP/HTTPS/HTTP3 دیده شد. Docker-published listenerها loopback-only بودند. دو listener عمومی SSH و ۵۷ update pending از MOTD/audit دیده شد. جزئیات حساس config یا environment variable ثبت نشد.
- Decisions / assumptions: staging DNS تا inventory Caddy/container routeها ساخته نمی‌شود؛ backup folder وجود دارد اما restic/rclone/OAuth هنوز provision نشده‌اند؛ update یا حذف SSH port بدون maintenance/rollback انجام نمی‌شود.
- Deferred or risk IDs: `RISK-0001`، `RISK-0003` تا `RISK-0006`؛ `RISK-0004` blocker High است.
- Rollback / recovery: چون audit و folder creation غیرمخرب‌اند، rollback سروری ندارد؛ هر تغییر بعدی باید از inventory/rollback مستند خود stack موجود تبعیت کند.

## LOG-0019 — 2026-08-14 — P0-A evidence / staging DNS exists, TLS origin handshake blocked

- Outcome: owner رکورد proxied `A` برای staging را در Cloudflare ایجاد کرد. بررسی خارجی نشان داد production پاسخ HTTP موفق دارد، اما staging با Cloudflare 525 پاسخ می‌دهد؛ staging deploy نشده و TLS origin route آن آماده نیست.
- Why: ایجاد DNS بدون inventory Caddy می‌تواند رفتار hostname جدید را نامشخص کند؛ external check لازم بود تا وضعیت واقعی route/TLS به‌جای حدس ثبت شود.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: owner DNS record را در Cloudflare ساخت؛ Codex دو HTTPS header request فقط‌خواندنی برای staging و production اجرا کرد و evidence را در یک commit محلی ثبت کرد. هیچ Caddy/Docker/firewall/DNS write توسط Codex، deploy یا backup provisioning و هیچ push remote انجام نشد.
- Verification actually performed and result: production `200 OK` پاسخ داد. staging `525` از Cloudflare داد، که failure handshake TLS بین edge و origin را نشان می‌دهد. محتوا یا secret از origin خوانده/ثبت نشد.
- Decisions / assumptions: staging DNS حفظ می‌شود اما تا inventory routeهای Caddy، TLS/configuration change انجام نمی‌شود؛ `RISK-0004` blocker باقی می‌ماند.
- Deferred or risk IDs: `RISK-0001`، `RISK-0003` تا `RISK-0006`؛ `RISK-0004` High/Blocked.
- Rollback / recovery: حذف رکورد staging در Cloudflare تنها rollback DNS است؛ فعلاً به‌دلیل عدم اثر production آن انجام نمی‌شود. هر Caddy fix باید پیش از اجرا rollback صریح داشته باشد.
