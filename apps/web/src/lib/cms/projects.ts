/** CMS public project/case-study DTOs consumed by Astro at build time (optional CMS_API_BASE). */

import type {
  CollaboratorDto,
  EvidenceDto,
  FundingDto,
  ProjectDetailDto as ResearchProjectDetailDto,
  ProjectListDto as ResearchProjectListDto,
  RelatedSlugDto,
} from "./research";

export interface CaseStudyDto {
  depth: string;
  problem: string;
  constraints: string;
  technical_decisions: string;
  trade_offs: string;
  outcomes_summary: string;
  lessons_learned: string;
  testing_summary: string;
}

export interface DiagramDto {
  title: string;
  version: string;
  diagram_date: string;
  alt_text: string;
  long_description: string;
}

export interface ScreenshotDto {
  caption: string;
  alt_text: string;
  external_url: string;
}

export interface ProjectListDto extends ResearchProjectListDto {
  has_case_study: boolean;
  case_study_depth: string | null;
}

export interface ProjectDetailDto extends ResearchProjectDetailDto {
  has_case_study: boolean;
  case_study_depth: string | null;
  case_study: CaseStudyDto | null;
  diagrams: DiagramDto[];
  screenshots: ScreenshotDto[];
}

export type { CollaboratorDto, EvidenceDto, FundingDto, RelatedSlugDto };

type Locale = "fa" | "en";

function cmsBase(): string | null {
  const raw = (import.meta.env.CMS_API_BASE as string | undefined)?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const base = cmsBase();
  if (!base) return null;
  try {
    const response = await fetch(`${base}${path}`);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function unwrapItems<T>(payload: T[] | { items: T[] } | null): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

async function paginateAll<T>(pathPrefix: string): Promise<T[]> {
  const pages: T[] = [];
  let page = 1;
  while (page <= 50) {
    const payload = await fetchJson<T[] | { items: T[] }>(
      `${pathPrefix}?page=${page}`,
    );
    const items = unwrapItems(payload);
    if (items.length === 0) break;
    pages.push(...items);
    if (items.length < 10) break;
    page += 1;
  }
  return pages;
}

/** Empty when CMS_API_BASE is unset or unreachable. */
export async function getProjects(locale: Locale): Promise<ProjectListDto[]> {
  return paginateAll(`/api/projects/${locale}`);
}

export async function getProject(
  locale: Locale,
  slug: string,
): Promise<ProjectDetailDto | null> {
  return fetchJson(`/api/projects/${locale}/${slug}`);
}
