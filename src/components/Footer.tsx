import Link from "next/link";
import { GitHubIcon, LinkedInIcon, EmailIcon } from "./icons";

export default function Footer() {
  return (
    <footer
      className="relative z-[1] py-12"
      style={{ borderTop: "1px solid var(--border-card)" }}
    >
      <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-6 px-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <span className="gradient-text text-xl font-bold font-heading">
            MM
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/mattjmcnaughton"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--text-tertiary)" }}
              className="transition-colors hover:opacity-80"
            >
              <GitHubIcon className="h-5 w-5" />
            </Link>
            <Link
              href="https://linkedin.com/in/mattjmcnaughton"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--text-tertiary)" }}
              className="transition-colors hover:opacity-80"
            >
              <LinkedInIcon className="h-5 w-5" />
            </Link>
            <Link
              href="mailto:me@mattjmcnaughton.com"
              style={{ color: "var(--text-tertiary)" }}
              className="transition-colors hover:opacity-80"
            >
              <EmailIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          &copy; {new Date().getFullYear()} mattjmcnaughton
        </p>
      </div>
    </footer>
  );
}
