"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PREFIX = "Ask NameFlip to ";

const SUFFIXES = [
  "find expired domains worth flipping...",
  "find a domain for my AI startup...",
  "find trending domains under $500...",
  "find domains with strong SEO value...",
];

const TYPE_SPEED = 55;
const DELETE_SPEED = 30;
const PAUSE_AT_END = 1400;
const PAUSE_AT_START = 300;

function subscribeToReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

export function HeroSearch({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const suffix = SUFFIXES[phraseIndex];
    const atEnd = !isDeleting && charIndex === suffix.length;
    const atStart = isDeleting && charIndex === 0;
    const delay = atEnd
      ? PAUSE_AT_END
      : atStart
        ? PAUSE_AT_START
        : isDeleting
          ? DELETE_SPEED
          : TYPE_SPEED;

    const timeout = setTimeout(() => {
      if (atEnd) {
        setIsDeleting(true);
      } else if (atStart) {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % SUFFIXES.length);
      } else {
        setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, prefersReducedMotion]);

  const placeholder =
    PREFIX +
    (prefersReducedMotion
      ? SUFFIXES[0]
      : SUFFIXES[phraseIndex].slice(0, charIndex));

  const isDark = variant === "dark";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        router.push("/dashboard");
      }}
      className={
        isDark
          ? "mt-10 flex w-full max-w-[640px] items-center gap-3 rounded-full border border-white/20 bg-white/10 py-4 pl-5 pr-2 shadow-xl shadow-black/40 backdrop-blur-md"
          : "mt-10 flex w-full max-w-[640px] items-center gap-3 rounded-full border border-primary/30 bg-white py-4 pl-5 pr-2 shadow-xl shadow-slate-300/40"
      }
    >
      <input
        type="text"
        placeholder={placeholder}
        aria-label="Ask NameFlip to find a domain"
        className={
          isDark
            ? "min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-white/50 focus:outline-none"
            : "min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        }
      />
      <Button type="submit" size="lg" className="shrink-0 rounded-full">
        Search
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
