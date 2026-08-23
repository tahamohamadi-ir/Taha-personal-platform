import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(webRoot, "dist");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(rel) {
  const path = join(distDir, rel);
  assert(existsSync(path), `missing dist file: ${rel}`);
  return readFileSync(path, "utf8");
}

for (const locale of ["en", "fa"]) {
  const xml = read(`${locale}/writing/rss.xml`);
  assert(xml.includes("<?xml"), `${locale} RSS missing XML declaration`);
  assert(xml.includes("<rss"), `${locale} RSS missing rss root`);
  assert(xml.includes("<channel>"), `${locale} RSS missing channel`);
  assert(!/\bdraft\b/i.test(xml), `${locale} RSS appears to mention draft`);
  assert(!xml.includes("/blog/"), `${locale} RSS still points at /blog/`);
  assert(
    xml.includes(`/${locale}/writing/`),
    `${locale} RSS missing writing channel path`,
  );
}

console.log("writing-rss.spec: PASS");
