import type { LocaleCode } from "./site";
import { profileEn } from "./profile.en";
import { profileFa } from "./profile.fa";

export interface Skill {
  category: string;
  name: string;
  source: string;
}

export interface ExperienceEntry {
  organization: string;
  role: string;
  period: string;
  location?: string;
  website?: string;
  bullets: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  period: string;
  gpa?: string;
  thesis?: string;
}

export interface PublicationEntry {
  title: string;
  status: string;
}

export interface ResearchProject {
  title: string;
  summary: string;
}

export interface Certificate {
  name: string;
  detail?: string;
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
    for (const e of p.experience) {
      if (!e.organization.trim() || !e.role.trim() || !e.period.trim()) {
        throw new Error(`Profile "${locale}" has an incomplete experience entry.`);
      }
    }
    for (const s of p.socials) {
      if (!/^https?:\/\//.test(s.url)) {
        throw new Error(`Profile "${locale}" social URL must be absolute: ${s.platform}`);
      }
    }
  }
}
