/** CMS public research DTOs consumed by Astro at build time (optional CMS_API_BASE). */

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

export interface PublicationListDto {
  locale: string;
  slug: string;
  title: string;
  authors: string;
  venue: string;
  date: string | null;
  doi: string;
  license: string;
  published_at: string | null;
  updated_at: string | null;
}

export interface PublicationDetailDto extends PublicationListDto {
  url: string;
  pdf_url: string;
  citation_count: number | null;
}

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
export async function getResearchTopics(
  locale: Locale,
): Promise<ResearchTopicListDto[]> {
  return paginateAll(`/api/research/topics/${locale}`);
}

export async function getResearchTopic(
  locale: Locale,
  slug: string,
): Promise<ResearchTopicDetailDto | null> {
  return fetchJson(`/api/research/topics/${locale}/${slug}`);
}

export async function getResearchStatements(
  locale: Locale,
): Promise<ResearchStatementDto[]> {
  return (await fetchJson(`/api/research/statements/${locale}`)) ?? [];
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
  return paginateAll(`/api/research/projects/${locale}`);
}

export async function getResearchProject(
  locale: Locale,
  slug: string,
): Promise<ProjectDetailDto | null> {
  return fetchJson(`/api/research/projects/${locale}/${slug}`);
}

export async function getResearchPublications(
  locale: Locale,
): Promise<PublicationListDto[]> {
  return paginateAll(`/api/research/publications/${locale}`);
}

export async function getResearchPublication(
  locale: Locale,
  slug: string,
): Promise<PublicationDetailDto | null> {
  return fetchJson(`/api/research/publications/${locale}/${slug}`);
}
