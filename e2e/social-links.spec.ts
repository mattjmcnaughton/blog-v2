import { test, expect } from "@playwright/test";

test.describe("Social Links", () => {
  test("hero section has social links", async ({ page }) => {
    await page.goto("/");

    const main = page.locator("main");
    await expect(
      main.locator("a[href*='github.com/mattjmcnaughton']")
    ).toBeVisible();
    await expect(
      main.locator("a[href*='linkedin.com/in/mattjmcnaughton']")
    ).toBeVisible();
    await expect(
      main.locator("a[href*='mailto:me@mattjmcnaughton.com']")
    ).toBeVisible();
  });

  test("footer has social links", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(
      footer.locator("a[href*='github.com/mattjmcnaughton']")
    ).toBeVisible();
    await expect(
      footer.locator("a[href*='linkedin.com/in/mattjmcnaughton']")
    ).toBeVisible();
    await expect(
      footer.locator("a[href*='mailto:me@mattjmcnaughton.com']")
    ).toBeVisible();
  });
});
