import { test, expect } from "@playwright/test";

test.describe("Browse Blog", () => {
  test("navigate to blog, read a post, and go back", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /read the blog/i }).click();
    await expect(page).toHaveURL("/blog");
    await expect(
      page.getByRole("heading", { name: "Blog", exact: true })
    ).toBeVisible();

    const postLinks = page.locator("a[href^='/blog/']");
    await expect(postLinks.first()).toBeVisible();

    await postLinks.first().click();
    await expect(page).toHaveURL(/\/blog\/.+/);

    await expect(page.locator("h1")).toBeVisible();
    const backLink = page.getByRole("link", { name: /back to all posts/i });
    await expect(backLink).toBeVisible();

    await backLink.click();
    await expect(page).toHaveURL("/blog");
  });
});
