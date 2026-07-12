import type { Metadata } from "next";
import Link from "next/link";
import { getProjectsContent } from "@/lib/markdown";
import PageLayout from "@/components/PageLayout";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getProjectsContent();
  return {
    title: `${meta.title} | mattjmcnaughton`,
    description: meta.description,
  };
}

const featuredProject = {
  name: "Habagou",
  status: "Just shipped",
  description:
    "A focused practice space for learning to write Chinese characters—one stroke, match, and sentence at a time.",
  href: "https://github.com/mattjmcnaughton/habagou",
  liveHref: "https://habagou.mattjmcnaughton.com",
  glyph: "写",
  accent: "var(--accent-purple)",
};

const projects = [
  {
    name: "fetch-context",
    status: "Agent tooling",
    description:
      "A small CLI for pulling source repositories and clean web pages into an agent's working directory.",
    href: "https://github.com/mattjmcnaughton/fetch-context",
  },
  {
    name: "skillvendor",
    status: "Agent tooling",
    description:
      "A Go binary that vendors remote Claude Code and Codex skills reproducibly, pinned to commits.",
    href: "https://github.com/mattjmcnaughton/skillvendor",
  },
  {
    name: "Pug-claw",
    status: "Homelab experiment",
    description:
      "A self-hosted, multi-driver AI agent bot framework for bringing tailored agents to Discord and the terminal.",
    href: "https://github.com/mattjmcnaughton/pug-claw",
  },
  {
    name: "skills",
    status: "Agent tooling",
    description:
      "A collection of practical, reusable skills for Claude Code and Codex workflows.",
    href: "https://github.com/mattjmcnaughton/skills",
  },
];

export default async function ProjectsPage() {
  const { content } = await getProjectsContent();

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl animate-fade-in-up">
        <div className="mb-12 max-w-2xl">
          <div className="section-label">Selected work</div>
          <h1
            className="mb-5 text-4xl font-bold font-heading sm:text-5xl"
            style={{ color: "var(--text-primary)" }}
          >
            Projects
          </h1>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        <section aria-label="Featured project" className="mb-6">
          <Link
            href={featuredProject.liveHref}
            target="_blank"
            rel="noopener noreferrer"
            className="project-featured group block overflow-hidden rounded-3xl p-1 transition-transform hover:-translate-y-1"
          >
            <div className="project-featured-inner grid gap-8 rounded-[calc(1.5rem-1px)] p-7 sm:grid-cols-[1fr_auto] sm:items-end sm:p-10">
              <div className="max-w-xl">
                <span className="project-status">{featuredProject.status}</span>
                <h2
                  className="mt-5 text-3xl font-bold font-heading sm:text-4xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  {featuredProject.name} <span lang="zh-Hans">哈巴狗</span>
                </h2>
                <p
                  className="mt-4 text-lg leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {featuredProject.description}
                </p>
                <span className="project-link mt-7">Try Habagou ↗</span>
              </div>
              <div
                aria-hidden="true"
                className="project-glyph select-none font-heading"
                style={{ color: featuredProject.accent }}
              >
                {featuredProject.glyph}
              </div>
            </div>
          </Link>
          <Link
            href={featuredProject.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--text-tertiary)" }}
          >
            Browse the source on GitHub ↗
          </Link>
        </section>

        <section
          aria-label="More projects"
          className="grid gap-5 md:grid-cols-3"
        >
          {projects.map((project) => (
            <Link
              key={project.name}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card project-card group flex min-h-60 flex-col p-6"
            >
              <span className="project-status">{project.status}</span>
              <h2
                className="mt-5 text-xl font-semibold font-heading"
                style={{ color: "var(--text-primary)" }}
              >
                {project.name}
              </h2>
              <p
                className="mt-3 leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {project.description}
              </p>
              <span className="project-link mt-auto pt-6">View project ↗</span>
            </Link>
          ))}
        </section>
      </div>
    </PageLayout>
  );
}
