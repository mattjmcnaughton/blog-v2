import { describe, it, expect } from "vitest";
import type { BlogPostMeta } from "@/lib/markdown";
import {
  filterPostsBySearch,
  filterPostsByTags,
  filterPosts,
  getAllTags,
} from "@/lib/blog-filter";

const mockPosts: BlogPostMeta[] = [
  {
    title: "Getting Started with Kubernetes",
    date: "2024-01-15",
    description: "A beginner guide to container orchestration",
    slug: "getting-started-kubernetes",
    tags: ["kubernetes", "infrastructure"],
  },
  {
    title: "Programming with OCD",
    date: "2023-06-01",
    description: "A personal reflection on mental health and coding",
    slug: "programming-with-ocd",
    tags: ["essays", "mental-health"],
    featured: true,
  },
  {
    title: "Migrating to Fly.io",
    date: "2024-10-20",
    description: "Moving infrastructure from one cloud to another",
    slug: "migrating-to-fly-io",
    tags: ["projects", "infrastructure"],
  },
  {
    title: "Hello Again",
    date: "2025-03-05",
    description: "Introducing the new blog",
    slug: "hello-again",
    tags: ["announcements"],
  },
  {
    title: "Post Without Tags",
    date: "2022-01-01",
    description: "This post has no tags",
    slug: "no-tags",
  },
];

describe("filterPostsBySearch", () => {
  it("returns all posts when query is empty", () => {
    expect(filterPostsBySearch(mockPosts, "")).toEqual(mockPosts);
    expect(filterPostsBySearch(mockPosts, "  ")).toEqual(mockPosts);
  });

  it("filters by title match", () => {
    const results = filterPostsBySearch(mockPosts, "kubernetes");
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("getting-started-kubernetes");
  });

  it("filters by description match", () => {
    const results = filterPostsBySearch(mockPosts, "mental health");
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("programming-with-ocd");
  });

  it("is case insensitive", () => {
    const results = filterPostsBySearch(mockPosts, "KUBERNETES");
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("getting-started-kubernetes");
  });

  it("matches partial words in title, description, and tags", () => {
    const results = filterPostsBySearch(mockPosts, "infra");
    expect(results).toHaveLength(2);
    expect(results.map((p) => p.slug)).toEqual([
      "getting-started-kubernetes",
      "migrating-to-fly-io",
    ]);
  });

  it("can match multiple posts", () => {
    const results = filterPostsBySearch(mockPosts, "blog");
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("hello-again");
  });

  it("returns empty array when no match", () => {
    const results = filterPostsBySearch(mockPosts, "nonexistent");
    expect(results).toHaveLength(0);
  });
});

describe("filterPostsByTags", () => {
  it("returns all posts when no tags selected", () => {
    expect(filterPostsByTags(mockPosts, [])).toEqual(mockPosts);
  });

  it("filters posts by a single tag", () => {
    const results = filterPostsByTags(mockPosts, ["infrastructure"]);
    expect(results).toHaveLength(2);
    expect(results.map((p) => p.slug)).toEqual([
      "getting-started-kubernetes",
      "migrating-to-fly-io",
    ]);
  });

  it("filters posts by multiple tags (AND logic)", () => {
    const results = filterPostsByTags(mockPosts, [
      "infrastructure",
      "kubernetes",
    ]);
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("getting-started-kubernetes");
  });

  it("excludes posts without tags", () => {
    const results = filterPostsByTags(mockPosts, ["announcements"]);
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("hello-again");
  });

  it("returns empty when no posts match all tags", () => {
    const results = filterPostsByTags(mockPosts, ["essays", "infrastructure"]);
    expect(results).toHaveLength(0);
  });
});

describe("filterPosts", () => {
  it("combines search and tag filtering", () => {
    const results = filterPosts(mockPosts, "cloud", ["infrastructure"]);
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("migrating-to-fly-io");
  });

  it("returns all posts when both filters are empty", () => {
    expect(filterPosts(mockPosts, "", [])).toEqual(mockPosts);
  });
});

describe("getAllTags", () => {
  it("extracts all unique tags sorted alphabetically", () => {
    const tags = getAllTags(mockPosts);
    expect(tags).toEqual([
      "announcements",
      "essays",
      "infrastructure",
      "kubernetes",
      "mental-health",
      "projects",
    ]);
  });

  it("returns empty array when no posts have tags", () => {
    const posts: BlogPostMeta[] = [
      {
        title: "No Tags",
        date: "2024-01-01",
        description: "No tags here",
        slug: "no-tags",
      },
    ];
    expect(getAllTags(posts)).toEqual([]);
  });

  it("returns empty array for empty posts array", () => {
    expect(getAllTags([])).toEqual([]);
  });
});
