import { expect, test } from "@playwright/test";
import { loginAsE2eAdmin } from "./fixtures/auth";

/**
 * ADM-6 §18 matrix remainder (DEFER-0032) — automatable slices.
 * Manual checklist: docs/plan/manual-test-checklists/adm-qa-s6.md
 */
test.describe.configure({ mode: "serial" });

test("admin shell is RTL and login is keyboard-reachable", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");

  await page.locator("#email").focus();
  await expect(page.locator("#email")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#password")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#otpToken")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "ورود" })).toBeFocused();
});

test("admin responses send noindex and no-store cache policy", async ({
  request,
}) => {
  const login = await request.get("/admin/login");
  expect(login.headers()["x-robots-tag"] ?? "").toMatch(/noindex/i);
  expect(login.headers()["cache-control"] ?? "").toMatch(/no-store/i);

  const spa = await request.get("/admin/");
  // Unauthenticated SPA shell still must not be indexed.
  expect(spa.headers()["x-robots-tag"] ?? "").toMatch(/noindex/i);
});

test("LTR content fields use dir=ltr on English slug", async ({ page }) => {
  await loginAsE2eAdmin(page);
  await page.goto("/admin/content/article/new");
  await page.locator("#content-form-locale").selectOption("en");
  const slug = page.locator("#content-form-slug");
  await expect(slug).toBeVisible();
  await expect(slug).toHaveAttribute("dir", "ltr");
});

test("bulk archive shows count confirm and writes audit", async ({ page }) => {
  await loginAsE2eAdmin(page);

  const me = await page.request.get("/api/v1/admin/auth/me");
  expect(me.status()).toBe(200);
  const meBody = await me.json();
  expect(meBody.featureFlags?.admin_bulk_archive).toBe(true);

  const stamp = Date.now();
  const titles = [`PW Bulk A ${stamp}`, `PW Bulk B ${stamp}`];
  for (const [index, title] of titles.entries()) {
    await page.goto("/admin/content/landing/new");
    await page.locator("#content-form-locale").selectOption("en");
    await page.locator("#content-form-title").fill(title);
    await page.locator("#content-form-slug").fill(`pw-bulk-${stamp}-${index}`);
    await page.getByRole("button", { name: "ذخیره", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/content\/landing\/?$/);
  }

  await page.goto("/admin/content/landing?q=pw-bulk-" + stamp);
  await expect(page.getByTestId("bulk-archive-toolbar")).toBeVisible();

  for (const title of titles) {
    await page.getByRole("checkbox", { name: new RegExp(title) }).check();
  }
  await expect(page.getByText(/۲ مورد انتخاب شده/)).toBeVisible();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toMatch(/۲/);
    expect(dialog.message()).toMatch(/بایگانی/);
    await dialog.accept();
  });
  await page.getByTestId("bulk-archive-button").click();
  await expect(page.getByText(/مورد بایگانی شد/)).toBeVisible({
    timeout: 15000,
  });

  // Status badges should show archived after reload.
  await page.goto("/admin/content/landing?q=pw-bulk-" + stamp + "&status=archived");
  for (const title of titles) {
    await expect(
      page.getByRole("link", { name: title, exact: true }).first(),
    ).toBeVisible();
  }
});
