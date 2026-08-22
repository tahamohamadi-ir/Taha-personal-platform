/** Shared CMS_API_BASE fetch for Astro build-time consumers (ADR-0027 Slice 3). */

export type CmsFetchResult<T> =
  | { kind: "unset" }
  | { kind: "ok"; data: T }
  | { kind: "http"; status: number; body: unknown }
  | { kind: "error"; message: string; status?: number };

export class CmsOriginError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "CmsOriginError";
    this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = 5000;

export function cmsBase(): string | null {
  const raw = (import.meta.env.CMS_API_BASE as string | undefined)?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

/** True when this build must use live CMS origin (no snapshot fallback). */
export function isCmsOriginBuild(): boolean {
  return cmsBase() !== null;
}

/**
 * Production gunicorn is HTTP on loopback with SECURE_SSL_REDIRECT.
 * Caddy sets X-Forwarded-Proto; local/tunnel builds must send it too or
 * Django 301s to https://127.0.0.1:18000 which cannot be fetched.
 *
 * When CMS_API_BASE is set: transport / timeout / 5xx → `{ kind: "error" }`
 * (callers must fail the build). Snapshot fallback is only for `{ kind: "unset" }`.
 */
export async function cmsFetchJson<T>(path: string): Promise<CmsFetchResult<T>> {
  const base = cmsBase();
  if (!base) return { kind: "unset" };

  try {
    const response = await fetch(`${base}${path}`, {
      headers: { "X-Forwarded-Proto": "https" },
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (response.ok) {
      return { kind: "ok", data: (await response.json()) as T };
    }

    if (response.status >= 500) {
      return {
        kind: "error",
        message: `CMS ${path} failed with HTTP ${response.status}`,
        status: response.status,
      };
    }

    const body = await response.json().catch(() => null);
    return { kind: "http", status: response.status, body };
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    return {
      kind: "error",
      message: `CMS ${path} unreachable: ${detail}`,
    };
  }
}

/** Fail the Astro build when CMS_API_BASE is set and the origin is unhealthy. */
export function throwIfCmsError<T>(
  result: CmsFetchResult<T>,
  context: string,
): asserts result is Exclude<CmsFetchResult<T>, { kind: "error" }> {
  if (result.kind === "error") {
    throw new CmsOriginError(`${context}: ${result.message}`, result.status);
  }
}
