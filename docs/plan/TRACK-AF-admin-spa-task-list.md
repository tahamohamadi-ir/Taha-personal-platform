# Track AF — Admin Frontend SPA (`apps/admin`) — Task List

> Goal (FA): توسعهٔ صفحات React ادمین برای قابلیت‌های بازطراحی: Home Composer، Timeline editor، Media focal/rights، Graph 2D editor + preview — RTL-first فارسی، بدون هیچ تداخلی با سه Track دیگر.
> Read FIRST: `AGENTS.md`, `docs/plan/TRACK-MODE-environment-and-cutover.md`, `docs/plan/TRACK-AB-admin-backend-api-task-list.md` (endpoint contracts are FROZEN there — AF consumes, never redefines), existing `apps/admin/src/**` (entity registry, api client, ProblemDetails parser, i18n pattern).

## 0. Ownership wall

- WRITE zone: `apps/admin/**` only. `package.json` edits limited to adding zero runtime deps by default (see per-packet rules); scripts additions allowed.
- FORBIDDEN: anything under `apps/web/**`, `apps/cms/apps/**` python, `infra/**`. Type contracts that reveal DB/API shapes live as TS interfaces INSIDE this zone; when backend contract changes → update here from the AB doc text, never by reading Django files.
- Local run: mode A1 stack up → `npm ci && npm run dev` inside apps/admin; login with the local throwaway superuser. Vite proxy for `/api/v1/*` must point at `http://127.0.0.1:18000` — if a dev-proxy config already exists, reuse it; creating one is part of AF-00 allowed edits (`vite.config.*`).

Loop per packet:

```powershell
cd apps/admin
npm run build          # must pass before commit
npm run type-check     # or script equivalent discovered in AF-00 survey
npm test               # when test runner exists in repo pattern
```

Screen conventions to mirror exactly (survey step confirms): file-per-screen under `src/pages/<Area>/`, shared table/form primitives already present, Persian strings byte-exact including ZWNJ, fa/en resource dictionaries location found at survey, RTL handled globally via document dir attribute — components use logical CSS only.

---

## AF-00 — Survey & API-client groundwork

- DependsOn: AB-00/AB-01 endpoints exist on local stack.
- Steps:
  1. Inventory WORK_LOG entry answering: entity registry path & shape; how list/detail/save flows handle If-Match today (one example screen quoted); i18n dictionary file(s); route registration mechanism; permission gating helper; error-toast component name; vite dev proxy existence.
  2. Create `src/lib/adminApiExt.ts`: typed client functions for ALL new AB endpoints (paths verbatim) with return types `HomeModuleRow`, `TimelineItem`, `MediaPresentationPatch`, `GraphVersionSummary|Full|Issue`; wire ProblemDetails parser so field tokens surface structurally (token string preserved for i18n mapping later).
  3. Add i18n skeleton keys namespace `redesign.*` in both dictionary files containing ONLY structural labels needed by next packets (visible/order/provenance/draft/active...). Persian values copied from Appendix A of this file byte-exact.
  4. Nav: extend existing sidebar/menu registry with a collapsed group «Redesign» (fa: «بازطراحی») whose children appear progressively; hidden-if-endpoint-404 resilience wrapper.
- Verify: type-check green; manual smoke — nav renders empty group without errors against A1 stack.
- Commit: `feat(admin-spa): redesign area scaffold and typed clients`

## AF-01 — Home Composer screen

- DependsOn: AF-00 + AB-02 live.
- Route: `/home-composer/{locale}`-equivalent matching existing route style; locale tabs fa/en switching refetch.
- UI anatomy: vertical ordered list of exactly 8 module rows [key icon+label, visible checkbox, provenance badge read-only derived from selection_mode chip colors mapped to existing badge set]; global footer actions Save(discard-confirm modal on dirty) / Validate-on-blur(debounced client-side permutation check BEFORE server call using same rules: unknown key impossible by construction, duplicate order prevented in-place by swap logic).
- Reorder interactions: keyboard accessible ▲▼ buttons per row (no drag library); reorder mutates draft array only.
- Save flow: PUT full array with current revision header; success toast shows new revision chip; on 409 STALE_REVISION show blocking dialog offering Refresh-diff (fetch fresh into side-by-side simple list) then apply-mine/reload choice. All retry paths preserve user's edit state.
- State machine implemented as pure reducer in `src/pages/HomeComposer/reducer.ts` with unit tests covering: init-fetch, toggle-visible, move-up/down edge cases (top/bottom), save-success, save-conflict, validate-error-field-focus jump.
- Verify: reducer tests ≥10 cases; playwright spec (repo pattern) happy-path + conflict-dialog path against A1 stack screenshot evidence saved under admin-frontend qa artifacts convention found in survey.
- Commit: `feat(admin-spa): home composer`

## AF-02 — Timeline Editor

- DependsOn: AF-00 + AB-03.
- Route under redesign group; profile selector dropdown limited to profiles returned by existing profile endpoint used elsewhere in SPA.
- List with inline row expansion editing fields (type select, label input, period label optional, body textarea locale-scoped by active tab, detail link uri validated as absolute-or-site-relative regex shared util), plus add-after-selected, delete-with-count-confirm modal pattern reused from bulk-archive precedent, and Reorder mode toggling same ▲▼ mechanics as AF-01 (shared hook extracted `useOrderedDraftList` placed `src/lib/useOrderedDraftList.ts`).
- After CHANGE number guard like AF-01 (single-item PATCH carries If-Match).
- Verify: unit tests reorder hook ≥8; e2e create→edit→reorder→delete roundtrip green locally.
- Commit: `feat(admin-spa): timeline editor`

## AF-03 — Media presentation extension

- DependsOn: AF-00 + AB-04.
- Integrate INTO existing MediaPicker/media detail drawer (location confirmed in survey): new "Presentation" section — FocalPointPicker component rendering thumbnail `<img>` overlay click-to-set crosshair storing % pair (two decimals), small numeric inputs synced; rights textarea per locale tab; license select loaded once from licenses endpoint cached at app-level query cache layer existing in repo.
- PATCH submits only changed subset; explicit-clear buttons for nullable fields showing dim state.
- No change to upload/list columns beyond optional tiny focal-set indicator dot in existing grid cell renderer if trivially injectable; otherwise skip visual clutter (note decision).
- Unit tests: picker coordinate math incl. border clicks=0/100 clamp and round-trip format; a11y focus trap retained in parent modal untouched.
- Commit: `feat(admin-spa): media focal and rights controls`

## AF-04 — Graph Editor shell (canvas + selection)

- DependsOn: AF-00 + AB-05 payload GET/PUT draft.
- Zero new runtime dependencies (SVG hand-rolled): `src/pages/GraphEditor/canvas.ts` with viewport {scale, tx, ty}; wheel-zoom centered on cursor (clamp 0.25–3), background drag pan, node box-select vs single-click select toggle honoring modifier keys; devicePixelRatio-aware crisp strokes.
- Layout of screen: left groups tree (expand/collapse counts), center canvas (aria-label + role img fallback listing raw nodes for SR users via visually-hidden list kept in sync ≤200 nodes cap else capped notice), right inspector forms switch on selection kind (node: label{locale}, type select, color/icon role selects populated from palette constants mirrored from DESIGN tokens names not hexes, weight slider, position numeric disabled when auto-layout flag chosen, related multi-add modal filtering published records list endpoint family param).
- Draft autosave OFF v1; explicit Save draft button → PUT payload; unsaved-changes guard before leave (react-hook-free custom beforeunload + router guard reusing existing pattern found in survey).
- Keyboard map documented in-screen help popover: Tab cycles inspector; arrows nudge selected node position ±1 (shift ×10) mutating draft.
- Unit tests: zoom math, nudge clamps, relatedRecord dedupe; canvas smoke snapshot optional skip if repo lacks snapshot infra.
- Commit: `feat(admin-spa): graph editor shell`

## AF-05 — Graph validation UX & activation flow

- DependsOn: AF-04 + AB-06 validator + activation endpoint.
- Bottom status bar chips: issues count by severity (error/warn) from client-side re-run of IMPORTED pure rule mirrors? NO duplication — call validation endpoint; poll after each mutation debounced 800ms showing spinner-capable.
- Activate button disabled until server reports zero blockers; confirm modal lists blocking issue tokens rendered localized via mapping table `src/i18n/graphIssues.fa.ts|en.ts` (tokens enumerated exactly from AB-06 test names — paste-drift risk mitigated by unit test asserting table keys === exported AB contract list duplicated ONLY as TS const declared `GRAPHISSUE_TOKENS` with comment "mirror of apps/api/admin_graph_validate.py CODES; keep sync").
- Versions sidebar strip: list versions with status pill; restore-view switches workspace payload source (read-only banner unless it's a draft).
- Conflict: PUT stale → same dialog pattern as AF-01 (shared component extraction `src/components/RevisionConflictDialog.tsx` refactored out and reused by both screens within this packet).
- Tests: token-sync test; blocked-activate flow; archive-switch banner.
- Commit: `feat(admin-spa): graph validation and versioning ui`

## AF-06 — Preview affordances v1 (honest scope)

- DependsOn: AF-01..05 present.
- Per-graph preview panel: two-locale toggle × theme toggle re-rendering a client-side SEMANTIC LIST preview (plain <ol> grouped by type) from the SAME in-memory payload — satisfies MASTER-SPEC §8 semantic-list preview requirement inside admin.
- EXPLICIT DEFER recorded this packet: embedded true-site iframe/WYSIWYG preview gate (light/dark/desktop/mobile/no-JS matrix belongs to public-side Visual Atlas & staff preview pipeline). Open DEFER id via ledger protocol placeholder title `DEFER: embedded site preview iframe from admin graphs` owner-review line added; do NOT fake it.
- Commit: `feat(admin-spa): graph semantic list previews (+deferred embed)`

## AF-07 — i18n & RTL completion pass

- DependsOn: all above merged in working tree.
- Sweep every new screen: all literals moved into dictionaries (grep heuristics listed inline: search `>[A-Za-z]{2,}<` inside tsx excluding identifiers), Persian strings replaced by Appendix A entries verbatim where provided, remaining composed strings approved inline by integration lead note.
- RTL spot checklist executed at narrow width 360px: no left/right physical css introduced (verify grep `(left|right):` returning only third-party file paths none).
- Full `npm run build` + existing admin e2e suite (if present from ADM QA wave) stays green.
- Commit: `fix(admin-spa): localize redesign surfaces fully`

## AF-CLEAN — superseded screen removal (pairs MODE §7.2/7.5)

- DependsOn: owner cutover approval milestone, or earlier whenever a whole legacy screen loses its last route during preceding packets (then cleanup is SAME-commit already per §7.2 — this packet only sweeps leftovers).
- Steps: produce list of candidate deletions via grep for dead exports (tsc `--noUnusedLocals` temporary CLI flag run, not committed config change), remove, type-check, confirm route registry has no dangling references, WORK_LOG manifest rows appended mirroring LEGACY-INVENTORY style inside admin zone file `ADMIN-SPA-INVENTORY.md` created here.
- Commit: `chore(admin-spa): prune superseded admin screens`

## Appendix A — canonical Persian strings (copy byte-exact, ZWNJ included)

```text
بازطراحی
چیدمان صفحهٔ اصلی
نمایش در سایت
ترتیب
انتخاب دستی / قانون / ترکیبی  (provenance chip trio)
ذخیره
اعتبارسنجی
تعارض نسخه — نسخهٔ سرور تغییر کرده است
بارگذاری مجدد تغییرات من
ویرایشگر تایم‌لاین
افزودن ردیف
حذف با تأیید
مرتب‌سازی
نقطهٔ تمرکز تصویر
حق نشر و مجوز
ویرایشگر گراف
نسخهٔ پیش‌نویس
نسخهٔ فعال
فعال‌سازی نسخه
مسدود به دلیل خطا
پیش‌نمایش فهرست معنایی
```

(Any additional string required during packets goes through same review note path — never invent silently.)

## Handoff contract

Per packet identical to Track AB §Handoff: branch atlas-af-<id>, manifest, screenshots under repo-artifact convention, commands+outputs, commit hash, escalation notes. Push/deploy forbidden without owner approval (MODE §5 discipline applies even though targets are dev-local).

---

## Engineering doctrine — admin SPA quality bar (applies to every AF packet)

> Goal (FA): SPA ادمین باید **کامپوننت‌محور، state قابل‌پیش‌بینی (reducer-first)، RTL-safe و بدون وابستگی اضافه** توسعه یابد تا صفحهٔ جدید = composition کامپوننت‌های موجود + یک reducer + یک spec باشد.

### Component-driven rules

1. **Three-layer React anatomy**, mirroring the public-side doctrine:
   `ui primitives (existing buttons/badges/inputs in the SPA kit) → domain components (FocalPicker, RevisionConflictDialog, OrderedDraftList…) → screens (route modules composing them)`.
   - A screen file contains routing params → data fetch orchestration → composition; presentation logic deeper than styling-cascade belongs DOWN one layer. The ~300-line screen figure is a SMELL THRESHOLD, not a cap (completeness-over-budget protocol mirrored from Track WF §7.5): a screen with many genuinely distinct regions may legitimately exceed it — extract only along NATURAL component seams (e.g., its reducer, its dialogs); otherwise ship complete + TECH_DEBT id. NEVER trim states, keyboard paths, or error handling to hit the number — those failures block the packet at gate row 2/6 anyway.
   - Reuse check before any new component: search existing kit first (registry file found at AF-00); near-duplicate creation is REJECT — extend props/variants instead. Same single-source-of-truth principle as WF §7.1(2).
2. **Reducer/state-machine first for interactive screens** (established by Home Composer): multi-step flows (edit→validate→save→conflict) get an explicit pure reducer with named actions and unit tests covering every transition incl. edge cases. Ad-hoc `useState` webs inside large screens are blocked at review; small leaf components may use local state freely.
3. **API access only via typed clients**: all fetches go through the existing app client pattern + `adminApiExt.ts` typed functions. No component builds URLs/fetch calls inline; ProblemDetails tokens flow to i18n mapping, never rendered raw English on fa UI.
4. **Accessibility parity built-in**: every new control reachable by keyboard from screen load order; dialogs trap+restore focus (reuse existing modal primitive); labels bound programmatically (`htmlFor`/`id`); color never sole meaning carrier (pairs with icon/text). Screen-level qa run includes keyboard-only walkthrough evidence.

### Scalability & maintainability rules

1. **Zero-new-runtime-deps default**: implement with platform + existing libs (SVG graph, CSS transforms). Adding a library requires a Task-Spec authorization line naming bundle-size budget + rationale reviewed by integration lead — same gate as public side.
2. **i18n complete-at-commit**: strings land in both dictionaries in the SAME commit introducing them; Appendix A canonical Persian entries copied byte-exact (ZWNJ preserved); new composed phrases approved via review note, never silently invented (public-side rule mirrored).
3. **RTL logical-property discipline**: `margin-inline`, `inset-inline-*`; physical `left/right` grep gate stays zero-tolerance in changed files (per-established checklist).
4. **Deletion-friendly growth** (ties MODE §7): replaced screens delete their directories in the adopt commit; route registry diff proves no dangling import; dead-export sweep output pasted at CLEAN packets.
5. **State isolation**: server-cache vs editor-draft separation stays explicit (draft reducers own dirty state; server cache invalidates only after successful save) so future features (undo history, autosave v2) plug into ONE layer.

### Enforced quality gates

| # | Check | How | Fail |
|---|---|---|---|
| 1 | Build + type-check green | npm scripts per loop | error |
| 2 | Reducer tests present | new interactive feature ships reducer file + tests ≥ named transitions | missing |
| 3 | Dependency purity | `package.json` runtime deps count unchanged unless Task-Spec line | silent add |
| 4 | i18n parity | dict diff has matching keys en/fa in same commit | orphan key |
| 5 | Zone purity | diff limited to `apps/admin/**` | foreign edit |
| 6 | Keyboard-only pass recorded | WORK_LOG notes tab-order walkthrough or e2e keyboard spec | untested |

WORK_LOG entries append `Doctrine compliance: [items verified]` consistent with sibling tracks.
