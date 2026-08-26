# Multi-agent operating model

## 1. Integration model

Use one integration lead and bounded worker branches. Workers do not share a
writable worktree. Start only after this reference branch has been merged to the
selected integration base.

```text
integration/base
├── atlas-a-tokens
├── atlas-b-primitives
├── atlas-c-shell
├── atlas-d-content
├── atlas-e-templates
├── atlas-f-playground
├── atlas-g-cms-audit
├── atlas-h-graph
└── atlas-i-qa
```

The actual branch base must be named by the owner/integration lead. Agents must
not assume `main` contains this package until they verify it.

## 2. Required startup sequence for every agent

1. Read repository `AGENTS.md`, `docs/README.md`, `PROJECT_MANIFEST.md`.
2. Read this reference `README.md`, `MASTER-SPEC.md`, assigned work packet and
   `ACCEPTANCE-GATES.md`.
3. Run `git status --short`, `git branch --show-current`, `git rev-parse HEAD`.
4. Run `node Assets/site-redesign/implementation-reference/agent-kit/validate.mjs`.
5. Confirm assigned files do not overlap another active worker.
6. Create an active repository Task Spec for the packet before runtime changes.
7. Record every actual action in the repository Work Log.

## 3. File ownership

| Owner | Exclusive paths while active |
|---|---|
| Integration lead | `docs/plan/README.md`, shared ledgers, root manifests, final route adoption |
| Token agent | `apps/web/src/styles/global.css`, Design Contract token sections, generated token bridge |
| Primitive agent | new primitive/form/feedback components and their unit/spec fixtures |
| Shell agent | `BaseLayout`, Header, Footer, Breadcrumbs, gateway and navigation QA |
| Content agent | shared cards, rows, metadata, timeline, media and TOC components |
| Template agent | shared template components; page route files only after shell/content merge |
| Atlas agent | `src/design-atlas/**`, atlas launcher, atlas QA; no production component ownership |
| CMS audit agent | audit/spec files only until a separately approved schema/API packet |
| Graph agent | graph renderer/editor-specific paths and graph QA |
| QA agent | Playwright/QA files and reports; fixes return to owning agent unless trivial and approved |

No two active agents edit `global.css`, `Header.astro`, `BaseLayout.astro`,
`content.ts`, `astro.config.mjs`, `package.json`, or the same ledger concurrently.

## 4. Interfaces that must remain stable

```ts
export type ThemeName = "light" | "dark" | "system";
export type Direction = "ltr" | "rtl";
export type AtlasViewport = 320 | 390 | 768 | 1024 | 1280 | 1440;
export type ContentState =
  | "ready"
  | "loading"
  | "empty"
  | "no-results"
  | "error"
  | "unavailable-translation";

export interface AtlasFixture<T> {
  id: string;
  label: string;
  locale: "en" | "fa";
  direction: Direction;
  state: ContentState;
  unpublished: true;
  data: T;
}

export interface GraphNodePublic {
  id: string;
  type: string;
  label: string;
  summary?: string;
  accessibleLabel: string;
  colorRole: string;
  iconRole: string;
  weight: number;
  position: { x: number; y: number; z?: number };
  relatedRecords: Array<{ family: string; id: string }>;
}

export interface GraphEdgePublic {
  id: string;
  source: string;
  target: string;
  relationType: string;
  directed: boolean;
  weight: number;
  explanation?: string;
}
```

If current CMS DTOs use different fields, the CMS audit reports the mapping.
It does not silently rename production fields to match these target interfaces.

## 5. Handoff contract

Every worker delivers:

- branch name and base commit;
- exact changed-file manifest;
- interface changes;
- tests/commands actually run and exact result;
- screenshots for every affected representative state;
- content/privacy/RTL/accessibility notes;
- new risk, debt or deferred IDs;
- commit hash; no push or deployment unless separately authorized.

The integration lead rejects a handoff when it contains unowned files, invented
content, unexplained raw visual values, public atlas routes, skipped RTL/state
coverage, or claims unsupported by command output.

## 6. Merge order

```text
Reference package
  → Tokens
  → Primitives
  → Shell + Content components (parallel after primitives)
  → Templates + Atlas (parallel after their interfaces stabilize)
  → Route adoption
  → CMS alignment + Graph Phase 1
  → QA hardening
  → documentation reconciliation
  → production approval/deploy task
```

Use small commits per accepted work packet. Do not squash away evidence before
review. Resolve conflicts by the authority/ownership table, never by taking the
larger or newer file blindly.

