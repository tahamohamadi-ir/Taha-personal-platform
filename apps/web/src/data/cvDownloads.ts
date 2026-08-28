/** Shared CV download file lists for `/fa/cv/` and `/en/cv/`. */

import { cmsBase } from "../lib/cms/client";
import {
  getCurrentCvDownloads,
  type PublicDownloadDto,
} from "../lib/cms/siteSettings";

type Locale = "fa" | "en";

/* WF-CLEAN: DownloadFile moved here from the deleted legacy Downloads
   component (WF-07G adopted the rendering into UtilityTemplate; the type
   travels with its only data consumer). */
export interface DownloadFile {
  title: string;
  note: string;
  sizeKb: number;
  href: string;
  downloadName?: string;
  updatedAt?: string;
  formatLabel?: string;
}

const STATIC_FILES: Record<Locale, DownloadFile[]> = {
  en: [
    {
      title: "Academic CV — Master Career Profile",
      note: "Full academic career profile: identity, experience, education, research, publications and certificates.",
      sizeKb: 11,
      href: "/downloads/Taha_Mohammadi_Master_CV_Website_Profile.md",
      downloadName: "Taha_Mohammadi_Master_CV_Website_Profile.md",
      formatLabel: "Markdown",
      updatedAt: "2026-08-16",
    },
    {
      title: "Professional Resume — Software & AI",
      note: "Industry-focused resume for software engineering and applied AI roles.",
      sizeKb: 7,
      href: "/downloads/Taha_Mohammadi_Industry_Resume_Software_AI.md",
      downloadName: "Taha_Mohammadi_Industry_Resume_Software_AI.md",
      formatLabel: "Markdown",
      updatedAt: "2026-08-16",
    },
  ],
  fa: [
    {
      title: "CV دانشگاهی — پروفایل جامع حرفه‌ای",
      note: "پروفایل کامل حرفه‌ای: هویت، سوابق، تحصیلات، پژوهش، انتشارات و گواهی‌ها.",
      sizeKb: 11,
      href: "/downloads/Taha_Mohammadi_Master_CV_Website_Profile.md",
      downloadName: "Taha_Mohammadi_Master_CV_Website_Profile.md",
      formatLabel: "Markdown",
      updatedAt: "2026-08-16",
    },
    {
      title: "رزومهٔ حرفه‌ای — نرم‌افزار و هوش مصنوعی",
      note: "رزومهٔ متمرکز بر نقش‌های مهندسی نرم‌افزار و هوش مصنوعی کاربردی.",
      sizeKb: 7,
      href: "/downloads/Taha_Mohammadi_Industry_Resume_Software_AI.md",
      downloadName: "Taha_Mohammadi_Industry_Resume_Software_AI.md",
      formatLabel: "Markdown",
      updatedAt: "2026-08-16",
    },
  ],
};

function formatLabelForMime(mime: string): string {
  if (mime === "application/pdf") return "PDF";
  if (mime.startsWith("text/") || mime.includes("markdown")) return "Markdown";
  return mime || "File";
}

function formatUpdatedAt(value: string | null): string | undefined {
  if (!value) return undefined;
  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : undefined;
}

function downloadNameFromHref(href: string): string | undefined {
  const segment = href.split("/").pop();
  return segment && segment.length > 0 ? segment : undefined;
}

function fromCmsDownload(item: PublicDownloadDto): DownloadFile {
  return {
    title: item.title,
    note: item.note || "",
    sizeKb: Math.max(1, Math.round(item.size_bytes / 1024)),
    href: item.href,
    downloadName: downloadNameFromHref(item.href),
    formatLabel: formatLabelForMime(item.mime),
    updatedAt: formatUpdatedAt(item.updated_at),
  };
}

/**
 * Prefer admin-managed current documents from `/api/site` when present.
 * When CMS_API_BASE is set and CMS returns no downloads, return [] (honest empty).
 * Committed markdown downloads apply only when CMS_API_BASE is unset (local/offline).
 */
export async function resolveCvDownloadFiles(locale: Locale): Promise<DownloadFile[]> {
  const cms = await getCurrentCvDownloads();
  if (cms.length > 0) {
    return cms.map(fromCmsDownload);
  }
  if (cmsBase()) {
    return [];
  }
  return STATIC_FILES[locale];
}
