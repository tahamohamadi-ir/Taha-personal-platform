export interface AdminUser {
  id: number;
  email: string;
  displayName: string;
  isStaff: boolean;
  mfaEnrolled: boolean;
  otpVerified: boolean;
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
  | "research-topic"
  | "research-statement"
  | "project"
  | "publication";

export type ContentStatus = "draft" | "review" | "published" | "archived";

export type ContentLocale = "fa" | "en";

export interface ContentListItem {
  id: number;
  locale: ContentLocale;
  slug: string;
  title: string;
  status: ContentStatus;
  publishedAt: string | null;
  updatedAt: string;
}

export interface ContentList {
  items: ContentListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export type ContentFieldValue = string | number | null;

export type ContentFields = Record<string, ContentFieldValue>;

export interface ContentDetail {
  id: number;
  locale: string;
  slug: string;
  title: string;
  status: string;
  publishedAt: string | null;
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
  type: "text" | "textarea" | "number" | "date";
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
  fields: Record<string, string | number>;
}

export interface ContentUpdatePayload {
  title?: string;
  slug?: string;
  status?: ContentStatus;
  fields?: Record<string, string | number>;
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
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

export type MediaType = "image" | "pdf";

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
