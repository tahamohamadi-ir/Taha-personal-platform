// WF-07A (LAUNCH-CRITICAL) home composition QA gate.
// Plain Node source-scan spec, same style as the sibling specs. Covers BOTH
// composition paths required by the TRACK-WF WF-07A row:
//   published-composition path : the adapter maps a 200 payload from
//                                GET /api/home-composition/{locale} into an
//                                ordered subset permutation
//   404/absent default path    : 404/unset/invalid resolve { order: null }
//                                (never a throw - this endpoint must not fail
//                                builds) and the pages fall back to the
//                                documented DEFAULT_HOME_ORDER with a
//                                warn-once console.warn
//
//   adapter : src/lib/cms/homeComposition.ts exists, uses the shared
//             cmsFetchJson helper against /api/home-composition/{locale}, is
//             an ALLOW-404 endpoint (zero throw statements in the module),
//             resolves null immediately when the base is unset (snapshot
//             mode), and maps 200 payloads by sorting on `order`, dropping
//             unknown keys, collapsing duplicates and requiring the
//             narrative frame (lead + cta) else null.
//   default : src/data/site.ts exports the HomeBlock type plus
//             DEFAULT_HOME_ORDER with exactly the 8 canonical keys in
//             canonical order, byte-equal to HomeTemplate's CANONICAL_ORDER
//             (drift guard between the constant and the guarded template).
//   pages   : src/pages/{fa,en}/index.astro import HomeTemplate and the
//             homeComposition adapter, pass the order prop, fall back to
//             ?? DEFAULT_HOME_ORDER, warn once per build when the CMS base is
//             set but no composition is published (isCmsOriginBuild guard),
//             and keep the cms-build-origin meta wiring (landing.source).
//   stage   : Landing.astro stays the night-stage wrapper (zero imports,
//             default slot) carrying the semantic role remap so the
//             theme-aware WF-04 content components stay readable on the
//             fixed night canvas (ADR-0031) in both themes.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");

// Canonical 8-block narrative (agent-kit templates.json homepageOrder).
const CANONICAL_ORDER = [
  "lead",
  "graph",
  "researchFit",
  "journey",
  "projects",
  "publications",
  "previews",
  "cta",
];

const failures = [];
const passed = [];
const check = (ok, message) => {
  if (ok) passed.push(message);
  else failures.push(message);
  return ok;
};

function readSource(relativePath, label) {
  const target = join(webRoot, relativePath);
  if (!existsSync(target)) {
    failures.push(`missing file: ${relativePath}`);
    return null;
  }
  try {
    return readFileSync(target, "utf8");
  } catch (error) {
    failures.push(`${label}: unreadable (${error.message})`);
    return null;
  }
}

// --- adapter: src/lib/cms/homeComposition.ts ---------------------------------
{
  const adapter = readSource("src/lib/cms/homeComposition.ts", "adapter");
  if (adapter !== null) {
    check(
      adapter.includes("export async function fetchHomeComposition"),
      "adapter: exports fetchHomeComposition",
    );
    check(
      adapter.includes("/api/home-composition/"),
      "adapter: targets the BK-01 public read GET /api/home-composition/{locale}",
    );
    check(
      adapter.includes("cmsFetchJson"),
      "adapter: reuses the shared CMS_API_BASE fetch helper conventions",
    );
    check(
      !/\bthrow\b/.test(adapter),
      "adapter: ALLOW-404 endpoint - the module contains no throw statement (a missing composition must never fail builds)",
    );
    const unsetIdx = adapter.indexOf('kind === "unset"');
    check(
      unsetIdx >= 0 &&
        /order:\s*null/.test(adapter.slice(unsetIdx, unsetIdx + 160)),
      "adapter: CMS_API_BASE unset resolves order null immediately (snapshot mode)",
    );
    const notFoundIdx = adapter.indexOf("status === 404");
    check(
      notFoundIdx >= 0 &&
        /order:\s*null/.test(adapter.slice(notFoundIdx, notFoundIdx + 160)),
      "adapter: the 404 branch resolves order null (never a throw)",
    );
    check(
      adapter.includes("ALLOW-404"),
      "adapter: documents the ALLOW-404 contract at the 404 branch",
    );
    check(
      adapter.includes("Array.isArray(payload.modules)"),
      "adapter (200 path): validates the published modules payload shape",
    );
    check(
      adapter.includes(".sort("),
      "adapter (200 path): orders the published modules by their order value",
    );
    check(
      adapter.includes("CANONICAL_KEYS.includes"),
      "adapter (200 path): drops unknown block keys before the guarded template sees them",
    );
    check(
      adapter.includes("FRAME_KEYS"),
      "adapter (200 path): requires the narrative frame (lead + cta) else falls back to null",
    );
    check(
      /export function parseHomeComposition/.test(adapter),
      "adapter: pure parser is exported (testable mapping, no network)",
    );
  }
}

// --- documented default: src/data/site.ts ------------------------------------
{
  const siteSrc = readSource("src/data/site.ts", "site data");
  if (siteSrc !== null) {
    check(
      siteSrc.includes("export type HomeBlock"),
      "default: site.ts exports the HomeBlock block-name type",
    );
    check(
      siteSrc.includes("export const DEFAULT_HOME_ORDER"),
      "default: site.ts exports DEFAULT_HOME_ORDER",
    );
    const orderMatch = siteSrc.match(/DEFAULT_HOME_ORDER[^=]*=\s*\[([^\]]*)\]/);
    check(orderMatch !== null, "default: DEFAULT_HOME_ORDER is an array literal");
    if (orderMatch !== null) {
      const keys = [...orderMatch[1].matchAll(/"([A-Za-z]+)"/g)].map((m) => m[1]);
      check(
        JSON.stringify(keys) === JSON.stringify(CANONICAL_ORDER),
        `default: DEFAULT_HOME_ORDER holds exactly the 8 canonical keys in canonical order (found ${JSON.stringify(keys)})`,
      );
    }
  }
}

// --- drift guard: HomeTemplate canonical plan stays equal --------------------
{
  const templateSrc = readSource(
    "src/layouts/HomeTemplate.astro",
    "HomeTemplate",
  );
  if (templateSrc !== null) {
    const canonicalMatch = templateSrc.match(/CANONICAL_ORDER[^=]*=\s*\[([^\]]*)\]/);
    check(
      canonicalMatch !== null,
      "drift guard: HomeTemplate still declares CANONICAL_ORDER",
    );
    if (canonicalMatch !== null) {
      const keys = [...canonicalMatch[1].matchAll(/"([A-Za-z]+)"/g)].map((m) => m[1]);
      check(
        JSON.stringify(keys) === JSON.stringify(CANONICAL_ORDER),
        `drift guard: HomeTemplate CANONICAL_ORDER equals DEFAULT_HOME_ORDER (found ${JSON.stringify(keys)})`,
      );
    }
  }
}

// --- pages: src/pages/{fa,en}/index.astro ------------------------------------
for (const locale of ["fa", "en"]) {
  const src = readSource(`src/pages/${locale}/index.astro`, `${locale} home page`);
  if (src === null) continue;
  check(
    src.includes('import HomeTemplate from "../../layouts/HomeTemplate.astro"'),
    `${locale}: composes the HomeTemplate 8-block narrative`,
  );
  check(
    src.includes('"../../lib/cms/homeComposition"'),
    `${locale}: imports the homeComposition adapter (grep-visible adapter import per WF-07A done gate)`,
  );
  check(
    src.includes("<HomeTemplate order={"),
    `${locale}: passes the guarded order prop to HomeTemplate`,
  );
  check(
    src.includes("?? DEFAULT_HOME_ORDER"),
    `${locale}: 404/absent composition falls back to the documented DEFAULT_HOME_ORDER`,
  );
  check(
    src.includes("console.warn") && src.includes("isCmsOriginBuild()"),
    `${locale}: warns once per build when the CMS base is set but no composition is published (snapshot builds stay quiet)`,
  );
  check(
    src.includes("cmsBuildOrigin={landing.source}"),
    `${locale}: keeps the cms-build-origin meta wiring (landing.source)`,
  );
  check(
    src.includes('slot="lead"') && src.includes('slot="cta"'),
    `${locale}: the narrative frame blocks (lead + cta) are always composed`,
  );
}

// --- night stage: src/components/Landing.astro -------------------------------
{
  const landingSrc = readSource("src/components/Landing.astro", "Landing stage");
  if (landingSrc !== null) {
    check(
      !/(^|\n)\s*import\b/.test(landingSrc),
      "stage: Landing keeps zero imports (pure night-stage wrapper; block composition moved to the routes)",
    );
    check(
      landingSrc.includes('<slot />'),
      "stage: Landing forwards its default slot (HomeTemplate composes inside it)",
    );
    check(
      landingSrc.includes("--color-ink: var(--ink-hi)"),
      "stage: Landing remaps semantic roles to the night set so theme-aware content components stay readable on the fixed night canvas",
    );
    check(
      landingSrc.includes("--canvas-night"),
      "stage: Landing keeps the ADR-0031 night canvas",
    );
  }
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`home-composition.spec: FAIL - ${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `PASS home-composition (${passed.length} checks): adapter allow-404 with both paths (published mapping + documented default), DEFAULT_HOME_ORDER drift-guarded against HomeTemplate, locale pages compose HomeTemplate with the adapter order, warn-once honesty, night stage retained`,
);
