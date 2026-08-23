import { expect, type Page } from "@playwright/test";
import { E2E_EMAIL, E2E_PASSWORD, E2E_TOTP_KEY_HEX } from "./credentials";
import { currentTotp } from "./totp";

export async function loginAsE2eAdmin(page: Page): Promise<void> {
  const totpOffsetsMs = [0, -30_000, 30_000];
  let lastError: unknown;

  for (const offsetMs of totpOffsetsMs) {
    await page.goto("/admin/login");
    await page.locator("#email").fill(E2E_EMAIL);
    await page.locator("#password").fill(E2E_PASSWORD);
    await page.locator("#otpToken").fill(currentTotp(E2E_TOTP_KEY_HEX, Date.now() + offsetMs));
    await page.getByRole("button", { name: "ورود" }).click();

    try {
      await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 10_000 });
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
