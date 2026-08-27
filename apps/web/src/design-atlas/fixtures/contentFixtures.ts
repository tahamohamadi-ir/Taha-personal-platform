/* WF-06 Visual Atlas fixtures - content components. Placeholder data for
   the local-only /_design/ specimens: unpublished: true. No real private
   contact data, no invented academic facts, no production publication
   state (MASTER-SPEC 7). Rendered only inside DESIGN_ATLAS=1 builds. */

export const fixtureMeta = {
  unpublished: true,
  source: "design-atlas fixture (local-only, never published)",
} as const;

export const metadataFixture = [
  { label: "Status", value: "Unpublished fixture (never live)" },
  { label: "Link", value: "https://example.org/atlas-fixture", ltr: true },
];

export const sectionLeadFixture = {
  eyebrow: "Fixture eyebrow",
  heading: "Fixture section heading",
  summary: "Fixture summary line: placeholder copy for the atlas.",
};

export const featuredRecordFixture = {
  label: "Fixture selection",
  title: "Fixture featured record",
  summary: "Placeholder summary for the featured-record specimen.",
  metadata: metadataFixture,
};

export const contentRowsFixture = [
  {
    type: "Fixture type",
    title: "Fixture linked row",
    href: "/_design/",
    excerpt: "Placeholder excerpt: the atlas links only to itself.",
    metadata: metadataFixture,
    tags: ["fixture", "unpublished"],
    status: "Unpublished fixture",
  },
  {
    title: "Fixture unlinked row",
    excerpt: "Placeholder excerpt without a destination link.",
    tags: ["fixture"],
  },
];

export const publicationFixture = {
  type: "Fixture type",
  status: "Unpublished fixture",
  statusTone: "neutral" as const,
  title: "Fixture publication title (placeholder)",
  authors: ["Fixture Author One", "Fixture Author Two"],
  venue: "Fixture venue (no real journal)",
  date: "2026-08",
  identifier: "fixture-only (no real DOI)",
};

export const timelineFixture = [
  {
    type: "milestone",
    label: "Fixture milestone one",
    period: "1400-1402",
    summary: "Placeholder summary for the timeline specimen.",
  },
  {
    label: "Fixture milestone two",
    period: "1403",
    summary: "Placeholder summary with a detail link.",
    detail: { href: "/_design/", label: "Fixture detail link" },
  },
];

export const tocFixture = [
  { id: "atlas-toc-1", label: "Fixture section one", level: 1 as const },
  { id: "atlas-toc-2", label: "Fixture subsection", level: 2 as const },
  { id: "atlas-toc-3", label: "Fixture section two", level: 1 as const },
];

export const contactCtaFixture = {
  statement: "Fixture CTA statement: the atlas never sends messages anywhere.",
  primary: { label: "Fixture primary CTA", href: "/_design/" },
  secondary: { label: "Fixture secondary CTA", href: "/_design/" },
};

export const mediaTilesFixture = [
  {
    src: "/favicon.png",
    alt: "",
    width: 4,
    height: 3,
    caption: "Fixture grid tile (public favicon asset)",
    record: { href: "/_design/", label: "Fixture record link" },
    variant: "grid" as const,
  },
  {
    src: "/favicon.png",
    alt: "",
    width: 16,
    height: 9,
    caption: "Fixture lead tile",
    record: { href: "/_design/", label: "Fixture record link" },
    variant: "lead" as const,
  },
  {
    width: 16,
    height: 9,
    caption:
      "Fixture failed-media tile: caption and record link survive without the asset",
    record: { href: "/_design/", label: "Fixture record link" },
    variant: "failed" as const,
  },
];
