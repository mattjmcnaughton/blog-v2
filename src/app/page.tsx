"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GitHubIcon, LinkedInIcon, EmailIcon } from "@/components/icons";

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
    let cancelled = false;

    // Reset state asynchronously to avoid cascading renders
    queueMicrotask(() => {
      if (cancelled) return;
      setDisplayedLength(0);
      setStarted(false);
    });

    const startTimeout = setTimeout(() => {
      if (cancelled) return;
      setStarted(true);
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(startTimeout);
    };
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
      </main>

      <Footer />
    </div>
  );
}
