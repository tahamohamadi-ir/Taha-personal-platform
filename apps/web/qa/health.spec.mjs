import { existsSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const distDir = join(webRoot, "dist");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// --- 1. Static artifact health.json (dist/health.json) is the static-site payload ---
const healthJsonPath = join(distDir, "health.json");
assert(existsSync(healthJsonPath), "Missing dist/health.json — health artifact must be built (see src/pages/health.json.ts)");

const raw = readFileSync(healthJsonPath, "utf8");
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  throw new Error(`dist/health.json invalid JSON: ${e.message}`);
}

assert(data.status === "ok", `dist/health.json status should be "ok", got ${JSON.stringify(data.status)}`);
assert(data.service === "static", `dist/health.json service should be "static" (not CMS), got ${JSON.stringify(data.service)}`);
assert(typeof data.version === "string" && data.version.length > 0, "dist/health.json version must be non-empty string");

// version should match site.version or package.json version
let expectedVersion = null;
try {
  const pkg = JSON.parse(readFileSync(join(webRoot, "package.json"), "utf8"));
  expectedVersion = pkg.version;
} catch {}
if (expectedVersion) {
  assert(data.version === expectedVersion, `health.json version ${data.version} != package.json ${expectedVersion}`);
}

assert(statSync(healthJsonPath).size < 1024, "dist/health.json unexpectedly large — should be minimal JSON");
assert(!raw.includes("db") && !raw.includes("contact"), "dist/health.json must NOT contain CMS db/contact fields — it is the static artifact, not the CMS payload");

// Must be static-service JSON, not CMS degraded/ok with db
assert(!("db" in data), "dist/health.json should not contain CMS field 'db'");

// Ensure /health/ is not a static directory (Caddy /health/* must not be stolen by file_server)
// Dist should contain health.json file but NOT health/index.html directory
assert(!existsSync(join(distDir, "health")), "dist/health/ directory must not exist — /health/ is a CMS proxy, not a static file (avoids /health* glob)");
assert(!existsSync(join(distDir, "health.json", "index.html")), "dist/health.json/index.html nonsense check");

// Check content-type would be correct via Astro output (we can only check file, not headers, but ensure JSON is compact)
assert(raw.includes('"status":"ok"') || raw.includes('"status": "ok"'), "dist/health.json should contain status ok");

// --- 2. Runtime distinction: /health.json vs /health/ cannot be confused ---
// If PREVIEW_URL is set (CI preview), verify HTTP semantics. Otherwise skip HTTP but assert file distinction.
// This mirrors the gap: Caddy /health/ not smoked via smoke.sh:47
const previewUrl = process.env.PREVIEW_URL || process.env.BASE_URL || null;

if (previewUrl) {
  const base = previewUrl.replace(/\/$/, "");
  async function fetchJson(path) {
    const res = await fetch(`${base}${path}`, { headers: { Accept: "application/json" } });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {}
    return { status: res.status, text, json, headers: Object.fromEntries(res.headers.entries()) };
  }

  const healthJson = await fetchJson("/health.json");
  assert(healthJson.status === 200, `GET /health.json expected 200, got ${healthJson.status} at ${base}/health.json`);
  assert(healthJson.json && healthJson.json.service === "static", `/health.json HTTP body should be static service, got ${healthJson.text.slice(0, 200)}`);
  assert(healthJson.json.status === "ok", `/health.json HTTP status field should be ok`);
  const ct = healthJson.headers["content-type"] || "";
  assert(ct.includes("application/json"), `/health.json content-type should be application/json, got ${ct}`);

  const healthSlash = await fetchJson("/health/");
  // On static preview (astro preview without Caddy), /health/ should be 404 distinct from /health.json
  // On live Caddy + CMS, /health/ should be 200 with db field distinct from static payload
  if (healthSlash.status === 404) {
    console.log(`PASS health HTTP: /health/ 404 distinct from /health.json 200 (static preview)`);
  } else if (healthSlash.status === 200) {
    assert(healthSlash.json && "db" in healthSlash.json, `/health/ 200 should be CMS JSON with 'db' field, got ${healthSlash.text.slice(0, 200)}`);
    assert(healthSlash.json.service === undefined || healthSlash.json.service !== "static", "/health/ CMS payload must not be the static service");
    assert(JSON.stringify(healthSlash.json) !== JSON.stringify(healthJson.json), "/health/ and /health.json must be distinct payloads");
    console.log(`PASS health HTTP: /health/ 200 CMS JSON distinct from /health.json static`);
  } else {
    throw new Error(`GET /health/ expected 404 (static) or 200 (CMS), got ${healthSlash.status} body=${healthSlash.text.slice(0, 200)}`);
  }

  // Ensure /health.json is not proxied to CMS (would contain db)
  assert(!healthJson.text.includes('"db"'), "/health.json HTTP body must not contain CMS db field — Caddy must not proxy /health* glob");
} else {
  console.log("SKIP health HTTP check — PREVIEW_URL not set (file-only verification done)");
  console.log("  To verify runtime distinction: PREVIEW_URL=http://127.0.0.1:4321 node qa/health.spec.mjs");
}

console.log("PASS health spec — dist/health.json is static artifact, distinct from CMS /health/ proxy");
