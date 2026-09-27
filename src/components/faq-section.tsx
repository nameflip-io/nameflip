"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "How does NameFlip find domain opportunities?",
    answer:
      "NameFlip uses AI to analyze expired domains, auction listings, and aftermarket sales to surface undervalued domains with strong SEO authority, backlink profiles, and resale potential — before others find them.",
  },
  {
    question: "Do I need to be a domain expert to use NameFlip?",
    answer:
      "Not at all. NameFlip is built for everyone from beginners to seasoned flippers. Our AI Score breaks down each domain into simple metrics so you can make smart decisions without needing years of experience.",
  },
  {
    question: "How accurate is the AI domain analysis?",
    answer:
      "Our AI analyzes 15+ signals including domain age, backlink quality, traffic history, keyword value, and brandability. While no tool can guarantee resale prices, NameFlip gives you a data-driven edge over manual research.",
  },
  {
    question: "What's included in the free plan?",
    answer:
      "The free plan gives you 5 AI domain analyses per month, access to search suggestions, and basic domain metrics. Upgrade to Pro or Pro+ for unlimited analyses, Daily Top 10 picks, portfolio tracking, and advanced filters.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, absolutely. You can cancel your Pro or Pro+ subscription at any time from your account settings. You'll keep access until the end of your billing period with no hidden fees.",
  },
  {
    question: "How do I sell a domain I found through NameFlip?",
    answer:
      "NameFlip includes a built-in Lease Engine and For Sale page generator. List your domain for sale or lease directly from your portfolio dashboard and share a professional listing page with potential buyers.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="text-center text-sm font-medium text-blue-500">
          Frequently Asked Questions
        </p>
        <h2 className="mt-2 text-center text-4xl font-bold text-gray-900 md:text-5xl">
          Still have questions about NameFlip?
        </h2>

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question} className="rounded-2xl bg-gray-50 px-6 py-5">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-base font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-lg font-light text-gray-500">
                    {isOpen ? "×" : "+"}
                  </span>
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 pt-3" : "max-h-0"
                  }`}
                >
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
