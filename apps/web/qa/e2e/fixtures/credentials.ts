/**
 * Test-only Playwright credentials (must match apps/cms/scripts/seed_e2e_fixtures.py).
 * Never use production secrets here.
 */
export const E2E_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "e2e@example.com";
export const E2E_PASSWORD =
  process.env.E2E_ADMIN_PASSWORD ?? "e2e-pass-not-a-real-secret";
/** RFC 6238 example key as hex (ASCII "12345678901234567890"). */
export const E2E_TOTP_KEY_HEX =
  process.env.E2E_TOTP_KEY_HEX ??
  "3132333435363738393031323334353637383930";
