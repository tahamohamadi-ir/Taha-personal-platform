#!/usr/bin/env node
/**
 * WF-06 Visual Atlas launcher - local-only Component Playground at /_design/.
 *
 * Cross-platform (Windows-safe, no bash): spawns the locally installed astro
 * CLI via npx with DESIGN_ATLAS=1 in the child environment, which makes
 * astro.config.mjs inject the /_design/ route. The default build pipeline is
 * never touched; nothing outside the atlas tree is read or written.
 *
 *   node scripts/design-atlas.mjs             astro dev  --port 4322
 *   node scripts/design-atlas.mjs --build     astro build
 *   node scripts/design-atlas.mjs --preview   astro preview --port 4322
 *
 * Any other arguments are forwarded to the astro CLI untouched.
 */
import { spawn } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const argv = process.argv.slice(2);
const command = argv.includes("--build")
  ? "build"
  : argv.includes("--preview")
    ? "preview"
    : "dev";
const forwarded = argv.filter((arg) => arg !== "--build" && arg !== "--preview");
const astroArgs = [command, ...forwarded];
if (command !== "build") astroArgs.push("--port", "4322");

console.log(`design-atlas: DESIGN_ATLAS=1 astro ${astroArgs.join(" ")}`);

const child = spawn("npx", ["astro", ...astroArgs], {
  cwd: webRoot,
  env: { ...process.env, DESIGN_ATLAS: "1" },
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exitCode = code ?? 0;
});
child.on("error", (error) => {
  console.error(`design-atlas: failed to launch astro (${error.message})`);
  process.exitCode = 1;
});
