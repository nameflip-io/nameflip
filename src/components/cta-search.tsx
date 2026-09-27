"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CtaSearch() {
  const router = useRouter();
  const [ctaQuery, setCtaQuery] = useState("");

  const handleCtaSearch = () => {
    if (ctaQuery.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(ctaQuery)}`);
    }
  };

  return (
    <div className="flex w-full max-w-2xl items-center rounded-full bg-white px-5 py-3 shadow-2xl">
      <input
        type="text"
        placeholder="Ask NameFlip to find domains with strong SEO value..."
        className="flex-1 bg-transparent text-base text-gray-800 outline-none placeholder-gray-400"
        value={ctaQuery}
        onChange={(event) => setCtaQuery(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && handleCtaSearch()}
      />
      <button
        type="button"
        onClick={handleCtaSearch}
        className="ml-3 flex items-center gap-2 rounded-full bg-blue-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-600"
      >
        Search <span>→</span>
      </button>
    </div>
  );
}
