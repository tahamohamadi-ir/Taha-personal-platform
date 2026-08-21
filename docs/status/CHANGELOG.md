# Changelog

## 2026-08-20 — ADM-4 follow-up: revisions + scheduled publish (DEBT-0005)

Immutable `ContentRevision` snapshots with restore-as-draft; `scheduled` status +
`scheduled_for`; `publish_scheduled_content` management command and optional
systemd timer (no Celery). Admin API/SPA updated. LOG-0181; DEBT-0005 CLOSED.
## 2026-08-20 — ADM-6: primaryColor + current CV/resume from admin

- Public `GET /api/site` exposes `primaryColor` and active current CV/resume downloads.
- Astro injects `--color-brand` from CMS at build; CV pages prefer media-library PDFs (fallback: committed markdown).
- Admin Settings: MediaPicker slots for academic CV + industry resume (one PDF each).
- `DEFER-0029` CLOSED; `DEBT-0006` CV RESOLVED (contact inbox not reopened).
## 2026-08-20 — HMAC rebuild trigger to rebuild-web.sh

- Signed CMS rebuild hook default script is `infra/deploy/rebuild-web.sh` (not disk `rebuild-static.sh`).
- `REBUILD_TRIGGER_ENABLED` remains False (`DEFER-0027` OPEN until owner VPS smoke + enable).
- **Owner VPS (enable path):** smoke `bash infra/deploy/rebuild-web.sh` then set `REBUILD_SCRIPT_PATH` to that script, set `REBUILD_TRIGGER_ENABLED=true` plus secret, recreate CMS, and confirm post-publish web updates.
## 2026-08-20 — ADR-0027 Slice 3: CMS origin honesty

- Typed CMS fetch (`unset` / `ok` / `http` / `error`); outage with `CMS_API_BASE` set fails `npm run build`.
- `profile.snapshot.json` is local/offline only (base unset); successful empty CMS lists stay empty.
- QA: `cms-profile-build.spec.mjs` asserts fail-build on unreachable base.
## 2026-08-20 — Phase 0: owner CD migrate checklist + RISK-0012 CLOSED

- `DEPLOY_RUNBOOK`: numbered attended checklist (Actions → `migrate_cms=true` + GHCR `cms_image_tag` → confirm job PASS + `smoke-cms.sh` / `cd-cms-migrate PASS` in logs).
- `RISK-0012` CLOSED on Actions 32407698471 / LOG-0179 (re-verified LOG-0180). Leave `CMS_CD_AUTO_MIGRATE` unset.
- Plan index handoff: next is Slice 3 (not “auto-migrate”).

## 2026-08-20 — ADR-0027 Slice 2: first attended CD CMS migrate PASS

- Actions run 32407698471: `migrate_cms=true` `cms_image_tag=2e200fe` → `cd-cms-migrate PASS` + `CMS smoke PASS`.
- Leave `CMS_CD_AUTO_MIGRATE` unset (`RISK-0012` later CLOSED in LOG-0180).

## 2026-08-20 — ADR-0027 Slice 2: gated CD CMS migrate

- New `infra/deploy/cd-cms-migrate.sh` and CD job `cms-migrate` (off by default).
- **Owner-attended first run:** Actions → CD → Run workflow → `migrate_cms=true` + `cms_image_tag` (existing GHCR sha). Do not set `CMS_CD_AUTO_MIGRATE=true` until that PASS.
- `RISK-0012` remains OPEN until first live CD migrate evidence.

## 2026-08-20 — web nginx: preserve HTTP 404 for missing paths

- nginx `try_files` uses `=404`; Caddy no longer re-proxies `/404.html` on errors (that forced 200).
- **Owner VPS after merge:** `git pull` → `bash infra/deploy/rebuild-web.sh` → `sudo /opt/taha/bin/caddy-sync.sh .../infra/caddy/Caddyfile` → confirm `curl -o /dev/null -w '%{http_code}\n' https://tahamohamadi.ir/nonexistent-qa` → `404`.

## 2026-08-20 — ADR-0027 Slice 1 cutover live

- Owner applied PR #50 on VPS: Caddy public routes → `127.0.0.1:13080` (`taha-cms-web-1`); `smoke-cms.sh` PASS.
- Post-publish public HTML rebuild: `bash infra/deploy/rebuild-web.sh` (not disk `rebuild-static.sh`).

## 2026-08-19 — rebuild-web.sh: CMS publish → web nginx container

- New `infra/deploy/rebuild-web.sh` builds `taha-web:local` with loopback `CMS_API_BASE`, restarts Compose `web`, smokes `127.0.0.1:13080/health.json`.
- Use after admin publish when Caddy proxies to `127.0.0.1:13080`; `rebuild-static.sh` header notes disk-path transition.
- **Owner VPS after admin publish:** `cd /home/deploy/cms-repo && git pull --ff-only origin main && bash infra/deploy/rebuild-web.sh`

## 2026-08-19 — ADR-0027 Slice 1: Caddy → nginx web loopback

- `(taha_application_routes)` now `reverse_proxy 127.0.0.1:13080` instead of disk `file_server`.
- Rollback: restore `root * /opt/taha/site/current` + `file_server` in the snippet.
- `smoke-cms.sh` checks loopback `/` and `/health.json` on 13080.
- **Owner VPS:** `git pull` then `sudo /opt/taha/bin/caddy-sync.sh /path/to/infra/caddy/Caddyfile` (or wait for CD auto-sync).

## 2026-08-19 — Admin SPA: content detail/edit merged

- List click opens edit page directly; article story + profile skills visible without `/edit` URL.
- Removed read-only detail page; workflow transitions on unified edit view.
- **Owner VPS:** pull new `taha-cms:<sha>` after CI image build; hard refresh `/admin/`.

## 2026-08-19 — Slice 0+1: Caddyfile automated, web nginx container, old stack removed

- `/admin` 404 fixed (308 redirect). Old Java/Vue `taha-prod` stack decommissioned.
- Full Caddyfile in repo (`infra/caddy/Caddyfile`) with CD auto-sync via `caddy-sync.sh`.
- Slice 1: `taha-web` nginx image (Dockerfile + CI + CD). Compose now has `db` + `cms` + `web`.
- VPS prereq: install `caddy-sync.sh` at `/opt/taha/bin/caddy-sync.sh`.

## 2026-08-19 — Blog story composition (slice 1)

- Composition pages have `kind=landing|story`. Landing bilingual catalog is unchanged; story uses single-locale blocks including figure/video/audio/math.
- Optional `Article.story` FK. Owner edits the story on the article edit page (`/admin/content/article/:id`).
- Public `GET /api/articles/{locale}/{slug}` may include a published-only `story` tree; Astro `StoryBody` renders it, otherwise sanitized `body`.
- Media library accepts video/audio and SVG (magic-byte + SVG script reject); AV cap 50MB; anonymous `/media/` only `is_active`.
- `DEFER-0028` CLOSED for blog story→Astro. `DEFER-0029` (primaryColor + CV) and `DEFER-0030` (other entity stories) remain OPEN.
- **Owner VPS:** dumpdata + backup, migrate composition `0002` + content `0008`, rebuild CMS image and static site.

## 2026-08-19 — ADR-0027 unified Compose; CMS b6bea6a live; smoke Wagtail URL

- Owner production: `ghcr.io/tahamohamadi-ir/taha-cms:b6bea6a`; migrations `0008`/`0002` applied.
- Contract: public `web` will be nginx serving Astro HTML; host Caddy until `DEFER-0031`.
- `smoke-cms.sh` uses `/admin-wagtail/login/`. `RISK-0012` for auto-migrate.

## 2026-08-19 — CMS origin spec queued then accepted as ADR-0027

- Spec first queued as TODO; superseded the same day by ADR-0027 and IN_PROGRESS slices.

## 2026-08-19 — CI: Playwright preview hang on PR #45

- Web CI stuck on “Mobile overflow check”: silent `playwright install --with-deps`, shared port 4321 after smoke, and `waitUntil: networkidle`.
- Fix: reuse the smoke `astro preview` on 4321 (Astro allows only one preview), time-box `playwright install`, `waitUntil: load` instead of `networkidle`.

## 2026-08-19 — Projects listing, nested skills, SPA TOTP, rebuild hook

- Public `GET /api/projects/{locale}` lists published projects with `show_on_projects=True`; `has_case_study` is optional (default false). Additive `Project.show_on_projects` (`0007`).
- `/{locale}/projects/` renders card catalog copy without `CMS_API_BASE`.
- SPA profile edit includes nested skills via `PUT /api/admin/profiles/<locale>/<slug>` (full nested replace, sibling arrays preserved).
- ADM-0: TOTP enroll/regenerate/disable on `/api/v1/admin/auth/mfa/*` + `/admin/security`; Wagtail HTML remains fallback. Wagtail stays installed (`DEBT-0003`).
- ADM-6 slice: signed `/rebuild-trigger/` starts `rebuild-static.sh` when enabled (default still False, `DEFER-0027`). Pytest create→edit→publish→public JSON fa/en.
- **Blocked on owner VPS:** dumpdata + backup (`RISK-0010`), migrate `0007`, static rebuild, HMAC enable.

## 2026-08-19 — Docs ledger sync to ADM-1 cutover + ADM-6 spec

- AGENTS/README/Manifest/plan index now describe SPA `/admin/` and Wagtail `/admin-wagtail/`.
- `DEFER-0023` and `DEFER-0014` CLOSED; `DEBT-0003` records remaining Wagtail schema surface.
- Active spec: `docs/plan/ADM-6-frontend-wiring-task-spec.md`. New deferrals: `DEFER-0026` Playwright lifecycle, `DEFER-0027` HMAC enable, `DEFER-0028` composition/CV projection.

## 2026-08-18 — ADM-1: Admin SPA cutover (/admin/ → SPA, /admin-wagtail/ → Wagtail)

## 2026-08-18 — ADM-5: site settings + tags + featured spotlight

## 2026-08-18 — ADM-4: lifecycle transitions + translation queue + content health

## 2026-08-18 — ADM-3: page composition (Section/Block, layouts, MediaPicker in blocks)

- **Backend** اپ جدید `apps/cms/apps/composition/`: مدل‌های `CompositionPage` (key اسلاگ یکتا، locale fa/en، title، status draft/review/published/archived، published_at، created/updated_at)، `CompositionSection` (page FK، position، layout 1col/2col/3col، ratio، enabled؛ UniqueConstraint page+position)، `CompositionBlock` (section FK، position، block_type، settings JSONField، enabled؛ UniqueConstraint section+position)؛ migration `0001_initial.py`؛ `blocks.py` با کاتالوگ hero/heading/text/quote/cta/gallery/divider + `validate_block_settings` fail-closed + `SECTION_LAYOUT_RATIOS` + `composition_schema()`.
- **API** `apps/api/admin_composition.py` mount در `/api/v1/admin/composition`: GET فهرست (q/locale/status/page/pageSize؛ 400 VALIDATION)، POST create (201؛ key regex `^[a-z0-9-]+$`؛ 409 DUPLICATE)، GET /schema، GET /{id}، PUT /{id} جایگزینی full-document (If-Match + select_for_update + atomic؛ 409 CONFLICT با currentUpdatedAt؛ fail-closed با field paths مثل `sections[0].blocks[1].settings`). Guards: staff+OTP+CSRF؛ ارجاع رسانه strict int (float/bool رد).
- **Frontend** `apps/cms/admin-frontend/`: `src/lib/api.ts` (Composition types + fetchCompositionPages/Schema/Detail + createComposition/updateComposition)، `src/lib/composition.ts` (labels، ratioOptionsFor، REQUIRED_BLOCK_FIELDS)، `src/pages/CompositionListPage.tsx`، `src/pages/CompositionEditorPage.tsx` (schema-driven: layout/ratio سکشن‌ها، بلوک‌ها با فیلدهای text/textarea/select/media/mediaList از طریق MediaPicker، پیش‌نمایش grid، اعتبارسنجی client برای فیلدهای الزامی، 409 reload/discard، dirty-guard)، routes /composition، سایدبار «صفحات».
- **اعتبارسنجی:** 249 passed (20 تست `test_admin_composition_api.py` با regression ارجاع رسانه float/bool)، ruff clean، بدون migration جدید، SPA build/check PASS.
- **باقی:** projection عمومی (rendering در Astro) → ADM-6؛ rich blocks v2 (§14 U3) بعدی؛ Caddy no-store و deploy تصویر جدید CMS قدم‌های مالک؛ DEFER-0023 بدون تغییر؛ RISK-0010 بدون تغییر.

## 2026-08-18 — ADM-2: media library (upload/replace, alt-by-locale, orphans)

- **Backend** `apps/cms/apps/api/admin_media.py` (new): `/api/v1/admin/media` — GET list (q / type image|pdf / active true|false / page/pageSize؛ 400 VALIDATION)، POST multipart upload (201؛ `is_active` پیش‌فرض false؛ `full_clean` → 400)، GET /orphans (usage==0)، GET /{id}، PUT /{id} (optimistic lock If-Match داخل atomic+select_for_update؛ 409 CONFLICT با currentUpdatedAt)، POST /{id}/replace (هم‌خانواده‌ی MIME؛ 400 در غیرهم‌خانواده/مفقود). `media_usage_count` + `MEDIA_REFERENCE_FIELDS` (رجیستری خالی؛ در ADM-3 وصل می‌شود). Guards: staff+OTP+CSRF.
- **Model/migration:** `alt_text_fa`/`alt_text_en` روی `apps/cms/apps/media/models.py` (CharField blank default "" + `db_default=""`)؛ migration `0002_media_alt_text_en_media_alt_text_fa.py` (AddField با db_default — امن روی ردیف‌های موجود Postgres)؛ بستن DEFER-0014؛ makemigrations --check بدون pending.
- **Frontend** `apps/cms/admin-frontend/`: MediaLibraryPage (فیلترها، orphan toggle، آپلود با progress، drawer ویرایش با جایگزینی فایل + تأیید بایگانی + 409 reload/discard)، MediaPicker (modal قابل reuse)، MediaThumb، `api.ts` (uploadMedia/replaceMedia با XHR+progress)، route `/media`، سایدبار «کتابخانه رسانه».
- **اعتبارسنجی:** 229 passed (20 تست `test_admin_media_api.py` با 8 regression)، ruff clean، بدون migration جدید، SPA build/check PASS.
- **باقی:** اتصال MediaPicker به ویرایشگرهای محتوا به ADM-3 منتقل شد (DEBT-0004)؛ Caddy no-store و deploy تصویر جدید CMS قدم‌های مالک؛ DEFER-0023 بدون تغییر؛ RISK-0010 بدون تغییر.

## 2026-08-18 — ADM-1: content write API (create/update + optimistic lock) + SPA edit pages

- `/api/v1/admin/content/*` حالا write هم دارد: `POST /{entity}` (create 201، 409 DUPLICATE)، `PUT /{entity}/{id}` (optimistic lock If-Match داخل `select_for_update`؛ 409 CONFLICT/DUPLICATE)، `GET /schema` (متادیتای فیلدها). Guard: staff+OTP+CSRF؛ publish فقط وقتی `published_at` خالی است؛ فیلد عددی خالی skip؛ خطاها با کلید camelCase.
- SPA: صفحه‌ی ویرایش/ساخت (`/content/:entity/new` و `/:id/edit`) با فرم schema-driven، دکمه‌ی «+ ساخت»، مدیریت 409 با reload/discard.
- ۲۰۹ تست پاس (۱۲ تست write + ۲ regression)، ruff تمیز، بدون migration؛ review مستقل با ۵ رفع.

## 2026-08-18 — ADM-1: content read API + dev preview route + SPA content pages

- **Content read API:** `GET /content/{entity}` (فهرست با فیلترهای locale/status/q + صفحه‌بندی page/pageSize؛ خطاهای 400 VALIDATION / 404 NOT_FOUND) و `GET /content/{entity}/{id}` (جزئیات با مپ camelCase `fields`) برای ۷ موجودیت: landing, profile, article, research-topic, research-statement, project, publication — در `apps/cms/apps/api/admin_content.py` (new) و mount در `/api/v1/admin/content/`. `apps/cms/apps/api/admin_common.py` (new): AdminError، error handler، CSRF check، staff/OTP guards و client_ip مشترک شدند.
- **Dev preview route:** `serve_admin_ui` در `/admin-ui/` — DEBUG-only، path-traversal-safe (resolve+startswith)، SPA fallback به index.html، هدرهای `X-Robots-Tag: noindex, nofollow, noarchive` + `Cache-Control: no-store` (`apps/cms/apps/api/admin_spa.py` (new)، mount در `config/urls.py`).
- **SPA:** `apps/cms/admin-frontend/` — ContentListPage (تب‌های entity، فیلترهای locale/status/q هم‌گام با URL، جستجوی debounced، جدول RTL، صفحه‌بندی، حالت‌های loading/empty/error) و ContentDetailPage (رندر generic `fields`، اسلاگ‌های dir=ltr، حالت 404)؛ `src/lib/entities.ts` + `src/lib/format.ts` جدید؛ `src/lib/api.ts` با fetchContentList/fetchContentDetail + types؛ سایدبار «مدیریت محتوا» → /content؛ `vite.config.ts` base `/admin-ui/` و BrowserRouter basename `/admin-ui/`.
- **اعتبارسنجی:** backend 195 passed (7 تست جدید `test_admin_content_api.py` + 14 تست auth)، ruff clean، بدون migration جدید، SPA build/check PASS، smoke پیش‌نمایش dev PASS (deep-route fallback 200؛ traversal 404؛ DEBUG=False 404؛ missing build 404 با hint).
- **باقی:** write/update + optimistic locking؛ cutover واگتِیل→SPA زیر `/admin/` (DEFER-0023)؛ اعمال Caddy no-store snippet روی سرور (مرحله‌ی مالک)؛ RISK-0010 بدون تغییر.

## 2026-08-18 — ADM-1 foundation: custom admin auth API + React SPA scaffold

- **Backend:** `/api/v1/admin/` (Django Ninja) — `auth/csrf|login|logout|me` + `dashboard/summary`؛ session+CSRF صریح + TOTP/recovery + AuditLog + rate-limit؛ خطاهای `{code,message,fields}`؛ ۱۳ تست جدید؛ کل سویییت ۱۸۷ پاس.
- **Frontend:** `apps/cms/admin-frontend/` — React 18 + Vite + TS + Tailwind v4 + Vazirmatn (RTL فارسی)؛ ورود، AuthGuard، پوسته و داشبورد؛ build/type-check در CI جدید `ci-admin-frontend.yml`.
- **Caddy:** هندل `no-store` برای `/api/v1/admin/*` و `/api/admin/*` در snippet (اعمال روی سرور جدا).
- **Additive:** واگتِیل و `/admin/` فعلی تا cutover (ADM-1 نهایی) دست‌نخورده‌اند.

## 2026-08-18 — Server sync progress + stale CMS image pin fix

- `prod-cms-update-migrate.sh` پیش‌فرض قدیمی `b369885` را از دست داد؛ `CMS_IMAGE` حالا الزامی است (آخرین sha از workflow «CMS image»). پیش‌فرض قدیمی باعث میشد migrations 0005/0006 اعمال نشوند و `import_profile_seed` در دسترس نباشد.
- سینک سرور در جریان است: backup گرفته شد؛ گام‌های باقی‌مانده = deploy تصویر `430061b` + migrate + `import_profile_seed` + بازسازی استاتیک (VPS نود ندارد → یا نصب Node 24 یا build محلی با SSH tunnel).

## 2026-08-18 — Custom admin rebuild authorized (ADR-0026)

- **تصمیم مالک:** Wagtail از runtime و ادمین حذف می‌شود؛ جایگزین = ادمین اختصاصی React SPA زیر `/admin/` + Django Ninja `/api/v1/admin/*` با حفظ baseline امنیتی (session+CSRF+TOTP+audit+rate-limit). ادمین‌های Wagtail-session موجود (`/admin/profiles/` PR #31 و site content admin PR #24) در ADM-1 به SPA منتقل می‌شوند؛ فرانت عمومی Astro استاتیک با rebuild-trigger و `/api/`/`/media/` عمومی published-only بدون تغییر.
- **حفظ محتوا الزامی:** پایه‌ی کارها `origin/main` است (seed data + مدل‌های P4–P6 آنجا هستند)؛ `dumpdata` + backup تازه پیش از هر migration؛ فیلد/اسلاگ/locale موجود تغییر نمی‌کند.
- **مستندات:** ADR-0026، بخش §17 (ADM-0..ADM-6) در Task-list، `docs/plan/custom-admin-rebuild-fa.md`، به‌روزرسانی Manifest/AGENTS/ledgers؛ DEFER-0023 (انتقال admin)، DEFER-0024 (برنچ پایه)، DEFER-0025 (dark mode)، RISK-0010/RISK-0011، DEBT-0003 ثبت شدند.
- **مکمل‌های §14** (بیرون از ادمین): reading time/JSON-LD/TOC (بخشی DONE روی main)، گالری lightbox + فیلترهای URL-driven (P6)، FTS فارسی (P10)، سرویسلایه/OpenAPI/feature flags (ADM)، Vitest + Lighthouse CI + Playwright config + manual-test checklists (QA) در Task-list/BACKLOG تثبیت شدند.
- **وضعیت:** واگتِیل تا cutover ADM-1 به سرویس `/admin/` ادامه می‌دهد؛ کد در این slice تغییر نکرد (فقط مستندات/مراجع).

## 2026-08-18 — CMS-managed About + custom admin + detail routes

- About pages load the typed bilingual profile from `/api/profiles/<locale>/about` at build time, with `profile.snapshot.json` as fallback.
- Custom admin at `/admin/profiles/` edits the same aggregate under the existing Wagtail session, CSRF, and TOTP boundary.
- Detail URLs `/{locale}/about/{section}/{slug}/` emit only when a child row has a Latin slug and a non-empty detail body.
- Production CMS still needs migrations `0005`/`0006` plus `import_profile_seed` after merge; static CD can ship the snapshot immediately.

## 2026-08-17 — P2-H honesty closeout (landing, About, 404, footer)

- Hero CTAs point to live About and CV; perspective cards link to Research, Projects, and Writing.
- Landing adds Current Focus (`profile.availability`) and Selected Evidence from typed profile data.
- About evidence is stacked with fragment nav (find-in-page without tab clicks); closes `DEBT-0002`.
- Locale-prefixed 404 pages show single-locale chrome and recovery to home, About, and CV.
- Footer adds explore links to live locale destinations; header gains `aria-current` and language switch labels.

## 2026-08-17 — Research index: cards, filter, sort

- Research landing matches CV card layout. Filter (all / statement / topics / projects / publications) and sort (type / title / newest). Card click opens the dedicated page.

## 2026-08-17 — Public `/api/` live + blog pages + CMS admin image

- Caddy `handle /api/*` + `/media/*` on `tahamohamadi.ir` (DEFER-0017 CLOSED).
- CMS image `9ca2f3b`; seed `created=4` articles; static `release-9ca2f3b` (38 pages including blog details).
- Public smoke: `/api/articles/en` 200, `/en/blog/pars-sql-vtd-edge-overview/` 200, hashed logo 8075 bytes.

## 2026-08-17 — Wagtail Site content admin + article seed + hashed logos

- Wagtail admin menu **Site content** edits Django content models (Articles, Research, Projects). Not Wagtail Pages.
- `seed_site_content` now publishes 4 articles (2 en / 2 fa) from research prose.
- Header/gateway/footer logos use hashed `/_astro/*.png` URLs.
- `infra/deploy/apply-caddy-api.sh` merges public `/api/` + `/media/` into Caddy (DEFER-0017).


## 2026-08-17 — P4/P5 routes live + logo PNG + loopback CMS_API_BASE

- Production `release-82d51c6` serves blog/research/projects routes (200). Public `/api/` still 404 (DEFER-0017).
- PNG signatures renormalized (CR restored). Astro CMS fetch sends `X-Forwarded-Proto: https`; production exempts `^api/` from SSL redirect so loopback builds work. `smoke-blog.sh` no longer writes `/tmp/blog-smoke-body`.

## 2026-08-17 — RISK-0003 CLOSED (CMS backup + isolated restore)

- Owner installed refreshed `taha-platform-backup`; `--dry-run` PASS; systemd job SUCCESS; restic snapshot `3afdfc96` tagged `cms,postgres`.
- Isolated restore into throwaway postgres: import created `taha_cms`; `\dt` 75 tables; content migrations 0001–0004 + security 0001–0002; cleanup PASS (LOG-0140).

## 2026-08-17 — P6 Projects + case studies (code-first)

- **P6 code-first:** `ProjectCaseStudyDetails` OneToOne extension on canonical `Project`; `ProjectDiagram` and `ProjectScreenshot` with visibility redact; featured case study publish gate (problem/role/trade-offs/outcomes/availability/license). Migration `0004_p6_case_study_models`.
- **CMS API v0.4.0:** `/api/projects/{locale}` list (case-study projects) + detail; research project DTO gains `has_case_study`, case study fields, diagrams/screenshots (metadata only — no `/media/` URLs).
- **Astro:** `/{locale}/projects/` list + `/{locale}/projects/{slug}/` detail; research project pages cross-link to full case study; header Projects nav; sitemap entries; optional `CreativeWork` JSON-LD when real fields exist.
- **Ledgers:** `P6-case-studies-task-spec.md`; DEFER-0017 scope note (projects); DEFER-0021 (live demo embed); Task-list §11 ticked.
- **Verification:** 152 CMS pytest PASS; `npm run check` 0 errors; static build 16 pages. Prod migrate remains owner/`RISK-0003`.

> هر slice واقعی (کد، زیرساخت، مستندات) که در `docs/status/WORK_LOG.md` ثبت می‌شود می‌تواند یک ردیف خلاصه اینجا داشته باشد. Append-only؛ جدیدترین در بالا.

## 2026-08-16 — Production static P4+P5 (`release-59bf91e`)

- Deployed Astro artifact from `origin/main` `59bf91e` (checksum `40472597`); blog/research routes live empty-honest; `/api/`/`/media/` still 404.
- CMS migrate/image update **stopped** at RISK-0003 + no passwordless Docker for deploy user (`cms-repo` tip still `95a740f`). LOG-0137.

## 2026-08-16 — P5 Research code-first (no public `/api/`)

- ResearchTopic/Statement/Project/Publication + Wagtail snippets + Ninja published-only API; Astro research routes with optional `CMS_API_BASE`.
- DEFER-0017 (edge `/api/` blog+research), DEFER-0019 (Statement PDF), DEFER-0020 (curated graph). 140 pytest PASS; web check/build green. Security review Approve.

## 2026-08-16 — P5 Research Task Spec (S0)

- `P5-research-task-spec.md` IN_PROGRESS; DEFER-0017 scope includes research; DEFER-0019/0020 added. Implementation follows in subsequent commits.

## 2026-08-16 — P4 security harden (public projection)

- Redirect targets limited to public articles; API body re-sanitized; JSON-LD script breakout escaped (PR #15).

## 2026-08-16 — P4 Blog/Writing code-first (no public `/api/`)

- Article/Series/TopicTag models + Wagtail snippets + Ninja published-only API; Astro blog routes with optional `CMS_API_BASE`.
- DEFER-0017 (public Caddy `/api/`) and DEFER-0018 (RSS/Atom) recorded. 122 pytest PASS; web check/build green.

## 2026-08-16 — P3-07 staff draft preview boundary

- Staff-only `/admin/preview/<kind>/<pk>/` for Landing/Profile/Article; Whitelister sanitize; `noindex,nofollow,noarchive` + `Cache-Control: no-store`.
- Public share-token preview deferred as DEFER-0016. pytest suite green.

## 2026-08-16 — TOTP recovery codes + MFA disable (DEFER-0015 CLOSED)

- Hashed one-time recovery codes after enroll; login accepts recovery codes; regenerate/disable under Account two-factor.
- 97 pytest PASS. Owner rebuild CMS image to use on production.

## 2026-08-16 — CMS-aware backup script + media rendition contract

- Backup job targets `taha-cms-db-1` (+ optional legacy); `--dry-run` added. RISK-0003 still OPEN pending owner VPS evidence (`P3-cms-backup-restore-task-spec.md`).
- `apps.media.renditions` defines thumb/card/full WebP contract; originals forbidden for public images (tests).

## 2026-08-16 — RISK-0009 CLOSED (production TOTP + password)

- Owner rebuilt CMS to `95a740f`, smoke PASS, rotated admin password, enrolled TOTP on production.
- Next ops focus: RISK-0003 CMS-postgres backup/restore evidence; DEFER-0015 recovery codes optional.

## 2026-08-16 — Wagtail TOTP enrollment + OTP login (code)

- Account panel + `/admin/account/two-factor/` (QR + confirm); login requires OTP after enrollment; middleware redirects unenrolled staff to setup.
- `qrcode` runtime dependency; 88 pytest PASS. Owner must rebuild production image then enroll; RISK-0009 still OPEN for password + production TOTP.

## 2026-08-16 — Caddy `/static/*` live; CMS smoke full PASS

- Production Caddyfile gained `handle /static/*` → CMS; origin CSS 200; `smoke-cms.sh` full PASS (admin + CSS + health split).
- `RISK-0009` residual: rotate bypassed admin password; confirm TOTP. Snippet matchers aligned to live `/admin|/*` `/static|/*` `/health|/*`.

## 2026-08-16 — CMS runtime live (PARTIAL); `/static*` still unproxied

- Compose `taha-cms` healthy; migrate no-op; superuser created; initial smoke before `/static/*` Caddy handle.
- Residual closed in LOG-0127 for static assets; password/TOTP remain under RISK-0009.

## 2026-08-16 — C4 (CV/Resume) + header logo + B1 inventory + old-stack decommission

- **C4 DONE (md):** the owner placed `Assets/Taha_Mohammadi_Master_CV_Website_Profile.md` and `Assets/Taha_Mohammadi_Industry_Resume_Software_AI.md`; they are published as Markdown downloads (title/note/size) via `apps/web/src/components/Downloads.astro` on new locale pages `/en/cv/` and `/fa/cv/`. Per contract, agents do not generate PDFs; PDF replacement remains an owner option (owner decision 2026-08-16). Header nav gained a CV link; sitemap now includes `/en/cv/` and `/fa/cv/`. Local QA (Playwright against built dist via python http.server on port 8899): overflow=0, dir ltr/rtl correct, 2 links per page, logo loads; `npm run check` 0 errors; `npm run build` 8 pages.
- **Header logo:** `apps/web/public/logo.png` (8 KB) derived from `Assets/Taha Logo/Taha Logo base.png` — cropped (4000x4000 white margins removed) with transparent background; visually reviewed ACCEPT-WITH-NOTES (black outline heavy but acceptable at 48px). Replaces the `brand-mark` text span in `apps/web/src/components/Header.astro` (mark/TM glyph usage removed from header; footer mark untouched). Other logo variants (electric/gold/green/red/yasi/black) not used — recorded as alternatives pending a final brand pass.
- **B1 DONE (inventory):** the owner pasted `apt list --upgradable` (2026-08-16): 57 packages (Ubuntu 26.04 "resolute" updates) incl. docker-ce 29.7.2, docker-compose-plugin 5.4.0, containerd.io 2.3.3, grub-pc, linux-firmware*, bind9*, ubuntu-* meta packages, apparmor 5.0.2, libgcrypt20. Security-relevant: docker, containerd, grub, bind9, apparmor, libgcrypt20. Inventory only — the actual upgrade needs an owner maintenance-window decision.
- **Old-stack decommission authorized (2026-08-16):** the owner approved bringing down the pre-existing compose stack (`taha-prod-frontend`/`backend`/`postgres` at `/opt/taha/repository`); execution is owner-sudo; runbook `infra/deploy/decommission-old-stack.md` in progress.
- **DEFER-0009 stays OPEN:** owner decision 2026-08-16 — the Gemini-generated images in `Assets/` are 2048x2048 contact sheets (3x3 mascot grids) with white backgrounds, AI artifacts and visible Apple logos, not production-ready as og:image; stays OPEN awaiting a real image.
- **Pending:** production deploy of the new artifact built from HEAD (header logo + CV pages, 8 pages); release id follows the current pattern. CMS runtime deploy still BLOCKED (MFA enforcement + `RISK-0003` DB-import + deploy Task Spec — `RISK-0009` BLOCKED).

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

## 2026-08-16 (P3 hardening round)

- **MFA enforcement** (`django-otp` 1.5.4): `MFAEnforcementMiddleware` guards `/admin/` paths; 75 pytest PASS. RISK-0009 MFA blocker resolved in code.
- **Deploy Task Spec**: `docs/plan/P3-cms-deploy-task-spec.md` (~260 lines) — 7 prerequisites, 8 deploy steps, 22 ACs, rollback.
- **Incident runbook + SLO**: `docs/governance/INCIDENT_RUNBOOK.md` — SLOs (99.5% availability, <1% 5xx, p95 <2s), SEV-1/2/3 runbooks, escalation.
- **CI hardening**: `ci-cms.yml` +`git diff --check` + secret-pattern scan.
- **BACKLOG.md** rewritten (UTF-8 encoding fix + P3 deploy row updated).
- **Remaining CMS runtime blockers**: RISK-0003 DB-import evidence + owner approval + old-stack decommission execution (all owner/server-side).
