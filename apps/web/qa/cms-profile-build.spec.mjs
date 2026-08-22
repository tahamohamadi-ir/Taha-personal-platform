import { existsSync, readFileSync, readdirSync, statSync, mkdtempSync, rmSync, openSync, closeSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const distDir = new URL("../dist/", import.meta.url);
const webRoot = dirname(fileURLToPath(distDir));

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

/**
 * Slice 3 origin honesty (ADR-0027):
 * - Prior `npm run build` without CMS_API_BASE uses profile.snapshot.json (local/offline).
 * - When CMS_API_BASE is set, transport/5xx/timeout must fail the build — never silent snapshot.
 * This spec assumes CI already built with CMS_API_BASE unset, then proves the fail-build path.
 */

const aboutEn = readHtml("en/about/index.html");
assert(
  aboutEn.includes('name="cms-build-origin" content="snapshot"'),
  "English About page is missing cms-build-origin snapshot meta.",
);
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

// Unreachable origin must fail build (do not silently bake snapshot as live CMS).
// Write build logs to a file descriptor: Windows Astro may abort after throw and drop pipes.
const failingBase = "http://127.0.0.1:9";
const logDir = mkdtempSync(join(tmpdir(), "cms-origin-"));
const logPath = join(logDir, "fail-build.log");
const logFd = openSync(logPath, "w");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const redirected = spawnSync(
  process.platform === "win32" ? "cmd.exe" : npmCmd,
  process.platform === "win32" ? ["/c", "npm", "run", "build"] : ["run", "build"],
  {
    cwd: webRoot,
    env: { ...process.env, CMS_API_BASE: failingBase },
    timeout: 180_000,
    stdio: ["ignore", logFd, logFd],
  },
);
closeSync(logFd);
const failOutput = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
assert(
  redirected.status !== 0 && redirected.status !== null,
  `Expected npm run build to fail when CMS_API_BASE=${failingBase} is unreachable; exit=${redirected.status} error=${redirected.error ?? ""}`,
);
assert(
  /unreachable|CmsOriginError|CMS profile origin/i.test(failOutput),
  `Failing CMS_API_BASE build did not surface a CMS origin error (log ${failOutput.length} bytes).`,
);
try {
  rmSync(logDir, { recursive: true, force: true });
} catch {
  /* best-effort cleanup */
}

// Restore offline snapshot dist for later CI specs (projects-catalog, smoke).
const restoreEnv = { ...process.env };
delete restoreEnv.CMS_API_BASE;
for (const cacheDir of [
  join(webRoot, "node_modules", ".vite"),
  join(webRoot, "node_modules", ".astro"),
]) {
  try {
    rmSync(cacheDir, { recursive: true, force: true });
  } catch {
    /* best-effort cache bust so restore build ignores prior CMS_API_BASE */
  }
}
const restore = spawnSync(
  process.platform === "win32" ? "cmd.exe" : npmCmd,
  process.platform === "win32" ? ["/c", "npm", "run", "build"] : ["run", "build"],
  {
    cwd: webRoot,
    env: restoreEnv,
    encoding: "utf8",
    timeout: 180_000,
  },
);
assert(
  restore.status === 0,
  `Failed to restore snapshot build after outage check; exit=${restore.status}`,
);

console.log("PASS cms-profile-build (snapshot offline + fail-build on CMS outage)");
