/* Contact page + privacy contract (board A10 refinement, 2026-08-23).
 * Runs against the built dist/ — no server needed.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dist = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));

function read(path) {
  return readFileSync(resolve(dist, path), "utf8");
}

let failures = 0;
function check(name, condition) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    console.error(`FAIL ${name}`);
    failures += 1;
  }
}

for (const locale of ["en", "fa"]) {
  const page = read(`${locale}/contact/index.html`);

  check(`${locale}: contact page has h1`, /<h1/i.test(page));
  check(`${locale}: message form posts to /api/contact`, page.includes('action="/api/contact"'));
  check(`${locale}: honeypot present`, page.includes('name="website"'));
  check(`${locale}: email link present`, page.includes("mailto:taha.mohammadi@shahed.ac.ir"));
  check(`${locale}: LinkedIn link present`, page.includes("linkedin.com/in/taha-mohammadi"));
  check(`${locale}: ORCID link present`, page.includes("orcid.org"));
  check(`${locale}: NO phone numbers anywhere`, !page.includes("989102355374") && !page.includes("910 235 5374") && !page.includes("925 456 4581"));
  check(`${locale}: NO tel: links`, !page.includes("tel:"));
  check(`${locale}: nav links to contact`, page.includes(`/${locale}/contact/`));
}

const enFooter = read("en/writing/index.html");
check("footer keeps email link", enFooter.includes("mailto:taha.mohammadi@shahed.ac.ir"));
check("footer has NO form", !enFooter.includes('action="/api/contact"'));
check("footer has NO phone", !enFooter.includes("910 235 5374") && !enFooter.includes("925 456 4581"));
check("footer nav links Contact", enFooter.includes("/en/contact/"));

const sitemap = read("sitemap.xml");
check("sitemap lists /en/contact/", sitemap.includes("/en/contact/"));
check("sitemap lists /fa/contact/", sitemap.includes("/fa/contact/"));

process.exit(failures === 0 ? 0 : 1);
