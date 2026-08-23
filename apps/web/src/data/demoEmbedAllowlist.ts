/**
 * Owner-approved demo iframe hosts (DEFER-0021).
 *
 * Empty until the owner confirms production demo domains.
 * Do not invent hosts. Click-to-load embeds only when the demo URL host
 * is listed here; otherwise the public external link remains.
 *
 * After allowlist confirmation, also add matching hosts to Caddy
 * Content-Security-Policy frame-src (Report-Only first, then enforce).
 */
export const DEMO_EMBED_ALLOWLIST: readonly string[] = [
  // "example-approved-demo.example",
];

export function isDemoEmbedAllowed(demoUrl: string): boolean {
  if (!demoUrl || DEMO_EMBED_ALLOWLIST.length === 0) return false;
  try {
    const host = new URL(demoUrl).hostname.toLowerCase();
    return DEMO_EMBED_ALLOWLIST.some(
      (entry) => host === entry.toLowerCase() || host.endsWith(`.${entry.toLowerCase()}`),
    );
  } catch {
    return false;
  }
}
