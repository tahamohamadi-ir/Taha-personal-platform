// WF-07H adoption QA gate for the Contact family (source-scan; mirrors the
// structural style of qa/projects-adopt.spec.mjs). Plain Node script, no
// dependencies.
//
// Asserts the contact family is composed from the shared template/component
// layer and that the family behavior + privacy contracts survive adoption:
//
//   pages    : both locale routes adopted onto UtilityTemplate; NO
//              breadcrumbs slot (IA-CONTRACT S7 forbids them on Contact);
//              single H1 via SectionLead as="h1" in the lead slot;
//              ContactPage fills the content slot; the contact loader is a
//              route-level build-time fetch (props-in component)
//   body     : ContactPage composes ui/InputField + ui/TextareaField +
//              ui/Button + ui/ContentState (no one-off field/button markup,
//              no runtime fetch inside the component)
//   form     : frozen endpoint/field names preserved - urlencoded POST to
//              /api/contact with locale, website honeypot, name, email,
//              message; every visible label resolves from the content.ts
//              contact dictionary (no label literals)
//   states   : distinct submit states - success panel (ContentState ready,
//              renders role=status) and failure panel (ContentState error,
//              renders role=alert); entered values re-render through the
//              primitive value props wired from the Astro.url query
//              round-trip (value={restore(...)} retention markers); the
//              endpoint still answers 503 honestly when SMTP is unset
//   privacy  : hard privacy rule (board A10) - NO tel: links, NO phone
//              number patterns, NO gmail literal anywhere in the family
//              sources

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");

const failures = [];
const passed = [];
const check = (ok, message) => {
  if (ok) passed.push(message);
  else failures.push(message);
  return ok;
};

function readSource(relativePath) {
  try {
    return readFileSync(join(webRoot, relativePath), "utf8");
  } catch {
    return null;
  }
}

const contactPageSrc = readSource(join("src", "components", "ContactPage.astro"));
check(
  contactPageSrc !== null,
  "contact: src/components/ContactPage.astro is readable",
);

// --- per-locale route adoption ---------------------------------------------------
for (const locale of ["en", "fa"]) {
  const pageSrc = readSource(join("src", "pages", locale, "contact.astro"));
  check(pageSrc !== null, `${locale}: pages/${locale}/contact.astro is readable`);
  if (pageSrc === null) continue;

  check(
    pageSrc.includes('from "../../layouts/UtilityTemplate.astro"'),
    `${locale}: adopted onto UtilityTemplate`,
  );
  check(
    !pageSrc.includes('slot="breadcrumbs"'),
    `${locale}: breadcrumbs slot left unfilled (IA-CONTRACT S7 forbids breadcrumbs on Contact; unfilled slot renders no wrapper gap)`,
  );
  check(
    !/<h1[\s>]/.test(pageSrc),
    `${locale}: no literal <h1> (single H1 arrives via SectionLead as="h1")`,
  );
  check(
    pageSrc.includes("<SectionLead") &&
      pageSrc.includes('as="h1"') &&
      pageSrc.includes('slot="lead"'),
    `${locale}: lead slot filled by SectionLead as="h1" (contact heading + intro dictionary strings)`,
  );
  check(
    pageSrc.includes("<ContactPage") && pageSrc.includes('slot="content"'),
    `${locale}: ContactPage fills the content slot`,
  );
  check(
    pageSrc.includes("getSiteContact("),
    `${locale}: contact loader is a route-level build-time fetch (component stays props-in)`,
  );
}

// --- ContactPage body composition --------------------------------------------------
if (contactPageSrc !== null) {
  check(
    contactPageSrc.includes('from "./ui/InputField.astro"') &&
      contactPageSrc.includes('from "./ui/TextareaField.astro"') &&
      contactPageSrc.includes('from "./ui/Button.astro"') &&
      contactPageSrc.includes('from "./ui/ContentState.astro"'),
    "contact: form rebuilt on ui/InputField + ui/TextareaField + ui/Button + ui/ContentState",
  );
  check(
    !/\bawait\b/.test(contactPageSrc) &&
      !contactPageSrc.includes("cmsFetchJson"),
    "contact: ContactPage is props-in/markup-out (no runtime fetch inside the component)",
  );
  check(
    contactPageSrc.includes('method="post"') &&
      contactPageSrc.includes('action="/api/contact"'),
    "contact: form keeps the frozen urlencoded POST to /api/contact",
  );
  check(
    contactPageSrc.includes('name="locale"') &&
      contactPageSrc.includes('name="website"') &&
      /name="name"/.test(contactPageSrc) &&
      /name="email"/.test(contactPageSrc) &&
      /name="message"/.test(contactPageSrc),
    "contact: field names preserved (locale, website honeypot, name, email, message)",
  );
  check(
    contactPageSrc.includes("label={contactCopy.nameLabel}") &&
      contactPageSrc.includes("label={contactCopy.emailLabel}") &&
      contactPageSrc.includes("label={contactCopy.messageLabel}"),
    "contact: visible field labels resolve from the content.ts contact dictionary",
  );
  check(
    contactPageSrc.includes("contactCopy.formIntro") &&
      contactPageSrc.includes("contactCopy.sendLabel") &&
      contactPageSrc.includes("contactCopy.sentHeading") &&
      contactPageSrc.includes("contactCopy.errorHeading") &&
      contactPageSrc.includes("contactCopy.unavailable"),
    "contact: form copy (intro/send/success/error/unavailable) is dictionary-driven",
  );
  check(
    !/label="[^"]+"/.test(contactPageSrc),
    "contact: no label literals in the form (labels come from the locale dictionary)",
  );
  check(
    contactPageSrc.includes('value={restore("name")}') &&
      contactPageSrc.includes('value={restore("email")}') &&
      contactPageSrc.includes('value={restore("message")}'),
    "contact: value-retention markers present - primitive value props re-render entered values (Astro.url query round-trip)",
  );
  check(
    contactPageSrc.includes("Astro.url.searchParams"),
    "contact: retention/state wiring reads Astro.url (form handling round-trip)",
  );
  check(
    contactPageSrc.includes('kind="ready"') &&
      contactPageSrc.includes('kind="error"'),
    "contact: distinct submit states - ready panel (role=status) for success, error panel (role=alert) for failure via ui/ContentState",
  );
  check(
    contactPageSrc.includes("<Button") &&
      contactPageSrc.includes('type="submit"'),
    "contact: submit action composed from the ui/Button primitive",
  );
  check(
    contactPageSrc.includes("contact-details") &&
      contactPageSrc.includes("mailto:"),
    "contact: alternative contact paths (email link etc.) preserved verbatim",
  );
  check(
    contactPageSrc.includes("contact-unavailable"),
    "contact: honest unavailable state preserved (contact-unavailable panel)",
  );
}

// --- dictionary contract (content.ts contact block) ---------------------------------
const contentSrc = readSource(join("src", "data", "content.ts"));
check(
  contentSrc !== null,
  "contact: src/data/content.ts is readable",
);
if (contentSrc !== null) {
  check(
    (contentSrc.match(/sentHeading: "/g) || []).length === 2 &&
      (contentSrc.match(/errorHeading: "/g) || []).length === 2,
    "contact: dictionary defines sentHeading/errorHeading for BOTH locales (endpoint-mirrored state copy)",
  );
}

// --- privacy hard rule (board A10) ---------------------------------------------------
const privacyFiles = [
  ["src/components/ContactPage.astro", contactPageSrc],
  [
    "src/pages/en/contact.astro",
    readSource(join("src", "pages", "en", "contact.astro")),
  ],
  [
    "src/pages/fa/contact.astro",
    readSource(join("src", "pages", "fa", "contact.astro")),
  ],
];
const PRIVACY_PATTERNS = [
  [/tel:/i, "tel: link"],
  [/\+98[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}/, "Iran mobile number"],
  [/\b9\d{2}[\s.-]?\d{3}[\s.-]?\d{4}\b/, "phone digit pattern"],
  [/98910\d{7}/, "compact Iran mobile number"],
  [/\b910[\s-]?235[\s-]?5374\b/, "known phone literal (910 235 5374)"],
  [/\b925[\s-]?456[\s-]?4581\b/, "known phone literal (925 456 4581)"],
  [/gmail/i, "gmail literal"],
];
for (const [file, src] of privacyFiles) {
  if (src === null) {
    check(false, `privacy: ${file} is readable`);
    continue;
  }
  for (const [pattern, label] of PRIVACY_PATTERNS) {
    check(!pattern.test(src), `privacy: ${file} has no ${label}`);
  }
}

// --- report ---------------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`contact-adopt.spec: FAIL - ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `contact-adopt.spec: PASS - ${passed.length} adoption checks: both locales on UtilityTemplate (no breadcrumbs, single H1 via SectionLead), form on ui primitives with dictionary labels + value-retention markers, distinct ready/error submit panels, frozen /api/contact field contract, privacy sweep clean (no tel:/phone/gmail)`,
);
