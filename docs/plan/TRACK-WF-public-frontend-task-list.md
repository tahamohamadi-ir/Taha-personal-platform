# Track WF â€” Public Frontend Rebuild (apps/web) â€” Task List

> Goal (FA): Ø¨Ø§Ø²Ø³Ø§Ø²ÛŒ ÙØ±Ø§Ù†Øª Ø¹Ù…ÙˆÙ…ÛŒ Ø³Ø§ÛŒØª **Ø§Ø² ØµÙØ±** Ø¨Ø± Ø§Ø³Ø§Ø³ `Assets/site-redesign/implementation-reference/` â€” ØªÙˆØ³Ø¹Ù‡Ù” Ù„ÙˆÚ©Ø§Ù„ ØªØ§ Ø±Ø³ÛŒØ¯Ù† Ø¨Ù‡ Ù†Ù‚Ø·Ù‡Ù” Ù‚Ø§Ø¨Ù„â€ŒÙ‚Ø¨ÙˆÙ„ØŒ Ø³Ù¾Ø³ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ†ÛŒ Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± ÙÙ‚Ø· Ø¨Ø§ Ú¯ÛŒØª G9.
> Status vocabulary: `TODO` / `IN_PROGRESS` / `PARTIAL` / `BLOCKED` / `DONE`. Ù‡Ø± packet ÛŒÚ© commit Ù…Ø³ØªÙ‚Ù„ + ÛŒÚ© ÙˆØ±ÙˆØ¯ÛŒ `WORK_LOG` Ù…ÛŒâ€ŒÚ¯ÛŒØ±Ø¯.

## 1. Exclusive file ownership (conflict-free contract)

| Zone | Rule |
|---|---|
| `apps/web/**` | **Exclusive to Track WF.** No other track edits anything here. |
| `Assets/site-redesign/**` | Read-only reference for WF. Never copy `.git`, never serve `others/`. |
| `infra/**` | READ-ONLY for WF (deploy handled by release gate, not by packets). |
| `apps/cms/**`, `apps/admin/**` | FORBIDDEN for WF. Data comes from published-only public API; schemas belong to Tracks BK/AB/AF. |
| `docs/contracts/DESIGN-CONTRACT.md` | Only WF-01 may edit (token sections) in its single commit. |
| Ledgers (`docs/status/*`) | Append-only at packet close; never rewrite history. |

Inside `apps/web`, concurrent WF workers follow `AGENT-COORDINATION.md` Â§3: at most one worker on `src/styles/global.css`, `Header.astro`, `BaseLayout.astro`, `astro.config.mjs`, `package.json`, or the same ledger.

## 2. Stable interfaces (from `AGENT-COORDINATION.md` Â§4 â€” do not rename)

```ts
export type ThemeName = "light" | "dark" | "system";
export type Direction = "ltr" | "rtl";
export type ContentState =
  | "ready" | "loading" | "empty" | "no-results"
  | "error" | "unavailable-translation";
```

Graph target types (`GraphNodePublic`, `GraphEdgePublic`) are defined in the same source; current CMS DTO names win over target names â€” WF maps, never renames production fields.

## 3. Local-first loop (every packet)

```powershell
# working directory: apps/web/
npm install                        # once per worktree
npm run check                      # typecheck â€” 0 errors
node qa/<packet>.spec.mjs          # packet QA (must FAIL first, PASS after)
npm run build                      # default build â€” MUST contain no /_design/
node ../../Assets/site-redesign/implementation-reference/agent-kit/validate.mjs   # G0 anchor stays green
git diff --check                   # whitespace
git add <packet-owned-files> ; git commit -m "<exact message below>"
```

Optional integration check against local CMS stack (no deploy):

```powershell
$env:CMS_API_BASE = "http://127.0.0.1:18000"; npm run build; Remove-Item Env:\CMS_API_BASE
```

## 4. Packets

| ID | Packet | Key steps | Files (owned) | Verify | Done gate | Deps |
|---|---|---|---|---|---|---|
| **WF-00** | Freeze baseline & open worktree | Run kit validator (PASS: 24 comp/6 tpl/10 assets); verify 33 PNG hashes vs `SHA256SUMS.txt`; record `git status/HEAD/worktree list` in WORK_LOG; create worktree `atlas-wf-*`; activate packet Task Specs in `docs/plan/README.md` | `docs/plan/README.md` (activation rows only), WORK_LOG entry | validator PASS + hash count recorded | G0 | â€” |
| **WF-01** | Dual-theme token contract | Write failing `qa/design-tokens.spec.mjs` (parse `global.css`: every semantic role present, raw colors rejected outside token block, `[data-theme="dark"]` selector present); run â†’ FAIL; add Dark aliases preserving Light byte-for-role + single glass `@supports`; create `src/design-system/contracts.ts` exporting the three types above; record contrast ratios body/secondary/control/focus/primary-rest/hover Ã— both themes | `src/styles/global.css`, `src/design-system/contracts.ts`, `qa/design-tokens.spec.mjs`, `docs/contracts/DESIGN-CONTRACT.md` | token QA PASS; `npm run check`; build clean | G1 | WF-00 |
| **WF-02** | Primitives (8) | TDD structural specs â†’ implement `Button` (primary/secondary/quiet + icon slot, native `<button>/<a>` semantics, never clickable div), `IconButton` (accessible name mandatory), `LinkAction`, `Chip` (neutral/selected/taxonomy), `Badge` (meaning â‰  color-only), `InputField` + `TextareaField` (persistent label, `aria-invalid`/`aria-describedby`, retain value on error), `ContentState` (exact 6 kinds, heading+explanation+â‰¤1 recovery action); fixtures: EN/FA, long label, keyboard, disabled, loading geometry-stable, reduced-motion | `src/components/ui/*.astro` (8 files), `qa/ui-primitives.spec.mjs` | primitive QA PASS; check/build | G2 | WF-01 |
| **WF-03** | Shell + Language Gateway | Failing shell QA (gateway `/` separate, `/fa/` RTL, `/en/` LTR, active-route marker incl. parent-section activation, 44px targets incl. header, theme persistence prefers/system, every nav link resolves, no-JS readable); rebuild `BaseLayout/Header/Footer/Breadcrumbs` + `ThemeToggle` (local tabs overflow OK) with authoritative logo PNG unre drawn; glass ONLY header+gateway via `.glass-surface(-â€‘â€‘dark)` opaque-first; screenshots 320â€“1440 Ã—2 themes Ã—2 dirs | `layouts/BaseLayout.astro`, `components/{Header,Footer,Breadcrumbs}.astro`, `components/navigation/ThemeToggle.astro`, `pages/index.astro`, `qa/public-shell.spec.mjs`, `data/site.ts` only for verified facts | shell QA PASS; mobile-overflow spec PASS | G2/G3 | WF-02 |
| **WF-04** | Shared content components | Components accept approved data via typed props only (component never fetches CMS or invents fallback facts); optional fields collapse with zero placeholder; `PublicationRow` omits unverified venue/date/DOI (no em-dash facts); `TimelineNode` renders ordered list pre-enhancement; `MediaTile` reserves aspect ratio, failed media keeps caption + record link; definition-list semantics in `MetadataGroup` (`<bdi>` isolation for DOI/URL) | `src/components/content/{SectionLead,FeaturedRecord,ContentRow,PublicationRow,MetadataGroup,Timeline,MediaTile,TableOfContents,ContactCTA}.astro`, `qa/content-components.spec.mjs` | content QA PASS | G2/G3 | WF-02 |
| **WF-05** | Six templates | Failing QA maps every canonical route family to exactly ONE template and rejects empty linked detail shells; slots per `agent-kit/templates.json`; absent optional region â‡’ no wrapper gap; one H1/template; landmark order; reading measure; contact/next-action region present | `src/layouts/{HomeTemplate,CollectionIndexTemplate,EditorialIndexTemplate,LongFormTemplate,EvidenceDetailTemplate,UtilityTemplate}.astro`, `qa/page-templates.spec.mjs` | template QA PASS | G3 | WF-03+04 |
| **WF-06** | Visual Atlas (local-only) | Failing QA: default build lacks `_design/index.html`/sitemap/Pagefind/fixture strings; conditional integration calls `injectRoute("through /_design/")` iff `process.env.DESIGN_ATLAS === "1"`; launcher spawns Astro cross-platform (Windows OK); sections foundations/components/templates/responsive/state/motion/assets from REAL production imports; fixtures flagged `unpublished: true` + visible warning, no real private data; controls (theme/dir/viewport/reduced-motion) affect specimen boundary only | `src/design-atlas/**`, `scripts/design-atlas.mjs`, `astro.config.mjs`, `package.json` (scripts only: `atlas`, `qa:atlas`), `qa/design-atlas.spec.mjs` | BOTH builds verified: default atlas-free, `DESIGN_ATLAS=1` contains route; screenshot script stable selectors | G4/G5 | WF-01 (merge after 02â€“05) |
| **WF-07A** | Adopt â€” Home | Map locale index + landing to `HomeTemplate` 8-block narrative (identityâ†’graph listâ†’research fitâ†’journeyâ†’projectsâ†’publicationsâ†’previewsâ†’CTA); loaders/DTO/slug unchanged; missing module omitted honestly; Light/Dark + FA narrow screenshots | route + Landing files for `{fa,en}/index`, per-family QA spec | family QA PASS; integration grep shows template import | G3/G5 | WF-05,06 |
| **WF-07B** | Adopt â€” Research/Publications | Index+detail to templates (PF-05); statement/topics pages; publications stay canonical `/publications/{slug}/`; topic chips instead of raster graph until WF-09 | research pages/spec | idem | idem | idem |
| **WF-07C** | Adopt â€” Projects | Sanitized-evidence disclosure kept; type badge translated via dictionary; filters URL-backed no-JS; detail = EvidenceDetailTemplate | pages/spec | idem | idem | idem |
| **WF-07D** | Adopt â€” Creative/Gallery | Grid/rows per PF-01/02; native `<dialog>` lightbox retained, focus-trap + reduced-motion; failed media retains caption/link | pages/spec | idem | idem | idem |
| **WF-07E** | Adopt â€” Writing/Blog | `/blog/**` redirect-only preserved; RSS path untouched; long-form = LongFormTemplate + TOC; Jalali dates build-time (`Intl.DateTimeFormat('fa-IR-u-ca-persian')`) via shared `formatDate` | pages/lib/format/spec | idem + zero raw ISO strings in fa output | idem | idem |
| **WF-07F** | Adopt â€” Learning | PF-06 honest-empty library; level/prereq/language from CMS only, omit if absent | pages/spec | idem | idem | idem |
| **WF-07G** | Adopt â€” About/CV | Tabs stay radio-CSS no-JS; sticky toolbar uses `--space-sticky-offset`; gated detail routes logic preserved | pages/spec | idem | idem | idem |
| **WF-07H** | Adopt â€” Contact | Labels fully localized both locales; form fields retain values on failure; success/error states distinct; no phone/personal Gmail anywhere | ContactPage/spec | idem | idem | idem |
| **WF-08** | Graph Phase 1 (consumer) | Semantic Astro list rendered from one published payload BEFORE island loads; 2D pan/zoom/focus island with keyboardâ†”pointer selecting identical related-record URLs; orphan/duplicate-edge/missing-label/broken-link QA; reduced-motion & WebGL-fail fall back to list | `src/components/research/**`, `src/lib/cms/research-graph.ts` (adapter only), graph QA specs | family QA + perf budget note in WORK_LOG | G7 | WF-05,06 + BK-05 shipped |
| **WF-09** | Asset delivery + polish | Generate AVIF/WebP masters â‰ˆ800/1200/1600px from `site-redesign/art/**` (masters untouched); responsive `srcset/sizes`, PNG fallback; preload only chosen-theme LCP hero; font subsetting Newsreader/Estedad activation IF WF-01 display-font slot landed; decorative art `alt=""` rules applied sitewide | `public/art-derived/**`, layout heroes, `qa/asset-delivery.spec.mjs` | asset QA PASS; LCP/report in WORK_LOG | G5 | WF-07* |
| **WF-10** | Independent QA hardening | Six widths Ã—2 dirs Ã—2 themes Ã—reduced-motion risk-based matrix; 200% zoom; keyboard/screen-reader path; JS-disabled crawl of core routes (filters/pagination/graph list/figures/contact intact); dist scan: no fixture strings, drafts, private media, phone/gmail; LCP/CLS/asset-bytes vs budget; publish FINAL-QA table pass/fail/deferred â€” skipped â‰  PASS | `qa/**` additions, `FINAL-QA-REPORT.md` (this repo root or `assets/reference`) | full suite PASS + table committed | G9 | all above |
| **WF-CLEAN** | Superseded-code sweep (MODE Â§7.3) | Execute pending `apps/web/LEGACY-INVENTORY.md` rows created by WF-03..07x; run ephemeral `npx unimported` + `npx depcheck` (NOT added to package.json); delete dead files/empty dirs; remove retired deps ONLY with owner note (bounded motion/gsap/three need explicit motion-governance line); refresh repository-ownership tree in PROJECT_MANIFEST Â§Repository ownership; rerun whole suite | inventory rows + deletions + manifest snippet | zero unimported warnings in changed zone; suites green | G9-pre/cutover companion | WF-10 |

## 5b. Environment preconditions (MODE doc binding)

- Packets WF-00..06 default to SNAPSHOT mode (Â§1 S) â€” no backend needed.
- From WF-07x onward, each packet states its mode on the branch WORK_LOG first line: prefer **A1 local stack** when the family consumes CMS fields under active BK change; use **B hybrid** only for final visual sanity of that family against production published data (read-only rules Â§5).
- Any packet seeing `RATE_LIMITED` from remote stops immediately (never retry-spam) and records it.

## 5. Deploy handoff (after G9 â€” performed by owner/integration lead, not a WF packet)

```powershell
# merge accepted branches in AGENT-COORDINATION Â§6 order onto main
cd apps/web; npm run build        # final artifact; CI cd.yml picks up web image
# cutover remains: rsync artifact â†’ sudo /opt/taha/bin/update-release.sh â†’ compose web pull :sha â†’ smoke
```

## 6. Handoff report (every packet)

branch + base commit Â· changed-file manifest Â· interface diffs Â· exact commands+outputs Â· screenshots (states touched) Â· content/privacy/RTL/a11y notes Â· new RISK/DEBT/DEFER IDs Â· commit hash. No push/deploy without owner approval.

---

## 7. Engineering doctrine â€” non-negotiable quality bar (applies to EVERY packet, no exceptions)

> Goal (FA): ØªØ¶Ù…ÛŒÙ† Ø§ÛŒÙ†Ú©Ù‡ ØªÙˆØ³Ø¹Ù‡ Ú©Ø§Ù…Ù„Ø§Ù‹ **Ø§ØµÙˆÙ„ÛŒØŒ scalable Ùˆ Ú©Ø§Ù…Ù¾ÙˆÙ†Ù†Øªâ€ŒÙ…Ø­ÙˆØ±** Ø§Ø³ØªØŒ Ù‡Ø± Ú¯Ø§Ù… Ù‚Ø§Ø¨Ù„ ØªØ³Øª Ø¨Ø§Ù‚ÛŒ Ø¨Ù…Ø§Ù†Ø¯ Ùˆ Ø§ØµÙ„Ø§Ø­Ø§Øª Ø¨Ø¹Ø¯ÛŒ (Ø§ÙØ²ÙˆØ¯Ù† Ø®Ø§Ù†ÙˆØ§Ø¯Ù‡Ù” Ù…Ø­ØªÙˆØ§ÛŒÛŒ Ø¬Ø¯ÛŒØ¯ØŒ ØªØºÛŒÛŒØ± ØªÙ…ØŒ ØªØºÛŒÛŒØ± layout) Ø¨Ø¯ÙˆÙ† Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ Ø§Ù†Ø¬Ø§Ù… Ø´ÙˆØ¯.
> This section outranks any packet's brevity temptation. A reviewer (or small agent) failing a Â§7 checklist item marks the packet PARTIAL.

### 7.1 Component-driven development rules

1. **Layer model, strictly ascending** (`MASTER-SPEC.md` component architecture):
   `design tokens â†’ ui primitives (WF-02) â†’ content components (WF-04) â†’ templates/layouts (WF-05) â†’ route pages (WF-07*)`
   - A layer may import ONLY from layers below it. Page imports primitive directly = violation; page composes content-components; content-component composes primitives. Grep check: `src/pages/**` must NOT contain `class=` style blocks beyond slot assembly hints; all presentation classes live in the layer that owns them.
   - Every visual element on ANY route must be traceable to a named primitive/content-component in this repo (or documented exception in LEGACY-INVENTORY with removal date).
2. **Single source of truth per concept**: one Button implementation, one Card anatomy, one EmptyState renderer. Adding a second near-identical variant instead of extending props = REJECT at review. The 24-component registry (`agent-kit/components.json`) is closed for v1: need something outside it â†’ file it as a proposal in WORK_LOG `ESCALATE:` line, do not improvise.
3. **Props-in, markup-out**: components NEVER fetch CMS data, read globals, or generate copy/fallback facts internally. Data arrives via typed props from route data-loaders (`src/lib/cms/*` adapters). This keeps every component pure-renderable inside the Visual Atlas fixtures and unit-testable without network.
4. **Slots over configuration explosions**: templates expose named slots per `templates.json`; absent optional region â‡’ render nothing, no wrapper gap, no placeholder div. Optional props default to "omit", never to em-dash or "â€”" stubs.
5. **Accessibility is part of the API**, not polish: each component's contract includes its required ARIA attributes/semantics (e.g., `Button` renders native `<button>/<a>`, `MediaTile` reserves aspect + caption linkage, `MetadataGroup` uses `<dl>`). Missing-a11y = missing-feature, same severity.

### 7.2 Scalability rules

1. **Adding a new route family costs ONE template composition + ONE data adapter + ONE QA spec** â€” nothing else. If an adoption packet finds itself writing new one-off CSS/classes/presentation files, stop and extend the shared layer instead (this is exactly what Â§7.3 enforcement catches).
2. **Tokens are the only magic values** (`DESIGN-CONTRACT` authority): spacing/radius/motion/color/measure from `global.css` roles only. New requirement that no token expresses â†’ add token via WF-01-style mini-task FIRST (token QA extended), then consume. Raw px/hex/ms outside token block is a build-time QA failure by design.
3. **Theming and direction are horizontal concerns**: `[data-theme]` selector swaps semantic roles only (never re-authored per page); RTL through logical properties means LTR work never needs a mirrored duplicate. Any component diff touching `@media` direction/theme-specific styling must be justifiable as role-token selection.
4. **File-size budgets are SMELL THRESHOLDS, not hard caps** (see Â§7.5 for the full protocol): rough guidance per layer â€” primitive ~150 lines incl. token-referencing styles; template ~200 lines of composition; route page ~80 lines mapping loaderâ†’template slots. Exceeding a threshold triggers a REVIEW DECISION (split vs. documented exception), never silent feature-trimming. Blank lines, imports, and frontmatter comments do not count toward the numbers.
5. **Data shape stability**: loaders return camelCase DTOs matching the frozen contracts (`AGENT-COORDINATION Â§4`, BK public serializers). Mapping lives ONLY in `src/lib/cms/*.ts`; if BK renames a field later, fix surface = that adapter file alone.

### 7.3 Enforced quality gates (mechanical checks inside every packet loop)

| # | Check | How | Fail condition |
|---|---|---|---|
| 1 | Type safety zero-error | `npm run check` | any error |
| 2 | Packet QA TDD order | spec committed in SAME commit, ran FAIL before impl evidence in WORK_LOG | post-hoc test authoring |
| 3 | No raw design values outside tokens | grep `#[0-9a-fA-F]{3,8}\b`, `\d+px(?!\))` in changed `src/**` excluding `styles/global.css` + generated atlas snapshot dir | hit found |
| 4 | No per-page `<style>` blocks >40 lines | count scoped style lines per new/changed `.astro` | exceeded without decomposition note |
| 5 | Semantic landmarks + heading order | qa specs assert one H1, nav/main/footer landmarks present per template | assertion fail |
| 6 | Keyboard + focus-visible parity | primitive specs include keyboard fixture; hover twin rule | missing |
| 7 | i18n completeness | zero hardcoded UI strings in components; strings resolve from locale dictionaries both fa/en; Persian byte-exact incl. ZWNJ | untranslated literal |
| 8 | No-JS integrity per touched route family | build output rendered/disabled crawl in spec (existing pattern) | content unreachable |
| 9 | Import hygiene | `rg "<OldComponent>" src` zero hits after adopt/delete packets; unimported sweep at WF-CLEAN | dangling refs |
| 10 | Bundle discipline | no NEW runtime dep without Task-Spec authorization line; islands only where interaction demands (chart/lightbox/pagefind) | silent dependency add |

### 7.4 Refactor/extension friendliness (the "future fixes stay easy" clause)

- **Extension points documented at declaration site**: each template/component carries a short frontmatter comment block listing its extension seams (e.g., `CollectionIndexTemplate`: new family via `familyConfig` prop object; customization forbidden below that seam).
- **Delete-before-diverge policy**: improving behavior edits the shared component; adding a sibling copy to avoid touching it is forbidden (links back to MODE Â§7.2 adopt-equals-delete).
- **Change-surface predictability**: refactoring goal categories map to expected file scopes recorded here once:
  `retheme â†’ tokens only Â· new section type â†’ content component + templates.json entry + fixture Â· IA change â†’ routes+adapter+QA spec Â· new CTA â†’ ContactCTA variant prop`. Anything needing wider blast radius than its category â‡’ escalate before coding.
- Every WORK_LOG entry ends sections: `Doctrine compliance: [Â§7.x items verified]` â€” small agents paste the applicable row results rather than free-form claims.

### 7.5 Completeness-over-budget protocol (read BEFORE splitting anything)

The Â§7.2(4) numbers exist to catch accidental monoliths, NOT to cap functionality. Priority order is absolute:

1. **Feature completeness > a11y/i18n/no-JS contracts > budget.** An agent must NEVER delete behavior, drop a required ARIA attribute, skip an i18n key, remove test cases, or leave a TODO stub to get under a line count. A truncated component fails its own packet QA (Â§7.3 rows 5â€“8) â€” meaning the budget "saved" nothing.
2. **When over threshold, choose exactly one:**
   - **A (preferred)** Split at a NATURAL seam: real sub-components (e.g., `SearchFilters`/`ResultList` inside a big index template), token-block extraction, or pure helpers moved to `src/lib/*`. Artificial splits (one file per 3 lines, prop-drilling gymnastics just to shrink counts) are worse than oversize and get rejected at review.
   - **B** Keep the file as-is and record a TECH_DEBT row (`DEBT-*`) with: actual size, why no natural seam exists (e.g., deeply cohesive state machine), and the trigger that would justify a later split. Oversize-with-debt-ID is DONE; oversize-silently or half-split is PARTIAL.
3. **Budget arithmetic is never an acceptance criterion.** Done gates come from packet Verify columns (QA specs, check/build, Â§7.3 doctrine gates). No reviewer may fail a packet solely for being +N lines when all functional/a11y/i18n/test checks pass; conversely, a 149-line component with a skipped keyboard fixture is a FAIL.
4. **Small-agent instruction**: if A vs B is not obvious in one reading, do B (ship complete + DEBT id) and flag `ESCALATE:` for the integration lead. Never rush a split at packet end.
