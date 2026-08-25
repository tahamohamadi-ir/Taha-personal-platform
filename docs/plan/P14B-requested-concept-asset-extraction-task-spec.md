# P14B — Requested concept asset extraction

**Status:** DONE

## Task: Package reusable assets represented in the requested concept set

- Goal: preserve the five owner-selected concept references and add the missing standalone, text-free visual layers needed to implement their gateway and project-preview direction.
- User/actor and journey: the owner and frontend agent can use clean artwork rather than slicing text or UI out of generated page screenshots.
- Release type: `STANDARD`
- Risk level: Low; design binaries and handoff documentation only.
- Owner and handoff recipient: Taha Mohammadi; frontend implementation agent.

## Scope

- In scope:
  - copy the five explicitly requested concept PNGs into the existing asset pack with descriptive filenames;
  - identify exact duplicates of already approved P14 references rather than treating them as new design authority;
  - create a centered portal/orbit artwork pair and missing standalone project-cover families represented in the concepts;
  - update prompt, manifest, source/usage, and integrity documentation.
- Non-goals:
  - no pixel-sliced buttons, headings, cards, icons, graph labels, or publication text;
  - no logo recreation, biography/content invention, frontend code, CMS/API/schema, route, deployment, or production change;
  - the constellation graph, timeline icons, and interface controls remain code/data-native.
- Allowed files:
  - `Assets/site-redesign/**`
  - `docs/plan/P14B-requested-concept-asset-extraction-task-spec.md`
  - `docs/plan/README.md`
  - `docs/status/WORK_LOG.md`
- Forbidden files:
  - `apps/**`
  - `infra/**`
  - `.github/**`
  - existing owner files outside `Assets/site-redesign/**`

## Contracts and data

- Documents read: root agent rules, P14/P14A package, existing asset catalog, prompt log, manifest, and integrity hashes.
- Contracts changed: none.
- Migration/data impact: none.
- Locale, visibility and publication impact: generated art is locale-neutral and unpublished; copy remains CMS-owned.
- Security/privacy impact: no contact, employer-sensitive, identity, publication, or project-data claim may be embedded in standalone art.

## Verification and release

- Tests/commands to run:
  - decode all PNGs and record dimensions;
  - verify requested-source files match the supplied input bytes;
  - verify every binary hash in `SHA256SUMS.txt`;
  - scan documentation for prohibited claims/placeholders;
  - run staged exact-scope and `git diff --cached --check` checks.
- Manual QA path: inspect every new standalone asset for text, logo, UI chrome, watermarks, and responsive crop safety.
- Acceptance criteria:
  - all five requested sources are present and provenance-labelled;
  - missing visual layers are supplied as standalone PNG masters;
  - existing reusable P14A art is referenced instead of regenerated unnecessarily;
  - dynamic graph/timeline/icon assets remain native implementation work;
  - no runtime file changes.
- Rollback/fallback: revert only the P14B files and P14A catalog additions.
- Documentation to update: pack README, prompts, manifest, hashes, plan index, Work Log.

## Handoff

- Files changed: five requested references and five new standalone artworks
  under `Assets/site-redesign/**`; pack README/prompt/manifest/hash updates;
  this spec, plan index, and Work Log.
- Verification actually run: 25/25 managed PNGs decoded; 25/25 recorded
  SHA-256 entries matched; 5/5 requested reference copies matched supplied
  source bytes; content-boundary scan and exact diff check passed.
- Deferred/risk IDs: public optimization and owner approval remain implementation gates.
- Explicit blockers and next input: none for asset creation. Dynamic graph,
  timeline, icons, and responsive delivery remain native implementation work.
