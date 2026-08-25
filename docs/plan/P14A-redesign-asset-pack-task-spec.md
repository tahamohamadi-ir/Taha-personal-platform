# P14A — Redesign asset pack and provenance catalog

**Status:** DONE

## Task: Package approved redesign assets for implementation

- Goal: create a project-local, implementation-ready asset pack containing the authoritative owner logo, standalone generated artwork, selected final design references, and a precise source/licensing/usage catalog.
- User/actor and journey: the owner and future implementation agent can find, evaluate, and use every approved visual asset without copying UI mockups, guessing provenance, or inventing brand geometry.
- Release type: `STANDARD`
- Risk level: Low; documentation and binary design assets only.
- Owner and handoff recipient: Taha Mohammadi; frontend/CMS implementation agent.

## Scope

- In scope:
  - preserve and reuse the existing owner-authoritative logo PNG without redrawing it;
  - create standalone, text-free project artwork for gateway/hero and content preview families;
  - copy the authoritative final concept references into the asset pack;
  - document source, license, intended use, cropping, responsive behavior, alt-text guidance, and approval state;
  - record prompts and generation mode for generated artwork.
- Non-goals:
  - no frontend implementation, route change, CMS model/API change, production content, deployment, or production publication;
  - no deletion or replacement of owner files already under `Assets/`;
  - no hand-drawn or traced substitute for a missing native logo vector;
  - no copying of imagery or code from inspiration websites.
- Allowed files:
  - `Assets/site-redesign/**`
  - `docs/design-redesign/README.md`
  - `docs/plan/P14A-redesign-asset-pack-task-spec.md`
  - `docs/plan/README.md`
  - `docs/status/WORK_LOG.md`
- Forbidden files:
  - `apps/**`
  - `infra/**`
  - `.github/**`
  - existing owner files outside `Assets/site-redesign/**`
  - CMS schemas, migrations, API contracts, route contracts, and production configuration

## Contracts and data

- Documents/ADRs/API schemas/models read: `AGENTS.md`, `PROJECT_MANIFEST.md`, `docs/README.md`, `docs/plan/README.md`, P14 design package and quality audit.
- Contracts changed: none; this is a design-handoff extension.
- Migration/data impact: none.
- Locale, visibility and publication impact: assets are bilingual-neutral and unpublished; UI copy remains CMS-owned.
- Security/privacy impact: no phone, private email, sensitive employer data, real project data, or owner biography is embedded in generated artwork.

## Verification and release

- Tests/commands to run:
  - decode every PNG and report its pixel dimensions;
  - verify required manifest entries and local paths resolve;
  - scan generated artwork documentation for unresolved placeholders and prohibited claims;
  - run `git diff --check`;
  - review the exact changed-file manifest and confirm all paths are task-owned.
- Manual QA path: inspect each standalone artwork at full size and as a center/edge crop; confirm no text, watermark, fake logo, or UI chrome is embedded.
- Acceptance criteria:
  - the exact owner logo is available as optimized PNG derivatives, with the missing-native-SVG limitation stated honestly;
  - each generated artwork is a standalone visual layer, not a screenshot of a page;
  - final Light/Dark and focused concept references are clearly separated from implementation assets;
  - every external dependency or inspiration link is identified as first-party source, dependency, or reference-only;
  - no app/runtime file changes.
- Rollback/fallback: remove `Assets/site-redesign/**` and revert only this spec/index/log documentation.
- Documentation to update: `docs/status/WORK_LOG.md`, `docs/plan/README.md`, `docs/design-redesign/README.md`.

## Handoff

- Files changed (task-owned only): `Assets/site-redesign/**`,
  `docs/design-redesign/README.md`, this spec, `docs/plan/README.md`, and
  `docs/status/WORK_LOG.md`.
- Verification actually run (command + result): all 15 PNGs decoded with
  positive dimensions; all 15 SHA-256 entries matched; 9 logo/concept copies
  matched their source bytes; required pack documents resolved; exact-scope
  path review found no runtime file; `git diff --check` passed.
- Deferred/risk IDs: native SVG logo source remains owner-supplied if required; PNG is the exact authoritative fallback.
- Explicit blockers and next input: none for asset-pack creation. Owner visual
  approval and responsive AVIF/WebP derivatives belong to the frontend adoption
  task; frontend adoption remains separately authorized.
