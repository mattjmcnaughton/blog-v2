import { test, expect } from "@playwright/test";

const PAGES = ["/", "/blog", "/about", "/now"];

test.describe("Mobile Layout", () => {
  for (const pagePath of PAGES) {
    test(`no horizontal overflow on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath, { waitUntil: "networkidle" });

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth
      );
      const clientWidth = await page.evaluate(
        () => document.documentElement.clientWidth
      );

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }

  test("header fits within viewport", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const header = page.locator("header").first();
    await expect(header).toBeVisible();

    const headerBox = await header.boundingBox();
    const viewport = page.viewportSize();

    expect(headerBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(headerBox!.x).toBeGreaterThanOrEqual(0);
    expect(headerBox!.x + headerBox!.width).toBeLessThanOrEqual(
      viewport!.width
    );
  });

  test("blog post has no horizontal overflow", async ({ page }) => {
    await page.goto("/blog", { waitUntil: "networkidle" });

    const firstPostLink = await page
      .locator('a[href^="/blog/"]')
      .first()
      .getAttribute("href");

    expect(firstPostLink).not.toBeNull();
    await page.goto(firstPostLink!, { waitUntil: "networkidle" });

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    );

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
