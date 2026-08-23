/** CMS public CreativeWork DTOs consumed by Astro at build time (P9, no student PII). */

import { cmsFetchJson, CmsOriginError, throwIfCmsError } from "./client";
import type { CmsFetchResult } from "./client";

export interface GalleryImageDto {
  url: string;
  alt: string;
  caption: string;
  mime?: string;
  title?: string;
  size?: number;
}

export interface CreativeWorkListDto {
  locale: string;
  slug: string;
  title: string;
  description: string;
  work_type: string;
  creator_name: string;
  creator_role: string;
  creation_date: string | null;
  license: string;
  access_state: string;
  published_at: string | null;
  updated_at: string | null;
}

export interface CreativeWorkDetailDto extends CreativeWorkListDto {
  body: string;
  rights_statement: string;
  accessibility_notes: string;
  cover?: {
    url: string;
    alt: string;
    mime?: string;
    title?: string;
  } | null;
  gallery: GalleryImageDto[];
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
    // Web-ahead-of-CMS bridge (LOG-0238): /api/creative-works goes live with
    // content.0015 prod migrate. Until that attended dispatch, 404 = honest
    // empty. FLIP TO THROW after migrate lands (same as publications.ts).
    if (result.status === 404) return null;
    throw new CmsOriginError(`${context}: unexpected HTTP ${result.status}`, result.status);
  }
  return unwrapItems(result.data);
}

async function fetchDetail<T>(path: string, context: string): Promise<T | null> {
  const result = await cmsFetchJson<T>(path);
  throwIfCmsError(result, context);
  if (result.kind === "unset") return null;
  if (result.kind === "http") {
    if (result.status === 404) return null;
    throw new CmsOriginError(`${context}: unexpected HTTP ${result.status}`, result.status);
  }
  return result.data;
}

async function paginateAll<T>(pathPrefix: string, context: string): Promise<T[]> {
  const pages: T[] = [];
  let page = 1;
  while (page <= 50) {
    const payload = await cmsFetchJson<T[] | { items: T[] }>(`${pathPrefix}?page=${page}`);
    const items = requireListPayload(payload, `${context} page ${page}`);
    if (items === null) return [];
    if (items.length === 0) break;
    pages.push(...items);
    if (items.length < 10) break;
    page += 1;
  }
  return pages;
}

export async function getCreativeWorks(locale: Locale): Promise<CreativeWorkListDto[]> {
  return paginateAll(`/api/creative-works/${locale}`, `creative-works/${locale}`);
}

export async function getCreativeWork(
  locale: Locale,
  slug: string,
): Promise<CreativeWorkDetailDto | null> {
  return fetchDetail(`/api/creative-works/${locale}/${slug}`, `creative-work ${locale}/${slug}`);
}

/** IA aliases */
export async function getCreativeList(locale: Locale): Promise<CreativeWorkListDto[]> {
  return paginateAll(`/api/creative/${locale}`, `creative/${locale}`);
}

export async function getCreative(locale: Locale, slug: string): Promise<CreativeWorkDetailDto | null> {
  return fetchDetail(`/api/creative/${locale}/${slug}`, `creative ${locale}/${slug}`);
}
