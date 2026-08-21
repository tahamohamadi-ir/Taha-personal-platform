import { expect, test } from "@playwright/test";
import { loginAsE2eAdmin } from "./fixtures/auth";

/**
 * Browser lifecycle: create → publish → public JSON fa/en.
 * Complements apps/cms/tests/test_content_lifecycle_e2e.py (JSON-only pytest).
 * Does not replace that suite.
 */
test.describe.configure({ mode: "serial" });

const SLUG = `pw-lifecycle-${Date.now()}`;
const BODY = Array.from({ length: 401 }, () => "word").join(" ");

async function createAndPublishArticle(
  page: import("@playwright/test").Page,
  locale: "en" | "fa",
): Promise<void> {
  await page.goto("/admin/content/article/new");
  await expect(page.getByRole("heading", { name: /ایجاد/ })).toBeVisible();

  await page.locator("#content-form-locale").selectOption(locale);
  await page.locator("#content-form-title").fill(`PW Lifecycle ${locale}`);
  await page.locator("#content-form-slug").fill(SLUG);

  const excerpt = page.locator("#content-form-field-excerpt");
  if (await excerpt.count()) {
    await excerpt.fill("Playwright lifecycle excerpt.");
  }
  const body = page.locator("#content-form-field-body");
  if (await body.count()) {
    await body.fill(BODY);
  }

  await page.getByRole("button", { name: "ذخیره", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/content/article/?$`));

  const rowLink = page.getByRole("link", { name: `PW Lifecycle ${locale}`, exact: true }).first();
  await expect(rowLink).toBeVisible();
  await rowLink.click();
  await expect(page).toHaveURL(/\/admin\/content\/article\/\d+/);

  page.once("dialog", (dialog) => {
    void dialog.accept();
  });
  await page.getByRole("button", { name: "انتشار", exact: true }).click();
  await expect(page.getByText(/وضعیت به «منتشرشده» تغییر کرد/)).toBeVisible({
    timeout: 15000,
  });
}

test("create → publish → public fa/en JSON", async ({ page, request }) => {
  const draftCheck = await request.get(`/api/articles/en/${SLUG}`);
  expect(draftCheck.status()).toBe(404);

  await loginAsE2eAdmin(page);

  for (const locale of ["en", "fa"] as const) {
    await createAndPublishArticle(page, locale);
  }

  for (const locale of ["en", "fa"] as const) {
    const publicRes = await request.get(`/api/articles/${locale}/${SLUG}`);
    expect(publicRes.status(), `public ${locale}`).toBe(200);
    const body = await publicRes.json();
    expect(body.slug).toBe(SLUG);
    expect(body.title).toBe(`PW Lifecycle ${locale}`);
  }

  const publicBase = process.env.PUBLIC_BASE_URL;
  if (publicBase) {
    for (const locale of ["en", "fa"] as const) {
      const html = await request.get(
        `${publicBase.replace(/\/$/, "")}/${locale}/blog/${SLUG}/`,
      );
      expect(html.status(), `public html ${locale}`).toBe(200);
      const text = await html.text();
      expect(text).toContain(`PW Lifecycle ${locale}`);
    }
  }
});
