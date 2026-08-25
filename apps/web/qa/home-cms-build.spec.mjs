import { existsSync, readFileSync, mkdtempSync, rmSync, openSync, closeSync } from "node:fs";
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

/**
 * X-01 (board A1) — CMS-driven home origin honesty:
 * - The CI build runs WITHOUT CMS_API_BASE, so home pages must carry the
 *   snapshot origin marker and render the committed snapshot profile.
 * - When CMS_API_BASE is set but unreachable, `npm run build` must FAIL
 *   (landing.ts loadLandingProfile throws) — never a silent snapshot bake.
 * A base-set success dry-run needs a live CMS; that is exercised in
 * production builds and is out of scope for offline CI.
 */

for (const page of ["index.html", "en/index.html", "fa/index.html"]) {
  assert(existsSync(new URL(page, distDir)), `Expected built home page missing: ${page}`);
}

const homeEn = readHtml("en/index.html");
assert(
  homeEn.includes('name="cms-build-origin" content="snapshot"'),
  "English home page is missing cms-build-origin snapshot meta.",
);

const homeFa = readHtml("fa/index.html");
assert(
  homeFa.includes('name="cms-build-origin" content="snapshot"'),
  "Persian home page is missing cms-build-origin snapshot meta.",
);

const rootIndex = readHtml("index.html");
// Root gateway intentionally has no profile data; it must not fake an origin.
assert(
  !rootIndex.includes('name="cms-build-origin"'),
  "Root gateway must not carry a cms-build-origin meta (no profile data).",
);

// Snapshot profile content actually reaches the home hero/sections.
assert(
  homeEn.includes("hero__signature") || homeEn.includes("hero-name"),
  "English home page did not render the hero section.",
);

// Unreachable origin must fail build (do not silently bake snapshot as live CMS).
const failingBase = "http://127.0.0.1:9";
const logDir = mkdtempSync(join(tmpdir(), "home-origin-"));
const logPath = join(logDir, "fail-build.log");
const logFd = openSync(logPath, "w");
const redirected = spawnSync(
  process.platform === "win32" ? "cmd.exe" : "npm",
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
  /unreachable|CMS profile origin/i.test(failOutput),
  `Failing CMS_API_BASE build did not surface the landing origin error (log ${failOutput.length} bytes).`,
);
try {
  rmSync(logDir, { recursive: true, force: true });
} catch {
  /* best-effort cleanup */
}

console.log("PASS home-cms-build (snapshot offline + fail-build on unreachable CMS)");
