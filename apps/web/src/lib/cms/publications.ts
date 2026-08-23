/** CMS public P8 catalog DTOs (publications / books / talks / downloads). */

import { cmsFetchJson, CmsOriginError, throwIfCmsError } from "./client";
import type { CmsFetchResult } from "./client";

export interface PublicationListDto {
  locale: string;
  slug: string;
  title: string;
  authors: string;
  venue: string;
  date: string | null;
  doi: string;
  license: string;
  publication_type: string;
  academic_stage: string;
  access_state: string;
  published_at: string | null;
  updated_at: string | null;
}

export interface PublicationDetailDto extends PublicationListDto {
  url: string;
  pdf_url: string;
  abstract: string;
  isbn: string;
  preprint_url: string;
  code_url: string;
  dataset_url: string;
  accessibility_notes: string;
  citation_count: number | null;
  citation_text: string | null;
  pdf?: {
    url: string;
    alt: string;
    mime?: string;
    title?: string;
  } | null;
}

export interface BookListDto {
  locale: string;
  slug: string;
  title: string;
  authors: string;
  isbn: string;
  publisher: string;
  publication_date: string | null;
  license: string;
  access_state: string;
  published_at: string | null;
  updated_at: string | null;
}

export interface BookDetailDto extends BookListDto {
  description: string;
  url: string;
  accessibility_notes: string;
  cover?: {
    url: string;
    alt: string;
    mime?: string;
    title?: string;
  } | null;
}

export interface TalkListDto {
  locale: string;
  slug: string;
  title: string;
  speakers: string;
  event_name: string;
  event_date: string | null;
  location: string;
  license: string;
  access_state: string;
  published_at: string | null;
  updated_at: string | null;
}

export interface TalkDetailDto extends TalkListDto {
  abstract: string;
  video_url: string;
  slides_url: string;
  accessibility_notes: string;
  slides?: {
    url: string;
    alt: string;
    mime?: string;
    title?: string;
  } | null;
}

export interface DownloadListDto {
  locale: string;
  slug: string;
  title: string;
  description: string;
  download_type: string;
  language: string;
  license: string;
  access_state: string;
  published_at: string | null;
  updated_at: string | null;
}

export interface DownloadDetailDto extends DownloadListDto {
  accessibility_notes: string;
  file?: {
    url: string;
    alt: string;
    mime?: string;
    title?: string;
  } | null;
  mime: string | null;
  size_bytes: number | null;
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
    if (items === null) return [];
    if (items.length === 0) break;
    pages.push(...items);
    if (items.length < 10) break;
    page += 1;
  }
  return pages;
}

/** Canonical publications API (also available under /api/research/publications/). */
export async function getPublications(
  locale: Locale,
): Promise<PublicationListDto[]> {
  return paginateAll(`/api/publications/${locale}`, `publications/${locale}`);
}

export async function getPublication(
  locale: Locale,
  slug: string,
): Promise<PublicationDetailDto | null> {
  return fetchDetail(
    `/api/publications/${locale}/${slug}`,
    `publication ${locale}/${slug}`,
  );
}

export async function getBooks(locale: Locale): Promise<BookListDto[]> {
  return paginateAll(`/api/books/${locale}`, `books/${locale}`);
}

export async function getBook(
  locale: Locale,
  slug: string,
): Promise<BookDetailDto | null> {
  return fetchDetail(`/api/books/${locale}/${slug}`, `book ${locale}/${slug}`);
}

export async function getTalks(locale: Locale): Promise<TalkListDto[]> {
  return paginateAll(`/api/talks/${locale}`, `talks/${locale}`);
}

export async function getTalk(
  locale: Locale,
  slug: string,
): Promise<TalkDetailDto | null> {
  return fetchDetail(`/api/talks/${locale}/${slug}`, `talk ${locale}/${slug}`);
}

export async function getDownloads(
  locale: Locale,
): Promise<DownloadListDto[]> {
  return paginateAll(`/api/downloads/${locale}`, `downloads/${locale}`);
}

export async function getDownload(
  locale: Locale,
  slug: string,
): Promise<DownloadDetailDto | null> {
  return fetchDetail(
    `/api/downloads/${locale}/${slug}`,
    `download ${locale}/${slug}`,
  );
}
