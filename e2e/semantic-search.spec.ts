import { test, expect } from "@playwright/test";

// Helper: click the semantic toggle and wait for the model to finish loading.
// The button text changes to "Loading..." while the model loads, then back to "Semantic".
async function switchToSemanticAndWait(
  page: import("@playwright/test").Page
): Promise<void> {
  const toggle = page.getByRole("radiogroup", { name: /search mode/i });
  // Click the second button in the toggle (Semantic / Loading...)
  await toggle.getByRole("radio").nth(1).click();
  // Wait until "Semantic" text reappears (model finished loading)
  await expect(toggle.getByText("Semantic")).toBeVisible({ timeout: 120000 });
}

test.describe("Semantic Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
    await expect(
      page.getByRole("heading", { name: "Blog", exact: true })
    ).toBeVisible();
  });

  test("search mode toggle is visible", async ({ page }) => {
    const toggle = page.getByRole("radiogroup", { name: /search mode/i });
    await expect(toggle).toBeVisible();
    await expect(toggle.getByText("Keyword")).toBeVisible();
    await expect(toggle.getByText("Semantic")).toBeVisible();
  });

  test("keyword mode is selected by default", async ({ page }) => {
    const keywordBtn = page.getByRole("radio", { name: /keyword/i });
    await expect(keywordBtn).toHaveAttribute("aria-checked", "true");
  });

  test("switching to semantic mode loads model", async ({ page }) => {
    await switchToSemanticAndWait(page);

    const toggle = page.getByRole("radiogroup", { name: /search mode/i });
    const semanticBtn = toggle.getByRole("radio").nth(1);
    await expect(semanticBtn).toHaveAttribute("aria-checked", "true");
  });

  test("semantic search ranks results by relevance on Enter", async ({
    page,
  }) => {
    await switchToSemanticAndWait(page);

    const searchInput = page.getByPlaceholder(/search by meaning/i);
    await searchInput.fill("container orchestration");
    await searchInput.press("Enter");

    // Should surface Kubernetes-related posts at the top
    const firstPost = page.locator(".space-y-4 a").first();
    await expect(firstPost).toContainText(/kubernetes/i, { timeout: 10000 });
  });

  test("all posts shown while typing in semantic mode", async ({ page }) => {
    await switchToSemanticAndWait(page);

    const searchInput = page.getByPlaceholder(/search by meaning/i);
    await searchInput.fill("container orchestration");

    // Before pressing Enter, all posts should still be visible
    await expect(page.getByText("Hello Again")).toBeVisible();
    await expect(page.getByText("Programming with OCD")).toBeVisible();
  });

  test("tag filtering works in semantic mode", async ({ page }) => {
    await switchToSemanticAndWait(page);

    // Select a tag
    await page.getByRole("button", { name: /filter by tags/i }).click();
    const listbox = page.getByRole("listbox", { name: /available tags/i });
    await listbox.getByText("essays").click();

    // Should show only essay-tagged posts
    await expect(page.getByText("Programming with OCD")).toBeVisible();
  });

  test("similarity score badges appear after semantic search", async ({
    page,
  }) => {
    await switchToSemanticAndWait(page);

    const searchInput = page.getByPlaceholder(/search by meaning/i);
    await searchInput.fill("container orchestration");
    await searchInput.press("Enter");

    // Wait for results, then verify score badges are shown
    await expect(page.getByText(/\d+% match/).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("clear filters removes semantic results and scores", async ({
    page,
  }) => {
    await switchToSemanticAndWait(page);

    const searchInput = page.getByPlaceholder(/search by meaning/i);
    await searchInput.fill("container orchestration");
    await searchInput.press("Enter");

    // Wait for results
    await expect(page.getByText(/\d+% match/).first()).toBeVisible({
      timeout: 10000,
    });

    // Clear filters
    await page.getByText("Clear filters").first().click();

    // Search input should be empty, all posts visible, no score badges
    await expect(searchInput).toHaveValue("");
    await expect(page.getByText("Hello Again")).toBeVisible();
    await expect(page.getByText(/\d+% match/)).not.toBeVisible();
  });

  test("switching back to keyword mode restores keyword search", async ({
    page,
  }) => {
    await switchToSemanticAndWait(page);

    // Switch back to keyword
    await page.getByRole("radio", { name: /keyword/i }).click();

    const searchInput = page.getByPlaceholder("Search posts...");
    await searchInput.fill("Kubernetes");

    await expect(page.getByText("k8s: Meet our Contributors")).toBeVisible();
    await expect(
      page.getByText("Predictive Auto-scaling in Kubernetes")
    ).toBeVisible();
    await expect(page.getByText("Hello Again")).not.toBeVisible();
  });
});
