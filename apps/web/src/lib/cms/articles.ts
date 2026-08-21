/** CMS public article DTOs consumed by Astro at build time (optional CMS_API_BASE). */

import { cmsFetchJson, CmsOriginError, throwIfCmsError } from "./client";
import type { CmsFetchResult } from "./client";
import type { StoryDocumentDto } from "./story";

export type { StoryDocumentDto };

export interface TopicTagDto {
  name: string;
  slug: string;
  locale: string;
}

export interface SeriesDto {
  locale: string;
  slug: string;
  title: string;
  description: string;
  ordering: number;
  published_at: string | null;
}

export interface ArticleListDto {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  license: string;
  reading_time_minutes: number;
  published_at: string | null;
  updated_at: string | null;
  topic_tags: TopicTagDto[];
  series: SeriesDto[];
}

export interface ArticleDetailDto extends ArticleListDto {
  body: string;
  accessibility_notes: string;
  story?: StoryDocumentDto | null;
}

export interface ArticleSlugRedirectDto {
  locale: string;
  old_slug: string;
  new_slug: string;
}

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
    // CMS_API_BASE unset → honest empty (local/offline), not snapshot invent.
    if (items === null) return [];
    if (items.length === 0) break;
    pages.push(...items);
    if (items.length < 10) break;
    page += 1;
  }
  return pages;
}

/** Published articles for a locale. Empty when CMS_API_BASE is unset or the API returns an empty list. Outage fails the build. */
export async function getPublishedArticles(locale: Locale): Promise<ArticleListDto[]> {
  return paginateAll(`/api/articles/${locale}`, `articles/${locale}`);
}

export async function getPublishedArticle(
  locale: Locale,
  slug: string,
): Promise<ArticleDetailDto | null> {
  return fetchDetail(
    `/api/articles/${locale}/${slug}`,
    `article ${locale}/${slug}`,
  );
}

export async function getPublishedSeries(locale: Locale): Promise<SeriesDto[]> {
  const result = await cmsFetchJson<SeriesDto[]>(`/api/series/${locale}`);
  const items = requireListPayload(result, `series/${locale}`);
  return items ?? [];
}

export async function getTopicTags(locale: Locale): Promise<TopicTagDto[]> {
  const result = await cmsFetchJson<TopicTagDto[]>(`/api/tags/${locale}`);
  const items = requireListPayload(result, `tags/${locale}`);
  return items ?? [];
}

export async function getArticleRedirects(
  locale: Locale,
): Promise<ArticleSlugRedirectDto[]> {
  const result = await cmsFetchJson<ArticleSlugRedirectDto[]>(
    `/api/article-redirects/${locale}`,
  );
  const items = requireListPayload(result, `article-redirects/${locale}`);
  return items ?? [];
}

export function articlesForTag(
  articles: ArticleListDto[],
  tagSlug: string,
): ArticleListDto[] {
  return articles.filter((a) => a.topic_tags.some((t) => t.slug === tagSlug));
}

export function articlesForSeries(
  articles: ArticleListDto[],
  seriesSlug: string,
): ArticleListDto[] {
  return articles.filter((a) => a.series.some((s) => s.slug === seriesSlug));
}

export function seriesNeighbors(
  articles: ArticleListDto[],
  seriesSlug: string,
  currentSlug: string,
): { prev: ArticleListDto | null; next: ArticleListDto | null } {
  const ordered = articlesForSeries(articles, seriesSlug).sort((a, b) => {
    const ta = a.published_at ?? "";
    const tb = b.published_at ?? "";
    return ta.localeCompare(tb);
  });
  const idx = ordered.findIndex((a) => a.slug === currentSlug);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? ordered[idx - 1] : null,
    next: idx < ordered.length - 1 ? ordered[idx + 1] : null,
  };
}
