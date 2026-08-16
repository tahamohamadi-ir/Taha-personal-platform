# Changelog

> هر slice واقعی (کد، زیرساخت، مستندات) که در `docs/status/WORK_LOG.md` ثبت می‌شود می‌تواند یک ردیف خلاصه اینجا داشته باشد. Append-only؛ جدیدترین در بالا.

## 2026-08-15/16 — Server upgrade + staging decommission + KI-0001 + CMS gap closure

- **Server upgrade (owner):** VPS اکنون Ubuntu 26.04 LTS با 2 vCPU / ~3910 MB RAM (~4 GiB) / 30 GB disk (~17 GB free) است؛ plan 4 GiB نگه داشته شد (`RISK-0007` CLOSED). stack زنده با `docker ps` در 2026-08-16 07:19 UTC inventory-confirm شد: `taha-prod-frontend-1` روی 127.0.0.1:13000، `taha-prod-backend-1` روی 127.0.0.1:18080، `taha-prod-postgres-1` (`RISK-0004` CLOSED).
- **Staging decommission (ADR-0025):** `staging.tahamohamadi.ir` به‌طور کامل از رده خارج شد (Caddy block از VPS حذف شد؛ DNS record در صورت وجود حذف شد؛ اجرای مالک با sudo و حساب deploy user). gate release اکنون فقط CI (web + cms workflows) + production smoke است.
- **KI-0001 CLOSED:** handle گیت‌هاب fa و URL پروژهٔ PARS-SQL در `apps/web/src/data/profile.fa.ts` به single-m اصلاح شد؛ `rg tahamohammadi apps/web/src` → no matches.
- **CMS gap closure:** NoIndexMiddleware برای `/admin/`، `/api/`، `/rebuild-trigger/`؛ JSON logging واقعی در `production.py` (python-json-logger)؛ تست‌های account-enumeration و stored-XSS sanitizer اضافه شدند؛ **70 pytest PASS** (LOG-0110). CI workflow (owner decision): manage.py test + git diff --check + secret scan steps.
- **Upcoming release:** production روی release-4fcd19f (checksum `13849ab7`) است؛ release جدید از HEAD (JSON-LD + KI-0001 fix) در آستانهٔ deploy است.
- **Still blocked:** CMS runtime deploy (MFA enforcement + `RISK-0003` DB-import evidence + deploy Task Spec؛ `RISK-0009` BLOCKED — ظرفیت حل شده است).

## 2026-08-15 — P3 code-first (CMS)

- **P3 gate move (owner-authorized):** `apps/cms/` scaffold + کد + تست + CI بدون deploy سروری. Task Spec: `docs/plan/P3-gate-code-first-task-spec.md`.
- **apps/cms:** Django 5.2.9 / Wagtail 7.4.2 / Ninja 1.6.2 / psycopg 3.3.4 روی Python 3.12.13 (`uv` + `.venv` پروژه‌محلی؛ `DEFER-0003` بسته شد).
- **Settings:** split base/development/test/production؛ production همهٔ secretها را از env می‌گیرد و بدون `DJANGO_SECRET_KEY`/`ALLOWED_HOSTS`/DB credentials fail می‌شود.
- **Content:** مدل‌های Landing/Profile/Article با lifecycle (draft/review/published/archived)، `public()` به‌عنوان تنها مسیر projection، unicity `(locale, slug)`.
- **API (Ninja):** فقط read-only عمومی: list/detail published بر اساس locale؛ بدون افشای status/internal fields؛ 404 بدون stack trace.
- **Media:** اعتبارسنجی signature-based با `filetype` (jpeg/png/gif/pdf، حداکثر 5MB)، نام‌های امن ذخیره، `is_active` پیش‌فرض False (private default).
- **Admin security:** `AuditLog` (بدون body/secret)، rate limit لاگین (5/5min → 429)، read-only audit admin؛ MFA طراحی‌شده ولی نه اجراشده.
- **Rich text:** allowlist ثابت Wagtail (هیچ HTML دلخواهی)؛ pytest قفل‌شده.
- **Rebuild trigger:** POST-only `/rebuild-trigger/` با HMAC-SHA256 + freshness ≤5min + `REBUILD_TRIGGER_ENABLED=False` پیش‌فرض؛ `scripts/manual-rebuild.sh` fallback.
- **CI:** `.github/workflows/ci-cms.yml` (hosted): uv sync → check → makemigrations --check → ruff → pytest.
- **Infra candidates (NOT-APPLIED):** `infra/cms/{docker-compose.cms.yml, Dockerfile.cms, Caddyfile.cms.snippet, README.md}` — deploy واقعی بعد از تصمیم ظرفیت مالک (`RISK-0007`) و Task Spec جدا.
- **Verification:** 62 pytest PASS، ruff clean، بدون migration در انتظار؛ ADR-0020..0024 پذیرفته؛ Manifest و AGENTS.md و ledgers به‌روز.
- **Still blocked:** deploy runtime، PostgreSQL provisioning، MFA enforcement، media/API exposure، contact persistence (`RISK-0003`/`RISK-0007`).

## 2026-08-15 — P2 regression/QA close (web)

- About tab layout + equivalent locale routes، centered intro، zoom-safe gateway/landing/404، tiny-viewport CI regressions (LOG-0093..0104).
- JSON-LD Person/WebSite structured data روی همهٔ صفحات indexable (LOG-0105)؛ CI action majors به node24 runtime (LOG-0106).

## 2026-08-15 — R2 first live

- Production P1 live (Language Gateway + bilingual landing)؛ A1-A5، B3-B5، C1-C3/C5/C6؛ V1 visual QA (LOG-0064..0104). رجوع: `docs/plan/RELEASE-P1.md`.
