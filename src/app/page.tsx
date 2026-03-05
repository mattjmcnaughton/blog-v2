import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GradientOrbs from "@/components/GradientOrbs";
import { GitHubIcon, LinkedInIcon, EmailIcon } from "@/components/icons";
import { Typewriter, TypewriterSegment } from "@/components/Typewriter";
import { getFeaturedPosts } from "@/lib/markdown";

export default async function Home() {
  const featuredPosts = await getFeaturedPosts(3);

  const bioSegments: TypewriterSegment[] = [
    { text: "Husband", highlight: true },
    { text: " and " },
    { text: "pug dad", highlight: true },
    { text: "; reengineering clinical trials at " },
    { text: "Paradigm Health", highlight: true },
    { text: "; aspiring " },
    { text: "bread baker", highlight: true },
    { text: "." },
  ];

  return (
    <div className="min-h-screen font-sans transition-colors duration-300">
      <GradientOrbs />
      <Header />

      <main className="relative z-[1]">
        {/* Hero Section */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
          <div className="hero-mesh" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div
              className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 opacity-0"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--border-card)",
                backdropFilter: "blur(10px)",
                animation: "fade-in-up 0.6s ease-out 0.2s forwards",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                mattjmcnaughton.com
              </span>
            </div>

            {/* Name */}
            <h1
              className="mb-6 text-5xl font-bold font-heading opacity-0 sm:text-6xl lg:text-7xl"
              style={{
                color: "var(--text-primary)",
                animation: "fade-in-up 0.6s ease-out 0.4s forwards",
              }}
            >
              Matt <span className="gradient-text">McNaughton</span>
            </h1>

            {/* Typewriter Bio */}
            <p
              className="mb-10 h-8 text-lg opacity-0 sm:text-xl"
              style={{
                color: "var(--text-secondary)",
                animation: "fade-in-up 0.6s ease-out 0.6s forwards",
              }}
            >
              <Typewriter segments={bioSegments} speed={30} delay={1000} />
            </p>

            {/* CTA Buttons */}
            <div
              className="mb-10 flex flex-wrap items-center justify-center gap-4 opacity-0"
              style={{
                animation: "fade-in-up 0.6s ease-out 0.8s forwards",
              }}
            >
              <Link
                href="/blog"
                className="rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
                }}
              >
                Read the blog
              </Link>
              <Link
                href="/about"
                className="glass-card rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-105"
                style={{ color: "var(--text-primary)" }}
              >
                About me
              </Link>
            </div>

            {/* Social Links */}
            <div
              className="flex items-center justify-center gap-4 opacity-0"
              style={{
                animation: "fade-in-up 0.6s ease-out 1.0s forwards",
              }}
            >
              <a
                href="https://github.com/mattjmcnaughton"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110"
                style={{ color: "var(--text-secondary)" }}
              >
                <GitHubIcon className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/in/mattjmcnaughton"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110"
                style={{ color: "var(--text-secondary)" }}
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
              <a
                href="mailto:me@mattjmcnaughton.com"
                className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110"
                style={{ color: "var(--text-secondary)" }}
              >
                <EmailIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Featured Writing Section */}
        {featuredPosts.length > 0 && (
          <section className="mx-auto max-w-[1100px] px-4 py-24 sm:px-6 lg:px-8">
            <div className="section-label">Featured Writing</div>
            <h2
              className="mb-10 text-3xl font-bold font-heading"
              style={{ color: "var(--text-primary)" }}
            >
              Latest from the blog
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="gradient-border-card group flex flex-col transition-transform hover:-translate-y-1"
                >
                  <div className="gradient-border-card-inner flex flex-1 flex-col">
                    <h3
                      className="mb-2 text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {post.title}
                    </h3>
                    <time
                      className="mb-2 block text-sm"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
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
                </Link>
              ))}
            </div>
            <Link
              href="/blog"
              className="gradient-text mt-8 inline-block text-sm font-medium hover:underline"
            >
              View all posts &rarr;
            </Link>
          </section>
        )}

        {/* Now Section */}
        <section className="mx-auto max-w-[1100px] px-4 pb-24 sm:px-6 lg:px-8">
          <div className="section-label">What I&apos;m Up To</div>
          <h2
            className="mb-10 text-3xl font-bold font-heading"
            style={{ color: "var(--text-primary)" }}
          >
            See what I&apos;m working on{" "}
            <Link href="/now" className="gradient-text hover:underline">
              now &rarr;
            </Link>
          </h2>
        </section>
      </main>

      <Footer />
    </div>
  );
}
