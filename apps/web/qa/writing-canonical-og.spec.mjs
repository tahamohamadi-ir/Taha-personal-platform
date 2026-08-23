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
  assert(existsSync(join(distDir, `${locale}/writing/index.html`)), `${locale}/writing/ missing`);
  const writing = read(`${locale}/writing/index.html`);
  assert(
    writing.includes('rel="alternate"') && writing.includes("application/rss+xml"),
    `${locale}/writing/ missing RSS alternate link`,
  );
  assert(
    writing.includes(`/${locale}/writing/rss.xml`),
    `${locale}/writing/ RSS href incorrect`,
  );
  assert(
    writing.includes('property="og:image"') && writing.includes("/og-default.png"),
    `${locale}/writing/ missing default og:image`,
  );

  const blogIndex = join(distDir, `${locale}/blog/index.html`);
  assert(existsSync(blogIndex), `${locale}/blog/ index missing from dist`);
  const blogHtml = readFileSync(blogIndex, "utf8");
  assert(
    blogHtml.includes(`/${locale}/writing/`) ||
      /http-equiv=["']refresh["']/i.test(blogHtml) ||
      /redirect/i.test(blogHtml),
    `${locale}/blog/ does not redirect toward writing`,
  );
}

assert(existsSync(join(distDir, "og-default.png")), "og-default.png missing from dist");
assert(existsSync(join(webRoot, "public/og-default.svg")), "og-default.svg source missing");

console.log("writing-canonical-og.spec: PASS");
