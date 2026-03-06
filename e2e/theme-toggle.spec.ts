import { test, expect } from "@playwright/test";

test.describe("Theme Toggle", () => {
  test("toggles dark mode and persists in localStorage", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /toggle theme/i }).waitFor();

    const toggle = page.getByRole("button", { name: /toggle theme/i });
    await expect(toggle).toBeVisible();

    const initialDark = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("dark"));

    await toggle.click();
    const afterFirst = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("dark"));
    expect(afterFirst).toBe(!initialDark);

    await toggle.click();
    const afterSecond = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("dark"));
    expect(afterSecond).toBe(initialDark);

    const stored = await page.evaluate(() => localStorage.getItem("theme"));
    expect(stored).toBeTruthy();
  });
});
