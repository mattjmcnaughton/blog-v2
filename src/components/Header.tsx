"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MoonIcon,
  SunIcon,
  UserIcon,
  BookOpenIcon,
  MenuIcon,
  ClockIcon,
} from "./icons";

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use queueMicrotask to avoid synchronous setState in effect
    queueMicrotask(() => {
      setMounted(true);
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(prefersDark);
    });
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  if (!mounted) {
    return (
      <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between sm:h-20">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                mattjmcnaughton
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="group flex cursor-pointer items-center space-x-3"
          >
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
                href="/now"
                className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
              >
                <ClockIcon className="h-4 w-4" />
                Now
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
              href="/now"
              onClick={() => setMenuOpen(false)}
              className="block w-full py-2 text-left font-medium text-gray-900 dark:text-gray-100"
            >
              Now
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
            <span className="text-gray-900 dark:text-gray-100">Dark Mode</span>
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
  );
}
