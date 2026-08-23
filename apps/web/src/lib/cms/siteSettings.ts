/** CMS public site settings consumed by Astro at build time (optional CMS_API_BASE). */

import { cmsFetchJson, CmsOriginError, isCmsOriginBuild, throwIfCmsError } from "./client";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export interface PublicDownloadDto {
  kind: string;
  title: string;
  note: string;
  href: string;
  mime: string;
  size_bytes: number;
  updated_at: string | null;
}

export interface PublicSiteContactDto {
  email: string;
  location: string;
  linkedin: string;
  orcid: string;
  employer: string;
  employerUrl: string;
  formEnabled: boolean;
}

export interface PublicSiteSettingsDto {
  primaryColor: string;
  downloads: PublicDownloadDto[];
  contact?: PublicSiteContactDto;
  brandName?: string;
  tagline?: string;
  footerText?: string;
  seoDefaultTitle?: string;
  seoDefaultDescription?: string;
}

/** Default primary color when CMS_API_BASE is unset (offline builds). */
export const FALLBACK_PRIMARY_COLOR = "#087c73";

/** Published site settings. Null when CMS_API_BASE is unset. Outage fails the build. */
export async function getPublicSiteSettings(): Promise<PublicSiteSettingsDto | null> {
  const result = await cmsFetchJson<PublicSiteSettingsDto>("/api/site");
  throwIfCmsError(result, "site settings");
  if (result.kind === "unset") return null;
  if (result.kind === "http") {
    if (result.status === 404) {
      if (isCmsOriginBuild()) {
        throw new CmsOriginError("site settings: unexpected HTTP 404", 404);
      }
      return null;
    }
    throw new CmsOriginError(
      `site settings: unexpected HTTP ${result.status}`,
      result.status,
    );
  }
  return result.data;
}

/**
 * Public contact block. CMS-driven when CMS_API_BASE is set (production
 * builds); the committed snapshot below is the offline-dev fallback ONLY
 * (never the production artifact — cms-build-origin honesty rule).
 */
const OFFLINE_CONTACT_SNAPSHOT: PublicSiteContactDto = {
  email: "taha.mohammadi@shahed.ac.ir",
  location: "Tehran, Iran",
  linkedin: "https://linkedin.com/in/taha-mohammadi-95770986",
  orcid: "https://orcid.org/0009-0006-7736-7638",
  employer: "MCI (Hamrah-e Aval)",
  employerUrl: "https://mci.ir",
  // Mirrors migration 0003 seed. Offline submissions hit /api/contact and get
  // an honest "email not configured" page until SMTP env exists.
  formEnabled: true,
};

export async function getSiteContact(): Promise<PublicSiteContactDto | null> {
  const settings = await getPublicSiteSettings();
  const contact = settings?.contact;
  if (!contact || (!contact.email && !contact.location && !contact.linkedin && !contact.orcid && !contact.employer && !contact.employerUrl)) {
    if (!isCmsOriginBuild()) return OFFLINE_CONTACT_SNAPSHOT;
    return null;
  }
  const normalized: PublicSiteContactDto = {
    email: (contact.email || "").trim(),
    location: (contact.location || "").trim(),
    linkedin: (contact.linkedin || "").trim(),
    orcid: (contact.orcid || "").trim(),
    employer: (contact.employer || "").trim(),
    employerUrl: (contact.employerUrl || "").trim(),
    formEnabled: Boolean(contact.formEnabled),
  };
  const hasDetails =
    normalized.email !== "" ||
    normalized.linkedin !== "" ||
    normalized.orcid !== "" ||
    normalized.location !== "" ||
    normalized.employer !== "";
  if (!hasDetails) {
    if (!isCmsOriginBuild()) return OFFLINE_CONTACT_SNAPSHOT;
    return null;
  }
  return normalized;
}

/** Valid `#RRGGBB` from CMS, else null (keep CSS defaults). */
export async function getPrimaryColorOverride(): Promise<string | null> {
  const settings = await getPublicSiteSettings();
  if (!settings) return null;
  const color = (settings.primaryColor || "").trim();
  return HEX_COLOR_RE.test(color) ? color : null;
}

/** CMS-driven brand name. Null when not set or honest empty (CMS base set with no value). */
export async function getSiteBrand(): Promise<string | null> {
  const settings = await getPublicSiteSettings();
  if (!settings) return null;
  const raw = (settings.brandName ?? "").trim();
  return raw || null;
}

/** CMS-driven tagline. Null when not set or honest empty. */
export async function getSiteTagline(): Promise<string | null> {
  const settings = await getPublicSiteSettings();
  if (!settings) return null;
  const raw = (settings.tagline ?? "").trim();
  return raw || null;
}

/** CMS-driven footer text. Null when not set or honest empty. */
export async function getSiteFooterText(): Promise<string | null> {
  const settings = await getPublicSiteSettings();
  if (!settings) return null;
  const raw = (settings.footerText ?? "").trim();
  return raw || null;
}

/** CMS-driven SEO defaults. Null fields when not set or honest empty. */
export async function getSiteSeoDefaults(): Promise<{ title: string | null; description: string | null }> {
  const settings = await getPublicSiteSettings();
  if (!settings) return { title: null, description: null };
  const t = (settings.seoDefaultTitle ?? "").trim();
  const d = (settings.seoDefaultDescription ?? "").trim();
  return { title: t || null, description: d || null };
}

/** Active current CV/resume downloads from the media library. */
export async function getCurrentCvDownloads(): Promise<PublicDownloadDto[]> {
  const settings = await getPublicSiteSettings();
  if (!settings || !Array.isArray(settings.downloads)) return [];
  return settings.downloads.filter(
    (item) =>
      typeof item.href === "string" &&
      item.href.startsWith("/media/") &&
      typeof item.title === "string" &&
      item.title.trim() !== "",
  );
}
