import { test, expect } from "@playwright/test";

test.describe("Browse Blog", () => {
  test("navigate to blog, read a post, and go back", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /read the blog/i }).click();
    await expect(page).toHaveURL("/blog");
    await expect(
      page.getByRole("heading", { name: "Blog", exact: true })
    ).toBeVisible();

    const postLinks = page.locator("main a[href^='/blog/']");
    const postCount = await postLinks.count();
    expect(postCount).toBeGreaterThan(0);

    const postLink = postLinks.nth(0);
    await expect(postLink).toBeVisible();
    const postHref = await postLink.getAttribute("href");
    if (!postHref) {
      throw new Error("Expected a blog post link to have an href");
    }

    await postLink.click();
    await page.waitForURL(`**${postHref}`, { timeout: 15_000 });
    await expect(page).toHaveURL(postHref);

    await expect(page.locator("h1")).toBeVisible();
    const backLink = page.getByRole("link", { name: /back to all posts/i });
    await expect(backLink).toBeVisible();

    await backLink.click();
    await expect(page).toHaveURL("/blog");
  });
});
