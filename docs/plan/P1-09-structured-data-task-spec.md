# Task Specification — P1-09 Structured Data (Person / WebSite JSON-LD)

## Task: R2/P1-09 — Person/WebSite structured data with real, validated data

- Goal: close the unchecked `Task-list.md:377` item by emitting `application/ld+json` structured data built exclusively from the approved typed domain data (`site.ts`, `content.ts`, `profile*.ts`), so that search engines get a machine-readable identity consistent with the visible content.
- User/actor and journey: search engines and social/citation crawlers reading the static HTML of `/`, `/en/`, `/fa/`, `/en/about/`, `/fa/about/`; no user-facing visual change.
- Release type: `FAST-TRACK`
- Risk level: Low (server-rendered metadata only; no dependency, no route, no content change)
- Owner and handoff recipient: L-model (main agent) → CI; independent review via r0-verifier.

## Scope

- In scope:
  - `Person` JSON-LD on locale pages (`/en/`, `/fa/`, `/en/about/`, `/fa/about/`) via `BaseLayout.astro`, with `name`, `url`, `sameAs` (social URLs from each locale's own `profile[locale].socials`), `alumniOf` (education institutions from the same typed source). Per-locale mirroring is deliberate: JSON-LD must not diverge from the page content (baseline §92), and the fa/en social data currently differ (`KI-0001`).
  - `WebSite` JSON-LD on the Language Gateway `/` (`index.astro`) and on locale pages, with `name`, `url`, `inLanguage` from `site.ts`/`content.ts`.
  - Build-time validation that the emitted JSON is parseable and derived from the validated profile; reuse `validateProfile()` where the pages already call it.
  - Task Spec, `WORK_LOG` entry, Task-list tick with evidence, and `known-issues.md` entry for the pre-existing fa GitHub handle discrepancy (`KI-0001`).
- Non-goals: no `image`/logo (owner `OPEN`), no `jobTitle`/metric/claim not present verbatim in approved data, no review/rating/offers, no analytics, no schema.org extension beyond Person/WebSite, no `.github/` or `infra/` change.
- Allowed files: `apps/web/src/**`, `apps/web/qa/**` (only if a spec must be added), `docs/plan/P1-09-structured-data-task-spec.md`, `docs/status/WORK_LOG.md`, `docs/status/known-issues.md` (KI-0001 for the pre-existing fa GitHub handle discrepancy), `Task-list.md` (evidence tick only).
- Forbidden files: `apps/cms/**`, `infra/**`, `.github/**`, `docs/adr/**` (no decision change), secrets, `dist/`.

## Contracts and data

- Documents/ADRs/API schemas/models read: `Task-list.md` §5 (P1-09), `PROJECT_MANIFEST.md` (gate PASS static-only P1; canonical commands), `docs/governance/DOCUMENTATION_POLICY.md`, `docs/taha-personal-platform-technology-architecture-baseline-fa.md` §91–§92 (structured data must be built from typed domain data; no divergence from content; no fake metrics; no wrong locale URL), `docs/user-journey-information-architecture.md` §144, ADR-0016 (no-JS rule does not forbid inert server-rendered JSON-LD script tags), ADR-0019.
- Contracts changed: none; a new read-only `structuredData()` helper inside `apps/web/src/data/` may be added; meta/head gain one inert `<script type="application/ld+json">` per page.
- Migration/data impact: none (static build only).
- Locale, visibility and publication impact: `Person.name` uses the English canonical name (`content.en.name`) with `sameAs` mirrored per locale from the locale's own typed socials (fa/en currently differ; `KI-0001`); `WebSite.inLanguage` lists the two real locale codes; nothing new is published that is not already public.
- Security/privacy impact: no private contact path, no email, no secrets; only already-approved public URLs (LinkedIn/GitHub/ORCID) and institutions.

## Verification and release

- Tests/commands to run (canonical per `PROJECT_MANIFEST.md:85-92` plus evidenced QA practice):
  - `npm run check` → 0 errors / 0 warnings
  - `npm run build` → static output, 6 pages
  - `npx astro preview --port 4321` + `node qa/mobile-overflow.spec.mjs` and `node qa/about-tabs.spec.mjs` → PASS (no regression)
  - JSON-LD extraction from built `dist/` HTML: each `application/ld+json` block parses with `JSON.parse`, contains the expected `@type` set, and its `sameAs`/`url`/`alumniOf` values match the typed data exactly
  - `git diff --check`
- Manual QA path: `curl` built preview pages and inspect the JSON-LD script block; validate with a schema.org structural check (types present, URLs absolute).
- Acceptance criteria:
  - Every indexable page (`/`, `/en/`, `/fa/`, `/en/about/`, `/fa/about/`) contains exactly the planned JSON-LD block(s).
  - No data appears in JSON-LD that is not already visible in the same page's content or the approved profile data.
  - No client JS, hydration or dependency added; main content remains readable with JS disabled.
  - CI green on push (type check, build, smoke, both Playwright suites, audit, no-secret artifact).
- Rollback/fallback: revert the commit; previous artifact stays served until the next release; no server/config change.
- Documentation to update: `WORK_LOG` (new LOG entry), `Task-list.md` (tick `P1-09` structured-data item with evidence), `deferred-validation` only if something is deferred (not expected).

## Handoff

- Files changed (task-owned only): `apps/web/src/data/structured.ts` (new), `apps/web/src/layouts/BaseLayout.astro`, `apps/web/src/pages/index.astro`, `docs/plan/P1-09-structured-data-task-spec.md` (new), `docs/status/WORK_LOG.md`, `docs/status/known-issues.md` (KI-0001), `Task-list.md` (tick with evidence).
- Verification actually run (command + result): filled in `WORK_LOG` entry after execution.
- Deferred/risk IDs: `DEFER-0009` (OG image) and `DEFER-0013` (real 200% zoom visual) unchanged/OPEN; no new deferral expected.
- Explicit blockers and next input: none; owner approval for deploy is not part of this slice (no deployment performed).
