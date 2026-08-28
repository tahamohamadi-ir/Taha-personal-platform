# LEGACY-INVENTORY — superseded-code sweep ledger (MODE §7.3)

> Deletion ledger for Track WF. Rows follow `TRACK-MODE-environment-and-cutover.md` §7.3:
> `<path> :: superseded-by <new-file-or-template> :: verified-deleted YES/NO(+reason)`.
> Appended at each WF-03..07x adoption close; executed by WF-CLEAN. History is append-only.

## Executed by WF-CLEAN (2026-08-27)

All rows below verified zero-import immediately before deletion
(`rg "<Name>" src --glob '!**/LEGACY*'` — self/none only; path-specific greps used
to disambiguate same-name components such as `sections/ContactCTA` vs
`content/ContactCTA` and `primitives/Chip` vs `ui/Chip`). Cross-checked with
ephemeral `npx unimported` (0 unimported `.astro` files) — no config file added to
the repo, no dependency removed from `package.json`.

| path | superseded-by | verified-deleted |
|---|---|---|
| `src/components/ResearchCatalog.astro` | `src/pages/{fa,en}/research/index.astro` composing the shared layer (WF-07B: `CollectionIndexTemplate` + `ui/Chip` taxonomy; qa/research-publications.spec.mjs asserts the import stays gone) | YES |
| `src/components/blog/ArticleCard.astro` | writing/blog index pages on `EditorialIndexTemplate`/`CollectionIndexTemplate` + `content/ContentRow` composition (WF-07E) | YES |
| `src/components/blog/ArticleDetail.astro` | `src/layouts/LongFormTemplate.astro` + `src/components/StoryBody.astro` (WF-07E) | YES |
| `src/components/blog/TagList.astro` | tag rendering inside writing index/detail pages (WF-07E); its only consumers were ArticleCard/ArticleDetail above | YES |
| `src/components/About.astro` | `src/pages/{fa,en}/about.astro` on `UtilityTemplate` (WF-07G); page comment declared the file remaining only for this sweep | YES |
| `src/components/Downloads.astro` | `src/pages/{fa,en}/cv.astro` + downloads index on `UtilityTemplate` (WF-07G); exported `DownloadFile` type relocated to `src/data/cvDownloads.ts` (its only consumer) in the same packet | YES |
| `src/components/sections/PerspectiveGrid.astro` | `HomeTemplate` 8-block narrative via homeComposition adapter (WF-07A); Landing.astro no longer imports it | YES |
| `src/components/sections/EvidenceSection.astro` | `HomeTemplate` 8-block narrative (WF-07A) | YES |
| `src/components/sections/WritingLatest.astro` | `HomeTemplate` 8-block narrative (WF-07A) | YES |
| `src/components/sections/ContactCTA.astro` | `src/components/content/ContactCTA.astro` (WF-04 shared content component; 7 live importers) | YES |
| `src/components/patterns/CatalogPage.astro` | `src/layouts/CollectionIndexTemplate.astro` (WF-05 templates own index composition) | YES |
| `src/components/patterns/DetailShell.astro` | `src/layouts/{LongFormTemplate,EvidenceDetailTemplate}.astro` (WF-05) | YES |
| `src/components/primitives/Kicker.astro` | `ui/` primitives layer (WF-02; lead/kicker role owned by `content/SectionLead`) | YES |
| `src/components/primitives/MetaRow.astro` | `ui/` primitives layer (WF-02; metadata owned by `content/MetadataGroup`) | YES |
| `src/components/primitives/Btn.astro` | `src/components/ui/Button.astro` (WF-02) | YES |
| `src/components/primitives/Chip.astro` | `src/components/ui/Chip.astro` (WF-02) | YES |

Empty directories removed after deletion: `src/components/patterns/`,
`src/components/primitives/`.

## Retained by decision (explicit non-deletion)

| path | zero-import? | reason retained |
|---|---|---|
| `src/components/Landing.astro` | no (imported by `{fa,en}/index.astro`) | RETAINED as night-stage wrapper per WF-07A/ADR-0031; zero-import wrapper (imports nothing) — compiles after section deletions (verified by 58-page build) |
| `src/components/projects/CaseStudyDetail.astro` | no (imported by `projects/[slug].astro` both locales) | 07C noted a related-dup, but it is still used by the story branch — FORBIDDEN to delete |
| `src/components/Lightbox.astro` | no | native `<dialog>` lightbox retained per WF-07D |
| `src/components/sections/HeroSection.astro` | no (imported by `{fa,en}/index.astro`) | live home lead slot |
| `src/components/sections/FocusStrip.astro` | no (imported by `{fa,en}/index.astro`) | live home lead slot |
| `src/components/StoryBody.astro` | no (12 importers) | live long-form body renderer |
| `src/components/islands/Constellation3D.tsx` | no (imported by HeroSection) | bounded-authorized three.js island |

No file with verified zero imports was left undeleted.

## WF-CLEAN tool findings (ephemeral, not committed to package.json)

- `npx unimported` (entries passed via temporary config, deleted after the run):
  **0 unimported `.astro` files** (confirms the component sweep); its 15 "unimported"
  `.ts` files are resolver false-positives (extensionless imports from `.astro`
  frontmatter are not followed by the tool) — each of the 15 has verified live
  importers via grep.
- `npx depcheck --ignores=@types/*`: reported unused `gsap` plus false positives
  (`@fontsource-variable/inter`, `@fontsource-variable/vazirmatn` — CSS `@import`
  in `global.css`; `tailwindcss` — `@tailwindcss/vite` plugin peer in
  `astro.config.mjs`; devDeps `@astrojs/check` = `npm run check`, `pagefind` =
  `npm run build` + CI, `typescript` = check/vitest). **No dependency removed.**
  `gsap` has zero references in `src`/config — removal is an owner decision under
  motion-governance (same bounded-asset class as `three`; NOT uninstalled here).
