# سیاست اجرایی انتشار

> سند کوتاه عملیاتی برای Codex، Cursor و agentها. مرجع کامل، [Master Plan توسعه](../taha-personal-platform-development-master-plan-fa.md) است. مسیر canonical این فایل `docs/governance/RELEASE_POLICY.md` است.

## اصل

نسخه‌ای کوچک اما سالم را زود منتشر کنید. قابلیت لازم نیست کاملاً mature باشد تا release شود، اما نباید ریسک امنیتی، محرمانگی، یکپارچگی داده یا پایداری بحرانی ایجاد کند. هر بهبود deferشده باید با ID و مالک ثبت شود.

## انواع انتشار

| نوع | کاربرد | مثال | حداقل بررسی blocking |
|---|---|---|---|
| `FAST-TRACK` | تغییر low-risk و محدود | اصلاح copy یا CTA Landing | build، render/responsive smoke، بررسی لینک/metadata تغییرکرده |
| `STANDARD` | قابلیت عمومی با داده/route جدید | Blog list یا Resume download | تست contract مرتبط، build، CI (web + cms workflows)، production smoke، ثبت deferred |
| `HIGH-RISK` | auth، permission، publish lifecycle، upload، migration یا دادهٔ private | Minimal Admin یا contact persistence | unit/integration، negative authorization tests، migration/rollback یا fallback، critical-path E2E، CI (web + cms workflows) و production smoke |

نوع انتشار در `TASK_SPEC_TEMPLATE.md` ثبت می‌شود. در ابهام، نوع بالاتر را انتخاب یا از مالک تصمیم بگیرید؛ فرض نکنید.

## Stop-the-line: انتشار ممنوع

- secret exposure
- authentication یا authorization bypass
- نشت draft، private data یا media محدود
- migration مخرب بدون recovery قابل آزمون
- احتمال جدی data loss
- production crash یا health failure
- اجرای malicious upload
- XSS یا SQL injection بحرانی
- backup/restore path خراب پیش از عملیات destructive

این موارد با approval معمولی یا ثبت deferred قابل پذیرش نیستند.

## شدت ریسک و اختیار پذیرش

| Severity | انتشار | اختیار |
|---|---|---|
| Critical | BLOCK | فقط پس از رفع و evidence تازه |
| High | BLOCK | فقط مالک پروژه می‌تواند با mitigation مستند و دلیل صریح استثنا بدهد؛ stop-the-line هرگز استثنا ندارد |
| Medium | قابل defer | مالک slice باید owner، target و fallback ثبت کند |
| Low | قابل defer | ثبت در deferred validation کافی است |

## Minimum Safe Gate

- scope با `TASK_SPEC_TEMPLATE.md` مشخص است و فایل خارج از scope تغییر نکرده است.
- فرمان‌های واقعی Manifest برای build و آزمون‌های متناسب با risk با خروجی ثبت‌شده اجرا شده‌اند.
- CI هر دو workflow (web + cms) و production smoke پس از deploy انجام شده است. *(staging از 2026-08-15 decommission شده است — ADR-0025؛ دیگر staging smoke لازم نیست)*
- هیچ secret/PII یا دادهٔ fake production-like وارد release نشده است.
- migration در صورت وجود، migration-compatible و rollback/fallback آن ثبت شده است.
- backup mechanism و restore procedure مستند هستند. full restore rehearsal برای release اولیهٔ بدون دادهٔ persistent ارزشمند قابل defer است؛ پیش از persistent CMS data، ذخیرهٔ Contact submission، یا migration پرریسک باید روی staging اجرا شود.
- accessibility، RTL/LTR و SEO فقط در سطح اثر این slice بررسی شده‌اند.
- تمام deferredها در Risk Register یا Deferred Validation با ID ثبت شده‌اند.
- لاگ همان slice در `docs/status/WORK_LOG.md` شامل scope، فایل‌های تغییرکرده، فرمان‌ها/نتایج واقعی، تصمیم‌ها و ارجاع به deferred/riskها ثبت شده است.

## قرارداد مستندسازی عملیات

- هر کار، حتی تغییر ساختار، تنظیم Git، تصمیم محیط یا کار صرفاً مستندی، **باید** پیش از handoff در `docs/status/WORK_LOG.md` ثبت شود.
- فقط نتایج و فرمان‌هایی را ثبت کنید که واقعاً اجرا شده‌اند؛ خروجی، تست، deploy یا تأیید انجام‌نشده نباید به‌صورت انجام‌شده نوشته شود.
- کارِ عمداً انجام‌نشده یا کم‌دامنه‌شده فقط وقتی قابل defer است که در `docs/status/deferred-validation.md` یک ردیف دارای ID، دلیل، مالک، موعد و fallback داشته باشد. عبارت «بعداً انجام می‌شود» کافی نیست.
- مورد Critical/High، Stop-the-line، یا پیش‌نیازِ لازم برای همان release قابل انتقال به deferred نیست؛ آن مورد باید در `docs/status/RISK_REGISTER.md` به‌عنوان blocker ثبت شود.
- قالب‌ها و قواعد کامل ثبت در [Documentation Policy](DOCUMENTATION_POLICY.md) مرجع هستند.

## چه چیزی قابل defer است؟

اگر Critical/High نیست و fallback روشن دارد، می‌تواند defer شود: visual regression گسترده، dark mode کامل، animation نهایی، browser matrix کامل، advanced analytics/alerts، recurring restore drill و polish غیرحیاتی.

مواردی که هرگز بدون approval پذیرفته نمی‌شوند: امنیت، authorization، private-data leak، data-loss risk، production availability failure، یا تغییر breaking بدون migration/fallback.

## Debt budget و ثبت

هر release پیش از deploy باید موردهای باز را در این فایل‌ها بررسی کند:

- `docs/status/WORK_LOG.md`: گزارش تغییرات و evidence هر slice.
- `docs/status/RISK_REGISTER.md`: Medium/High و ریسک‌های عملیاتی.
- `docs/status/deferred-validation.md`: آزمون/QA انجام‌نشده.
- `docs/status/TECH_DEBT.md`: debt غیرحاد.

هر ردیف: `ID | Phase/Slice | Severity | Description | Why deferred | Owner | Target phase/date | Mitigation/fallback | Evidence/command | Status`.

Debt budget یک عدد سراسری ساختگی نیست: هیچ Critical باز، هیچ High بدون owner approval، و هیچ مورد بدون owner/target/fallback نباید وارد release شود.

## DoD دو سطحی

**Release DoD:** Minimum Safe Gate و acceptance criteria همان slice PASS است؛ باقیمانده‌ها ثبت شده‌اند.  
**Completion DoD:** hardening و deferredهای متعلق به feature/fase با evidence بسته شده‌اند.

گزارش هر فاز باید هر دو را جدا بنویسد. درصد Completion فقط وقتی مجاز است که تمام باقی‌مانده‌ها enumerate شده باشند؛ در غیر این صورت `NOT MEASURED` بنویسید.

## قالب تصمیم release

```md
## Release decision: <version>/<slice>
- Type: FAST-TRACK | STANDARD | HIGH-RISK
- Release DoD: PASS | BLOCKED | NOT READY
- Completion DoD: PASS | NOT READY | NOT MEASURED
- Blocking checks and evidence:
- CI/prod smoke path:
- Open risk/deferred IDs:
- Rollback/fallback:
- Owner approval (required for High exception):
```
