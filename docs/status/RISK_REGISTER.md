# Risk Register

> ریسک‌های Medium/High، blockerها و ریسک‌های عملیاتی اینجا ثبت می‌شوند. مورد Low یا آزمون انجام‌نشده در `deferred-validation.md` می‌رود.

| ID | Phase/Slice | Severity | Description | Why deferred | Owner | Target phase/date | Mitigation/fallback | Evidence/command | Status |
|---|---|---|---|---|---|---|---|---|---|
| RISK-0001 | P0-G0 | High | P0-G0 هنوز PASS نشده است؛ manifest و ADRهای پایه ایجاد شده‌اند اما credential rotation، DNS/HTTPS evidence و backup/restore evidence باقی مانده‌اند. | پیش‌نیازهای امنیتی و عملیاتی gate هنوز کامل نیستند. | Project owner | پیش از هر scaffold یا dependency پروژه | فقط inventory read-only و مستندسازی انجام شود؛ هر تصمیم باز صریحاً در Manifest/ADR ثبت شود. | `PROJECT_MANIFEST.md`، ADRها، Master Plan؛ LOG-0001 تا LOG-0007. | BLOCKED |
| RISK-0002 | P0-G0 / Server access | High | یک secret مربوط به دسترسی سرور در تصویرِ گفت‌وگو قابل مشاهده شد؛ خود secret در repository و ledger ثبت نشده است. | secret اکنون خارج از مرز امن credential store قرار گرفته است. | Project owner | پیش از هر اتصال SSH یا deploy | رمز root فوراً rotate شود؛ سپس SSH key برای کاربر غیر-root ایجاد، password login و root login غیرفعال، و secret فقط در password manager نگهداری شود. | گزارش مالک در 2026-08-14؛ هیچ secret در این فایل ثبت نشده است. | BLOCKED |
| RISK-0003 | P0-A / Backup and restore | High | هیچ backup provider، retention، encryption یا restore rehearsal برای VPS/database/media تعیین نشده است. | مکانیزم backup هنوز توسط مالک انتخاب یا آزمایش نشده است. | Project owner | پیش از دادهٔ persistent، فرم تماس یا migration پرریسک | یک مقصد off-site رمزنگاری‌شده، job زمان‌بندی‌شده، retention و restore rehearsal در staging تعریف و مستند شود. | LOG-0006؛ Master Plan P0/P0-A. | OPEN |
