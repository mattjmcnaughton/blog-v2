import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/markdown";
import PageLayout from "@/components/PageLayout";
import { ArrowLeftIcon } from "@/components/icons";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { meta } = await getPostBySlug(slug);
    return {
      title: `${meta.title} | mattjmcnaughton`,
      description: meta.description,
    };
  } catch {
    return {
      title: "Post Not Found | mattjmcnaughton",
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await getPostBySlug(slug).catch(() => null);

  if (!post) {
    notFound();
  }

  const { meta, content } = post;

  return (
    <PageLayout>
      <article className="mx-auto max-w-3xl animate-fade-in-up">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to all posts
        </Link>

        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
            {meta.title}
          </h1>
          <time className="text-gray-500 dark:text-gray-400">
            {new Date(meta.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {meta.tags && meta.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </PageLayout>
  );
}
