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
          className="gradient-text mb-8 inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to all posts
        </Link>

        <header className="mb-10">
          <h1
            className="mb-4 text-4xl font-bold font-heading"
            style={{ color: "var(--text-primary)" }}
          >
            {meta.title}
          </h1>
          {meta.description && (
            <p
              className="mb-4 text-lg leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {meta.description}
            </p>
          )}
          <time style={{ color: "var(--text-tertiary)" }}>
            {new Date(meta.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {meta.tags && meta.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {meta.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </PageLayout>
  );
}
