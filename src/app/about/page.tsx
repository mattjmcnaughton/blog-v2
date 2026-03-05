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
          <div className="flex flex-shrink-0 flex-col items-center lg:w-72 lg:items-start">
            {/* Profile image */}
            <div className="glass-card mb-6 overflow-hidden">
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
            <div className="flex w-full max-w-[280px] flex-col gap-3">
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
                  className="glass-card flex items-center gap-3 rounded-lg px-4 py-3"
                >
                  <span style={{ color: "var(--text-tertiary)" }}>
                    <link.icon className="h-5 w-5" />
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right column - About content */}
          <div className="min-w-0 flex-1">
            <div className="section-label">About</div>
            <h1
              className="mb-8 text-4xl font-bold font-heading"
              style={{ color: "var(--text-primary)" }}
            >
              About Me
            </h1>
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
