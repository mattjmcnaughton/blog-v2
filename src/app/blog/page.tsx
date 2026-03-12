import type { Metadata } from "next";
import { getAllPosts } from "@/lib/markdown";
import PageLayout from "@/components/PageLayout";
import BlogSearch from "@/components/BlogSearch";

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

        <BlogSearch posts={posts} />
      </div>
    </PageLayout>
  );
}
