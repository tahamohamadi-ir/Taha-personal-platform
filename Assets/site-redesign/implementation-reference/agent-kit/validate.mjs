import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../..");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(here, name), "utf8"));
const fail = (message) => { throw new Error(message); };

const tokens = readJson("tokens.json");
const components = readJson("components.json");
const templates = readJson("templates.json");
const assets = readJson("assets.json");
const manifest = readJson("figma-plugin/manifest.json");
const plugin = fs.readFileSync(path.join(here, "figma-plugin/code.js"), "utf8");
const reference = JSON.parse(fs.readFileSync(path.join(here, "..", "REFERENCE-MANIFEST.json"), "utf8"));

if (tokens.authority.runtime !== "apps/web/src/styles/global.css") fail("Runtime token authority drifted");
if (tokens.semanticLight.status !== "runtime-authoritative") fail("Light token status is not authoritative");
if (tokens.semanticDark.status !== "design-target") fail("Dark token status must remain design-target until runtime authorization");
if (components.components.length !== 24) fail(`Expected 24 components, found ${components.components.length}`);
if (templates.templates.length !== 6) fail(`Expected 6 templates, found ${templates.templates.length}`);
if (templates.prototypePath.length !== 6) fail("Prototype path must contain six bounded steps");
if (manifest.networkAccess.allowedDomains[0] !== "none") fail("Figma plugin must remain offline");
for (const name of ["00 — Foundations & Library", "10 — Templates & Screens", "20 — Prototype & Handoff"]) {
  if (!plugin.includes(name)) fail(`Plugin page missing: ${name}`);
}
if (!plugin.includes('const OWNER = "TFL /"')) fail("Deterministic ownership prefix missing");
for (const asset of assets.assets) {
  const target = path.join(root, asset.path);
  if (!fs.existsSync(target)) fail(`Missing asset reference: ${asset.path}`);
}
for (const required of reference.requiredFiles) {
  const target = path.join(here, "..", required);
  if (!fs.existsSync(target)) fail(`Missing implementation-reference file: ${required}`);
}

console.log(`PASS: ${components.components.length} components, ${templates.templates.length} templates, ${assets.assets.length} asset references, ${reference.requiredFiles.length} reference files, offline Figma builder.`);
