"use client";

import { useState, useEffect } from "react";

export interface TypewriterSegment {
  text: string;
  highlight?: boolean;
}

export function Typewriter({
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
