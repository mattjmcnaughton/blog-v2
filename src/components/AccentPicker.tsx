"use client";

import { useState, useEffect, useRef } from "react";

const ACCENTS = [
  { id: "green", label: "Green", swatch: "#4a7c59" },
  { id: "carolina", label: "Carolina", swatch: "#4a8fb8" },
  { id: "navy", label: "Navy", swatch: "#3d5a80" },
  { id: "teal", label: "Teal", swatch: "#2d7d7d" },
  { id: "rose", label: "Rose", swatch: "#9e4a6b" },
  { id: "amber", label: "Amber", swatch: "#9e7a3a" },
];

export default function AccentPicker() {
  const [accent, setAccent] = useState("navy");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem("accent");
      if (stored && ACCENTS.some((a) => a.id === stored)) {
        setAccent(stored);
      }
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectAccent = (id: string) => {
    setAccent(id);
    setOpen(false);
    localStorage.setItem("accent", id);
    document.documentElement.setAttribute("data-accent", id);
  };

  if (!mounted) return null;

  const currentSwatch =
    ACCENTS.find((a) => a.id === accent)?.swatch ?? "#4a7c59";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change accent color"
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
        <span
          className="block h-4 w-4 rounded-full"
          style={{
            backgroundColor: currentSwatch,
            boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.3)",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 rounded-xl p-2 shadow-lg"
          style={{
            background: "var(--nav-bg)",
            border: "1px solid var(--nav-border)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="flex gap-1.5">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => selectAccent(a.id)}
                aria-label={a.label}
                title={a.label}
                className="rounded-full p-1 transition-transform hover:scale-110"
                style={{
                  outline: accent === a.id ? `2px solid ${a.swatch}` : "none",
                  outlineOffset: "1px",
                }}
              >
                <span
                  className="block h-5 w-5 rounded-full"
                  style={{
                    backgroundColor: a.swatch,
                    boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.25)",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
