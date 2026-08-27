/* WF-06 Visual Atlas fixtures - UI primitives. Placeholder data for the
   local-only /_design/ specimens: unpublished: true. No real private data,
   no invented academic facts, no production publication state (MASTER-SPEC
   7). Rendered only inside DESIGN_ATLAS=1 builds. */

export const fixtureMeta = {
  unpublished: true,
  source: "design-atlas fixture (local-only, never published)",
} as const;

export const emailFieldFixture = {
  label: "Email address",
  name: "atlas-email",
  hint: "Fixture hint: never delivered anywhere.",
  value: "fixture@example.org",
};

export const messageFieldFixture = {
  label: "Message",
  name: "atlas-message",
  hint: "Fixture hint: value survives failed submissions.",
  value: "Fixture placeholder text for the textarea specimen.",
};

export const inputErrorFixture = {
  label: "Account name",
  name: "atlas-account",
  error: "Fixture error: this value is not acceptable.",
  value: "kept-after-error",
};

export const textareaErrorFixture = {
  label: "Summary",
  name: "atlas-summary",
  error: "Fixture error: keep it shorter.",
  value: "kept fixture text",
};
