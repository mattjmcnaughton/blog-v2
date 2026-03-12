"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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

function ChevronDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TagMultiSelect({
  allTags,
  selectedTags,
  onToggleTag,
}: {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTags = useMemo(() => {
    const query = tagSearch.toLowerCase().trim();
    if (!query) return allTags;
    return allTags.filter((tag) => tag.toLowerCase().includes(query));
  }, [allTags, tagSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setTagSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 0);
          } else {
            setTagSearch("");
          }
        }}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg py-2.5 pl-3 pr-3 text-sm outline-none transition-colors"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          color:
            selectedTags.length > 0
              ? "var(--text-primary)"
              : "var(--text-tertiary)",
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Filter by tags"
      >
        <span className="flex flex-1 flex-wrap items-center gap-1.5">
          {selectedTags.length === 0 && (
            <span className="py-0.5">Filter by tags...</span>
          )}
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="tag-pill flex items-center gap-1"
              style={{
                background: "var(--accent-purple)",
                color: "var(--bg-primary)",
                borderColor: "var(--accent-purple)",
              }}
            >
              {tag}
              <span
                role="button"
                aria-label={`Remove ${tag} filter`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTag(tag);
                }}
                className="cursor-pointer opacity-70 hover:opacity-100"
              >
                <XIcon />
              </span>
            </span>
          ))}
        </span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg shadow-lg"
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-card)",
          }}
        >
          <div
            className="p-2"
            style={{ borderBottom: "1px solid var(--border-card)" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Search tags..."
              aria-label="Search tags"
              className="w-full rounded px-2 py-1.5 text-sm outline-none"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <ul
            role="listbox"
            aria-multiselectable="true"
            aria-label="Available tags"
            className="max-h-48 overflow-y-auto py-1"
          >
            {filteredTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <li
                  key={tag}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onToggleTag(tag)}
                  className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm transition-colors"
                  style={{ color: "var(--text-primary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-card)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span
                    className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded"
                    style={{
                      border: isSelected
                        ? "none"
                        : "1px solid var(--border-card-hover)",
                      background: isSelected
                        ? "var(--accent-purple)"
                        : "transparent",
                      color: isSelected ? "var(--bg-primary)" : "transparent",
                    }}
                  >
                    {isSelected && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  {tag}
                </li>
              );
            })}
            {filteredTags.length === 0 && (
              <li
                className="px-3 py-2 text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                No matching tags
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
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
        {allTags.length > 0 && (
          <div className="sm:w-64">
            <TagMultiSelect
              allTags={allTags}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
            />
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="mb-6">
          <button
            onClick={clearFilters}
            className="cursor-pointer text-xs underline"
            style={{ color: "var(--text-tertiary)" }}
          >
            Clear filters
          </button>
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
