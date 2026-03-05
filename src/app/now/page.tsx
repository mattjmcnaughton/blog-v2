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
        <div className="section-label">Now</div>
        <h1
          className="mb-4 text-4xl font-bold font-heading"
          style={{ color: "var(--text-primary)" }}
        >
          Now
        </h1>
        {meta.lastUpdated && (
          <p className="mb-8 text-sm" style={{ color: "var(--text-tertiary)" }}>
            Last updated:{" "}
            {new Date(meta.lastUpdated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </PageLayout>
  );
}
