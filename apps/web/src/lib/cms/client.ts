/** Shared CMS_API_BASE fetch for Astro build-time consumers. */

export function cmsBase(): string | null {
  const raw = (import.meta.env.CMS_API_BASE as string | undefined)?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

/**
 * Production gunicorn is HTTP on loopback with SECURE_SSL_REDIRECT.
 * Caddy sets X-Forwarded-Proto; local/tunnel builds must send it too or
 * Django 301s to https://127.0.0.1:18000 which cannot be fetched.
 */
export async function cmsFetchJson<T>(path: string): Promise<T | null> {
  const base = cmsBase();
  if (!base) return null;
  try {
    const response = await fetch(`${base}${path}`, {
      headers: { "X-Forwarded-Proto": "https" },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
