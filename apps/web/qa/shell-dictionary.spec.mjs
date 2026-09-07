import { readFileSync } from "node:fs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Remaining-work (LOG-0281 owner queue item 4): Header.astro hardcodes the
 * "More" disclosure label and the theme-toggle label per locale instead of
 * reading them from the content.ts locale dictionary (the file itself
 * carries a WF-03 ESCALATE comment admitting it). Relocate the exact live
 * strings byte-for-byte — no new copy is invented here.
 */
const header = readFileSync(new URL("../src/components/Header.astro", import.meta.url), "utf8");
assert(
  !header.includes('? "بیشتر" : "More"') && !header.includes("? 'بیشتر'"),
  'Header.astro still hardcodes the More label ternary (use content.nav.moreLabel)',
);
assert(
  !header.includes('"Toggle theme"') || header.includes("content.nav.themeLabel"),
  'Header.astro still hardcodes the theme label (use content.nav.themeLabel)',
);

const content = readFileSync(new URL("../src/data/content.ts", import.meta.url), "utf8");
for (const key of ["moreLabel", "themeLabel"]) {
  const hits = content.match(new RegExp(`${key}:`, "g")) ?? [];
  assert(
    hits.length >= 3,
    `content.ts must declare ${key} in the LocaleContent type + both locales (found ${hits.length})`,
  );
}

console.log("PASS shell-dictionary (More/ThemeToggle from content.ts)");
