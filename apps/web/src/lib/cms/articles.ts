/** CMS public article DTOs consumed by Astro at build time (optional CMS_API_BASE). */

import { cmsFetchJson } from "./client";

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
}

export interface ArticleSlugRedirectDto {
  locale: string;
  old_slug: string;
  new_slug: string;
}

type Locale = "fa" | "en";

async function fetchJson<T>(path: string): Promise<T | null> {
  return cmsFetchJson<T>(path);
}

function unwrapItems<T>(payload: T[] | { items: T[] } | null): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

/** Published articles for a locale. Empty when CMS_API_BASE is unset or unreachable. */
export async function getPublishedArticles(locale: Locale): Promise<ArticleListDto[]> {
  const pages: ArticleListDto[] = [];
  let page = 1;
  while (page <= 50) {
    const payload = await fetchJson<ArticleListDto[] | { items: ArticleListDto[] }>(
      `/api/articles/${locale}?page=${page}`,
    );
    const items = unwrapItems(payload);
    if (items.length === 0) break;
    pages.push(...items);
    if (items.length < 10) break;
    page += 1;
  }
  return pages;
}

export async function getPublishedArticle(
  locale: Locale,
  slug: string,
): Promise<ArticleDetailDto | null> {
  return fetchJson<ArticleDetailDto>(`/api/articles/${locale}/${slug}`);
}

export async function getPublishedSeries(locale: Locale): Promise<SeriesDto[]> {
  return (await fetchJson<SeriesDto[]>(`/api/series/${locale}`)) ?? [];
}

export async function getTopicTags(locale: Locale): Promise<TopicTagDto[]> {
  return (await fetchJson<TopicTagDto[]>(`/api/tags/${locale}`)) ?? [];
}

export async function getArticleRedirects(
  locale: Locale,
): Promise<ArticleSlugRedirectDto[]> {
  return (
    (await fetchJson<ArticleSlugRedirectDto[]>(`/api/article-redirects/${locale}`)) ??
    []
  );
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
