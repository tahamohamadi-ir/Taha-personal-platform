// WF-07B structural QA gate (source-scan, no build needed).
//
// Plain Node script, no dependencies. Asserts that the research and
// publications route families are adopted onto the WF-05 page templates
// exactly as the frozen page-templates ROUTE_MAP requires:
//
//   research index            -> CollectionIndexTemplate
//   research topics/{slug}    -> CollectionIndexTemplate
//   research statement        -> LongFormTemplate
//   publications index        -> CollectionIndexTemplate
//   publications/{slug}       -> EvidenceDetailTemplate
//
// plus the WF-07B packet rules:
//   - publications index rows render through content/PublicationRow and
//     link the canonical /{locale}/publications/{slug}/ detail URLs
//     (p8 parity depends on those links)
//   - both indexes carry the honest-empty ui/ContentState kind="empty"
//     for the zero-result loader case
//   - research index keeps the URL-driven type filter markup
//     (data-research-filter / data-research-sort) and links topics via
//     taxonomy Chip links (no raster graph, no ResearchCatalog)
//   - statement keeps its PDF link fields (statement_pdf + download)
//   - publications detail keeps the citation block and MetadataGroup
//   - IA-CONTRACT 4b: research/publications/{slug} stays redirect-only
//     (301 to the canonical publications detail) and no
//     research/publications detail catalog exists
//   - adopted page sources are ASCII (Persian arrives via dictionary
//     strings or \u escapes) and token-only (no raw hex; px only in
//     hairline border/outline declarations)

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesRoot = join(here, "..", "src", "pages");

const failures = [];
const passed = [];
const check = (ok, message) => {
  if (ok) passed.push(message);
  else failures.push(message);
  return ok;
};

function readSource(locale, rel) {
  const full = join(pagesRoot, locale, ...rel.split("/"));
  if (!existsSync(full)) {
    failures.push(`missing page source: ${locale}/${rel}`);
    return null;
  }
  return readFileSync(full, "utf8");
}

function doctrineScan(label, src) {
  const hex = src.match(/#[0-9a-fA-F]{3,8}\b/g);
  check(!hex, `${label}: no raw hex colors${hex ? ` (found ${hex.join(", ")})` : ""}`);
  const pxProblems = [];
  for (const line of src.split(/\r?\n/)) {
    for (const m of line.matchAll(/\b\d+px\b/g)) {
      if (!/border|outline|box-shadow/.test(line)) pxProblems.push(line.trim());
    }
  }
  check(
    pxProblems.length === 0,
    `${label}: px only inside border/outline/box-shadow declarations${pxProblems.length ? ` (found ${pxProblems.length})` : ""}`,
  );
  check(
    !/[^\x00-\x7F]/.test(src),
    `${label}: ASCII-only source (Persian arrives via dictionary strings or \\u escapes)`,
  );
}

for (const locale of ["en", "fa"]) {
  // --- research index -> CollectionIndexTemplate --------------------------------
  const researchIndex = readSource(locale, "research/index.astro");
  if (researchIndex !== null) {
    check(
      researchIndex.includes("CollectionIndexTemplate"),
      `${locale} research index: adopted onto CollectionIndexTemplate`,
    );
    check(
      researchIndex.includes('slot="breadcrumbs"') &&
        researchIndex.includes('slot="sectionLead"') &&
        researchIndex.includes('slot="results"'),
      `${locale} research index: fills the breadcrumbs/sectionLead/results slots`,
    );
    check(
      researchIndex.includes('as="h1"') && !/<h1[\s>]/.test(researchIndex),
      `${locale} research index: single H1 arrives via SectionLead as="h1" (no literal <h1>)`,
    );
    check(
      researchIndex.includes("ContentRow"),
      `${locale} research index: results render through content/ContentRow`,
    );
    check(
      researchIndex.includes("ContentState") && researchIndex.includes('kind="empty"'),
      `${locale} research index: honest-empty ContentState kind="empty" for the zero case`,
    );
    check(
      researchIndex.includes("data-research-filter") && researchIndex.includes("data-research-sort"),
      `${locale} research index: existing URL-driven type/sort filter markup preserved`,
    );
    check(
      researchIndex.includes("Chip") && researchIndex.includes('variant="taxonomy"'),
      `${locale} research index: topic links use taxonomy Chip links`,
    );
    check(
      researchIndex.includes(`/research/topics/`),
      `${locale} research index: chips link the topic detail routes`,
    );
    check(
      !researchIndex.includes("ResearchCatalog"),
      `${locale} research index: no ResearchCatalog import (adopted page composes the shared layer)`,
    );
    doctrineScan(`${locale} research index`, researchIndex);
  }

  // --- research statement -> LongFormTemplate -----------------------------------
  const statement = readSource(locale, "research/statement.astro");
  if (statement !== null) {
    check(
      statement.includes("LongFormTemplate"),
      `${locale} research statement: adopted onto LongFormTemplate`,
    );
    check(
      statement.includes('as="h1"') && !/<h1[\s>]/.test(statement),
      `${locale} research statement: single H1 arrives via SectionLead as="h1" (no literal <h1>)`,
    );
    check(
      statement.includes("statement_pdf") && statement.includes("download"),
      `${locale} research statement: PDF link fields preserved`,
    );
    check(
      statement.includes("ContentState") && statement.includes('kind="empty"'),
      `${locale} research statement: honest-empty ContentState when no statement is published`,
    );
    check(
      statement.includes('slot="articleLead"') && statement.includes('slot="body"'),
      `${locale} research statement: fills the required articleLead/body slots`,
    );
    doctrineScan(`${locale} research statement`, statement);
  }

  // --- research topics/{slug} -> CollectionIndexTemplate ------------------------
  const topicDetail = readSource(locale, "research/topics/[slug].astro");
  if (topicDetail !== null) {
    check(
      topicDetail.includes("CollectionIndexTemplate"),
      `${locale} research topic detail: adopted onto CollectionIndexTemplate (frozen route-map family "research topics")`,
    );
    check(
      topicDetail.includes('as="h1"') && !/<h1[\s>]/.test(topicDetail),
      `${locale} research topic detail: single H1 arrives via SectionLead as="h1" (no literal <h1>)`,
    );
    check(
      topicDetail.includes("ContentRow"),
      `${locale} research topic detail: related projects/publications render through ContentRow`,
    );
    check(
      topicDetail.includes("Chip") && topicDetail.includes('"selected"'),
      `${locale} research topic detail: sibling topic chips mark the current topic as selected`,
    );
    check(
      topicDetail.includes("/publications/${") ||
        topicDetail.includes("`/${locale}/publications/${p.slug}/`"),
      `${locale} research topic detail: publications link the canonical /publications/{slug}/ detail`,
    );
    doctrineScan(`${locale} research topic detail`, topicDetail);
  }

  // --- publications index -> CollectionIndexTemplate ----------------------------
  const pubIndex = readSource(locale, "publications/index.astro");
  if (pubIndex !== null) {
    check(
      pubIndex.includes("CollectionIndexTemplate"),
      `${locale} publications index: adopted onto CollectionIndexTemplate`,
    );
    check(
      pubIndex.includes("PublicationRow"),
      `${locale} publications index: rows render through content/PublicationRow`,
    );
    check(
      pubIndex.includes("ContentState") && pubIndex.includes('kind="empty"'),
      `${locale} publications index: honest-empty ContentState kind="empty" for the zero case`,
    );
    check(
      pubIndex.includes("`/${locale}/publications/${pub.slug}/`"),
      `${locale} publications index: rows link the canonical /publications/{slug}/ detail (p8 parity links)`,
    );
    check(
      pubIndex.includes('as="h1"') && !/<h1[\s>]/.test(pubIndex),
      `${locale} publications index: single H1 arrives via SectionLead as="h1" (no literal <h1>)`,
    );
    check(
      pubIndex.includes("getPublications"),
      `${locale} publications index: data comes from the shared publications loader`,
    );
    doctrineScan(`${locale} publications index`, pubIndex);
  }

  // --- publications detail -> EvidenceDetailTemplate ----------------------------
  const pubDetail = readSource(locale, "publications/[slug].astro");
  if (pubDetail !== null) {
    check(
      pubDetail.includes("EvidenceDetailTemplate"),
      `${locale} publications detail: adopted onto EvidenceDetailTemplate`,
    );
    check(
      pubDetail.includes('as="h1"') && !/<h1[\s>]/.test(pubDetail),
      `${locale} publications detail: single H1 arrives via SectionLead as="h1" (no literal <h1>)`,
    );
    check(
      pubDetail.includes("MetadataGroup"),
      `${locale} publications detail: metadata renders through content/MetadataGroup (definition-list semantics)`,
    );
    check(
      pubDetail.includes("publication.doi") && pubDetail.includes('ltr: true'),
      `${locale} publications detail: DOI is an omitted-when-absent bdi-isolated metadata item`,
    );
    check(
      pubDetail.includes("citation_text"),
      `${locale} publications detail: citation block preserved`,
    );
    check(
      pubDetail.includes('slot="lead"') &&
        pubDetail.includes('slot="metadata"') &&
        pubDetail.includes('slot="body"') &&
        pubDetail.includes('slot="related"'),
      `${locale} publications detail: fills the lead/metadata/body/related slots`,
    );
    doctrineScan(`${locale} publications detail`, pubDetail);
  }

  // --- IA-CONTRACT 4b: research/publications stays redirect-only -----------------
  const legacyDetail = join(pagesRoot, locale, "research", "publications", "[slug].astro");
  check(
    existsSync(legacyDetail),
    `${locale} research/publications/[slug]: legacy redirect file still exists`,
  );
  if (existsSync(legacyDetail)) {
    const legacy = readFileSync(legacyDetail, "utf8");
    check(
      legacy.includes("Astro.redirect") && legacy.includes("301"),
      `${locale} research/publications/[slug]: permanent 301 redirect to canonical publications detail`,
    );
    check(
      !legacy.includes("EvidenceDetailTemplate") && !legacy.includes("BaseLayout"),
      `${locale} research/publications/[slug]: redirect-only (no detail page shell)`,
    );
  }
  check(
    !existsSync(join(pagesRoot, locale, "research", "publications", "index.astro")),
    `${locale} research/publications: no index catalog (canonical catalog is /publications/)`,
  );
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`research-publications.spec: FAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `research-publications.spec: PASS — ${passed.length} checks: research index/topics on CollectionIndexTemplate, statement on LongFormTemplate, publications index (PublicationRow + canonical links) and detail on EvidenceDetailTemplate, honest-empty ContentState, URL-driven filters + taxonomy topic chips preserved, redirect-only research/publications, ASCII token-only sources`,
);
