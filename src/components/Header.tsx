"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "./icons";
import AccentPicker from "./AccentPicker";

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme) {
        setIsDark(storedTheme === "dark");
      } else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setIsDark(prefersDark);
      }
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  const navLinks = [
    { href: "/blog", label: "Blog" },
    { href: "/now", label: "Now" },
    { href: "/about", label: "About" },
    { href: "/feed", label: "RSS" },
  ];

  if (!mounted) {
    return (
      <header className="fixed top-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-fit -translate-x-1/2">
        <div
          className="flex items-center gap-1 rounded-full px-2 py-2 sm:gap-2 sm:px-3"
          style={{
            background: "var(--nav-bg)",
            border: "1px solid var(--nav-border)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div
            className="h-8 w-8 rounded-full"
            style={{ background: "var(--border-card-hover)" }}
          />
          <div
            className="h-5 w-32 sm:w-48"
            style={{ background: "var(--border-card)", borderRadius: "4px" }}
          />
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-fit -translate-x-1/2">
      <nav
        className="flex items-center gap-1 rounded-full px-2 py-2 shadow-lg sm:gap-2 sm:px-3"
        style={{
          background: "var(--nav-bg)",
          border: "1px solid var(--nav-border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Avatar */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/avatar.png"
            alt="mattjmcnaughton"
            width={32}
            height={32}
            className="rounded-full transition-transform hover:scale-105"
          />
        </Link>

        {/* Nav Links */}
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full px-2 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-card)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            {link.label}
          </Link>
        ))}

        {/* Divider */}
        <div
          className="mx-1 h-5 w-px"
          style={{ background: "var(--border-card)" }}
        />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-full p-2 transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-card)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          {isDark ? (
            <SunIcon className="h-4 w-4" />
          ) : (
            <MoonIcon className="h-4 w-4" />
          )}
        </button>

        {/* Accent Color Picker (dev only) */}
        {process.env.NODE_ENV === "development" && <AccentPicker />}
      </nav>
    </header>
  );
}
