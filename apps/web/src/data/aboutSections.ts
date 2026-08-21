import type {
  Certificate,
  EducationEntry,
  ExperienceEntry,
  Profile,
  PublicationEntry,
  ResearchProject,
  Skill,
} from "./profile";
import type { LocaleContent } from "./content";
import type { LocaleCode } from "./site";

export type AboutSectionId =
  | "experience"
  | "education"
  | "skills"
  | "research"
  | "publications"
  | "certificates";

export interface AboutSectionItem {
  id: string;
  title: string;
  eyebrow?: string;
  meta?: string;
  body?: string;
  bullets?: string[];
  href?: string;
  hrefLabel?: string;
  detailSlug?: string;
  detailBody?: string;
  translationKey?: string;
  story?: ExperienceEntry["story"];
}

export interface AboutSection {
  id: AboutSectionId;
  label: string;
  items: AboutSectionItem[];
}

const SECTION_ORDER: AboutSectionId[] = [
  "experience",
  "education",
  "skills",
  "research",
  "publications",
  "certificates",
];

function compact(parts: Array<string | undefined | null | false>): string | undefined {
  const value = parts.filter(Boolean).join(" · ").trim();
  return value || undefined;
}

function detailBodyFor(value: { detailBody?: string; detail_body?: string }): string | undefined {
  const detailBody = value.detailBody?.trim() || value.detail_body?.trim();
  return detailBody || undefined;
}

export function hasDetailContent(item: {
  detailSlug?: string;
  detailBody?: string;
  story?: ExperienceEntry["story"];
}): boolean {
  if (!item.detailSlug) return false;
  if (item.detailBody?.trim()) return true;
  return Boolean(item.story && item.story.sections.length > 0);
}

function mapExperience(entry: ExperienceEntry, index: number): AboutSectionItem {
  return {
    id: `experience-${index}`,
    title: entry.role,
    eyebrow: entry.organization,
    meta: compact([entry.period, entry.location]),
    body: undefined,
    bullets: entry.bullets,
    href: entry.website,
    hrefLabel: entry.organization,
    detailSlug: entry.slug,
    detailBody: detailBodyFor(entry),
    translationKey: entry.translationKey,
    story: entry.story ?? null,
  };
}

function mapEducation(entry: EducationEntry, index: number): AboutSectionItem {
  return {
    id: `education-${index}`,
    title: `${entry.degree} — ${entry.field}`,
    eyebrow: entry.institution,
    meta: compact([entry.period, entry.gpa]),
    body: entry.thesis,
    detailSlug: entry.slug,
    detailBody: detailBodyFor(entry),
    translationKey: entry.translationKey,
  };
}

function mapSkill(entry: Skill, index: number): AboutSectionItem {
  return {
    id: `skills-${index}`,
    title: entry.name,
    eyebrow: entry.category,
    meta: entry.source,
    detailSlug: entry.slug,
    detailBody: detailBodyFor(entry),
    translationKey: entry.translationKey,
  };
}

function mapResearch(entry: ResearchProject, index: number): AboutSectionItem {
  return {
    id: `research-${index}`,
    title: entry.title,
    body: entry.summary,
    href: entry.url,
    hrefLabel: entry.linkLabel,
    detailSlug: entry.slug,
    detailBody: detailBodyFor(entry),
    translationKey: entry.translationKey,
  };
}

function mapPublication(entry: PublicationEntry, index: number): AboutSectionItem {
  return {
    id: `publications-${index}`,
    title: entry.title,
    body: entry.status,
    detailSlug: entry.slug,
    detailBody: detailBodyFor(entry),
    translationKey: entry.translationKey,
  };
}

function mapCertificate(entry: Certificate, index: number): AboutSectionItem {
  return {
    id: `certificates-${index}`,
    title: entry.name,
    body: entry.detail,
    detailSlug: entry.slug,
    detailBody: detailBodyFor(entry),
    translationKey: entry.translationKey,
  };
}

export function getAboutSections(content: LocaleContent, profile: Profile): AboutSection[] {
  const allSections: Record<AboutSectionId, AboutSection> = {
    experience: {
      id: "experience",
      label: content.sections?.experience ?? "",
      items: profile.experience.map(mapExperience),
    },
    education: {
      id: "education",
      label: content.sections?.education ?? "",
      items: profile.education.map(mapEducation),
    },
    skills: {
      id: "skills",
      label: content.sections?.skills ?? "",
      items: profile.skills.map(mapSkill),
    },
    research: {
      id: "research",
      label: content.sections?.research ?? "",
      items: profile.researchProjects.map(mapResearch),
    },
    publications: {
      id: "publications",
      label: content.sections?.publications ?? "",
      items: profile.publications.map(mapPublication),
    },
    certificates: {
      id: "certificates",
      label: content.sections?.certificates ?? "",
      items: profile.certificates.map(mapCertificate),
    },
  };

  return SECTION_ORDER.map((sectionId) => allSections[sectionId]).filter(
    (section) => section.label && section.items.length > 0,
  );
}

export function getAboutSection(
  content: LocaleContent,
  profile: Profile,
  sectionId: AboutSectionId,
): AboutSection | undefined {
  return getAboutSections(content, profile).find((section) => section.id === sectionId);
}

export function getSectionAlternateHref(locale: LocaleCode, sectionId: AboutSectionId): string {
  const alternateLocale = locale === "fa" ? "en" : "fa";
  return `/${alternateLocale}/about/${sectionId}/`;
}

export function getDetailAlternateHref(
  locale: LocaleCode,
  sectionId: AboutSectionId,
  item: AboutSectionItem,
  alternateProfile: Profile,
  alternateContent: LocaleContent,
): string | null {
  if (!item.translationKey) {
    return null;
  }

  const alternateSection = getAboutSection(alternateContent, alternateProfile, sectionId);
  const alternateItem = alternateSection?.items.find(
    (candidate) =>
      candidate.translationKey === item.translationKey &&
      hasDetailContent(candidate),
  );

  if (!alternateItem?.detailSlug) {
    return null;
  }

  const alternateLocale = locale === "fa" ? "en" : "fa";
  return `/${alternateLocale}/about/${sectionId}/${alternateItem.detailSlug}/`;
}
