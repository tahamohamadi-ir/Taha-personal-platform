/**
 * X-10 / DEFER-0021 — demo embed allowlist readiness.
 *
 * Guards three things:
 *   1. src/data/demoEmbedAllowlist.ts module contract (exports + owner gate).
 *   2. Allowlist matching semantics via real unit assertions (TS imported
 *      directly — Node ≥22.18 strips types natively).
 *   3. Built dist/*.html stays clean: the OWNER_APPROVED_DEMO_HOST
 *      placeholder never leaks into public HTML, and while the allowlist is
 *      empty the click-to-load embed UI renders nothing (external links only).
 *
 * Run after `npm run build`:  node qa/demo-embed.spec.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const distDir = join(webRoot, "dist");
const modulePath = join(webRoot, "src", "data", "demoEmbedAllowlist.ts");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [major, minor] = process.versions.node.split(".").map(Number);
assert(
  major > 22 || (major === 22 && minor >= 18),
  `Node ≥22.18 required for native TS import (got ${process.versions.node})`,
);

// ---------------------------------------------------------------------------
// 1. Module contract
// ---------------------------------------------------------------------------

const mod = await import(pathToFileURL(modulePath).href);
const { DEMO_EMBED_ALLOWLIST, normalizeHost, isAllowedHost, isDemoEmbedAllowed } = mod;

assert(typeof normalizeHost === "function", "normalizeHost export missing");
assert(typeof isAllowedHost === "function", "isAllowedHost export missing");
assert(typeof isDemoEmbedAllowed === "function", "isDemoEmbedAllowed export missing");
assert(Array.isArray(DEMO_EMBED_ALLOWLIST), "DEMO_EMBED_ALLOWLIST must be an array");

const source = readFileSync(modulePath, "utf8");
assert(
  source.includes("OWNER MUST FILL"),
  "demoEmbedAllowlist.ts must carry the OWNER MUST FILL comment block",
);
assert(
  source.includes("CSP") || source.includes("frame-src"),
  "demoEmbedAllowlist.ts must reference the CSP frame-src follow-up",
);

// Owner gate: allowlist ships empty until the owner confirms domains.
assert(
  DEMO_EMBED_ALLOWLIST.length === 0,
  `DEMO_EMBED_ALLOWLIST must be empty until owner confirms domains — found ${JSON.stringify([...DEMO_EMBED_ALLOWLIST])}`,
);
assert(
  !/"[^"]+\.(com|dev|io|net|org|ir|example)"\s*,?\s*$/.test(
    source.replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""),
  ),
  "active (non-comment) invented host entry detected — do not invent domains",
);

// ---------------------------------------------------------------------------
// 2. Matching semantics (synthetic lists injected; production list untouched)
// ---------------------------------------------------------------------------

// Normalization: lowercase, strip protocol/port/path/query/whitespace/trailing dot.
const normCases = [
  ["https://Demo.Example.com/path?x=1#f", "demo.example.com"],
  ["http://demo.example.com:8443/", "demo.example.com"],
  ["  DEMO.EXAMPLE.COM.  ", "demo.example.com"],
  ["demo.example.com:8080/sub", "demo.example.com"],
  ["/sub.demo.example.com/", "sub.demo.example.com"],
  ["HTTPS://USER:PASS@DEMO.EXAMPLE.COM", "demo.example.com"],
];
for (const [input, expected] of normCases) {
  assert(
    normalizeHost(input) === expected,
    `normalizeHost(${JSON.stringify(input)}) should be ${JSON.stringify(expected)}, got ${JSON.stringify(normalizeHost(input))}`,
  );
}
for (const bad of ["", "   ", "has space.dev", "javascript://alert(1)", "ftp://x.dev"]) {
  assert(
    normalizeHost(bad) === null,
    `normalizeHost(${JSON.stringify(bad)}) should be rejected, got ${JSON.stringify(normalizeHost(bad))}`,
  );
}

// Exact + subdomain admission, sibling rejection.
assert(isAllowedHost("allowed.dev", ["allowed.dev"]), "exact host should match");
assert(isAllowedHost("https://a.b.allowed.dev/x", ["allowed.dev"]), "subdomain should match");
assert(!isAllowedHost("notallowed.dev", ["allowed.dev"]), "sibling domain must not match");
assert(!isAllowedHost("evil-allowed.dev", ["allowed.dev"]), "suffix lookalike must not match");
assert(!isAllowedHost("allowed.dev.evil.io", ["allowed.dev"]), "host ending in entry must not match");

// Empty list ⇒ nothing is ever allowed (the dormant-by-default invariant).
assert(
  !isAllowedHost("anything.dev", []),
  "empty entries list must reject every host",
);
assert(
  !isDemoEmbedAllowed("https://anything.dev") && !isDemoEmbedAllowed("anything.dev"),
  "isDemoEmbedAllowed must stay false while the owner allowlist is empty",
);

console.log("PASS allowlist unit semantics — normalization + gating OK");

// ---------------------------------------------------------------------------
// 3. Build artifact: placeholder leak + dormant embed UI in dist HTML
// ---------------------------------------------------------------------------

assert(existsSync(distDir), "Missing dist/ — run `npm run build` before this spec");

function collectHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...collectHtml(full));
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

const htmlFiles = collectHtml(distDir);
assert(htmlFiles.length > 0, "dist/ contains no .html files — build output missing");

let leakedPlaceholder = [];
let activeEmbedUi = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const rel = file.slice(distDir.length + 1);
  if (html.includes("OWNER_APPROVED_DEMO_HOST")) leakedPlaceholder.push(rel);
  // While the allowlist is empty, DemoEmbed renders only the external <a>;
  // none of the click-to-load markup or its inline loader may appear.
  for (const marker of ["data-demo-embed", "data-demo-src", "demo-embed-load", "demo-embed-frame"]) {
    if (html.includes(marker)) {
      activeEmbedUi.push(`${rel}: ${marker}`);
      break;
    }
  }
}

assert(
  leakedPlaceholder.length === 0,
  `OWNER_APPROVED_DEMO_HOST placeholder leaked into public HTML: ${leakedPlaceholder.join(", ")}`,
);
assert(
  activeEmbedUi.length === 0,
  `click-to-load embed UI present while allowlist is empty (must stay dormant): ${activeEmbedUi.join(", ")}`,
);

// DemoEmbed is the only sanctioned <iframe> producer on the public site and
// it stays dormant while the allowlist is empty — so dist HTML must contain
// no iframes at all until the owner fills the allowlist.
let iframes = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  if (/<iframe\b/i.test(html)) iframes.push(file.slice(distDir.length + 1));
}
assert(
  iframes.length === 0,
  `<iframe> found in public HTML while allowlist is empty (embeds must stay dormant): ${iframes.join(", ")}`,
);

// Any anchor pointing at an OWNER-ALLOWLISTED host must open safely
// (target=_blank + rel=noopener noreferrer). Other components' external
// links use their own rel choices and are out of scope for this spec.
const anchorRe = /<a\b[^>]*\bhref="(https?:\/\/[^"]+)"([^>]*)>/g;
let allowlistedLinks = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const m of html.matchAll(anchorRe)) {
    const [, href, attrs] = m;
    let host = null;
    try {
      host = new URL(href).hostname.toLowerCase();
    } catch {}
    if (!host || !DEMO_EMBED_ALLOWLIST.some((e) => host === e || host.endsWith(`.${e}`))) continue;
    allowlistedLinks++;
    assert(
      attrs.includes('target="_blank"') &&
        /rel="[^"]*noopener[^"]*"/.test(attrs) &&
        /rel="[^"]*noreferrer[^"]*"/.test(attrs),
      `link to allowlisted demo host missing target=_blank/rel=noopener noreferrer in ${file.slice(distDir.length + 1)}: ${m[0]}`,
    );
  }
}

console.log(
  `PASS demo-embed spec — ${htmlFiles.length} HTML files, placeholder leak: none, embed UI + iframes dormant, ${allowlistedLinks} allowlisted-host links checked`,
);
