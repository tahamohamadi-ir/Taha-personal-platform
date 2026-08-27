# Admin SPA UX Audit — first slice (X-04)

Scope: `apps/cms/admin-frontend/src/**` as of `main` @ `9ff1731` (2026-08-24).
Method: full read of all 29 source files (~11k LOC) + targeted greps for
`aria-*`, `role=`, `focus`, `dir=`, `console.*`, `window.(confirm|prompt)`.
No features invented; everything below cites existing code. Line numbers refer
to this snapshot (pre-fix); FIXED entries note their post-fix location.

## How the SPA handles things today (survey)

- **Stack**: React 18 + Vite 6 + TS, react-router 6 (`basename=/admin`),
  Tailwind v4 preflight + a hand-rolled `admin-*` CSS layer in `index.css`,
  zero component libraries. Persian-first: `index.html` sets `lang="fa"
  dir="rtl"`; Vazirmatn font.
- **Pages** (`src/pages/`): Dashboard, ContentList, ContentEdit, MediaLibrary,
  Overview, CompositionList, CompositionEditor, Settings, Tags, Featured,
  Security, Login, NotFound. **Components**: AdminLayout, MediaPicker,
  MediaThumb, ItemListField, ArticleStoryEditor, ProfileNestedEditor,
  ProjectCaseMediaEditor. **Lib**: `api.ts` (typed fetch wrapper, `ApiError`
  with `fields` map + 401 handler), `AuthContext` (bootstrap/login/logout),
  `entities/format/composition/workflow`.
- **Loading**: every list/editor page has a `loading | ready | error` state
  with a centered «در حال بارگذاری…» block (mostly `role="status"`).
- **Errors**: consistent `ApiError` surface; field-level errors render via
  `FieldErrorList` with `aria-invalid` + `aria-describedby` (ContentEdit,
  Tags, Featured, Settings do this correctly); top-level failures get
  `role="alert"` banners + retry buttons.
- **Empty states**: all lists distinguish "no results for filters" vs "nothing
  yet"; revisions/queue/documents have honest empties.
- **RTL**: root `dir="rtl"`; CSS uses logical properties (`border-inline-*`);
  mixed-direction content marked `dir="ltr"`/`dir="auto"` per element.
- **Keyboard/a11y strong points**: media cards are real `<button>`s with
  `:focus-visible`; dialogs have Escape handlers + `aria-modal` +
  `autoFocus` close button; tables have `sr-only` captions and `scope="col"`;
  filter tabs use `aria-current="page"`; uploads expose `role="progressbar"`
  with values.

## Findings

### P1 — blockers

| # | Area | Finding | Evidence |
|---|------|---------|----------|
| P1-1 | Form validation feedback | **Login form errors are invisible to assistive tech.** Field errors render as plain `<p>`s with no `id`, and inputs carry no `aria-invalid`/`aria-describedby`; the combined form error has no `role="alert"`. Every other form in the SPA does this correctly (contrast `ContentEditPage.tsx:268-326`). | `src/pages/LoginPage.tsx:52-61, 62-66, 72-81, 82-86, 92-105, 107-114` |
| P1-2 | Focus management | **Dialogs have no focus trap, no focus restore, and the background stays active.** All three dialogs (media picker, upload modal, edit drawer) handle Escape and set `autoFocus` on the close button, but Tab walks straight out into the page behind, and closing never returns focus to the trigger that opened them. | `src/components/MediaPicker.tsx:174-195`; `src/pages/MediaLibraryPage.tsx:163-184, 481-500` |
| P1-3 | Loading states | **The auth bootstrap screen references an undefined class.** `AuthGuard` renders `<div className="admin-loading">` but `.admin-loading` is not defined anywhere in `index.css`, so the full-app gate renders as raw uncentered text while every other loader is styled. | `src/lib/AuthContext.tsx:124`; `src/index.css` (class absent — grep confirms only usage) |
| P1-4 | Keyboard navigation | **No global `:focus-visible` fallback.** Only `.admin-input:focus` (`index.css:101`) and `.admin-media-card:focus-visible` (`index.css:483`) define focus indicators; `.admin-btn` (`index.css:62-89`), `.admin-tab` (`:262-282`), sidebar NavLinks (`AdminLayout.tsx:70-79`), color swatches (`:187-196`) rely on whatever the UA default happens to be — inconsistent/invisible on some controls. | `src/index.css:101-104, 483-486` vs rest of stylesheet |
| P1-5 | Error handling / visual | **Composition list status chips lose their badge styling, and its error box is silent.** The status `<span>` omits the `admin-status-badge` base class other pages use, so statuses render as bare colored text; the load-error box also lacks `role="alert"`. Correct pattern: `ContentListPage.tsx:466-470`. | `src/pages/CompositionListPage.tsx:135-142, 171-178` |

### P2 — polish

| # | Area | Finding | Evidence |
|---|------|---------|----------|
| P2-1 | Error handling | Composition editor's loading/load-error/save-error/conflict boxes lack `role="status"`/`role="alert"` (rest of SPA announces these). | `src/pages/CompositionEditorPage.tsx:194-207, 766-782` |
| P2-2 | Form validation feedback | Media upload modal & edit drawer set `aria-invalid` but their error `<ul>`s have no `id`, so nothing links back via `aria-describedby`. | `src/pages/MediaLibraryPage.tsx:213-221, 235-243, 557-565` |
| P2-3 | Form semantics | `ItemListField` labels aren't associated with their inputs (no `htmlFor`/`id`) and the field error isn't announced. | `src/components/ItemListField.tsx:74-98, 112` |
| P2-4 | Form validation feedback | Scheduling a publish uses `window.prompt` for a UTC datetime — free text, no format validation or picker feedback until the server rejects. | `src/pages/ContentEditPage.tsx:514-523` |
| P2-5 | Error handling | Destructive actions across the SPA go through native `window.confirm` (accessible but blunt; no inline undo pattern). Consistent, so acceptable short-term. | `ContentListPage.tsx:228`, `TagsPage.tsx:277`, `FeaturedPage.tsx:499`, `MediaLibraryPage.tsx:416, 631`, `CompositionEditorPage.tsx:249, 301`, `ContentEditPage.tsx:524, 581` |
| P2-6 | RTL support | Physical direction utilities inside an RTL app: `ml-2` margins and `border-r-2 pr-2` blockquote instead of logical `ms/me`/`border-s`. Works today by accident of RTL geometry; fragile under any LTR reuse. | `src/pages/CompositionListPage.tsx:138`; `src/pages/CompositionEditorPage.tsx:702, 775, 778` |
| P2-7 | Contrast/design tokens | Stale token reference `border-[var(--color-border)]` — that variable doesn't exist in this stylesheet (it defines `--admin-border`), so the revision rows fall back to `currentColor` borders (visually heavier). Compare the correct usage in Settings. | `src/pages/ContentEditPage.tsx:928` vs `src/pages/SettingsPage.tsx:427` |
| P2-8 | Hygiene | Debug `console.log("MediaPicker selected", …)` left in the selection handler. | `src/pages/MediaLibraryPage.tsx:865` |
| P2-9 | Loading states | Busy buttons degrade to a bare «…» label (logout, login submit, tag save) with no `aria-busy` and no text alternative beyond the ellipsis. | `AdminLayout.tsx:94-101`; `LoginPage.tsx:115-121`; `TagsPage.tsx:555-562` |
| P2-10 | Contrast | Small (12px) badge texts sit borderline at AA: `#a16207` on `#fffbeb` ≈ 4.7:1 (`review`/`incomplete`) and `#6b7280` on `#f4f4f5` ≈ 4.5:1 (`unknown`/inactive). Passes, but zero headroom for any tint change. | `src/index.css:302-306, 338-342, 241-245, 326-330` |
| P2-11 | Keyboard navigation | No skip-to-content link past the 10-item sidebar; keyboard users tab through the whole nav on every route change. | `src/components/AdminLayout.tsx:59-107` |
| P2-12 | Empty states / tables | Composition table headers lack `scope="col"` and the table has no caption; its empty state lacks `role="status"` (all other tables get both). | `src/pages/CompositionListPage.tsx:144-148, 151-159` |
| P2-13 | Loading states | Security page initial load is a bare `<p>` without `role="status"`; if the first load fails there is no retry control (unlike every other page). | `src/pages/SecurityPage.tsx:18-29, 99-100` |

## Quick wins applied (this slice)

### FIX-1 — Login form error announcements — **FIXED**

`src/pages/LoginPage.tsx`: each input now carries `aria-invalid` +
`aria-describedby` pointing at an id'd error message (`login-email-error`,
`login-password-error`, `login-otp-error`), and the combined form error box
got `role="alert"`. Brings the login form up to the same contract as
ContentEdit/Tags/Featured/Settings. Before: errors were sighted-only; after:
screen readers announce invalid fields and the submit failure.

### FIX-2 — Defined `.admin-loading` + global `:focus-visible` fallback — **FIXED**

`src/index.css`: added the missing `.admin-loading` rule (full-height centered,
muted — matches the visual language of every other loader) so the auth gate in
`AuthContext.tsx:124` stops rendering unstyled; added a global
`:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: 2px }`
fallback so buttons, tabs, nav links, swatches and every other interactive
element have a consistent, brand-colored keyboard focus indicator.

### FIX-3 — Composition list status badges + announced errors — **FIXED**

`src/pages/CompositionListPage.tsx`: status `<span>` now includes the
`admin-status-badge` base class (pill padding/border like every other status
chip — see `ContentListPage.tsx:466-470`), and the load-error box got
`role="alert"` so failures are announced.

## Deliberately NOT fixed here (next slice candidates)

- P1-2 dialog focus trap + focus restore + `inert` background — needs a shared
  dialog primitive touching three components; too large for a ≤20-line win.
- P2-4 replace `window.prompt` scheduling with a validated datetime field.
- P2-6/P2-7 sweep of physical utilities + stale tokens once B-wave lands.

## Verification

- `npm run build` (tsc -b && vite build) — green after fixes (see PR body).
- Django sanity: `manage.py check` with test settings — no issues (CMS untouched).
