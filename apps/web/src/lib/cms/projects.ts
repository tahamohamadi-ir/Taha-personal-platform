/** CMS public project/case-study DTOs consumed by Astro at build time (optional CMS_API_BASE). */

import { cmsFetchJson, CmsOriginError, throwIfCmsError } from "./client";
import type { CmsFetchResult } from "./client";
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

function unwrapItems<T>(payload: T[] | { items: T[] }): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function requireListPayload<T>(
  result: CmsFetchResult<T[] | { items: T[] }>,
  context: string,
): T[] | null {
  throwIfCmsError(result, context);
  if (result.kind === "unset") return null;
  if (result.kind === "http") {
    throw new CmsOriginError(
      `${context}: unexpected HTTP ${result.status}`,
      result.status,
    );
  }
  return unwrapItems(result.data);
}

async function fetchDetail<T>(path: string, context: string): Promise<T | null> {
  const result = await cmsFetchJson<T>(path);
  throwIfCmsError(result, context);
  if (result.kind === "unset") return null;
  if (result.kind === "http") {
    if (result.status === 404) return null;
    throw new CmsOriginError(
      `${context}: unexpected HTTP ${result.status}`,
      result.status,
    );
  }
  return result.data;
}

async function paginateAll<T>(pathPrefix: string, context: string): Promise<T[]> {
  const pages: T[] = [];
  let page = 1;
  while (page <= 50) {
    const payload = await cmsFetchJson<T[] | { items: T[] }>(
      `${pathPrefix}?page=${page}`,
    );
    const items = requireListPayload(payload, `${context} page ${page}`);
    if (items === null) return [];
    if (items.length === 0) break;
    pages.push(...items);
    if (items.length < 10) break;
    page += 1;
  }
  return pages;
}

/** Empty when CMS_API_BASE is unset or the API returns an empty list. Outage fails the build. */
export async function getProjects(locale: Locale): Promise<ProjectListDto[]> {
  return paginateAll(`/api/projects/${locale}`, `projects/${locale}`);
}

export async function getProject(
  locale: Locale,
  slug: string,
): Promise<ProjectDetailDto | null> {
  return fetchDetail(`/api/projects/${locale}/${slug}`, `project ${locale}/${slug}`);
}
