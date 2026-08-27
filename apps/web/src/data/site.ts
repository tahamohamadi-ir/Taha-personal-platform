export const site = {
  url: "https://tahamohamadi.ir",
  version: "0.1.0",
  locales: ["fa", "en"] as const,
} as const;

export type LocaleCode = (typeof site.locales)[number];

/*
  WF-07A (LAUNCH-CRITICAL): home composition block names and the documented
  default order. The 8 keys mirror the canonical narrative of agent-kit
  templates.json (homepageOrder) and HomeTemplate's CANONICAL_ORDER; the
  home-composition QA spec drift-guards the two against each other.
  DEFAULT_HOME_ORDER is the honest fallback when
  GET /api/home-composition/{locale} is absent (404 fail-closed when nothing
  is published) or the CMS base is unset (snapshot mode) - never a silent
  empty home, and never a build failure.
*/
export type HomeBlock =
  | "lead"
  | "graph"
  | "researchFit"
  | "journey"
  | "projects"
  | "publications"
  | "previews"
  | "cta";

export const DEFAULT_HOME_ORDER: HomeBlock[] = [
  "lead",
  "graph",
  "researchFit",
  "journey",
  "projects",
  "publications",
  "previews",
  "cta",
];
