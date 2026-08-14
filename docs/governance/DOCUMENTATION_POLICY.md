# سیاست مستندسازی عملیات و کارهای Deferred

## هدف

این سیاست تضمین می‌کند هر agent یا توسعه‌دهنده بتواند بدون حدس‌زدن بفهمد چه تغییری، چرا، در چه محدوده‌ای، با چه شواهدی و با چه موارد باقی‌مانده‌ای انجام شده است.

## منابع مرجع

| نیاز | فایل مرجع |
|---|---|
| شرح کارهای انجام‌شده و evidence | `docs/status/WORK_LOG.md` |
| آزمون/QA یا hardening عمداً انجام‌نشده | `docs/status/deferred-validation.md` |
| ریسک عملیاتی یا blocker | `docs/status/RISK_REGISTER.md` |
| بدهی فنی غیرحاد | `docs/status/TECH_DEBT.md` |
| مشکل تأییدشده و قابل مشاهده برای کاربر | `docs/status/known-issues.md` |
| تعریف scope پیش از آغاز کار | `docs/templates/TASK_SPEC_TEMPLATE.md` |

## قواعد غیرقابل مذاکره

1. پیش از تغییر، یک Task Spec با scope، non-goal، قراردادهای خوانده‌شده و روش rollback/fallback بسازید. نبود اطلاعات لازم به معنی `BLOCKED` است، نه مجوز حدس.
2. پس از هر تغییر، یک entry در `WORK_LOG.md` ثبت کنید؛ حتی برای ساختار پوشه، پیکربندی Git، move فایل یا تغییر صرفاً مستندات.
3. entry فقط command، نتیجه، URL، test و تصمیمی را ثبت می‌کند که واقعاً رخ داده است. secret، token، مقدار environment variable حساس، PII و خروجی حساس هرگز در ledger ثبت نمی‌شود.
4. هر کار skip/defer شده باید یک ID یکتا در `deferred-validation.md` داشته باشد؛ علت، مالک، موعد، اثر، fallback و trigger بازبینی اجباری است.
5. defer کردن به معنی تکمیل نیست. هنگام بستن مورد، evidence تازه و تاریخ بسته‌شدن ثبت می‌شود.
6. موارد Critical/High، security/privacy issue، data-loss risk یا minimum safe gate قابل defer نیستند؛ آن‌ها blocker بوده و در `RISK_REGISTER.md` می‌آیند.
7. یک تغییر ممکن است هم entry در Work Log و هم یک deferred/risk ID داشته باشد؛ Work Log باید به ID ارجاع دهد.

## چرخهٔ ثبت

```text
Task Spec
→ اجرای تغییر در scope
→ Verification واقعی
→ WORK_LOG entry
→ Deferred/Risk entry در صورت وجود
→ Handoff / Release decision
```

## بازبینی

- آغاز هر task: Work Log، Deferred، Risk و ADRهای مرتبط خوانده می‌شوند.
- پیش از release: همهٔ IDهای باز و evidence Work Log همان slice بررسی می‌شوند.
- پایان هر phase: owner فهرست deferredها را با وضعیت `OPEN | BLOCKED | CLOSED | ACCEPTED` بازبینی می‌کند.
