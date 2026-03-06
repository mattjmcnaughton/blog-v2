import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("header nav links navigate correctly", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /toggle theme/i }).waitFor();

    const nav = page.locator("nav");
    await nav.getByRole("link", { name: "Blog" }).click();
    await expect(page).toHaveURL("/blog");

    await page.getByRole("button", { name: /toggle theme/i }).waitFor();
    await nav.getByRole("link", { name: "Now" }).click();
    await expect(page).toHaveURL("/now");

    await page.getByRole("button", { name: /toggle theme/i }).waitFor();
    await nav.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL("/about");
  });

  test("avatar returns home", async ({ page }) => {
    await page.goto("/blog");
    await page.getByRole("button", { name: /toggle theme/i }).waitFor();

    await page.getByRole("link", { name: /mattjmcnaughton/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("RSS link has correct href", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /toggle theme/i }).waitFor();

    const rssLink = page.getByRole("link", { name: "RSS" });
    await expect(rssLink).toHaveAttribute("href", "/feed");
  });
});
