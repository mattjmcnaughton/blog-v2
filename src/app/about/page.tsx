import type { Metadata } from "next";
import { getAboutContent } from "@/lib/markdown";
import PageLayout from "@/components/PageLayout";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getAboutContent();
  return {
    title: `${meta.title} | mattjmcnaughton`,
    description: meta.description,
  };
}

export default async function AboutPage() {
  const { content } = await getAboutContent();

  return (
    <PageLayout>
      <article className="mx-auto max-w-3xl animate-fade-in-up">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-gray-100">
          About
        </h1>
        <div
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </PageLayout>
  );
}
