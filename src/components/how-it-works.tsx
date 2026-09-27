"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Search } from "lucide-react";

function Bullet({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 font-bold text-blue-500">✓</span>
      <span className="text-gray-700">{label}</span>
    </li>
  );
}

function SearchResultRow({ domain }: { domain: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2">
      <span className="text-sm font-medium text-gray-900">{domain}</span>
      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
        Available
      </span>
    </div>
  );
}

function SearchMockup() {
  return (
    <div className="min-h-[280px] rounded-2xl bg-white p-6 shadow-xl">
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
          <Search className="size-4 shrink-0" />
          <span className="truncate">
            Find expired SaaS domains under $500...
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <SearchResultRow domain="flextrack.io" />
          <SearchResultRow domain="saastools.co" />
          <SearchResultRow domain="buildit.app" />
        </div>
      </div>
    </div>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative flex size-16 shrink-0 items-center justify-center">
      <svg viewBox="0 0 68 68" className="size-full -rotate-90">
        <circle
          cx="34"
          cy="34"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="6"
        />
        <circle
          cx="34"
          cy="34"
          r={radius}
          fill="none"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-lg font-bold text-gray-900">
        {score}
      </span>
    </div>
  );
}

function StatRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-semibold text-gray-900 ${valueClassName ?? ""}`}>
        {value}
      </p>
    </div>
  );
}

function AnalyzeMockup() {
  return (
    <div className="min-h-[280px] rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-center gap-4">
        <ScoreCircle score={87} />
        <span className="text-lg font-bold text-gray-900">saastools.io</span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatRow label="Domain Age" value="8 years" />
        <StatRow label="Backlinks" value="2,400" />
        <StatRow label="Traffic" value="1.2k/mo" />
        <StatRow label="Spam Risk" value="Low" valueClassName="text-emerald-600" />
      </div>
    </div>
  );
}

function PortfolioRow({
  domain,
  left,
  right,
  delta,
}: {
  domain: string;
  left: string;
  right: string;
  delta?: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-sm font-semibold text-gray-900">{domain}</p>
      <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
        <span>
          {left} → {right}
        </span>
        {delta && (
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <ArrowUp className="size-3" />
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function FlipMockup() {
  return (
    <div className="min-h-[280px] rounded-2xl bg-white p-6 shadow-xl">
      <p className="text-sm font-semibold text-gray-500">Your Portfolio</p>
      <div className="mt-4 flex flex-col gap-3">
        <PortfolioRow
          domain="flextrack.io"
          left="Bought $45"
          right="Listed $1,200"
          delta="+2,567%"
        />
        <PortfolioRow
          domain="buildit.app"
          left="Leasing $29/mo"
          right="8 months active"
        />
      </div>
    </div>
  );
}

const ROWS = [
  {
    number: "01",
    heading: "Search with AI, in plain English",
    body: "Type what you're looking for naturally. NameFlip understands intent — ‘expired SaaS domains with DR 40+’ or ‘brandable 5-letter .com under $200’. Our AI does the heavy lifting.",
    bullets: [
      "AI-powered domain suggestions",
      "Filter by price, age, backlinks, TLD",
      "Real availability checking",
    ],
    imageSide: "left" as const,
    visual: <SearchMockup />,
  },
  {
    number: "02",
    heading: "Instant AI Score for every domain",
    body: "Every domain gets scored 0–100 based on 15+ signals: domain age, backlink quality, traffic history, keyword value, spam risk, and brandability. No spreadsheets needed.",
    bullets: [
      "15+ ranking signals analyzed",
      "Spam & penalty detection",
      "Brandability & keyword value score",
    ],
    imageSide: "right" as const,
    visual: <AnalyzeMockup />,
  },
  {
    number: "03",
    heading: "Flip for profit or lease for income",
    body: "Buy undervalued domains and flip them on Flippa, Sedo, or GoDaddy Auctions. Or use NameFlip's built-in Lease Engine to earn monthly recurring revenue without selling.",
    bullets: [
      "One-click For Sale listing page",
      "Built-in Lease Engine",
      "Track portfolio ROI",
    ],
    imageSide: "left" as const,
    visual: <FlipMockup />,
  },
];

export function HowItWorks() {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleRows, setVisibleRows] = useState<boolean[]>(() =>
    ROWS.map(() => false)
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          const index = rowRefs.current.indexOf(
            entry.target as HTMLDivElement
          );
          if (index !== -1) {
            setVisibleRows((prev) => {
              if (prev[index]) return prev;
              const next = [...prev];
              next[index] = true;
              return next;
            });
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    rowRefs.current.forEach((row) => row && observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-blue-500">
          How It Works
        </p>
        <h2 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">
          Find undervalued domains in minutes
        </h2>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        {ROWS.map((row, index) => {
          const isVisible = visibleRows[index];

          const textBlock = (
            <div
              className="flex flex-col justify-center"
              style={{
                transform: isVisible
                  ? "translateX(0) translateY(0)"
                  : "translateX(-50px) translateY(-30px)",
                opacity: isVisible ? 1 : 0,
                transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            >
              <span className="mb-2 text-5xl font-black text-blue-100">
                {row.number}
              </span>
              <h3 className="mb-4 text-3xl font-bold text-gray-900">
                {row.heading}
              </h3>
              <p className="mb-6 text-gray-600">{row.body}</p>
              <ul className="flex flex-col gap-2.5">
                {row.bullets.map((bullet) => (
                  <Bullet key={bullet} label={bullet} />
                ))}
              </ul>
            </div>
          );

          const imageBlock = (
            <div
              className={
                row.imageSide === "left"
                  ? "reveal-image-left"
                  : "reveal-image-right"
              }
            >
              {row.visual}
            </div>
          );

          return (
            <div
              key={row.number}
              ref={(element) => {
                rowRefs.current[index] = element;
              }}
              className="reveal-row grid items-center gap-16 py-20 md:grid-cols-2"
            >
              {row.imageSide === "left" ? (
                <>
                  {imageBlock}
                  {textBlock}
                </>
              ) : (
                <>
                  {textBlock}
                  {imageBlock}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
