import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/markdown";
import PageLayout from "@/components/PageLayout";

export const metadata: Metadata = {
  title: "Blog | mattjmcnaughton",
  description: "Thoughts and writings from mattjmcnaughton",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl">
        <div className="section-label">Writing</div>
        <h1
          className="mb-10 text-4xl font-bold font-heading"
          style={{ color: "var(--text-primary)" }}
        >
          Blog
        </h1>

        <div className="space-y-4">
          {posts.map((post) => (
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

        {posts.length === 0 && (
          <p className="text-center" style={{ color: "var(--text-tertiary)" }}>
            No posts yet. Check back soon!
          </p>
        )}
      </div>
    </PageLayout>
  );
}
