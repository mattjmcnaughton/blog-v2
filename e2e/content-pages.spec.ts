import { test, expect } from "@playwright/test";

test.describe("Content Pages", () => {
  test("about page has heading and content", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".prose, article")).toBeVisible();
  });

  test("now page has heading and content", async ({ page }) => {
    await page.goto("/now");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".prose, article")).toBeVisible();
  });

  test("projects page presents Habagou", async ({ page }) => {
    await page.goto("/projects");

    await expect(
      page.getByRole("heading", { level: 1, name: "Projects" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /try habagou/i })
    ).toHaveAttribute("href", "https://habagou.mattjmcnaughton.com");
  });
});
