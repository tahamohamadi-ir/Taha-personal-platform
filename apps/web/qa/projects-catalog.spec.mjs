import { readFileSync } from "node:fs";

const distDir = new URL("../dist/", import.meta.url);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readHtml(relativePath) {
  return readFileSync(new URL(relativePath, distDir), "utf8");
}

for (const page of ["en/projects/index.html", "fa/projects/index.html"]) {
  const html = readHtml(page);
  assert(
    !html.includes("CMS_API_BASE"),
    `${page} still mentions CMS_API_BASE in visitor-facing HTML.`,
  );
  assert(
    html.includes("project-catalog") || html.includes("empty"),
    `${page} is missing the project catalog or honest empty state.`,
  );
}

console.log("projects-catalog.spec: PASS");
