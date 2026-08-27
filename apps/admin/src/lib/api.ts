export interface AdminUser {
  id: number;
  email: string;
  displayName: string;
  isStaff: boolean;
  mfaEnrolled: boolean;
  otpVerified: boolean;
  featureFlags?: Record<string, boolean>;
}

export interface DashboardSummary {
  contentCounts: {
    landing: number;
    profile: number;
    article: number;
    researchTopic: number;
    researchStatement: number;
    project: number;
    publication: number;
  };
  drafts: number;
  published: number;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  fields?: Record<string, string[]>;
  currentUpdatedAt?: string;
}

export type ContentEntity =
  | "landing"
  | "profile"
  | "article"
  | "series"
  | "research-topic"
  | "research-statement"
  | "project"
  | "publication"
  | "book"
  | "talk"
  | "download"
  | "course"
  | "creative-work";

export type ContentStatus =
  | "draft"
  | "review"
  | "scheduled"
  | "published"
  | "archived";

export type ContentLocale = "fa" | "en";

export interface ContentListItem {
  id: number;
  locale: ContentLocale;
  slug: string;
  title: string;
  status: ContentStatus;
  publishedAt: string | null;
  scheduledFor?: string | null;
  updatedAt: string;
}

export interface ContentList {
  items: ContentListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export type ContentFieldValue = string | number | boolean | null;

export type ContentFields = Record<string, ContentFieldValue>;

export interface ContentDetail {
  id: number;
  locale: string;
  slug: string;
  title: string;
  status: string;
  publishedAt: string | null;
  scheduledFor?: string | null;
  createdAt: string;
  updatedAt: string;
  fields: ContentFields;
}

export interface ContentListParams {
  locale?: ContentLocale;
  status?: ContentStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface ContentFieldSpec {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "boolean" | "media";
}

export interface ContentEntitySchema {
  entity: string;
  fields: ContentFieldSpec[];
}

export interface ContentSchema {
  entities: Record<string, ContentEntitySchema>;
}

export interface ContentPayload {
  locale: ContentLocale;
  slug: string;
  title: string;
  status?: ContentStatus;
  fields: Record<string, string | number | boolean | null>;
}

export interface ContentUpdatePayload {
  title?: string;
  slug?: string;
  status?: ContentStatus;
  fields?: Record<string, string | number | boolean | null>;
}

export interface PreviewLink {
  url: string;
  path: string;
  expiresAt: string;
  ttlSeconds: number;
}

export interface TransitionPayload {
  to: ContentStatus;
  reason?: string;
  scheduledFor?: string;
}

export interface TranslationLocaleStatus {
  status: "complete" | "incomplete" | "missing";
  missingFields: string[];
}

export interface TranslationQueueItem {
  entity: string;
  slug: string;
  fa: TranslationLocaleStatus;
  en: TranslationLocaleStatus;
  status: "complete" | "incomplete" | "missing" | "partial";
}

export interface TranslationQueue {
  items: TranslationQueueItem[];
  truncated: boolean;
}

export interface ContentHealth {
  published: number;
  drafts: number;
  review: number;
  scheduled?: number;
  archived: number;
  incompleteTranslations: number;
  missingAltMedia: number;
  orphanMedia: number;
}

export interface ContentRevision {
  id: number;
  entityKey: string;
  objectId: number;
  note: string;
  createdAt: string;
  createdById: number | null;
  snapshot?: Record<string, unknown> | null;
}

export interface ContentRevisionList {
  items: ContentRevision[];
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "code" in value &&
    "message" in value
  );
}

export function isConflict(error: unknown): boolean {
  return isApiError(error) && error.code === "CONFLICT";
}

export function isDuplicate(error: unknown): boolean {
  return isApiError(error) && error.code === "DUPLICATE";
}

interface CsrfResponse {
  csrfToken: string;
}

interface LogoutResponse {
  ok: boolean;
}

const API_BASE: string =
  import.meta.env.VITE_ADMIN_API_BASE ?? "/api/v1/admin";

let csrfToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text === "") {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function toApiError(response: Response, data: unknown): ApiError {
  const partial = (data ?? {}) as Partial<ApiError>;
  return {
    status: response.status,
    code: partial.code ?? "UNKNOWN_ERROR",
    message: partial.message ?? `درخواست ناموفق (کد ${response.status})`,
    fields: partial.fields,
    currentUpdatedAt: partial.currentUpdatedAt,
  };
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (csrfToken !== null) {
    headers.set("X-CSRFToken", csrfToken);
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  const data = await parseJson(response);
  if (response.status === 401) {
    onUnauthorized?.();
  }
  if (!response.ok) {
    throw toApiError(response, data);
  }
  return data as T;
}

export async function getCsrf(): Promise<string> {
  const response = await request<CsrfResponse>("/auth/csrf");
  setCsrfToken(response.csrfToken);
  return response.csrfToken;
}

export async function login(
  email: string,
  password: string,
  otpToken?: string
): Promise<AdminUser> {
  return request<AdminUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      ...(otpToken !== undefined && otpToken !== ""
        ? { otpToken }
        : {}),
    }),
  });
}

export async function logout(): Promise<void> {
  await request<LogoutResponse>("/auth/logout", { method: "POST" });
}

export async function fetchMe(): Promise<AdminUser> {
  return request<AdminUser>("/auth/me");
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>("/dashboard/summary");
}

export async function fetchContentList(
  entity: ContentEntity,
  params: ContentListParams = {}
): Promise<ContentList> {
  const search = new URLSearchParams();
  if (params.locale !== undefined) {
    search.set("locale", params.locale);
  }
  if (params.status !== undefined) {
    search.set("status", params.status);
  }
  if (params.q !== undefined && params.q !== "") {
    search.set("q", params.q);
  }
  if (params.page !== undefined) {
    search.set("page", String(params.page));
  }
  if (params.pageSize !== undefined) {
    search.set("pageSize", String(params.pageSize));
  }
  const query = search.toString();
  return request<ContentList>(`/content/${entity}${query === "" ? "" : `?${query}`}`);
}

export async function fetchContentDetail(
  entity: ContentEntity,
  id: number
): Promise<ContentDetail> {
  return request<ContentDetail>(`/content/${entity}/${id}`);
}

export async function fetchContentSchema(): Promise<ContentSchema> {
  return request<ContentSchema>("/content/schema");
}

export async function createContent(
  entity: ContentEntity,
  payload: ContentPayload
): Promise<ContentDetail> {
  return request<ContentDetail>(`/content/${entity}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateContent(
  entity: ContentEntity,
  id: number,
  payload: ContentUpdatePayload,
  ifMatch: string
): Promise<ContentDetail> {
  return request<ContentDetail>(`/content/${entity}/${id}`, {
    method: "PUT",
    headers: { "If-Match": ifMatch },
    body: JSON.stringify(payload),
  });
}

export async function transitionContent(
  entity: ContentEntity,
  id: number,
  payload: TransitionPayload
): Promise<ContentDetail> {
  return request<ContentDetail>(`/content/${entity}/${id}/transition`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface BulkArchiveResult {
  archived: number;
  skipped: number;
  ids: number[];
}

export async function bulkArchiveContent(
  entity: ContentEntity,
  ids: number[],
  reason?: string
): Promise<BulkArchiveResult> {
  return request<BulkArchiveResult>(`/content/${entity}/bulk-archive`, {
    method: "POST",
    body: JSON.stringify({
      ids,
      ...(reason !== undefined && reason !== "" ? { reason } : {}),
    }),
  });
}

export async function fetchContentRevisions(
  entity: ContentEntity,
  id: number
): Promise<ContentRevisionList> {
  return request<ContentRevisionList>(`/content/${entity}/${id}/revisions`);
}

export async function createContentRevision(
  entity: ContentEntity,
  id: number,
  note?: string
): Promise<ContentRevision> {
  return request<ContentRevision>(`/content/${entity}/${id}/revisions`, {
    method: "POST",
    body: JSON.stringify({ note: note ?? "" }),
  });
}

export async function restoreContentRevision(
  entity: ContentEntity,
  id: number,
  revisionId: number
): Promise<ContentDetail> {
  return request<ContentDetail>(
    `/content/${entity}/${id}/revisions/${revisionId}/restore`,
    { method: "POST", body: "{}" }
  );
}

export async function createPreviewLink(
  entity: ContentEntity,
  id: number
): Promise<PreviewLink> {
  return request<PreviewLink>(`/content/${entity}/${id}/preview-link`, {
    method: "POST",
    body: "{}",
  });
}

export async function fetchTranslationQueue(): Promise<TranslationQueue> {
  return request<TranslationQueue>("/overview/translation-queue");
}

export async function fetchContentHealth(): Promise<ContentHealth> {
  return request<ContentHealth>("/overview/content-health");
}

export interface MediaItem {
  id: number;
  title: string;
  mime: string;
  size: number;
  isActive: boolean;
  altText: string;
  altTextFa: string;
  altTextEn: string;
  url: string | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaList {
  items: MediaItem[];
  page: number;
  pageSize: number;
  total: number;
}

export type MediaType = "image" | "pdf" | "video" | "audio";

export interface MediaListParams {
  q?: string;
  type?: MediaType;
  active?: "true" | "false";
  page?: number;
  pageSize?: number;
}

export interface MediaPayload {
  title?: string;
  altText?: string;
  altTextFa?: string;
  altTextEn?: string;
  isActive?: boolean;
}

function buildMediaSearch(params: MediaListParams): string {
  const search = new URLSearchParams();
  if (params.q !== undefined && params.q !== "") {
    search.set("q", params.q);
  }
  if (params.type !== undefined) {
    search.set("type", params.type);
  }
  if (params.active !== undefined) {
    search.set("active", params.active);
  }
  if (params.page !== undefined) {
    search.set("page", String(params.page));
  }
  if (params.pageSize !== undefined) {
    search.set("pageSize", String(params.pageSize));
  }
  const query = search.toString();
  return query === "" ? "" : `?${query}`;
}

export async function fetchMediaList(
  params: MediaListParams = {}
): Promise<MediaList> {
  return request<MediaList>(`/media${buildMediaSearch(params)}`);
}

export async function fetchMediaOrphans(
  params: MediaListParams = {}
): Promise<MediaList> {
  return request<MediaList>(`/media/orphans${buildMediaSearch(params)}`);
}

export async function fetchMediaDetail(id: number): Promise<MediaItem> {
  return request<MediaItem>(`/media/${id}`);
}

export async function updateMedia(
  id: number,
  payload: MediaPayload,
  ifMatch: string
): Promise<MediaItem> {
  return request<MediaItem>(`/media/${id}`, {
    method: "PUT",
    headers: { "If-Match": ifMatch },
    body: JSON.stringify(payload),
  });
}

function parseXhrError(xhr: XMLHttpRequest): ApiError {
  let data: unknown = null;
  if (xhr.responseText !== "") {
    try {
      data = JSON.parse(xhr.responseText) as unknown;
    } catch {
      data = null;
    }
  }
  return toApiError({ status: xhr.status } as Response, data);
}

export function uploadMedia(
  file: File,
  title: string,
  altTextFa: string,
  altTextEn: string,
  onProgress?: (percent: number) => void
): Promise<MediaItem> {
  return new Promise<MediaItem>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/media`);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Accept", "application/json");
    if (csrfToken !== null) {
      xhr.setRequestHeader("X-CSRFToken", csrfToken);
    }
    xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
      if (event.lengthComputable && onProgress !== undefined) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as MediaItem);
          return;
        } catch {
          reject(parseXhrError(xhr));
          return;
        }
      }
      if (xhr.status === 401) {
        onUnauthorized?.();
      }
      reject(parseXhrError(xhr));
    });
    xhr.addEventListener("error", () => {
      reject(parseXhrError(xhr));
    });
    xhr.addEventListener("abort", () => {
      reject({
        status: 0,
        code: "ABORTED",
        message: "بارگذاری لغو شد.",
      } as ApiError);
    });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("altTextFa", altTextFa);
    formData.append("altTextEn", altTextEn);
    xhr.send(formData);
    return undefined as unknown;
  });
}

export function replaceMedia(
  id: number,
  file: File,
  onProgress?: (percent: number) => void
): Promise<MediaItem> {
  return new Promise<MediaItem>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/media/${id}/replace`);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Accept", "application/json");
    if (csrfToken !== null) {
      xhr.setRequestHeader("X-CSRFToken", csrfToken);
    }
    xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
      if (event.lengthComputable && onProgress !== undefined) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as MediaItem);
          return;
        } catch {
          reject(parseXhrError(xhr));
          return;
        }
      }
      if (xhr.status === 401) {
        onUnauthorized?.();
      }
      reject(parseXhrError(xhr));
    });
    xhr.addEventListener("error", () => reject(parseXhrError(xhr)));
    xhr.addEventListener("abort", () => {
      reject({
        status: 0,
        code: "ABORTED",
        message: "جایگزینی لغو شد.",
      } as ApiError);
    });
    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
    return undefined as unknown;
  });
}

// ---------- Composition (ADM-3) ----------

export type CompositionLayout = "1col" | "2col" | "3col";

export type CompositionKind = "landing" | "story";

export interface CompositionPageItem {
  id: number;
  key: string;
  kind: CompositionKind;
  locale: ContentLocale;
  title: string;
  status: ContentStatus;
  publishedAt: string | null;
  updatedAt: string;
}

export interface CompositionPageList {
  items: CompositionPageItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface CompositionBlockDoc {
  blockType: string;
  settings: Record<string, unknown>;
  enabled: boolean;
}

export interface CompositionSectionDoc {
  layout: CompositionLayout;
  ratio: string;
  enabled: boolean;
  blocks: CompositionBlockDoc[];
}

export interface CompositionDetail {
  id: number;
  key: string;
  kind: CompositionKind;
  locale: ContentLocale;
  title: string;
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sections: Array<
    CompositionSectionDoc & {
      id: number;
      position: number;
      blocks: Array<
        CompositionBlockDoc & {
          id: number;
          position: number;
        }
      >;
    }
  >;
}

export interface CompositionFieldSpec {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "media" | "mediaList" | "itemList";
  options?: string[];
  minItems?: number;
  maxItems?: number;
  itemFields?: Array<{
    key: string;
    label: string;
    type: "text" | "textarea";
    required?: boolean;
  }>;
}

export interface CompositionBlockType {
  type: string;
  labelFa: string;
  required?: string[];
  fields: CompositionFieldSpec[];
}

export interface CompositionLayoutSpec {
  value: CompositionLayout;
  label: string;
  ratios: string[];
}

export interface CompositionSchema {
  kind?: CompositionKind;
  blockTypes: CompositionBlockType[];
  sectionLayouts: CompositionLayoutSpec[];
}

export interface CompositionCreatePayload {
  key: string;
  locale: ContentLocale;
  title: string;
  status?: ContentStatus;
  kind?: CompositionKind;
}

export interface CompositionUpdatePayload {
  title?: string;
  status?: ContentStatus;
  sections: CompositionSectionDoc[];
}

export async function fetchCompositionPages(params: {
  q?: string;
  locale?: ContentLocale | "";
  status?: ContentStatus | "";
  page?: number;
  pageSize?: number;
}): Promise<CompositionPageList> {
  const query = new URLSearchParams();
  if (params.q !== undefined && params.q !== "") query.set("q", params.q);
  if (params.locale) query.set("locale", params.locale);
  if (params.status) query.set("status", params.status);
  if (params.page !== undefined && params.page > 1) query.set("page", String(params.page));
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  return request<CompositionPageList>(`/composition${qs ? `?${qs}` : ""}`);
}

export async function fetchCompositionSchema(
  kind: CompositionKind = "landing"
): Promise<CompositionSchema> {
  return request<CompositionSchema>(`/composition/schema?kind=${kind}`);
}

export async function fetchCompositionDetail(id: number): Promise<CompositionDetail> {
  return request<CompositionDetail>(`/composition/${id}`);
}

export async function createComposition(
  payload: CompositionCreatePayload
): Promise<CompositionDetail> {
  return request<CompositionDetail>("/composition", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateComposition(
  id: number,
  payload: CompositionUpdatePayload,
  ifMatch: string
): Promise<CompositionDetail> {
  return request<CompositionDetail>(`/composition/${id}`, {
    method: "PUT",
    headers: { "If-Match": ifMatch },
    body: JSON.stringify(payload),
  });
}

// ---------- Site settings / Tags / Featured (ADM-5) ----------

export interface NavLink {
  label: string;
  href: string;
  locale: ContentLocale;
}

export interface CurrentDocument {
  id: number;
  title: string;
  mime: string;
  size: number;
  isActive: boolean;
  url: string;
  updatedAt: string;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  footerText: string;
  primaryColor: string;
  navLinks: NavLink[];
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactPhoneIntl: string;
  contactLocation: string;
  contactLinkedin: string;
  contactOrcid: string;
  contactEmployer: string;
  contactEmployerUrl: string;
  contactFormEnabled: boolean;
  currentCvMediaId: number | null;
  currentResumeMediaId: number | null;
  currentCv: CurrentDocument | null;
  currentResume: CurrentDocument | null;
  updatedAt: string;
}

export interface SiteSettingsUpdatePayload {
  brandName?: string;
  tagline?: string;
  footerText?: string;
  primaryColor?: string;
  navLinks?: NavLink[];
  seoDefaultTitle?: string;
  seoDefaultDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactPhoneIntl?: string;
  contactLocation?: string;
  contactLinkedin?: string;
  contactOrcid?: string;
  contactEmployer?: string;
  contactEmployerUrl?: string;
  contactFormEnabled?: boolean;
  currentCvMediaId?: number | null;
  currentResumeMediaId?: number | null;
}

export interface TagItem {
  id: number;
  name: string;
  slug: string;
  locale: ContentLocale;
  articleCount: number;
}

export interface TagList {
  items: TagItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface TagListParams {
  q?: string;
  locale?: ContentLocale | "";
  page?: number;
  pageSize?: number;
}

export interface TagPayload {
  name: string;
  slug?: string;
  locale: ContentLocale;
}

export interface TagUpdatePayload {
  name?: string;
  slug?: string;
  locale?: ContentLocale;
}

export interface FeaturedItem {
  id: number;
  title: string;
  targetEntity: string;
  targetSlug: string;
  locale: ContentLocale;
  startAt: string;
  endAt: string | null;
  isActive: boolean;
  updatedAt: string;
}

export interface FeaturedList {
  items: FeaturedItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface FeaturedListParams {
  active?: "true" | "false";
  current?: "true";
  page?: number;
  pageSize?: number;
}

export interface FeaturedPayload {
  title: string;
  targetEntity: string;
  targetSlug: string;
  locale: ContentLocale;
  startAt: string;
  endAt?: string | null;
  isActive?: boolean;
}

export type FeaturedUpdatePayload = Partial<FeaturedPayload>;

function buildTagsSearch(params: TagListParams): string {
  const search = new URLSearchParams();
  if (params.q !== undefined && params.q !== "") {
    search.set("q", params.q);
  }
  if (params.locale !== undefined && params.locale !== "") {
    search.set("locale", params.locale);
  }
  if (params.page !== undefined) {
    search.set("page", String(params.page));
  }
  if (params.pageSize !== undefined) {
    search.set("pageSize", String(params.pageSize));
  }
  const query = search.toString();
  return query === "" ? "" : `?${query}`;
}

function buildFeaturedSearch(params: FeaturedListParams): string {
  const search = new URLSearchParams();
  if (params.active !== undefined) {
    search.set("active", params.active);
  }
  if (params.current !== undefined) {
    search.set("current", params.current);
  }
  if (params.page !== undefined) {
    search.set("page", String(params.page));
  }
  if (params.pageSize !== undefined) {
    search.set("pageSize", String(params.pageSize));
  }
  const query = search.toString();
  return query === "" ? "" : `?${query}`;
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  return request<SiteSettings>("/site");
}

export async function updateSiteSettings(
  payload: SiteSettingsUpdatePayload,
  ifMatch: string
): Promise<SiteSettings> {
  return request<SiteSettings>("/site", {
    method: "PUT",
    headers: { "If-Match": ifMatch },
    body: JSON.stringify(payload),
  });
}

export async function fetchTags(params: TagListParams = {}): Promise<TagList> {
  return request<TagList>(`/tags${buildTagsSearch(params)}`);
}

export async function createTag(payload: TagPayload): Promise<TagItem> {
  return request<TagItem>("/tags", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTag(
  id: number,
  payload: TagUpdatePayload,
  ifMatch: string
): Promise<TagItem> {
  return request<TagItem>(`/tags/${id}`, {
    method: "PUT",
    headers: { "If-Match": ifMatch },
    body: JSON.stringify(payload),
  });
}

export async function deleteTag(id: number): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/tags/${id}`, { method: "DELETE" });
}

export async function fetchFeatured(
  params: FeaturedListParams = {}
): Promise<FeaturedList> {
  return request<FeaturedList>(`/featured${buildFeaturedSearch(params)}`);
}

export async function createFeatured(
  payload: FeaturedPayload
): Promise<FeaturedItem> {
  return request<FeaturedItem>("/featured", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateFeatured(
  id: number,
  payload: FeaturedUpdatePayload,
  ifMatch: string
): Promise<FeaturedItem> {
  return request<FeaturedItem>(`/featured/${id}`, {
    method: "PUT",
    headers: { "If-Match": ifMatch },
    body: JSON.stringify(payload),
  });
}

export async function deleteFeatured(id: number): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/featured/${id}`, { method: "DELETE" });
}

export interface ProfileSkillRow {
  category: string;
  name: string;
  source: string;
}

export interface ProfileExperienceRow {
  organization: string;
  role: string;
  period: string;
  location?: string;
  website?: string;
  bullets: string[];
  slug?: string;
  translationKey?: string;
  detailBody?: string;
  storyId?: number | null;
  story?: unknown;
}

export interface AdminProfileDocument {
  locale: string;
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  shortBio: string;
  longBio: string;
  availability: string;
  skills: ProfileSkillRow[];
  experience: ProfileExperienceRow[];
  education: Record<string, unknown>[];
  publications: Record<string, unknown>[];
  researchProjects: Record<string, unknown>[];
  certificates: Record<string, unknown>[];
  socials: Record<string, unknown>[];
  revision: number;
  status?: string;
  translationStatus?: unknown;
}

async function requestOrigin<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (csrfToken !== null) {
    headers.set("X-CSRFToken", csrfToken);
  }
  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });
  const data = await parseJson(response);
  if (response.status === 401) {
    onUnauthorized?.();
  }
  if (!response.ok) {
    throw toApiError(response, data);
  }
  return data as T;
}

export async function fetchAdminProfile(
  locale: string,
  slug: string
): Promise<AdminProfileDocument> {
  return requestOrigin<AdminProfileDocument>(
    `/api/admin/profiles/${locale}/${slug}`
  );
}

export async function updateAdminProfile(
  locale: string,
  slug: string,
  payload: AdminProfileDocument,
  revision: number
): Promise<AdminProfileDocument> {
  const { revision: _revision, translationStatus: _translationStatus, ...body } =
    payload;
  return requestOrigin<AdminProfileDocument>(
    `/api/admin/profiles/${locale}/${slug}`,
    {
      method: "PUT",
      headers: { "If-Match": String(revision) },
      body: JSON.stringify(body),
    }
  );
}

export interface MfaStatus {
  enrolled: boolean;
  otpVerified: boolean;
  unusedRecoveryCodes: number;
  configUrl: string | null;
  manualSecret: string | null;
}

export async function fetchMfaStatus(): Promise<MfaStatus> {
  return request<MfaStatus>("/auth/mfa/status");
}

export async function confirmMfa(otpToken: string): Promise<{
  ok: boolean;
  codes: string[];
}> {
  return request<{ ok: boolean; codes: string[] }>("/auth/mfa/confirm", {
    method: "POST",
    body: JSON.stringify({ otpToken }),
  });
}

export async function regenerateMfaCodes(
  otpToken: string
): Promise<{ codes: string[] }> {
  return request<{ codes: string[] }>("/auth/mfa/regenerate", {
    method: "POST",
    body: JSON.stringify({ otpToken }),
  });
}

export async function disableMfa(otpToken: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/auth/mfa/disable", {
    method: "POST",
    body: JSON.stringify({ otpToken }),
  });
}

export interface ProjectDiagramRow {
  id: number;
  title: string;
  version: string;
  diagramDate: string;
  altText: string;
  longDescription: string;
  visibility: string;
  diagramImageId: number | null;
}

export interface ProjectScreenshotRow {
  id: number;
  caption: string;
  altText: string;
  externalUrl: string;
  visibility: string;
  screenshotImageId: number | null;
}

export interface ProjectCaseMedia {
  projectId: number;
  diagrams: ProjectDiagramRow[];
  screenshots: ProjectScreenshotRow[];
}

export async function fetchProjectCaseMedia(
  projectId: number
): Promise<ProjectCaseMedia> {
  return request<ProjectCaseMedia>(`/content/project/${projectId}/case-media`);
}

export async function setProjectDiagramImage(
  projectId: number,
  diagramId: number,
  diagramImageId: number | null
): Promise<ProjectDiagramRow> {
  return request<ProjectDiagramRow>(
    `/content/project/${projectId}/diagrams/${diagramId}`,
    {
      method: "PUT",
      body: JSON.stringify({ diagramImageId }),
    }
  );
}

export async function setProjectScreenshotImage(
  projectId: number,
  screenshotId: number,
  screenshotImageId: number | null
): Promise<ProjectScreenshotRow> {
  return request<ProjectScreenshotRow>(
    `/content/project/${projectId}/screenshots/${screenshotId}`,
    {
      method: "PUT",
      body: JSON.stringify({ screenshotImageId }),
    }
  );
}
