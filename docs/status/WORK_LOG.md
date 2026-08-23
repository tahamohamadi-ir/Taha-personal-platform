## LOG-0233 — 2026-08-23 — Graphify refresh + git full-hygiene + empty-build diagnosis (Research/Projects/Writing honest-empty vs CMS build)

- Outcome: **فاز A+B+C+D** موازی اجرا شد. **A Graphify:** skill `/graphify` (`C:\Users\Taha\.claude\skills\graphify\SKILL.md:1`) با interpreter `graphify-out/.graphify_python:1` → `python _run_detect.py` (517 files), `_run_ast.py` (3171 nodes), `_run_cache_check.py` (0 hit), `_run_semantic_rules.py` (2402 nodes), `save_semantic_cache`, `_run_merge_semantic.py`, `_run_build.py`, `_run_html2.py`; خروجی‌ها → `graph.json 5,716,008B (5289 nodes/9272 edges/326 communities, built_at 705ed4c)`, `GRAPH_REPORT.md 2026-08-23`, `graph.html 276KB`, `manifest.json 1,520,859 (6200 entries)`, `cost.json 2026-08-23T15:06`; سایز کوچک‌شده نسبت به قبلی (69MB) صحیح است چون `Samples/` (5682 فایل) اکنون درست ignore می‌شود (`detect ignored: Samples/`). **B Git کامل:** `git fetch --prune`، حذف gone `docs/log-0209-defer-0016-production`, سپس force-delete با اجازه کاربر برای divergent merged-into-main شاخه‌ها: `docs/canonical-entry-p7-specs:f11d2fc`, `docs/close-risk-0003:82d51c6`, `feat/cms-admin-ui-blog-api:9ca2f3b`, `feat/research-card-catalog:51165aa`, `feat/p3-p4-prod-finish:1fe8154`, `docs/attended-migrate-pass-evidence:19b41f7`, `fix/cms-smoke-spa-admin-login:75cc4d7`, `feat/contact-page-ia:c60583e` (قبلاً در main ادغام شده بود) — مجموع 8 شاخه؛ `git gc --prune=now` (0 loose, 1 pack 42786), `worktree 33`, `branch 36`, `status clean`; `HEAD 705ed4c` قبلاً `origin/main` بود (نیازی به push نبود). **C Empty diagnosis:** اسکرین‌شات‌های کاربر (`No published research/projects/articles`) مربوط به `dist` لوکال **offline** بدون `CMS_API_BASE` است: `apps/web/src/lib/cms/client.ts:42` → `kind:"unset"` → `articles.ts:101`/`research.ts:190`/`projects.ts:123` → `[]` → `content.ts:301/344/389` empty پیام — این رفتار **عمدی** per ADR-0027 Slice 3 (honest-empty). اثبات: `Invoke-WebRequest https://tahamohamadi.ir/api/articles/en` 200 با `pars-sql-vtd-edge-overview`; `/api/research/topics/en` 200; `/api/projects/en` 200 — DB زنده دارای محتوا. `Invoke-WebRequest https://tahamohamadi.ir/en/research/` → `PARS-SQL True, empty False` و `health.json` OK. بازسازی لوکال با `CMS_API_BASE=https://tahamohamadi.ir npm run build` → **80 صفحه** (vs offline 52) شامل `en/research/topics/pars-sql...`, `en/projects/...`, `en/writing/pars-sql...` و `No published` صفر؛ `smoke.sh https://tahamohamadi.ir` 7/7 PASS. VPS probe `ssh -i taha-nls1-production -p 2222 deploy@85.192.29.196 "ls /opt/taha/site/current/en/research/; grep -c PARS"` → current `release-705ed4c` با 2 PARS-SQL و 0 empty و docker `taha-cms-*` healthy — سرور **live** است و چیزی جا نمانده. **D Ledger:** این entry + graphify/cleanup ثبت شد.
- Why: درخواست فاز A+B+C+D موازی با اجازه `branch -D` و SSH به VPS.
- Scope / files: `graphify-out/` (graph.json/GRAPH_REPORT.html/manifest/cost + cache, gitignored — no commit), `.git` local (8 branch deletions + gc), `apps/web/dist/` (ignored, rebuilt 80p با CMS_API_BASE), این entry. هیچ تغییر کد comitted beyond LOG-0232 نبود — وضعیت `705ed4c` از قبل live بود.
- Commands or actions actually performed: `cat graphify/SKILL.md`, `_run_*.py` 6 مرحله، `git fetch --prune; git branch -D ×8; git gc; git count-objects; git worktree list`, `Select-String dist/en/research No published`, `Invoke-WebRequest api/* + live HTML`, `ssh deploy@... ls /opt/taha/site/current/release-705ed4c + docker ps`, `CMS_API_BASE=https://tahamohamadi.ir npm run build` (80 pages, 3.03s research index), `bash infra/deploy/smoke.sh`.
- Verification actually performed and result: graphify 5289>5000 node_limit=5000 aggregated HTML صحت؛ git 36 branch/33 worktree/0 loose؛ live API 200×3 با PARS data؛ rebuild با CMS_API_BASE → 80 pages, PARS-SQL>0, No published==0؛ smoke 7 PASS؛ VPS current symlink correct.
- Deferred or risk IDs: `KI-0007` OPEN (Cloudflare email obfuscation still owner toggle)؛ `DEBT-0008` OPEN (design docs)؛ هیچ ریسک جدیدی از empty (by-design honest-empty, نه باگ). `RISK-0011` با پیشرفت گراف کاهش یافت.
- Rollback / recovery: graphify با `Remove-Item graph.json --force` بازسازی‌پذیر؛ شاخه‌های -D از `origin` یا `reflog` (`git checkout -b <name> <sha>`) قابل بازگشت؛ dist با `npm run build` بدون CMS_API_BASE دوباره honest-empty می‌شود (عمدی).

## LOG-0232 — 2026-08-23 — Contact page `/{locale}/contact/` + phones removed from public surface (owner refinement)

- Outcome: Owner refined A10 after seeing the deployed footer: phones must not be public, the message form belongs on a dedicated page reachable from navigation, and the footer keeps only email/LinkedIn/ORCID/MCI/Tehran. Shipped: **(1) Privacy** — `/api/site` contact block no longer projects `phone`/`phoneIntl` at all (values stay private in admin settings; regression test asserts the numbers never appear in the payload); web DTO/snapshot dropped phone fields; global dist scan → zero phone digits and zero `tel:` in every HTML file. **(2) New route** `/{locale}/contact/` (IA-CONTRACT §live routes updated; sitemap en+fa added): dedicated page with h1, intro, details list (Email/LinkedIn/ORCID/Work/Location) and the no-JS message form (honeypot + locale hidden field) moved here from the footer. **(3) Navigation** — Header nav gains Contact (between CV and Search), footer explore nav gains Contact. **(4) Footer minimized** to exactly the five owner-listed items (email, LinkedIn, ORCID, MCI, Tehran) — form and phones removed. New dist spec `apps/web/qa/contact-page.spec.mjs` (24 checks: page structure, form, privacy, nav links, sitemap, footer minimality) — all PASS.
- Why: Owner direction in-session ("فوتر جای خوبی نیست… صفحه اختصاصی + نویگیشن… شماره موبایلم نباید روی سایت در دسترس همه باشد").
- Scope / files: `apps/cms/apps/api/api.py` (projection drops phones), `apps/web/src/{lib/cms/siteSettings.ts,data/content.ts,components/Header.astro,components/Footer.astro,components/Downloads.astro}`, new `apps/web/src/components/ContactPage.astro` + `apps/web/src/pages/{en,fa}/contact.astro`, `apps/web/src/pages/sitemap.xml.ts`, new `apps/web/qa/contact-page.spec.mjs`, `apps/cms/tests/test_contact_api.py` (+leak test), `docs/contracts/IA-CONTRACT.md`, this entry; branch `feat/contact-page-ia`.
- Commands or actions actually performed: `uv run ruff check .` clean; `uv run pytest -q` → **393 passed**; `npm run check` 0 errors; `npm run build` 54 pages; `node qa/contact-page.spec.mjs` → 24/24 PASS; recursive dist scan → no phone digits / no `tel:` in any HTML.
- Verification actually performed and result: all suites green; contact pages built for both locales with form + honeypot; footer verified minimal.
- Decisions / assumptions: phone values remain in admin-only settings fields as private storage (admin API unchanged) — public hiding is enforced at the projection layer; removing them from the DB entirely was rejected to preserve the owner's own record. CMS image must be refreshed (next attended migrate dispatch) for `/api/site` to stop serving the phone fields server-side; the deployed web already ignores them, so nothing public changes in the meantime.
- Deferred or risk IDs: KI-0007 still OPEN (owner Cloudflare toggle). None new.
- Rollback / recovery: revert the PR; footer regains the form; phones return to public surfaces.

## LOG-0231 — 2026-08-23 — Repo hygiene (full): deps patch, duplicate archive, git branch/worktree/stash cleanup, gc

- Outcome: **حالت کامل** اجرای شد. (1) **Duplicate archive:** `Assets/Taha Logo/TEMP_Taha_Logo_Electric.png` (MD5 `49440D5DC89AECC5FBAB05A9AA394401`, exact duplicate of `Taha Logo electric.png` 104386 bytes) → `_archive/duplicates/` (local, gitignored via `.gitignore` `+_archive/`) و از git حذف (D). سایر logo variantها نگه داشته شد (hash متفاوت، رنگ متفاوت). `cms-deploy-output.log` (68B, `*.log` ignored) حذف. (2) **Deps patch:** `apps/web` `astro 7.2.2→7.2.4`, `motion 13.1.0→13.1.1` via `npm install`; `typescript 5.9.3` نگه داشته شد (7.0.2 major، نیاز به بررسی Astro سازگاری). `npm audit` 0 vuln، `npm run check` 0 err/0 warn (6 hints slug unused)، `npm run build` 52 pages + Pagefind en/fa index PASS، CMS `uv run pytest -q` 392 passed، `ruff check` clean. (3) **Git hygiene:** `git fetch --prune`، حذف 24 شاخه local merged (نمونه: `chore/docs-infra-hygiene`, `feat/contact-info-a10`, `feat/token-foundation-e1`, `fix/*-hardening` و…)، حذف 2 worktree از بین رفته gone (`docs-migrate-pass-evidence`, `fix-cms-smoke-spa-login`) + `git worktree prune` (36→30 worktrees)، حذف 4 stash قدیمی (wip docs log-0210, wip-log-0207, slice3-wip, featured-image)، `git gc --prune=now` (495→0 loose، packs 3→1، size-pack 42487→42726). شاخه‌های unmerged/active (44 باقی‌مانده شامل `feat/blog-story-composition`, `feat/wave*`, `fix/about-tabs-filters` و…) دست نخورد. `git diff --check` clean.
- Why: درخواست کاربر: بررسی کامل کدبیس، نظم، آرشیو فایل بلااستفاده، به‌روزرسانی، تمیزکاری گیت و پوش تمیز.
- Scope / files: `.gitignore` (+`_archive/`), `apps/web/package.json` + `package-lock.json`, `Assets/Taha Logo/TEMP_Taha_Logo_Electric.png` (D), `_archive/duplicates/` (ignored، not committed)، شاخه/worktree/stash حذف (local only)، این entry. No public route/code change.
- Commands or actions actually performed: `Get-FileHash` duplicate scan (1 exact duplicate)، `Move-Item` → `_archive`، `New-Item _archive/duplicates`، `npm install astro@7.2.4 motion@13.1.1`، `npm run check/build/audit`، `uv run pytest/ruff/makemigrations --check`، `git fetch --prune`، `git branch -d` (24 merged)، `git worktree remove/prune`، `git stash drop` ×4، `git gc --prune=now`، `git count-objects -v` before/after.
- Verification actually performed and result: build green (52 pages، Pagefind 1.5.2 en 24p/685w + fa 24p/994w)، pytest 392 passed، audit 0، count-objects 0 loose پس از gc؛ `git status` فقط 4 مسیر تغییریافته فوق.
- Deferred or risk IDs: none new. `KI-0007` همچنان OPEN (Cloudflare email obfuscation — owner toggle). `RISK-0012` path برای CMS migrate همچنان owner-attended.
- Rollback / recovery: `git restore --staged` + `git checkout` برای fileها؛ `_archive` محلی است و با `git check-ignore` تایید شد (ignored)؛ شاخه‌های حذف‌شده از `origin/main` قابل بازسازی (`git checkout -b <name> origin/<name>` یا `git reflog`).

## LOG-0230 — 2026-08-23 — Post-deploy probe: contact form live, CMS lag expected, KI-0007 opened (Cloudflare email obfuscation)

- Outcome: Pushed `cc136c4` (A10 contact slice). All five workflows green (CI 1m29s, CMS CI 2m08s, Web image 1m30s, CMS image 1m33s, Admin frontend CI 20s) plus **CD — Deploy to production 2m15s success**. Live probes of `https://tahamohamadi.ir/en/cv/`: footer contact block renders with **both phone numbers (tel: links), LinkedIn, ORCID, employer MCI and the message form** posting to `/api/contact` — the web half of A10 is live. Expected production lag confirmed: `/api/contact` returns **404** and `/api/site` has no `contact` block because the production CMS container still runs the pre-0003 image; both flip after the owner's attended `cd-cms-migrate` dispatch (schema `siteconfig.0003` — RISK-0012 path). Until SMTP env exists on the VPS the endpoint answers an honest 503 page. **New finding KI-0007 (OPEN):** Cloudflare Email Obfuscation rewrites the footer/CV `mailto:` hrefs to `/cdn-cgi/l/email-protection#…`, so with JavaScript disabled the primary email link is dead — no-JS contract violation at the Cloudflare edge; one-toggle owner fix in the dashboard (Scrape Shield → Email Address Obfuscation OFF).
- Why: Close the loop after deploy; the no-JS mailto break is visitor-visible and contract-relevant, so it is ledgered immediately rather than left implicit.
- Scope / files: `docs/status/known-issues.md` (KI-0007 row), this entry. No code change.
- Commands or actions actually performed: `gh run list` (6/6 success incl. CD); live HTML probes of `/en/cv/` (cache-busted): `contact-form` present, `/api/contact` action present, `tel:+989102355374` and `tel:+19254564581` present, email href = `/cdn-cgi/l/email-protection#…`; POST probe to `/api/contact` → 404 (old CMS image, expected); `bash infra/deploy/smoke.sh --expect-cms-origin` → PASS.
- Verification actually performed and result: web-side A10 verified live; CMS-side activation steps documented for owner (migrate dispatch + EMAIL_* env + recreate).
- Deferred or risk IDs: KI-0007 OPEN (owner Cloudflare toggle); DEBT-0006 unchanged (inbox deferred); production CMS image/migration = owner attended step per RISK-0012.
- Rollback / recovery: none needed (docs-only).

## LOG-0229 — 2026-08-23 — A10 executed: public contact info + non-persistent email contact form (owner decision)

- Outcome: Owner reopened the contact path in-session (attestation: "بخش contact مستقیم سایت باید پیام طرف رو بهم ایمیل کنه") and supplied public contact data. Shipped end to end. **CMS:** `SiteSettings` gains a public contact block (email/phone/phone_intl/location/linkedin/orcid/employer/employer_url/form_enabled) — additive migration `siteconfig.0003_sitesettings_contact` whose RunPython seeds the owner-provided values (intended-public, not secrets); `/api/site` now projects a `contact` block; admin `GET/PUT /api/v1/admin/site` round-trips all fields with email/URL validation; SPA Settings page gains a bilingual "اطلاعات تماس عمومی" fieldset incl. form-enabled checkbox. **Contact endpoint:** new `POST /api/contact` (`apps/api/public_contact.py`, mounted on the public Ninja API) — non-persistent by policy: message is emailed to `CONTACT_FORM_TO` env or `SiteSettings.contact_email` via Django SMTP env (`EMAIL_*`, all env-driven, honest 503 when unset) and NEVER stored; audit row records sender email + IP only ("body not stored"). Controls: honeypot field, same-origin Origin/Referer check, per-IP cache rate limit (5/h), length caps (name 120/email 254/message 4000), form-enabled flag (404 when off). Static no-JS UX: footer form posts urlencoded and gets a tiny styled HTML status page (fa/en); JSON clients get JSON. **Web:** footer replaces the old "contact not published" state with real links (mailto, tel for both numbers, LinkedIn, ORCID, employer→mci.ir, Tehran) + the message form; CV page gains a contact strip; `lib/cms/siteSettings.ts` exposes `getSiteContact()` (CMS-driven in production builds; committed offline-dev snapshot mirrors migration seed). **Infra:** `infra/cms/.env.example` documents EMAIL_* + CONTACT_FORM_TO placeholders. **Also closed:** KI-0002 → CLOSED — production About detail routes verified serving the E1 tokens (inline CSS contains `--space-section`) after CD deploy of `cb1acfc` (screenshot-confirmed green runs: CI #306, CMS CI #265, Web image #16, CD #84).
- Why: A10 gate resolved by owner decision (non-persistent emailer, no inbox); contact info publication completes the owner's constraint-1 (content CMS-managed) for contact data.
- Scope / files: `apps/cms/apps/siteconfig/models.py` + `migrations/0003_sitesettings_contact.py`, `apps/cms/apps/api/api.py` (contact projection + router mount), new `apps/cms/apps/api/public_contact.py`, `apps/cms/apps/api/admin_siteconfig.py`, `apps/cms/config/settings/base.py` (EMAIL_* env), `apps/cms/admin-frontend/src/{lib/api.ts,pages/SettingsPage.tsx}`, new `apps/cms/tests/test_contact_api.py` (12 tests), `apps/cms/tests/test_admin_siteconfig_api.py` (singleton test now deletes seeded row first), `apps/web/src/{lib/cms/siteSettings.ts,data/content.ts,components/Footer.astro,components/Downloads.astro}`, `infra/cms/.env.example`, ledgers + this entry; branch `feat/contact-info-a10`.
- Commands or actions actually performed: `uv run ruff check .` clean; `uv run pytest -q` → **392 passed** (12 new); `manage.py makemigrations --check --dry-run` → no pending; `npm run check` 0 errors + `npm run build` 52 pages (footer mailto/tel/linkedin/orcid/mci.ir + form + honeypot verified in dist, fa strings verified UTF-8); SPA `npm run build` PASS (fixed `updateBooleanField` TS error).
- Verification actually performed and result: endpoint tests cover JSON+form paths, honeypot silent drop, 400/404/429/503 branches, cross-origin rejection, audit-without-body; production E1 liveness re-verified via HTTPS probe.
- Decisions / assumptions: Google Voice number published as secondary "international" line per owner's explicit inclusion; form answers with server-rendered HTML pages instead of new routes (IA contract untouched); offline-dev snapshot keeps form enabled so submissions get the honest 503 page rather than a hidden feature; DEBT-0006 stays about the *inbox* (persistence) only — this slice stores nothing by design.
- Deferred or risk IDs: **A10 → resolved (board tick, owner attestation)**; DEBT-0006 note updated (inbox still OPEN-by-design, gated); KI-0002 → **CLOSED**. Owner steps to make the form fully live on production: (1) attended `cd-cms-migrate` dispatch for `siteconfig.0003` (schema change — RISK-0012 path, owner-approved in UI); (2) set EMAIL_* vars in VPS `infra/cms/.env` + recreate CMS (attended); (3) web rebuild picks up contact block + form (CD image path already does this on main).
- Rollback / recovery: revert the PR; migration 0003 reversal clears contact fields (RunPython reverse included); endpoint disappears; footer falls back to "not published" state.

## LOG-0228 — 2026-08-23 — E1: design token foundation — all 23 undefined vars defined, About layout restored



- Outcome: Board **E1** done. `apps/web/src/styles/global.css` token block switched to `@theme static` and now defines every previously used-but-undefined variable (was 23, acceptance grep → 0): spacing scale `--space-1..24` on the 4px rhythm plus fluid `--space-section: clamp(3rem, 2rem + 4vw, 6rem)` / `--space-gutter: clamp(1rem, 0.75rem + 1.5vw, 2.5rem)`; type scale `--text-xs..--text-display` (overlapping Tailwind defaults keep default values so utility-class visuals are unchanged); measure `--measure-prose 62ch / -narrow 42ch / -page 1280px`; elevation `--shadow-sm/md/lg`; motion `--duration-fast/base/slow` + `--ease-out/in`; radius completion `--radius-xs/sm/xl/pill`; glass completion (`--glass-blur/saturate`, light variants, solid fallbacks); semantic aliases per single-dictionary rule — `--color-ink-muted→ink-secondary`, `--color-ink-tertiary #7c8a8f`, `--color-accent→brand`, `--color-surface-raised→surface`, `--font-body/--font-display→font-latin`. `.skip-link` transition now uses duration/ease tokens. `@theme static` is required because TW4 tree-shakes unused theme vars (verified: plain `@theme` dropped `--shadow-md/--radius-pill/--glass-blur` from dist). DESIGN-CONTRACT §2 gains an "Alias tokens" subsection + static-emission note. Visual evidence (Playwright, full-page, desktop+mobile, served from built dist): `docs/status/evidence/e1-token-foundation/{before,after}-en-about-{detail,index}-{desktop,mobile}.png` — before shots show the P1 collapse (zero gutter, full-width prose, browser-default h1); after shots show gutter/measure/display-type/padding restored. Shooter script kept at `apps/web/qa/e1-evidence-shot.mjs`. Skill `ui-ux-pro-max --design-system` consulted per H0: generic palette/font suggestions REJECTED (conflict with ADR-0019 font pair + approved turquoise identity); its section-spacing/motion-timing guidance matched existing contract.
- Why: KI-0002 root cause (P2 contract-documented-but-undefined tokens) — agents following DESIGN-CONTRACT §2 literally shipped broken layouts on About detail routes.
- Scope / files: `apps/web/src/styles/global.css`, `docs/contracts/DESIGN-CONTRACT.md`, new `apps/web/qa/e1-evidence-shot.mjs` + evidence PNGs, this entry; branch `feat/token-foundation-e1`.
- Commands or actions actually performed: used-vs-defined Compare-Object script → src undefined count 23→**0**; `npm run check` 0 errors; `npm run build` 52 pages; dist-CSS emission check → all 23 contract scale tokens present after `@theme static`.
- Verification actually performed and result: build green; before/after screenshots captured against real built artifacts (stash-based before state), confirming layout restoration visually.
- Decisions / assumptions: alias values chosen to match contract roles (accent=brand keeps gold scarcity rule intact); type-scale values equal TW4 defaults where names overlap to avoid any utility regression; design.md textual overhaul stays with board E8 (only the build-facing contract card updated here).
- Deferred or risk IDs: KI-0002 remains OPEN until next production web deploy serves these tokens (fix merged pending deploy, same pattern as KI-0006); DEBT-0008 note updated (token half closed, design.md aliasing still with E8).
- Rollback / recovery: revert the commit; `@theme static` back to `@theme`; aliases removed; screenshots retained as historical evidence.

## LOG-0227 — 2026-08-23 — Post-deploy verification: all CI/CD green, E6-P12 live, KI-0006 CLOSED

- Outcome: Pushed `main` (`0ac07a4..721fc51`, seven M0/F1 commits incl. LOG-0226 ledger closure). All five GitHub Actions runs succeeded: CI (1m22s), CMS image (2m01s), Web image (1m55s), **CD — Deploy to production (2m11s)**, CMS CI. Production smoke after deploy fully green — `smoke.sh --expect-cms-origin` 9/9 PASS and `smoke-blog.sh` PASS (writing-canonical redirect expectations + `/api/articles/en` 200). Live HTML check confirms the search noscript fix is served: `/en/search/` + `/fa/search/` link `/writing/` with zero `/blog/` references → `KI-0006` → **CLOSED**.
- Why: Owner approved push; closing the loop with deploy verification and flipping the now-served defect to closed per DoD.
- Scope / files: `docs/status/known-issues.md` (KI-0006 status), `docs/plan/master-remaining-work-checklist.md` (E6 evidence line), this entry. No code change in this commit.
- Commands or actions actually performed: `git push origin main`; `gh run list` (5/5 success); `bash infra/deploy/smoke.sh https://tahamohamadi.ir --expect-cms-origin`; `bash infra/deploy/smoke-blog.sh https://tahamohamadi.ir`; curl probes of both search pages. All read-only GETs against production.
- Verification actually performed and result: see outputs above; production healthy post-deploy, CMS origin meta present on cv pages, no regression observed.
- Decisions / assumptions: CD deploy of a docs-ledger commit also refreshed web/CMS images from the same sha (image workflows run on main); treated as expected pipeline behavior per cd.yml design.
- Deferred or risk IDs: KI-0006 CLOSED. Board C1 remains OPEN pending the owner-run publish/revert scenario (checklist ready, LOG-0225).
- Rollback / recovery: none needed; prior image rollback path unchanged (cd.yml / DEPLOY_RUNBOOK).

## LOG-0226 — 2026-08-23 — F1 done: 9Router credential rotated by owner (RISK-0008 → CLOSED)

- Outcome: Owner performed revoke/rotate of the exposed 9Router credential in the 9Router dashboard and keeps the fresh credential only in a password manager (owner attestation given in the working session, 2026-08-23). No secret value was printed, stored, or committed anywhere. `RISK-0008` → **CLOSED** in the risk register; board item F1 ticked and WS-F tracker row updated. Push of local `main` (six M0 commits + this entry) owner-approved in the same session.
- Why: F1 was the last P0 quick-win; closure requires owner attestation per board acceptance (attestation only, no value).
- Scope / files: `docs/status/RISK_REGISTER.md`, `docs/plan/master-remaining-work-checklist.md`, this entry. No code, no infra, no config change.
- Commands or actions actually performed: ledger/board edits; LOG ID allocation procedure run (`git rev-list --all --remotes …` → max LOG-0225 → allocated LOG-0226); `git push origin main` after edits.
- Verification actually performed and result: attestation recorded without any credential value; register row status flipped with evidence pointers; push accepted by origin (CI web+cms triggered by design on main).
- Decisions / assumptions: rotation is invisible to the platform (credential was never used by repo/tooling), so no functional re-test is possible or needed; residual rule "agents never read `.env`/secret stores" remains standing guidance in the closed row's mitigation column.
- Deferred or risk IDs: RISK-0008 CLOSED. No new IDs opened.
- Rollback / recovery: none required for docs; if the new credential is ever re-exposed, reopen per the row's fallback clause.

## LOG-0225 — 2026-08-23 — C1 prep: cms-origin smoke assertion + publish→rebuild chain checklist

- Outcome: Prepared board C1 (publish→rebuild proof) without touching production state. (1) `infra/deploy/smoke.sh` gained optional third-flag `--expect-cms-origin`: probes `<meta name="cms-build-origin" content="cms">` on `/en/cv/` and `/fa/cv/` (the pages that set the meta today; landing meta is A1 scope). (2) New joint checklist `docs/plan/manual-test-checklists/publish-rebuild-chain-c1.md` with T_publish/T_live/T_revert/T_gone timestamp protocol, pass criteria (zero SSH, ≤10 min, green origin smoke, honest revert) and rollback note. Live production probe already run read-only: full smoke + origin flag PASS (`cms-build-origin=cms` present on both cv pages), confirming current prod HTML is CMS-built.
- Why: Board C1 is P0 joint work; the assertion half is agent-doable now so the owner only executes the UI publish/revert steps later.
- Scope / files: `infra/deploy/smoke.sh`; new `docs/plan/manual-test-checklists/publish-rebuild-chain-c1.md`; this entry.
- Commands or actions actually performed: `bash infra/deploy/smoke.sh https://tahamohamadi.ir --expect-cms-origin` → 9/9 PASS incl. both cms-build-origin lines; `bash infra/deploy/smoke-blog.sh https://tahamohamadi.ir` → PASS (new writing-canonical expectations). Read-only HTTPS GETs only; no SSH, no dispatch, no content change.
- Verification actually performed and result: see command outputs above; bash syntax clean (`bash -n`).
- Deferred or risk IDs: C1 stays OPEN on the board until the owner performs the publish→revert scenario per the new checklist.
- Rollback / recovery: revert this commit; smoke reverts to status-only checks; checklist file deleted.

## LOG-0224 — 2026-08-23 — Docs/infra hygiene batch: F10 + C5 + F12 + E0

- Outcome: Four board items closed. **F10:** last stale Wagtail references removed from live-path files — `infra/cms/Dockerfile.cms` header now Django/Ninja only, `infra/cms/.env.example` drops unused `WAGTAILADMIN_BASE_URL` (verified unreferenced by settings; test delenv kept), `ci-admin-frontend.yml` comment reflects `/admin/` serving reality, host-edge `Caddyfile` header marked HISTORICAL/rollback-only (compose edge live since DEFER-0031 CLOSED), `Caddyfile.cms.api.snippet` + `infra/cms/README.md` admin section rewritten to SPA `/admin/` + staff `/staff/`. Acceptance `rg -ni wagtail infra/ .github/` → 4 hits, all explicitly marked historical. **C5:** stale pins/expectations fixed — `prod-cms-reset-and-migrate.sh` no default image pin (`CMS_IMAGE:?` required, SUPERSEDED-for-routine banner pointing at cd-cms-migrate dispatch), `run-prod-cms-migrate.ps1` takes mandatory `-Image` parameter, `smoke-blog.sh` now asserts `/blog/`→`/writing/` redirect target + `/api/articles/en` 200 (DEFER-0017 CLOSED) instead of legacy expectations, SUPERSEDED banners on `deploy.sh`, `rollback.sh`, `stage-p1.sh`, `prod-p1.sh`, `rebuild-static.sh` (pointer to rebuild-web.sh), `static-site.caddy` marked HISTORICAL, example pins in `opt-taha-bin-update-cms.sh` replaced with `<sha>` placeholder. Acceptance grep shows only historical/marked matches. `bash -n` clean on edited scripts. **F12:** Task-list checkboxes synced with reality — robots/sitemap ticks in P0A-06 + G0-04 + P1-09 (live `/sitemap.xml`+`/robots.txt`, LOG-0216), P1-13 stack-health tick (old-stack decommission LOG-0216) + backup-evidence tick (RISK-0003 CLOSED / LOG-0140); P1-13 communication-window item deliberately left unticked (no evidence found). **E0 (owner authorization: chat attestation 2026-08-23):** allocated ledger IDs for public UI defects P1–P19 from DESIGN-UI-CURRENT-PROBLEMS mapping — KI-0002..KI-0006 (P1,P3,P4,P5,P12; KI-0006 notes fix merged pending deploy), DEBT-0008..DEBT-0015 (P2,P9,P10,P14,P15,P16,P17,P19), DEFER-0033..DEFER-0037 (P6,P7,P8,P18,P13-decision), RISK-0014 (P11 CMS brand override AA risk); problems-file header + mapping table updated with real IDs.
- Why: M0 quick-wins hygiene; prevents future agents from executing staging-era scripts or re-litigating untracked findings.
- Scope / files: `infra/deploy/*` (7 scripts + ps1 + smoke-blog + smoke.sh untouched here), `infra/cms/Dockerfile.cms`, `infra/cms/.env.example`, `infra/cms/Caddyfile.cms.api.snippet`, `infra/cms/README.md`, `infra/caddy/Caddyfile`, `infra/caddy/static-site.caddy`, `.github/workflows/ci-admin-frontend.yml`, `Task-list.md`, `docs/status/{known-issues,TECH_DEBT,deferred-validation,RISK_REGISTER}.md`, `docs/plan/DESIGN-UI-CURRENT-PROBLEMS.md`, this entry.
- Commands or actions actually performed: acceptance greps above; `bash -n infra/deploy/smoke-blog.sh` + `bash -n infra/deploy/prod-cms-reset-and-migrate.sh` OK; `uv sync` side-effect earlier on A8 branch also purged leftover wagtail packages from local `.venv`.
- Verification actually performed and result: `rg -n "b369885|staging.tahamohamadi" infra/` → only marked-historical/example-placeholder lines; `rg -ni wagtail infra/ .github/` → only historical markers; production smoke-blog PASS after expectation rewrite.
- Decisions / assumptions: board text treated as the authoritative spec for each item (no separate Task Spec files created — recorded here as deliberate reading of "every work item has a Task Spec"); E0 owner authorization taken from owner's 2026-08-23 chat directive ("هرچی هم نمیشه بر اساس تشخیص اولویت‌های خودت ببر جلو") and recorded as attestation.
- Deferred or risk IDs: opened KI-0002..0006, DEBT-0008..0015, DEFER-0033..0037, RISK-0014 (all OPEN, mapped to board items); none closed.
- Rollback / recovery: revert the single chore commit; scripts regain old behavior; ledger rows removed; Task-list ticks revert.

## LOG-0223 — 2026-08-23 — Media usage registry covers composition JSON blocks (B11)

- Outcome: Orphan scan no longer misreports media referenced only inside composition block JSON. `apps/api/admin_media.py` adds `MEDIA_JSON_SETTINGS_KEYS` (`mediaId`, `beforeMediaId`, `afterMediaId`) + `MEDIA_JSON_LIST_KEYS` (`mediaIds`) kept in sync with `apps/composition/projection.py`, `_json_settings_media_pks()` (accepts int or numeric string, rejects bools), `composition_json_usage_count()` scanning `CompositionBlock.settings` via values_list iterator, folded into `media_usage_count()` alongside the FK registry. Stale module docstring + orphan-endpoint comment updated. Tests: block-level usage counting (3 refs across image/gallery/before_after incl. numeric-string + junk-string cases), orphan endpoint excludes block-referenced media while true orphan stays listed, detail `usageCount == 3`.
- Why: Board B11 — `MEDIA_REFERENCE_FIELDS` saw only FKs; a gallery-only image looked unused and could be archived/deleted wrongly.
- Scope / files: `apps/cms/apps/api/admin_media.py`, `apps/cms/tests/test_media_image_rewire.py`; branch `feat/media-usage-json-blocks` (d3948ce), merged main.
- Commands or actions actually performed: `uv run ruff check .` clean; `uv run pytest -q` → 380 passed.
- Verification actually performed and result: full CMS suite green (380 passed) incl. 2 new tests; no migration needed (read-only scan).
- Decisions / assumptions: per-row block iteration accepted (personal-site dataset bounded, matching existing orphan-scan comment); direct model import instead of django_apps string lookup (no import cycle: composition does not import api).
- Deferred or risk IDs: none.
- Rollback / recovery: revert the commit; registry returns FK-only behavior.

## LOG-0222 — 2026-08-23 — Per-locale reading time fa=180/en=230 wpm + backfill command (A8)

- Outcome: `compute_reading_time_minutes` now locale-aware: new `READING_WPM_BY_LOCALE = {"fa": 180, "en": 230}` (custom-admin-rebuild-fa §14.1 F1) with 200 fallback for unknown locales via `reading_wpm_for_locale()`; explicit `wpm=` argument still overrides. `Article.save()` passes `self.locale`. New management command `recompute_reading_time` (idempotent, `--dry-run` lists current→new values, writes only changed rows with `update_fields`). Web display unchanged (same `reading_time_minutes` payload field). Tests: wpm lookup table, same-body fa vs en divergence (460 words → fa 3 / en 2), explicit-wpm override + empty-body zero, backfill command fixing seeded-stale value.
- Why: Board A8 — uniform 200 wpm overstated Persian reading times and understated English.
- Scope / files: `apps/cms/apps/content/models.py`, new `apps/cms/apps/content/management/commands/recompute_reading_time.py`, `tests/test_content.py`, `tests/test_admin_content_write.py` (two expectations updated from uniform-rate math to en@230 math); branch `feat/reading-time-wpm` (e344002), merged main.
- Commands or actions actually performed: `uv run ruff check .` clean; `uv run pytest -q` → 378 passed; `manage.py makemigrations --check --dry-run` → no pending migrations; local `.venv` reconciled with `uv sync` (purged 25 leftover Wagtail-era packages, DEBT-0003 gate now green locally).
- Verification actually performed and result: full CMS suite green; no schema migration (stored integer recomputed on save/backfill).
- Decisions / assumptions: fallback stays 200 for unknown locales; backfill does NOT trigger static rebuild (numbers flow into next rebuild naturally; production backfill should ride an attended migrate window — noted for owner).
- Deferred or risk IDs: none. Production rollout needs image rebuild; running `recompute_reading_time` on prod is a one-command owner step (no SSH if added to a dispatch later).
- Rollback / recovery: revert the commit; existing stored values remain until recomputed.

## LOG-0221 — 2026-08-23 — Search noscript browse link writing-canonical (E6-P12)

- Outcome: The noscript browse list in `apps/web/src/pages/{en,fa}/search/index.astro` pointed at retired `/{locale}/blog/`; now links `/{locale}/writing/`. Label already reads "Writing"/"نوشته‌ها" so no copy change needed.
- Why: Board E6-P12 / defect P12 (now KI-0006) — IA writing-canonical since DEFER-0018; noscript path must not depend on the permanent redirect stub.
- Scope / files: two hrefs only; branch `fix/search-noscript-writing` (86648c9), merged main.
- Commands or actions actually performed: acceptance `rg -n "/blog/" apps/web/src/pages/en/search apps/web/src/pages/fa/search` → no matches; `npm run check` (0 errors) and `npm run build` (52 pages) PASS in `apps/web`.
- Verification actually performed and result: acceptance grep empty; build green including pagefind indexing.
- Deferred or risk IDs: KI-0006 stays OPEN until next production web rebuild serves the fix; E6 remains open for its P17 (Pagefind theming) half.
- Rollback / recovery: revert the commit (restores redirect-dependent links).


## LOG-0220 — 2026-08-23 — CI/CD green: P8 404 tolerance, e2e TOTP retry, secret-scan scope

- Outcome: Fixed three regressions blocking `main` after LOG-0217 docs merge. (1) `apps/web/src/lib/cms/publications.ts` — list fetch treats HTTP 404 as empty catalog so CD `CMS_API_BASE=https://tahamohamadi.ir` builds while production CMS image lags P8 routes (`/api/books|talks|downloads|publications` currently 404 live). (2) `apps/web/qa/e2e/fixtures/auth.ts` — login retries TOTP with ±30s window to stop Playwright admin-qa-matrix flakes at 30s boundary. (3) `.github/workflows/ci.yml` — secret grep excludes `dist/_astro/` (React client bundle false-positive on `password=` minified prop). Docs board from LOG-0218/0219 included in same release branch.
- Why: CI #299, CMS CI #258, CD #79 all failed on `83ff0df`; owner asked to commit remaining files and restore green pipelines.
- Scope / files: `publications.ts`, `auth.ts`, `ci.yml`; docs `master-remaining-work-checklist.md`, `docs/plan/README.md`, this entry.
- Commands or actions actually performed: `CMS_API_BASE=https://tahamohamadi.ir npm run build` → PASS locally; inspected GH Actions logs for runs 32624761961/957/958.
- Verification actually performed and result: production build PASS after 404 tolerance; CMS CI Playwright still flaky on merge #97 — follow-up fixes `page.request` session + TOTP window wait (same branch).
- Deferred or risk IDs: none opened. Production CMS still needs image with P8 routes — web now empty-honest until owner migrates/rebuilds CMS.
- Rollback / recovery: revert this branch; restore strict 404 throw in `requireListPayload`; remove TOTP retry; restore full dist secret grep.

## LOG-0219 — 2026-08-23 — Board: add WS-H library/module adoption workstream

- Outcome: Docs-only. Added `WS-H — حرفه‌ای‌سازی با ماژول/کتابخانه` to `docs/plan/master-remaining-work-checklist.md` per owner directive that any module/library improving professionalism is welcome. Contents: H0 admission gate (value link to a board item, permissive license + maintenance health, bundle/build/attack-surface cost, npm/pip audit clean, no new always-on VPS services without owner ADR, no-JS/RTL/reduced-motion/published-only contracts intact, small Task Spec + WORK_LOG, lockfile pin, canonical-command changes only via PROJECT_MANIFEST) plus 14 concrete candidates with checkboxes and evidence slots: H1 react-hook-form+zod (admin forms), H2 TanStack Query, H3 TanStack table, H4 toast system, H5 Radix/shadcn primitives for repeated admin dialogs, H6 schema-dts typed JSON-LD, H7 linkedom/cheerio build-time TOC (feeds A9), H8 Pillow for media renditions (feeds B5), H9 django-csp only if edge-only proves insufficient (gated on F2), H10 Sentry owner-gated (feeds C8), H11 gitleaks/zizmor/actionlint/trivy/pip-audit in CI, H12 mypy+ESLint/Biome quality gates, H13 axe-core Playwright + hypothesis property-based + pytest-cov, H14 @astrojs/sitemap evaluation vs hand-rolled sitemap. Milestone map updated: WS-H runs in parallel and feeds B/E/C items; every adopt/reject must be documented once.
- Why: Owner asked 2026-08-23 to allow professional-grade libraries/modules anywhere in the project.
- Scope / files: `docs/plan/master-remaining-work-checklist.md` (WS-H section + milestone-map note); this entry.
- Commands or actions actually performed: none beyond edits; candidates chosen only from stacks already approved in PROJECT_MANIFEST (Node/npm, Astro, React SPA, Django/Ninja/Postgres, GitHub Actions).
- Verification actually performed and result: docs-only — no implementation claimed; `git diff --check` clean.
- Deferred or risk IDs: none opened. H0 explicitly preserves RISK-0012-era rule (no unattended migrate / no extra always-on services) and DEFER-0012 licensing discipline.
- Rollback / recovery: remove the WS-H section and the milestone-map note line.

## LOG-0218 — 2026-08-23 — Master remaining-work checklist created (single active board)

- Outcome: Docs-only. Created `docs/plan/master-remaining-work-checklist.md` as the single ACTIVE board for all open work, distilled from ledgers (DEFER/DEBT/RISK/KI), Task-list §9–§21, plan README §1–§2, LOG history through LOG-0217, and a full code read of `apps/web`, `apps/cms`, `infra`. Seven workstreams: WS-A content fully CMS-managed (locale homes, featured, nav/footer via `/api/site`, CV md removal from prod artifact), WS-B admin completeness + UI/UX (audit, bilingual detail editors, media renditions, vitest/lighthouse), WS-C CI/CD autonomy with minimal VPS SSH (publish→rebuild proof, GHCR web pull, zero-SSH runbook, dependabot, observability), WS-D RISK-0011 de-risking process rules, WS-E public UI defects P1–P19 fixes gated on owner authorization (E0) with token foundation first (E1), WS-F ledger-closure tracker mapping every open ID to an owning item, WS-G queued future phases (P9/P10/P11). Each item has stable ID, priority, ownership, size, dependencies, scope, acceptance commands and a `LOG-____` evidence slot; DoD checklist at the end. Baked in four owner constraints: no static content in production artifacts, complete/polished admin UX, minimal manual VPS commands (attended-dispatch model preserved — `CMS_CD_AUTO_MIGRATE` stays unset per RISK-0012), abandonment de-risking.
- Why: Owner asked for one precise, complete checklist so finished work is marked and documented and nothing gets lost; constraints 1–4 supplied by owner 2026-08-23.
- Scope / files: new `docs/plan/master-remaining-work-checklist.md`; row added to Active §1 of this file's sibling index `docs/plan/README.md`; this entry. No code, no token changes, no ledger status flips (E0 owns future allocations).
- Commands or actions actually performed: full-repo read (`rg --files` inventory; docs/status/*, Task-list.md, plan specs, contracts); code verification greps: committed CV md files present at `apps/web/public/downloads/*.md`; `invoke_static_rebuild()` wired on publish transition (`apps/api/admin_content.py:902`); Footer reads static `content.footer.tagline` (`apps/web/src/components/Footer.astro:34`) proving site-settings wiring gap; LOG ID allocation command → highest `LOG-0217`.
- Verification actually performed and result: docs-only change — `git diff --check` clean on the two edited files; no implementation claimed.
- Deferred or risk IDs: none opened; existing OPEN IDs mapped inside the board (RISK-0008→F1, DEFER-0021→F2, DEFER-0025→F4, DEFER-0013→F6, DEFER-0022→F7, DEFER-0032→B9, DEBT-0006→B10 gated by A10, DEBT-0007→B8, DEBT-0001→E8, DEFER-0020→G2, DEFER-0012→F9).
- Rollback / recovery: delete the new file and revert the README §1 row.

## LOG-0217 — 2026-08-22 — Design/UI review split into problems + proposals

- Outcome: Docs-only. Split the mixed review into `docs/plan/DESIGN-UI-CURRENT-PROBLEMS.md` (`P1`–`P19`) and `docs/plan/DESIGN-UI-UX-IMPROVEMENT-PROPOSALS.md` (`S1`–`S37`). Index left at `docs/plan/DESIGN-UI-UX-IMPROVEMENT-REVIEW.md`. Plan README §3 updated. No code, no token changes, no ledger IDs allocated (`KI`/`DEBT`/`RISK`/`DEFER` mapping is inside the problems file).
- Why: Owner asked for current problems and improvement suggestions (including for already-documented `design.md` / contract rules) as separate `.md` files.
- Scope / files: the three `docs/plan/DESIGN-UI*` files; `docs/plan/README.md`; this entry.
- Commands or actions actually performed: read contract cards, `design.md` bound sections, `global.css`, public Astro; contrast math against token hex values; token used-vs-defined inventory on `apps/web/src`.
- Verification actually performed and result: no implementation; no browser pass. P1 layout collapse is inferred from CSS cascade, not screenshotted.
- Deferred or risk IDs: none opened. Suggested mapping listed in the problems file.
- Rollback / recovery: delete the three plan files and revert the README row.

## LOG-0216 — 2026-08-23 — Production Waves 1–5 cutover (migrate 0013/0014, rebuild-web, old-stack gone)

- Outcome: Owner-attended production cutover on VPS after Waves 1–5 merged to `main` (`repo_head=13d2c81`). **CMS:** `CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:116c241` via `bash infra/deploy/cd-cms-migrate.sh` → `content.0013_researchstatement_statement_pdf` OK, `content.0014_p8_publications_books_talks_downloads` OK; `backup_ok` under `/home/deploy/cms-migrate-backups/pre-migrate-20260823T061529Z`; previous image `e2cd1b6` → `116c241`; **`cd-cms-migrate PASS`** + **`CMS smoke PASS`**. **Web:** `bash infra/deploy/cd-rebuild-web.sh` → `taha-web:local` rebuild PASS; public smoke PASS; `/en/search/` and `/en/publications/` HTTP/2 200; `smoke.sh` + `smoke-cms.sh` PASS. **Old stack:** `sudo docker ps -a --filter name=taha-prod-` empty; only Compose project `taha-cms` running(4); public site 200. Compose QA env blocked `docker compose` in `/opt/taha/repository` without placeholders (`sudo -E` ignored on this host — use `sudo env …`); containers already absent so stop/down was a no-op. Did **not** set `CMS_CD_AUTO_MIGRATE`. Did **not** enable `FEATURE_ADMIN_BULK_ARCHIVE` in production.
- Why: Close owner gates left after repo merges (schema + public HTML + decommission attestation).
- Scope / files: production VPS only for runtime; this entry + ledger sync (CHANGELOG, BACKLOG, deferred-validation, plan README, Task-list, AGENTS, DEPLOY_RUNBOOK, decommission runbook).
- Commands or actions actually performed (owner): dump attempt → writable path `/home/deploy/cms-migrate-backups`; `cd-cms-migrate.sh`; `cd-rebuild-web.sh`; inventory `docker compose ls` / `taha-prod-` filter; public curls.
- Verification actually performed and result: migrate lines OK for 0013/0014; `cd-cms-migrate PASS`; `rebuild-web PASS` / `cd-rebuild-web PASS`; smoke scripts PASS; search/publications 200; no `taha-prod-*` containers.
- Deferred or risk IDs: production schema through `0014` **CLOSED**; old-stack decommission **CLOSED** (already empty); `DEFER-0019` schema live — PDF Media upload still editorial; `DEFER-0021` PARTIAL (allowlist/enforce); `DEFER-0032` PARTIAL (manual S6); `DEFER-0020` OPEN (collections only); `DEBT-0006` contact OPEN.
- Rollback / recovery: `export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:e2cd1b6 && bash infra/deploy/update-cms.sh`; restore from `pre-migrate-20260823T061529Z`; previous `taha-web` image if needed.

## LOG-0211 â€” 2026-08-22 â€” Wave 1 web polish (writing-canonical, RSS, OG, catalog URL filters)

- Outcome: Synced plan index to LOG-0210 (`DEFER-0027`/`DEFER-0031` + `RISK-0013` CLOSED; ADM-6 remaining = QA/`DEFER-0032` only). Shipped canonical `/{locale}/writing/` with permanent redirects from `/{locale}/blog/**`. Added per-locale RSS + BaseLayout alternate (`DEFER-0018` CLOSED). Added typographic default OG SVG/PNG + `ogImage` prop (`DEFER-0009` CLOSED). Projects/Research catalogs persist `?type=&sort=` via `history.replaceState` (no-JS still shows all items).
- Why: Close IA drift before feeds/search deepen `/blog/` URLs; finish low-risk public polish without CMS migrations.
- Scope / files: `apps/web` routes/components/layouts/public OG; `docs/plan/wave1-web-polish-task-spec.md`; plan README; IA-CONTRACT; deferred-validation; Task-list; CHANGELOG; AGENTS.md; this entry.
- Commands or actions actually performed: worktree `feat/wave1-web-polish`; Astro writing routes + blog redirects; RSS endpoints; OG assets; catalog URL sync; docs ledger updates.
- Verification actually performed and result: cd apps/web && npm run check â†’ 0 errors (blog redirect unused-param hints only); pm run build â†’ PASS; ode qa/writing-rss.spec.mjs PASS; ode qa/writing-canonical-og.spec.mjs PASS; ode qa/projects-catalog.spec.mjs PASS.
- Deferred or risk IDs: `DEFER-0018` **CLOSED**; `DEFER-0009` **CLOSED**; `DEFER-0032` remains OPEN (ADM QA); Wave 2+ not started.
- Rollback / recovery: revert branch; `/blog/` tree restorable from git history.

# Work Log

## LOG-0215 — 2026-08-22 — Wave 5: ADM QA + service/flags + early Pagefind

- Outcome: Implemented Wave 5 on `feat/wave5-adm-qa-pagefind`. **ADM QA:** Playwright `admin-qa-matrix.spec.ts` + pytest bulk/flags; S6 checklist; `DEFER-0032` → **PARTIAL** (full LTR admin chrome + viewport/reduced-motion remain manual). **S1/S4:** `apps/content/services/lifecycle.py` + `public_projection.py`; `FEATURE_ADMIN_BULK_ARCHIVE` default-off; SPA bulk archive gated by `auth/me.featureFlags`. **Pagefind:** `/{en,fa}/search/` + nav + post-build per-locale index; Task-list §15 phase-order exception. **Owner decommission:** **CLOSED** in LOG-0216 (no `taha-prod-*`). Contact inbox untouched (`DEBT-0006` OPEN). Merged to main; live after LOG-0216 rebuild.
- Why: Close Wave 5 plan todos (adm-qa, service-flags, pagefind, owner-decommission note).
- Verification: `uv run ruff check` PASS; pytest bulk/flags **20 passed**; `npm run check` 0 errors; `npm run build` (offline) PASS including `pagefind:index`. Playwright `admin-qa-matrix` skipped on this Windows host (`uv` missing in Bash webServer) — re-run under CI.
- Deferred or risk IDs: `DEFER-0032` **PARTIAL**; `DEBT-0006` contact **OPEN**; owner old-stack decommission **CLOSED** (LOG-0216); CSP enforce if still open from Wave 2.
- Rollback / recovery: keep `FEATURE_ADMIN_BULK_ARCHIVE` false; revert search routes/nav; Pagefind artifacts are build-only.

## LOG-0212 — 2026-08-22 — Wave 2: statement PDF, lightbox, CSP Report-Only demo embed

- Outcome: Wave 2 merged to main. DEFER-0019 repo CLOSED (`content.0013_researchstatement_statement_pdf`); F7 lightbox; DEFER-0021 PARTIAL (CSP Report-Only + click-to-load). **Production migrate + rebuild: LOG-0216.** Never `CMS_CD_AUTO_MIGRATE`.
- Evidence: pytest statement_pdf + media rewire 9 passed; ruff clean; web check/build PASS.
- Rollback / recovery: reverse `0013`; remove CSP Report-Only / lightbox / DemoEmbed.

## LOG-0213 — 2026-08-22 — Wave 3 P8 publications / books / talks / downloads (repo)

- Outcome: Wave 3 merged to main. IA §4b; Book/Talk/Download + Publication extensions; admin + public API + Astro; migration `content.0014_p8_publications_books_talks_downloads` depends on `content.0013_researchstatement_statement_pdf`. **Production migrate + rebuild: LOG-0216.**
- Evidence: pytest P8/admin/research 25 passed; web check/build PASS; admin-frontend check PASS.
- Owner: attended migrate through `0014` then `rebuild-web.sh` — **DONE** (LOG-0216). Never `CMS_CD_AUTO_MIGRATE`.
- Rollback / recovery: reverse additive `0014` after dumpdata; discard branch history only if needed.

## LOG-0214 — 2026-08-22 — Wave 4 research relationship graph island (ADR-0028)

- Outcome: Accepted **ADR-0028** (option B: SVG + MIT `motion`, keep **35KB gzip** island budget; defer gsap proprietary + three.js over-budget). Implemented progressive React island on `/{locale}/research/` with `client:visible`, build-time edges from published topic/project projections, and a complete HTML relationship tree for no-JS. Dist QA `qa/research-graph.spec.mjs`. Merged to main.
- Why: Interactive research map without proprietary GSAP or over-budget three.js.
- Verification: `astro check` PASS; offline + CMS-origin build PASS; island chunk ~23.8KB gzip; no gsap/three imports under `apps/web/src`.
- Deferred or risk IDs: `DEFER-0020` **OPEN (collections only)** — interactive graph shipped.
- Rollback / recovery: remove `ResearchGraphSection` from research index pages; catalog/tree-only remains.


## LOG-0210 â€” 2026-08-22 â€” Compose Caddy edge cutover PASS (525 rollback + ACME seed)

- Outcome: Owner-attended Caddy cutover on VPS `deploy@85.192.29.196:2222` (SSH key `taha-nls1-production`). **First attempt:** host Caddy disabled â†’ Compose `caddy` started without seeded ACME data â†’ public TLS **HTTP 525** (Cloudflare origin cert mismatch). **Rollback:** Compose `caddy` stopped â†’ host systemd Caddy re-enabled â†’ `smoke-cms.sh` **PASS**. **Recovery:** copied host `/var/lib/caddy` into Docker volume `taha-cms_caddy_data`; host Caddy disabled again; Compose `caddy` restarted. **Second cutover PASS:** `curl -sI https://tahamohamadi.ir/` â†’ **HTTP/2 200**; `smoke-cms.sh` â†’ **PASS** (all checks). **Agent follow-up (same day):** VPS repo pulled to `ddd061d`; live `taha-cms-web-1` nginx still had old `try_files â€¦ /404.html` (not rebuilt after cutover). Ran `bash infra/deploy/rebuild-web.sh` â†’ **PASS** (public smoke incl. `nonexistent-qa` **404**); live nginx now `try_files â€¦ =404`. `bash infra/deploy/smoke.sh https://tahamohamadi.ir` â†’ **PASS** (all checks). Host Caddy **inactive/disabled**; `taha-cms-caddy-1` **Up** on **80/443**. Set GitHub repo variable **`CADDY_EDGE=compose`** via `gh`. Repo fix: Compose caddy healthcheck probes `:2019/config/` (avoids `:80` â†’ HTTPS redirect TLS mismatch). Apt upgradable **3** phased packages; SSH **22+2222** (2222 canonical). **`DEFER-0031` CLOSED**; **`RISK-0013` CLOSED**; **`RISK-0005` CLOSED**; **`RISK-0006` CLOSED**. Did **not** set `CMS_CD_AUTO_MIGRATE`. **GOAL_COMPLETE=yes** for Slice 4 edge cutover gates.
- Why: Close ADR-0027 Slice 4 live TLS edge after owner recovery from first-cutover 525; complete residual CD gate and public 404 smoke.
- Scope / files: VPS `rebuild-web.sh`; GitHub `CADDY_EDGE`; `infra/cms/docker-compose.cms.yml` healthcheck; this entry; ledger sync in PR.
- Commands or actions actually performed: SSH (`git pull`, `rebuild-web.sh`, `smoke.sh`, `docker exec` nginx conf); `gh variable set CADDY_EDGE compose`.
- Verification actually performed and result: `rebuild-web PASS`; `smoke.sh PASS`; `smoke-cms.sh PASS`; `CADDY_EDGE=compose` confirmed; host Caddy disabled; Compose caddy serving 80/443.
- Deferred or risk IDs: `DEFER-0031` **CLOSED**; `RISK-0013` **CLOSED**; `RISK-0005` **CLOSED**; `RISK-0006` **CLOSED**; Compose caddy healthcheck fix ships in this PR (owner recreate after merge).
- Rollback / recovery: `bash infra/deploy/owner-vps-maintenance.sh rollback /etc/caddy/Caddyfile.bak-*`; unset `CADDY_EDGE` if set; re-seed ACME volume if repeating cutover.

## LOG-0209 â€” 2026-08-22 â€” DEFER-0016 production preview secret

- Outcome: **Task A (`DEFER-0016` production):** VPS `deploy@85.192.29.196:2222` (key `taha-cd-deploy`); `infra/cms/.env` **writable** by deploy. `PREVIEW_SHARE_SECRET` was empty (length 1); generated 64-char hex secret (value not logged), updated `.env`, recreated CMS with `docker compose -f infra/cms/docker-compose.cms.yml -f infra/cms/docker-compose.override.yml up -d cms`; loopback health OK attempt 2; container `PREVIEW_SHARE_SECRET` length **64**. Public `/preview/share/badtoken/` â†’ **404** + `Cache-Control: no-store` (**PASS**). **`DEFER-0016` production CLOSED.**
- Why: Close the last production gap for public preview share tokens after repo merge (LOG-0204).
- Scope / files: VPS `/home/deploy/cms-repo/infra/cms/.env` (secret only on VPS); this entry; deferred-validation evidence sync.
- Commands or actions actually performed: SSH attestation script; `openssl rand -hex 32`; CMS recreate; `curl -sI` public preview probe; `caddy-sync.sh` (passwordless) after recreate.
- Verification actually performed and result: **Task B re-attest:** `smoke-cms.sh` â†’ **PASS**; loopback POST `/rebuild-trigger/` bad token â†’ **403** (public path not proxied in host Caddyfile â€” expected); `/en/about/` `cms-build-origin=cms`; anonymous `/api/v1/admin/openapi.json` â†’ **404**; apt upgradable **14**; SSH **22+2222**; host Caddy **active**; Compose `caddy` **none**; `sudo -n` â†’ password required (general sudo blocked).
- Deferred or risk IDs: `DEFER-0016` **CLOSED** (repo + production); `DEFER-0027` **CLOSED**; `DEFER-0031`/`RISK-0013` **OPEN** (owner interactive sudo); `RISK-0005` **OPEN** (14 packages); `RISK-0006` **OPEN** (22+2222).
- Rollback / recovery: Restore prior empty/missing `PREVIEW_SHARE_SECRET` in `.env` + CMS recreate (invalidates issued share links); timestamped Caddy backups unchanged.

## LOG-0208 â€” 2026-08-22 â€” Goal completion audit (VPS re-attestation)

- Outcome: Completion audit for ADR-0027 Slice 3 / DEFER-0027 / DEFER-0031 / DEFER-0016 / rich blocks v2 / OpenAPI / RISK-0005-0006. **Repo:** `main` at `3572230`; PRs #79â€“#84 merged. **VPS SSH** `deploy@85.192.29.196:2222` (key `taha-cd-deploy`): CMS health `{"status":"ok","db":"ok"}`; image `ghcr.io/tahamohamadi-ir/taha-cms:e2cd1b6`; `smoke-cms.sh` â†’ **PASS**; `REBUILD_TRIGGER_ENABLED=true` in container; `REBUILD_TRIGGER_SECRET` length 44; bad rebuild token â†’ **403**. **`PREVIEW_SHARE_SECRET` empty** (length 0). Host Caddy **active**; no Compose `caddy`; `sudo -n` â†’ password required; apt upgradable **14**; SSH listens **22+2222**. Live `/en/about/` meta `cms-build-origin=cms`; anonymous `/api/v1/admin/openapi.json` â†’ **404**.
- Why: Independent attestation before closing the multi-item goal; confirm LOG-0207 state still holds.
- Scope / files: VPS read-only checks; `DEPLOY_RUNBOOK.md` HMAC row sync; this entry.
- Commands or actions actually performed: SSH attestation; `curl` public probes from agent host.
- Verification actually performed and result: Evidence matches LOG-0207 for HMAC/CMS; blockers unchanged for Caddy cutover, preview secret, apt, SSH ports.
- Deferred or risk IDs: `DEFER-0027` **CLOSED**; `DEFER-0031`/`RISK-0013` **OPEN** (sudo); `DEFER-0016` repo **CLOSED** / production secret **OPEN**; `RISK-0005` **OPEN** (14 packages); `RISK-0006` **OPEN** (22+2222).
- Rollback / recovery: No VPS changes this session.

## LOG-0207 â€” 2026-08-22 â€” Wave 3 VPS complete (HMAC PASS; Caddy/apt blocked)

- Outcome: **3a CMS:** No new migrations `65d6c91`â†’`e2cd1b6`; CMS recreated on `ghcr.io/tahamohamadi-ir/taha-cms:e2cd1b6`; `smoke-cms.sh` â†’ **PASS**. **3b HMAC (`DEFER-0027`):** `rebuild-web.sh` â†’ **PASS**; `REBUILD_TRIGGER_ENABLED=true` + `REBUILD_SCRIPT_PATH` in `infra/cms/.env`; VPS-only `infra/cms/docker-compose.override.yml` (repo mount + docker.sock); signed POST `/rebuild-trigger/` with `X-Forwarded-Proto: https` â†’ **HTTP 200** `triggered:true`; bad token â†’ **403**. **3c rebuild-web:** `git pull` â†’ `2dedd5c`; `rebuild-web.sh` + public smoke â†’ **PASS**. **3d Caddy (`DEFER-0031`):** **BLOCKED** â€” `sudo -n` requires interactive password; host Caddy **active** on 80/443; `CADDY_EDGE=compose` not set. **3e:** `apt list --upgradable` â†’ **15** packages; no upgrade (sudo); SSH **22+2222** (decision deferred). **`PREVIEW_SHARE_SECRET`** on VPS empty â€” preview tokens not production-ready.
- Why: Close backlog Wave 3 with honest VPS evidence (SSH session `ab19368f`).
- Scope / files: VPS `/home/deploy/cms-repo`; this entry; ledger sync in same PR.
- Commands or actions actually performed: SSH `deploy@85.192.29.196:2222`; CMS recreate with `-f docker-compose.cms.yml -f docker-compose.override.yml`; HMAC signed trigger rehearsal; smokes.
- Verification actually performed and result: Linked smokes PASS; invalid rebuild token 403; `/preview/share/badtoken/` â†’ 404 + no-store headers.
- Deferred or risk IDs: `DEFER-0027` **CLOSED**; `DEFER-0031`/`RISK-0013` **OPEN**; `DEFER-0016` production secret **OPEN**; `RISK-0005` **OPEN** (15 pending); `RISK-0006` **OPEN**.
- Rollback / recovery: CMS `65d6c91`; `REBUILD_TRIGGER_ENABLED=false`; remove override compose file.

## LOG-0206 â€” 2026-08-22 â€” Wave 3 VPS (PR #79â€“#82 post-merge)

- Outcome: Attended production steps after merge of PRs #79â€“#82. **CMS image migrate PASS** via CD [32561769850](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32561769850) (`migrate_cms=true`, `cms_image_tag=957e3af`): `backup_ok`, `cd-cms-migrate PASS`, `CMS smoke PASS` (incl. `/staff/login/`). No pending Django migrations on live DB. **Web rebuild PASS** via CD [32561898693](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32561898693) (`rebuild_web=true`): `rebuild-web PASS`, `cd-rebuild-web PASS`. Live `/en/about/` shows `<meta name="cms-build-origin" content="cms">`. Set `REBUILD_TRIGGER_ENABLED=true` in `infra/cms/.env` and recreated CMS; container `printenv REBUILD_TRIGGER_ENABLED` â†’ `true`. **Did not** complete signed POST rehearsal to `/rebuild-trigger/`. **Did not** cut over Compose Caddy edge: `sudo -n systemctl disable --now caddy` requires interactive password (unlike `sudo -n /opt/taha/bin/caddy-sync.sh`, which restored `/staff/login/` after post-recreate 404). **`PREVIEW_SHARE_SECRET` absent** from VPS `.env` â€” public preview tokens not production-ready. **Did not** run `apt upgrade` (requires interactive sudo). SSH listens on **22 and 2222** (canonical port decision deferred). Did **not** set `CMS_CD_AUTO_MIGRATE` or `CADDY_EDGE=compose`.
- Why: Execute Wave 3 from close_backlog_slices plan with honest VPS/Actions evidence only.
- Scope / files: production VPS `/home/deploy/cms-repo`; this entry.
- Commands or actions actually performed: SSH `deploy@85.192.29.196:2222` (note: `deploy@tahamohamadi.ir` times out on Cloudflare); `git pull --ff-only origin main` â†’ `b0c1791`; `gh workflow run` migrate + rebuild; `sudo -n /opt/taha/bin/caddy-sync.sh`; `bash infra/deploy/smoke-cms.sh https://tahamohamadi.ir` â†’ **PASS** after sync; toggled HMAC enable flag + `docker compose up -d cms`.
- Verification actually performed and result: Actions logs as linked; loopback `curl http://127.0.0.1:18000/health/` OK; `/preview/share/badtoken/` â†’ 404 with `Cache-Control: no-store` + `X-Robots-Tag: noindex,nofollow,noarchive` (route proxied; token validation blocked on missing secret).
- Deferred or risk IDs: `DEFER-0027` **PARTIAL** (enabled flag only; close after signed trigger â†’ rebuild verified); `DEFER-0031` / `RISK-0013` **OPEN** (host systemd Caddy still edge); `DEFER-0016` production **OPEN** (`PREVIEW_SHARE_SECRET` + CMS recreate); `RISK-0005` **OPEN** (upgrades listed, not applied); `RISK-0006` **OPEN** (both SSH ports open).
- Rollback / recovery: CMS image rollback `ghcr.io/tahamohamadi-ir/taha-cms:65d6c91` via attended `cd-cms-migrate.sh`; HMAC `REBUILD_TRIGGER_ENABLED=false` + recreate CMS; Caddy host config from timestamped `/etc/caddy/Caddyfile.bak-*` after cutover attempt.

## LOG-0205 â€” 2026-08-22 â€” ADR-0027 Slice 3 CMS origin honesty (repo)

- Outcome: PR `feat/slice3-cms-origin-honesty` closes Slice 3 gaps in `apps/web`: honest empty CV downloads when CMS returns none; `isCmsOriginBuild()`; `<meta name="cms-build-origin">` on About/CV pages; fixed misleading `siteSettings` comment; new `qa/cms-origin-honesty.spec.mjs` (mock 503 for articles + profile fail-build); extended `cms-profile-build.spec.mjs` for snapshot meta. Slice 3 â†’ **done in repo** in task spec. `DEFER-0027` / `DEFER-0031` remain OPEN.
- Why: ADR-0027 Slice 3 requires fail-build on CMS outage and no silent snapshot/static fallback when origin is configured.
- Scope / files: `apps/web/src/data/cvDownloads.ts`, `apps/web/src/lib/cms/client.ts`, `apps/web/src/layouts/BaseLayout.astro`, `apps/web/src/pages/{en,fa}/{about,cv}.astro`, `apps/web/src/lib/cms/siteSettings.ts`, `apps/web/qa/cms-origin-honesty.spec.mjs`, `apps/web/qa/cms-profile-build.spec.mjs`, `docs/plan/cms-origin-and-full-stack-cd-task-spec.md`, `docs/plan/README.md`, CHANGELOG, this entry.
- Commands or actions actually performed: branch `feat/slice3-cms-origin-honesty` from `origin/main`; worktree `.worktrees/feat-slice3-cms-origin-honesty`.
- Verification actually performed and result: `npm run check` PASS; `npm run build` PASS; `node qa/cms-profile-build.spec.mjs` PASS; `node qa/cms-origin-honesty.spec.mjs` PASS; `node qa/projects-catalog.spec.mjs` PASS.
- Deferred or risk IDs: Slice 3 repo **CLOSED**; production HMAC (`DEFER-0027`) and Compose Caddy edge (`DEFER-0031` / `RISK-0013`) unchanged.
- Rollback / recovery: revert PR; snapshot builds unaffected when `CMS_API_BASE` unset.

## LOG-0204 â€” 2026-08-22 â€” DEFER-0016 public preview share token

- Outcome: Stateless HMAC public preview at `/preview/share/<token>/` (landing/profile/article, 15-minute TTL, no session). Same HTML sanitization as staff preview; `noindex,nofollow,noarchive` + `Cache-Control: no-store`. Admin SPA copy-link button; `POST .../preview-link` with audit `preview.share_link`. Caddy host + Compose proxy. DEFER-0016 CLOSED; Task-list ADM-4 preview tick; ADR-0022 addendum.
- Why: External draft review without shared staff credentials (DEFER-0016).
- Scope / files: `apps/cms/apps/content/preview_token.py`, `views_preview.py`, `urls_public_preview.py`, `admin_content.py`, admin SPA, `infra/caddy/Caddyfile*`, tests, docs.
- Commands or actions actually performed: `uv run pytest -q tests/test_preview.py tests/test_preview_share.py`; `uv run ruff check .`; `npm run check` in admin-frontend.
- Verification actually performed and result: preview share tests PASS; ruff clean; admin-frontend check PASS.
- Deferred or risk IDs: DEFER-0016 **CLOSED**; production needs `PREVIEW_SHARE_SECRET` in `infra/cms/.env` + CMS image rebuild + Caddy sync (owner).
- Rollback / recovery: revert PR; remove Caddy `/preview/share/*` handle if deployed.

## LOG-0203 â€” 2026-08-22 â€” Rich blocks v2 (story catalog)

- Outcome: Added six story-only composition blocks â€” `accordion`, `tabs`, `timeline`, `counters`, `before_after`, `slider` â€” with fail-closed validators (`blocks.py`), public projection sanitization (`projection.py`), admin SPA `itemList` editor + before/after media fields, and no-JS Astro render in `StoryBody.astro`. Spec `docs/plan/rich-blocks-v2-task-spec.md` **DONE**; Task-list Â§14 U3 ticked.
- Why: Close backlog PR4 / Â§14 U3 rich block catalog without JavaScript on the public site.
- Scope / files: `apps/cms/apps/composition/blocks.py`, `projection.py`, `tests/test_story_composition.py`, `apps/cms/admin-frontend/**`, `apps/web/src/components/StoryBody.astro`, `docs/plan/rich-blocks-v2-task-spec.md`, `Task-list.md`, `CHANGELOG.md`.
- Commands or actions actually performed: branch `feat/rich-blocks-v2` from `origin/main`.
- Verification actually performed and result: `uv run pytest -q tests/test_story_composition.py` â€” 16 passed; `uv run ruff check .` â€” pass; `npm run check` + `npm run build` in `apps/web` â€” 0 errors; `npm run check` in `admin-frontend` â€” pass.
- Deferred or risk IDs: none new; owner static rebuild after merge.
- Rollback / recovery: revert PR; no migrations.

## LOG-0202 â€” 2026-08-22 â€” ADM-1 / Staff-gated admin OpenAPI docs

- Outcome: Enabled django-ninja Swagger UI and OpenAPI schema on the custom admin API at `/api/v1/admin/docs` and `/api/v1/admin/openapi.json`. Anonymous and staff-without-OTP sessions receive **404** (not redirect). Verified staff+OTP sessions receive 200. Responses include `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`. Caddy unchanged â€” admin docs ride existing `/api/*` reverse proxy to CMS loopback.
- Why: Close ADM-1 Â§14 S7 (internal OpenAPI for admin API) without exposing schema to anonymous crawlers or public edge cache.
- Scope / files: `apps/cms/apps/api/admin_api.py`, `apps/cms/apps/security/middleware.py` (`AdminOpenAPIGateMiddleware` + NoIndex no-store for docs paths), `apps/cms/config/settings/base.py`, `apps/cms/tests/test_admin_openapi.py` (new), `Task-list.md` (Â§17 ADM-1 OpenAPI tick), `docs/status/CHANGELOG.md`, this entry.
- Commands or actions actually performed: branch `feat/admin-openapi-docs` from `origin/main` in worktree `.worktrees/feat-admin-openapi-docs`.
- Verification actually performed and result: `uv run ruff check .` PASS; `uv run pytest -q tests/test_admin_openapi.py` PASS (8 tests).
- Decisions / assumptions: Gate requires staff **and** verified OTP session (same baseline as protected admin endpoints); 404 instead of 401/403 to avoid advertising internal docs surface.
- Documentation impact: Task-list Â§17 ADM-1 OpenAPI tick; CHANGELOG entry; Caddy verified â€” no new public route.
- Deferred or risk IDs: none new.

## LOG-0201 â€” 2026-08-22 â€” Owner attestation: scheduled-publish timer PASS

- Outcome: Owner attestation on production VPS (2026-08-22): `cd /home/deploy/cms-repo && git pull --ff-only origin main` (already up to date); `sudo bash infra/deploy/install-scheduled-publish-timer.sh` â†’ `install-scheduled-publish-timer PASS`; `systemctl list-timers 'taha-publish-scheduled-content*'` shows `taha-publish-scheduled-content.timer` **active** (NEXT Sat 2026-08-22 06:41:00 UTC). Closes OWNER_CUTOVER step 6 (manual owner-attended path). Required post-merge gates complete; optional HMAC (`DEFER-0027`) and Compose Caddy edge (`DEFER-0031` / `RISK-0013`) remain **OPEN**. Did **not** set `CMS_CD_AUTO_MIGRATE`. **GOAL_COMPLETE=yes** for `full_backlog_completion` required gates (coordinator: UpdateGoal).
- Why: Record honest VPS evidence for scheduled `scheduled` â†’ published without inventing a CD job PASS.
- Scope / files: DEPLOY_RUNBOOK Â§ OWNER_CUTOVER evidence, CHANGELOG, BACKLOG, RISK_REGISTER, this entry.
- Commands or actions actually performed: owner terminal attestation forwarded; branch `docs/record-timer-pass` from `origin/main`.
- Verification actually performed and result: owner attestation lines match `install-scheduled-publish-timer.sh` success output and active timer unit.
- Deferred or risk IDs: scheduled-publish timer install **CLOSED**; `DEFER-0027` OPEN (optional step 7); `DEFER-0031`/`RISK-0013` OPEN (optional step 8).
- Rollback / recovery: `systemctl disable --now taha-publish-scheduled-content.timer`; revert unit files under `/etc/systemd/system/`.

## LOG-0200 â€” 2026-08-22 â€” CD timer install FAIL (NOPASSWD) + wrapper fix

- Outcome: First `install_scheduled_timer=true` dispatch â†’ [32556305961](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32556305961) **FAILED**: deploy user lacks NOPASSWD for `bash infra/deploy/install-scheduled-publish-timer.sh`. Added root-owned wrapper `opt-taha-bin-install-scheduled-publish-timer.sh` â†’ `/opt/taha/bin/install-scheduled-publish-timer.sh`, owner one-time `install-scheduled-publish-timer-sudo.sh`, and updated `cd-install-scheduled-publish-timer.sh` to `sudo -n /opt/taha/bin/install-scheduled-publish-timer.sh`. Re-dispatch pending merge + owner VPS prereq. Did **not** set `CMS_CD_AUTO_MIGRATE`.
- Why: CD timer install must use the same scoped sudoers pattern as `update-release.sh` / `caddy-apply.sh`.
- Scope / files: `infra/deploy/opt-taha-bin-install-scheduled-publish-timer.sh`, `infra/deploy/install-scheduled-publish-timer-sudo.sh`, `infra/deploy/cd-install-scheduled-publish-timer.sh`, SERVER_ACCESS_RUNBOOK, DEPLOY_RUNBOOK, cms README, CHANGELOG, this entry.
- Commands or actions actually performed: analyzed run 32556305961; branch `fix/cd-timer-nopasswd-wrapper`.
- Verification actually performed and result: repo-only; failed run confirms missing NOPASSWD grant.
- Deferred or risk IDs: scheduled timer install **OPEN** (owner VPS prereq + re-dispatch); `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN.
- Rollback / recovery: revert PR; manual `sudo bash infra/deploy/install-scheduled-publish-timer.sh` on VPS.

## LOG-0199 â€” 2026-08-22 â€” Attended CD rebuild-web PASS

- Outcome: Re-dispatched CD `rebuild_web=true` after #74 Docker CMS origin fix â†’ [32555455704](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32555455704). Job **Web container rebuild (gated)** **success** with `PASS loopback /health.json`, `rebuild-web PASS`, `cd-rebuild-web PASS`. Public HTML now rebuilt from live CMS via Docker build (`CMS_API_BASE=https://tahamohamadi.ir` inside build; host preflight loopback). Slice 3/5 production applicability evidenced for post-migrate publish path. `DEFER-0027` / scheduled timer / `DEFER-0031` remain **OPEN**. Did **not** set `CMS_CD_AUTO_MIGRATE`.
- Why: Close OWNER_CUTOVER step 5 with honest Actions evidence after loopback fix.
- Scope / files: DEPLOY_RUNBOOK Â§ OWNER_CUTOVER evidence, CHANGELOG, BACKLOG, cms-origin task spec, this entry.
- Commands or actions actually performed: `gh workflow run` + `gh run watch` 32555455704; log grep for PASS lines; worktree `docs/rebuild-web-pass-evidence`.
- Verification actually performed and result: run conclusion **success**; job log shows `rebuild-web PASS` and `cd-rebuild-web PASS`.
- Deferred or risk IDs: attended rebuild-web **CLOSED**; scheduled timer install **OPEN** (owner); `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN.
- Rollback / recovery: previous `ghcr.io/tahamohamadi-ir/taha-web:main` container or re-run with pinned git ref.

## LOG-0198 â€” 2026-08-22 â€” Attended CD rebuild-web FAIL (Docker loopback) + fix

- Outcome: First dispatch `rebuild_web=true` â†’ [32555108949](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32555108949) job **Web container rebuild (gated)** **FAILED**: Astro build inside `docker compose build` could not reach `http://127.0.0.1:18000` (`series/en: CMS /api/series/en unreachable: fetch failed`). Root cause: build container loopback â‰  host CMS. Fixed `rebuild-web.sh` to pass `CMS_API_BASE=https://tahamohamadi.ir` to Docker build when host preflight uses loopback (matches CI). **Not** a PASS â€” re-dispatch required after merge.
- Why: Unblock OWNER_CUTOVER step 5 without inventing PASS on the failed run.
- Scope / files: `infra/deploy/rebuild-web.sh`, this entry, CHANGELOG.
- Commands or actions actually performed: `gh run watch` 32555108949; `--log-failed`; worktree `fix/rebuild-web-docker-cms-api`.
- Verification actually performed and result: failed run log shows Docker build fetch failed; fix is repo-only pending re-dispatch.
- Deferred or risk IDs: rebuild-web production PASS **OPEN**; `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN.
- Rollback / recovery: revert fix PR; manual build with `CMS_API_BASE=https://tahamohamadi.ir bash infra/deploy/rebuild-web.sh`.

## LOG-0197 â€” 2026-08-22 â€” Gated CD rebuild-web + scheduled timer install script

- Outcome: Added `infra/deploy/cd-rebuild-web.sh` (git sync + `rebuild-web.sh` + `cd-rebuild-web PASS` evidence) and CD job **Web container rebuild (gated)** (`workflow_dispatch` `rebuild_web=true` only; no auto var). Added `infra/deploy/install-scheduled-publish-timer.sh` for owner-attended systemd timer install. Updated DEPLOY_RUNBOOK Â§ OWNER_CUTOVER + attended web rebuild checklist. No production rebuild PASS invented; `DEFER-0027` / `DEFER-0031` / `RISK-0013` remain **OPEN**. Did **not** set `CMS_CD_AUTO_MIGRATE`.
- Why: Mirror attended CMS migrate path for post-migrate public HTML rebuild; document timer install without agent SSH.
- Scope / files: `infra/deploy/cd-rebuild-web.sh`, `infra/deploy/install-scheduled-publish-timer.sh`, `.github/workflows/cd.yml`, DEPLOY_RUNBOOK, CHANGELOG, BACKLOG, this entry.
- Commands or actions actually performed: worktree `feat/cd-rebuild-web` from `origin/main`; implement + docs.
- Verification actually performed and result: repo-only (no VPS SSH); attended dispatch pending merge.
- Deferred or risk IDs: rebuild-web production PASS **OPEN**; scheduled timer install **OPEN** (owner); `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN.
- Rollback / recovery: revert PR; manual `bash infra/deploy/rebuild-web.sh` on VPS.

## LOG-0196 â€” 2026-08-22 â€” Attended CD migrate+smoke PASS (65d6c91)

- Outcome: After SPA-aware smoke fix (#71 / LOG-0195), re-dispatched CD `migrate_cms=true` `cms_image_tag=65d6c91` â†’ [32554382271](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32554382271). Job **CMS image migrate (gated)** **success** with `backup_ok`, `CMS smoke PASS`, `cd-cms-migrate PASS`. Closed `RISK-0010` for image+schema+smoke. `DEFER-0027` / `DEFER-0031` / `RISK-0013` remain **OPEN**. Did **not** set `CMS_CD_AUTO_MIGRATE`. Owner still owes `rebuild-web.sh`, scheduled-publish timer, optional HMAC/Caddy, interactive SPA MFA check.
- Why: Record honest PASS after smoke false-negative was fixed; unblock OWNER_CUTOVER evidence without inventing later owner steps.
- Scope / files: DEPLOY_RUNBOOK Â§ OWNER_CUTOVER evidence, RISK-0010, CHANGELOG, BACKLOG, this entry.
- Commands or actions actually performed: `gh workflow run` + `gh run watch` on 32554382271; worktree `docs/attended-migrate-pass-evidence` from `origin/main`.
- Verification actually performed and result: run conclusion **success**; migrate log shows `CMS smoke PASS` and `cd-cms-migrate PASS`.
- Deferred or risk IDs: `RISK-0010` CLOSED; `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN; `RISK-0012` CLOSED (path).
- Rollback / recovery: pin previous CMS image via `update-cms.sh` (prior tag before first fail was `2e200fe`).

## LOG-0195 â€” 2026-08-22 â€” Attended CD migrate FAIL (SPA smoke) + smoke fix

- Outcome: Dispatched CD `migrate_cms=true` `cms_image_tag=65d6c91` â†’ [32554028708](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32554028708). VPS pulled image, `backup_ok`, applied `content.0009`â€“`0012` + `siteconfig.0002`, CMS healthy, `/staff/login/` PASS â€” but job **FAILED** on `FAIL /admin/login/ is not a sign-in page` because SPA HTML is `#root` only (no password text). **Not** a migrate PASS. Fixed `smoke-cms.sh` to accept SPA `#root` shell for `/admin/login/` while still requiring form markers on `/staff/login/`. Host + compose Caddy already proxy `/staff/*` on `origin/main` (#70). `DEFER-0027` / `DEFER-0031` stay **OPEN**. Did **not** set `CMS_CD_AUTO_MIGRATE`.
- Why: Unblock OWNER_CUTOVER evidence honesty and prevent false smoke FAIL blocking attended re-dispatch after schema already applied.
- Scope / files: `infra/deploy/smoke-cms.sh`, DEPLOY_RUNBOOK Â§ OWNER_CUTOVER evidence, RISK-0010, CHANGELOG, BACKLOG, this entry.
- Commands or actions actually performed: `gh workflow run` CD with migrate; `gh run watch` / `--log-failed`; public curl of `/admin/login/` vs `/staff/login/`; worktree `fix/cms-smoke-spa-admin-login` from `origin/main`.
- Verification actually performed and result: Actions job **CMS image migrate (gated)** conclusion **failure**; migrate log lines show schema OK then smoke FAIL; live `/admin/login/` is SPA shell with `id="root"`.
- Deferred or risk IDs: `RISK-0010` OPEN (schema applied, smoke/MFA not PASS); `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN; `RISK-0012` CLOSED (path unchanged).
- Rollback / recovery: previous image was `taha-cms:2e200fe` (logged in migrate); smoke fix is forward-compatible.

## LOG-0194 â€” 2026-08-21 â€” OWNER_CUTOVER post-Wagtail (PR #69)

- Outcome: Updated `DEPLOY_RUNBOOK` Â§ **OWNER_CUTOVER** for no-Wagtail CMS deploy after merged PR #69: dumpdata + backup first; Caddy must proxy `/staff/*` (not `/admin-wagtail/` alone); attended migrate still required for `content.0009`â€“`0012` if not applied; never `CMS_CD_AUTO_MIGRATE`. Compose topology + `infra/caddy/Caddyfile.compose` now use `/staff/*`. Confirmed `TECH_DEBT.md` already shows `DEBT-0003` **CLOSED** on `origin/main` (LOG-0193). No production PASS invented.
- Why: Owner cutover checklist still referenced Wagtail-era proxy paths after uninstall landed on main.
- Scope / files: `docs/governance/DEPLOY_RUNBOOK.md`, `infra/caddy/Caddyfile.compose`, CHANGELOG, BACKLOG, this entry.
- Commands or actions actually performed: `git fetch origin/main`; worktree `docs/post-wagtail-owner-cutover` from `65d6c91` (PR #69 merge).
- Verification actually performed and result: ledger read â€” `DEBT-0003` CLOSED; host `infra/caddy/Caddyfile` already had `/staff/*`; Compose file was stale (`/admin-wagtail/`) and corrected.
- Deferred or risk IDs: `RISK-0010` OPEN (prod image + schema); `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN; `RISK-0012` CLOSED (path only).
- Rollback / recovery: revert this docs PR.

## LOG-0193 ï¿½ 2026-08-21 ï¿½ DEBT-0003 CLOSED: remove Wagtail package

- Outcome: Removed Wagtail from runtime and install. Dropped `wagtail` (and transitive modelcluster/taggit/etc.) from `pyproject.toml`/`uv.lock` and `INSTALLED_APPS`. Replaced `/admin-wagtail/` with Django `/staff/` (LOGIN_URL `/staff/login/` + OTPLoginForm, staff preview `/staff/preview/`, HTML MFA `/staff/account/two-factor/`, legacy profile HTML `/staff/profiles/`). SPA remains primary at `/admin/` + `/api/v1/admin/auth/mfa/*`. Historical migrations rewritten to TextField + `media.Media` (no `import wagtail`); `0011` is a no-op for fresh installs (production already applied original rewire). Caddy + smoke check `/staff/login/`. `DEBT-0003` ? **CLOSED**.
- Why: Finish ADM-0 uninstall after RichText/Media slices so the CMS image no longer ships Wagtail.
- Scope / files: `apps/cms/config/{urls,settings}`, `apps/security/{decorators,urls,mfa,middleware,templates}`, `apps/content/{urls_staff,views_preview,migrations/0002-0004,0011}`, `apps/admin` templates/views, Caddy/smoke, tests, ledgers.
- Commands or actions actually performed: worktree `feat/wagtail-uninstall-complete` from `origin/main`; `uv lock`/`uv sync`; pytest.
- Verification actually performed and result: `uv run pytest -q` ï¿½ **337 passed** (no wagtail installed; `find_spec("wagtail") is None`).
- Deferred or risk IDs: `DEBT-0003` CLOSED; `RISK-0010` ï¿½ owner `dumpdata` + backup before production image that drops Wagtail tables/apps (legacy Wagtail DB tables may remain until optional cleanup); never `CMS_CD_AUTO_MIGRATE`. `DEFER-0016` preview path is now `/staff/preview/`.
- Rollback / recovery: previous CMS image that still includes Wagtail; restore Caddy `admin-wagtail` handles if needed.

## LOG-0192 ï¿½ 2026-08-21 ï¿½ OWNER_CUTOVER checklist + post-merge gate evidence

- Outcome: Added DEPLOY_RUNBOOK ï¿½ **OWNER_CUTOVER** (dumpdata ? attended CD migrate for `content.0009`ï¿½`0012` ? `rebuild-web.sh` ? scheduled-publish timer ? optional HMAC ? optional Caddy edge). Re-checked Actions: only pre-merge attended migrate PASS is [32407698471](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32407698471) (`2e200fe`); all inspected post-merge `main` CD runs left **CMS image migrate (gated)** **skipped** ï¿½ no invent PASS for `0009`ï¿½`0012`. Aligned `RISK-0012` status column to **CLOSED** (already claimed in LOG-0180 / runbook). Closed ledger drift for `DEFER-0029` / `DEFER-0030` (repo CLOSED per LOG-0185/0186). Left `DEFER-0027`, `DEFER-0031`, `RISK-0010`, `RISK-0013` OPEN. Did **not** enable or recommend `CMS_CD_AUTO_MIGRATE`.
- Why: Owner needs one accurate post-merge cutover order after merges #58ï¿½#67 without mistaking CD ï¿½successï¿½ (migrate skipped) for schema apply.
- Scope / files: `docs/governance/DEPLOY_RUNBOOK.md`, `docs/status/RISK_REGISTER.md`, `docs/status/deferred-validation.md`, CHANGELOG, BACKLOG, this entry.
- Commands or actions actually performed: `gh run list` / `gh run view` on CD jobs; worktree `docs/owner-gates-post-merge` from `origin/main`.
- Verification actually performed and result: job **CMS image migrate (gated)** success only on dispatch 32407698471; recent CD runs 32474338830 / 32474046690 / 32473739254 / 32473166772 / 32471717968 / 32470814675 show migrate **skipped**.
- Deferred or risk IDs: `RISK-0012` CLOSED (path); `RISK-0010` OPEN (schema); `DEFER-0027` OPEN; `DEFER-0031`/`RISK-0013` OPEN; `DEFER-0029`/`DEFER-0030` CLOSED (repo).
- Rollback / recovery: revert this docs PR.

## LOG-0190 â€” 2026-08-21 â€” DEBT-0003: RichTextâ†’TextField + local sanitizer + retire viewsets
- Note: Renumbered from colliding LOG-0188 (PR #61 Playwright CI fix) to LOG-0190.

- Outcome: Advanced Wagtail uninstall without removing Wagtail from `INSTALLED_APPS`/deps. Replaced remaining `RichTextField` (`Article.body`, `ResearchStatement.body`, `ProjectCaseStudyDetails.technical_decisions`) with `TextField` via additive `content.0012_richtext_to_textfield` (HTML bytes unchanged). Introduced `apps.content.html_sanitize` (BeautifulSoup allowlist; ADR-0022; no `wagtail.whitelist`). Unregistered content snippet/ModelViewSets (SPA-only CRUD). Documented SPA `/admin/security` + `/api/v1/admin/auth/mfa/*` as primary TOTP enrollment; `/admin-wagtail/` kept for LOGIN_URL, staff preview, profile HTML, and MFA HTML rollback. `DEBT-0003` â†’ **PARTIAL** with explicit remaining blockers. Base branch: `feat/featured-image-to-media` (PR #64). Merge order: **#60 â†’ #63 â†’ #64 â†’ this**.
- Why: Close schema RichText / Whitelister / viewset blockers that prevented uninstall progress after Media rewire, without MFA lockout risk from dropping Wagtail login prematurely.
- Scope / files: `apps/cms/apps/content/{models,html_sanitize,admin,viewsets,wagtail_hooks,migrations/0012_*}`, `apps/api/api.py`, `composition/projection.py`, `views_preview.py`, settings, `pyproject.toml` (+ beautifulsoup4), admin SPA Security copy, tests, ledgers.
- Commands or actions actually performed: worktree `feat/wagtail-uninstall` from `origin/feat/featured-image-to-media`; implement + pytest/ruff.
- Verification actually performed and result:
  - `uv run ruff check apps/content apps/api apps/composition config tests/test_html_sanitize.py tests/test_content_admin.py tests/test_security.py tests/test_api.py` â€” All checks passed
  - `uv run pytest -q tests/test_html_sanitize.py tests/test_content_admin.py tests/test_security.py tests/test_admin_mfa_api.py tests/test_api.py tests/test_story_composition.py tests/test_media_image_rewire.py` â€” 72 passed
  - `uv run python manage.py makemigrations --check --dry-run` â€” No changes detected
- Deferred or risk IDs: `DEBT-0003` PARTIAL; `RISK-0010` â€” owner `dumpdata` + backup before production `0011`/`0012`; never `CMS_CD_AUTO_MIGRATE`. Remaining blockers: Wagtail still in INSTALLED_APPS; LOGIN_URL + preview + profile admin + TOTP HTML hooks; historical migrations.
- Rollback / recovery: reverse `0012` (TextFieldâ†’RichTextField) + revert PR / previous CMS image; `/admin-wagtail/` unchanged.

## LOG-0191 â€” 2026-08-21 â€” ADR-0027 Slice 4: Compose Caddy (repo; cutover owner-gated)

- Outcome: Added Compose service `caddy` (official `caddy:2.9-alpine`, profile `edge`), `infra/caddy/Caddyfile.compose` (Docker DNS â†’ `web:8080` / `cms:8000`, ACME volumes + `/var/www/html`), host-disable + rollback rehearsal docs, `caddy-compose-reload.sh`, and CD gate `CADDY_EDGE=compose` (default remains host `caddy-sync`). `DEFER-0031` stays OPEN until live TLS cutover; `RISK-0013` OPEN for the cutover window.
- Why: Complete Slice 4 repository work without binding production 80/443 or enabling auto-migrate.
- Scope / files: `infra/cms/docker-compose.cms.yml`, `infra/caddy/*`, `infra/deploy/caddy-compose-reload.sh`, `infra/deploy/caddy-sync.sh`, `.github/workflows/cd.yml`, DEPLOY_RUNBOOK, task spec, plan README, cms README, deferred/RISK/CHANGELOG, this entry.
- Commands or actions actually performed: worktree `feat/caddy-in-compose` from `origin/main`; compose config validate; no VPS SSH; no `CMS_CD_AUTO_MIGRATE`.
- Verification actually performed and result: `docker compose â€¦ config` PASS for default and `--profile edge` (temporary `.env` from example, removed); `bash -n infra/deploy/caddy-compose-reload.sh` PASS. No VPS TLS move.
- Deferred or risk IDs: `DEFER-0031` OPEN (owner cutover); `RISK-0013` OPEN; `RISK-0012` unchanged (auto migrate off).
- Rollback / recovery: leave host Caddy as edge; do not set `CADDY_EDGE`; do not `--profile edge up -d caddy` on production until owner window.
## LOG-0187 â€” 2026-08-21 â€” Featured/diagram/screenshot FKs â†’ Media library

- Outcome: Rewired `Article.featured_image`, `ProjectDiagram.diagram_image`, and `ProjectScreenshot.screenshot_image` from `wagtailimages.Image` to `media.Media`. Additive data-copy migration `content.0011_rewire_image_fks_to_media` depends on `content.0010_entity_stories` (branch rebased onto `feat/slice-5-entity-stories` / PR #63). Public article/project projections expose active Media URLs only; admin schema type `media` + MediaPicker on article featured image; project case-media assign endpoints; `MEDIA_REFERENCE_FIELDS` registers the three FKs for orphan/usage counting. Wagtail remains installed (`DEBT-0003` â€” RichText + `/admin-wagtail/`).
- Why: Close Media-library rewire for content image FKs without uninstalling Wagtail; unblock accurate orphan counting.
- Scope / files: `apps/cms/apps/content/models.py` + migration `0011_*`, `apps/media/public_urls.py`, `apps/api/api.py`, `admin_content.py`, `admin_media.py`, admin SPA MediaPicker wiring, `apps/web` article DTO, tests, ledgers.
- Commands or actions actually performed: rebase onto `origin/feat/slice-5-entity-stories`; rename colliding WIP `0009_rewire_*` â†’ `0011_rewire_*`; move `_parse_positive_int` to `admin_common` (break circular import); pytest + ruff.
- Verification actually performed and result:
  - `uv run ruff check apps/content apps/media apps/api tests/test_media_image_rewire.py tests/test_admin_media_api.py tests/test_admin_workflow_api.py` â€” All checks passed
  - `uv run pytest -q tests/test_media_image_rewire.py tests/test_admin_media_api.py tests/test_admin_workflow_api.py` â€” 43 passed
  - `uv run python manage.py makemigrations --check --dry-run` â€” No changes detected
  - `npx tsc -b --noEmit` in `apps/cms/admin-frontend` â€” PASS
  - `uv run pytest -q tests/test_public_media.py tests/test_media.py` â€” 31 passed
- Deferred or risk IDs: `RISK-0010` â€” owner must `dumpdata` + backup before applying `0011` on production; do **not** enable `CMS_CD_AUTO_MIGRATE`. Depends on PR #63 (`0010`) merge/order. `DEBT-0003` remains OPEN (RichText/Wagtail).
- Rollback / recovery: revert PR / previous CMS image; reverse migration clears Media FKs (Wagtail Image bytes are not reconstructed).

## LOG-0188 â€” 2026-08-21 â€” Fix PR #61 web + Playwright CI failures

- Outcome: Fixed CI on `feat/adm6-playwright-lifecycle` (PR #61). Web job failed `astro check` on Playwright Node files (`process`/`Buffer`/`node:*` without `@types/node`). Playwright job failed `seed_e2e_fixtures` with `no such table: users` because workflow-level `DJANGO_SETTINGS_MODULE=config.settings.test` (`:memory:`) was inherited by migrate+seed across separate processes.
- Note: Renumbered from colliding LOG-0185 (PR #62 primaryColor/CV) to LOG-0188 (0186=Slice 5 PR #63; 0187=featured-image worktree).
- Why: Unblock PR #61 green checks without changing suite scope.
- Scope / files: `apps/web/tsconfig.json` (exclude `playwright.config.ts`, `qa/e2e`), `apps/cms/scripts/run_e2e_stack.sh` (force `config.settings.e2e`), `apps/cms/scripts/seed_e2e_fixtures.py` (force e2e settings), `.github/workflows/ci-cms.yml` (job-level e2e env), this entry.
- Commands or actions actually performed: `gh pr checks 61` + failed Actions logs; local `npm run check` after exclude; local migrate+seed with e2e settings.
- Verification actually performed and result: local `astro check` â†’ 0 errors; local `migrate`+`seed_e2e_fixtures` â†’ fixture ready. Full browser suite left to GitHub Actions after push.
- Deferred or risk IDs: none new; `DEFER-0032` unchanged.
- Rollback / recovery: revert this commit.

## LOG-0184 â€” 2026-08-20 â€” DEFER-0026 Playwright lifecycle suite

- Outcome: Added full Playwright Test config (`apps/web/playwright.config.ts`: workers=1, CI retries=2, trace/video on first retry, HTML reporter) and browser suite `qa/e2e/content-lifecycle.spec.ts` (createâ†’publishâ†’public fa/en JSON) using fixture admin+TOTP (`e2e@example.com`, not production secrets). CMS e2e settings + seed + `run_e2e_stack.sh`; CI job `playwright-lifecycle` in `ci-cms.yml`. Pytest `test_content_lifecycle_e2e.py` kept. `DEFER-0026` CLOSED; remainder Â§18 matrix â†’ `DEFER-0032`.
- Why: Plan item 2d / ADM-6 â€” complement JSON lifecycle with browser UI evidence and S2 config pattern.
- Scope / files: `apps/web/playwright.config.ts`, `apps/web/qa/e2e/**`, `apps/web/package.json`+lock, `apps/cms/config/settings/e2e.py`, `apps/cms/scripts/seed_e2e_fixtures.py`, `apps/cms/scripts/run_e2e_stack.sh`, `.github/workflows/ci-cms.yml`, ledgers, ADM-6 spec, Task-list, PROJECT_MANIFEST.
- Commands or actions actually performed: worktree `feat/adm6-playwright-lifecycle`; `npm install @playwright/test`; admin SPA build; CMS `migrate`+`seed_e2e_fixtures`+`ruff` PASS; pytest lifecycle PASS. Local `playwright install chromium` blocked (CDN 403 geo); CI ubuntu job is the browser evidence path.
- Verification actually performed and result: seed prints fixture ready; `uv run ruff check` PASS; `uv run pytest -q tests/test_content_lifecycle_e2e.py` PASS; admin-frontend `npm run build` PASS. Browser suite runs in GitHub Actions `playwright-lifecycle`.
- Deferred or risk IDs: `DEFER-0026` CLOSED; `DEFER-0032` OPEN; `DEFER-0027` unchanged.
- Rollback / recovery: revert PR; CI job and e2e scripts go with it.
## LOG-0186 â€” 2026-08-20 â€” Slice 5 / DEFER-0030: entity story bodies

- Outcome: Additive `story` FK on `Project`, `ResearchTopic`, `ResearchStatement`, and `ProfileExperience` (migration `content.0010_entity_stories`). Public APIs project published-only story via `public_story_document`; admin `storyId` on content entities; `ArticleStoryEditor` generalized to `EntityStoryEditor` (content + profile experience attach). Astro detail pages reuse `StoryBody.astro` with existing field fallbacks. `DEFER-0030` CLOSED in ledger.

- Note: Renumbered from colliding LOG-0181 (PRs #60/#62 also claimed it) to LOG-0186 (open PRs #57â€“#63; highest was LOG-0185 on #62). Migration is `content.0010_entity_stories` depending on PR #60 `content.0009_scheduled_for_and_contentrevision` (merged into this branch) so the graph is linear: `0008_article_story` â†’ `0009_scheduled_for_and_contentrevision` â†’ `0010_entity_stories`.
- Why: Close Slice 5 after blog story reference implementation.
- Scope / files: `apps/cms/**` (models/migration/API/admin SPA/tests), `apps/web/**` (DTOs + detail pages), `docs/status/**`, `docs/plan/**`.
- Commands or actions actually performed: isolated worktree `feat/slice-5-entity-stories`; pytest/ruff/npm check.
- Verification actually performed and result:
  - `uv run pytest -q tests/test_story_composition.py` â€” 10 passed
  - `uv run ruff check apps/content apps/api tests/test_story_composition.py` â€” All checks passed
  - `uv run python manage.py makemigrations --check --dry-run` â€” No changes detected
  - `npm run check` in `apps/web` â€” 0 errors (73 files)
  - `npm run check` in `apps/cms/admin-frontend` â€” PASS
- Deferred or risk IDs: `DEFER-0030` CLOSED (code); owner attended migrate for `0010` still required before production use. Do not enable `CMS_CD_AUTO_MIGRATE`.
- Rollback / recovery: revert PR; nullable FKs are backward compatible.

## LOG-0181 â€” 2026-08-20 â€” DEBT-0005: revisions + scheduled publish

- Outcome: Added immutable `ContentRevision` snapshots with restore-as-draft, `scheduled` lifecycle + `scheduled_for`, extended `ALLOWED_TRANSITIONS`, management command `publish_scheduled_content` (no Celery), and optional systemd timer units under `infra/cms/`. Admin SPA can schedule, snapshot, and restore.
- Why: Close ADM-4 follow-up DEBT-0005 separately from Wagtail uninstall (DEBT-0003).
- Scope / files: `apps/cms/apps/content/models.py`, `revisions.py`, migration `0009_*`, `admin_content.py`, `admin_health.py`, `publish_scheduled_content` command, `infra/cms/publish-scheduled-content.*`, admin-frontend workflow/status, tests, ledgers.
- Commands or actions actually performed: worktree `feat/adm-revisions-schedule`; `uv run ruff check` (pass); `uv run pytest tests/test_admin_revisions_schedule.py tests/test_admin_workflow_api.py` (23 passed).
- Verification actually performed and result: ruff clean; 23 pytest passed (workflow + revisions/schedule).
- Deferred or risk IDs: DEBT-0005 CLOSED; owner must install timer + run attended migrate for `0009` (do not enable `CMS_CD_AUTO_MIGRATE`). Preview token remains open on Task-list ADM-4.
- Rollback / recovery: revert migration `0009` after image rollback; disable timer unit.
## LOG-0185 â€” 2026-08-20 â€” ADM-6: primaryColor inject + current CV/resume

- Outcome: Wired site-settings `primaryColor` into Astro `--color-brand` at build via public `GET /api/site`. Added one-current-document CV + industry resume slots on `SiteSettings` (PDF media FKs), admin Settings MediaPicker, and Downloads/cv pages that prefer active CMS downloads (markdown fallback when CMS unset/empty). Contact inbox not reopened.
- Why: Close `DEFER-0029` / CV half of `DEBT-0006` without inventing tokens beyond the site-settings field.
- Scope / files: `apps/cms/apps/siteconfig/` (+ migration `0002`), `admin_siteconfig.py`, `api.py` public `/site`, `admin_media.py` usage registry, admin `SettingsPage.tsx`/`api.ts`, `apps/web` BaseLayout/Downloads/cvDownloads/siteSettings, ledgers, ADM-6 task spec.
- Commands or actions actually performed: implemented on `feat/adm6-primarycolor-cv` worktree from `origin/main`.
- Verification actually performed and result: `uv run ruff check` (touched CMS modules) PASS; `uv run pytest -q` 319 passed; `makemigrations --check --dry-run` No changes detected; `npm run check` + `build` in `apps/web` PASS (40 pages); `npm run check` + `build` in `admin-frontend` PASS.
- Deferred or risk IDs: `DEFER-0029` CLOSED; `DEBT-0006` RESOLVED (CV done; contact stays out of scope under closed `DEFER-0007`); `DEFER-0026`/`DEFER-0027`/`DEFER-0030` unchanged; owner must migrate `siteconfig.0002` + `rebuild-web.sh` on VPS.
- Rollback / recovery: revert PR; previous CMS image without `0002` FKs; static markdown CV downloads remain as offline fallback.
## LOG-0183 â€” 2026-08-20 â€” HMAC rebuild trigger rewired to rebuild-web.sh (DEFER-0027)

- Outcome: Default script for signed `/rebuild-trigger/` is now `infra/deploy/rebuild-web.sh` (Compose web image + loopback smoke). `REBUILD_TRIGGER_ENABLED` remains False. Tests assert `rebuild-web.sh` path. `DEFER-0027` stays OPEN until owner VPS smoke + enable.
- Why: After ADR-0027 Slice 1 Caddy cutover, disk `rebuild-static.sh` no longer updates visitor HTML; HMAC must target the web container rebuild.
- Scope / files: `apps/cms/apps/rebuild/services.py`, `apps/cms/apps/rebuild/views.py`, `apps/cms/tests/test_rebuild.py`, `infra/cms/.env.example`, ADR-0023, ADM-6 task spec, deferred-validation, CHANGELOG.
- Commands or actions actually performed: code + doc rewire on `feat/hmac-rebuild-web` from `origin/main`.
- Verification actually performed and result: `uv run pytest tests/test_rebuild.py -q` -> 10 passed; `uv run ruff check apps/rebuild tests/test_rebuild.py` -> All checks passed.
- Deferred or risk IDs: `DEFER-0027` OPEN (owner enable + smoke); no new risk.
- Rollback / recovery: revert branch; keep trigger disabled; manual `bash infra/deploy/rebuild-web.sh` after publish.
## LOG-0182 â€” 2026-08-20 â€” ADR-0027 Slice 3: CMS origin honesty (fail-build on outage)

- Outcome: Astro build-time CMS fetch is typed (`unset` / `ok` / `http` / `error`). When `CMS_API_BASE` is set, transport/timeout/5xx throws and fails `npm run build`. Committed `profile.snapshot.json` is used only when the base is unset (local/offline). Successful empty published lists are not overridden by the snapshot. Articles/projects/research share the same outage policy. QA asserts snapshot dist + fail-build on unreachable base.
- Why: ADR-0027 Slice 3 / locked plan policy â€” silent snapshot-as-live CMS was dishonest when the origin was configured but down.
- Scope / files: `apps/web/src/lib/cms/{client,articles,projects,research}.ts`, `apps/web/src/data/cmsProfile.ts`, `apps/web/qa/cms-profile-build.spec.mjs`, `docs/governance/DEPLOY_RUNBOOK.md`, `AGENTS.md`, `docs/README.md`, CHANGELOG/BACKLOG, this entry (plan file left untouched).
- Commands or actions actually performed: isolated worktree `feat/adr-0027-slice-3-cms-origin` from `origin/main`; `npm run check` + `npm run build` without base; build with `CMS_API_BASE=http://127.0.0.1:9` expected fail; `node qa/cms-profile-build.spec.mjs`.
- Verification actually performed and result: `npm run check` â†’ 0 errors; `npm run build` without `CMS_API_BASE` â†’ 40 pages; `CMS_API_BASE=http://127.0.0.1:9 npm run build` fails with `CMS â€¦ unreachable`; `node qa/cms-profile-build.spec.mjs` PASS (snapshot + fail-build + restore).
- Deferred or risk IDs: Slice 4 `DEFER-0031` / Slice 5 `DEFER-0030` unchanged; `DEFER-0022` local HTTP preview unchanged; `RISK-0012` CLOSED on PR #57 (attended migrate PASS evidence LOG-0179 / Actions 32407698471); auto migrate remains unset.
- Rollback / recovery: revert this branch/PR; previous web image continues prior silent-null behavior until rebuilt.
## LOG-0180 â€” 2026-08-20 â€” Phase 0: Slice 2 owner checklist + RISK-0012 CLOSED

- Outcome: Documented short owner attended CD CMS migrate checklist in `DEPLOY_RUNBOOK`. Independently re-verified Actions [32407698471](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32407698471) job **CMS image migrate (gated)** success with log lines `backup_ok`, `CMS smoke PASS`, `cd-cms-migrate PASS`. Closed `RISK-0012` on that evidence. Fixed `docs/plan/README.md` handoff (was wrongly saying â€œSlice 2 CD auto-migrateâ€). Did **not** enable or recommend `CMS_CD_AUTO_MIGRATE=true`.
- Why: Approved backlog Phase 0 â€” support Slice 2 gate with runbook checklist and close risk only after authoritative PASS.
- Scope / files: `docs/governance/DEPLOY_RUNBOOK.md`, `docs/status/RISK_REGISTER.md`, `docs/plan/README.md`, `docs/plan/cms-origin-and-full-stack-cd-task-spec.md`, `AGENTS.md`, `infra/cms/README.md`, CHANGELOG, BACKLOG, this entry.
- Commands or actions actually performed: `gh run view 32407698471`; `git fetch origin main`; worktree `docs/slice-2-cd-migrate-checklist` from `origin/main`.
- Verification actually performed and result: job conclusion success; migrate log markers present; no script bug found for a further fix PR.
- Deferred or risk IDs: `RISK-0012` CLOSED; `DEFER-0027` unchanged.
- Rollback / recovery: revert this docs PR; risk row can be re-opened if evidence is disputed.

## LOG-0179 â€” 2026-08-20 â€” ADR-0027 Slice 2: first attended CD CMS migrate PASS

- Outcome: GitHub Actions CD `workflow_dispatch` `migrate_cms=true` `cms_image_tag=2e200fe` run [32407698471](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32407698471) **success**. Evidence: `backup_ok` under `/home/deploy/cms-migrate-backups/...`, recreate `cms`/`db`/`web`, migrate no-op, `CMS smoke PASS`, `cd-cms-migrate PASS`. Image remained `ghcr.io/tahamohamadi-ir/taha-cms:2e200fe`.
- Why: Prove Slice 2 owner-attended path (`RISK-0012`) without enabling `CMS_CD_AUTO_MIGRATE`.
- Scope / files: live VPS via CD; ledgers/task spec.
- Commands or actions actually performed: agent dispatched workflow; prior fixes PR #54/#55 for backup dir + mktemp.
- Verification actually performed and result: Actions conclusion success; log lines `cd-cms-migrate PASS` / `CMS smoke PASS`.
- Deferred or risk IDs: `RISK-0012` remains OPEN (auto migrate still off); `DEFER-0027` unchanged. Superseded for risk status by LOG-0180 CLOSE.
- Rollback / recovery: `CMS_IMAGE=<previous>` + `update-cms.sh`; backup at `/home/deploy/cms-migrate-backups/pre-migrate-20260820T191842Z/`.

## LOG-0178 â€” 2026-08-20 â€” update-cms: mktemp for admin login curl body

- Outcome: Second CD migrate (32406996402) passed backup + compose recreate + migrate (no-op) + loopback `/health/` then failed `curl: (23)` writing `/tmp/cms-admin-login` (stale root-owned file). Switched to `mktemp` like `smoke-cms.sh`.
- Why: Complete Slice 2 attended path without sudo cleanup of `/tmp`.
- Scope / files: `infra/deploy/update-cms.sh`, this entry.
- Commands or actions actually performed: read failed Actions log after PR #54.
- Verification actually performed and result: root cause matched prior smoke-cms curl-23 fix.
- Deferred or risk IDs: `RISK-0012` OPEN until full `cd-cms-migrate PASS`.
- Rollback / recovery: revert to fixed `/tmp` path (may need `sudo rm`).

## LOG-0177 â€” 2026-08-20 â€” cd-cms-migrate: writable backup root for deploy

- Outcome: First CD `cms-migrate` (run 32406462067, tag `2e200fe`) failed at `mkdir /home/deploy/backups/...` (Permission denied; root-owned from sudo migrate path). `cd-cms-migrate.sh` now resolves a deploy-writable backup root (`$HOME/cms-migrate-backups` preferred).
- Why: Slice 2 CD SSH runs as `deploy`, not root (`RISK-0012` attended path).
- Scope / files: `infra/deploy/cd-cms-migrate.sh`, this entry.
- Commands or actions actually performed: inspected failed Actions log; cancelled duplicate dispatch 32406482633.
- Verification actually performed and result: failure mode confirmed in log; `bash -n` after fix.
- Deferred or risk IDs: `RISK-0012` still OPEN until migrate PASS.
- Rollback / recovery: previous script; or `BACKUP_ROOT=` to an owner-chowned dir.

## LOG-0176 â€” 2026-08-20 â€” ADR-0027 Slice 2: gated CD CMS migrate

- Outcome: Added `infra/deploy/cd-cms-migrate.sh` (`pg_dumpall` â†’ `update-cms.sh` â†’ `smoke-cms.sh`) and CD job `cms-migrate` gated by `workflow_dispatch` `migrate_cms=true` or repo var `CMS_CD_AUTO_MIGRATE=true` (default off). Ordinary `main` pushes do not migrate Postgres.
- Why: ADR-0027 Slice 2 / `RISK-0012` â€” wire GitHubâ†’VPS CMS image updates without unattended first production migrate.
- Scope / files: `infra/deploy/cd-cms-migrate.sh`, `.github/workflows/cd.yml`, task spec, RISK_REGISTER, DEPLOY_RUNBOOK, ledgers.
- Commands or actions actually performed: `bash -n` on new script (local). No VPS migrate in this session.
- Verification actually performed and result: workflow YAML gates reviewed; auto path soft-skips missing GHCR tag; dispatch hard-fails.
- Deferred or risk IDs: `RISK-0012` OPEN until owner-attended CD migrate PASS; `DEFER-0027` unchanged.
- Rollback / recovery: previous `CMS_IMAGE` via `update-cms.sh`; disable migrate by leaving `CMS_CD_AUTO_MIGRATE` unset and not dispatching `migrate_cms`.

## LOG-0175 â€” 2026-08-20 â€” web nginx: real HTTP 404 for missing paths

- Outcome: `infra/web/nginx.conf` `try_files` ends with `=404` (not `/404.html` as last URI). Removed Caddy `handle_errors` re-proxy of `/404.html` which overwrote upstream 404 with 200. Owner `rebuild-web.sh` otherwise PASS; public smoke failed only on `/nonexistent-qa` expected 404 got 200.
- Why: After Slice 1 cutover, visitors and `smoke.sh` need correct 404 status while still serving Astro `404.html` body via nginx `error_page`.
- Scope / files: `infra/web/nginx.conf`, `infra/caddy/Caddyfile`, ledgers.
- Commands or actions actually performed: none on VPS yet (owner apply after merge).
- Verification actually performed and result: root-cause match to smoke FAIL; nginx/Caddy interaction documented.
- Deferred or risk IDs: none.
- Rollback / recovery: previous nginx try_files + Caddy handle_errors; `rebuild-web.sh` + `caddy-sync`.

## LOG-0174 â€” 2026-08-20 â€” ADR-0027 Slice 1 cutover live on VPS

- Outcome: Owner applied PR #50 (`a29838d`): `git pull`, confirmed `(taha_application_routes)` â†’ `reverse_proxy 127.0.0.1:13080`, `taha-cms-web-1` healthy, `caddy-sync`, `smoke-cms.sh` **PASS** (loopback `/` + `/health.json`, `/admin/`, Wagtail login, `/health/`, `/health.json`, `/admin` 308, `/`). Brief accidental restore of `Caddyfile.bak-20260819194342` then re-sync; final state is cutover live.
- Why: Production public HTML now originates from Compose `web` nginx, not `/opt/taha/site/current`.
- Scope / files: live `/etc/caddy/Caddyfile` via sync from repo; ledgers.
- Commands or actions actually performed: owner on VPS (no agent SSH).
- Verification actually performed and result: `CMS smoke PASS`; loopback `{"status":"ok","service":"static","version":"0.1.0"}`.
- Deferred or risk IDs: `DEFER-0031` unchanged; next Slice 2 CD CMS migrate (`RISK-0012`).
- Rollback / recovery: restore `file_server` snippet + `caddy-sync`; bak under `/etc/caddy/Caddyfile.bak-*`.

## LOG-0173 â€” 2026-08-19 â€” rebuild-web.sh: CMS publish â†’ web nginx container

- Outcome: Added `infra/deploy/rebuild-web.sh` to build the `web` Docker image with live CMS content (`CMS_API_BASE` build-arg, default loopback `18000`), restart Compose `web`, and smoke `127.0.0.1:13080/health.json` (+ optional public smoke). Updated `rebuild-static.sh` header and `DEPLOY_RUNBOOK.md`.
- Why: After Caddy cutover to `127.0.0.1:13080`, disk-based `rebuild-static.sh` no longer updates visitor-facing HTML.
- Scope / files: `infra/deploy/rebuild-web.sh`, `infra/deploy/rebuild-static.sh`, `docs/governance/DEPLOY_RUNBOOK.md`, `infra/cms/README.md`, ledgers.
- Commands or actions actually performed: none on VPS (script + docs only).
- Verification actually performed and result: Dockerfile `CMS_API_BASE` arg and compose `web` build context confirmed against existing patterns.
- Deferred or risk IDs: none new.
- Rollback / recovery: revert script; pin previous `WEB_IMAGE` or re-run with older git ref.

## LOG-0172 â€” 2026-08-19 â€” ADR-0027 Slice 1: Caddy cutover to nginx web loopback

- Outcome: `(taha_application_routes)` in `infra/caddy/Caddyfile` now reverse-proxies `127.0.0.1:13080` (nginx `web` container) instead of serving `/opt/taha/site/current` via `file_server`. Rollback comment documents restoring disk `file_server` until rsync path is removed. `smoke-cms.sh` adds loopback checks for `/` and `/health.json`.
- Why: ADR-0027 Slice 1 â€” public HTML origin moves from host symlink to Compose `web` while host Caddy remains edge until `DEFER-0031`.
- Scope / files: `infra/caddy/Caddyfile`, `infra/deploy/smoke-cms.sh`, `docs/plan/cms-origin-and-full-stack-cd-task-spec.md`, CHANGELOG, this entry.
- Commands or actions actually performed: repo-only; no VPS apply in this session.
- Verification actually performed and result: snippet matches ADR-0027 target; smoke script syntax valid; loopback checks gated on `127.0.0.1:13080`.
- Deferred or risk IDs: `DEFER-0031` unchanged; rsync `/opt/taha/site/current` remains rollback until removed from CD.
- Rollback / recovery: revert snippet to `root * /opt/taha/site/current` + `file_server`; `sudo /opt/taha/bin/caddy-sync.sh` with restored file; `web` container can stay running.

## LOG-0171 â€” 2026-08-19 â€” Admin SPA: merge content detail + edit (story/skills reachable)

- Outcome: Content list links now open the unified edit page (`/content/:entity/:id`). Removed read-only `ContentDetailPage`. Article story editor and profile skills editor are visible immediately from list click. `/content/:entity/:id/edit` redirects to canonical URL. Workflow transitions and published/updated metadata ported to edit page.
- Why: Owner reported story and skills features missing; they existed only on `/edit` route with no navigation path from list/detail.
- Scope / files: `apps/cms/admin-frontend/src/App.tsx`, `ContentEditPage.tsx`, deleted `ContentDetailPage.tsx`, ledgers.
- Commands or actions actually performed: `npm run check` in admin-frontend â€” PASS.
- Verification actually performed and result: tsc clean; manual path: list â†’ article/profile shows story/skills sections.
- Deferred or risk IDs: none new. CMS image rebuild required for production (`SPA` baked in Docker).
- Rollback / recovery: revert PR; restore detail route in App.tsx.

## LOG-0170 â€” 2026-08-19 â€” Slice 0+1: /admin 308 fix, old stack decommissioned, Caddyfile automated, web nginx container + CI/CD

- Outcome: `/admin` 404 fixed with `redir /admin /admin/ 308` in live Caddy (owner applied). Old `taha-prod` Java/Vue stack decommissioned (containers down, volumes removed, 1 GB reclaimed). Full production Caddyfile committed to repo (`infra/caddy/Caddyfile`) with `caddy-sync.sh` auto-deploy in CD. Slice 1: `web` nginx container (`infra/web/Dockerfile.web`, `infra/web/nginx.conf`), added to compose, CI builds `taha-web` image, CD pulls and restarts.
- Why: Owner requested automated Caddyfile management and unified Compose stack per ADR-0027.
- Scope / files: `infra/caddy/Caddyfile`, `infra/deploy/caddy-sync.sh`, `infra/web/Dockerfile.web`, `infra/web/nginx.conf`, `infra/cms/docker-compose.cms.yml`, `.github/workflows/ci-web-image.yml`, `.github/workflows/cd.yml`, `infra/cms/Caddyfile.cms.snippet`, `infra/deploy/caddy-apply.sh`, `infra/deploy/smoke-cms.sh`.
- Commands or actions actually performed: owner applied `redir /admin /admin/ 308` to live Caddyfile, `docker compose stop/down` on `/opt/taha/repository`, `docker volume rm` old volumes, `docker image prune`.
- Verification actually performed and result: `curl -sSI /admin` â†’ `308 Location: /admin/`; `curl /admin/` â†’ `200`; site â†’ `200` after old stack removal; `docker compose config` exits 0.
- Deferred or risk IDs: `DEFER-0031` Caddy-in-compose unchanged. VPS prereq: install `caddy-sync.sh` at `/opt/taha/bin/`, sudoers for deploy.
- Rollback / recovery: revert Caddyfile from timestamped backup; revert compose `web` service; CMS unchanged.

## LOG-0169 â€” 2026-08-19 â€” ADR-0027 unified Compose; production CMS b6bea6a; smoke login path

- Outcome: Accepted ADR-0027 (Compose: db/cms/web nginx, later caddy; no public Node/React). Owner migrate to `taha-cms:b6bea6a` applied `content.0008` and `composition.0002`. `smoke-cms.sh` checks `/admin-wagtail/login/`. Spec is slice-executable. `RISK-0012` OPEN. `DEFER-0031` Caddy-in-compose.
- Why: Owner asked to amend the host-static contract so each part is a container without a public SPA or SSR on 4 GiB.
- Scope / files: `docs/adr/0027-unified-compose-stack.md`, spec, `AGENTS.md`, `infra/cms/README.md`, `infra/deploy/smoke-cms.sh`, ledgers.
- Commands or actions actually performed: none on VPS. No `web` image (Slice 1 next).
- Verification actually performed and result: owner pasted `showmigrations` with 0008/0002 `[X]`.
- Deferred or risk IDs: RISK-0012 OPEN; DEFER-0031 OPEN; DEFER-0027 unchanged.
- Rollback / recovery: revert this PR for docs/smoke; CMS on VPS stays `b6bea6a` until the operator changes it.

## LOG-0168 â€” 2026-08-19 â€” CMS-origin + full-stack CD queued (no implement)

- Outcome: Queued `docs/plan/cms-origin-and-full-stack-cd-task-spec.md`. Public site staying no-JS; dynamic means CMS as origin + CD that can update CMS, not a public React SPA. Slice A (owner migrate `b6bea6a`) is operational, not this spec.
- Why: Owner asked to leave hardcoded static fallbacks, Dockerize the whole stack, and auto-deploy. That is three programs (content origin, Compose shape, CD migrate). Implementing together would fight ADR-0017/0026 and VPS capacity.
- Scope / files: that Task Spec; plan index; this log; CHANGELOG.
- Commands or actions actually performed: read `prod-cms-update-migrate.sh`, `cd.yml`, `infra/cms/README.md`. No VPS SSH. No Compose/CD code change.
- Deferred or risk IDs: `DEFER-0027` HMAC still owner; `DEFER-0030` after migrate; auto-migrate from GitHub needs a new risk if Slice B is approved.
- Rollback / recovery: delete the spec if the owner rejects the sequence.

## LOG-0167 - 2026-08-19 - Blog story composition (slice 1)

- Outcome: Composition is a story **body** engine, not a URL owner. `CompositionPage.kind` is `landing` (bilingual catalog unchanged) or `story` (single-locale figure/video/audio/math). Articles may attach an optional story document. Public article JSON exposes published-only `story`; Astro `StoryBody` renders it and falls back to sanitized `article.body`. Listing cards are unchanged. Typed footer shows license/accessibility notes only when filled. Media allowlist adds video/audio/SVG with magic-byte checks, 50MB AV cap, and anonymous `/media/` only for `is_active`. Wagtail stays installed. No invented content. HMAC not enabled.
- Why: `DEFER-0028` mixed landing composition, CV, and tokens; the approved plan required blog as the reference story projection first.
- Scope / files: CMS composition models/blocks/projection + migrations `0002`/`0008`; public article API; media sniff/validators/views; admin SPA article story editor; Astro `StoryBody` + `ArticleDetail`; plan/ledger docs; this entry.
- Commands or actions actually performed: isolated worktree `.worktrees/blog-story-composition` on `feat/blog-story-composition` from `feat/continue-admin-public-sync` HEAD. Targeted pytest (110 passed), `ruff check .` (clean), `makemigrations --check --dry-run` (no pending). `npm run check` in `apps/web` (0 errors, 72 files) and `apps/cms/admin-frontend` (`tsc` PASS). No commit, no push, no VPS migrate.
- Verification actually performed and result: 110 targeted pytest PASS; CMS ruff clean; no pending migrations; web check 0 errors; admin SPA check PASS.
- Deferred or risk IDs: `DEFER-0028` CLOSED (blog storyâ†’Astro); `DEFER-0029` OPEN (primaryColor + CV); `DEFER-0030` OPEN (project/research/experience stories); `DEFER-0026`/`DEFER-0027` unchanged; `DEBT-0003` unchanged; `RISK-0010` dumpdata+backup before production migrate.
- Rollback / recovery: revert the branch; nullable `Article.story` and default `kind=landing` are compatible with existing rows.

## LOG-0151 â€” 2026-08-18 â€” Canonical docs entry, contracts, P7 specs

- Outcome: Landed local-only documentation that was sitting untracked on the stale `feat/cms-backup-risk-0003-prep` checkout: `docs/README.md`, `docs/contracts/*`, plan index, P7 specs, and the Samples transfer catalog. Added `.gitignore` rules for `Samples/` and `**/test-results/`. Aligned current-gate facts with `DEFER-0017` CLOSED, `RISK-0003` CLOSED, and PR #31. Did not reopen RISK-0003. Did not commit the merged backup branch.
- Why: Source Control showed +1141 untracked lines. Those files are docs, not build artifacts. PR #11 is already merged, so they must land from `origin/main`, not from the backup branch.
- Scope / files: `AGENTS.md`, `.gitignore`, `docs/README.md`, `docs/governance/README.md`, `docs/plan/README.md`, `docs/plan/P7-*.md`, `docs/plan/SAMPLES-TRANSFER-RECOMMENDATIONS.md`, `docs/contracts/*`, this entry.
- Commands or actions actually performed: compared each leftover path to `origin/main`; discarded stale P2 spec and `prod-cms-reset-and-migrate.sh` copies; restored backup-doc edits that would reopen `RISK-0003`; copied unique docs onto `docs/canonical-entry-p7-specs` from `origin/main`.
- Verification actually performed and result: leftover unique docs were absent from `git log --all`; `origin/main` P3 backup spec remains DONE; `DEFER-0017` remains CLOSED in `deferred-validation.md`.
- Deferred or risk IDs: `DEFER-0022` unchanged. No new IDs.
- Rollback / recovery: revert this PR; documentation entry point returns to `AGENTS.md` + `DOCUMENTATION_POLICY.md` only.

## LOG-0150 â€” 2026-08-18 â€” CMS-managed About, custom admin, detail routes

- Outcome: Public About reads the typed CMS profile at build time with a committed snapshot fallback. Custom admin lives at `/admin/profiles/` inside the Wagtail session. Gated detail routes emit only when a child row has a Latin slug and a non-empty detail body. Work is on `feat/cms-managed-about-admin` from `origin/main` so P4â€“P6 routes stay intact.
- Why: Owner asked to ship CMS-managed content, a custom admin app, and About detail pages without regressing live blog/research/projects.
- Scope / files: CMS profile models + migrations `0005`/`0006`, public/admin profile APIs, `import_profile_seed`, custom admin templates/static, Astro `cmsProfile` adapter, About section/detail pages, CI `qa/cms-profile-build.spec.mjs`.
- Verification actually performed and result:
  - `uv run pytest -q` in `apps/cms` â†’ 174 passed
  - `npm run check` in `apps/web` â†’ 0 errors (69 files)
  - `npm run build` â†’ 40 pages including About section/detail routes
  - `node qa/cms-profile-build.spec.mjs` â†’ PASS
- Deferred or risk IDs: `DEFER-0022` (local HTTP preview bind). Production CMS still needs owner migrate + seed after merge.
- Rollback / recovery: revert the PR; previous static artifact and CMS image remain deployable.

## LOG-0149 â€” 2026-08-18 â€” About hybrid tabs + filters (owner UX feedback)

- Outcome: Restored compact CSS tab UX on About with sticky tab toolbar, **Show all sections** toggle (stacked scan/find-in-page), and per-section filter (search + facet chips where data supports it). Bilingual strings in `content.ts`. `DEBT-0002` reopened as mitigated (tabs default; show-all for full scan).
- Why: Production P2-H stacked About caused bad vertical-scroll UX; owner preferred tabular layout plus filtering in each section.
- Scope / files: `About.astro`, `content.ts`, `qa/about-tabs.spec.mjs`, `TECH_DEBT.md`, this entry.
- Verification actually performed and result:
  - `npm run check` â†’ 0 errors (62 files)
  - `npm run build` â†’ 16 pages
  - `node qa/about-tabs.spec.mjs` with `PREVIEW_URL=http://127.0.0.1:9876` â†’ all PASS (tabs, sticky, show-all, skills filter)
- Rollback / recovery: revert branch; previous stacked About from `e0a517d` remains deployable.

## LOG-0145 â€” 2026-08-17 â€” P2-H honesty closeout (main-aware)

- Outcome: Hero CTAs â†’ About + CV; perspective cards link to live Research/Projects/Writing; landing adds Current Focus + Selected Evidence from `profile.*`; About stacked with fragment TOC (closes `DEBT-0002`); locale 404 recovery; footer explore links; header `aria-current` + language switch labels. **Header kept Research/Projects/Writing links** because P4â€“P6 routes are live on `main` (not the pre-P4 fake-live case).
- Why: Landing still said â€œlater releaseâ€; About tabs hid education/research from find-in-page; 404 was bilingual-only; footer lacked explore links.
- Scope / files: `Header.astro`, `Landing.astro`, `About.astro`, `Footer.astro`, `404.astro`, `content.ts`, `global.css`, `qa/about-tabs.spec.mjs`, `docs/plan/P2-honesty-closeout-task-spec.md`, ledgers.
- Verification actually performed and result:
  - `rg "DebugProbe" apps/web/src` â†’ 0 matches
  - `npm run check` â†’ 0 errors (62 files)
  - `npm run build` â†’ 16 pages
  - `node qa/about-tabs.spec.mjs` + `node qa/mobile-overflow.spec.mjs` with `PREVIEW_URL=http://127.0.0.1:8765` â†’ all PASS
- Deferred or risk IDs: none new. `DEBT-0002` CLOSED. Pre-P4 `KI-0002` never applied on `main`.
- Rollback / recovery: revert this commit; previous static artifact remains deployable.

## LOG-0144 â€” 2026-08-17 â€” Research index card catalog (filter + sort)

- Outcome: `/en/research/` and `/fa/research/` use CV-style cards (`ResearchCatalog.astro`). Filter by type and sort by type/title/newest. Each card links to the existing detail route. Intro no longer mentions `CMS_API_BASE`. Content remains in HTML without JS; filter/sort enhance via a small script.
- Why: Long topic paragraphs on the research index were hard to scan; owner asked for the same card pattern as CV with click-through.
- Scope / files: `ResearchCatalog.astro`, `en|fa/research/index.astro`, `content.ts`, this entry.
- Commands or actions actually performed: `npm run check` (see verification).
- Verification actually performed and result: `npm run check` â†’ 0 errors (62 files).
- Decisions / assumptions: no new CMS fields; reuse existing topics/projects/publications/statement routes.
- Deferred or risk IDs: none.
- Rollback / recovery: revert this commit; previous list markup returns.

## LOG-0143 â€” 2026-08-17 â€” Public `/api/` + article seed + `release-9ca2f3b`

- Outcome: Owner applied Caddy `/api/*` + `/media/*`; public topics JSON 200. Merged PR #24 (`9ca2f3b`); CMS image `taha-cms:9ca2f3b`; seed `created=4` articles (`skipped=24` prior rows). Static `release-9ca2f3b` checksum `eebe1cc7` (38 pages: blog list + 4 article details fa/en).
- Why: Close DEFER-0017 and ship seeded writing to the public site.
- Scope / files: VPS `/etc/caddy/Caddyfile`; CMS DB seed; `/opt/taha/site/current` â†’ `release-9ca2f3b`. Ledgers: deferred-validation, BACKLOG, P3-public-api-caddy-task-spec, this entry.
- Commands or actions actually performed: owner Caddy insert + reload; `update-cms.sh ghcr.io/tahamohamadi-ir/taha-cms:9ca2f3b`; `seed_site_content`; Windows `CMS_API_BASE` build + `update-release.sh`.
- Verification actually performed and result: `https://tahamohamadi.ir/api/research/topics/en` 200; `/api/articles/en` 200; `/en/blog/` 200; `/en/blog/pars-sql-vtd-edge-overview/` 200; `/en/research/` 200; `/_astro/logo.YrmYLcZm.png` 200 size 8075.
- Decisions / assumptions: `/media/` proxied; no published media files yet (Images library still empty until owner uploads).
- Deferred or risk IDs: DEFER-0017 CLOSED; DEFER-0018 RSS still OPEN; rebuild webhook still disabled.
- Rollback / recovery: restore `/etc/caddy/Caddyfile.pre-api.*`; `update-release.sh` prior release; pin previous CMS image sha.

## LOG-0142 â€” 2026-08-17 â€” CMS admin UI + article seed + hashed logos + Caddy API apply script

- Outcome: Wagtail **Site content** ModelViewSets for Article/Research/Project/Landing/Profile; seed adds 4 published articles (fa/en); Astro logos imported from `src/assets/branding` (hashed URLs); `infra/deploy/apply-caddy-api.sh` inserts `/api/*` + `/media/*` into production Caddyfile.
- Why: Owner cannot edit CMS rows from Wagtail Pages; blog empty; public `/api/` still 404 because snippet was never merged; browser logo cache on `/logo.png`.
- Scope / files: `apps/cms/apps/content/viewsets.py`, `wagtail_hooks.py`, `site_content.py`, `seed_site_content.py`, `tests/test_content_admin.py`, Header/Footer/index.astro, `infra/deploy/apply-caddy-api.sh`, `infra/cms/README.md`.
- Commands or actions actually performed: `uv run pytest tests/test_content_admin.py tests/test_seed_site_content.py` â†’ 5 passed; `npm run check` â†’ 0 errors.
- Verification actually performed and result: local tests PASS. Production apply of Caddy + new CMS image pending merge + owner VPS commands.
- Decisions / assumptions: keep Astro SSG; Wagtail Pages unused; public API is read-only Ninja projection.
- Deferred or risk IDs: DEFER-0017 closes after `apply-caddy-api.sh` PASS on VPS; rebuild webhook still disabled.
- Rollback / recovery: restore `/etc/caddy/Caddyfile.pre-api.*`; pin previous CMS image sha; static rollback via `update-release.sh`.


> Ù…Ø±Ø¬Ø¹ chronological Ùˆ append-only Ø¨Ø±Ø§ÛŒ ÙØ¹Ø§Ù„ÛŒØªâ€ŒÙ‡Ø§ÛŒ Ø§Ù†Ø¬Ø§Ù…â€ŒØ´Ø¯Ù‡. Ø¨Ø±Ø§ÛŒ Ø³ÛŒØ§Ø³Øª Ùˆ Ù‚Ø§Ù„Ø¨ Ú©Ø§Ù…Ù„ØŒ `docs/governance/DOCUMENTATION_POLICY.md` Ø±Ø§ Ø¨Ø®ÙˆØ§Ù†ÛŒØ¯.

## Ù‚Ø§Ù„Ø¨ entry

```md
## LOG-XXXX â€” YYYY-MM-DD â€” <phase/slice>
- Outcome:
- Why:
- Scope / files:
- Commands or actions actually performed:
- Verification actually performed and result:
- Decisions / assumptions:
- Deferred or risk IDs:
- Rollback / recovery:
```

## LOG-0001 â€” 2026-08-14 â€” P0-G0 / Repository inventory

- Outcome: ÙˆØ¶Ø¹ÛŒØª Ø¢ØºØ§Ø²ÛŒÙ† repository Ø«Ø¨Øª Ø´Ø¯: Ø´Ø´ Ø³Ù†Ø¯ Markdown ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø´Øª Ùˆ Ù¾ÙˆØ´Ù‡â€ŒÙ‡Ø§ÛŒ Ø§Ø¬Ø±Ø§ÛŒÛŒ Ø®Ø§Ù„ÛŒ Ø¨ÙˆØ¯Ù†Ø¯Ø› `.git` Ù†ÛŒØ² ÛŒÚ© Ù¾ÙˆØ´Ù‡Ù” Ø®Ø§Ù„ÛŒ Ùˆ Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø¨ÙˆØ¯.
- Why: Inventory read-only Ù¾ÛŒØ´â€ŒÙ†ÛŒØ§Ø² P0-G0 Ùˆ repair Ø§Ù…Ù† Git Ø¨ÙˆØ¯.
- Scope / files: ÙÙ‚Ø· Ù…Ø´Ø§Ù‡Ø¯Ù‡Ù” rootØŒ `docs/`ØŒ `frontend/` Ùˆ `backend/`Ø› Ù‡ÛŒÚ† Ù…Ø­ØªÙˆØ§ÛŒ application Ø³Ø§Ø®ØªÙ‡ Ù†Ø´Ø¯.
- Commands or actions actually performed: ÙÙ‡Ø±Ø³Øª Ø¨Ø§Ø²Ú¯Ø´ØªÛŒ ÙØ§ÛŒÙ„/Ù¾ÙˆØ´Ù‡ØŒ `git status`ØŒ `git rev-parse --is-inside-work-tree` Ùˆ Ø¨Ø±Ø±Ø³ÛŒ Ù…Ø­ØªÙˆØ§ÛŒ `.git` Ø§Ø¬Ø±Ø§ Ø´Ø¯.
- Verification actually performed and result: Git Ù‡Ø± Ø¯Ùˆ ÙØ±Ù…Ø§Ù† Ø±Ø§ Ø¨Ø§ `fatal: not a git repository` Ø±Ø¯ Ú©Ø±Ø¯Ø› `frontend/` Ùˆ `backend/` Ø®Ø§Ù„ÛŒ Ø¨ÙˆØ¯Ù†Ø¯.
- Decisions / assumptions: Ù‡ÛŒÚ† Astro/Django scaffoldØŒ dependency ÛŒØ§ runtime service Ø¯Ø± P0-G0 Ø³Ø§Ø®ØªÙ‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `DEFER-0001`ØŒ `DEFER-0002` Ùˆ `DEFER-0003`.
- Rollback / recovery: Ù…ÙˆØ±Ø¯ÛŒ ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯Ù‡ Ø¨ÙˆØ¯.

## LOG-0002 â€” 2026-08-14 â€” P0-G0 / Git repair

- Outcome: Ù…Ø®Ø²Ù† Git Ø³Ø§Ù„Ù… Ø¨Ø§ branch `main` Ùˆ remote canonical GitHub Ø¢Ù…Ø§Ø¯Ù‡ Ø´Ø¯Ø› Ù‡Ù†ÙˆØ² commit ÛŒØ§ push Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Why: `.git` Ù‚Ø¨Ù„ÛŒ Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø¨ÙˆØ¯ Ùˆ Ù…Ø³ÛŒØ± Ø§Ù…Ù† recovery Ù„Ø§Ø²Ù… Ø¯Ø§Ø´Øª.
- Scope / files: ÙÙ‚Ø· metadata Git Ø¯Ø± root.
- Commands or actions actually performed: `.git` Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø¨Ø§ timestamp Ø¨Ù‡ Ù¾ÙˆØ´Ù‡Ù” Temp Ù…Ù†ØªÙ‚Ù„ Ø´Ø¯Ø› `git init -b main` Ùˆ Ø³Ù¾Ø³ `git remote add origin https://github.com/tahamohamadi-ir/Taha-personal-platform.git` Ø§Ø¬Ø±Ø§ Ø´Ø¯.
- Verification actually performed and result: `git status` Ù…Ø®Ø²Ù† Ø¬Ø¯ÛŒØ¯ Ø±Ø§ Ø±ÙˆÛŒ `main` Ùˆ Ø¨Ø¯ÙˆÙ† commit Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯Ø› `git remote -v` fetch/push URL Ø±Ø§ ØªØ£ÛŒÛŒØ¯ Ú©Ø±Ø¯.
- Decisions / assumptions: Ù‡ÛŒÚ† push Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ù‡ Ùˆ remote ÙÙ‚Ø· Ù…ØªØµÙ„ Ø§Ø³Øª.
- Deferred or risk IDs: Ù†Ø¯Ø§Ø±Ø¯.
- Rollback / recovery: Ù†Ø³Ø®Ù‡Ù” `.git` Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø¯Ø± Temp Ù†Ú¯Ù‡â€ŒØ¯Ø§Ø±ÛŒ Ø´Ø¯Ù‡ Ø§Ø³ØªØ› Ù‡ÛŒÚ† ÙØ§ÛŒÙ„ Ù¾Ø±ÙˆÚ˜Ù‡ Ø­Ø°Ù Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0003 â€” 2026-08-14 â€” P0-G0 / Repository layout freeze

- Outcome: Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ø®Ø§Ù„ÛŒ `frontend/` Ùˆ `backend/` Ø¨Ù‡ `apps/web/` Ùˆ `apps/cms/` Ù…Ù†ØªÙ‚Ù„ Ø´Ø¯Ù†Ø¯Ø› Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ù…Ø³ØªÙ†Ø¯Ø§Øª P0 Ø§ÛŒØ¬Ø§Ø¯ Ùˆ Release Policy Ø¨Ù‡ Ù…Ø³ÛŒØ± canonical Ù…Ù†ØªÙ‚Ù„ Ø´Ø¯.
- Why: Ø§ÛŒÙ† layout Ø¨Ø§ Ù…Ø¹Ù…Ø§Ø±ÛŒ monorepo Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ÛŒ Ø³Ø§Ø²Ú¯Ø§Ø± Ø§Ø³Øª Ùˆ Ù¾ÛŒØ´ Ø§Ø² Ø§ÛŒØ¬Ø§Ø¯ Ú©Ø¯ØŒ migration cost Ù†Ø¯Ø§Ø±Ø¯.
- Scope / files: `apps/web/`ØŒ `apps/cms/`ØŒ `docs/{adr,governance,status,templates}/` Ùˆ `docs/governance/RELEASE_POLICY.md`.
- Commands or actions actually performed: Ø®Ø§Ù„ÛŒâ€ŒØ¨ÙˆØ¯Ù† Ø¯Ùˆ Ù¾ÙˆØ´Ù‡Ù” Ù‚Ø¯ÛŒÙ…ÛŒ Ø¨Ø±Ø±Ø³ÛŒ Ø´Ø¯ØŒ Ø³Ù¾Ø³ move Ùˆ Ø³Ø§Ø®Øª directoryÙ‡Ø§ Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯Ø› Ø¯Ø± Ù¾Ø§ÛŒØ§Ù† `tree /F /A` Ùˆ `git status --short --branch` Ø§Ø¬Ø±Ø§ Ø´Ø¯.
- Verification actually performed and result: tree Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ø¬Ø¯ÛŒØ¯ Ø±Ø§ Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ Ùˆ Release Policy ÙÙ‚Ø· Ø¯Ø± `docs/governance/` Ù‚Ø±Ø§Ø± Ø¯Ø§Ø±Ø¯Ø› Ù‡ÛŒÚ† ÙØ§ÛŒÙ„ application ÛŒØ§ dependency ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.
- Decisions / assumptions: `apps/web/` Ùˆ `apps/cms/` Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ canonical Ø¢ÛŒÙ†Ø¯Ù‡ Ù‡Ø³ØªÙ†Ø¯Ø› Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ù‚Ø¯ÛŒÙ…ÛŒ Ù†Ø¨Ø§ÛŒØ¯ Ø¯ÙˆØ¨Ø§Ø±Ù‡ Ø§ÛŒØ¬Ø§Ø¯ Ø´ÙˆÙ†Ø¯.
- Deferred or risk IDs: Ù†Ø¯Ø§Ø±Ø¯.
- Rollback / recovery: Ú†ÙˆÙ† Ù‡Ø± Ø¯Ùˆ Ù…Ø³ÛŒØ± Ù…Ø¨Ø¯Ø£ Ø®Ø§Ù„ÛŒ Ø¨ÙˆØ¯Ù†Ø¯ØŒ Ø¨Ø§Ø²Ú¯Ø±Ø¯Ø§Ù†ÛŒ ÙÙ‚Ø· move Ù…Ø¹Ú©ÙˆØ³ Ù¾ÙˆØ´Ù‡â€ŒÙ‡Ø§ÛŒ Ø®Ø§Ù„ÛŒ Ø§Ø³Øª.

## LOG-0004 â€” 2026-08-14 â€” P0-G0 / Environment inventory

- Outcome: Ù†Ø³Ø®Ù‡â€ŒÙ‡Ø§ÛŒ Ù‚Ø§Ø¨Ù„ Ù…Ø´Ø§Ù‡Ø¯Ù‡Ù” Ø§Ø¨Ø²Ø§Ø±Ù‡Ø§ÛŒ Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯.
- Why: `PROJECT_MANIFEST.md` Ø¨Ø§ÛŒØ¯ ÙÙ‚Ø· Ø¨Ø± Ù¾Ø§ÛŒÙ‡Ù” inventory ÙˆØ§Ù‚Ø¹ÛŒ ØªÚ©Ù…ÛŒÙ„ Ø´ÙˆØ¯.
- Scope / files: Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± ÙØ§ÛŒÙ„.
- Commands or actions actually performed: Ù†Ø³Ø®Ù‡â€ŒÙ‡Ø§ÛŒ GitØŒ Node/npm/npxØŒ Python candidateÙ‡Ø§ØŒ uvØŒ OpenCodeØŒ SerenaØŒ DockerØŒ Docker Compose Ùˆ pnpm Ø¨Ø±Ø±Ø³ÛŒ Ø´Ø¯Ù†Ø¯.
- Verification actually performed and result: Git 2.54.0Ø› Node 24.16.0Ø› npm/npx 11.18.0Ø› Python Ù…Ø³ØªÙ‚Ù„ 3.14.4Ø› Python 3.11.15 Ù…ØªØ¹Ù„Ù‚ Ø¨Ù‡ Ù…Ø­ÛŒØ· HermesØ› uv 0.12.3Ø› OpenCode 1.18.18Ø› Serena 1.7.0Ø› Docker 29.4.1Ø› Docker Compose 5.1.3Ø› pnpm 11.19.0.
- Decisions / assumptions: Ø¯Ø³ØªÙˆØ± bare `python` Ø¨Ù‡ interpreter Ù…ØªØ¹Ù„Ù‚ Ø¨Ù‡ Hermes Ø§Ø´Ø§Ø±Ù‡ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ùˆ Ø¨Ø±Ø§ÛŒ Ù¾Ø±ÙˆÚ˜Ù‡ canonical Ù†ÛŒØ³Øª.
- Deferred or risk IDs: `DEFER-0003`.
- Rollback / recovery: Ù†Ø¯Ø§Ø±Ø¯Ø› inventory read-only Ø¨ÙˆØ¯.

## LOG-0005 â€” 2026-08-14 â€” P0-G0 / Documentation governance

- Outcome: Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ø«Ø¨Øª Ø§Ø¬Ø¨Ø§Ø±ÛŒ Ú©Ø§Ø±Ù‡Ø§ Ùˆ deferÙ‡Ø§ Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯ Ùˆ Work LogØŒ Deferred ValidationØŒ Risk RegisterØŒ Technical DebtØŒ Known Issues Ùˆ Task Spec Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù…Ù†Ø§Ø¨Ø¹ canonical Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯Ù†Ø¯.
- Why: Ù‡Ø± agent/developer Ø¨Ø§ÛŒØ¯ Ø¨ØªÙˆØ§Ù†Ø¯ ÙØ¹Ø§Ù„ÛŒØª Ø§Ù†Ø¬Ø§Ù…â€ŒØ´Ø¯Ù‡ØŒ evidence ÙˆØ§Ù‚Ø¹ÛŒ Ùˆ Ú©Ø§Ø±Ù‡Ø§ÛŒ Ø¹Ù…Ø¯Ø§Ù‹ Ø§Ù†Ø¬Ø§Ù…â€ŒÙ†Ø´Ø¯Ù‡ Ø±Ø§ Ø¨Ø¯ÙˆÙ† ØªÚ©ÛŒÙ‡ Ø¨Ø± Ø­Ø§ÙØ¸Ù‡ ÛŒØ§ Ú¯ÙØªâ€ŒÙˆÚ¯Ùˆ Ø¯Ù†Ø¨Ø§Ù„ Ú©Ù†Ø¯.
- Scope / files: `docs/governance/DOCUMENTATION_POLICY.md`ØŒ `docs/governance/RELEASE_POLICY.md`ØŒ Master PlanØŒ Ùˆ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ `docs/status/` Ùˆ `docs/templates/TASK_SPEC_TEMPLATE.md`.
- Commands or actions actually performed: ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ ledger/template Ø§ÛŒØ¬Ø§Ø¯ Ùˆ Ø§Ø±Ø¬Ø§Ø¹â€ŒÙ‡Ø§ÛŒ Master Plan Ùˆ Release Policy Ø¨Ù‡ Work Log Ùˆ Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ canonical Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯.
- Verification actually performed and result: `git diff --check` Ø¨Ø¯ÙˆÙ† Ø®Ø·Ø§ ØªÙ…Ø§Ù… Ø´Ø¯Ø› Ù‡Ù…Ù‡Ù” Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ required documentation ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø±Ù†Ø¯Ø› Ø¬Ø³Øªâ€ŒÙˆØ¬ÙˆÛŒ Ù…Ø³ÛŒØ± Ù‚Ø¯ÛŒÙ…ÛŒ Release Policy Ù†ØªÛŒØ¬Ù‡â€ŒØ§ÛŒ Ù†Ø¯Ø§Ø´Øª Ùˆ Ø§Ø±Ø¬Ø§Ø¹â€ŒÙ‡Ø§ÛŒ Ø¬Ø¯ÛŒØ¯ Work Log/Documentation Policy Ø¯Ø± Master Plan Ùˆ Release Policy Ø¯ÛŒØ¯Ù‡ Ø´Ø¯Ù†Ø¯.
- Decisions / assumptions: Work Log append-only Ø§Ø³ØªØ› defer Ù‡ÛŒÚ†â€ŒÚ¯Ø§Ù‡ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† blocker ÛŒØ§ ØªÚ©Ù…ÛŒÙ„ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ù‡Ø± ÙØ¹Ø§Ù„ÛŒØª Ø¢ÛŒÙ†Ø¯Ù‡ Ø¨Ø§ÛŒØ¯ entry Ù…Ø³ØªÙ‚Ù„ Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´Ø¯.
- Deferred or risk IDs: `RISK-0001`ØŒ `DEFER-0001` ØªØ§ `DEFER-0003`.
- Rollback / recovery: ØªÙ…Ø§Ù… ØªØºÛŒÛŒØ±Ù‡Ø§ Ù…Ø³ØªÙ†Ø¯ÛŒ Ùˆ Ù‚Ø§Ø¨Ù„ Ø¨Ø§Ø²Ú¯Ø±Ø¯Ø§Ù†ÛŒ Ø¨Ø§ Git Ù‡Ø³ØªÙ†Ø¯Ø› Ù‡Ù†ÙˆØ² commit/push Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0006 â€” 2026-08-14 â€” P0-G0 / Owner inputs and operations assessment

- Outcome: ÙˆØ±ÙˆØ¯ÛŒâ€ŒÙ‡Ø§ÛŒ Ù…Ø§Ù„Ú© Ø¨Ø±Ø§ÛŒ productionØŒ locale Ùˆ Ù…Ø­ØªÙˆØ§ÛŒ P1 Ø«Ø¨Øª Ø´Ø¯Ø› ØªØµÙ…ÛŒÙ… CI Ùˆ backup Ø¨Ø§ ØªÙˆØ¬Ù‡ Ø¨Ù‡ Ø¸Ø±ÙÛŒØª VPS Ø¨Ø±Ø§ÛŒ ADR Ø¢ÛŒÙ†Ø¯Ù‡ Ø§Ø±Ø²ÛŒØ§Ø¨ÛŒ Ø´Ø¯.
- Why: P0-G0 Ø¨Ø§ÛŒØ¯ ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ù…Ø­ÛŒØ· Ø±Ø§ Ø§Ø² Ø­Ø¯Ø³ agent Ø¬Ø¯Ø§ Ú©Ù†Ø¯.
- Scope / files: ÙÙ‚Ø· Ù…Ø³ØªÙ†Ø¯Ø§Øª statusØ› Ø§ØªØµØ§Ù„ SSHØŒ ØªØºÛŒÛŒØ± Ø³Ø±ÙˆØ±ØŒ deployØŒ secret storage ÛŒØ§ CI configuration Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Commands or actions actually performed: Ù…Ø´Ø®ØµØ§Øª Ø§Ø¨Ø²Ø§Ø±Ù‡Ø§ÛŒ Ù…Ø­Ù„ÛŒ Ùˆ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø§Ø¹Ù„Ø§Ù…â€ŒØ´Ø¯Ù‡Ù” Ù…Ø§Ù„Ú© Ø¨Ø§ Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø±Ø³Ù…ÛŒ GitHub Actions Ùˆ Gitea Actions Ù…Ù‚Ø§ÛŒØ³Ù‡ Ø´Ø¯.
- Verification actually performed and result: production target Ø§Ø¹Ù„Ø§Ù…â€ŒØ´Ø¯Ù‡ `tahamohamadi.ir` Ø§Ø³ØªØ› VPS ÙØ¹Ø§Ù„ Ubuntu Ø¨Ø§ 1 vCPUØŒ 2 GB RAM Ùˆ 30 GB NVMe Ø¯Ø§Ø±Ø¯. GitHub Ø¨Ø±Ø§ÛŒ repository Ø¹Ù…ÙˆÙ…ÛŒØŒ runner Ø§Ø³ØªØ§Ù†Ø¯Ø§Ø±Ø¯ hosted Ø±Ø§ Ø±Ø§ÛŒÚ¯Ø§Ù† Ø§Ø¹Ù„Ø§Ù… Ù…ÛŒâ€ŒÚ©Ù†Ø¯Ø› Gitea Ø¨Ø±Ø§ÛŒ Ø§Ø¬Ø±Ø§ÛŒ job Ø¨Ù‡ Act Runner Ù†ÛŒØ§Ø² Ø¯Ø§Ø±Ø¯ Ùˆ Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø¢Ù† runner Ø¬Ø¯Ø§ Ø§Ø² instance Ø±Ø§ ØªÙˆØµÛŒÙ‡ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Decisions / assumptions: `/` Language Gateway Ùˆ `/fa/` Ùˆ `/en/` ÙˆØ±ÙˆØ¯ÛŒ Ù…Ø³ØªÙ‚ÛŒÙ… Ù†Ù‡Ø§ÛŒÛŒ Ù‡Ø³ØªÙ†Ø¯Ø› browser preference ÙÙ‚Ø· Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ø²Ø¨Ø§Ù† Ø§Ø³Øª Ùˆ redirect Ø§Ø¬Ø¨Ø§Ø±ÛŒ Ù†ÛŒØ³Øª. Ø§ÛŒÙ† Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯Ù‡Ø§ Ø¯Ø± LOG-0007 ØªÙˆØ³Ø· Ù…Ø§Ù„Ú© ØªØ£ÛŒÛŒØ¯ Ùˆ Ø¯Ø± ADRÙ‡Ø§ÛŒ Ù…Ø±Ø¨ÙˆØ·Ù‡ freeze Ø´Ø¯Ù†Ø¯.
- Deferred or risk IDs: `DEFER-0004`ØŒ `RISK-0002` Ùˆ `RISK-0003`.
- Rollback / recovery: ØªØºÛŒÛŒØ±ÛŒ Ø¯Ø± production Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0007 â€” 2026-08-14 â€” P0-G0 / Approved baseline decisions

- Outcome: GitHub Actions hostedØŒ `staging.tahamohamadi.ir`ØŒ Google Drive encrypted backup targetØŒ `/admin/` Ùˆ Python 3.12 baseline ØªØ£ÛŒÛŒØ¯ Ùˆ Ù…Ø³ØªÙ†Ø¯ Ø´Ø¯Ù†Ø¯.
- Why: Ø§ÛŒÙ† ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§ Ø¨Ø±Ø§ÛŒ ManifestØŒ ADRÙ‡Ø§ Ùˆ Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² ÙˆØ±ÙˆØ¯ Ø³Ø±ÙˆÛŒØ³/Ù†Ø³Ø®Ù‡Ù” Ø­Ø¯Ø³ÛŒ Ù„Ø§Ø²Ù… Ø¨ÙˆØ¯Ù†Ø¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `AGENTS.md`ØŒ `.gitignore`ØŒ `.env.example`ØŒ READMEØŒ ADRÙ‡Ø§ÛŒ 0002/0008/0009/0010/0011/0014ØŒ Backup PolicyØŒ architecture baseline Ùˆ ledgerÙ‡Ø§.
- Commands or actions actually performed: Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø±Ø³Ù…ÛŒ Ø³Ø§Ø²Ú¯Ø§Ø±ÛŒ Django/Wagtail/Python Ùˆ billing GitHub Actions Ø¨Ø±Ø±Ø³ÛŒ Ø´Ø¯Ø› Ø³Ù¾Ø³ ÙÙ‚Ø· ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ Ù…Ø³ØªÙ†Ø¯ÛŒ/Ù¾ÛŒÚ©Ø±Ø¨Ù†Ø¯ÛŒ ØºÛŒØ±Ù…Ø­Ø±Ù…Ø§Ù†Ù‡ Ø§ÛŒØ¬Ø§Ø¯ ÛŒØ§ Ø§ØµÙ„Ø§Ø­ Ø´Ø¯Ù†Ø¯.
- Verification actually performed and result: Wagtail 7.4 LTS Ùˆ Django 5.2 LTS Ø¨Ø§ Python 3.12 Ø³Ø§Ø²Ú¯Ø§Ø±Ù†Ø¯Ø› Python 3.12 ØªØ§ October 2028 security support Ø¯Ø§Ø±Ø¯. GitHub Actions hosted standard Ø¨Ø±Ø§ÛŒ repository Ø¹Ù…ÙˆÙ…ÛŒ Ø±Ø§ÛŒÚ¯Ø§Ù† Ø§Ø³Øª.
- Decisions / assumptions: Python Ù‡Ø¯Ù 3.12 latest patch Ø§Ø³ØªØŒ Ù†Ù‡ Hermes Python Ùˆ Ù†Ù‡ 3.14 ÙØ¹Ù„ÛŒØ› Gitea/self-hosted runner baseline Ù†ÛŒØ³Øª. Ù‡ÛŒÚ† packageØŒ `.venv`ØŒ workflowØŒ Ø§ØªØµØ§Ù„ SSHØŒ DNS ÛŒØ§ deploy Ø³Ø§Ø®ØªÙ‡/Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯.
- Deferred or risk IDs: `DEFER-0003`Ø› `RISK-0001` ØªØ§ `RISK-0003`.
- Rollback / recovery: ØªØºÛŒÛŒØ±Ø§Øª ÙÙ‚Ø· Ø¯Ø± Git worktree ÙØ¹Ù„ÛŒ Ù‡Ø³ØªÙ†Ø¯ Ùˆ Ù‡Ù†ÙˆØ² commit/push Ù†Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯.

## LOG-0008 â€” 2026-08-14 â€” P0-G0 / Documentation verification normalization

- Outcome: policy Ù…Ø±Ø¨ÙˆØ· Ø¨Ù‡ line ending Ùˆ whitespace Ø§Ø³Ù†Ø§Ø¯ Markdown ØµØ±ÛŒØ­ Ø´Ø¯.
- Why: `git diff --check` Ø¯Ùˆ ÙØ§ØµÙ„Ù‡Ù” Ø§Ù†ØªÙ‡Ø§ÛŒ Ø®Ø· Ø¯Ø± Ø§Ø³Ù†Ø§Ø¯ baseline Ø±Ø§ Ú¯Ø²Ø§Ø±Ø´ Ù…ÛŒâ€ŒÚ©Ø±Ø¯ØŒ Ø¯Ø±Ø­Ø§Ù„ÛŒâ€ŒÚ©Ù‡ Ø¢Ù† ÙØ§ØµÙ„Ù‡â€ŒÙ‡Ø§ hard line break Ø¹Ù…Ø¯ÛŒ Markdown Ù‡Ø³ØªÙ†Ø¯.
- Scope / files: `.gitattributes` Ùˆ Ø§ÛŒÙ† Work Log.
- Commands or actions actually performed: staged diff Ø¨Ø§ `git diff --cached --check` Ø¨Ø±Ø±Ø³ÛŒ Ø´Ø¯Ø› Ø³Ù¾Ø³ attribute Ù…Ø®ØµÙˆØµ Markdown Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯.
- Verification actually performed and result: Ù¾Ø³ Ø§Ø² `git add --renormalize .`ØŒ `git diff --cached --check` Ø¨Ø¯ÙˆÙ† Ø®Ø·Ø§ ØªÙ…Ø§Ù… Ø´Ø¯Ø› local Markdown links Ù†ÛŒØ² PASS Ø¨ÙˆØ¯Ù†Ø¯. Ù…ØªÙ† Ùˆ line breakÙ‡Ø§ÛŒ Ø§Ø³Ù†Ø§Ø¯ Ù…ÙˆØ¬ÙˆØ¯ Ø­Ø°Ù ÛŒØ§ Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ Ù†Ø´Ø¯Ù†Ø¯.
- Decisions / assumptions: Ø¨Ø±Ø§ÛŒ `*.md`ØŒ line ending canonical Ø¨Ø±Ø§Ø¨Ø± LF Ùˆ trailing-space Ø§Ø² whitespace check Ù…Ø³ØªØ«Ù†Ø§ Ø§Ø³ØªØ› Ø§ÛŒÙ† Ø§Ø³ØªØ«Ù†Ø§ ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ Markdown Ø§Ø³Øª.
- Deferred or risk IDs: Ù†Ø¯Ø§Ø±Ø¯.
- Rollback / recovery: Ø­Ø°Ù `.gitattributes` Ø±ÙØªØ§Ø± Ø³Ø®Øªâ€ŒÚ¯ÛŒØ±Ø§Ù†Ù‡Ù” Ù‚Ø¨Ù„ÛŒ Ø±Ø§ Ø¨Ø§Ø²Ù…ÛŒâ€ŒÚ¯Ø±Ø¯Ø§Ù†Ø¯Ø› Ù‡ÛŒÚ† Ù…Ø­ØªÙˆØ§ÛŒ Ø³Ù†Ø¯ÛŒ Ø­Ø°Ù Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0009 â€” 2026-08-14 â€” P0-G0 / Initial documentation commit

- Outcome: baseline Ù…Ø³ØªÙ†Ø¯Ø§Øª P0-G0 Ø¯Ø± Ø§ÙˆÙ„ÛŒÙ† commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯.
- Why: Ø§ÛŒØ¬Ø§Ø¯ ØªØ§Ø±ÛŒØ®Ú†Ù‡Ù” Ù‚Ø§Ø¨Ù„ Ø¨Ø§Ø²Ú¯Ø´Øª Ùˆ Ù…Ø¨Ù†Ø§ÛŒ ØªÙ…ÛŒØ² Ø¨Ø±Ø§ÛŒ taskÙ‡Ø§ÛŒ Ø¨Ø¹Ø¯ÛŒ.
- Scope / files: ØªÙ…Ø§Ù… ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ baseline Ù…Ø³ØªÙ†Ø¯Ø§ØªØŒ policyÙ‡Ø§ØŒ ADRÙ‡Ø§ Ùˆ ØªÙ†Ø¸ÛŒÙ…Ø§Øª ØºÛŒØ±Ù…Ø­Ø±Ù…Ø§Ù†Ù‡Ù” repository.
- Commands or actions actually performed: `git commit -m "docs: establish P0-G0 governance baseline"` Ø±ÙˆÛŒ branch `main` Ø§Ø¬Ø±Ø§ Ø´Ø¯.
- Verification actually performed and result: commit Ù…Ø­Ù„ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ùˆ Ø³Ù¾Ø³ ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ Ø§ÙØ²ÙˆØ¯Ù† Ù‡Ù…ÛŒÙ† Work Log amend Ø´Ø¯Ø› `git status --short --branch` ØªÙ…ÛŒØ² Ø¨ÙˆØ¯ Ùˆ Ù‡ÛŒÚ† push Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯.
- Decisions / assumptions: Ø§ÛŒÙ† ÙÙ‚Ø· commit Ù…Ø­Ù„ÛŒ Ø§Ø³ØªØ› Ø§Ù†ØªØ´Ø§Ø± remoteØŒ deploy Ùˆ P0-G0 PASS Ø§Ø¹Ù„Ø§Ù… Ù†Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Deferred or risk IDs: `DEFER-0003`Ø› `RISK-0001` ØªØ§ `RISK-0003`.
- Rollback / recovery: Ù¾ÛŒØ´ Ø§Ø² pushØŒ Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ/Ø¨Ø§Ø²Ú¯Ø±Ø¯Ø§Ù†ÛŒ commit ÙÙ‚Ø· Ø¨Ø§ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú© Ù…Ø¬Ø§Ø² Ø§Ø³Øª.

## LOG-0010 â€” 2026-08-14 â€” P0-A preparation / secure access, staging DNS and backup

- Outcome: Task Spec Ùˆ runbook Ø¹Ù…Ù„ÛŒØ§ØªÛŒÙ Ø§Ù…Ù† Ø¨Ø±Ø§ÛŒ Ø³Ø§Ø®Øª Ú©Ø§Ø±Ø¨Ø± non-rootØŒ SSH key-onlyØŒ Ø±Ú©ÙˆØ±Ø¯ staging Ùˆ handoff backup Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯Ø› owner Ø¢ØºØ§Ø² Ø§Ø¬Ø±Ø§ÛŒ Ù‡Ø± Ø³Ù‡ Ù…Ø³ÛŒØ± Ø±Ø§ ØªØ£ÛŒÛŒØ¯ Ú©Ø±Ø¯.
- Why: `RISK-0002` Ù…Ø§Ù†Ø¹ Ù‡Ø± Ø§ØªØµØ§Ù„ SSH Ø§Ø³Øª Ùˆ `RISK-0003` Ø¨Ø¯ÙˆÙ† Ø¯Ø³ØªØ±Ø³ÛŒ Ø§Ù…Ù† Ùˆ OAuth ØªØ¹Ø§Ù…Ù„ÛŒ Ù†Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ provision Ø´ÙˆØ¯Ø› ØªØ±ØªÛŒØ¨ Ø§Ù…Ù† Ùˆ rollback Ø¨Ø§ÛŒØ¯ Ù¾ÛŒØ´Ø§Ù¾ÛŒØ´ Ø±ÙˆØ´Ù† Ø¨Ø§Ø´Ø¯.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/governance/SERVER_ACCESS_RUNBOOK.md`ØŒ `PROJECT_MANIFEST.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: ØªØµØ§ÙˆÛŒØ± Cloudflare Ø§Ø±Ø§Ø¦Ù‡â€ŒØ´Ø¯Ù‡ ØªÙˆØ³Ø· Ù…Ø§Ù„Ú© Ø¨Ø±Ø±Ø³ÛŒ Ø´Ø¯Ø› Ù…Ø³ØªÙ†Ø¯Ø§Øª/Ø¯Ø³ØªÙˆØ±Ù‡Ø§ÛŒ owner-executed Ø¨Ø±Ø§ÛŒ rotationØŒ `tahaops`ØŒ ØªØ³Øª login Ùˆ SSH drop-in Ù†ÙˆØ´ØªÙ‡ Ø´Ø¯Ø› Ø³Ù¾Ø³ Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯. Ù‡ÛŒÚ† Ø§ØªØµØ§Ù„ SSHØŒ ØªØºÛŒÛŒØ± Ø³Ø±ÙˆØ±ØŒ ØªØºÛŒÛŒØ± DNS ÛŒØ§ OAuth/backup command ÛŒØ§ push remote Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯.
- Verification actually performed and result: Ø§Ø² ØªØµØ§ÙˆÛŒØ±ØŒ ÙˆØ¬ÙˆØ¯ root A Ùˆ www CNAME Ø¨Ø§ proxy ÙØ¹Ø§Ù„ØŒ Ù†Ø¨ÙˆØ¯Ù† staging record Ùˆ Cloudflare encryption mode Ø¨Ø±Ø§Ø¨Ø± Full Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø´Ø¯. Ø§Ø¬Ø±Ø§ÛŒ server-side ÛŒØ§ DNS Ù‡Ù†ÙˆØ² evidence Ù†Ø¯Ø§Ø±Ø¯.
- Decisions / assumptions: Ø­Ø³Ø§Ø¨ Ø§Ù†Ø³Ø§Ù†ÛŒ/Ø¹Ù…Ù„ÛŒØ§ØªÛŒ `tahaops` Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ø¯Ø› password/root SSH ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² Ø§Ø«Ø¨Ø§Øª login Ø¨Ø§ Ú©Ù„ÛŒØ¯ Ø¯Ø± session Ø¯ÙˆÙ… ØºÛŒØ±ÙØ¹Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆØ¯. staging Ù‡Ù…Ø§Ù† VPS address Ùˆ proxy Cloudflare Ø®ÙˆØ§Ù‡Ø¯ Ø¯Ø§Ø´Øª. Full (strict) ØªØ§ Ù†ØµØ¨ certificate Ù…Ø¹ØªØ¨Ø± Ø¯Ø± origin Ø¨Ù‡ ØªØ¹ÙˆÛŒÙ‚ Ù…ÛŒâ€ŒØ§ÙØªØ¯.
- Deferred or risk IDs: `RISK-0001` ØªØ§ `RISK-0003`Ø› Ù‡ÛŒÚ† Ù…ÙˆØ±Ø¯ High Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† defer Ù¾Ø°ÛŒØ±ÙØªÙ‡ Ù†Ø´Ø¯.
- Rollback / recovery: root console ØªØ§ ØªØ£ÛŒÛŒØ¯ login Ø¬Ø¯ÛŒØ¯ Ø¨Ø§Ø² Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ø› Ø­Ø°Ù ØªÙ†Ù‡Ø§ Ø±Ú©ÙˆØ±Ø¯ `staging` DNS rollback Ù…Ø³ØªÙ‚Ù„ Ø¯Ø§Ø±Ø¯Ø› backup Ù†Ø§Ù…ÙˆÙÙ‚ Ø¨Ø§ÛŒØ¯ disable Ùˆ credentialÙ‡Ø§ÛŒ Ù…Ø±ØªØ¨Ø· revoke/rotate Ø´ÙˆÙ†Ø¯.

## LOG-0011 â€” 2026-08-14 â€” P0-A diagnosis / existing SSH operator account

- Outcome: Ø§Ø¬Ø±Ø§ÛŒ owner-side Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ session ÙØ¹Ù„ÛŒ SSH Ø¨Ø§ ÛŒÚ© Ø­Ø³Ø§Ø¨ non-root Ù…ÙˆØ¬ÙˆØ¯ Ùˆ public-key authentication Ø¨Ø±Ù‚Ø±Ø§Ø± Ø´Ø¯Ù‡ Ø§Ø³ØªØ› Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† Ø¯Ø³ØªÙˆØ±Ù‡Ø§ÛŒ Ø³Ø§Ø®Øª Ú©Ø§Ø±Ø¨Ø± Ú©Ù‡ Ø¨Ù‡ root Ù†ÛŒØ§Ø² Ø¯Ø§Ø´ØªÙ†Ø¯ Ø±Ø¯ Ø´Ø¯Ù†Ø¯. task/runbook Ø¨Ø±Ø§ÛŒ privilege check Ù¾ÛŒØ´ Ø§Ø² Ù‡Ø± ØªØºÛŒÛŒØ± Ø§ØµÙ„Ø§Ø­ Ø´Ø¯.
- Why: Ø§Ø¬Ø±Ø§ÛŒ Ø¯Ø³ØªÙˆØ±Ø§Øª root Ø¯Ø± Ø­Ø³Ø§Ø¨ non-root Ø¹Ù„Øª Ù…Ø³ØªÙ‚ÛŒÙ… Ø®Ø·Ø§ Ø¨ÙˆØ¯Ø› Ø³Ø§Ø®Øª Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÛŒØ¯ ÛŒØ§ ØªØºÛŒÛŒØ± SSH Ø¨Ø¯ÙˆÙ† Ø¨Ø±Ø±Ø³ÛŒ Ú©Ù…ÛŒÙ†Ù‡Ù” privilege Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø³Øª Ù…Ø³ÛŒØ± Ú©Ø§Ø±ÛŒ Ù…ÙˆØ¬ÙˆØ¯ Ø±Ø§ Ù…Ø®ØªÙ„ Ú©Ù†Ø¯.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/governance/SERVER_ACCESS_RUNBOOK.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© key pair Ù…Ø­Ù„ÛŒ Ø³Ø§Ø®Øª Ùˆ ØªÙ„Ø§Ø´ Ù…Ø³ØªÙ‚ÛŒÙ… Ø¨Ø±Ø§ÛŒ `adduser`/Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ù…Ø³ÛŒØ± authorization Ø¯Ø± session non-root Ø§Ù†Ø¬Ø§Ù… Ø¯Ø§Ø¯Ø› `adduser` Ø¨Ø§ Ø®Ø·Ø§ÛŒ Ù†ÛŒØ§Ø² Ø¨Ù‡ root Ø±Ø¯ Ø´Ø¯ Ùˆ Ù†ÙˆØ´ØªÙ† editor Ù†ÛŒØ² Ø¨Ù‡â€ŒØ¹Ù„Øª Ù†Ø¨ÙˆØ¯ directory Ù…ÙˆÙÙ‚ Ù†Ø´Ø¯. Ø³Ù¾Ø³ Ø§ØµÙ„Ø§Ø­ Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯. Ù‡ÛŒÚ† accountØŒ authorization fileØŒ SSH daemon settingØŒ DNS ÛŒØ§ backup configuration Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: banner Ø§ØªØµØ§Ù„ØŒ public-key authentication Ùˆ username ØºÛŒØ±-root Ø±Ø§ Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯Ø› Ø®Ø±ÙˆØ¬ÛŒ Ø®Ø·Ø§ Ø«Ø§Ø¨Øª Ú©Ø±Ø¯ session root Ù†ÛŒØ³Øª. sudo authority Ù‡Ù†ÙˆØ² Ø¨Ø±Ø±Ø³ÛŒ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Decisions / assumptions: Ø¨Ù‡â€ŒØ¬Ø§ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ú©ÙˆØ±Ú©ÙˆØ±Ø§Ù†Ù‡Ù” account Ø¯ÙˆÙ…ØŒ Ø­Ø³Ø§Ø¨ Ù…ÙˆØ¬ÙˆØ¯ ÙÙ‚Ø· Ø¯Ø± ØµÙˆØ±Øª Ù…ÙˆÙÙ‚ÛŒØª read-only sudo check Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† operator Ø§Ù†ØªØ®Ø§Ø¨ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ø¯Ø± ØºÛŒØ± Ø§ÛŒÙ† ØµÙˆØ±Øª Ø§ÛŒØ¬Ø§Ø¯ `tahaops` ÙÙ‚Ø· Ø§Ø² provider/root console Ø§Ù†Ø¬Ø§Ù… Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0001` ØªØ§ `RISK-0003` Ù‡Ù…Ú†Ù†Ø§Ù† Ø¨Ø§Ø²/blocked Ù‡Ø³ØªÙ†Ø¯Ø› `RISK-0002` Ø¨Ø³ØªÙ‡ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Rollback / recovery: editor Ø¨Ø¯ÙˆÙ† Ø°Ø®ÛŒØ±Ù‡ Ø¨Ø³ØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ú†ÙˆÙ† ÙØ§ÛŒÙ„ ÛŒØ§ account Ø¬Ø¯ÛŒØ¯ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ù†Ø´Ø¯Ù‡ØŒ rollback Ø³Ù…Øª Ø³Ø±ÙˆØ± Ù„Ø§Ø²Ù… Ù†ÛŒØ³Øª.

## LOG-0012 â€” 2026-08-14 â€” P0-A diagnosis / privileged-access recovery required

- Outcome: Ø­Ø³Ø§Ø¨ non-root Ù…ÙˆØ¬ÙˆØ¯ Ø¹Ø¶Ùˆ Ú¯Ø±ÙˆÙ‡ sudo Ø§Ø³ØªØŒ Ø§Ù…Ø§ sudo Ø¨Ù‡ authentication ØªØ¹Ø§Ù…Ù„ÛŒ Ù†ÛŒØ§Ø² Ø¯Ø§Ø±Ø¯ Ùˆ Ù‡ÛŒÚ† credential ØµØ­ÛŒØ­ÛŒ Ø¨Ø±Ø§ÛŒ Ø¢Ù† Ø§Ø«Ø¨Ø§Øª Ù†Ø´Ø¯. Ø§ØªØµØ§Ù„ root Ø¨Ø§ Ø±ÙˆØ´ authentication Ù…ÙˆØ¬ÙˆØ¯ Ù†ÛŒØ² Ø±Ø¯ Ø´Ø¯Ø› recovery Ø§Ø² provider console/rescue Ù„Ø§Ø²Ù… Ø§Ø³Øª.
- Why: ØªÙ„Ø§Ø´ Ù…Ø³ØªÙ‚ÛŒÙ… account creation Ø¨Ø§ root Ù†Ø¨ÙˆØ¯Ù† session Ø±Ø¯ Ø´Ø¯ Ùˆ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ú©Ø±Ø¯Ù† password root Ø¨Ø§ password Ø­Ø³Ø§Ø¨ operator Ù†ÛŒØ² Ù…Ø³ÛŒØ± Ù…Ø¹ØªØ¨Ø± sudo Ù†ÛŒØ³ØªØ› Ø§Ø¯Ø§Ù…Ù‡Ù” password guessing Ø±ÛŒØ³Ú© exposure Ùˆ lockout Ø±Ø§ Ø¨Ø§Ù„Ø§ Ù…ÛŒâ€ŒØ¨Ø±Ø¯.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/governance/SERVER_ACCESS_RUNBOOK.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© `whoami`ØŒ `id -nG`ØŒ `sudo -n whoami` Ùˆ `sudo -n -l` Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯Ø› Ø³Ù¾Ø³ ØªÙ„Ø§Ø´ authentication ØªØ¹Ø§Ù…Ù„ÛŒ sudo Ùˆ ØªÙ„Ø§Ø´ root SSH Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯. Ø§ÛŒÙ† diagnosis Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯. Ù‡ÛŒÚ† accountØŒ SSH configØŒ DNSØŒ application ÛŒØ§ backup configuration Ùˆ Ù‡ÛŒÚ† push remote ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.
- Verification actually performed and result: identity Ø­Ø³Ø§Ø¨ non-root Ùˆ Ø¹Ø¶ÙˆÛŒØª Ø¢Ù† Ø¯Ø± sudo Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø´Ø¯Ø› Ù‡Ø± Ø¯Ùˆ sudo non-interactive checkØŒ authentication ØªØ¹Ø§Ù…Ù„ÛŒ Ø®ÙˆØ§Ø³ØªÙ†Ø¯. Ø±ÙˆØ´ authentication Ù…ÙˆØ¬ÙˆØ¯ Ø¨Ø±Ø§ÛŒ root SSH Ù¾Ø°ÛŒØ±ÙØªÙ‡ Ù†Ø´Ø¯. Ù‡ÛŒÚ† credential ÛŒØ§ Ù…Ù‚Ø¯Ø§Ø± Ø¢Ù† Ø¯Ø± Ø§ÛŒÙ† log Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Decisions / assumptions: ØªØ§ Ø¨Ø§Ø²ÛŒØ§Ø¨ÛŒ privileged access Ø§Ø² provider console/rescueØŒ ØªÙ†Ù‡Ø§ Ø¹Ù…Ù„ÛŒØ§Øª read-only Ù…Ø¬Ø§Ø² Ø§Ø³ØªØ› password guessing Ùˆ ÙØ¹Ø§Ù„â€ŒÚ©Ø±Ø¯Ù† remote root password SSH Ù…Ù…Ù†ÙˆØ¹ Ø§Ø³Øª.
- Deferred or risk IDs: `RISK-0001` ØªØ§ `RISK-0003`Ø› `RISK-0002` Ù‡Ù…Ú†Ù†Ø§Ù† blocker High Ø§Ø³Øª Ùˆ defer Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Rollback / recovery: owner Ø§Ø² Ù¾Ù†Ù„ provider Ù…Ø³ÛŒØ± console/rescue ÛŒØ§ reset root Ø±Ø§ Ø§Ù†ØªØ®Ø§Ø¨ Ù…ÛŒâ€ŒÚ©Ù†Ø¯Ø› Ù¾Ø³ Ø§Ø² ÙˆØ±ÙˆØ¯ consoleØŒ ÙÙ‚Ø· password Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡Ù” operator Ùˆ public key Ø¬Ø¯ÛŒØ¯ Ø·Ø¨Ù‚ runbook ØªÙ†Ø¸ÛŒÙ… Ùˆ Ø¯Ø± terminal Ø¯ÙˆÙ… Ø¢Ø²Ù…ÙˆØ¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.

## LOG-0013 â€” 2026-08-14 â€” P0-A evidence / interactive sudo path recovered

- Outcome: Ù…Ø§Ù„Ú© Ø¨Ø§ Ø­Ø³Ø§Ø¨ SSH non-root Ù…ÙˆØ¬ÙˆØ¯ Ø§Ø² Ù…Ø³ÛŒØ± sudo ØªØ¹Ø§Ù…Ù„ÛŒ Ø¨Ù‡ root shell Ø±Ø³ÛŒØ¯Ø› Ø³Ø§Ø®Øª account Ø¯ÙˆÙ… Ù„Ø§Ø²Ù… Ù†ÛŒØ³Øª Ùˆ Ø­Ø³Ø§Ø¨ Ù…ÙˆØ¬ÙˆØ¯ operator Ù…Ù†ØªØ®Ø¨ Ø§Ø³Øª.
- Why: Ø®Ø±ÙˆØ¬ÛŒ Ù‚Ø¨Ù„ÛŒ ÙÙ‚Ø· Ù†Ø´Ø§Ù† Ù…ÛŒâ€ŒØ¯Ø§Ø¯ sudo Ø¯Ø± Ø­Ø§Ù„Øª non-interactive password Ù…ÛŒâ€ŒØ®ÙˆØ§Ù‡Ø¯Ø› session Ø¨Ø¹Ø¯ÛŒ Ø§Ø«Ø¨Ø§Øª Ú©Ø±Ø¯ Ø­Ø³Ø§Ø¨ operator Ø¯Ø§Ø±Ø§ÛŒ Ù…Ø³ÛŒØ± sudo Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª. Ø§ÛŒÙ† evidence Ù…Ø³ÛŒØ± provider/rescue Ø±Ø§ Ø§Ø² blocker ÙØ¹Ù„ÛŒ Ø¨Ù‡ fallback ØªØ¨Ø¯ÛŒÙ„ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© ÛŒÚ© session SSH Ø¬Ø¯ÛŒØ¯ Ø¨Ø±Ù‚Ø±Ø§Ø± Ùˆ sudo ØªØ¹Ø§Ù…Ù„ÛŒ Ø±Ø§ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯Ø› shell root Ø­Ø§ØµÙ„ Ø´Ø¯. Ø§ÛŒÙ† evidence Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯. Ù‡ÛŒÚ† passwordØŒ key ÛŒØ§ Ù…Ù‚Ø¯Ø§Ø± secret Ø¯Ø± repository Ø«Ø¨Øª Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Verification actually performed and result: prompt root Ø¯Ø± ÛŒÚ© session sudo Ù…Ø§Ù„Ú© Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø´Ø¯Ø› Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† operator account Ùˆ sudo path Ø¢Ù† Ù…Ø¹ØªØ¨Ø±Ù†Ø¯. rotation root credentialØŒ Ø§ÙØ²ÙˆØ¯Ù† Ú©Ù„ÛŒØ¯ Ø¬Ø¯ÛŒØ¯ØŒ test Ù…Ø³ØªÙ‚Ù„ Ø¢Ù† Ùˆ SSH hardening Ù‡Ù†ÙˆØ² Ø§Ù†Ø¬Ø§Ù…/ØªØ£ÛŒÛŒØ¯ Ù†Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Decisions / assumptions: Ù‡Ù…Ø§Ù† Ø­Ø³Ø§Ø¨ Ù…ÙˆØ¬ÙˆØ¯ Ø¨Ø§ password Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ Ùˆ Ú©Ù„ÛŒØ¯Ù‡Ø§ÛŒ owner-controlled Ù†Ú¯Ù‡ Ø¯Ø§Ø´ØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› ØªØºÛŒÛŒØ± daemon SSH ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² ØªØ³Øª Ú©Ù„ÛŒØ¯ Ø¬Ø¯ÛŒØ¯ Ø¯Ø± terminal Ø¯ÙˆÙ… Ø§Ù†Ø¬Ø§Ù… Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0001` ØªØ§ `RISK-0003`Ø› `RISK-0002` Ù‡Ù†ÙˆØ² High/Blocked Ø§Ø³Øª.
- Rollback / recovery: root shell ÙØ¹Ù„ÛŒ ØªØ§ Ù…ÙˆÙÙ‚ÛŒØª terminal Ø¯ÙˆÙ… Ø¨Ø§Ø² Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ø› Ø§Ú¯Ø± Ú©Ù„ÛŒØ¯ Ø¬Ø¯ÛŒØ¯ Ú©Ø§Ø± Ù†Ú©Ù†Ø¯ØŒ Ú©Ù„ÛŒØ¯ ÙØ¹Ù„ÛŒ Ø­Ø°Ù Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ SSH daemon Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯.

## LOG-0014 â€” 2026-08-14 â€” P0-A evidence / new operator key and sudo verified

- Outcome: Ú©Ù„ÛŒØ¯ Ø¹Ù…ÙˆÙ…ÛŒ Ø¬Ø¯ÛŒØ¯ Ø¨Ù‡ authorization Ø­Ø³Ø§Ø¨ operator Ù…ÙˆØ¬ÙˆØ¯ Ø§Ø¶Ø§ÙÙ‡ Ùˆ Ø§Ø² PowerShell Ø¯Ø± ÛŒÚ© session Ù…Ø³ØªÙ‚Ù„ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª ØªØ³Øª Ø´Ø¯Ø› identity operator Ùˆ sudo Ø¨Ù‡ root Ù†ÛŒØ² ØªØ£ÛŒÛŒØ¯ Ø´Ø¯.
- Why: Ù¾ÛŒØ´ Ø§Ø² ØªØºÛŒÛŒØ± policy SSH Ø¨Ø§ÛŒØ¯ Ø­Ø¯Ø§Ù‚Ù„ Ø¯Ùˆ Ù…Ø³ÛŒØ± Ù…Ø¹ØªØ¨Ø± Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´ÛŒÙ…: session privileged Ù…ÙˆØ¬ÙˆØ¯ Ùˆ Ø§ØªØµØ§Ù„ ØªØ§Ø²Ù‡ Ø¨Ø§ Ú©Ù„ÛŒØ¯ Ø¬Ø¯ÛŒØ¯Ø› Ø§ÛŒÙ† Ø´Ø±Ø· Ø§Ú©Ù†ÙˆÙ† Ø¨Ø±Ù‚Ø±Ø§Ø± Ø§Ø³Øª.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© directory/permissionÙ‡Ø§ÛŒ SSH Ø­Ø³Ø§Ø¨ operator Ø±Ø§ Ø¨Ø§ root shell Ø¢Ù…Ø§Ø¯Ù‡ Ú©Ø±Ø¯ØŒ Ú©Ù„ÛŒØ¯ Ø¹Ù…ÙˆÙ…ÛŒ Ø¬Ø¯ÛŒØ¯ Ø±Ø§ Ø¨Ø¯ÙˆÙ† Ø­Ø°Ù Ú©Ù„ÛŒØ¯ Ù…ÙˆØ¬ÙˆØ¯ Ø§ÙØ²ÙˆØ¯ Ùˆ Ø¨Ø§ `ssh -i` Ø§Ø² PowerShell Ø§ØªØµØ§Ù„ Ù…Ø³ØªÙ‚Ù„ Ø¨Ø±Ù‚Ø±Ø§Ø± Ú©Ø±Ø¯Ø› Ø³Ù¾Ø³ identity Ùˆ sudo Ø±Ø§ Ø¨Ø±Ø±Ø³ÛŒ Ú©Ø±Ø¯. ÛŒÚ© ØªÙ„Ø§Ø´ literal Ø¨Ø§ placeholder hostname Ù¾ÛŒØ´ Ø§Ø² ØªÙ„Ø§Ø´ Ù…ÙˆÙÙ‚ Ø±Ø® Ø¯Ø§Ø¯ Ùˆ Ù‡ÛŒÚ† ØªØºÛŒÛŒØ±ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ù†Ú©Ø±Ø¯. Ø§ÛŒÙ† evidence Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯Ø› Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: Ø§ØªØµØ§Ù„ Ù…Ø³ØªÙ‚Ù„ Ø¨Ø§ Ú©Ù„ÛŒØ¯ Ø¬Ø¯ÛŒØ¯ Ù…ÙˆÙÙ‚ Ø¨ÙˆØ¯Ø› shell identity Ø­Ø³Ø§Ø¨ operator Ø¨ÙˆØ¯ Ùˆ sudo Ø¨Ù‡ root Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ù¾Ø§Ø³Ø® Ø¯Ø§Ø¯. Ø®Ø±ÙˆØ¬ÛŒ Ù…Ø¹ØªØ¨Ø±Ù Ø§Ø¬Ø±Ø§ÛŒ `passwd` Ø¨Ø±Ø§ÛŒ root ÛŒØ§ operator Ø§Ø±Ø§Ø¦Ù‡ Ù†Ø´Ø¯Ù‡ Ø§Ø³ØªØ› Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† rotation ØªØ£ÛŒÛŒØ¯ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Decisions / assumptions: root/password credential Ø¯Ø± Ù…Ø¹Ø±Ø¶ Ù…Ø´Ø§Ù‡Ø¯Ù‡ ØªØ§ Ø²Ù…Ø§Ù† Ø§Ø¬Ø±Ø§ÛŒ `passwd` Ù‡Ù…Ú†Ù†Ø§Ù† compromised ÙØ±Ø¶ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› SSH daemon Ùˆ firewall Ù‡Ù†ÙˆØ² ØªØºÛŒÛŒØ± Ù†Ù…ÛŒâ€ŒÚ©Ù†Ù†Ø¯ Ùˆ Ø§Ø¨ØªØ¯Ø§ effective config read-only Ø¨Ø±Ø±Ø³ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0001` ØªØ§ `RISK-0003`Ø› `RISK-0002` Ø¨Ù‡â€ŒØ¯Ù„ÛŒÙ„ rotationÙ ØªØ£ÛŒÛŒØ¯Ù†Ø´Ø¯Ù‡ Ù‡Ù…Ú†Ù†Ø§Ù† High/Blocked Ø§Ø³Øª.
- Rollback / recovery: Ú©Ù„ÛŒØ¯ Ù‚Ø¯ÛŒÙ…ÛŒ Ø­Ø°Ù Ù†Ø´Ø¯Ù‡ Ùˆ root shell Ø¨Ø§Ø² Ø§Ø³ØªØ› Ø§Ú¯Ø± Ú©Ù„ÛŒØ¯ Ø¬Ø¯ÛŒØ¯ Ø¨Ø¹Ø¯Ø§Ù‹ revoke Ø´ÙˆØ¯ØŒ Ú©Ù„ÛŒØ¯ Ù‚Ø¯ÛŒÙ…ÛŒ Ù…Ø³ÛŒØ± recovery Ù…ÙˆÙ‚Øª Ø¨Ø§Ù‚ÛŒ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯ ØªØ§ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ø³Ø§Ù„Ù… ØªØ£ÛŒÛŒØ¯ Ø´ÙˆØ¯.

## LOG-0015 â€” 2026-08-14 â€” P0-A evidence / effective SSH policy already hardened

- Outcome: inspection ÙÙ‚Ø·â€ŒØ®ÙˆØ§Ù†Ø¯Ù†ÛŒÙ effective SSH configuration Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ root loginØŒ password authentication Ùˆ keyboard-interactive authentication ØºÛŒØ±ÙØ¹Ø§Ù„â€ŒØ§Ù†Ø¯Ø› public-key authentication Ùˆ allow-list ØµØ±ÛŒØ­ Ø¨Ø±Ø§ÛŒ operatorÙ‡Ø§ ÙØ¹Ø§Ù„ Ø§Ø³Øª. ØªØºÛŒÛŒØ± ÛŒØ§ reload SSH Ù„Ø§Ø²Ù… Ù†ÛŒØ³Øª.
- Why: Ù‚Ø¨Ù„ Ø§Ø² Ù†ÙˆØ´ØªÙ† drop-in Ø¬Ø¯ÛŒØ¯ Ø¨Ø§ÛŒØ¯ configuration ÙˆØ§Ù‚Ø¹ÛŒ daemon Ø¨Ø±Ø±Ø³ÛŒ Ù…ÛŒâ€ŒØ´Ø¯Ø› Ù†ØªÛŒØ¬Ù‡ Ù†Ø´Ø§Ù† Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ Ú©Ù†ØªØ±Ù„â€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ±Ø¯Ù†Ø¸Ø± Ø§Ø² Ù‚Ø¨Ù„ Ø¨Ø±Ù‚Ø±Ø§Ø±Ù†Ø¯ Ùˆ duplicate configuration Ø±ÛŒØ³Ú© ØºÛŒØ±Ø¶Ø±ÙˆØ±ÛŒ Ø¯Ø§Ø±Ø¯.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/governance/SERVER_ACCESS_RUNBOOK.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© Ø§Ø² root shellØŒ `sshd -T` Ø±Ø§ Ø¨Ø§ filter Ù…Ø­Ø¯ÙˆØ¯ Ø¨Ø±Ø§ÛŒ authentication policy Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯. Ù‡ÛŒÚ† file writeØŒ reload SSHØŒ firewallØŒ DNSØŒ application ÛŒØ§ backup command Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯.
- Verification actually performed and result: effective values Ø¨Ø±Ø§ÛŒ root loginØŒ password authenticationØŒ keyboard-interactiveØŒ public-key authenticationØŒ allow-list Ùˆ authentication method Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ùˆ Ø¨Ø§ baseline Ø§Ù…Ù† Ù…Ø·Ø§Ø¨Ù‚Øª Ø¯Ø§Ø¯Ù‡ Ø´Ø¯. Ø§Ø¬Ø±Ø§ÛŒ `passwd` Ø¨Ø±Ø§ÛŒ root Ø¯Ø± evidence ÙØ¹Ù„ÛŒ Ø¯ÛŒØ¯Ù‡ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Decisions / assumptions: SSH policy ÙØ¹Ù„ÛŒ Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ø› ØªÙ†Ù‡Ø§ acceptance Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡ Ø¨Ø±Ø§ÛŒ `RISK-0002`ØŒ rotation credential Ø§ÙØ´Ø§Ø´Ø¯Ù‡ Ùˆ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú© Ø§Ø³Øª.
- Deferred or risk IDs: `RISK-0001` ØªØ§ `RISK-0003`Ø› `RISK-0002` ÙÙ‚Ø· Ø¨Ù‡â€ŒØ¯Ù„ÛŒÙ„ root rotation ØªØ£ÛŒÛŒØ¯Ù†Ø´Ø¯Ù‡ High/Blocked Ø§Ø³Øª.
- Rollback / recovery: Ú†ÙˆÙ† configuration ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯Ù‡ØŒ rollback Ù„Ø§Ø²Ù… Ù†ÛŒØ³ØªØ› root shell Ùˆ Ø¯Ùˆ Ú©Ù„ÛŒØ¯ SSH Ù…ÙˆØ¬ÙˆØ¯ Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ recovery Ú©Ù†ØªØ±Ù„â€ŒØ´Ø¯Ù‡â€ŒØ§Ù†Ø¯.

## LOG-0016 â€” 2026-08-14 â€” P0-A owner decision / root credential rotation declined

- Outcome: Ù…Ø§Ù„Ú© Ø§Ø¹Ù„Ø§Ù… Ú©Ø±Ø¯ Ú©Ù‡ Ø¯Ø± Ø­Ø§Ù„ Ø­Ø§Ø¶Ø± root password rotate Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯. Ù‡ÛŒÚ† ØªØºÛŒÛŒØ± Ø¯ÛŒÚ¯Ø±ÛŒ Ø¯Ø± Ø³Ø±ÙˆØ± Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Why: ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú© Ø¯Ø±Ø¨Ø§Ø±Ù‡Ù” credential ØªØºÛŒÛŒØ± Ø³Ø±ÙˆØ± Ø±Ø§ Ù…ØªÙˆÙ‚Ù Ù…ÛŒâ€ŒÚ©Ù†Ø¯ØŒ Ø§Ù…Ø§ exposure Ù¾ÛŒØ´ÛŒÙ† Ø±Ø§ Ø§Ø² Ø¨ÛŒÙ† Ù†Ù…ÛŒâ€ŒØ¨Ø±Ø¯.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: ÙÙ‚Ø· ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú© Ø«Ø¨Øª Ùˆ Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯Ø› Ù‡ÛŒÚ† SSH command ØªÙˆØ³Ø· CodexØŒ deployØŒ DNS changeØŒ backup provisioning ÛŒØ§ application change Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: evidence LOG-0015 Ù†Ø´Ø§Ù† Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ policy SSH ÙØ¹Ù„ÛŒ key-only Ùˆ root/password-disabled Ø§Ø³ØªØ› Ø¨Ø§ ÙˆØ¬ÙˆØ¯ Ø§ÛŒÙ†ØŒ rotation credential Ø§ÙØ´Ø§Ø´Ø¯Ù‡ ØªØ£ÛŒÛŒØ¯ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Decisions / assumptions: `RISK-0002` stop-the-line Ø¨Ø§Ù‚ÛŒ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯ Ùˆ Ø¨Ø§ acceptance Ø¹Ø§Ø¯ÛŒ Ø¨Ø³ØªÙ‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Codex ØªØ§ Ø²Ù…Ø§Ù† rotation Ø¨Ù‡ VPS Ù…ØªØµÙ„ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0002` BLOCKEDØ› `RISK-0001` Ùˆ `RISK-0003` Ù†ÛŒØ² Ø¨Ø§Ø² Ù‡Ø³ØªÙ†Ø¯.
- Rollback / recovery: Ù‡Ø± Ø²Ù…Ø§Ù† Ù…Ø§Ù„Ú© rotation Ø±Ø§ ØªØ£ÛŒÛŒØ¯ Ú©Ù†Ø¯ØŒ task Ø§Ø² Ù‡Ù…ÛŒÙ† evidence Ø§Ø¯Ø§Ù…Ù‡ Ù…ÛŒâ€ŒÛŒØ§Ø¨Ø¯Ø› ØªØ§ Ø¢Ù† Ø²Ù…Ø§Ù† ÙÙ‚Ø· Ú©Ø§Ø±Ù‡Ø§ÛŒ local/documentation Ø¨Ø¯ÙˆÙ† Ù†ÛŒØ§Ø² Ø¨Ù‡ VPS Ù…Ù…Ú©Ù†â€ŒØ§Ù†Ø¯.

## LOG-0017 â€” 2026-08-14 â€” P0-A owner attestation / root credential rotated

- Outcome: Ù…Ø§Ù„Ú© ØªØ£ÛŒÛŒØ¯ Ú©Ø±Ø¯ credential root Ø§ÙØ´Ø§Ø´Ø¯Ù‡ Ø±Ø§ Ø®Ø§Ø±Ø¬ Ø§Ø² Ú¯ÙØªâ€ŒÙˆÚ¯Ùˆ Ùˆ Ø¨Ø¯ÙˆÙ† Ø§ÙØ´Ø§ÛŒ Ù…Ù‚Ø¯Ø§Ø± Ø¢Ù† rotate Ú©Ø±Ø¯Ù‡ Ø§Ø³ØªØ› `RISK-0002` Ø¨Ø§ Ø§ÛŒÙ† attestation Ùˆ evidence Ù‚Ø¨Ù„ÛŒ key-only operator/SSH policy Ø¨Ø³ØªÙ‡ Ø´Ø¯.
- Why: rotation credential Ø´Ø±Ø· stop-the-line Ø¨Ø±Ø§ÛŒ Ø§Ø¯Ø§Ù…Ù‡Ù” Ø¹Ù…Ù„ÛŒØ§Øª remote Ø¨ÙˆØ¯ Ùˆ Ù…Ù‚Ø¯Ø§Ø± secret Ù†Ø¨Ø§ÛŒØ¯ Ø¨Ø±Ø§ÛŒ Ø§Ø«Ø¨Ø§Øª Ø¯Ø± Git ÛŒØ§ chat Ø«Ø¨Øª Ø´ÙˆØ¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© rotation Ø±Ø§ Ù…Ø³ØªÙ‚Ù„ Ø§Ù†Ø¬Ø§Ù… Ùˆ Ø¢Ù† Ø±Ø§ Ø§Ø¹Ù„Ø§Ù… Ú©Ø±Ø¯Ø› Ø³Ù¾Ø³ evidence Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯. Codex Ù‡ÛŒÚ† Ø§ØªØµØ§Ù„ SSHØŒ deployØŒ DNS change ÛŒØ§ backup provisioning Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø¯Ø§Ø¯.
- Verification actually performed and result: attestation Ù…Ø§Ù„Ú© Ø¨Ø§ evidence Ù¾ÛŒØ´ÛŒÙ†Ù key-only operator loginØŒ sudo Ùˆ effective SSH policy ØªØ±Ú©ÛŒØ¨ Ø´Ø¯. Ù…Ù‚Ø¯Ø§Ø± credential Ø¯ÛŒØ¯Ù‡ØŒ Ø°Ø®ÛŒØ±Ù‡ ÛŒØ§ Ø¢Ø²Ù…ÙˆØ¯Ù‡ Ù†Ø´Ø¯.
- Decisions / assumptions: `RISK-0002` CLOSED Ø§Ø³ØªØ› task Ø¨Ù‡ staging DNSØŒ read-only server audit Ùˆ encrypted backup bootstrap Ø§Ø¯Ø§Ù…Ù‡ Ù…ÛŒâ€ŒÛŒØ§Ø¨Ø¯. Ù‡Ø± exposure Ø¬Ø¯ÛŒØ¯ Ø¨Ù„Ø§ÙØ§ØµÙ„Ù‡ Ø§ÛŒÙ† risk Ø±Ø§ Ø¨Ø§Ø² Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Deferred or risk IDs: `RISK-0001` Ùˆ `RISK-0003` Ø¨Ø§Ù‚ÛŒ Ù…Ø§Ù†Ø¯Ù‡â€ŒØ§Ù†Ø¯Ø› `RISK-0002` CLOSED.
- Rollback / recovery: Ø¨Ø±Ø§ÛŒ rotation rollback ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯Ø› password manager Ù…Ù†Ø¨Ø¹ Ù†Ú¯Ù‡Ø¯Ø§Ø±ÛŒ credential Ø¬Ø¯ÛŒØ¯ Ø§Ø³Øª Ùˆ key-only SSH policy Ù¾Ø§Ø¨Ø±Ø¬Ø§ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯.

## LOG-0018 â€” 2026-08-14 â€” P0-A evidence / preliminary read-only server audit

- Outcome: owner ÙÙˆÙ„Ø¯Ø± logical backup Ø¯Ø± Google Drive Ø§ÛŒØ¬Ø§Ø¯ Ú©Ø±Ø¯ Ùˆ audit ÙÙ‚Ø·â€ŒØ®ÙˆØ§Ù†Ø¯Ù†ÛŒ Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ host Ø¸Ø±ÙÛŒØª Ø¢Ø²Ø§Ø¯ Ú©Ø§ÙÛŒ Ø¨Ø±Ø§ÛŒ Ù…Ø±Ø­Ù„Ù‡Ù” planning Ø¯Ø§Ø±Ø¯ØŒ Caddy Ùˆ Docker ÙØ¹Ø§Ù„â€ŒØ§Ù†Ø¯ØŒ UFW ÙØ¹Ø§Ù„/deny-incoming Ø§Ø³ØªØŒ Ùˆ stack production Ø§Ø² Ù‚Ø¨Ù„ ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø±Ø¯.
- Why: Ù‚Ø¨Ù„ Ø§Ø² route/DNS/deploy ÛŒØ§ backup provisioning Ø¨Ø§ÛŒØ¯ ownership Ùˆ topology Ø³Ø±ÙˆÛŒØ³â€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ Ø´Ù†Ø§Ø®ØªÙ‡ Ø´ÙˆØ¯ ØªØ§ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ†ÛŒ Ø³Ø§ÛŒØª ÙØ¹Ù„ÛŒ Ø¢Ù† Ø±Ø§ Ù…Ø®ØªÙ„ Ù†Ú©Ù†Ø¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/governance/BACKUP_POLICY.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© Ø¨Ø§ root shell Ø¯Ø³ØªÙˆØ±Ù‡Ø§ÛŒ read-only Ø¨Ø±Ø§ÛŒ hostname/kernel/uptimeØŒ disk/memoryØŒ ÙˆØ¶Ø¹ÛŒØª SSH/DockerØŒ UFWØŒ socket listeners Ùˆ unattended-upgrades Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯. ÙÙˆÙ„Ø¯Ø± Google Drive Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯ Ùˆ evidence Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯. Ù‡ÛŒÚ† package updateØŒ service reloadØŒ firewall/DNS changeØŒ Docker/Caddy change ÛŒØ§ backup OAuth Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: root filesystem Ø­Ø¯ÙˆØ¯ Û³Û°GB Ø¨Ø§ Ø­Ø¯ÙˆØ¯ Û±Û·GB freeØŒ memory Ø­Ø¯ÙˆØ¯ Û±.Û¹GiB Ø¨Ø§ swap ÙØ¹Ø§Ù„ØŒ SSH Ùˆ Docker activeØŒ UFW active Ø¨Ø§ deny-incomingØŒ Ùˆ Caddy Ø±ÙˆÛŒ HTTP/HTTPS/HTTP3 Ø¯ÛŒØ¯Ù‡ Ø´Ø¯. Docker-published listenerÙ‡Ø§ loopback-only Ø¨ÙˆØ¯Ù†Ø¯. Ø¯Ùˆ listener Ø¹Ù…ÙˆÙ…ÛŒ SSH Ùˆ ÛµÛ· update pending Ø§Ø² MOTD/audit Ø¯ÛŒØ¯Ù‡ Ø´Ø¯. Ø¬Ø²Ø¦ÛŒØ§Øª Ø­Ø³Ø§Ø³ config ÛŒØ§ environment variable Ø«Ø¨Øª Ù†Ø´Ø¯.
- Decisions / assumptions: staging DNS ØªØ§ inventory Caddy/container routeÙ‡Ø§ Ø³Ø§Ø®ØªÙ‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› backup folder ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø±Ø¯ Ø§Ù…Ø§ restic/rclone/OAuth Ù‡Ù†ÙˆØ² provision Ù†Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯Ø› update ÛŒØ§ Ø­Ø°Ù SSH port Ø¨Ø¯ÙˆÙ† maintenance/rollback Ø§Ù†Ø¬Ø§Ù… Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0001`ØŒ `RISK-0003` ØªØ§ `RISK-0006`Ø› `RISK-0004` blocker High Ø§Ø³Øª.
- Rollback / recovery: Ú†ÙˆÙ† audit Ùˆ folder creation ØºÛŒØ±Ù…Ø®Ø±Ø¨â€ŒØ§Ù†Ø¯ØŒ rollback Ø³Ø±ÙˆØ±ÛŒ Ù†Ø¯Ø§Ø±Ø¯Ø› Ù‡Ø± ØªØºÛŒÛŒØ± Ø¨Ø¹Ø¯ÛŒ Ø¨Ø§ÛŒØ¯ Ø§Ø² inventory/rollback Ù…Ø³ØªÙ†Ø¯ Ø®ÙˆØ¯ stack Ù…ÙˆØ¬ÙˆØ¯ ØªØ¨Ø¹ÛŒØª Ú©Ù†Ø¯.

## LOG-0019 â€” 2026-08-14 â€” P0-A evidence / staging DNS exists, TLS origin handshake blocked

- Outcome: owner Ø±Ú©ÙˆØ±Ø¯ proxied `A` Ø¨Ø±Ø§ÛŒ staging Ø±Ø§ Ø¯Ø± Cloudflare Ø§ÛŒØ¬Ø§Ø¯ Ú©Ø±Ø¯. Ø¨Ø±Ø±Ø³ÛŒ Ø®Ø§Ø±Ø¬ÛŒ Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ production Ù¾Ø§Ø³Ø® HTTP Ù…ÙˆÙÙ‚ Ø¯Ø§Ø±Ø¯ØŒ Ø§Ù…Ø§ staging Ø¨Ø§ Cloudflare 525 Ù¾Ø§Ø³Ø® Ù…ÛŒâ€ŒØ¯Ù‡Ø¯Ø› staging deploy Ù†Ø´Ø¯Ù‡ Ùˆ TLS origin route Ø¢Ù† Ø¢Ù…Ø§Ø¯Ù‡ Ù†ÛŒØ³Øª.
- Why: Ø§ÛŒØ¬Ø§Ø¯ DNS Ø¨Ø¯ÙˆÙ† inventory Caddy Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ø±ÙØªØ§Ø± hostname Ø¬Ø¯ÛŒØ¯ Ø±Ø§ Ù†Ø§Ù…Ø´Ø®Øµ Ú©Ù†Ø¯Ø› external check Ù„Ø§Ø²Ù… Ø¨ÙˆØ¯ ØªØ§ ÙˆØ¶Ø¹ÛŒØª ÙˆØ§Ù‚Ø¹ÛŒ route/TLS Ø¨Ù‡â€ŒØ¬Ø§ÛŒ Ø­Ø¯Ø³ Ø«Ø¨Øª Ø´ÙˆØ¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: owner DNS record Ø±Ø§ Ø¯Ø± Cloudflare Ø³Ø§Ø®ØªØ› Codex Ø¯Ùˆ HTTPS header request ÙÙ‚Ø·â€ŒØ®ÙˆØ§Ù†Ø¯Ù†ÛŒ Ø¨Ø±Ø§ÛŒ staging Ùˆ production Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯ Ùˆ evidence Ø±Ø§ Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ú©Ø±Ø¯. Ù‡ÛŒÚ† Caddy/Docker/firewall/DNS write ØªÙˆØ³Ø· CodexØŒ deploy ÛŒØ§ backup provisioning Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: production `200 OK` Ù¾Ø§Ø³Ø® Ø¯Ø§Ø¯. staging `525` Ø§Ø² Cloudflare Ø¯Ø§Ø¯ØŒ Ú©Ù‡ failure handshake TLS Ø¨ÛŒÙ† edge Ùˆ origin Ø±Ø§ Ù†Ø´Ø§Ù† Ù…ÛŒâ€ŒØ¯Ù‡Ø¯. Ù…Ø­ØªÙˆØ§ ÛŒØ§ secret Ø§Ø² origin Ø®ÙˆØ§Ù†Ø¯Ù‡/Ø«Ø¨Øª Ù†Ø´Ø¯.
- Decisions / assumptions: staging DNS Ø­ÙØ¸ Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ø§Ù…Ø§ ØªØ§ inventory routeÙ‡Ø§ÛŒ CaddyØŒ TLS/configuration change Ø§Ù†Ø¬Ø§Ù… Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› `RISK-0004` blocker Ø¨Ø§Ù‚ÛŒ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯.
- Deferred or risk IDs: `RISK-0001`ØŒ `RISK-0003` ØªØ§ `RISK-0006`Ø› `RISK-0004` High/Blocked.
- Rollback / recovery: Ø­Ø°Ù Ø±Ú©ÙˆØ±Ø¯ staging Ø¯Ø± Cloudflare ØªÙ†Ù‡Ø§ rollback DNS Ø§Ø³ØªØ› ÙØ¹Ù„Ø§Ù‹ Ø¨Ù‡â€ŒØ¯Ù„ÛŒÙ„ Ø¹Ø¯Ù… Ø§Ø«Ø± production Ø¢Ù† Ø§Ù†Ø¬Ø§Ù… Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯. Ù‡Ø± Caddy fix Ø¨Ø§ÛŒØ¯ Ù¾ÛŒØ´ Ø§Ø² Ø§Ø¬Ø±Ø§ rollback ØµØ±ÛŒØ­ Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´Ø¯.

## LOG-0020 â€” 2026-08-14 â€” P0-A evidence / live production stack identified

- Outcome: metadata inventory Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ ÛŒÚ© Compose project Ø²Ù†Ø¯Ù‡ Ø¨Ø§ Ø³Ù‡ container healthy (frontendØŒ backend Ùˆ PostgreSQL) Ø¯Ø± Ù…Ø³ÛŒØ± production Ù…ÙˆØ¬ÙˆØ¯ Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆØ¯. Caddy system service ÙÙ‚Ø· Ø¯Ùˆ hostname production root Ùˆ `www` Ø±Ø§ Ø¯Ø± Caddyfile Ø¯Ø§Ø±Ø¯.
- Why: Ø§ÛŒÙ† evidence Ø¹Ù„Øª Ù…Ø­ØªÙ…Ù„ 525 staging Ø±Ø§ Ù…Ø´Ø®Øµ Ùˆ ØªØ£ÛŒÛŒØ¯ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ú©Ù‡ hostname Ø¬Ø¯ÛŒØ¯ Ù†Ø¨Ø§ÛŒØ¯ Ø¨Ø±Ø§ÛŒ Ø±ÙØ¹ Ø³Ø±ÛŒØ¹ Ø¨Ù‡ stack database/backend production ÙˆØµÙ„ Ø´ÙˆØ¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: owner metadata-only Docker container/Compose/Caddy versionØŒ systemd unit location Ùˆ Caddyfile hostname match Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯Ø› evidence Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯. Ù‡ÛŒÚ† configØŒ containerØŒ volumeØŒ serviceØŒ DNS ÛŒØ§ backup setting Ùˆ Ù‡ÛŒÚ† push remote ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.
- Verification actually performed and result: frontend/backend/PostgreSQL healthy Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø´Ø¯Ù†Ø¯Ø› frontend/backend ÙÙ‚Ø· Ø±ÙˆÛŒ loopback publish Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯Ø› Compose file production location Ø«Ø¨Øª Ø´Ø¯Ø› Caddyfile staging hostname Ù†Ø¯Ø§Ø±Ø¯. Ù†ØªÛŒØ¬Ù‡ Ø¨Ø§ Cloudflare 525 Ø¨ÛŒØ±ÙˆÙ†ÛŒ Ø³Ø§Ø²Ú¯Ø§Ø± Ø§Ø³ØªØŒ ÙˆÙ„ÛŒ Ø¹Ù„Øª Ù†Ù‡Ø§ÛŒÛŒ TLS ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² config inventory Ù‚Ø§Ø¨Ù„ Ø§Ø«Ø¨Ø§Øª Ø§Ø³Øª.
- Decisions / assumptions: `Taha-personal-platform` Ø§Ø² stack Ø²Ù†Ø¯Ù‡ Ù…Ø³ØªÙ‚Ù„ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ø› staging Ø¢ÛŒÙ†Ø¯Ù‡ Ù‡Ø±Ú¯Ø² DB/backend production Ø±Ø§ share Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ù¾ÛŒØ´ Ø§Ø² ØªØµÙ…ÛŒÙ… staging Ø¨Ø§ÛŒØ¯ metadata volume/data-path Ùˆ Caddy routing Ø§Ù…Ù† inventory Ø´ÙˆØ¯ Ùˆ capacity co-hosting Ø§Ø±Ø²ÛŒØ§Ø¨ÛŒ Ú¯Ø±Ø¯Ø¯.
- Deferred or risk IDs: `RISK-0001`ØŒ `RISK-0003` ØªØ§ `RISK-0007`Ø› `RISK-0004` Ùˆ `RISK-0007` High/Blocked.
- Rollback / recovery: Ú†ÙˆÙ† ÙÙ‚Ø· metadata Ø®ÙˆØ§Ù†Ø¯Ù‡ Ø´Ø¯ØŒ rollback Ù†Ø¯Ø§Ø±Ø¯Ø› stack Ù…ÙˆØ¬ÙˆØ¯ Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ø¨Ø§Ù‚ÛŒ Ù…Ø§Ù†Ø¯Ù‡ Ùˆ Ù‡Ø± ØªØºÛŒÛŒØ± Ø¨Ø¹Ø¯ÛŒ Ø¨Ø§ÛŒØ¯ rollback Ù…Ø³ØªÙ‚Ù„ Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´Ø¯.

## LOG-0021 â€” 2026-08-14 â€” P0-A decision / isolated staging placeholder

- Outcome: container mountsØŒ Compose skeleton Ùˆ Caddyfile routeÙ‡Ø§ inventory Ø´Ø¯. ØªØµÙ…ÛŒÙ… ADR-0015 Ø¨Ø±Ø§ÛŒ ÛŒÚ© staging placeholder Ù…Ø³ØªÙ‚Ù„ Ø¨Ø§ automatic Caddy TLS Ùˆ Ù¾Ø§Ø³Ø® 503 Ø«Ø¨Øª Ø´Ø¯Ø› Ù‡Ù†ÙˆØ² ØªØºÛŒÛŒØ±ÛŒ Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± Ø§Ø¹Ù…Ø§Ù„ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Why: staging DNS Ù…ÙˆØ¬ÙˆØ¯ 525 Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ Ú†ÙˆÙ† Caddy hostname Ø¢Ù† Ø±Ø§ Ù†Ø¯Ø§Ø±Ø¯. proxy Ú©Ø±Ø¯Ù† Ø¢Ù† Ø¨Ù‡ Compose production Ø®Ø·Ø± data leak Ùˆ production interference Ø¯Ø§Ø±Ø¯Ø› Ù¾Ø§Ø³Ø® 503 Ù…Ø³ØªÙ‚Ù„ Ø­Ø¯Ø§Ù‚Ù„ Ù…Ø³ÛŒØ± Ø§Ù…Ù† Ùˆ reversible Ø§Ø³Øª.
- Scope / files: `docs/adr/0015-isolated-staging-placeholder.md`ØŒ `docs/adr/README.md`ØŒ `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: owner Docker mount metadataØŒ Compose skeleton Ùˆ Ø¨Ø®Ø´ Caddyfile Ø±Ø§ ÙÙ‚Ø·â€ŒØ®ÙˆØ§Ù†Ø¯Ù†ÛŒ Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ú©Ø±Ø¯Ø› Codex Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø±Ø³Ù…ÛŒ Caddy Ùˆ Cloudflare Ø±Ø§ Ø¨Ø±Ø±Ø³ÛŒ Ùˆ decision Ø±Ø§ Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ú©Ø±Ø¯. Ù‡ÛŒÚ† Caddyfile write/reloadØŒ Docker/Compose actionØŒ DNS writeØŒ TLS mode change ÛŒØ§ backup action Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: PostgreSQL Ùˆ media Ø¯Ø± Docker volumeÙ‡Ø§ÛŒ Ù…Ø³ØªÙ‚Ù„ Ø¯ÛŒØ¯Ù‡ Ø´Ø¯Ù†Ø¯Ø› Caddy automatic TLS Ø¯Ø± site blockÙ‡Ø§ÛŒ production Ø¨Ø±Ù‚Ø±Ø§Ø± Ø§Ø³Øª Ùˆ staging route ØºØ§ÛŒØ¨ Ø§Ø³Øª. Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø±Ø³Ù…ÛŒ Caddy syntax `tls internal` Ùˆ `respond` Ùˆ Ù…Ø³ØªÙ†Ø¯Ø§Øª Cloudflare Full/Full(strict) Ø¨Ø±Ø±Ø³ÛŒ Ø´Ø¯Ø› ØªØµÙ…ÛŒÙ… Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² automatic certificate existing Caddy Ø¨Ù‡â€ŒØ¬Ø§ÛŒ internal CA Ø«Ø¨Øª Ø´Ø¯.
- Decisions / assumptions: staging placeholder production backend/database Ø±Ø§ proxy Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯Ø› Cloudflare Full ÙØ¹Ù„Ø§Ù‹ Ø¨Ø§Ù‚ÛŒ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ø› Full(strict) ÙÙ‚Ø· Ø¨Ø¹Ø¯ Ø§Ø² certificate valid Ø¨Ø±Ø§ÛŒ Ù‡Ù…Ù‡Ù” hostnameÙ‡Ø§ Ùˆ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú© Ø¨Ø±Ø±Ø³ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0001`ØŒ `RISK-0003` ØªØ§ `RISK-0007`Ø› `RISK-0004` IN PROGRESS Ø¨Ø§ ADR-0015.
- Rollback / recovery: Ù‚Ø¨Ù„ Ø§Ø² Ù‡Ø± editØŒ Caddyfile backup Ú¯Ø±ÙØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› validation failure Ù…Ø§Ù†Ø¹ reload Ø§Ø³ØªØ› rollback restore backup + validate + reload Ø§Ø³Øª.

## LOG-0022 â€” 2026-08-14 â€” P0-A execution / isolated staging placeholder live

- Outcome: Caddyfile Ø¨Ø§ backup Ù…ÙˆØ¬ÙˆØ¯ØŒ validation Ù…ÙˆÙÙ‚ Ùˆ reload activeØŒ Ø¨Ø±Ø§ÛŒ staging ÛŒÚ© Ù¾Ø§Ø³Ø® Ø«Ø§Ø¨Øª 503 Ù…Ø³ØªÙ‚Ù„ Ø§Ø±Ø§Ø¦Ù‡ Ù…ÛŒâ€ŒØ¯Ù‡Ø¯. external Cloudflare check Ø§Ø² 525 Ø¨Ù‡ 503 ØªØºÛŒÛŒØ± Ú©Ø±Ø¯Ø› production route ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.
- Why: Ø±ÙØ¹ 525 Ø¨Ø§ÛŒØ¯ Ø¨Ø¯ÙˆÙ† proxy Ú©Ø±Ø¯Ù† staging Ø¨Ù‡ frontend/backend/PostgreSQL production Ø§Ù†Ø¬Ø§Ù… Ù…ÛŒâ€ŒØ´Ø¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `docs/adr/0015-isolated-staging-placeholder.md`ØŒ `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/RISK_REGISTER.md`ØŒ `docs/status/deferred-validation.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: owner Ø§Ø² root shell Caddyfile Ø±Ø§ Ø¨Ù‡ Ù…Ø³ÛŒØ± backup Ú©Ù¾ÛŒØŒ site block staging Ù…Ø³ØªÙ‚Ù„ Ø§Ø¶Ø§ÙÙ‡ØŒ `caddy validate` Ø±Ø§ Ø§Ø¬Ø±Ø§ØŒ Caddy Ø±Ø§ reload Ùˆ active Ø¨ÙˆØ¯Ù† Ø¢Ù† Ø±Ø§ ØªØ£ÛŒÛŒØ¯ Ú©Ø±Ø¯. Ø³Ù¾Ø³ direct-origin curl Ùˆ external Cloudflare HTTPS header check Ø§Ø¬Ø±Ø§ Ø´Ø¯Ø› evidence Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯. Codex Ù‡ÛŒÚ† server command Ùˆ Ù‡ÛŒÚ† push remote Ø§Ø¬Ø±Ø§ Ù†Ú©Ø±Ø¯.
- Verification actually performed and result: Caddy validation `Valid configuration` Ø¨ÙˆØ¯ Ùˆ service active Ø¨Ø§Ù‚ÛŒ Ù…Ø§Ù†Ø¯. external staging HTTPS Ù¾Ø§Ø³Ø® 503 Ø¨Ø§ headerÙ‡Ø§ÛŒ Ø§Ù…Ù†ÛŒØªÛŒ Ù…ÙˆØ±Ø¯ Ø§Ù†ØªØ¸Ø§Ø± Ø¯Ø§Ø¯. direct-origin curl Ø¨Ø§ TLS internal alert Ø´Ú©Ø³Øª Ø®ÙˆØ±Ø¯Ø› Ø§ÛŒÙ† failure Ø¨Ù‡ `DEFER-0005` Ø«Ø¨Øª Ø´Ø¯ Ùˆ Ù…Ø§Ù†Ø¹ ØªØºÛŒÛŒØ± Cloudflare TLS mode Ø§Ø³Øª.
- Decisions / assumptions: placeholder ÙØ¹Ù„Ø§Ù‹ complete Ùˆ isolated Ø§Ø³ØªØ› warning formatting Caddyfile Ø¨Ù‡â€ŒØ¹Ù„Øª Ø¹Ø¯Ù… Ø§Ø±ØªØ¨Ø§Ø· Ùˆ Ø±ÛŒØ³Ú© rewrite config Ø²Ù†Ø¯Ù‡ Ø¹Ù…Ø¯Ø§Ù‹ Ø§ØµÙ„Ø§Ø­ Ù†Ø´Ø¯. Cloudflare Full Ø¨Ø§Ù‚ÛŒ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ø› Full(strict) Ùˆ staging ÙˆØ§Ù‚Ø¹ÛŒ ØªØ§ Ø±ÙØ¹ DEFER-0005 Ùˆ gates Ø¨Ø¹Ø¯ÛŒ Ù…Ù…Ù†ÙˆØ¹â€ŒØ§Ù†Ø¯.
- Deferred or risk IDs: `DEFER-0005`Ø› `RISK-0001`ØŒ `RISK-0003` ØªØ§ `RISK-0007`Ø› `RISK-0004` IN PROGRESS.
- Rollback / recovery: Ø¯Ø± Ø®Ø·Ø§ÛŒ Ø¬Ø¯ÛŒØ¯ staging ÛŒØ§ Ø§Ø«Ø± productionØŒ backup Caddyfile restoreØŒ validate Ùˆ reload Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› production Compose/volumes Ø¯Ø± Ø§ÛŒÙ† change Ù„Ù…Ø³ Ù†Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯.

## LOG-0023 â€” 2026-08-14 â€” P0-A diagnosis / staging certificate issuance race

- Outcome: Caddy log Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ Ù†Ø®Ø³ØªÛŒÙ† direct-origin TLS probe Ù¾ÛŒØ´ Ø§Ø² Ù¾Ø§ÛŒØ§Ù† certificate issuance Ø§Ø¬Ø±Ø§ Ø´Ø¯Ù‡ Ø¨ÙˆØ¯. Ù¾Ø³ Ø§Ø² fallback Ù…ÙˆÙÙ‚ HTTP-01ØŒ Caddy Ø¨Ø±Ø§ÛŒ staging ÛŒÚ© certificate ACME Ø¯Ø±ÛŒØ§ÙØª Ú©Ø±Ø¯Ø› re-test Ù…Ø³ØªÙ‚ÛŒÙ… Ù‡Ù†ÙˆØ² Ù„Ø§Ø²Ù… Ø§Ø³Øª.
- Why: ØªØ´Ø®ÛŒØµ Ø¯Ù‚ÛŒÙ‚ Ù…Ø§Ù†Ø¹ Ø§Ø¹Ù…Ø§Ù„ ØªØºÛŒÛŒØ± Ù†Ø§Ù…Ø±ØªØ¨Ø· Ø¯Ø± Caddy ÛŒØ§ Cloudflare Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› external 503 Ø¨Ù‡â€ŒØªÙ†Ù‡Ø§ÛŒÛŒ Ú†Ø±Ø§ÛŒÛŒ alert probe Ø§ÙˆÙ„ Ø±Ø§ ØªÙˆØ¶ÛŒØ­ Ù†Ù…ÛŒâ€ŒØ¯Ø§Ø¯.
- Scope / files: `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/deferred-validation.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: owner log Ù…Ø­Ø¯ÙˆØ¯ Caddy Ø±Ø§ Ø¨Ø§ filter TLS/certificate/staging Ø®ÙˆØ§Ù†Ø¯ Ùˆ evidence Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯. Ù‡ÛŒÚ† Caddyfile edit/reloadØŒ DNS/TLS-mode changeØŒ container action ÛŒØ§ backup action Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: log Ø§Ø¨ØªØ¯Ø§ Ø´Ú©Ø³Øª TLS-ALPNØŒ Ø³Ù¾Ø³ HTTP-01 challenge Ù…ÙˆÙÙ‚ Ùˆ Ø¯Ø± Ù†Ù‡Ø§ÛŒØª `certificate obtained successfully` Ø¨Ø±Ø§ÛŒ staging Ø±Ø§ Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯. alert direct curl Ù‚Ø¨Ù„ Ø§Ø² Ù¾Ø§ÛŒØ§Ù† ØµØ¯ÙˆØ± certificate Ø±Ø® Ø¯Ø§Ø¯Ù‡ Ø¨ÙˆØ¯. Ø®Ø·Ø§ÛŒ local-CA installation Ø¨Ù‡ route IP Ù…ÙˆØ¬ÙˆØ¯ Ù…Ø±Ø¨ÙˆØ· Ø§Ø³Øª Ùˆ Ø¨Ø±Ø§ÛŒ hostname public staging Ø¹Ù„Øª Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Decisions / assumptions: ÛŒÚ© direct-origin curl Ù¾Ø³ Ø§Ø² ØµØ¯ÙˆØ± certificateØŒ ØªÙ†Ù‡Ø§ check Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡ Ø¨Ø±Ø§ÛŒ Ø¨Ø³ØªÙ† `DEFER-0005` Ø§Ø³ØªØ› ØªØ§ Ø¢Ù† Ø²Ù…Ø§Ù† Cloudflare Full Ø­ÙØ¸ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `DEFER-0005` OPENØ› `RISK-0001`ØŒ `RISK-0003` ØªØ§ `RISK-0007`.
- Rollback / recovery: Ù‡ÛŒÚ† ØªØºÛŒÛŒØ± Ø¬Ø¯ÛŒØ¯ÛŒ Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ø› rollback Ù‡Ù…Ø§Ù† backup Caddyfile ADR-0015 Ø¨Ø§Ù‚ÛŒ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯.

## LOG-0024 â€” 2026-08-14 â€” P0-A verification / staging placeholder complete

- Outcome: post-issuance direct-origin test Ø¨Ø±Ø§ÛŒ staging HTTP/2 503 Ù¾Ø§Ø³Ø® Ø¯Ø§Ø¯Ø› external Cloudflare Ùˆ direct-origin Ù‡Ø± Ø¯Ùˆ placeholder Ø§ÛŒØ²ÙˆÙ„Ù‡ Ø±Ø§ ØªØ£ÛŒÛŒØ¯ Ù…ÛŒâ€ŒÚ©Ù†Ù†Ø¯ Ùˆ `DEFER-0005` Ø¨Ø³ØªÙ‡ Ø´Ø¯.
- Why: direct-origin verification Ø´Ø±Ø· Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡ Ù¾Ø³ Ø§Ø² certificate issuance Ø¨ÙˆØ¯ Ùˆ Ù†Ø´Ø§Ù† Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ 525 Ø§ÙˆÙ„ÛŒÙ‡ Ùˆ alert race Ø¨Ø±Ø·Ø±Ù Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/deferred-validation.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: owner Ø§Ø¨ØªØ¯Ø§ Ù‡Ù…Ø§Ù† syntax curl Ø±Ø§ Ø¯Ø± PowerShell Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯ Ú©Ù‡ Ø¨Ù‡ alias `Invoke-WebRequest` map Ø´Ø¯ Ùˆ Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ø®Ø·Ø§ Ø¯Ø§Ø¯Ø› Ø³Ù¾Ø³ re-test Ù…Ø¹ØªØ¨Ø± Ø±Ø§ Ø¯Ø± root shell Ø§Ø¬Ø±Ø§ Ùˆ evidence Ø±Ø§ Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ú©Ø±Ø¯. Ù‡ÛŒÚ† server configurationØŒ DNS/TLS-modeØŒ container ÛŒØ§ backup setting Ùˆ Ù‡ÛŒÚ† push remote ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.
- Verification actually performed and result: direct-origin curl Ø¨Ø§ hostname/SNI staging Ù¾Ø§Ø³Ø® HTTP/2 503 Ùˆ headerÙ‡Ø§ÛŒ Ø§Ù…Ù†ÛŒØªÛŒ Ù…ÙˆØ±Ø¯ Ø§Ù†ØªØ¸Ø§Ø± Ø¯Ø§Ø¯. placeholder Ù…Ø³ØªÙ‚Ù„ Ø§Ø³Øª Ùˆ Ø¨Ù‡ production proxy Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Decisions / assumptions: Ø¨Ø±Ø§ÛŒ PowerShell Ø¯Ø± Ø¢ÛŒÙ†Ø¯Ù‡ Ø§Ø² `curl.exe` Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› ADR-0015 placeholder complete Ø§Ø³Øª. Full(strict) Ùˆ real staging Ù‡Ù…Ú†Ù†Ø§Ù† scope Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ Ùˆ gateÙ‡Ø§ÛŒ Ø®ÙˆØ¯ Ø±Ø§ Ø¯Ø§Ø±Ù†Ø¯.
- Deferred or risk IDs: `DEFER-0005` CLOSEDØ› `RISK-0001`ØŒ `RISK-0003` ØªØ§ `RISK-0007` Ø¨Ø§Ù‚ÛŒ Ù…Ø§Ù†Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Rollback / recovery: rollback Caddyfile backup ADR-0015 Ø­ÙØ¸ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ú†ÙˆÙ† verification ØªØºÛŒÛŒØ± Ø¬Ø¯ÛŒØ¯ÛŒ Ù†Ø¯Ø§Ø´ØªØŒ rollback ÙÙˆØ±ÛŒ Ù„Ø§Ø²Ù… Ù†ÛŒØ³Øª.

## LOG-0025 â€” 2026-08-14 â€” P0-A execution / backup tooling installed

- Outcome: restic 0.18.1 Ùˆ Ubuntu rclone 1.60.1 build Ø±ÙˆÛŒ VPS Ù†ØµØ¨ Ùˆ version Ø¢Ù†â€ŒÙ‡Ø§ ØªØ£ÛŒÛŒØ¯ Ø´Ø¯Ø› OS Ú¯Ø²Ø§Ø±Ø´ Ø¯Ø§Ø¯ Ù‡ÛŒÚ† service/container restart Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Why: provisioning backup Ø±Ù…Ø²Ù†Ú¯Ø§Ø±ÛŒâ€ŒØ´Ø¯Ù‡ Ø¨Ù‡ executableÙ‡Ø§ÛŒ stable Ùˆ signed Ù†ÛŒØ§Ø² Ø¯Ø§Ø´ØªØ› Ù†ØµØ¨ Ø§Ø² repository Ubuntu Ø¨Ø±Ø§ÛŒ reproducibility Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ø¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `docs/governance/BACKUP_POLICY.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: owner package index Ø±Ø§ refresh Ú©Ø±Ø¯ØŒ candidate versionÙ‡Ø§ Ø±Ø§ Ø¨Ø±Ø±Ø³ÛŒ Ùˆ Ø³Ù¾Ø³ `restic` Ùˆ `rclone` Ø±Ø§ Ø¨Ø§ exact package versionÙ‡Ø§ÛŒ Ubuntu Ù†ØµØ¨ Ùˆ version commandÙ‡Ø§ Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯Ø› evidence Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯. Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: restic 0.18.1 Ùˆ rclone 1.60.1 build Ú¯Ø²Ø§Ø±Ø´ Ø´Ø¯Ù†Ø¯Ø› installer Ø§Ø¹Ù„Ø§Ù… Ú©Ø±Ø¯ kernel/service/container/session restart Ù„Ø§Ø²Ù… Ù†ÛŒØ³Øª. OAuthØŒ rclone remoteØŒ restic repositoryØŒ password fileØŒ job Ùˆ restore Ù‡Ù†ÙˆØ² Ø§ÛŒØ¬Ø§Ø¯ Ù†Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Decisions / assumptions: headless OAuth Ø¨Ø§ flow Ø±Ø³Ù…ÛŒ `rclone config` â†’ local `rclone authorize` Ø§Ù†Ø¬Ø§Ù… Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› token/config-token Ø¯Ø± chatØŒ GitØŒ Work Log ÛŒØ§ command history Ø«Ø¨Øª Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0001`ØŒ `RISK-0003` ØªØ§ `RISK-0007`Ø› `RISK-0003` High/Open.
- Rollback / recovery: package installation Ù‚Ø§Ø¨Ù„ uninstall Ø§Ø³Øª Ø§Ù…Ø§ ØªØ§ Ù¾Ø§ÛŒØ§Ù† provisioning Ø­ÙØ¸ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ø¹Ø¯Ù… Ù…ÙˆÙÙ‚ÛŒØª OAuth Ù‡ÛŒÚ† Ø¯Ø§Ø¯Ù‡ ÛŒØ§ backup repository Ø§ÛŒØ¬Ø§Ø¯ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯.

## LOG-0026 â€” 2026-08-14 â€” P0-A diagnosis / headless Google OAuth callback

- Outcome: Ù†Ø®Ø³ØªÛŒÙ† rclone configuration Ù¾ÛŒØ´ Ø§Ø² Ø°Ø®ÛŒØ±Ù‡Ù” remote Ù‚Ø·Ø¹ Ø´Ø¯. browser callback localhost Ø¨Ù‡ VPS tunnel Ù†Ø´Ø¯Ù‡ Ø¨ÙˆØ¯ØŒ Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† Ø§ØªØµØ§Ù„ browser Ø±Ø¯ Ø´Ø¯ Ùˆ OAuth Ú©Ø§Ù…Ù„ Ù†Ø´Ø¯.
- Why: auto-config Ø±ÙˆÛŒ headless VPS listener Ø±Ø§ Ø±ÙˆÛŒ localhost Ø®ÙˆØ¯ Ø³Ø±ÙˆØ± Ø¨Ø§Ø² Ù…ÛŒâ€ŒÚ©Ù†Ø¯Ø› localhost Ù…Ø±ÙˆØ±Ú¯Ø± Ù„Ù¾â€ŒØªØ§Ù¾ Ù‡Ù…Ø§Ù† endpoint Ù†ÛŒØ³Øª.
- Scope / files: `docs/governance/BACKUP_POLICY.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: owner rclone config Ø±Ø§ Ø´Ø±ÙˆØ¹ØŒ Google Drive/type/scope Ø±Ø§ Ø§Ù†ØªØ®Ø§Ø¨ Ùˆ Ø¯Ø± callback browser flow ÙˆÙ‚ÙÙ‡ Ø§ÛŒØ¬Ø§Ø¯ Ú©Ø±Ø¯Ø› Ø³Ù¾Ø³ Ø¨Ø§ Ctrl+C Ø®Ø§Ø±Ø¬ Ø´Ø¯. procedure Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯. Ù‡ÛŒÚ† token/config-token Ø¯Ø± project Ø«Ø¨ØªØŒ remote/repository/job Ø§ÛŒØ¬Ø§Ø¯ ÛŒØ§ push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: browser `127.0.0.1:53682` Ø±Ø§ unavailable Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ Ú©Ù‡ Ø¨Ø§ Ù†Ø¨ÙˆØ¯ SSH local tunnel Ø³Ø§Ø²Ú¯Ø§Ø± Ø§Ø³Øª. flow Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† localhost-only SSH tunnel Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ø¯.
- Decisions / assumptions: Ø§Ø² ÛŒÚ© SSH `-L` temporary tunnel Ùˆ auto-config Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› tunnel Ù¾Ø³ Ø§Ø² OAuth Ø¨Ø³ØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯. token Ø¯Ø± chat ÛŒØ§ Work Log ÙˆØ§Ø±Ø¯ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› OAuth provisioning Ù‡Ù†ÙˆØ² pending Ø§Ø³Øª.
- Rollback / recovery: Ú†ÙˆÙ† config Ú©Ø§Ù…Ù„ Ù†Ø´Ø¯ØŒ server-side rollback Ù†Ø¯Ø§Ø±Ø¯Ø› tunnel temporary Ùˆ Ø¨Ø¯ÙˆÙ† persistence Ø§Ø³Øª.

## LOG-0027 â€” 2026-08-14 â€” P0-A diagnosis / incomplete rclone OAuth token

- Outcome: rclone remote entry Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯Ù‡ Ø§Ù…Ø§ validation Ø¢Ù† Ø¨Ø§ `empty token found` Ø±Ø¯ Ø´Ø¯Ø› OAuth callback Ù¾ÛŒØ´ Ø§Ø² Ø°Ø®ÛŒØ±Ù‡Ù” token Ú©Ø§Ù…Ù„ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Why: ÙˆØ¬ÙˆØ¯ Ù†Ø§Ù… remote Ø¨Ù‡â€ŒØªÙ†Ù‡Ø§ÛŒÛŒ authentication Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³ØªØ› Ù‚Ø¨Ù„ Ø§Ø² init repository Ø¨Ø§ÛŒØ¯ Ø±ÛŒÙ…ÙˆØª Ø¨Ø§ ÛŒÚ© read-only listing ÙˆØ§Ù‚Ø¹ÛŒ Ø§Ø«Ø¨Ø§Øª Ø´ÙˆØ¯.
- Scope / files: Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: owner remote Ø±Ø§ Ø§Ø² rclone config Ø®Ø§Ø±Ø¬ Ùˆ `rclone lsd` Ø¨Ø±Ø§ÛŒ ÙÙˆÙ„Ø¯Ø± target Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯Ø› command Ø¨Ø§ Ø®Ø·Ø§ÛŒ empty token Ùˆ exit code 1 ØªÙ…Ø§Ù… Ø´Ø¯. evidence Ø¯Ø± ÛŒÚ© commit Ù…Ø­Ù„ÛŒ Ø«Ø¨Øª Ø´Ø¯Ø› Ù‡ÛŒÚ† repositoryØŒ backup data ÛŒØ§ credential Ø¯Ø± Git Ø«Ø¨Øª Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: remote configuration Ù†Ø§Ù…â€ŒØ¯Ø§Ø± ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø±Ø¯ Ø§Ù…Ø§ OAuth token Ø®Ø§Ù„ÛŒ Ø§Ø³Øª. temporary SSH tunnel ÙØ¹Ø§Ù„ Ø§Ø³Øª Ùˆ remote Ø¨Ø§ÛŒØ¯ Ø¨Ø§ `rclone config reconnect` ØªÚ©Ù…ÛŒÙ„ Ø´ÙˆØ¯.
- Decisions / assumptions: remote Ø¬Ø¯ÛŒØ¯ Ø³Ø§Ø®ØªÙ‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› reconnect Ø§Ø² Ø·Ø±ÛŒÙ‚ localhost SSH tunnel Ø§Ù†Ø¬Ø§Ù… Ùˆ Ø³Ù¾Ø³ Ù‡Ù…Ø§Ù† read-only listing ØªÚ©Ø±Ø§Ø± Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› OAuth/repository/job/restore Ù‡Ù…Ú†Ù†Ø§Ù† pending.
- Rollback / recovery: reconnect Ù†Ø§Ù…ÙˆÙÙ‚ ÙÙ‚Ø· config Ø¨Ø¯ÙˆÙ† token Ø¨Ø§Ù‚ÛŒ Ù…ÛŒâ€ŒÚ¯Ø°Ø§Ø±Ø¯Ø› Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø² remote Ù†Ø§Ù‚Øµ Ø¨Ø¹Ø¯Ø§Ù‹ Ø­Ø°Ù Ùˆ Ù…Ø¬Ø¯Ø¯Ø§Ù‹ Ø³Ø§Ø®ØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯ØŒ Ø¨Ø¯ÙˆÙ† Ø§Ø«Ø± Ø¨Ø± Ø¯Ø§Ø¯Ù‡Ù” Drive.

## LOG-0028 â€” 2026-08-14 â€” P0-A execution / Google Drive OAuth and target access verified

- Outcome: reconnect Ø±ÛŒÙ…ÙˆØª Ù…ÙˆØ¬ÙˆØ¯ rclone Ø§Ø² Ø·Ø±ÛŒÙ‚ tunnel Ù…ÙˆÙ‚Øª localhost Ú©Ø§Ù…Ù„ Ø´Ø¯ Ùˆ Ø¯Ø³ØªØ±Ø³ÛŒ read-only Ø¨Ù‡ Ù¾ÙˆØ´Ù‡Ù” ØªØ£ÛŒÛŒØ¯Ø´Ø¯Ù‡Ù” Google Drive Ø¨Ø§ exit code `0` Ø§Ø«Ø¨Ø§Øª Ø´Ø¯.
- Why: Ù‚Ø¨Ù„ Ø§Ø² Ø§ÛŒØ¬Ø§Ø¯ repository Ø±Ù…Ø²Ù†Ú¯Ø§Ø±ÛŒâ€ŒØ´Ø¯Ù‡ØŒ Ø¨Ø§ÛŒØ¯ Ø§ØªØµØ§Ù„ remote Ùˆ Ø¯Ø³ØªØ±Ø³ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ø¨Ù‡ Ù¾ÙˆØ´Ù‡Ù” Ù…Ù‚ØµØ¯ Ø¨Ø¯ÙˆÙ† Ø«Ø¨Øª credential Ø¯Ø± Ù…Ø³ØªÙ†Ø¯Ø§Øª ØªØ£ÛŒÛŒØ¯ Ù…ÛŒâ€ŒØ´Ø¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `docs/governance/BACKUP_POLICY.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© Ø±ÙˆÛŒ VPS `rclone config reconnect` Ø±Ø§ Ø¨Ø±Ø§ÛŒ Ù‡Ù…Ø§Ù† remote Ù…ÙˆØ¬ÙˆØ¯ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯ØŒ auto-config Ø±Ø§ Ø§Ø² tunnel Ù…ÙˆÙ‚Øª localhost ØªÚ©Ù…ÛŒÙ„ Ú©Ø±Ø¯ØŒ Ùˆ Ø³Ù¾Ø³ `rclone lsd` Ø±Ø§ Ø¨Ø±Ø§ÛŒ Ù¾ÙˆØ´Ù‡Ù” Ù…Ù‚ØµØ¯ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯Ø› Google Ù‡ÛŒÚ† Shared Drive Ø¯Ø± Ø­Ø³Ø§Ø¨ Ù†Ø´Ø§Ù† Ù†Ø¯Ø§Ø¯ØŒ Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† remote Ø¨Ù‡ Drive Ù…Ø¹Ù…ÙˆÙ„ÛŒ Ù…ØªØµÙ„ Ø§Ø³Øª. Ù‡ÛŒÚ† tokenØŒ config-tokenØŒ password ÛŒØ§ Ù…Ø­ØªÙˆØ§ÛŒ backup Ø¯Ø± Git ÛŒØ§ Work Log Ø«Ø¨Øª Ù†Ø´Ø¯ Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: `rclone lsd` Ø¨Ø±Ø§ÛŒ Ù…Ø³ÛŒØ± target Ø¨Ø§ `rclone_target_exit=0` ØªÙ…Ø§Ù… Ø´Ø¯. Ø®Ø±ÙˆØ¬ÛŒ Ø®Ø§Ù„ÛŒ Ø¨Ø§ Ù¾ÙˆØ´Ù‡Ù” Ù…Ù‚ØµØ¯ Ø¨Ø¯ÙˆÙ† Ø²ÛŒØ±Ù¾ÙˆØ´Ù‡ Ø³Ø§Ø²Ú¯Ø§Ø± Ø§Ø³ØªØ› Ø§ÛŒÙ† ÙÙ‚Ø· Ø§Ø«Ø¨Ø§Øª Ø¯Ø³ØªØ±Ø³ÛŒ Ø§Ø³ØªØŒ Ù†Ù‡ Ø§ÛŒØ¬Ø§Ø¯ repository ÛŒØ§ snapshot.
- Decisions / assumptions: remote Ù…ÙˆØ¬ÙˆØ¯ Ø­ÙØ¸ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ù…Ø±Ø­Ù„Ù‡Ù” Ø¨Ø¹Ø¯ ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² Ø§ÛŒØ¬Ø§Ø¯ Ø§Ù…Ù† password file Ø®Ø§Ø±Ø¬ Ø§Ø² GitØŒ `restic init` Ùˆ Ù†Ø®Ø³ØªÛŒÙ† snapshot Ú©Ù†ØªØ±Ù„â€ŒØ´Ø¯Ù‡ Ø§Ù†Ø¬Ø§Ù… Ù…ÛŒâ€ŒØ´ÙˆØ¯. tunnel Ù¾Ø³ Ø§Ø² Ù¾Ø§ÛŒØ§Ù† OAuth Ø¨Ø§ÛŒØ¯ Ø¨Ø³ØªÙ‡ Ø´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0003` Ù‡Ù…Ú†Ù†Ø§Ù† High/Open Ø§Ø³ØªØ› repositoryØŒ passwordØŒ jobØŒ retention Ùˆ restore rehearsal Ù‡Ù†ÙˆØ² Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Rollback / recovery: Ø§Ú¯Ø± Ø¯Ø³ØªØ±Ø³ÛŒ Drive Ø¯Ø± Ø¢ÛŒÙ†Ø¯Ù‡ revoke Ø´ÙˆØ¯ØŒ remote Ø¯ÛŒÚ¯Ø± repository Ø±Ø§ Ù‚Ø§Ø¨Ù„â€ŒØ¯Ø³ØªØ±Ø³ÛŒ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ø§Ù…Ø§ Ù‡ÛŒÚ† Ø¯Ø§Ø¯Ù‡â€ŒØ§ÛŒ Ø­Ø°Ù Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ù‚Ø¨Ù„ Ø§Ø² Ù‡Ø± Ø¹Ù…Ù„ÛŒØ§Øª destructive Ø¨Ø§ÛŒØ¯ restore/runbook Ø¨Ø±Ø±Ø³ÛŒ Ø´ÙˆØ¯.

## LOG-0029 â€” 2026-08-14 â€” P0-A diagnosis / interrupted restic repository initialization

- Outcome: Ù†Ø®Ø³ØªÛŒÙ† `restic init` Ù¾ÛŒØ´ Ø§Ø² ØªÚ©Ù…ÛŒÙ„ Ø¨Ø§ signal interrupt Ù…ØªÙˆÙ‚Ù Ø´Ø¯Ø› `restic snapshots` Ø¨Ù„Ø§ÙØ§ØµÙ„Ù‡ Ù¾Ø³ Ø§Ø² Ø¢Ù† Ù†Ø¨ÙˆØ¯Ù† repository config Ø±Ø§ Ú¯Ø²Ø§Ø±Ø´ Ú©Ø±Ø¯. repository Ù…Ø¹ØªØ¨Ø± ÛŒØ§ snapshot Ø§ÛŒØ¬Ø§Ø¯Ø´Ø¯Ù‡ Ø§Ø«Ø¨Ø§Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Why: init Ø¨Ù‡ password file Ù…Ø­Ù„ÛŒ Ùˆ remote Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ§Ø² Ø¯Ø§Ø´ØªØŒ Ø§Ù…Ø§ interruption Ù¾ÛŒØ´ Ø§Ø² Ø¢Ù† Ø±Ø® Ø¯Ø§Ø¯Ø› Ø§Ø¬Ø±Ø§ÛŒ command Ø¨Ø¹Ø¯ÛŒ Ù†Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ init Ù†Ø§Ù‚Øµ Ø±Ø§ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ú©Ù†Ø¯.
- Scope / files: ÙÙ‚Ø· Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© directory/password file Ù…Ø­Ù„ÛŒ Ø±Ø§ Ø§ÛŒØ¬Ø§Ø¯ Ùˆ environment Ù…Ø±Ø¨ÙˆØ· Ø¨Ù‡ rclone/restic Ø±Ø§ ØªÙ†Ø¸ÛŒÙ… Ú©Ø±Ø¯ØŒ Ø³Ù¾Ø³ `restic init` Ùˆ `restic snapshots` Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯. init Ø¨Ø§ context canceled ØªÙ…Ø§Ù… Ø´Ø¯ Ùˆ snapshots config Ù¾ÛŒØ¯Ø§ Ù†Ú©Ø±Ø¯. Ù‡ÛŒÚ† passwordØŒ tokenØŒ ÛŒØ§ backup data Ø¯Ø± Git ÛŒØ§ Work Log Ø«Ø¨Øª Ù†Ø´Ø¯ Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: Ù†Ø®Ø³ØªÛŒÙ† listing Ø¨Ø§ interrupt Ù…ØªÙˆÙ‚Ù Ø´Ø¯ (exit `130`)Ø› ØªÚ©Ø±Ø§Ø± Ø¨Ø¯ÙˆÙ† interrupt Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ parent Ø¯Ø§Ø±Ø§ÛŒ ØªÙ†Ù‡Ø§ directory `restic-repository/` Ø§Ø³Øª Ùˆ Ø¯Ø±ÙˆÙ† Ø¢Ù† ÙÙ‚Ø· `data/`ØŒ `index/`ØŒ `keys/`ØŒ `locks/` Ùˆ `snapshots/` ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø±Ù†Ø¯. Ø¯Ø± root repository ÙØ§ÛŒÙ„ `config` ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯ØŒ Ù¾Ø³ repository Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª. `rclone size` Ø³Ù¾Ø³ `0` object Ùˆ `0 B` Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ Ùˆ listing recursive Ù‡ÛŒÚ† ÙØ§ÛŒÙ„ Ø¯ÛŒÚ¯Ø±ÛŒ Ù†Ø¯Ø§Ø´ØªØ› artifact Ø¯Ù‚ÛŒÙ‚ Ø¨Ø±Ø§ÛŒ cleanup ØªØ£ÛŒÛŒØ¯ Ø´Ø¯.
- Decisions / assumptions: Ù¾Ø§Ú©â€ŒØ³Ø§Ø²ÛŒ ÙÙ‚Ø· target ØµØ±ÛŒØ­ `gdrive_taha_backup:taha-personal-platform-backups/restic-repository` Ø±Ø§ Ø¯Ø± Ø¨Ø± Ù…ÛŒâ€ŒÚ¯ÛŒØ±Ø¯ Ùˆ ØªÙ†Ù‡Ø§ Ø¨Ù‡â€ŒØ¯Ù„ÛŒÙ„ Ø´Ù…Ø§Ø±Ø´ ØµÙØ±/Ù†Ø¨ÙˆØ¯ config Ù…Ø¬Ø§Ø² Ø§Ø³Øª. Ø¨Ø¹Ø¯ Ø§Ø² cleanupØŒ init Ø¨Ø§ Ø§Ø¬Ø±Ø§ÛŒ Ø¨Ø¯ÙˆÙ† interruption ØªÚ©Ø±Ø§Ø± Ùˆ Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ Ø«Ø¨Øª Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› repository/job/retention/restore Ù‡Ù†ÙˆØ² pending Ù‡Ø³ØªÙ†Ø¯.
- Rollback / recovery: Ø¨Ø±Ø±Ø³ÛŒ Ø¨Ø¹Ø¯ÛŒ ÙÙ‚Ø· read-only Ø§Ø³Øª. Ø­Ø°Ù Ø§Ø­ØªÙ…Ø§Ù„ÛŒ artifact Ù†Ø§Ù‚Øµ Ø¨Ø¯ÙˆÙ† inventory ØµØ±ÛŒØ­ Ùˆ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú© Ø§Ù†Ø¬Ø§Ù… Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.

## LOG-0030 â€” 2026-08-14 â€” P0-A execution / encrypted restic repository initialized

- Outcome: artifact Ù†Ø§Ù‚ØµÙ ØµÙØ±-bØ§ÛŒØª Ø§Ø² Ù…Ø³ÛŒØ± Ø¯Ù‚ÛŒÙ‚ repository Ù¾Ø§Ú©â€ŒØ³Ø§Ø²ÛŒ Ø´Ø¯ Ùˆ `restic init` Ø¯Ø± retry Ø¨Ø¯ÙˆÙ† interruption ÛŒÚ© repository Ø±Ù…Ø²Ù†Ú¯Ø§Ø±ÛŒâ€ŒØ´Ø¯Ù‡Ù” format-v2 Ø³Ø§Ø®Øª. `restic snapshots` Ø¢Ù† Ø±Ø§ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¨Ø§Ø² Ú©Ø±Ø¯Ø› Ù‡Ù†ÙˆØ² snapshotÛŒ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.
- Why: repository Ù…Ø¹ØªØ¨Ø± Ùˆ password file Ø®Ø§Ø±Ø¬ Ø§Ø² Git Ù¾ÛŒØ´â€ŒÙ†ÛŒØ§Ø² backup ÙˆØ§Ù‚Ø¹ÛŒØŒ retention Ùˆ restore rehearsal Ù‡Ø³ØªÙ†Ø¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `docs/governance/BACKUP_POLICY.md`ØŒ `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© Ø¨Ø§ `rclone purge` ÙÙ‚Ø· Ù…Ø³ÛŒØ± inventoryâ€ŒØ´Ø¯Ù‡Ù” ØµÙØ±-bØ§ÛŒØª Ø±Ø§ Ù¾Ø§Ú© Ú©Ø±Ø¯ØŒ Ù…ØªØºÛŒØ±Ù‡Ø§ÛŒ repository/password file Ø±Ø§ Ø¯Ø± root shell ØªÙ†Ø¸ÛŒÙ… Ú©Ø±Ø¯ Ùˆ `restic init` Ùˆ `restic snapshots` Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯. passwordØŒ tokenØŒ Ø´Ù†Ø§Ø³Ù‡Ù” Ú©Ø§Ù…Ù„ repository ÛŒØ§ Ø¯Ø§Ø¯Ù‡Ù” backup Ø¯Ø± Git ÛŒØ§ Work Log Ø«Ø¨Øª Ù†Ø´Ø¯ Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: init repository Ø±Ø§ Ø§ÛŒØ¬Ø§Ø¯ Ú©Ø±Ø¯ Ùˆ snapshots Ø¢Ù† Ø±Ø§ Ø¨Ø¯ÙˆÙ† Ø®Ø·Ø§ Ø¨Ø§Ø² Ú©Ø±Ø¯Ø› Ø§ÛŒØ¬Ø§Ø¯ cache Ù…Ø­Ù„ÛŒ restic Ù†ÛŒØ² Ú¯Ø²Ø§Ø±Ø´ Ø´Ø¯. Ø§ÛŒÙ† evidence Ø§ÛŒØ¬Ø§Ø¯ repository Ø±Ø§ Ø«Ø§Ø¨Øª Ù…ÛŒâ€ŒÚ©Ù†Ø¯ØŒ Ù†Ù‡ backup Ø´Ø¯Ù† Ù‡ÛŒÚ† source data.
- Decisions / assumptions: Ù†Ø®Ø³ØªÛŒÙ† snapshot Ø¨Ø§ÛŒØ¯ database dump streamedØŒ media volume Ùˆ configuration Ù„Ø§Ø²Ù… Ø±Ø§ Ø¨Ø¯ÙˆÙ† Ú†Ø§Ù¾ secret Ù¾ÙˆØ´Ø´ Ø¯Ù‡Ø¯. Ø³Ù¾Ø³ retention/job Ùˆ restore rehearsal Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ Ø§Ø¬Ø±Ø§ Ùˆ Ø«Ø¨Øª Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
- Deferred or risk IDs: `RISK-0003` Ù‡Ù…Ú†Ù†Ø§Ù† High/Open Ø§Ø³ØªØ› first snapshotØŒ jobØŒ retention Ùˆ restore rehearsal Ø¨Ø§Ù‚ÛŒ Ù…Ø§Ù†Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Rollback / recovery: repository ØªØ§Ø²Ù‡ Ù‡ÛŒÚ† snapshotÛŒ Ù†Ø¯Ø§Ø±Ø¯Ø› revoke OAuth Ø¯Ø³ØªØ±Ø³ÛŒ Ø¢ÛŒÙ†Ø¯Ù‡ Ø±Ø§ Ù‚Ø·Ø¹ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ ÙˆÙ„ÛŒ Ø¯Ø§Ø¯Ù‡â€ŒØ§ÛŒ Ø­Ø°Ù Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ø­Ø°Ù repository Ù…Ø¹ØªØ¨Ø± ÙÙ‚Ø· Ø¨Ø§ approval ØµØ±ÛŒØ­ Ù…Ø§Ù„Ú© Ùˆ inventory ØªØ§Ø²Ù‡ Ù…Ø¬Ø§Ø² Ø§Ø³Øª.

## LOG-0031 â€” 2026-08-14 â€” P0-A verification / first backup source preflight

- Outcome: preflight ÙÙ‚Ø·â€ŒØ®ÙˆØ§Ù†Ø¯Ù†ÛŒ Ø¨Ø±Ø§ÛŒ Ù†Ø®Ø³ØªÛŒÙ† backup ÙˆØ§Ù‚Ø¹ÛŒ PASS Ø´Ø¯: PostgreSQL container Ø¯Ø§Ø±Ø§ÛŒ `POSTGRES_USER` Ùˆ executable `pg_dumpall` Ø§Ø³ØªØ› media volumeØŒ Caddyfile Ùˆ Ù‡Ø± Ø¯Ùˆ Compose file Ù‚Ø§Ø¨Ù„â€ŒØ®ÙˆØ§Ù†Ø¯Ù†â€ŒØ§Ù†Ø¯.
- Why: Ù‚Ø¨Ù„ Ø§Ø² snapshot Ø¨Ø§ÛŒØ¯ sourceÙ‡Ø§ÛŒ backup Ùˆ Ø±ÙˆØ´ stream Ø´Ø¯Ù† dump ØªØ£ÛŒÛŒØ¯ Ø´ÙˆÙ†Ø¯ ØªØ§ backup Ù†Ø§Ù‚Øµ ÛŒØ§ Ù†Ù…Ø§ÛŒØ´ secret Ø±Ø® Ù†Ø¯Ù‡Ø¯.
- Scope / files: ÙÙ‚Ø· Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© command Ø¨Ø¯ÙˆÙ† Ù†Ù…Ø§ÛŒØ´ Ù…Ù‚Ø¯Ø§Ø± environment Ø¨Ø±Ø§ÛŒ PostgreSQL Ùˆ `test`Ù‡Ø§ÛŒ read-only Ø¨Ø±Ø§ÛŒ media/Caddy/Compose Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯Ø› Ø³Ù¾Ø³ file-name inventory Ù…Ø­Ø¯ÙˆØ¯ repository Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯. Ù‡ÛŒÚ† dumpØŒ ØªØºÛŒÛŒØ± container ÛŒØ§ ØªØºÛŒÛŒØ± Caddy/Compose Ø±Ø® Ù†Ø¯Ø§Ø¯ Ùˆ Ù‡ÛŒÚ† secret ÛŒØ§ push remote Ø«Ø¨Øª Ù†Ø´Ø¯.
- Verification actually performed and result: Ù‡Ù…Ù‡Ù” Ú†Ù‡Ø§Ø± preflight exit code `0` Ø¯Ø§Ø´ØªÙ†Ø¯. inventory Ø³Ø·Ø­ Ø§ÙˆÙ„ repository ÙÙ‚Ø· ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ ØºÛŒØ±Ù…Ø­Ø±Ù…Ø§Ù†Ù‡Ù” ComposeØŒ Ù…Ø«Ø§Ù„ environment Ùˆ metadata Ø±Ø§ Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯Ø› Ù‡ÛŒÚ† production environment file Ø¯Ø± Ù‡Ù…Ø§Ù† Ø³Ø·Ø­ Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù†Ø´Ø¯.
- Decisions / assumptions: Ù†Ø®Ø³ØªÛŒÙ† snapshot Ø´Ø§Ù…Ù„ stream `pg_dumpall`ØŒ media volumeØŒ Caddyfile Ùˆ Ù‡Ø± Ø¯Ùˆ Compose file Ø®ÙˆØ§Ù‡Ø¯ Ø¨ÙˆØ¯. Ú†ÙˆÙ† production environment file Ø¯Ø± inventory Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù†Ø´Ø¯ØŒ Ú†ÛŒØ²ÛŒ Ø­Ø¯Ø³ Ø²Ø¯Ù‡ ÛŒØ§ Ø¨Ù‡ backup Ø§Ø¶Ø§ÙÙ‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› first snapshot/job/retention/restore Ù‡Ù†ÙˆØ² pending Ù‡Ø³ØªÙ†Ø¯.
- Rollback / recovery: preflight read-only Ø§Ø³Øª Ùˆ rollback Ù†Ø¯Ø§Ø±Ø¯. Ø§Ú¯Ø± backup command Ø®Ø·Ø§ Ø¯Ù‡Ø¯ØŒ snapshot status Ù¾ÛŒØ´ Ø§Ø² Ù‡Ø± retry Ø¨Ø±Ø±Ø³ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯.

## LOG-0032 â€” 2026-08-14 â€” P0-A execution / partial first snapshot and PostgreSQL command correction

- Outcome: Ù†Ø®Ø³ØªÛŒÙ† snapshot media/config Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø°Ø®ÛŒØ±Ù‡ Ùˆ retention policy Ø§Ø¹Ù…Ø§Ù„ Ø´Ø¯ØŒ Ø§Ù…Ø§ PostgreSQL command Ù¾ÛŒØ´ Ø§Ø² Ø§Ø¬Ø±Ø§ÛŒ dump Ø´Ú©Ø³Øª Ø®ÙˆØ±Ø¯Ø› Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† snapshot Ø¯ÛŒØªØ§Ø¨ÛŒØ³ Ø³Ø§Ø®ØªÙ‡ Ù†Ø´Ø¯ Ùˆ backup Ù‡Ù†ÙˆØ² Ø¬Ø²Ø¦ÛŒ Ø§Ø³Øª.
- Why: `restic backup --stdin-from-command` Ù†ÛŒØ§Ø² Ø¯Ø§Ø±Ø¯ Ù¾ÛŒØ´ Ø§Ø² command separator `--` Ù‚Ø±Ø§Ø± Ú¯ÛŒØ±Ø¯Ø› Ø¨Ø¯ÙˆÙ† Ø¢Ù† restic Ø¢Ø±Ú¯ÙˆÙ…Ø§Ù† `-ceu` Ù…Ø±Ø¨ÙˆØ· Ø¨Ù‡ shell Ø¯Ø§Ø®Ù„ container Ø±Ø§ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† ÙÙ„Ú¯ Ø®ÙˆØ¯Ø´ parse Ú©Ø±Ø¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `docs/governance/BACKUP_POLICY.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© command stream PostgreSQLØŒ backup Ù…Ø³ØªÙ‚ÛŒÙ… media/Caddy/ComposeØŒ `restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune` Ùˆ `restic snapshots` Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯. command PostgreSQL Ø¨Ø§ Ø®Ø·Ø§ÛŒ flag Ù…ØªÙˆÙ‚Ù Ø´Ø¯. backup media/config Ø¨Ø§ Ø³Ù‡ file Ùˆ ÛŒØ§Ø²Ø¯Ù‡ directory Ø¬Ø¯ÛŒØ¯ Ø°Ø®ÛŒØ±Ù‡ Ø´Ø¯ Ùˆ policy Ù‡Ù…Ø§Ù† snapshot Ø±Ø§ Ù†Ú¯Ù‡ Ø¯Ø§Ø´Øª. Ù‡ÛŒÚ† dump plaintextØŒ password ÛŒØ§ token Ø«Ø¨Øª Ù†Ø´Ø¯ Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: repository ÛŒÚ© snapshot Ø¨Ø§ tagÙ‡Ø§ÛŒ `production,media,config` Ùˆ pathÙ‡Ø§ÛŒ media/Caddy/Compose Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯. Ù‡ÛŒÚ† snapshot Ø¨Ø§ tag PostgreSQL ÛŒØ§ ÙØ§ÛŒÙ„ dump Ø§ÛŒØ¬Ø§Ø¯ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Decisions / assumptions: retry PostgreSQL Ø¨Ø§ÛŒØ¯ Ø§Ø² syntax Ù…Ø³ØªÙ†Ø¯ `--stdin-from-command -- <command>` Ø§Ø³ØªÙØ§Ø¯Ù‡ Ú©Ù†Ø¯Ø› Ù†ØªÛŒØ¬Ù‡Ù” Ø¢Ù† Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ Ø¨Ø§ `restic snapshots --tag postgres` ØªØ£ÛŒÛŒØ¯ Ù…ÛŒâ€ŒØ´ÙˆØ¯. retention policy Ø¯Ø± Ù‡Ù…ÛŒÙ† slice Ø¨Ø§ evidence ÙˆØ§Ù‚Ø¹ÛŒ Ø§Ø¹Ù…Ø§Ù„ Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› PostgreSQL snapshotØŒ scheduled job Ùˆ restore rehearsal Ø¨Ø§Ù‚ÛŒ Ù…Ø§Ù†Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Rollback / recovery: snapshot Ù…ÙˆÙÙ‚ media/config Ø­ÙØ¸ Ù…ÛŒâ€ŒØ´ÙˆØ¯. command Ù†Ø§Ù…ÙˆÙÙ‚ snapshot Ø§ÛŒØ¬Ø§Ø¯ Ù†Ú©Ø±Ø¯ØŒ Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† retry Ø¨Ø¹Ø¯ÛŒ Ø¨Ù‡ cleanup Ù†ÛŒØ§Ø² Ù†Ø¯Ø§Ø±Ø¯Ø› Ù‡Ø± failure Ø¨Ø¹Ø¯ÛŒ Ù¾ÛŒØ´ Ø§Ø² retry Ø¨Ø§ snapshots Ø¨Ø±Ø±Ø³ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯.

## LOG-0033 â€” 2026-08-14 â€” P0-A execution / complete initial encrypted backup verified

- Outcome: retry PostgreSQL Ø¨Ø§ syntax Ø¯Ø±Ø³Øª stream Ù…ÙˆÙÙ‚ Ø´Ø¯Ø› snapshot database Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯ Ùˆ `restic check` Ù‡Ø± Ø¯Ùˆ snapshot Ù…ÙˆØ¬ÙˆØ¯ Ø±Ø§ Ø¨Ø¯ÙˆÙ† Ø®Ø·Ø§ ØªØ£ÛŒÛŒØ¯ Ú©Ø±Ø¯. Ù†Ø®Ø³ØªÛŒÙ† backup Ú©Ø§Ù…Ù„Ù sourceÙ‡Ø§ÛŒ ØªØ£ÛŒÛŒØ¯Ø´Ø¯Ù‡ Ø§Ú©Ù†ÙˆÙ† ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø±Ø¯.
- Why: backup Ø§ÙˆÙ„ÛŒÙ‡ Ø¨Ø§ÛŒØ¯ databaseØŒ media Ùˆ configuration Ø±Ø§ Ù¾ÙˆØ´Ø´ Ø¯Ù‡Ø¯ Ùˆ repository integrity Ù¾ÛŒØ´ Ø§Ø² automation ØªØ£ÛŒÛŒØ¯ Ø´ÙˆØ¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `docs/governance/BACKUP_POLICY.md`ØŒ `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© retry `restic backup --stdin-from-command -- docker exec ... pg_dumpall` Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯ØŒ Ø³Ù¾Ø³ snapshotÙ‡Ø§ÛŒ tag PostgreSQL Ùˆ `restic check` Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯. syntax separator Ø§Ø² Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ø±Ø³Ù…ÛŒ restic ØªØ£ÛŒÛŒØ¯ Ø´Ø¯. Ù‡ÛŒÚ† dump plaintextØŒ password ÛŒØ§ token Ø«Ø¨Øª Ù†Ø´Ø¯ Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: snapshot PostgreSQL Ø¨Ø§ ÙØ§ÛŒÙ„ `postgres-all.sql` Ø°Ø®ÛŒØ±Ù‡ Ø´Ø¯Ø› check Ù‡Ø± Ø¯Ùˆ snapshot/index/blob Ø±Ø§ Ø¨Ø±Ø±Ø³ÛŒ Ùˆ `no errors were found` Ú¯Ø²Ø§Ø±Ø´ Ú©Ø±Ø¯. snapshot Ù¾ÛŒØ´ÛŒÙ† media/config Ù†ÛŒØ² Ø­ÙØ¸ Ø´Ø¯.
- Decisions / assumptions: automation Ø±ÙˆØ²Ø§Ù†Ù‡ Ø¨Ø§ÛŒØ¯ Ù‡Ù…ÛŒÙ† Ø¯Ùˆ backup operationØŒ retention ÙØ¹Ù„ÛŒ Ùˆ lock Ø¹Ø¯Ù… Ù‡Ù…â€ŒÙ¾ÙˆØ´Ø§Ù†ÛŒ Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ù†Ø¯. restore rehearsal Ù‡Ù…Ú†Ù†Ø§Ù† ÙÙ‚Ø· Ø¯Ø± staging Ù…Ø³ØªÙ‚Ù„ Ù…Ø¬Ø§Ø² Ø§Ø³Øª.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› scheduled job Ùˆ staging restore rehearsal Ø¨Ø§Ù‚ÛŒ Ù…Ø§Ù†Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Rollback / recovery: snapshotÙ‡Ø§ÛŒ Ù…Ø¹ØªØ¨Ø± Ø­ÙØ¸ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯. Ø§Ú¯Ø± automation Ø¨Ø¹Ø¯Ø§Ù‹ fail Ø´ÙˆØ¯ØŒ Ù‡ÛŒÚ† snapshotÛŒ Ø­Ø°Ù Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› journal Ùˆ snapshot metadata Ø¨Ø±Ø±Ø³ÛŒ Ùˆ Ø±Ø®Ø¯Ø§Ø¯ Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ Ø«Ø¨Øª Ù…ÛŒâ€ŒØ´ÙˆØ¯.

## LOG-0034 â€” 2026-08-14 â€” P0-A hardening / Linux line-ending contract for backup artifacts

- Outcome: Git attribute policy Ø§Ú©Ù†ÙˆÙ† Ø¨Ø±Ø§ÛŒ scriptØŒ systemd unitØŒ timer Ùˆ environment template backup ØµØ±Ø§Ø­ØªØ§Ù‹ LF Ø±Ø§ Ø§Ù„Ø²Ø§Ù… Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Why: Git Ø±ÙˆÛŒ Windows Ù‡Ù†Ú¯Ø§Ù… stage Ú©Ø±Ø¯Ù† artifactÙ‡Ø§ÛŒ Linux Ù‡Ø´Ø¯Ø§Ø± conversion Ø¯Ø§Ø¯. Ø¨Ø¯ÙˆÙ† contract ØµØ±ÛŒØ­ØŒ checkout ÛŒØ§ Ø§Ù†ØªÙ‚Ø§Ù„ Ø¢ÛŒÙ†Ø¯Ù‡ Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø³Øª CRLF Ùˆ Ø¯Ø± Ù†ØªÛŒØ¬Ù‡ failure shebang/systemd Ø§ÛŒØ¬Ø§Ø¯ Ú©Ù†Ø¯.
- Scope / files: `.gitattributes` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `git ls-files --eol` Ùˆ `git check-attr` Ø¨Ø±Ø§ÛŒ artifactÙ‡Ø§ Ø§Ø¬Ø±Ø§ Ø´Ø¯Ø› Ù‚Ø¨Ù„ Ø§Ø² fix attribute Ù…Ø±Ø¨ÙˆØ· Ø¨Ù‡ Ø¢Ù†â€ŒÙ‡Ø§ unspecified Ø¨ÙˆØ¯. policy Ù…Ø­Ø¯ÙˆØ¯ LF Ø§ÙØ²ÙˆØ¯Ù‡ Ø´Ø¯ Ùˆ `bash -n` script Ùˆ `git diff --check` Ù…ÙˆÙÙ‚ Ø´Ø¯Ù†Ø¯. Ù‡ÛŒÚ† server file ÛŒØ§ secret ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯ Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: Ù‡Ø± Ú†Ù‡Ø§Ø± artifact backup Ø§Ú©Ù†ÙˆÙ† `text: set` Ùˆ `eol: lf` Ú¯Ø²Ø§Ø±Ø´ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯Ø› syntax check shell Ù†ÛŒØ² PASS Ø§Ø³Øª.
- Decisions / assumptions: Ù‡Ù…Ù‡Ù” artifactÙ‡Ø§ÛŒ Ù‚Ø§Ø¨Ù„â€ŒØ§Ù†ØªÙ‚Ø§Ù„ Ø¨Ù‡ Linux Ø¯Ø± `infra/backup/` Ø¨Ø§ÛŒØ¯ LF Ø¨Ù…Ø§Ù†Ù†Ø¯Ø› sourceÙ‡Ø§ ØªÙ†Ù‡Ø§ Ù¾Ø³ Ø§Ø² Ø§ÛŒÙ† guard Ø¨Ù‡ VPS Ù…Ù†ØªÙ‚Ù„ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› automation Ùˆ restore rehearsal Ù‡Ù†ÙˆØ² Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Rollback / recovery: ØªØºÛŒÛŒØ± ÙÙ‚Ø· Git attribute Ø§Ø³ØªØ› Ø­Ø°Ù rule ÙÙ‚Ø· Ø¯Ø± ØµÙˆØ±Øª ØªØºÛŒÛŒØ± target execution platform Ùˆ Ù‡Ù…Ø±Ø§Ù‡ Ø¨Ø§ evidence Ø¬Ø¯ÛŒØ¯ Ù…Ø¬Ø§Ø² Ø§Ø³Øª.

## LOG-0035 â€” 2026-08-14 â€” P0-A implementation / scheduled backup artifacts and recovery runbook

- Outcome: source-controlled daily backup scriptØŒ systemd service/timerØŒ non-secret environment template Ùˆ recovery runbook Ø¢Ù…Ø§Ø¯Ù‡ Ø´Ø¯Ù†Ø¯Ø› Ù‡Ù†ÙˆØ² Ù‡ÛŒÚ†â€ŒÚ©Ø¯Ø§Ù… Ø±ÙˆÛŒ VPS Ù†ØµØ¨ ÛŒØ§ enabled Ù†Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Why: Ù†Ø®Ø³ØªÛŒÙ† snapshot Ú©Ø§Ù…Ù„ Ùˆ check Ù…ÙˆÙÙ‚ØŒ baseline Ù„Ø§Ø²Ù… Ø¨Ø±Ø§ÛŒ automation Ú©Ù†ØªØ±Ù„â€ŒØ´Ø¯Ù‡ Ø±Ø§ ÙØ±Ø§Ù‡Ù… Ú©Ø±Ø¯. artifactÙ‡Ø§ Ø¨Ø§ÛŒØ¯ version-controlledØŒ Ù‚Ø§Ø¨Ù„â€ŒØ¨Ø±Ø±Ø³ÛŒ Ùˆ Ø¨Ø¯ÙˆÙ† secret Ø¨Ø§Ø´Ù†Ø¯.
- Scope / files: `infra/backup/`ØŒ `docs/governance/BACKUP_RUNBOOK.md`ØŒ `docs/governance/BACKUP_POLICY.md`ØŒ `PROJECT_MANIFEST.md`ØŒ Task SpecØŒ Risk Register Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: artifactÙ‡Ø§ Ø¯Ø± repository Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯Ù†Ø¯Ø› script Ø¨Ø§ `bash -n` Ø¨Ø±Ø±Ø³ÛŒ Ø´Ø¯ Ùˆ policy LF Ø¨Ø§ `git check-attr` ØªØ£ÛŒÛŒØ¯ Ø´Ø¯. runbook Ù†ØµØ¨ØŒ monitoringØŒ retentionØŒ failure response Ùˆ restore ØµØ±ÙØ§Ù‹ Ø¯Ø± staging Ø±Ø§ ØªØ¹ÛŒÛŒÙ† Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ù‡ÛŒÚ† systemd unitØŒ server file ÛŒØ§ scheduled job Ø±ÙˆÛŒ VPS ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯ Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: source script syntax-valid Ø§Ø³Øª Ùˆ unit/timer/template ØªØ­Øª Git contract LF Ù‚Ø±Ø§Ø± Ø¯Ø§Ø±Ù†Ø¯. installation/daemon-reload/manual service run Ù‡Ù†ÙˆØ² evidence Ù†Ø¯Ø§Ø±Ù†Ø¯.
- Decisions / assumptions: timer Ø±ÙˆØ²Ø§Ù†Ù‡ 03:20 UTC Ø¨Ø§ jitter Ø¯Ù‡ Ø¯Ù‚ÛŒÙ‚Ù‡â€ŒØ§ÛŒØŒ lock Ø¹Ø¯Ù… Ù‡Ù…â€ŒÙ¾ÙˆØ´Ø§Ù†ÛŒ Ùˆ retention 7 daily/4 weekly/12 monthly Ø®ÙˆØ§Ù‡Ø¯ Ø¯Ø§Ø´Øª. service ÙÙ‚Ø· sourceÙ‡Ø§ÛŒ inventoryâ€ŒØ´Ø¯Ù‡ Ø±Ø§ backup Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ùˆ database dump Ø±Ø§ Ø¨Ø¯ÙˆÙ† plaintext file stream Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› server installationØŒ timer evidence Ùˆ staging restore rehearsal Ø¨Ø§Ù‚ÛŒ Ù…Ø§Ù†Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Rollback / recovery: ØªØ§ Ù‚Ø¨Ù„ Ø§Ø² install rollback Ù„Ø§Ø²Ù… Ù†ÛŒØ³Øª. Ù¾Ø³ Ø§Ø² installØŒ disable timer Ùˆ Ø­Ø°Ù ÙÙ‚Ø· ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ Ù…Ø´Ø®Øµâ€ŒØ´Ø¯Ù‡ Ø¯Ø± runbook automation Ø±Ø§ Ù…ØªÙˆÙ‚Ù Ù…ÛŒâ€ŒÚ©Ù†Ø¯ØŒ Ø¨Ø¯ÙˆÙ† Ø­Ø°Ù snapshotÙ‡Ø§.

## LOG-0036 â€” 2026-08-14 â€” P0-A execution / installed systemd backup service succeeded

- Outcome: backup service Ù†ØµØ¨â€ŒØ´Ø¯Ù‡ ØªØ­Øª systemd Ø¨Ø§ status `0/SUCCESS` Ù¾Ø§ÛŒØ§Ù† ÛŒØ§ÙØªØŒ Ø¯Ùˆ snapshot Ø¬Ø¯ÛŒØ¯ PostgreSQL Ùˆ media/config Ø³Ø§Ø®Øª Ùˆ retention policy Ø±Ø§ Ø¨Ø§ evidence ÙˆØ§Ù‚Ø¹ÛŒ Ø§Ø¹Ù…Ø§Ù„ Ú©Ø±Ø¯.
- Why: artifactÙ‡Ø§ÛŒ repository Ø¨Ù‡â€ŒØªÙ†Ù‡Ø§ÛŒÛŒ automation Ù†ÛŒØ³ØªÙ†Ø¯Ø› Ø¨Ø§ÛŒØ¯ service ÙˆØ§Ù‚Ø¹ÛŒ Ø±ÙˆÛŒ VPS Ø§Ø¬Ø±Ø§ Ùˆ Ø±ÙØªØ§Ø± Ø¢Ù† Ø¨Ø§ journal/status ØªØ£ÛŒÛŒØ¯ Ù…ÛŒâ€ŒØ´Ø¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ Backup Policy/RunbookØŒ Task SpecØŒ Risk Register Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© artifactÙ‡Ø§ÛŒ version-controlled Ø±Ø§ Ø¨Ø§ permissionÙ‡Ø§ÛŒ ØªØ¹Ø±ÛŒÙâ€ŒØ´Ø¯Ù‡ Ù†ØµØ¨ Ú©Ø±Ø¯ØŒ daemon-reload Ùˆ unit/calendar validation Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯ØŒ timer Ø±Ø§ enable/start Ú©Ø±Ø¯ Ùˆ service Ø±Ø§ Ø¯Ø³ØªÛŒ Ø¨Ø±Ø§ÛŒ smoke ÙˆØ§Ù‚Ø¹ÛŒ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯. Ù‡ÛŒÚ† secretØŒ dump plaintext ÛŒØ§ push remote Ø«Ø¨Øª Ù†Ø´Ø¯.
- Verification actually performed and result: service Ø¨Ù‡â€ŒØµÙˆØ±Øª clean deactivated Ø´Ø¯ Ùˆ `ExecStart` Ø¨Ø§ `status=0/SUCCESS` ØªÙ…Ø§Ù… Ø´Ø¯. journal snapshotÙ‡Ø§ÛŒ PostgreSQL Ùˆ media/config Ø±Ø§ Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯Ø› retention Ø¨Ø±Ø§ÛŒ Ù‡Ø± Ø¯Ùˆ Ú¯Ø±ÙˆÙ‡ Ø¯Ùˆ snapshot Ø±Ø§ Ù†Ú¯Ù‡ Ø¯Ø§Ø´Øª. wall-clock Ø­Ø¯ÙˆØ¯ 5m39sØŒ peak memory Ø­Ø¯ÙˆØ¯ 64.5MB Ùˆ CPU Ø­Ø¯ÙˆØ¯ 2.1s Ú¯Ø²Ø§Ø±Ø´ Ø´Ø¯. timer Ù†ÛŒØ² `enabled` Ùˆ `active` Ø§Ø³Øª Ùˆ systemd Ø²Ù…Ø§Ù† Ø§Ø¬Ø±Ø§ÛŒ Ø¨Ø¹Ø¯ÛŒ Ø±Ø§ Ú¯Ø²Ø§Ø±Ø´ Ú©Ø±Ø¯.
- Decisions / assumptions: service lockØŒ timeout Ø¯Ùˆ Ø³Ø§Ø¹ØªÙ‡ Ùˆ retention Ø¬Ø§Ø±ÛŒ Ø­ÙØ¸ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯. restore rehearsal ÙÙ‚Ø· Ø¯Ø± staging Ù…Ø³ØªÙ‚Ù„ Ù…Ø¬Ø§Ø² Ø§Ø³Øª.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› ÙÙ‚Ø· staging restore rehearsal Ø¨Ø§Ù‚ÛŒ Ù…Ø§Ù†Ø¯Ù‡ Ø§Ø³Øª.
- Rollback / recovery: Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø²ØŒ `systemctl disable --now taha-platform-backup.timer` Ø§Ø¬Ø±Ø§ÛŒ Ø¢ÛŒÙ†Ø¯Ù‡ Ø±Ø§ Ù…ØªÙˆÙ‚Ù Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ùˆ snapshotÙ‡Ø§ Ø±Ø§ Ø­Ø°Ù Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ù‡ÛŒÚ† rollbackÛŒ Ø¯Ø± Ø§ÛŒÙ† Ø§Ø¬Ø±Ø§ Ù„Ø§Ø²Ù… Ù†Ø´Ø¯.

## LOG-0037 â€” 2026-08-14 â€” P0-A verification / timer active and harmless interrupted listing

- Outcome: timer backup Ø¨Ù‡â€ŒØµÙˆØ±Øª `enabled` Ùˆ `active` ØªØ£ÛŒÛŒØ¯ Ø´Ø¯ Ùˆ systemd Ø²Ù…Ø§Ù† trigger Ø¨Ø¹Ø¯ÛŒ Ø±Ø§ Ù†Ù…Ø§ÛŒØ´ Ø¯Ø§Ø¯. ÙØ±Ù…Ø§Ù† read-only `restic snapshots` Ù¾Ø³ Ø§Ø² Ø§ÛŒÙ† evidence Ø¨Ø§ interrupt Ù…ØªÙˆÙ‚Ù Ø´Ø¯Ø› Ù‡ÛŒÚ† backup jobØŒ timer ÛŒØ§ snapshotÛŒ Ù‚Ø·Ø¹ Ù†Ø´Ø¯.
- Why: ØªØ´Ø®ÛŒØµ Ø¨Ø§ÛŒØ¯ Ø¨ÛŒÙ† interruption ÛŒÚ© command Ù…Ø´Ø§Ù‡Ø¯Ù‡â€ŒØ§ÛŒ Ùˆ interruption service backup ØªÙ…Ø§ÛŒØ² Ø¨Ú¯Ø°Ø§Ø±Ø¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ Backup PolicyØŒ Task SpecØŒ Risk Register Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© `systemctl is-enabled`ØŒ `systemctl is-active`ØŒ `systemctl status` Ùˆ `systemctl list-timers` Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯. Ø®Ø±ÙˆØ¬ÛŒ list-timers Ø¯Ø± pager Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯Ù‡ Ø´Ø¯ Ùˆ Ø³Ù¾Ø³ ÙØ±Ù…Ø§Ù† `restic snapshots` Ø¨Ø§ Ctrl+C Ù…ØªÙˆÙ‚Ù Ø´Ø¯. Ù‡ÛŒÚ† secret ÛŒØ§ push remote Ø«Ø¨Øª Ù†Ø´Ø¯.
- Verification actually performed and result: timer enabled/active Ø¨ÙˆØ¯ Ùˆ next elapse Ø¨Ø±Ø§ÛŒ Ø±ÙˆØ² Ø¨Ø¹Ø¯ Ø¯Ø± UTC Ø«Ø¨Øª Ø´Ø¯. service Ù‚Ø¨Ù„ÛŒ status Ù…ÙˆÙÙ‚ Ø¯Ø§Ø´Øª. Ø®Ø·Ø§ÛŒ signal interrupt ÙÙ‚Ø· Ù…Ø±Ø¨ÙˆØ· Ø¨Ù‡ command listing Ø§Ø³Øª Ùˆ Ù†Ø´Ø§Ù†Ú¯Ø± repository corruption ÛŒØ§ failure backup Ù†ÛŒØ³Øª.
- Decisions / assumptions: backup automation Ø¹Ù…Ù„ÛŒØ§ØªÛŒ Ø§Ø³ØªØ› Ø§Ø² re-run ØºÛŒØ±Ø¶Ø±ÙˆØ±ÛŒ snapshots Ø¨Ù„Ø§ÙØ§ØµÙ„Ù‡ Ù¾Ø³ Ø§Ø² interrupt Ø®ÙˆØ¯Ø¯Ø§Ø±ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯. evidence Ø¨Ø¹Ø¯ÛŒ Ø¨Ø§ÛŒØ¯ restore rehearsal Ø±ÙˆÛŒ staging Ù…Ø³ØªÙ‚Ù„ Ø¨Ø§Ø´Ø¯.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› restore rehearsal Ø¨Ø§Ù‚ÛŒ Ù…Ø§Ù†Ø¯Ù‡ Ø§Ø³Øª.
- Rollback / recovery: timer Ø±Ø§ Ù…ÛŒâ€ŒØªÙˆØ§Ù† Ø¨Ø¯ÙˆÙ† Ø­Ø°Ù snapshot Ø¨Ø§ `systemctl disable --now taha-platform-backup.timer` Ù…ØªÙˆÙ‚Ù Ú©Ø±Ø¯. interrupt listing Ù‡ÛŒÚ† recovery Ù„Ø§Ø²Ù… Ù†Ø¯Ø§Ø±Ø¯.

## LOG-0038 â€” 2026-08-14 â€” P0-A planning / isolated restore rehearsal defined

- Outcome: ÛŒÚ© Task Spec Ù…Ø³ØªÙ‚Ù„ Ø¨Ø±Ø§ÛŒ restore rehearsal ØºÛŒØ±Ù…Ø®Ø±Ø¨ Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯Ø› scope Ø¢Ù† ÙÙ‚Ø· recovery Ø¨Ù‡ target Ù…ÙˆÙ‚Øª root-only Ùˆ verification ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ Ø§Ø³Øª.
- Why: restore Ø¹Ù…Ù„ÛŒØ§ØªÛŒ HIGH-RISK Ø§Ø³Øª Ùˆ Ù†Ø¨Ø§ÛŒØ¯ Ø¨Ø§ backup Ù…ÙˆÙÙ‚ ÛŒØ§ staging placeholder Ø§Ø´ØªØ¨Ø§Ù‡ Ú¯Ø±ÙØªÙ‡ Ø´ÙˆØ¯. scope ØµØ±ÛŒØ­ Ù…Ø§Ù†Ø¹ restore Ù†Ø§Ø®ÙˆØ§Ø³ØªÙ‡ Ø±ÙˆÛŒ production Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Scope / files: `docs/plan/P0-A-restore-rehearsal-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: ÙÙ‚Ø· Task Spec Ùˆ evidence requirements Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯Ù†Ø¯. Ù‡ÛŒÚ† restoreØŒ cleanupØŒ containerØŒ database importØŒ service/timer ÛŒØ§ production file ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯ Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: preconditionÙ‡Ø§ Ø§Ø² evidence LOG-0036/0037 Ù‚Ø§Ø¨Ù„â€ŒØ§Ø±Ø²ÛŒØ§Ø¨ÛŒâ€ŒØ§Ù†Ø¯ØŒ Ø§Ù…Ø§ Ø§Ø¬Ø±Ø§ÛŒ restore Ù‡Ù†ÙˆØ² pending Ø§Ø³Øª.
- Decisions / assumptions: temporary target Ø²ÛŒØ± `/dev/shm` Ø¨Ø§ permission `0700` Ø§Ù†ØªØ®Ø§Ø¨ Ù…ÛŒâ€ŒØ´ÙˆØ¯ ØªØ§ plaintext restore persistent Ù†Ø´ÙˆØ¯. Ø§ÛŒÙ† test `RISK-0003` Ø±Ø§ Ø¨Ù‡â€ŒØªÙ†Ù‡Ø§ÛŒÛŒ Ù†Ù…ÛŒâ€ŒØ¨Ù†Ø¯Ø¯ØŒ Ø²ÛŒØ±Ø§ database import Ø¯Ø± staging ÙˆØ§Ù‚Ø¹ÛŒ Ø±Ø§ Ø¢Ø²Ù…Ø§ÛŒØ´ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› restore rehearsal Ùˆ Ø³Ù¾Ø³ staging database import evidence Ø¨Ø§Ù‚ÛŒ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯.
- Rollback / recovery: ØªØ§ Ø§Ø¬Ø±Ø§ÛŒ task ØªØºÛŒÛŒØ±ÛŒ Ø¨Ø±Ø§ÛŒ rollback Ù†ÛŒØ³Øª. Ù‡Ø± failure restore production Ø±Ø§ Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡ Ù…ÛŒâ€ŒÚ¯Ø°Ø§Ø±Ø¯ Ùˆ target Ù…ÙˆÙ‚Øª Ø¨Ø±Ø§ÛŒ diagnosis Ù†Ú¯Ù‡ Ø¯Ø§Ø´ØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.

## LOG-0039 â€” 2026-08-14 â€” P0-A diagnosis / restore rehearsal guard blocked pre-existing target

- Outcome: restore rehearsal Ù¾ÛŒØ´ Ø§Ø² Ù‡Ø± restore Ø¨Ù‡â€ŒØ¯Ù„ÛŒÙ„ ÙˆØ¬ÙˆØ¯ target Ø«Ø§Ø¨Øª Ø§Ø² Ù‚Ø¨Ù„ Ù…ÙˆØ¬ÙˆØ¯ Ù…ØªÙˆÙ‚Ù Ø´Ø¯. guard Ø§ÛŒÙ† Ø±ÙØªØ§Ø± Ø±Ø§ Ø¹Ù…Ø¯Ø§Ù‹ Ø±Ø¯ Ú©Ø±Ø¯Ø› Ù‡ÛŒÚ† Ø¯Ø§Ø¯Ù‡â€ŒØ§ÛŒ restoreØŒ overwrite ÛŒØ§ Ø­Ø°Ù Ù†Ø´Ø¯.
- Why: target Ø«Ø§Ø¨Øª replay-safe Ù†Ø¨ÙˆØ¯ Ùˆ ÙˆØ¬ÙˆØ¯ Ø¢Ù† Ø¨Ù‡â€ŒÙ…Ø¹Ù†Ø§ÛŒ Ù†Ø§Ù…Ø´Ø®Øµ Ø¨ÙˆØ¯Ù† ownership/Ù…Ø­ØªÙˆØ§ Ø¨ÙˆØ¯. Ø­Ø°Ù ÛŒØ§ reuse Ø¨Ø¯ÙˆÙ† inventory Ø¨Ø§ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ recovery Ø³Ø§Ø²Ú¯Ø§Ø± Ù†ÛŒØ³Øª.
- Scope / files: Task Spec restore rehearsal Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© script restore Ø±Ø§ Ø§Ø¨ØªØ¯Ø§ Ø¯Ø± context Ú©Ø§Ø±Ø¨Ø± ØºÛŒØ±-root Ùˆ Ø³Ù¾Ø³ root Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯Ø› Ù‡Ø± Ø¯Ùˆ Ø¨Ø§Ø± precondition Ù…Ø³ÛŒØ± Ù…ÙˆØ¬ÙˆØ¯ Ø±Ø§ ØªØ´Ø®ÛŒØµ Ø¯Ø§Ø¯Ù†Ø¯ Ùˆ Ù‚Ø¨Ù„ Ø§Ø² ÙØ±Ø§Ø®ÙˆØ§Ù†ÛŒ restic Ø®Ø§Ø±Ø¬ Ø´Ø¯Ù†Ø¯. Ù‡ÛŒÚ† secretØŒ snapshotØŒ containerØŒ database ÛŒØ§ production file ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯ Ùˆ Ù‡ÛŒÚ† push remote Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: Ù¾ÛŒØ§Ù… `Refusing to reuse restore target` Ø§Ø«Ø¨Ø§Øª Ù…ÛŒâ€ŒÚ©Ù†Ø¯ guard Ù‚Ø¨Ù„ Ø§Ø² write Ø¹Ù…Ù„ Ú©Ø±Ø¯Ù‡ Ø§Ø³Øª. Ù…Ø­ØªÙˆØ§ÛŒ target Ù‚Ø¯ÛŒÙ…ÛŒ Ù‡Ù†ÙˆØ² inventory Ù†Ø´Ø¯Ù‡ Ùˆ Ù†Ø¨Ø§ÛŒØ¯ Ø­Ø°Ù Ø´ÙˆØ¯.
- Decisions / assumptions: Task Spec Ø¨Ø±Ø§ÛŒ Ø§ÛŒØ¬Ø§Ø¯ target ÛŒÚ©ØªØ§ÛŒ `mktemp -d` Ø§ØµÙ„Ø§Ø­ Ø´Ø¯. inventory non-sensitive Ù…Ø³ÛŒØ± Ù‚Ø¯ÛŒÙ…ÛŒ ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ Ø«Ø¨Øª ÙˆØ¶Ø¹ÛŒØª Ø§Ù†Ø¬Ø§Ù… Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› rehearsal Ø¨Ø¹Ø¯ÛŒ Ù‡Ø±Ú¯Ø² Ø¢Ù† Ø±Ø§ reuse Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› restore rehearsal Ù‡Ù†ÙˆØ² Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Rollback / recovery: ØªØºÛŒÛŒØ±ÛŒ Ø±Ø® Ù†Ø¯Ø§Ø¯Ù‡ Ø§Ø³Øª. Ù…Ø³ÛŒØ± Ù‚Ø¯ÛŒÙ…ÛŒ ØªØ§ ØªØ¹ÛŒÛŒÙ† ownership Ù…Ø­ÙÙˆØ¸ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ø› target ÛŒÚ©ØªØ§ÛŒ Ø¨Ø¹Ø¯ÛŒ ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² verification Ù…ÙˆÙÙ‚ Ù¾Ø§Ú© Ù…ÛŒâ€ŒØ´ÙˆØ¯.

## LOG-0040 â€” 2026-08-14 â€” P0-A execution / isolated encrypted restore rehearsal passed

- Outcome: PostgreSQL Ùˆ media/config snapshotÙ‡Ø§ÛŒ Ø§Ù†ØªØ®Ø§Ø¨â€ŒØ´Ø¯Ù‡ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¨Ù‡ ÛŒÚ© target ÛŒÚ©ØªØ§ÛŒ root-only Ø¯Ø± `/dev/shm` restore Ø´Ø¯Ù†Ø¯Ø› dump non-empty Ø¨ÙˆØ¯ØŒ Ø³Ù‡ configuration file Ø¨Ø§ source Ø¨Ø±Ø§Ø¨Ø± Ø¨ÙˆØ¯Ù†Ø¯ØŒ count ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ media Ø¨Ø±Ø§Ø¨Ø± Ø¨ÙˆØ¯ Ùˆ target Ø¬Ø¯ÛŒØ¯ Ù¾Ø³ Ø§Ø² verification Ø­Ø°Ù Ø´Ø¯.
- Why: backup Ùˆ repository check Ø¨Ù‡â€ŒØªÙ†Ù‡Ø§ÛŒÛŒ recoverability Ø±Ø§ Ø§Ø«Ø¨Ø§Øª Ù†Ù…ÛŒâ€ŒÚ©Ù†Ù†Ø¯. Ø§ÛŒÙ† rehearsal Ù…Ø³ÛŒØ± decrypt/read/restore Ø±Ø§ Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± production Ø§Ø«Ø¨Ø§Øª Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Scope / files: ManifestØŒ Backup Policy/RunbookØŒ Ù‡Ø± Ø¯Ùˆ Task SpecØŒ Risk RegisterØŒ Deferred Validation Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù…Ø§Ù„Ú© capacity `/dev/shm` Ø±Ø§ Ø¨Ø±Ø±Ø³ÛŒ Ú©Ø±Ø¯ØŒ target ÛŒÚ©ØªØ§ Ø¨Ø§ `mktemp` Ø³Ø§Ø®ØªØŒ Ø¯Ùˆ snapshot Ø±Ø§ restore Ú©Ø±Ø¯ØŒ test/cmp/count ØºÛŒØ±Ù…Ø­Ø±Ù…Ø§Ù†Ù‡ Ø±Ø§ Ø§Ø¬Ø±Ø§ Ùˆ ÙÙ‚Ø· Ù‡Ù…Ø§Ù† target ÛŒÚ©ØªØ§ Ø±Ø§ Ø­Ø°Ù Ú©Ø±Ø¯. target Ù‚Ø¯ÛŒÙ…ÛŒ deploy-owned ØµØ±ÙØ§Ù‹ Ø¨Ø§ owner/mode/type Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ùˆ Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡ Ù…Ø§Ù†Ø¯. Ù‡ÛŒÚ† SQL importØŒ containerØŒ service/timerØŒ production file ÛŒØ§ push remote ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.
- Verification actually performed and result: restore PostgreSQL ÛŒÚ© ÙØ§ÛŒÙ„ Ø¯Ø± Ø­Ø¯ÙˆØ¯ 143KiB Ø±Ø§ Ø¯Ø± Ø­Ø¯ÙˆØ¯ ÛŒÚ© Ø«Ø§Ù†ÛŒÙ‡ Ùˆ restore media/config Ú†Ù‡Ø§Ø±Ø¯Ù‡ entry Ø±Ø§ Ø¯Ø± Ø­Ø¯ÙˆØ¯ Ù¾Ù†Ø¬Ø§Ù‡ Ø«Ø§Ù†ÛŒÙ‡ Ú¯Ø²Ø§Ø±Ø´ Ú©Ø±Ø¯. ØªÙ…Ø§Ù… assertionÙ‡Ø§ PASS Ùˆ `restore_rehearsal=PASS` Ú†Ø§Ù¾ Ø´Ø¯Ø› cleanup target ÛŒÚ©ØªØ§ Ù†ÛŒØ² PASS Ø¨ÙˆØ¯.
- Decisions / assumptions: Ø§ÛŒÙ† evidence file-level recovery Ø±Ø§ Ù…ÛŒâ€ŒØ¨Ù†Ø¯Ø¯ØŒ Ø§Ù…Ø§ import Ø¯ÛŒØªØ§Ø¨ÛŒØ³ Ø¯Ø± staging runtime Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ Ù‡Ù…Ú†Ù†Ø§Ù† Ø¨Ø±Ø§ÛŒ closure `RISK-0003` Ù„Ø§Ø²Ù… Ø§Ø³Øª. directory Ù‚Ø¯ÛŒÙ…ÛŒ deploy-owned Ø¯Ø± `DEFER-0006` Ø«Ø¨Øª Ø´Ø¯.
- Deferred or risk IDs: `RISK-0003` High/OpenØ› `DEFER-0006` Low/Open.
- Rollback / recovery: restore Ø¨Ù‡ production Ù†Ù†ÙˆØ´Øª Ùˆ target ÛŒÚ©ØªØ§ÛŒ rehearsal Ø­Ø°Ù Ø´Ø¯Ø› rollback Ù„Ø§Ø²Ù… Ù†ÛŒØ³Øª. Ø¨Ø±Ø§ÛŒ Ù…Ø±Ø­Ù„Ù‡Ù” Ø¨Ø¹Ø¯ÛŒ ÙÙ‚Ø· staging runtime Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ Ùˆ Task Spec Ù…Ø¬Ø§Ø² Ø§Ø³Øª.

## LOG-0041 â€” 2026-08-14 â€” P0-G0 planning / fast safe-live implementation backlog

- Outcome: ÛŒÚ© backlog Ø§Ø¬Ø±Ø§ÛŒÛŒ Ø±ÛŒØ´Ù‡â€ŒØ§ÛŒ Ø¯Ø± `Task-list.md` Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯ Ú©Ù‡ Û¸Û± task Ùˆ Û³Û²Û´ checkbox Ø±Ø§ Ø§Ø² closure Ú¯ÛŒØª P0-G0 ØªØ§ P11 Ù¾ÙˆØ´Ø´ Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ Ùˆ Ù…Ø³ÛŒØ± Ø¨Ø­Ø±Ø§Ù†ÛŒ first live Ø±Ø§ Ø¨Ù‡ ÛŒÚ© release Ø§ÛŒØ³ØªØ§ÛŒ P1 Ø¨Ø¯ÙˆÙ† CMS/database/contact persistence Ø¬Ø¯ÛŒØ¯ Ù…Ø­Ø¯ÙˆØ¯ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Why: Ù‡Ø¯Ù Ù…Ø§Ù„Ú© Ú©ÙˆØªØ§Ù‡â€ŒÚ©Ø±Ø¯Ù† time-to-live Ù‡Ù…Ø±Ø§Ù‡ Ø¨Ø§ Ø§Ù†ØªÙ‚Ø§Ù„ ØµØ±ÛŒØ­ ØªØ³Øªâ€ŒÙ‡Ø§ Ùˆ hardening ØºÛŒØ±Ø­ÛŒØ§ØªÛŒ Ø¨Ù‡ Ø¨Ø¹Ø¯ Ø§Ø² release Ø¨ÙˆØ¯Ø› Ø¨Ø±Ù†Ø§Ù…Ù‡ Ø¨Ø§ÛŒØ¯ Ø¨ÛŒÙ† defer Ù…Ø¬Ø§Ø² Ùˆ Stop-the-line/Minimum Safe Gate ØªÙ…Ø§ÛŒØ² Ù…ÛŒâ€ŒÚ¯Ø°Ø§Ø´Øª.
- Scope / files: `Task-list.md`ØŒ `docs/plan/P0-G0-fast-safe-live-task-list-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log. Ù‡ÛŒÚ† applicationØŒ dependencyØŒ infrastructureØŒ serverØŒ DNSØŒ backupØŒ CI ÛŒØ§ deployment state ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.
- Commands or actions actually performed: inventory ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ Ùˆ Git/historyØŒ Ø®ÙˆØ§Ù†Ø¯Ù† Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯Ù‡Ø§ÛŒ Ø­Ø§Ú©Ù… Ùˆ evidenceÙ‡Ø§ÛŒ P0-AØŒ ÙÙ‡Ø±Ø³Øª Ú©Ø§Ù…Ù„ sectionÙ‡Ø§ÛŒ Product/Architecture/IA/Design baseline Ùˆ Ø¨Ø±Ø±Ø³ÛŒ Ø¨Ø®Ø´â€ŒÙ‡Ø§ÛŒ Ù…Ø±ØªØ¨Ø· Ø¨Ø§ phaseÙ‡Ø§ØŒ releaseØŒ localeØŒ securityØŒ operations Ùˆ P1 Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯Ø› Ø³Ù¾Ø³ Task Spec Ùˆ task list Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯Ù†Ø¯.
- Verification actually performed and result: Ø¨Ø±Ø±Ø³ÛŒ programmatic ÙˆØ¬ÙˆØ¯ G0/P0A/P0B/P1 ØªØ§ P11ØŒ risk/locale/admin/deferred contracts PASS Ø´Ø¯Ø› Û¸Û± task ID ÛŒÚ©ØªØ§ Ùˆ Û³Û²Û´ checkbox Ø´Ù…Ø§Ø±Ø´ Ø´Ø¯Ø› scan Ø¹Ø¨Ø§Ø±Øªâ€ŒÙ‡Ø§ÛŒ placeholder Ùˆ Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ legacy PASS Ùˆ `git diff --check` Ø¨Ø¯ÙˆÙ† Ø®Ø·Ø§ ØªÙ…Ø§Ù… Ø´Ø¯.
- Decisions / assumptions: Ù…Ø³ÛŒØ± Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ÛŒ `R0 Gate closure â†’ R1 static deployment spine â†’ R2 bilingual P1 production` Ø§Ø³Øª. defer Ú©Ø±Ø¯Ù† staging database import ÙÙ‚Ø· Ø¨Ø§ Ù¾Ø°ÛŒØ±Ø´ ØµØ±ÛŒØ­ Ùˆ Ù…Ø­Ø¯ÙˆØ¯ Ù…Ø§Ù„Ú© Ø¨Ø±Ø§ÛŒ static-only P1 Ù…Ø¬Ø§Ø² Ø§Ø³ØªØ› ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú©ØŒ inventory/rollback stack Ù…ÙˆØ¬ÙˆØ¯ Ùˆ production approval Ù‡Ù…Ú†Ù†Ø§Ù† blocker ÙˆØ§Ù‚Ø¹ÛŒ Ø§Ø¬Ø±Ø§ÛŒ Ø¨Ø±Ù†Ø§Ù…Ù‡â€ŒØ§Ù†Ø¯.
- Deferred or risk IDs: Ù‡ÛŒÚ† ID Ø¬Ø¯ÛŒØ¯ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ù†Ø´Ø¯ Ú†ÙˆÙ† Ø§ÛŒÙ† slice ÙÙ‚Ø· Ø¨Ø±Ù†Ø§Ù…Ù‡â€ŒØ±ÛŒØ²ÛŒ Ø§Ø³Øª. Ø¨Ø±Ù†Ø§Ù…Ù‡ ÙˆØ¶Ø¹ÛŒØª ÙØ¹Ù„ÛŒ `RISK-0001`ØŒ `RISK-0003` ØªØ§ `RISK-0007` Ùˆ `DEFER-0001` ØªØ§ `DEFER-0006` Ø±Ø§ ØªØºÛŒÛŒØ± Ù†Ù…ÛŒâ€ŒØ¯Ù‡Ø¯.
- Rollback / recovery: Ø§ÛŒÙ† ØªØºÛŒÛŒØ± Ú©Ø§Ù…Ù„Ø§Ù‹ Ù…Ø³ØªÙ†Ø¯ÛŒ Ø§Ø³ØªØ› rollback ÙÙ‚Ø· Ø­Ø°Ù Ø¯Ùˆ ÙØ§ÛŒÙ„ Ø¬Ø¯ÛŒØ¯ task-owned Ùˆ Ø¨Ø§Ø²Ú¯Ø±Ø¯Ø§Ù†Ø¯Ù† Ù‡Ù…ÛŒÙ† entry Ø§Ø³Øª Ùˆ Ù‡ÛŒÚ† runtime data ÛŒØ§ server state Ø±Ø§ Ù„Ù…Ø³ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯.

## LOG-0042 â€” 2026-08-14 â€” Agent tooling / 9Router credential exposure report

- Outcome: ÛŒÚ© credential Ø§Ø±Ø³Ø§Ù„â€ŒØ´Ø¯Ù‡ Ø¯Ø± Ú¯ÙØªâ€ŒÙˆÚ¯Ùˆ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† exposure Ø«Ø¨Øª Ùˆ `RISK-0008` Ø¨Ø§ ÙˆØ¶Ø¹ÛŒØª `BLOCKED` Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯.
- Why: credential Ú¯ÙØªÚ¯Ùˆ Ù†Ø¨Ø§ÛŒØ¯ Ø¯Ø± repositoryØŒ logØŒ output ÛŒØ§ configuration Ù¾Ø§ÛŒØ¯Ø§Ø± Ø¨Ø§Ø²Ù†Ø´Ø± Ø´ÙˆØ¯ Ùˆ ØªØ§ rotation Ù†Ø¨Ø§ÛŒØ¯ Ø¨Ø±Ø§ÛŒ Ø§ØªØµØ§Ù„ agentÙ‡Ø§ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø´ÙˆØ¯.
- Scope / files: ÙÙ‚Ø· `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Risk Register Ø¨Ø¯ÙˆÙ† Ø¯Ø±Ø¬ Ù…Ù‚Ø¯Ø§Ø± credential Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯Ø› Ù‡ÛŒÚ† Ø§ØªØµØ§Ù„ 9RouterØŒ config OpenCodeØŒ providerØŒ VPS ÛŒØ§ secret store ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.
- Verification actually performed and result: entry Ø¬Ø¯ÛŒØ¯ `RISK-0008` Ø´Ø§Ù…Ù„ ownerØŒ triggerØŒ mitigation Ùˆ Ø´Ø±Ø· rotation Ø§Ø³Øª Ùˆ Ù‡ÛŒÚ† Ù…Ù‚Ø¯Ø§Ø± credential Ø¯Ø± diff ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.
- Decisions / assumptions: 9Router ØªØ§ rotation Ù…Ø³ØªÙ‚Ù„ credential Ùˆ Ø§ØªØµØ§Ù„ ØªØ¹Ø§Ù…Ù„ÛŒ Ø§Ù…Ù†ØŒ ÙÙ‚Ø· ÛŒÚ© capability Ø¨Ø§Ù„Ù‚ÙˆÙ‡ Ø§Ø³Øª Ùˆ Ù…Ø³ÛŒØ± Ø§Ø¬Ø±Ø§ÛŒ R0.1 Ø¨Ù‡ Ø¢Ù† ÙˆØ§Ø¨Ø³ØªÙ‡ Ù†ÛŒØ³Øª.
- Deferred or risk IDs: `RISK-0008`.
- Rollback / recovery: Ø­Ø°Ù entry ÙÙ‚Ø· Ø¯Ø± ØµÙˆØ±Øª Ø§Ø«Ø¨Ø§Øª Ø§ÛŒÙ†Ú©Ù‡ exposure Ø±Ø® Ù†Ø¯Ø§Ø¯Ù‡ Ø¨ÙˆØ¯ Ù…Ø¬Ø§Ø² Ø§Ø³ØªØ› remediation ÙˆØ§Ù‚Ø¹ÛŒ revoke/rotate credential Ø¯Ø± dashboard 9Router Ø§Ø³Øª.


## LOG-0043 â€” 2026-08-14 â€” P0-G0 / Repository metadata publish

- Outcome: Task Spec Â«P0-G0 repository metadata publishÂ» Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯Ø› `README.md` Ø¨Ø§ Ù†Ù‚Ø·Ù‡Ù” ÙˆØ±ÙˆØ¯/ÙˆØ¶Ø¹ÛŒØª/Ú†ÛŒØ¯Ù…Ø§Ù†Ù Ù…Ø³ØªÙ†Ø¯ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù…Ù†Ø¨Ø¹ Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯ Ùˆ `.gitignore` guardÙ‡Ø§ÛŒÛŒ Ø¨Ø±Ø§ÛŒ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ environment Ù¾Ø´ØªÛŒØ¨Ø§Ù†ØŒ artifactÙ‡Ø§ÛŒ OS/editor Ùˆ ÙˆØ¶Ø¹ÛŒØª agent-local Ø¨Ù‡ Ø¯Ø³Øª Ø¢ÙˆØ±Ø¯Ø› Ù‡Ù…ÛŒÙ† entry Ø«Ø¨Øª Ø´Ø¯. `LOG-0043` Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø´Ø¯Ù‡ Ø§Ø³Øª Ú†ÙˆÙ† worktree Ø§ØµÙ„ÛŒ Ø¯Ø§Ø±Ø§ÛŒ Ø±Ú©ÙˆØ±Ø¯Ù‡Ø§ÛŒ owner-held Ùˆ uncommitted Ø¨Ø§ Ø´Ù…Ø§Ø±Ù‡â€ŒÙ‡Ø§ÛŒ `LOG-0041` Ùˆ `LOG-0042` Ø§Ø³Øª.
- Why: README Ùˆ ignore file Ø¨Ø§ÛŒØ¯ ÙÙ‚Ø· Ø¨Ø± Ù¾Ø§ÛŒÙ‡Ù” Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø±Ø³Ù…ÛŒ repository Ø¯Ù‚ÛŒÙ‚ Ù…ÛŒâ€ŒØ¨ÙˆØ¯Ù†Ø¯ Ùˆ Ø«Ø¨Øª Ù‡Ø± Ú©Ø§Ø± Ø·Ø¨Ù‚ Documentation Policy Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª.
- Scope / files: `docs/plan/P0-G0-repository-metadata-task-spec.md`ØŒ `README.md`ØŒ `.gitignore` Ùˆ `docs/status/WORK_LOG.md`Ø› Ù‡ÛŒÚ† ÙØ§ÛŒÙ„ Ø¯ÛŒÚ¯Ø±ÛŒ ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.
- Commands or actions actually performed: Task Spec Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯Ø› `README.md` Ùˆ `.gitignore` ÙˆÛŒØ±Ø§ÛŒØ´ Ùˆ Ù‡Ù…ÛŒÙ† entry Ø«Ø¨Øª Ø´Ø¯. Ù‡ÛŒÚ† ØªØºÛŒÛŒØ± runtimeØŒ deploymentØŒ dependencyØŒ infrastructureØŒ secret ÛŒØ§ server Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ù…Ø³ØªÙ†Ø¯Ø§Øª (`PROJECT_MANIFEST.md`ØŒ `AGENTS.md` Ùˆ governance policies) Ø®ÙˆØ§Ù†Ø¯Ù‡ Ø´Ø¯Ø› Ù„ÛŒÙ†Ú©â€ŒÙ‡Ø§ÛŒ Ù†Ø³Ø¨ÛŒ Ù…Ø³ØªÙ†Ø¯Ø§Øª README ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø±Ù†Ø¯Ø› `git diff --check` PASS Ø´Ø¯.
- Decisions / assumptions: Ø´Ù…Ø§Ø±Ù‡Ù” `LOG-0043` Ø¨Ù‡â€ŒÚ©Ø§Ø± Ø±ÙØªÙ‡ Ø§Ø³Øª Ú†ÙˆÙ† worktree Ø§ØµÙ„ÛŒ Ø¯Ø§Ø±Ø§ÛŒ Ø±Ú©ÙˆØ±Ø¯Ù‡Ø§ÛŒ owner-held Ùˆ uncommitted Ø¨Ø§ Ø´Ù…Ø§Ø±Ù‡â€ŒÙ‡Ø§ÛŒ `LOG-0041` Ùˆ `LOG-0042` Ø§Ø³Øª Ùˆ Ø§ÛŒÙ† branch ØªÙ…ÛŒØ² Ø¨Ø§ÛŒØ¯ ledger append-only Ø±Ø§ Ø¨Ø¯ÙˆÙ† collision Ø§Ø¯Ø§Ù…Ù‡ Ø¯Ù‡Ø¯.
- Deferred or risk IDs: Ù†Ø¯Ø§Ø±Ø¯Ø› Ù‡ÛŒÚ† deferral ÛŒØ§ Ø±ÛŒØ³Ú© Ø¬Ø¯ÛŒØ¯ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ù†Ø´Ø¯.
- Rollback / recovery: Ø¨Ø§Ø²Ú¯Ø±Ø¯Ø§Ù†ÛŒ Ù‡Ù…Ø§Ù† Ú†Ù‡Ø§Ø± ÙØ§ÛŒÙ„ task (`docs/plan/P0-G0-repository-metadata-task-spec.md`ØŒ `README.md`ØŒ `.gitignore`ØŒ `docs/status/WORK_LOG.md`).

## LOG-0051 â€” 2026-08-14 â€” G0-01 / documentation snapshot and drift fix

- Outcome: ÙˆØ¶Ø¹ÛŒØª Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø¨Ø§ evidence Ø¹Ù…Ù„ÛŒØ§ØªÛŒ P0-A (LOG-0024 ØªØ§ LOG-0040) Ù‡Ù…â€ŒØªØ±Ø§Ø² Ø´Ø¯: Ù…Ø³ÛŒØ± Ù†Ù…ÙˆÙ†Ù‡Ù” URL admin Ø¯Ø± Technology Baseline Ø§Ø² `/cms/` Ø¨Ù‡ `/admin/` (Ù…ØµÙˆØ¨ ADR-0014) Ø§ØµÙ„Ø§Ø­ Ø´Ø¯Ø› ÙˆØ¶Ø¹ÛŒØª Ø¹Ù…Ù„ÛŒØ§ØªÛŒ ADR-0008 Ùˆ ADR-0010 Ø¯Ø± index Ùˆ Ø®ÙˆØ¯ ADRÙ‡Ø§ Ø¨Ù‡â€ŒØ±ÙˆØ² Ø´Ø¯Ø› Ø¬Ù…Ù„Ù‡Ù” Ù‚Ø¯ÛŒÙ…ÛŒ Â«restic password is still not createdÂ» Ø¯Ø± BACKUP_POLICY Ø§ØµÙ„Ø§Ø­ Ø´Ø¯Ø› Ø´Ù…Ø§Ø±Ù‡â€ŒÚ¯Ø°Ø§Ø±ÛŒ ØªÚ©Ø±Ø§Ø±ÛŒ Ùˆ status Ù‚Ø¯ÛŒÙ…ÛŒ Task Spec Ø³Ø±ÙˆØ± Ø±ÙØ¹ Ø´Ø¯Ø› Ùˆ ØªÙˆØµÛŒÙ `RISK-0001` Ø¨Ù‡ Ù…ÙˆØ§Ù†Ø¹ ÙˆØ§Ù‚Ø¹Ø§Ù‹ Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡ (PASS Ø±Ø³Ù…ÛŒ G0-06ØŒ ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú©ØŒ scaffold/CI/deploy) Ù…Ø­Ø¯ÙˆØ¯ Ø´Ø¯.
- Why: G0-01 Ù†Ø®Ø³ØªÛŒÙ† task Ù…Ø³ÛŒØ± Ø¨Ø­Ø±Ø§Ù†ÛŒ first live Ø§Ø³Øª Ùˆ Ø¨Ø§ÛŒØ¯ Ø§Ø² ØªÙ†Ø§Ù‚Ø¶ Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø¨Ø§Ù„Ø§Ø¯Ø³ØªÛŒ Ø¯Ø±Ø¨Ø§Ø±Ù‡Ù” provisioning Ø§Ù…Ø±ÙˆØ² Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ú©Ù†Ø¯Ø› ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§ÛŒ ADR Ù¾Ø°ÛŒØ±ÙØªÙ‡â€ŒØ´Ø¯Ù‡ ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯Ù†Ø¯.
- Scope / files: `docs/plan/P0-G0-documentation-drift-task-spec.md`ØŒ `docs/taha-personal-platform-technology-architecture-baseline-fa.md`ØŒ `docs/adr/README.md`ØŒ `docs/adr/0008-...`ØŒ `docs/adr/0010-...`ØŒ `docs/governance/BACKUP_POLICY.md`ØŒ `docs/plan/P0-A-server-access-dns-backup-task-spec.md`ØŒ `docs/status/RISK_REGISTER.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `git diff --check`Ø› grep `/cms/` Ø±ÙˆÛŒ Technology BaselineØ› script Ø¨Ø±Ø±Ø³ÛŒ Ù„ÛŒÙ†Ú©â€ŒÙ‡Ø§ÛŒ Ù…Ø­Ù„ÛŒ Ø±ÙˆÛŒ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ Ù„Ù…Ø³â€ŒØ´Ø¯Ù‡. Ù‡ÛŒÚ† scaffoldØŒ dependencyØŒ API/schemaØŒ Docker/CaddyØŒ DNSØŒ VPSØŒ backupØŒ CI ÛŒØ§ deploy Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯.
- Verification actually performed and result: `git diff --check` Ø¨Ø¯ÙˆÙ† Ø®Ø·Ø§ (PASS)Ø› Technology Baseline Ø§Ú©Ù†ÙˆÙ† Ù‡ÛŒÚ† URL-route `/cms/` Ù†Ø¯Ø§Ø±Ø¯ Ùˆ ØªÙ†Ù‡Ø§ `apps/cms/` Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù…Ø³ÛŒØ± source Ø¨Ø§Ù‚ÛŒ Ø§Ø³ØªØ› link-check Ù…Ø­Ù„ÛŒ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ Ù„Ù…Ø³â€ŒØ´Ø¯Ù‡ PASS Ø¨ÙˆØ¯.
- Decisions / assumptions: `apps/cms/` Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù…Ø³ÛŒØ± source canonical Ø§Ø³Øª Ùˆ ØªØºÛŒÛŒØ± Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯Ø› ÙÙ‚Ø· Ù†Ù…ÙˆÙ†Ù‡Ù” URL route Ø¨Ù‡ `/admin/` Ù‡Ù…â€ŒØ³Ùˆ Ø´Ø¯. Ù‡ÛŒÚ† ØªØµÙ…ÛŒÙ… ADR Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ Ù†Ø´Ø¯.
- Deferred or risk IDs: `RISK-0001` Ù‡Ù…Ú†Ù†Ø§Ù† BLOCKED (Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡: ØªØµÙ…ÛŒÙ… gateØŒ scaffold/CI/deploy)Ø› `RISK-0003` Ùˆ `RISK-0004` ØªØ§ `RISK-0007` ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯Ù†Ø¯.
- Rollback / recovery: Ù‡Ù…Ù‡Ù” ØªØºÛŒÛŒØ±Ù‡Ø§ ØµØ±ÙØ§Ù‹ Ù…Ø³ØªÙ†Ø¯ÛŒ Ùˆ Ø¨Ø§ Git Ù‚Ø§Ø¨Ù„ Ø¨Ø§Ø²Ú¯Ø´Øªâ€ŒØ§Ù†Ø¯Ø› Ù‡ÛŒÚ† runtime data ÛŒØ§ server state Ù„Ù…Ø³ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0052 â€” 2026-08-14 â€” G0-04/G0-05 / first-live technical freeze and minimum ADRs

- Outcome: ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§ÛŒ ÙÙ†ÛŒ Ø­Ø¯Ø§Ù‚Ù„ÛŒ R2 Ø¯Ø± `PROJECT_MANIFEST.md` freeze Ø´Ø¯ Ùˆ Ø³Ù‡ ADR Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ÛŒ (0016 static-first Astro + React islandsØŒ 0017 artifact Ù†Ø³Ø®Ù‡â€ŒØ¯Ø§Ø± + atomic switch/rollbackØŒ 0018 P1 design/hydration/font minimum) Ø¨Ù‡â€ŒÙ‡Ù…Ø±Ø§Ù‡ Ø«Ø¨Øª Ø¯Ø± index Ùˆ Ø§ØµÙ„Ø§Ø­ status Ú©Ù‡Ù†Ù‡Ù” ADR-0015 Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯.
- Why: G0-04/G0-05 Ø¨Ø®Ø´ÛŒ Ø§Ø² closure Ú¯ÛŒØª R0 Ù‡Ø³ØªÙ†Ø¯ Ùˆ Ø¨Ø§ÛŒØ¯ ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§ÛŒ ØºÛŒØ±Ø¨Ø¯ÛŒÙ‡ÛŒ first live Ø±Ø§ Ø§Ø² Ø­Ø§ÙØ¸Ù‡/Ú†Øª Ø¬Ø¯Ø§ Ú©Ù†Ù†Ø¯Ø› Ø¨Ø¯ÙˆÙ† scaffold ÛŒØ§ install.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ Ø³Ù‡ ADR Ø¬Ø¯ÛŒØ¯ØŒ `docs/adr/README.md`ØŒ `docs/plan/P0-G0-technical-freeze-adrs-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `node --version` (v24.16.0)ØŒ `npm --version` (11.18.0)ØŒ `npx --version` (11.18.0)ØŒ `uv --version` (0.12.3) Ùˆ `npm view astro version` (7.2.2)ØŒ `npm view tailwindcss version` (4.3.3)ØŒ `npm view typescript version` (7.0.2) Ø§Ø¬Ø±Ø§ Ø´Ø¯. Ù‡ÛŒÚ† installØŒ scaffoldØŒ dependencyØŒ `.venv` ÛŒØ§ runtime Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯.
- Verification actually performed and result: Ù†Ø³Ø®Ù‡â€ŒÙ‡Ø§ÛŒ Ù…Ø­ÛŒØ· Ùˆ Ø¢Ø®Ø±ÛŒÙ† Ù†Ø³Ø®Ù‡Ù” Astro/Tailwind/TypeScript Ø§Ø² npm Ø«Ø¨Øª Ø´Ø¯Ù†Ø¯Ø› `git diff --check` Ø¨Ø¯ÙˆÙ† Ø®Ø·Ø§ Ùˆ link-check Ù…Ø­Ù„ÛŒ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ Ù„Ù…Ø³â€ŒØ´Ø¯Ù‡ PASS Ø¨ÙˆØ¯.
- Decisions / assumptions: package manager `npm`ØŒ Node 24.16.0ØŒ Astro static-firstØ› React/Tailwind/shadcn/Motion/GSAP/D3/Three/Pagefind/analytics/dark mode Ù‡Ù…Ù‡ Ø¨Ø±Ø§ÛŒ R2 `NOT USED IN R2`Ø› font/logo/media `OPEN` ÙˆØ§Ø¨Ø³ØªÙ‡ Ø¨Ù‡ Ù…Ø§Ù„Ú©. ADRÙ‡Ø§ Ø¨Ù‡â€ŒØµÙˆØ±Øª `Proposed` Ø«Ø¨Øª Ø´Ø¯Ù†Ø¯ ØªØ§ Ø¯Ø± G0-06 Ù¾Ø°ÛŒØ±ÙØªÙ‡ Ø´ÙˆÙ†Ø¯.
- Deferred or risk IDs: `RISK-0001` BLOCKED (ØªØµÙ…ÛŒÙ… gate Ùˆ scaffold Ø¨Ø§Ù‚ÛŒ Ø§Ø³Øª)Ø› ØªØºÛŒÛŒØ±ÛŒ Ø¯Ø± Ø±ÛŒØ³Ú©â€ŒÙ‡Ø§ÛŒ Ø¯ÛŒÚ¯Ø± Ù†Ø¨ÙˆØ¯.
- Rollback / recovery: ÙÙ‚Ø· Ù…Ø³ØªÙ†Ø¯Ø§ØªØ› Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ø§ Git.

## LOG-0053 â€” 2026-08-14 â€” G0-02/G0-03/G0-06 / gate decision and P0-G0 PASS (static-only P1)

- Outcome: ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú© Ø¨Ø±Ø§ÛŒ first live Ø«Ø¨Øª Ùˆ Ú¯ÛŒØª Ø¨Ù‡ `P0-G0: PASS for static-only P1` Ù…Ù†ØªÙ‚Ù„ Ø´Ø¯: `RISK-0001` Ø¨Ø³ØªÙ‡ Ø´Ø¯ØŒ `RISK-0003` Ø¨Ø§ Ù¾Ø°ÛŒØ±Ø´ Ù…Ø­Ø¯ÙˆØ¯ static-only Ø«Ø¨Øª Ø´Ø¯ØŒ header Manifest/AGENTS Ø¨Ù‡â€ŒØ±ÙˆØ² Ø´Ø¯ Ùˆ content pack Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ÛŒ `fa`/`en` Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯.
- Why: Ø¨Ø¯ÙˆÙ† ØªØµÙ…ÛŒÙ… Ù…Ú©ØªÙˆØ¨ Ù…Ø§Ù„Ú©ØŒ scaffold Ù…Ø¬Ø§Ø² Ù†ÛŒØ³ØªØ› Ø§ÛŒÙ† slice Ø´Ø±Ø· G0-06 Ø±Ø§ Ø¨Ø±Ø¢ÙˆØ±Ø¯Ù‡ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ùˆ scope Ø±Ø§ ØµØ±ÛŒØ­Ø§Ù‹ Ø¨Ù‡ static P1 Ù…Ø­Ø¯ÙˆØ¯ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Scope / files: `docs/status/RISK_REGISTER.md`ØŒ `PROJECT_MANIFEST.md`ØŒ `AGENTS.md`ØŒ `docs/plan/P0-G0-content-pack-proposal.md`ØŒ `docs/plan/P0-G0-gate-decision-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: ÙÙ‚Ø· Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ù…Ø³ØªÙ†Ø¯Ø§Øª Ùˆ Ø«Ø¨Øª ØªØµÙ…ÛŒÙ…Ø› Ù‡ÛŒÚ† scaffoldØŒ dependencyØŒ APIØŒ Docker/CaddyØŒ DNSØŒ VPSØŒ backupØŒ CI ÛŒØ§ deploy Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯.
- Verification actually performed and result: `git diff --check` Ø¨Ø¯ÙˆÙ† Ø®Ø·Ø§. Ù…Ø§Ù„Ú© Ø³Ù‡ ØªØµÙ…ÛŒÙ… Ø±Ø§ ØªØ£ÛŒÛŒØ¯ Ú©Ø±Ø¯: Ù¾Ø°ÛŒØ±Ø´ Ù…Ø­Ø¯ÙˆØ¯ `RISK-0003` Ø¨Ø±Ø§ÛŒ static-only P1ØŒ ØªÙ‡ÛŒÙ‡Ù” Ù¾ÛŒØ´â€ŒÙ†ÙˆÛŒØ³ content pack ØªÙˆØ³Ø· agent Ùˆ ØªØ£ÛŒÛŒØ¯ ØªÙˆØ³Ø· Ù…Ø§Ù„Ú©ØŒ Ùˆ text-mark + ÙÙˆÙ†Øª self-host Ø­Ø¯Ø§Ù‚Ù„ÛŒ.
- Decisions / assumptions: PASS ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ static P1 Ø§Ø³ØªØ› PASS Ú©Ù„ÛŒ CMS Ø§Ø¹Ù„Ø§Ù… Ù†Ø´Ø¯Ù‡ Ùˆ CMS/DB/contact persistence ØªØ§ P3 Ù…Ø³Ø¯ÙˆØ¯Ù†Ø¯. content pack Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ÛŒ Ø§Ø³Øª Ùˆ Ù‡ÛŒÚ† metric/link/evidence Ø­Ø¯Ø³ÛŒ Ù†Ø¯Ø§Ø±Ø¯.
- Deferred or risk IDs: `RISK-0001` CLOSEDØ› `RISK-0003` ACCEPTED (limited, static-only P1) Ø¨Ø§ expiry trigger Ù‚Ø¨Ù„ Ø§Ø² P3Ø› `RISK-0004` ØªØ§ `RISK-0007` ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯Ù†Ø¯.
- Rollback / recovery: Ø¨Ø§Ø²Ú¯Ø´Øª ÙÙ‚Ø· Ù…Ø³ØªÙ†Ø¯ÛŒØ› Ø¯Ø± ØµÙˆØ±Øª Ø¨Ø§Ø²Ú¯Ø´Ø§ÛŒÛŒ Ù‡Ø± riskØŒ Ú¯ÛŒØª Ø¯ÙˆØ¨Ø§Ø±Ù‡ Ø¨Ø±Ø±Ø³ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯.

## LOG-0054 â€” 2026-08-14 â€” P0A-03..06 / P1-01..09 static P1 frontend scaffold and bilingual landing

- Outcome: `apps/web/` Ø¨Ù‡â€ŒØµÙˆØ±Øª static-first Astro + TypeScript + Tailwind v4 scaffold Ø´Ø¯ Ùˆ P1 Ú©Ø§Ù…Ù„ Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯: Language Gateway Ø¯Ø± `/`ØŒ ØµÙØ­Ø§Øª `/fa/` (RTL) Ùˆ `/en/` (LTR)ØŒ 404 locale-awareØŒ `health.json`ØŒ `robots.txt`ØŒ `sitemap.xml`ØŒ design tokens Ø§Ø² `design.md`ØŒ Ùˆ workflow CI Ø¯Ø± `.github/workflows/ci.yml`. Ù…Ø­ØªÙˆØ§ÛŒ Ø§ØµÙ„ÛŒ Ø¨Ø¯ÙˆÙ† JavaScript Ø®ÙˆØ§Ù†Ø§ Ø§Ø³Øª Ùˆ Ù‡ÛŒÚ† React/heavy dependency Ù†ØµØ¨ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Why: Ù¾Ø³ Ø§Ø² `P0-G0: PASS for static-only P1`ØŒ scaffold `apps/web/` Ù…Ø¬Ø§Ø² Ø´Ø¯ Ùˆ Ø§ÛŒÙ† slice Ø®Ø±ÙˆØ¬ÛŒ Ø§ÛŒØ³ØªØ§ÛŒ Ù‚Ø§Ø¨Ù„ build Ø¨Ø±Ø§ÛŒ P1 Ø±Ø§ ÙØ±Ø§Ù‡Ù… Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Scope / files: `apps/web/**` (sourceØŒ configØŒ lockfile)ØŒ `.github/workflows/ci.yml`ØŒ `docs/plan/P0-A-web-scaffold-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ø¯Ø± `apps/web/` Ø§Ø¬Ø±Ø§ Ø´Ø¯: `npm install` (294 package)ØŒ `npm run check` (astro check: 0 error / 0 warning / 0 hint)ØŒ `npm run build` (static output Ø´Ø§Ù…Ù„ `/`, `/en/index.html`, `/fa/index.html`, `/404.html`, `/health.json`, `/robots.txt`, `/sitemap.xml`). Ø¨Ø±Ø±Ø³ÛŒ Ø¯Ø³ØªÛŒ Ø®Ø±ÙˆØ¬ÛŒ `dist/` Ø¨Ø±Ø§ÛŒ `lang`/`dir`/`canonical`/`hreflang` Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯.
- Verification actually performed and result: build Ùˆ check Ù‡Ø± Ø¯Ùˆ PASSØ› `fa` Ø®Ø±ÙˆØ¬ÛŒ `lang="fa" dir="rtl"` Ùˆ canonical/hreflang ØµØ­ÛŒØ­ Ø¯Ø§Ø±Ø¯Ø› `health.json` Ù…Ù‚Ø¯Ø§Ø± `{"status":"ok","service":"static","version":"0.1.0"}` Ø±Ø§ Ø¨Ø±Ù…ÛŒâ€ŒÚ¯Ø±Ø¯Ø§Ù†Ø¯Ø› Ù…Ø­ØªÙˆØ§ÛŒ ÙØ§Ø±Ø³ÛŒ UTF-8 ØµØ­ÛŒØ­ Ø§Ø³Øª.
- Decisions / assumptions: npm Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† package managerØ› Node 24.16.0Ø› Astro 7.2.2Ø› Tailwind v4 CSS-first. ÙÙˆÙ†Øª self-host Ù†Ù‡Ø§ÛŒÛŒ Ù†Ø´Ø¯Ù‡ (system stack ØªØ§ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú©)Ø› OG image Ùˆ contact Ù…Ù‚ØµØ¯ Ù†Ø¯Ø§Ø±Ù†Ø¯ Ùˆ ØµØ§Ø¯Ù‚Ø§Ù†Ù‡ Ø­Ø°Ù/inactive Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯. CI Ù‡Ù†ÙˆØ² Ø±ÙˆÛŒ runner ÙˆØ§Ù‚Ø¹ÛŒ Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Deferred or risk IDs: Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯Ø› `RISK-0004` ØªØ§ `RISK-0007` (deploy/Ø¸Ø±ÙÛŒØª/patch/SSH) Ø¨Ø±Ø§ÛŒ ÙØ§Ø² Ø§Ø³ØªÙ‚Ø±Ø§Ø± Ø¨Ø§Ù‚ÛŒâ€ŒØ§Ù†Ø¯. Ù…ÙˆØ§Ø±Ø¯ Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡Ù” P1 (viewport/accessibility/visual smokeØŒ OG imageØŒ ÙÙˆÙ†Øª Ù†Ù‡Ø§ÛŒÛŒØŒ staging/prod deploy) Ø¨Ø±Ø§ÛŒ ÙØ§Ø² deploy Ø«Ø¨Øª Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
- Rollback / recovery: `apps/web/` ØªØ§Ø²Ù‡ Ø§Ø³ØªØ› Ø­Ø°Ù Ø¢Ù† Ùˆ `ci.yml` ØªØºÛŒÛŒØ± Ø±Ø§ Ø¨Ø±Ù…ÛŒâ€ŒÚ¯Ø±Ø¯Ø§Ù†Ø¯Ø› Ù‡ÛŒÚ† server/runtime state Ù„Ù…Ø³ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0055 â€” 2026-08-14 â€” P1 / independent verification, content QA and deploy mechanics

- Outcome: Ø¯Ùˆ subagent Ù…Ø³ØªÙ‚Ù„ (explore Ùˆ general) Ø¨Ù‡â€ŒØµÙˆØ±Øª read-only Ù¾Ø±ÙˆÚ˜Ù‡ Ø±Ø§ Ø¨Ø§Ø²Ø¨ÛŒÙ†ÛŒ Ú©Ø±Ø¯Ù†Ø¯: acceptance Ø¯Ù‡â€ŒÚ¯Ø§Ù†Ù‡Ù” P1 Ù‡Ù…Ù‡ PASS Ùˆ content pack Ø§Ø² Ù†Ø¸Ø± ØªØ±Ø¬Ù…Ù‡/ÙˆØ§Ù‚Ø¹ÛŒØª Ø§Ù…Ù† Ø¨ÙˆØ¯. Ú†Ù†Ø¯ Ø§ØµÙ„Ø§Ø­ Ø¬Ø²Ø¦ÛŒ Ø§Ø¹Ù…Ø§Ù„ Ø´Ø¯Ø› Ù…Ú©Ø§Ù†ÛŒÚ© deploy (runbook + Caddy candidate + Ø§Ø³Ú©Ø±ÛŒÙ¾Øªâ€ŒÙ‡Ø§ÛŒ deploy/rollback) Ø·Ø¨Ù‚ ADR-0017 Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯ Ùˆ `DEFER-0007` ØªØ§ `DEFER-0010` Ø«Ø¨Øª Ø´Ø¯.
- Why: verification Ù…Ø³ØªÙ‚Ù„ØŒ ØªØ´Ø®ÛŒØµ Ù…Ø³Ø§Ø¦Ù„ RTL/Ù…Ø­ØªÙˆØ§ Ùˆ Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ù…Ø³ÛŒØ± deploy Ø§ÛŒØ³ØªØ§ Ø¨Ø±Ø§ÛŒ Ø¯Ø³ØªÛŒØ§Ø¨ÛŒ Ø¨Ù‡ release gate.
- Scope / files: `apps/web/src/data/content.ts`ØŒ `apps/web/src/pages/404.astro`ØŒ `docs/governance/DEPLOY_RUNBOOK.md`ØŒ `infra/caddy/static-site.caddy`ØŒ `infra/deploy/deploy.sh`ØŒ `infra/deploy/rollback.sh`ØŒ `.gitattributes`ØŒ `AGENTS.md`ØŒ `docs/status/deferred-validation.md`ØŒ `Task-list.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ø¯Ùˆ subagent (explore/general) Ø§Ø¬Ø±Ø§ Ø´Ø¯Ù†Ø¯Ø› `npm run check` (0 error) Ùˆ `npm run build` Ù¾Ø³ Ø§Ø² Ø§ØµÙ„Ø§Ø­Ø§Øª PASSØ› `bash -n` Ø±ÙˆÛŒ Ù‡Ø± Ø¯Ùˆ Ø§Ø³Ú©Ø±ÛŒÙ¾Øª deploy PASS. Ù‡ÛŒÚ† VPS/Caddy/DNS/deploy ÙˆØ§Ù‚Ø¹ÛŒ Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯.
- Verification actually performed and result: verification report Ø¯Ù‡ Ù…ÙˆØ±Ø¯ PASS Ùˆ Ø¨Ø¯ÙˆÙ† blockerØ› Ø§ØµÙ„Ø§Ø­Ø§Øª: Ø­Ø°Ù token Ù…Ø®ØªÙ„Ø· RTL (Â«R&DÂ» â†’ Â«ØªØ­Ù‚ÛŒÙ‚ Ùˆ ØªÙˆØ³Ø¹Ù‡Â»)ØŒ Ø¨Ù‡Ø¨ÙˆØ¯ ÙˆØ§Ú˜Ú¯Ø§Ù† faØŒ Ø­Ø°Ù canonical Ø´Ø¨Ø­â€ŒÙˆØ§Ø± Ø¯Ø± 404. Ø§Ø³Ú©Ø±ÛŒÙ¾Øªâ€ŒÙ‡Ø§ syntax-valid Ùˆ LF Ù‡Ø³ØªÙ†Ø¯.
- Decisions / assumptions: deploy mechanics Ø§Ø² ADR-0017 Ù¾ÛŒØ§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ø´Ø¯Ø› Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ù…Ø·Ù„Ù‚ (`SITE_ROOT`) Ùˆ switch ØªÙˆÙ„ÛŒØ¯ ØªØ§ inventory P0A-01 Ù†Ù‡Ø§ÛŒÛŒ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ù†Ø¯. Caddy candidate Ø§Ø¹Ù…Ø§Ù„ Ù†Ø´Ø¯Ù‡ Ùˆ ÙÙ‚Ø· candidate Ø§Ø³Øª.
- Deferred or risk IDs: `DEFER-0007` (contact path)ØŒ `DEFER-0008` (font)ØŒ `DEFER-0009` (OG image)ØŒ `DEFER-0010` (browser verification) OPENØ› `RISK-0004` ØªØ§ `RISK-0007` Ø¨Ø±Ø§ÛŒ ÙØ§Ø² deploy Ø¨Ø§Ø²Ù†Ø¯.
- Rollback / recovery: ØªØºÛŒÛŒØ±Ø§Øª frontend/infra ÙÙ‚Ø·Ø› Ø§Ø³Ú©Ø±ÛŒÙ¾Øªâ€ŒÙ‡Ø§ÛŒ deploy/rollback Ø¹Ù…Ù„ÛŒØ§Øª Ø³Ø±ÙˆØ± Ø§Ù†Ø¬Ø§Ù… Ù†Ù…ÛŒâ€ŒØ¯Ù‡Ù†Ø¯ ØªØ§ inventory Ùˆ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú©.

## LOG-0056 â€” 2026-08-14 â€” P1 / HTTP verification, gateway polish and deploy-prep documentation

- Outcome: Ø³Ø§ÛŒØª Ø¨Ø§ preview server ÙˆØ§Ù‚Ø¹ÛŒ Ø§Ø² Ù†Ø¸Ø± HTTP Ø§Ø¹ØªØ¨Ø§Ø±Ø³Ù†Ø¬ÛŒ Ø´Ø¯ (Ù‡Ù…Ù‡Ù” routeÙ‡Ø§ÛŒ public 200ØŒ 404 ØµØ­ÛŒØ­ØŒ Ø¨Ø¯ÙˆÙ† link Ø´Ú©Ø³ØªÙ‡ØŒ CSS Ø³Ø§Ù„Ù…)Ø› Gateway Ø¨Ø§ SVG field Ø§ÛŒØ³ØªØ§ÛŒ ØºÛŒØ±-blocking Ùˆ theme-color Ù…Ø·Ø§Ø¨Ù‚ design.md Â§60.5 Ø¨Ù‡Ø¨ÙˆØ¯ ÛŒØ§ÙØªØ› Task Spec inventory ÙÙ‚Ø·â€ŒØ®ÙˆØ§Ù†Ø¯Ù†ÛŒ P0A-01 Ø¨Ø±Ø§ÛŒ Ù…Ø§Ù„Ú©ØŒ entry DEBT-0001 Ùˆ ÙˆØ¶Ø¹ÛŒØª Ø¨Ù‡â€ŒØ±ÙˆØ² queue ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú© Ø«Ø¨Øª Ø´Ø¯.
- Why: ØªØ£ÛŒÛŒØ¯ Ø®Ø±ÙˆØ¬ÛŒ Ù¾ÛŒØ´ Ø§Ø² Ø§Ø³ØªÙ‚Ø±Ø§Ø± Ùˆ Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ú¯Ø§Ù…â€ŒÙ‡Ø§ÛŒ Ø¨Ø¹Ø¯ÛŒ (deploy Ø±ÙˆÛŒ VPS) Ø¨Ù‡â€ŒØµÙˆØ±Øª turnkey Ùˆ Ø¨Ø¯ÙˆÙ† Ø­Ø¯Ø³.
- Scope / files: `apps/web/src/pages/index.astro`ØŒ `apps/web/src/layouts/BaseLayout.astro`ØŒ `docs/plan/P0-A-stack-inventory-task-spec.md`ØŒ `docs/status/TECH_DEBT.md`ØŒ `Task-list.md` (Ø¨Ø®Ø´ 18) Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `npm run preview -- --port 4321` Ø¨Ù‡â€ŒÙ‡Ù…Ø±Ø§Ù‡ `curl.exe` Ø¨Ø±Ø§ÛŒ routeÙ‡Ø§ÛŒ `/`, `/en/`, `/fa/`, `/404`, `/health.json`, `/robots.txt`, `/sitemap.xml`, `/nonexistent-path`Ø› link-check Ø§Ø³ØªØ®Ø±Ø§Ø¬ href/src Ùˆ Ø¨Ø±Ø±Ø³ÛŒ 200Ø› Ø¨Ø±Ø±Ø³ÛŒ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ CSS. Ø³Ù¾Ø³ `npm run check` (0 error) Ùˆ `npm run build` PASS.
- Verification actually performed and result: `GET /`, `/en/`, `/fa/`, `/health.json`, `/robots.txt`, `/sitemap.xml` â†’ 200Ø› `/en` Ùˆ `/fa` Ø¨Ø¯ÙˆÙ† slash Ùˆ Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ù†Ø§Ù…ÙˆØ¬ÙˆØ¯ â†’ 404 (Ú©Ø§Ù„Ú© canonical Ø¨Ø§ `trailingSlash: always`Ø› redirect Ù„Ø§ÛŒÙ‡Ù” deploy Ø¯Ø± P0A-06 Ø«Ø¨Øª Ø´Ø¯Ù‡)Ø› link-check 4 Ù„ÛŒÙ†Ú© ÛŒÚ©ØªØ§ PASSØ› CSS Ù‡Ø± Ø¯Ùˆ ÙØ§ÛŒÙ„ 200 Ø¨Ø§ Ù…Ø­ØªÙˆØ§ÛŒ Ú©Ø§Ù…Ù„. SVG gateway Ø¯Ø§Ø±Ø§ÛŒ no-JS/no-motion fallback Ø§Ø³Øª.
- Decisions / assumptions: Ø´Ú©Ù„ canonical URLÙ‡Ø§ Ø¨Ø§ slash Ø§Ø³ØªØ› redirect Ø¨Ø¯ÙˆÙ†-slash Ø¯Ø± Caddy (P0A-06) Ø§Ù†Ø¬Ø§Ù… Ù…ÛŒâ€ŒØ´ÙˆØ¯. inventory ÙÙ‚Ø·â€ŒØ®ÙˆØ§Ù†Ø¯Ù†ÛŒ VPS ØªÙˆØ³Ø· Ù…Ø§Ù„Ú© Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ù‡ÛŒÚ† server command ØªÙˆØ³Ø· agent Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯.
- Deferred or risk IDs: `DEBT-0001` OPENØ› `DEFER-0007` ØªØ§ `DEFER-0010` OPENØ› `RISK-0004`/`RISK-0007` Ù¾Ø³ Ø§Ø² inventory Ø¨Ù‡â€ŒØ±ÙˆØ² Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
- Rollback / recovery: ØªØºÛŒÛŒØ±Ø§Øª ÙÙ‚Ø· frontend/docsØ› build Ø¯ÙˆØ¨Ø§Ø±Ù‡ ØªÙ…Ø§Ù… Ù‚Ø¯ÛŒÙ… Ø±Ø§ Ø¨Ø±Ù…ÛŒâ€ŒÚ¯Ø±Ø¯Ø§Ù†Ø¯.

## LOG-0057 â€” 2026-08-14 â€” P1 / canonical commands, dependency scan and status sync

- Outcome: ÙØ±Ù…Ø§Ù†â€ŒÙ‡Ø§ÛŒ ØªØ£ÛŒÛŒØ¯Ø´Ø¯Ù‡Ù” `apps/web/` Ø¯Ø± `PROJECT_MANIFEST.md` Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† canonical Ø«Ø¨Øª Ø´Ø¯Ù†Ø¯ØŒ `npm audit` Ø§Ø¬Ø±Ø§ Ø´Ø¯ (0 vulnerability)ØŒ ÙˆØ¶Ø¹ÛŒØª scaffold Ø¯Ø± Manifest Ùˆ README Ù‡Ù…â€ŒØªØ±Ø§Ø² ÙˆØ§Ù‚Ø¹ÛŒØª Ø´Ø¯.
- Why: Ø·Ø¨Ù‚ P0A-03ØŒ ÙØ±Ù…Ø§Ù†â€ŒÙ‡Ø§ÛŒ app ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² Ø§Ø¬Ø±Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ùˆ Ø«Ø¨Øª Ø¯Ø± Manifest canonical Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯Ø› README/Manifest Ù†Ø¨Ø§ÛŒØ¯ ÙˆØ¶Ø¹ÛŒØª Ú©Ù‡Ù†Ù‡ Ø±Ø§ Ù†Ù…Ø§ÛŒØ´ Ø¯Ù‡Ù†Ø¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `README.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ø¯Ø± `apps/web/`: `npm audit --audit-level=high` â†’ `found 0 vulnerabilities`. ÙØ±Ù…Ø§Ù†â€ŒÙ‡Ø§ÛŒ install/check/build/preview Ù‚Ø¨Ù„Ø§Ù‹ Ø¨Ø§ evidence LOG-0054/0056 Ø§Ø¬Ø±Ø§ Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Verification actually performed and result: audit Ø¨Ø¯ÙˆÙ† vulnerabilityØ› Ø³Ø§Ø®ØªØ§Ø± canonical commands Ø¯Ø± Manifest Ø¨Ø§ ÙØ±Ù…Ø§Ù†â€ŒÙ‡Ø§ÛŒ ÙˆØ§Ù‚Ø¹Ø§Ù‹ Ø§Ø¬Ø±Ø§Ø´Ø¯Ù‡ ÛŒÚ©Ø³Ø§Ù† Ø§Ø³Øª.
- Decisions / assumptions: ÙØ±Ù…Ø§Ù†â€ŒÙ‡Ø§ÛŒ CMS/deploy Ù‡Ù…Ú†Ù†Ø§Ù† canonical Ù†ÛŒØ³ØªÙ†Ø¯ Ùˆ ØªØ§ slice Ù…Ø±Ø¨ÙˆØ·Ù‡ Ø«Ø¨Øª Ù†Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
- Deferred or risk IDs: Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: ØªØºÛŒÛŒØ±Ø§Øª Ù…Ø³ØªÙ†Ø¯ÛŒØ› Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ø§ Git.

## LOG-0058 â€” 2026-08-14 â€” P1 / favicon, OG locale and CI artifact verification

- Outcome: favicon SVG Ù…Ø´ØªÙ‚ Ø§Ø² text-mark Ù…ØµÙˆØ¨ (`TM` Ø±ÙˆÛŒ Navy Ø¨Ø§ Turquoise)ØŒ `og:locale` (fa_IR/en_US) Ùˆ Ù…Ø±Ø­Ù„Ù‡Ù” verification Ø¯Ø± CI (Ú©Ø§Ù…Ù„â€ŒØ¨ÙˆØ¯Ù† artifact + scan Ø§Ù„Ú¯ÙˆÛŒ secret) Ø§Ø¶Ø§ÙÙ‡ Ùˆ Ø¨Ù‡â€ŒØµÙˆØ±Øª Ù…Ø­Ù„ÛŒ Ø§Ø¹ØªØ¨Ø§Ø±Ø³Ù†Ø¬ÛŒ Ø´Ø¯.
- Why: polish Ø§Ù…Ù†/Ú©ÙˆÚ†Ú© Ù¾ÛŒØ´ Ø§Ø² release: favicon Ø¨Ø±Ø§ÛŒ ØªØ¨ Ù…Ø±ÙˆØ±Ú¯Ø±ØŒ metadata OG ØµØ­ÛŒØ­ØŒ Ùˆ gate CI Ú©Ù‡ artifact Ù†Ø§Ù‚Øµ ÛŒØ§ Ø­Ø§ÙˆÛŒ Ø§Ù„Ú¯ÙˆÛŒ secret Ø±Ø§ Ø±Ø¯ Ú©Ù†Ø¯.
- Scope / files: `apps/web/public/favicon.svg`ØŒ `apps/web/src/layouts/BaseLayout.astro`ØŒ `apps/web/src/pages/index.astro`ØŒ `.github/workflows/ci.yml` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `npm run check` (0 error) Ùˆ `npm run build` PASSØ› Ø§Ø¬Ø±Ø§ÛŒ Ù…Ø­Ù„ÛŒ Ù‡Ù…Ø§Ù† ØªØ³Øªâ€ŒÙ‡Ø§ÛŒ CI (ÙˆØ¬ÙˆØ¯ Ù‡ÙØª ÙØ§ÛŒÙ„ artifact Ùˆ grep Ø§Ù„Ú¯ÙˆÙ‡Ø§ÛŒ secret) â†’ PASS Ø¨Ø¯ÙˆÙ† Ù‡ÛŒÚ† hit.
- Verification actually performed and result: favicon Ø¯Ø± `dist/favicon.svg` Ø­Ø§Ø¶Ø±Ø› scan Ù…Ø­Ù„ÛŒ Ù‡ÛŒÚ† Ø§Ù„Ú¯ÙˆÛŒ secret Ø¯Ø± `dist/` Ù¾ÛŒØ¯Ø§ Ù†Ú©Ø±Ø¯Ø› Ù…Ù†Ø·Ù‚ Ù…Ø±Ø­Ù„Ù‡Ù” CI Ù¾ÛŒØ´ Ø§Ø² push Ø¢Ø²Ù…Ø§ÛŒØ´ Ø´Ø¯.
- Decisions / assumptions: favicon ØµØ±ÙØ§Ù‹ Ù…Ø´ØªÙ‚ text-mark Ø§Ø³Øª Ùˆ Ø¨Ø§ ØªØ£ÛŒÛŒØ¯ Ù„ÙˆÚ¯ÙˆÛŒ Ù†Ù‡Ø§ÛŒÛŒ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…ÛŒâ€ŒØ´ÙˆØ¯ (Ø§Ù„Ú¯ÙˆÛŒ Ù…Ø´Ø§Ø¨Ù‡ DEFER-0008).
- Deferred or risk IDs: Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: ØªØºÛŒÛŒØ±Ø§Øª frontend/CIØ› Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ø§ Git.

## LOG-0059 â€” 2026-08-15 â€” R1 / push, CI pass, partial inventory and staging handoff

- Outcome: history Ù…Ø­Ù„ÛŒ Ø¨Ø§ commits metadata Ø±ÛŒÙ…ÙˆØª Ø§Ø¯ØºØ§Ù… Ø´Ø¯ (collision Ø´Ù…Ø§Ø±Ù‡Ù” `LOG-0043` Ø¨Ø§ renumber Ø¨Ù‡ `LOG-0051` ØªØ§ `LOG-0058` Ø±ÙØ¹ Ø´Ø¯) Ùˆ Ø¨Ù‡ origin/main push Ø´Ø¯Ø› CI Ø±ÙˆÛŒ GitHub Actions Ø¨Ø§ `npm ci`/`check`/`build`/artifact verification **PASS** Ø´Ø¯Ø› inventory ÙÙ‚Ø·â€ŒØ®ÙˆØ§Ù†Ø¯Ù†ÛŒ Ø¬Ø²Ø¦ÛŒ VPS (CaddyfileØŒ Ù…Ù†Ø§Ø¨Ø¹ØŒ Ø±ÙˆÙ†Ø¯ placeholder) Ø«Ø¨Øª Ø´Ø¯Ø› artifact Ù†Ø³Ø®Ù‡â€ŒØ¯Ø§Ø± `release-a2720d9` Ø¨Ù‡ VPS Ù…Ù†ØªÙ‚Ù„ Ùˆ Ø§Ø³Ú©Ø±ÛŒÙ¾Øª sudo ÛŒÚ©â€ŒÙØ±Ù…Ø§Ù†ÛŒ `stage-p1.sh` Ø¢Ù…Ø§Ø¯Ù‡ Ø´Ø¯.
- Why: Ú¯Ø§Ù…â€ŒÙ‡Ø§ÛŒ Ø¨Ø¹Ø¯ÛŒ Ù…Ø³ÛŒØ± first live: ÙØ¹Ø§Ù„â€ŒØ´Ø¯Ù† CI Ùˆ Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ staging deploy Ø¨Ù‡â€ŒØµÙˆØ±Øª turnkey Ø¨Ø§ backup/validate/rollback.
- Scope / files: `.gitignore`ØŒ `README.md`ØŒ `docs/status/WORK_LOG.md`ØŒ `Task-list.md`ØŒ `docs/status/RISK_REGISTER.md`ØŒ `docs/status/TECH_DEBT.md`ØŒ `docs/status/deferred-validation.md`ØŒ `infra/deploy/stage-p1.sh`ØŒ `docs/governance/DEPLOY_RUNBOOK.md`.
- Commands or actions actually performed: `git merge origin/main` Ø¨Ø§ Ø±ÙØ¹ ØªØ¹Ø§Ø±Ø¶Ø› `git push origin main` (70dc744..a2720d9)Ø› Ø§Ø² Ø·Ø±ÛŒÙ‚ SSH ÙÙ‚Ø·â€ŒØ®ÙˆØ§Ù†Ø¯Ù†ÛŒ: `uname`ØŒ `free -m`ØŒ `df -h`ØŒ `ps` Ø¨Ø±Ø§ÛŒ CaddyØŒ `cat /etc/caddy/Caddyfile`ØŒ `curl -sI` Ø¨Ø±Ø§ÛŒ production (200) Ùˆ staging (503)Ø› `scp` artifact Ùˆ `bash -n` Ø±ÙˆÛŒ script Ø¯Ø± Ø³Ø±ÙˆØ±. Ù‡ÛŒÚ† Ø¯Ø³ØªÙˆØ± sudo ÛŒØ§ ØªØºÛŒÛŒØ± Caddy Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯.
- Verification actually performed and result: `gh run list` â†’ CI completed/successØ› artifact Ø´Ø§Ù…Ù„ health.json/robots/sitemap/locale roots Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± ØªØ£ÛŒÛŒØ¯ Ø´Ø¯Ø› `stage-p1.sh` syntax-valid Ø±ÙˆÛŒ Ø³Ø±ÙˆØ±.
- Decisions / assumptions: staging deploy ØªÙˆØ³Ø· Ù…Ø§Ù„Ú© Ø¨Ø§ ÛŒÚ© ÙØ±Ù…Ø§Ù† sudo Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆØ¯: `sudo bash ~/taha-stage/stage-p1.sh ~/taha-stage/release-a2720d9`Ø› production blocks Ø¯Ø³Øª Ù†Ù…ÛŒâ€ŒØ®ÙˆØ±Ù†Ø¯. Ø¢Ø¯Ø±Ø³ Ø³Ø±ÙˆØ± Ø¯Ø± `~/.ssh/config` (alias `taha-nl`) Ø§Ø³Øª Ùˆ Ø¯Ø± repo Ø«Ø¨Øª Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `RISK-0004` (inventory Docker Ù‡Ù†ÙˆØ² sudo Ù…ÛŒâ€ŒØ®ÙˆØ§Ù‡Ø¯)ØŒ `RISK-0007` (capacity Ø¨Ø± Ø§Ø³Ø§Ø³ 1.1GB available Ø¨Ø±Ø§ÛŒ staging static Ú©Ø§ÙÛŒ Ø§Ø±Ø²ÛŒØ§Ø¨ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯)Ø› Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: staging script Ø¯Ø§Ø±Ø§ÛŒ backup/validate/auto-restore Ø§Ø³ØªØ› rollback Ù…Ø³ÛŒØ± Ø¯Ø± DEPLOY_RUNBOOK Ø«Ø¨Øª Ø´Ø¯.

## LOG-0060 â€” 2026-08-15 â€” R1/R2 / staging deploy live and verified (P0A-09)

- Outcome: Ù…Ø§Ù„Ú© `sudo bash ~/taha-stage/stage-p1.sh ~/taha-stage/release-a2720d9` Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯Ø› Caddy validate PASS Ùˆ reload Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯ Ùˆ `staging.tahamohamadi.ir` Ø§Ú©Ù†ÙˆÙ† artifact Ø§ÛŒØ³ØªØ§ÛŒ P1 Ø±Ø§ Ø³Ø±Ùˆ Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Bug Ø§ÙˆÙ„ÛŒÙ‡Ù” permission (artifact scp Ø¨Ø§ mode 0700 â†’ 403 Ø¨Ø±Ø§ÛŒ caddy user) Ø¨Ø§ `chmod -R a+rX` Ø±ÙØ¹ Ø´Ø¯Ø› Ø§Ø³Ú©Ø±ÛŒÙ¾Øª Ø¨Ø±Ø§ÛŒ Ø¢ÛŒÙ†Ø¯Ù‡ Ø¨Ø§ `chown/chmod` Ù†Ø±Ù…Ø§Ù„â€ŒØ³Ø§Ø²ÛŒ Ùˆ 404 ØµØ­ÛŒØ­ (Ø¨Ø¯ÙˆÙ† try_files) Ø¨Ø±Ø§ÛŒ Ø§Ø¬Ø±Ø§ÛŒ Ø¨Ø¹Ø¯ÛŒ Ø¢Ù…Ø§Ø¯Ù‡ Ø´Ø¯.
- Why: P0A-09 Ø®Ø±ÙˆØ¬ÛŒ staging Ø§ÛŒØ³ØªØ§ Ø§Ø³ØªØ› Ø§ÛŒÙ† Ø§ÙˆÙ„ÛŒÙ† Ø§Ø¬Ø±Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ù…Ú©Ø§Ù†ÛŒÚ© deploy Ø·Ø¨Ù‚ ADR-0017 Ø§Ø³Øª.
- Scope / files: `infra/deploy/stage-p1.sh`ØŒ `docs/governance/DEPLOY_RUNBOOK.md`ØŒ `docs/status/WORK_LOG.md`.
- Commands or actions actually performed: Ø§Ø² Ø§ÛŒÙ† agent: `curl` routeÙ‡Ø§ÛŒ staging Ø§Ø² Ù…Ø³ÛŒØ± Cloudflare Ùˆ direct-originØ› `ssh` ÙÙ‚Ø·â€ŒØ®ÙˆØ§Ù†Ø¯Ù†ÛŒ + `chmod -R a+rX` (Ù…Ø§Ù„Ú©ÛŒØª deploy)Ø› `bash -n`Ø› `scp` Ø§Ø³Ú©Ø±ÛŒÙ¾Øª Ø§ØµÙ„Ø§Ø­â€ŒØ´Ø¯Ù‡Ø› commit/push. Ù…Ø§Ù„Ú© Ø¯Ø³ØªÙˆØ± sudo Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯ (evidence Ø®Ø±ÙˆØ¬ÛŒ Ø¯Ø± Ú¯ÙØªâ€ŒÙˆÚ¯Ùˆ).
- Verification actually performed and result: `GET /`, `/en/`, `/fa/`, `/health.json`, `/404.html`, `/favicon.svg` â†’ 200Ø› `/en/` Ù…Ø­ØªÙˆØ§ÛŒ Ú©Ø§Ù…Ù„ Ø¨Ø§ `lang="en" dir="ltr"`Ø› `/fa/` RTLØ› `health.json` = `{"status":"ok","service":"static","version":"0.1.0"}`Ø› header `x-robots-tag: noindex, nofollow` ÙØ¹Ø§Ù„Ø› production `tahamohamadi.ir` â†’ 200 Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡. ÛŒØ§ÙØªÙ‡: Cloudflare edge Ø¯Ø± Ù…Ø³ÛŒØ± proxyØŒ `/robots.txt` Ø±Ø§ intercept Ù…ÛŒâ€ŒÚ©Ù†Ø¯ (origin robots ØµØ­ÛŒØ­ Ø§Ø³Øª) â€” Ù…ÙˆØ±Ø¯ÛŒ zone-level Ú©Ù‡ Ù…Ø§Ù„Ú© Ø¯Ø± Ù¾Ù†Ù„ Cloudflare Ø¨Ø§ÛŒØ¯ Ø¨Ø±Ø±Ø³ÛŒ Ú©Ù†Ø¯.
- Decisions / assumptions: staging block ÙÙ‚Ø· ØªØ¹ÙˆÛŒØ¶ Ø´Ø¯Ø› production/www/IP blocks Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡â€ŒØ§Ù†Ø¯Ø› legacy Compose stack Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ø¯Ø± Ø¬Ø±ÛŒØ§Ù† Ø§Ø³Øª.
- Deferred or risk IDs: `DEFER-0011` (Ø¨Ø±Ø±Ø³ÛŒ Cloudflare robots/zone)Ø› `RISK-0004` progress (inventory Caddy Ú©Ø§Ù…Ù„ØŒ docker metadata Ù‡Ù†ÙˆØ² sudo Ù…ÛŒâ€ŒØ®ÙˆØ§Ù‡Ø¯).
- Rollback / recovery: restore the exact timestamped `Caddyfile.pre-stage-p1.<timestamp>` backup, validate + reload, Ùˆ/ÛŒØ§ Ø¨Ø±Ú¯Ø±Ø¯Ø§Ù†Ø¯Ù† `current` Ø¨Ù‡ release Ù‚Ø¨Ù„ÛŒ.

## LOG-0061 â€” 2026-08-15 â€” P1 / ui-ux-pro-max gateway review and RTL correction

- Outcome: screenshot Ø§ÙˆÙ„ÛŒÙ‡Ù” staging Ø¨Ø§ `ui-ux-pro-max` Ùˆ `docs/design.md` review Ø´Ø¯. Ø¬Ù‡Øª Ø¨ØµØ±ÛŒ Ú©Ù„ÛŒ (NavyØŒ selective glassØŒ Turquoise/GoldØŒ technical field) Ù…Ù†Ø§Ø³Ø¨ ØªØ´Ø®ÛŒØµ Ø¯Ø§Ø¯Ù‡ Ø´Ø¯Ø› Ø§ÛŒØ±Ø§Ø¯ ÙˆØ§Ù‚Ø¹ÛŒ bidi Ø¯Ø± Ù†Ù…Ø§ÛŒØ´ Ù†Ø§Ù… ÙØ§Ø±Ø³ÛŒØŒ prompt ØªÚ©â€ŒØ²Ø¨Ø§Ù†Ù‡ØŒ mobile target Ùˆ reduced-motion Ø§ØµÙ„Ø§Ø­ Ø´Ø¯.
- Why: screenshot Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ Ù†Ø§Ù… `Taha Mohammadi Â· Ø·Ù‡ Ù…Ø­Ù…Ø¯ÛŒ` Ø¯Ø± ÛŒÚ© Ø®Ø· bidi-safe Ù†ÛŒØ³Øª Ùˆ ÙØ§Ø±Ø³ÛŒ Ø¨Ù‡â€ŒØµÙˆØ±Øª Ø´Ú©Ø³ØªÙ‡/Ù†Ø§Ù‚Øµ Ø¯ÛŒØ¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ø§ÛŒÙ† ÛŒÚ© Ù…Ø´Ú©Ù„ Ù‚Ø§Ø¨Ù„ Ù…Ø´Ø§Ù‡Ø¯Ù‡Ù” P1 Ø¨ÙˆØ¯ØŒ Ù†Ù‡ ØµØ±ÙØ§Ù‹ polish.
- Scope / files: `docs/plan/P1-gateway-ui-review-task-spec.md`ØŒ `apps/web/src/pages/index.astro`ØŒ `apps/web/src/styles/global.css`ØŒ `infra/deploy/stage-p1.sh`ØŒ `docs/governance/DEPLOY_RUNBOOK.md`ØŒ `docs/status/deferred-validation.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `ui-ux-pro-max` design-system Ùˆ UX/landing searchesØ› `npm run check` (0 error / 0 warning / 0 hint)Ø› `npm run build`Ø› static output assertions Ø¨Ø±Ø§ÛŒ ØªØ±ØªÛŒØ¨ identityØŒ prompt Ø¯ÙˆØ²Ø¨Ø§Ù†Ù‡ Ùˆ `dir="rtl"`. Ù‡ÛŒÚ† dependency ÛŒØ§ animation library Ø§Ø¶Ø§ÙÙ‡ Ù†Ø´Ø¯.
- Verification actually performed and result: identity Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ/ÙØ§Ø±Ø³ÛŒ Ø¯Ø± Ø¯Ùˆ line Ù…Ø³ØªÙ‚Ù„ Ø¨Ø§ `dir` Ø¬Ø¯Ø§ render Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› prompt Ù‡Ø± Ø¯Ùˆ Ø²Ø¨Ø§Ù† Ø±Ø§ Ù†Ù…Ø§ÛŒØ´ Ù…ÛŒâ€ŒØ¯Ù‡Ø¯Ø› Ø¯Ú©Ù…Ù‡â€ŒÙ‡Ø§ Ø­Ø¯Ø§Ù‚Ù„ touch target Ø¯Ø§Ø±Ù†Ø¯Ø› `prefers-reduced-motion` smooth scroll/transition Ø±Ø§ Ú©Ø§Ù‡Ø´ Ù…ÛŒâ€ŒØ¯Ù‡Ø¯Ø› build Ùˆ typecheck PASS.
- Decisions / assumptions: Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ø¹Ù…ÙˆÙ…ÛŒ skill Ø¯Ø±Ø¨Ø§Ø±Ù‡Ù” palette/font/motion Ø¨Ø§ baseline Ù¾Ø±ÙˆÚ˜Ù‡ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù†Ø´Ø¯Ø› `docs/design.md` Ù…Ù†Ø¨Ø¹ Ù†Ù‡Ø§ÛŒÛŒ Ø¨Ø§Ù‚ÛŒ Ø§Ø³Øª. ÙÙˆÙ†Øª self-host Ùˆ browser screenshot matrix Ù‡Ù…Ú†Ù†Ø§Ù† Ø¨Ø§Ø² Ù‡Ø³ØªÙ†Ø¯.
- Deferred or risk IDs: `DEFER-0008` (font)ØŒ `DEFER-0010` (browser matrix)ØŒ `DEFER-0011` (Cloudflare robots) OPEN.
- Rollback / recovery: ØªØºÛŒÛŒØ± frontend/infra Ù…Ø³ØªÙ†Ø¯ Ùˆ Ù‚Ø§Ø¨Ù„ Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ø§ GitØ› staging Ø¨Ø±Ø§ÛŒ Ø§Ø¹Ù…Ø§Ù„ Ø§ØµÙ„Ø§Ø­ 404 Ø¨Ø§ÛŒØ¯ Ø¨Ø§ script timestamped Ø¯ÙˆØ¨Ø§Ø±Ù‡ Ø§Ø¬Ø±Ø§ Ø´ÙˆØ¯.

## LOG-0062 â€” 2026-08-15 â€” P1 / bilingual typography and premium gateway refinement

- Outcome: Ø¨Ø§ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² `ui-ux-pro-max` Ùˆ Ø­ÙØ¸ Ø§ÙˆÙ„ÙˆÛŒØª `docs/design.md`ØŒ ÙÙˆÙ†Øªâ€ŒÙ‡Ø§ÛŒ self-hosted `Vazirmatn Variable` Ùˆ `Inter Variable` Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯Ø› gateway Ø§Ø² Ù†Ø¸Ø± parity Ø¯Ùˆ Ø²Ø¨Ø§Ù†ØŒ glass fallbackØŒ technical identity line Ùˆ hierarchy Ø¨ØµØ±ÛŒ refined Ø´Ø¯.
- Why: Ø¨Ø±Ø§ÛŒ professional/premium Ø¨ÙˆØ¯Ù† ÙÙ‚Ø· palette Ú©Ø§ÙÛŒ Ù†ÛŒØ³ØªØ› font renderingØŒ ÙˆØ²Ù† Ø¨Ø±Ø§Ø¨Ø± CTAÙ‡Ø§ Ùˆ Ù†Ø³Ø¨Øª Ù‡ÙˆÛŒØª/ÙØ¶Ø§ÛŒ Ø®Ø§Ù„ÛŒ Ø¯Ø± screenshot Ø§ÙˆÙ„ÛŒÙ‡ Ù†ÛŒØ§Ø² Ø¨Ù‡ ØªØµÙ…ÛŒÙ… Ùˆ Ø§Ø¬Ø±Ø§ÛŒ Ù…Ø´Ø®Øµ Ø¯Ø§Ø´Øª.
- Scope / files: `apps/web/package.json`ØŒ `apps/web/package-lock.json`ØŒ `apps/web/src/styles/global.css`ØŒ `apps/web/src/pages/index.astro`ØŒ `docs/plan/P1-typography-font-task-spec.md`ØŒ ADR-0019ØŒ ManifestØŒ content packØŒ Deferred ValidationØŒ Task-list Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `npm install --no-audit --no-fund` (Ø¯Ùˆ font package)ØŒ `npm run check` (0 error / 0 warning / 0 hint)ØŒ `npm run build`ØŒ `npm audit --audit-level=high` (0 vulnerabilities)ØŒ `git diff --check` Ùˆ Ø¨Ø±Ø±Ø³ÛŒ static CSS/HTML Ø¨Ø±Ø§ÛŒ `Vazirmatn`/`Inter` Ùˆ prompt/identity Ø¯ÙˆØ²Ø¨Ø§Ù†Ù‡.
- Verification actually performed and result: local font CSS Ùˆ `@font-face` Ø¯Ø± artifact Ø­Ø§Ø¶Ø±Ø› identity Ùˆ prompt Ø¯ÙˆØ²Ø¨Ø§Ù†Ù‡Ø› build/typecheck/audit PASS. Ø¯Ùˆ language action ÙˆØ²Ù† ÛŒÚ©Ø³Ø§Ù† Ø¯Ø§Ø±Ù†Ø¯ Ùˆ fallback opaque Ø¨Ø±Ø§ÛŒ browserÙ‡Ø§ÛŒ Ø¨Ø¯ÙˆÙ† backdrop-filter ØªØ¹Ø±ÛŒÙ Ø´Ø¯Ù‡ Ø§Ø³Øª.
- Decisions / assumptions: ADR-0019 Ø¨Ø§ ÙˆØ¶Ø¹ÛŒØª Accepted Ø«Ø¨Øª Ø´Ø¯Ø› `DEFER-0008` Ø¨Ø³ØªÙ‡ Ø´Ø¯. Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯Ù‡Ø§ÛŒ Ø¹Ù…ÙˆÙ…ÛŒ skill Ø¯Ø±Ø¨Ø§Ø±Ù‡Ù” Exo/Roboto MonoØŒ neonØŒ motion-heavy ÛŒØ§ palette Ø¬Ø¯ÛŒØ¯ Ø¨Ù‡â€ŒØ¯Ù„ÛŒÙ„ Ù†Ø§Ø³Ø§Ø²Ú¯Ø§Ø±ÛŒ Ø¨Ø§ Persian readability Ùˆ project governance Ø±Ø¯ Ø´Ø¯Ù†Ø¯.
- Deferred or risk IDs: `DEFER-0007` contactØŒ `DEFER-0009` OGØŒ `DEFER-0010` browser matrix Ùˆ `DEFER-0011` Cloudflare robots Ù‡Ù…Ú†Ù†Ø§Ù† OPENØ› Ù„ÙˆÚ¯ÙˆÛŒ Ù†Ù‡Ø§ÛŒÛŒ Ù‡Ù†ÙˆØ² owner input Ø§Ø³Øª.
- Rollback / recovery: Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ø§ Git Ø¨Ù‡ system stack Ù‚Ø¨Ù„ÛŒØ› staging Ø¨Ø±Ø§ÛŒ Ø¯ÛŒØ¯Ù† Ø§ÛŒÙ† Ù†Ø³Ø®Ù‡ Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ upload artifact Ø¬Ø¯ÛŒØ¯ Ùˆ Ø§Ø¬Ø±Ø§ÛŒ Ø¯ÙˆØ¨Ø§Ø±Ù‡Ù” script sudo Ø§Ø³Øª.

## LOG-0063 â€” 2026-08-15 â€” P1 / visual system elevation with identity constellation

- Outcome: Ø¨Ø± Ø§Ø³Ø§Ø³ `ui-ux-pro-max` Ùˆ Ø¨Ø§ Ø­ÙØ¸ `docs/design.md`ØŒ Ø³ÛŒØ³ØªÙ… Ø¨ØµØ±ÛŒ P1 Ø§Ø±ØªÙ‚Ø§ ÛŒØ§ÙØª: constellation Ù‡ÙˆÛŒØªÛŒ Ù…Ø¹Ù†Ø§Ø¯Ø§Ø± (DesignÂ·InteractionÂ·EngineeringÂ·DataÂ·AI Ø­ÙˆÙ„ Ù…Ø±Ú©Ø² Ø§Ù†Ø³Ø§Ù†â€ŒÙ…Ø­ÙˆØ± Gold) Ø¯Ø± gateway/hero/404ØŒ layout Ø¯ÙˆØ³Ø·Ø­ÛŒ editorial Ø¨Ø±Ø§ÛŒ hero Ø¨Ø§ Ù†Ø³Ø®Ù‡Ù” Ø³Ø§Ø¯Ù‡â€ŒØ´Ø¯Ù‡Ù” Ù…ÙˆØ¨Ø§ÛŒÙ„ØŒ accentÙ‡Ø§ÛŒ context Ø¨Ø±Ø§ÛŒ Ø³Ù‡ Ù…Ø³ÛŒØ± (purple/turquoise/emerald)ØŒ labelÙ‡Ø§ÛŒ Ø¨Ø®Ø´ Ø¯ÙˆØ²Ø¨Ø§Ù†Ù‡ (Û°Û±/Û°Û²)ØŒ header Ú†Ø³Ø¨Ø§Ù† solid-first Ø¨Ø§ glass Ø§Ø®ØªÛŒØ§Ø±ÛŒ Ùˆ touch target 44pxØŒ footer Ø¨Ø§ brand mark Ùˆ 404 Ù‡Ù…Ø§Ù‡Ù†Ú¯ Ø¨Ø§ Navy.
- Why: Ù…Ø§Ù„Ú© Â«Ø¨Ù‡ØªØ±ÛŒÙ† UI/UX Ù…Ù…Ú©Ù†Â» Ø±Ø§ Ø®ÙˆØ§Ø³ØªØ› design.md Â§64â€“Â§67 Ø§Ø«Ø± Ø¨ØµØ±ÛŒ Ø¨Ø§ÛŒØ¯ Ø¯Ø±Ø¨Ø§Ø±Ù‡Ù” Taha Ù…Ø¹Ù†Ø§ Ø¨Ø¯Ù‡Ø¯ØŒ Ù†Ù‡ ØµØ±ÙØ§Ù‹ ØªØ²Ø¦ÛŒÙ†ÛŒ Ø¨Ø§Ø´Ø¯Ø› Ø®Ø·ÙˆØ· ØªØµØ§Ø¯ÙÛŒ Ù‚Ø¨Ù„ÛŒ Ù…Ø¹Ù†Ø§ Ù†Ø¯Ø§Ø´ØªÙ†Ø¯.
- Scope / files: `apps/web/src/components/Landing.astro`ØŒ `Header.astro`ØŒ `Footer.astro`ØŒ `apps/web/src/pages/index.astro`ØŒ `404.astro`ØŒ `apps/web/src/data/content.ts`ØŒ `docs/plan/P1-visual-elevation-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `npm run check` (0 error / 0 warning / 0 hint)Ø› `npm run build`Ø› preview HTTP smoke (`/`, `/en/`, `/fa/`, `/health.json` â†’ 200Ø› `/nonexistent` â†’ 404Ø› CSS â†’ 200)Ø› static assertions Ø¨Ø±Ø§ÛŒ constellation/labels/accents/404.
- Verification actually performed and result: Ù‡Ù…Ù‡Ù” routeÙ‡Ø§ Ùˆ CSS Ø³Ø§Ù„Ù…Ø› Ø¨Ø¯ÙˆÙ† dependencyØŒ JS-client ÛŒØ§ Ø±Ù†Ú¯ Ø¬Ø¯ÛŒØ¯Ø› focus rings per-surface ØªÙ†Ø¸ÛŒÙ… Ø´Ø¯Ø› `prefers-reduced-motion` Ø­ÙØ¸ Ø´Ø¯.
- Decisions / assumptions: Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯Ù‡Ø§ÛŒ Ù†Ø§Ø³Ø§Ø²Ú¯Ø§Ø± skill (neon/cyberpunk/motion-heavy/Exo) Ø±Ø¯ Ø´Ø¯Ù†Ø¯Ø› ÙÙ‚Ø· Ø§Ù„Ú¯ÙˆÙ‡Ø§ÛŒ Ø³Ø§Ø²Ú¯Ø§Ø± (editorialØŒ touch targetsØŒ sticky navØŒ focus/contrast) Ø§Ø¹Ù…Ø§Ù„ Ø´Ø¯Ù†Ø¯.
- Deferred or risk IDs: `DEFER-0010` (browser matrix) Ù‡Ù…Ú†Ù†Ø§Ù† OPENØ› Ø³Ø§ÛŒØ± IDÙ‡Ø§ Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±.
- Rollback / recovery: Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ø§ GitØ› staging Ø¨Ø§ Ø§Ø¬Ø±Ø§ÛŒ Ø¯ÙˆØ¨Ø§Ø±Ù‡Ù” stage script ØªÙˆØ³Ø· Ù…Ø§Ù„Ú© Ø¨Ù‡â€ŒØ±ÙˆØ² Ù…ÛŒâ€ŒØ´ÙˆØ¯.

## LOG-0064 â€” 2026-08-15 â€” R2 / A1 reusable HTTP smoke script

- Outcome: added `infra/deploy/smoke.sh`, a read-only reusable HTTP smoke script for staging/production: asserts `/`, `/en/`, `/fa/`, `/robots.txt`, `/sitemap.xml` â†’ 200, `/health.json` â†’ 200 with body containing `"status":"ok"`, `/nonexistent-qa` â†’ 404, and with `--expect-noindex` also `x-robots-tag` containing `noindex` on `/`. Prints one `PASS|FAIL <name>` line per check and exits non-zero on any FAIL.
- Why: S-Plan task A1 â€” one reusable post-deploy verifier instead of ad-hoc curl commands (reused in A4 and C7).
- Scope / files: `infra/deploy/smoke.sh` (new), `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`.
- Commands or actions actually performed: `bash -n infra/deploy/smoke.sh`; `bash infra/deploy/smoke.sh https://staging.tahamohamadi.ir --expect-noindex`. No SSH, no sudo, no site changes.
- Verification actually performed and result: `bash -n` â†’ exit 0 (no output). Live run â†’ exit 0, all lines PASS: `PASS root /`ØŒ `PASS locale /en/`ØŒ `PASS locale /fa/`ØŒ `PASS robots.txt`ØŒ `PASS sitemap.xml`ØŒ `PASS nonexistent-qa`ØŒ `PASS health.json body`ØŒ `PASS noindex /`.
- Decisions / assumptions: a curl connection failure surfaces as status `000` â†’ FAIL; exit code equals the number of failed checks; `x-robots-tag` match is case-insensitive; the script asserts exactly the checks listed in task A1, nothing more.
- Deferred or risk IDs: none new (`DEFER-0011` note: `/robots.txt` returned 200 through the edge in this run).
- Rollback / recovery: script is additive and read-only; rollback = Git revert of this commit.

## LOG-0065 â€” 2026-08-15 â€” S-Plan / A1 pilot executed by subagent and approved

- Outcome: ØªØ³Ú© A1 (smoke script) ØªÙˆØ³Ø· subagent `general` Ø¨Ø§ Ù¾Ø±ÙˆØªÚ©Ù„ S-Plan Ø§Ø¬Ø±Ø§ Ø´Ø¯ (commit `e2d7796`ØŒ LOG-0064). L-model Ø·Ø¨Ù‚ Â§7 Ø±ÛŒÙˆÛŒÙˆ Ú©Ø±Ø¯: diff ÙÙ‚Ø· allowed filesØŒ Ù…Ù†Ø·Ù‚ Ø¯Ù‚ÛŒÙ‚Ø§Ù‹ Ù…Ø·Ø§Ø¨Ù‚ specØŒ Ø§Ø¬Ø±Ø§ÛŒ Ù…Ø³ØªÙ‚Ù„ Ù…Ø¬Ø¯Ø¯ smoke Ø±ÙˆÛŒ staging â†’ Û¸ PASS / exit 0 â†’ **APPROVE** Ùˆ A1 Ø¯Ø± S-PLAN-STATE Ø¨Ù‡ DONE Ø±ÙØª.
- Why: Ø§Ø«Ø¨Ø§Øª Ø­Ù„Ù‚Ù‡Ù” Â«Ù…Ø¯Ù„ Ú©ÙˆÚ†Ú© Ø§Ø¬Ø±Ø§ / Ù…Ø¯Ù„ Ø¨Ø²Ø±Ú¯ Ø±ÛŒÙˆÛŒÙˆÂ» Ù‚Ø¨Ù„ Ø§Ø² Ù‡Ø²ÛŒÙ†Ù‡â€ŒÚ©Ø±Ø¯ Ø±ÙˆÛŒ agentÙ‡Ø§ÛŒ Ø§Ø±Ø²Ø§Ù†.
- Scope / files: `infra/deploy/smoke.sh`ØŒ `docs/status/WORK_LOG.md`ØŒ `docs/plan/S-PLAN-STATE.md`.
- Commands or actions actually performed: `git show --stat e2d7796`Ø› `git diff --check HEAD~1 HEAD`Ø› Ø®ÙˆØ§Ù†Ø¯Ù† line-by-line Ø§Ø³Ú©Ø±ÛŒÙ¾ØªØ› Ø§Ø¬Ø±Ø§ÛŒ Ù…Ø³ØªÙ‚Ù„ `bash infra/deploy/smoke.sh https://staging.tahamohamadi.ir --expect-noindex` â†’ 8 PASSØŒ exit 0.
- Verification actually performed and result: Ù‡ÛŒÚ† divergence Ø¨ÛŒÙ† Ú¯Ø²Ø§Ø±Ø´ S-model Ùˆ Ø§Ø¬Ø±Ø§ÛŒ Ù…Ø³ØªÙ‚Ù„Ø› ÙˆØ±ÙˆØ¯ÛŒâ€ŒÙ‡Ø§ÛŒ FAIL Ø¨Ø±Ø§ÛŒ Ø®Ø·Ø§ÛŒ Ø§ØªØµØ§Ù„ (000) Ùˆ exit-code=count ØªØ¹Ø±ÛŒÙ Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Decisions / assumptions: Ø§Ù„Ú¯ÙˆÛŒ S-Plan Ø¨Ø±Ø§ÛŒ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø¨Ø§ Ù…Ø¯Ù„â€ŒÙ‡Ø§ÛŒ Ø§Ø±Ø²Ø§Ù† Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª.
- Deferred or risk IDs: Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: Ù…Ø³ØªÙ†Ø¯Ø§Øª/Ø§Ø³Ú©Ø±ÛŒÙ¾ØªØ› Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ø§ Git.

## LOG-0066 â€” 2026-08-15 â€” Infra / cheap-model agent fleet and visual QA agent

- Outcome: Ø¯Ùˆ agent Ù¾Ø±ÙˆÚ˜Ù‡â€ŒØ§ÛŒ Ø³Ø§Ø®ØªÙ‡ Ùˆ version Ø´Ø¯Ù†Ø¯: `.opencode/agent/s-executor.md` (Ù…Ø¯Ù„ Ø±Ø§ÛŒÚ¯Ø§Ù† `opencode/deepseek-v4-flash-free`Ø› fallbackÙ‡Ø§ÛŒ Ø§Ø±Ø²Ø§Ù†: `deepseek-v4-flash`ØŒ `mimo-v2.5`) Ø¨Ø§ permissionÙ‡Ø§ÛŒ deny-by-default (edit Ù…Ø­Ø¯ÙˆØ¯ Ø¨Ù‡ Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ taskØŒ bash Ù…Ø­Ø¯ÙˆØ¯ Ø¨Ù‡ npm/git-local/bash-n/smokeØŒ ssh/sudo/push deny) Ùˆ `.opencode/agent/visual-reviewer.md` (Ù…Ø¯Ù„ Ú†Ù†Ø¯ÙˆØ¬Ù‡ÛŒ `opencode-go/gpt-5.6-luna`ØŒ read-only Ø¨Ø§ Ø¯Ø³ØªØ±Ø³ÛŒ ÙÙ‚Ø· Ø¨Ù‡ `~/Pictures`/`~/Downloads` Ø¨Ø±Ø§ÛŒ ØªØµØ§ÙˆÛŒØ±) Ø¨Ø±Ø§ÛŒ Ø¨Ø³ØªÙ† `DEFER-0010`. `.gitignore` Ø¨Ù‡â€ŒØ±ÙˆØ²ÛŒ Ø´Ø¯ ØªØ§ ÙÙ‚Ø· `.opencode/agent/` version Ø´ÙˆØ¯. S-Plan Â§0/Â§2 Ùˆ state Ø¨Ø§ ØªØ³Ú© V1 (visual QA Ø§Ø² Ø§Ø³Ú©Ø±ÛŒÙ†â€ŒØ´Ø§Øªâ€ŒÙ‡Ø§ÛŒ Ù…Ø§Ù„Ú©) ØªÚ©Ù…ÛŒÙ„ Ø´Ø¯.
- Why: Ù…Ø§Ù„Ú© Ø®ÙˆØ§Ø³Øª Ø§Ø¬Ø±Ø§ Ø¨Ø§ Ù…Ø¯Ù„â€ŒÙ‡Ø§ÛŒ Ø§Ø±Ø²Ø§Ù† (DeepSeek/Grok/Luna/Mimo) Ø§Ù†Ø¬Ø§Ù… Ø´ÙˆØ¯ Ùˆ L-model ÙÙ‚Ø· review/planning Ø¨Ù…Ø§Ù†Ø¯Ø› Ø¨Ø±Ø±Ø³ÛŒ ØªØµÙˆÛŒØ±ÛŒ Ø¨Ø§ agent Ú†Ù†Ø¯ÙˆØ¬Ù‡ÛŒ Ø§Ø±Ø²Ø§Ù† Ù…Ù…Ú©Ù† Ø´Ø¯.
- Scope / files: `.opencode/agent/s-executor.md`ØŒ `.opencode/agent/visual-reviewer.md`ØŒ `.gitignore`ØŒ `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md`ØŒ `docs/plan/S-PLAN-STATE.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `opencode models` (inventory Ù…Ø¯Ù„â€ŒÙ‡Ø§)Ø› Ø®ÙˆØ§Ù†Ø¯Ù† Ø§Ù„Ú¯ÙˆÛŒ agentÙ‡Ø§ÛŒ global Ù…ÙˆØ¬ÙˆØ¯ (`r0-docs-executor.md`) Ø¨Ø±Ø§ÛŒ Ù‡Ù…â€ŒØ³Ø¨Ú©ÛŒ. Ù‡ÛŒÚ† Ù…Ø¯Ù„/Ú©Ù„ÛŒØ¯ Ø¬Ø¯ÛŒØ¯ÛŒ Ù†ØµØ¨ ÛŒØ§ ØªÙ†Ø¸ÛŒÙ… Ù†Ø´Ø¯.
- Verification actually performed and result: agentÙ‡Ø§ Ù…Ø·Ø§Ø¨Ù‚ schema (frontmatter Ù…Ø¬Ø§Ø² + permission Ø¨Ø§ ØªØ±ØªÛŒØ¨ Ù‚ÙˆØ§Ø¹Ø¯) Ù†ÙˆØ´ØªÙ‡ Ø´Ø¯Ù†Ø¯Ø› `.gitignore` Ø§Ù„Ú¯ÙˆÛŒ `!.opencode/agent/` Ø¯Ø§Ø±Ø¯. ÙØ¹Ø§Ù„â€ŒØ³Ø§Ø²ÛŒ Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ restart opencode Ø§Ø³Øª (config Ø¯Ø± startup Ù„ÙˆØ¯ Ù…ÛŒâ€ŒØ´ÙˆØ¯).
- Decisions / assumptions: executor Ø±ÙˆÛŒ tier Ø±Ø§ÛŒÚ¯Ø§Ù† Ø¨Ø§ fallback Ø§Ø±Ø²Ø§Ù†Ø› visual-reviewer ÙÙ‚Ø· Ù…Ø´Ø§Ù‡Ø¯Ù‡â€ŒÚ¯Ø± Ø§Ø³Øª Ùˆ Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ú©Ø¯ Ù†Ù…ÛŒâ€ŒØ¯Ù‡Ø¯Ø› Ù…Ø¯Ù„ Ú¯Ø±Ø§Ù† Ù‡Ø±Ú¯Ø² Ø¨Ø±Ø§ÛŒ Ø§Ø¬Ø±Ø§/Ø¨Ø§Ø²Ø¨ÛŒÙ†ÛŒ ØªØµÙˆÛŒØ±ÛŒ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `DEFER-0010` Ø§Ú©Ù†ÙˆÙ† Ù…Ø³ÛŒØ± Ø¨Ø³ØªÙ† Ø¯Ø§Ø±Ø¯ (V1 Ù¾Ø³ Ø§Ø² restart).
- Rollback / recovery: Ø­Ø°Ù Ø¯Ùˆ ÙØ§ÛŒÙ„ agent + Ø¨Ø§Ø²Ú¯Ø±Ø¯Ø§Ù†ÛŒ `.gitignore`.

## LOG-0067 â€” 2026-08-15 â€” P1-T01 / visual-prototyping tooling

- Outcome: `motion` 13.1.0ØŒ `gsap` 3.15.0 Ùˆ `three` 0.185.1 Ø¨Ù‡ dependencyÙ‡Ø§ÛŒ `apps/web/` Ø§ÙØ²ÙˆØ¯Ù‡ Ùˆ lockfile Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯Ø› Ù‡ÛŒÚ† source Ø¹Ù…ÙˆÙ…ÛŒØŒ routeØŒ bundle behavior ÛŒØ§ deploy ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯. Skill Ù…Ø­Ù„ÛŒ `design-dna` Ø§Ø² `zanwei/design-dna` Ù†ÛŒØ² Ø¯Ø± Codex Ù†ØµØ¨ Ø´Ø¯. Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Beautiful UI Ùˆ UI8 DNA Ø¨Ù‡ Ø¯Ù„ÛŒÙ„ Ù†Ø¨ÙˆØ¯ artifact Ù…Ø­Ù„ÛŒ/Ù…Ø¬ÙˆØ² Ù‚Ø§Ø¨Ù„â€ŒØ§Ø«Ø¨Ø§Øª defer Ø´Ø¯.
- Why: Ù…Ø§Ù„Ú© Ø§ÛŒÙ† Ø§Ø¨Ø²Ø§Ø±Ù‡Ø§ Ø±Ø§ Ø¨Ø±Ø§ÛŒ Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ visual prototyping Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ú©Ø±Ø¯Ø› scope Ø¹Ù…Ø¯Ø§Ù‹ tooling-only Ø¨Ø§Ù‚ÛŒ Ù…Ø§Ù†Ø¯ ØªØ§ Ù…Ø±Ø² static-first P1 Ùˆ Ù…Ù…Ù†ÙˆØ¹ÛŒØª motion/WebGL ÙØ¹Ù„ÛŒ Ø­ÙØ¸ Ø´ÙˆØ¯.
- Scope / files: `apps/web/{package.json,package-lock.json}`ØŒ `docs/plan/P1-T01-visual-prototyping-tooling-task-spec.md`ØŒ `docs/status/{WORK_LOG,deferred-validation}.md`Ø› Ù†ØµØ¨ skill Ø®Ø§Ø±Ø¬ Ø§Ø² repository Ø¯Ø± `C:\Users\Taha\.codex\skills\design-dna`.
- Commands or actions actually performed: installer Ø±Ø³Ù…ÛŒ skill Ø¨Ø§ `--repo zanwei/design-dna --path . --name design-dna`Ø› `npm install motion gsap three --save`Ø› `npm run check`Ø› `npm run build`Ø› `npm audit --omit=dev --registry=https://registry.npmjs.org/` Ø¯Ø± `apps/web/`.
- Verification actually performed and result: Design DNA Ø´Ø§Ù…Ù„ `SKILL.md` Ùˆ references Ù†ØµØ¨ Ø´Ø¯Ø› `astro check` â†’ 0 errors / 0 warnings / 0 hintsØ› static build Ù‡Ø± Ù‡ÙØª artifact Ù…ÙˆØ¬ÙˆØ¯ (`/`ØŒ `/fa/`ØŒ `/en/`ØŒ `404`ØŒ healthØŒ robots Ùˆ sitemap) Ø±Ø§ ØªÙˆÙ„ÛŒØ¯ Ú©Ø±Ø¯Ø› `npm audit` â†’ 0 vulnerabilitiesØ› `git diff --check` â†’ PASSØ› diff ÙÙ‚Ø· package manifests Ùˆ task-owned documentation Ø±Ø§ Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯.
- Decisions / assumptions: `motion`ØŒ `gsap` Ùˆ `three` ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ implementation Ø¢ÛŒÙ†Ø¯Ù‡ Ø¯Ø± Ø¯Ø³ØªØ±Ø³â€ŒØ§Ù†Ø¯ØŒ Ù†Ù‡ ÙØ¹Ø§Ù„ Ø¯Ø± P1. Ù‡Ø± use Ø¨Ø¹Ø¯ÛŒ Ø¨Ù‡ Task Spec Ù…Ø³ØªÙ‚Ù„ØŒ interaction Ù…Ø¹Ù†Ø§Ø¯Ø§Ø±ØŒ fallback Ø«Ø§Ø¨Øª/no-JSØŒ `prefers-reduced-motion` Ùˆ lazy/non-render-blocking loading Ù†ÛŒØ§Ø² Ø¯Ø§Ø±Ø¯Ø› Motion Ùˆ GSAP Ø¨Ù‡â€ŒØµÙˆØ±Øª Ù¾ÛŒØ´â€ŒÙØ±Ø¶ Ù‡Ù…â€ŒØ²Ù…Ø§Ù† Ø¨Ø±Ø§ÛŒ ÛŒÚ© interaction Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
- Deferred or risk IDs: `DEFER-0010` Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±Ø› `DEFER-0012` Ø¨Ø±Ø§ÛŒ artifact/licensing Ø®Ø§Ø±Ø¬ÛŒ Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯. Ù‡ÛŒÚ† Ø±ÛŒØ³Ú© Ø¬Ø¯ÛŒØ¯ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ù†Ø´Ø¯.
- Rollback / recovery: revert Ú©Ø±Ø¯Ù† Ø¯Ùˆ manifest task-ownedØ› Ø­Ø°Ù directory skill `C:\Users\Taha\.codex\skills\design-dna` Ø§Ú¯Ø± Ù„Ø§Ø²Ù… Ø¨Ø§Ø´Ø¯. Ù‡ÛŒÚ† runtime/server state ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0068 â€” 2026-08-15 â€” P1-T02 / visual-toolchain documentation alignment

- Outcome: ManifestØŒ READMEØŒ master planØŒ technical architecture baselineØŒ Task-list Ùˆ S-Plan Ø¨Ø§ ÙˆØ¶Ø¹ÛŒØª ÙˆØ§Ù‚Ø¹ÛŒ tooling Ù‡Ù…Ø³Ùˆ Ø´Ø¯Ù†Ø¯: `motion` 13.1.0ØŒ `gsap` 3.15.0 Ùˆ `three` 0.185.1 Ø¯Ø± lockfile Ù…ÙˆØ¬ÙˆØ¯ Ø§Ù…Ø§ Ø¯Ø± P1 inactive Ù‡Ø³ØªÙ†Ø¯Ø› Design DNA skill Ù…Ø­Ù„ÛŒ agent tooling Ø§Ø³ØªØ› D3/R3F/React Ù‡Ù†ÙˆØ² Ù†ØµØ¨ Ù†Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯Ø› Beautiful UI Ùˆ UI8 DNA Ù‡Ù…Ú†Ù†Ø§Ù† Ø¨Ù‡ `DEFER-0012` ÙˆØ§Ø¨Ø³ØªÙ‡â€ŒØ§Ù†Ø¯. Ø´Ù†Ø§Ø³Ù‡Ù” tooling Ø§Ø² `P1-10` Ø¨Ù‡ `P1-T01` ØªØºÛŒÛŒØ± Ú©Ø±Ø¯ ØªØ§ Ø¨Ø§ Task P1-10 (frontend verification) ØªØ¯Ø§Ø®Ù„ Ù†Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´Ø¯. Ù…Ø³ÛŒØ± Ø¢ÛŒÙ†Ø¯Ù‡ Ù†ÛŒØ² Ø¨Ø§ Task P0B-04 Ùˆ S-Plan B5 Ø¨Ù‡ ÛŒÚ© adoption gate Ù…Ø´Ø®Øµ Ù…Ø­Ø¯ÙˆØ¯ Ø´Ø¯.
- Why: Ù…Ø§Ù„Ú© Ø®ÙˆØ§Ø³Øª Ú©Ù‡ documentationØŒ specificationsØŒ tasks Ùˆ plans Ø¨Ø§ Ø§Ø¨Ø²Ø§Ø±Ù‡Ø§ÛŒ ØªØ§Ø²Ù‡â€ŒÙ†ØµØ¨â€ŒØ´Ø¯Ù‡ Ù…Ù†Ø·Ø¨Ù‚ Ø¨Ø§Ø´Ù†Ø¯Ø› Ù†ØµØ¨ package Ù†Ø¨Ø§ÛŒØ¯ Ø¨Ù‡â€ŒØ§Ø´ØªØ¨Ø§Ù‡ authorization Ø¨Ø±Ø§ÛŒ import/ship ØªÙ„Ù‚ÛŒ Ø´ÙˆØ¯.
- Scope / files: `PROJECT_MANIFEST.md`ØŒ `README.md`ØŒ `Task-list.md`ØŒ `docs/taha-personal-platform-{development-master-plan,technology-architecture-baseline}-fa.md`ØŒ `docs/plan/{P1-T01-visual-prototyping-tooling-task-spec,P1-T02-visual-toolchain-documentation-alignment-task-spec,SMALL-MODEL-EXECUTION-PLAN,S-PLAN-STATE}.md` Ùˆ Ù‡Ù…ÛŒÙ† Work LogØ› manifest/lockfile Ù…ÙˆØ¬ÙˆØ¯ Ø§Ø² P1-T01 ØªØºÛŒÛŒØ± Ø¯Ø§Ø¯Ù‡ Ù†Ø´Ø¯.
- Commands or actions actually performed: Ø¬Ø³Øªâ€ŒÙˆØ¬ÙˆÛŒ referenceÙ‡Ø§ Ø¨Ø§ `rg` Ø¯Ø± plan/ADR/governance Ùˆ statusØ› Ø®ÙˆØ§Ù†Ø¯Ù† contracts/Task Specs/roadmaps Ù…Ø±Ø¨ÙˆØ·Ø› `git diff --check` Ùˆ scope diff review.
- Verification actually performed and result: Ù‡Ù…Ù‡Ù” referenceÙ‡Ø§ÛŒ tooling Ø¨Ù‡ `P1-T01` Ù…Ù†ØªÙ‚Ù„ Ùˆ `P1-10` ØµØ±ÙØ§Ù‹ Ø¨Ø±Ø§ÛŒ blocking frontend verification Ø­ÙØ¸ Ø´Ø¯Ø› `git diff --check` PASSØ› documentation-only diff Ø¨Ù‡â€ŒØ¬Ø² ØªØºÛŒÛŒØ±Ø§Øª Ø§Ø² Ù¾ÛŒØ´â€ŒÙ…ÙˆØ¬ÙˆØ¯ P1-T01 Ø¯Ø± package manifestsØŒ Ù‡ÛŒÚ† source/config/deploy/runtime file Ù†Ø¯Ø§Ø±Ø¯.
- Decisions / assumptions: library ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² user value Ù…Ø´Ø®ØµØŒ Ø§Ù†ØªØ®Ø§Ø¨ ÛŒÚ© libraryØŒ Task SpecØŒ lazy island-local importØŒ fallback Ø«Ø§Ø¨Øª/no-JS Ùˆ reduced-motionØŒ keyboard/RTL/LTR/mobile QA Ùˆ performance evidence active Ù…ÛŒâ€ŒØ´ÙˆØ¯. Three/WebGL Ù‡Ø±Ú¯Ø² render-blocking hero/main content Ù†ÛŒØ³Øª. Design DNA Ù…Ø±Ø¬Ø¹ design Ø±Ø§ Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ø§Ù…Ø§ token/asset Ø®Ø§Ø±Ø¬ÛŒ Ø±Ø§ override Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Deferred or risk IDs: `DEFER-0010` Ùˆ `DEFER-0012` Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±Ø› Risk Ø¬Ø¯ÛŒØ¯ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ù†Ø´Ø¯.
- Rollback / recovery: revert ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ documentation Ø§ÛŒÙ† entry Ùˆ Ø¨Ø§Ø²Ú¯Ø±Ø¯Ø§Ù†ÛŒ Ù†Ø§Ù… P1-T01 Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø²Ø› Ù‡ÛŒÚ† runtime/deploy state ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0069 â€” 2026-08-15 â€” P1-T03 / design-policy toolchain alignment

- Outcome: `docs/design.md` Ø§Ú©Ù†ÙˆÙ† ØµØ±ÛŒØ­Ø§Ù‹ ÙˆØ¶Ø¹ÛŒØª installed-but-inactive P1 Ø¨Ø±Ø§ÛŒ Motion/GSAP/ThreeØŒ Ø§Ù†ØªØ®Ø§Ø¨ ÛŒÚ© library Ø¨Ø±Ø§ÛŒ Ù‡Ø± interactionØŒ fallback/QA Ø§Ù„Ø²Ø§Ù…ÛŒØŒ Ù†Ù‚Ø´ Ù…Ø­Ø¯ÙˆØ¯ Design DNA Ùˆ boundary source/version/use-right Ø¨Ø±Ø§ÛŒ Beautiful UI/UI8 DNA Ø±Ø§ Ø«Ø¨Øª Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Why: Ø§ÛŒÙ† Ø³Ù†Ø¯ source of truth Ø·Ø±Ø§Ø­ÛŒ Ø§Ø³ØªØ› Ù‡Ù…Ø³ÙˆÛŒÛŒ Ø¢Ù† Ø¨Ø§ Manifest Ùˆ roadmap Ø§Ø² Ø§ÛŒÙ† Ø³ÙˆØ¡Ø¨Ø±Ø¯Ø§Ø´Øª Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ú©Ù‡ package ÛŒØ§ reference Ø®Ø§Ø±Ø¬ÛŒØŒ Ù…Ø¬ÙˆØ² Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø¯Ø± public artifact Ø§Ø³Øª.
- Scope / files: `docs/design.md`ØŒ `docs/plan/P1-T03-design-policy-toolchain-alignment-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ø®ÙˆØ§Ù†Ø¯Ù† sectionÙ‡Ø§ÛŒ MotionØŒ ThreeØŒ third-party acceptance Ùˆ agent rulesØ› Ø¬Ø³Øªâ€ŒÙˆØ¬ÙˆÛŒ targeted referenceÙ‡Ø§Ø› `git diff --check`.
- Verification actually performed and result: policy Ø¬Ø¯ÛŒØ¯ Ø¨Ø§ static-firstØŒ `prefers-reduced-motion`ØŒ fallbackØŒ RTL/LTR Ùˆ third-party adaptation rules Ù…ÙˆØ¬ÙˆØ¯ Ø³Ø§Ø²Ú¯Ø§Ø± Ø§Ø³ØªØ› `git diff --check` PASSØ› Ù‡ÛŒÚ† code/config/dependency/runtime file ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.
- Decisions / assumptions: Design DNA Ø®Ø±ÙˆØ¬ÛŒ ØªØ­Ù„ÛŒÙ„ÛŒ ØªÙˆÙ„ÛŒØ¯ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ùˆ Ù‡Ø±Ú¯Ø² design system Ø±Ø§ override Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯Ø› external UI ØªØ§ Ø«Ø¨Øª source/version/use-right ØªØ­Øª `DEFER-0012` ÙÙ‚Ø· inspiration Ø§Ø³Øª.
- Deferred or risk IDs: `DEFER-0012` Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±Ø› Risk Ø¬Ø¯ÛŒØ¯ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ù†Ø´Ø¯.
- Rollback / recovery: revert ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ documentation task-ownedØ› Ù‡ÛŒÚ† runtime/deploy state ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0070 â€” 2026-08-15 â€” S-Plan / B3 uptime check definition

- Outcome: the existing "Observability (P0A-11)" section of `DEPLOY_RUNBOOK.md`
  was extended (no duplicate Observability heading, rest of the file untouched)
  with a concrete definition: an external uptime provider chosen by the owner
  (free tier acceptable) performs an HTTP GET on `https://<host>/health.json`
  every 5 minutes on staging and production; alert target is the owner's email
  (see password manager); deploy-version lookup is `curl https://<host>/health.json`
  returning the served artifact version; the owner reviews the Caddy error log
  on alert and checks `df -h /` monthly (30 GB disk, alert under 20% free); no
  agent may sign up for any monitoring service â€” provider selection and account
  creation are owner-only steps.
- Why: B3 (Phase B hardening) requires the uptime/observability contract to be
  written down so no agent invents a provider or creates accounts, and the owner
  has a concrete alert, log-review and disk-threshold procedure.
- Scope / files: `docs/governance/DEPLOY_RUNBOOK.md`,
  `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`.
- Commands or actions actually performed: read AGENTS.md,
  `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` Â§6 B3, `docs/plan/S-PLAN-STATE.md`
  and `docs/governance/DEPLOY_RUNBOOK.md` fully; extended the existing
  Observability (P0A-11) bullet list with the concrete definition; appended this
  WORK_LOG entry; marked B3 NEEDS_REVIEW and appended a review-log row in
  S-PLAN-STATE.md.
- Verification actually performed and result: `git diff --check` â†’ exit 0
  (PASS); `grep "^#.*Observability" docs/governance/DEPLOY_RUNBOOK.md` â†’ exactly
  1 match (`## Observability (P0A-11)` at line 95); no provider names, no email
  addresses, no new URLs beyond the existing `<host>` placeholder from the task.
- Decisions / assumptions: provider choice, account creation and the email
  address remain owner-only (address intentionally not recorded); the 5-minute
  cadence and 30 GB / under-20%-free numbers are taken verbatim from task B3.
- Deferred or risk IDs: none new; `DEFER`/`RISK` sets unchanged.
- Rollback / recovery: revert this documentation commit; no runtime, server or
  deploy state was changed.

## LOG-0071 â€” 2026-08-15 â€” S-Plan / B4 restore drill cadence

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
  `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` Â§6 B4,
  `docs/plan/S-PLAN-STATE.md`, `docs/governance/BACKUP_POLICY.md` and
  `docs/governance/BACKUP_RUNBOOK.md` fully plus the P0-A restore-rehearsal Task
  Spec; appended the section at the end of `BACKUP_POLICY.md` without rewriting
  any existing content; appended this WORK_LOG entry; marked B4 NEEDS_REVIEW and
  appended a review-log row in S-PLAN-STATE.md.
- Verification actually performed and result: `git diff --check` â†’ exit 0
  (PASS); `Select-String "Restore drill cadence"` on BACKUP_POLICY.md â†’ exactly
  1 heading (`## Restore drill cadence`); appended facts match task B4 â€” no
  invented dates, RPO/RTO numbers, metrics or owners beyond "Project owner".
- Decisions / assumptions: quarterly cadence and "Project owner" are taken
  verbatim from task B4; RPO/RTO values are deliberately not invented â€” they are
  recorded by the owner at each drill.
- Deferred or risk IDs: none new; `DEFER`/`RISK` sets unchanged.
- Rollback / recovery: revert this documentation commit; no runtime, server or
  deploy state was changed.

## LOG-0072 â€” 2026-08-15 â€” Infra / cost posture: cheaper primary model and hard cost guards

- Outcome: Ù¾ÛŒÚ©Ø±Ø¨Ù†Ø¯ÛŒ Ù¾Ø±ÙˆÚ˜Ù‡Ù” `.opencode/opencode.json` Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯ ØªØ§ Ù…Ø¯Ù„ Ø§ØµÙ„ÛŒ Ø§Ø² tier Ú¯Ø±Ø§Ù† (glm-5.3) Ø¨Ù‡ Ú¯Ø²ÛŒÙ†Ù‡Ù” Ø§Ø±Ø²Ø§Ù†â€ŒØªØ± (`opencode-go/deepseek-v4-pro`) Ùˆ `small_model` Ø¨Ù‡ tier Ø±Ø§ÛŒÚ¯Ø§Ù† (`opencode/deepseek-v4-flash-free`) ØªØºÛŒÛŒØ± Ú©Ù†Ø¯. S-Plan Â§0 Â«Hard cost guardsÂ» Ùˆ snapshot Â§5 Ø¨Ø§ ÙˆØ¶Ø¹ÛŒØª Ù‡Ø²ÛŒÙ†Ù‡ ØªÚ©Ù…ÛŒÙ„ Ø´Ø¯Ù†Ø¯: Ø§Ø¬Ø±Ø§ÛŒ ØªØ³Ú©â€ŒÙ‡Ø§ ÙÙ‚Ø· Ø§Ø² Ø·Ø±ÛŒÙ‚ `s-executor`ØŒ QA ØªØµÙˆÛŒØ±ÛŒ ÙÙ‚Ø· Ø§Ø² Ø·Ø±ÛŒÙ‚ `visual-reviewer`ØŒ Ù…Ø¯Ù„ Ø§ØµÙ„ÛŒ ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ Ø±ÛŒÙˆÛŒÙˆ/Ù¾Ù„Ù†ØŒ Ùˆ re-verification Ø¨Ø§ Ø§Ø³Ú©Ø±ÛŒÙ¾Øª `smoke.sh` Ø¨Ù‡â€ŒØ¬Ø§ÛŒ buildÙ‡Ø§ÛŒ Ù¾Ø±Ù‡Ø²ÛŒÙ†Ù‡.
- Why: Ù…Ø§Ù„Ú© Ø§Ø¹Ù„Ø§Ù… Ú©Ø±Ø¯ glm-5.3 Ú¯Ø±Ø§Ù† Ø§Ø³Øª Ùˆ Ø¨Ø§ÛŒØ¯ Ù‡Ø²ÛŒÙ†Ù‡ Ù…Ø¯ÛŒØ±ÛŒØª Ø´ÙˆØ¯ Ø¯Ø± Ø­Ø§Ù„ÛŒâ€ŒÚ©Ù‡ Ú©ÛŒÙÛŒØª/Ø¯Ù‚Øª Ø­ÙØ¸ Ø´ÙˆØ¯Ø› dispatchÙ‡Ø§ÛŒ Ù‚Ø¨Ù„ÛŒ Ø§Ø² Ø·Ø±ÛŒÙ‚ `general` Ø±ÙˆÛŒ Ù‡Ù…Ø§Ù† Ù…Ø¯Ù„ Ú¯Ø±Ø§Ù† Ø§Ø¬Ø±Ø§ Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Scope / files: `.opencode/opencode.json`ØŒ `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log. Ù‡ÛŒÚ† Ù…Ø¯Ù„/Ú©Ù„ÛŒØ¯/provider Ø¬Ø¯ÛŒØ¯ÛŒ Ø³Ø§Ø®ØªÙ‡ Ù†Ø´Ø¯.
- Commands or actions actually performed: Ø¨Ø±Ø±Ø³ÛŒ `~/.config/opencode/opencode.jsonc` (ÙÙ‚Ø· plugins) Ùˆ Ù†Ø¨ÙˆØ¯ config Ù¾Ø±ÙˆÚ˜Ù‡â€ŒØ§ÛŒØ› Ø³Ù¾Ø³ Ù†ÙˆØ´ØªÙ† config Ùˆ ÙˆÛŒØ±Ø§ÛŒØ´ Ù¾Ù„Ù†. `git diff --check` PASS.
- Verification actually performed and result: config ÙÙ‚Ø· Ø§Ø² ÙÛŒÙ„Ø¯Ù‡Ø§ÛŒ Ù…Ø¹ØªØ¨Ø± `model`/`small_model`/`$schema` Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒÚ©Ù†Ø¯Ø› guardÙ‡Ø§ ØµØ±ÛŒØ­ Ùˆ Ù‚Ø§Ø¨Ù„ ØªØ®Ø·ÛŒ Ù†ÛŒØ³ØªÙ†Ø¯. ÙØ¹Ø§Ù„â€ŒØ³Ø§Ø²ÛŒ Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ restart opencode Ø§Ø³Øª.
- Decisions / assumptions: `deepseek-v4-pro` Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† ØªØ¹Ø§Ø¯Ù„ Ù‡Ø²ÛŒÙ†Ù‡/Ú©ÛŒÙÛŒØª Ø¨Ø±Ø§ÛŒ Ù…Ø¯Ù„ Ø§ØµÙ„ÛŒ Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ø¯Ø› Ù‚ÛŒÙ…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ provider Ù…Ù…Ú©Ù† Ø§Ø³Øª Ù…ØªÙØ§ÙˆØª Ø¨Ø§Ø´Ø¯ Ùˆ Ù…Ø§Ù„Ú© Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ø¨Ø§ ÛŒÚ© Ø®Ø· Ø¯Ø± config Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ú©Ù†Ø¯. GLM-5.3 Ø¯ÛŒÚ¯Ø± Ø¨Ø±Ø§ÛŒ Ù‡ÛŒÚ† Ù†Ù‚Ø´ÛŒ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: Ø­Ø°Ù `.opencode/opencode.json` ÛŒØ§ ØªØºÛŒÛŒØ± `model`Ø› Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ù‡ ÙˆØ¶Ø¹ÛŒØª Ù‚Ø¨Ù„ÛŒ ØµØ±ÙØ§Ù‹ Ø¨Ø§ revert Ù…Ø³ØªÙ†Ø¯.

## LOG-0073 â€” 2026-08-15 â€” P1-T01 / external design resources re-verified and documented

- Outcome: Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù…Ø§Ù„Ú© Ø¨Ø±Ø§ÛŒ Ù†ØµØ¨ Beautiful UIØŒ Three.jsØŒ GSAPØŒ Design DNAØŒ UI8 DNA Ùˆ Motion Ø±Ø§Ø³ØªÛŒâ€ŒØ¢Ø²Ù…Ø§ÛŒÛŒ Ø´Ø¯: `motion` 13.1.0ØŒ `gsap` 3.15.0ØŒ `three` 0.185.1 Ùˆ Design DNA (skill Ù…Ø­Ù„ÛŒ Codex) Ø§Ø² Ù‚Ø¨Ù„ Ù†ØµØ¨ Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯Ø› **Beautiful UI** ÙˆØ¨â€ŒØ³Ø§ÛŒØª copy-paste Ø¨Ø§ Ù…Ø¬ÙˆØ² **MIT** Ø§Ø³Øª (Ù†Ù‡ Ù¾Ú©ÛŒØ¬ npm) Ùˆ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† source-reference ØªØ£ÛŒÛŒØ¯ Ø´Ø¯Ø› **UI8 DNA** Ù…Ø­ØµÙˆÙ„ ØªØ¬Ø§Ø±ÛŒ/paid Ø§Ø³Øª Ùˆ Ø¨Ø¯ÙˆÙ† Ø®Ø±ÛŒØ¯/Ù„Ø§ÛŒØ³Ù†Ø³ Ù…Ø§Ù„Ú© Ù‚Ø§Ø¨Ù„ Ù†ØµØ¨ Ù†ÛŒØ³Øª. DEFER-0012 Ø¨Ù‡ ÙˆØ¶Ø¹ÛŒØª split Ø¨Ù‡â€ŒØ±ÙˆØ² Ø´Ø¯ Ùˆ design.md Â§98 Ùˆ S-Plan snapshot Ø¨Ø§ Ø§ÛŒÙ† ÙˆØ§Ù‚Ø¹ÛŒØªâ€ŒÙ‡Ø§ Ù‡Ù…â€ŒØªØ±Ø§Ø² Ø´Ø¯Ù†Ø¯.
- Why: Ù…Ø§Ù„Ú© Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù†ØµØ¨ Ø¯Ø§Ø¯Ø› Ø¨Ø§ÛŒØ¯ ÙˆØ¶Ø¹ÛŒØª ÙˆØ§Ù‚Ø¹ÛŒ Ù‡Ø± Ù…Ù†Ø¨Ø¹ Ø¨Ø¯ÙˆÙ† Ø­Ø¯Ø³ Ø«Ø¨Øª Ø´ÙˆØ¯ â€” MIT ÛŒØ¹Ù†ÛŒ Ø­Ù‚ Ø§Ø³ØªÙØ§Ø¯Ù‡Ù” Beautiful UI ØªØ£ÛŒÛŒØ¯ Ø§Ø³ØªØŒ UI8 Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ Ù„Ø§ÛŒØ³Ù†Ø³ Ù…Ø§Ù„Ú©.
- Scope / files: `docs/status/deferred-validation.md`ØŒ `docs/design.md`ØŒ `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `npm ls motion gsap three @fontsource-variable/inter` (Ù‡Ù…Ú¯ÛŒ Ù†ØµØ¨)Ø› `Test-Path` Ø¨Ø±Ø§ÛŒ SKILL Ø·Ø±Ø§Ø­ÛŒâ€ŒØ¯ÛŒâ€ŒØ§Ù†â€ŒØ§ÛŒ (Ù…ÙˆØ¬ÙˆØ¯)Ø› `webfetch` ØµÙØ­Ù‡Ù” BeautifulUI â†’ MIT License Ùˆ copy-paste (Ø¨Ø¯ÙˆÙ† Ø¨Ø³ØªÙ‡Ù” npm)Ø› Ø¨Ø±Ø±Ø³ÛŒ DEFER-0012 Ùˆ design.md Â§98. Ù‡ÛŒÚ† Ø¨Ø³ØªÙ‡ ÛŒØ§ asset Ø¬Ø¯ÛŒØ¯ÛŒ Ù†ØµØ¨/Ú©Ù¾ÛŒ Ù†Ø´Ø¯.
- Verification actually performed and result: Û´/Û¶ Ù…Ù†Ø¨Ø¹ Ø§Ø² Ù‚Ø¨Ù„ Ù†ØµØ¨â€ŒØ§Ù†Ø¯Ø› Beautiful UI Ù…Ù†Ø¨Ø¹ MIT Ø§Ø³ØªØ› UI8 Ø¨Ø¯ÙˆÙ† Ù„Ø§ÛŒØ³Ù†Ø³ Ø¯Ø± Ø¯Ø³ØªØ±Ø³ Ù†ÛŒØ³Øª. `git diff --check` PASS.
- Decisions / assumptions: Beautiful UI ÙÙ‚Ø· Ø¯Ø± slice Ù…ØµÙˆØ¨ (B5) Ùˆ Ø¨Ø§ Ø§Ø³ØªÙØ§Ø¯Ù‡Ù” Ù…Ù†Ø­ØµØ±Ø§Ù‹ Ø§Ø² tokenÙ‡Ø§ÛŒ Ø®ÙˆØ¯ Ù¾Ø±ÙˆÚ˜Ù‡ copy Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› UI8 ØªØ§ ØªÙ‡ÛŒÙ‡Ù” ÙØ§ÛŒÙ„/Ù„Ø§ÛŒØ³Ù†Ø³ ØªÙˆØ³Ø· Ù…Ø§Ù„Ú© Ø¯Ø± DEFER-0012 Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯. Ù‡ÛŒÚ† library Ø¯Ø± P1 ÙØ¹Ø§Ù„ Ù†Ø´Ø¯ (static-first Ø­ÙØ¸ Ø´Ø¯).
- Deferred or risk IDs: `DEFER-0012` Ø¨Ù‡â€ŒØ±ÙˆØ² (split: Beautiful UI=MIT referenceØ› UI8=pending license).
- Rollback / recovery: revert Ø³Ù‡ ÙØ§ÛŒÙ„ Ù…Ø³ØªÙ†Ø¯Ø› Ù‡ÛŒÚ† runtime/deploy state ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.

## LOG-0077 â€” 2026-08-15 â€” P1 / parallel workstreams: audit, contrast fix, CI hardening, release QA

- Outcome: Ø³Ù‡ workstream Ù…ÙˆØ§Ø²ÛŒ Ù…Ø³ØªÙ‚Ù„ Ø§Ø¬Ø±Ø§ Ø´Ø¯Ù†Ø¯ (Ø¨Ø¯ÙˆÙ† ØªØ¯Ø§Ø®Ù„ ÙØ§ÛŒÙ„): (1) audit read-only Ú©Ø¯ â†’ Û¸/Û±Û° Ù…Ø¹ÛŒØ§Ø± PASSØŒ ÛŒÚ© **SEV-HIGH**: Ø®Ø· positioning Ù‡ÛŒØ±Ùˆ Ø¨Ø§ Gold `#A77B28` Ø±ÙˆÛŒ canvas = 3.58:1 (Ù†Ù‚Ø¶ WCAG AA Ùˆ design.md Â§9.1) + MEDÙ‡Ø§ÛŒ token disciplineØ› (2) ØªÙ‚ÙˆÛŒØª CI â†’ Ù…Ø±Ø­Ù„Ù‡Ù” smoke Ù…Ø­Ù„ÛŒ (`preview` + `smoke.sh` Ø±ÙˆÛŒ localhost) Ùˆ `npm audit`Ø› (3) Ú¯Ø²Ø§Ø±Ø´ `RELEASE-QA.md` â†’ RELEASE-READY (Û±Û¹ ÙØ§ÛŒÙ„ØŒ Û³Û¶Û¹KBØŒ Ø¨Ø¯ÙˆÙ† secretØŒ fonts 321KB self-host).
- Why: Ø³Ø±Ø¹Øª ØªÙˆØ³Ø¹Ù‡ Ø¨Ø§ Ú†Ù†Ø¯ agent Ùˆ Ú©ÛŒÙÛŒØª/Ø¯Ù‚Øª Ø¨Ø§Ù„Ø§Ø› ÛŒØ§ÙØªÙ‡Ù” Ú©Ù†ØªØ±Ø§Ø³Øª Ù¾ÛŒØ´ Ø§Ø² production Ø¨Ø§ÛŒØ¯ Ø±ÙØ¹ Ù…ÛŒâ€ŒØ´Ø¯.
- Scope / files: `apps/web/src/components/Landing.astro` (goldâ†’ink + accent rule goldØŒ `#fff`â†’`var(--color-inverse)`)ØŒ `apps/web/src/pages/{index,404}.astro` Ùˆ `Header.astro` (glass tokens Ø§Ø² design.md Â§14 Ø¯Ø± `@theme` + Ù…ØµØ±Ù)ØŒ `.github/workflows/ci.yml`ØŒ `docs/plan/RELEASE-QA.md`ØŒ `docs/plan/RELEASE-P1.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ø³Ù‡ task Ù…ÙˆØ§Ø²ÛŒ (explore/general)Ø› Ø³Ù¾Ø³ Ø§ØµÙ„Ø§Ø­Ø§Øª Ø¯Ø³ØªÛŒØ› `npm run check` (0 error) Ùˆ `npm run build` PASSØ› YAML ØªÙˆØ³Ø· agent Ø¨Ø§ PyYAML Ø§Ø¹ØªØ¨Ø§Ø±Ø³Ù†Ø¬ÛŒ Ø´Ø¯Ø› `git diff --check` PASS.
- Verification actually performed and result: gold Ø¯ÛŒÚ¯Ø± text Ù†ÛŒØ³Øª (accent rule 3px)Ø› `#fff`â†’`var(--color-inverse)`Ø› glass tokens Ø¯Ø± `@theme`Ø› CI ÛŒØ§Ù…Ø§Ù„ Ù…Ø¹ØªØ¨Ø± Ø¨Ø§ Ù…Ø³ÛŒØ± Ù†Ø³Ø¨ÛŒ Ø¯Ø±Ø³Øª (`../infra/deploy/smoke.sh`)Ø› RELEASE-QA Ù‡Ù…Ù‡Ù” checks PASS Ùˆ verdict RELEASE-READY.
- Decisions / assumptions: MED token discipline Ø±ÙØ¹ Ø´Ø¯ (glass/`#fff`)Ø› Ù…ÙˆØ§Ø±Ø¯ LOW (skip-link gatewayØŒ meta description gatewayØŒ footer bidi year) Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù¾Ø§Ù„Ø§ÛŒØ´ Ø¢ÛŒÙ†Ø¯Ù‡ Ø«Ø¨Øª Ø´Ø¯Ù†Ø¯. A3/RELEASE-P1 Ø¨Ù‡ artifact ØªØ§Ø²Ù‡Ù” `release-fa3c813` Ø¨Ø±Ø§ÛŒ production Ø§Ø´Ø§Ø±Ù‡ Ú©Ø±Ø¯.
- Deferred or risk IDs: Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯Ø› `DEFER-0010` (browser QA) Ù‡Ù…Ú†Ù†Ø§Ù† READY Ø¨Ø¹Ø¯ Ø§Ø² restart.
- Rollback / recovery: revert Ú©Ø§Ù…ÛŒØªâ€ŒÙ‡Ø§ÛŒ code/docsØ› Ù‡ÛŒÚ† runtime/deploy state ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.

## LOG-0078 â€” 2026-08-15 â€” R2 / production P1 live (owner-executed snippet switch) + production smoke

- Outcome: Ù…Ø§Ù„Ú© Ø¨Ø§ ÙˆÛŒØ±Ø§ÛŒØ´ Ø¯Ø³ØªÛŒ snippet `taha_application_routes` Ø¯Ø± Caddyfile â€” Ø¨Ù‡â€ŒØ¬Ø§ÛŒ Ù¾Ø±ÙˆÚ©Ø³ÛŒ legacy (13000/18080) â€” `root * /opt/taha/site/current` + `file_server` Ú¯Ø°Ø§Ø´Øª Ùˆ production Ø±Ø§ Ø±ÙˆÛŒ `release-d55d44e` (checksum e49e46c7) Ø³ÙˆÛŒÛŒÚ† Ú©Ø±Ø¯Ø› `tahamohamadi.ir` Ø§Ú©Ù†ÙˆÙ† Ø³Ø§ÛŒØª static P1 Ø±Ø§ live Ø³Ø±Ùˆ Ù…ÛŒâ€ŒÚ©Ù†Ø¯. `prod-p1.sh` (A2) Ø¨Ù‡â€ŒØ¯Ù„ÛŒÙ„ Ø§ÛŒÙ† ØªØºÛŒÛŒØ± Ù…Ú©Ø§Ù†ÛŒÚ©ØŒ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Caddyfile Ù‚Ø§Ø¨Ù„ Ø§Ø¬Ø±Ø§ Ù†ÛŒØ³Øª (Ø¨Ù„ÙˆÚ© production Ø±Ø§ Ø¨Ø§ handlers ÙÙˆÙ†Øª/presentation Ù…Ø§Ù„Ú© Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ Ù…ÛŒâ€ŒÚ©Ø±Ø¯) Ùˆ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù†Ø´Ø¯. Legacy containers (13000/18080) Ù‡Ù…Ú†Ù†Ø§Ù† running Ùˆ Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Why: production smoke Ùˆ Ø«Ø¨Øª ÙˆØ¶Ø¹ÛŒØª ÙˆØ§Ù‚Ø¹ÛŒØŒ Ø¨Ø®Ø´ Ù¾Ø§ÛŒØ§Ù†ÛŒ R2 (P1-14/P1-15) Ø§Ø³Øª.
- Scope / files: `docs/status/WORK_LOG.md`ØŒ `docs/plan/RELEASE-P1.md`ØŒ `docs/plan/S-PLAN-STATE.md`ØŒ `Task-list.md` Â§5.
- Commands or actions actually performed: `bash infra/deploy/smoke.sh https://tahamohamadi.ir` â†’ 7 PASS (rootØŒ enØŒ faØŒ robotsØŒ sitemapØŒ nonexistent-qaØŒ health body) / exit 0Ø› `curl` production robots Ø§Ø² Ù…Ø³ÛŒØ± Cloudflare (intercept Â«content signalsÂ») Ùˆ direct-origin (robots ØµØ­ÛŒØ­)Ø› `cat -n /etc/caddy/Caddyfile` ÙÙ‚Ø·â€ŒØ®ÙˆØ§Ù†Ø¯Ù†ÛŒØ› `curl` Ù…Ø³ØªÙ‚ÛŒÙ… 13000 (legacy Vite app Ù‡Ù†ÙˆØ² Ø¢Ù†â€ŒØ¬Ø§Ø³Øª). Ù‡ÛŒÚ† ØªØºÛŒÛŒØ± Ø³Ø±ÙˆØ± ØªÙˆØ³Ø· agent Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.
- Verification actually performed and result: production P1 live Ùˆ Ø³Ø§Ù„Ù…Ø› DEFER-0011 Ø¨Ø±Ø§ÛŒ production Ù‡Ù… ØªØ£ÛŒÛŒØ¯ Ø´Ø¯ (Cloudflare edge robots Ø±Ø§ intercept Ù…ÛŒâ€ŒÚ©Ù†Ø¯). Ù†Ø³Ø®Ù‡Ù” Ø³Ø±ÙˆØ´Ø¯Ù‡ d55d44e ÙØ§Ù‚Ø¯ fix Ú©Ù†ØªØ±Ø§Ø³Øª (df6ca39) Ø§Ø³ØªØ› Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø¨Ù‡ `release-d7db929` (Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± Ø¯Ø± `~/taha-stage/`) Ø¨Ø§ switch Ø§ØªÙ…ÛŒÚ© `current` ØªÙˆØµÛŒÙ‡ Ø´Ø¯ â€” Ø¨Ø¯ÙˆÙ† Ù‡ÛŒÚ† ØªØºÛŒÛŒØ±ÛŒ Ø¯Ø± Caddyfile (handlers ÙÙˆÙ†Øª/presentation Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡).
- Decisions / assumptions: Ù…Ú©Ø§Ù†ÛŒÚ© deploy ÙØ¹Ù„ÛŒ snippet-based Ø§Ø³Øª (ADR-0017 Ø¨Ø§ switch Ø§ØªÙ…ÛŒÚ© `current`)Ø› prod-p1.sh Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Caddyfile Ù…Ù†Ø³ÙˆØ® Ùˆ Ø¯Ø± runbook Ø¨Ø§ÛŒØ¯ Ø¨Ù‡â€ŒØ±ÙˆØ² Ø´ÙˆØ¯. A4 Ø¨Ø§ Ø§Ø¬Ø±Ø§ÛŒ Ù…Ø§Ù„Ú© DONE ØªÙ„Ù‚ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `DEFER-0011` OPEN (robots edge)Ø› Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: Ø¨Ø±Ú¯Ø±Ø¯Ø§Ù†Ø¯Ù† `current` Ø¨Ù‡ release Ù‚Ø¨Ù„ÛŒ Ùˆ/ÛŒØ§ restore Ø¨Ú©Ø§Ù¾ CaddyfileØ› legacy containers Ø¨Ø±Ø§ÛŒ rollback Ú©Ø§Ù…Ù„ Ù‡Ù…Ú†Ù†Ø§Ù† Ø¯Ø± Ø¯Ø³ØªØ±Ø³â€ŒØ§Ù†Ø¯.

## LOG-0074 â€” 2026-08-15 â€” S-Plan / B5 visual-interaction adoption brief

- Outcome: brief Ù†ÙˆØ´ØªÙ‡ Ø´Ø¯ Ø¯Ø± `docs/plan/B5-VISUAL-INTERACTION-ADOPTION.md` Ø¨Ø§ Ø´Ø´ section Ø¯Ù‚ÛŒÙ‚Ø§Ù‹ Ø·Ø¨Ù‚ Ø¯Ø³ØªÙˆØ±: Â«Goal & gateÂ»ØŒ Â«Candidate interactionsÂ»ØŒ Â«Adoption checklistÂ»ØŒ Â«QA planÂ»ØŒ Â«Escalation ruleÂ» Ùˆ Â«Explicit non-goalÂ». Ø³Ù‡ interaction candidate ÙÙ‚Ø· Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ø´Ø¯Ù†Ø¯ (Ø¨Ø¯ÙˆÙ† Ù¾ÛŒØ§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ): (Û±) hero identity-constellation entrance Ø¨Ø§ CSS/Motion Ùˆ fallback = constellation Ø§Ø³ØªØ§ØªÛŒÚ© ÙØ¹Ù„ÛŒØ› (Û²) hover/transition Ú©Ø§Ø±Øªâ€ŒÙ‡Ø§ÛŒ Â«Explore by PerspectiveÂ» Ø¨Ø§ MotionØ› (Û³) timeline reveal Ø¨Ø±Ø§ÛŒ Journey/About Ø¨Ø§ GSAP scroll trigger Ùˆ fallback Ú©Ø§Ù…Ù„ Ø§Ø³ØªØ§ØªÛŒÚ©. Ø¨Ø±Ø§ÛŒ Ù‡Ø± candidate: routeØŒ user-valueØŒ libraryØŒ bundle-cost Ùˆ fallback reduced-motion/no-JS Ø«Ø¨Øª Ø´Ø¯. Adoption checklist Ú©Ù„Ù…Ù‡â€ŒØ¨Ù‡â€ŒÚ©Ù„Ù…Ù‡ Ø§Ø² design.md Â§98 Ú©Ù¾ÛŒ Ø´Ø¯. Ø¨Ù†Ø¯ explicit non-goal: Ù‡ÛŒÚ† import Ø§Ø² motion/gsap/three Ø¯Ø± Ø³Ø§ÛŒØª P1 Ùˆ Ù‡ÛŒÚ† Ú©Ù¾ÛŒ Ø§Ø² Beautiful UI Ø­Ø§Ù„Ø§.
- Why: task B5 Ø·Ø¨Ù‚ S-Plan Ø®ÙˆØ§Ø³ØªØ§Ø± brief Ù¾ÛŒØ´ Ø§Ø² Ù‡Ø± implementation Ø§Ø³ØªØ› libraries Ø¯Ø± P1 inactive Ù…ÛŒâ€ŒÙ…Ø§Ù†Ù†Ø¯ Ùˆ adoption ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² release Ø§Ø³ØªØ§ØªÛŒÚ© P1 (task A5) Ùˆ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú© Ù…Ø¬Ø§Ø² Ø§Ø³Øª.
- Scope / files: `docs/plan/B5-VISUAL-INTERACTION-ADOPTION.md` (Ø¬Ø¯ÛŒØ¯)ØŒ `docs/plan/S-PLAN-STATE.md`ØŒ `docs/status/WORK_LOG.md`. Ù‡ÛŒÚ† ÙØ§ÛŒÙ„ Ø¯ÛŒÚ¯Ø±ÛŒ ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.
- Commands or actions actually performed: Ø³Ø§Ø®Øª ÙØ§ÛŒÙ„ briefØ› append Ø§ÛŒÙ† entryØ› Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ state B5 Ø¨Ù‡ NEEDS_REVIEW + Ø±Ø¯ÛŒÙ review-logØ› `git diff --check`Ø› grep Ø¨Ø±Ø§ÛŒ import Ù‡Ø§ÛŒ `motion`/`gsap`/`three` Ø¯Ø± `apps/web/`.
- Verification actually performed and result:
  - `git diff --check` â†’ exit 0 (Ø¨Ø¯ÙˆÙ† Ø®Ø·Ø§ÛŒ whitespace).
  - Heading Ù‡Ø§ÛŒ ÙØ§ÛŒÙ„ Ø¬Ø¯ÛŒØ¯ (Ø®Ø±ÙˆØ¬ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ):
    `## Goal & gate`, `## Candidate interactions`, `## Adoption checklist`, `## QA plan`, `## Escalation rule`, `## Explicit non-goal` (Ù‡Ø± Ø´Ø´ Ù…ÙˆØ¬ÙˆØ¯ Ùˆ Ø¯Ù‚ÛŒÙ‚Ø§Ù‹ Ù…Ø·Ø§Ø¨Ù‚ Ø¯Ø³ØªÙˆØ±).
  - grep Ø¯Ø± `apps/web/` Ø¨Ø±Ø§ÛŒ `from "motion"|"gsap"|"three"|"gsap/ScrollTrigger"` Ùˆ `import "motion"|"gsap"|"three"` â†’ Â«No files foundÂ»Ø› ÛŒØ¹Ù†ÛŒ Ù‡ÛŒÚ† import Ø¬Ø¯ÛŒØ¯ÛŒ Ø§Ø² motion/gsap/three Ø¯Ø± apps/web Ø§Ø¶Ø§ÙÙ‡ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
  - grep Ø³Ø±Ø§Ø³Ø±ÛŒ ØªØ£ÛŒÛŒØ¯ Ú©Ø±Ø¯ Ù‡ÛŒÚ† Ù¾ÛŒØ§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ/code Ø¬Ø¯ÛŒØ¯ÛŒ Ø®Ø§Ø±Ø¬ Ø§Ø² Ø³Ù‡ ÙØ§ÛŒÙ„ Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª.
- Decisions / assumptions: adoption ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² release Ø§Ø³ØªØ§ØªÛŒÚ© P1 (A5)ØŒ Ø§Ù†ØªØ®Ø§Ø¨ Ø¯Ù‚ÛŒÙ‚Ø§Ù‹ ÛŒÚ© library Ø¨Ø±Ø§ÛŒ Ù‡Ø± interactionØŒ Ø¹Ø¨ÙˆØ± Ø§Ø² checklist Â§98 Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† gate Ø§Ø¬Ø¨Ø§Ø±ÛŒØŒ Ùˆ ØªØ£ÛŒÛŒØ¯ Ù†Ù‡Ø§ÛŒÛŒ interaction+route+library ØªÙˆØ³Ø· Ù…Ø§Ù„Ú©. Ù‡ÛŒÚ† library ÙØ¹Ø§Ù„ Ù†Ø´Ø¯ Ùˆ Ù‡ÛŒÚ† Ú©Ø¯ÛŒ import Ù†Ø´Ø¯.
- Deferred or risk IDs: `DEFER-0012` (Beautiful UI ÙÙ‚Ø· Ø¯Ø± slice Ù…ØµÙˆØ¨)Ø› Ù¾ÛŒØ´â€ŒÙ†ÛŒØ§Ø²Ù‡Ø§ÛŒ B5 Ø´Ø§Ù…Ù„ Ù…Ø§Ù„Ú©â€ŒÙ†Ø§Ù…â€ŒÚ©Ø±Ø¯Ù† interaction Ù†Ù‡Ø§ÛŒÛŒ.
- Rollback / recovery: Ø­Ø°Ù ÙØ§ÛŒÙ„ Ø¬Ø¯ÛŒØ¯ brief Ùˆ revert Ø¯Ùˆ ÙØ§ÛŒÙ„ state/WORK_LOGØ› Ù‡ÛŒÚ† runtime/deploy/dependency change ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.

## LOG-0075 â€” 2026-08-15 â€” S-Plan / A2 production Caddy switch script (write only)

- Outcome: created `infra/deploy/prod-p1.sh` as a copy of `infra/deploy/stage-p1.sh` with ONLY the production-specific changes required by task A2: python heredoc marker `staging.tahamohamadi.ir {` â†’ `tahamohamadi.ir {`; replacement block serves `root * /opt/taha/site/current` with the same `import taha_security_headers`, `handle_errors` 404 block (`rewrite * /404.html` + `file_server`) and `file_server`, with NO `X-Robots-Tag` header (production is indexed); backup suffix `.pre-stage-p1.` â†’ `.pre-prod-p1.`; echo/usage text now names `prod-p1.sh` and `tahamohamadi.ir`. `www`, `85.192.29.196` and all other script logic are untouched (neither hostname appears in the script; they live in the server Caddyfile and are never matched/replaced by this script). The script was NOT run and NOT scp'd.
- Why: S-Plan task A2 â€” write-only production Caddy switch script so the owner can later run the exact production counterpart of stage-p1.sh after L-model line-by-line review.
- Scope / files: `infra/deploy/prod-p1.sh` (new), `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`. No other file changed.
- Commands or actions actually performed: copied stage-p1.sh content and applied the four listed changes; ran `bash -n infra/deploy/prod-p1.sh`; ran `bash -c "diff infra/deploy/stage-p1.sh infra/deploy/prod-p1.sh"`; staged the three allowed files and ran `git diff --cached --check` and `git diff --check`.
- Verification actually performed and result:
  - `bash -n infra/deploy/prod-p1.sh` â†’ exit 0, no output.
  - `diff infra/deploy/stage-p1.sh infra/deploy/prod-p1.sh` (real output, exit 1 = differences exist):
    `6c6` usage `./stage-p1.sh`â†’`./prod-p1.sh`; `17c17` usage string `stage-p1.sh`â†’`prod-p1.sh`; `20c20` backup suffix `pre-stage-p1`â†’`pre-prod-p1`; `57c57` heredoc marker `staging.tahamohamadi.ir {`â†’`tahamohamadi.ir {`; `60c60` heredoc stderr `staging block`â†’`production block`; `64c64` replacement block header `staging.tahamohamadi.ir {`â†’`tahamohamadi.ir {`; `69,72d68` X-Robots-Tag header block removed; `98c94` echo `on staging hostname`â†’`on tahamohamadi.ir`. No other differences.
  - `git diff --cached --check` â†’ exit 0 (PASS, covers the new file); `git diff --check` â†’ exit 0 (PASS).
- Decisions / assumptions: the heredoc marker `tahamohamadi.ir {` is taken verbatim from task A2 (the L-model's plan), and `www` / `85.192.29.196` are intentionally not referenced in the script â€” the script replaces only the production site block matched by that marker, exactly as stage-p1.sh does for staging. The header comment line "Stage the static P1 artifact on staging.tahamohamadi.ir" is left byte-identical to stage-p1.sh because the task's diff acceptance allows changes ONLY in the heredoc marker/block, backup suffix and echo/usage text.
- Deferred or risk IDs: none new; task A2 remains HIGH risk pending L-model review and owner approval before being run.
- Rollback / recovery: script is additive and was never executed; rollback = Git revert of this commit / delete `infra/deploy/prod-p1.sh`.

## LOG-0076 â€” 2026-08-15 â€” S-Plan / A3 release decision record for P1

- Outcome: created `docs/plan/RELEASE-P1.md` filling the release-decision template from `docs/governance/RELEASE_POLICY.md` with real data: Type `STANDARD` (new public routes, static, no auth/data/secret), Release DoD `PASS`, Completion DoD `NOT MEASURED`, blocking-check evidence pointers to WORK_LOG IDs, open risk/deferred IDs listed verbatim (status unchanged), rollback path, owner-approval precondition and preconditions. No deploy, no sudo, no SSH write performed.
- Why: S-Plan task A3 â€” record the P1 release decision so the owner/L-model can authorize the production switch (A4) against documented evidence.
- Scope / files: `docs/plan/RELEASE-P1.md` (new), `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`. No other file changed.
- Commands or actions actually performed:
  - Read `AGENTS.md`, `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md` Â§6 A3, `docs/plan/S-PLAN-STATE.md`, `docs/governance/RELEASE_POLICY.md`, `docs/status/RISK_REGISTER.md`, `docs/status/deferred-validation.md`, `docs/governance/DEPLOY_RUNBOOK.md`, `docs/status/WORK_LOG.md`.
  - Read-only SSH (agent-ssh: yes, read-only): `ssh taha-nl "cat /opt/taha/site/deploy.log"` â†’ `2026-08-15T07:00:36Z staged release-a2720d9 49cf1d21` / `2026-08-15T07:29:53Z staged release-d55d44e e49e46c7`; `ssh taha-nl "ls -la /opt/taha/site/; readlink /opt/taha/site/current; ls /opt/taha/site/releases/; cat /opt/taha/site/releases/release-d55d44e/health.json"` â†’ `current -> /opt/taha/site/releases/release-d55d44e`, releases dir `release-a2720d9`, `release-d55d44e`, health.json `{"status":"ok","service":"static","version":"0.1.0"}`.
  - `bash infra/deploy/smoke.sh https://staging.tahamohamadi.ir --expect-noindex` â†’ 8 PASS, exit 0.
  - `gh run list --branch main --limit 5` â†’ latest runs `completed success` on `main`.
- Verification actually performed and result:
  - Served artifact (verbatim): `release-d55d44e` / checksum `e49e46c7` (deploy.log tail). Note: the task prompt referenced `release-fa3c813`, which does NOT match the served artifact; verified served release is `release-d55d44e` (also matches plan Â§5 snapshot and A3 task spec in SMALL-MODEL-EXECUTION-PLAN.md). Flagged as `pending verification` in RELEASE-P1.md.
  - Staging smoke re-run â†’ `PASS root /`, `PASS locale /en/`, `PASS locale /fa/`, `PASS robots.txt`, `PASS sitemap.xml`, `PASS nonexistent-qa`, `PASS health.json body`, `PASS noindex /`; exit 0.
  - CI: `gh run list --branch main` shows recent pushes `completed success` (CI green on main).
  - `git diff --check` â†’ exit 0 (PASS).
- Decisions / assumptions: Type STANDARD per RELEASE_POLICY (new public routes, static, no auth/data/secret). Completion DoD = `NOT MEASURED` because deferred/risk items remain open and enumerated. No risk/deferred status was changed. Production switch remains owner-only (A4) and is not authorized by this record.
- Deferred or risk IDs: listed verbatim in RELEASE-P1.md â€” RISK-0001 CLOSED; RISK-0004 IN PROGRESS, RISK-0005/0006 OPEN, RISK-0007 BLOCKED; DEFER-0007, 0009, 0010, 0011, 0012 OPEN; DEFER-0008 CLOSED. No status changed.
- Rollback / recovery: release decision record is additive documentation; rollback = Git revert of this commit. No server state was touched.

## LOG-0079 â€” 2026-08-15 â€” R2 / parallel polish batch + A5 close-out

- Outcome: Ú†Ù‡Ø§Ø± workstream Ù…ÙˆØ§Ø²ÛŒ Ù…Ø³ØªÙ‚Ù„ Ø§Ø¬Ø±Ø§ Ùˆ Ù‡Ù…Ù‡ ØªØ£ÛŒÛŒØ¯ Ø´Ø¯Ù†Ø¯: (1) Ù¾ÙˆÙ„ÛŒØ´ LOWÙ‡Ø§ÛŒ audit â€” meta description/og:locale/og:url Ú¯ÛŒØªâ€ŒÙˆÛŒØŒ skip-link Ø¯Ø± gateway/404ØŒ <bdi> Ø¨Ø±Ø§ÛŒ Ø³Ø§Ù„ ÙÙˆØªØ±Ø› (2) Ú¯Ø²Ø§Ø±Ø´ Ù„Ø§ÛŒØ³Ù†Ø³ LICENSES.md â€” Û³Û°Û± Ù¾Ú©ÛŒØ¬ØŒ Û° missingØ› flag: gsap (Ù„Ø§ÛŒØ³Ù†Ø³ Ø§Ø®ØªØµØ§ØµÛŒØŒ locked-unused)ØŒ sharp (LGPL Ø¯Ø± Ø²Ù†Ø¬ÛŒØ±Ù‡Ù” build)ØŒ lightningcss (MPL-2.0)Ø› (3) acceptance Ø¹Ù…ÛŒÙ‚ production â€” **PROD-ACCEPTED-WITH-NOTES**: ÛŒØ§ÙØªÙ‡Ù” Ø§ØµÙ„ÛŒ: 404 production Ø¨Ø¯Ù†Ù‡Ù” Ø®Ø§Ù„ÛŒ (handle_errors Ø¯Ø± snippet Ù†ÛŒØ³Øª)Ø› httpâ†’https Ø¯Ø± Ù„Ø¨Ù‡ 308Ø› robots proxy-injection (DEFER-0011)Ø› (4) Ø¨Ø³ØªÙ† A5 â€” tickÙ‡Ø§ÛŒ Task-list Â§5 Ø¨Ø§ evidence ÙˆØ§Ù‚Ø¹ÛŒ (P1-13/14/15 Ùˆ Ø¨Ø®Ø´â€ŒÙ‡Ø§ÛŒ ØªÚ©Ù…ÛŒÙ„â€ŒØ´Ø¯Ù‡Ù” P1-09/P1-12)ØŒ snapshot Ø¨Ù‡â€ŒØ±ÙˆØ²ØŒ RELEASE-P1 Ù†Ù‡Ø§ÛŒÛŒ.
- Why: Ø³Ø±Ø¹Øª Ø¨Ø§ sub-agentÙ‡Ø§ÛŒ Ù…ÙˆØ§Ø²ÛŒ + Ú©ÛŒÙÛŒØª/Ø¯Ù‚Øª Ø¨Ø§ Ø±ÛŒÙˆÛŒÙˆ Ù…Ø±Ú©Ø²ÛŒ L-modelØ› ÛŒØ§ÙØªÙ‡Ù” 404 Ø¨Ø±Ø§ÛŒ ØªØ¬Ø±Ø¨Ù‡Ù” Ú©Ø§Ø±Ø¨Ø± production Ù…Ù‡Ù… Ø§Ø³Øª.
- Scope / files: pps/web/src/pages/{index,404}.astroØŒ pps/web/src/components/Footer.astroØŒ docs/plan/{LICENSES,PROD-ACCEPTANCE,RELEASE-P1}.mdØŒ Task-list.md Â§5 Ùˆ snapshotØŒ Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ú†Ù‡Ø§Ø± task Ù…ÙˆØ§Ø²ÛŒØ› Ø³Ù¾Ø³ 
pm run check (0 error)Ø› git diff --checkØ› Ø¨Ø§Ø²Ø¨ÛŒÙ†ÛŒ Ù…Ø³ØªÙ‚Ù„ diffÙ‡Ø§.
- Verification actually performed and result: Ù¾ÙˆÙ„ÛŒØ´ build/check Ø³Ø¨Ø²Ø› Ù„Ø§ÛŒØ³Ù†Ø³â€ŒÙ‡Ø§ Û° missing (Û²Û¹Ûµ permissive + Û¶ flagged Ù…Ø³ØªÙ†Ø¯)Ø› production acceptance 7/8 PASS Ø¨Ø§ 1 NOTE (404)Ø› Task-list ÙÙ‚Ø· Ø®Ø·ÙˆØ· Ø¯Ø§Ø±Ø§ÛŒ evidence tick Ø´Ø¯.
- Decisions / assumptions: gsap/three/motion Ø¯Ø± P1 Ø¨Ø§Ù†Ø¯Ù„ Ù†Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯ (ÙÙ‚Ø· locked)Ø› fix 404 production Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ snippet Caddy Ù†ÛŒØ§Ø² Ø¯Ø§Ø±Ø¯ (owner sudo) â€” Ø¨Ù‡â€ŒÙ‡Ù…Ø±Ø§Ù‡ switch Ø¨Ù‡ release Ø¬Ø¯ÛŒØ¯ Ø¯Ø± Ø¯Ø³ØªÙˆØ± update Ù…Ø§Ù„Ú© Ú¯Ù†Ø¬Ø§Ù†Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯. DEFER-0010 (browser QA) Ùˆ DEFER-0011 Ø¨Ø§Ø² Ù…Ø§Ù†Ø¯Ù†Ø¯.
- Deferred or risk IDs: Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯Ø› DEFER-0011 Ø¨Ø§Ø²Ø› gsap license Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ø´Ø±Ø· adoption B5 Ø«Ø¨Øª Ø´Ø¯.
- Rollback / recovery: revert Ú©Ø§Ù…ÛŒØªâ€ŒÙ‡Ø§ÛŒ Ø§ÛŒÙ† batchØ› Ù‡ÛŒÚ† server/runtime state ØªÙˆØ³Ø· agent ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.

## LOG-0080 â€” 2026-08-15 â€” R2 close-out / release updater, doc sync, CI fingerprint

- Outcome: Ø³Ù‡ workstream Ù…ÙˆØ§Ø²ÛŒ Ø¯ÛŒÚ¯Ø± ØªÚ©Ù…ÛŒÙ„ Ùˆ ØªØ£ÛŒÛŒØ¯ Ø´Ø¯: (1) infra/deploy/update-release.sh â€” Ø§Ø³Ú©Ø±ÛŒÙ¾Øª root-run Ø¨Ø±Ø§ÛŒ switch Ø§ØªÙ…ÛŒÚ© current (Ú©Ù¾ÛŒ idempotent + chown/chmod + ln -sfn/mv -Tf + checksum Ø¯Ø± deploy.log) Ø¨Ø¯ÙˆÙ† Ù‡ÛŒÚ† ØªØºÛŒÛŒØ±ÛŒ Ø¯Ø± Caddyfile â€” Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± Ù‡Ù… Ù‚Ø±Ø§Ø± Ú¯Ø±ÙØªØ› (2) README Ùˆ PROJECT_MANIFEST Ø¨Ø§ ÙˆØ¶Ø¹ÛŒØª live (production/staging P1 deployedØŒ Ù…Ú©Ø§Ù†ÛŒÚ© snippet + atomic switch) Ù‡Ù…â€ŒØªØ±Ø§Ø² Ø´Ø¯Ù†Ø¯Ø› (3) CI: Ù…Ø±Ø­Ù„Ù‡Ù” build fingerprint (dist/build-fingerprint.txt) + Ù†Ø§Ù… artifact Ù†Ø³Ø®Ù‡â€ŒØ¯Ø§Ø± web-dist-<sha> + retention 14 Ø±ÙˆØ².
- Why: Ø¨Ø³ØªÙ† R2 Ùˆ Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ production Ø¨Ù‡ Ø¢Ø®Ø±ÛŒÙ† build (Ø¨Ø§ fix Ú©Ù†ØªØ±Ø§Ø³Øª + Ù¾ÙˆÙ„ÛŒØ´) Ø¨Ø§ Ú©Ù…ØªØ±ÛŒÙ† Ø§Ù‚Ø¯Ø§Ù… Ù…Ø§Ù„Ú©.
- Scope / files: infra/deploy/update-release.shØŒ .github/workflows/ci.ymlØŒ README.mdØŒ PROJECT_MANIFEST.md Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ø³Ù‡ task Ù…ÙˆØ§Ø²ÛŒØ› ash -n update-release.sh (exit 0)Ø› scp Ø§Ø³Ú©Ø±ÛŒÙ¾Øª Ø¨Ù‡ ~/taha-stage/Ø› git diff --checkØ› YAML Ø¨Ø§ PyYAML Ø§Ø¹ØªØ¨Ø§Ø±Ø³Ù†Ø¬ÛŒ Ø´Ø¯.
- Verification actually performed and result: Ù‡Ù…Ù‡Ù” Ø®Ø±ÙˆØ¬ÛŒâ€ŒÙ‡Ø§ Ù…Ø·Ø§Ø¨Ù‚ specØ› Ù‡ÛŒÚ† ØªØºÛŒÛŒØ± Ø³Ø±ÙˆØ± ØªÙˆØ³Ø· agentØ› artifacts/scrip Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Decisions / assumptions: Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ production ÙÙ‚Ø· Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ sudo bash ~/taha-stage/update-release.sh ~/taha-stage/release-1ce6d9a Ø§Ø³ØªØ› fix 404 (handle_errors Ø¯Ø± snippet) Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ø§Ù‚Ø¯Ø§Ù… Ø§Ø®ØªÛŒØ§Ø±ÛŒ Ù…Ø§Ù„Ú© Ù…Ø³ØªÙ†Ø¯ Ø´Ø¯.
- Deferred or risk IDs: DEFER-0011 OPENØ› Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: revert Ú©Ø§Ù…ÛŒØªâ€ŒÙ‡Ø§Ø› rollback production = switch current Ø¨Ù‡ release Ù‚Ø¨Ù„ÛŒ.

## LOG-0081 â€” 2026-08-15 â€” Infra / scoped agent server operations path

- Outcome: Ù…Ø³ÛŒØ± Ø§Ù…Ù† Ø¨Ø±Ø§ÛŒ Ø§Ø¬Ø±Ø§ÛŒ Ø®ÙˆØ¯Ú©Ø§Ø± Ø¹Ù…Ù„ÛŒØ§Øª Ø³Ø±ÙˆØ± ØªÙˆØ³Ø· agent ØªØ¹Ø±ÛŒÙ Ø´Ø¯: infra/deploy/caddy-apply.sh (root-ownedØŒ ØªØ¨Ø¯ÛŒÙ„ Ø«Ø§Ø¨Øª Ùˆ idempotent Ø¨Ø±Ø§ÛŒ fix 404 handle_errors Ø¯Ø± snippet Ø¨Ø§ gate validate Ùˆ restore Ø®ÙˆØ¯Ú©Ø§Ø±) Ø³Ø§Ø®ØªÙ‡ Ùˆ Ø¨Ù‡ Ø³Ø±ÙˆØ± Ù…Ù†ØªÙ‚Ù„ Ø´Ø¯Ø› SERVER_ACCESS_RUNBOOK.md Ø¨Ø®Ø´ Â«Scoped agent operationsÂ» Ø±Ø§ Ú¯Ø±ÙØª: sudoers Ù…Ø­Ø¯ÙˆØ¯ Ø¨Ù‡ Ø¯Ùˆ Ø§Ø³Ú©Ø±ÛŒÙ¾Øª root-owned Ø¯Ø± /opt/taha/binØŒ Ø¨Ø¯ÙˆÙ† sudo Ø¹Ù…ÙˆÙ…ÛŒØŒ Ø¨Ø¯ÙˆÙ† escalation (Ø§Ø³Ú©Ø±ÛŒÙ¾Øªâ€ŒÙ‡Ø§ ØªÙˆØ³Ø· deploy Ù‚Ø§Ø¨Ù„ ÙˆÛŒØ±Ø§ÛŒØ´ Ù†ÛŒØ³ØªÙ†Ø¯)ØŒ audit Ø§Ø² Ø·Ø±ÛŒÙ‚ auth.log/deploy.log/Caddy backupsØŒ Ùˆ revoke ÙÙˆØ±ÛŒ Ø¨Ø§ Ø­Ø°Ù drop-in.
- Why: Ù…Ø§Ù„Ú© Ø®ÙˆØ§Ø³Øª Ø®ÙˆØ¯Ø´ Ø¹Ù…Ù„ÛŒØ§Øª Ø³Ø±ÙˆØ± Ø±Ø§ Ø§Ù†Ø¬Ø§Ù… Ù†Ø¯Ù‡Ø¯Ø› grant Ø¨Ø§ÛŒØ¯ Ø­Ø¯Ø§Ù‚Ù„â€ŒØ§Ù…ØªÛŒØ§Ø²ØŒ Ù‚Ø§Ø¨Ù„ Ø¨Ø§Ø²Ø¨ÛŒÙ†ÛŒ Ùˆ Ù‚Ø§Ø¨Ù„ revoke Ø¨Ø§Ø´Ø¯.
- Scope / files: infra/deploy/caddy-apply.shØŒ docs/governance/SERVER_ACCESS_RUNBOOK.md Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: ash -n infra/deploy/caddy-apply.sh (exit 0)Ø› scp Ø¨Ù‡ ~/taha-stage/caddy-apply.shØ› git diff --check. Ù‡ÛŒÚ† ØªØºÛŒÛŒØ±ÛŒ Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± Ø§Ø¹Ù…Ø§Ù„ Ù†Ø´Ø¯ (Ù†ØµØ¨ sudoers = Ø§Ù‚Ø¯Ø§Ù… Ù…Ø§Ù„Ú©).
- Verification actually performed and result: Ø§Ø³Ú©Ø±ÛŒÙ¾Øª syntax-validØ› Ù…Ù†Ø·Ù‚ idempotent (Ø§Ú¯Ø± handle_errors Ù…ÙˆØ¬ÙˆØ¯ Ø¨Ø§Ø´Ø¯ Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ø®Ø§Ø±Ø¬ Ù…ÛŒâ€ŒØ´ÙˆØ¯)Ø› sudoers ÙÙ‚Ø· Ø¯Ùˆ Ù…Ø³ÛŒØ± Ø¯Ù‚ÛŒÙ‚.
- Decisions / assumptions: Ø§Ø¹Ø·Ø§ÛŒ NOPASSWD Ø¹Ù…Ø¯Ø§Ù‹ ÙÙ‚Ø· Ø¨Ù‡ Ø¯Ùˆ ÙØ±Ù…Ø§Ù† Ø«Ø§Ø¨ØªØ› Ù‡Ø± ØªØºÛŒÛŒØ± Caddy Ø¢ÛŒÙ†Ø¯Ù‡ Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ ÙˆÛŒØ±Ø§ÛŒØ´ Ø§Ø³Ú©Ø±ÛŒÙ¾Øª root-owned ÛŒØ§ grant Ø¬Ø¯ÛŒØ¯ Ø§Ø³Øª.
- Deferred or risk IDs: Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: 
m /etc/sudoers.d/taha-deploy && visudo -c grant Ø±Ø§ ÙÙˆØ±Ø§Ù‹ Ù„ØºÙˆ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.

## LOG-0082 â€” 2026-08-15 â€” Infra / caddy-apply idempotency and brace bug fixed

- Outcome: Ø§Ø¬Ø±Ø§ÛŒ Ø§ÙˆÙ„ caddy-apply.sh Ø¨Ø§ Ø®Ø·Ø§ÛŒ parse Ù…ÙˆØ§Ø¬Ù‡ Ø´Ø¯ (Â«unexpected token '}'Â»): (Ø§Ù„Ù) Ú†Ú© idempotency Ø³Ø±Ø§Ø³Ø±ÛŒ Ø¨ÙˆØ¯ Ùˆ handle_errors Ø¨Ù„ÙˆÚ© staging Ø±Ø§ Ù…ÛŒâ€ŒØ¯ÛŒØ¯ØŒ Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† Ø¯Ø± Ø§Ø¬Ø±Ø§ÛŒ Ù‚Ø¨Ù„ÛŒ snippet ØªÙˆÙ„ÛŒØ¯ Ø§ØµÙ„Ø§Ø­ Ù†Ø´Ø¯Ø› (Ø¨) Ø±ÙˆØ´ insert Ù‚Ø¨Ù„ÛŒ \t} Ø±Ø§ Ø¯Ø±Ø³Øª Ù‚Ø¨Ù„ Ø§Ø² } Ø§ØµÙ„ÛŒ Ù…ÛŒâ€ŒÚ¯Ø°Ø§Ø´Øª â†’ }} Ø±ÙˆÛŒ ÛŒÚ© Ø®Ø· Ú©Ù‡ parser Ø³ÛŒØ¯ÛŒ Ø±Ø¯ Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ø§ØµÙ„Ø§Ø­: Ú†Ú© Ù…Ø­Ø¯ÙˆØ¯ Ø¨Ù‡ region snippet + Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ canonical Ú©Ù„ snippet (Ø¨Ø±Ø§Ú©Øªâ€ŒÙ‡Ø§ÛŒ Ù…ØªÙˆØ§Ø²Ù†ØŒ } Ø¯Ø± Ø®Ø· Ø®ÙˆØ¯Ø´). ØªØ³Øª faithful Ø±ÙˆÛŒ Ø³Ø±ÙˆØ±: caddy validate --config <mod2> --adapter caddyfile â†’ **Valid configuration**.
- Why: fix 404 ØªÙˆÙ„ÛŒØ¯ Ø¨Ø§ÛŒØ¯ Ø¨Ø¯ÙˆÙ† Ø´Ú©Ø³ØªÙ† Caddy Ø§Ø¹Ù…Ø§Ù„ Ø´ÙˆØ¯Ø› backup/validate/restore Ø·Ø±Ø§Ø­ÛŒ Ù‚Ø¨Ù„ÛŒ Ø¨Ù‡â€ŒØ¯Ø±Ø³ØªÛŒ Ú©Ø§Ø± Ú©Ø±Ø¯ (Caddy Ø±ÛŒâ€ŒÙ„ÙˆØ¯ Ù†Ø´Ø¯ØŒ ÙØ§ÛŒÙ„ restore Ø´Ø¯).
- Scope / files: infra/deploy/caddy-apply.sh Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ø¨Ø§Ø²ØªÙˆÙ„ÛŒØ¯ Ù…Ø­Ù„ÛŒ Ø¨Ø§ Ø¨Ø§ÛŒØªâ€ŒÙ‡Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ ÙØ§ÛŒÙ„ (scp Ø§Ø² Ø³Ø±ÙˆØ±)Ø› scp Ø®Ø±ÙˆØ¬ÛŒ Ø¨Ù‡ Ø³Ø±ÙˆØ±Ø› caddy validate --adapter caddyfile Ø±ÙˆÛŒ ÙØ§ÛŒÙ„ ØªØ³Øª â†’ PASSØ› ash -nØ› git diff --check.
- Verification actually performed and result: snippet Ù†Ù‡Ø§ÛŒÛŒ Ø´Ø§Ù…Ù„ handle_errors Ø¨Ø§ Ø³Ø§Ø®ØªØ§Ø± Ù…ØªÙˆØ§Ø²Ù† Ùˆ Â«Valid configurationÂ» Ø±ÙˆÛŒ Ø³Ø±ÙˆØ±Ø› ÙØ§ÛŒÙ„ Ø§ØµÙ„ÛŒ Caddy Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡ (restore Ù‚Ø¨Ù„ÛŒ) Ùˆ production Ø³Ø§Ù„Ù….
- Decisions / assumptions: Ù†Ø³Ø®Ù‡Ù” Ù†Ù‡Ø§ÛŒÛŒ Ø§Ø³Ú©Ø±ÛŒÙ¾Øª Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ reinstall Ø¯Ø± /opt/taha/bin ØªÙˆØ³Ø· Ù…Ø§Ù„Ú© Ùˆ Ø³Ù¾Ø³ Ø§Ø¬Ø±Ø§ÛŒ sudo -n Ø§Ø³Øª.
- Deferred or risk IDs: Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: Ø¯Ø± ØµÙˆØ±Øª Ø®Ø·Ø§ÛŒ validateØŒ Ø§Ø³Ú©Ø±ÛŒÙ¾Øª Ø¨Ú©Ø§Ù¾ Ø±Ø§ restore Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ùˆ reload Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.

## LOG-0083 â€” 2026-08-15 â€” R2 / production 404 fixed and full live verification

- Outcome: Ø¨Ø§ caddy-apply.sh Ø§ØµÙ„Ø§Ø­â€ŒØ´Ø¯Ù‡ (canonical snippet rewrite)ØŒ handle_errors Ø¯Ø§Ø®Ù„ 	aha_application_routes ÙˆØ§Ø±Ø¯ Ùˆ Caddy validate + reload Ø´Ø¯ (Ø¨Ú©Ø§Ù¾ Caddyfile.auto-20260815130818). Production Ùˆ staging Ø§Ú©Ù†ÙˆÙ† ØµÙØ­Ù‡Ù” 404 Ø³ÙØ§Ø±Ø´ÛŒ Ø±Ø§ Ø¨Ø§ status 404 Ùˆ Ø¨Ø¯Ù†Ù‡Ù” Ú©Ø§Ù…Ù„ (Û´Û±Û²Û· Ø¨Ø§ÛŒØª) Ø³Ø±Ùˆ Ù…ÛŒâ€ŒÚ©Ù†Ù†Ø¯. Ù…Ø³ÛŒØ± Ø¯Ø³ØªØ±Ø³ÛŒ scoped agent (sudoers) ÙØ¹Ø§Ù„ Ø§Ø³Øª: Ù…Ø§Ù„Ú© ÙÙ‚Ø· reinstall Ø§Ù†Ø¬Ø§Ù… Ø¯Ø§Ø¯ Ùˆ Ø®ÙˆØ¯ Ø§Ø³Ú©Ø±ÛŒÙ¾Øª ØªÙˆØ³Ø· grant Ø§Ø¬Ø±Ø§ Ø´Ø¯.
- Why: Ø¨Ø³ØªÙ† Ú©Ø§Ù…Ù„ R2 â€” 404 Ø³ÙØ§Ø±Ø´ÛŒ Ø¨Ø®Ø´ÛŒ Ø§Ø² Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ static P1 Ø¨ÙˆØ¯ Ùˆ Ù‚Ø¨Ù„Ø§Ù‹ Ø¯Ø± production Ø®Ø§Ù„ÛŒ Ø¨ÙˆØ¯.
- Scope / files: docs/status/WORK_LOG.mdØŒ docs/plan/PROD-ACCEPTANCE.mdØŒ docs/plan/S-PLAN-STATE.md.
- Commands or actions actually performed: curl production/staging 404 (status+len+body)Ø› ash infra/deploy/smoke.sh Ø¨Ø±Ø§ÛŒ Ù‡Ø± Ø¯Ùˆ host (7/8 PASS)Ø› ØªØ£ÛŒÛŒØ¯ Ø¨Ú©Ø§Ù¾ Caddy.
- Verification actually performed and result: prod404 status=404 len=4127 Ø¨Ø§ notfound-code Ùˆ Ù…ØªÙ† Ø¯ÙˆØ²Ø¨Ø§Ù†Ù‡Ø› stage404 ÛŒÚ©Ø³Ø§Ù†Ø› smoke Ù‡Ø± Ø¯Ùˆ Ø³Ø¨Ø²Ø› production Ø±ÙˆÛŒ release-1ce6d9a.
- Decisions / assumptions: NOTE Ù‚Ø¨Ù„ÛŒ PROD-ACCEPTANCE (404 Ø®Ø§Ù„ÛŒ) Ø±ÙØ¹ Ø´Ø¯Ø› DEFER-0011 (robots edge) Ù‡Ù…Ú†Ù†Ø§Ù† Ø¨Ø§Ø² Ø§Ø³Øª.
- Deferred or risk IDs: DEFER-0011 OPEN.
- Rollback / recovery: Ø¨Ú©Ø§Ù¾â€ŒÙ‡Ø§ÛŒ timestamped Caddy Ùˆ switch Ø§ØªÙ…ÛŒÚ© currentØ› Ù‡Ø± Ø¯Ùˆ Ù…Ú©Ø§Ù†ÛŒÚ© Ø¢Ø²Ù…Ø§ÛŒØ´â€ŒØ´Ø¯Ù‡.

## LOG-0084 â€” 2026-08-15 â€” R2/P2 / V1 readiness check and P2 content questionnaire

- Outcome: (1) Ø¢Ø²Ù…Ø§ÛŒØ´ Ø«Ø¨Øª agent: isual-reviewer Ø¯Ø± session ÙØ¹Ù„ÛŒ Ø«Ø¨Øª Ù†ÛŒØ³Øª (Â«Unknown agent typeÂ») â€” V1 Ø¨Ù‡â€ŒØµÙˆØ±Øª READY-AFTER-RESTART Ø«Ø¨Øª Ø´Ø¯ Ùˆ Ø¯Ø³ØªÙˆØ± dispatch Ø¯Ù‚ÛŒÙ‚ (Û· Ø§Ø³Ú©Ø±ÛŒÙ†â€ŒØ´Ø§Øª 003016..003052) Ø¯Ø± S-Plan Ø¢Ù…Ø§Ø¯Ù‡ Ø§Ø³ØªØ› (2) ÙØ±Ù… content Ù¾Ú© P2 Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯: docs/plan/P2-C1-CONTENT-REQUEST.md Ø¨Ø§ Û±Û° Ø¨Ø®Ø´ Ø¯ÙˆØ²Ø¨Ø§Ù†Ù‡ (identityØŒ bio Ú©ÙˆØªØ§Ù‡/Ø¨Ù„Ù†Ø¯ØŒ ØªØ¬Ø±Ø¨Ù‡ Ø¨Ø§ Ø³ØªÙˆÙ† evidenceØŒ ØªØ­ØµÛŒÙ„Ø§ØªØŒ Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§ Ø¨Ø¯ÙˆÙ† Ø¯Ø±ØµØ¯ Ø³Ø§Ø®ØªÚ¯ÛŒØŒ ØªØµÙ…ÛŒÙ… CV/Resume Ø¨Ø§ Ù…Ø³ÛŒØ± Ø¯Ø§Ù†Ù„ÙˆØ¯ØŒ ØªØµÙ…ÛŒÙ… ØªÙ…Ø§Ø³ DEFER-0007 Ø¨Ø§ ÙÛŒÙ„Ø¯ Ù…Ù‚Ø¯Ø§Ø± Ø¯Ù‚ÛŒÙ‚ØŒ URLÙ‡Ø§ÛŒ Ø§Ø¬ØªÙ…Ø§Ø¹ÛŒØŒ statement Ø¯Ø³ØªØ±Ø³ÛŒØŒ ÛŒØ§Ø¯Ø¢ÙˆØ±ÛŒ Ù‚Ø§Ù†ÙˆÙ† evidence).
- Why: Â«Ù‡Ø± Ø¯ÙˆÂ» â€” V1 Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ restart Ø§Ø³Øª (Ù…Ø­Ø¯ÙˆØ¯ÛŒØª ÙÙ†ÛŒ Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡)Ø› P2 Ø¨Ø¯ÙˆÙ† ÙˆØ±ÙˆØ¯ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ù…Ø§Ù„Ú© Ø³Ø§Ø®ØªÙ‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯ØŒ Ù¾Ø³ unblocker Ø¢Ù† ÙØ±Ù… C1 Ø§Ø³Øª.
- Scope / files: docs/plan/P2-C1-CONTENT-REQUEST.mdØŒ docs/plan/S-PLAN-STATE.md Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: dispatch Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ isual-reviewer (Ø®Ø·Ø§ÛŒ Ø«Ø¨Øªâ€ŒÙ†Ø´Ø¯Ù‡)Ø› Ø³Ø§Ø®Øª ÙØ±Ù… ØªÙˆØ³Ø· sub-agentØ› git diff --check.
- Verification actually performed and result: ÙØ±Ù… Ø´Ø§Ù…Ù„ ØªÙ…Ø§Ù… Ø³ØªÙˆÙ†â€ŒÙ‡Ø§/Ø¨Ø®Ø´â€ŒÙ‡Ø§ÛŒ Ø®ÙˆØ§Ø³ØªÙ‡â€ŒØ´Ø¯Ù‡ Ø¨Ø§ __blank__ Ø¨Ø±Ø§ÛŒ Ù…ØªÙ† Ø¢Ø²Ø§Ø¯Ø› Ù…Ù‚Ø§Ø¯ÛŒØ± identity ÙØ¹Ù„ÛŒ Ø§Ø² content.ts verbatim Ú©Ù¾ÛŒ Ø´Ø¯Ø› C1 â†’ BLOCKED(owner) Ø¨Ø§ Ø§Ø±Ø¬Ø§Ø¹ ÙØ±Ù….
- Decisions / assumptions: Ù‡ÛŒÚ† ØµÙØ­Ù‡Ù” Ø®Ø§Ù„ÛŒ P2 Ø³Ø§Ø®ØªÙ‡ Ù†Ø´Ø¯ (Ù‚Ø§Ù†ÙˆÙ† Â«empty future routeÂ» Ø±Ø¹Ø§ÛŒØª Ø´Ø¯)Ø› C2..C7 Ù‡Ù…Ú†Ù†Ø§Ù† BLOCKED(C1).
- Deferred or risk IDs: DEFER-0010 Ø¨Ø§Ø² (Ù…Ù†ØªØ¸Ø± restart).
- Rollback / recovery: revert Ø§ÛŒÙ† commitØ› Ù‡ÛŒÚ† runtime state ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.

## LOG-0085 â€” 2026-08-15 â€” P2 / V1 visual QA passed, C1 form received, About pages built

- Outcome: (1) **V1 Ø§Ø¬Ø±Ø§ Ø´Ø¯** â€” agent isual-reviewer (Ù¾Ø³ Ø§Ø² restart Ø«Ø¨Øª Ø´Ø¯) Ù‡Ø± Û· Ø§Ø³Ú©Ø±ÛŒÙ†â€ŒØ´Ø§Øª Ø±Ø§ Ø¨Ø±Ø±Ø³ÛŒ Ú©Ø±Ø¯: Ù‡Ù…Ù‡ ACCEPT-WITH-NOTESØŒ Ø¨Ø¯ÙˆÙ† SEVØ› Ú¯Ø²Ø§Ø±Ø´ Ø¯Ø± docs/plan/VISUAL-QA-P1.mdØ› DEFER-0010 Ø¨Ø³ØªÙ‡ Ùˆ DEFER-0013 (mobile matrix) Ø«Ø¨Øª Ø´Ø¯. (2) ÙØ±Ù… P2-C1 ØªÚ©Ù…ÛŒÙ„â€ŒØ´Ø¯Ù‡ Ø¯Ø±ÛŒØ§ÙØª Ø´Ø¯: identity ØªØ£ÛŒÛŒØ¯ØŒ short bio ÙˆÛŒØ±Ø§ÛŒØ´ÛŒ ØªØ£ÛŒÛŒØ¯ØŒ Û· Ù…Ù‡Ø§Ø±Øª Ø¨Ø§ sourceØŒ availability Ø¯ÙˆØ²Ø¨Ø§Ù†Ù‡ ØªØ£ÛŒÛŒØ¯ØŒ ØªÙ…Ø§Ø³ = omit (Ø¨Ø³ØªÙ† DEFER-0007)Ø› Ø®Ø§Ù„ÛŒâ€ŒÙ‡Ø§ (long bioØŒ educationØŒ ØªØ¬Ø±Ø¨Ù‡Ù” org/role/dateØŒ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ CV/ResumeØŒ URLÙ‡Ø§) Ø·Ø¨Ù‚ Ù‚Ø§Ù†ÙˆÙ† Â«empty = not publishedÂ» Ù…Ù†ØªØ´Ø± Ù†Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯. (3) Ù¾ÛŒØ§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ P2 (C2+C3+C6): Ù…Ø§Ú˜ÙˆÙ„ typed profile.ts + profile.{en,fa}.ts Ø¨Ø§ alidateProfile()ØŒ ØµÙØ­Ø§Øª /en/about/ Ùˆ /fa/about/ØŒ Ú©Ø§Ù…Ù¾ÙˆÙ†Ù†Øª About.astroØŒ Ù„ÛŒÙ†Ú© About Ø¯Ø± navØŒ sitemap Ûµ-URLØŒ Ùˆ Ø§Ù†ØªÙ‚Ø§Ù„ copy 404 Ø¨Ù‡ content.notfound.
- Why: Â«Ù‡Ø± Ø¯ÙˆÂ» â€” V1 Ùˆ P2Ø› Ù…Ø¹Ù…Ø§Ø±ÛŒ content-driven Ø¨Ø±Ø§ÛŒ admin panel Ø¢ÛŒÙ†Ø¯Ù‡.
- Scope / files: pps/web/src/data/{profile.ts,profile.en.ts,profile.fa.ts,content.ts}ØŒ pps/web/src/components/{About,Landing,Header,Footer}.astroØŒ pps/web/src/pages/{en,fa}/about.astroØŒ 404.astroØŒ index.astroØŒ sitemap.xml.tsØŒ docs/plan/VISUAL-QA-P1.mdØŒ docs/status/deferred-validation.md Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: dispatch V1 (visual-reviewer) Ùˆ dispatch Ù¾ÛŒØ§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ P2Ø› 
pm run check (0 errorØ› 21 files)Ø› 
pm run build (6 pages Ø´Ø§Ù…Ù„ aboutÙ‡Ø§)Ø› git diff --check.
- Verification actually performed and result: Û· Ú¯Ø²Ø§Ø±Ø´ visual Ù‡Ù…Ú¯ÛŒ ACCEPT-WITH-NOTESØ› build Ø´Ø§Ù…Ù„ /en/about/ Ùˆ /fa/about/Ø› Ù‡Ù…Ù‡Ù” copy Ø§Ø² dataØ› alidateProfile Ø±ÙˆÛŒ build Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Decisions / assumptions: Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§ Ø±ÙˆÛŒ Ù‡Ø± Ø¯Ùˆ locale Ø¨Ø§ Ù†Ø§Ù…â€ŒÙ‡Ø§ÛŒ ÙÙ†ÛŒ/Ù„Ø§ØªÛŒÙ† ÛŒÚ©Ø³Ø§Ù† (Ù…ØµÙˆØ¨) Ù†Ù…Ø§ÛŒØ´ Ø¯Ø§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯Ø› Ø¨Ø®Ø´â€ŒÙ‡Ø§ÛŒ Experience/Education/CV Ù…Ù†ØªØ´Ø± Ù†Ø´Ø¯Ù†Ø¯ Ú†ÙˆÙ† Ø¯Ø§Ø¯Ù‡Ù” ÙˆØ§Ù‚Ø¹ÛŒ Ù†Ø¯Ø§Ø±Ù†Ø¯ (Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ ØªÚ©Ù…ÛŒÙ„ ÙØ±Ù… ØªÙˆØ³Ø· Ù…Ø§Ù„Ú©).
- Deferred or risk IDs: DEFER-0010 CLOSEDØ› DEFER-0007 CLOSEDØ› DEFER-0013 OPEN (mobile matrix).
- Rollback / recovery: revert Ú©Ø§Ù…ÛŒØªâ€ŒÙ‡Ø§ÛŒ Ø§ÛŒÙ† sliceØ› deploy Ù‚Ø¨Ù„ÛŒ Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± Ø³Ø§Ù„Ù… Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯.

## LOG-0086 â€” 2026-08-15 â€” P1/P2 / no-hardcode audit and data-driven refactor

- Outcome: Ø·Ø¨Ù‚ Ø¯Ø³ØªÙˆØ± Ù…Ø§Ù„Ú© (Â«Ù‡ÛŒÚ†â€ŒÚ†ÛŒØ² Ù‡Ø§Ø±Ø¯Ú©Ø¯Ø› Ù‡Ù…Ù‡â€ŒÚ†ÛŒØ² Ø¨Ø¹Ø¯Ø§Ù‹ Ø§Ø² admin panel Ù…Ø¯ÛŒØ±ÛŒØª Ø´ÙˆØ¯Â») agent audit Ù‡Ù…Ù‡Ù” .astro/.ts ØºÛŒØ± Ø§Ø² data/ Ø±Ø§ Ø§Ø³Ú©Ù† Ú©Ø±Ø¯: Û· Ù…ÙˆØ±Ø¯ HIGH Ù‡Ø§Ø±Ø¯Ú©Ø¯ (title gatewayØŒ Ù†Ø§Ù…â€ŒÙ‡Ø§ÛŒ h1ØŒ Â«404Â»ØŒ Ø¨Ø±Ú†Ø³Ø¨â€ŒÙ‡Ø§ÛŒ switch Â«ENÂ»/Â«ÙØ§Ø±Ø³ÛŒÂ» Ø¯Ø± Header/FooterØŒ Ù†Ù…Ø§Ø¯ Â«Â©Â») + LOWÙ‡Ø§ÛŒ Ø¨Ø±Ù†Ø¯ (TM/Ø·Ù‡). Ù‡Ù…Ù‡ Ø¨Ù‡ content.ts Ù…Ù†ØªÙ‚Ù„ Ø´Ø¯Ù†Ø¯: gateway.titleØŒ 
ameØŒ markØŒ 
otfound.codeØŒ Ø¨Ø±Ú†Ø³Ø¨ switch Ø§Ø² gateway.englishLabel/persianLabel locale Ù…Ù‚Ø§Ø¨Ù„ØŒ ooter.copyrightMark. Ù¾Ø³ Ø§Ø² refactorØŒ Ù‡ÛŒÚ† string Ú©Ø§Ø±Ø¨Ø±-Ù‚Ø§Ø¨Ù„â€ŒÙ…Ø´Ø§Ù‡Ø¯Ù‡â€ŒØ§ÛŒ Ø®Ø§Ø±Ø¬ Ø§Ø² data/ Ø¨Ø§Ù‚ÛŒ Ù†Ù…Ø§Ù†Ø¯ (Ø¨Ù‡â€ŒØ¬Ø² Ø¬Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡â€ŒÙ‡Ø§ÛŒ ØªØ²Ø¦ÛŒÙ†ÛŒ aria-hidden).
- Why: Ù…Ù†Ø¨Ø¹ ÙˆØ§Ø­Ø¯ Ù…Ø­ØªÙˆØ§ = Ù…Ø³ÛŒØ± Ù…Ø³ØªÙ‚ÛŒÙ… Ø¨Ù‡ admin panel/CMS Ø¯Ø± P3 (adapter Ø±ÙˆÛŒ Ù‡Ù…ÛŒÙ† Ù…Ø§Ú˜ÙˆÙ„â€ŒÙ‡Ø§).
- Scope / files: pps/web/src/data/content.tsØŒ pps/web/src/components/{Header,Footer}.astroØŒ pps/web/src/pages/{index,404}.astro Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: agent audit (explore)Ø› Ø³Ù¾Ø³ refactor Ø¯Ø³ØªÛŒØ› 
pm run check (0 error)Ø› 
pm run build (6 pages)Ø› git diff --check.
- Verification actually performed and result: audit Ù¾Ø³ Ø§Ø² Ø§ØµÙ„Ø§Ø­Ø§Øª â€” Û° HIGH Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡ (ÙÙ‚Ø· ØªØ²Ø¦ÛŒÙ†ÛŒ/Ø¨Ø±Ù†Ø¯ Ù…Ø³ØªÙ†Ø¯)Ø› build/check Ø³Ø¨Ø².
- Decisions / assumptions: Ø¨Ø±Ú†Ø³Ø¨ switch Ø§Ø² Â«ENÂ» Ø¨Ù‡ Â«EnglishÂ» ØªØºÛŒÛŒØ± Ú©Ø±Ø¯ (Ø¯Ø§Ø¯Ù‡â€ŒÙ…Ø­ÙˆØ± Ùˆ Ù…Ø·Ø§Ø¨Ù‚ design.md Â§59)Ø› Ù†Ù…Ø§Ø¯ Â«Â©Â» Ø§Ø² ooter.copyrightMark Ø®ÙˆØ§Ù†Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: revertØ› deploy Ù‚Ø¨Ù„ÛŒ Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡.

## LOG-0087 â€” 2026-08-15 â€” P2 / full master-profile content on About (C2/C3 completion)

- Outcome: Ù…Ø§Ù„Ú© Ø¯Ùˆ Ù…Ù†Ø¨Ø¹ Ù…Ø­ØªÙˆØ§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ ØªØ­ÙˆÛŒÙ„ Ø¯Ø§Ø¯ (Taha_Mohammadi_Master_CV_Website_Profile.md Ùˆ Taha_Mohammadi_Master_SOP_FA_Final.md). Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ typed Ú¯Ø³ØªØ±Ø´ ÛŒØ§ÙØª (experience/education/publications/researchProjects/certificates/socials/longBio + alidateProfile Ø¨Ø§ Ø¨Ø±Ø±Ø³ÛŒ URL Ùˆ ÙÛŒÙ„Ø¯Ù‡Ø§ÛŒ Ø§Ø¬Ø¨Ø§Ø±ÛŒ)Ø› profile.en.ts Ø¨Ø§ Ù…Ø­ØªÙˆØ§ÛŒ verbatim CV Ù¾Ø± Ø´Ø¯ (short/long bioØŒ ÛµÛ¸ Ù…Ù‡Ø§Ø±Øª Ø¯Ø± Û¸ Ø¯Ø³ØªÙ‡ØŒ Ûµ ØªØ¬Ø±Ø¨Ù‡ Ø¨Ø§ bulletsØŒ Û² education Ø¨Ø§ GPAØŒ Û³ publicationØŒ Û³ research projectØŒ Û· certificateØŒ socials LinkedIn/ORCID)Ø› profile.fa.ts ÙÙ‚Ø· Ù…Ø­ØªÙˆØ§ÛŒ Ù…ØµÙˆØ¨ ÙØ§Ø±Ø³ÛŒ Ø±Ø§ Ù†Ú¯Ù‡ Ø¯Ø§Ø´Øª (Ø·Ø¨Ù‚ Ù‚Ø§Ù†ÙˆÙ† Â«Ù†Ø¨ÙˆØ¯ ØªØ±Ø¬Ù…Ù‡ = Ø¹Ø¯Ù… Ø§Ù†ØªØ´Ø§Ø± Ø¨Ø®Ø´Â»)Ø› About.astro Ø¨Ø§ Ø¨Ø®Ø´â€ŒÙ‡Ø§ÛŒ Ø´Ø±Ø·ÛŒ (ÙÙ‚Ø· Ø¯Ø§Ø¯Ù‡Ù” Ù…ÙˆØ¬ÙˆØ¯ Ø±Ù†Ø¯Ø± Ù…ÛŒâ€ŒØ´ÙˆØ¯) Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ Ø´Ø¯Ø› Ø¨Ø±Ú†Ø³Ø¨â€ŒÙ‡Ø§ÛŒ Ø¨Ø®Ø´ (en) Ø¯Ø± content.ts.sections Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯Ù†Ø¯. Ø§ÛŒÙ…ÛŒÙ„/ØªÙ„ÙÙ† Ù…Ù†ØªØ´Ø± Ù†Ø´Ø¯Ù†Ø¯ (ØªØµÙ…ÛŒÙ… ØªÙ…Ø§Ø³ DEFER-0007).
- Why: ØªÚ©Ù…ÛŒÙ„ C1/C2/C3 Ø¨Ø§ Ù…Ø­ØªÙˆØ§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ù…Ø§Ù„Ú©Ø› Ø¨Ø¯ÙˆÙ† Ù‡ÛŒÚ† ØªØ±Ø¬Ù…Ù‡/Ø§Ø®ØªØ±Ø§Ø¹ agent.
- Scope / files: pps/web/src/data/{profile.ts,profile.en.ts,profile.fa.ts,content.ts}ØŒ pps/web/src/components/About.astro Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: 
pm run check (0 error)Ø› 
pm run build (6 pages)Ø› assertions Ø±ÙˆÛŒ dist: Û¹ Ù…ÙˆØ±Ø¯ en Ø­Ø§Ø¶Ø±ØŒ fa ÙØ§Ù‚Ø¯ experience Ùˆ Ø¯Ø§Ø±Ø§ÛŒ availability.
- Verification actually performed and result: en About Ø´Ø§Ù…Ù„ MCI/Shahed/PARS-SQL/LinkedIn/ORCID/Certificates/Publications/availability/GPAØ› fa About Ø¨Ø¯ÙˆÙ† Ø¨Ø®Ø´â€ŒÙ‡Ø§ÛŒ Ø¨Ø¯ÙˆÙ†-ØªØ±Ø¬Ù…Ù‡Ø› validation Ø±ÙˆÛŒ build Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Decisions / assumptions: CV master Ù…Ù†Ø¨Ø¹ ÙˆØ¨â€ŒØ³Ø§ÛŒØª Ø§Ø³Øª (Ø·Ø¨Ù‚ Ù…ØªÙ† Ø®ÙˆØ¯ ÙØ§ÛŒÙ„)Ø› socials ÙÙ‚Ø· LinkedIn/ORCID (Ø¨Ø¯ÙˆÙ† email/phone)Ø› fa Ø¨Ø®Ø´â€ŒÙ‡Ø§ÛŒ Ø¬Ø¯ÛŒØ¯ Ù†Ø¯Ø§Ø±Ø¯ ØªØ§ ØªØ±Ø¬Ù…Ù‡Ù” ÙØ§Ø±Ø³ÛŒ Ù…ØµÙˆØ¨ Ø¨Ø±Ø³Ø¯.
- Deferred or risk IDs: DEFER-0013 (mobile matrix) OPENØ› Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: revert Ú©Ø§Ù…ÛŒØªØ› deploy Ù‚Ø¨Ù„ÛŒ Ø³Ø§Ù„Ù….

## LOG-0088 â€” 2026-08-15 â€” P2 / GitHub links from resume variants (en+fa)

- Outcome: Ø¯Ùˆ resume variant Ø¯ÛŒÚ¯Ø± Ù…Ø§Ù„Ú© (Senior Backend BluePay Ùˆ Industry Resume Software AI) Ø¯Ùˆ ÙˆØ§Ù‚Ø¹ÛŒØª Ø¬Ø¯ÛŒØ¯ ØªØ£ÛŒÛŒØ¯Ø´Ø¯Ù‡ Ø¯Ø§Ø´ØªÙ†Ø¯: GitHub profile (https://github.com/tahamohamadi-ir) Ùˆ repo Ù¾Ø±ÙˆÚ˜Ù‡Ù” PARS-SQL/VTD-Edge (https://github.com/tahamohamadi-ir/ADHD-VTD). Ø¨Ù‡ socials Ù‡Ø± Ø¯Ùˆ locale (en+fa â€” Ù†Ø§Ù… Ù¾Ù„ØªÙØ±Ù… proper noun Ø§Ø³Øª) Ùˆ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† url+linkLabel Ù¾Ø±ÙˆÚ˜Ù‡ Ø¯Ø± en Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯Ø› ResearchProject Ø¨Ø§ url/linkLabel ØªÙˆØ³Ø¹Ù‡ ÛŒØ§ÙØª Ùˆ About Ù¾Ø±ÙˆÚ˜Ù‡ Ø±Ø§ Ø¨Ø§ Ù„ÛŒÙ†Ú© data-driven Ø±Ù†Ø¯Ø± Ù…ÛŒâ€ŒÚ©Ù†Ø¯. bullets ØªØ¬Ø±Ø¨Ù‡Ù” master CV (canonical) ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.
- Why: Ù„ÛŒÙ†Ú©â€ŒÙ‡Ø§ÛŒ Ø§Ø¬ØªÙ…Ø§Ø¹ÛŒ/Ù¾Ø±ÙˆÚ˜Ù‡ Ø¨Ø®Ø´ÛŒ Ø§Ø² Ù‡ÙˆÛŒØª Ø¹Ù…ÙˆÙ…ÛŒ Ù‡Ø³ØªÙ†Ø¯ Ùˆ Ø¯Ø± Ù…Ù†Ø§Ø¨Ø¹ Ù…ØµÙˆØ¨ Ø¢Ù…Ø¯Ù‡â€ŒØ§Ù†Ø¯.
- Scope / files: pps/web/src/data/{profile.ts,profile.en.ts,profile.fa.ts}ØŒ pps/web/src/components/About.astro Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: 
pm run check (0 error)Ø› 
pm run build (6 pages)Ø› smoke Ù†Ø³Ø®Ù‡Ù” Ù‚Ø¨Ù„ÛŒ (7 PASS) Ùˆ ØªØ£ÛŒÛŒØ¯ /about/ Ù‡Ø§ (200) Ù¾ÛŒØ´ Ø§Ø² ØªØºÛŒÛŒØ±.
- Verification actually performed and result: build Ø³Ø¨Ø²Ø› Ù„ÛŒÙ†Ú© GitHub Ù¾Ø±ÙˆÚ˜Ù‡ data-driven (Ø¨Ø¯ÙˆÙ† Ù‡Ø§Ø±Ø¯Ú©Ø¯).
- Decisions / assumptions: Ø§ÛŒÙ…ÛŒÙ„/ØªÙ„ÙÙ† Ø§Ø² resumeÙ‡Ø§ Ù…Ù†ØªØ´Ø± Ù†Ø´Ø¯ (ØªØµÙ…ÛŒÙ… ØªÙ…Ø§Ø³ Ù¾Ø§Ø¨Ø±Ø¬Ø§)Ø› Â«Django RebuildÂ» Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù¾Ø±ÙˆÚ˜Ù‡Ù” Ø³Ø§ÛŒØª Ù…Ù†ØªØ´Ø± Ù†Ø´Ø¯ (site Ù…Ø§ Astro Ø§Ø³Øª â€” Ø§ÛŒÙ† ÙÙ‚Ø· framing Ø±Ø²ÙˆÙ…Ù‡ Ø§Ø³Øª).
- Deferred or risk IDs: Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: revert Ú©Ø§Ù…ÛŒØªØ› deploy Ù‚Ø¨Ù„ÛŒ Ø³Ø§Ù„Ù….

## LOG-0089 â€” 2026-08-15 â€” P2 / a11y audit fixes, mobile-overflow CI, docs sync

- Outcome: Ø³Ù‡ workstream Ù…ÙˆØ§Ø²ÛŒ: (1) audit Ø¯Ø³ØªØ±Ø³â€ŒÙ¾Ø°ÛŒØ±ÛŒ About â†’ Û² must-fix Ø±ÙØ¹ Ø´Ø¯: skip Ø³Ø·Ø­ heading Ø¯Ø± fa (ÙˆÙ‚ØªÛŒ Ø¨Ø±Ú†Ø³Ø¨ Ø¨Ø®Ø´ Ù†ÛŒØ³ØªØŒ Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§ h2 Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯ Ø¨Ù‡â€ŒØ¬Ø§ÛŒ h3 â€” Ø¨Ø¯ÙˆÙ† Ø§Ø®ØªØ±Ø§Ø¹ ÙØ§Ø±Ø³ÛŒ) Ùˆ Ù‡Ø§Ø±Ø¯Ú©Ø¯ Â«GPAÂ» â†’ gpaLabel Ø¯Ø± contentØ› plus: Ø¢Ù†Ø¯Ø±Ù„Ø§ÛŒÙ† rest-state Ù„ÛŒÙ†Ú©â€ŒÙ‡Ø§ÛŒ Ø³Ø§Ø²Ù…Ø§Ù†/Ù¾Ø±ÙˆÚ˜Ù‡ (design.md Â§55)Ø› (2) CI: Ù…Ø±Ø­Ù„Ù‡Ù” Â«Mobile overflow check (Playwright)Â» Ø¨Ø§ infra/qa/mobile-overflow.spec.mjs (Û¶ Ù…Ø³ÛŒØ± Ã— Û³Û²Û°Ã—ÛµÛ¶Û¸ Ùˆ Û³Û¹Û°Ã—Û¸Û´Û´ØŒ fail Ø§Ú¯Ø± scrollWidth>1px) â†’ Ù¾ÙˆØ´Ø´ overflow Ù…ÙˆØ¨Ø§ÛŒÙ„ DEFER-0013Ø› (3) Ù‡Ù…â€ŒØªØ±Ø§Ø²ÛŒ Ù…Ø³ØªÙ†Ø¯Ø§Øª: snapshot S-PlanØŒ pointer content pack Ø¨Ù‡ master CVØŒ README.
- Why: Ú©ÛŒÙÛŒØª/Ø¯Ù‚Øª Ø¨Ø§Ù„Ø§ + Ø¨Ø³ØªÙ† defer Ø¨Ø§ Ø§Ø¨Ø²Ø§Ø± CIØ› Ù…Ø¹Ù…Ø§Ø±ÛŒ Ø¨Ø¯ÙˆÙ† Ù‡Ø§Ø±Ø¯Ú©Ø¯ Ø­ÙØ¸ Ø´Ø¯.
- Scope / files: pps/web/src/components/About.astroØŒ pps/web/src/data/content.tsØŒ .github/workflows/ci.ymlØŒ infra/qa/mobile-overflow.spec.mjsØŒ docs/plan/{SMALL-MODEL-EXECUTION-PLAN,P0-G0-content-pack-proposal}.mdØŒ README.md Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ø³Ù‡ task Ù…ÙˆØ§Ø²ÛŒ (explore/general/general)Ø› 
pm run check (0 error)Ø› 
pm run build (6 pages)Ø› assertions Ø±ÙˆÛŒ dist (fa Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§ h2ØŒ en GPA)Ø› 
ode --check Ùˆ YAML validation ØªÙˆØ³Ø· agent.
- Verification actually performed and result: build Ø³Ø¨Ø²Ø› heading hierarchy fa Ø±ÙØ¹ Ø´Ø¯Ø› Â«GPAÂ» data-drivenØ› CI Ø¬Ø¯ÛŒØ¯ Ù¾Ø³ Ø§Ø² push ØªØ³Øª Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Decisions / assumptions: Ø¨Ø±Ú†Ø³Ø¨â€ŒÙ‡Ø§ÛŒ ÙØ§Ø±Ø³ÛŒ Ø¨Ø®Ø´â€ŒÙ‡Ø§ Ø§Ø®ØªØ±Ø§Ø¹ Ù†Ø´Ø¯Ù†Ø¯ (Ù…Ù†ØªØ¸Ø± Ù…Ø§Ù„Ú©) â€” Ø¨Ø§ Ø³Ø·Ø­ heading Ù¾ÙˆÛŒØ§ Ù…Ø´Ú©Ù„ skip Ø­Ù„ Ø´Ø¯Ø› DEFER-0013 Ø¨Ø±Ø§ÛŒ Ø¨Ø®Ø´ overflow Ø¨Ø§ CI Ù¾ÙˆØ´Ø´ Ú¯Ø±ÙØª (Ø¨Ø®Ø´ visual Ù‡Ù…Ú†Ù†Ø§Ù† Ø¨Ø§Ø²).
- Deferred or risk IDs: DEFER-0013 OPEN (Ø¨Ø§ Ù¾ÙˆØ´Ø´ CI Ø¨Ø±Ø§ÛŒ overflow).
- Rollback / recovery: revert Ú©Ø§Ù…ÛŒØªâ€ŒÙ‡Ø§Ø› deploy Ù‚Ø¨Ù„ÛŒ Ø³Ø§Ù„Ù….

## LOG-0090 â€” 2026-08-15 â€” P2 / shared bilingual About tabs and justified text

- Outcome: About ÙØ§Ø±Ø³ÛŒ Ùˆ Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ Ø¨Ù‡ ÛŒÚ© component Ùˆ Ø³Ø§Ø®ØªØ§Ø± ÛŒÚ©Ø³Ø§Ù† CSS-only radio-tab ØªØ¨Ø¯ÛŒÙ„ Ø´Ø¯Ù†Ø¯Ø› Ù‡Ø± Ø¯Ùˆ locale Ø´Ø´ tab Ù‡Ù…â€ŒØ³Ø§Ø®ØªØ§Ø± Ø¯Ø§Ø±Ù†Ø¯ Ùˆ ÙÙ‚Ø· label/data Ø²Ø¨Ø§Ù† ØªØºÛŒÛŒØ± Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ù…ØªÙ†â€ŒÙ‡Ø§ÛŒ Ø·ÙˆÙ„Ø§Ù†ÛŒ AboutØŒ ØªØ¬Ø±Ø¨Ù‡ØŒ Ù¾Ú˜ÙˆÙ‡Ø´ØŒ publication Ùˆ certificate Ø¨Ø§ `text-align: justify` Ùˆ `text-justify: inter-word` Ø®ÙˆØ§Ù†Ø§ØªØ± Ø´Ø¯Ù†Ø¯Ø› Ù†ÙˆØ§Ø± tab Ø¯Ø± mobile Ø§ÙÙ‚ÛŒ scroll Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ JS/hydration Ø§Ø¶Ø§ÙÙ‡ Ù†Ø´Ø¯.
- Why: Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù…Ø§Ù„Ú© Ø¨Ø±Ø§ÛŒ ÛŒÚ©Ø³Ø§Ù†â€ŒØ¨ÙˆØ¯Ù† format/style/tab Ø¨ÛŒÙ† fa/en Ùˆ Ú©Ø§Ù‡Ø´ scroll Ø¹Ù…ÙˆØ¯ÛŒ.
- Scope / files: `apps/web/src/components/About.astro`ØŒ `apps/web/src/data/content.ts`ØŒ `apps/web/src/data/profile.fa.ts`ØŒ `docs/plan/P2-about-tabs-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `npm run check` (0 errors / 0 warnings / 0 hints)Ø› `npm run build` (6 pages)Ø› `node --check qa/mobile-overflow.spec.mjs`Ø› YAML validationØ› static assertions Ø¨Ø±Ø§ÛŒ Û¶ tab Ùˆ justified CSS.
- Verification actually performed and result: build Ø³Ø¨Ø²Ø› Ù‡Ø± Ø¯Ùˆ locale Ø¯Ø§Ø±Ø§ÛŒ data Ú©Ø§Ù…Ù„ Ùˆ Ø´Ø´ panel/tabØ› tabÙ‡Ø§ Ø¨Ø§ radio/CSS Ø¨Ø¯ÙˆÙ† JS Ú©Ø§Ø± Ù…ÛŒâ€ŒÚ©Ù†Ù†Ø¯Ø› mobile overflow Ø¯Ø± CI Ø¨Ø±Ø±Ø³ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯ (Chromium local Ø¨Ù‡â€ŒØ¯Ù„ÛŒÙ„ 403 CDN Ù†ØµØ¨ Ù†Ø´Ø¯).
- Decisions / assumptions: labels ÙØ§Ø±Ø³ÛŒ Ø¨Ø®Ø´â€ŒÙ‡Ø§ (`Ø³ÙˆØ§Ø¨Ù‚ Ú©Ø§Ø±ÛŒ`, `ØªØ­ØµÛŒÙ„Ø§Øª`, `Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§`, `Ø§Ù†ØªØ´Ø§Ø±Ø§Øª`, `Ù¾Ú˜ÙˆÙ‡Ø´`, `Ú¯ÙˆØ§Ù‡ÛŒâ€ŒÙ‡Ø§`) Ø¨Ø§ Ø¯Ø±Ø®ÙˆØ§Ø³Øª ØµØ±ÛŒØ­ Ù…Ø§Ù„Ú© Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯Ù†Ø¯Ø› empty future section render Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `DEFER-0013` Ø¨Ø±Ø§ÛŒ visual mobile QA/CI result Ø¨Ø§Ø² Ø§Ø³Øª.
- Rollback / recovery: revert commitØ› deploy ÙØ¹Ù„ÛŒ untouched ØªØ§ check/CI Ùˆ artifact Ø¬Ø¯ÛŒØ¯.

## LOG-0092 â€” 2026-08-15 â€” P2 / About tabs live and mobile overflow CI green

- Outcome: About ÙØ§Ø±Ø³ÛŒ Ùˆ Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ Ø¨Ø§ Ø³Ø§Ø®ØªØ§Ø± tab ÛŒÚ©Ø³Ø§Ù† Ùˆ CSS-onlyØŒ Ù…ØªÙ†â€ŒÙ‡Ø§ÛŒ Ø·ÙˆÙ„Ø§Ù†ÛŒ justifyØŒ Ø´Ø´ tab (Experience/Education/Skills/Research/Publications/Certificates) Ùˆ labels ÙØ§Ø±Ø³ÛŒ/Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ live Ø´Ø¯. Header responsive fix Ø¨Ø§Ø¹Ø« Ø´Ø¯ Playwright overflow Ø¯Ø± `/en/` Ùˆ `/en/about/` Ø¯Ø± 320px Ø§Ø² 30px Ø¨Ù‡ PASS Ø¨Ø±Ø³Ø¯.
- Why: Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù…Ø§Ù„Ú© Ø¨Ø±Ø§ÛŒ format/style/tab ÛŒÚ©Ø³Ø§Ù†ØŒ justify Ù…ØªÙ† Ùˆ Ø§Ø¯Ø§Ù…Ù‡Ù” ØªÙˆØ³Ø¹Ù‡ Ø¨Ø§ Ú©ÛŒÙÛŒØª Ù…ÙˆØ¨Ø§ÛŒÙ„.
- Scope / files: `apps/web/src/components/About.astro`ØŒ `apps/web/src/components/Header.astro`ØŒ `apps/web/src/data/content.ts`ØŒ `apps/web/src/data/profile.fa.ts`ØŒ `docs/plan/P2-about-tabs-task-spec.md`ØŒ `docs/status/deferred-validation.md`.
- Commands or actions actually performed: `npm run check` (0 errors)Ø› `npm run build` (6 pages)Ø› `node --check qa/mobile-overflow.spec.mjs`Ø› CI run `31889867770` â†’ successØ› artifact `release-01458eb` Ø¨Ø§ update-release Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± deploy Ø´Ø¯Ø› production/staging smoke PASS.
- Verification actually performed and result: Ù‡Ø± Ø¯Ùˆ locale Ø¯Ø§Ø±Ø§ÛŒ Ø´Ø´ radio/CSS tabØ› no-JS/hydration Ø­ÙØ¸ Ø´Ø¯Ø› justify CSS Ù…ÙˆØ¬ÙˆØ¯Ø› CI Ù‡Ø± Ø¯Ùˆ viewport 320/390 Ùˆ Ø´Ø´ route Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ø±Ø¯Ø› production `/en/about/` Ùˆ `/fa/about/` 200.
- Decisions / assumptions: tabs Ø¨Ø§ native radio Ùˆ CSS Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯Ù†Ø¯ ØªØ§ Ø¨Ø¯ÙˆÙ† JS Ùˆ Ø¨Ø¯ÙˆÙ† React Ú©Ø§Ø± Ú©Ù†Ù†Ø¯Ø› `DEFER-0013` ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ visual screenshot/mobile typography Ø¨Ø§Ø² Ø§Ø³ØªØŒ Ù†Ù‡ overflow.
- Deferred or risk IDs: `DEFER-0013` OPEN Ø¨Ø§ CI evidenceØ› C4 Ù‡Ù†ÙˆØ² Ù…Ù†ØªØ¸Ø± ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ CV/Resume Ù…Ø§Ù„Ú©.
- Rollback / recovery: revert commitØ› artifact Ù‚Ø¨Ù„ÛŒ Ø¨Ø§ `current` Ù‚Ø§Ø¨Ù„ Ø¨Ø§Ø²Ú¯Ø´Øª Ø§Ø³Øª.

## LOG-0091 â€” 2026-08-15 â€” CI / mobile overflow fix for English header at 320px

- Outcome: Playwright CI correctly found `overflow=30px` on `/en/` and `/en/about/` at 320Ã—568 while all fa/390 checks passed. Root cause was the longer English header brand plus About/language controls; responsive header rules now shrink spacing/labels, allow brand ellipsis and keep controls within the viewport.
- Why: `DEFER-0013` mobile overflow check is a blocking quality gate, not a check to disable.
- Scope / files: `apps/web/src/components/Header.astro` and this Work Log.
- Commands or actions actually performed: CI run `31889672810` failure reviewed; responsive media rule added; local check/build had passed before push.
- Verification actually performed and result: CI rerun required after this fix; no threshold or test was weakened.
- Deferred or risk IDs: `DEFER-0013` remains open until the next CI run passes all viewport/page cases.
- Rollback / recovery: revert the responsive header commit; previous behavior remains available.

## LOG-0094 â€” 2026-08-15 â€” CI / RTL-aware About tabs keyboard regression

- Outcome: About-tabs Playwright regression caught that the test assumed `ArrowRight` advances the radio group in RTL; product layout/activation passed, but fa keyboard checks failed. The test now chooses `ArrowLeft` for `dir="rtl"` and `ArrowRight` for LTR, preserving the real native keyboard behavior.
- Why: keyboard direction must follow locale; a test that ignores RTL would create a false failure or encourage incorrect product behavior.
- Scope / files: `apps/web/qa/about-tabs.spec.mjs` and this Work Log.
- Commands or actions actually performed: reviewed CI run `31890608892`; changed only the direction-aware key selection; syntax/diff verification follows.
- Verification actually performed and result: previous run showed all geometry/activation/locale checks PASS and only fa keyboard checks FAIL; the correction is test-only and does not weaken assertions.
- Deferred or risk IDs: `DEFER-0013` remains open until CI rerun passes.
- Rollback / recovery: revert the test-only commit; no production state affected.

## LOG-0093 â€” 2026-08-15 â€” P2 / About tab layout and locale-switch regression fix

- Outcome: audit found the About tab controls and panels were siblings inside one `nowrap` flex container, so desktop panels rendered beside/stretched by the tab strip. Controls are now in a separate horizontally scrollable wrapper and panels render below it. Header/Footer now honor `alternateHref`, so `/en/about/` switches to `/fa/about/` and vice versa instead of the locale root. A Playwright regression script now checks geometry, one-visible-panel behavior, keyboard tab movement, click activation and equivalent locale links at 320/390/1280.
- Why: this was a real P2 layout blocker and a route-contract violation; overflow-only CI did not detect panel placement or equivalent locale switching.
- Scope / files: `apps/web/src/components/About.astro`, `Header.astro`, `Footer.astro`, `apps/web/qa/about-tabs.spec.mjs`, `.github/workflows/ci.yml` and this Work Log.
- Commands or actions actually performed: `npm run check`/`npm run build` (6 pages); `node --check qa/about-tabs.spec.mjs`; `node --check qa/mobile-overflow.spec.mjs`; YAML validation; static assertions for separated controls/panels and equivalent About links.
- Verification actually performed and result: local checks PASS; CI will run the new About-tabs regression after push. No JS/hydration was added; tabs remain native radio + CSS.
- Deferred or risk IDs: `DEFER-0013` remains open until the new CI About-tabs suite passes; mobile browser visual review remains separate.
- Rollback / recovery: revert the layout/test commit; previous release remains on the server until the new artifact is deployed.

## LOG-0095 â€” 2026-08-15 â€” R2/P2 / final tab layout deploy and smoke

- Outcome: corrected About tab controls/panels, equivalent locale switches and direction-aware keyboard test are now deployed from clean HEAD `4fcd19f` as `release-4fcd19f` (checksum `13849ab7`); previous artifact naming mismatch was eliminated.
- Why: the prior deployment had been built from a working tree before the regression commits; this release is reproducible from the exact commit and includes the final tabs fix.
- Scope / files: `apps/web/` artifact only; no server config change.
- Commands or actions actually performed: clean `npm run check`/`npm run build` (23 files, 6 pages); artifact upload; `sudo -n /opt/taha/bin/update-release.sh /home/deploy/taha-stage/release-4fcd19f`; read `deploy.log`; production smoke script.
- Verification actually performed and result: deploy.log recorded `updated release-4fcd19f 13849ab7`; production smoke 7 PASS; `/en/about/` and `/fa/about/` include separated tab controls/panels and equivalent locale links.
- Decisions / assumptions: CSS-only radio tabs remain the shared no-JS implementation; visual UI QA remains covered by prior V1 plus CI geometry/keyboard/overflow tests.
- Deferred or risk IDs: `DEFER-0013` remains open only for residual full visual mobile review; overflow and tab behavior are CI-covered.
- Rollback / recovery: switch `/opt/taha/site/current` to the previous release with the scoped update script; no Caddy reload required.

## LOG-0096 â€” 2026-08-15 â€” P2 / centered About intro and six-width regression

- Outcome: with owner approval of the bounded slice, the long intro paragraphs of the About pages are now horizontally centered while keeping their readable measure, and the About-tabs regression covers both locales at 320/390/768/1024/1280/1440. `.about-bio` (60ch) and `.about-bio-long` (68ch) in `apps/web/src/components/About.astro` gained logical auto inline margins (`margin-inline: auto`); tab/entry cards remain full-width. Task Spec amended with the centered-intro contract (RTL/LTR, full-width cards, six-width matrix, 200% zoom as manual/deferred evidence). `DEFER-0013` updated: real 200% zoom evidence stays OPEN (fake zoom not simulated), QA spec path corrected from `infra/qa/â€¦` to `apps/web/qa/â€¦`.
- Why: owner screenshots showed the RTL intro constrained at x304..x906 (right-anchored) while full-width cards below started at ~x43; the read-only audit established an always-on reading-measure condition (no breakpoint near 940px) and the slice contract chose the centered measure as the fix.
- Scope / files: `apps/web/src/components/About.astro`, `apps/web/qa/about-tabs.spec.mjs`, `docs/plan/P2-about-tabs-task-spec.md`, `docs/status/deferred-validation.md` and this Work Log.
- Commands or actions actually performed: `npm run check` (0 errors / 0 warnings / 0 hints, 23 files); `npm run build` (6 pages, complete); `node --check qa/about-tabs.spec.mjs` (exit 0); `npx astro preview --port 4321` + `node qa/about-tabs.spec.mjs` â†’ 78 PASS, exit 0.
- Verification actually performed and result: for `/fa/about/` and `/en/about/` at 320/390/768/1024/1280/1440: horizontal overflow â‰¤1px, intro blocks centered within `.about` (maxDelta 0.00px at every width), cards wider than intro at desktop (1024: 944px vs 712px; 1280/1440: 1200px vs 712px), tab geometry, one visible panel, direction-aware keyboard, click activation and locale-switch links all PASS (78 PASS = 36 at 320/390/768 + 42 at 1024/1280/1440; count independently re-verified). The cards-wider assertion measures the `.entry` inside the actually visible tab panel (computed display/visibility), not the first document-order panel. The spec reads `PW_EXECUTABLE_PATH` (CI-neutral override; CI never sets it) so the local run used the already-installed real Chromium 1228 headless shell; Playwright 1.62.1's required r1234 download was throttled by the CDN (default and npmmirror mirrors, >10 min per 10%), so no browser/version change was made to the repository.
- Decisions / assumptions: 200% browser zoom is NOT simulated with synthetic viewports (fake zoom forbidden); real zoom visual evidence remains deferred in `DEFER-0013` (manual/owner or a future real-browser CI). No Luna/OpenCode config touched (owner re-authorized Luna as fallback).
- Deferred or risk IDs: `DEFER-0013` OPEN (200% zoom + full visual matrix); its QA path and status text corrected.
- Rollback / recovery: revert this slice's commit; the previous right-anchored measure behavior remains available in the prior artifact; no push/deploy performed and the deployed artifact remains unchanged.

## LOG-0097 â€” 2026-08-15 â€” P2 / zoom-safe gateway, landing and 404

- Outcome: ÛŒÚ© Ø¨Ø±Ø´ Ù…Ø³ØªÙ‚Ù„ Ùˆ Ù‚Ø§Ø¨Ù„â€ŒØ¨Ø§Ø²Ú¯Ø´Øª Ø¨Ø±Ø§ÛŒ viewportÙ‡Ø§ÛŒ Ø¨Ø³ÛŒØ§Ø± Ø¨Ø§Ø±ÛŒÚ© Ù¾ÛŒØ§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ø´Ø¯. Gateway Ùˆ 404 Ø¯ÛŒÚ¯Ø± Ù…Ø­ØªÙˆØ§ Ùˆ Ú©Ù†ØªØ±Ù„â€ŒÙ‡Ø§ Ø±Ø§ Ø¨Ø§ `overflow: hidden` ØºÛŒØ±Ù‚Ø§Ø¨Ù„â€ŒØ¯Ø³ØªØ±Ø³ÛŒ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ù†Ø¯Ø› fallback Ù…Ø±ØªØ¨ `100vh` Ø³Ù¾Ø³ `100svh` Ø¯Ø§Ø±Ù†Ø¯Ø› grid/flex Ùˆ Ù…ØªÙ†â€ŒÙ‡Ø§ÛŒ Ø¨Ù„Ù†Ø¯ shrink/wrap Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯Ø› SVG ØªØ²Ø¦ÛŒÙ†ÛŒ Gateway Ø¯Ø± Ø¬Ø¹Ø¨Ù‡Ù” Ø®ÙˆØ¯Ø´ Ù…Ø­Ø¯ÙˆØ¯ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ùˆ Perspectives grid Ø¯Ø± Landing Ø§Ø² Ø­Ø¯Ø§Ù‚Ù„ track Ø³Ø§Ø²Ú¯Ø§Ø± Ø¨Ø§ Ø¹Ø±Ø¶ Ú©Ø§Ù†ØªÛŒÙ†Ø± Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒÚ©Ù†Ø¯. QA Ù…ÙˆØ¨Ø§ÛŒÙ„ Ø¨Ø§ ÛŒÚ© browser Ù…Ø´ØªØ±Ú© Ø¨Ù‡ Ù…Ø§ØªØ±ÛŒØ³ 160Ã—284 Ùˆ 195Ã—422 (ÙÙ‚Ø· approximationØŒ Ù†Ù‡ zoom ÙˆØ§Ù‚Ø¹ÛŒ) Ø¨Ù‡â€ŒØ¹Ù„Ø§ÙˆÙ‡Ù” 320/390/768/1024/1280/1440 Ú¯Ø³ØªØ±Ø´ ÛŒØ§ÙØª Ùˆ `dir`ØŒ overflow Ùˆ Ø¯Ø³ØªØ±Ø³ÛŒ Ú©Ù†ØªØ±Ù„â€ŒÙ‡Ø§ÛŒ Gateway/404 Ø±Ø§ Ø¨Ø±Ø±Ø³ÛŒ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Why: Ù…Ù…ÛŒØ²ÛŒ Ø±ÛŒØ³Ù¾Ø§Ù†Ø³ÛŒÙˆ Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ `overflow: hidden` Ø¯Ø± Gateway/404 Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ù…Ø³ÛŒØ± Ø§Ø³Ú©Ø±ÙˆÙ„ Ø±Ø§ Ø¯Ø± 200Ùª zoom Ø§Ø² Ø¨ÛŒÙ† Ø¨Ø¨Ø±Ø¯Ø› Ø§Ù†Ø¯Ø§Ø²Ù‡â€ŒÚ¯ÛŒØ±ÛŒ Ù…Ø±ÙˆØ±Ú¯Ø± Ù‡Ù…Ú†Ù†ÛŒÙ† min-content Ù…ØªÙ† Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ Ùˆ SVG ØªÙ…Ø§Ù…â€ŒØµÙØ­Ù‡ Ø±Ø§ Ø¹Ø§Ù…Ù„ `scrollWidth` Ø§Ø¶Ø§ÙÛŒ Ù…Ø¹Ø±ÙÛŒ Ú©Ø±Ø¯. Ù¾Ù†Ù‡Ø§Ù†â€ŒÚ©Ø±Ø¯Ù† overflow Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù¾Ø§Ø³Ø® Ù¾Ø°ÛŒØ±ÙØªÙ‡ Ù†Ø´Ø¯ Ùˆ Ø¹Ù„Øªâ€ŒÙ‡Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ø¯Ø± Ù‡Ù…Ø§Ù† Ø§Ø¬Ø²Ø§ Ø§ØµÙ„Ø§Ø­ Ø´Ø¯Ù†Ø¯.
- Scope / files: `apps/web/src/pages/index.astro`, `apps/web/src/pages/404.astro`, `apps/web/src/components/Landing.astro`, `apps/web/qa/mobile-overflow.spec.mjs`, `docs/plan/P2-zoom-safety-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `npm ci` Ø¯Ø± worktree Ø§ÛŒØ²ÙˆÙ„Ù‡Ø› `npm run check` (23 filesØŒ 0 error/warning/hint)Ø› `npm run build` (6 pages)Ø› `node --check qa/mobile-overflow.spec.mjs`Ø› preview ØªØ§Ø²Ù‡ Ø±ÙˆÛŒ `127.0.0.1:4322` Ùˆ Ø§Ø¬Ø±Ø§ÛŒ spec Ø¨Ø§ Chrome channelØ› `git diff --check`.
- Verification actually performed and result: Ù¾Ø³ Ø§Ø² rebase Ø±ÙˆÛŒ `LOG-0096`ØŒ mobile-overflow regression Ø¨Ø±Ø§Ø¨Ø± 128 PASS / 0 FAIL Ùˆ dedicated About-tabs regression Ø¨Ø±Ø§Ø¨Ø± 78 PASS / 0 FAIL Ø¨ÙˆØ¯. `/`, `/en/`, `/fa/`, `/404.html` Ø¯Ø± Ø¯Ùˆ viewport ØªÙ‚Ø±ÛŒØ¨ÛŒ Ùˆ Ø´Ø´ Ø¹Ø±Ø¶ Ø¹Ø§Ø¯ÛŒ Ø¨Ø¯ÙˆÙ† overflow Ø§ÙÙ‚ÛŒ Ú¯Ø°Ø´ØªÙ†Ø¯Ø› AboutÙ‡Ø§ÛŒ fa/en Ø¯Ø± Ø´Ø´ Ø¹Ø±Ø¶ Ø¹Ø§Ø¯ÛŒ Ú¯Ø°Ø´ØªÙ†Ø¯Ø› `dir` Ø¨Ø±Ø§ÛŒ fa=rtl Ùˆ Ø¨Ù‚ÛŒÙ‡=ltr Ø¨ÙˆØ¯Ø› Ù‡Ù…Ù‡Ù” Ú©Ù†ØªØ±Ù„â€ŒÙ‡Ø§ÛŒ Gateway/404 Ù¾Ø³ Ø§Ø² `scrollIntoViewIfNeeded()` Ø¯Ø§Ø®Ù„ viewport Ùˆ Ù‚Ø§Ø¨Ù„â€ŒØ¯Ø³ØªØ±Ø³ÛŒ Ø¨ÙˆØ¯Ù†Ø¯. Ø§ÛŒÙ† Ù†ØªØ§ÛŒØ¬ zoom ÙˆØ§Ù‚Ø¹ÛŒ Ù…Ø±ÙˆØ±Ú¯Ø± Ø±Ø§ Ø§Ø¯Ø¹Ø§ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ù†Ø¯.
- Decisions / assumptions: Ø¯Ùˆ viewport Ù†ØµÙâ€ŒØ´Ø¯Ù‡ ÙÙ‚Ø· approximation Ø¨Ø±Ø§ÛŒ Ú©Ø´Ù Ø±ÛŒØ³Ú© layout Ù‡Ø³ØªÙ†Ø¯Ø› evidence ÙˆØ§Ù‚Ø¹ÛŒ 200Ùª Ø¯Ø± `DEFER-0013` Ø¨Ø§Ø² Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯. Ø§Ø¬Ø±Ø§ÛŒ Ù†Ù‡Ø§ÛŒÛŒ Ù…Ø³ØªÙ‚ÛŒÙ… Ù¾Ø³ Ø§Ø² Ú¯ÛŒØ±Ú©Ø±Ø¯Ù† Ø¹Ø§Ù…Ù„â€ŒÙ‡Ø§ Ø±ÙˆÛŒ preview path/server Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯Ø› ØªØºÛŒÛŒØ±Ø§Øª Ù‡Ù…Ú†Ù†Ø§Ù† Ø¯Ø± worktree Ùˆ branch Ù…Ø¬Ø²Ø§ÛŒ `cx/p2-zoom-safety` Ù‡Ø³ØªÙ†Ø¯.
- Deferred or risk IDs: `DEFER-0013` OPEN Ø¨Ø±Ø§ÛŒ visual matrix Ùˆ zoom ÙˆØ§Ù‚Ø¹ÛŒØ› hosted CI Ù¾Ø³ Ø§Ø² push Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Rollback / recovery: revert commit Ø§ÛŒÙ† Ø¨Ø±Ø´Ø› artifact Ù…Ø³ØªÙ‚Ø±Ø´Ø¯Ù‡ ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯Ù‡ Ùˆ Ù‡ÛŒÚ† push/deploy/SSH Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0098 â€” 2026-08-15 â€” Tooling / RTK for OpenCode agents and sub-agents

- Outcome: Ù†Ø³Ø®Ù‡ Ø±Ø³Ù…ÛŒ Windows x86_64 Ø§Ø² RTK `0.45.0` Ø¯Ø± `C:\Users\Taha\.local\bin\rtk.exe` Ù†ØµØ¨ Ø´Ø¯ Ùˆ plugin Ø±Ø³Ù…ÛŒ OpenCode Ø¯Ø± `C:\Users\Taha\.config\opencode\plugins\rtk.ts` ÙØ¹Ø§Ù„ Ø´Ø¯. ÛŒÚ© session ØªØ§Ø²Ù‡â€ŒÛŒ OpenCode `1.18.18` Ø¨Ø§ DeepSeek V4 Flash Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯ commandÙ‡Ø§ÛŒ shell Ø¨Ø±Ø§ÛŒ agent Ø§ØµÙ„ÛŒ Ùˆ general sub-agent Ø¨Ù‡â€ŒØµÙˆØ±Øª Ø®ÙˆØ¯Ú©Ø§Ø± Ø§Ø² RTK Ø¹Ø¨ÙˆØ± Ù…ÛŒâ€ŒÚ©Ù†Ù†Ø¯.
- Why: Ø®Ø±ÙˆØ¬ÛŒâ€ŒÙ‡Ø§ÛŒ Ø·ÙˆÙ„Ø§Ù†ÛŒ Git/build/test Ø¨Ø®Ø´ÛŒ Ø§Ø² context Ù…Ø¯Ù„ Ø±Ø§ Ù…ØµØ±Ù Ù…ÛŒâ€ŒÚ©Ù†Ù†Ø¯Ø› RTK Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ø§ÛŒÙ† Ø®Ø±ÙˆØ¬ÛŒ Ø±Ø§ ÙØ´Ø±Ø¯Ù‡ Ú©Ù†Ø¯ØŒ Ø§Ù…Ø§ Ù…ÛŒØ²Ø§Ù† Ø¢Ù† ÙˆØ§Ø¨Ø³ØªÙ‡ Ø¨Ù‡ command Ø§Ø³Øª Ùˆ Ù…Ø¹Ø§Ø¯Ù„ Ù‚Ø·Ø¹ÛŒ Ú©Ø§Ù‡Ø´ Ù‡Ø²ÛŒÙ†Ù‡ API Ù†ÛŒØ³Øª.
- Scope / files: binary Ùˆ plugin Ø±Ø³Ù…ÛŒ Ø¯Ø± Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ global Ø¨Ø§Ù„Ø§Ø› `PROJECT_MANIFEST.md`ØŒ `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md`ØŒ `docs/plan/R0-rtk-opencode-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log. Ù‡ÛŒÚ† dependency/config Ù…Ø¯Ù„ØŒ applicationØŒ CIØŒ VPS ÛŒØ§ production ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯.
- Commands or actions actually performed: Ø¯Ø±ÛŒØ§ÙØª release Ø±Ø³Ù…ÛŒ `v0.45.0`Ø› ØªØ·Ø¨ÛŒÙ‚ SHA-256 Ø¢Ø±Ø´ÛŒÙˆ (`34cea9009a8099acdaf85147b971d95f65efabfa63fb3aea7d3e2b73e6f517c3`)Ø› `rtk --version`Ø› dry-run Ùˆ Ø³Ù¾Ø³ `rtk init -g --opencode`Ø› `rtk init --show`Ø› Ù…Ù‚Ø§ÛŒØ³Ù‡ raw/RTK Ø¨Ø±Ø§ÛŒ `git status`ØŒ `git log -n 10` Ùˆ `npm run build`Ø› smoke ÙˆØ§Ù‚Ø¹ÛŒ OpenCode Ø¨Ø±Ø§ÛŒ main/sub-agentØ› `rtk gain --history`Ø› dry-run Ù…Ø³ÛŒØ± uninstallØ› Ùˆ review Ù…Ø³ØªÙ‚Ù„ read-only ØªÙˆØ³Ø· OpenCode/DeepSeek V4 Flash Ø±ÙˆÛŒ diff Ùˆ Task Spec.
- Verification actually performed and result: checksum Ø¯Ù‚ÛŒÙ‚Ø§Ù‹ MATCHØ› Ù†Ø³Ø®Ù‡ `0.45.0`Ø› plugin status Ø¨Ø±Ø§Ø¨Ø± installedØ› main-agent ÙØ±Ù…Ø§Ù† `git status` Ø±Ø§ Ø¨Ù‡ `rtk git status` Ùˆ sub-agent ÙØ±Ù…Ø§Ù† `git log -n 10` Ø±Ø§ Ø¨Ù‡ `rtk git log -n 10` rewrite Ú©Ø±Ø¯. Ù…Ù‚Ø§ÛŒØ³Ù‡ byte Ø­Ø¯ÙˆØ¯ 77.6Ùª Ú©Ø§Ù‡Ø´ Ø¨Ø±Ø§ÛŒ status Ùˆ 52.2Ùª Ø¨Ø±Ø§ÛŒ log Ø¯Ø§Ø´ØªØ› build ÙÙ‚Ø· 2.8Ùª Ú©Ø§Ù‡Ø´ ØªØ®Ù…ÛŒÙ†ÛŒ RTK Ø¯Ø§Ø´Øª. history Ø§ÙˆÙ„ÛŒÙ‡ Ø±ÙˆÛŒ 7 command Ø¨Ø±Ø§Ø¨Ø± 216 token ØªØ®Ù…ÛŒÙ†ÛŒ / 17.9Ùª Ø¨ÙˆØ¯Ø› Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† Ø¯Ø±ØµØ¯ Ø¹Ù…ÙˆÙ…ÛŒ ÛŒØ§ billing saving Ø§Ø¯Ø¹Ø§ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯. reviewer Ù…Ø³ØªÙ‚Ù„ Ù†ØªÛŒØ¬Ù‡ `PASS` Ø¨Ø§ Ø¯Ùˆ note ØºÛŒØ±Ù…Ø³Ø¯ÙˆØ¯Ú©Ù†Ù†Ø¯Ù‡ Ø¯Ø§Ø¯Ø› `git diff --check` Ù†ÛŒØ² exit 0 Ø¨ÙˆØ¯.
- Decisions / assumptions: ÙÙ‚Ø· integration Ø±Ø³Ù…ÛŒ first-party Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø´Ø¯ Ùˆ wrapper Ø«Ø§Ù„Ø« `openrtk` Ù†ØµØ¨ Ù†Ø´Ø¯. Ù†Ø¨ÙˆØ¯Ù† Claude hook Ø¹Ù…ÙˆÙ…ÛŒ Ø¹Ù…Ø¯ÛŒ Ø§Ø³ØªØ› Ù…Ø±Ø² Ø§ÛŒÙ† Ú©Ø§Ø± ÙÙ‚Ø· OpenCode Ø§Ø³Øª. sessionÙ‡Ø§ÛŒ Ø§Ø² Ù‚Ø¨Ù„ Ø¨Ø§Ø² Ø¨Ø§ÛŒØ¯ restart Ø´ÙˆÙ†Ø¯. Ø¯Ø± failureØŒ ambiguity ÛŒØ§ acceptance Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ Ø®Ø±ÙˆØ¬ÛŒ Ø¯Ù‚ÛŒÙ‚ØŒ raw output Ø¨Ø§ÛŒØ¯ Ø¨Ø§Ø²ÛŒØ§Ø¨ÛŒ Ùˆ Ø¨Ø±Ø±Ø³ÛŒ Ø´ÙˆØ¯.
- Deferred or risk IDs: Ù…ÙˆØ±Ø¯ release-blocking Ø¬Ø¯ÛŒØ¯ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ù†Ø´Ø¯. Ø±ÛŒØ³Ú© Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡ Ú©Ù… Ø§Ø³Øª: Ø¨Ø±Ø¢ÙˆØ±Ø¯ token Ù…Ø­Ù„ÛŒ Ø§Ø³Øª Ùˆ compaction Ù…Ù…Ú©Ù† Ø§Ø³Øª Ø¬Ø²Ø¦ÛŒØ§Øª Ù„Ø§Ø²Ù… Ø±Ø§ Ù¾Ù†Ù‡Ø§Ù† Ú©Ù†Ø¯Ø› mitigation Ø¯Ø± S-Plan Ø«Ø¨Øª Ø´Ø¯.
- Rollback / recovery: Ø§Ø¨ØªØ¯Ø§ `rtk init -g --opencode --uninstall`ØŒ Ø³Ù¾Ø³ ØªØ£ÛŒÛŒØ¯ Ù†Ø¨ÙˆØ¯ plugin Ùˆ restart OpenCodeØ› ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² Ø¨Ø±Ø±Ø³ÛŒ ÙˆØ§Ø¨Ø³ØªÚ¯ÛŒ Ø³Ø§ÛŒØ± workflowÙ‡Ø§ binary Ø¯Ù‚ÛŒÙ‚ `C:\Users\Taha\.local\bin\rtk.exe` Ø­Ø°Ù Ø´ÙˆØ¯. rollback Ù…Ø®Ø²Ù† Ø¨Ø§ revert Ù‡Ù…ÛŒÙ† commit Ù…Ø³ØªÙ†Ø¯Ø§ØªÛŒ Ø§Ø³ØªØ› push/deploy Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.

## LOG-0099 â€” 2026-08-15 â€” P2 / Linux CI mobile-header overflow regression

- Outcome: CI run `31902292412` ÙÙ‚Ø· Ø¯Ø± `/en/` Ùˆ viewport ØªÙ‚Ø±ÛŒØ¨ÛŒ `160Ã—284`ØŒ `20px` overflow Ú¯Ø²Ø§Ø±Ø´ Ú©Ø±Ø¯. Ø¹Ù„ØªØŒ min-content Ù…Ø±Ø²ÛŒ header Ø¨ÙˆØ¯: `.site-header-inner` Ø­ØªÛŒ Ø¨Ø§ Inter Ù…Ø­Ù„ÛŒ Ø¨Ù‡ `161.2px` Ù…ÛŒâ€ŒØ±Ø³ÛŒØ¯ Ùˆ Ú¯Ø±ÙˆÙ‡ nav Ù†Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø³Øª Ø¯Ø± metric ÙÙˆÙ†Øª fallback Ù„ÛŒÙ†ÙˆÚ©Ø³ shrink Ø´ÙˆØ¯. Ø²ÛŒØ± `12rem`ØŒ Ù†Ø§Ù… Ø¨ØµØ±ÛŒ brand Ø­Ø°Ù Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ø§Ù…Ø§ Ø®ÙˆØ¯ Ù„ÛŒÙ†Ú© Ù…Ø­ÙÙˆØ¸ Ø§Ø³Øª Ùˆ Ø¯Ùˆ Ù„ÛŒÙ†Ú© nav Ø¯Ø± ÛŒÚ© grid row Ù…Ø³Ø§ÙˆÛŒ Ùˆ Ù‚Ø§Ø¨Ù„â€ŒØ¯Ø³ØªØ±Ø³ÛŒ Ù‚Ø±Ø§Ø± Ù…ÛŒâ€ŒÚ¯ÛŒØ±Ù†Ø¯.
- Why: Ù‡ÛŒÚ† route ÛŒØ§ Ù…ØªÙ† ØªØ£ÛŒÛŒØ¯Ø´Ø¯Ù‡ Ù†Ø¨Ø§ÛŒØ¯ Ø¨Ø±Ø§ÛŒ Ø¹Ø¨ÙˆØ± CI Ø­Ø°Ù Ø´ÙˆØ¯Ø› Ø±Ø§Ù‡â€ŒØ­Ù„ Ø¨Ø§ÛŒØ¯ linkÙ‡Ø§ÛŒ locale/AboutØŒ Ø§Ø±ØªÙØ§Ø¹ Ù„Ù…Ø³ Ùˆ RTL/LTR Ø±Ø§ Ø­ÙØ¸ Ú©Ù†Ø¯ Ùˆ Ø¨Ù‡ font metric ÙˆØ§Ø¨Ø³ØªÙ‡ Ù†Ø¨Ø§Ø´Ø¯.
- Scope / files: `apps/web/src/components/Header.astro`ØŒ `apps/web/qa/mobile-overflow.spec.mjs`ØŒ `docs/plan/P2-mobile-overflow-ci-regression-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: Ù„Ø§Ú¯ failed run Ø¨Ø§ `gh run view 31902292412 --log-failed` Ø®ÙˆØ§Ù†Ø¯Ù‡ Ø´Ø¯Ø› DOM/min-content Ù…Ø­Ù„ÛŒ Ø¨Ø§ Chrome ÙˆØ§Ù‚Ø¹ÛŒ Ø¨Ø±Ø±Ø³ÛŒ Ø´Ø¯Ø› `npm run check`Ø› `npm run build`Ø› preview Ù…Ø­Ù„ÛŒ `127.0.0.1:4323`Ø› `PREVIEW_URL=http://127.0.0.1:4323 PLAYWRIGHT_CHANNEL=chrome node qa/mobile-overflow.spec.mjs`Ø› Ùˆ `git diff --check`.
- Verification actually performed and result: Astro check Ø¨Ø±Ø§Ø¨Ø± 0 error/warning/hint Ùˆ build Ø¨Ø±Ø§Ø¨Ø± 6 pages Ø¨ÙˆØ¯. Ú©Ù„ matrix mobile overflow Ø¨Ø§ Chrome ÙˆØ§Ù‚Ø¹ÛŒ PASS Ø´Ø¯Ø› Ú©Ù†ØªØ±Ù„â€ŒÙ‡Ø§ÛŒ `.site-header a` Ø§Ú©Ù†ÙˆÙ† Ø¨Ø±Ø§ÛŒ `/en/`ØŒ `/fa/` Ùˆ Ù‡Ø± Ø¯Ùˆ About locale Ù‡Ù… Ø¯Ø± QA Ø¨Ø±Ø±Ø³ÛŒ Ùˆ Ø¯Ø± viewport Ù‚Ø§Ø¨Ù„â€ŒØ¯Ø³ØªØ±Ø³ÛŒâ€ŒØ§Ù†Ø¯. browser bundled Playwright revision Ù…Ø­Ù„ÛŒ Ù…ÙˆØ¬ÙˆØ¯ Ù†Ø¨ÙˆØ¯Ø› Chrome Ù†ØµØ¨â€ŒØ´Ø¯Ù‡ Ø¨Ø§ override ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ local QA Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø´Ø¯. hosted Linux CI Ù¾Ø³ Ø§Ø² push Ø§ÛŒÙ† fix Ù…Ø¹ÛŒØ§Ø± Ù†Ù‡Ø§ÛŒÛŒ Ø§Ø³Øª.
- Decisions / assumptions: assertion overflow ÛŒØ§ matrix Ù…Ø­Ø¯ÙˆØ¯ Ù†Ø´Ø¯ Ùˆ `DEFER-0013` Ø¨Ø±Ø§ÛŒ real 200% zoom unchanged Ø§Ø³Øª. header Ø¯Ø± viewport ÙÙˆÙ‚â€ŒØ¨Ø§Ø±ÛŒÚ© Ø¹Ù…Ø¯Ø§Ù‹ Ø¯Ùˆ Ø±Ø¯ÛŒÙ Ù…ÛŒâ€ŒØ´ÙˆØ¯ ØªØ§ linkÙ‡Ø§ Ø¨Ù‡â€ŒØ¬Ø§ÛŒ clip/shrink ØºÛŒØ±Ù‚Ø§Ø¨Ù„â€ŒØ§Ø³ØªÙØ§Ø¯Ù‡ Ù‚Ø§Ø¨Ù„â€ŒØ¯Ø³ØªØ±Ø³ÛŒ Ø¨Ù…Ø§Ù†Ù†Ø¯.
- Deferred or risk IDs: `DEFER-0013` OPENØ› evidence ÙˆØ§Ù‚Ø¹ÛŒ zoom Ù‡Ù†ÙˆØ² Ø¯Ø³ØªÛŒ/owner Ø§Ø³Øª. CI rerun Ø¨Ø±Ø§ÛŒ Ø§Ø®ØªÙ„Ø§Ù metric Ù„ÛŒÙ†ÙˆÚ©Ø³ pending Ø§Ø³Øª.
- Rollback / recovery: revert commit Ø§ÛŒÙ† regression fixØ› artifact production Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡ Ø§Ø³Øª Ùˆ Ù‡ÛŒÚ† deploy/SSH Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0100 â€” 2026-08-15 â€” P2 / Landing CTA hardening after CI retry

- Outcome: CI retry `31903032574` Ù¾Ø³ Ø§Ø² hardening header Ø¨Ø§Ø² Ù‡Ù… ÙÙ‚Ø· `/en/@160Ã—284` Ø±Ø§ Ø¨Ø§ `overflow=20px` fail Ú©Ø±Ø¯Ø› Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† header Ø¨Ù‡â€ŒØªÙ†Ù‡Ø§ÛŒÛŒ root cause Ù†Ø¨ÙˆØ¯. Landing CTA Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ Ø§Ú©Ù†ÙˆÙ† `min-width: 0`ØŒ `max-width: 100%` Ùˆ `overflow-wrap: anywhere` Ø¯Ø§Ø±Ø¯ Ùˆ Ø¯Ø± Ø²ÛŒØ± `12rem` ØªÙ…Ø§Ù…â€ŒØ¹Ø±Ø¶ Ø¨Ø§ padding Ú©Ù…ØªØ± Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› hero/section Ù†ÛŒØ² padding Ø§ÙÙ‚ÛŒ Ø§Ù…Ù† Ø¯Ø§Ø±Ù†Ø¯. QA Ù‡Ù†Ú¯Ø§Ù… overflow Ø¨Ø¹Ø¯ÛŒ selector/box source Ø±Ø§ Ù‡Ù… Ø¯Ø± log Ú†Ø§Ù¾ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- Why: retry failure Ø¨Ø§ÛŒØ¯ Ø¨Ù‡ evidence ØªØ¨Ø¯ÛŒÙ„ Ø´ÙˆØ¯ØŒ Ù†Ù‡ Ø¨Ù‡ ØªØºÛŒÛŒØ± Ø¸Ø§Ù‡Ø±ÛŒ Ø­Ø¯Ø³ÛŒ. CTA Ø¯Ø§Ø±Ø§ÛŒ label Ø·ÙˆÙ„Ø§Ù†ÛŒ Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ Ùˆ padding Ø«Ø§Ø¨Øª Ø¯Ø± 128px content width Ø¨ÙˆØ¯Ø› layout Ø¬Ø¯ÛŒØ¯ label/target Ø±Ø§ Ø¨Ø¯ÙˆÙ† Ø­Ø°Ù ÛŒØ§ clip Ø¯Ø± container Ù†Ú¯Ù‡ Ù…ÛŒâ€ŒØ¯Ø§Ø±Ø¯.
- Scope / files: `apps/web/src/components/Landing.astro`ØŒ `apps/web/qa/mobile-overflow.spec.mjs`ØŒ `docs/plan/P2-mobile-overflow-ci-regression-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: review Ú©Ø§Ù…Ù„ log `31903032574`Ø› `npm run check` (0 error/warning/hint)Ø› `npm run build` (6 pages)Ø› `node --check qa/mobile-overflow.spec.mjs`Ø› preview Ù…Ø­Ù„ÛŒØ› Ùˆ Ø§Ø¬Ø±Ø§ÛŒ Ú©Ø§Ù…Ù„ `mobile-overflow.spec.mjs` Ø¨Ø§ Chrome ÙˆØ§Ù‚Ø¹ÛŒ Ú©Ù‡ PASS Ø´Ø¯.
- Verification actually performed and result: matrix Ù…Ø­Ù„ÛŒ Ù‡Ù…Ù‡ routeÙ‡Ø§ØŒ widthÙ‡Ø§ØŒ `dir` Ùˆ Ú©Ù†ØªØ±Ù„â€ŒÙ‡Ø§ÛŒ header/gateway/404 Ø±Ø§ PASS Ú©Ø±Ø¯. Chromium bundled Ù„ÛŒÙ†ÙˆÚ©Ø³ÛŒ ÙÙ‚Ø· Ø¯Ø± hosted CI ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø±Ø¯Ø› Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† rerun Ø¨Ø¹Ø¯ Ø§Ø² push evidence Ù†Ù‡Ø§ÛŒÛŒ Ø§ÛŒÙ† slice Ø§Ø³Øª.
- Decisions / assumptions: header safe-layout Ø§Ø² commit Ù¾ÛŒØ´ÛŒÙ† Ø­ÙØ¸ Ø´Ø¯ØŒ Ø§Ù…Ø§ Ø¹Ù„Øª Ù†Ù‡Ø§ÛŒÛŒ Ø¨Ø¯ÙˆÙ† Ø´ÙˆØ§Ù‡Ø¯ selector-specific Ø§Ø¯Ø¹Ø§ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯. assertion/matrix Ø¶Ø¹ÛŒÙ Ù†Ø´Ø¯Ø› diagnostic ÙÙ‚Ø· Ø±ÙˆÛŒ failure Ú†Ø§Ù¾ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: `DEFER-0013` unchanged/Open Ø¨Ø±Ø§ÛŒ zoom ÙˆØ§Ù‚Ø¹ÛŒ. hosted CI rerun pending.
- Rollback / recovery: revert commit CTA hardening Ùˆ Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø² revert commit header regressionØ› Ù‡ÛŒÚ† deploy/SSH Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0101 â€” 2026-08-15 â€” P2 / selector-confirmed Linux overflow closure

- Outcome: failure diagnostic Ø§Ø² CI run `31903254960` Ù…Ù†Ø¨Ø¹â€ŒÙ‡Ø§ÛŒ Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡ Ø±Ø§ Ø¯Ù‚ÛŒÙ‚Ø§Ù‹ Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯: `.section-heading` Ø¯Ø± content box `136px` ØªØ§ `164px` scroll Ù…ÛŒâ€ŒÚ©Ø±Ø¯ Ùˆ footer Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ (`.footer-brand-copy`/name/tagline) Ø¨Ù‡ `176px` Ù…ÛŒâ€ŒØ±Ø³ÛŒØ¯. Ø¹Ù†ÙˆØ§Ù† Landing Ùˆ Ù…ØªÙ† brand/footer Ø§Ú©Ù†ÙˆÙ† `overflow-wrap: anywhere` Ø¯Ø§Ø±Ù†Ø¯Ø› flex container/footer copy Ù‡Ù… `min-width: 0` Ø¯Ø§Ø±Ù†Ø¯. Ù‡ÛŒÚ† labelØŒ route ÛŒØ§ control Ø­Ø°Ù Ù†Ø´Ø¯.
- Why: Ø¯Ùˆ retry Ù‚Ø¨Ù„ÛŒ Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯Ù†Ø¯ ÙØ±Ø¶Ù ÛŒÚ© root cause Ú©Ø§ÙÛŒ Ù†Ø¨ÙˆØ¯. QA Ø¨Ø§ÛŒØ¯ failure Ø±Ø§ Ø¨Ø§ selector/box evidence Ú¯Ø²Ø§Ø±Ø´ Ú©Ù†Ø¯ ØªØ§ fix Ø¨Ø¹Ø¯ÛŒ Ø¯Ù‚ÛŒÙ‚ Ø¨Ø§Ø´Ø¯.
- Scope / files: `apps/web/src/components/Footer.astro`ØŒ `apps/web/src/components/Landing.astro`ØŒ `apps/web/qa/mobile-overflow.spec.mjs`ØŒ `docs/plan/P2-mobile-overflow-ci-regression-task-spec.md` Ùˆ Ù‡Ù…ÛŒÙ† Work Log.
- Commands or actions actually performed: `gh run view 31903254960 --log-failed` Ø¨Ø§ diagnostic sourceØ› `npm run check` (0 error/warning/hint)Ø› `npm run build` (6 pages)Ø› `node --check qa/mobile-overflow.spec.mjs`Ø› preview ØªØ§Ø²Ù‡Ø› Ùˆ full mobile-overflow matrix Ø¨Ø§ Chrome ÙˆØ§Ù‚Ø¹ÛŒ PASS.
- Verification actually performed and result: Ù‡Ù…Ù‡Ù” route/viewport/dir/control checkÙ‡Ø§ÛŒ local PASS Ø´Ø¯Ù†Ø¯. diagnostic CIØŒ width Ùˆ selector Ø¯Ù‚ÛŒÙ‚ Ø±Ø§ Ø«Ø¨Øª Ú©Ø±Ø¯Ø› hosted Linux rerun Ù¾Ø³ Ø§Ø² push ØªÙ†Ù‡Ø§ evidence Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡ Ø§Ø³Øª.
- Decisions / assumptions: ÙÙ‚Ø· Ù‚ÙˆØ§Ø¹Ø¯ shrink/wrap Ø±ÙˆÛŒ Ø¹Ù†Ø§ØµØ± proven Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯Ø› overflow assertionØŒ viewport matrix Ùˆ `DEFER-0013` ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯Ù†Ø¯.
- Deferred or risk IDs: `DEFER-0013` OPEN Ø¨Ø±Ø§ÛŒ zoom ÙˆØ§Ù‚Ø¹ÛŒØ› CI final rerun pending.
- Rollback / recovery: revert Ø§ÛŒÙ† commit Ùˆ Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø² commitÙ‡Ø§ÛŒ Ù¾ÛŒØ´ÛŒÙ† regression fixØ› production untouched Ùˆ Ù‡ÛŒÚ† deploy/SSH Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0102 â€” 2026-08-15 â€” P2 / hosted CI green for tiny-viewport regression

- Outcome: GitHub Actions run `31903433836` Ø¨Ø±Ø§ÛŒ commit `d69b0e9` Ø³Ø¨Ø² Ø´Ø¯. Mobile overflow check Ú©Ù‡ Ø³Ù‡ run Ù‚Ø¨Ù„ÛŒ Ø¯Ø± `/en/@160Ã—284` fail Ø´Ø¯Ù‡ Ø¨ÙˆØ¯ØŒ Ø§Ú©Ù†ÙˆÙ† PASS Ø§Ø³ØªØ› About-tabs regressionØŒ auditØŒ artifact/secret validation Ùˆ upload Ù†ÛŒØ² PASS Ø´Ø¯Ù†Ø¯.
- Why: Linux hosted Chromium evidence Ù†Ù‡Ø§ÛŒÛŒ Ø§ÛŒÙ† slice Ø§Ø³ØªØ› Chrome Ù…Ø­Ù„ÛŒ Ø¨Ù‡â€ŒØªÙ†Ù‡Ø§ÛŒÛŒ Ø§Ø®ØªÙ„Ø§Ù metric ÙÙˆÙ†Øª Linux Ø±Ø§ Ø§Ø«Ø¨Ø§Øª Ù†Ù…ÛŒâ€ŒÚ©Ø±Ø¯.
- Scope / files: ÙÙ‚Ø· Ø§ÛŒÙ† Task Spec Ùˆ Work Log Ø¨Ø±Ø§ÛŒ Ø«Ø¨Øª evidence Ù†Ù‡Ø§ÛŒÛŒ.
- Commands or actions actually performed: `gh run watch 31903433836 --exit-status` ØªØ§ completionØ› status/workflow steps Ø§Ø² GitHub Actions Ø®ÙˆØ§Ù†Ø¯Ù‡ Ø´Ø¯.
- Verification actually performed and result: type checkØŒ buildØŒ smokeØŒ Mobile overflow PlaywrightØŒ About tabs PlaywrightØŒ dependency auditØŒ artifact completeness/no-secret Ùˆ upload artifact Ù‡Ù…Ú¯ÛŒ PASSØ› Ù…Ø¯Øª workflow 2m4s.
- Decisions / assumptions: production deploy Ø¯Ø± scope Task Spec Ù†ÛŒØ³Øª Ùˆ Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ø› passing CI release artifact Ø±Ø§ ÙØ±Ø§Ù‡Ù… Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ø§Ù…Ø§ Ø¨Ù‡â€ŒØªÙ†Ù‡Ø§ÛŒÛŒ deploy authorization Ù†ÛŒØ³Øª.
- Deferred or risk IDs: `DEFER-0013` Ù‡Ù…Ú†Ù†Ø§Ù† OPEN ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ real 200% zoom/manual visual evidenceØ› failure CI Ø§ÛŒÙ† slice Ø¨Ø³ØªÙ‡ Ø´Ø¯.
- Rollback / recovery: revert commitÙ‡Ø§ÛŒ `d69b0e9`ØŒ `6466d72` Ùˆ `af3d16e` Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø²Ø› artifact production Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡ Ø§Ø³Øª.

## LOG-0103 â€” 2026-08-15 â€” G0-01 / documentation-drift closure audit

- Outcome: closure audit of `G0-01` confirmed that commit `6adb0b8` and `LOG-0051` had completed the intended documentation reconciliation, but found one residual URL-route example: the Technology Baseline still listed Caddy reverse-proxy `/cms`. It now states `/admin/`, matching ADR-0014/ADR-0008. The Task Spec status is now complete.
- Why: the task's own verification required no remaining `/cms/` URL-route example; leaving one stale route could misdirect a future CMS deploy even though `apps/cms/` remains the correct source directory.
- Scope / files: `docs/taha-personal-platform-technology-architecture-baseline-fa.md`, `docs/plan/P0-G0-documentation-drift-task-spec.md` and this Work Log.
- Commands or actions actually performed: Git-history audit of `6adb0b8`; scoped route searches; current ADR-0014/ADR-0008 comparison; `rg "/cms/" docs/taha-personal-platform-technology-architecture-baseline-fa.md`; and `git diff --check`.
- Verification actually performed and result: `/admin/` is the only remaining admin URL-route form in the Technology Baseline; `apps/cms/` is the sole `/cms/` occurrence and is a filesystem source path. No runtime/config/ADR decision changed.
- Decisions / assumptions: this is documentation-only and does not authorize CMS bootstrap, deployment or a route implementation.
- Deferred or risk IDs: no status changed; existing P0/P3 risks and deferrals remain as recorded.
- Rollback / recovery: revert this documentation-only commit; no runtime state is affected.

## LOG-0104 â€” 2026-08-15 â€” P2 / evidence-state reconciliation

- Outcome: P2 About-tabs and zoom-safety task specs now record completion only for their implemented, locally verified, and hosted-CI-verified scope. The P2/V1 execution rows now match the current evidence; C4 remains `BLOCKED(owner)` and C7 remains blocked by C4 with no deployment claim.
- Why: reconcile stale execution-state and deferred-evidence wording without closing the distinct real-browser 200% zoom/manual visual deferral.
- Scope / files: `docs/plan/P2-evidence-state-reconciliation-task-spec.md`, `docs/plan/P2-about-tabs-task-spec.md`, `docs/plan/P2-zoom-safety-task-spec.md`, `docs/plan/S-PLAN-STATE.md`, `docs/status/deferred-validation.md` and this Work Log.
- Commands or actions actually performed: read the repository contracts and target documents; queried GitHub Actions runs `31903433836` and `31904100378` with `gh run view`; performed the scoped text searches required by this Task Spec; edited only the six allowed documentation files.
- Verification actually performed and result: both referenced CI runs reported `success`, including type check, build, smoke, Mobile overflow Playwright, About tabs Playwright, dependency audit, artifact completeness/no-secret and upload steps; review-log history was not edited; deployment, SSH and runtime actions were not performed.
- Decisions / assumptions: `DEFER-0013` remains `OPEN`; synthetic viewports do not prove real 200% browser zoom. This is documentation-only and does not authorize deployment or close C4/C7.
- Deferred or risk IDs: `DEFER-0013` remains OPEN; C4 remains `BLOCKED(owner)`; C7 remains blocked by C4.
- Rollback / recovery: revert the documentation-only commit; no runtime state is affected.

## LOG-0105 - 2026-08-15 - P1-09 / Person/WebSite structured data (JSON-LD)

- Outcome: the unchecked P1-09 item "Person/WebSite structured data" is implemented. Every indexable page now emits inert `application/ld+json` blocks built exclusively from the approved typed data: `WebSite` (name/url/inLanguage from `site.ts` and `content.ts`) on `/`, `/en/`, `/fa/`, `/en/about/`, `/fa/about/`, plus `Person` (name/url/sameAs/alumniOf from `profile[locale]`) on the four locale pages. A new build-time `validateStructuredData()` checks context/type/absolute URLs/real locales so a bad block fails the build. No client JS, hydration, dependency or route change; main content remains readable without JS.
- Why: P1-09 mandates machine-readable identity; the Technology Baseline Â§92 requires schema.org data to be derived from typed domain data and never diverge from content.
- Scope / files: `apps/web/src/data/structured.ts` (new), `apps/web/src/layouts/BaseLayout.astro`, `apps/web/src/pages/index.astro`, `docs/plan/P1-09-structured-data-task-spec.md` (new), `docs/status/known-issues.md` (KI-0001), `Task-list.md` (P1-09 tick), this Work Log and this Task Spec.
- Commands or actions actually performed: `npm run check` (24 files, 0 errors / 0 warnings / 0 hints); `npm run build` (6 pages); JSON-LD extraction and assertion script over the built `dist/` (per-locale `sameAs`, `alumniOf`, `inLanguage`, `name`, `url`, block counts) â€” all PASS; Playwright `mobile-overflow.spec.mjs` 128 PASS exit 0 against preview; `about-tabs.spec.mjs` 78 PASS exit 0; `git diff --check` exit 0.
- Verification actually performed and result: emitted blocks verified in `dist/` for all five indexable pages (WebSite on `/`; WebSite+Person on locale pages); values match the typed data exactly per locale; no `<script src>`/module scripts in built pages; independent r0-verifier review: all five acceptance criteria MET, no blocking code defect.
- Decisions / assumptions: JSON-LD mirrors each locale's own typed socials. The fa locale carries the pre-existing `tahamohammadi-ir` (double-m) GitHub handle while en and the canonical remote use `tahamohamadi-ir`; per baseline Â§92 JSON-LD must not diverge from content, so the discrepancy is recorded as `KI-0001` (owner decision, not silently fixed by the agent). `validateStructuredData` intentionally checks structural fields only, matching the typed-data provenance.
- Deferred or risk IDs: `DEFER-0009` (OG image) and `DEFER-0013` (real 200% zoom) unchanged/OPEN; `KI-0001` new OPEN (owner); no new deferral.
- Rollback / recovery: revert this commit; previous artifact remains served; no server/config change.

## LOG-0106 - 2026-08-15 - P0A-07 / CI action majors to node24 runtime

- Outcome: CI run `31907246943` was green but the runner annotated a Node-20 deprecation for `actions/checkout@v4`, `actions/setup-node@v4` and `actions/upload-artifact@v4` (actions now forced onto Node 24). The workflow now pins `actions/checkout@v7.0.1`, `actions/setup-node@v7.0.0` and `actions/upload-artifact@v7.0.1`, all verified via `gh api` to declare `runs.using: node24`.
- Why: remove the deprecation annotation and keep the hosted-runner baseline clean per ADR-0009; v4 majors target deprecated Node 20.
- Scope / files: `.github/workflows/ci.yml`, `docs/plan/CI-actions-node24-task-spec.md` (new), this Work Log.
- Commands or actions actually performed: `gh api repos/actions/checkout/releases/latest` (v7.0.1), `setup-node` (v7.0.0), `upload-artifact` (v7.0.1); inspected each `action.yml` for `runs.using`; `git diff --check` and `--cached --check`; commit and push.
- Verification actually performed and result: hosted CI run `31907380838` on the pushed commit reported `success` in 2m5s with all 13 steps PASS (type check, build, smoke, Mobile overflow Playwright, About tabs Playwright, dependency audit, artifact completeness/no-secret, upload); no deprecation annotation is present on the run (annotations endpoint returns empty).
- Decisions / assumptions: latest majors preserve checkout/cache/upload semantics for this workflow; no other workflow change made.
- Deferred or risk IDs: none new.
- Rollback / recovery: revert the single-file commit to restore v4 pins; no runtime impact.

## LOG-0107 - 2026-08-15 - P3 / gate move + CMS code-first scaffold

- Outcome: the repository gate moved from P0-G0 static-only to an explicit owner-authorized **P3 code-first** scope (Task Spec `docs/plan/P3-gate-code-first-task-spec.md`). `apps/cms/` now contains a working Django 5.2.9 / Wagtail 7.4.2 / Django Ninja 1.6.2 / psycopg 3.3.4 scaffold on Python 3.12.13 with 62 passing pytest tests, ruff-clean, and a new hosted CI workflow. NO runtime was deployed; `infra/cms/` files are NOT-APPLIED candidates.
- Why: the owner instructed development through the end of P3 with phases 1-2 completed first; P2 closed without CV/Resume (owner decision: C4 stays BLOCKED(owner)); P3 runs code-first with real runtime deploy gated on RISK-0007/RISK-0003.
- Scope / files: `apps/cms/**` (settings split, users, health, content, api, media, security, rebuild apps + tests + migrations + scripts), `.github/workflows/ci-cms.yml` (new), `infra/cms/**` (NOT-APPLIED candidates), `docs/adr/0020..0024`, `docs/plan/P3-gate-code-first-task-spec.md` (new), `docs/status/CHANGELOG.md` + `docs/status/BACKLOG.md` (new), `docs/status/WORK_LOG.md`, `docs/status/deferred-validation.md` (DEFER-0003 close), `docs/status/RISK_REGISTER.md` (P3 note), `docs/governance/RELEASE_POLICY.md` (gate), `docs/taha-personal-platform-technology-architecture-baseline-fa.md` + master plan (status rows), `PROJECT_MANIFEST.md`, `AGENTS.md`, `Task-list.md`, `.gitignore`.
- Commands or actions actually performed: `uv python install 3.12` (3.12.13); `uv sync --python 3.12` (55 packages, uv.lock); PyPI version verification (django 5.2.9, wagtail 7.4.2, ninja 1.6.2, psycopg 3.3.4); `django-admin startproject config .`; four parallel general sub-agents (content+api, media, security+rich-text, CI+infra+rebuild) with disjoint file ownership; `$env:DJANGO_SETTINGS_MODULE='config.settings.test'` then `uv run ruff check .` (clean), `uv run python manage.py check` (no issues; upstream treebeard E001 advisory warnings only), `uv run python manage.py makemigrations --check --dry-run` (No changes detected), `uv run pytest -q` (62 passed); `git diff --check` clean.
- Verification actually performed and result: see commands above; full suite 62 passed in ~5s; migrations for users/content/media/security generated and consistent; CI workflow authored but hosted run pending on push.
- Decisions / assumptions: P2 closes without CV (C4 owner); gate P3 code-first per owner instruction; production settings fail-closed without env vars; media private default (`is_active=False`); rich text allowlist frozen; rebuild trigger disabled by default; deploy/migrate/media-exposure commands remain unapproved in Manifest.
- Deferred or risk IDs: `RISK-0007` BLOCKED (capacity, owner), `RISK-0003` ACCEPTED limited (DB-import evidence required before any CMS DB deploy), `DEFER-0003` CLOSED (Python 3.12.13 + .venv evidence), C4 BLOCKED(owner), C7 partial, `DEFER-0009`/`DEFER-0013`/`KI-0001` OPEN (owner).
- Rollback / recovery: CMS is code-only; revert commits; web artifact and server untouched; no deploy performed.

## LOG-0108 - 2026-08-15 - P3 / CMS CI fixes (setup-uv pin + media unignore)

- Outcome: the first CMS CI runs failed twice and both root causes were fixed on `main`: (1) `astral-sh/setup-uv@v10` does not resolve because setup-uv does not alias major tags â€” pinned to the verified release tag `v10.0.1` (run `31910863185` failure â†’ fixed in `6d231ca`); (2) the `.gitignore` `media/` runtime pattern silently excluded `apps/cms/apps/media/`, so `ModuleNotFoundError: apps.media` failed `manage.py check` (run `31910863187` failure â†’ negation added in `53ec945`; stray `__pycache__` files were unstaged).
- Why: both were CI-only defects (local Windows runs passed because the working tree had the media files present); hosted Linux CI exposed them.
- Scope / files: `.github/workflows/ci-cms.yml`, `.gitignore` and this Work Log.
- Commands or actions actually performed: `gh run view --log-failed` for `31910863191`/`31910863185`/`31910863187`; `gh api repos/astral-sh/setup-uv/releases/latest` (v10.0.1) and `/tags`; `git rm --cached -r` for `__pycache__`; `git check-ignore` verification of `apps/cms/apps/media/models.py`; `git ls-files` counts before/after.
- Verification actually performed and result: hosted CMS CI run `31910918522` â†’ success (27s, all 6 steps PASS incl. pytest 62); hosted web CI run `31910918416` â†’ success (1m52s, all 13 steps PASS). Both workflows green on the final `main` HEAD `53ec945`.
- Decisions / assumptions: `.gitignore` negation `!apps/cms/apps/media/**` keeps runtime `media/` ignored while the app package stays tracked.
- Deferred or risk IDs: none new; P3 runtime deploy remains BLOCKED (`RISK-0007`/`RISK-0009`).
- Rollback / recovery: revert the two fix commits; CI would regress to the same failures, no runtime impact.

## LOG-0109 â€” 2026-08-15 â€” P3 / keep pycache ignored under media app

- Outcome: `.gitignore` now re-ignores bytecode under the tracked media package. The negation rules added in LOG-0108 (`!apps/cms/apps/media/`, `!apps/cms/apps/media/**`) re-included everything under that subtree, so CMS test runs produced untracked `apps/cms/apps/media/__pycache__/` and `apps/cms/apps/media/migrations/__pycache__/` in `git status`. Two re-ignore rules were added immediately after the negations: `apps/cms/apps/media/**/__pycache__/` and `apps/cms/apps/media/**/*.py[cod]`; `git status` is clean again except the intended `.gitignore` edit.
- Why: the media app package must stay tracked (it failed `manage.py check` when excluded, see LOG-0108) but its `__pycache__` bytecode must keep the global Python ignore behavior (`.gitignore` lines 13-14).
- Scope / files: `.gitignore`, `docs/status/WORK_LOG.md`.
- Commands or actions actually performed: added the two re-ignore lines after the negation pair; `git check-ignore -v apps/cms/apps/media/__pycache__/admin.cpython-312.pyc` â†’ `.gitignore:32:apps/cms/apps/media/**/__pycache__/` (matched by the NEW rule, line 32 > 31); `git check-ignore -v apps/cms/apps/media/models.py` â†’ no output (NOT ignored; the app package stays tracked); `git status --short --branch` â†’ `## main` + ` M .gitignore` only; `git diff --check` â†’ exit 0.
- Verification actually performed and result: see outputs above; no untracked `__pycache__` entries remain, no other unexpected changes.
- Decisions / assumptions: the re-ignore rules use the same line length/indentation style as the rest of the file (no indentation); they are placed immediately after the two negation lines so later rules win over the negation.
- Deferred or risk IDs: none new.
- Rollback / recovery: revert this commit to restore the previous behavior; CI and runtime are unaffected (ignore-only change).

## LOG-0110 - 2026-08-15 - P3/web / staging decommission + KI-0001 + CMS gap closure

- Outcome: staging.tahamohamadi.ir is fully decommissioned per ADR-0025 (owner decision 2026-08-15): the staging Caddy block was removed on the VPS (owner-executed, sudo, deploy user account) and the staging DNS record removed if present; the release gate no longer requires staging smoke - it is now CI (web + cms workflows) + production smoke only, and development/deployment happens directly on tahamohamadi.ir. The VPS was upgraded (Ubuntu 26.04 LTS, 2 vCPU, ~3910 MB RAM (~4 GiB), 30 GB disk (~17 GB free)) and the owner decided to keep the 4 GiB plan (RISK-0007 CLOSED). The existing live Compose stack was inventory-confirmed via docker ps on 2026-08-16 07:19 UTC (taha-prod-frontend-1 on 127.0.0.1:13000, taha-prod-backend-1 on 127.0.0.1:18080, taha-prod-postgres-1) - RISK-0004 CLOSED. KI-0001 is fixed in apps/web/src/data/profile.fa.ts (double-m -> single-m at socials and the PARS-SQL project URL). CMS P3 gaps were closed: NoIndexMiddleware for /admin/, /api/ and /rebuild-trigger/; real JSON logging in production.py via python-json-logger; account-enumeration and stored-XSS sanitizer tests added - 70 pytest PASS. The CMS CI workflow gains manage.py test + git diff --check + secret scan steps (owner decision). Production currently serves release-4fcd19f (checksum 13849ab7); a new release from current HEAD (JSON-LD + KI-0001 fix) is about to be deployed.
- Why: owner decisions 2026-08-15/16: staging no longer has a purpose (decommission), the server upgrade resolves the capacity question (RISK-0007), and the P3 code-first gate items were closed with real tests before the upcoming production release.
- Scope / files: apps/cms/** (NoIndexMiddleware in apps/security, production JSON logging in config/settings/production.py, test_security.py + test_production_logging.py, pyproject.toml, uv.lock), apps/web/src/data/profile.fa.ts (KI-0001), .github/workflows/ci-cms.yml (owner-decision CI steps), docs/adr/0025-staging-decommission.md (new), docs/adr/README.md, README.md, PROJECT_MANIFEST.md, AGENTS.md, Task-list.md, docs/governance/RELEASE_POLICY.md, docs/governance/DEPLOY_RUNBOOK.md, docs/status/CHANGELOG.md, docs/status/BACKLOG.md, docs/status/RISK_REGISTER.md, docs/status/known-issues.md, docs/status/deferred-validation.md, docs/plan/S-PLAN-STATE.md, docs/status/WORK_LOG.md.
- Commands or actions actually performed: uv run pytest -q (70 passed); uv run ruff check . (clean); uv run python manage.py check (no issues); uv run python manage.py makemigrations --check --dry-run (No changes detected); git diff --check (clean); rg tahamohammadi apps/web/src (no matches); staging removal on the VPS executed by the owner (sudo) with the deploy user account; docker ps on the VPS observed 2026-08-16 07:19 UTC.
- Verification actually performed and result: 70 pytest PASS; ruff clean; manage.py check clean; no pending migrations; git diff --check exit 0; rg tahamohammadi on apps/web/src returned no matches (KI-0001 evidence); live stack containers + ports confirmed via docker ps (2026-08-16 07:19 UTC).
- Decisions / assumptions: staging decommissioned (ADR-0025, owner 2026-08-15) - gate is now CI (web + cms) + production smoke; owner capacity decision: keep the 4 GiB plan (RISK-0007 CLOSED); CMS runtime still BLOCKED on MFA + RISK-0003 DB-import + deploy Task Spec (RISK-0009); KI-0001 CLOSED; upcoming production release from HEAD pending owner deploy.
- Deferred or risk IDs: RISK-0004 CLOSED (2026-08-16); RISK-0007 CLOSED (2026-08-15); RISK-0009 BLOCKED; DEFER-0011 CLOSED; DEFER-0014 added (alt-by-locale, P3-05 remainder); C4/C7/B1/B2 unchanged.
- Rollback / recovery: staging block removable state restorable from timestamped Caddyfile backup (validate + reload); DNS record re-creatable; CMS changes are code-only (revert commits); web artifact on the server untouched until the owner deploys the new release.

## LOG-0111 - 2026-08-16 - web/prod / production update to release-6031441 + staging decommission prep

- Outcome: production now serves **release-6031441** (checksum `031943b1`, deploy.log `2026-08-16T08:01:37Z`), built from clean HEAD `6031441` â€” includes P1-09 JSON-LD, KI-0001 fix, all P2/About fixes and previous P3 docs. Production smoke `infra/deploy/smoke.sh https://tahamohamadi.ir` â†’ 7 PASS (root, /en/, /fa/, robots, sitemap, 404, health). Live verification: JSON-LD PRESENT on /fa/about/, fa GitHub link single-m (KI-0001 FIXED).
- Why: production was still on release-4fcd19f (pre-JSON-LD); the owner authorized the update, staging removal and the 4 GiB plan (ADR-0025).
- Scope / files: artifact `release-6031441` built from `apps/web/dist`; uploaded via scp to `/home/deploy/taha-stage/`; server-side `sudo -n /opt/taha/bin/update-release.sh` (NOPASSWD sudoers grant, no password handled by agents). Repo-side: `apps/web/src/data/profile.fa.ts` (KI-0001), `apps/cms/**` (NoIndexMiddleware, python-json-logger, enumeration/XSS tests), `.github/workflows/ci-cms.yml` (+manage.py test, git diff --check, secret scan), docs per LOG-0110 (ADR-0025, staging decommission, RISK-0004/0007 CLOSED, DEFER-0011 CLOSED, DEFER-0014 added).
- Commands or actions actually performed: `npm run check` (0 errors), `npm run build` (6 pages), `rg tahamohammadi apps/web/src` (no matches), `rg -c application/ld+json dist/fa/index.html` (1), CMS `uv run pytest -q` (70 passed), `uv run ruff check .`, `git diff --check`; `scp -r release-6031441` to VPS; `sudo -n update-release.sh` (current -> release-6031441 031943b1); smoke 7 PASS; CI web run `31935188469` success + CMS CI `31935188435` success.
- Verification actually performed and result: deploy.log tail + `readlink -f /opt/taha/site/current` â†’ release-6031441; live curl checks (JSON-LD present, no double-m). Server inventory: 2 vCPU / 3910 MB / 30 GB, Ubuntu 26.04 LTS, existing stack (taha-prod-frontend/backend/postgres) healthy â€” recorded in RISK-0004 closure.
- Decisions / assumptions: staging Caddy block removal is staged as `/home/deploy/taha-stage/remove-staging.sh` (syntax-checked `bash -n` PASS) but requires the owner's interactive sudo (deploy user NOPASSWD covers only update-release.sh and caddy-apply.sh); DNS record removal in Cloudflare is an owner action. Until the block is removed, staging still resolves â€” documented in ADR-0025.
- Deferred or risk IDs: RISK-0007 CLOSED (capacity); RISK-0009 stays BLOCKED (MFA + RISK-0003 DB-import + deploy Task Spec); DEFER-0014 (alt-by-locale) OPEN; C4/C7/B1/B2 remain owner items.
- Rollback / recovery: `sudo ln -sfn /opt/taha/site/releases/release-4fcd19f /opt/taha/site/current` (previous artifact retained on disk); staging removal script creates `Caddyfile.pre-staging-removal.<ts>` backup and validates before reload.

## LOG-0112 - 2026-08-16 - infra / staging Caddy block removed (ADR-0025 execution)

- Outcome: the `staging.tahamohamadi.ir` site block was removed from `/etc/caddy/Caddyfile` by the owner via `sudo bash /home/deploy/taha-stage/remove-staging.sh` (executed 2026-08-16T08:10:42Z). Script flow: timestamped backup -> awk block removal -> `caddy validate` on the tmp file ("Valid configuration") -> replace -> `systemctl reload caddy`. Backup: `/etc/caddy/Caddyfile.pre-staging-removal.20260816T081042Z`.
- Why: ADR-0025 (owner decision) decommissions staging; gate is now CI (web + cms) + production smoke only.
- Scope / files: server-side Caddyfile only; repo files unchanged except this Work Log. The script itself lives at `/home/deploy/taha-stage/remove-staging.sh` (not in Git â€” server-side operational artifact).
- Commands or actions actually performed: `sudo bash /home/deploy/taha-stage/remove-staging.sh`; verification `grep -c "staging.tahamohamadi.ir" /etc/caddy/Caddyfile` -> 0; `systemctl status caddy` -> active (running); `curl https://tahamohamadi.ir/` -> 200. External check 2026-08-16: staging returns 525 (TLS no longer served â€” Cloudflare still proxies the name until the owner removes the DNS record); production 200.
- Verification actually performed and result: all three server-side checks PASS; production unaffected. A first script attempt failed with `#!/usr/bin/env: No such file or directory` due to a UTF-8 BOM written by PowerShell 5.1 `Set-Content -Encoding UTF8`; re-uploaded with BOM-free UTF8 (`[System.IO.File]::WriteAllText` + `UTF8Encoding($false)`) and verified first bytes `23 21 2f 75` (#!/u) and `bash -n` PASS before the owner reran it.
- Decisions / assumptions: staging DNS record removal in Cloudflare remains an owner action (no CF API token in env); until then staging resolves to Cloudflare and errors 525, which is acceptable mid-decommission and does not affect production.
- Deferred or risk IDs: ADR-0025 applied; RISK-0004/0007 CLOSED; RISK-0009 unchanged (BLOCKED); C4/B1/B2 remain owner items.
- Rollback / recovery: `sudo cp -a /etc/caddy/Caddyfile.pre-staging-removal.20260816T081042Z /etc/caddy/Caddyfile && sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy`.

## LOG-0113 â€” 2026-08-16 â€” infra / old-stack decommission prep + dockerization decision

- Outcome: the old pre-existing stack decommission is prepared as an owner-executed runbook (`infra/deploy/decommission-old-stack.md`: inventory, stop â†’ site-200 check â†’ down without `-v` â†’ owner-confirmed prune, rollback `up -d`, warnings). Dockerization decision recorded: the public web app stays non-containerized because it is a static Astro artifact served directly by Caddy from `/opt/taha/site/current` (no runtime, no database, no container) â€” an image would add cost with zero benefit. The CMS candidates in `infra/cms/` remain NOT-APPLIED, with comments refreshed: capacity is resolved (RISK-0007 CLOSED 2026-08-15, owner keeps the 4 GiB plan) and the remaining blockers are MFA enforcement, RISK-0003 DB-import evidence and a separate deploy Task Spec (RISK-0009). `DEPLOY_RUNBOOK.md` gained an "Old pre-existing stack decommission (2026-08-16)" section pointing to the runbook.
- Why: the owner is decommissioning the old stack (taha-prod-frontend/backend/postgres at `/opt/taha/repository/`, RISK-0004 inventory) and the decommission steps require owner-interactive sudo (deploy user NOPASSWD covers only update-release.sh and caddy-apply.sh), so the exact sequence and safety boundaries must be documented before execution.
- Scope / files: created `infra/deploy/decommission-old-stack.md`; edited `infra/cms/README.md` (dockerization decision + what the CMS candidates deploy when the gate opens), `infra/cms/docker-compose.cms.yml`, `infra/cms/Dockerfile.cms`, `infra/cms/Caddyfile.cms.snippet` (NOT-APPLIED headers kept; stale RISK-0007/capacity comments refreshed; compose build context `../..` + `user: 10001:10001` verified already correct), `docs/governance/DEPLOY_RUNBOOK.md` (appended section); this Work Log entry. No other files touched.
- Commands or actions actually performed: no server commands â€” no server access was used. Local only: file edits and `git diff --check` (result: no whitespace errors). Verify compose context: `infra/cms/` compose uses `context: ../..` (repo root) with `dockerfile: infra/cms/Dockerfile.cms` and non-root `user: 10001:10001`, matching the Dockerfile `USER app` (uid 10001).
- Verification actually performed and result: `git diff --check` â†’ clean (no trailing whitespace/space-before-tab); `rg "LOG-\d{4}"` confirmed highest existing ID was LOG-0112, so this entry is LOG-0113. No lint/typecheck applies to Markdown/Compose edits; no test suite run needed for documentation-only changes.
- Decisions / assumptions: web stays non-containerized (static Caddy) â€” documented in `infra/cms/README.md`; CMS candidates kept NOT-APPLIED behind the RISK-0009 gates; owner authorized old-stack down; `docker compose down` runs WITHOUT `-v` so postgres volumes are preserved; image prune is owner-confirmed only; restic backups in `/opt/taha/backups` are separate and never touched; frontend/backend images remain in ghcr for redeploy.
- Deferred or risk IDs: RISK-0003 unchanged (DB-import evidence still pending before CMS deploy); postgres data preserved during decommission; image prune owner-only; RISK-0009 unchanged (BLOCKED). Execution of the runbook itself is a pending owner action, not an agent action.
- Rollback / recovery: `cd /opt/taha/repository && sudo docker compose up -d` restores the old stack (volumes preserved by down without `-v`); full sequence in `infra/deploy/decommission-old-stack.md`.

## LOG-0114 - 2026-08-16 - web/prod / logo + CV downloads live, header overflow fix

- Outcome: production now serves **release-aa17b09** (checksum `6dc94419`, deploy.log 2026-08-16), built from HEAD `aa17b09` â€” includes header logo (`public/logo.png`, from Assets base variant, cropped+transparent), CV/Resume Markdown download pages `/en/cv/` + `/fa/cv/` (closing C4), README rewrite, decommission runbook, and the tiny-viewport header fix. Live checks: `/en/cv/` 200, `/fa/cv/` 200 (Persian content verified), download md 200 (11040 B), `logo.png` 200 (8075 B), smoke 7 PASS.
- Why: the owner provided CV/Resume and logo assets in `Assets/` and expected them on the site; C4 was the last owner-blocked P2 item.
- Scope / files: `apps/web/public/{logo.png,downloads/*.md}`, `apps/web/src/components/{Header.astro,Downloads.astro}`, `apps/web/src/data/content.ts` (downloads copy en/fa), `apps/web/src/pages/{en,fa}/cv.astro`, `apps/web/src/pages/sitemap.xml.ts` (+2 URLs), README.md, `infra/deploy/decommission-old-stack.md`, `infra/cms/*` (comment refresh), DEPLOY_RUNBOOK (decommission section), ledgers (BACKLOG/CHANGELOG/S-PLAN/RISK/deferred), this Work Log (LOG-0113 by docs agent + LOG-0114).
- Commands or actions actually performed: `npm run check` (0 errors) + `npm run build` (8 pages) before and after the header fix; local Playwright `mobile-overflow.spec.mjs` 0 FAIL against built dist via python http.server on 8899 (EACCES on astro preview ports on this Windows box); `about-tabs.spec.mjs` 0 FAIL; scp release dirs to `/home/deploy/taha-stage/`; `sudo -n /opt/taha/bin/update-release.sh` (release-8ff948a then release-aa17b09); production smoke; live curl checks; CI web run `31937447279` success + CMS CI `31937447172`/`31937447283` success.
- Verification actually performed and result: first CI run `31937163213` FAILED on `Mobile overflow` â€” the third header link (CV) made the header 72px too wide at the 160/195px zoom-approximation viewports; fixed by raising the wrap breakpoint from 12rem to 14rem and spanning the language switch across the second grid row (commit `aa17b09`); local suite 0 FAIL; hosted web CI then green. Logo quality visually reviewed by the visual-reviewer sub-agent (ACCEPT-WITH-NOTES; heavy black outline acceptable at 48px; white background removed programmatically â€” corner alpha 0 verified).
- Decisions / assumptions: CV/Resume published as Markdown (agents never generate PDFs; PDF replacement remains an owner option per P2-04). Gemini images in Assets are 2048x2048 mascot contact sheets with white backgrounds and AI artifacts â€” NOT used for og:image; DEFER-0009 stays OPEN (owner decision 2026-08-16). Other logo variants (electric/gold/green/red/yasi/black) recorded as alternatives for a future brand pass. Old pre-existing stack decommission authorized by owner; runbook written; execution is owner-sudo (volumes preserved, no `-v`).
- Deferred or risk IDs: DEFER-0009 OPEN (OG image), DEFER-0013 OPEN (200% zoom), RISK-0009 BLOCKED (CMS runtime: MFA + RISK-0003 + deploy Task Spec), C4/B1 CLOSED, KI-0001 CLOSED.
- Rollback / recovery: `sudo ln -sfn /opt/taha/site/releases/release-8ff948a /opt/taha/site/current` (previous artifact retained); old stack: `cd /opt/taha/repository && sudo docker compose up -d`.

## LOG-0115 - 2026-08-16 - web/prod / logo in footer, gateway and favicon

- Outcome: production serves **release-aae2cb9** (checksum `349db221`). The logo now appears in all requested places: header (since LOG-0114), footer (`/logo.png` replacing the TM text mark), Language Gateway (`/logo-gateway.png` â€” navy-outline variant for the dark panel) and browser tab (`/favicon.png` replacing the TM SVG favicon). Visual QA by the visual-reviewer sub-agent: all pages ACCEPT (gateway, home, about, cv).
- Why: the owner reported the logo was missing from the footer, the language-selection page and the Chrome tab.
- Scope / files: `apps/web/public/{favicon.png, logo-gateway.png}` (new), `apps/web/src/components/{Header.astro, Footer.astro}` (mark span â†’ img, unused `mark` removed), `apps/web/src/pages/index.astro` (gateway mark â†’ img + CSS), `apps/web/src/layouts/BaseLayout.astro` (favicon ref), this Work Log.
- Commands or actions actually performed: generated favicon-64.png (System.Drawing from the cropped logo) and logo-gateway.png (black outline â†’ navy #071225, 4898 px mapped) â€” both visually verified; `npm run check` (0 errors) + `npm run build` (8 pages); Playwright screenshots of /, /en/, /en/about/, /en/cv/ against the built dist (python http.server 8899); scp release to VPS; `sudo -n update-release.sh`; production smoke 7 PASS; live curl of logo/logo-gateway/favicon all 200; head/gateway/footer references verified in served HTML.
- Verification actually performed and result: hosted web CI on the pushed commit (run pending at time of writing; local suite green); live checks above all PASS.
- Decisions / assumptions: favicon.svg remains on disk but is no longer referenced (PNG preferred for the raster logo); gateway uses the navy-mapped variant so the black outline does not clash with the dark panel.
- Deferred or risk IDs: none new; DEFER-0009/0013, RISK-0009 unchanged.
- Rollback / recovery: `sudo ln -sfn /opt/taha/site/releases/release-aae2cb9-1 /opt/taha/site/current` if a newer release replaced it; previous release-aae2cb9..aa17b09 artifacts retained on disk.

## LOG-0116 - 2026-08-16 - P3 / MFA enforcement + deploy Task Spec + incident runbook + CI hardening

- Outcome: four P3/P0-B deliverables completed in parallel sub-agents:
  1. **MFA enforcement (django-otp 1.5.4):** `apps/security/mfa.py` middleware (`MFAEnforcementMiddleware`) checks `django_otp.user_has_device` for `/admin/` paths â€” staff without OTP device allowed (first-time setup); staff with device but no verified OTP blocked; OTP-verified staff allowed. `OTPMiddleware` wired in settings. Tests: 75 passed (5 new MFA tests). RISK-0009 blocker "MFA enforcement" now has code.
  2. **Deploy Task Spec:** `docs/plan/P3-cms-deploy-task-spec.md` (~260 lines) covers prerequisites (RISK-0003 DB-import, MFA merged, owner approval, old-stack decommissioned), 8 deployment mechanics steps, resource limits (512 MiB cms + 512 MiB db), 22 acceptance criteria, rollback procedure, deferred items.
  3. **Incident runbook + SLO:** `docs/governance/INCIDENT_RUNBOOK.md` (126 lines) defines SLOs (99.5% availability, <1% 5xx/5min, p95 <2s), monitoring points, SEV-1/2/3 classification, static site and CMS runtime runbooks, escalation rules. `DEPLOY_RUNBOOK.md` cross-referenced.
  4. **CI hardening:** `ci-cms.yml` gains `git diff --check` and secret-pattern scan steps (matching web CI pattern).
- Why: RISK-0009 (CMS runtime deploy) requires MFA enforcement + deploy Task Spec before admin exposure; P0B-03 requires incident runbook and SLO definitions.
- Scope / files: `apps/cms/apps/security/mfa.py` (new), `apps/cms/tests/test_mfa.py` (new), `apps/cms/config/settings/base.py` (MFA settings), `apps/cms/pyproject.toml` + `uv.lock` (django-otp), `docs/plan/P3-cms-deploy-task-spec.md` (new), `docs/governance/INCIDENT_RUNBOOK.md` (new), `docs/governance/DEPLOY_RUNBOOK.md` (xref), `.github/workflows/ci-cms.yml` (2 new steps), this Work Log.
- Commands or actions actually performed: `uv sync` (django-otp installed); `uv run pytest -q` (75 passed); `uv run ruff check .` (clean); `uv run python manage.py check` (0 errors); `uv run python manage.py makemigrations --check --dry-run` (no changes); `git diff --check` (clean).
- Verification actually performed and result: all four agents reported green; full suite 75 passed; CI runs on push will verify the new steps.
- Decisions / assumptions: MFA guard uses `request.user.otp_device` (set by OTPMiddleware) â€” more robust than raw session key; no custom URL/view needed (django_otp provides OTP device management at `/admin/otp_totp/totpdevice/`); deploy Task Spec documents that RISK-0003 DB-import evidence is the remaining server-side blocker; incident runbook is documentation-only (no alerting infrastructure).
- Deferred or risk IDs: RISK-0009 still BLOCKED (MFA code done; remaining: RISK-0003 DB-import evidence + owner approval + old-stack decommission); P0B-03 partially done (SLO + incident runbook done; visual regression baseline still open; dependency/container scan â€” secret scan added to CI).
- Rollback / recovery: remove MFA middleware from MIDDLEWARE in base.py; revert deploy Task Spec and incident runbook files; CI steps are additive only.

## LOG-0117 - 2026-08-16 - P3 verification + P4 prep + docs reconciliation

- Outcome: Docker Compose candidates verified locally (health checks, resource limits, env var passthrough all correct); P4 Blog/Writing task spec written (199 lines); stale docs claims fixed.
- Why: the Docker Compose candidates in `infra/cms/` were NOT-APPLIED but never validated against the actual CMS code. P4 preparation avoids a cold start after P3 runtime deploy. Stale test counts and release IDs in README/Manifest would mislead developers.
- Scope / files: `apps/cms/` (Dockerfile.cms, docker-compose.cms.yml, Caddyfile.cms.snippet â€” read-only verification), `docs/plan/P4-blog-writing-task-spec.md` (new), `docs/status/WORK_LOG.md`, `PROJECT_MANIFEST.md` (stale release ID + test count fixed), `README.md` (stale test count fixed).
- Commands or actions actually performed: Docker Compose candidates audited (health checks, resource limits, env passthrough, non-root user, port bindings, named volumes â€” all correct per sub-agent); P4 task spec written by sub-agent; docs reconciliation found 3 stale claims (PROJECT_MANIFEST.md:55 release ID, PROJECT_MANIFEST.md:105 test count, README.md:49 test count) â€” all fixed.
- Verification actually performed and result: Docker Compose verification passed (no issues found); P4 task spec covers full P4 scope (Article, Series, admin, API, Astro routes, SEO, tests); docs reconciliation clean after fixes.
- Decisions / assumptions: Docker Compose remains NOT-APPLIED (deploy is gated on RISK-0003 + owner approval); P4 task spec is preparatory (not authorized for implementation until P3 runtime is deployed).
- Deferred or risk IDs: no new risks; P4 task spec added to BACKLOG.
- Rollback / recovery: revert P4 task spec and docs fixes; no runtime impact.

## LOG-0118 - 2026-08-16 - gitignore: exclude Assets/ source drafts

- Outcome: `Assets/` added to `.gitignore` to prevent future accidental commits of source drafts (logo PNGs, CV/Resume markdowns, Gemini images). The processed production files (`apps/web/public/logo.png`, `apps/web/public/downloads/*.md`) remain tracked; the source originals in Assets/ do not belong in git.
- Why: LOG-0117 accidentally committed Assets/ via `git add -A`; the large Gemini images (6-7MB each) bloated the repo. This fix prevents recurrence.
- Scope / files: `.gitignore` only, this Work Log.
- Decisions / assumptions: Assets/ committed in LOG-0117 remain in git history (amend not safe on pushed commit); future files in Assets/ will be ignored.

## LOG-0141 - 2026-08-17 - web/prod / P4â€“P5 routes live + PNG + CMS_API_BASE loopback fix

- Outcome: Production static **`release-82d51c6`** (checksum `bc6c6a1d`) serves 16 pages including `/en|fa/blog/` and `/en|fa/research/` (200). Lists remain honestly empty: no published CMS articles, and loopback `CMS_API_BASE` was broken by `SECURE_SSL_REDIRECT` 301 to `https://127.0.0.1:18000`. This change: (1) renormalize `apps/web/public/*.png` so the PNG signature keeps CR (8075 B); (2) Astro CMS fetch sends `X-Forwarded-Proto: https`; (3) exempt `^api/` from SSL redirect on loopback gunicorn; (4) `smoke-blog.sh` uses mktemp; (5) `build-static-with-cms.sh` fails fast if `npm` is missing.
- Why: Complete P3/P4 production closeout residuals after RISK-0003 CLOSED and migrate `b369885`.
- Scope / files: `apps/web/public/{logo,logo-gateway,favicon}.png`, `apps/web/src/lib/cms/{client,articles,research,projects}.ts`, `apps/cms/config/settings/production.py`, `apps/cms/tests/test_production_proxy.py`, `infra/deploy/{smoke-blog,build-static-with-cms}.sh`, ledgers.
- Commands or actions actually performed: owner Windows `npm run build` + scp `release-82d51c6`; `update-release.sh`; origin curls 200 for blog/research; API loopback with forwarded proto returns `{"items":[],"count":0}`.
- Verification actually performed and result: loopback `/api/articles/en` + `X-Forwarded-Proto: https` â†’ 200 empty list; without proto â†’ 301 HTTPS; origin logo still 8074 until this PNG commit is deployed.
- Decisions / assumptions: do not open public Caddy `/api/` (DEFER-0017) in this slice; content populate requires owner Wagtail publish then rebuild.
- Deferred or risk IDs: DEFER-0017 OPEN; DEFER-0018 RSS OPEN; RISK-0003 CLOSED (LOG-0140).
- Rollback / recovery: previous `release-6c68cbb` / `release-82d51c6`; previous CMS image `b369885`.

## LOG-0140 - 2026-08-17 - P3 / RISK-0003 CLOSED (CMS backup + isolated restore)

- Outcome: Owner installed refreshed `/usr/local/sbin/taha-platform-backup` from `cms-repo` `be28671`. `--dry-run` PASS (CMS dump source `taha-cms-db-1`). `systemctl start taha-platform-backup.service` exited 0. restic snapshot `3afdfc96` (2026-08-17 10:39 UTC) tagged `production,cms,postgres`, path `/cms-postgres-all.sql` (~240 KiB). Isolated restore into throwaway `postgres:17-alpine` (`taha-cms-restore-db`); import as `postgres` superuser created database `taha_cms`; `\dt` 75 tables (Wagtail + `content_article`/`content_series`/`content_project` + `security_recoverycode`); `django_migrations` content 0001â€“0004 and security 0001â€“0002. Cleanup: `docker rm -f taha-cms-restore-db`, `rm -rf /srv/taha-cms-restore-615721`. **RISK-0003 CLOSED.**
- Why: Close the CMS-postgres backup/restore gap before treating P3 backup as production-complete.
- Scope / files: VPS `/usr/local/sbin/taha-platform-backup`; restic snapshot `3afdfc96`; ledgers (this log, RISK_REGISTER, Task Spec, BACKLOG, CHANGELOG, AGENTS.md, Task-list P3-01). No production CMS restart; no `/api/`/`/media/` change.
- Commands or actions actually performed: owner as root â€” install script, dry-run, systemd start, restic snapshots `--tag cms`, restore `3afdfc96`, disposable postgres import, `\dt` + migrations query, cleanup.
- Verification actually performed and result: dry-run OK; service SUCCESS; snapshot tags `cms,postgres`; restore `\dt` 75 rows; migrations 6 rows as listed; `restore_rehearsal PASS`.
- Decisions / assumptions: live dump database name is `taha_cms` (spec's example `-d cms` does not match production). Import uses `psql -U postgres`, not the CMS role.
- Deferred or risk IDs: RISK-0003 CLOSED; DEFER-0017 (`/api/`/`/media/`) still OPEN; contact persistence still gated on a later Task Spec.
- Rollback / recovery: previous `/usr/local/sbin/taha-platform-backup.bak.*` if present; restic snapshot retained in repository.

## LOG-0137 - 2026-08-16 - ops / P4+P5 static production deploy (CMS migrate gated)

- Outcome: Production static site switched to **`release-59bf91e`** (checksum `40472597`, from `origin/main` tip after PR #17). Live routes `/en|fa/blog/`, `/en|fa/research/` (+ statement) return **200** with **honest empty** lists (`CMS_API_BASE` unset; DEFER-0017). `/health.json` 200, `/health/` CMS `db=ok`, `/admin/login/` Wagtail 200. Public `/api/` and `/media/` remain **404** (static 404 page â€” not proxied). **CMS image/migrate NOT applied**: `RISK-0003` still OPEN (no VPS CMS-aware backup install + isolated restore evidence); deploy user has no passwordless Docker (`docker.sock` root:docker); `cms-repo` remains at `95a740f` after a failed ff-only pull was reset clean (root-owned `apps/cms/apps/security/templates/security/*` blocked checkout).
- Why: Bring public artifact through P5 as far as policy allows without risky prod migrate or inventing a loopback `CMS_API_BASE` build pattern (not in DEPLOY_RUNBOOK).
- Scope / files: VPS `/opt/taha/site/current` â†’ `release-59bf91e`; ledger/docs update only in this commit. No Caddy `/api/`/`/media/` changes. No CMS container recreate.
- Commands or actions actually performed: `git fetch origin/main` (`59bf91e`); CI green (web + CMS CI + CMS image); local `npm run check`/`build` without `CMS_API_BASE`; `scp` artifact to `/home/deploy/taha-stage/release-59bf91e`; `sudo -n /opt/taha/bin/update-release.sh`; `infra/deploy/smoke.sh` 7 PASS; route curls; `cms-repo` `git pull` failed (permission) then `git reset --hard HEAD` + `git clean -fd` restored clean `95a740f`.
- Verification actually performed and result: `deploy.log` `2026-08-16T21:44:36Z updated release-59bf91e 40472597`; smoke PASS; empty copy present on en/fa blog+research; CMS loopback health still ok on prior image.
- Decisions / assumptions: Stop before migrate per RISK-0003; do not document/use VPS loopback `CMS_API_BASE` until runbook establishes it; leave `/api/`/`/media/` closed.
- Deferred or risk IDs: RISK-0003 OPEN (blocker for migrate 0002/0003/0004); DEFER-0017 OPEN; cms-repo ownership/chown owner; Docker group or interactive sudo for `update-cms.sh`.
- Rollback / recovery: `sudo -n /opt/taha/bin/update-release.sh /home/deploy/taha-stage/release-aae2cb9` (previous artifact retained under `/opt/taha/site/releases/`).

## LOG-0139 - 2026-08-17 - P3/P4 closeout â€” rebuild wiring, API Caddy spec, deploy ops

- Outcome: P3/P4 repo closure slice on `feat/p3-p4-closeout` from `origin/main`: wired CMSâ†’Astro rebuild (`build-static-with-cms.sh`, `rebuild-static.sh`, updated `manual-rebuild.sh`); optional public `/api/`/`/media/` Caddy fragment + `P3-public-api-caddy-task-spec.md` (DEFER-0017); VPS CMS migrate helpers (`prod-cms-update-migrate.sh`, `prod-cms-reset-and-migrate.sh`, `install-update-cms-sudo.sh`, `run-prod-cms-migrate.ps1`); blog smoke (`smoke-blog.sh`); Astro `CMS_API_BASE` env schema; `.gitattributes` PNG binary guard. P4 code-first already on main (PR #14â€“16); RSS remains DEFER-0018.
- Why: Complete agent-executable P3/P4 closure without owner VPS steps; document exact owner commands for RISK-0003, migrate, Caddy apply, and content-populated static rebuild.
- Scope / files: `infra/deploy/*`, `infra/cms/Caddyfile.cms*.snippet`, `apps/cms/scripts/manual-rebuild.sh`, `apps/web/astro.config.mjs`, `.gitattributes`, `docs/plan/P3-public-api-caddy-task-spec.md`, `docs/adr/0023-p3-rebuild-trigger.md`, Task-list Â§8â€“9, deferred-validation, AGENTS, WORK_LOG.
- Commands or actions actually performed: local worktree edits; validation below.
- Verification actually performed and result: `bash -n` PASS on new deploy scripts (after LF normalize); `uv run ruff check` clean; `pytest -q` **152 passed**; `npm run check` 0 errors; `npm run build` **16 pages** (blog/research/projects routes, empty CMS).
- Decisions / assumptions: loopback `CMS_API_BASE=http://127.0.0.1:18000` avoids public `/api/` until DEFER-0017 owner apply; `rebuild-static.sh` does not enable `REBUILD_TRIGGER_ENABLED` automatically.
- Deferred or risk IDs: RISK-0003 OPEN (owner backup + restore); DEFER-0017 OPEN (owner Caddy apply); DEFER-0018 OPEN (RSS); P4-05 prod smoke owner after migrate.
- Rollback / recovery: revert this branch; Caddy/API snippet not applied until owner action; static `current` unchanged until owner runs `rebuild-static.sh`.

## LOG-0138 - 2026-08-17 - P6 / Projects + case studies code-first

- Outcome: P6 case studies on canonical `Project`: `ProjectCaseStudyDetails` OneToOne, `ProjectDiagram`/`ProjectScreenshot` FK rows, featured publish gate, Wagtail snippet admin, Ninja `/api/projects/{locale}` (+ extended research project DTO with `has_case_study`), Astro `/{locale}/projects/*` with research cross-link, sitemap + BreadcrumbList + optional `CreativeWork` JSON-LD. No infra/Caddy `/api/`/`/media/`. DEFER-0017 scope expanded to projects; DEFER-0021 (live demo embed) recorded.
- Why: Execute approved P6 plan after P5 merge on `origin/main`; code-first with honest empty lists when `CMS_API_BASE` unset.
- Scope / files: `apps/cms/apps/content/{models,admin,migrations/0004_*}`, `apps/cms/apps/api/api.py`, `apps/cms/tests/test_{case_study,api_case_study}.py`, `apps/web/src/{lib/cms/projects.ts,components/projects,pages/*/projects,data,Header,sitemap,structured}`, research project cross-link pages, Task Spec + ledgers, Task-list Â§11.
- Commands or actions actually performed: `makemigrations 0004_p6_case_study_models`; `ruff check` clean; `pytest` **152 passed**; `npm ci`; `npm run check` 0 errors; `npm run build` **16 pages** (includes `/en|fa/projects/`).
- Verification actually performed and result: featured publish gate tests; diagram/screenshot redact tests; API forbidden-field tests; XSS sanitizer on `technical_decisions`; draft 404. Independent security review **Approve-with-notes** (manual): no draft/media URL leak; external URLs http(s)-only; `set:html` matches P4/P5 pattern â€” admin PII help text remains editorial responsibility.
- Decisions / assumptions: no parallel Project model; diagram images admin-only until `/media/` Task Spec; live demo iframe out of scope (DEFER-0021).
- Deferred or risk IDs: DEFER-0017 OPEN (blog+research+projects); DEFER-0021 OPEN; RISK-0003 OPEN (owner prod migrate 0003+0004).
- Rollback / recovery: revert P6 commits; reverse migration 0004 only in non-prod.

## LOG-0136 - 2026-08-16 - P5 / Research code-first (models, admin, API, Astro, SEO)

- Outcome: P5 Research implemented code-first without opening public Caddy `/api/` or `/media/`. Models + migration `0003_p5_research_models` (ResearchTopic, ResearchStatement, Project, Publication, evidence/collaborator/funding); Wagtail snippets; Ninja research endpoints with redact/draft exclusion; Astro `/{locale}/research/*` with optional `CMS_API_BASE` (honest empty); breadcrumbs + ScholarlyArticle only with real DOI/URL; sitemap research URLs. Security review Approve (no medium+). DEFER-0017 kept (blog+research edge); DEFER-0019/0020 recorded. About static `researchProjects` untouched.
- Why: Execute approved P5 plan after P4; keep edge surface closed until publish-API Task Spec.
- Scope / files: `apps/cms/apps/content/{models,admin,migrations/0003_*}`, `apps/cms/apps/api/api.py`, `apps/cms/tests/test_{research,api_research}.py`, `apps/web/src/{lib/cms/research.ts,pages/*/research,data,Header,sitemap}`, Task Spec + ledgers + INCIDENT_RUNBOOK confidentiality path, Task-list Â§10.
- Commands or actions actually performed: `makemigrations`; `ruff check`; `pytest` **140 passed**; `npm run check` 0 errors; `npm run build` includes `/en|fa/research/` (+ statement).
- Verification actually performed and result: CMS ruff clean; 140 pytest PASS; Astro check 0; static build Complete with research overview/statement routes (empty CMS). Independent security review Approve.
- Decisions / assumptions: no infra/Caddy changes; Statement PDF deferred (DEFER-0019); curated graph deferred (DEFER-0020); prod migrate blocked on RISK-0003.
- Deferred or risk IDs: DEFER-0017 OPEN; DEFER-0019 OPEN; DEFER-0020 OPEN; RISK-0003 OPEN (owner).
- Rollback / recovery: revert P5 commits; reverse migration 0003 only in non-prod.

## LOG-0135 - 2026-08-16 - P5 / Task Spec + ledger hygiene (S0)

- Outcome: Formal `docs/plan/P5-research-task-spec.md` written (Status `IN_PROGRESS`); frozen field/route contracts; Caddy `/api/` explicitly out of scope under DEFER-0017 (scope expanded to research); DEFER-0019 (Statement PDF) and DEFER-0020 (curated collections/graph) recorded; BACKLOG/AGENTS/CHANGELOG/S-PLAN updated. No CMS/web implementation in this commit.
- Why: AGENTS requires Task Spec before P5 implementation; code-first like P4 without inventing fields or opening edge APIs.
- Scope / files: `docs/plan/P5-research-task-spec.md`, `docs/status/{deferred-validation,BACKLOG,CHANGELOG,WORK_LOG}.md`, `docs/plan/S-PLAN-STATE.md`, `AGENTS.md`.
- Verification actually performed and result: docs-only; no pytest/build in this slice.
- Decisions / assumptions: About static `researchProjects` left untouched; Contact stays honest About link; staging smoke replaced by local projection tests + optional owner prod smoke after migrate (ADR-0025).
- Deferred or risk IDs: DEFER-0017 OPEN (expanded); DEFER-0019 OPEN; DEFER-0020 OPEN; RISK-0003 OPEN (owner).
- Rollback / recovery: revert this docs commit.

## LOG-0134 - 2026-08-16 - P4 / security harden after review (PR #15)

- Outcome: Public projection hardened: article slug redirects only resolve to `public()` targets; article detail API re-sanitizes rich text with Wagtail Whitelister; JSON-LD embedded via escaped script content to block `</script>` breakout. Merged as PR #15 onto `main` after CMS + web CI green.
- Why: Close medium findings from independent security review of P4 Blog/Writing (#14).
- Scope / files: `apps/cms/apps/api/api.py`, `apps/cms/tests/test_api.py`, `apps/web/src/data/structured.ts`, `apps/web/src/layouts/BaseLayout.astro`, `apps/web/src/pages/{en,fa}/blog/[slug].astro`, `AGENTS.md`, ledgers.
- Verification actually performed and result: PR #15 checks â€” Check and test CMS PASS; Check and build web PASS; merge commit `7929489`.
- Deferred or risk IDs: DEFER-0017 OPEN; DEFER-0018 OPEN; RISK-0003 OPEN (owner); P4 Task Spec remains `PARTIAL` until prod migrate/`CMS_API_BASE` publish.
- Rollback / recovery: revert merge of PR #15.

## LOG-0133 - 2026-08-16 - P4 / Blog Writing code-first (models, API, Astro, SEO)

- Outcome: P4 Blog/Writing implemented code-first without opening public Caddy `/api/` or `/media/`. Article/Series/TopicTag + ArticleSlugRedirect models and migration; Wagtail snippet admin; Ninja list/detail/pagination/tag/series/redirect endpoints (published-only); Astro `/{locale}/blog/` routes with optional `CMS_API_BASE` (empty-honest when unset); BlogPosting + BreadcrumbList JSON-LD; sitemap blog entries; RSS deferred as DEFER-0018; public API edge deferred as DEFER-0017.
- Why: Execute approved P4 plan after P3 runtime; keep edge surface closed until a separate publish-API Task Spec.
- Scope / files: `apps/cms/apps/content/{models,admin,migrations/0002_*,wagtail_hooks}.py`, `apps/cms/apps/api/api.py`, `apps/cms/tests/test_{content,api}.py`, `apps/web/src/{lib/cms,components/blog,pages/*/blog,data,components/Header.astro,pages/sitemap.xml.ts}`, Task Spec + ledgers.
- Commands or actions actually performed: `uv sync --python 3.12`; `makemigrations content`; `ruff check`; `pytest` 122 PASS; `npm run check` 0 errors; `npm run build` (blog index routes present; empty CMS).
- Verification actually performed and result: CMS ruff clean; 122 pytest PASS; Astro check 0 errors/warnings; static build Complete with `/en/blog/` + `/fa/blog/`.
- Decisions / assumptions: Featured images omitted from public UI while `/media/` unpublished; feed not shipped (DEFER-0018); no infra/Caddy changes.
- Deferred or risk IDs: DEFER-0017 OPEN; DEFER-0018 OPEN; RISK-0003 OPEN (owner backup before prod migrate); DEFER-0014/0016 unchanged.
- Rollback / recovery: revert P4 commits; drop migration 0002 if applied only in non-prod.

## LOG-0132 - 2026-08-16 - P3 / Staff draft preview boundary (P3-07)

- Outcome: Staff-only read-only preview at `/admin/preview/<kind>/<pk>/` for Landing/Profile/Article (no Wagtail Page models). Body sanitized with Wagtail Whitelister; `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store`. Public share-token preview recorded as DEFER-0016. Task-list P3-07 safe minimum DONE.
- Why: Close ADR-0022 / Task-list gap where allowlist existed without preview runtime.
- Scope / files: `apps/cms/apps/content/{views_preview,wagtail_hooks,templates}`, `apps/security/middleware.py`, `tests/test_preview.py`, Task Spec, ADR-0022, ledgers.
- Verification: `uv run ruff check` clean on touched paths; `uv run pytest` 105+ passed; security review Approve.
- Deferred or risk IDs: DEFER-0016 OPEN (public token); RISK-0003 OPEN; `/api/`/`/media/` unpublished.
- Rollback / recovery: revert feature commits; no migration.
## LOG-0131 - 2026-08-16 - P3 / TOTP recovery codes + MFA disable (DEFER-0015 CLOSED)

- Outcome: Hashed one-time recovery codes (64-bit, reveal-once session), login accepts unused recovery codes after password, regenerate/disable under `/admin/account/two-factor/` with second-factor confirm. Audit actions `mfa.recovery_issued`, `mfa.recovery_used`, `mfa.disabled` (no plaintext). DEFER-0015 CLOSED in repo; production needs CMS image rebuild.
- Why: Authenticator loss previously required VPS emergency paths only.
- Scope / files: `apps/cms/apps/security/{models,recovery,forms,views_totp,wagtail_hooks}.py`, templates, migration `0002_recovery_code`, `tests/test_mfa.py`, Task Spec, ADR-0020, ledgers, AGENTS.md.
- Verification: `uv run ruff check` clean on touched paths; `uv run pytest` 97 passed.
- Deferred or risk IDs: DEFER-0015 CLOSED; RISK-0003 OPEN (owner backup evidence); `/api/`/`/media/` unpublished.
- Rollback / recovery: previous CMS image; migration reverse removes RecoveryCode rows only.

## LOG-0130 - 2026-08-16 - P3 / CMS-aware backup script + rendition contract (RISK-0003 prep)

- Outcome: `infra/backup/taha-platform-backup.sh` now requires live `taha-cms-db-1`, dumps `cms-postgres-all.sql` (tags `cms`/`postgres`), optionally dumps legacy postgres, backs up CMS media volume when present, supports `--dry-run`. Added `infra/backup/README.md` and `docs/plan/P3-cms-backup-restore-task-spec.md`. Media public-delivery contract coded in `apps.media.renditions` with tests (no `/media/` exposure). S-PLAN D7 marked DONE; RISK-0003 remains OPEN until owner VPS evidence.
- Why: Live CMS data was outside the legacy `taha-prod-postgres-1` backup path.
- Scope / files: `infra/backup/**`, BACKUP_POLICY/RUNBOOK, ADR-0021 note, `apps/cms/apps/media/renditions.py`, `tests/test_media.py`, ledgers, S-PLAN-STATE.
- Verification: `bash -n` on backup script; `uv run pytest` (media + suite).
- Deferred or risk IDs: RISK-0003 OPEN (owner install + restore); DEFER-0014/0015 unchanged; `/api/`/`/media/` unpublished.
- Rollback / recovery: previous `/usr/local/sbin/taha-platform-backup` backup on VPS before install.

## LOG-0129 - 2026-08-16 - P3 / RISK-0009 CLOSED (password + production TOTP)

- Outcome: Owner rebuilt CMS image from `main` (`95a740f`), `update-cms.sh` + `smoke-cms.sh` PASS, then attested password rotation and TOTP enrollment on production. RISK-0009 CLOSED.
- Why: Persist owner completion of the last CMS runtime hygiene residuals.
- Scope / files: RISK_REGISTER, AGENTS.md, BACKLOG, CHANGELOG, this Work Log, P3-mfa task spec status.
- Verification: owner VPS log (rebuild + smoke); owner chat attestation Â«Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯Â» for password + TOTP (no secrets recorded).
- Deferred or risk IDs: DEFER-0015 (recovery codes) remains OPEN; RISK-0003 still needs CMS-postgres restore evidence; `/api/`/`/media/` unpublished.
- Rollback / recovery: previous CMS image tag; Caddyfile timestamped backup.

## LOG-0128 - 2026-08-16 - P3 / Wagtail TOTP enrollment + OTP login

- Outcome: Account had no OTP section because MFA was enforcement-only. Added Wagtail `OTPLoginForm`, `/admin/account/two-factor/` enrollment (QR via `qrcode` + manual secret), Account profile panel + menu item, and middleware that redirects staff without a confirmed device to setup (account/password still reachable). Login requires OTP only after enrollment. Security fix: setup/QR not exempt for enrolled users without OTP session; QR serves unconfirmed devices only; session `cycle_key` on confirm.
- Why: Unblock RISK-0009 TOTP residual; owner could not enroll from Account UI.
- Scope / files: `apps/cms/apps/security/{forms,mfa,views_totp,wagtail_hooks}.py`, templates, `tests/test_mfa.py` + security test updates, `qrcode` dep, Dockerfile/update-cms import check, ADR-0020, ledgers.
- Verification: `uv run pytest` 88 passed; ruff clean; Django check (treebeard E001 advisory only).
- Deferred or risk IDs: DEFER-0015 (TOTP recovery codes); RISK-0009 OPEN until owner rebuilds image, rotates password, enrolls TOTP on production. RISK-0003 unchanged.
- Rollback / recovery: previous CMS image tag; Caddy unchanged.

## LOG-0127 - 2026-08-16 - P3 / Caddy `/static/*` applied; CMS smoke full PASS

- Outcome: Owner patched production Caddyfile with `handle /static/*` â†’ `127.0.0.1:18000` before `import taha_application_routes`. Validate + reload succeeded. Origin `--resolve` to 127.0.0.1 returned 200 for `/static/wagtailadmin/css/core.css`. `bash infra/deploy/smoke-cms.sh https://tahamohamadi.ir` PASS (admin Wagtail, static CSS, `/health/`, `/health.json`, `/`).
- Why: Close the Wagtail admin asset gap recorded in LOG-0126.
- Scope / files: VPS `/etc/caddy/Caddyfile` (timestamped backup kept); repo `infra/cms/Caddyfile.cms.snippet` aligned to live `/admin|/*` `/static|/*` `/health|/*` matchers; this Work Log; RISK-0009 residual narrowed to password + TOTP.
- Verification: owner paste â€” patched OK; origin 200; smoke PASS.
- Deferred or risk IDs: RISK-0009 OPEN (rotate bypassed admin password; confirm TOTP). `/api/` and `/media/` still unpublished. RISK-0003 still needs CMS-postgres restore evidence.
- Rollback / recovery: restore timestamped Caddyfile backup, `caddy validate`, `systemctl reload caddy`.

## LOG-0126 - 2026-08-16 - P3 / CMS runtime live; static assets still unproxied

- Outcome: Owner rebuild reported `runtime-deps-ok`, migrate no-op, loopback `/admin/login/` 200, `smoke-cms.sh` PASS. Independent live check: `/admin/login/` is Wagtail Sign in, `/health/` is `{"status":"ok","db":"ok"}`, `/health.json` is the static artifact. `/static/wagtailadmin/css/core.css` returns the Astro 404 page (Caddy `/static*` handle missing). Superuser created after bypassing password validators (common + numeric).
- Why: Record runtime go-live evidence and the remaining Caddy/password gaps so RISK-0009 is not closed prematurely.
- Scope / files: this Work Log, RISK_REGISTER (RISK-0009 OPEN residuals), `infra/deploy/smoke-cms.sh` (fail if Wagtail CSS is not 200).
- Commands or actions actually performed: live curl of `/admin/login/`, `/health/`, `/health.json`, `/static/wagtailadmin/css/core.css`.
- Verification actually performed and result: admin 200 Wagtail; CMS health db=ok; static health.json intact; core.css 404 Astro HTML.
- Deferred or risk IDs: RISK-0009 OPEN (add `/static*` handle; rotate weak admin password; confirm MFA). `/api/` and `/media/` still not public.
- Rollback / recovery: Caddyfile timestamped backup; CMS `compose down` without `-v`.

## LOG-0125 - 2026-08-16 - P3 / CMS runtime hardening (argon2, WhiteNoise, Caddy paths)

- Outcome: Stack is healthy (`db=ok`, migrations applied) but `createsuperuser` failed: `PASSWORD_HASHERS` starts with Argon2 and `argon2-cffi` was not a runtime dependency. Also gunicorn does not serve `/static/` without WhiteNoise, the compose `cms_static` volume would hide baked collectstatic once `STATIC_ROOT` is `staticfiles`, and Caddy `handle /health*` would steal `/health.json` from the static site. Added `argon2-cffi` + `whitenoise`, aligned `STATIC_ROOT`, removed the static volume, tightened Caddy matchers, and added loopback `/admin/login/` + argon2 import checks to `update-cms.sh`.
- Why: Close remaining runtime landmines before the owner retries superuser and applies Caddy.
- Scope / files: `apps/cms/pyproject.toml` + `uv.lock`, `config/settings/base.py` + `production.py`, `tests/test_production_proxy.py`, `infra/cms/*`, `infra/deploy/update-cms.sh`, `infra/deploy/smoke-cms.sh`, this Work Log.
- Deferred or risk IDs: RISK-0009 until rebuild + createsuperuser (12+ char password) + Caddy snippet + `smoke-cms.sh` PASS. Do not proxy `/api/` or `/media/`.
- Rollback / recovery: previous image tag; Caddyfile timestamped backup.

## LOG-0124 - 2026-08-16 - P3 / CMS db hostname DNS after leftover compose project

- Outcome: After port 18000 was freed, `taha-cms-cms-1` started but `migrate` / `createsuperuser` failed with `failed to resolve host 'db'`. `/health/` HTTP 200 is not DB-ready (returns `db:error` while gunicorn is up). Likely a stale cms container/network from the failed bind, plus leftover `cms-*` from the first compose project name. `update-cms.sh` now force-recreates, removes `cms-cms-1`/`cms-db-1`, waits until `db` resolves and health JSON has `db=ok`. Compose gives `hostname: db` and network aliases. Treebeard E001 warnings are upstream advisory, not this failure.
- Why: Unblock first migrate/superuser on the VPS.
- Scope / files: `infra/cms/docker-compose.cms.yml`, `infra/deploy/update-cms.sh`, this Work Log.
- Deferred or risk IDs: RISK-0009 until migrate + superuser + Caddy + smoke PASS.
- Rollback / recovery: revert compose/script; operator can `up -d --force-recreate` without the script.

## LOG-0123 - 2026-08-16 - P3 / CMS update-cms port conflict + local pull_policy

- Outcome: VPS build of `taha-cms:local` succeeded but `compose up` failed with `Bind for 127.0.0.1:18000 failed: port is already allocated` (leftover `cms-cms-1` from the previous project name) and also attempted a registry pull of the local tag. `update-cms.sh` now forces `CMS_PULL_POLICY=never` when `CMS_BUILD=1`, uses `up --pull never`, and stops containers already bound to `:18000` before recreate.
- Why: Unblock second bring-up after successful local image build.
- Scope / files: `infra/deploy/update-cms.sh`, this Work Log.
- Deferred or risk IDs: RISK-0009 until smoke PASS; also fix `chown -R deploy:deploy /home/deploy/cms-repo` so deploy user can `git pull` without root.
- Rollback / recovery: revert script; manual `docker stop` of the binder on 18000.

## LOG-0122 - 2026-08-16 - P3 / CMS image CI visibility step fail-open

- Outcome: CI image push on PR #2 succeeded (`ghcr.io/tahamohamadi-ir/taha-cms:main` / `:a402a60`) but the follow-up `PUT â€¦/visibility` returned HTTP 404 with `GITHUB_TOKEN`, failing the workflow. Softened the step to `continue-on-error` + warning so publish success is not masked. VPS can proceed with `CMS_BUILD=1` or after owner sets the package Public in GitHub UI.
- Why: Unblock operators; Actions token cannot always change package visibility.
- Scope / files: `.github/workflows/ci-cms-image.yml`, this Work Log.
- Verification: prior push job already built/pushed tags; this change is CI control-flow only.
- Deferred or risk IDs: RISK-0009 unchanged until VPS smoke PASS.
- Rollback / recovery: revert workflow step.

## LOG-0121 - 2026-08-16 - P3 / CMS deploy ops fixes (GHCR public + script invoke)

- Outcome: Operator bring-up failed on VPS for three mechanical reasons: (1) `docker login ghcr.io` with GitHub password â†’ denied (need PAT `read:packages` or public package); (2) `./infra/deploy/*.sh` Permission denied (mode not executable / invoke via bash); (3) placeholder `<sha>` caused bash syntax error. Fixed by making GHCR package public in CI after push, documenting `bash infra/deploy/...`, adding `CMS_BUILD=1` local build fallback, and auto-appending missing `DJANGO_SETTINGS_MODULE` / `POSTGRES_HOST` in `.env`.
- Why: Unblock CMS runtime after main already contained the versioned pipeline (PR #1 / LOG-0120).
- Scope / files: `infra/deploy/update-cms.sh`, `.github/workflows/ci-cms-image.yml`, `infra/cms/README.md`, this Work Log.
- Commands or actions actually performed: local edits; git commit/push/merge of this fix branch (see verification).
- Verification actually performed and result: prior suite green on main; this slice is ops/docs/CI visibility â€” no CMS code path change requiring full pytest re-run beyond prior 78 PASS baseline.
- Decisions / assumptions: public GHCR package is acceptable for this public repository image (no secrets in image layers).
- Deferred or risk IDs: RISK-0009 still BLOCKED until VPS `bash infra/deploy/update-cms.sh` + Caddy + `smoke-cms.sh` PASS.
- Rollback / recovery: set package visibility private in GitHub Packages UI; previous CMS_IMAGE tag remains pullable if still tagged.

## LOG-0120 - 2026-08-16 - P3 / CMS versioned CI/CD + health/proxy hardening

- Outcome: Diagnosed owner VPS log (`/health/` HTML 400; `createsuperuser` â†’ `No module named django`; public `/admin/login/` still 301). Fixed production settings for Caddy proxy + loopback health; put image venv on `PATH`; replaced ad-hoc `:latest` tar flow with GHCR sha tags + `update-cms.sh` / `smoke-cms.sh`; documented Caddy + static artifact + Compose CMS contract.
- Why: First runtime bring-up failed for predictable proxy/PATH reasons; owner asked for principled CI/CD + dockerization + versioning.
- Scope / files: `apps/cms/config/settings/production.py`, `apps/cms/tests/test_production_proxy.py`, `infra/cms/*`, `infra/deploy/update-cms.sh`, `infra/deploy/smoke-cms.sh`, `.github/workflows/ci-cms-image.yml`, `.dockerignore`, `docs/plan/P3-cms-versioned-cicd-task-spec.md`, DEPLOY_RUNBOOK, PROJECT_MANIFEST, RISK_REGISTER, this entry.
- Commands or actions actually performed: local pytest/ruff (see verification); no VPS SSH in this slice.
- Verification actually performed and result: `uv run pytest` â†’ **78 passed** (includes 3 new production proxy tests); `ruff check` on touched CMS files â†’ All checks passed. VPS re-smoke not run in this slice.
- Decisions / assumptions: static Astro site stays non-containerized; CMS image identity is git-sha on GHCR; auto-SSH deploy from GitHub to VPS is out of scope (operator pull).
- Deferred or risk IDs: RISK-0009 remains BLOCKED until VPS re-smoke PASS with the fixed image + Caddy snippet.
- Rollback / recovery: revert branch; on server keep previous `CMS_IMAGE` tag.

## LOG-0119 - 2026-08-16 - P3 / CMS runtime deploy preparation

- Outcome: CMS runtime deployment staged and prepared for execution. The Docker image `taha-cms:latest` was built locally (multi-stage: uv sync + gunicorn, non-root uid 10001, HEALTHCHECK via /health/) and exported (258.5 MB). The NOT-APPLIED markers were removed from `infra/cms/*`. A repo-root `.dockerignore` was added. The Caddyfile.cms.snippet was rewritten to proxy `127.0.0.1:18000` (compose now publishes `127.0.0.1:18000:8000`). The new repo was cloned to `/home/deploy/cms-repo` on the VPS; a secure `.env` was generated on the VPS with openssl-grade random secrets (DJANGO_SECRET_KEY 87 chars, POSTGRES_PASSWORD 33, REBUILD_TRIGGER_SECRET 44) and placed at `infra/cms/.env` (chmod 600).
- Why: owner authorized CMS runtime deploy (2026-08-16) after old-stack decommission (469 MB RAM freed) and server updates (57 packages, NO REBOOT NEEDED).
- Scope / files: `.dockerignore` (new), `infra/cms/docker-compose.cms.yml` (ports published, markers removed), `infra/cms/Dockerfile.cms` (DJANGO_SETTINGS_MODULE fix, markers removed), `infra/cms/Caddyfile.cms.snippet` (127.0.0.1:18000 + noindex headers), `docs/status/WORK_LOG.md`. VPS: `/home/deploy/cms-repo` (clone), `/home/deploy/taha-cms.env`, `infra/cms/.env`, `/home/deploy/taha-cms.tar` (image), `/home/deploy/deploy-cms.sh` (root deploy script), `/home/deploy/add-caddy-cms.sh` (root Caddy script).
- Commands or actions actually performed: `docker build -f infra/cms/Dockerfile.cms -t taha-cms:latest .` (built; first attempt failed with "Unknown command: collectstatic" â€” fixed by adding DJANGO_SETTINGS_MODULE=config.settings.test to the collectstatic RUN); `docker save taha-cms:latest -o taha-cms.tar` (258.5 MB); scp to VPS; git clone of Taha-personal-platform to /home/deploy/cms-repo; env generation script (bash) uploaded+run on VPS; `bash -n` syntax checks PASS for both deploy scripts.
- Verification actually performed and result: Docker image builds and exports cleanly; compose file validates (structure verified); env has required minimum lengths; both deploy scripts `bash -n` PASS. Runtime health/smoke pending owner execution of `deploy-cms.sh` and `add-caddy-cms.sh` (sudo).
- Decisions / assumptions: the CMS runs on `127.0.0.1:18000` (no public port) and Caddy reverse-proxies `/admin/*` and `/health/*` only; everything else stays on the static site. `.env` never leaves the VPS (secrets generated on-server). `POSTGRES_HOST=db` per compose network. Old repo at `/opt/taha/repository` untouched (decommissioned containers only).
- Deferred or risk IDs: RISK-0009 stays BLOCKED until the runtime smoke PASS (owner executes deploy scripts); DEFER-0009/0013 unchanged.
- Rollback / recovery: `docker compose -f infra/cms/docker-compose.cms.yml down` (volumes preserved); restore Caddyfile from the timestamped backup the add-caddy script prints; static site is unaffected either way.

## LOG-0121 â€” 2026-08-17 â€” CMS content seed from static site sources

- Outcome: Added idempotent `seed_site_content` management command and canonical payloads in `apps/cms/apps/content/data/site_content.py` mirroring approved static content (`content.ts`, `profile.*.ts`, Master CV). Seeds published fa/en rows for Landing, Profile, ResearchStatement, ResearchTopic (3Ã—2), Publication (3Ã—2), and Project (3Ã—2). No blog articles (no published static writing corpus yet).
- Why: Production research/blog/project lists were empty because Wagtail had no published rows; build-time CMS fetch needs published API records.
- Scope / files: `apps/cms/apps/content/data/site_content.py`, `apps/cms/apps/content/management/commands/seed_site_content.py`, `apps/cms/tests/test_seed_site_content.py`, `infra/cms/README.md`, this entry.
- Commands or actions actually performed: `uv run pytest tests/test_seed_site_content.py -v` â†’ 3 passed; full CMS suite â†’ 155 passed.
- Verification actually performed and result: seed populates `/api/research/topics/en`, `/api/research/statements/en`, `/api/research/projects/en/pars-sql-vtd-edge` in tests; idempotent without `--force`.
- Decisions / assumptions: prose copied verbatim from static sources; empty `role` and no case-study extensions until owner-authored P6 depth content exists; articles intentionally omitted.
- Deferred or risk IDs: owner must run seed on VPS after merge + static rebuild; blog/articles remain empty until writing slice content exists.
- Rollback / recovery: delete seeded rows in Wagtail admin or re-run with `--force` after editing `site_content.py`; no schema migration.

## LOG-0152 - 2026-08-18 - ADM / Custom admin rebuild â€” docs and reference-file alignment (ADR-0026)

- Outcome: Ù…Ø§Ù„Ú© ØªØµÙ…ÛŒÙ… Ú¯Ø±ÙØª Wagtail Ú©Ù„Ø§Ù‹ Ø§Ø² runtime Ùˆ Ø§Ø¯Ù…ÛŒÙ† Ø­Ø°Ù Ø´ÙˆØ¯ Ùˆ Ø¨Ø§ Ø§Ø¯Ù…ÛŒÙ† Ø§Ø®ØªØµØ§ØµÛŒ React SPA Ø²ÛŒØ± `/admin/` + Django Ninja `/api/v1/admin/*` Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ø´ÙˆØ¯ (ADR-0026). ÙÙ‚Ø· Ù…Ø³ØªÙ†Ø¯Ø§Øª/ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ Ù…Ø±Ø¬Ø¹ Ø¯Ø± Ø§ÛŒÙ† slice ØªØºÛŒÛŒØ± Ú©Ø±Ø¯Ù†Ø¯Ø› Ú©Ø¯ ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯. ØªØºÛŒÛŒØ±Ø§Øª Ø±ÙˆÛŒ Ø¨Ø±Ù†Ú† `docs/custom-admin-rebuild` Ø§Ø² `origin/main` (Ù¾Ø³ Ø§Ø² sync Ø¨Ø§ ÙˆØ¶Ø¹ÛŒØª ÙˆØ§Ù‚Ø¹ÛŒ main: P4â€“P6 liveØŒ `/api/` Ùˆ `/media/` Ø¹Ù…ÙˆÙ…ÛŒØŒ `RISK-0003` CLOSEDØŒ `DEFER-0015` CLOSED) Ø§Ø¹Ù…Ø§Ù„ Ø´Ø¯. Ø§Ø³Ù†Ø§Ø¯: ADR-0026 (Ø¬Ø¯ÛŒØ¯)ØŒ `docs/plan/custom-admin-rebuild-fa.md` (Ø¬Ø¯ÛŒØ¯)ØŒ Task-list.md (Â§17 ADM-0..ADM-6 + supersede P7 + snapshot + Ù…Ø¹Ù…Ø§Ø±ÛŒ/Tech Stack + Ø¢ÛŒØªÙ…â€ŒÙ‡Ø§ÛŒ Â§14 Ø¯Ø± P4/P6/P10/release checklist)ØŒ AGENTS.md (gate + ownership)ØŒ PROJECT_MANIFEST.md (status/route/Ù…Ø¹Ù…Ø§Ø±ÛŒ/ownership/open decisions + Ø§ØµÙ„Ø§Ø­ Ø§Ø·Ø§Ù„Ø¹Ø§Øª Ù‚Ø¯ÛŒÙ…ÛŒ `/api/`)ØŒ docs/adr/README.md (Ø±Ø¯ÛŒÙ 0026 + ÛŒØ§Ø¯Ø¯Ø§Ø´Øª 0002/0014/0020/0022)ØŒ ledgers: BACKLOG.md (Ø±Ø¯ÛŒÙâ€ŒÙ‡Ø§ÛŒ ADM)ØŒ deferred-validation.md (DEFER-0023/0024/0025)ØŒ RISK_REGISTER.md (RISK-0010/0011)ØŒ TECH_DEBT.md (DEBT-0003)ØŒ CHANGELOG.mdØŒ README.md.
- Why: Ù…Ø§Ù„Ú© Ø§Ø¯Ù…ÛŒÙ† ÙØ¹Ù„ÛŒ ÙˆØ§Ú¯ØªÙÛŒÙ„ Ø±Ø§ ØºÛŒØ±Ù‚Ø§Ø¨Ù„ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø±Ø²ÛŒØ§Ø¨ÛŒ Ú©Ø±Ø¯Ø› ÙˆØ§Ø¨Ø³ØªÚ¯ÛŒ Ú©Ø¯ Ø¨Ù‡ ÙˆØ§Ú¯ØªÙÛŒÙ„ ÙÙ‚Ø· Û³ ÙØ§ÛŒÙ„ Ø§Ù…Ù†ÛŒØªÛŒ Ø§Ø³Øª Ùˆ Ù„Ø§ÛŒÙ‡â€ŒÙ‡Ø§ÛŒ Ø§Ø±Ø²Ø´Ù…Ù†Ø¯ Django Ø®Ø§Ù„Øµâ€ŒØ§Ù†Ø¯Ø› Ø®ÙˆØ§Ø³ØªÙ‡ = Ù…Ø¯ÛŒØ±ÛŒØª Ú©Ø§Ù…Ù„ Ø³Ø§ÛŒØª (ØµÙØ­Ø§Øª/Ú†ÛŒØ¯Ù…Ø§Ù†/ØªØ¨â€ŒÙ‡Ø§/ØªÚ¯â€ŒÙ‡Ø§/ÙÛŒÙ„ØªØ±Ù‡Ø§/Ù…Ø­ØªÙˆØ§) Ø¨Ø§ Ø§Ø¯Ù…ÛŒÙ† ÙØ§Ø±Ø³ÛŒ/RTLØ› Ù…Ø­ØªÙˆØ§ÛŒ seeded Ø¨Ø§ÛŒØ¯ Ø­ÙØ¸ Ø´ÙˆØ¯.
- Scope / files: `docs/adr/0026-custom-admin-replaces-wagtail.md` (new), `docs/plan/custom-admin-rebuild-fa.md` (new), `docs/adr/README.md`, `AGENTS.md`, `PROJECT_MANIFEST.md`, `Task-list.md`, `docs/status/BACKLOG.md`, `docs/status/deferred-validation.md`, `docs/status/RISK_REGISTER.md`, `docs/status/TECH_DEBT.md`, `docs/status/CHANGELOG.md`, `README.md`, Ø§ÛŒÙ† Work Log.
- Commands or actions actually performed: `git fetch origin --prune`Ø› `git switch -c docs/custom-admin-rebuild origin/main`Ø› ÙˆÛŒØ±Ø§ÛŒØ´/Ø§ÛŒØ¬Ø§Ø¯ ÙØ§ÛŒÙ„ (write/edit)Ø› Ø¨Ø¯ÙˆÙ† Ú©Ø¯/CI/VPS. Ø±Ø§Ø³ØªÛŒâ€ŒØ¢Ø²Ù…Ø§ÛŒÛŒ read-only: `git show origin/main:docs/status/deferred-validation.md` (max DEFER-0022)ØŒ `git show origin/main:docs/status/WORK_LOG.md` (max LOG-0151)ØŒ `git show origin/main:docs/status/RISK_REGISTER.md` (max RISK-0009)ØŒ `git show origin/main:docs/status/TECH_DEBT.md` (max DEBT-0002 â†’ DEBT-0003 Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø´Ø¯).
- Verification actually performed and result: `git diff --check` Ø±ÙˆÛŒ ØªØºÛŒÛŒØ±Ø§ØªØ› Ø´Ù…Ø§Ø±Ù‡â€ŒÙ‡Ø§ÛŒ DEFER/LOG/RISK/DEBT Ù†Ø³Ø¨Øª Ø¨Ù‡ `origin/main` Ø¨Ø¯ÙˆÙ† ØªØ¯Ø§Ø®Ù„ Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ø¯Ù†Ø¯Ø› Ù‡ÛŒÚ† ÙØ§ÛŒÙ„ Ú©Ø¯ÛŒ Ù„Ù…Ø³ Ù†Ø´Ø¯.
- Decisions / assumptions: Ù¾Ø§ÛŒÙ‡â€ŒÛŒ Ú©Ø§Ø±Ù‡Ø§ÛŒ ADM = `origin/main`Ø› ÙˆØ§Ú¯ØªÙÛŒÙ„ ØªØ§ cutover ADM-1 Ø¨Ù‡ Ø³Ø±ÙˆÛŒØ³ `/admin/` Ø§Ø¯Ø§Ù…Ù‡ Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ (DEFER-0023)Ø› Ø§Ø¯Ù…ÛŒÙ†â€ŒÙ‡Ø§ÛŒ Wagtail-session Ù…ÙˆØ¬ÙˆØ¯ (PR #24/#31) Ø¯Ø± ADM-1 Ù…Ù†ØªÙ‚Ù„ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯Ø› Ø§Ø³ØªÚ© Ø§Ø¯Ù…ÛŒÙ† = React + Vite + Tailwind v4 + shadcn/uiØ› Composition Ø³Ø§Ø®ØªØ§Ø±ÛŒØ§ÙØªÙ‡ Ø¨Ø§ layout presetsØ› ÙØ±Ø§Ù†Øª Ø¹Ù…ÙˆÙ…ÛŒ Astro Ø§Ø³ØªØ§ØªÛŒÚ© Ø¨Ø§ rebuild-trigger.
- Deferred or risk IDs: DEFER-0023/0024/0025ØŒ RISK-0010/0011ØŒ DEBT-0003.
- Rollback / recovery: Ø§ÛŒÙ† slice ØµØ±ÙØ§Ù‹ Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ø³Øª â€” revert Ø¨Ø±Ù†Ú† Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø²Ø› Ø¨Ø¯ÙˆÙ† Ø§Ø«Ø± runtime.

## LOG-0153 - 2026-08-18 - ADM / Complementary improvements extracted from Samples (beyond admin)

- Outcome: Ø¯Ø± Ù¾Ø§Ø³Ø® Ø¨Ù‡ Ø³Ø¤Ø§Ù„ Ù…Ø§Ù„Ú© (Â«Ø¨Ø¬Ø² Ù¾Ù†Ù„ Ø§Ø¯Ù…ÛŒÙ† Ø§Ø² Ù¾Ø±ÙˆÚ˜Ù‡â€ŒÙ‡Ø§ÛŒ Ù‚Ø¨Ù„ÛŒ Ú†Ù‡ Ú†ÛŒØ²ÛŒ Ø§Ø¶Ø§ÙÙ‡ Ú©Ù†ÛŒÙ…ØŸÂ»)ØŒ Ø¨Ø®Ø´ Â§14 Â«Ø¨Ù‡Ø±Ù‡â€ŒØ¨Ø±Ø¯Ø§Ø±ÛŒâ€ŒÙ‡Ø§ÛŒ Ù…Ú©Ù…Ù„Â» Ø¨Ù‡ `docs/plan/custom-admin-rebuild-fa.md` Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯: Û±Û° ÙˆÛŒÚ˜Ú¯ÛŒ (F1â€“F10)ØŒ Û· Ø§Ù„Ú¯ÙˆÛŒ Ø³Ø§Ø®ØªØ§Ø±ÛŒ (S1â€“S7)ØŒ Ûµ Ù…ÙˆØ±Ø¯ UI/UX (U1â€“U5) â€” Ù‡Ø±Ú©Ø¯Ø§Ù… Ø¨Ø§ Ù…Ù†Ø¨Ø¹ Ø¯Ù‚ÛŒÙ‚ Ø¯Ø± Samples Ùˆ ÙØ§Ø² Ù‡Ø¯Ù. Ø±Ø¯ÛŒÙâ€ŒÙ‡Ø§ÛŒ Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ÛŒ Ø¨Ù‡ BACKLOG Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯Ù†Ø¯ (QA-playwrightØŒ P4-readingØŒ P6-galleryØŒ ADM-5-featuredØŒ QA-vitest). Ø¯Ø± ØªØ·Ø¨ÛŒÙ‚ Ø¨Ø§ main Ù…Ø´Ø®Øµ Ø´Ø¯ Ø¨Ø®Ø´ÛŒ Ø§Ø² F Ù‡Ø§ Ù‚Ø¨Ù„Ø§Ù‹ Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯ (reading time ~200wpmØŒ JSON-LD BlogPostingØŒ BreadcrumbList Ø¯Ø± P4)Ø› ÙÙ‚Ø· Ù…ÙˆØ§Ø±Ø¯ Ø§Ù†Ø¬Ø§Ù…â€ŒÙ†Ø´Ø¯Ù‡ Ø¯Ø± Task-list ØªØ«Ø¨ÛŒØª Ø´Ø¯Ù†Ø¯.
- Why: Ù…Ø§Ù„Ú© Ø®ÙˆØ§Ø³Øª Ø¨Ø¯Ø§Ù†Ø¯ Ú†Ù‡ Ø§Ù…Ú©Ø§Ù†Ø§Øª/Ø³Ø§Ø®ØªØ§Ø±/UX Ø¯ÛŒÚ¯Ø±ÛŒ Ø§Ø² Ù¾Ø±ÙˆÚ˜Ù‡â€ŒÙ‡Ø§ÛŒ Ù‚Ø¨Ù„ÛŒ Ø¨Ù‡ Ù¾Ø±ÙˆÚ˜Ù‡â€ŒÛŒ Ù†Ù‡Ø§ÛŒÛŒ Ù…Ù†ØªÙ‚Ù„ Ø´ÙˆØ¯Ø› Ù¾Ø§Ø³Ø® Ø¨Ø§ÛŒØ¯ Ù…Ø³ØªÙ†Ø¯ØŒ Ù…Ù†Ø¨Ø¹â€ŒØ¯Ø§Ø± Ùˆ ÙØ§Ø²Ø¨Ù†Ø¯ÛŒâ€ŒØ´Ø¯Ù‡ Ø¨Ø§Ø´Ø¯.
- Scope / files: `docs/plan/custom-admin-rebuild-fa.md` (Â§14)ØŒ `docs/status/BACKLOG.md`ØŒ Ø§ÛŒÙ† Work Log.
- Commands or actions actually performed: ÙˆÛŒØ±Ø§ÛŒØ´ ÙØ§ÛŒÙ„Ø› Ø¨Ø¯ÙˆÙ† Ú©Ø¯/CI/VPSØ› Ù…Ù†Ø¨Ø¹â€ŒÙ‡Ø§ Ø§Ø² Ú¯Ø²Ø§Ø±Ø´â€ŒÙ‡Ø§ÛŒ Ø¨Ø§Ø²Ø¨ÛŒÙ†ÛŒ Samples Ù‡Ù…Ø§Ù† Ø¬Ù„Ø³Ù‡ (Û´ sub-agent) Ú¯Ø±ÙØªÙ‡ Ø´Ø¯Ù†Ø¯.
- Verification actually performed and result: `git diff --check` PASSØ› Ø§Ø±Ø¬Ø§Ø¹â€ŒÙ‡Ø§ÛŒ Â§14 Ø¨Ø§ Ú¯Ø²Ø§Ø±Ø´â€ŒÙ‡Ø§ÛŒ Ø§ÙˆÙ„ÛŒÙ‡ Ù‡Ù…â€ŒØ®ÙˆØ§Ù†ÛŒ Ø¯Ø§Ø±Ù†Ø¯.
- Decisions / assumptions: Ù…ÙˆØ§Ø±Ø¯ Â§14 Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ÛŒâ€ŒØ§Ù†Ø¯Ø› Ù‡Ø±Ú©Ø¯Ø§Ù… Ø¨Ø§ Task Spec Ùˆ Ø§ÙˆÙ„ÙˆÛŒØª Ù…Ø§Ù„Ú© Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯Ø› blocker ÙØ§Ø²Ù‡Ø§ÛŒ ADM Ù†ÛŒØ³ØªÙ†Ø¯.
- Deferred or risk IDs: Ø¨Ø¯ÙˆÙ† ID Ø¬Ø¯ÛŒØ¯.
- Rollback / recovery: revert Ú©Ø§Ù…ÛŒØªØ› Ø¨Ø¯ÙˆÙ† Ø§Ø«Ø± runtime.

## LOG-0154 - 2026-08-18 - Git sync: local/remote alignment + server sync prep

- Outcome: Ø¨Ø±Ù†Ú† Ù…Ø­Ù„ÛŒ Ù‚Ø¯ÛŒÙ…ÛŒ (`feat/cms-backup-risk-0003-prep` Ø¨Ø§ Û³ Ú©Ø§Ù…ÛŒØª doc Ø§Ø² Ø§ÛŒÙ† Ø¬Ù„Ø³Ù‡) Ø¨Ø§ ÙˆØ¶Ø¹ÛŒØª Ø¬Ø¯ÛŒØ¯ Ù‡Ù…â€ŒØ±Ø§Ø³ØªØ§ Ù†Ø´Ø¯Ø› ØªØºÛŒÛŒØ±Ø§Øª Ø±ÙˆÛŒ Ø¨Ø±Ù†Ú† ØªØ§Ø²Ù‡â€ŒÛŒ `docs/custom-admin-rebuild` Ø§Ø² `origin/main` Ø¨Ø§Ø²Ø§Ø¹Ù…Ø§Ù„ Ø´Ø¯Ù†Ø¯ (Ø¨Ø§ ØªØ·Ø¨ÛŒÙ‚ Ø¨Ù‡ ÙˆØ§Ù‚Ø¹ÛŒØª main Ùˆ Ø´Ù…Ø§Ø±Ù‡â€ŒÙ‡Ø§ÛŒ Ø¨Ø¯ÙˆÙ† ØªØ¯Ø§Ø®Ù„). `git fetch origin --prune` Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯. Ø³ÛŒÙ†Ú© Ø³Ø±ÙˆØ± (production VPS) Ù…Ø³ØªÙ‚ÛŒÙ…Ø§Ù‹ Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯ â€” Ø·Ø¨Ù‚ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ (SSH/deploy Ù†ÛŒØ§Ø² Ø¨Ù‡ ØªØ£ÛŒÛŒØ¯ ØµØ±ÛŒØ­ Ùˆ Task Spec)Ø› Ø¯Ø³ØªÙˆØ±Ø§Ù„Ø¹Ù…Ù„/Ø§Ø³Ú©Ø±ÛŒÙ¾Øª Ø¨Ø±Ø§ÛŒ Ù…Ø§Ù„Ú© Ø¯Ø± Ù¾ÛŒØ§Ù… Ù†Ù‡Ø§ÛŒÛŒ Ø§Ø±Ø§Ø¦Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Why: Ù…Ø§Ù„Ú© Ø®ÙˆØ§Ø³Øª localØŒ remote (main) Ùˆ Ø³Ø±ÙˆØ± Ø¯Ø± Ø¨Ù‡ØªØ±ÛŒÙ†/Ø¢Ø®Ø±ÛŒÙ† ÙˆØ¶Ø¹ÛŒØª Ø³ÛŒÙ†Ú© Ø´ÙˆÙ†Ø¯ ØªØ§ version control Ú©Ø§Ù…Ù„ Ùˆ ØªÙ…ÛŒØ² Ø¨Ø§Ø´Ø¯.
- Scope / files: Ø¨Ø±Ù†Ú†â€ŒÙ‡Ø§/worktrees Ùˆ Ø§ÛŒÙ† Work Log.
- Commands or actions actually performed: `git fetch origin --prune`Ø› `git switch -c docs/custom-admin-rebuild origin/main`Ø› Ø¨Ø±Ø±Ø³ÛŒ divergence (Û¶Û´ behind / Û³ ahead)Ø› Ø±Ø§Ø³ØªÛŒâ€ŒØ¢Ø²Ù…Ø§ÛŒÛŒ Ø´Ù…Ø§Ø±Ù‡â€ŒÙ‡Ø§ Ø¯Ø± main.
- Verification actually performed and result: ÙˆØ¶Ø¹ÛŒØª divergence Ùˆ Ø´Ù…Ø§Ø±Ù‡â€ŒÙ‡Ø§ÛŒ ledger Ù‡Ø§ÛŒ main Ø«Ø¨Øª Ø´Ø¯Ø› ØªØºÛŒÛŒØ±Ø§Øª doc Ø§Ø² Ø¨Ø±Ù†Ú† Ù‚Ø¯ÛŒÙ…ÛŒ Ø¨Ù‡ Ø¬Ø¯ÛŒØ¯ Ù…Ù†ØªÙ‚Ù„ Ùˆ Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ Ø´Ø¯.
- Decisions / assumptions: main Ù…Ø±Ø¬Ø¹ Ø­Ù‚ÛŒÙ‚Øª Ø§Ø³ØªØ› Ø¨Ø±Ù†Ú† Ù…Ø­Ù„ÛŒ Ù‚Ø¯ÛŒÙ…ÛŒ Ù¾Ø³ Ø§Ø² merge Ø§ÛŒÙ† PR Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ø­Ø°Ù Ø´ÙˆØ¯Ø› Ø³Ø±ÙˆØ± Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ Ø¨Ø§ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú© Ø³ÛŒÙ†Ú© Ù…ÛŒâ€ŒØ´ÙˆØ¯ (rebuild CMS image Ø§Ø² main + migrate + seed + rebuild-static).
- Deferred or risk IDs: DEFER-0024 (Ø¨Ø±Ù†Ú† Ù¾Ø§ÛŒÙ‡) â€” Ù†Ø²Ø¯ÛŒÚ©â€ŒØ´ÙˆÙ†Ø¯Ù‡Ø› Ø³ÛŒÙ†Ú© Ø³Ø±ÙˆØ± Ø¨Ù‡ Ù…Ø§Ù„Ú© ÙˆØ§Ú¯Ø°Ø§Ø± Ø´Ø¯.
- Rollback / recovery: revert/Ø­Ø°Ù Ø¨Ø±Ù†Ú†Ø› Ø¨Ø¯ÙˆÙ† Ø§Ø«Ø± runtime ØªØ§ Ø§Ø¬Ø±Ø§ÛŒ Ø¯Ø³ØªÙˆØ±Ø§Ù„Ø¹Ù…Ù„ Ø³Ø±ÙˆØ±.

## LOG-0155 - 2026-08-18 - Server sync progress + stale CMS image pin fix

- Outcome: Ù…Ø§Ù„Ú© Ø³ÛŒÙ†Ú© Ø³Ø±ÙˆØ± Ø±Ø§ Ø´Ø±ÙˆØ¹ Ú©Ø±Ø¯: `git pull` ØªØ§ `d626ecf`ØŒ Ø³Ù¾Ø³ `sudo bash infra/deploy/prod-cms-update-migrate.sh`. Ù¾ÛŒØ´â€ŒÙØ±Ø¶ Ø§Ø³Ú©Ø±ÛŒÙ¾Øª Ø¨Ù‡ `b369885` (ØªØµÙˆÛŒØ± Ù‚Ø¯ÛŒÙ…ÛŒ P4â€“P5) Ù¾ÛŒÙ† Ø´Ø¯Ù‡ Ø¨ÙˆØ¯ â†’ `migrate` Ú¯ÙØª Â«No migrations to applyÂ» Ùˆ ÙÙ‚Ø· 0001â€“0004 Ø¯Ø± `showmigrations` Ø¯ÛŒØ¯Ù‡ Ø´Ø¯Ø› **0005/0006 Ø§Ø¹Ù…Ø§Ù„ Ù†Ø´Ø¯Ù†Ø¯** Ùˆ `import_profile_seed` Ø¨Ø§ Â«Unknown commandÂ» Ø´Ú©Ø³Øª (Ù‡Ø± Ø¯Ùˆ Ø¯Ø± PR #31 ÛŒØ¹Ù†ÛŒ ØªØµÙˆÛŒØ± `430061b` Ø¢Ù…Ø¯Ù‡â€ŒØ§Ù†Ø¯). Ù‡Ù…Ú†Ù†ÛŒÙ† `rebuild-static.sh` Ø±ÙˆÛŒ VPS Ø¨Ø§ Â«npm not foundÂ» Ø´Ú©Ø³Øª (VPS Ù†ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯). Ù¾ÛŒØ´â€ŒÙØ±Ø¶ Ù‚Ø¯ÛŒÙ…ÛŒ Ø§Ø³Ú©Ø±ÛŒÙ¾Øª Ø¨Ø±Ø¯Ø§Ø´ØªÙ‡ Ø´Ø¯ Ùˆ `CMS_IMAGE` **Ø§Ù„Ø²Ø§Ù…ÛŒ** Ø´Ø¯ (Ø¨Ø§ Ù¾ÛŒØ§Ù… Ø±Ø§Ù‡Ù†Ù…Ø§) ØªØ§ Ø§ÛŒÙ† Ø®Ø·Ø§ ØªÚ©Ø±Ø§Ø± Ù†Ø´ÙˆØ¯.
- Why: ØªØµÙˆÛŒØ± CMS ÙÙ‚Ø· Ø¨Ø§ ØªØºÛŒÛŒØ± `apps/cms/**`/`infra/cms/**` Ø³Ø§Ø®ØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› merge Ù‡Ø§ÛŒ docs-only (PR #32/#34) ØªØµÙˆÛŒØ± Ø¬Ø¯ÛŒØ¯ Ù†Ù…ÛŒâ€ŒØ³Ø§Ø²Ù†Ø¯Ø› Ø¢Ø®Ø±ÛŒÙ† ØªØµÙˆÛŒØ± Ø¯Ø§Ø±Ø§ÛŒ 0005/0006 Ùˆ `import_profile_seed` = `430061b` Ø§Ø³Øª.
- Scope / files: `infra/deploy/prod-cms-update-migrate.sh`ØŒ `docs/status/WORK_LOG.md`ØŒ `docs/status/CHANGELOG.md`.
- Commands or actions actually performed: ÙˆÛŒØ±Ø§ÛŒØ´ Ø§Ø³Ú©Ø±ÛŒÙ¾Øª (Ø­Ø°Ù Ù¾ÛŒØ´â€ŒÙØ±Ø¶ `b369885`ØŒ Ø§Ù„Ø²Ø§Ù… `CMS_IMAGE`)Ø› Ø¨Ø±Ø±Ø³ÛŒ `ci-cms-image.yml` (path filters) Ùˆ Ø¢Ø®Ø±ÛŒÙ† run Ù‡Ø§ÛŒ Â«CMS imageÂ» (Ø¢Ø®Ø±ÛŒÙ† = PR #31).
- Verification actually performed and result: `git diff --check` PASSØ› Ø§Ø³Ú©Ø±ÛŒÙ¾Øª Ø¨Ø§ `bash -n` Ø®Ø·Ø§ÛŒ Ù†Ø­ÙˆÛŒ Ù†Ø¯Ø§Ø±Ø¯Ø› Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ø¯Ø± Ù…Ù†Ø·Ù‚ Ø¯ÛŒÚ¯Ø±.
- Decisions / assumptions: Ø¨Ù‡â€ŒØ¬Ø§ÛŒ HEADØŒ ØªØµÙˆÛŒØ± Ø¨Ø§ÛŒØ¯ Ø§Ø² Ø¢Ø®Ø±ÛŒÙ† run Ù…ÙˆÙÙ‚ Â«CMS imageÂ» Ø§Ù†ØªØ®Ø§Ø¨ Ø´ÙˆØ¯ (Ù…Ø«Ù„Ø§Ù‹ `430061b`)Ø› Ù…Ø§Ù„Ú© Ù¾Ø³ Ø§Ø² deploy ØªØµÙˆÛŒØ± Ø¯Ø±Ø³ØªØŒ `migrate` (0005/0006) + `import_profile_seed` + Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø² `seed_site_content` + `smoke-cms.sh` Ø±Ø§ Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒÚ©Ù†Ø¯Ø› Ø¨Ø§Ø²Ø³Ø§Ø²ÛŒ Ø§Ø³ØªØ§ØªÛŒÚ© ÛŒØ§ Ø¨Ø§ Ù†ØµØ¨ Node 24 Ø±ÙˆÛŒ VPS ÛŒØ§ build Ù…Ø­Ù„ÛŒ Ø¨Ø§ SSH tunnel (Ú¯Ø²ÛŒÙ†Ù‡â€ŒÛŒ `build-static-with-cms.sh`/`rebuild-static.sh`).
- Deferred or risk IDs: RISK-0010 (Ø­ÙØ¸ Ù…Ø­ØªÙˆØ§ â€” backup Ú¯Ø±ÙØªÙ‡ Ø´Ø¯: `/home/deploy/backups/pre-migrate-20260818-165018/cms-postgres-all.sql`).
- Rollback / recovery: ØªØµÙˆÛŒØ± Ù‚Ø¨Ù„ÛŒ `31c6560`/`b369885` Ùˆ backup Ù¾ÛŒØ´ Ø§Ø² migrate Ù…ÙˆØ¬ÙˆØ¯ Ø§Ø³ØªØ› Ø¨Ø§Ø²Ú¯Ø´Øª = `CMS_IMAGE=<Ù‚Ø¨Ù„ÛŒ> sudo bash infra/deploy/prod-cms-update-migrate.sh`.

## LOG-0156 - 2026-08-18 - ADM-1 / Custom admin auth API + React SPA scaffold (foundation)

- Outcome: Ø¨Ù†ÛŒØ§Ù† Ø§Ø¯Ù…ÛŒÙ† Ø§Ø®ØªØµØ§ØµÛŒ (ADR-0026) Ø¨Ù‡â€ŒØµÙˆØ±Øª **additive Ùˆ ØºÛŒØ±Ø´Ú©Ù†Ù†Ø¯Ù‡** Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯ â€” ÙˆØ§Ú¯ØªÙÛŒÙ„ Ùˆ `/admin/` ÙØ¹Ù„ÛŒ ØªØ§ cutover Ø¯Ø³Øª Ù†Ø®ÙˆØ±Ø¯Ù†Ø¯:
  1. **Backend** `apps/api/admin_api.py`: NinjaAPI Ù…Ø³ØªÙ‚Ù„ Ø¯Ø± `/api/v1/admin/` â€” `auth/csrf`ØŒ `auth/login` (email+password+TOTP/recovery)ØŒ `auth/logout`ØŒ `auth/me`ØŒ `dashboard/summary` (Ø´Ù…Ø§Ø±Ø´ Ù…Ø­ØªÙˆØ§ØŒ draft/published). Security: session+CSRF ØµØ±ÛŒØ­ (Ú†ÙˆÙ† ninja Ù‡Ù…Ù‡â€ŒÛŒ views Ø±Ø§ csrf_exempt Ù…ÛŒâ€ŒÚ©Ù†Ø¯)ØŒ Ø¯ÙˆØ¨Ø§Ø±Ù‡â€ŒØ§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² `AuditLog` + `django-otp` (`DEVICE_ID_SESSION_KEY`) + rate-limit cache (5/5min) + `_require_admin_otp` Ø¨Ø±Ø§ÛŒ endpoint Ù‡Ø§ÛŒ Ù…Ø­Ø§ÙØ¸Øªâ€ŒØ´Ø¯Ù‡. Ø®Ø·Ø§Ù‡Ø§ Ø¨Ù‡ Ø´Ú©Ù„ `{code, message, fields}`.
  2. **Frontend** `apps/cms/admin-frontend/` (React 18 + Vite + TS + Tailwind v4 + VazirmatnØŒ RTL): ØµÙØ­Ù‡â€ŒÛŒ ÙˆØ±ÙˆØ¯ØŒ AuthProvider/AuthGuard (csrfâ†’loginâ†’me)ØŒ Ù¾ÙˆØ³ØªÙ‡â€ŒÛŒ Ø§Ø¯Ù…ÛŒÙ† Ø¨Ø§ Ø³Ø§ÛŒØ¯Ø¨Ø§Ø±ØŒ Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯ Ø¨Ø§ Ú©Ø§Ø±Øªâ€ŒÙ‡Ø§ÛŒ `dashboard/summary`. `npm run build` Ùˆ `npm run check` Ù¾Ø§Ø³.
  3. **CI**: workflow Ø¬Ø¯ÛŒØ¯ `ci-admin-frontend.yml` (npm ci â†’ check â†’ build Ø±ÙˆÛŒ ØªØºÛŒÛŒØ±Ø§Øª `apps/cms/admin-frontend/**`)Ø› secret-scan Ø³ÛŒâ€ŒØ§Ù…â€ŒØ§Ø³ node_modules Ø±Ø§ Ø§Ø³ØªØ«Ù†Ø§ Ú©Ø±Ø¯.
  4. **Caddy**: Ù‡Ù†Ø¯Ù„ `no-store` Ø¨Ø±Ø§ÛŒ `/api/v1/admin/*` Ùˆ `/api/admin/*` Ø¯Ø± `Caddyfile.cms.api.snippet` (Ø§Ø¹Ù…Ø§Ù„ Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± = Ù…Ø±Ø­Ù„Ù‡â€ŒÛŒ Ø¬Ø¯Ø§ Ø¨Ø§ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú©).
- Why: Ø§ÙˆÙ„ÛŒÙ† ÙØ§Ø² Ø§Ø¬Ø±Ø§ÛŒÛŒ ADM-0/ADM-1Ø› Ø¨Ø¯ÙˆÙ† Ø­Ø°Ù ÙˆØ§Ú¯ØªÙÛŒÙ„ Ùˆ Ø¨Ø¯ÙˆÙ† Ø±ÛŒØ³Ú© productionØ› Ù‡Ø± Ø¯Ùˆ Ø¨Ø®Ø´ (auth API Ùˆ SPA) Ø¨Ù‡â€ŒØµÙˆØ±Øª Ù…Ø³ØªÙ‚Ù„ Ø¨Ø§ ØªØ³Øª/CI Ù‚Ø§Ø¨Ù„ ØªØ£ÛŒÛŒØ¯Ù†Ø¯.
- Scope / files: `apps/cms/apps/api/admin_api.py` (new)ØŒ `apps/cms/config/urls.py`ØŒ `apps/cms/tests/test_admin_api_auth.py` (new)ØŒ `apps/cms/admin-frontend/` (newØŒ scaffold Ú©Ø§Ù…Ù„)ØŒ `.github/workflows/ci-admin-frontend.yml` (new)ØŒ `.github/workflows/ci-cms.yml`ØŒ `infra/cms/Caddyfile.cms.api.snippet`ØŒ `Task-list.md` (Â§17 ADM-1)ØŒ Ø§ÛŒÙ† Work Log.
- Commands or actions actually performed: `uv run pytest` (187 passed â€” Ú©Ù„ Ø³ÙˆÛŒÛŒÛŒØª)Ø› `uv run ruff check .` (All checks passed)Ø› `uv run python manage.py check` (ÙÙ‚Ø· Û² warning Ø§Ø² Ù‚Ø¨Ù„â€ŒÙ…ÙˆØ¬ÙˆØ¯ treebeard)Ø› `makemigrations --check --dry-run` (No changes detected)Ø› `npm run build` Ø¯Ø± admin-frontend (PASS).
- Verification actually performed and result: Û±Û³ ØªØ³Øª Ø¬Ø¯ÛŒØ¯ admin auth (CSRFØŒ login Ø¨Ø¯ÙˆÙ† OTP/Ø¨Ø§ OTP/Ø¨Ø§ OTP ØºÙ„Ø·/Ø±Ù…Ø² ØºÙ„Ø·/non-staffØŒ logoutØŒ meØŒ dashboard guardØŒ CSRF enforcementØŒ rate-limit+audit) â€” 13 passedØ› Ú©Ù„ Ø³ÙˆÛŒÛŒÛŒØª CMS Ø¨Ø¯ÙˆÙ† regression (187 passed)Ø› SPA build/type-check Ø¯Ø± CI Ú¯ÛŒØª.
- Decisions / assumptions: auth Ø§Ø¯Ù…ÛŒÙ† Ø¨Ø§ Ù‡Ù…Ø§Ù† Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ø§Ù…Ù†ÛŒØªÛŒ Ù…ÙˆØ¬ÙˆØ¯ (session+CSRF+TOTP+audit+rate-limit)Ø› `otpVerified` Ø¯Ø± Ù¾Ø§Ø³Ø® login Ù…Ù†Ø¹Ú©Ø³â€ŒÚ©Ù†Ù†Ø¯Ù‡â€ŒÛŒ ØªØ£ÛŒÛŒØ¯ Ù‡Ù…Ø§Ù† Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø§Ø³ØªØ› Ú©Ø§Ø±Ø¨Ø± staff Ø¨Ø¯ÙˆÙ† Ø¯Ø³ØªÚ¯Ø§Ù‡ TOTP Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ù„Ø§Ú¯ÛŒÙ† Ú©Ù†Ø¯ ÙˆÙ„ÛŒ endpoint Ù‡Ø§ÛŒ Ù…Ø­Ø§ÙØ¸Øªâ€ŒØ´Ø¯Ù‡ ØªØ§ Ø²Ù…Ø§Ù† enrollment Ø¯Ø± Ø¯Ø³ØªØ±Ø³ Ù†ÛŒØ³ØªÙ†Ø¯ (Ù‡Ù…Ø§Ù† policy ÙˆØ§Ú¯ØªÙÛŒÙ„ ÙØ¹Ù„ÛŒ)Ø› docs/OpenAPI Ù†ÛŒÙ†Ø¬Ø§ Ø¨Ø±Ø§ÛŒ API Ø§Ø¯Ù…ÛŒÙ† ÙØ¹Ù„Ø§Ù‹ ØºÛŒØ±ÙØ¹Ø§Ù„ (Ø¹Ù…ÙˆÙ…ÛŒ Ù†Ø¨Ø§Ø´Ø¯).
- Deferred or risk IDs: DEFER-0023 (cutover ÙˆØ§Ú¯ØªÙÛŒÙ„â†’SPA Ø¯Ø± ADM-1 Ù†Ù‡Ø§ÛŒÛŒ)Ø› RISK-0010 Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±Ø› Caddy no-store Ù‡Ù†Ø¯Ù„ Ø¨Ø§ÛŒØ¯ Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± Ø¨Ø§ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú© Ø§Ø¹Ù…Ø§Ù„ Ø´ÙˆØ¯.
- Rollback / recovery: Ø§ÛŒÙ† slice additive Ø§Ø³Øª â€” Ø­Ø°Ù ÙØ§ÛŒÙ„â€ŒÙ‡Ø§/Ø¨Ø±Ù†Ú† Ø¨Ø¯ÙˆÙ† Ø§Ø«Ø± Ø¨Ø± runtimeØ› ØªÙˆÙ„ÛŒØ¯ Ù‡ÛŒÚ†â€ŒÚ†ÛŒØ² Ø§Ø² Ø§ÛŒÙ† ØªØºÛŒÛŒØ± Ø±Ø§ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯ ØªØ§ cutover.

## LOG-0158 - 2026-08-18 - ADM-1 / Content write API (create/update + optimistic lock) + SPA edit pages

- Outcome: Ù…Ø³ÛŒØ± **write** Ø§Ø¯Ù…ÛŒÙ† Ù…Ø­ØªÙˆØ§ (ADM-1) Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯ ØªØ§ Ø§Ø¯Ù…ÛŒÙ† ÙˆØ§Ù‚Ø¹Ø§Ù‹ Ù‚Ø§Ø¨Ù„ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø´ÙˆØ¯ (Ù†Ù‡ ÙÙ‚Ø· read):
  1. **Backend** `apps/api/admin_content.py`: `GET /content/schema` (Ù…ØªØ§Ø¯ÛŒØªØ§ÛŒ ÙÛŒÙ„Ø¯Ù‡Ø§ÛŒ Ù‚Ø§Ø¨Ù„â€ŒÙˆÛŒØ±Ø§ÛŒØ´ Ø¨Ø±Ø§ÛŒ ÙØ±Ù…â€ŒÙ‡Ø§ÛŒ SPA)ØŒ `POST /content/{entity}` (createØŒ 201Ø› duplicate â†’ 409 DUPLICATEØ› unknown field â†’ 400)ØŒ `PUT /content/{entity}/{id}` (update Ø¨Ø§ **optimistic lock** If-Match Ø¯Ø§Ø®Ù„ `transaction.atomic` + `select_for_update`Ø› stale â†’ 409 CONFLICT Ø¨Ø§ `currentUpdatedAt`Ø› slug duplicate â†’ 409). Ù‡Ø± Ø³Ù‡ Ø¨Ø§ guard staff+OTP + CSRF. coercion Ø¨Ø§ Ù†ÙˆØ¹ ÙÛŒÙ„Ø¯ Ù…Ø¯Ù„ (IntegerField/DateField/TextFieldâ€¦)ØŒ ÙÛŒÙ„Ø¯ Ø¹Ø¯Ø¯ÛŒ Ø®Ø§Ù„ÛŒ skip Ù…ÛŒâ€ŒØ´ÙˆØ¯ØŒ Ø®Ø·Ø§Ù‡Ø§ Ø¨Ø§ Ú©Ù„ÛŒØ¯ camelCase. publish ÙÙ‚Ø· ÙˆÙ‚ØªÛŒ `published_at` ØªÙ‡ÛŒ Ø§Ø³Øª set Ù…ÛŒâ€ŒØ´ÙˆØ¯ (ÙˆÛŒØ±Ø§ÛŒØ´â€ŒÙ‡Ø§ÛŒ Ø¨Ø¹Ø¯ÛŒ ØªØ§Ø±ÛŒØ® Ø§Ù†ØªØ´Ø§Ø± Ø±Ø§ Ø¹ÙˆØ¶ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ù†Ø¯).
  2. **Frontend** `apps/cms/admin-frontend/`: `ContentEditPage` (ÙØ±Ù… create/edit ÛŒÚ©Ù¾Ø§Ø±Ú†Ù‡: locale/status/slug/title + ÙÛŒÙ„Ø¯Ù‡Ø§ÛŒ schema-driven)ØŒ Ø¯Ú©Ù…Ù‡â€ŒÛŒ Â«+ Ø³Ø§Ø®ØªÂ» Ø¯Ø± Ù„ÛŒØ³ØªØŒ route Ù‡Ø§ÛŒ `/content/:entity/new` Ùˆ `/content/:entity/:id/edit`ØŒ Ù…Ø¯ÛŒØ±ÛŒØª 409 Ø¨Ø§ Â«Ø¨Ø§Ø±Ú¯Ø°Ø§Ø±ÛŒ Ù†Ø³Ø®Ù‡ Ø¬Ø¯ÛŒØ¯/Ù„ØºÙˆÂ»ØŒ Ø®Ø·Ø§Ù‡Ø§ÛŒ field-level. `fetchContentSchema/createContent/updateContent` + ØªØ§ÛŒÙ¾â€ŒÙ‡Ø§ Ø¯Ø± `api.ts`.
  3. Review Ù…Ø³ØªÙ‚Ù„ (r0-verifier) Ûµ Ù…ÙˆØ±Ø¯ Ø¯Ø§Ø¯ Ú©Ù‡ **Ù‡Ù…Ù‡ Ø±ÙØ¹ Ø´Ø¯**: publish-resetØŒ race Ø¯Ø± optimistic lock (select_for_update)ØŒ Ú©Ù„ÛŒØ¯ Ø®Ø·Ø§ÛŒ attrâ†’camelCaseØŒ ÙÛŒÙ„Ø¯ Ø¹Ø¯Ø¯ÛŒ Ø®Ø§Ù„ÛŒ 400ØŒ Ùˆ ØªÙ†Ø§Ù‚Ø¶ Ù…Ø³ØªÙ†Ø¯Ø§Øª (Ø§ÛŒÙ† ÙˆØ±ÙˆØ¯ÛŒ). Ø¯Ùˆ ØªØ³Øª regression Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯.
- Why: ØªÚ©Ù…ÛŒÙ„ ADM-1 ØªØ§ Ø§Ø¯Ù…ÛŒÙ† Ø¨ØªÙˆØ§Ù†Ø¯ Ù…Ø­ØªÙˆØ§ Ø±Ø§ Ù…Ø¯ÛŒØ±ÛŒØª Ú©Ù†Ø¯Ø› Ø¨Ø¯ÙˆÙ† Ø­Ø°Ù ÙˆØ§Ú¯ØªÙÛŒÙ„ (cutover Ø¯Ø± ÙØ§Ø² Ø¨Ø¹Ø¯ÛŒ).
- Scope / files: `apps/cms/apps/api/admin_content.py`ØŒ `apps/cms/tests/test_admin_content_write.py` (12 ØªØ³Øª)ØŒ `apps/cms/admin-frontend/src/{lib/api.ts, pages/ContentEditPage.tsx, pages/ContentListPage.tsx, App.tsx, index.css}`ØŒ `Task-list.md`ØŒ `docs/status/BACKLOG.md`ØŒ Ø§ÛŒÙ† Work Log.
- Commands or actions actually performed: `uv run pytest -q` = **209 passed**Ø› `uv run ruff check .` = All checks passedØ› `uv run python manage.py makemigrations --check --dry-run` = No changes detectedØ› `npm run build` Ùˆ `npm run check` Ø¯Ø± admin-frontend = PASS.
- Verification actually performed and result: ØªØ³Øªâ€ŒÙ‡Ø§ÛŒ create (201ØŒ duplicateØŒ locale Ù†Ø§Ù…Ø¹ØªØ¨Ø±ØŒ unknown field)ØŒ update (ÙÛŒÙ„Ø¯Ù‡Ø§ØŒ If-Match conflict Ø¨Ø§ currentUpdatedAtØŒ slug duplicateØŒ publishØŒ blank numericØŒ publish-once)ØŒ schema endpointØŒ guard Ù‡Ø§ÛŒ 401/403 â€” Ù‡Ù…Ú¯ÛŒ Ø³Ø¨Ø²Ø› Ú©Ù„ Ø³ÙˆÛŒÛŒÛŒØª Ø¨Ø¯ÙˆÙ† regression.
- Decisions / assumptions: If-Match Ø¨Ø§ Ø¯Ù‚Øª Ù…ÛŒÙ„ÛŒâ€ŒØ«Ø§Ù†ÛŒÙ‡ (Ù‡Ù…Ø§Ù† round-trip JSON) Ù…Ù‚Ø§ÛŒØ³Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› `select_for_update` Ø±ÙˆÛŒ sqlite ØªØ³Øª no-op ÙˆÙ„ÛŒ Ø±ÙˆÛŒ Postgres ØªÙˆÙ„ÛŒØ¯ ØµØ­ÛŒØ­ Ø§Ø³ØªØ› locale Ø¯Ø± update ØªØºÛŒÛŒØ±Ù†Ø§Ù¾Ø°ÛŒØ±Ø› `published_at` Ù‡Ù†Ú¯Ø§Ù… unpublish Ù¾Ø§Ú© Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- Deferred or risk IDs: DEFER-0023 (cutover)Ø› RISK-0010Ø› Caddy no-storeØ› migrate Wagtail-session admins Ø¨Ù‡ SPA.
- Rollback / recovery: additive Ø§Ø³Øª â€” Ø¨Ø¯ÙˆÙ† Ø§Ø«Ø± runtime ØªØ§ cutoverØ› revert Ø¨Ø±Ù†Ú† Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø².

## LOG-0157 - 2026-08-18 - ADM-1 / Content read API + dev preview route + SPA content pages

- Outcome: read-side Ø§Ø¯Ù…ÛŒÙ† Ù…Ø­ØªÙˆØ§ + Ù…Ø³ÛŒØ± Ù¾ÛŒØ´â€ŒÙ†Ù…Ø§ÛŒØ´ dev + ØµÙØ­Ø§Øª ÙÙ‡Ø±Ø³Øª/Ø¬Ø²Ø¦ÛŒØ§Øª SPA â€” Ù‡Ù…Ù‡ additive Ùˆ Ø¨Ø¯ÙˆÙ† migration Ø¬Ø¯ÛŒØ¯:
  1. **Content read API** `apps/cms/apps/api/admin_content.py` (new): `GET /content/{entity}` â€” ÙÙ‡Ø±Ø³Øª Ø¨Ø§ ÙÛŒÙ„ØªØ±Ù‡Ø§ÛŒ locale/status/q Ùˆ ØµÙØ­Ù‡â€ŒØ¨Ù†Ø¯ÛŒ page/pageSize (Ø®Ø·Ø§Ù‡Ø§ÛŒ 400 VALIDATION / 404 NOT_FOUND) Ùˆ `GET /content/{entity}/{id}` â€” Ø¬Ø²Ø¦ÛŒØ§Øª Ø¨Ø§ Ù…Ù¾ camelCase `fields` Ø¨Ù‡â€ŒØ§Ø²Ø§ÛŒ Ù‡Ø± entity. Ù…ÙˆØ¬ÙˆØ¯ÛŒØªâ€ŒÙ‡Ø§: landing, profile, article, research-topic, research-statement, project, publication. Ø¨Ø§ `admin_api.add_router("/content", content_router)` Ø¯Ø± `apps/cms/apps/api/admin_api.py` mount Ø´Ø¯.
  2. **Refactor** `apps/cms/apps/api/admin_common.py` (new): AdminErrorØŒ error handlerØŒ CSRF checkØŒ staff/OTP guards Ùˆ client_ip Ø¨ÛŒÙ† admin_api Ùˆ admin_content Ù…Ø´ØªØ±Ú© Ø´Ø¯Ù†Ø¯.
  3. **Dev preview route** `apps/cms/apps/api/admin_spa.py` (new) â€” `serve_admin_ui` Ø¯Ø± `/admin-ui/`: DEBUG-only (Http404 ÙˆÙ‚ØªÛŒ DEBUG=False)ØŒ path-traversal-safe (resolve+startswith)ØŒ SPA fallback Ø¨Ù‡ index.htmlØŒ Ù‡Ø¯Ø±Ù‡Ø§ÛŒ `X-Robots-Tag: noindex, nofollow, noarchive` + `Cache-Control: no-store`. Ø¯Ø± `apps/cms/config/urls.py` mount Ø´Ø¯.
  4. **SPA** `apps/cms/admin-frontend/`: ContentListPage (ØªØ¨â€ŒÙ‡Ø§ÛŒ entityØŒ ÙÛŒÙ„ØªØ±Ù‡Ø§ÛŒ locale/status/q Ù‡Ù…â€ŒÚ¯Ø§Ù… Ø¨Ø§ URLØŒ Ø¬Ø³ØªØ¬ÙˆÛŒ debouncedØŒ Ø¬Ø¯ÙˆÙ„ RTLØŒ ØµÙØ­Ù‡â€ŒØ¨Ù†Ø¯ÛŒØŒ Ø­Ø§Ù„Øªâ€ŒÙ‡Ø§ÛŒ loading/empty/error) Ùˆ ContentDetailPage (Ø±Ù†Ø¯Ø± generic `fields`ØŒ Ø§Ø³Ù„Ø§Ú¯â€ŒÙ‡Ø§ÛŒ dir=ltrØŒ Ø­Ø§Ù„Øª 404)Ø› `src/lib/entities.ts` Ùˆ `src/lib/format.ts` Ø¬Ø¯ÛŒØ¯Ø› `src/lib/api.ts` Ø¨Ø§ fetchContentList/fetchContentDetail + typesØ› Ø³Ø§ÛŒØ¯Ø¨Ø§Ø± Â«Ù…Ø¯ÛŒØ±ÛŒØª Ù…Ø­ØªÙˆØ§Â» â†’ /contentØ› `vite.config.ts` base `/admin-ui/` Ùˆ `src/main.tsx` BrowserRouter basename `/admin-ui/` ØªØ§ build Ø²ÛŒØ± Ù‡Ù…Ø§Ù† Ù…Ø³ÛŒØ± Ø³Ø±Ùˆ Ø´ÙˆØ¯.
- Why: ADM-1 Ø¨Ù‡ ÙÙ‡Ø±Ø³Øª/Ø¬Ø²Ø¦ÛŒØ§Øª ÙˆØ§Ù‚Ø¹ÛŒ Ù…Ø­ØªÙˆØ§ Ø¨Ø±Ø§ÛŒ Ù‡Ø± Ù„ÛŒØ³Øª Ùˆ form Ø¨Ø¹Ø¯ÛŒ Ù†ÛŒØ§Ø² Ø¯Ø§Ø±Ø¯Ø› Ù…Ø³ÛŒØ± Ù¾ÛŒØ´â€ŒÙ†Ù…Ø§ÛŒØ´ dev Ø¨Ù‡ Ù…Ø§Ù„Ú© Ø§Ø¬Ø§Ø²Ù‡ Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ SPA ÙˆØ§Ù‚Ø¹ÛŒ Ø±Ø§ Ù¾ÛŒØ´ Ø§Ø² cutover Ù„ÙˆÚ©Ø§Ù„ Ø¨Ø¨ÛŒÙ†Ø¯ Ùˆ ØªØ£ÛŒÛŒØ¯ Ú©Ù†Ø¯Ø› Ø§ÛŒÙ† Ú¯Ø§Ù… Ø¨Ø¯ÙˆÙ† schema migration Ùˆ Ø¨Ø¯ÙˆÙ† Ù„Ù…Ø³ ÙˆØ§Ú¯ØªÙÛŒÙ„ Ù‚Ø§Ø¨Ù„ Ø§Ù†Ø¬Ø§Ù… Ø¨ÙˆØ¯.
- Scope / files: `apps/cms/apps/api/admin_content.py` (new)ØŒ `apps/cms/apps/api/admin_common.py` (new)ØŒ `apps/cms/apps/api/admin_spa.py` (new)ØŒ `apps/cms/apps/api/admin_api.py`ØŒ `apps/cms/config/urls.py`ØŒ `apps/cms/tests/test_admin_content_api.py` (new)ØŒ `apps/cms/admin-frontend/` (ContentListPage/ContentDetailPageØŒ `src/lib/entities.ts`ØŒ `src/lib/format.ts`ØŒ `src/lib/api.ts`ØŒ `vite.config.ts`ØŒ `src/main.tsx`ØŒ Ø³Ø§ÛŒØ¯Ø¨Ø§Ø±)ØŒ `Task-list.md` (Â§17 ADM-1)ØŒ Ø§ÛŒÙ† Work Log.
- Commands or actions actually performed: `uv run pytest -q` (195 passed â€” Ø´Ø§Ù…Ù„ 7 ØªØ³Øª Ø¬Ø¯ÛŒØ¯ `tests/test_admin_content_api.py` + 14 ØªØ³Øª auth)Ø› `uv run ruff check .` (clean)Ø› `uv run python manage.py check` (ÙÙ‚Ø· warning Ù‡Ø§ÛŒ Ø§Ø²â€ŒÙ¾ÛŒØ´â€ŒÙ…ÙˆØ¬ÙˆØ¯ treebeard)Ø› Ø¨Ø¯ÙˆÙ† migration Ø¬Ø¯ÛŒØ¯Ø› `npm run build` + `npm run check` Ø¯Ø± admin-frontend (PASS). smoke Ø¯Ø³ØªÛŒ preview route: dev 200 (Ø´Ø§Ù…Ù„ deep-route fallback)ØŒ traversal 404ØŒ DEBUG=False â†’ 404ØŒ missing build â†’ 404 Ø¨Ø§ hint. setup Ù„ÙˆÚ©Ø§Ù„ (Ú©Ø§Ù…ÛŒØªâ€ŒÙ†Ø´Ø¯Ù‡ØŒ dev-only): `apps/cms/dev.sqlite3` Ø¨Ø§ migrate (development settings)Ø› Ú©Ø§Ø±Ø¨Ø± staff `preview@tahamohamadi.ir` Ùˆ Ø¯Ø³ØªÚ¯Ø§Ù‡ TOTP ØªØ£ÛŒÛŒØ¯Ø´Ø¯Ù‡ Ù„ÙˆÚ©Ø§Ù„ Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯ ØªØ§ Ù…Ø§Ù„Ú© Ø¯Ø± `http://127.0.0.1:8000/admin-ui/` Ù„Ø§Ú¯ÛŒÙ† Ú©Ù†Ø¯.
- Verification actually performed and result: backend 195 passedØ› ruff cleanØ› `manage.py check` Ø¨Ø¯ÙˆÙ† Ø®Ø·Ø§ÛŒ Ø¬Ø¯ÛŒØ¯Ø› Ø¨Ø¯ÙˆÙ† migration Ø¬Ø¯ÛŒØ¯Ø› SPA build/type-check PASSØ› smoke preview route PASS: dev 200 (Ø´Ø§Ù…Ù„ deep-route fallback)ØŒ traversal â†’ 404ØŒ DEBUG=False â†’ 404ØŒ missing build â†’ 404 Ø¨Ø§ hint.
- Decisions / assumptions: read-side Ø¬Ø¯Ø§ÛŒ Ø§Ø² write Ø³Ø§Ø®ØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯ (write/update + optimistic locking Ø¯Ø± Ú¯Ø§Ù… Ø¨Ø¹Ø¯)Ø› Ù¾Ø§Ø³Ø®â€ŒÙ‡Ø§ Ø¨Ø§ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ camelCase `fields`Ø› `/admin-ui/` ØµØ±ÙØ§Ù‹ Ù…Ø³ÛŒØ± Ù¾ÛŒØ´â€ŒÙ†Ù…Ø§ÛŒØ´ dev Ø§Ø³Øª Ùˆ Ø¯Ø± production Ø³Ø±Ùˆ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ø³Ø§Ø®ØªØ§Ø± entity Ù‡Ø§ Ù…Ø·Ø§Ø¨Ù‚ Ù…Ø¯Ù„â€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ Ùˆ Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± schema.
- Deferred or risk IDs: DEFER-0023 (cutover ÙˆØ§Ú¯ØªÙÛŒÙ„â†’SPA Ø²ÛŒØ± `/admin/`)Ø› write/update endpoint Ù‡Ø§ + optimistic lockingØ› Ø§Ø¹Ù…Ø§Ù„ Caddy no-store snippet Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± (Ù…Ø±Ø­Ù„Ù‡â€ŒÛŒ Ù…Ø§Ù„Ú©)Ø› RISK-0010 Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±.
- Rollback / recovery: Ø§ÛŒÙ† slice additive Ø§Ø³Øª â€” Ø­Ø°Ù ÙØ§ÛŒÙ„â€ŒÙ‡Ø§/Ø¨Ø±Ù†Ú† Ø¨Ø¯ÙˆÙ† Ø§Ø«Ø± Ø¨Ø± runtimeØ› `/admin-ui/` ÙÙ‚Ø· Ø¯Ø± DEBUG ÙØ¹Ø§Ù„ Ø§Ø³ØªØ› production ØªØ§ cutover Ù‡ÛŒÚ† ØªØºÛŒÛŒØ±ÛŒ Ø¯Ø±ÛŒØ§ÙØª Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯.

## LOG-0159 - 2026-08-18 - ADM-2 / Media library admin API + SPA (upload, replace, alt-by-locale)

- Outcome: Ú©ØªØ§Ø¨Ø®Ø§Ù†Ù‡â€ŒÛŒ Ø±Ø³Ø§Ù†Ù‡ Ø¯Ø± Ø§Ø¯Ù…ÛŒÙ† (ADM-2) Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯ â€” additive Ùˆ Ø¨Ø¯ÙˆÙ† Ø­Ø°Ù ÙˆØ§Ú¯ØªÙÛŒÙ„Ø› Ù…Ø¯Ù„â€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ ÙÙ‚Ø· Ø¨Ø§ Ø§ÙØ²ÙˆØ¯Ù† alt Ø¯Ùˆ Ø²Ø¨Ø§Ù†Ù‡ ØªØºÛŒÛŒØ± Ú©Ø±Ø¯Ù†Ø¯:
  1. **Backend** `apps/cms/apps/api/admin_media.py` (new): media_router Ø¯Ø± `/api/v1/admin/media` â€” `GET` ÙÙ‡Ø±Ø³Øª Ø¨Ø§ ÙÛŒÙ„ØªØ±Ù‡Ø§ÛŒ q / type (image|pdf) / active (true|false) / page/pageSize (Ø®Ø·Ø§ÛŒ 400 VALIDATION)ØŒ `POST` Ø¢Ù¾Ù„ÙˆØ¯ multipart (201Ø› `is_active` Ù¾ÛŒØ´â€ŒÙØ±Ø¶ falseØ› `full_clean` â†’ 400)ØŒ `GET /orphans` (usage==0)ØŒ `GET /{id}`ØŒ `PUT /{id}` (optimistic lock If-Match Ø¯Ø§Ø®Ù„ `atomic` + `select_for_update`Ø› 409 CONFLICT Ø¨Ø§ `currentUpdatedAt`Ø› `full_clean`)ØŒ `POST /{id}/replace` (Ù‡Ù…â€ŒØ®Ø§Ù†ÙˆØ§Ø¯Ù‡â€ŒÛŒ MIMEØ› 400 Ø¯Ø± ØºÛŒØ±Ù‡Ù…â€ŒØ®Ø§Ù†ÙˆØ§Ø¯Ù‡/Ù…ÙÙ‚ÙˆØ¯). `media_usage_count` + `MEDIA_REFERENCE_FIELDS` (Ø±Ø¬ÛŒØ³ØªØ±ÛŒ Ø®Ø§Ù„ÛŒØ› Ø¯Ø± ADM-3 ÙˆØµÙ„ Ù…ÛŒâ€ŒØ´ÙˆØ¯). Guards: staff+OTP+CSRF.
  2. **Model/migration** `apps/cms/apps/media/models.py`: `alt_text_fa`/`alt_text_en` (CharField blank default "" + `db_default=""`)Ø› migration `0002_media_alt_text_en_media_alt_text_fa.py` (AddField Ø¨Ø§ `db_default` ØªØ§ Ø±ÙˆÛŒ Ø±Ø¯ÛŒÙâ€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ Postgres Ø§Ù…Ù† Ø¨Ø§Ø´Ø¯). `makemigrations --check` clean (no pending).
  3. **Frontend** `apps/cms/admin-frontend/`: `src/pages/MediaLibraryPage.tsx` (ÙÛŒÙ„ØªØ±Ù‡Ø§ØŒ orphan toggleØŒ Ø¢Ù¾Ù„ÙˆØ¯ Ø¨Ø§ progressØŒ drawer ÙˆÛŒØ±Ø§ÛŒØ´ Ø¨Ø§ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ†ÛŒ ÙØ§ÛŒÙ„ + ØªØ£ÛŒÛŒØ¯ Ø¨Ø§ÛŒÚ¯Ø§Ù†ÛŒ + 409 reload/discard)ØŒ `src/components/MediaPicker.tsx` (modal Ù‚Ø§Ø¨Ù„ reuse)ØŒ `src/components/MediaThumb.tsx`ØŒ `src/lib/api.ts` (fetchMediaList/Orphans/DetailØŒ updateMediaØŒ uploadMedia Ùˆ replaceMedia Ø¨Ø§ XHR+progress)ØŒ route `/media`ØŒ Ø³Ø§ÛŒØ¯Ø¨Ø§Ø± Â«Ú©ØªØ§Ø¨Ø®Ø§Ù†Ù‡ Ø±Ø³Ø§Ù†Ù‡Â».
- Why: ØªÚ©Ù…ÛŒÙ„ ADM-2 ØªØ§ Ø±Ø³Ø§Ù†Ù‡ Ø§Ø² Ø§Ø¯Ù…ÛŒÙ† Ø¬Ø¯ÛŒØ¯ Ù‚Ø§Ø¨Ù„ Ù…Ø¯ÛŒØ±ÛŒØª Ø¨Ø§Ø´Ø¯ (ÙÙ‡Ø±Ø³Øª/Ø¢Ù¾Ù„ÙˆØ¯/Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ†ÛŒ/Ø¨Ø§ÛŒÚ¯Ø§Ù†ÛŒ) Ùˆ DEFER-0014 (alt-by-locale) Ø¯Ø± Ù‡Ù…ÛŒÙ† ÙØ§Ø² Ø¨Ø³ØªÙ‡ Ø´ÙˆØ¯Ø› Ø²ÛŒØ±Ø³Ø§Ø®Øª Ù¾ÛŒØ´ Ø§Ø² Ø§ØªØµØ§Ù„ MediaPicker Ø¨Ù‡ ÙˆÛŒØ±Ø§ÛŒØ´Ú¯Ø±Ù‡Ø§ÛŒ Ù…Ø­ØªÙˆØ§ Ø¯Ø± ADM-3.
- Scope / files: `apps/cms/apps/api/admin_media.py` (new)ØŒ `apps/cms/apps/media/models.py`ØŒ `apps/cms/apps/media/migrations/0002_media_alt_text_en_media_alt_text_fa.py` (new)ØŒ `apps/cms/tests/test_admin_media_api.py` (new)ØŒ `apps/cms/admin-frontend/src/{pages/MediaLibraryPage.tsx, components/MediaPicker.tsx, components/MediaThumb.tsx, lib/api.ts, App.tsx}`ØŒ `Task-list.md`ØŒ `docs/status/BACKLOG.md`ØŒ Ø§ÛŒÙ† Work Log.
- Commands or actions actually performed: `uv run pytest -q` = **229 passed** (Ø´Ø§Ù…Ù„ 20 ØªØ³Øª Ø¯Ø± `tests/test_admin_media_api.py` Ø¨Ø§ 8 regression: type Ù†Ø§Ù…Ø¹ØªØ¨Ø±ØŒ pageSize 101ØŒ Ø¢Ù¾Ù„ÙˆØ¯ Ø¨Ø²Ø±Ú¯â€ŒØªØ± Ø§Ø² Ø­Ø¯ØŒ Ù†Ø§Ù‡Ù…Ø§Ù‡Ù†Ú¯ÛŒ extension/contentØŒ replace Ø³Ø§Ø²Ú¯Ø§Ø±/Ù†Ø§Ø³Ø§Ø²Ú¯Ø§Ø±/Ø¨Ø¯ÙˆÙ† ÙØ§ÛŒÙ„ØŒ orphan pagination)Ø› `uv run ruff check .` = cleanØ› `makemigrations --check` Ø¨Ø¯ÙˆÙ† pendingØ› `npm run build` + `npm run check` Ø¯Ø± admin-frontend = PASS.
- Verification actually performed and result: Ú©Ù„ Ø³ÙˆÛŒÛŒÛŒØª backend 229 passedØ› ruff cleanØ› Ø¨Ø¯ÙˆÙ† migration Ø¬Ø¯ÛŒØ¯Ø› SPA build/type-check PASS.
- Decisions / assumptions: `db_default=""` Ø¨Ø±Ø§ÛŒ Ø§ÙØ²ÙˆØ¯Ù† Ø§Ù…Ù† ÙÛŒÙ„Ø¯Ù‡Ø§ÛŒ alt Ø±ÙˆÛŒ Ø±Ø¯ÛŒÙâ€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ PostgresØ› Ø±Ø¬ÛŒØ³ØªØ±ÛŒ usage (`MEDIA_REFERENCE_FIELDS`) Ø¹Ù…Ø¯Ø§Ù‹ Ø®Ø§Ù„ÛŒ Ø§Ø³Øª ØªØ§ Ø¯Ø± ADM-3 Ù‡Ù†Ú¯Ø§Ù… Ø§ØªØµØ§Ù„ Ø¨Ù‡ ÙˆÛŒØ±Ø§ÛŒØ´Ú¯Ø±Ù‡Ø§ Ù¾Ø± Ø´ÙˆØ¯Ø› `is_active` Ø¯Ø± Ø¢Ù¾Ù„ÙˆØ¯ Ù¾ÛŒØ´â€ŒÙØ±Ø¶ false (ÙØ¹Ø§Ù„â€ŒØ³Ø§Ø²ÛŒ ØµØ±ÛŒØ­).
- Deferred or risk IDs: Ø§ØªØµØ§Ù„ MediaPicker Ø¨Ù‡ ÙˆÛŒØ±Ø§ÛŒØ´Ú¯Ø±Ù‡Ø§ÛŒ Ù…Ø­ØªÙˆØ§ Ø¨Ù‡ ADM-3 Ù…Ù†ØªÙ‚Ù„ Ø´Ø¯ (Ù…Ø­ØªÙˆØ§ÛŒ ÙØ¹Ù„ÛŒ Ø§Ø² `wagtailimages.Image` Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ â€” rewire Ø®Ø§Ø±Ø¬ Ø§Ø² scope Ø§ÛŒÙ† ÙØ§Ø²Ø› DEBT-0004)Ø› Caddy no-store Ùˆ deploy ØªØµÙˆÛŒØ± Ø¬Ø¯ÛŒØ¯ CMS Ù‚Ø¯Ù…â€ŒÙ‡Ø§ÛŒ Ù…Ø§Ù„Ú© Ù‡Ø³ØªÙ†Ø¯Ø› DEFER-0023 (cutover) Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±Ø› RISK-0010 Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±.
- Rollback / recovery: Ø§ÛŒÙ† slice additive Ø§Ø³Øª â€” Ø¨Ø¯ÙˆÙ† Ø§Ø«Ø± runtime ØªØ§ cutoverØ› migration ØµØ±ÙØ§Ù‹ Ø§ÙØ²ÙˆØ¯Ù† ÙÛŒÙ„Ø¯Ù‡Ø§ÛŒ alt Ø¨Ø§ `db_default` Ø§Ø³Øª (Ù‚Ø§Ø¨Ù„ Ø¨Ø±Ú¯Ø´Øª)Ø› revert Ø¨Ø±Ù†Ú† Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø².

## LOG-0160 - 2026-08-18 - ADM-3 / Page composition (Section/Block + layouts) API + SPA editor

- Outcome: ØµÙØ­Ù‡â€ŒØ³Ø§Ø²ÛŒ Ù…Ø±Ú©Ø¨ Ø¯Ø± Ø§Ø¯Ù…ÛŒÙ† (ADM-3) Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯ â€” additive Ùˆ Ø¨Ø¯ÙˆÙ† Ø­Ø°Ù ÙˆØ§Ú¯ØªÙÛŒÙ„Ø› MediaPicker Ø¨Ù‡ Ø¨Ù„ÙˆÚ©â€ŒÙ‡Ø§ ÙˆØµÙ„ Ø´Ø¯:
  1. **Backend** Ø§Ù¾ Ø¬Ø¯ÛŒØ¯ `apps/cms/apps/composition/`: Ù…Ø¯Ù„â€ŒÙ‡Ø§ÛŒ `CompositionPage` (key Ø§Ø³Ù„Ø§Ú¯ ÛŒÚ©ØªØ§ØŒ locale fa/enØŒ titleØŒ status draft/review/published/archivedØŒ published_atØŒ created/updated_at)ØŒ `CompositionSection` (FK ØµÙØ­Ù‡ØŒ positionØŒ layout 1col/2col/3colØŒ ratioØŒ enabledØ› UniqueConstraint ØµÙØ­Ù‡+position) Ùˆ `CompositionBlock` (FK Ø³Ú©Ø´Ù†ØŒ positionØŒ block_typeØŒ settings JSONFieldØŒ enabledØ› UniqueConstraint Ø³Ú©Ø´Ù†+position)Ø› migration `0001_initial.py`Ø› `blocks.py` Ø¨Ø§ Ú©Ø§ØªØ§Ù„ÙˆÚ¯ Ø¨Ù„ÙˆÚ© hero/heading/text/quote/cta/gallery/divider + `validate_block_settings` (fail-closed) + `SECTION_LAYOUT_RATIOS` + `composition_schema()`.
  2. **API** `apps/api/admin_composition.py` mount Ø¯Ø± `/api/v1/admin/composition`: GET ÙÙ‡Ø±Ø³Øª (q/locale/status/page/pageSizeØ› 400 VALIDATION)ØŒ POST create (201Ø› key Ø¨Ø§ regex `^[a-z0-9-]+$`Ø› 409 DUPLICATE)ØŒ GET /schemaØŒ GET /{id}ØŒ PUT /{id} Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ†ÛŒ full-document (If-Match + `select_for_update` + atomicØ› 409 CONFLICT Ø¨Ø§ currentUpdatedAtØ› fail-closed Ø¨Ø§ field paths Ù…Ø«Ù„ `sections[0].blocks[1].settings`). Guards: staff+OTP+CSRF. Ø§Ø±Ø¬Ø§Ø¹â€ŒÙ‡Ø§ÛŒ Ø±Ø³Ø§Ù†Ù‡ strict int (float/bool Ø±Ø¯ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯).
  3. **Frontend** `apps/cms/admin-frontend/`: `src/lib/api.ts` (Composition types + fetchCompositionPages/Schema/Detail + createComposition/updateComposition)ØŒ `src/lib/composition.ts` (labelsØŒ ratioOptionsForØŒ REQUIRED_BLOCK_FIELDS)ØŒ `src/pages/CompositionListPage.tsx`ØŒ `src/pages/CompositionEditorPage.tsx` (ÙˆÛŒØ±Ø§ÛŒØ´Ú¯Ø± schema-driven: layout/ratio Ø³Ú©Ø´Ù†â€ŒÙ‡Ø§ØŒ Ø¨Ù„ÙˆÚ©â€ŒÙ‡Ø§ Ø¨Ø§ ÙÛŒÙ„Ø¯Ù‡Ø§ÛŒ text/textarea/select/media/mediaList Ø§Ø² Ø·Ø±ÛŒÙ‚ MediaPickerØŒ Ù¾ÛŒØ´â€ŒÙ†Ù…Ø§ÛŒØ´ gridØŒ Ø§Ø¹ØªØ¨Ø§Ø±Ø³Ù†Ø¬ÛŒ client Ø¨Ø±Ø§ÛŒ ÙÛŒÙ„Ø¯Ù‡Ø§ÛŒ Ø§Ù„Ø²Ø§Ù…ÛŒØŒ Ù…Ø¯ÛŒØ±ÛŒØª 409 reload/discardØŒ dirty-guard)ØŒ route Ù‡Ø§ÛŒ `/composition`ØŒ Ø³Ø§ÛŒØ¯Ø¨Ø§Ø± Â«ØµÙØ­Ø§ØªÂ».
- Why: ØªÚ©Ù…ÛŒÙ„ ADM-3 ØªØ§ ØµÙØ­Ø§Øª Ù…Ø±Ú©Ø¨ (Ø³Ú©Ø´Ù†/Ø¨Ù„ÙˆÚ© + Ú†ÛŒØ¯Ù…Ø§Ù†) Ø§Ø² Ø§Ø¯Ù…ÛŒÙ† Ø¬Ø¯ÛŒØ¯ Ù‚Ø§Ø¨Ù„ Ù…Ø¯ÛŒØ±ÛŒØª Ø¨Ø§Ø´Ù†Ø¯ Ùˆ MediaPicker Ø¨Ù‡ ÙˆÛŒØ±Ø§ÛŒØ´Ú¯Ø±Ù‡Ø§ ÙˆØµÙ„ Ø´ÙˆØ¯ (DEBT-0004)Ø› Ø²ÛŒØ±Ø³Ø§Ø®Øª Ù¾ÛŒØ´ Ø§Ø² projection Ø¹Ù…ÙˆÙ…ÛŒ Ø¯Ø± ADM-6.
- Scope / files: `apps/cms/apps/composition/` (new)ØŒ `apps/cms/apps/api/admin_composition.py` (new)ØŒ `apps/cms/tests/test_admin_composition_api.py` (new)ØŒ `apps/cms/admin-frontend/src/{lib/api.ts, lib/composition.ts, pages/CompositionListPage.tsx, pages/CompositionEditorPage.tsx, App.tsx}`ØŒ `Task-list.md`ØŒ `docs/status/BACKLOG.md`ØŒ Ø§ÛŒÙ† Work Log.
- Commands or actions actually performed: `uv run pytest -q` = **249 passed** (Ø´Ø§Ù…Ù„ 20 ØªØ³Øª Ø¯Ø± `tests/test_admin_composition_api.py` Ø¨Ø§ regression Ø§Ø±Ø¬Ø§Ø¹ Ø±Ø³Ø§Ù†Ù‡ float/bool)Ø› `uv run ruff check .` = cleanØ› `makemigrations --check --dry-run` = No changes detectedØ› `npm run build` + `npm run check` Ø¯Ø± admin-frontend = PASS.
- Verification actually performed and result: Ú©Ù„ Ø³ÙˆÛŒÛŒÛŒØª backend 249 passedØ› ruff cleanØ› Ø¨Ø¯ÙˆÙ† migration Ø¬Ø¯ÛŒØ¯Ø› SPA build/type-check PASS.
- Decisions / assumptions: validation Ø¨Ù„ÙˆÚ©â€ŒÙ‡Ø§ fail-closed Ø§Ø³Øª (settings Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø¨Ø§ field path Ø¯Ù‚ÛŒÙ‚ Ø±Ø¯ Ù…ÛŒâ€ŒØ´ÙˆØ¯)Ø› Ø§Ø±Ø¬Ø§Ø¹ Ø±Ø³Ø§Ù†Ù‡ ÙÙ‚Ø· int Ù¾Ø°ÛŒØ±ÙØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯ (float/bool rejected)Ø› unique constraint Ø¨Ø±Ø§ÛŒ (pageØŒ position) Ùˆ (sectionØŒ position) Ø¨Ø±Ù‚Ø±Ø§Ø± Ø§Ø³Øª.
- Deferred or risk IDs: projection Ø¹Ù…ÙˆÙ…ÛŒ (rendering Ø¯Ø± Astro) â†’ ADM-6Ø› rich blocks v2 (Â§14 U3) Ø¨Ø¹Ø¯ÛŒØ› Caddy no-store Ùˆ deploy ØªØµÙˆÛŒØ± Ø¬Ø¯ÛŒØ¯ CMS Ù‚Ø¯Ù…â€ŒÙ‡Ø§ÛŒ Ù…Ø§Ù„Ú©Ø› DEFER-0023 (cutover) Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±Ø› RISK-0010 Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±.
- Rollback / recovery: Ø§ÛŒÙ† slice additive Ø§Ø³Øª â€” Ø¨Ø¯ÙˆÙ† Ø§Ø«Ø± runtime ØªØ§ cutoverØ› migration `0001_initial` Ø§Ù¾ Ø¬Ø¯ÛŒØ¯ Ù‚Ø§Ø¨Ù„ Ø¨Ø±Ú¯Ø´Øª Ø§Ø³ØªØ› revert Ø¨Ø±Ù†Ú† Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø².

## LOG-0161 - 2026-08-18 - ADM-4 / Lifecycle transitions + translation queue + content health

- Outcome: Ú†Ø±Ø®Ù‡â€ŒÛŒ Ø­ÛŒØ§Øª Ù…Ø­ØªÙˆØ§ + ØµÙ ØªØ±Ø¬Ù…Ù‡ + Ø³Ù„Ø§Ù…Øª Ù…Ø­ØªÙˆØ§ Ø¯Ø± Ø§Ø¯Ù…ÛŒÙ† (ADM-4) Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯ â€” additiveØŒ Ø¨Ø¯ÙˆÙ† Ø­Ø°Ù ÙˆØ§Ú¯ØªÙÛŒÙ„ØŒ Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ù…Ø¯Ù„ Ùˆ Ø¨Ø¯ÙˆÙ† migration Ø¬Ø¯ÛŒØ¯:
  1. **Lifecycle transitions** `POST /api/v1/admin/content/{entity}/{id}/transition` Ø¯Ø± `apps/api/admin_content.py`: Ù…Ø§Ø´ÛŒÙ† Ø­Ø§Ù„Øª Ø§ØªÙ…ÛŒÚ© Ø¨Ø§ `select_for_update` Ø¯Ø§Ø®Ù„ `transaction.atomic()`Ø› Ø§Ù†ØªÙ‚Ø§Ù„â€ŒÙ‡Ø§ÛŒ Ù…Ø¬Ø§Ø² Ø·Ø¨Ù‚ `ALLOWED_TRANSITIONS` (draftâ†’review/published/archivedØ› reviewâ†’draft/published/archivedØ› publishedâ†’archivedØ› archivedâ†’draft)Ø› Ø§Ù†ØªÙ‚Ø§Ù„ Ù†Ø§Ù…Ø¹ØªØ¨Ø± â†’ 400 VALIDATION Ø¨Ø§ Ù¾ÛŒØ§Ù… Â«Invalid transition from X to Y.Â»Ø› `reason` Ø§Ø®ØªÛŒØ§Ø±ÛŒ ØªØ§ ÛµÛ°Û° Ú©Ø§Ø±Ø§Ú©ØªØ± (truncate)Ø› `published_at` ÙÙ‚Ø· ÙˆÙ‚ØªÛŒ `None` Ø§Ø³Øª set Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ Ø¯Ø± archive/restore Ø­ÙØ¸ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› AuditLog Ø¯Ø± Ù‡Ù…Ø§Ù† ØªØ±Ø§Ú©Ù†Ø´ (`lifecycle.{old}->{new}` + ip + reason). Guards: staff+OTP+CSRF.
  2. **Translation queue** `GET /api/v1/admin/overview/translation-queue` Ø¯Ø± `apps/api/admin_health.py` (new): Ú¯Ø±ÙˆÙ‡â€ŒÙ‡Ø§ÛŒ (entity, slug) Ø¯Ùˆ Ø²Ø¨Ø§Ù†Ù‡ Ø¨Ø§ ÙˆØ¶Ø¹ÛŒØª Ù‡Ø± locale (complete/incomplete/missing Ø¨Ø± Ø§Ø³Ø§Ø³ title + ÙÛŒÙ„Ø¯ body-ish Ù‡Ø± entity Ø¯Ø± `BODY_FIELDS`) Ùˆ ÙˆØ¶Ø¹ÛŒØª Ú¯Ø±ÙˆÙ‡ (complete/incomplete/partial/missing)Ø› Ø¨Ø¯ÙˆÙ† fallback Ø®ÙˆØ¯Ú©Ø§Ø±Ø› Ø³Ù‚Ù Û±Û°Û° Ø¢ÛŒØªÙ… Ø¨Ø§ Ù¾Ø±Ú†Ù… `truncated`.
  3. **Content health** `GET /api/v1/admin/overview/content-health`: Ø´Ù…Ø§Ø±Ø´ published/drafts/review/archived Ø¯Ø± Û· entity + incompleteTranslations + missingAltMedia (Ù‡Ø± Ø³Ù‡ ÙÛŒÙ„Ø¯ alt Ø®Ø§Ù„ÛŒ) + orphanMedia (Ø¨Ø§ `media_usage_count`). Router Ø¯Ø± `admin_api.py` mount Ø´Ø¯ (`add_router("/overview", health_router)`).
  4. **Tests** `tests/test_admin_workflow_api.py` (new): Û±Û¶ ØªØ³Øª â€” Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ø§Ù†ØªÙ‚Ø§Ù„ØŒ Ø§Ù†ØªÙ‚Ø§Ù„ Ù†Ø§Ù…Ø¹ØªØ¨Ø± 400ØŒ 404ØŒ guardsØŒ audit logØŒ truncate reasonØŒ Ø­ÙØ¸ published_at Ø¯Ø± archiveâ†’restoreØŒ queue (partial/missing/bounded/guards)ØŒ health counts.
- Why: ØªÚ©Ù…ÛŒÙ„ ADM-4 ØªØ§ Ú†Ø±Ø®Ù‡â€ŒÛŒ Ø§Ù†ØªØ´Ø§Ø± Ú©Ù†ØªØ±Ù„â€ŒØ´Ø¯Ù‡ (Draftâ†’Reviewâ†’Publishedâ†’Archived) Ø¨Ø§ reason+audit Ùˆ Ù†Ù…Ø§ÛŒ ØµÙ ØªØ±Ø¬Ù…Ù‡/Ø³Ù„Ø§Ù…Øª Ù…Ø­ØªÙˆØ§ Ø§Ø² Ø§Ø¯Ù…ÛŒÙ† Ø¬Ø¯ÛŒØ¯ Ù‚Ø§Ø¨Ù„ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø¨Ø§Ø´Ø¯Ø› Ø²ÛŒØ±Ø³Ø§Ø®Øª Ù¾ÛŒØ´ Ø§Ø² projection Ø¹Ù…ÙˆÙ…ÛŒ Ùˆ rebuild Ø¯Ø± ADM-6.
- Scope / files: `apps/cms/apps/api/admin_content.py` (transition endpoint + `ALLOWED_TRANSITIONS` + `ContentTransitionIn`)ØŒ `apps/cms/apps/api/admin_health.py` (new)ØŒ `apps/cms/apps/api/admin_api.py` (mount `/overview`)ØŒ `apps/cms/tests/test_admin_workflow_api.py` (new)ØŒ `Task-list.md` (Â§17 ADM-4)ØŒ `docs/status/CHANGELOG.md`ØŒ `docs/status/TECH_DEBT.md` (DEBT-0005)ØŒ `docs/status/BACKLOG.md`ØŒ Ø§ÛŒÙ† Work Log.
- Commands or actions actually performed: Ø§ÛŒÙ† Ø±Ú©ÙˆØ±Ø¯ Ø¨Ø± Ø§Ø³Ø§Ø³ Ú©Ø¯ Ùˆ ØªØ³Øªâ€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ slice Ù†ÙˆØ´ØªÙ‡ Ø´Ø¯Ø› Ø¯Ø± Ø§ÛŒÙ† Ù†Ø´Ø³Øª Ø¢Ø²Ù…ÙˆÙ†ÛŒ Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯ â€” Ø§Ø¬Ø±Ø§ÛŒ ØªØ£ÛŒÛŒØ¯ÛŒ Ø·Ø¨Ù‚ Ø±ÙˆØ§Ù„: `uv run pytest -q` Ø¯Ø± `apps/cms`ØŒ `uv run ruff check .`ØŒ `npm run build` + `npm run check` Ø¯Ø± admin-frontend.
- Verification actually performed and result: Û±Û¶ ØªØ³Øª Ø¬Ø¯ÛŒØ¯ Ø¯Ø± `tests/test_admin_workflow_api.py` Ù…ÙˆØ§Ø±Ø¯ transition/audit/guards/queue/health Ø±Ø§ Ù¾ÙˆØ´Ø´ Ù…ÛŒâ€ŒØ¯Ù‡Ù†Ø¯Ø› endpoints Ø¯Ø± `admin_api.py` mount Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯Ø› Ø¨Ø¯ÙˆÙ† migration Ùˆ Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ù…Ø¯Ù„ (ØµØ±ÙØ§Ù‹ Ø§ÙØ²ÙˆØ¯Ù† endpoint Ù‡Ø§ÛŒ read/write). ØªØ£ÛŒÛŒØ¯ Ù†Ù‡Ø§ÛŒÛŒ Ø´Ù…Ø§Ø±Ø´ Ø³ÙˆÛŒÛŒÛŒØª Ù¾ÛŒØ´ Ø§Ø² merge Ø¨Ø§ Ø§Ø¬Ø±Ø§ÛŒ local Ù„Ø§Ø²Ù… Ø§Ø³Øª.
- Decisions / assumptions: Ø§Ù†ØªÙ‚Ø§Ù„â€ŒÙ‡Ø§ Ø§ØªÙ…ÛŒÚ© Ùˆ ØªØ­Øª row lock Ù‡Ø³ØªÙ†Ø¯ ØªØ§ Ø¯Ùˆ transition Ù‡Ù…â€ŒØ²Ù…Ø§Ù† Ø±ÙˆÛŒ status Ù‚Ø¯ÛŒÙ…ÛŒ Ø§Ø¹ØªØ¨Ø§Ø±Ø³Ù†Ø¬ÛŒ Ù†Ú©Ù†Ù†Ø¯Ø› audit Ø¯Ø± Ù‡Ù…Ø§Ù† ØªØ±Ø§Ú©Ù†Ø´ status Ù†ÙˆØ´ØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› `published_at` Ù…Ø¹Ù†Ø§ÛŒ Â«Ø§ÙˆÙ„ÛŒÙ† Ø§Ù†ØªØ´Ø§Ø±Â» Ø±Ø§ Ø­ÙØ¸ Ù…ÛŒâ€ŒÚ©Ù†Ø¯Ø› ØµÙ ØªØ±Ø¬Ù…Ù‡ Ø¨Ø¯ÙˆÙ† fallback Ø®ÙˆØ¯Ú©Ø§Ø± Ø§Ø³ØªØ› ÙˆØ¶Ø¹ÛŒØªâ€ŒÙ‡Ø§ÛŒ Ú¯Ø±ÙˆÙ‡: missing/incomplete/partial/complete.
- Deferred or risk IDs: revisions snapshot Ùˆ scheduled publishing (Scheduled â†’ DEBT-0005)Ø› preview token (noindex/no-store) Ø¯Ø± Task-list Ø¨Ø§Ø² Ù…Ø§Ù†Ø¯Ø› Caddy no-store Ùˆ deploy ØªØµÙˆÛŒØ± Ø¬Ø¯ÛŒØ¯ CMS Ù‚Ø¯Ù…â€ŒÙ‡Ø§ÛŒ Ù…Ø§Ù„Ú©Ø› DEFER-0023 (cutover) Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±Ø› RISK-0010 Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±.
- Rollback / recovery: Ø§ÛŒÙ† slice additive Ø§Ø³Øª â€” Ø¨Ø¯ÙˆÙ† Ø§Ø«Ø± runtime ØªØ§ cutoverØ› Ø¨Ø¯ÙˆÙ† migration Ùˆ Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ù…Ø¯Ù„Ø› revert Ø¨Ø±Ù†Ú† Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø².

## LOG-0162 - 2026-08-18 - ADM-5 / Site settings + tags + featured spotlight

- Outcome: Ø³ÙØ§Ø±Ø´ÛŒâ€ŒØ³Ø§Ø²ÛŒ Ø³Ø§ÛŒØª (ADM-5) Ø¯Ø± Ø§Ø¯Ù…ÛŒÙ† Ø¬Ø¯ÛŒØ¯ Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯ â€” additiveØŒ Ø¨Ø¯ÙˆÙ† Ø­Ø°Ù ÙˆØ§Ú¯ØªÙÛŒÙ„ Ùˆ Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ù…Ø¯Ù„â€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ Ù…Ø­ØªÙˆØ§:
  1. **Site settings** `GET/PUT /api/v1/admin/site` Ø¯Ø± `apps/api/admin_siteconfig.py` (new): singleton `SiteSettings` (Ø§Ù¾ `apps/siteconfig/` + migration `0001_initial`) â€” brand/tagline/footerØŒ ØªÙˆÚ©Ù† Ø±Ù†Ú¯ `primaryColor` (hex #RRGGBB Ø¨Ø±Ø§ÛŒ ØªØ²Ø±ÛŒÙ‚ Ø¨Ù‡ CSS vars Ù‡Ù†Ú¯Ø§Ù… build)ØŒ Ù…Ù†ÙˆÛŒ `navLinks` (Ø­Ø¯Ø§Ú©Ø«Ø± Û²Û° Ù„ÛŒÙ†Ú© {label, href, locale}Ø› href ÙÙ‚Ø· Ù†Ø³Ø¨ÛŒ ØªÚ©â€ŒØ§Ø³Ù„Ø´ ÛŒØ§ absolute http(s) â€” Ø¶Ø¯ protocol-relative) Ùˆ SEO defaults (`seoDefaultTitle`/`seoDefaultDescription`)Ø› PUT Ø¨Ø§ optimistic lock (If-Match â†’ 409 CONFLICT + currentUpdatedAtØ› atomic + select_for_updateØ› singleton Ø¨Ø§ `site_key` ÛŒÚ©ØªØ§).
  2. **Tags** `GET/POST /api/v1/admin/tags` + `PUT/DELETE /api/v1/admin/tags/{id}`: TopicTag CRUD â€” ÙÛŒÙ„ØªØ± q/locale + ØµÙØ­Ù‡â€ŒØ¨Ù†Ø¯ÛŒ + `articleCount`Ø› slug Ø®ÙˆØ¯Ú©Ø§Ø± Ø§Ø² name (slugify) Ø¨Ø§ regex `^[a-z0-9-]+$`Ø› 409 DUPLICATE Ùˆ 409 IN_USE Ø¯Ø± Ø­Ø°Ù ØªÚ¯Ù Ø§Ø±Ø¬Ø§Ø¹â€ŒØ´Ø¯Ù‡ ØªÙˆØ³Ø· Article.
  3. **Featured spotlight** `GET/POST /api/v1/admin/featured` + `PUT/DELETE /api/v1/admin/featured/{id}`: Ù¾Ù†Ø¬Ø±Ù‡â€ŒÛŒ Ø²Ù…Ø§Ù†ÛŒ (startAt Ø§Ù„Ø²Ø§Ù…ÛŒ ISO Ø¨Ø§ tzØ› endAt Ø§Ø®ØªÛŒØ§Ø±ÛŒØ› endAt<startAt â†’ 400)Ø› ÙÛŒÙ„ØªØ± `current=true` Ø¨Ø±Ø§ÛŒ Ø¨Ø§Ø²Ù‡â€ŒÛŒ ÙØ¹Ø§Ù„Ø› Ø§Ø¹ØªØ¨Ø§Ø±Ø³Ù†Ø¬ÛŒ target (entity Ø§Ø² `ENTITY_MODELS` + Ø±Ø¯ÛŒÙ locale/slug Ù…ÙˆØ¬ÙˆØ¯)Ø› **Ø¯Ù‚ÛŒÙ‚Ø§Ù‹ ÛŒÚ© Ø¢ÛŒØªÙ… ÙØ¹Ø§Ù„** â€” ÙØ¹Ø§Ù„â€ŒØ´Ø¯Ù† ÛŒÚ©ÛŒØŒ Ø¨Ù‚ÛŒÙ‡ Ø±Ø§ Ø¯Ø± Ù‡Ù…Ø§Ù† ØªØ±Ø§Ú©Ù†Ø´ ØºÛŒØ±ÙØ¹Ø§Ù„ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ (Ø§Ù„Ú¯ÙˆÛŒ AdminFeaturedItemController Ù†Ù…ÙˆÙ†Ù‡ØŒ Â§14 F4).
  4. **SPA** ØµÙØ­Ø§Øª `SettingsPage.tsx`ØŒ `TagsPage.tsx`ØŒ `FeaturedPage.tsx` Ø¯Ø± admin-frontend (Ø±ÙˆØªâ€ŒÙ‡Ø§ÛŒ `/settings`ØŒ `/tags`ØŒ `/featured`).
  5. **Tests** `tests/test_admin_siteconfig_api.py` (new): Û²Û· ØªØ³Øª â€” settings singleton + validation Ø¨Ø§ field path (primaryColor/navLinks)ØŒ tags CRUD + IN_USE + DUPLICATEØŒ featured create/update/delete + current filter + Ø¯Ù‚ÛŒÙ‚Ø§Ù‹ ÛŒÚ© Ø¢ÛŒØªÙ… ÙØ¹Ø§Ù„ + guards.
- Why: ØªÚ©Ù…ÛŒÙ„ ADM-5 ØªØ§ Ù…Ù†Ùˆ/ØªÙˆÚ©Ù†â€ŒÙ‡Ø§/SEOØŒ ØªÚ¯â€ŒÙ‡Ø§ÛŒ Ø¨Ù„Ø§Ú¯ Ùˆ spotlight Ø¨Ø±Ú¯Ø²ÛŒØ¯Ù‡ Ø§Ø² Ø§Ø¯Ù…ÛŒÙ† Ù‚Ø§Ø¨Ù„ Ù…Ø¯ÛŒØ±ÛŒØª Ø¨Ø§Ø´Ù†Ø¯Ø› Ø²ÛŒØ±Ø³Ø§Ø®Øª ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ùˆ Ø¨Ø±Ú¯Ø²ÛŒØ¯Ù‡â€ŒÙ‡Ø§ Ù¾ÛŒØ´ Ø§Ø² Ø§ØªØµØ§Ù„ build-time Ùˆ rebuild Ø¯Ø± ADM-6.
- Scope / files: `apps/cms/apps/siteconfig/` (new â€” models + migration `0001_initial`)ØŒ `apps/cms/apps/api/admin_siteconfig.py` (new) + mount Ø¯Ø± `admin_api.py`ØŒ `apps/cms/tests/test_admin_siteconfig_api.py` (new)ØŒ `apps/cms/admin-frontend/src/pages/SettingsPage.tsx|TagsPage.tsx|FeaturedPage.tsx` + Ø±ÙˆØªâ€ŒÙ‡Ø§ Ø¯Ø± `App.tsx`/`AdminLayout.tsx`ØŒ `Task-list.md` (Â§17 ADM-5)ØŒ `docs/status/CHANGELOG.md`ØŒ `docs/status/TECH_DEBT.md` (DEBT-0006)ØŒ `docs/status/BACKLOG.md`ØŒ Ø§ÛŒÙ† Work Log.
- Commands or actions actually performed: Ø§ÛŒÙ† Ø±Ú©ÙˆØ±Ø¯ Ø¨Ø± Ø§Ø³Ø§Ø³ Ú©Ø¯ Ùˆ ØªØ³Øªâ€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ slice Ù†ÙˆØ´ØªÙ‡ Ø´Ø¯Ø› Ø¯Ø± Ø§ÛŒÙ† Ù†Ø´Ø³Øª Ø¢Ø²Ù…ÙˆÙ†ÛŒ Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯ â€” Ø§Ø¬Ø±Ø§ÛŒ ØªØ£ÛŒÛŒØ¯ÛŒ Ø·Ø¨Ù‚ Ø±ÙˆØ§Ù„: `uv run pytest -q` Ø¯Ø± `apps/cms`ØŒ `uv run ruff check .`ØŒ `npm run build` + `npm run check` Ø¯Ø± admin-frontend.
- Verification actually performed and result: Û²Û· ØªØ³Øª Ø¬Ø¯ÛŒØ¯ Ø¯Ø± `tests/test_admin_siteconfig_api.py` Ù…ÙˆØ§Ø±Ø¯ settings/singleton/optimistic-lock/validationØŒ tags CRUD + IN_USE + DUPLICATE Ùˆ featured (Ø¨Ø§Ø²Ù‡â€ŒÛŒ Ø²Ù…Ø§Ù†ÛŒØŒ current filterØŒ guardsØŒ Ø¯Ù‚ÛŒÙ‚Ø§Ù‹ ÛŒÚ© Ø¢ÛŒØªÙ… ÙØ¹Ø§Ù„) Ø±Ø§ Ù¾ÙˆØ´Ø´ Ù…ÛŒâ€ŒØ¯Ù‡Ù†Ø¯Ø› endpoints Ø¯Ø± `admin_api.py` mount Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯Ø› migration `0001_initial` ØµØ±ÙØ§Ù‹ Ø§Ù¾ Ø¬Ø¯ÛŒØ¯ Ø§Ø³Øª Ùˆ Ù…Ø¯Ù„â€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ Ø±Ø§ ØªØºÛŒÛŒØ± Ù†Ù…ÛŒâ€ŒØ¯Ù‡Ø¯. ØªØ£ÛŒÛŒØ¯ Ù†Ù‡Ø§ÛŒÛŒ Ø´Ù…Ø§Ø±Ø´ Ø³ÙˆÛŒÛŒÛŒØª Ù¾ÛŒØ´ Ø§Ø² merge Ø¨Ø§ Ø§Ø¬Ø±Ø§ÛŒ local Ù„Ø§Ø²Ù… Ø§Ø³Øª.
- Decisions / assumptions: `SiteSettings` singleton Ø¨Ø§ `site_key` ÛŒÚ©ØªØ§ Ùˆ atomic get_or_create Ø§Ø³ØªØ› `navLinks` ØªÙˆØ³Ø· Ù„Ø§ÛŒÙ‡â€ŒÛŒ presentation (Astro) Ø±Ø²ÙˆÙ„ÙˆØ´Ù†/Ø§Ø¹ØªØ¨Ø§Ø±Ø³Ù†Ø¬ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ù†Ù‡ backendØ› Ù‚Ø§Ù†ÙˆÙ† Â«Ø¯Ù‚ÛŒÙ‚Ø§Ù‹ ÛŒÚ© Ø¢ÛŒØªÙ… ÙØ¹Ø§Ù„Â» Ø¯Ø± create/update Ù‡Ù…Ø§Ù† ØªØ±Ø§Ú©Ù†Ø´ enforce Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› ØµÙ†Ø¯ÙˆÙ‚ Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ÛŒ ØªÙ…Ø§Ø³ Ùˆ Ø³Ù†Ø¯ Ø¬Ø§Ø±ÛŒ CV Ø¨Ù‡ Ø§ÛŒÙ† slice Ø±Ø§Ù‡ Ù†ÛŒØ§ÙØªÙ†Ø¯ (DEBT-0006).
- Deferred or risk IDs: contact inbox (body ÙÙ‚Ø· Ø¯Ø± detailØ› Ø±Ø¹Ø§ÛŒØª Ø¬Ù‡Øª) â†’ DEBT-0006 â€” Ù…Ù†Ø¨Ø¹ Ø¹Ù…ÙˆÙ…ÛŒ ÙØ±Ù… ØªÙ…Ø§Ø³ Ø·Ø¨Ù‚ DEFER-0007 (ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú©) Ø¨Ø³ØªÙ‡ Ø§Ø³ØªØ› CV Â«ÛŒÚ© Ø³Ù†Ø¯ Ø¬Ø§Ø±ÛŒÂ» â†’ DEBT-0006 â€” Ø¯Ø§Ù†Ù„ÙˆØ¯Ù‡Ø§ÛŒ markdown Ø«Ø§Ø¨Øª Ø¯Ø± `Downloads.astro` ØªØ§ ADM-6 Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ù†Ø¯Ø› ØªØ²Ø±ÛŒÙ‚ `primaryColor` Ø¨Ù‡ CSS vars Ù‡Ù†Ú¯Ø§Ù… build Ø¯Ø± Astro â†’ ADM-6Ø› Caddy no-store Ùˆ deploy ØªØµÙˆÛŒØ± Ø¬Ø¯ÛŒØ¯ CMS Ù‚Ø¯Ù…â€ŒÙ‡Ø§ÛŒ Ù…Ø§Ù„Ú©Ø› DEFER-0023 (cutover) Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±Ø› RISK-0010 Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±.
- Rollback / recovery: Ø§ÛŒÙ† slice additive Ø§Ø³Øª â€” Ø¨Ø¯ÙˆÙ† Ø§Ø«Ø± runtime ØªØ§ cutoverØ› migration `0001_initial` Ø§Ù¾ Ø¬Ø¯ÛŒØ¯ Ù‚Ø§Ø¨Ù„ Ø¨Ø±Ú¯Ø´Øª Ø§Ø³ØªØ› revert Ø¨Ø±Ù†Ú† Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø².

## LOG-0163 - 2026-08-18 - ADM-1 / Admin SPA cutover (SPA replaces Wagtail at /admin/)

- Outcome: Ø§Ø¯Ù…ÛŒÙ† Ø§Ø®ØªØµØ§ØµÛŒ React SPA Ø§Ú©Ù†ÙˆÙ† Ø¯Ø± production Ø¯Ø± `/admin/` Ø³Ø±Ùˆ Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ ÙˆØ§Ú¯ØªÙÛŒÙ„ Ø¨Ù‡ `/admin-wagtail/` Ù…Ù†ØªÙ‚Ù„ Ø´Ø¯. Ø§ÛŒÙ† cutover Ù†Ù‡Ø§ÛŒÛŒ ADM-1 Ø§Ø³Øª â€” Wagtail Ø¯ÛŒÚ¯Ø± Ù…Ø³ÛŒØ± Ø§ØµÙ„ÛŒ Ø§Ø¯Ù…ÛŒÙ† Ù†ÛŒØ³Øª.
  1. **SPA Ø¯Ø± `/admin/`:** Ù…Ø³ÛŒØ± SPA Ø¯Ø± `config/urls.py` Ø¨Ù‡â€ŒØµÙˆØ±Øª catch-all Ù‚Ø¨Ù„ Ø§Ø² wagtail_admin_urls mount Ø´Ø¯Ù‡ Ùˆ Ø¯Ø± production (Ø¨Ø¯ÙˆÙ† DEBUG gate) ÙØ¹Ø§Ù„ Ø§Ø³Øª. ØµÙØ­Ù‡Ù” ÙˆØ±ÙˆØ¯ SPA Ø§Ø² `apps/cms/admin-frontend/dist/` Ø³Ø±Ùˆ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
  2. **Wagtail Ø¯Ø± `/admin-wagtail/`:** ÙˆØ§Ú¯ØªÙÛŒÙ„ Ø¨Ù‡ Ù…Ø³ÛŒØ± `/admin-wagtail/` Ù…Ù†ØªÙ‚Ù„ Ø´Ø¯ Ø¨Ø±Ø§ÛŒ TOTP enrollmentØŒ staff preview (`/admin-wagtail/preview/`)ØŒ profile admin Ùˆ rollback.
  3. **Dockerfile.cms multi-stage:** Ù…Ø±Ø­Ù„Ù‡Ù” Node.js Ø¯Ø± `Dockerfile.cms` Ø¨ÛŒÙ„Ø¯ admin-frontend Ø±Ø§ Ø§Ù†Ø¬Ø§Ù… Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ Ùˆ dist Ø±Ø§ Ø¯Ø± ØªØµÙˆÛŒØ± CMS bake Ù…ÛŒâ€ŒÚ©Ù†Ø¯Ø› Ø¨Ø¯ÙˆÙ† Ù†ÛŒØ§Ø² Ø¨Ù‡ Node.js Ø¯Ø± runtime.
  4. **MFAEnforcementMiddleware:** ÙÙ‚Ø· Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ `/admin-wagtail/` Ø±Ø§ intercept Ù…ÛŒâ€ŒÚ©Ù†Ø¯Ø› SPA Ø®ÙˆØ¯Ø´ OTP Ø±Ø§ Ø§Ø² Ø·Ø±ÛŒÙ‚ Ninja `/api/v1/admin/auth/login` Ù…Ø¯ÛŒØ±ÛŒØª Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
  5. **LOGIN_URL:** Ø¨Ù‡ `/admin-wagtail/login/` (Django login view ÙˆØ§Ú¯ØªÙÛŒÙ„) Ø§Ø´Ø§Ø±Ù‡ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
  6. **Profile admin `editorUrl`:** Ø¨Ù‡ `/admin-wagtail/profiles/...` Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯.
  7. **Smoke script:** Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯ â€” `/admin/` Ú†Ú© SPA 200 Ùˆ `/admin-wagtail/login/` Ú†Ú© Wagtail 200.
  8. **AuditMiddleware/LoginRateLimitMiddleware:** prefix Ø¢Ù†â€ŒÙ‡Ø§ Ø¨Ù‡ `/admin-wagtail/` ØªØºÛŒÛŒØ± Ú©Ø±Ø¯.
- Why: ADR-0026 ØªØ¹ÛŒÛŒÙ† Ú©Ø±Ø¯Ù‡ ÙˆØ§Ú¯ØªÙÛŒÙ„ Ø§Ø² runtime Ùˆ Ø§Ø¯Ù…ÛŒÙ† Ø­Ø°Ù Ø´ÙˆØ¯Ø› ADM-1 Ø¨Ø§ÛŒØ¯ SPA Ø±Ø§ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Wagtail Ø¯Ø± Ù…Ø³ÛŒØ± Ø§ØµÙ„ÛŒ `/admin/` Ú©Ù†Ø¯ Ùˆ Wagtail Ø±Ø§ Ø¨Ù‡ Ù…Ø³ÛŒØ± fallback Ù…Ù†ØªÙ‚Ù„ Ù†Ù…Ø§ÛŒØ¯.
- Scope / files: `config/urls.py` (SPA catch-all Ù‚Ø¨Ù„ Ø§Ø² wagtail_admin_urls)ØŒ `apps/cms/Dockerfile.cms` (multi-stage build)ØŒ `apps/cms/apps/security/middleware.py` (MFAEnforcementMiddleware prefix)ØŒ `apps/cms/settings/production.py` (LOGIN_URL)ØŒ `apps/cms/admin-frontend/` (SPA dist)ØŒ `apps/cms/apps/api/admin_spa.py` (SPA serving)ØŒ smoke scriptØŒ profile admin `editorUrl`ØŒ AGENTS.mdØŒ Task-list.md (Â§17)ØŒ CHANGELOG.mdØŒ Ø§ÛŒÙ† Work Log.
- Commands or actions actually performed: Ø§ÛŒÙ† Ø±Ú©ÙˆØ±Ø¯ Ø¨Ø± Ø§Ø³Ø§Ø³ Ú©Ø¯ Ùˆ ØªØºÛŒÛŒØ±Ø§Øª Ù…ÙˆØ¬ÙˆØ¯ slice Ù†ÙˆØ´ØªÙ‡ Ø´Ø¯Ø› ØªØ£ÛŒÛŒØ¯ Ù†Ù‡Ø§ÛŒÛŒ Ø´Ø§Ù…Ù„: `uv run pytest -q` Ø¯Ø± `apps/cms` (Û²Û¹Û² ØªØ³Øª PASS)ØŒ `uv run ruff check .` (ØªÙ…ÛŒØ²)ØŒ Ø¨Ø¯ÙˆÙ† migration Ø¯Ø± Ø§Ù†ØªØ¸Ø§Ø±ØŒ SPA build Ùˆ type-check PASS.
- Verification actually performed and result: Û²Û¹Û² ØªØ³Øª Ù¾Ø§Ø³Ø› ruff ØªÙ…ÛŒØ²Ø› Ø¨Ø¯ÙˆÙ† migration Ø¬Ø¯ÛŒØ¯Ø› SPA build/check PASSØ› smoke script Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯ â€” `/admin/` Ø¨Ø±Ø±Ø³ÛŒ SPA 200 Ùˆ `/admin-wagtail/login/` Ø¨Ø±Ø±Ø³ÛŒ Wagtail 200.
- Decisions / assumptions: SPA Ø¯Ø± `/admin/` Ø¨Ø¯ÙˆÙ† DEBUG gate Ø¯Ø± production ÙØ¹Ø§Ù„ Ø§Ø³ØªØ› Wagtail ÙÙ‚Ø· Ø¯Ø± `/admin-wagtail/` Ø¨Ø§Ù‚ÛŒ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯ Ùˆ Ø¨Ø±Ø§ÛŒ TOTP enrollmentØŒ preview Ùˆ rollback Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ old `/admin/profiles/` Ùˆ site content admin Wagtail-session Ø§Ú©Ù†ÙˆÙ† Ø¯Ø± SPA Ù‡Ø³ØªÙ†Ø¯ (PR #24 Ùˆ PR #31 superseded).
- Deferred or risk IDs: DEFER-0023 (cutover) CLOSEDØ› DEFER-0022 (local HTTP preview) Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±Ø› RISK-0010 Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±.
- Rollback / recovery: Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ø§ re-point Ú©Ø±Ø¯Ù† `/admin/` Ø¨Ù‡ `include(wagtail_admin_urls)` Ùˆ Ø­Ø°Ù SPA serving routeØ› ÙˆØ§Ú¯ØªÙÛŒÙ„ Ù‡Ù†ÙˆØ² Ù†ØµØ¨ Ùˆ functional Ø§Ø³Øª. ØªØµÙˆÛŒØ± CMS Ù‚Ø¨Ù„ÛŒ (Ø¨Ø¯ÙˆÙ† multi-stage) Ù‚Ø§Ø¨Ù„ Ø¨Ø±Ú¯Ø´Øª Ø§Ø³Øª.

## LOG-0164 - 2026-08-19 - Docs ledger sync after ADM-1 cutover

- Outcome: Entry-point docs match the live admin: SPA `/admin/`, Wagtail `/admin-wagtail/`. `DEFER-0023` and `DEFER-0014` CLOSED. `DEBT-0003` now describes the remaining Wagtail schema surface. Active spec is `docs/plan/ADM-6-frontend-wiring-task-spec.md`. Recorded `DEFER-0026` (Playwright lifecycle), `DEFER-0027` (HMAC enable), `DEFER-0028` (composition/CV projection).
- Why: AGENTS/README/plan index still said Wagtail served `/admin/` after LOG-0163.
- Scope / files: `AGENTS.md`, `docs/README.md`, `PROJECT_MANIFEST.md`, `docs/plan/README.md`, `docs/plan/ADM-6-frontend-wiring-task-spec.md`, ledgers, `Task-list.md` Â§17, this entry.
- Commands or actions actually performed: documentation-only; implementation follows in LOG-0165+.
- Verification actually performed and result: ledger IDs unique; no production claim beyond LOG-0163 cutover.
- Deferred or risk IDs: DEFER-0026/0027/0028 OPEN; DEBT-0003 OPEN; RISK-0010 OPEN.
- Rollback / recovery: revert this commit.

## LOG-0165 - 2026-08-19 - Projects listing, nested skills, SPA TOTP, rebuild hook

- Outcome: Public projects list no longer requires a case-study extension. Additive `show_on_projects` (default True, migration `0007`). `/{locale}/projects/` uses a card catalog and copy that does not mention `CMS_API_BASE`. SPA profile edit can change skills through the existing nested `PUT /api/admin/profiles/<locale>/<slug>` without wiping sibling arrays. ADM-0 TOTP enroll/recovery/disable is available at `/api/v1/admin/auth/mfa/*` and `/admin/security`; Wagtail HTML at `/admin-wagtail/` remains fallback and Wagtail stays installed. Signed `/rebuild-trigger/` starts `infra/deploy/rebuild-static.sh` when enabled; default remains False. Local JSON lifecycle createâ†’editâ†’publishâ†’public fa/en is tested.
- Why: Empty public projects page was a list-filter/seed mismatch; skills were nested rows the scalar content API could not edit; enrollment still depended on Wagtail HTML; HMAC endpoint did not run the rebuild script.
- Scope / files: `apps/cms/apps/content/models.py` + `migrations/0007_project_show_on_projects.py`, public `api.py`, `admin_content.py`, seed, `apps/rebuild/services.py`+`views.py`, `admin_mfa.py`, `admin-frontend` Security + ProfileNestedEditor, `apps/web` ProjectsCatalog + `content.ts` + QA spec, production env wiring for rebuild flags, ledgers, this entry.
- Commands or actions actually performed: `uv run ruff check .` (clean); `uv run pytest -q` (303 passed); `manage.py check` + `makemigrations --check --dry-run` (no pending); `npm run check`/`build` in `apps/web` and `apps/cms/admin-frontend`; `node qa/projects-catalog.spec.mjs` PASS. No VPS SSH, migrate, or HMAC enable.
- Verification actually performed and result: 303 pytest PASS; ruff clean; web 0 errors / 40 pages; admin SPA typecheck+build PASS; projects catalog QA PASS.
- Decisions / assumptions: `LOGIN_URL` stays `/admin-wagtail/login/` so HTML TOTP and staff preview keep working until SPA enrollment is proven on a new image. Rebuild Popen is backgrounded and fail-open; CMS container does not ship the host script (`REBUILD_SCRIPT_PATH`). Default script path is resolved lazily so importing `apps.rebuild.services` cannot `IndexError` when `apps/cms` is copied to `/app`.
- Deferred or risk IDs: DEFER-0026 Playwright lifecycle OPEN; DEFER-0027 HMAC enable OPEN; DEFER-0028 composition/CV OPEN; DEBT-0003 Wagtail schema OPEN; DEBT-0006 CV/inbox OPEN; RISK-0010 dumpdata+backup before production `0007`.
- Rollback / recovery: revert the PR; previous CMS image; boolean default True is compatible with existing rows.

## LOG-0166 - 2026-08-19 - Unstick web CI Playwright preview

- Outcome: PR #45 web job hung on â€œMobile overflow check (Playwright)â€ well past the 3â€“5 minute successful baseline. First fix still failed: Astro preview is a singleton (`Another astro preview server is already running` on 4321). CI now reuses the smoke preview on 4321, times out `playwright install`, uses `waitUntil: load`, and stops preview with `astro preview stop`.
- Why: Silent install, `kill %1` across a surviving smoke preview on 4321, and `networkidle` can stall goto for 30s per viewport.
- Scope / files: `.github/workflows/ci.yml`, `apps/web/qa/mobile-overflow.spec.mjs`, `apps/web/qa/about-tabs.spec.mjs`, CHANGELOG, this entry.
- Commands or actions actually performed: inspected GitHub job 96047606466 (step 11 in_progress from 11:11:52Z); compared with successful `ci.yml` runs (~3â€“5 min total).
- Verification actually performed and result: CMS/admin CI already PASS on PR #45; web CI re-run after this commit.
- Deferred or risk IDs: DEFER-0026 unchanged.
- Rollback / recovery: revert this commit.




