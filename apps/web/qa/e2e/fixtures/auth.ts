import { type Page } from "@playwright/test";
import { E2E_EMAIL, E2E_PASSWORD, E2E_TOTP_KEY_HEX } from "./credentials";
import { currentTotp } from "./totp";

/** Avoid submitting TOTP in the last/first seconds of a 30s window (CI flake). */
async function waitForStableTotpWindow(): Promise<void> {
  const secInWindow = Math.floor(Date.now() / 1000) % 30;
  if (secInWindow >= 27) {
    await new Promise((resolve) =>
      setTimeout(resolve, (30 - secInWindow + 3) * 1000),
    );
  } else if (secInWindow <= 2) {
    await new Promise((resolve) => setTimeout(resolve, (3 - secInWindow) * 1000));
  }
}

export async function loginAsE2eAdmin(page: Page): Promise<void> {
  await waitForStableTotpWindow();
  const totpOffsetsMs = [0, -30_000, 30_000];
  let lastError: unknown;

  for (const offsetMs of totpOffsetsMs) {
    await page.goto("/admin/login");
    await page.locator("#email").fill(E2E_EMAIL);
    await page.locator("#password").fill(E2E_PASSWORD);
    await page.locator("#otpToken").fill(currentTotp(E2E_TOTP_KEY_HEX, Date.now() + offsetMs));
    await page.getByRole("button", { name: "ورود" }).click();

    try {
      await page.waitForURL(/\/admin\/?$/, { timeout: 15_000 });
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
