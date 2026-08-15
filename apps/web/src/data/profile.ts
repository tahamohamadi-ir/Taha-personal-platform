import type { LocaleCode } from "./site";
import { profileEn } from "./profile.en";
import { profileFa } from "./profile.fa";

export interface Skill {
  category: string;
  name: string;
  source: string;
}

export interface Profile {
  shortBio: string;
  skills: Skill[];
  availability: string;
}

export const profile: Record<LocaleCode, Profile> = {
  en: profileEn,
  fa: profileFa,
};

export function validateProfile(): void {
  for (const [locale, p] of Object.entries(profile) as [LocaleCode, Profile][]) {
    if (!p.shortBio.trim()) {
      throw new Error(`Profile for "${locale}" has an empty shortBio.`);
    }
    if (!p.availability.trim()) {
      throw new Error(`Profile for "${locale}" has an empty availability.`);
    }
    if (p.skills.length === 0) {
      throw new Error(`Profile for "${locale}" has an empty skills array.`);
    }
  }
}
