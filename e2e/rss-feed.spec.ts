import { test, expect } from "@playwright/test";

test.describe("RSS Feed", () => {
  test("returns valid RSS XML", async ({ request }) => {
    const response = await request.get("/feed");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/rss+xml");

    const body = await response.text();
    expect(body).toContain("<?xml");
    expect(body).toContain('<rss version="2.0"');
    expect(body).toContain("<channel>");
    expect(body).toContain("<item>");
  });
});
