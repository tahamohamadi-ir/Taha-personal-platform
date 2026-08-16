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

export function blogPostingJsonLd(input: {
  locale: LocaleCode;
  title: string;
  description: string;
  slug: string;
  publishedAt: string | null;
  updatedAt: string | null;
  wordCount: number;
}): JsonLdBlock {
  const url = new URL(`/${input.locale}/blog/${input.slug}/`, site.url).href;
  const block: JsonLdBlock = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url,
    inLanguage: input.locale,
    author: {
      "@type": "Person",
      name: content.en.name,
      url: site.url,
    },
    wordCount: input.wordCount,
  };
  if (input.publishedAt) block.datePublished = input.publishedAt;
  if (input.updatedAt) block.dateModified = input.updatedAt;
  return block;
}

export function breadcrumbJsonLd(
  crumbs: Array<{ name: string; path: string }>,
): JsonLdBlock {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: new URL(crumb.path, site.url).href,
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

/** Serialize JSON-LD for inline ``<script>`` without ``</script>`` breakout. */
export function jsonLdScriptContent(block: JsonLdBlock): string {
  return JSON.stringify(block).replace(/</g, "\\u003c");
}
