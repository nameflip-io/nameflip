"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  Bookmark,
  ChevronDown,
  CreditCard,
  Loader2,
  Lock,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Target,
  Trash2,
  UserCog,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { openUpgradeModal } from "@/components/upgrade-modal";
import type {
  DomainAnalysis,
  DomainCategory,
  DomainResult as ApiDomainResult,
} from "@/lib/types";

/* ----------------------------- Auth context ------------------------------ */

type UserPlan = "free" | "pro" | "pro_plus";

const PLAN_SEARCH_LIMITS: Record<UserPlan, number> = {
  free: 5,
  pro: 50,
  pro_plus: 9999,
};

const AuthContext = createContext<{
  user: User | null;
  userPlan: UserPlan;
  isPro: boolean;
  isProPlus: boolean;
}>({ user: null, userPlan: "free", isPro: false, isProPlus: false });

function useAuth() {
  return useContext(AuthContext);
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 12.5l4.5 4.5L20 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* --------------------------------- Sidebar -------------------------------- */

type View = "search" | "saved" | "campaigns" | "settings" | "proFeatures";

const NAV_ITEMS: { key: View; icon: typeof Search; label: string }[] = [
  { key: "search", icon: Search, label: "Search" },
  { key: "saved", icon: Bookmark, label: "Saved Domains" },
  { key: "campaigns", icon: Target, label: "Campaigns" },
  { key: "settings", icon: Settings, label: "Settings" },
  { key: "proFeatures", icon: Lock, label: "Pro+ Features" },
];

function UserMenu({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { user, isPro, isProPlus } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName: string =
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    "Guest";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";
  const planLabel = isProPlus ? "Pro+ Plan" : isPro ? "Pro Plan" : "Free Plan";

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div ref={containerRef} className="relative border-t border-[#E2E8F0] px-3 py-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-100"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {displayName}
          </p>
          <span className="mt-0.5 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {planLabel}
          </span>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute bottom-[calc(100%-4px)] left-3 right-3 z-40 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white py-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onNavigate("settings");
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <UserCog className="size-4 text-slate-400" />
            Account Settings
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openUpgradeModal();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <CreditCard className="size-4 text-slate-400" />
            Billing
          </button>
          <div className="my-1 h-px bg-[#E2E8F0]" />
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({
  activeView,
  onNavigate,
}: {
  activeView: View;
  onNavigate: (view: View) => void;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-[#E2E8F0] bg-[#F8FAFC]">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onNavigate(key)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              activeView === key
                ? "bg-primary/10 text-primary"
                : "text-slate-600 hover:bg-slate-100 hover:text-foreground"
            }`}
          >
            <Icon className="size-5" />
            <span className="flex-1">{label}</span>
          </button>
        ))}
      </nav>

      <UserMenu onNavigate={onNavigate} />
    </aside>
  );
}

/* ---------------------------------- Toast --------------------------------- */

function Toast({
  message,
  action,
}: {
  message: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-[110] flex justify-center px-4">
      <div className="flex max-w-sm items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl">
        <p className="flex-1">{message}</p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="shrink-0 font-semibold text-blue-300 underline-offset-2 hover:text-blue-200 hover:underline"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Pro welcome ------------------------------- */

function ProWelcomeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-7 text-primary" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-foreground">
          Welcome to Pro!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your monthly search limit just went up. Happy hunting.
        </p>
        <Button className="mt-6 w-full" onClick={onClose}>
          Let&apos;s go
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------- Empty state ------------------------------ */

function EmptyState({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="mt-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#E2E8F0] py-20 text-center">
        <p className="max-w-sm text-muted-foreground">{message}</p>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------ Search section ---------------------------- */

const CATEGORY_OPTIONS: { value: DomainCategory; label: string }[] = [
  { value: "all", label: "All TLDs" },
  { value: "com", label: ".com" },
  { value: "io", label: ".io" },
  { value: "net", label: ".net" },
  { value: "co", label: ".co" },
  { value: "org", label: ".org" },
];

function SaveButton({
  saved,
  onToggle,
}: {
  saved: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
        saved
          ? "border-[#A7F3D0] bg-[#D1FAE5] text-emerald-800"
          : "border-[#E2E8F0] bg-white text-foreground hover:bg-slate-50"
      }`}
    >
      {saved ? <CheckIcon className="size-4" /> : <Bookmark className="size-4" />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}

type LiveAvailability =
  | { status: "loading" }
  | { status: "available"; price: number | null }
  | { status: "taken" }
  | { status: "unknown" };

function ResultCard({
  result,
  saved,
  onToggleSave,
  onAnalyze,
}: {
  result: ApiDomainResult;
  saved: boolean;
  onToggleSave: () => void;
  onAnalyze: () => void;
}) {
  const [availability, setAvailability] = useState<LiveAvailability>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/check-domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: result.domain }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.available === true) {
          setAvailability({
            status: "available",
            price: typeof data.price === "number" ? data.price : null,
          });
        } else if (data?.available === false) {
          setAvailability({ status: "taken" });
        } else {
          setAvailability({ status: "unknown" });
        }
      })
      .catch(() => {
        if (!cancelled) setAvailability({ status: "unknown" });
      });
    return () => {
      cancelled = true;
    };
  }, [result.domain]);

  const tld = result.tld?.replace(/^\./, "") || result.domain.split(".").pop();

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-bold text-foreground">{result.domain}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          .{tld}
        </span>
        {availability.status === "loading" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            <Loader2 className="size-3 animate-spin" /> Checking...
          </span>
        )}
        {availability.status === "available" && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Available
          </span>
        )}
        {availability.status === "taken" && (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
            Taken
          </span>
        )}
        {availability.status === "unknown" && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            Unknown
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#E2E8F0] pt-4 text-center text-xs">
        <div>
          <p className="text-muted-foreground">AI estimate</p>
          <p className="mt-0.5 font-semibold text-foreground">
            ${result.auctionPrice.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Age (est.)</p>
          <p className="mt-0.5 font-semibold text-foreground">
            {result.age} yr{result.age === 1 ? "" : "s"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Backlinks (est.)</p>
          <p className="mt-0.5 font-semibold text-foreground">
            {result.referringDomains}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <SaveButton saved={saved} onToggle={onToggleSave} />
        <Button className="flex-1" onClick={onAnalyze}>
          Analyze with AI →
        </Button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="h-5 w-40 rounded bg-slate-200" />
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#E2E8F0] pt-4">
        <div className="h-8 rounded bg-slate-100" />
        <div className="h-8 rounded bg-slate-100" />
        <div className="h-8 rounded bg-slate-100" />
      </div>
      <div className="mt-4 h-9 rounded-lg bg-slate-100" />
    </div>
  );
}

function SearchView({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  onSearch,
  isSearching,
  results,
  searchError,
  savedDomains,
  onToggleSave,
  onAnalyze,
  searchesUsedToday,
  searchLimit,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  category: DomainCategory;
  onCategoryChange: (value: DomainCategory) => void;
  onSearch: () => void;
  isSearching: boolean;
  results: ApiDomainResult[] | null;
  searchError: string | null;
  savedDomains: Set<string>;
  onToggleSave: (result: ApiDomainResult) => void;
  onAnalyze: (result: ApiDomainResult) => void;
  searchesUsedToday: number;
  searchLimit: number;
}) {
  const atLimit = searchesUsedToday >= searchLimit;
  const limitLabel = searchLimit >= 9999 ? "Unlimited" : `${searchLimit}`;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Search Domains
          </h1>
          <p className="mt-2 text-muted-foreground">
            AI-powered domain research — find opportunities worth digging into.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm text-muted-foreground">
            {searchesUsedToday} of {limitLabel} searches used this month
          </p>
          {searchLimit < 9999 && (
            <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, (searchesUsedToday / searchLimit) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
        className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-2 rounded-2xl border-2 border-[#E2E8F0] bg-white p-2 pl-5 transition-colors focus-within:border-primary">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Try 'AI tools', 'fitness app', 'crypto', 'real estate'..."
            className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <select
            value={category}
            onChange={(event) =>
              onCategoryChange(event.target.value as DomainCategory)
            }
            className="shrink-0 rounded-full border border-[#E2E8F0] bg-slate-50 px-3 py-1.5 text-sm text-slate-600 focus:outline-none"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            size="lg"
            className="min-w-[120px] shrink-0 rounded-full"
            disabled={isSearching}
          >
            {isSearching && <Loader2 className="size-4 animate-spin" />}
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      {atLimit ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
          <Lock className="size-6 text-amber-600" />
          <p className="font-semibold text-amber-900">
            You&apos;ve used all your searches this month
          </p>
          <p className="max-w-sm text-sm text-amber-800">
            Upgrade your plan to keep searching for domain opportunities.
          </p>
          <Button onClick={openUpgradeModal}>Upgrade Plan</Button>
        </div>
      ) : (
        <div className="mt-10">
          {searchError && !isSearching && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <span>{searchError}</span>
              <button
                type="button"
                onClick={onSearch}
                className="font-semibold text-red-700 underline-offset-2 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {isSearching && (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {!isSearching && results && results.length === 0 && !searchError && (
            <p className="text-sm text-muted-foreground">
              No results found for this search. Try a different keyword.
            </p>
          )}

          {!isSearching && results && results.length > 0 && (
            <>
              <div className="grid gap-4">
                {results.map((result) => (
                  <ResultCard
                    key={result.domain}
                    result={result}
                    saved={savedDomains.has(result.domain)}
                    onToggleSave={() => onToggleSave(result)}
                    onAnalyze={() => onAnalyze(result)}
                  />
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Domain metrics (age, backlinks, price) are AI estimates for
                research purposes only. Always verify with registrars before
                purchasing.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Analysis modal ----------------------------- */

type AnalysisState = "loading" | "error" | DomainAnalysis;

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444";
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">Opportunity Score</span>
        <span className="font-bold" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function AnalysisModal({
  domain,
  saved,
  onClose,
  onSave,
  analysisCache,
  onRequestAnalysis,
}: {
  domain: string;
  saved: boolean;
  onClose: () => void;
  onSave: () => void;
  analysisCache: Record<string, AnalysisState>;
  onRequestAnalysis: (domain: string) => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const state = analysisCache[domain];

  useEffect(() => {
    if (state === undefined) onRequestAnalysis(domain);
    // Only re-run when the domain changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 py-10">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[640px] rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] p-6">
          <h2 className="text-2xl font-bold text-foreground">{domain}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6">
          {state === undefined || state === "loading" ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="size-4 animate-spin" />
              Claude is analyzing {domain}...
            </div>
          ) : state === "error" ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-600">
                Analysis unavailable — try again.
              </p>
              <button
                type="button"
                onClick={() => onRequestAnalysis(domain)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <ScoreBar score={state.opportunityScore} />

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                  AI estimate: ${state.estimatedValue.low.toLocaleString()}–$
                  {state.estimatedValue.high.toLocaleString()}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium capitalize text-slate-700">
                  {state.recommendedUse}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium capitalize text-slate-700">
                  {state.searchTrend}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                  {state.niche}
                </span>
              </div>

              {state.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {state.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Why it&apos;s interesting
                </p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {state.whyInteresting.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-1.5 text-sm text-slate-700"
                    >
                      <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {state.risks.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground">Risks</p>
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {state.risks.map((risk) => (
                      <li key={risk} className="text-sm text-slate-600">
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <p className="mt-6 text-xs text-muted-foreground">
            Analysis is AI-generated for research only. Not financial advice.
          </p>

          <Button className="mt-4 w-full" onClick={onSave} disabled={saved}>
            {saved ? "Saved" : "Save Domain"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Saved domains ------------------------------ */

interface SavedDomainRow {
  id: string;
  domain: string;
  tld: string | null;
  notes: string | null;
  campaign_id: string | null;
  created_at: string;
}

interface CampaignRow {
  id: string;
  name: string;
  description: string | null;
  niche: string | null;
  budget: number | null;
  created_at: string;
}

function SavedDomainCard({
  record,
  campaigns,
  onDelete,
  onUpdateNotes,
  onAssignCampaign,
}: {
  record: SavedDomainRow;
  campaigns: CampaignRow[];
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onAssignCampaign: (id: string, campaignId: string | null) => void;
}) {
  const [notes, setNotes] = useState(record.notes ?? "");

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">{record.domain}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Saved {new Date(record.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(record.id)}
          aria-label="Delete saved domain"
          className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <label className="mt-3 flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Notes</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={() => {
            if (notes !== (record.notes ?? "")) onUpdateNotes(record.id, notes);
          }}
          placeholder="Add a note about this domain..."
          rows={2}
          className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </label>

      {campaigns.length > 0 && (
        <label className="mt-3 flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Campaign
          </span>
          <select
            value={record.campaign_id ?? ""}
            onChange={(event) =>
              onAssignCampaign(record.id, event.target.value || null)
            }
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">No campaign</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

function SavedDomainsView({
  records,
  loading,
  campaigns,
  onDelete,
  onUpdateNotes,
  onAssignCampaign,
  onStartSearching,
}: {
  records: SavedDomainRow[];
  loading: boolean;
  campaigns: CampaignRow[];
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onAssignCampaign: (id: string, campaignId: string | null) => void;
  onStartSearching: () => void;
}) {
  if (!loading && records.length === 0) {
    return (
      <EmptyState
        title="Saved Domains"
        message="No saved domains yet — search and save domains you like."
      >
        <Button onClick={onStartSearching}>Start Searching →</Button>
      </EmptyState>
    );
  }

  return (
    <div className="mt-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Saved Domains
      </h1>
      <p className="mt-2 text-muted-foreground">
        {records.length} domain{records.length === 1 ? "" : "s"} saved.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {records.map((record) => (
          <SavedDomainCard
            key={record.id}
            record={record}
            campaigns={campaigns}
            onDelete={onDelete}
            onUpdateNotes={onUpdateNotes}
            onAssignCampaign={onAssignCampaign}
          />
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Campaigns -------------------------------- */

function CreateCampaignForm({
  onCreate,
  onCancel,
}: {
  onCreate: (data: {
    name: string;
    description: string | null;
    niche: string | null;
    budget: number | null;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [niche, setNiche] = useState("");
  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onCreate({
      name: name.trim(),
      description: description.trim() || null,
      niche: niche.trim() || null,
      budget: budget ? Number(budget) : null,
    });
    setSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-6"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-muted-foreground">Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-muted-foreground">
          Description
        </span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-muted-foreground">
          Target niche
        </span>
        <input
          value={niche}
          onChange={(event) => setNiche(event.target.value)}
          placeholder="e.g. AI tools, health tech"
          className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-muted-foreground">
          Research budget (optional)
        </span>
        <input
          type="number"
          min="0"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
          placeholder="e.g. 500"
          className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || !name.trim()}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Create Campaign
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function CampaignCard({
  campaign,
  domainCount,
}: {
  campaign: CampaignRow;
  domainCount: number;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <h3 className="text-lg font-bold text-foreground">{campaign.name}</h3>
      {campaign.niche && (
        <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {campaign.niche}
        </span>
      )}
      {campaign.description && (
        <p className="mt-3 text-sm text-muted-foreground">
          {campaign.description}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>
          {domainCount} domain{domainCount === 1 ? "" : "s"}
        </span>
        {campaign.budget != null && (
          <span>${campaign.budget.toLocaleString()} research budget</span>
        )}
        <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function CampaignsView({
  campaigns,
  savedDomains,
  creating,
  onStartCreate,
  onCancelCreate,
  onCreate,
}: {
  campaigns: CampaignRow[];
  savedDomains: SavedDomainRow[];
  creating: boolean;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onCreate: (data: {
    name: string;
    description: string | null;
    niche: string | null;
    budget: number | null;
  }) => Promise<void>;
}) {
  if (!creating && campaigns.length === 0) {
    return (
      <EmptyState
        title="Campaigns"
        message="No campaigns yet. Create your first campaign to organize your domain research."
      >
        <Button onClick={onStartCreate}>+ Create Campaign</Button>
      </EmptyState>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Campaigns
        </h1>
        {!creating && <Button onClick={onStartCreate}>+ New Campaign</Button>}
      </div>

      {creating && (
        <CreateCampaignForm onCreate={onCreate} onCancel={onCancelCreate} />
      )}

      {campaigns.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              domainCount={
                savedDomains.filter((d) => d.campaign_id === campaign.id)
                  .length
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Settings --------------------------------- */

function SettingsView({
  searchesUsedToday,
  searchLimit,
}: {
  searchesUsedToday: number;
  searchLimit: number;
}) {
  const { user, userPlan } = useAuth();
  const [billingLoading, setBillingLoading] = useState(false);

  const planLabel =
    userPlan === "pro_plus" ? "Pro+" : userPlan === "pro" ? "Pro" : "Free";
  const limitLabel = searchLimit >= 9999 ? "Unlimited" : `${searchLimit}`;

  const handleManageBilling = async () => {
    if (!user) return;
    setBillingLoading(true);
    try {
      const response = await fetch("/api/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) {
        throw new Error(result.error || "Could not open billing portal");
      }
      window.location.href = result.url;
    } catch {
      setBillingLoading(false);
    }
  };

  return (
    <div className="mt-8 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Settings
      </h1>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-6">
        <p className="font-semibold text-foreground">Account</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Email</span>
          <span className="font-medium text-foreground">
            {user?.email ?? "—"}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-6">
        <p className="font-semibold text-foreground">Plan &amp; Usage</p>
        <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
          {planLabel} plan
        </span>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Searches this month</span>
            <span className="font-medium text-foreground">
              {searchesUsedToday} / {limitLabel}
            </span>
          </div>
          {searchLimit < 9999 && (
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, (searchesUsedToday / searchLimit) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3">
          <Button onClick={openUpgradeModal}>Upgrade Plan</Button>
          {userPlan !== "free" && (
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={billingLoading}
            >
              {billingLoading && <Loader2 className="size-4 animate-spin" />}
              Manage Subscription
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Pro+ features ------------------------------- */

function ProFeaturesView() {
  return (
    <div className="mt-8 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Pro+ Features
      </h1>
      <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#E2E8F0] py-20 text-center">
        <Lock className="size-8 text-slate-400" />
        <p className="text-lg font-semibold text-foreground">
          Pro+ Coming Soon
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Expiring domain alerts &amp; more. Upgrade when available.
        </p>
        <Button disabled>Upgrade when available</Button>
      </div>
    </div>
  );
}

/* ---------------------------------- Dashboard -------------------------------- */

const TOAST_DURATION = 4000;

export function Dashboard() {
  const router = useRouter();

  const [activeView, setActiveView] = useState<View>("search");
  const [user, setUser] = useState<User | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan>("free");
  const [searchesUsedToday, setSearchesUsedToday] = useState(0);
  const [showProWelcome, setShowProWelcome] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DomainCategory>("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ApiDomainResult[] | null>(
    null
  );
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selectedDomain, setSelectedDomain] = useState<ApiDomainResult | null>(
    null
  );
  const [analysisCache, setAnalysisCache] = useState<
    Record<string, AnalysisState>
  >({});

  const [savedDomains, setSavedDomains] = useState<SavedDomainRow[]>([]);
  const [savedDomainsLoading, setSavedDomainsLoading] = useState(false);

  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [creatingCampaign, setCreatingCampaign] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPro = userPlan === "pro" || userPlan === "pro_plus";
  const isProPlus = userPlan === "pro_plus";
  const searchLimit = PLAN_SEARCH_LIMITS[userPlan];

  const showToast = (
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    setToast({ message, action });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), TOAST_DURATION);
  };

  const refreshProfile = () => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (!data.user) {
        setUserPlan("free");
        setSearchesUsedToday(0);
        return;
      }
      supabase
        .from("profiles")
        .select("plan, searches_used_today, last_reset_date")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (!profile) return;
          if (profile.plan) setUserPlan(profile.plan as UserPlan);
          const currentMonth = new Date().toISOString().slice(0, 7);
          setSearchesUsedToday(
            profile.last_reset_date === currentMonth
              ? profile.searches_used_today ?? 0
              : 0
          );
        });
    });
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("upgraded") === "true") {
        setShowProWelcome(true);
        refreshProfile();
        window.history.replaceState({}, "", "/dashboard");
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!showProWelcome) return;
    const timeout = setTimeout(() => setShowProWelcome(false), 4000);
    return () => clearTimeout(timeout);
  }, [showProWelcome]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_domains")
      .select("id, domain, tld, notes, campaign_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSavedDomains((data as SavedDomainRow[] | null) ?? []);
        setSavedDomainsLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("campaigns")
      .select("id, name, description, niche, budget, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCampaigns((data as CampaignRow[] | null) ?? []);
      });
  }, [user]);

  const runSearch = () => {
    const trimmed = query.trim();
    if (!trimmed || isSearching) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (searchesUsedToday >= searchLimit) {
      openUpgradeModal();
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    fetch("/api/search-domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: trimmed, category, limit: 12 }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 429) {
          setSearchResults(null);
          setSearchError(
            typeof data?.error === "string"
              ? data.error
              : "Monthly search limit reached"
          );
          openUpgradeModal();
          return;
        }
        if (!response.ok || !Array.isArray(data)) {
          throw new Error(
            typeof data?.error === "string" ? data.error : "Search failed"
          );
        }
        setSearchResults(data as ApiDomainResult[]);
        setSearchesUsedToday((prev) => prev + 1);
      })
      .catch((error: Error) => {
        setSearchResults(null);
        setSearchError(error.message || "Search failed");
      })
      .finally(() => setIsSearching(false));
  };

  const requestAnalysis = (domain: string) => {
    setAnalysisCache((prev) =>
      prev[domain] === "loading" ? prev : { ...prev, [domain]: "loading" }
    );

    fetch("/api/analyze-domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data?.error) {
          if (data?.upgradeRequired) {
            showToast(
              "You've used your free analyses for this hour. Try again later.",
              { label: "Upgrade", onClick: openUpgradeModal }
            );
          }
          throw new Error(
            typeof data?.error === "string" ? data.error : "Analysis failed"
          );
        }
        setAnalysisCache((prev) => ({
          ...prev,
          [domain]: data as DomainAnalysis,
        }));
      })
      .catch(() => {
        setAnalysisCache((prev) => ({ ...prev, [domain]: "error" }));
      });
  };

  const toggleSaved = (result: ApiDomainResult) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const existing = savedDomains.find((row) => row.domain === result.domain);
    if (existing) {
      setSavedDomains((prev) => prev.filter((row) => row.id !== existing.id));
      supabase.from("saved_domains").delete().eq("id", existing.id).then(() => {});
      return;
    }

    supabase
      .from("saved_domains")
      .insert({
        user_id: user.id,
        domain: result.domain,
        tld: result.tld ?? result.domain.split(".").pop() ?? null,
      })
      .select("id, domain, tld, notes, campaign_id, created_at")
      .single()
      .then(({ data }) => {
        if (data) {
          setSavedDomains((prev) => [data as SavedDomainRow, ...prev]);
          showToast("Domain saved.");
        }
      });
  };

  const deleteSavedDomain = (id: string) => {
    setSavedDomains((prev) => prev.filter((row) => row.id !== id));
    supabase.from("saved_domains").delete().eq("id", id).then(() => {});
  };

  const updateSavedDomainNotes = (id: string, notes: string) => {
    setSavedDomains((prev) =>
      prev.map((row) => (row.id === id ? { ...row, notes } : row))
    );
    supabase.from("saved_domains").update({ notes }).eq("id", id).then(() => {});
  };

  const assignCampaign = (id: string, campaignId: string | null) => {
    setSavedDomains((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, campaign_id: campaignId } : row
      )
    );
    supabase
      .from("saved_domains")
      .update({ campaign_id: campaignId })
      .eq("id", id)
      .then(() => {});
  };

  const createCampaign = async (data: {
    name: string;
    description: string | null;
    niche: string | null;
    budget: number | null;
  }) => {
    if (!user) {
      router.push("/login");
      return;
    }
    const { data: created } = await supabase
      .from("campaigns")
      .insert({ ...data, user_id: user.id })
      .select("id, name, description, niche, budget, created_at")
      .single();

    if (created) {
      setCampaigns((prev) => [created as CampaignRow, ...prev]);
      setCreatingCampaign(false);
    }
  };

  const savedDomainSet = new Set(savedDomains.map((row) => row.domain));

  return (
    <AuthContext.Provider value={{ user, userPlan, isPro, isProPlus }}>
      <div className="min-h-screen bg-white">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        <div className="ml-60 min-h-screen p-8">
          {activeView === "search" && (
            <SearchView
              query={query}
              onQueryChange={setQuery}
              category={category}
              onCategoryChange={setCategory}
              onSearch={runSearch}
              isSearching={isSearching}
              results={searchResults}
              searchError={searchError}
              savedDomains={savedDomainSet}
              onToggleSave={toggleSaved}
              onAnalyze={setSelectedDomain}
              searchesUsedToday={searchesUsedToday}
              searchLimit={searchLimit}
            />
          )}

          {activeView === "saved" && (
            <SavedDomainsView
              records={savedDomains}
              loading={savedDomainsLoading}
              campaigns={campaigns}
              onDelete={deleteSavedDomain}
              onUpdateNotes={updateSavedDomainNotes}
              onAssignCampaign={assignCampaign}
              onStartSearching={() => setActiveView("search")}
            />
          )}

          {activeView === "campaigns" && (
            <CampaignsView
              campaigns={campaigns}
              savedDomains={savedDomains}
              creating={creatingCampaign}
              onStartCreate={() => setCreatingCampaign(true)}
              onCancelCreate={() => setCreatingCampaign(false)}
              onCreate={createCampaign}
            />
          )}

          {activeView === "settings" && (
            <SettingsView
              searchesUsedToday={searchesUsedToday}
              searchLimit={searchLimit}
            />
          )}

          {activeView === "proFeatures" && <ProFeaturesView />}
        </div>

        {selectedDomain && (
          <AnalysisModal
            domain={selectedDomain.domain}
            saved={savedDomainSet.has(selectedDomain.domain)}
            onClose={() => setSelectedDomain(null)}
            onSave={() => toggleSaved(selectedDomain)}
            analysisCache={analysisCache}
            onRequestAnalysis={requestAnalysis}
          />
        )}

        {toast && <Toast message={toast.message} action={toast.action} />}

        {showProWelcome && (
          <ProWelcomeModal onClose={() => setShowProWelcome(false)} />
        )}
      </div>
    </AuthContext.Provider>
  );
}
