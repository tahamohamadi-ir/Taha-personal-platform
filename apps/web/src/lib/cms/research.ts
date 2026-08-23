/** CMS public research DTOs consumed by Astro at build time (optional CMS_API_BASE). */

import { cmsFetchJson, CmsOriginError, throwIfCmsError } from "./client";
import type { CmsFetchResult } from "./client";
import type { StoryDocumentDto } from "./story";

export type { StoryDocumentDto };

export interface RelatedSlugDto {
  slug: string;
  title: string;
}

export interface EvidenceDto {
  label: string;
  value: string;
  source: string;
  last_verified: string | null;
}

export interface CollaboratorDto {
  name: string;
  role: string;
}

export interface FundingDto {
  funder: string;
  grant_id: string;
}

export interface ResearchTopicListDto {
  locale: string;
  slug: string;
  title: string;
  summary: string;
  published_at: string | null;
  updated_at: string | null;
}

export interface ResearchTopicDetailDto extends ResearchTopicListDto {
  story?: StoryDocumentDto | null;
  motivation: string;
  problems: string;
  research_questions: string;
  methods: string;
  future_directions: string;
  projects: RelatedSlugDto[];
  publications: RelatedSlugDto[];
}

export interface ResearchStatementDto {
  locale: string;
  slug: string;
  title: string;
  body: string;
  story?: StoryDocumentDto | null;
  published_at: string | null;
  updated_at: string | null;
}

export interface ProjectListDto {
  locale: string;
  slug: string;
  title: string;
  project_type: string;
  objective: string;
  license: string;
  code_availability: string;
  data_availability: string;
  demo_availability: string;
  published_at: string | null;
  updated_at: string | null;
  has_case_study: boolean;
  case_study_depth: string | null;
}

export interface ProjectDetailDto extends ProjectListDto {
  methods_summary: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  code_url: string;
  data_url: string;
  demo_url: string;
  story?: StoryDocumentDto | null;
  topics: RelatedSlugDto[];
  publications: RelatedSlugDto[];
  evidence: EvidenceDto[];
  collaborators: CollaboratorDto[];
  funding: FundingDto[];
  case_study: {
    depth: string;
    problem: string;
    constraints: string;
    technical_decisions: string;
    trade_offs: string;
    outcomes_summary: string;
    lessons_learned: string;
    testing_summary: string;
  } | null;
  diagrams: Array<{
    title: string;
    version: string;
    diagram_date: string;
    alt_text: string;
    long_description: string;
  }>;
  screenshots: Array<{
    caption: string;
    alt_text: string;
    external_url: string;
  }>;
}

export type {
  PublicationDetailDto,
  PublicationListDto,
} from "./publications";
import {
  getPublication,
  getPublications,
} from "./publications";

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
export async function getResearchTopics(
  locale: Locale,
): Promise<ResearchTopicListDto[]> {
  return paginateAll(`/api/research/topics/${locale}`, `research/topics/${locale}`);
}

export async function getResearchTopic(
  locale: Locale,
  slug: string,
): Promise<ResearchTopicDetailDto | null> {
  return fetchDetail(
    `/api/research/topics/${locale}/${slug}`,
    `research topic ${locale}/${slug}`,
  );
}

export async function getResearchStatements(
  locale: Locale,
): Promise<ResearchStatementDto[]> {
  const result = await cmsFetchJson<ResearchStatementDto[]>(
    `/api/research/statements/${locale}`,
  );
  const items = requireListPayload(result, `research/statements/${locale}`);
  return items ?? [];
}

export async function getResearchStatement(
  locale: Locale,
): Promise<ResearchStatementDto | null> {
  const statements = await getResearchStatements(locale);
  return statements[0] ?? null;
}

export async function getResearchProjects(
  locale: Locale,
): Promise<ProjectListDto[]> {
  return paginateAll(
    `/api/research/projects/${locale}`,
    `research/projects/${locale}`,
  );
}

export async function getResearchProject(
  locale: Locale,
  slug: string,
): Promise<ProjectDetailDto | null> {
  return fetchDetail(
    `/api/research/projects/${locale}/${slug}`,
    `research project ${locale}/${slug}`,
  );
}

export async function getResearchPublications(
  locale: Locale,
): Promise<import("./publications").PublicationListDto[]> {
  return getPublications(locale);
}

export async function getResearchPublication(
  locale: Locale,
  slug: string,
): Promise<import("./publications").PublicationDetailDto | null> {
  return getPublication(locale, slug);
}
