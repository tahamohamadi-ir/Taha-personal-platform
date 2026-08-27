// WF-06 Visual Atlas QA gate (G4/G5) - local-only Component Playground.
//
// Plain Node script, no dependencies. Enforces that the atlas is STRICTLY
// opt-in and never leaks into a production artifact:
//   Gate 1  source guards: astro.config.mjs injects /_design/ through an
//           integration injectRoute call gated on process.env.DESIGN_ATLAS
//           === "1" exactly; scripts/design-atlas.mjs launcher exists; every
//           fixture module under src/design-atlas/fixtures/** declares
//           "unpublished: true" (no real private data may enter the atlas
//           without the flag).
//   Gate 2  stable hooks: enough atlas specimen files carry data-atlas-id=
//           attributes for the deterministic Playwright screenshot pass.
//   Gate 3  DEFAULT-build gate (G4, hard): a child `npm run build` WITHOUT
//           DESIGN_ATLAS produces a dist/ with NO _design path, no "_design"
//           string in any .html/.xml, and no "data-atlas-id" anywhere.
//   Gate 4  ATLAS-build gate (G5): a child `npm run build` WITH
//           DESIGN_ATLAS=1 emits dist/_design/index.html.
//
// The two build gates each run a real child build (execSync, shell) so the
// result reflects the actual pipeline, including the pagefind postbuild.

import { execSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const distDir = join(webRoot, "dist");
const configPath = join(webRoot, "astro.config.mjs");
const launcherPath = join(webRoot, "scripts", "design-atlas.mjs");
const atlasSrcDir = join(webRoot, "src", "design-atlas");
const fixturesDir = join(atlasSrcDir, "fixtures");
const MIN_SPECIMEN_FILES = 6;

const problems = [];
function check(ok, message) {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${message}`);
  if (!ok) problems.push(message);
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function readText(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

console.log("design-atlas.spec: Visual Atlas gates (WF-06, G4/G5)");
console.log("");

// ---- Gate 1: source guards -------------------------------------------------
console.log("Gate 1  source guards");
const configSource = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
check(
  /process\.env\.DESIGN_ATLAS\s*===\s*['"]1['"]/.test(configSource) &&
    configSource.includes("injectRoute") &&
    /['"]\/_design['"]/.test(configSource),
  "astro.config.mjs injects route /_design/ iff process.env.DESIGN_ATLAS === '1'",
);
check(
  existsSync(launcherPath),
  "scripts/design-atlas.mjs launcher exists (cross-platform astro spawn)",
);
const fixtureFiles = walk(fixturesDir);
check(
  fixtureFiles.length > 0,
  `src/design-atlas/fixtures/** exists (found ${fixtureFiles.length} file(s))`,
);
const unflagged = fixtureFiles.filter(
  (file) => !readText(file).includes("unpublished: true"),
);
check(
  unflagged.length === 0,
  `every fixtures/** file declares "unpublished: true"${
    unflagged.length ? ` (missing: ${unflagged.map((f) => relative(fixturesDir, f)).join(", ")})` : ""
  }`,
);

// ---- Gate 2: stable hooks --------------------------------------------------
console.log("Gate 2  stable specimen hooks");
const atlasFiles = walk(atlasSrcDir).filter((file) => /\.astro$|\.ts$/.test(file));
const hooked = atlasFiles.filter((file) => readText(file).includes("data-atlas-id="));
check(
  hooked.length >= MIN_SPECIMEN_FILES,
  `at least ${MIN_SPECIMEN_FILES} atlas specimen files carry data-atlas-id= hooks (found ${hooked.length})`,
);

// Fail fast before the (slow) build gates when the atlas source is absent.
if (problems.length > 0) {
  console.log("");
  console.error(
    `design-atlas.spec: FAIL - ${problems.length} problem(s) (see FAIL lines above)`,
  );
  process.exit(1);
}

// ---- Gate 3: DEFAULT build is atlas-free (G4, hard) ------------------------
console.log("Gate 3  default build contains no atlas artifacts (G4)");
const defaultEnv = { ...process.env };
delete defaultEnv.DESIGN_ATLAS;
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}
execSync("npm run build", {
  cwd: webRoot,
  env: defaultEnv,
  stdio: "inherit",
  shell: true,
});
const distFiles = walk(distDir);
const pathHits = distFiles.filter((file) =>
  relative(distDir, file).split("\\").join("/").includes("_design"),
);
check(
  pathHits.length === 0,
  `dist/ contains no file matching _design** (found ${pathHits.length}: ${pathHits
    .slice(0, 5)
    .map((f) => relative(distDir, f))
    .join(", ")})`,
);
const htmlXmlHits = distFiles
  .filter((file) => /\.(html|xml)$/i.test(file))
  .filter((file) => readText(file).includes("_design"));
check(
  htmlXmlHits.length === 0,
  `no "_design" string in any dist .html/.xml (found ${htmlXmlHits.length})`,
);
const hookHits = distFiles.filter((file) => readText(file).includes("data-atlas-id"));
check(
  hookHits.length === 0,
  `no "data-atlas-id" anywhere in dist/ (found ${hookHits.length})`,
);

// ---- Gate 4: ATLAS build emits the route (G5) ------------------------------
console.log("Gate 4  DESIGN_ATLAS=1 build emits dist/_design/index.html (G5)");
execSync("npm run build", {
  cwd: webRoot,
  env: { ...process.env, DESIGN_ATLAS: "1" },
  stdio: "inherit",
  shell: true,
});
check(
  existsSync(join(distDir, "_design", "index.html")),
  "dist/_design/index.html exists after DESIGN_ATLAS=1 build",
);

console.log("");
if (problems.length > 0) {
  console.error(
    `design-atlas.spec: FAIL - ${problems.length} problem(s) (see FAIL lines above)`,
  );
  process.exit(1);
}
console.log(
  "design-atlas.spec: PASS - default build atlas-free (G4), DESIGN_ATLAS=1 emits /_design/ (G5), source guards and stable hooks green",
);
