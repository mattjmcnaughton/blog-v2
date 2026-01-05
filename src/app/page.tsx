import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GitHubIcon, LinkedInIcon, EmailIcon } from "@/components/icons";
import { Typewriter, TypewriterSegment } from "@/components/Typewriter";
import { getFeaturedPosts, getProjectsContent } from "@/lib/markdown";

export default async function Home() {
  const featuredPosts = await getFeaturedPosts(3);
  const { content: projectsContent } = await getProjectsContent();

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
    <div className="min-h-screen bg-gray-50 font-sans transition-colors duration-300 dark:bg-gray-900">
      <Header />

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 pt-24 transition-all duration-300 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-16 flex animate-fade-in-up flex-col items-center">
          {/* Hero Image */}
          <div className="group relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gray-200 to-gray-400 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200 dark:from-slate-700 dark:to-slate-900"></div>
            <Image
              src="/images/headshot.jpeg"
              alt="mattjmcnaughton"
              width={192}
              height={192}
              className="relative h-48 w-48 rounded-full border-4 border-gray-50 bg-gray-50 shadow-2xl dark:border-gray-900 dark:bg-gray-900"
              priority
            />
          </div>

          {/* Bio with Typewriter effect */}
          <p className="mt-8 h-8 text-center text-xl font-medium text-gray-500 dark:text-gray-400">
            <Typewriter segments={bioSegments} speed={30} delay={500} />
          </p>

          {/* Social Links */}
          <div className="mt-8 flex space-x-4 sm:space-x-8">
            <a
              href="https://github.com/mattjmcnaughton"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-indigo-600 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-indigo-400"
            >
              <GitHubIcon className="h-5 w-5" />
              <span className="font-medium">GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/mattjmcnaughton"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-indigo-600 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-indigo-400"
            >
              <LinkedInIcon className="h-5 w-5" />
              <span className="font-medium">LinkedIn</span>
            </a>
            <a
              href="mailto:me@mattjmcnaughton.com"
              className="flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-indigo-600 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-indigo-400"
            >
              <EmailIcon className="h-5 w-5" />
              <span className="font-medium">Email</span>
            </a>
          </div>
        </div>

        {/* Featured Writing Section */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Featured Writing
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
                    {post.title}
                  </h3>
                  <time className="mb-2 block text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-300">
                    {post.description}
                  </p>
                </Link>
              ))}
            </div>
            <Link
              href="/blog"
              className="mt-6 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View all posts &rarr;
            </Link>
          </section>
        )}

        {/* Current Projects Section */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Current Projects
          </h2>
          <div
            className="prose prose-lg max-w-none dark:prose-invert prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: projectsContent }}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
