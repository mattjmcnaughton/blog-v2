"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}

interface TypewriterSegment {
  text: string;
  highlight?: boolean;
}

function Typewriter({
  segments,
  speed = 30,
  delay = 500,
}: {
  segments: TypewriterSegment[];
  speed?: number;
  delay?: number;
}) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [started, setStarted] = useState(false);

  const fullText = segments.map((s) => s.text).join("");

  useEffect(() => {
    setDisplayedLength(0);
    setStarted(false);

    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev < fullText.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [fullText, speed, started]);

  const renderSegments = () => {
    let charIndex = 0;
    return segments.map((segment, segmentIndex) => {
      const segmentStart = charIndex;
      const segmentEnd = charIndex + segment.text.length;
      charIndex = segmentEnd;

      const visibleLength = Math.max(
        0,
        Math.min(displayedLength - segmentStart, segment.text.length)
      );
      const visibleText = segment.text.substring(0, visibleLength);

      if (visibleLength === 0) return null;

      if (segment.highlight) {
        return (
          <span
            key={segmentIndex}
            className="text-indigo-600 dark:text-indigo-400"
          >
            {visibleText}
          </span>
        );
      }

      return <span key={segmentIndex}>{visibleText}</span>;
    });
  };

  return (
    <span>
      {renderSegments()}
      {started && displayedLength < fullText.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDark(prefersDark);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  if (!mounted) {
    return null;
  }

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
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between sm:h-20">
            {/* Logo / Brand */}
            <Link href="/" className="group flex cursor-pointer items-center space-x-3">
              <div className="relative transition-transform group-hover:scale-105">
                <Image
                  src="/images/avatar.png"
                  alt="mattjmcnaughton"
                  width={40}
                  height={40}
                  className="rounded-lg border border-black/5 shadow-sm dark:border-white/10"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                mattjmcnaughton
              </span>
            </Link>

            {/* Desktop Nav & Controls */}
            <div className="hidden items-center space-x-8 md:flex">
              <nav className="flex items-center space-x-6">
                <Link
                  href="/about"
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                >
                  <UserIcon className="h-4 w-4" />
                  About
                </Link>
                <Link
                  href="/blog"
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                >
                  <BookOpenIcon className="h-4 w-4" />
                  Blog
                </Link>
              </nav>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
              >
                {isDark ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-900 dark:text-gray-100"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="space-y-4 border-t border-gray-200 bg-gray-50 px-4 pb-4 pt-2 dark:border-gray-800 dark:bg-gray-900 md:hidden">
            <div className="space-y-2 border-b border-gray-200/50 pb-4 dark:border-gray-700/50">
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="block w-full py-2 text-left font-medium text-gray-900 dark:text-gray-100"
              >
                About
              </Link>
              <Link
                href="/blog"
                onClick={() => setMenuOpen(false)}
                className="block w-full py-2 text-left font-medium text-gray-900 dark:text-gray-100"
              >
                Blog
              </Link>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200/50 pt-2 dark:border-gray-700/50">
              <span className="text-gray-900 dark:text-gray-100">
                Dark Mode
              </span>
              <button
                onClick={() => setIsDark(!isDark)}
                className="text-gray-900 dark:text-gray-100"
              >
                {isDark ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </header>

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
              href="mailto:mattjmcnaughton@gmail.com"
              className="flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-indigo-600 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-indigo-400"
            >
              <EmailIcon className="h-5 w-5" />
              <span className="font-medium">Email</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} mattjmcnaughton. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
