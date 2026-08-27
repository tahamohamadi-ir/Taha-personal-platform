// WF-07D adoption QA gate for the Creative/Gallery family (source-scan).
//
// Plain Node script, no dependencies. Scans the creative route sources and
// the shared lightbox component to enforce the TRACK-WF WF-07D contract:
//
//   templates : fa/en creative index pages compose CollectionIndexTemplate
//               and detail pages compose EvidenceDetailTemplate (one
//               template per page, adopted in both locales)
//   legacy    : adopt-equals-delete - the pre-adoption page shell and the
//               bespoke inline gallery dialog (gallery-dialog markup +
//               inline script) are fully retired from the routes
//   grid      : index results are a MediaTile grid; every tile reserves
//               the media frame and carries a record link to the detail
//               route; the honest empty state renders via ContentState
//   evidence  : detail lead comes from SectionLead as="h1" (single H1),
//               metadata is a MetadataGroup over creator/role/date/license/
//               rights with absent fields omitted
//   lightbox  : the native <dialog> lightbox is wired on the detail media
//               slot through the shared Lightbox component, which retains
//               the focus-trap, Escape-close and prefers-reduced-motion
//               semantics; gallery images stay anchors so no-JS keeps
//               direct file links
//   honesty   : access_state gates the media - a restricted work renders
//               the unavailable note and never the cover/gallery asset;
//               rights/licence lines come from loader fields only
//   doctrine  : pages keep token discipline (no raw hex/px), no literal
//               <h1>, and the CMS loader remains the only data source

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");

const pagePaths = {
  enIndex: join(webRoot, "src", "pages", "en", "creative", "index.astro"),
  enDetail: join(webRoot, "src", "pages", "en", "creative", "[slug].astro"),
  faIndex: join(webRoot, "src", "pages", "fa", "creative", "index.astro"),
  faDetail: join(webRoot, "src", "pages", "fa", "creative", "[slug].astro"),
};

const lightboxPath = join(webRoot, "src", "components", "Lightbox.astro");

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
    failures.push(`missing creative route source: ${key} (${path})`);
  }
}

let lightbox = null;
try {
  lightbox = readFileSync(lightboxPath, "utf8");
} catch {
  failures.push(`missing shared lightbox component: ${lightboxPath}`);
}

for (const locale of ["en", "fa"]) {
  const index = sources[`${locale}Index`];
  const detail = sources[`${locale}Detail`];
  if (index === null || detail === null) continue;

  // --- template adoption (one template per page, both locales) ------------
  check(
    index.includes("CollectionIndexTemplate") &&
      /import\s+CollectionIndexTemplate\s+from\s+"(\.\.\/)+layouts\/CollectionIndexTemplate\.astro"/.test(index),
    `${locale}/creative/index.astro: composes CollectionIndexTemplate`,
  );
  check(
    detail.includes("EvidenceDetailTemplate") &&
      /import\s+EvidenceDetailTemplate\s+from\s+"(\.\.\/)+layouts\/EvidenceDetailTemplate\.astro"/.test(detail),
    `${locale}/creative/[slug].astro: composes EvidenceDetailTemplate`,
  );
  check(
    !index.includes("EvidenceDetailTemplate") && !detail.includes("CollectionIndexTemplate"),
    `${locale}/creative: exactly one template per page (no cross-adoption)`,
  );
  check(
    !index.includes('class="catalog-page"') && !detail.includes('class="catalog-page"'),
    `${locale}/creative: pre-adoption page shell retired (adopt-equals-delete)`,
  );

  // --- index: MediaTile grid + honest empty state --------------------------
  check(/import\s+MediaTile\s+from/.test(index), `${locale} index: results grid uses MediaTile`);
  check(
    /record=\{\{\s*href:\s*`\/\$\{locale\}\/creative\/\$\{item\.slug\}\/`/.test(index),
    `${locale} index: every MediaTile record links the detail route`,
  );
  check(
    /width=\{4\}/.test(index) && /height=\{3\}/.test(index),
    `${locale} index: MediaTile reserves the frame aspect (4/3)`,
  );
  check(
    /<ContentState\s+slot="results"\s+kind="empty"/.test(index) && index.includes("t.empty"),
    `${locale} index: honest empty state via ContentState (kind="empty", t.empty)`,
  );
  check(
    index.includes("SectionLead") && /<SectionLead\s+slot="sectionLead"\s+as="h1"/.test(index),
    `${locale} index: single H1 arrives via SectionLead as="h1" in the sectionLead slot`,
  );
  check(
    !index.includes("<h1"),
    `${locale} index: no literal <h1> outside the lead slot component`,
  );

  // --- detail: evidence anatomy --------------------------------------------
  check(
    detail.includes("SectionLead") &&
      /slot="lead"/.test(detail) &&
      /<SectionLead\s+as="h1"/.test(detail),
    `${locale} detail: single H1 arrives via SectionLead as="h1" in the lead slot`,
  );
  check(
    !detail.includes("<h1"),
    `${locale} detail: no literal <h1> outside the lead slot component`,
  );
  check(
    /import\s+MetadataGroup\s+from/.test(detail) && /slot="metadata"/.test(detail),
    `${locale} detail: metadata renders via MetadataGroup in the metadata slot`,
  );
  for (const label of ["creatorLabel", "roleLabel", "dateLabel", "licenseLabel", "rightsLabel"]) {
    check(
      detail.includes(`t.${label}`),
      `${locale} detail: MetadataGroup carries ${label} from loader fields (absent values omitted)`,
    );
  }

  // --- detail: native <dialog> lightbox semantics ---------------------------
  check(
    /import\s+Lightbox\s+from\s+"(\.\.\/)+components\/Lightbox\.astro"/.test(detail),
    `${locale} detail: wires the shared native <dialog> lightbox (Lightbox import)`,
  );
  check(
    /data-lightbox/.test(detail) && /<Lightbox\s*\/?>/.test(detail),
    `${locale} detail: gallery images are lightbox anchors and <Lightbox /> mounts once`,
  );
  check(
    detail.includes("loading=\"lazy\"") || /loading=\{?"lazy"/.test(detail),
    `${locale} detail: gallery images keep lazy loading`,
  );

  // --- detail: access_state honesty -----------------------------------------
  check(
    /access_state\s*!==\s*"public"/.test(detail),
    `${locale} detail: restricted gate derives from access_state !== "public"`,
  );
  check(
    detail.includes("t.restrictedNote") && /role="status"/.test(detail),
    `${locale} detail: restricted works render the honest unavailable note (role="status")`,
  );
  check(
    /isRestricted\s*&&/.test(detail),
    `${locale} detail: media/body rendering is guarded by the restricted gate (asset never leaks)`,
  );

  // --- doctrine --------------------------------------------------------------
  const hex = `${index}\n${detail}`.match(/#[0-9a-fA-F]{3,8}\b/g);
  check(!hex, `${locale} creative: no raw hex colors in route sources`);
  const px = `${index}\n${detail}`.match(/\b\d+px\b/g);
  check(!px, `${locale} creative: no raw px values in route sources`);
  check(
    /from\s+"(\.\.\/)+lib\/cms\/creative"/.test(index) &&
      /from\s+"(\.\.\/)+lib\/cms\/creative"/.test(detail),
    `${locale} creative: both routes load through lib/cms/creative (loader is the only data source)`,
  );

  // --- adopt-equals-delete: bespoke inline dialog retired -------------------
  check(
    !index.includes("gallery-dialog") && !detail.includes("gallery-dialog"),
    `${locale} creative: bespoke inline gallery dialog markup retired`,
  );
  check(
    !detail.includes("dialog-prev") && !detail.includes("dialog-next"),
    `${locale} creative: bespoke inline dialog navigation script retired`,
  );
}

// --- shared lightbox semantics (focus-trap + Esc + reduced-motion) -----------
if (lightbox !== null) {
  check(lightbox.includes("<dialog"), "Lightbox: renders a native <dialog> element");
  check(
    lightbox.includes("showModal"),
    "Lightbox: opens through native showModal (inert background focus containment)",
  );
  check(
    lightbox.includes('"Tab"') && lightbox.includes("focusables"),
    "Lightbox: retains the Tab focus-trap over dialog focusables",
  );
  check(
    lightbox.includes("prefers-reduced-motion"),
    "Lightbox: retains prefers-reduced-motion handling",
  );
  check(
    lightbox.includes("restoreFocus") && lightbox.includes('addEventListener("close"'),
    "Lightbox: restores focus to the invoker when the dialog closes (Esc/close)",
  );
  check(
    lightbox.includes("a[data-lightbox]"),
    "Lightbox: no-JS keeps direct file links via a[data-lightbox] anchors",
  );
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`creative-adopt.spec: FAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `creative-adopt.spec: PASS — ${passed.length} checks: fa/en creative routes adopt CollectionIndexTemplate + EvidenceDetailTemplate, MediaTile grid with honest empty state, MetadataGroup evidence metadata, shared native <dialog> lightbox (focus-trap, Esc, reduced-motion), access_state honesty, doctrine-clean sources`,
);
