import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const distDir = new URL("../dist/", import.meta.url);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readHtml(relativePath) {
  const target = new URL(relativePath, distDir);
  return readFileSync(target, "utf8");
}

function listNestedDirectories(directory) {
  return readdirSync(directory).filter((entry) =>
    statSync(join(directory, entry)).isDirectory(),
  );
}

const aboutEn = readHtml("en/about/index.html");
assert(
  aboutEn.includes("Software engineer and applied AI researcher focused on local LLM systems"),
  "English About page did not render the profile short bio from the CMS/snapshot adapter.",
);

const sectionPages = [
  "en/about/experience/index.html",
  "en/about/education/index.html",
  "en/about/skills/index.html",
  "en/about/research/index.html",
  "en/about/publications/index.html",
  "en/about/certificates/index.html",
  "fa/about/experience/index.html",
  "fa/about/education/index.html",
  "fa/about/skills/index.html",
  "fa/about/research/index.html",
  "fa/about/publications/index.html",
  "fa/about/certificates/index.html",
];

for (const page of sectionPages) {
  assert(existsSync(new URL(page, distDir)), `Expected built section page missing: ${page}`);
}

const researchIndex = readHtml("en/about/research/index.html");
assert(
  researchIndex.includes('aria-label="Breadcrumb"'),
  "Research section index is missing breadcrumbs.",
);
assert(
  researchIndex.includes("Next step"),
  "Research section index is missing the next-step block.",
);
assert(
  researchIndex.includes('hreflang="fa"'),
  "Research section index is missing the alternate hreflang link.",
);

const researchDir = fileURLToPath(new URL("en/about/research/", distDir));
const nestedResearchEntries = listNestedDirectories(researchDir);
assert(
  nestedResearchEntries.length === 3,
  "Expected three research detail routes when detail bodies exist in the profile snapshot.",
);
assert(
  existsSync(new URL("en/about/research/pars-sql-vtd-edge/index.html", distDir)),
  "Missing English research detail page for pars-sql-vtd-edge.",
);
assert(
  existsSync(new URL("fa/about/research/pars-sql-vtd-edge/index.html", distDir)),
  "Missing Persian research detail page for pars-sql-vtd-edge.",
);

const researchDetail = readHtml("en/about/research/pars-sql-vtd-edge/index.html");
assert(
  researchDetail.includes("PARS-SQL / VTD-Edge"),
  "Research detail page did not render the expected title.",
);
assert(
  researchDetail.includes('aria-label="Breadcrumb"'),
  "Research detail page is missing breadcrumbs.",
);
assert(
  researchDetail.includes('hreflang="fa"'),
  "Research detail page is missing the alternate hreflang link.",
);

const experienceDir = fileURLToPath(new URL("en/about/experience/", distDir));
const nestedExperienceEntries = listNestedDirectories(experienceDir);
assert(
  nestedExperienceEntries.length === 1,
  "Expected one experience detail route for the seeded MCI entry.",
);
assert(
  !existsSync(new URL("en/about/skills/python/index.html", distDir)),
  "Skills rows without detail bodies must not emit detail pages.",
);

console.log("PASS cms-profile-build");
