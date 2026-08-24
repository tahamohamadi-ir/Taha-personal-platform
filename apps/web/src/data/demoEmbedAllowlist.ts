/**
 * Owner-approved demo iframe hosts (DEFER-0021).
 *
 * ⚠️ OWNER MUST FILL before F2/CSP-enforce:
 *   This list is intentionally EMPTY until the project owner confirms the
 *   production demo domains. Do not invent hosts. Click-to-load embeds are
 *   only rendered when the demo URL host resolves against this list;
 *   otherwise the public external link remains.
 *
 *   Before flipping Caddy/infra CSP to enforce mode, every host added here
 *   must also be mirrored into the Content-Security-Policy frame-src
 *   directives (Report-Only first, then enforce).
 */

/**
 * Allowed demo embed hosts. Entries are bare hostnames (no scheme, port,
 * or path). A listed host also admits its subdomains. Empty ⇒ all embeds
 * stay dormant and only external links render.
 */
export const DEMO_EMBED_ALLOWLIST: readonly string[] = [
  // "example-approved-demo.example",
];

const HTTP_PROTOCOL_RE = /^https?:$/;

/**
 * Normalize arbitrary user/CMS input to a bare lowercase hostname.
 * Strips protocol (scheme), credentials, port, path, query, fragment,
 * surrounding whitespace, and trailing dots. Returns null for empty,
 * whitespace-containing, or unparseable input; non-http(s) absolute URLs
 * are rejected rather than guessed.
 */
export function normalizeHost(input: string): string | null {
  const trimmed = typeof input === "string" ? input.trim() : "";
  if (!trimmed || /\s/.test(trimmed)) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
    if (!HTTP_PROTOCOL_RE.test(parsed.protocol)) {
      if (trimmed.includes("://")) return null; // ftp:, javascript:, etc.
      // Bare "host[:port][/path]" may parse with a bogus scheme — retry as host.
      parsed = new URL(`https://${trimmed.replace(/^\/+/, "")}`);
    }
  } catch {
    try {
      parsed = new URL(`https://${trimmed.replace(/^\/+/, "")}`);
    } catch {
      return null;
    }
  }

  const host = parsed.hostname.toLowerCase().replace(/\.+$/, "");
  return host || null;
}

/**
 * True when the normalized host equals an allowlist entry or is one of
 * its subdomains. Defaults to the owner-managed {@link DEMO_EMBED_ALLOWLIST};
 * tests may pass an explicit entry list instead of mutating it.
 */
export function isAllowedHost(
  host: string,
  entries: readonly string[] = DEMO_EMBED_ALLOWLIST,
): boolean {
  const normalized = normalizeHost(host);
  if (!normalized || entries.length === 0) return false;
  return entries.some((entry) => {
    const allowed = normalizeHost(entry);
    if (!allowed) return false;
    return normalized === allowed || normalized.endsWith(`.${allowed}`);
  });
}

/**
 * Gate for full demo URLs coming from the CMS. False whenever the
 * allowlist is empty, so the click-to-load UI stays dormant until the
 * owner fills {@link DEMO_EMBED_ALLOWLIST}.
 */
export function isDemoEmbedAllowed(demoUrl: string): boolean {
  return isAllowedHost(demoUrl);
}
