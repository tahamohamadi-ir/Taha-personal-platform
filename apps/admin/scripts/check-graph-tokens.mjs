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

import { readFileSync, readdirSync } from "node:fs";
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

// ---- 5. AF-07 extension: referenced-key coverage --------------------------
// Every statically referenced redesign.*/graph.* key in src/** must exist in
// BOTH dictionaries. Template-built namespaces (locale/mode/module/token) are
// covered by explicit enumerations parsed from the frozen TS mirrors, so a
// key referenced only via `t(\`redesign.x.${v}\`)` cannot silently 404 into
// the raw-key fallback of tRedesign.
const DICT_FILES = new Set([FA_PATH, EN_PATH]);

function listSourceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !DICT_FILES.has(full)) {
      out.push(full);
    }
  }
  return out;
}

const referencedKeys = new Set();
for (const file of listSourceFiles(path.join(adminRoot, "src"))) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(
    /"((?:redesign|graph)\.[A-Za-z0-9][A-Za-z0-9.\-]*)"/g
  )) {
    referencedKeys.add(m[1]);
  }
}

function constStringArray(tsSource, name) {
  const block = tsSource.match(
    new RegExp(`export const ${name}[^=]*=\\s*\\[([\\s\\S]*?)\\]`)
  );
  return block
    ? [...block[1].matchAll(/"([A-Za-z0-9.\-]+)"/g)].map((m) => m[1])
    : [];
}
const homeModuleKeys = constStringArray(ts, "HOME_MODULE_KEYS");
const homeFieldTokens = constStringArray(ts, "HOME_FIELD_TOKENS");
const mediaFieldTokens = constStringArray(ts, "MEDIA_FIELD_TOKENS");
if (homeModuleKeys.length === 0) {
  fail("HOME_MODULE_KEYS not parsed from adminApiExt.ts (dynamic key guard)");
}
for (const locale of ["fa", "en"]) {
  referencedKeys.add(`redesign.home.locale.${locale}`);
}
for (const mode of ["manual", "rule", "hybrid"]) {
  referencedKeys.add(`redesign.home.mode.${mode}`);
}
for (const key of homeModuleKeys) {
  referencedKeys.add(`redesign.module.${key}`);
}
for (const token of [...homeFieldTokens, ...mediaFieldTokens]) {
  referencedKeys.add(`redesign.token.${token}`);
}

for (const key of referencedKeys) {
  if (!faKeys.has(key)) {
    fail(`referenced key missing in fa dictionary: "${key}"`);
  }
  if (!enKeys.has(key)) {
    fail(`referenced key missing in en dictionary: "${key}"`);
  }
}

// Informational, non-fatal: dictionary keys with no static/enum reference.
// Dynamic namespaces are excluded (server token lists stay open-ended).
const DYNAMIC_PREFIXES = [
  "redesign.token.",
  "redesign.module.",
  "redesign.home.mode.",
  "redesign.home.locale.",
];
for (const key of faKeys) {
  if (
    !referencedKeys.has(key) &&
    !DYNAMIC_PREFIXES.some((prefix) => key.startsWith(prefix))
  ) {
    console.error(`INFO unused dictionary key: "${key}"`);
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
