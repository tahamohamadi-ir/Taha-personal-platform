import { site } from "./site";
import { content } from "./content";
import { profile } from "./profile";
import type { LocaleCode } from "./site";

export interface JsonLdBlock {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

export function websiteJsonLd(): JsonLdBlock {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: content.en.name,
    url: site.url,
    inLanguage: [...site.locales],
  };
}

export function personJsonLd(locale: LocaleCode): JsonLdBlock {
  const p = profile[locale];
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.en.name,
    url: site.url,
    sameAs: p.socials.map((s) => s.url),
    alumniOf: p.education.map((e) => ({
      "@type": "CollegeOrUniversity",
      name: e.institution,
    })),
  };
}

export function validateStructuredData(...blocks: JsonLdBlock[]): void {
  for (const block of blocks) {
    const serialized = JSON.stringify(block);
    const parsed = JSON.parse(serialized) as JsonLdBlock;
    if (parsed["@context"] !== "https://schema.org") {
      throw new Error("Structured data block is missing the schema.org context.");
    }
    if (typeof parsed["@type"] !== "string" || parsed["@type"].length === 0) {
      throw new Error("Structured data block is missing a @type.");
    }
    if (typeof parsed.url === "string" && !/^https?:\/\//.test(parsed.url)) {
      throw new Error(`Structured data url must be absolute: ${parsed.url}`);
    }
    if (Array.isArray(parsed.sameAs)) {
      for (const url of parsed.sameAs as string[]) {
        if (!/^https?:\/\//.test(url)) {
          throw new Error(`Structured data sameAs url must be absolute: ${url}`);
        }
      }
    }
    if (Array.isArray(parsed.inLanguage)) {
      for (const lang of parsed.inLanguage as string[]) {
        if (!site.locales.includes(lang as LocaleCode)) {
          throw new Error(`Structured data inLanguage must be a real locale: ${lang}`);
        }
      }
    }
  }
}
