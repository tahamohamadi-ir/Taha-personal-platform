export const site = {
  url: "https://tahamohamadi.ir",
  version: "0.1.0",
  locales: ["fa", "en"] as const,
} as const;

export type LocaleCode = (typeof site.locales)[number];
