import { test, expect } from "@playwright/test";

test.describe("Blog Search and Tag Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: /blog/i })).toBeVisible();
  });

  test("search input is visible on the blog page", async ({ page }) => {
    await expect(page.getByPlaceholderText("Search posts...")).toBeVisible();
  });

  test("tag filter dropdown is visible", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /filter by tags/i })
    ).toBeVisible();
  });

  test("opening dropdown shows all tags", async ({ page }) => {
    await page.getByRole("button", { name: /filter by tags/i }).click();

    const listbox = page.getByRole("listbox", { name: /available tags/i });
    await expect(listbox).toBeVisible();
    await expect(listbox.getByText("essays")).toBeVisible();
    await expect(listbox.getByText("kubernetes")).toBeVisible();
    await expect(listbox.getByText("announcements")).toBeVisible();
  });

  test("typeahead filters tags in dropdown", async ({ page }) => {
    await page.getByRole("button", { name: /filter by tags/i }).click();

    await page.getByPlaceholderText("Search tags...").fill("kub");

    const listbox = page.getByRole("listbox", { name: /available tags/i });
    await expect(listbox.getByText("kubernetes")).toBeVisible();
    await expect(listbox.getByText("essays")).not.toBeVisible();
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

  test("selecting a tag filters posts", async ({ page }) => {
    await page.getByRole("button", { name: /filter by tags/i }).click();

    const listbox = page.getByRole("listbox", { name: /available tags/i });
    await listbox.getByText("announcements").click();

    await expect(page.getByText("Hello Again")).toBeVisible();
    await expect(page.getByText("Stepping Back")).toBeVisible();
    await expect(page.getByText("Programming with OCD")).not.toBeVisible();
  });

  test("selected tag appears as pill in dropdown trigger", async ({ page }) => {
    await page.getByRole("button", { name: /filter by tags/i }).click();

    const listbox = page.getByRole("listbox", { name: /available tags/i });
    await listbox.getByText("essays").click();

    const trigger = page.getByRole("button", { name: /filter by tags/i });
    await expect(trigger.getByText("essays")).toBeVisible();
  });

  test("deselecting a tag in the dropdown restores posts", async ({ page }) => {
    await page.getByRole("button", { name: /filter by tags/i }).click();

    const listbox = page.getByRole("listbox", { name: /available tags/i });
    await listbox.getByText("announcements").click();
    await expect(page.getByText("Programming with OCD")).not.toBeVisible();

    await listbox.getByText("announcements").click();
    await expect(page.getByText("Programming with OCD")).toBeVisible();
  });

  test("combining search and tag filters narrows results", async ({ page }) => {
    const searchInput = page.getByPlaceholderText("Search posts...");

    await page.getByRole("button", { name: /filter by tags/i }).click();
    const listbox = page.getByRole("listbox", { name: /available tags/i });
    await listbox.getByText("kubernetes").click();

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

    await page.getByRole("button", { name: /filter by tags/i }).click();
    const listbox = page.getByRole("listbox", { name: /available tags/i });
    await listbox.getByText("essays").click();

    await searchInput.fill("open source");

    await expect(page.getByText("Clear filters").first()).toBeVisible();
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

  test("dropdown closes when clicking outside", async ({ page }) => {
    await page.getByRole("button", { name: /filter by tags/i }).click();
    await expect(
      page.getByRole("listbox", { name: /available tags/i })
    ).toBeVisible();

    // Click on the page heading (outside the dropdown)
    await page.getByRole("heading", { name: /blog/i }).click();

    await expect(
      page.getByRole("listbox", { name: /available tags/i })
    ).not.toBeVisible();
  });
});
