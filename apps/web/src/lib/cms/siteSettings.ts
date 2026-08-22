/** CMS public site settings consumed by Astro at build time (optional CMS_API_BASE). */

import { cmsFetchJson, CmsOriginError, throwIfCmsError } from "./client";

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

export interface PublicSiteSettingsDto {
  primaryColor: string;
  downloads: PublicDownloadDto[];
}

/** Default primary color when CMS_API_BASE is unset (offline builds). */
export const FALLBACK_PRIMARY_COLOR = "#087c73";

/** Published site settings. Null when CMS_API_BASE is unset. Outage fails the build. */
export async function getPublicSiteSettings(): Promise<PublicSiteSettingsDto | null> {
  const result = await cmsFetchJson<PublicSiteSettingsDto>("/api/site");
  throwIfCmsError(result, "site settings");
  if (result.kind === "unset") return null;
  if (result.kind === "http") {
    if (result.status === 404) return null;
    throw new CmsOriginError(
      `site settings: unexpected HTTP ${result.status}`,
      result.status,
    );
  }
  return result.data;
}

/** Valid `#RRGGBB` from CMS, else null (keep CSS defaults). */
export async function getPrimaryColorOverride(): Promise<string | null> {
  const settings = await getPublicSiteSettings();
  if (!settings) return null;
  const color = (settings.primaryColor || "").trim();
  return HEX_COLOR_RE.test(color) ? color : null;
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
