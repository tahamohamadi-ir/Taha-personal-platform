/* WF-06 Visual Atlas fixtures - asset inventory. Rows describe REAL
   repository assets with fixture-only review state: unpublished: true.
   No real private data, no invented academic facts (MASTER-SPEC 7).
   Rendered only inside DESIGN_ATLAS=1 builds; derived responsive masters
   belong to WF-09. */

export const fixtureMeta = {
  unpublished: true,
  source: "design-atlas fixture (local-only, never published)",
} as const;

export const assetInventoryFixture = [
  {
    role: "identity",
    asset: "public/favicon.png",
    crop: "square",
    alt: "Site favicon; decorative in-page (empty alt)",
    approval: "in production",
  },
  {
    role: "decorative",
    asset: "Assets/site-redesign art masters (untouched)",
    crop: "per WF-09 derivative plan",
    alt: "decorative (empty alt)",
    approval: "unreviewed fixture",
  },
  {
    role: "evidence",
    asset: "fixture placeholder (no real media)",
    crop: "16:9 reserved",
    alt: "described by the record caption",
    approval: "unreviewed fixture",
  },
];
