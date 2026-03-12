import { describe, it, expect } from "vitest";
import type { BlogPostMeta } from "@/lib/markdown";
import { comparePosts } from "@/lib/markdown";

function post(overrides: Partial<BlogPostMeta>): BlogPostMeta {
  return {
    title: "Test",
    date: "2024-01-01",
    description: "desc",
    slug: "test",
    ...overrides,
  };
}

describe("comparePosts", () => {
  it("sorts newer posts before older posts", () => {
    const posts = [
      post({ slug: "old", date: "2024-01-01" }),
      post({ slug: "new", date: "2024-06-01" }),
    ];
    posts.sort(comparePosts);
    expect(posts.map((p) => p.slug)).toEqual(["new", "old"]);
  });

  it("sorts by time within the same day", () => {
    const posts = [
      post({ slug: "morning", date: "2026-03-12T10:00:00" }),
      post({ slug: "afternoon", date: "2026-03-12T14:00:00" }),
    ];
    posts.sort(comparePosts);
    expect(posts.map((p) => p.slug)).toEqual(["afternoon", "morning"]);
  });

  it("sorts datetime posts before date-only posts on the same day", () => {
    const posts = [
      post({ slug: "date-only", date: "2026-03-12" }),
      post({ slug: "with-time", date: "2026-03-12T08:00:00" }),
    ];
    posts.sort(comparePosts);
    expect(posts.map((p) => p.slug)).toEqual(["with-time", "date-only"]);
  });

  it("returns 0 for identical dates", () => {
    const a = post({ date: "2024-01-01" });
    const b = post({ date: "2024-01-01" });
    expect(comparePosts(a, b)).toBe(0);
  });
});
