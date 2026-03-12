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

async function openTagDropdown(
  user: ReturnType<typeof userEvent.setup>,
  view: ReturnType<typeof within>
) {
  await user.click(view.getByRole("button", { name: /filter by tags/i }));
}

async function selectTag(
  user: ReturnType<typeof userEvent.setup>,
  view: ReturnType<typeof within>,
  tagName: string
) {
  const listbox = view.getByRole("listbox", { name: /available tags/i });
  await user.click(within(listbox).getByText(tagName));
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

  it("renders tag filter dropdown button", () => {
    const { view } = renderBlogSearch();
    expect(
      view.getByRole("button", { name: /filter by tags/i })
    ).toBeInTheDocument();
  });

  it("opens dropdown and shows all tags", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    await openTagDropdown(user, view);

    const listbox = view.getByRole("listbox", { name: /available tags/i });
    expect(within(listbox).getByText("announcements")).toBeInTheDocument();
    expect(within(listbox).getByText("essays")).toBeInTheDocument();
    expect(within(listbox).getByText("infrastructure")).toBeInTheDocument();
    expect(within(listbox).getByText("kubernetes")).toBeInTheDocument();
    expect(within(listbox).getByText("mental-health")).toBeInTheDocument();
  });

  it("filters tags with typeahead in dropdown", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    await openTagDropdown(user, view);

    const tagSearchInput = view.getByPlaceholderText("Search tags...");
    await user.type(tagSearchInput, "kub");

    const listbox = view.getByRole("listbox", { name: /available tags/i });
    expect(within(listbox).getByText("kubernetes")).toBeInTheDocument();
    expect(within(listbox).queryByText("essays")).not.toBeInTheDocument();
  });

  it("shows 'No matching tags' when tag search has no results", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    await openTagDropdown(user, view);
    await user.type(view.getByPlaceholderText("Search tags..."), "zzzzz");

    expect(view.getByText("No matching tags")).toBeInTheDocument();
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

  it("filters posts by selecting a tag", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    await openTagDropdown(user, view);
    await selectTag(user, view, "essays");

    expect(view.getByText("Programming with OCD")).toBeInTheDocument();
    expect(
      view.queryByText("Getting Started with Kubernetes")
    ).not.toBeInTheDocument();
    expect(view.queryByText("Hello Again")).not.toBeInTheDocument();
  });

  it("supports deselecting tags", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    await openTagDropdown(user, view);
    await selectTag(user, view, "essays");
    expect(view.queryByText("Hello Again")).not.toBeInTheDocument();

    // Click again to deselect
    await selectTag(user, view, "essays");
    expect(view.getByText("Hello Again")).toBeInTheDocument();
  });

  it("shows selected tags as pills in the dropdown trigger", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    await openTagDropdown(user, view);
    await selectTag(user, view, "essays");

    // The trigger button should show the selected tag
    const triggerButton = view.getByRole("button", {
      name: /filter by tags/i,
    });
    expect(within(triggerButton).getByText("essays")).toBeInTheDocument();
  });

  it("can remove a selected tag via the X button on the pill", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    await openTagDropdown(user, view);
    await selectTag(user, view, "essays");
    expect(view.queryByText("Hello Again")).not.toBeInTheDocument();

    // Click the remove button on the pill
    const removeButton = view.getByRole("button", {
      name: /remove essays filter/i,
    });
    await user.click(removeButton);

    expect(view.getByText("Hello Again")).toBeInTheDocument();
  });

  it("combines search and tag filters", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    await user.type(view.getByPlaceholderText("Search posts..."), "guide");
    await openTagDropdown(user, view);
    await selectTag(user, view, "kubernetes");

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

  it("sets aria-selected on selected tag options", async () => {
    const user = userEvent.setup();
    const { view } = renderBlogSearch();

    await openTagDropdown(user, view);

    const listbox = view.getByRole("listbox", { name: /available tags/i });
    const essaysOption = within(listbox).getByText("essays").closest("li")!;

    expect(essaysOption).toHaveAttribute("aria-selected", "false");
    await user.click(essaysOption);
    expect(essaysOption).toHaveAttribute("aria-selected", "true");
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
