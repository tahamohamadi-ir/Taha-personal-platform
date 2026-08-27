// Typed client for the redesign-area admin endpoints (Track AF).
// Contract source of truth: apps/cms/apps/api/admin_home.py (FROZEN — AF consumes, never redefines).
// All fetches go through the existing app client (`request`) so credentials,
// CSRF, 401 handling and ProblemDetails parsing stay single-source.

import { request, type ApiError, isApiError } from "./api";

export type HomeLocale = "fa" | "en";

/** Canonical module keys (admin_home.py CANONICAL_KEYS = HomeModuleKey.values). */
export const HOME_MODULE_KEYS = [
  "identity",
  "graph",
  "research-fit",
  "journey",
  "projects",
  "publications",
  "previews",
  "cta",
] as const;

export type HomeKey = (typeof HOME_MODULE_KEYS)[number];

/** admin_home.py SelectionMode values. */
export type HomeSelectionMode = "manual" | "rule" | "hybrid";

export interface HomeModuleRow {
  key: HomeKey;
  visible: boolean;
  order: number;
  selection_mode: HomeSelectionMode;
  provenance_note: string;
}

export interface HomeModulesDocument {
  revision: string;
  modules: HomeModuleRow[];
}

const HOME_KEY_SET: ReadonlySet<string> = new Set(HOME_MODULE_KEYS);

export function isHomeKey(value: string): value is HomeKey {
  return HOME_KEY_SET.has(value);
}

export function isHomeLocale(value: string): value is HomeLocale {
  return value === "fa" || value === "en";
}

export function isHomeSelectionMode(value: string): value is HomeSelectionMode {
  return value === "manual" || value === "rule" || value === "hybrid";
}

/** Stable ProblemDetails field tokens (admin_home.py constants). */
export const HOME_FIELD_TOKENS = [
  "UNKNOWN_KEY",
  "DUPLICATE_ORDER",
  "BAD_ENUM",
  "DUPLICATE_KEY",
  "TOO_LONG",
] as const;

export type HomeFieldToken = (typeof HOME_FIELD_TOKENS)[number];

export type HomeFieldErrors = Record<string, string[]>;

/** GET /api/v1/admin/home-modules/{locale} → {revision, modules}. */
export async function getHomeModules(
  locale: HomeLocale
): Promise<HomeModulesDocument> {
  return request<HomeModulesDocument>(`/home-modules/${locale}`);
}

/**
 * PUT /api/v1/admin/home-modules/{locale} with If-Match (full-array replace).
 * Resolves with the new revision; 409 STALE_REVISION / 428 PRECONDITION_REQUIRED
 * surface as ApiError rejections.
 */
export async function putHomeModules(
  locale: HomeLocale,
  modules: HomeModuleRow[],
  revision: string
): Promise<string> {
  const data = await request<{ revision: string }>(`/home-modules/${locale}`, {
    method: "PUT",
    headers: { "If-Match": revision },
    body: JSON.stringify({ modules }),
  });
  return data.revision;
}

/**
 * POST /api/v1/admin/home-modules/{locale}/validate (dry run, no writes).
 * Resolves with the parsed field problems on 400; resolves with an empty
 * object on 200. Network/other failures still reject with ApiError.
 */
export async function validateHomeModules(
  locale: HomeLocale,
  modules: HomeModuleRow[]
): Promise<HomeFieldErrors> {
  try {
    await request<Record<string, never>>(`/home-modules/${locale}/validate`, {
      method: "POST",
      body: JSON.stringify({ modules }),
    });
    return {};
  } catch (err) {
    if (isApiError(err) && isValidationProblem(err)) {
      return err.fields ?? {};
    }
    throw err;
  }
}

/** 400 VALIDATION ProblemDetails (field tokens kept structural for i18n mapping). */
export function isValidationProblem(err: ApiError): boolean {
  return err.status === 400 && err.code === "VALIDATION";
}

// ---------- Timeline records (AB-03 / AF-02) ----------
// Contract source of truth: apps/cms/apps/api/admin_timeline.py (FROZEN — AF
// consumes, never redefines). updatedAt doubles as the per-row If-Match
// revision; `order` is reorder-only (never PATCH-editable).

export type TimelineLocale = HomeLocale;

/** admin_timeline.py VALID_TYPES = TimelineRecordType.values. */
export const TIMELINE_TYPES = [
  "experience",
  "education",
  "project",
  "milestone",
  "talk",
  "publication",
] as const;

export type TimelineType = (typeof TIMELINE_TYPES)[number];

const TIMELINE_TYPE_SET: ReadonlySet<string> = new Set(TIMELINE_TYPES);

export function isTimelineType(value: string): value is TimelineType {
  return TIMELINE_TYPE_SET.has(value);
}

/** admin_timeline.py TimelineAdminOut projection. */
export interface TimelineRecord {
  id: number;
  type: TimelineType;
  label: string;
  period_label: string;
  body: string;
  role: string;
  weight: number;
  detail_url: string;
  order: number;
  attach: number | null;
  updatedAt: string;
}

/** Fields PATCH accepts (attach null clears the attachment; order excluded). */
export type TimelinePatchInput = Partial<
  Pick<
    TimelineRecord,
    | "type"
    | "label"
    | "period_label"
    | "body"
    | "role"
    | "weight"
    | "detail_url"
    | "attach"
  >
>;

export interface TimelineCreateInput {
  type: TimelineType;
  label: string;
  period_label?: string;
  body?: string;
  role?: string;
  weight?: number;
  detail_url?: string;
  attach?: number | null;
  /** Insert after this row id instead of appending. */
  after_id?: number;
}

/** PositiveSmallIntegerField storage bound (admin_timeline.py WEIGHT_MAX). */
export const TIMELINE_WEIGHT_MAX = 32767;

/** Stable ProblemDetails field tokens (admin_timeline.py constants). */
export const TIMELINE_FIELD_TOKENS = [
  "BAD_TYPE",
  "INVALID_DETAIL_URL",
  "BAD_WEIGHT",
  "UNKNOWN_ID",
  "DUPLICATE_ORDER",
] as const;

/** Client-side mirror of apps/content/models.py validate_detail_url:
 * blank | site-relative (single leading '/') | absolute http(s). */
export function isValidTimelineDetailUrl(value: string): boolean {
  const url = value.trim();
  if (url === "") {
    return true;
  }
  if (url.startsWith("/") && !url.startsWith("//")) {
    return true;
  }
  return /^https?:\/\/\S+$/i.test(url);
}

/** GET /api/v1/admin/timeline/{locale} → bare array (optional profile filter). */
export async function listTimeline(
  locale: TimelineLocale,
  profileId?: number
): Promise<TimelineRecord[]> {
  const query = profileId === undefined ? "" : `?profile=${String(profileId)}`;
  return request<TimelineRecord[]>(`/timeline/${locale}${query}`);
}

/** POST /api/v1/admin/timeline/{locale} → created item (position=append default). */
export async function createTimeline(
  locale: TimelineLocale,
  input: TimelineCreateInput
): Promise<TimelineRecord> {
  return request<TimelineRecord>(`/timeline/${locale}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** PATCH /api/v1/admin/timeline/{locale}/{id} with If-Match → fresh item. */
export async function updateTimeline(
  locale: TimelineLocale,
  id: number,
  patch: TimelinePatchInput,
  ifMatch: string
): Promise<TimelineRecord> {
  return request<TimelineRecord>(`/timeline/${locale}/${String(id)}`, {
    method: "PATCH",
    headers: { "If-Match": ifMatch },
    body: JSON.stringify(patch),
  });
}

/** DELETE /api/v1/admin/timeline/{locale}/{id} with If-Match → 204. */
export async function deleteTimeline(
  locale: TimelineLocale,
  id: number,
  ifMatch: string
): Promise<void> {
  await request<null>(`/timeline/${locale}/${String(id)}`, {
    method: "DELETE",
    headers: { "If-Match": ifMatch },
  });
}

/** POST /api/v1/admin/timeline/{locale}/reorder {ids} → fresh full array. */
export async function reorderTimeline(
  locale: TimelineLocale,
  ids: number[]
): Promise<TimelineRecord[]> {
  return request<TimelineRecord[]>(`/timeline/${locale}/reorder`, {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// ---------- Media presentation (AB-04 / AF-03) ----------
// Contract source of truth: apps/cms/apps/api/admin_media_ext.py (FROZEN — AF
// consumes, never redefines). The frozen contract is write-only: there is no
// presentation READ endpoint, so screens track per-field edits and PATCH the
// changed subset only. updatedAt doubles as the per-row If-Match revision.

/** GET /api/v1/admin/media/licenses row (ordered by name). */
export interface MediaLicenseRow {
  id: number;
  name: string;
}

/** PATCH body subset; explicit null clears the field server-side. */
export interface MediaPresentationPatch {
  focal_x?: number | null;
  focal_y?: number | null;
  rights_statement_fa?: string | null;
  rights_statement_en?: string | null;
  license_id?: number | null;
  caption_fa?: string | null;
  caption_en?: string | null;
}

/** PATCH success body: row id plus the new If-Match revision. */
export interface MediaPresentationResult {
  id: number;
  updatedAt: string;
}

/** Stable ProblemDetails field tokens (admin_media_ext.py constants). */
export const MEDIA_FIELD_TOKENS = [
  "UNKNOWN_FIELD",
  "OUT_OF_RANGE",
  "UNKNOWN_LICENSE",
  "TOO_LONG",
] as const;

let mediaLicensesCache: MediaLicenseRow[] | null = null;

/** GET /api/v1/admin/media/licenses; fetched once per session (module cache). */
export async function getMediaLicenses(): Promise<MediaLicenseRow[]> {
  if (mediaLicensesCache !== null) {
    return mediaLicensesCache;
  }
  const rows = await request<MediaLicenseRow[]>("/media/licenses");
  mediaLicensesCache = rows;
  return rows;
}

/** PATCH /api/v1/admin/media/{id}/presentation with If-Match → {id, updatedAt}. */
export async function updateMediaPresentation(
  id: number,
  patch: MediaPresentationPatch,
  ifMatch: string
): Promise<MediaPresentationResult> {
  return request<MediaPresentationResult>(`/media/${String(id)}/presentation`, {
    method: "PATCH",
    headers: { "If-Match": ifMatch },
    body: JSON.stringify(patch),
  });
}

// ---------- Graph authoring (AB-05 / AF-04) ----------
// Contract source of truth: apps/cms/apps/api/admin_graph.py (FROZEN — AF
// consumes, never redefines). Payload shapes are the AGENT-COORDINATION.md §4
// GraphNodePublic/GraphEdgePublic camelCase contracts (one payload everywhere:
// admin API and the future public BK-05 read serve the same shapes).
// updatedAt doubles as the PUT If-Match revision. Edge id is composed
// server-side (`source->target:relationType`) and ignored on write.

export type GraphLocale = HomeLocale;

/** admin_graph.py GraphVersionStatus (draft/active; active archives the previous). */
export type GraphVersionStatus = "draft" | "active";

export interface GraphVersionRow {
  id: number;
  locale: GraphLocale;
  status: GraphVersionStatus;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
}

export interface GraphRelatedRecord {
  family: string;
  id: string;
}

export interface GraphNodePosition {
  x: number;
  y: number;
  z?: number;
}

/** Camel node (admin_graph.py _serialize_node); `id` IS the node_id string. */
export interface GraphNode {
  id: string;
  type: string;
  label: string;
  summary?: string;
  accessibleLabel: string;
  colorRole: string;
  iconRole: string;
  /** 0..1 integral only (validator rejects fractions until storage widens). */
  weight: number;
  position?: GraphNodePosition;
  relatedRecords: GraphRelatedRecord[];
}

export interface GraphEdge {
  /** Composed server-side; ignored on write. */
  id: string;
  source: string;
  target: string;
  relationType: string;
  directed: boolean;
  weight: number;
  explanation?: string;
}

export interface GraphGroup {
  name: string;
  nodeIds: string[];
}

export interface GraphPayload {
  nodes: GraphNode[];
  edges: GraphEdge[];
  groups: GraphGroup[];
}

export interface GraphVersionDetail {
  id: number;
  locale: GraphLocale;
  status: GraphVersionStatus;
  createdAt: string;
  updatedAt: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  groups: GraphGroup[];
}

/** Validator issue (admin_graph_validate.py issue shape). */
export interface GraphIssue {
  code: string;
  nodeId?: string;
  edgeId?: string;
  messageToken: string;
}

export interface GraphRevisionResult {
  revision: string;
}

export interface GraphActivateResult {
  id: number;
  status: string;
}

/** admin_graph.py GRAPH_RELATED_FAMILIES keys (forward family -> model table). */
export const GRAPH_RELATED_FAMILIES = [
  "landing",
  "profile",
  "article",
  "series",
  "researchtopic",
  "researchstatement",
  "project",
  "publication",
  "book",
  "talk",
  "download",
] as const;

export type GraphRelatedFamily = (typeof GRAPH_RELATED_FAMILIES)[number];

/**
 * Mirror of apps/cms/apps/api/admin_graph_validate.py GRAPH_ISSUE_CODES +
 * _MESSAGE_TOKENS; keep in sync (AF-05 adds the token-sync test).
 */
export const GRAPH_ISSUE_CODES = [
  "DUPLICATE_NODE_ID",
  "SELF_EDGE",
  "DUPLICATE_EDGE",
  "BROKEN_RELATED",
  "MISSING_ACCESSIBLE_LABEL",
  "BAD_WEIGHT",
  "MISSING_POSITION",
] as const;

export type GraphIssueCode = (typeof GRAPH_ISSUE_CODES)[number];

export const GRAPH_ISSUE_TOKENS: Record<GraphIssueCode, string> = {
  DUPLICATE_NODE_ID: "graph.duplicateNodeId",
  SELF_EDGE: "graph.selfEdge",
  DUPLICATE_EDGE: "graph.duplicateEdge",
  BROKEN_RELATED: "graph.brokenRelated",
  MISSING_ACCESSIBLE_LABEL: "graph.missingAccessibleLabel",
  BAD_WEIGHT: "graph.badWeight",
  MISSING_POSITION: "graph.missingPosition",
};

/** GET /api/v1/admin/graph/versions → bare array ordered by (locale, -id). */
export async function getGraphVersions(): Promise<GraphVersionRow[]> {
  return request<GraphVersionRow[]>("/graph/versions");
}

/** POST /api/v1/admin/graph/versions {locale} → 201 empty draft row. */
export async function createGraphVersion(
  locale: GraphLocale
): Promise<GraphVersionRow> {
  return request<GraphVersionRow>("/graph/versions", {
    method: "POST",
    body: JSON.stringify({ locale }),
  });
}

/** GET /api/v1/admin/graph/versions/{id} → full camel payload. */
export async function getGraphPayload(
  versionId: number
): Promise<GraphVersionDetail> {
  return request<GraphVersionDetail>(`/graph/versions/${String(versionId)}`);
}

/**
 * PUT /api/v1/admin/graph/versions/{id}/payload with If-Match (updatedAt ISO).
 * 400 {"issues":[...]} / 409 IMMUTABLE_ACTIVE / 409 STALE_REVISION /
 * 428 PRECONDITION_REQUIRED surface as ApiError rejections (issues preserved
 * on the ApiError by the shared client).
 */
export async function putGraphPayload(
  versionId: number,
  payload: GraphPayload,
  ifMatch: string
): Promise<GraphRevisionResult> {
  return request<GraphRevisionResult>(
    `/graph/versions/${String(versionId)}/payload`,
    {
      method: "PUT",
      headers: { "If-Match": ifMatch },
      body: JSON.stringify(payload),
    }
  );
}

/** POST /api/v1/admin/graph/versions/{id}/activate → {id, status:"active"}. */
export async function activateGraphVersion(
  versionId: number
): Promise<GraphActivateResult> {
  return request<GraphActivateResult>(
    `/graph/versions/${String(versionId)}/activate`,
    { method: "POST" }
  );
}
