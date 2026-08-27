// Cross-language sync guard for graph validator issue codes (Track AF-05).
// Plain node, zero dependencies. Compares four sources and fails loudly on
// any drift:
//   1. GRAPH_ISSUE_CODES list in apps/cms/apps/api/admin_graph_validate.py
//      (the frozen backend contract; read-only access is contract consumption
//      per TRACK-AF ownership rules - no Django file is modified)
//   2. _MESSAGE_TOKENS mapping (code -> graph.* token) in the same file
//   3. GRAPH_ISSUE_CODES + GRAPH_ISSUE_TOKENS in apps/admin/src/lib/adminApiExt.ts
//   4. graph.* message keys present in BOTH i18n dictionaries (fa/en parity)
// Run: node scripts/check-graph-tokens.mjs  (or: npm run qa:tokens)
// Exit 0 = in sync, exit 1 = drift (printed).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url)); // apps/admin/scripts
const adminRoot = path.resolve(here, "..");
const repoRoot = path.resolve(adminRoot, "..", "..");

const PY_PATH = path.join(
  repoRoot,
  "apps",
  "cms",
  "apps",
  "api",
  "admin_graph_validate.py"
);
const TS_PATH = path.join(adminRoot, "src", "lib", "adminApiExt.ts");
const FA_PATH = path.join(adminRoot, "src", "i18n", "redesign.fa.ts");
const EN_PATH = path.join(adminRoot, "src", "i18n", "redesign.en.ts");

const errors = [];

function fail(message) {
  errors.push(message);
}

// ---- 1+2. python contract: codes (ordered) + message tokens --------------
const py = readFileSync(PY_PATH, "utf8");
const pyCodesBlock = py.match(/GRAPH_ISSUE_CODES:\s*list\[str\]\s*=\s*\[([\s\S]*?)\]/);
if (pyCodesBlock === null) {
  fail(`GRAPH_ISSUE_CODES block not found in ${PY_PATH}`);
}
const pyCodes = pyCodesBlock
  ? [...pyCodesBlock[1].matchAll(/"([A-Z0-9_]+)"/g)].map((m) => m[1])
  : [];
if (pyCodes.length === 0) {
  fail("no codes parsed from python GRAPH_ISSUE_CODES");
}
const pyTokensBlock = py.match(/_MESSAGE_TOKENS:\s*dict\[str,\s*str\]\s*=\s*\{([\s\S]*?)\}/);
if (pyTokensBlock === null) {
  fail("_MESSAGE_TOKENS block not found in python file");
}
const pyTokenMap = new Map(
  pyTokensBlock
    ? [...pyTokensBlock[1].matchAll(/"([A-Z0-9_]+)":\s*"([^"]+)"/g)].map(
        (m) => [m[1], m[2]]
      )
    : []
);
if (pyTokenMap.size === 0) {
  fail("no code->token pairs parsed from python _MESSAGE_TOKENS");
}

// ---- 3. TS mirror: codes (ordered) + tokens ------------------------------
const ts = readFileSync(TS_PATH, "utf8");
const tsCodesBlock = ts.match(
  /export const GRAPH_ISSUE_CODES\s*=\s*\[([\s\S]*?)\] as const/
);
if (tsCodesBlock === null) {
  fail(`GRAPH_ISSUE_CODES block not found in ${TS_PATH}`);
}
const tsCodes = tsCodesBlock
  ? [...tsCodesBlock[1].matchAll(/"([A-Z0-9_]+)"/g)].map((m) => m[1])
  : [];
const tsTokensBlock = ts.match(
  /export const GRAPH_ISSUE_TOKENS[^{]*=\s*\{([\s\S]*?)\}/
);
if (tsTokensBlock === null) {
  fail("GRAPH_ISSUE_TOKENS block not found in TS file");
}
const tsTokenMap = new Map(
  tsTokensBlock
    ? [...tsTokensBlock[1].matchAll(/([A-Z0-9_]+):\s*"([^"]+)"/g)].map(
        (m) => [m[1], m[2]]
      )
    : []
);

// ---- comparisons ----------------------------------------------------------
if (pyCodes.length !== tsCodes.length) {
  fail(`code count drift: python ${pyCodes.length} vs ts ${tsCodes.length}`);
} else {
  for (let i = 0; i < pyCodes.length; i++) {
    if (pyCodes[i] !== tsCodes[i]) {
      fail(
        `code order drift at ${i}: python "${pyCodes[i]}" vs ts "${tsCodes[i]}"`
      );
    }
  }
}
for (const code of pyCodes) {
  const pyToken = pyTokenMap.get(code);
  if (pyToken === undefined) {
    fail(`python _MESSAGE_TOKENS missing entry for "${code}"`);
    continue;
  }
  const tsToken = tsTokenMap.get(code);
  if (tsToken === undefined) {
    fail(`TS GRAPH_ISSUE_TOKENS missing entry for "${code}"`);
  } else if (tsToken !== pyToken) {
    fail(
      `token drift for "${code}": python "${pyToken}" vs ts "${tsToken}"`
    );
  }
}
for (const code of tsTokenMap.keys()) {
  if (!pyCodes.includes(code)) {
    fail(`TS GRAPH_ISSUE_TOKENS has unknown code "${code}"`);
  }
}

// ---- 4. i18n parity: every graph.* token in BOTH dicts --------------------
function dictKeys(filePath) {
  const src = readFileSync(filePath, "utf8");
  return new Set(
    [...src.matchAll(/"([A-Za-z0-9.\-]+)":\s*"/g)].map((m) => m[1])
  );
}
const faKeys = dictKeys(FA_PATH);
const enKeys = dictKeys(EN_PATH);
for (const code of pyCodes) {
  const token = pyTokenMap.get(code);
  if (token === undefined) {
    continue;
  }
  if (!faKeys.has(token)) {
    fail(`fa dictionary missing "${token}"`);
  }
  if (!enKeys.has(token)) {
    fail(`en dictionary missing "${token}"`);
  }
}
for (const key of faKeys) {
  if (!enKeys.has(key)) {
    fail(`i18n parity: key only in fa: "${key}"`);
  }
}
for (const key of enKeys) {
  if (!faKeys.has(key)) {
    fail(`i18n parity: key only in en: "${key}"`);
  }
}

// ---- verdict ---------------------------------------------------------------
if (errors.length > 0) {
  console.error("FAIL graph token sync guard:");
  for (const message of errors) {
    console.error(`  - ${message}`);
  }
  process.exit(1);
}
console.log(
  `PASS graph token sync: ${pyCodes.length} codes, ${pyTokenMap.size} python tokens, ` +
    `${tsCodes.length} ts codes, ${tsTokenMap.size} ts tokens, ` +
    `${faKeys.size} fa keys == ${enKeys.size} en keys`
);
