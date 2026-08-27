// WF-07C route-family adoption QA (source scan; mirrors the structural style
// of qa/page-templates.spec.mjs). Plain Node script, no dependencies.
//
// Asserts the projects family is composed from the shared template/component
// layer and that the family behavior contracts survive the adoption:
//
//   index  : imports CollectionIndexTemplate; single H1 via SectionLead
//            (no literal <h1>); results are ContentRow rows carrying the
//            type badge from the CMS source value; URL-backed no-JS filter
//            form (method="get" with the preserved "type"/"sort" params);
//            honest ContentState empty panel when the loader returns [];
//            CI marker (data-project-catalog) still present
//   detail : imports EvidenceDetailTemplate; fills the lead/metadata/body
//            slots; keeps the StoryBody fallback branch; keeps the
//            sanitized-evidence disclosure rendering verbatim through the
//            imported CaseStudyDetail (source provenance per evidence item)
//   both   : fa + en routes adopted; no legacy ProjectsCatalog import left
//            in the family (adopt = the shared layer owns rendering)

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const pagesRoot = join(webRoot, "src", "pages");

const failures = [];
const passed = [];
const check = (ok, message) => {
  if (ok) passed.push(message);
  else failures.push(message);
  return ok;
};

function readSource(relativePath) {
  try {
    return readFileSync(join(pagesRoot, relativePath), "utf8");
  } catch {
    return null;
  }
}

// --- sanitized-evidence disclosure carrier (verbatim rendering) -------------
const caseStudyDetailSrc = (() => {
  try {
    return readFileSync(
      join(webRoot, "src", "components", "projects", "CaseStudyDetail.astro"),
      "utf8",
    );
  } catch {
    return null;
  }
})();
check(
  caseStudyDetailSrc !== null &&
    caseStudyDetailSrc.includes('<span class="source"> ({e.source})</span>'),
  "disclosure: CaseStudyDetail keeps the sanitized-evidence source disclosure rendering verbatim",
);

// --- per-locale adoption contract ---------------------------------------------
for (const locale of ["en", "fa"]) {
  const indexSrc = readSource(join(locale, "projects", "index.astro"));
  const detailSrc = readSource(join(locale, "projects", "[slug].astro"));

  check(indexSrc !== null, `${locale}: projects/index.astro is readable`);
  check(detailSrc !== null, `${locale}: projects/[slug].astro is readable`);
  if (indexSrc === null || detailSrc === null) continue;

  // index -> CollectionIndexTemplate
  check(
    indexSrc.includes('from "../../../layouts/CollectionIndexTemplate.astro"'),
    `${locale} index: adopted onto CollectionIndexTemplate`,
  );
  check(
    !/<h1[\s>]/.test(indexSrc),
    `${locale} index: no literal <h1> (single H1 arrives via SectionLead as="h1")`,
  );
  check(
    indexSrc.includes('<SectionLead') && indexSrc.includes('as="h1"'),
    `${locale} index: section lead opens the collection as the single H1`,
  );
  check(
    indexSrc.includes("<ContentRow"),
    `${locale} index: results are ContentRow rows`,
  );
  check(
    indexSrc.includes("type={project.project_type}"),
    `${locale} index: type badge label comes from the CMS source value (existing type source kept)`,
  );
  check(
    /method="get"/.test(indexSrc),
    `${locale} index: filter form is a real GET form (no-JS operable)`,
  );
  check(
    indexSrc.includes('name="type"') && indexSrc.includes('name="sort"'),
    `${locale} index: URL param names preserved (type + sort)`,
  );
  check(
    indexSrc.includes("[data-project-filter]") &&
      indexSrc.includes("[data-project-sort]") &&
      indexSrc.includes("[data-project-list]"),
    `${locale} index: URL-backed filter/sort hooks preserved for the enhancement script`,
  );
  check(
    indexSrc.includes('kind="empty"'),
    `${locale} index: honest ContentState empty panel when the loader returns []`,
  );
  check(
    indexSrc.includes("data-project-catalog"),
    `${locale} index: CI marker data-project-catalog still present`,
  );
  check(
    !indexSrc.includes("import ProjectsCatalog") && !indexSrc.includes("<ProjectsCatalog"),
    `${locale} index: legacy ProjectsCatalog import removed`,
  );

  // detail -> EvidenceDetailTemplate
  check(
    detailSrc.includes('from "../../../layouts/EvidenceDetailTemplate.astro"'),
    `${locale} detail: adopted onto EvidenceDetailTemplate`,
  );
  check(
    !/<h1[\s>]/.test(detailSrc),
    `${locale} detail: no literal <h1> (single H1 arrives via SectionLead as="h1")`,
  );
  check(
    detailSrc.includes('slot="lead"'),
    `${locale} detail: lead slot filled (title + summary + status)`,
  );
  check(
    detailSrc.includes('slot="metadata"') && detailSrc.includes("<MetadataGroup"),
    `${locale} detail: metadata slot filled via MetadataGroup`,
  );
  check(
    detailSrc.includes('slot="body"'),
    `${locale} detail: body slot filled`,
  );
  check(
    detailSrc.includes("import CaseStudyDetail") &&
      detailSrc.includes("<CaseStudyDetail"),
    `${locale} detail: sanitized-evidence disclosure preserved via CaseStudyDetail`,
  );
  check(
    detailSrc.includes("import StoryBody") && detailSrc.includes("<StoryBody"),
    `${locale} detail: published-story body branch preserved`,
  );
  check(
    detailSrc.includes("getStaticPaths") && detailSrc.includes("Astro.redirect"),
    `${locale} detail: static path generation + missing-project redirect preserved`,
  );
  check(
    !detailSrc.includes("import ProjectsCatalog") && !detailSrc.includes("<ProjectsCatalog"),
    `${locale} detail: legacy ProjectsCatalog import removed`,
  );
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`projects-adopt.spec: FAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `projects-adopt.spec: PASS — ${passed.length} adoption checks: both locales composed from CollectionIndexTemplate/EvidenceDetailTemplate, ContentRow results, GET filter form with preserved type/sort params, honest empty state, sanitized-evidence disclosure kept verbatim`,
);
