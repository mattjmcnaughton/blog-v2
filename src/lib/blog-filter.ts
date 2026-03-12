import type { BlogPostMeta } from "@/lib/markdown";

export function filterPostsBySearch(
  posts: BlogPostMeta[],
  query: string
): BlogPostMeta[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return posts;

  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.description.toLowerCase().includes(normalizedQuery) ||
      (post.tags &&
        post.tags.some((tag) =>
          tag.toLowerCase().replace(/-/g, " ").includes(normalizedQuery)
        ))
  );
}

export function filterPostsByTags(
  posts: BlogPostMeta[],
  selectedTags: string[]
): BlogPostMeta[] {
  if (selectedTags.length === 0) return posts;

  return posts.filter(
    (post) => post.tags && selectedTags.every((tag) => post.tags!.includes(tag))
  );
}

export function filterPosts(
  posts: BlogPostMeta[],
  query: string,
  selectedTags: string[]
): BlogPostMeta[] {
  return filterPostsByTags(filterPostsBySearch(posts, query), selectedTags);
}

export function rankPostsBySemantic(
  posts: BlogPostMeta[],
  scores: { slug: string; score: number }[]
): BlogPostMeta[] {
  const scoreMap = new Map(scores.map((s) => [s.slug, s.score]));
  return posts
    .filter((post) => scoreMap.has(post.slug))
    .sort((a, b) => (scoreMap.get(b.slug) || 0) - (scoreMap.get(a.slug) || 0));
}

export function filterPostsSemantic(
  posts: BlogPostMeta[],
  scores: { slug: string; score: number }[],
  selectedTags: string[]
): BlogPostMeta[] {
  const ranked = rankPostsBySemantic(posts, scores);
  return filterPostsByTags(ranked, selectedTags);
}

export function getAllTags(posts: BlogPostMeta[]): string[] {
  const tagSet = new Set<string>();
  for (const post of posts) {
    if (post.tags) {
      for (const tag of post.tags) {
        tagSet.add(tag);
      }
    }
  }
  return Array.from(tagSet).sort();
}
