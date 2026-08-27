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
