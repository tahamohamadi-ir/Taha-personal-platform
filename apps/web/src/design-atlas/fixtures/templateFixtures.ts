/* WF-06 Visual Atlas fixtures - page templates. Placeholder data for the
   local-only /_design/ specimens: unpublished: true. No real private
   contact data, no invented academic facts, no production publication
   state (MASTER-SPEC 7). Rendered only inside DESIGN_ATLAS=1 builds. */

export const fixtureMeta = {
  unpublished: true,
  source: "design-atlas fixture (local-only, never published)",
} as const;

export const homeLeadFixture = {
  eyebrow: "Fixture identity",
  heading: "Fixture home lead",
  summary: "Placeholder identity lead for the home-template specimen.",
};

export const breadcrumbsFixture = [
  { href: "/_design/", label: "Fixture root" },
  { label: "Fixture page" },
];

export const longFormBodyFixture = [
  "Fixture paragraph one: placeholder prose for the long-form specimen. The atlas never publishes real article bodies.",
  "Fixture paragraph two: placeholder prose; the reading measure comes from the --measure-prose token.",
];

export const evidenceBodyFixture = [
  "Fixture evidence body paragraph: placeholder copy for the evidence-detail specimen.",
];

export const evidenceLimitationsFixture =
  "Fixture limitations note: placeholder for the optional limitations/rights region.";

export const utilityContentFixture = [
  "Fixture utility content: placeholder for the about/cv/contact/search family body.",
];
