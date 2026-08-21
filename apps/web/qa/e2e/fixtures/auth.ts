import { expect, type Page } from "@playwright/test";
import { E2E_EMAIL, E2E_PASSWORD } from "./credentials";
import { currentTotp } from "./totp";

export async function loginAsE2eAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.locator("#email").fill(E2E_EMAIL);
  await page.locator("#password").fill(E2E_PASSWORD);
  await page.locator("#otpToken").fill(currentTotp());
  await page.getByRole("button", { name: "ورود" }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);
}
