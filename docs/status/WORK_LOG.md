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

## LOG-0020 — 2026-08-14 — P0-A evidence / live production stack identified

- Outcome: metadata inventory نشان داد یک Compose project زنده با سه container healthy (frontend، backend و PostgreSQL) در مسیر production موجود اجرا می‌شود. Caddy system service فقط دو hostname production root و `www` را در Caddyfile دارد.
- Why: این evidence علت محتمل 525 staging را مشخص و تأیید می‌کند که hostname جدید نباید برای رفع سریع به stack database/backend production وصل شود.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: owner metadata-only Docker container/Compose/Caddy version، systemd unit location و Caddyfile hostname match را اجرا کرد؛ evidence در یک commit محلی ثبت شد. هیچ config، container، volume، service، DNS یا backup setting و هیچ push remote تغییر نکرد.
- Verification actually performed and result: frontend/backend/PostgreSQL healthy مشاهده شدند؛ frontend/backend فقط روی loopback publish شده‌اند؛ Compose file production location ثبت شد؛ Caddyfile staging hostname ندارد. نتیجه با Cloudflare 525 بیرونی سازگار است، ولی علت نهایی TLS فقط پس از config inventory قابل اثبات است.
- Decisions / assumptions: `Taha-personal-platform` از stack زنده مستقل می‌ماند؛ staging آینده هرگز DB/backend production را share نمی‌کند. پیش از تصمیم staging باید metadata volume/data-path و Caddy routing امن inventory شود و capacity co-hosting ارزیابی گردد.
- Deferred or risk IDs: `RISK-0001`، `RISK-0003` تا `RISK-0007`؛ `RISK-0004` و `RISK-0007` High/Blocked.
- Rollback / recovery: چون فقط metadata خوانده شد، rollback ندارد؛ stack موجود بدون تغییر باقی مانده و هر تغییر بعدی باید rollback مستقل داشته باشد.

## LOG-0021 — 2026-08-14 — P0-A decision / isolated staging placeholder

- Outcome: container mounts، Compose skeleton و Caddyfile routeها inventory شد. تصمیم ADR-0015 برای یک staging placeholder مستقل با automatic Caddy TLS و پاسخ 503 ثبت شد؛ هنوز تغییری روی سرور اعمال نشده است.
- Why: staging DNS موجود 525 می‌دهد چون Caddy hostname آن را ندارد. proxy کردن آن به Compose production خطر data leak و production interference دارد؛ پاسخ 503 مستقل حداقل مسیر امن و reversible است.
- Scope / files: `docs/adr/0015-isolated-staging-placeholder.md`، `docs/adr/README.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: owner Docker mount metadata، Compose skeleton و بخش Caddyfile را فقط‌خواندنی مشاهده کرد؛ Codex مستندات رسمی Caddy و Cloudflare را بررسی و decision را در یک commit محلی ثبت کرد. هیچ Caddyfile write/reload، Docker/Compose action، DNS write، TLS mode change یا backup action و هیچ push remote انجام نشد.
- Verification actually performed and result: PostgreSQL و media در Docker volumeهای مستقل دیده شدند؛ Caddy automatic TLS در site blockهای production برقرار است و staging route غایب است. مستندات رسمی Caddy syntax `tls internal` و `respond` و مستندات Cloudflare Full/Full(strict) بررسی شد؛ تصمیم استفاده از automatic certificate existing Caddy به‌جای internal CA ثبت شد.
- Decisions / assumptions: staging placeholder production backend/database را proxy نمی‌کند؛ Cloudflare Full فعلاً باقی می‌ماند؛ Full(strict) فقط بعد از certificate valid برای همهٔ hostnameها و تأیید مالک بررسی می‌شود.
- Deferred or risk IDs: `RISK-0001`، `RISK-0003` تا `RISK-0007`؛ `RISK-0004` IN PROGRESS با ADR-0015.
- Rollback / recovery: قبل از هر edit، Caddyfile backup گرفته می‌شود؛ validation failure مانع reload است؛ rollback restore backup + validate + reload است.

## LOG-0022 — 2026-08-14 — P0-A execution / isolated staging placeholder live

- Outcome: Caddyfile با backup موجود، validation موفق و reload active، برای staging یک پاسخ ثابت 503 مستقل ارائه می‌دهد. external Cloudflare check از 525 به 503 تغییر کرد؛ production route تغییر نکرد.
- Why: رفع 525 باید بدون proxy کردن staging به frontend/backend/PostgreSQL production انجام می‌شد.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/adr/0015-isolated-staging-placeholder.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md`، `docs/status/deferred-validation.md` و همین Work Log.
- Commands or actions actually performed: owner از root shell Caddyfile را به مسیر backup کپی، site block staging مستقل اضافه، `caddy validate` را اجرا، Caddy را reload و active بودن آن را تأیید کرد. سپس direct-origin curl و external Cloudflare HTTPS header check اجرا شد؛ evidence در یک commit محلی ثبت شد. Codex هیچ server command و هیچ push remote اجرا نکرد.
- Verification actually performed and result: Caddy validation `Valid configuration` بود و service active باقی ماند. external staging HTTPS پاسخ 503 با headerهای امنیتی مورد انتظار داد. direct-origin curl با TLS internal alert شکست خورد؛ این failure به `DEFER-0005` ثبت شد و مانع تغییر Cloudflare TLS mode است.
- Decisions / assumptions: placeholder فعلاً complete و isolated است؛ warning formatting Caddyfile به‌علت عدم ارتباط و ریسک rewrite config زنده عمداً اصلاح نشد. Cloudflare Full باقی می‌ماند؛ Full(strict) و staging واقعی تا رفع DEFER-0005 و gates بعدی ممنوع‌اند.
- Deferred or risk IDs: `DEFER-0005`؛ `RISK-0001`، `RISK-0003` تا `RISK-0007`؛ `RISK-0004` IN PROGRESS.
- Rollback / recovery: در خطای جدید staging یا اثر production، backup Caddyfile restore، validate و reload می‌شود؛ production Compose/volumes در این change لمس نشده‌اند.

## LOG-0023 — 2026-08-14 — P0-A diagnosis / staging certificate issuance race

- Outcome: Caddy log نشان داد نخستین direct-origin TLS probe پیش از پایان certificate issuance اجرا شده بود. پس از fallback موفق HTTP-01، Caddy برای staging یک certificate ACME دریافت کرد؛ re-test مستقیم هنوز لازم است.
- Why: تشخیص دقیق مانع اعمال تغییر نامرتبط در Caddy یا Cloudflare می‌شود؛ external 503 به‌تنهایی چرایی alert probe اول را توضیح نمی‌داد.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/deferred-validation.md` و همین Work Log.
- Commands or actions actually performed: owner log محدود Caddy را با filter TLS/certificate/staging خواند و evidence در یک commit محلی ثبت شد. هیچ Caddyfile edit/reload، DNS/TLS-mode change، container action یا backup action و هیچ push remote انجام نشد.
- Verification actually performed and result: log ابتدا شکست TLS-ALPN، سپس HTTP-01 challenge موفق و در نهایت `certificate obtained successfully` برای staging را نشان داد. alert direct curl قبل از پایان صدور certificate رخ داده بود. خطای local-CA installation به route IP موجود مربوط است و برای hostname public staging علت ثبت نشده است.
- Decisions / assumptions: یک direct-origin curl پس از صدور certificate، تنها check باقی‌مانده برای بستن `DEFER-0005` است؛ تا آن زمان Cloudflare Full حفظ می‌شود.
- Deferred or risk IDs: `DEFER-0005` OPEN؛ `RISK-0001`، `RISK-0003` تا `RISK-0007`.
- Rollback / recovery: هیچ تغییر جدیدی انجام نشد؛ rollback همان backup Caddyfile ADR-0015 باقی می‌ماند.

## LOG-0024 — 2026-08-14 — P0-A verification / staging placeholder complete

- Outcome: post-issuance direct-origin test برای staging HTTP/2 503 پاسخ داد؛ external Cloudflare و direct-origin هر دو placeholder ایزوله را تأیید می‌کنند و `DEFER-0005` بسته شد.
- Why: direct-origin verification شرط باقی‌مانده پس از certificate issuance بود و نشان می‌دهد 525 اولیه و alert race برطرف شده‌اند.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/deferred-validation.md` و همین Work Log.
- Commands or actions actually performed: owner ابتدا همان syntax curl را در PowerShell اجرا کرد که به alias `Invoke-WebRequest` map شد و بدون تغییر خطا داد؛ سپس re-test معتبر را در root shell اجرا و evidence را در یک commit محلی ثبت کرد. هیچ server configuration، DNS/TLS-mode، container یا backup setting و هیچ push remote تغییر نکرد.
- Verification actually performed and result: direct-origin curl با hostname/SNI staging پاسخ HTTP/2 503 و headerهای امنیتی مورد انتظار داد. placeholder مستقل است و به production proxy نمی‌شود.
- Decisions / assumptions: برای PowerShell در آینده از `curl.exe` استفاده می‌شود؛ ADR-0015 placeholder complete است. Full(strict) و real staging همچنان scope جداگانه و gateهای خود را دارند.
- Deferred or risk IDs: `DEFER-0005` CLOSED؛ `RISK-0001`، `RISK-0003` تا `RISK-0007` باقی مانده‌اند.
- Rollback / recovery: rollback Caddyfile backup ADR-0015 حفظ می‌شود؛ چون verification تغییر جدیدی نداشت، rollback فوری لازم نیست.

## LOG-0025 — 2026-08-14 — P0-A execution / backup tooling installed

- Outcome: restic 0.18.1 و Ubuntu rclone 1.60.1 build روی VPS نصب و version آن‌ها تأیید شد؛ OS گزارش داد هیچ service/container restart نشده است.
- Why: provisioning backup رمزنگاری‌شده به executableهای stable و signed نیاز داشت؛ نصب از repository Ubuntu برای reproducibility انتخاب شد.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/governance/BACKUP_POLICY.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: owner package index را refresh کرد، candidate versionها را بررسی و سپس `restic` و `rclone` را با exact package versionهای Ubuntu نصب و version commandها را اجرا کرد؛ evidence در یک commit محلی ثبت شد. هیچ push remote انجام نشد.
- Verification actually performed and result: restic 0.18.1 و rclone 1.60.1 build گزارش شدند؛ installer اعلام کرد kernel/service/container/session restart لازم نیست. OAuth، rclone remote، restic repository، password file، job و restore هنوز ایجاد نشده‌اند.
- Decisions / assumptions: headless OAuth با flow رسمی `rclone config` → local `rclone authorize` انجام می‌شود؛ token/config-token در chat، Git، Work Log یا command history ثبت نمی‌شود.
- Deferred or risk IDs: `RISK-0001`، `RISK-0003` تا `RISK-0007`؛ `RISK-0003` High/Open.
- Rollback / recovery: package installation قابل uninstall است اما تا پایان provisioning حفظ می‌شود؛ عدم موفقیت OAuth هیچ داده یا backup repository ایجاد نمی‌کند.

## LOG-0026 — 2026-08-14 — P0-A diagnosis / headless Google OAuth callback

- Outcome: نخستین rclone configuration پیش از ذخیرهٔ remote قطع شد. browser callback localhost به VPS tunnel نشده بود، بنابراین اتصال browser رد شد و OAuth کامل نشد.
- Why: auto-config روی headless VPS listener را روی localhost خود سرور باز می‌کند؛ localhost مرورگر لپ‌تاپ همان endpoint نیست.
- Scope / files: `docs/governance/BACKUP_POLICY.md` و همین Work Log.
- Commands or actions actually performed: owner rclone config را شروع، Google Drive/type/scope را انتخاب و در callback browser flow وقفه ایجاد کرد؛ سپس با Ctrl+C خارج شد. procedure در یک commit محلی ثبت شد. هیچ token/config-token در project ثبت، remote/repository/job ایجاد یا push remote انجام نشد.
- Verification actually performed and result: browser `127.0.0.1:53682` را unavailable نشان داد که با نبود SSH local tunnel سازگار است. flow جایگزین localhost-only SSH tunnel انتخاب شد.
- Decisions / assumptions: از یک SSH `-L` temporary tunnel و auto-config استفاده می‌شود؛ tunnel پس از OAuth بسته می‌شود. token در chat یا Work Log وارد نمی‌شود.
- Deferred or risk IDs: `RISK-0003` High/Open؛ OAuth provisioning هنوز pending است.
- Rollback / recovery: چون config کامل نشد، server-side rollback ندارد؛ tunnel temporary و بدون persistence است.

## LOG-0027 — 2026-08-14 — P0-A diagnosis / incomplete rclone OAuth token

- Outcome: rclone remote entry ایجاد شده اما validation آن با `empty token found` رد شد؛ OAuth callback پیش از ذخیرهٔ token کامل نشده است.
- Why: وجود نام remote به‌تنهایی authentication معتبر نیست؛ قبل از init repository باید ریموت با یک read-only listing واقعی اثبات شود.
- Scope / files: همین Work Log.
- Commands or actions actually performed: owner remote را از rclone config خارج و `rclone lsd` برای فولدر target اجرا کرد؛ command با خطای empty token و exit code 1 تمام شد. evidence در یک commit محلی ثبت شد؛ هیچ repository، backup data یا credential در Git ثبت و هیچ push remote انجام نشد.
- Verification actually performed and result: remote configuration نام‌دار وجود دارد اما OAuth token خالی است. temporary SSH tunnel فعال است و remote باید با `rclone config reconnect` تکمیل شود.
- Decisions / assumptions: remote جدید ساخته نمی‌شود؛ reconnect از طریق localhost SSH tunnel انجام و سپس همان read-only listing تکرار می‌شود.
- Deferred or risk IDs: `RISK-0003` High/Open؛ OAuth/repository/job/restore همچنان pending.
- Rollback / recovery: reconnect ناموفق فقط config بدون token باقی می‌گذارد؛ در صورت نیاز remote ناقص بعداً حذف و مجدداً ساخته می‌شود، بدون اثر بر دادهٔ Drive.

## LOG-0028 — 2026-08-14 — P0-A execution / Google Drive OAuth and target access verified

- Outcome: reconnect ریموت موجود rclone از طریق tunnel موقت localhost کامل شد و دسترسی read-only به پوشهٔ تأییدشدهٔ Google Drive با exit code `0` اثبات شد.
- Why: قبل از ایجاد repository رمزنگاری‌شده، باید اتصال remote و دسترسی واقعی به پوشهٔ مقصد بدون ثبت credential در مستندات تأیید می‌شد.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/governance/BACKUP_POLICY.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک روی VPS `rclone config reconnect` را برای همان remote موجود اجرا کرد، auto-config را از tunnel موقت localhost تکمیل کرد، و سپس `rclone lsd` را برای پوشهٔ مقصد اجرا کرد؛ Google هیچ Shared Drive در حساب نشان نداد، بنابراین remote به Drive معمولی متصل است. هیچ token، config-token، password یا محتوای backup در Git یا Work Log ثبت نشد و هیچ push remote انجام نشد.
- Verification actually performed and result: `rclone lsd` برای مسیر target با `rclone_target_exit=0` تمام شد. خروجی خالی با پوشهٔ مقصد بدون زیرپوشه سازگار است؛ این فقط اثبات دسترسی است، نه ایجاد repository یا snapshot.
- Decisions / assumptions: remote موجود حفظ می‌شود؛ مرحلهٔ بعد فقط پس از ایجاد امن password file خارج از Git، `restic init` و نخستین snapshot کنترل‌شده انجام می‌شود. tunnel پس از پایان OAuth باید بسته شود.
- Deferred or risk IDs: `RISK-0003` همچنان High/Open است؛ repository، password، job، retention و restore rehearsal هنوز انجام نشده‌اند.
- Rollback / recovery: اگر دسترسی Drive در آینده revoke شود، remote دیگر repository را قابل‌دسترسی نمی‌کند اما هیچ داده‌ای حذف نمی‌شود؛ قبل از هر عملیات destructive باید restore/runbook بررسی شود.

## LOG-0029 — 2026-08-14 — P0-A diagnosis / interrupted restic repository initialization

- Outcome: نخستین `restic init` پیش از تکمیل با signal interrupt متوقف شد؛ `restic snapshots` بلافاصله پس از آن نبودن repository config را گزارش کرد. repository معتبر یا snapshot ایجادشده اثبات نشده است.
- Why: init به password file محلی و remote معتبر نیاز داشت، اما interruption پیش از آن رخ داد؛ اجرای command بعدی نمی‌تواند init ناقص را جایگزین کند.
- Scope / files: فقط همین Work Log.
- Commands or actions actually performed: مالک directory/password file محلی را ایجاد و environment مربوط به rclone/restic را تنظیم کرد، سپس `restic init` و `restic snapshots` را اجرا کرد. init با context canceled تمام شد و snapshots config پیدا نکرد. هیچ password، token، یا backup data در Git یا Work Log ثبت نشد و هیچ push remote انجام نشد.
- Verification actually performed and result: نخستین listing با interrupt متوقف شد (exit `130`)؛ تکرار بدون interrupt نشان داد parent دارای تنها directory `restic-repository/` است و درون آن فقط `data/`، `index/`، `keys/`، `locks/` و `snapshots/` وجود دارند. در root repository فایل `config` وجود ندارد، پس repository معتبر نیست. `rclone size` سپس `0` object و `0 B` نشان داد و listing recursive هیچ فایل دیگری نداشت؛ artifact دقیق برای cleanup تأیید شد.
- Decisions / assumptions: پاک‌سازی فقط target صریح `gdrive_taha_backup:taha-personal-platform-backups/restic-repository` را در بر می‌گیرد و تنها به‌دلیل شمارش صفر/نبود config مجاز است. بعد از cleanup، init با اجرای بدون interruption تکرار و جداگانه ثبت می‌شود.
- Deferred or risk IDs: `RISK-0003` High/Open؛ repository/job/retention/restore هنوز pending هستند.
- Rollback / recovery: بررسی بعدی فقط read-only است. حذف احتمالی artifact ناقص بدون inventory صریح و تأیید مالک انجام نمی‌شود.

## LOG-0030 — 2026-08-14 — P0-A execution / encrypted restic repository initialized

- Outcome: artifact ناقصِ صفر-bایت از مسیر دقیق repository پاک‌سازی شد و `restic init` در retry بدون interruption یک repository رمزنگاری‌شدهٔ format-v2 ساخت. `restic snapshots` آن را با موفقیت باز کرد؛ هنوز snapshotی وجود ندارد.
- Why: repository معتبر و password file خارج از Git پیش‌نیاز backup واقعی، retention و restore rehearsal هستند.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/governance/BACKUP_POLICY.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک با `rclone purge` فقط مسیر inventory‌شدهٔ صفر-bایت را پاک کرد، متغیرهای repository/password file را در root shell تنظیم کرد و `restic init` و `restic snapshots` را اجرا کرد. password، token، شناسهٔ کامل repository یا دادهٔ backup در Git یا Work Log ثبت نشد و هیچ push remote انجام نشد.
- Verification actually performed and result: init repository را ایجاد کرد و snapshots آن را بدون خطا باز کرد؛ ایجاد cache محلی restic نیز گزارش شد. این evidence ایجاد repository را ثابت می‌کند، نه backup شدن هیچ source data.
- Decisions / assumptions: نخستین snapshot باید database dump streamed، media volume و configuration لازم را بدون چاپ secret پوشش دهد. سپس retention/job و restore rehearsal جداگانه اجرا و ثبت می‌شوند.
- Deferred or risk IDs: `RISK-0003` همچنان High/Open است؛ first snapshot، job، retention و restore rehearsal باقی مانده‌اند.
- Rollback / recovery: repository تازه هیچ snapshotی ندارد؛ revoke OAuth دسترسی آینده را قطع می‌کند ولی داده‌ای حذف نمی‌کند. حذف repository معتبر فقط با approval صریح مالک و inventory تازه مجاز است.

## LOG-0031 — 2026-08-14 — P0-A verification / first backup source preflight

- Outcome: preflight فقط‌خواندنی برای نخستین backup واقعی PASS شد: PostgreSQL container دارای `POSTGRES_USER` و executable `pg_dumpall` است؛ media volume، Caddyfile و هر دو Compose file قابل‌خواندن‌اند.
- Why: قبل از snapshot باید sourceهای backup و روش stream شدن dump تأیید شوند تا backup ناقص یا نمایش secret رخ ندهد.
- Scope / files: فقط همین Work Log.
- Commands or actions actually performed: مالک command بدون نمایش مقدار environment برای PostgreSQL و `test`های read-only برای media/Caddy/Compose اجرا کرد؛ سپس file-name inventory محدود repository انجام شد. هیچ dump، تغییر container یا تغییر Caddy/Compose رخ نداد و هیچ secret یا push remote ثبت نشد.
- Verification actually performed and result: همهٔ چهار preflight exit code `0` داشتند. inventory سطح اول repository فقط فایل‌های غیرمحرمانهٔ Compose، مثال environment و metadata را نشان داد؛ هیچ production environment file در همان سطح مشاهده نشد.
- Decisions / assumptions: نخستین snapshot شامل stream `pg_dumpall`، media volume، Caddyfile و هر دو Compose file خواهد بود. چون production environment file در inventory مشاهده نشد، چیزی حدس زده یا به backup اضافه نمی‌شود.
- Deferred or risk IDs: `RISK-0003` High/Open؛ first snapshot/job/retention/restore هنوز pending هستند.
- Rollback / recovery: preflight read-only است و rollback ندارد. اگر backup command خطا دهد، snapshot status پیش از هر retry بررسی می‌شود.

## LOG-0032 — 2026-08-14 — P0-A execution / partial first snapshot and PostgreSQL command correction

- Outcome: نخستین snapshot media/config با موفقیت ذخیره و retention policy اعمال شد، اما PostgreSQL command پیش از اجرای dump شکست خورد؛ بنابراین snapshot دیتابیس ساخته نشد و backup هنوز جزئی است.
- Why: `restic backup --stdin-from-command` نیاز دارد پیش از command separator `--` قرار گیرد؛ بدون آن restic آرگومان `-ceu` مربوط به shell داخل container را به‌عنوان فلگ خودش parse کرد.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/governance/BACKUP_POLICY.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک command stream PostgreSQL، backup مستقیم media/Caddy/Compose، `restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune` و `restic snapshots` را اجرا کرد. command PostgreSQL با خطای flag متوقف شد. backup media/config با سه file و یازده directory جدید ذخیره شد و policy همان snapshot را نگه داشت. هیچ dump plaintext، password یا token ثبت نشد و هیچ push remote انجام نشد.
- Verification actually performed and result: repository یک snapshot با tagهای `production,media,config` و pathهای media/Caddy/Compose نشان داد. هیچ snapshot با tag PostgreSQL یا فایل dump ایجاد نشده است.
- Decisions / assumptions: retry PostgreSQL باید از syntax مستند `--stdin-from-command -- <command>` استفاده کند؛ نتیجهٔ آن جداگانه با `restic snapshots --tag postgres` تأیید می‌شود. retention policy در همین slice با evidence واقعی اعمال شده است.
- Deferred or risk IDs: `RISK-0003` High/Open؛ PostgreSQL snapshot، scheduled job و restore rehearsal باقی مانده‌اند.
- Rollback / recovery: snapshot موفق media/config حفظ می‌شود. command ناموفق snapshot ایجاد نکرد، بنابراین retry بعدی به cleanup نیاز ندارد؛ هر failure بعدی پیش از retry با snapshots بررسی می‌شود.

## LOG-0033 — 2026-08-14 — P0-A execution / complete initial encrypted backup verified

- Outcome: retry PostgreSQL با syntax درست stream موفق شد؛ snapshot database ایجاد شد و `restic check` هر دو snapshot موجود را بدون خطا تأیید کرد. نخستین backup کاملِ sourceهای تأییدشده اکنون وجود دارد.
- Why: backup اولیه باید database، media و configuration را پوشش دهد و repository integrity پیش از automation تأیید شود.
- Scope / files: `PROJECT_MANIFEST.md`، `docs/governance/BACKUP_POLICY.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: مالک retry `restic backup --stdin-from-command -- docker exec ... pg_dumpall` را اجرا کرد، سپس snapshotهای tag PostgreSQL و `restic check` را اجرا کرد. syntax separator از راهنمای رسمی restic تأیید شد. هیچ dump plaintext، password یا token ثبت نشد و هیچ push remote انجام نشد.
- Verification actually performed and result: snapshot PostgreSQL با فایل `postgres-all.sql` ذخیره شد؛ check هر دو snapshot/index/blob را بررسی و `no errors were found` گزارش کرد. snapshot پیشین media/config نیز حفظ شد.
- Decisions / assumptions: automation روزانه باید همین دو backup operation، retention فعلی و lock عدم هم‌پوشانی را اجرا کند. restore rehearsal همچنان فقط در staging مستقل مجاز است.
- Deferred or risk IDs: `RISK-0003` High/Open؛ scheduled job و staging restore rehearsal باقی مانده‌اند.
- Rollback / recovery: snapshotهای معتبر حفظ می‌شوند. اگر automation بعداً fail شود، هیچ snapshotی حذف نمی‌شود؛ journal و snapshot metadata بررسی و رخداد جداگانه ثبت می‌شود.

## LOG-0034 — 2026-08-14 — P0-A hardening / Linux line-ending contract for backup artifacts

- Outcome: Git attribute policy اکنون برای script، systemd unit، timer و environment template backup صراحتاً LF را الزام می‌کند.
- Why: Git روی Windows هنگام stage کردن artifactهای Linux هشدار conversion داد. بدون contract صریح، checkout یا انتقال آینده می‌توانست CRLF و در نتیجه failure shebang/systemd ایجاد کند.
- Scope / files: `.gitattributes` و همین Work Log.
- Commands or actions actually performed: `git ls-files --eol` و `git check-attr` برای artifactها اجرا شد؛ قبل از fix attribute مربوط به آن‌ها unspecified بود. policy محدود LF افزوده شد و `bash -n` script و `git diff --check` موفق شدند. هیچ server file یا secret تغییر نکرد و هیچ push remote انجام نشد.
- Verification actually performed and result: هر چهار artifact backup اکنون `text: set` و `eol: lf` گزارش می‌شوند؛ syntax check shell نیز PASS است.
- Decisions / assumptions: همهٔ artifactهای قابل‌انتقال به Linux در `infra/backup/` باید LF بمانند؛ sourceها تنها پس از این guard به VPS منتقل می‌شوند.
- Deferred or risk IDs: `RISK-0003` High/Open؛ automation و restore rehearsal هنوز اجرا نشده‌اند.
- Rollback / recovery: تغییر فقط Git attribute است؛ حذف rule فقط در صورت تغییر target execution platform و همراه با evidence جدید مجاز است.

## LOG-0035 — 2026-08-14 — P0-A implementation / scheduled backup artifacts and recovery runbook

- Outcome: source-controlled daily backup script، systemd service/timer، non-secret environment template و recovery runbook آماده شدند؛ هنوز هیچ‌کدام روی VPS نصب یا enabled نشده‌اند.
- Why: نخستین snapshot کامل و check موفق، baseline لازم برای automation کنترل‌شده را فراهم کرد. artifactها باید version-controlled، قابل‌بررسی و بدون secret باشند.
- Scope / files: `infra/backup/`، `docs/governance/BACKUP_RUNBOOK.md`، `docs/governance/BACKUP_POLICY.md`، `PROJECT_MANIFEST.md`، Task Spec، Risk Register و همین Work Log.
- Commands or actions actually performed: artifactها در repository ایجاد شدند؛ script با `bash -n` بررسی شد و policy LF با `git check-attr` تأیید شد. runbook نصب، monitoring، retention، failure response و restore صرفاً در staging را تعیین می‌کند. هیچ systemd unit، server file یا scheduled job روی VPS تغییر نکرد و هیچ push remote انجام نشد.
- Verification actually performed and result: source script syntax-valid است و unit/timer/template تحت Git contract LF قرار دارند. installation/daemon-reload/manual service run هنوز evidence ندارند.
- Decisions / assumptions: timer روزانه 03:20 UTC با jitter ده دقیقه‌ای، lock عدم هم‌پوشانی و retention 7 daily/4 weekly/12 monthly خواهد داشت. service فقط sourceهای inventory‌شده را backup می‌کند و database dump را بدون plaintext file stream می‌کند.
- Deferred or risk IDs: `RISK-0003` High/Open؛ server installation، timer evidence و staging restore rehearsal باقی مانده‌اند.
- Rollback / recovery: تا قبل از install rollback لازم نیست. پس از install، disable timer و حذف فقط فایل‌های مشخص‌شده در runbook automation را متوقف می‌کند، بدون حذف snapshotها.

## LOG-0036 — 2026-08-14 — P0-A execution / installed systemd backup service succeeded

- Outcome: backup service نصب‌شده تحت systemd با status `0/SUCCESS` پایان یافت، دو snapshot جدید PostgreSQL و media/config ساخت و retention policy را با evidence واقعی اعمال کرد.
- Why: artifactهای repository به‌تنهایی automation نیستند؛ باید service واقعی روی VPS اجرا و رفتار آن با journal/status تأیید می‌شد.
- Scope / files: `PROJECT_MANIFEST.md`، Backup Policy/Runbook، Task Spec، Risk Register و همین Work Log.
- Commands or actions actually performed: مالک artifactهای version-controlled را با permissionهای تعریف‌شده نصب کرد، daemon-reload و unit/calendar validation را اجرا کرد، timer را enable/start کرد و service را دستی برای smoke واقعی اجرا کرد. هیچ secret، dump plaintext یا push remote ثبت نشد.
- Verification actually performed and result: service به‌صورت clean deactivated شد و `ExecStart` با `status=0/SUCCESS` تمام شد. journal snapshotهای PostgreSQL و media/config را نشان داد؛ retention برای هر دو گروه دو snapshot را نگه داشت. wall-clock حدود 5m39s، peak memory حدود 64.5MB و CPU حدود 2.1s گزارش شد. timer نیز `enabled` و `active` است و systemd زمان اجرای بعدی را گزارش کرد.
- Decisions / assumptions: service lock، timeout دو ساعته و retention جاری حفظ می‌شوند. restore rehearsal فقط در staging مستقل مجاز است.
- Deferred or risk IDs: `RISK-0003` High/Open؛ فقط staging restore rehearsal باقی مانده است.
- Rollback / recovery: در صورت نیاز، `systemctl disable --now taha-platform-backup.timer` اجرای آینده را متوقف می‌کند و snapshotها را حذف نمی‌کند. هیچ rollbackی در این اجرا لازم نشد.

## LOG-0037 — 2026-08-14 — P0-A verification / timer active and harmless interrupted listing

- Outcome: timer backup به‌صورت `enabled` و `active` تأیید شد و systemd زمان trigger بعدی را نمایش داد. فرمان read-only `restic snapshots` پس از این evidence با interrupt متوقف شد؛ هیچ backup job، timer یا snapshotی قطع نشد.
- Why: تشخیص باید بین interruption یک command مشاهده‌ای و interruption service backup تمایز بگذارد.
- Scope / files: `PROJECT_MANIFEST.md`، Backup Policy، Task Spec، Risk Register و همین Work Log.
- Commands or actions actually performed: مالک `systemctl is-enabled`، `systemctl is-active`، `systemctl status` و `systemctl list-timers` را اجرا کرد. خروجی list-timers در pager نشان داده شد و سپس فرمان `restic snapshots` با Ctrl+C متوقف شد. هیچ secret یا push remote ثبت نشد.
- Verification actually performed and result: timer enabled/active بود و next elapse برای روز بعد در UTC ثبت شد. service قبلی status موفق داشت. خطای signal interrupt فقط مربوط به command listing است و نشانگر repository corruption یا failure backup نیست.
- Decisions / assumptions: backup automation عملیاتی است؛ از re-run غیرضروری snapshots بلافاصله پس از interrupt خودداری می‌شود. evidence بعدی باید restore rehearsal روی staging مستقل باشد.
- Deferred or risk IDs: `RISK-0003` High/Open؛ restore rehearsal باقی مانده است.
- Rollback / recovery: timer را می‌توان بدون حذف snapshot با `systemctl disable --now taha-platform-backup.timer` متوقف کرد. interrupt listing هیچ recovery لازم ندارد.

## LOG-0038 — 2026-08-14 — P0-A planning / isolated restore rehearsal defined

- Outcome: یک Task Spec مستقل برای restore rehearsal غیرمخرب ایجاد شد؛ scope آن فقط recovery به target موقت root-only و verification فایل‌ها است.
- Why: restore عملیاتی HIGH-RISK است و نباید با backup موفق یا staging placeholder اشتباه گرفته شود. scope صریح مانع restore ناخواسته روی production می‌شود.
- Scope / files: `docs/plan/P0-A-restore-rehearsal-task-spec.md` و همین Work Log.
- Commands or actions actually performed: فقط Task Spec و evidence requirements ایجاد شدند. هیچ restore، cleanup، container، database import، service/timer یا production file تغییر نکرد و هیچ push remote انجام نشد.
- Verification actually performed and result: preconditionها از evidence LOG-0036/0037 قابل‌ارزیابی‌اند، اما اجرای restore هنوز pending است.
- Decisions / assumptions: temporary target زیر `/dev/shm` با permission `0700` انتخاب می‌شود تا plaintext restore persistent نشود. این test `RISK-0003` را به‌تنهایی نمی‌بندد، زیرا database import در staging واقعی را آزمایش نمی‌کند.
- Deferred or risk IDs: `RISK-0003` High/Open؛ restore rehearsal و سپس staging database import evidence باقی می‌ماند.
- Rollback / recovery: تا اجرای task تغییری برای rollback نیست. هر failure restore production را دست‌نخورده می‌گذارد و target موقت برای diagnosis نگه داشته می‌شود.

## LOG-0039 — 2026-08-14 — P0-A diagnosis / restore rehearsal guard blocked pre-existing target

- Outcome: restore rehearsal پیش از هر restore به‌دلیل وجود target ثابت از قبل موجود متوقف شد. guard این رفتار را عمداً رد کرد؛ هیچ داده‌ای restore، overwrite یا حذف نشد.
- Why: target ثابت replay-safe نبود و وجود آن به‌معنای نامشخص بودن ownership/محتوا بود. حذف یا reuse بدون inventory با قرارداد recovery سازگار نیست.
- Scope / files: Task Spec restore rehearsal و همین Work Log.
- Commands or actions actually performed: مالک script restore را ابتدا در context کاربر غیر-root و سپس root اجرا کرد؛ هر دو بار precondition مسیر موجود را تشخیص دادند و قبل از فراخوانی restic خارج شدند. هیچ secret، snapshot، container، database یا production file تغییر نکرد و هیچ push remote انجام نشد.
- Verification actually performed and result: پیام `Refusing to reuse restore target` اثبات می‌کند guard قبل از write عمل کرده است. محتوای target قدیمی هنوز inventory نشده و نباید حذف شود.
- Decisions / assumptions: Task Spec برای ایجاد target یکتای `mktemp -d` اصلاح شد. inventory non-sensitive مسیر قدیمی فقط برای ثبت وضعیت انجام می‌شود؛ rehearsal بعدی هرگز آن را reuse نمی‌کند.
- Deferred or risk IDs: `RISK-0003` High/Open؛ restore rehearsal هنوز اجرا نشده است.
- Rollback / recovery: تغییری رخ نداده است. مسیر قدیمی تا تعیین ownership محفوظ می‌ماند؛ target یکتای بعدی فقط پس از verification موفق پاک می‌شود.

## LOG-0040 — 2026-08-14 — P0-A execution / isolated encrypted restore rehearsal passed

- Outcome: PostgreSQL و media/config snapshotهای انتخاب‌شده با موفقیت به یک target یکتای root-only در `/dev/shm` restore شدند؛ dump non-empty بود، سه configuration file با source برابر بودند، count فایل‌های media برابر بود و target جدید پس از verification حذف شد.
- Why: backup و repository check به‌تنهایی recoverability را اثبات نمی‌کنند. این rehearsal مسیر decrypt/read/restore را بدون تغییر production اثبات می‌کند.
- Scope / files: Manifest، Backup Policy/Runbook، هر دو Task Spec، Risk Register، Deferred Validation و همین Work Log.
- Commands or actions actually performed: مالک capacity `/dev/shm` را بررسی کرد، target یکتا با `mktemp` ساخت، دو snapshot را restore کرد، test/cmp/count غیرمحرمانه را اجرا و فقط همان target یکتا را حذف کرد. target قدیمی deploy-owned صرفاً با owner/mode/type مشاهده و دست‌نخورده ماند. هیچ SQL import، container، service/timer، production file یا push remote تغییر نکرد.
- Verification actually performed and result: restore PostgreSQL یک فایل در حدود 143KiB را در حدود یک ثانیه و restore media/config چهارده entry را در حدود پنجاه ثانیه گزارش کرد. تمام assertionها PASS و `restore_rehearsal=PASS` چاپ شد؛ cleanup target یکتا نیز PASS بود.
- Decisions / assumptions: این evidence file-level recovery را می‌بندد، اما import دیتابیس در staging runtime جداگانه همچنان برای closure `RISK-0003` لازم است. directory قدیمی deploy-owned در `DEFER-0006` ثبت شد.
- Deferred or risk IDs: `RISK-0003` High/Open؛ `DEFER-0006` Low/Open.
- Rollback / recovery: restore به production ننوشت و target یکتای rehearsal حذف شد؛ rollback لازم نیست. برای مرحلهٔ بعدی فقط staging runtime جداگانه و Task Spec مجاز است.

## LOG-0041 — 2026-08-14 — P0-G0 planning / fast safe-live implementation backlog

- Outcome: یک backlog اجرایی ریشه‌ای در `Task-list.md` ساخته شد که ۸۱ task و ۳۲۴ checkbox را از closure گیت P0-G0 تا P11 پوشش می‌دهد و مسیر بحرانی first live را به یک release ایستای P1 بدون CMS/database/contact persistence جدید محدود می‌کند.
- Why: هدف مالک کوتاه‌کردن time-to-live همراه با انتقال صریح تست‌ها و hardening غیرحیاتی به بعد از release بود؛ برنامه باید بین defer مجاز و Stop-the-line/Minimum Safe Gate تمایز می‌گذاشت.
- Scope / files: `Task-list.md`، `docs/plan/P0-G0-fast-safe-live-task-list-task-spec.md` و همین Work Log. هیچ application، dependency، infrastructure، server، DNS، backup، CI یا deployment state تغییر نکرد.
- Commands or actions actually performed: inventory فایل‌ها و Git/history، خواندن قراردادهای حاکم و evidenceهای P0-A، فهرست کامل sectionهای Product/Architecture/IA/Design baseline و بررسی بخش‌های مرتبط با phaseها، release، locale، security، operations و P1 انجام شد؛ سپس Task Spec و task list ایجاد شدند.
- Verification actually performed and result: بررسی programmatic وجود G0/P0A/P0B/P1 تا P11، risk/locale/admin/deferred contracts PASS شد؛ ۸۱ task ID یکتا و ۳۲۴ checkbox شمارش شد؛ scan عبارت‌های placeholder و مسیرهای legacy PASS و `git diff --check` بدون خطا تمام شد.
- Decisions / assumptions: مسیر پیشنهادی `R0 Gate closure → R1 static deployment spine → R2 bilingual P1 production` است. defer کردن staging database import فقط با پذیرش صریح و محدود مالک برای static-only P1 مجاز است؛ تصمیم مالک، inventory/rollback stack موجود و production approval همچنان blocker واقعی اجرای برنامه‌اند.
- Deferred or risk IDs: هیچ ID جدیدی ایجاد نشد چون این slice فقط برنامه‌ریزی است. برنامه وضعیت فعلی `RISK-0001`، `RISK-0003` تا `RISK-0007` و `DEFER-0001` تا `DEFER-0006` را تغییر نمی‌دهد.
- Rollback / recovery: این تغییر کاملاً مستندی است؛ rollback فقط حذف دو فایل جدید task-owned و بازگرداندن همین entry است و هیچ runtime data یا server state را لمس نمی‌کند.

## LOG-0042 — 2026-08-14 — Agent tooling / 9Router credential exposure report

- Outcome: یک credential ارسال‌شده در گفت‌وگو به‌عنوان exposure ثبت و `RISK-0008` با وضعیت `BLOCKED` ایجاد شد.
- Why: credential گفتگو نباید در repository، log، output یا configuration پایدار بازنشر شود و تا rotation نباید برای اتصال agentها استفاده شود.
- Scope / files: فقط `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: Risk Register بدون درج مقدار credential به‌روزرسانی شد؛ هیچ اتصال 9Router، config OpenCode، provider، VPS یا secret store تغییر نکرد.
- Verification actually performed and result: entry جدید `RISK-0008` شامل owner، trigger، mitigation و شرط rotation است و هیچ مقدار credential در diff وجود ندارد.
- Decisions / assumptions: 9Router تا rotation مستقل credential و اتصال تعاملی امن، فقط یک capability بالقوه است و مسیر اجرای R0.1 به آن وابسته نیست.
- Deferred or risk IDs: `RISK-0008`.
- Rollback / recovery: حذف entry فقط در صورت اثبات اینکه exposure رخ نداده بود مجاز است؛ remediation واقعی revoke/rotate credential در dashboard 9Router است.


## LOG-0043 — 2026-08-14 — P0-G0 / Repository metadata publish

- Outcome: Task Spec «P0-G0 repository metadata publish» ایجاد شد؛ `README.md` با نقطهٔ ورود/وضعیت/چیدمانِ مستند به‌عنوان منبع به‌روزرسانی شد و `.gitignore` guardهایی برای فایل‌های environment پشتیبان، artifactهای OS/editor و وضعیت agent-local به دست آورد؛ همین entry ثبت شد. `LOG-0043` استفاده شده است چون worktree اصلی دارای رکوردهای owner-held و uncommitted با شماره‌های `LOG-0041` و `LOG-0042` است.
- Why: README و ignore file باید فقط بر پایهٔ مستندات رسمی repository دقیق می‌بودند و ثبت هر کار طبق Documentation Policy الزامی است.
- Scope / files: `docs/plan/P0-G0-repository-metadata-task-spec.md`، `README.md`، `.gitignore` و `docs/status/WORK_LOG.md`؛ هیچ فایل دیگری تغییر نکرد.
- Commands or actions actually performed: Task Spec ایجاد شد؛ `README.md` و `.gitignore` ویرایش و همین entry ثبت شد. هیچ تغییر runtime، deployment، dependency، infrastructure، secret یا server انجام نشد.
- Verification actually performed and result: قرارداد مستندات (`PROJECT_MANIFEST.md`، `AGENTS.md` و governance policies) خوانده شد؛ لینک‌های نسبی مستندات README وجود دارند؛ `git diff --check` PASS شد.
- Decisions / assumptions: شمارهٔ `LOG-0043` به‌کار رفته است چون worktree اصلی دارای رکوردهای owner-held و uncommitted با شماره‌های `LOG-0041` و `LOG-0042` است و این branch تمیز باید ledger append-only را بدون collision ادامه دهد.
- Deferred or risk IDs: ندارد؛ هیچ deferral یا ریسک جدیدی ایجاد نشد.
- Rollback / recovery: بازگردانی همان چهار فایل task (`docs/plan/P0-G0-repository-metadata-task-spec.md`، `README.md`، `.gitignore`، `docs/status/WORK_LOG.md`).

## LOG-0051 — 2026-08-14 — G0-01 / documentation snapshot and drift fix

- Outcome: وضعیت مستندات با evidence عملیاتی P0-A (LOG-0024 تا LOG-0040) هم‌تراز شد: مسیر نمونهٔ URL admin در Technology Baseline از `/cms/` به `/admin/` (مصوب ADR-0014) اصلاح شد؛ وضعیت عملیاتی ADR-0008 و ADR-0010 در index و خود ADRها به‌روز شد؛ جملهٔ قدیمی «restic password is still not created» در BACKUP_POLICY اصلاح شد؛ شماره‌گذاری تکراری و status قدیمی Task Spec سرور رفع شد؛ و توصیف `RISK-0001` به موانع واقعاً باقی‌مانده (PASS رسمی G0-06، تصمیم مالک، scaffold/CI/deploy) محدود شد.
- Why: G0-01 نخستین task مسیر بحرانی first live است و باید از تناقض مستندات بالادستی دربارهٔ provisioning امروز جلوگیری کند؛ تصمیم‌های ADR پذیرفته‌شده تغییر نکردند.
- Scope / files: `docs/plan/P0-G0-documentation-drift-task-spec.md`، `docs/taha-personal-platform-technology-architecture-baseline-fa.md`، `docs/adr/README.md`، `docs/adr/0008-...`، `docs/adr/0010-...`، `docs/governance/BACKUP_POLICY.md`، `docs/plan/P0-A-server-access-dns-backup-task-spec.md`، `docs/status/RISK_REGISTER.md` و همین Work Log.
- Commands or actions actually performed: `git diff --check`؛ grep `/cms/` روی Technology Baseline؛ script بررسی لینک‌های محلی روی فایل‌های لمس‌شده. هیچ scaffold، dependency، API/schema، Docker/Caddy، DNS، VPS، backup، CI یا deploy اجرا نشد.
- Verification actually performed and result: `git diff --check` بدون خطا (PASS)؛ Technology Baseline اکنون هیچ URL-route `/cms/` ندارد و تنها `apps/cms/` به‌عنوان مسیر source باقی است؛ link-check محلی فایل‌های لمس‌شده PASS بود.
- Decisions / assumptions: `apps/cms/` به‌عنوان مسیر source canonical است و تغییر نمی‌کند؛ فقط نمونهٔ URL route به `/admin/` هم‌سو شد. هیچ تصمیم ADR بازنویسی نشد.
- Deferred or risk IDs: `RISK-0001` همچنان BLOCKED (باقی‌مانده: تصمیم gate، scaffold/CI/deploy)؛ `RISK-0003` و `RISK-0004` تا `RISK-0007` تغییر نکردند.
- Rollback / recovery: همهٔ تغییرها صرفاً مستندی و با Git قابل بازگشت‌اند؛ هیچ runtime data یا server state لمس نشده است.

## LOG-0052 — 2026-08-14 — G0-04/G0-05 / first-live technical freeze and minimum ADRs

- Outcome: تصمیم‌های فنی حداقلی R2 در `PROJECT_MANIFEST.md` freeze شد و سه ADR پیشنهادی (0016 static-first Astro + React islands، 0017 artifact نسخه‌دار + atomic switch/rollback، 0018 P1 design/hydration/font minimum) به‌همراه ثبت در index و اصلاح status کهنهٔ ADR-0015 ایجاد شد.
- Why: G0-04/G0-05 بخشی از closure گیت R0 هستند و باید تصمیم‌های غیربدیهی first live را از حافظه/چت جدا کنند؛ بدون scaffold یا install.
- Scope / files: `PROJECT_MANIFEST.md`، سه ADR جدید، `docs/adr/README.md`، `docs/plan/P0-G0-technical-freeze-adrs-task-spec.md` و همین Work Log.
- Commands or actions actually performed: `node --version` (v24.16.0)، `npm --version` (11.18.0)، `npx --version` (11.18.0)، `uv --version` (0.12.3) و `npm view astro version` (7.2.2)، `npm view tailwindcss version` (4.3.3)، `npm view typescript version` (7.0.2) اجرا شد. هیچ install، scaffold، dependency، `.venv` یا runtime اجرا نشد.
- Verification actually performed and result: نسخه‌های محیط و آخرین نسخهٔ Astro/Tailwind/TypeScript از npm ثبت شدند؛ `git diff --check` بدون خطا و link-check محلی فایل‌های لمس‌شده PASS بود.
- Decisions / assumptions: package manager `npm`، Node 24.16.0، Astro static-first؛ React/Tailwind/shadcn/Motion/GSAP/D3/Three/Pagefind/analytics/dark mode همه برای R2 `NOT USED IN R2`؛ font/logo/media `OPEN` وابسته به مالک. ADRها به‌صورت `Proposed` ثبت شدند تا در G0-06 پذیرفته شوند.
- Deferred or risk IDs: `RISK-0001` BLOCKED (تصمیم gate و scaffold باقی است)؛ تغییری در ریسک‌های دیگر نبود.
- Rollback / recovery: فقط مستندات؛ بازگشت با Git.

## LOG-0053 — 2026-08-14 — G0-02/G0-03/G0-06 / gate decision and P0-G0 PASS (static-only P1)

- Outcome: تصمیم مالک برای first live ثبت و گیت به `P0-G0: PASS for static-only P1` منتقل شد: `RISK-0001` بسته شد، `RISK-0003` با پذیرش محدود static-only ثبت شد، header Manifest/AGENTS به‌روز شد و content pack پیشنهادی `fa`/`en` ساخته شد.
- Why: بدون تصمیم مکتوب مالک، scaffold مجاز نیست؛ این slice شرط G0-06 را برآورده می‌کند و scope را صریحاً به static P1 محدود می‌کند.
- Scope / files: `docs/status/RISK_REGISTER.md`، `PROJECT_MANIFEST.md`، `AGENTS.md`، `docs/plan/P0-G0-content-pack-proposal.md`، `docs/plan/P0-G0-gate-decision-task-spec.md` و همین Work Log.
- Commands or actions actually performed: فقط به‌روزرسانی مستندات و ثبت تصمیم؛ هیچ scaffold، dependency، API، Docker/Caddy، DNS، VPS، backup، CI یا deploy اجرا نشد.
- Verification actually performed and result: `git diff --check` بدون خطا. مالک سه تصمیم را تأیید کرد: پذیرش محدود `RISK-0003` برای static-only P1، تهیهٔ پیش‌نویس content pack توسط agent و تأیید توسط مالک، و text-mark + فونت self-host حداقلی.
- Decisions / assumptions: PASS فقط برای static P1 است؛ PASS کلی CMS اعلام نشده و CMS/DB/contact persistence تا P3 مسدودند. content pack پیشنهادی است و هیچ metric/link/evidence حدسی ندارد.
- Deferred or risk IDs: `RISK-0001` CLOSED؛ `RISK-0003` ACCEPTED (limited, static-only P1) با expiry trigger قبل از P3؛ `RISK-0004` تا `RISK-0007` تغییر نکردند.
- Rollback / recovery: بازگشت فقط مستندی؛ در صورت بازگشایی هر risk، گیت دوباره بررسی می‌شود.

## LOG-0054 — 2026-08-14 — P0A-03..06 / P1-01..09 static P1 frontend scaffold and bilingual landing

- Outcome: `apps/web/` به‌صورت static-first Astro + TypeScript + Tailwind v4 scaffold شد و P1 کامل ساخته شد: Language Gateway در `/`، صفحات `/fa/` (RTL) و `/en/` (LTR)، 404 locale-aware، `health.json`، `robots.txt`، `sitemap.xml`، design tokens از `design.md`، و workflow CI در `.github/workflows/ci.yml`. محتوای اصلی بدون JavaScript خوانا است و هیچ React/heavy dependency نصب نشده است.
- Why: پس از `P0-G0: PASS for static-only P1`، scaffold `apps/web/` مجاز شد و این slice خروجی ایستای قابل build برای P1 را فراهم می‌کند.
- Scope / files: `apps/web/**` (source، config، lockfile)، `.github/workflows/ci.yml`، `docs/plan/P0-A-web-scaffold-task-spec.md` و همین Work Log.
- Commands or actions actually performed: در `apps/web/` اجرا شد: `npm install` (294 package)، `npm run check` (astro check: 0 error / 0 warning / 0 hint)، `npm run build` (static output شامل `/`, `/en/index.html`, `/fa/index.html`, `/404.html`, `/health.json`, `/robots.txt`, `/sitemap.xml`). بررسی دستی خروجی `dist/` برای `lang`/`dir`/`canonical`/`hreflang` انجام شد.
- Verification actually performed and result: build و check هر دو PASS؛ `fa` خروجی `lang="fa" dir="rtl"` و canonical/hreflang صحیح دارد؛ `health.json` مقدار `{"status":"ok","service":"static","version":"0.1.0"}` را برمی‌گرداند؛ محتوای فارسی UTF-8 صحیح است.
- Decisions / assumptions: npm به‌عنوان package manager؛ Node 24.16.0؛ Astro 7.2.2؛ Tailwind v4 CSS-first. فونت self-host نهایی نشده (system stack تا تأیید مالک)؛ OG image و contact مقصد ندارند و صادقانه حذف/inactive شده‌اند. CI هنوز روی runner واقعی اجرا نشده است.
- Deferred or risk IDs: بدون ID جدید؛ `RISK-0004` تا `RISK-0007` (deploy/ظرفیت/patch/SSH) برای فاز استقرار باقی‌اند. موارد باقی‌ماندهٔ P1 (viewport/accessibility/visual smoke، OG image، فونت نهایی، staging/prod deploy) برای فاز deploy ثبت می‌شوند.
- Rollback / recovery: `apps/web/` تازه است؛ حذف آن و `ci.yml` تغییر را برمی‌گرداند؛ هیچ server/runtime state لمس نشده است.

## LOG-0055 — 2026-08-14 — P1 / independent verification, content QA and deploy mechanics

- Outcome: دو subagent مستقل (explore و general) به‌صورت read-only پروژه را بازبینی کردند: acceptance ده‌گانهٔ P1 همه PASS و content pack از نظر ترجمه/واقعیت امن بود. چند اصلاح جزئی اعمال شد؛ مکانیک deploy (runbook + Caddy candidate + اسکریپت‌های deploy/rollback) طبق ADR-0017 ایجاد شد و `DEFER-0007` تا `DEFER-0010` ثبت شد.
- Why: verification مستقل، تشخیص مسائل RTL/محتوا و آماده‌سازی مسیر deploy ایستا برای دستیابی به release gate.
- Scope / files: `apps/web/src/data/content.ts`، `apps/web/src/pages/404.astro`، `docs/governance/DEPLOY_RUNBOOK.md`، `infra/caddy/static-site.caddy`، `infra/deploy/deploy.sh`، `infra/deploy/rollback.sh`، `.gitattributes`، `AGENTS.md`، `docs/status/deferred-validation.md`، `Task-list.md` و همین Work Log.
- Commands or actions actually performed: دو subagent (explore/general) اجرا شدند؛ `npm run check` (0 error) و `npm run build` پس از اصلاحات PASS؛ `bash -n` روی هر دو اسکریپت deploy PASS. هیچ VPS/Caddy/DNS/deploy واقعی اجرا نشد.
- Verification actually performed and result: verification report ده مورد PASS و بدون blocker؛ اصلاحات: حذف token مختلط RTL («R&D» → «تحقیق و توسعه»)، بهبود واژگان fa، حذف canonical شبح‌وار در 404. اسکریپت‌ها syntax-valid و LF هستند.
- Decisions / assumptions: deploy mechanics از ADR-0017 پیاده‌سازی شد؛ مسیرهای مطلق (`SITE_ROOT`) و switch تولید تا inventory P0A-01 نهایی می‌مانند. Caddy candidate اعمال نشده و فقط candidate است.
- Deferred or risk IDs: `DEFER-0007` (contact path)، `DEFER-0008` (font)، `DEFER-0009` (OG image)، `DEFER-0010` (browser verification) OPEN؛ `RISK-0004` تا `RISK-0007` برای فاز deploy بازند.
- Rollback / recovery: تغییرات frontend/infra فقط؛ اسکریپت‌های deploy/rollback عملیات سرور انجام نمی‌دهند تا inventory و تأیید مالک.

## LOG-0056 — 2026-08-14 — P1 / HTTP verification, gateway polish and deploy-prep documentation

- Outcome: سایت با preview server واقعی از نظر HTTP اعتبارسنجی شد (همهٔ routeهای public 200، 404 صحیح، بدون link شکسته، CSS سالم)؛ Gateway با SVG field ایستای غیر-blocking و theme-color مطابق design.md §60.5 بهبود یافت؛ Task Spec inventory فقط‌خواندنی P0A-01 برای مالک، entry DEBT-0001 و وضعیت به‌روز queue تصمیم مالک ثبت شد.
- Why: تأیید خروجی پیش از استقرار و آماده‌سازی گام‌های بعدی (deploy روی VPS) به‌صورت turnkey و بدون حدس.
- Scope / files: `apps/web/src/pages/index.astro`، `apps/web/src/layouts/BaseLayout.astro`، `docs/plan/P0-A-stack-inventory-task-spec.md`، `docs/status/TECH_DEBT.md`، `Task-list.md` (بخش 18) و همین Work Log.
- Commands or actions actually performed: `npm run preview -- --port 4321` به‌همراه `curl.exe` برای routeهای `/`, `/en/`, `/fa/`, `/404`, `/health.json`, `/robots.txt`, `/sitemap.xml`, `/nonexistent-path`؛ link-check استخراج href/src و بررسی 200؛ بررسی فایل‌های CSS. سپس `npm run check` (0 error) و `npm run build` PASS.
- Verification actually performed and result: `GET /`, `/en/`, `/fa/`, `/health.json`, `/robots.txt`, `/sitemap.xml` → 200؛ `/en` و `/fa` بدون slash و مسیرهای ناموجود → 404 (کالک canonical با `trailingSlash: always`؛ redirect لایهٔ deploy در P0A-06 ثبت شده)؛ link-check 4 لینک یکتا PASS؛ CSS هر دو فایل 200 با محتوای کامل. SVG gateway دارای no-JS/no-motion fallback است.
- Decisions / assumptions: شکل canonical URLها با slash است؛ redirect بدون-slash در Caddy (P0A-06) انجام می‌شود. inventory فقط‌خواندنی VPS توسط مالک اجرا می‌شود؛ هیچ server command توسط agent اجرا نشد.
- Deferred or risk IDs: `DEBT-0001` OPEN؛ `DEFER-0007` تا `DEFER-0010` OPEN؛ `RISK-0004`/`RISK-0007` پس از inventory به‌روز می‌شوند.
- Rollback / recovery: تغییرات فقط frontend/docs؛ build دوباره تمام قدیم را برمی‌گرداند.

## LOG-0057 — 2026-08-14 — P1 / canonical commands, dependency scan and status sync

- Outcome: فرمان‌های تأییدشدهٔ `apps/web/` در `PROJECT_MANIFEST.md` به‌عنوان canonical ثبت شدند، `npm audit` اجرا شد (0 vulnerability)، وضعیت scaffold در Manifest و README هم‌تراز واقعیت شد.
- Why: طبق P0A-03، فرمان‌های app فقط پس از اجرای واقعی و ثبت در Manifest canonical می‌شوند؛ README/Manifest نباید وضعیت کهنه را نمایش دهند.
- Scope / files: `PROJECT_MANIFEST.md`، `README.md` و همین Work Log.
- Commands or actions actually performed: در `apps/web/`: `npm audit --audit-level=high` → `found 0 vulnerabilities`. فرمان‌های install/check/build/preview قبلاً با evidence LOG-0054/0056 اجرا شده‌اند.
- Verification actually performed and result: audit بدون vulnerability؛ ساختار canonical commands در Manifest با فرمان‌های واقعاً اجراشده یکسان است.
- Decisions / assumptions: فرمان‌های CMS/deploy همچنان canonical نیستند و تا slice مربوطه ثبت نمی‌شوند.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: تغییرات مستندی؛ بازگشت با Git.

## LOG-0058 — 2026-08-14 — P1 / favicon, OG locale and CI artifact verification

- Outcome: favicon SVG مشتق از text-mark مصوب (`TM` روی Navy با Turquoise)، `og:locale` (fa_IR/en_US) و مرحلهٔ verification در CI (کامل‌بودن artifact + scan الگوی secret) اضافه و به‌صورت محلی اعتبارسنجی شد.
- Why: polish امن/کوچک پیش از release: favicon برای تب مرورگر، metadata OG صحیح، و gate CI که artifact ناقص یا حاوی الگوی secret را رد کند.
- Scope / files: `apps/web/public/favicon.svg`، `apps/web/src/layouts/BaseLayout.astro`، `apps/web/src/pages/index.astro`، `.github/workflows/ci.yml` و همین Work Log.
- Commands or actions actually performed: `npm run check` (0 error) و `npm run build` PASS؛ اجرای محلی همان تست‌های CI (وجود هفت فایل artifact و grep الگوهای secret) → PASS بدون هیچ hit.
- Verification actually performed and result: favicon در `dist/favicon.svg` حاضر؛ scan محلی هیچ الگوی secret در `dist/` پیدا نکرد؛ منطق مرحلهٔ CI پیش از push آزمایش شد.
- Decisions / assumptions: favicon صرفاً مشتق text-mark است و با تأیید لوگوی نهایی جایگزین می‌شود (الگوی مشابه DEFER-0008).
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: تغییرات frontend/CI؛ بازگشت با Git.

## LOG-0059 — 2026-08-15 — R1 / push, CI pass, partial inventory and staging handoff

- Outcome: history محلی با commits metadata ریموت ادغام شد (collision شمارهٔ `LOG-0043` با renumber به `LOG-0051` تا `LOG-0058` رفع شد) و به origin/main push شد؛ CI روی GitHub Actions با `npm ci`/`check`/`build`/artifact verification **PASS** شد؛ inventory فقط‌خواندنی جزئی VPS (Caddyfile، منابع، روند placeholder) ثبت شد؛ artifact نسخه‌دار `release-a2720d9` به VPS منتقل و اسکریپت sudo یک‌فرمانی `stage-p1.sh` آماده شد.
- Why: گام‌های بعدی مسیر first live: فعال‌شدن CI و آماده‌سازی staging deploy به‌صورت turnkey با backup/validate/rollback.
- Scope / files: `.gitignore`، `README.md`، `docs/status/WORK_LOG.md`، `Task-list.md`، `docs/status/RISK_REGISTER.md`، `docs/status/TECH_DEBT.md`، `docs/status/deferred-validation.md`، `infra/deploy/stage-p1.sh`، `docs/governance/DEPLOY_RUNBOOK.md`.
- Commands or actions actually performed: `git merge origin/main` با رفع تعارض؛ `git push origin main` (70dc744..a2720d9)؛ از طریق SSH فقط‌خواندنی: `uname`، `free -m`، `df -h`، `ps` برای Caddy، `cat /etc/caddy/Caddyfile`، `curl -sI` برای production (200) و staging (503)؛ `scp` artifact و `bash -n` روی script در سرور. هیچ دستور sudo یا تغییر Caddy اجرا نشد.
- Verification actually performed and result: `gh run list` → CI completed/success؛ artifact شامل health.json/robots/sitemap/locale roots روی سرور تأیید شد؛ `stage-p1.sh` syntax-valid روی سرور.
- Decisions / assumptions: staging deploy توسط مالک با یک فرمان sudo اجرا می‌شود: `sudo bash ~/taha-stage/stage-p1.sh ~/taha-stage/release-a2720d9`؛ production blocks دست نمی‌خورند. آدرس سرور در `~/.ssh/config` (alias `taha-nl`) است و در repo ثبت نمی‌شود.
- Deferred or risk IDs: `RISK-0004` (inventory Docker هنوز sudo می‌خواهد)، `RISK-0007` (capacity بر اساس 1.1GB available برای staging static کافی ارزیابی می‌شود)؛ بدون ID جدید.
- Rollback / recovery: staging script دارای backup/validate/auto-restore است؛ rollback مسیر در DEPLOY_RUNBOOK ثبت شد.

## LOG-0060 — 2026-08-15 — R1/R2 / staging deploy live and verified (P0A-09)

- Outcome: مالک `sudo bash ~/taha-stage/stage-p1.sh ~/taha-stage/release-a2720d9` را اجرا کرد؛ Caddy validate PASS و reload انجام شد و `staging.tahamohamadi.ir` اکنون artifact ایستای P1 را سرو می‌کند. Bug اولیهٔ permission (artifact scp با mode 0700 → 403 برای caddy user) با `chmod -R a+rX` رفع شد؛ اسکریپت برای آینده با `chown/chmod` نرمال‌سازی و 404 صحیح (بدون try_files) برای اجرای بعدی آماده شد.
- Why: P0A-09 خروجی staging ایستا است؛ این اولین اجرای واقعی مکانیک deploy طبق ADR-0017 است.
- Scope / files: `infra/deploy/stage-p1.sh`، `docs/governance/DEPLOY_RUNBOOK.md`، `docs/status/WORK_LOG.md`.
- Commands or actions actually performed: از این agent: `curl` routeهای staging از مسیر Cloudflare و direct-origin؛ `ssh` فقط‌خواندنی + `chmod -R a+rX` (مالکیت deploy)؛ `bash -n`؛ `scp` اسکریپت اصلاح‌شده؛ commit/push. مالک دستور sudo را اجرا کرد (evidence خروجی در گفت‌وگو).
- Verification actually performed and result: `GET /`, `/en/`, `/fa/`, `/health.json`, `/404.html`, `/favicon.svg` → 200؛ `/en/` محتوای کامل با `lang="en" dir="ltr"`؛ `/fa/` RTL؛ `health.json` = `{"status":"ok","service":"static","version":"0.1.0"}`؛ header `x-robots-tag: noindex, nofollow` فعال؛ production `tahamohamadi.ir` → 200 دست‌نخورده. یافته: Cloudflare edge در مسیر proxy، `/robots.txt` را intercept می‌کند (origin robots صحیح است) — موردی zone-level که مالک در پنل Cloudflare باید بررسی کند.
- Decisions / assumptions: staging block فقط تعویض شد؛ production/www/IP blocks دست‌نخورده‌اند؛ legacy Compose stack بدون تغییر در جریان است.
- Deferred or risk IDs: `DEFER-0011` (بررسی Cloudflare robots/zone)؛ `RISK-0004` progress (inventory Caddy کامل، docker metadata هنوز sudo می‌خواهد).
- Rollback / recovery: restore the exact timestamped `Caddyfile.pre-stage-p1.<timestamp>` backup, validate + reload, و/یا برگرداندن `current` به release قبلی.

## LOG-0061 — 2026-08-15 — P1 / ui-ux-pro-max gateway review and RTL correction

- Outcome: screenshot اولیهٔ staging با `ui-ux-pro-max` و `docs/design.md` review شد. جهت بصری کلی (Navy، selective glass، Turquoise/Gold، technical field) مناسب تشخیص داده شد؛ ایراد واقعی bidi در نمایش نام فارسی، prompt تک‌زبانه، mobile target و reduced-motion اصلاح شد.
- Why: screenshot نشان داد نام `Taha Mohammadi · طه محمدی` در یک خط bidi-safe نیست و فارسی به‌صورت شکسته/ناقص دیده می‌شود؛ این یک مشکل قابل مشاهدهٔ P1 بود، نه صرفاً polish.
- Scope / files: `docs/plan/P1-gateway-ui-review-task-spec.md`، `apps/web/src/pages/index.astro`، `apps/web/src/styles/global.css`، `infra/deploy/stage-p1.sh`، `docs/governance/DEPLOY_RUNBOOK.md`، `docs/status/deferred-validation.md` و همین Work Log.
- Commands or actions actually performed: `ui-ux-pro-max` design-system و UX/landing searches؛ `npm run check` (0 error / 0 warning / 0 hint)؛ `npm run build`؛ static output assertions برای ترتیب identity، prompt دوزبانه و `dir="rtl"`. هیچ dependency یا animation library اضافه نشد.
- Verification actually performed and result: identity انگلیسی/فارسی در دو line مستقل با `dir` جدا render می‌شود؛ prompt هر دو زبان را نمایش می‌دهد؛ دکمه‌ها حداقل touch target دارند؛ `prefers-reduced-motion` smooth scroll/transition را کاهش می‌دهد؛ build و typecheck PASS.
- Decisions / assumptions: پیشنهاد عمومی skill دربارهٔ palette/font/motion با baseline پروژه جایگزین نشد؛ `docs/design.md` منبع نهایی باقی است. فونت self-host و browser screenshot matrix همچنان باز هستند.
- Deferred or risk IDs: `DEFER-0008` (font)، `DEFER-0010` (browser matrix)، `DEFER-0011` (Cloudflare robots) OPEN.
- Rollback / recovery: تغییر frontend/infra مستند و قابل بازگشت با Git؛ staging برای اعمال اصلاح 404 باید با script timestamped دوباره اجرا شود.

## LOG-0062 — 2026-08-15 — P1 / bilingual typography and premium gateway refinement

- Outcome: با استفاده از `ui-ux-pro-max` و حفظ اولویت `docs/design.md`، فونت‌های self-hosted `Vazirmatn Variable` و `Inter Variable` اضافه شد؛ gateway از نظر parity دو زبان، glass fallback، technical identity line و hierarchy بصری refined شد.
- Why: برای professional/premium بودن فقط palette کافی نیست؛ font rendering، وزن برابر CTAها و نسبت هویت/فضای خالی در screenshot اولیه نیاز به تصمیم و اجرای مشخص داشت.
- Scope / files: `apps/web/package.json`، `apps/web/package-lock.json`، `apps/web/src/styles/global.css`، `apps/web/src/pages/index.astro`، `docs/plan/P1-typography-font-task-spec.md`، ADR-0019، Manifest، content pack، Deferred Validation، Task-list و همین Work Log.
- Commands or actions actually performed: `npm install --no-audit --no-fund` (دو font package)، `npm run check` (0 error / 0 warning / 0 hint)، `npm run build`، `npm audit --audit-level=high` (0 vulnerabilities)، `git diff --check` و بررسی static CSS/HTML برای `Vazirmatn`/`Inter` و prompt/identity دوزبانه.
- Verification actually performed and result: local font CSS و `@font-face` در artifact حاضر؛ identity و prompt دوزبانه؛ build/typecheck/audit PASS. دو language action وزن یکسان دارند و fallback opaque برای browserهای بدون backdrop-filter تعریف شده است.
- Decisions / assumptions: ADR-0019 با وضعیت Accepted ثبت شد؛ `DEFER-0008` بسته شد. پیشنهادهای عمومی skill دربارهٔ Exo/Roboto Mono، neon، motion-heavy یا palette جدید به‌دلیل ناسازگاری با Persian readability و project governance رد شدند.
- Deferred or risk IDs: `DEFER-0007` contact، `DEFER-0009` OG، `DEFER-0010` browser matrix و `DEFER-0011` Cloudflare robots همچنان OPEN؛ لوگوی نهایی هنوز owner input است.
- Rollback / recovery: بازگشت با Git به system stack قبلی؛ staging برای دیدن این نسخه نیازمند upload artifact جدید و اجرای دوبارهٔ script sudo است.

## LOG-0063 — 2026-08-15 — P1 / visual system elevation with identity constellation

- Outcome: بر اساس `ui-ux-pro-max` و با حفظ `docs/design.md`، سیستم بصری P1 ارتقا یافت: constellation هویتی معنادار (Design·Interaction·Engineering·Data·AI حول مرکز انسان‌محور Gold) در gateway/hero/404، layout دوسطحی editorial برای hero با نسخهٔ ساده‌شدهٔ موبایل، accentهای context برای سه مسیر (purple/turquoise/emerald)، labelهای بخش دوزبانه (۰۱/۰۲)، header چسبان solid-first با glass اختیاری و touch target 44px، footer با brand mark و 404 هماهنگ با Navy.
- Why: مالک «بهترین UI/UX ممکن» را خواست؛ design.md §64–§67 اثر بصری باید دربارهٔ Taha معنا بدهد، نه صرفاً تزئینی باشد؛ خطوط تصادفی قبلی معنا نداشتند.
- Scope / files: `apps/web/src/components/Landing.astro`، `Header.astro`، `Footer.astro`، `apps/web/src/pages/index.astro`، `404.astro`، `apps/web/src/data/content.ts`، `docs/plan/P1-visual-elevation-task-spec.md` و همین Work Log.
- Commands or actions actually performed: `npm run check` (0 error / 0 warning / 0 hint)؛ `npm run build`؛ preview HTTP smoke (`/`, `/en/`, `/fa/`, `/health.json` → 200؛ `/nonexistent` → 404؛ CSS → 200)؛ static assertions برای constellation/labels/accents/404.
- Verification actually performed and result: همهٔ routeها و CSS سالم؛ بدون dependency، JS-client یا رنگ جدید؛ focus rings per-surface تنظیم شد؛ `prefers-reduced-motion` حفظ شد.
- Decisions / assumptions: پیشنهادهای ناسازگار skill (neon/cyberpunk/motion-heavy/Exo) رد شدند؛ فقط الگوهای سازگار (editorial، touch targets، sticky nav، focus/contrast) اعمال شدند.
- Deferred or risk IDs: `DEFER-0010` (browser matrix) همچنان OPEN؛ سایر IDها بدون تغییر.
- Rollback / recovery: بازگشت با Git؛ staging با اجرای دوبارهٔ stage script توسط مالک به‌روز می‌شود.

## LOG-0064 — 2026-08-15 — R2 / A1 reusable HTTP smoke script

- Outcome: added `infra/deploy/smoke.sh`, a read-only reusable HTTP smoke script for staging/production: asserts `/`, `/en/`, `/fa/`, `/robots.txt`, `/sitemap.xml` → 200, `/health.json` → 200 with body containing `"status":"ok"`, `/nonexistent-qa` → 404, and with `--expect-noindex` also `x-robots-tag` containing `noindex` on `/`. Prints one `PASS|FAIL <name>` line per check and exits non-zero on any FAIL.
- Why: S-Plan task A1 — one reusable post-deploy verifier instead of ad-hoc curl commands (reused in A4 and C7).
- Scope / files: `infra/deploy/smoke.sh` (new), `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`.
- Commands or actions actually performed: `bash -n infra/deploy/smoke.sh`; `bash infra/deploy/smoke.sh https://staging.tahamohamadi.ir --expect-noindex`. No SSH, no sudo, no site changes.
- Verification actually performed and result: `bash -n` → exit 0 (no output). Live run → exit 0, all lines PASS: `PASS root /`، `PASS locale /en/`، `PASS locale /fa/`، `PASS robots.txt`، `PASS sitemap.xml`، `PASS nonexistent-qa`، `PASS health.json body`، `PASS noindex /`.
- Decisions / assumptions: a curl connection failure surfaces as status `000` → FAIL; exit code equals the number of failed checks; `x-robots-tag` match is case-insensitive; the script asserts exactly the checks listed in task A1, nothing more.
- Deferred or risk IDs: none new (`DEFER-0011` note: `/robots.txt` returned 200 through the edge in this run).
- Rollback / recovery: script is additive and read-only; rollback = Git revert of this commit.

## LOG-0065 — 2026-08-15 — S-Plan / A1 pilot executed by subagent and approved

- Outcome: تسک A1 (smoke script) توسط subagent `general` با پروتکل S-Plan اجرا شد (commit `e2d7796`، LOG-0064). L-model طبق §7 ریویو کرد: diff فقط allowed files، منطق دقیقاً مطابق spec، اجرای مستقل مجدد smoke روی staging → ۸ PASS / exit 0 → **APPROVE** و A1 در S-PLAN-STATE به DONE رفت.
- Why: اثبات حلقهٔ «مدل کوچک اجرا / مدل بزرگ ریویو» قبل از هزینه‌کرد روی agentهای ارزان.
- Scope / files: `infra/deploy/smoke.sh`، `docs/status/WORK_LOG.md`، `docs/plan/S-PLAN-STATE.md`.
- Commands or actions actually performed: `git show --stat e2d7796`؛ `git diff --check HEAD~1 HEAD`؛ خواندن line-by-line اسکریپت؛ اجرای مستقل `bash infra/deploy/smoke.sh https://staging.tahamohamadi.ir --expect-noindex` → 8 PASS، exit 0.
- Verification actually performed and result: هیچ divergence بین گزارش S-model و اجرای مستقل؛ ورودی‌های FAIL برای خطای اتصال (000) و exit-code=count تعریف شده‌اند.
- Decisions / assumptions: الگوی S-Plan برای استفاده با مدل‌های ارزان معتبر است.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: مستندات/اسکریپت؛ بازگشت با Git.

## LOG-0066 — 2026-08-15 — Infra / cheap-model agent fleet and visual QA agent

- Outcome: دو agent پروژه‌ای ساخته و version شدند: `.opencode/agent/s-executor.md` (مدل رایگان `opencode/deepseek-v4-flash-free`؛ fallbackهای ارزان: `deepseek-v4-flash`، `mimo-v2.5`) با permissionهای deny-by-default (edit محدود به مسیرهای task، bash محدود به npm/git-local/bash-n/smoke، ssh/sudo/push deny) و `.opencode/agent/visual-reviewer.md` (مدل چندوجهی `opencode-go/gpt-5.6-luna`، read-only با دسترسی فقط به `~/Pictures`/`~/Downloads` برای تصاویر) برای بستن `DEFER-0010`. `.gitignore` به‌روزی شد تا فقط `.opencode/agent/` version شود. S-Plan §0/§2 و state با تسک V1 (visual QA از اسکرین‌شات‌های مالک) تکمیل شد.
- Why: مالک خواست اجرا با مدل‌های ارزان (DeepSeek/Grok/Luna/Mimo) انجام شود و L-model فقط review/planning بماند؛ بررسی تصویری با agent چندوجهی ارزان ممکن شد.
- Scope / files: `.opencode/agent/s-executor.md`، `.opencode/agent/visual-reviewer.md`، `.gitignore`، `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md`، `docs/plan/S-PLAN-STATE.md` و همین Work Log.
- Commands or actions actually performed: `opencode models` (inventory مدل‌ها)؛ خواندن الگوی agentهای global موجود (`r0-docs-executor.md`) برای هم‌سبکی. هیچ مدل/کلید جدیدی نصب یا تنظیم نشد.
- Verification actually performed and result: agentها مطابق schema (frontmatter مجاز + permission با ترتیب قواعد) نوشته شدند؛ `.gitignore` الگوی `!.opencode/agent/` دارد. فعال‌سازی نیازمند restart opencode است (config در startup لود می‌شود).
- Decisions / assumptions: executor روی tier رایگان با fallback ارزان؛ visual-reviewer فقط مشاهده‌گر است و پیشنهاد کد نمی‌دهد؛ مدل گران هرگز برای اجرا/بازبینی تصویری استفاده نمی‌شود.
- Deferred or risk IDs: `DEFER-0010` اکنون مسیر بستن دارد (V1 پس از restart).
- Rollback / recovery: حذف دو فایل agent + بازگردانی `.gitignore`.

## LOG-0067 — 2026-08-15 — P1-T01 / visual-prototyping tooling

- Outcome: `motion` 13.1.0، `gsap` 3.15.0 و `three` 0.185.1 به dependencyهای `apps/web/` افزوده و lockfile به‌روزرسانی شد؛ هیچ source عمومی، route، bundle behavior یا deploy تغییر نکرد. Skill محلی `design-dna` از `zanwei/design-dna` نیز در Codex نصب شد. استفاده از Beautiful UI و UI8 DNA به دلیل نبود artifact محلی/مجوز قابل‌اثبات defer شد.
- Why: مالک این ابزارها را برای آماده‌سازی visual prototyping درخواست کرد؛ scope عمداً tooling-only باقی ماند تا مرز static-first P1 و ممنوعیت motion/WebGL فعلی حفظ شود.
- Scope / files: `apps/web/{package.json,package-lock.json}`، `docs/plan/P1-T01-visual-prototyping-tooling-task-spec.md`، `docs/status/{WORK_LOG,deferred-validation}.md`؛ نصب skill خارج از repository در `C:\Users\Taha\.codex\skills\design-dna`.
- Commands or actions actually performed: installer رسمی skill با `--repo zanwei/design-dna --path . --name design-dna`؛ `npm install motion gsap three --save`؛ `npm run check`؛ `npm run build`؛ `npm audit --omit=dev --registry=https://registry.npmjs.org/` در `apps/web/`.
- Verification actually performed and result: Design DNA شامل `SKILL.md` و references نصب شد؛ `astro check` → 0 errors / 0 warnings / 0 hints؛ static build هر هفت artifact موجود (`/`، `/fa/`، `/en/`، `404`، health، robots و sitemap) را تولید کرد؛ `npm audit` → 0 vulnerabilities؛ `git diff --check` → PASS؛ diff فقط package manifests و task-owned documentation را نشان داد.
- Decisions / assumptions: `motion`، `gsap` و `three` فقط برای implementation آینده در دسترس‌اند، نه فعال در P1. هر use بعدی به Task Spec مستقل، interaction معنادار، fallback ثابت/no-JS، `prefers-reduced-motion` و lazy/non-render-blocking loading نیاز دارد؛ Motion و GSAP به‌صورت پیش‌فرض هم‌زمان برای یک interaction استفاده نمی‌شوند.
- Deferred or risk IDs: `DEFER-0010` بدون تغییر؛ `DEFER-0012` برای artifact/licensing خارجی اضافه شد. هیچ ریسک جدیدی ایجاد نشد.
- Rollback / recovery: revert کردن دو manifest task-owned؛ حذف directory skill `C:\Users\Taha\.codex\skills\design-dna` اگر لازم باشد. هیچ runtime/server state تغییر نکرده است.

## LOG-0068 — 2026-08-15 — P1-T02 / visual-toolchain documentation alignment

- Outcome: Manifest، README، master plan، technical architecture baseline، Task-list و S-Plan با وضعیت واقعی tooling همسو شدند: `motion` 13.1.0، `gsap` 3.15.0 و `three` 0.185.1 در lockfile موجود اما در P1 inactive هستند؛ Design DNA skill محلی agent tooling است؛ D3/R3F/React هنوز نصب نشده‌اند؛ Beautiful UI و UI8 DNA همچنان به `DEFER-0012` وابسته‌اند. شناسهٔ tooling از `P1-10` به `P1-T01` تغییر کرد تا با Task P1-10 (frontend verification) تداخل نداشته باشد. مسیر آینده نیز با Task P0B-04 و S-Plan B5 به یک adoption gate مشخص محدود شد.
- Why: مالک خواست که documentation، specifications، tasks و plans با ابزارهای تازه‌نصب‌شده منطبق باشند؛ نصب package نباید به‌اشتباه authorization برای import/ship تلقی شود.
- Scope / files: `PROJECT_MANIFEST.md`، `README.md`، `Task-list.md`، `docs/taha-personal-platform-{development-master-plan,technology-architecture-baseline}-fa.md`، `docs/plan/{P1-T01-visual-prototyping-tooling-task-spec,P1-T02-visual-toolchain-documentation-alignment-task-spec,SMALL-MODEL-EXECUTION-PLAN,S-PLAN-STATE}.md` و همین Work Log؛ manifest/lockfile موجود از P1-T01 تغییر داده نشد.
- Commands or actions actually performed: جست‌وجوی referenceها با `rg` در plan/ADR/governance و status؛ خواندن contracts/Task Specs/roadmaps مربوط؛ `git diff --check` و scope diff review.
- Verification actually performed and result: همهٔ referenceهای tooling به `P1-T01` منتقل و `P1-10` صرفاً برای blocking frontend verification حفظ شد؛ `git diff --check` PASS؛ documentation-only diff به‌جز تغییرات از پیش‌موجود P1-T01 در package manifests، هیچ source/config/deploy/runtime file ندارد.
- Decisions / assumptions: library فقط پس از user value مشخص، انتخاب یک library، Task Spec، lazy island-local import، fallback ثابت/no-JS و reduced-motion، keyboard/RTL/LTR/mobile QA و performance evidence active می‌شود. Three/WebGL هرگز render-blocking hero/main content نیست. Design DNA مرجع design را استخراج می‌کند اما token/asset خارجی را override نمی‌کند.
- Deferred or risk IDs: `DEFER-0010` و `DEFER-0012` بدون تغییر؛ Risk جدیدی ایجاد نشد.
- Rollback / recovery: revert فایل‌های documentation این entry و بازگردانی نام P1-T01 در صورت نیاز؛ هیچ runtime/deploy state تغییر نکرده است.

## LOG-0069 — 2026-08-15 — P1-T03 / design-policy toolchain alignment

- Outcome: `docs/design.md` اکنون صریحاً وضعیت installed-but-inactive P1 برای Motion/GSAP/Three، انتخاب یک library برای هر interaction، fallback/QA الزامی، نقش محدود Design DNA و boundary source/version/use-right برای Beautiful UI/UI8 DNA را ثبت می‌کند.
- Why: این سند source of truth طراحی است؛ همسویی آن با Manifest و roadmap از این سوءبرداشت جلوگیری می‌کند که package یا reference خارجی، مجوز استفاده در public artifact است.
- Scope / files: `docs/design.md`، `docs/plan/P1-T03-design-policy-toolchain-alignment-task-spec.md` و همین Work Log.
- Commands or actions actually performed: خواندن sectionهای Motion، Three، third-party acceptance و agent rules؛ جست‌وجوی targeted referenceها؛ `git diff --check`.
- Verification actually performed and result: policy جدید با static-first، `prefers-reduced-motion`، fallback، RTL/LTR و third-party adaptation rules موجود سازگار است؛ `git diff --check` PASS؛ هیچ code/config/dependency/runtime file تغییر نکرد.
- Decisions / assumptions: Design DNA خروجی تحلیلی تولید می‌کند و هرگز design system را override نمی‌کند؛ external UI تا ثبت source/version/use-right تحت `DEFER-0012` فقط inspiration است.
- Deferred or risk IDs: `DEFER-0012` بدون تغییر؛ Risk جدیدی ایجاد نشد.
- Rollback / recovery: revert فایل‌های documentation task-owned؛ هیچ runtime/deploy state تغییر نکرده است.

## LOG-0070 — 2026-08-15 — S-Plan / B3 uptime check definition

- Outcome: the existing "Observability (P0A-11)" section of `DEPLOY_RUNBOOK.md`
  was extended (no duplicate Observability heading, rest of the file untouched)
  with a concrete definition: an external uptime provider chosen by the owner
  (free tier acceptable) performs an HTTP GET on `https://<host>/health.json`
  every 5 minutes on staging and production; alert target is the owner's email
  (see password manager); deploy-version lookup is `curl https://<host>/health.json`
  returning the served artifact version; the owner reviews the Caddy error log
  on alert and checks `df -h /` monthly (30 GB disk, alert under 20% free); no
  agent may sign up for any monitoring service — provider selection and account
  creation are owner-only steps.
- Why: B3 (Phase B hardening) requires the uptime/observability contract to be
  written down so no agent invents a provider or creates accounts, and the owner
  has a concrete alert, log-review and disk-threshold procedure.
- Scope / files: `docs/governance/DEPLOY_RUNBOOK.md`,
  `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`.
- Commands or actions actually performed: read AGENTS.md,
  `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` §6 B3, `docs/plan/S-PLAN-STATE.md`
  and `docs/governance/DEPLOY_RUNBOOK.md` fully; extended the existing
  Observability (P0A-11) bullet list with the concrete definition; appended this
  WORK_LOG entry; marked B3 NEEDS_REVIEW and appended a review-log row in
  S-PLAN-STATE.md.
- Verification actually performed and result: `git diff --check` → exit 0
  (PASS); `grep "^#.*Observability" docs/governance/DEPLOY_RUNBOOK.md` → exactly
  1 match (`## Observability (P0A-11)` at line 95); no provider names, no email
  addresses, no new URLs beyond the existing `<host>` placeholder from the task.
- Decisions / assumptions: provider choice, account creation and the email
  address remain owner-only (address intentionally not recorded); the 5-minute
  cadence and 30 GB / under-20%-free numbers are taken verbatim from task B3.
- Deferred or risk IDs: none new; `DEFER`/`RISK` sets unchanged.
- Rollback / recovery: revert this documentation commit; no runtime, server or
  deploy state was changed.

## LOG-0071 — 2026-08-15 — S-Plan / B4 restore drill cadence

- Outcome: appended a `## Restore drill cadence` section to
  `docs/governance/BACKUP_POLICY.md` recording: a recurring restore drill runs
  quarterly; the recovery owner is the Project owner; the drill is performed
  ONLY on an isolated target per `docs/governance/BACKUP_RUNBOOK.md` and the
  P0-A restore-rehearsal Task Spec (never against production); at each drill the
  Project owner records the observed RPO/RTO and the cadence.
- Why: B4 (Phase B hardening) requires the restore drill contract to be written
  down so drills are repeatable, owner-owned and never run against production.
- Scope / files: `docs/governance/BACKUP_POLICY.md`,
  `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`.
- Commands or actions actually performed: read AGENTS.md,
  `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` §6 B4,
  `docs/plan/S-PLAN-STATE.md`, `docs/governance/BACKUP_POLICY.md` and
  `docs/governance/BACKUP_RUNBOOK.md` fully plus the P0-A restore-rehearsal Task
  Spec; appended the section at the end of `BACKUP_POLICY.md` without rewriting
  any existing content; appended this WORK_LOG entry; marked B4 NEEDS_REVIEW and
  appended a review-log row in S-PLAN-STATE.md.
- Verification actually performed and result: `git diff --check` → exit 0
  (PASS); `Select-String "Restore drill cadence"` on BACKUP_POLICY.md → exactly
  1 heading (`## Restore drill cadence`); appended facts match task B4 — no
  invented dates, RPO/RTO numbers, metrics or owners beyond "Project owner".
- Decisions / assumptions: quarterly cadence and "Project owner" are taken
  verbatim from task B4; RPO/RTO values are deliberately not invented — they are
  recorded by the owner at each drill.
- Deferred or risk IDs: none new; `DEFER`/`RISK` sets unchanged.
- Rollback / recovery: revert this documentation commit; no runtime, server or
  deploy state was changed.

## LOG-0072 — 2026-08-15 — Infra / cost posture: cheaper primary model and hard cost guards

- Outcome: پیکربندی پروژهٔ `.opencode/opencode.json` ایجاد شد تا مدل اصلی از tier گران (glm-5.3) به گزینهٔ ارزان‌تر (`opencode-go/deepseek-v4-pro`) و `small_model` به tier رایگان (`opencode/deepseek-v4-flash-free`) تغییر کند. S-Plan §0 «Hard cost guards» و snapshot §5 با وضعیت هزینه تکمیل شدند: اجرای تسک‌ها فقط از طریق `s-executor`، QA تصویری فقط از طریق `visual-reviewer`، مدل اصلی فقط برای ریویو/پلن، و re-verification با اسکریپت `smoke.sh` به‌جای buildهای پرهزینه.
- Why: مالک اعلام کرد glm-5.3 گران است و باید هزینه مدیریت شود در حالی‌که کیفیت/دقت حفظ شود؛ dispatchهای قبلی از طریق `general` روی همان مدل گران اجرا شده‌اند.
- Scope / files: `.opencode/opencode.json`، `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` و همین Work Log. هیچ مدل/کلید/provider جدیدی ساخته نشد.
- Commands or actions actually performed: بررسی `~/.config/opencode/opencode.jsonc` (فقط plugins) و نبود config پروژه‌ای؛ سپس نوشتن config و ویرایش پلن. `git diff --check` PASS.
- Verification actually performed and result: config فقط از فیلدهای معتبر `model`/`small_model`/`$schema` استفاده می‌کند؛ guardها صریح و قابل تخطی نیستند. فعال‌سازی نیازمند restart opencode است.
- Decisions / assumptions: `deepseek-v4-pro` به‌عنوان تعادل هزینه/کیفیت برای مدل اصلی انتخاب شد؛ قیمت‌گذاری واقعی provider ممکن است متفاوت باشد و مالک می‌تواند با یک خط در config جایگزین کند. GLM-5.3 دیگر برای هیچ نقشی استفاده نمی‌شود.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: حذف `.opencode/opencode.json` یا تغییر `model`؛ بازگشت به وضعیت قبلی صرفاً با revert مستند.

## LOG-0073 — 2026-08-15 — P1-T01 / external design resources re-verified and documented

- Outcome: درخواست مالک برای نصب Beautiful UI، Three.js، GSAP، Design DNA، UI8 DNA و Motion راستی‌آزمایی شد: `motion` 13.1.0، `gsap` 3.15.0، `three` 0.185.1 و Design DNA (skill محلی Codex) از قبل نصب شده‌اند؛ **Beautiful UI** وب‌سایت copy-paste با مجوز **MIT** است (نه پکیج npm) و به‌عنوان source-reference تأیید شد؛ **UI8 DNA** محصول تجاری/paid است و بدون خرید/لایسنس مالک قابل نصب نیست. DEFER-0012 به وضعیت split به‌روز شد و design.md §98 و S-Plan snapshot با این واقعیت‌ها هم‌تراز شدند.
- Why: مالک درخواست نصب داد؛ باید وضعیت واقعی هر منبع بدون حدس ثبت شود — MIT یعنی حق استفادهٔ Beautiful UI تأیید است، UI8 نیازمند لایسنس مالک.
- Scope / files: `docs/status/deferred-validation.md`، `docs/design.md`، `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` و همین Work Log.
- Commands or actions actually performed: `npm ls motion gsap three @fontsource-variable/inter` (همگی نصب)؛ `Test-Path` برای SKILL طراحی‌دی‌ان‌ای (موجود)؛ `webfetch` صفحهٔ BeautifulUI → MIT License و copy-paste (بدون بستهٔ npm)؛ بررسی DEFER-0012 و design.md §98. هیچ بسته یا asset جدیدی نصب/کپی نشد.
- Verification actually performed and result: ۴/۶ منبع از قبل نصب‌اند؛ Beautiful UI منبع MIT است؛ UI8 بدون لایسنس در دسترس نیست. `git diff --check` PASS.
- Decisions / assumptions: Beautiful UI فقط در slice مصوب (B5) و با استفادهٔ منحصراً از tokenهای خود پروژه copy می‌شود؛ UI8 تا تهیهٔ فایل/لایسنس توسط مالک در DEFER-0012 می‌ماند. هیچ library در P1 فعال نشد (static-first حفظ شد).
- Deferred or risk IDs: `DEFER-0012` به‌روز (split: Beautiful UI=MIT reference؛ UI8=pending license).
- Rollback / recovery: revert سه فایل مستند؛ هیچ runtime/deploy state تغییر نکرد.

## LOG-0077 — 2026-08-15 — P1 / parallel workstreams: audit, contrast fix, CI hardening, release QA

- Outcome: سه workstream موازی مستقل اجرا شدند (بدون تداخل فایل): (1) audit read-only کد → ۸/۱۰ معیار PASS، یک **SEV-HIGH**: خط positioning هیرو با Gold `#A77B28` روی canvas = 3.58:1 (نقض WCAG AA و design.md §9.1) + MEDهای token discipline؛ (2) تقویت CI → مرحلهٔ smoke محلی (`preview` + `smoke.sh` روی localhost) و `npm audit`؛ (3) گزارش `RELEASE-QA.md` → RELEASE-READY (۱۹ فایل، ۳۶۹KB، بدون secret، fonts 321KB self-host).
- Why: سرعت توسعه با چند agent و کیفیت/دقت بالا؛ یافتهٔ کنتراست پیش از production باید رفع می‌شد.
- Scope / files: `apps/web/src/components/Landing.astro` (gold→ink + accent rule gold، `#fff`→`var(--color-inverse)`)، `apps/web/src/pages/{index,404}.astro` و `Header.astro` (glass tokens از design.md §14 در `@theme` + مصرف)، `.github/workflows/ci.yml`، `docs/plan/RELEASE-QA.md`، `docs/plan/RELEASE-P1.md` و همین Work Log.
- Commands or actions actually performed: سه task موازی (explore/general)؛ سپس اصلاحات دستی؛ `npm run check` (0 error) و `npm run build` PASS؛ YAML توسط agent با PyYAML اعتبارسنجی شد؛ `git diff --check` PASS.
- Verification actually performed and result: gold دیگر text نیست (accent rule 3px)؛ `#fff`→`var(--color-inverse)`؛ glass tokens در `@theme`؛ CI یامال معتبر با مسیر نسبی درست (`../infra/deploy/smoke.sh`)؛ RELEASE-QA همهٔ checks PASS و verdict RELEASE-READY.
- Decisions / assumptions: MED token discipline رفع شد (glass/`#fff`)؛ موارد LOW (skip-link gateway، meta description gateway، footer bidi year) به‌عنوان پالایش آینده ثبت شدند. A3/RELEASE-P1 به artifact تازهٔ `release-fa3c813` برای production اشاره کرد.
- Deferred or risk IDs: بدون ID جدید؛ `DEFER-0010` (browser QA) همچنان READY بعد از restart.
- Rollback / recovery: revert کامیت‌های code/docs؛ هیچ runtime/deploy state تغییر نکرد.

## LOG-0078 — 2026-08-15 — R2 / production P1 live (owner-executed snippet switch) + production smoke

- Outcome: مالک با ویرایش دستی snippet `taha_application_routes` در Caddyfile — به‌جای پروکسی legacy (13000/18080) — `root * /opt/taha/site/current` + `file_server` گذاشت و production را روی `release-d55d44e` (checksum e49e46c7) سوییچ کرد؛ `tahamohamadi.ir` اکنون سایت static P1 را live سرو می‌کند. `prod-p1.sh` (A2) به‌دلیل این تغییر مکانیک، برای این Caddyfile قابل اجرا نیست (بلوک production را با handlers فونت/presentation مالک بازنویسی می‌کرد) و استفاده نشد. Legacy containers (13000/18080) همچنان running و دست‌نخورده‌اند.
- Why: production smoke و ثبت وضعیت واقعی، بخش پایانی R2 (P1-14/P1-15) است.
- Scope / files: `docs/status/WORK_LOG.md`، `docs/plan/RELEASE-P1.md`، `docs/plan/S-PLAN-STATE.md`، `Task-list.md` §5.
- Commands or actions actually performed: `bash infra/deploy/smoke.sh https://tahamohamadi.ir` → 7 PASS (root، en، fa، robots، sitemap، nonexistent-qa، health body) / exit 0؛ `curl` production robots از مسیر Cloudflare (intercept «content signals») و direct-origin (robots صحیح)؛ `cat -n /etc/caddy/Caddyfile` فقط‌خواندنی؛ `curl` مستقیم 13000 (legacy Vite app هنوز آن‌جاست). هیچ تغییر سرور توسط agent انجام نشد.
- Verification actually performed and result: production P1 live و سالم؛ DEFER-0011 برای production هم تأیید شد (Cloudflare edge robots را intercept می‌کند). نسخهٔ سروشده d55d44e فاقد fix کنتراست (df6ca39) است؛ به‌روزرسانی به `release-d7db929` (روی سرور در `~/taha-stage/`) با switch اتمیک `current` توصیه شد — بدون هیچ تغییری در Caddyfile (handlers فونت/presentation دست‌نخورده).
- Decisions / assumptions: مکانیک deploy فعلی snippet-based است (ADR-0017 با switch اتمیک `current`)؛ prod-p1.sh برای این Caddyfile منسوخ و در runbook باید به‌روز شود. A4 با اجرای مالک DONE تلقی می‌شود.
- Deferred or risk IDs: `DEFER-0011` OPEN (robots edge)؛ بدون ID جدید.
- Rollback / recovery: برگرداندن `current` به release قبلی و/یا restore بکاپ Caddyfile؛ legacy containers برای rollback کامل همچنان در دسترس‌اند.

## LOG-0074 — 2026-08-15 — S-Plan / B5 visual-interaction adoption brief

- Outcome: brief نوشته شد در `docs/plan/B5-VISUAL-INTERACTION-ADOPTION.md` با شش section دقیقاً طبق دستور: «Goal & gate»، «Candidate interactions»، «Adoption checklist»، «QA plan»، «Escalation rule» و «Explicit non-goal». سه interaction candidate فقط پیشنهاد شدند (بدون پیاده‌سازی): (۱) hero identity-constellation entrance با CSS/Motion و fallback = constellation استاتیک فعلی؛ (۲) hover/transition کارت‌های «Explore by Perspective» با Motion؛ (۳) timeline reveal برای Journey/About با GSAP scroll trigger و fallback کامل استاتیک. برای هر candidate: route، user-value، library، bundle-cost و fallback reduced-motion/no-JS ثبت شد. Adoption checklist کلمه‌به‌کلمه از design.md §98 کپی شد. بند explicit non-goal: هیچ import از motion/gsap/three در سایت P1 و هیچ کپی از Beautiful UI حالا.
- Why: task B5 طبق S-Plan خواستار brief پیش از هر implementation است؛ libraries در P1 inactive می‌مانند و adoption فقط پس از release استاتیک P1 (task A5) و تأیید مالک مجاز است.
- Scope / files: `docs/plan/B5-VISUAL-INTERACTION-ADOPTION.md` (جدید)، `docs/plan/S-PLAN-STATE.md`، `docs/status/WORK_LOG.md`. هیچ فایل دیگری تغییر نکرد.
- Commands or actions actually performed: ساخت فایل brief؛ append این entry؛ به‌روزرسانی state B5 به NEEDS_REVIEW + ردیف review-log؛ `git diff --check`؛ grep برای import های `motion`/`gsap`/`three` در `apps/web/`.
- Verification actually performed and result:
  - `git diff --check` → exit 0 (بدون خطای whitespace).
  - Heading های فایل جدید (خروجی واقعی):
    `## Goal & gate`, `## Candidate interactions`, `## Adoption checklist`, `## QA plan`, `## Escalation rule`, `## Explicit non-goal` (هر شش موجود و دقیقاً مطابق دستور).
  - grep در `apps/web/` برای `from "motion"|"gsap"|"three"|"gsap/ScrollTrigger"` و `import "motion"|"gsap"|"three"` → «No files found»؛ یعنی هیچ import جدیدی از motion/gsap/three در apps/web اضافه نشده است.
  - grep سراسری تأیید کرد هیچ پیاده‌سازی/code جدیدی خارج از سه فایل مجاز نیست.
- Decisions / assumptions: adoption فقط پس از release استاتیک P1 (A5)، انتخاب دقیقاً یک library برای هر interaction، عبور از checklist §98 به‌عنوان gate اجباری، و تأیید نهایی interaction+route+library توسط مالک. هیچ library فعال نشد و هیچ کدی import نشد.
- Deferred or risk IDs: `DEFER-0012` (Beautiful UI فقط در slice مصوب)؛ پیش‌نیازهای B5 شامل مالک‌نام‌کردن interaction نهایی.
- Rollback / recovery: حذف فایل جدید brief و revert دو فایل state/WORK_LOG؛ هیچ runtime/deploy/dependency change وجود ندارد.

## LOG-0075 — 2026-08-15 — S-Plan / A2 production Caddy switch script (write only)

- Outcome: created `infra/deploy/prod-p1.sh` as a copy of `infra/deploy/stage-p1.sh` with ONLY the production-specific changes required by task A2: python heredoc marker `staging.tahamohamadi.ir {` → `tahamohamadi.ir {`; replacement block serves `root * /opt/taha/site/current` with the same `import taha_security_headers`, `handle_errors` 404 block (`rewrite * /404.html` + `file_server`) and `file_server`, with NO `X-Robots-Tag` header (production is indexed); backup suffix `.pre-stage-p1.` → `.pre-prod-p1.`; echo/usage text now names `prod-p1.sh` and `tahamohamadi.ir`. `www`, `85.192.29.196` and all other script logic are untouched (neither hostname appears in the script; they live in the server Caddyfile and are never matched/replaced by this script). The script was NOT run and NOT scp'd.
- Why: S-Plan task A2 — write-only production Caddy switch script so the owner can later run the exact production counterpart of stage-p1.sh after L-model line-by-line review.
- Scope / files: `infra/deploy/prod-p1.sh` (new), `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`. No other file changed.
- Commands or actions actually performed: copied stage-p1.sh content and applied the four listed changes; ran `bash -n infra/deploy/prod-p1.sh`; ran `bash -c "diff infra/deploy/stage-p1.sh infra/deploy/prod-p1.sh"`; staged the three allowed files and ran `git diff --cached --check` and `git diff --check`.
- Verification actually performed and result:
  - `bash -n infra/deploy/prod-p1.sh` → exit 0, no output.
  - `diff infra/deploy/stage-p1.sh infra/deploy/prod-p1.sh` (real output, exit 1 = differences exist):
    `6c6` usage `./stage-p1.sh`→`./prod-p1.sh`; `17c17` usage string `stage-p1.sh`→`prod-p1.sh`; `20c20` backup suffix `pre-stage-p1`→`pre-prod-p1`; `57c57` heredoc marker `staging.tahamohamadi.ir {`→`tahamohamadi.ir {`; `60c60` heredoc stderr `staging block`→`production block`; `64c64` replacement block header `staging.tahamohamadi.ir {`→`tahamohamadi.ir {`; `69,72d68` X-Robots-Tag header block removed; `98c94` echo `on staging hostname`→`on tahamohamadi.ir`. No other differences.
  - `git diff --cached --check` → exit 0 (PASS, covers the new file); `git diff --check` → exit 0 (PASS).
- Decisions / assumptions: the heredoc marker `tahamohamadi.ir {` is taken verbatim from task A2 (the L-model's plan), and `www` / `85.192.29.196` are intentionally not referenced in the script — the script replaces only the production site block matched by that marker, exactly as stage-p1.sh does for staging. The header comment line "Stage the static P1 artifact on staging.tahamohamadi.ir" is left byte-identical to stage-p1.sh because the task's diff acceptance allows changes ONLY in the heredoc marker/block, backup suffix and echo/usage text.
- Deferred or risk IDs: none new; task A2 remains HIGH risk pending L-model review and owner approval before being run.
- Rollback / recovery: script is additive and was never executed; rollback = Git revert of this commit / delete `infra/deploy/prod-p1.sh`.

## LOG-0076 — 2026-08-15 — S-Plan / A3 release decision record for P1

- Outcome: created `docs/plan/RELEASE-P1.md` filling the release-decision template from `docs/governance/RELEASE_POLICY.md` with real data: Type `STANDARD` (new public routes, static, no auth/data/secret), Release DoD `PASS`, Completion DoD `NOT MEASURED`, blocking-check evidence pointers to WORK_LOG IDs, open risk/deferred IDs listed verbatim (status unchanged), rollback path, owner-approval precondition and preconditions. No deploy, no sudo, no SSH write performed.
- Why: S-Plan task A3 — record the P1 release decision so the owner/L-model can authorize the production switch (A4) against documented evidence.
- Scope / files: `docs/plan/RELEASE-P1.md` (new), `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`. No other file changed.
- Commands or actions actually performed:
  - Read `AGENTS.md`, `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` §6 A3, `docs/plan/S-PLAN-STATE.md`, `docs/governance/RELEASE_POLICY.md`, `docs/status/RISK_REGISTER.md`, `docs/status/deferred-validation.md`, `docs/governance/DEPLOY_RUNBOOK.md`, `docs/status/WORK_LOG.md`.
  - Read-only SSH (agent-ssh: yes, read-only): `ssh taha-nl "cat /opt/taha/site/deploy.log"` → `2026-08-15T07:00:36Z staged release-a2720d9 49cf1d21` / `2026-08-15T07:29:53Z staged release-d55d44e e49e46c7`; `ssh taha-nl "ls -la /opt/taha/site/; readlink /opt/taha/site/current; ls /opt/taha/site/releases/; cat /opt/taha/site/releases/release-d55d44e/health.json"` → `current -> /opt/taha/site/releases/release-d55d44e`, releases dir `release-a2720d9`, `release-d55d44e`, health.json `{"status":"ok","service":"static","version":"0.1.0"}`.
  - `bash infra/deploy/smoke.sh https://staging.tahamohamadi.ir --expect-noindex` → 8 PASS, exit 0.
  - `gh run list --branch main --limit 5` → latest runs `completed success` on `main`.
- Verification actually performed and result:
  - Served artifact (verbatim): `release-d55d44e` / checksum `e49e46c7` (deploy.log tail). Note: the task prompt referenced `release-fa3c813`, which does NOT match the served artifact; verified served release is `release-d55d44e` (also matches plan §5 snapshot and A3 task spec in SMALL-MODEL-EXECUTION-PLAN.md). Flagged as `pending verification` in RELEASE-P1.md.
  - Staging smoke re-run → `PASS root /`, `PASS locale /en/`, `PASS locale /fa/`, `PASS robots.txt`, `PASS sitemap.xml`, `PASS nonexistent-qa`, `PASS health.json body`, `PASS noindex /`; exit 0.
  - CI: `gh run list --branch main` shows recent pushes `completed success` (CI green on main).
  - `git diff --check` → exit 0 (PASS).
- Decisions / assumptions: Type STANDARD per RELEASE_POLICY (new public routes, static, no auth/data/secret). Completion DoD = `NOT MEASURED` because deferred/risk items remain open and enumerated. No risk/deferred status was changed. Production switch remains owner-only (A4) and is not authorized by this record.
- Deferred or risk IDs: listed verbatim in RELEASE-P1.md — RISK-0001 CLOSED; RISK-0004 IN PROGRESS, RISK-0005/0006 OPEN, RISK-0007 BLOCKED; DEFER-0007, 0009, 0010, 0011, 0012 OPEN; DEFER-0008 CLOSED. No status changed.
- Rollback / recovery: release decision record is additive documentation; rollback = Git revert of this commit. No server state was touched.

## LOG-0079 — 2026-08-15 — R2 / parallel polish batch + A5 close-out

- Outcome: چهار workstream موازی مستقل اجرا و همه تأیید شدند: (1) پولیش LOWهای audit — meta description/og:locale/og:url گیت‌وی، skip-link در gateway/404، <bdi> برای سال فوتر؛ (2) گزارش لایسنس LICENSES.md — ۳۰۱ پکیج، ۰ missing؛ flag: gsap (لایسنس اختصاصی، locked-unused)، sharp (LGPL در زنجیرهٔ build)، lightningcss (MPL-2.0)؛ (3) acceptance عمیق production — **PROD-ACCEPTED-WITH-NOTES**: یافتهٔ اصلی: 404 production بدنهٔ خالی (handle_errors در snippet نیست)؛ http→https در لبه 308؛ robots proxy-injection (DEFER-0011)؛ (4) بستن A5 — tickهای Task-list §5 با evidence واقعی (P1-13/14/15 و بخش‌های تکمیل‌شدهٔ P1-09/P1-12)، snapshot به‌روز، RELEASE-P1 نهایی.
- Why: سرعت با sub-agentهای موازی + کیفیت/دقت با ریویو مرکزی L-model؛ یافتهٔ 404 برای تجربهٔ کاربر production مهم است.
- Scope / files: pps/web/src/pages/{index,404}.astro، pps/web/src/components/Footer.astro، docs/plan/{LICENSES,PROD-ACCEPTANCE,RELEASE-P1}.md، Task-list.md §5 و snapshot، و همین Work Log.
- Commands or actions actually performed: چهار task موازی؛ سپس 
pm run check (0 error)؛ git diff --check؛ بازبینی مستقل diffها.
- Verification actually performed and result: پولیش build/check سبز؛ لایسنس‌ها ۰ missing (۲۹۵ permissive + ۶ flagged مستند)؛ production acceptance 7/8 PASS با 1 NOTE (404)؛ Task-list فقط خطوط دارای evidence tick شد.
- Decisions / assumptions: gsap/three/motion در P1 باندل نمی‌شوند (فقط locked)؛ fix 404 production به‌روزرسانی snippet Caddy نیاز دارد (owner sudo) — به‌همراه switch به release جدید در دستور update مالک گنجانده می‌شود. DEFER-0010 (browser QA) و DEFER-0011 باز ماندند.
- Deferred or risk IDs: بدون ID جدید؛ DEFER-0011 باز؛ gsap license به‌عنوان شرط adoption B5 ثبت شد.
- Rollback / recovery: revert کامیت‌های این batch؛ هیچ server/runtime state توسط agent تغییر نکرد.

## LOG-0080 — 2026-08-15 — R2 close-out / release updater, doc sync, CI fingerprint

- Outcome: سه workstream موازی دیگر تکمیل و تأیید شد: (1) infra/deploy/update-release.sh — اسکریپت root-run برای switch اتمیک current (کپی idempotent + chown/chmod + ln -sfn/mv -Tf + checksum در deploy.log) بدون هیچ تغییری در Caddyfile — روی سرور هم قرار گرفت؛ (2) README و PROJECT_MANIFEST با وضعیت live (production/staging P1 deployed، مکانیک snippet + atomic switch) هم‌تراز شدند؛ (3) CI: مرحلهٔ build fingerprint (dist/build-fingerprint.txt) + نام artifact نسخه‌دار web-dist-<sha> + retention 14 روز.
- Why: بستن R2 و آماده‌سازی به‌روزرسانی production به آخرین build (با fix کنتراست + پولیش) با کمترین اقدام مالک.
- Scope / files: infra/deploy/update-release.sh، .github/workflows/ci.yml، README.md، PROJECT_MANIFEST.md و همین Work Log.
- Commands or actions actually performed: سه task موازی؛ ash -n update-release.sh (exit 0)؛ scp اسکریپت به ~/taha-stage/؛ git diff --check؛ YAML با PyYAML اعتبارسنجی شد.
- Verification actually performed and result: همهٔ خروجی‌ها مطابق spec؛ هیچ تغییر سرور توسط agent؛ artifacts/scrip روی سرور آماده‌اند.
- Decisions / assumptions: به‌روزرسانی production فقط نیازمند sudo bash ~/taha-stage/update-release.sh ~/taha-stage/release-1ce6d9a است؛ fix 404 (handle_errors در snippet) به‌عنوان اقدام اختیاری مالک مستند شد.
- Deferred or risk IDs: DEFER-0011 OPEN؛ بدون ID جدید.
- Rollback / recovery: revert کامیت‌ها؛ rollback production = switch current به release قبلی.

## LOG-0081 — 2026-08-15 — Infra / scoped agent server operations path

- Outcome: مسیر امن برای اجرای خودکار عملیات سرور توسط agent تعریف شد: infra/deploy/caddy-apply.sh (root-owned، تبدیل ثابت و idempotent برای fix 404 handle_errors در snippet با gate validate و restore خودکار) ساخته و به سرور منتقل شد؛ SERVER_ACCESS_RUNBOOK.md بخش «Scoped agent operations» را گرفت: sudoers محدود به دو اسکریپت root-owned در /opt/taha/bin، بدون sudo عمومی، بدون escalation (اسکریپت‌ها توسط deploy قابل ویرایش نیستند)، audit از طریق auth.log/deploy.log/Caddy backups، و revoke فوری با حذف drop-in.
- Why: مالک خواست خودش عملیات سرور را انجام ندهد؛ grant باید حداقل‌امتیاز، قابل بازبینی و قابل revoke باشد.
- Scope / files: infra/deploy/caddy-apply.sh، docs/governance/SERVER_ACCESS_RUNBOOK.md و همین Work Log.
- Commands or actions actually performed: ash -n infra/deploy/caddy-apply.sh (exit 0)؛ scp به ~/taha-stage/caddy-apply.sh؛ git diff --check. هیچ تغییری روی سرور اعمال نشد (نصب sudoers = اقدام مالک).
- Verification actually performed and result: اسکریپت syntax-valid؛ منطق idempotent (اگر handle_errors موجود باشد بدون تغییر خارج می‌شود)؛ sudoers فقط دو مسیر دقیق.
- Decisions / assumptions: اعطای NOPASSWD عمداً فقط به دو فرمان ثابت؛ هر تغییر Caddy آینده نیازمند ویرایش اسکریپت root-owned یا grant جدید است.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: m /etc/sudoers.d/taha-deploy && visudo -c grant را فوراً لغو می‌کند.

## LOG-0082 — 2026-08-15 — Infra / caddy-apply idempotency and brace bug fixed

- Outcome: اجرای اول caddy-apply.sh با خطای parse مواجه شد («unexpected token '}'»): (الف) چک idempotency سراسری بود و handle_errors بلوک staging را می‌دید، بنابراین در اجرای قبلی snippet تولید اصلاح نشد؛ (ب) روش insert قبلی \t} را درست قبل از } اصلی می‌گذاشت → }} روی یک خط که parser سیدی رد می‌کند. اصلاح: چک محدود به region snippet + بازنویسی canonical کل snippet (براکت‌های متوازن، } در خط خودش). تست faithful روی سرور: caddy validate --config <mod2> --adapter caddyfile → **Valid configuration**.
- Why: fix 404 تولید باید بدون شکستن Caddy اعمال شود؛ backup/validate/restore طراحی قبلی به‌درستی کار کرد (Caddy ری‌لود نشد، فایل restore شد).
- Scope / files: infra/deploy/caddy-apply.sh و همین Work Log.
- Commands or actions actually performed: بازتولید محلی با بایت‌های واقعی فایل (scp از سرور)؛ scp خروجی به سرور؛ caddy validate --adapter caddyfile روی فایل تست → PASS؛ ash -n؛ git diff --check.
- Verification actually performed and result: snippet نهایی شامل handle_errors با ساختار متوازن و «Valid configuration» روی سرور؛ فایل اصلی Caddy دست‌نخورده (restore قبلی) و production سالم.
- Decisions / assumptions: نسخهٔ نهایی اسکریپت نیازمند reinstall در /opt/taha/bin توسط مالک و سپس اجرای sudo -n است.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: در صورت خطای validate، اسکریپت بکاپ را restore می‌کند و reload نمی‌شود.

## LOG-0083 — 2026-08-15 — R2 / production 404 fixed and full live verification

- Outcome: با caddy-apply.sh اصلاح‌شده (canonical snippet rewrite)، handle_errors داخل 	aha_application_routes وارد و Caddy validate + reload شد (بکاپ Caddyfile.auto-20260815130818). Production و staging اکنون صفحهٔ 404 سفارشی را با status 404 و بدنهٔ کامل (۴۱۲۷ بایت) سرو می‌کنند. مسیر دسترسی scoped agent (sudoers) فعال است: مالک فقط reinstall انجام داد و خود اسکریپت توسط grant اجرا شد.
- Why: بستن کامل R2 — 404 سفارشی بخشی از قرارداد static P1 بود و قبلاً در production خالی بود.
- Scope / files: docs/status/WORK_LOG.md، docs/plan/PROD-ACCEPTANCE.md، docs/plan/S-PLAN-STATE.md.
- Commands or actions actually performed: curl production/staging 404 (status+len+body)؛ ash infra/deploy/smoke.sh برای هر دو host (7/8 PASS)؛ تأیید بکاپ Caddy.
- Verification actually performed and result: prod404 status=404 len=4127 با notfound-code و متن دوزبانه؛ stage404 یکسان؛ smoke هر دو سبز؛ production روی release-1ce6d9a.
- Decisions / assumptions: NOTE قبلی PROD-ACCEPTANCE (404 خالی) رفع شد؛ DEFER-0011 (robots edge) همچنان باز است.
- Deferred or risk IDs: DEFER-0011 OPEN.
- Rollback / recovery: بکاپ‌های timestamped Caddy و switch اتمیک current؛ هر دو مکانیک آزمایش‌شده.

## LOG-0084 — 2026-08-15 — R2/P2 / V1 readiness check and P2 content questionnaire

- Outcome: (1) آزمایش ثبت agent: isual-reviewer در session فعلی ثبت نیست («Unknown agent type») — V1 به‌صورت READY-AFTER-RESTART ثبت شد و دستور dispatch دقیق (۷ اسکرین‌شات 003016..003052) در S-Plan آماده است؛ (2) فرم content پک P2 ساخته شد: docs/plan/P2-C1-CONTENT-REQUEST.md با ۱۰ بخش دوزبانه (identity، bio کوتاه/بلند، تجربه با ستون evidence، تحصیلات، مهارت‌ها بدون درصد ساختگی، تصمیم CV/Resume با مسیر دانلود، تصمیم تماس DEFER-0007 با فیلد مقدار دقیق، URLهای اجتماعی، statement دسترسی، یادآوری قانون evidence).
- Why: «هر دو» — V1 نیازمند restart است (محدودیت فنی ثبت‌شده)؛ P2 بدون ورودی واقعی مالک ساخته نمی‌شود، پس unblocker آن فرم C1 است.
- Scope / files: docs/plan/P2-C1-CONTENT-REQUEST.md، docs/plan/S-PLAN-STATE.md و همین Work Log.
- Commands or actions actually performed: dispatch آزمایشی isual-reviewer (خطای ثبت‌نشده)؛ ساخت فرم توسط sub-agent؛ git diff --check.
- Verification actually performed and result: فرم شامل تمام ستون‌ها/بخش‌های خواسته‌شده با __blank__ برای متن آزاد؛ مقادیر identity فعلی از content.ts verbatim کپی شد؛ C1 → BLOCKED(owner) با ارجاع فرم.
- Decisions / assumptions: هیچ صفحهٔ خالی P2 ساخته نشد (قانون «empty future route» رعایت شد)؛ C2..C7 همچنان BLOCKED(C1).
- Deferred or risk IDs: DEFER-0010 باز (منتظر restart).
- Rollback / recovery: revert این commit؛ هیچ runtime state تغییر نکرد.

## LOG-0085 — 2026-08-15 — P2 / V1 visual QA passed, C1 form received, About pages built

- Outcome: (1) **V1 اجرا شد** — agent isual-reviewer (پس از restart ثبت شد) هر ۷ اسکرین‌شات را بررسی کرد: همه ACCEPT-WITH-NOTES، بدون SEV؛ گزارش در docs/plan/VISUAL-QA-P1.md؛ DEFER-0010 بسته و DEFER-0013 (mobile matrix) ثبت شد. (2) فرم P2-C1 تکمیل‌شده دریافت شد: identity تأیید، short bio ویرایشی تأیید، ۷ مهارت با source، availability دوزبانه تأیید، تماس = omit (بستن DEFER-0007)؛ خالی‌ها (long bio، education، تجربهٔ org/role/date، فایل‌های CV/Resume، URLها) طبق قانون «empty = not published» منتشر نمی‌شوند. (3) پیاده‌سازی P2 (C2+C3+C6): ماژول typed profile.ts + profile.{en,fa}.ts با alidateProfile()، صفحات /en/about/ و /fa/about/، کامپوننت About.astro، لینک About در nav، sitemap ۵-URL، و انتقال copy 404 به content.notfound.
- Why: «هر دو» — V1 و P2؛ معماری content-driven برای admin panel آینده.
- Scope / files: pps/web/src/data/{profile.ts,profile.en.ts,profile.fa.ts,content.ts}، pps/web/src/components/{About,Landing,Header,Footer}.astro، pps/web/src/pages/{en,fa}/about.astro، 404.astro، index.astro، sitemap.xml.ts، docs/plan/VISUAL-QA-P1.md، docs/status/deferred-validation.md و همین Work Log.
- Commands or actions actually performed: dispatch V1 (visual-reviewer) و dispatch پیاده‌سازی P2؛ 
pm run check (0 error؛ 21 files)؛ 
pm run build (6 pages شامل aboutها)؛ git diff --check.
- Verification actually performed and result: ۷ گزارش visual همگی ACCEPT-WITH-NOTES؛ build شامل /en/about/ و /fa/about/؛ همهٔ copy از data؛ alidateProfile روی build اجرا می‌شود.
- Decisions / assumptions: مهارت‌ها روی هر دو locale با نام‌های فنی/لاتین یکسان (مصوب) نمایش داده می‌شوند؛ بخش‌های Experience/Education/CV منتشر نشدند چون دادهٔ واقعی ندارند (نیازمند تکمیل فرم توسط مالک).
- Deferred or risk IDs: DEFER-0010 CLOSED؛ DEFER-0007 CLOSED؛ DEFER-0013 OPEN (mobile matrix).
- Rollback / recovery: revert کامیت‌های این slice؛ deploy قبلی روی سرور سالم می‌ماند.

## LOG-0086 — 2026-08-15 — P1/P2 / no-hardcode audit and data-driven refactor

- Outcome: طبق دستور مالک («هیچ‌چیز هاردکد؛ همه‌چیز بعداً از admin panel مدیریت شود») agent audit همهٔ .astro/.ts غیر از data/ را اسکن کرد: ۷ مورد HIGH هاردکد (title gateway، نام‌های h1، «404»، برچسب‌های switch «EN»/«فارسی» در Header/Footer، نماد «©») + LOWهای برند (TM/طه). همه به content.ts منتقل شدند: gateway.title، 
ame، mark، 
otfound.code، برچسب switch از gateway.englishLabel/persianLabel locale مقابل، ooter.copyrightMark. پس از refactor، هیچ string کاربر-قابل‌مشاهده‌ای خارج از data/ باقی نماند (به‌جز جداکننده‌های تزئینی aria-hidden).
- Why: منبع واحد محتوا = مسیر مستقیم به admin panel/CMS در P3 (adapter روی همین ماژول‌ها).
- Scope / files: pps/web/src/data/content.ts، pps/web/src/components/{Header,Footer}.astro، pps/web/src/pages/{index,404}.astro و همین Work Log.
- Commands or actions actually performed: agent audit (explore)؛ سپس refactor دستی؛ 
pm run check (0 error)؛ 
pm run build (6 pages)؛ git diff --check.
- Verification actually performed and result: audit پس از اصلاحات — ۰ HIGH باقی‌مانده (فقط تزئینی/برند مستند)؛ build/check سبز.
- Decisions / assumptions: برچسب switch از «EN» به «English» تغییر کرد (داده‌محور و مطابق design.md §59)؛ نماد «©» از ooter.copyrightMark خوانده می‌شود.
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: revert؛ deploy قبلی دست‌نخورده.

## LOG-0087 — 2026-08-15 — P2 / full master-profile content on About (C2/C3 completion)

- Outcome: مالک دو منبع محتوای واقعی تحویل داد (Taha_Mohammadi_Master_CV_Website_Profile.md و Taha_Mohammadi_Master_SOP_FA_Final.md). قرارداد typed گسترش یافت (experience/education/publications/researchProjects/certificates/socials/longBio + alidateProfile با بررسی URL و فیلدهای اجباری)؛ profile.en.ts با محتوای verbatim CV پر شد (short/long bio، ۵۸ مهارت در ۸ دسته، ۵ تجربه با bullets، ۲ education با GPA، ۳ publication، ۳ research project، ۷ certificate، socials LinkedIn/ORCID)؛ profile.fa.ts فقط محتوای مصوب فارسی را نگه داشت (طبق قانون «نبود ترجمه = عدم انتشار بخش»)؛ About.astro با بخش‌های شرطی (فقط دادهٔ موجود رندر می‌شود) بازنویسی شد؛ برچسب‌های بخش (en) در content.ts.sections اضافه شدند. ایمیل/تلفن منتشر نشدند (تصمیم تماس DEFER-0007).
- Why: تکمیل C1/C2/C3 با محتوای واقعی مالک؛ بدون هیچ ترجمه/اختراع agent.
- Scope / files: pps/web/src/data/{profile.ts,profile.en.ts,profile.fa.ts,content.ts}، pps/web/src/components/About.astro و همین Work Log.
- Commands or actions actually performed: 
pm run check (0 error)؛ 
pm run build (6 pages)؛ assertions روی dist: ۹ مورد en حاضر، fa فاقد experience و دارای availability.
- Verification actually performed and result: en About شامل MCI/Shahed/PARS-SQL/LinkedIn/ORCID/Certificates/Publications/availability/GPA؛ fa About بدون بخش‌های بدون-ترجمه؛ validation روی build اجرا می‌شود.
- Decisions / assumptions: CV master منبع وب‌سایت است (طبق متن خود فایل)؛ socials فقط LinkedIn/ORCID (بدون email/phone)؛ fa بخش‌های جدید ندارد تا ترجمهٔ فارسی مصوب برسد.
- Deferred or risk IDs: DEFER-0013 (mobile matrix) OPEN؛ بدون ID جدید.
- Rollback / recovery: revert کامیت؛ deploy قبلی سالم.

## LOG-0088 — 2026-08-15 — P2 / GitHub links from resume variants (en+fa)

- Outcome: دو resume variant دیگر مالک (Senior Backend BluePay و Industry Resume Software AI) دو واقعیت جدید تأییدشده داشتند: GitHub profile (https://github.com/tahamohamadi-ir) و repo پروژهٔ PARS-SQL/VTD-Edge (https://github.com/tahamohamadi-ir/ADHD-VTD). به socials هر دو locale (en+fa — نام پلتفرم proper noun است) و به‌عنوان url+linkLabel پروژه در en اضافه شد؛ ResearchProject با url/linkLabel توسعه یافت و About پروژه را با لینک data-driven رندر می‌کند. bullets تجربهٔ master CV (canonical) تغییر نکرد.
- Why: لینک‌های اجتماعی/پروژه بخشی از هویت عمومی هستند و در منابع مصوب آمده‌اند.
- Scope / files: pps/web/src/data/{profile.ts,profile.en.ts,profile.fa.ts}، pps/web/src/components/About.astro و همین Work Log.
- Commands or actions actually performed: 
pm run check (0 error)؛ 
pm run build (6 pages)؛ smoke نسخهٔ قبلی (7 PASS) و تأیید /about/ ها (200) پیش از تغییر.
- Verification actually performed and result: build سبز؛ لینک GitHub پروژه data-driven (بدون هاردکد).
- Decisions / assumptions: ایمیل/تلفن از resumeها منتشر نشد (تصمیم تماس پابرجا)؛ «Django Rebuild» به‌عنوان پروژهٔ سایت منتشر نشد (site ما Astro است — این فقط framing رزومه است).
- Deferred or risk IDs: بدون ID جدید.
- Rollback / recovery: revert کامیت؛ deploy قبلی سالم.

## LOG-0089 — 2026-08-15 — P2 / a11y audit fixes, mobile-overflow CI, docs sync

- Outcome: سه workstream موازی: (1) audit دسترس‌پذیری About → ۲ must-fix رفع شد: skip سطح heading در fa (وقتی برچسب بخش نیست، مهارت‌ها h2 می‌شوند به‌جای h3 — بدون اختراع فارسی) و هاردکد «GPA» → gpaLabel در content؛ plus: آندرلاین rest-state لینک‌های سازمان/پروژه (design.md §55)؛ (2) CI: مرحلهٔ «Mobile overflow check (Playwright)» با infra/qa/mobile-overflow.spec.mjs (۶ مسیر × ۳۲۰×۵۶۸ و ۳۹۰×۸۴۴، fail اگر scrollWidth>1px) → پوشش overflow موبایل DEFER-0013؛ (3) هم‌ترازی مستندات: snapshot S-Plan، pointer content pack به master CV، README.
- Why: کیفیت/دقت بالا + بستن defer با ابزار CI؛ معماری بدون هاردکد حفظ شد.
- Scope / files: pps/web/src/components/About.astro، pps/web/src/data/content.ts، .github/workflows/ci.yml، infra/qa/mobile-overflow.spec.mjs، docs/plan/{SMALL-MODEL-EXECUTION-PLAN,P0-G0-content-pack-proposal}.md، README.md و همین Work Log.
- Commands or actions actually performed: سه task موازی (explore/general/general)؛ 
pm run check (0 error)؛ 
pm run build (6 pages)؛ assertions روی dist (fa مهارت‌ها h2، en GPA)؛ 
ode --check و YAML validation توسط agent.
- Verification actually performed and result: build سبز؛ heading hierarchy fa رفع شد؛ «GPA» data-driven؛ CI جدید پس از push تست می‌شود.
- Decisions / assumptions: برچسب‌های فارسی بخش‌ها اختراع نشدند (منتظر مالک) — با سطح heading پویا مشکل skip حل شد؛ DEFER-0013 برای بخش overflow با CI پوشش گرفت (بخش visual همچنان باز).
- Deferred or risk IDs: DEFER-0013 OPEN (با پوشش CI برای overflow).
- Rollback / recovery: revert کامیت‌ها؛ deploy قبلی سالم.

## LOG-0090 — 2026-08-15 — P2 / shared bilingual About tabs and justified text

- Outcome: About فارسی و انگلیسی به یک component و ساختار یکسان CSS-only radio-tab تبدیل شدند؛ هر دو locale شش tab هم‌ساختار دارند و فقط label/data زبان تغییر می‌کند. متن‌های طولانی About، تجربه، پژوهش، publication و certificate با `text-align: justify` و `text-justify: inter-word` خواناتر شدند؛ نوار tab در mobile افقی scroll می‌شود و JS/hydration اضافه نشد.
- Why: درخواست مالک برای یکسان‌بودن format/style/tab بین fa/en و کاهش scroll عمودی.
- Scope / files: `apps/web/src/components/About.astro`، `apps/web/src/data/content.ts`، `apps/web/src/data/profile.fa.ts`، `docs/plan/P2-about-tabs-task-spec.md` و همین Work Log.
- Commands or actions actually performed: `npm run check` (0 errors / 0 warnings / 0 hints)؛ `npm run build` (6 pages)؛ `node --check qa/mobile-overflow.spec.mjs`؛ YAML validation؛ static assertions برای ۶ tab و justified CSS.
- Verification actually performed and result: build سبز؛ هر دو locale دارای data کامل و شش panel/tab؛ tabها با radio/CSS بدون JS کار می‌کنند؛ mobile overflow در CI بررسی می‌شود (Chromium local به‌دلیل 403 CDN نصب نشد).
- Decisions / assumptions: labels فارسی بخش‌ها (`سوابق کاری`, `تحصیلات`, `مهارت‌ها`, `انتشارات`, `پژوهش`, `گواهی‌ها`) با درخواست صریح مالک اضافه شدند؛ empty future section render نمی‌شود.
- Deferred or risk IDs: `DEFER-0013` برای visual mobile QA/CI result باز است.
- Rollback / recovery: revert commit؛ deploy فعلی untouched تا check/CI و artifact جدید.

## LOG-0092 — 2026-08-15 — P2 / About tabs live and mobile overflow CI green

- Outcome: About فارسی و انگلیسی با ساختار tab یکسان و CSS-only، متن‌های طولانی justify، شش tab (Experience/Education/Skills/Research/Publications/Certificates) و labels فارسی/انگلیسی live شد. Header responsive fix باعث شد Playwright overflow در `/en/` و `/en/about/` در 320px از 30px به PASS برسد.
- Why: درخواست مالک برای format/style/tab یکسان، justify متن و ادامهٔ توسعه با کیفیت موبایل.
- Scope / files: `apps/web/src/components/About.astro`، `apps/web/src/components/Header.astro`، `apps/web/src/data/content.ts`، `apps/web/src/data/profile.fa.ts`، `docs/plan/P2-about-tabs-task-spec.md`، `docs/status/deferred-validation.md`.
- Commands or actions actually performed: `npm run check` (0 errors)؛ `npm run build` (6 pages)؛ `node --check qa/mobile-overflow.spec.mjs`؛ CI run `31889867770` → success؛ artifact `release-01458eb` با update-release روی سرور deploy شد؛ production/staging smoke PASS.
- Verification actually performed and result: هر دو locale دارای شش radio/CSS tab؛ no-JS/hydration حفظ شد؛ justify CSS موجود؛ CI هر دو viewport 320/390 و شش route را اجرا کرد؛ production `/en/about/` و `/fa/about/` 200.
- Decisions / assumptions: tabs با native radio و CSS ساخته شدند تا بدون JS و بدون React کار کنند؛ `DEFER-0013` فقط برای visual screenshot/mobile typography باز است، نه overflow.
- Deferred or risk IDs: `DEFER-0013` OPEN با CI evidence؛ C4 هنوز منتظر فایل‌های CV/Resume مالک.
- Rollback / recovery: revert commit؛ artifact قبلی با `current` قابل بازگشت است.

## LOG-0091 — 2026-08-15 — CI / mobile overflow fix for English header at 320px

- Outcome: Playwright CI correctly found `overflow=30px` on `/en/` and `/en/about/` at 320×568 while all fa/390 checks passed. Root cause was the longer English header brand plus About/language controls; responsive header rules now shrink spacing/labels, allow brand ellipsis and keep controls within the viewport.
- Why: `DEFER-0013` mobile overflow check is a blocking quality gate, not a check to disable.
- Scope / files: `apps/web/src/components/Header.astro` and this Work Log.
- Commands or actions actually performed: CI run `31889672810` failure reviewed; responsive media rule added; local check/build had passed before push.
- Verification actually performed and result: CI rerun required after this fix; no threshold or test was weakened.
- Deferred or risk IDs: `DEFER-0013` remains open until the next CI run passes all viewport/page cases.
- Rollback / recovery: revert the responsive header commit; previous behavior remains available.

## LOG-0094 — 2026-08-15 — CI / RTL-aware About tabs keyboard regression

- Outcome: About-tabs Playwright regression caught that the test assumed `ArrowRight` advances the radio group in RTL; product layout/activation passed, but fa keyboard checks failed. The test now chooses `ArrowLeft` for `dir="rtl"` and `ArrowRight` for LTR, preserving the real native keyboard behavior.
- Why: keyboard direction must follow locale; a test that ignores RTL would create a false failure or encourage incorrect product behavior.
- Scope / files: `apps/web/qa/about-tabs.spec.mjs` and this Work Log.
- Commands or actions actually performed: reviewed CI run `31890608892`; changed only the direction-aware key selection; syntax/diff verification follows.
- Verification actually performed and result: previous run showed all geometry/activation/locale checks PASS and only fa keyboard checks FAIL; the correction is test-only and does not weaken assertions.
- Deferred or risk IDs: `DEFER-0013` remains open until CI rerun passes.
- Rollback / recovery: revert the test-only commit; no production state affected.

## LOG-0093 — 2026-08-15 — P2 / About tab layout and locale-switch regression fix

- Outcome: audit found the About tab controls and panels were siblings inside one `nowrap` flex container, so desktop panels rendered beside/stretched by the tab strip. Controls are now in a separate horizontally scrollable wrapper and panels render below it. Header/Footer now honor `alternateHref`, so `/en/about/` switches to `/fa/about/` and vice versa instead of the locale root. A Playwright regression script now checks geometry, one-visible-panel behavior, keyboard tab movement, click activation and equivalent locale links at 320/390/1280.
- Why: this was a real P2 layout blocker and a route-contract violation; overflow-only CI did not detect panel placement or equivalent locale switching.
- Scope / files: `apps/web/src/components/About.astro`, `Header.astro`, `Footer.astro`, `apps/web/qa/about-tabs.spec.mjs`, `.github/workflows/ci.yml` and this Work Log.
- Commands or actions actually performed: `npm run check`/`npm run build` (6 pages); `node --check qa/about-tabs.spec.mjs`; `node --check qa/mobile-overflow.spec.mjs`; YAML validation; static assertions for separated controls/panels and equivalent About links.
- Verification actually performed and result: local checks PASS; CI will run the new About-tabs regression after push. No JS/hydration was added; tabs remain native radio + CSS.
- Deferred or risk IDs: `DEFER-0013` remains open until the new CI About-tabs suite passes; mobile browser visual review remains separate.
- Rollback / recovery: revert the layout/test commit; previous release remains on the server until the new artifact is deployed.

## LOG-0095 — 2026-08-15 — R2/P2 / final tab layout deploy and smoke

- Outcome: corrected About tab controls/panels, equivalent locale switches and direction-aware keyboard test are now deployed from clean HEAD `4fcd19f` as `release-4fcd19f` (checksum `13849ab7`); previous artifact naming mismatch was eliminated.
- Why: the prior deployment had been built from a working tree before the regression commits; this release is reproducible from the exact commit and includes the final tabs fix.
- Scope / files: `apps/web/` artifact only; no server config change.
- Commands or actions actually performed: clean `npm run check`/`npm run build` (23 files, 6 pages); artifact upload; `sudo -n /opt/taha/bin/update-release.sh /home/deploy/taha-stage/release-4fcd19f`; read `deploy.log`; production smoke script.
- Verification actually performed and result: deploy.log recorded `updated release-4fcd19f 13849ab7`; production smoke 7 PASS; `/en/about/` and `/fa/about/` include separated tab controls/panels and equivalent locale links.
- Decisions / assumptions: CSS-only radio tabs remain the shared no-JS implementation; visual UI QA remains covered by prior V1 plus CI geometry/keyboard/overflow tests.
- Deferred or risk IDs: `DEFER-0013` remains open only for residual full visual mobile review; overflow and tab behavior are CI-covered.
- Rollback / recovery: switch `/opt/taha/site/current` to the previous release with the scoped update script; no Caddy reload required.
