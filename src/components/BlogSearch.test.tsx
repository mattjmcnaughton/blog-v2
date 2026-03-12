import { describe, it, expect, vi } from "vitest";
import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BlogSearch from "@/components/BlogSearch";
import type { BlogPostMeta } from "@/lib/markdown";

// Mock next/link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

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
    title: "Hello Again",
    date: "2025-03-05",
    description: "Introducing the new blog",
    slug: "hello-again",
    tags: ["announcements"],
  },
];

function renderBlogSearch(posts: BlogPostMeta[] = mockPosts) {
  const result = render(<BlogSearch posts={posts} />);
  const view = within(result.container);
  return { ...result, view };
}

describe("BlogSearch", () => {
  it("renders all posts initially", () => {
    const { view } = renderBlogSearch();

    expect(
      view.getByText("Getting Started with Kubernetes")
    ).toBeInTheDocument();
    expect(view.getByText("Programming with OCD")).toBeInTheDocument();
    expect(view.getByText("Hello Again")).toBeInTheDocument();
  });

  it("renders the search input", () => {
    const { view } = renderBlogSearch();
    expect(view.getByPlaceholderText("Search posts...")).toBeInTheDocument();
  });

  it("renders all unique tag filter buttons", () => {
    const { view } = renderBlogSearch();

    const tagGroup = view.getByRole("group", { name: /filter by tags/i });
    expect(within(tagGroup).getByText("announcements")).toBeInTheDocument();
    expect(within(tagGroup).getByText("essays")).toBeInTheDocument();
    expect(within(tagGroup).getByText("infrastructure")).toBeInTheDocument();
    expect(within(tagGroup).getByText("kubernetes")).toBeInTheDocument();
    expect(within(tagGroup).getByText("mental-health")).toBeInTheDocument();
  });

  it("filters posts by search query (typeahead)", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    await user.type(view.getByPlaceholderText("Search posts..."), "kubernetes");

    expect(
      view.getByText("Getting Started with Kubernetes")
    ).toBeInTheDocument();
    expect(view.queryByText("Programming with OCD")).not.toBeInTheDocument();
    expect(view.queryByText("Hello Again")).not.toBeInTheDocument();
  });

  it("filters posts by clicking a tag", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    const tagGroup = view.getByRole("group", { name: /filter by tags/i });
    await user.click(within(tagGroup).getByText("essays"));

    expect(view.getByText("Programming with OCD")).toBeInTheDocument();
    expect(
      view.queryByText("Getting Started with Kubernetes")
    ).not.toBeInTheDocument();
    expect(view.queryByText("Hello Again")).not.toBeInTheDocument();
  });

  it("supports toggling tags off", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    const tagGroup = view.getByRole("group", { name: /filter by tags/i });
    const essaysButton = within(tagGroup).getByText("essays");

    await user.click(essaysButton);
    expect(view.queryByText("Hello Again")).not.toBeInTheDocument();

    await user.click(essaysButton);
    expect(view.getByText("Hello Again")).toBeInTheDocument();
  });

  it("combines search and tag filters", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    await user.type(view.getByPlaceholderText("Search posts..."), "guide");
    const tagGroup = view.getByRole("group", { name: /filter by tags/i });
    await user.click(within(tagGroup).getByText("kubernetes"));

    expect(
      view.getByText("Getting Started with Kubernetes")
    ).toBeInTheDocument();
    expect(view.queryByText("Programming with OCD")).not.toBeInTheDocument();
  });

  it("shows 'no posts match' message when filters exclude all posts", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    await user.type(
      view.getByPlaceholderText("Search posts..."),
      "zzzznonexistent"
    );

    expect(view.getByText(/no posts match your filters/i)).toBeInTheDocument();
  });

  it("shows clear filters button when filters are active", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    expect(view.queryByText("Clear filters")).not.toBeInTheDocument();

    await user.type(view.getByPlaceholderText("Search posts..."), "hello");

    expect(view.getByText("Clear filters")).toBeInTheDocument();
  });

  it("clears all filters when clear button is clicked", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    const searchInput = view.getByPlaceholderText("Search posts...");
    await user.type(searchInput, "kubernetes");

    expect(view.queryByText("Hello Again")).not.toBeInTheDocument();

    await user.click(view.getByText("Clear filters"));

    expect(view.getByText("Hello Again")).toBeInTheDocument();
    expect(searchInput).toHaveValue("");
  });

  it("sets aria-pressed on active tag buttons", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    const tagGroup = view.getByRole("group", { name: /filter by tags/i });
    const essaysButton = within(tagGroup).getByText("essays");

    expect(essaysButton).toHaveAttribute("aria-pressed", "false");
    await user.click(essaysButton);
    expect(essaysButton).toHaveAttribute("aria-pressed", "true");
  });

  it("renders post links with correct hrefs", () => {
    const { view } = renderBlogSearch();

    const link = view.getByText("Getting Started with Kubernetes").closest("a");
    expect(link).toHaveAttribute("href", "/blog/getting-started-kubernetes");
  });

  it("renders empty state when no posts provided", () => {
    const { view } = renderBlogSearch([]);

    expect(view.getByText(/no posts yet/i)).toBeInTheDocument();
  });
});
