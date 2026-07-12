import { test, expect } from "@playwright/test";

test.describe("App loads", () => {
  test("homepage renders hero content", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/mattjmcnaughton/i);

    const h1 = page.locator("h1");
    await expect(h1).toContainText("Matt");
    await expect(h1).toContainText("McNaughton");

    const headshot = page.getByRole("img", { name: "Matt McNaughton" });
    await expect(headshot).toBeVisible();
  });

  test("CTA links are visible", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("hero-blog-cta")).toBeVisible();
    await expect(page.getByTestId("hero-projects-cta")).toBeVisible();
    await expect(page.getByTestId("hero-about-cta")).toBeVisible();
  });

  test("featured writing section is present", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /featured writing/i })
    ).toBeVisible();
  });
});
