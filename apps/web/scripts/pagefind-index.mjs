#!/usr/bin/env node
/**
 * Post-build Pagefind index (Wave 5 / early P10 slice).
 *
 * Indexes built public HTML per locale under dist/{en,fa}/.
 * Admin, preview, and CMS paths are not part of the Astro dist tree.
 * Drafts/private content never appear in static HTML (published-only build).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distRoot = path.join(webRoot, "dist");
const locales = ["en", "fa"];

function runPagefind(siteDir, outputPath) {
  const args = [
    "pagefind",
    "--site",
    siteDir,
    "--output-path",
    outputPath,
    "--force-language",
    path.basename(siteDir),
  ];
  const result = spawnSync("npx", args, {
    cwd: webRoot,
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(distRoot)) {
  console.error("pagefind: dist/ missing — run astro build first");
  process.exit(1);
}

for (const locale of locales) {
  const siteDir = path.join(distRoot, locale);
  if (!existsSync(siteDir)) {
    console.warn(`pagefind: skip missing locale tree ${locale}/`);
    continue;
  }
  const outputPath = path.join(siteDir, "pagefind");
  if (existsSync(outputPath)) {
    rmSync(outputPath, { recursive: true, force: true });
  }
  mkdirSync(outputPath, { recursive: true });
  console.log(`pagefind: indexing ${locale}/ → ${locale}/pagefind/`);
  runPagefind(siteDir, outputPath);
}

// Confirm we did not invent indexes for non-public roots.
for (const name of readdirSync(distRoot)) {
  if (name === "admin" || name === "preview" || name === "staff") {
    console.error(`pagefind: refusing unexpected dist root ${name}/`);
    process.exit(1);
  }
}

console.log("pagefind: done");
