// WF-07F adoption QA gate for the Teaching/Learning family (source-scan).
//
// Plain Node script, no dependencies. Scans the teaching route sources to
// enforce the TRACK-WF WF-07F contract (PF-06: a publishing library, not a
// commercial LMS - honest-empty, no invented learning-platform UI):
//
//   templates : fa/en teaching index pages compose EditorialIndexTemplate
//               and detail pages compose LongFormTemplate (one template
//               per page, adopted in both locales, no cross-adoption)
//   legacy    : adopt-equals-delete - the pre-adoption catalog-page shell
//               and its bespoke inline styles are fully retired
//   index     : results are ContentRow items linking the detail route; the
//               type badge carries the CMS level field; format/language
//               render through ContentRow's MetadataGroup with absent
//               values omitted; the honest empty state renders via
//               ContentState; the H1 arrives via SectionLead as="h1"
//   detail    : the lead carries the H1 plus course metadata through
//               MetadataGroup (level/format/language/availability/license/
//               last-updated, absent values omitted); prerequisites and
//               outcomes render as real lists only when the CMS provides
//               them; body HTML and accessibility notes are preserved; the
//               related close links the teaching index and contact (a
//               detail page never ends with only the footer)
//   honesty   : availability/license stay truthful (unavailable note with
//               role="status"); missing-translation keeps its honest notice;
//               no enrolment/progress/certificate/price UI markers are
//               invented anywhere in the family
//   doctrine  : pages keep token discipline (no raw hex/px), and the CMS
//               loader remains the only data source

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");

const pagePaths = {
  enIndex: join(webRoot, "src", "pages", "en", "teaching", "index.astro"),
  enDetail: join(webRoot, "src", "pages", "en", "teaching", "[slug].astro"),
  faIndex: join(webRoot, "src", "pages", "fa", "teaching", "index.astro"),
  faDetail: join(webRoot, "src", "pages", "fa", "teaching", "[slug].astro"),
};

const failures = [];
const passed = [];
const check = (ok, message) => {
  if (ok) passed.push(message);
  else failures.push(message);
  return ok;
};

const sources = {};
for (const [key, path] of Object.entries(pagePaths)) {
  try {
    sources[key] = readFileSync(path, "utf8");
  } catch {
    sources[key] = null;
    failures.push(`missing teaching route source: ${key} (${path})`);
  }
}

for (const locale of ["en", "fa"]) {
  const index = sources[`${locale}Index`];
  const detail = sources[`${locale}Detail`];
  if (index === null || detail === null) continue;

  // --- template adoption (one template per page, both locales) ------------
  check(
    index.includes("EditorialIndexTemplate") &&
      /import\s+EditorialIndexTemplate\s+from\s+"(\.\.\/)+layouts\/EditorialIndexTemplate\.astro"/.test(index),
    `${locale}/teaching/index.astro: composes EditorialIndexTemplate`,
  );
  check(
    detail.includes("LongFormTemplate") &&
      /import\s+LongFormTemplate\s+from\s+"(\.\.\/)+layouts\/LongFormTemplate\.astro"/.test(detail),
    `${locale}/teaching/[slug].astro: composes LongFormTemplate`,
  );
  check(
    !index.includes("LongFormTemplate") && !detail.includes("EditorialIndexTemplate"),
    `${locale}/teaching: exactly one template per page (no cross-adoption)`,
  );
  check(
    !index.includes("catalog-page") && !detail.includes("catalog-page"),
    `${locale}/teaching: pre-adoption catalog-page shell retired (adopt-equals-delete)`,
  );

  // --- index: ContentRow results + honest empty state ----------------------
  check(
    /import\s+ContentRow\s+from\s+"(\.\.\/)+components\/content\/ContentRow\.astro"/.test(index),
    `${locale} index: results are ContentRow items`,
  );
  check(
    /href=\{`\/\$\{locale\}\/teaching\/\$\{item\.slug\}\/`\}/.test(index),
    `${locale} index: every ContentRow links the detail route`,
  );
  check(
    /type=\{item\.level\}/.test(index),
    `${locale} index: type badge carries the CMS level field (source value, no invented dictionary)`,
  );
  check(
    /metadata=\{\[/.test(index) &&
      index.includes("t.formatLabel") &&
      index.includes("t.languageLabel"),
    `${locale} index: format/language metadata flows into ContentRow (MetadataGroup, absent omitted)`,
  );
  check(
    /<ContentState\s+slot="results"\s+kind="empty"/.test(index) && index.includes("t.empty"),
    `${locale} index: honest empty state via ContentState (kind="empty", t.empty)`,
  );
  check(
    index.includes("SectionLead") && /<SectionLead\s+slot="sectionLead"\s+as="h1"/.test(index),
    `${locale} index: single H1 arrives via SectionLead as="h1" in the sectionLead slot`,
  );

  // --- detail: lead anatomy (title + level/format metadata) ----------------
  check(
    detail.includes("SectionLead") &&
      /slot="articleLead"/.test(detail) &&
      /<SectionLead\s+as="h1"/.test(detail),
    `${locale} detail: single H1 arrives via SectionLead as="h1" in the articleLead slot`,
  );
  check(
    !index.includes("<h1") && !detail.includes("<h1"),
    `${locale} teaching: no literal <h1> outside the lead components`,
  );
  check(
    /import\s+MetadataGroup\s+from\s+"(\.\.\/)+components\/content\/MetadataGroup\.astro"/.test(detail) &&
      /<MetadataGroup\s+items=/.test(detail),
    `${locale} detail: lead metadata renders via MetadataGroup`,
  );
  check(
    detail.includes("t.levelLabel") && detail.includes("t.formatLabel"),
    `${locale} detail: lead metadata carries level and format labels`,
  );

  // --- detail: prerequisites/outcomes as real lists, omit when absent ------
  check(
    detail.includes("t.prerequisitesLabel") && detail.includes("t.outcomesLabel"),
    `${locale} detail: prerequisites/outcomes sections keep their labels`,
  );
  check(
    /prerequisites\.map\(/.test(detail) && /outcomes\.map\(/.test(detail) && detail.includes("<ul"),
    `${locale} detail: prerequisites/outcomes render as real lists from loader lines`,
  );

  // --- detail: body/accessibility preserved + related close ----------------
  check(
    /set:html=\{course\.body\}/.test(detail),
    `${locale} detail: sanitized CMS body HTML is preserved in the body slot`,
  );
  check(
    detail.includes("t.accessibilityLabel") && detail.includes("course.accessibility_notes"),
    `${locale} detail: accessibility notes preserved (omitted when absent)`,
  );
  check(
    /slot="related"/.test(detail) &&
      detail.includes("`/${locale}/teaching/`") &&
      detail.includes("`/${locale}/contact/`"),
    `${locale} detail: related close links the real teaching index and contact pages`,
  );
  check(
    detail.includes("t.missingTranslation"),
    `${locale} detail: honest missing-translation notice preserved`,
  );

  // --- honesty: availability/license, no invented LMS UI --------------------
  check(
    detail.includes("t.availabilityLabel") && detail.includes("t.licenseLabel"),
    `${locale} detail: availability/license stay visible as lead metadata`,
  );
  check(
    detail.includes("t.unavailableNote") && /role="status"/.test(detail),
    `${locale} detail: restricted courses render the honest unavailable note (role="status")`,
  );
  const allSources = `${index}\n${detail}`;
  // Marker scan audits real markup/copy, not frontmatter documentation:
  // strip block comments (/* ... */) and HTML comments first.
  const markup = allSources.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/<!--[\s\S]*?-->/g, " ");
  const lmsMarkers = markup.match(
    /enrol|progress|certificat|add\s*to\s*cart|checkout|\bprice\b|sign\s*-?\s*up/gi,
  );
  check(
    !lmsMarkers,
    `${locale} teaching: no LMS-invented UI markers (enrol/progress/certificate/cart/checkout/price/signup) — found${
      lmsMarkers ? `: ${[...new Set(lmsMarkers)].join(", ")}` : " none"
    }`,
  );

  // --- doctrine --------------------------------------------------------------
  const hex = allSources.match(/#[0-9a-fA-F]{3,8}\b/g);
  check(!hex, `${locale} teaching: no raw hex colors in route sources`);
  const px = allSources.match(/\b\d+px\b/g);
  check(!px, `${locale} teaching: no raw px values in route sources`);
  check(
    /from\s+"(\.\.\/)+lib\/cms\/courses"/.test(index) &&
      /from\s+"(\.\.\/)+lib\/cms\/courses"/.test(detail),
    `${locale} teaching: both routes load through lib/cms/courses (loader is the only data source)`,
  );
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`teaching-adopt.spec: FAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `teaching-adopt.spec: PASS — ${passed.length} checks: fa/en teaching routes adopt EditorialIndexTemplate + LongFormTemplate, ContentRow results with level badge + MetadataGroup format/language, honest empty state, real prerequisite/outcome lists, availability/license honesty, zero LMS-invented UI markers, doctrine-clean sources`,
);
