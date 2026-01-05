import type { Metadata } from "next";
import { getNowContent } from "@/lib/markdown";
import PageLayout from "@/components/PageLayout";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getNowContent();
  return {
    title: `${meta.title} | mattjmcnaughton`,
    description: meta.description,
  };
}

export default async function NowPage() {
  const { meta, content } = await getNowContent();

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl animate-fade-in-up">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
          Now
        </h1>
        {meta.lastUpdated && (
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            Last updated:{" "}
            {new Date(meta.lastUpdated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        <div
          className="prose prose-lg max-w-none dark:prose-invert prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </PageLayout>
  );
}
