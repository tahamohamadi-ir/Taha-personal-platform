import type { LocaleCode } from "./site";
import { profileEn } from "./profile.en";
import { profileFa } from "./profile.fa";

export interface Skill {
  category: string;
  name: string;
  source: string;
  slug?: string;
  translationKey?: string;
  detailBody?: string;
  detail_body?: string;
}

export interface ExperienceEntry {
  organization: string;
  role: string;
  period: string;
  location?: string;
  website?: string;
  bullets: string[];
  slug?: string;
  translationKey?: string;
  detailBody?: string;
  detail_body?: string;
  story?: {
    locale: string;
    title: string;
    sections: Array<{
      layout: string;
      ratio: string;
      blocks: Array<{
        blockType: string;
        settings: Record<string, unknown>;
      }>;
    }>;
  } | null;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  period: string;
  gpa?: string;
  thesis?: string;
  slug?: string;
  translationKey?: string;
  detailBody?: string;
  detail_body?: string;
}

export interface PublicationEntry {
  title: string;
  status: string;
  slug?: string;
  translationKey?: string;
  detailBody?: string;
  detail_body?: string;
}

export interface ResearchProject {
  title: string;
  summary: string;
  url?: string;
  linkLabel?: string;
  slug?: string;
  translationKey?: string;
  detailBody?: string;
  detail_body?: string;
}

export interface Certificate {
  name: string;
  detail?: string;
  slug?: string;
  translationKey?: string;
  detailBody?: string;
  detail_body?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Profile {
  shortBio: string;
  longBio?: string;
  skills: Skill[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  publications: PublicationEntry[];
  researchProjects: ResearchProject[];
  certificates: Certificate[];
  socials: SocialLink[];
  availability: string;
  availableLocales?: string[];
  locale?: string;
  slug?: string;
  title?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string | null;
}

export const profile: Record<LocaleCode, Profile> = {
  en: profileEn,
  fa: profileFa,
};

function assertProfile(target: Profile, locale: string): void {
  if (!target.shortBio.trim()) {
    throw new Error(`Profile for "${locale}" has an empty shortBio.`);
  }
  if (!target.availability.trim()) {
    throw new Error(`Profile for "${locale}" has an empty availability.`);
  }
  if (target.skills.length === 0) {
    throw new Error(`Profile for "${locale}" has an empty skills array.`);
  }
  for (const entry of target.experience) {
    if (!entry.organization.trim() || !entry.role.trim() || !entry.period.trim()) {
      throw new Error(`Profile "${locale}" has an incomplete experience entry.`);
    }
  }
  for (const social of target.socials) {
    if (!/^https?:\/\//.test(social.url)) {
      throw new Error(`Profile "${locale}" social URL must be absolute: ${social.platform}`);
    }
  }
}

export function validateProfile(target?: Profile, locale?: string): void {
  if (target && locale) {
    assertProfile(target, locale);
    return;
  }
  for (const [currentLocale, currentProfile] of Object.entries(profile) as [LocaleCode, Profile][]) {
    assertProfile(currentProfile, currentLocale);
  }
}
