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
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-gray-100">
          Blog
        </h1>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <Link href={`/blog/${post.slug}`}>
                <h2 className="mb-2 text-2xl font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
                  {post.title}
                </h2>
                <time className="mb-3 block text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <p className="text-gray-600 dark:text-gray-300">
                  {post.description}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No posts yet. Check back soon!
          </p>
        )}
      </div>
    </PageLayout>
  );
}
