/** CMS public Course DTOs consumed by Astro at build time (P9, no LMS/payment). */

import { cmsFetchJson, CmsOriginError, throwIfCmsError } from "./client";
import type { CmsFetchResult } from "./client";

export interface CourseListDto {
  locale: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  course_format: string;
  course_language: string;
  availability: string;
  license: string;
  last_updated: string | null;
  published_at: string | null;
  updated_at: string | null;
}

export interface CourseDetailDto extends CourseListDto {
  body: string;
  prerequisites: string;
  outcomes: string;
  accessibility_notes: string;
  cover?: {
    url: string;
    alt: string;
    mime?: string;
    title?: string;
  } | null;
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
    // Web-ahead-of-CMS bridge (LOG-0238): /api/courses goes live with
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

/** Empty when CMS_API_BASE is unset or the API returns an empty list. Outage fails the build. */
export async function getCourses(locale: Locale): Promise<CourseListDto[]> {
  return paginateAll(`/api/courses/${locale}`, `courses/${locale}`);
}

export async function getCourse(locale: Locale, slug: string): Promise<CourseDetailDto | null> {
  return fetchDetail(`/api/courses/${locale}/${slug}`, `course ${locale}/${slug}`);
}

/** Aliases for IA canonical /{locale}/teaching/ */
export async function getTeachingCourses(locale: Locale): Promise<CourseListDto[]> {
  return paginateAll(`/api/teaching/${locale}`, `teaching/${locale}`);
}

export async function getTeachingCourse(locale: Locale, slug: string): Promise<CourseDetailDto | null> {
  return fetchDetail(`/api/teaching/${locale}/${slug}`, `teaching ${locale}/${slug}`);
}
