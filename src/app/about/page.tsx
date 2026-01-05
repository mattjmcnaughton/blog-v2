import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAboutContent } from "@/lib/markdown";
import PageLayout from "@/components/PageLayout";
import {
  GitHubIcon,
  LinkedInIcon,
  EmailIcon,
  KeyIcon,
} from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getAboutContent();
  return {
    title: `${meta.title} | mattjmcnaughton`,
    description: meta.description,
  };
}

const socialLinks = [
  {
    name: "Github",
    href: "https://github.com/mattjmcnaughton",
    icon: GitHubIcon,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/mattjmcnaughton",
    icon: LinkedInIcon,
  },
  {
    name: "Email Me",
    href: "mailto:me@mattjmcnaughton.com",
    icon: EmailIcon,
  },
  {
    name: "PGP Key",
    href: "/artifacts/gpg/mattjmcnaughton.pub.asc",
    icon: KeyIcon,
  },
];

export default async function AboutPage() {
  const { content } = await getAboutContent();

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl animate-fade-in-up">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Left column - Profile and social links */}
          <div className="flex flex-col items-center lg:items-start lg:w-72 flex-shrink-0">
            {/* Profile image */}
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <Image
                src="/images/headshot.jpeg"
                alt="Matt McNaughton"
                width={280}
                height={280}
                className="object-cover"
                priority
              />
            </div>

            {/* Social links */}
            <div className="flex flex-col gap-3 w-full max-w-[280px]">
              {socialLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <link.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-100">
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right column - About content */}
          <div className="flex-1 min-w-0">
            <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-gray-100">
              About Me
            </h1>
            <div
              className="prose prose-lg max-w-none dark:prose-invert prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline [&>p:last-child]:hidden"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
