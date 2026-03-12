"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { BlogPostMeta } from "@/lib/markdown";
import { filterPosts, getAllTags } from "@/lib/blog-filter";

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function BlogSearch({ posts }: { posts: BlogPostMeta[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => getAllTags(posts), [posts]);
  const filteredPosts = useMemo(
    () => filterPosts(posts, searchQuery, selectedTags),
    [posts, searchQuery, selectedTags]
  );

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedTags([]);
  }

  const hasActiveFilters = searchQuery.trim() !== "" || selectedTags.length > 0;

  return (
    <>
      <div className="mb-6">
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-tertiary)" }}
          >
            <SearchIcon />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            aria-label="Search blog posts"
            className="w-full rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-card)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div
          className="mb-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by tags"
        >
          {allTags.map((tag) => {
            const isActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                aria-pressed={isActive}
                className="tag-pill cursor-pointer transition-opacity"
                style={
                  isActive
                    ? {
                        background: "var(--accent-purple)",
                        color: "var(--bg-primary)",
                        borderColor: "var(--accent-purple)",
                      }
                    : undefined
                }
              >
                {tag}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="cursor-pointer text-xs underline"
              style={{ color: "var(--text-tertiary)" }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="gradient-border-card group block transition-transform hover:-translate-y-0.5"
          >
            <div className="gradient-border-card-inner flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2
                  className="mb-1 text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {post.title}
                </h2>
                <time
                  className="mb-2 block text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <p
                  className="text-sm line-clamp-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {post.description}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span
                className="flex-shrink-0 transition-transform group-hover:translate-x-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && hasActiveFilters && (
        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          No posts match your filters.{" "}
          <button
            onClick={clearFilters}
            className="cursor-pointer underline"
            style={{ color: "var(--accent-purple)" }}
          >
            Clear filters
          </button>
        </p>
      )}

      {filteredPosts.length === 0 && !hasActiveFilters && (
        <p className="text-center" style={{ color: "var(--text-tertiary)" }}>
          No posts yet. Check back soon!
        </p>
      )}
    </>
  );
}
