import { test, expect } from "@playwright/test";

test.describe("Blog Search and Tag Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: /blog/i })).toBeVisible();
  });

  test("search input is visible on the blog page", async ({ page }) => {
    await expect(page.getByPlaceholderText("Search posts...")).toBeVisible();
  });

  test("tag filter buttons are visible", async ({ page }) => {
    const tagGroup = page.getByRole("group", { name: /filter by tags/i });
    await expect(tagGroup).toBeVisible();
    await expect(tagGroup.getByText("essays")).toBeVisible();
    await expect(tagGroup.getByText("kubernetes")).toBeVisible();
    await expect(tagGroup.getByText("announcements")).toBeVisible();
  });

  test("typeahead search filters posts as user types", async ({ page }) => {
    const searchInput = page.getByPlaceholderText("Search posts...");

    await searchInput.fill("Kubernetes");

    await expect(page.getByText("k8s: Meet our Contributors")).toBeVisible();
    await expect(
      page.getByText("Predictive Auto-scaling in Kubernetes")
    ).toBeVisible();
    await expect(page.getByText("Hello Again")).not.toBeVisible();
    await expect(page.getByText("Programming with OCD")).not.toBeVisible();
  });

  test("search filters by description", async ({ page }) => {
    const searchInput = page.getByPlaceholderText("Search posts...");

    await searchInput.fill("mental health");

    await expect(page.getByText("Programming with OCD")).toBeVisible();
    await expect(page.getByText("Hello Again")).not.toBeVisible();
  });

  test("clicking a tag filters posts", async ({ page }) => {
    const tagGroup = page.getByRole("group", { name: /filter by tags/i });

    await tagGroup.getByText("announcements").click();

    await expect(page.getByText("Hello Again")).toBeVisible();
    await expect(page.getByText("Stepping Back")).toBeVisible();
    await expect(page.getByText("Programming with OCD")).not.toBeVisible();
  });

  test("active tag has aria-pressed attribute", async ({ page }) => {
    const tagGroup = page.getByRole("group", { name: /filter by tags/i });
    const essaysButton = tagGroup.getByText("essays");

    await expect(essaysButton).toHaveAttribute("aria-pressed", "false");
    await essaysButton.click();
    await expect(essaysButton).toHaveAttribute("aria-pressed", "true");
  });

  test("toggling a tag off restores all posts", async ({ page }) => {
    const tagGroup = page.getByRole("group", { name: /filter by tags/i });
    const announcementsButton = tagGroup.getByText("announcements");

    await announcementsButton.click();
    await expect(page.getByText("Programming with OCD")).not.toBeVisible();

    await announcementsButton.click();
    await expect(page.getByText("Programming with OCD")).toBeVisible();
  });

  test("combining search and tag filters narrows results", async ({ page }) => {
    const searchInput = page.getByPlaceholderText("Search posts...");
    const tagGroup = page.getByRole("group", { name: /filter by tags/i });

    await tagGroup.getByText("kubernetes").click();
    await searchInput.fill("Meet");

    await expect(page.getByText("k8s: Meet our Contributors")).toBeVisible();
    await expect(page.getByText("Predictive Auto-scaling")).not.toBeVisible();
  });

  test("shows no-match message when filters exclude everything", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholderText("Search posts...");

    await searchInput.fill("zzzznonexistentquery");

    await expect(page.getByText(/no posts match your filters/i)).toBeVisible();
  });

  test("clear filters button resets search and tags", async ({ page }) => {
    const searchInput = page.getByPlaceholderText("Search posts...");
    const tagGroup = page.getByRole("group", { name: /filter by tags/i });

    await tagGroup.getByText("essays").click();
    await searchInput.fill("open source");

    await expect(page.getByText("Clear filters")).toBeVisible();
    await page.getByText("Clear filters").first().click();

    await expect(searchInput).toHaveValue("");
    await expect(page.getByText("Hello Again")).toBeVisible();
    await expect(page.getByText("Programming with OCD")).toBeVisible();
  });

  test("filtered posts still link to correct blog post", async ({ page }) => {
    const searchInput = page.getByPlaceholderText("Search posts...");

    await searchInput.fill("Hello Again");

    const postLink = page.locator("a[href='/blog/hello-again']");
    await expect(postLink).toBeVisible();

    await postLink.click();
    await expect(page).toHaveURL("/blog/hello-again");
  });
});
