"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Bookmark,
  Bot,
  Briefcase,
  Camera,
  ChevronDown,
  Crown,
  CreditCard,
  FileText,
  Flame,
  Info,
  Lightbulb,
  Lock,
  Loader2,
  LogOut,
  Mail,
  Pause,
  Pencil,
  Percent,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingUp,
  UserCog,
  X,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/Toggle";
import { openUpgradeModal } from "@/components/upgrade-modal";
import type {
  DomainAnalysis,
  DomainResult as ApiSearchResult,
} from "@/lib/types";

/* ----------------------------- Shared helpers ---------------------------- */

type UserPlan = "free" | "pro" | "pro_plus";

const AuthContext = createContext<{
  user: User | null;
  userPlan: UserPlan;
  isPro: boolean;
  isProPlus: boolean;
}>({ user: null, userPlan: "free", isPro: false, isProPlus: false });

function useAuth() {
  return useContext(AuthContext);
}

const BEGINNER_MODE_KEY = "nameflip_beginner_mode";
const BEGINNER_PROMPT_SHOWN_KEY = "nameflip_shown_beginner_prompt";

const BeginnerModeContext = createContext<{
  beginnerMode: boolean;
  setBeginnerMode: (value: boolean) => void;
}>({ beginnerMode: false, setBeginnerMode: () => {} });

function useBeginnerMode() {
  return useContext(BeginnerModeContext);
}

function isHighRiskDomain(score: number, spamRisk: RiskLevel) {
  return score < 60 || spamRisk === "high";
}

function MetricTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <span className="group relative inline-flex items-center gap-1">
      {label}
      <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600">
        ?
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 w-max max-w-[200px] -translate-x-1/2 rounded-md bg-slate-800 px-2 py-1.5 text-center text-[11px] font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {tooltip}
      </span>
    </span>
  );
}

function HighRiskHiddenCard({ index }: { index: number }) {
  return (
    <div
      className="t-card-reveal relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-5"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none p-5 blur-md"
      >
        <div className="h-5 w-32 rounded bg-slate-200" />
        <div className="mt-4 h-4 w-full rounded bg-slate-100" />
        <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
        <div className="mt-6 h-9 w-full rounded-lg bg-slate-100" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-2 text-center">
        <Shield className="size-6 text-slate-400" />
        <p className="text-sm font-semibold text-slate-500">
          High-risk domain hidden
        </p>
      </div>
    </div>
  );
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function SwapText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(4px)";
    el.style.filter = "blur(4px)";
    const raf = requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      el.style.filter = "blur(0)";
    });
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return (
    <span
      ref={ref}
      key={text}
      className="inline-block transition-all duration-150 ease-in-out"
    >
      {text}
    </span>
  );
}

function DigitPopIn({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span key={value} className="inline-flex">
      {digits.map((digit, index) => (
        <span
          key={index}
          className="t-digit"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}

const MIN_VIEWERS = 1;
const MAX_VIEWERS = 24;

function useViewerCount() {
  // Deterministic value for the server render / initial hydration pass —
  // the real random starting count is assigned client-side only, in the
  // effect below, so server and client markup always match on first paint.
  const [count, setCount] = useState(MIN_VIEWERS);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const scheduleNext = () => {
      const delay = randomInt(8000, 20000);
      timeouts.push(
        setTimeout(() => {
          setCount((prev) => {
            const roll = Math.random();
            let delta: number;
            if (roll < 0.6) {
              delta = Math.random() < 0.5 ? 1 : 2;
            } else if (roll < 0.85) {
              delta = -1;
            } else {
              delta = 0;
            }
            return Math.min(MAX_VIEWERS, Math.max(MIN_VIEWERS, prev + delta));
          });
          scheduleNext();
        }, delay)
      );
    };

    timeouts.push(
      setTimeout(() => {
        setCount(randomInt(2, 14));
      }, 0)
    );

    scheduleNext();

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return count;
}

function ViewerDigits({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span key={value} className="inline-flex">
      {digits.map((digit, index) => (
        <span
          key={index}
          className="t-viewer-digit"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}

function ViewerIndicator({ count }: { count: number }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 text-xs text-gray-500">
      <span className="viewer-dot inline-block size-1.5 shrink-0 rounded-full bg-[#10B981]" />
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <ViewerDigits value={count} /> viewing
      </span>
    </div>
  );
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
        pathLength={1}
        className="t-check-draw"
      />
    </svg>
  );
}

/* --------------------------------- Sidebar -------------------------------- */

type View =
  | "search"
  | "campaigns"
  | "saved"
  | "offers"
  | "top10"
  | "portfolio"
  | "leaseEngine"
  | "settings";

const NAV_ITEMS: {
  key: View;
  icon: typeof Search;
  label: string;
  premium?: boolean;
  badge?: number;
  badgeText?: string;
}[] = [
  { key: "search", icon: Search, label: "Search Domains" },
  { key: "campaigns", icon: Target, label: "Campaigns" },
  { key: "saved", icon: Star, label: "Saved Domains" },
  { key: "offers", icon: Mail, label: "Offers", badge: 3 },
  { key: "top10", icon: TrendingUp, label: "Daily Top 10", premium: true },
  { key: "portfolio", icon: Briefcase, label: "My Portfolio", premium: true },
  {
    key: "leaseEngine",
    icon: Zap,
    label: "Lease Engine",
    badgeText: "$495/mo",
  },
  { key: "settings", icon: Settings, label: "Settings" },
];

function UserMenu({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { beginnerMode } = useBeginnerMode();
  const { user, isPro, isProPlus } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName: string =
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    "Guest";
  const initials = displayName
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
          <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
            {displayName}
            {beginnerMode && (
              <span className="group relative inline-flex shrink-0">
                <Shield className="size-3.5 text-[#10B981]" />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 w-max max-w-[180px] -translate-x-1/2 rounded-md bg-slate-800 px-2 py-1 text-center text-[10px] font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  Beginner Safety Mode is active
                </span>
              </span>
            )}
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
        <div className="t-dropdown absolute bottom-[calc(100%-4px)] left-3 right-3 z-40 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white py-1.5 shadow-lg">
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
  const { isPro } = useAuth();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-[#E2E8F0] bg-[#F8FAFC]">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ key, icon: Icon, label, premium, badge, badgeText }) => (
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
            {premium && !isPro && (
              <Crown className="size-3.5 shrink-0 text-amber-500" />
            )}
            {!!badge && (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[11px] font-semibold text-white">
                {badge}
              </span>
            )}
            {badgeText && (
              <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                {badgeText}
              </span>
            )}
          </button>
        ))}
      </nav>

      <UserMenu onNavigate={onNavigate} />
    </aside>
  );
}

function DashboardHeader({ searchesUsed }: { searchesUsed: number }) {
  const percent = Math.min(100, (searchesUsed / 5) * 100);
  return (
    <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="whitespace-nowrap">
          Searches this month: {searchesUsed}/5
        </span>
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <Button size="sm" onClick={openUpgradeModal}>
        Upgrade to Pro
      </Button>
    </div>
  );
}

const NUDGE_DISMISSED_KEY = "nameflip:nudge-dismissed";

function UpgradeNudgeBanner() {
  const { isPro } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        if (localStorage.getItem(NUDGE_DISMISSED_KEY) === "1") {
          setDismissed(true);
        }
      } catch {
        // localStorage unavailable — keep the banner visible.
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  if (isPro || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(NUDGE_DISMISSED_KEY, "1");
    } catch {
      // Ignore — dismissal just won't persist this session.
    }
  };

  return (
    <div className="mt-4 flex h-10 items-center justify-between gap-3 border-l-[3px] border-primary bg-[#EFF6FF] px-4 text-sm text-[#1D4ED8]">
      <p className="truncate">
        You&apos;re on the Free plan — 5 searches/month, limited AI insights.{" "}
        <button
          type="button"
          onClick={openUpgradeModal}
          className="font-semibold underline-offset-2 hover:underline"
        >
          Upgrade to Pro →
        </button>
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1 text-[#1D4ED8]/60 transition-colors hover:bg-white/60 hover:text-[#1D4ED8]"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

/* ------------------------------- Mode tabs -------------------------------- */

const MODES = [
  { value: "flip", label: "Flip", dot: "bg-red-500" },
  { value: "build", label: "Build", dot: "bg-blue-500" },
  { value: "seo", label: "SEO", dot: "bg-slate-400" },
];

function ModeTabs({
  mode,
  onChange,
}: {
  mode: string;
  onChange: (mode: string) => void;
}) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[mode];
    if (el) {
      setPill({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [mode]);

  return (
    <div className="relative flex shrink-0 rounded-full border border-[#E2E8F0] bg-slate-50 p-1">
      <span
        className="t-tabs-pill absolute inset-y-1 left-0 rounded-full bg-primary"
        style={{ transform: `translateX(${pill.left}px)`, width: pill.width }}
      />
      {MODES.map((option) => (
        <button
          key={option.value}
          ref={(el) => {
            tabRefs.current[option.value] = el;
          }}
          type="button"
          onClick={() => onChange(option.value)}
          className={`relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === option.value ? "text-white" : "text-slate-600"
          }`}
        >
          <span className={`size-1.5 rounded-full ${option.dot}`} />
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* --------------------------- Live stats + trends --------------------------- */

function BeginnerModeBanner() {
  const { beginnerMode, setBeginnerMode } = useBeginnerMode();
  if (!beginnerMode) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      <span className="flex items-center gap-2">
        <Shield className="size-4 shrink-0" />
        Beginner Safety Mode is ON — we&apos;re hiding high-risk domains and
        showing guidance tips
      </span>
      <button
        type="button"
        onClick={() => setBeginnerMode(false)}
        className="shrink-0 font-semibold text-blue-700 hover:underline"
      >
        Turn off
      </button>
    </div>
  );
}

function LiveStatsBar() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs text-slate-600">
      <span className="flex items-center gap-1.5">
        <span className="viewer-dot inline-block size-2 shrink-0 rounded-full bg-red-500" />
        <span className="font-semibold text-red-600">LIVE</span>
        <span>247 domains expiring today</span>
      </span>
      <span className="hidden h-3.5 w-px bg-slate-300 sm:block" />
      <span className="flex items-center gap-1.5">
        <ArrowUpRight className="size-3.5 shrink-0 text-[#10B981]" />
        <span>34 new opportunities found in the last hour</span>
      </span>
      <span className="hidden h-3.5 w-px bg-slate-300 sm:block" />
      <span className="flex items-center gap-1.5">
        <Flame className="size-3.5 shrink-0 text-orange-500" />
        <span>
          AI trend detected: &quot;AI scheduling tools&quot;{" "}
          <span className="font-semibold text-orange-600">+430%</span>
        </span>
      </span>
    </div>
  );
}

const HOT_TRENDS: { label: string; term: string }[] = [
  { label: "AI Tools +430%", term: "AI tools" },
  { label: "SaaS Domains ↑", term: "SaaS" },
  { label: "Health Tech boom", term: "health tech" },
  { label: ".io names trending", term: ".io" },
  { label: "Short 4-letter .com ↑", term: "short .com" },
];

function HotRightNowBanner({
  onSelect,
}: {
  onSelect: (term: string) => void;
}) {
  const pills = [...HOT_TRENDS, ...HOT_TRENDS];

  return (
    <div className="mt-6">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Flame className="size-4 text-orange-500" />
        Hot Right Now
      </div>
      <div className="mt-2 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]">
        <div className="t-marquee flex w-max gap-2">
          {pills.map((pill, index) => (
            <button
              key={`${pill.term}-${index}`}
              type="button"
              onClick={() => onSelect(pill.term)}
              className="shrink-0 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-primary hover:text-primary"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Search section ---------------------------- */

const SUGGESTIONS = ["AI tools", "fitness app", "crypto"];

function SearchSection({
  value,
  onChange,
  onSearch,
  onSuggestionClick,
  isSearching,
  isShaking,
  mode,
  onModeChange,
  onCreateCampaign,
  activeCampaign,
  onClearCampaign,
}: {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onSuggestionClick: (suggestion: string) => void;
  isSearching: boolean;
  isShaking: boolean;
  mode: string;
  onModeChange: (mode: string) => void;
  onCreateCampaign: () => void;
  activeCampaign: Campaign | null;
  onClearCampaign: () => void;
}) {
  return (
    <div className="mt-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Find Your Next Opportunity
      </h1>
      <p className="mt-2 text-muted-foreground">
        AI scans 50,000+ expiring domains daily
      </p>

      <Button
        variant="outline"
        className="mt-4 border-primary text-primary hover:bg-primary/5"
        onClick={onCreateCampaign}
      >
        + Create Campaign
      </Button>

      {activeCampaign && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <span className="text-foreground">
            <Target className="mr-1.5 inline size-4 text-primary" />
            Campaign: <span className="font-semibold">{activeCampaign.name}</span>{" "}
            · ${activeCampaign.maxPerDomain}/domain
          </span>
          <button
            type="button"
            onClick={onClearCampaign}
            className="font-medium text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
        className={`mt-6 flex items-center gap-2 rounded-2xl border-2 border-[#E2E8F0] bg-white p-2 pl-5 transition-colors focus-within:border-primary ${
          isShaking ? "is-shaking" : ""
        }`}
      >
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Try 'AI tools', 'fitness app', 'crypto', 'real estate'..."
          className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <ModeTabs mode={mode} onChange={onModeChange} />
        <Button
          type="submit"
          size="lg"
          className="min-w-[120px] shrink-0 rounded-full"
          disabled={isSearching}
        >
          {isSearching && <Loader2 className="size-4 animate-spin" />}
          <SwapText text={isSearching ? "Searching..." : "Search"} />
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestionClick(suggestion)}
            className="rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-sm text-slate-600 transition-colors hover:border-primary hover:text-primary"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Campaigns -------------------------------- */

type CampaignGoal = "quick-flip" | "long-term" | "business";

interface Campaign {
  id: string;
  name: string;
  goal: CampaignGoal;
  maxTotal: number;
  maxPerDomain: number;
  includeFree: boolean;
  risk: 1 | 2 | 3;
}

interface CampaignDraft {
  goal: CampaignGoal | null;
  maxTotal: string;
  maxPerDomain: string;
  includeFree: boolean;
  risk: 1 | 2 | 3;
  name: string;
}

const GOAL_OPTIONS: {
  value: CampaignGoal;
  label: string;
  icon: typeof Zap;
  description: string;
  tag: string;
}[] = [
  {
    value: "quick-flip",
    label: "Quick Flip",
    icon: Zap,
    description:
      "Find domains I can buy cheap and sell fast. Target: $200–$2,000 profit within 30 days.",
    tag: "Best for beginners",
  },
  {
    value: "long-term",
    label: "Long-Term Portfolio",
    icon: TrendingUp,
    description:
      "Build a portfolio of valuable domains that grow over time. Target: $5,000–$50,000 exits.",
    tag: "Higher reward",
  },
  {
    value: "business",
    label: "Business Domain",
    icon: Briefcase,
    description:
      "Find the perfect domain for a real business or project I'm building.",
    tag: "For builders",
  },
];

const GOAL_META: Record<
  CampaignGoal,
  { label: string; pillClass: string }
> = {
  "quick-flip": {
    label: "Quick Flip",
    pillClass: "bg-red-100 text-red-700",
  },
  "long-term": {
    label: "Long-Term Portfolio",
    pillClass: "bg-emerald-100 text-emerald-700",
  },
  business: {
    label: "Business Domain",
    pillClass: "bg-blue-100 text-blue-700",
  },
};

const RISK_LABELS: Record<1 | 2 | 3, string> = {
  1: "Conservative",
  2: "Balanced",
  3: "Aggressive",
};

const RISK_DESCRIPTIONS: Record<1 | 2 | 3, string> = {
  1: "Only domains with proven demand and low spam risk. Slower but safer profits. Ideal for first-time flippers.",
  2: "Mix of proven and emerging opportunities. Good returns with moderate risk.",
  3: "Trending and speculative domains. Higher potential profit but domains may take longer to sell.",
};

const RISK_BADGE_CLASS: Record<1 | 2 | 3, string> = {
  1: "bg-emerald-100 text-emerald-700",
  2: "bg-amber-100 text-amber-700",
  3: "bg-red-100 text-red-700",
};

const BUDGET_PRESETS: { label: string; total: string; perDomain: string }[] = [
  { label: "$50 starter", total: "50", perDomain: "10" },
  { label: "$200 standard", total: "200", perDomain: "50" },
  { label: "$500 growth", total: "500", perDomain: "100" },
];

const WIZARD_STEP_LABELS = ["Goal", "Budget", "Risk", "Name"];

function CampaignWizardModal({
  onClose,
  onLaunch,
}: {
  onClose: () => void;
  onLaunch: (draft: CampaignDraft) => void;
}) {
  const { beginnerMode } = useBeginnerMode();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<CampaignDraft>({
    goal: null,
    maxTotal: "",
    maxPerDomain: "",
    includeFree: true,
    risk: 1,
    name: "",
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const canProceedStep1 = draft.goal !== null;
  const canLaunch = draft.name.trim().length > 0;

  const applyPreset = (preset: (typeof BUDGET_PRESETS)[number]) => {
    setDraft((d) => ({
      ...d,
      maxTotal: preset.total,
      maxPerDomain: preset.perDomain,
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 py-10">
      <div className="fixed inset-0 bg-black/50 t-overlay-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[560px] rounded-2xl bg-white shadow-2xl t-modal-in">
        <div className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] p-6 pb-4">
          <h2 className="text-xl font-bold text-foreground">
            Create Campaign
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Step {step} of 4
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {WIZARD_STEP_LABELS.map((label, index) => (
              <div key={label} className="flex flex-1 flex-col gap-1.5">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    step > index ? "bg-primary" : "bg-slate-200"
                  }`}
                />
                <span
                  className={`text-[11px] font-medium ${
                    step === index + 1
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                What&apos;s your flipping goal?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This tells AI how to find and evaluate domains for you.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {GOAL_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = draft.goal === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({ ...d, goal: option.value }))
                      }
                      className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-colors ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-[#E2E8F0] hover:border-primary/40"
                      }`}
                    >
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                          selected
                            ? "bg-primary text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-foreground">
                            {option.label}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {option.tag}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                What&apos;s your budget?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                AI will only show domains within your price range.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Max total budget
                  </span>
                  <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-white px-3 focus-within:border-primary">
                    <span className="text-muted-foreground">$</span>
                    <input
                      type="number"
                      min={0}
                      value={draft.maxTotal}
                      onChange={(event) =>
                        setDraft((d) => ({
                          ...d,
                          maxTotal: event.target.value,
                        }))
                      }
                      placeholder="500"
                      className="w-full bg-transparent px-2 py-2.5 text-base text-foreground focus:outline-none"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Max per domain
                  </span>
                  <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-white px-3 focus-within:border-primary">
                    <span className="text-muted-foreground">$</span>
                    <input
                      type="number"
                      min={0}
                      value={draft.maxPerDomain}
                      onChange={(event) =>
                        setDraft((d) => ({
                          ...d,
                          maxPerDomain: event.target.value,
                        }))
                      }
                      placeholder="50"
                      className="w-full bg-transparent px-2 py-2.5 text-base text-foreground focus:outline-none"
                    />
                  </div>
                </label>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] p-4">
                <p className="text-sm font-medium text-foreground">
                  Include free domains ($0–$1)
                </p>
                <Toggle
                  on={draft.includeFree}
                  onChange={(val) =>
                    setDraft((d) => ({ ...d, includeFree: val }))
                  }
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-sm text-slate-600 transition-colors hover:border-primary hover:text-primary"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {beginnerMode && Number(draft.maxTotal) > 200 && (
                <p className="mt-4 flex items-start gap-1.5 text-xs font-medium text-amber-700">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  Tip: As a beginner, starting with under $200 reduces risk
                  while you learn.
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                How much risk can you handle?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This controls how experimental the AI gets with domain
                suggestions.
              </p>

              <div className="mt-8">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  value={draft.risk}
                  onChange={(event) =>
                    setDraft((d) => ({
                      ...d,
                      risk: Number(event.target.value) as 1 | 2 | 3,
                    }))
                  }
                  className="h-2 w-full cursor-pointer accent-primary"
                />
                <div className="mt-2 flex justify-between text-sm">
                  {([1, 2, 3] as const).map((level) => (
                    <span
                      key={level}
                      className={
                        draft.risk === level
                          ? "font-semibold text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      {RISK_LABELS[level]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  {RISK_DESCRIPTIONS[draft.risk]}
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                Almost done — name your campaign
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Give this campaign a name so you can track your progress.
              </p>

              <div className="relative mt-6">
                <Pencil className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((d) => ({ ...d, name: event.target.value }))
                  }
                  placeholder="e.g. Week 1 — Quick Flips"
                  className="w-full rounded-xl border-2 border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-base text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mt-5 flex flex-col gap-2 rounded-xl bg-slate-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goal</span>
                  <span className="font-medium text-foreground">
                    {draft.goal ? GOAL_META[draft.goal].label : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium text-foreground">
                    ${draft.maxPerDomain || 0} per domain / $
                    {draft.maxTotal || 0} total
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk</span>
                  <span className="font-medium text-foreground">
                    {RISK_LABELS[draft.risk]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Free domains</span>
                  <span className="font-medium text-foreground">
                    {draft.includeFree ? "Included" : "Not included"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0] p-6">
          {step === 1 ? (
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          ) : (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </Button>
          )}

          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && !canProceedStep1}
            >
              Next →
            </Button>
          ) : (
            <Button
              className="bg-[#10B981] text-white hover:bg-[#10B981]/90"
              disabled={!canLaunch}
              onClick={() => onLaunch(draft)}
            >
              Launch Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CampaignSuccessFlash() {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-white/95 t-overlay-in">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-20 items-center justify-center rounded-full bg-[#10B981]/10">
          <CheckIcon className="size-10 text-[#10B981]" />
        </div>
        <p className="text-lg font-semibold text-foreground">
          Campaign created!
        </p>
      </div>
    </div>
  );
}

function CampaignCard({
  campaign,
  onFindDomains,
}: {
  campaign: Campaign;
  onFindDomains: () => void;
}) {
  const goalMeta = GOAL_META[campaign.goal];
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <h3 className="text-lg font-bold text-foreground">{campaign.name}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${goalMeta.pillClass}`}
        >
          {goalMeta.label}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${RISK_BADGE_CLASS[campaign.risk]}`}
        >
          {RISK_LABELS[campaign.risk]} risk
        </span>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        ${campaign.maxPerDomain} per domain
      </p>

      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span>0 domains found</span>
        <span>0 saved</span>
        <span>$0 potential value</span>
      </div>

      <Button className="mt-4 w-full" onClick={onFindDomains}>
        Find Domains →
      </Button>
    </div>
  );
}

function CampaignsView({
  campaigns,
  onNewCampaign,
  onFindDomains,
}: {
  campaigns: Campaign[];
  onNewCampaign: () => void;
  onFindDomains: (campaign: Campaign) => void;
}) {
  if (campaigns.length === 0) {
    return (
      <EmptyState
        title="My Campaigns"
        message="No campaigns yet. Create your first campaign to get started."
      >
        <Button onClick={onNewCampaign}>+ Create Campaign</Button>
      </EmptyState>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Campaigns
        </h1>
        <Button onClick={onNewCampaign}>+ New Campaign</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onFindDomains={() => onFindDomains(campaign)}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Result card ------------------------------ */

interface DomainResult {
  domain: string;
  availability: "Available" | "Auction";
  score: number;
  tag: "Flip" | "Build";
  value: string;
  insight: string;
  // Present only for cards sourced from a live /api/search-domains result —
  // used to build a fallback enrichment record when the domain isn't in the
  // static DOMAIN_DETAILS mock table, and to trigger the live availability
  // check badge instead of the static Available/Auction pill.
  isLive?: boolean;
  liveAge?: number;
  liveBacklinks?: number;
}

interface SelectedDomain {
  domain: string;
  availability: "Available" | "Auction";
  score: number;
  value: string;
}

const DOMAINS: DomainResult[] = [
  {
    domain: "ailaunch.io",
    availability: "Available",
    score: 91,
    tag: "Flip",
    value: "$1,200–2,400",
    insight: "Short, brandable, high search trend ↑63%",
  },
  {
    domain: "startupforge.co",
    availability: "Available",
    score: 84,
    tag: "Build",
    value: "$800–1,600",
    insight: "Strong for SaaS, 142 referring domains",
  },
  {
    domain: "buildfast.ai",
    availability: "Auction",
    score: 88,
    tag: "Flip",
    value: "$2,100–3,800",
    insight: "Premium .ai extension, auction ends in 2 days",
  },
  {
    domain: "aitools.io",
    availability: "Available",
    score: 79,
    tag: "Flip",
    value: "$600–1,100",
    insight: "Exact match keyword, growing search volume",
  },
  {
    domain: "launchpad.ai",
    availability: "Auction",
    score: 93,
    tag: "Flip",
    value: "$3,200–5,500",
    insight: "Top score — high demand, multiple active bidders",
  },
  {
    domain: "nova-ai.co",
    availability: "Available",
    score: 72,
    tag: "Build",
    value: "$400–800",
    insight: "Good for AI startup branding, clean history",
  },
];

// Turns a raw /api/search-domains result into the card-shaped DomainResult
// the rest of the UI already knows how to render, so ResultCard/ResultsSection
// don't need to change shape — only where their data comes from.
function mapApiDomainToCard(
  api: ApiSearchResult,
  mode: string
): DomainResult {
  const tag: "Flip" | "Build" = mode === "build" ? "Build" : "Flip";
  const scoreRaw =
    50 + Math.min(30, api.referringDomains / 8) + Math.min(15, api.age * 1.5);
  const score = Math.max(40, Math.min(97, Math.round(scoreRaw)));
  const low = Math.max(50, Math.round(api.auctionPrice * 3));
  const high = Math.max(low + 100, Math.round(api.auctionPrice * 7));

  return {
    domain: api.domain,
    availability: "Available",
    score,
    tag,
    value: `$${low.toLocaleString()}–${high.toLocaleString()}`,
    insight: "",
    isLive: true,
    liveAge: api.age,
    liveBacklinks: api.referringDomains,
  };
}

// Live search results won't exist in the static DOMAIN_DETAILS mock table —
// this builds a reasonable stand-in from whatever the API actually returned,
// so the existing detail card/modal never crash on an unknown domain.
function buildFallbackDetail(
  value: string,
  liveAge?: number,
  liveBacklinks?: number
): DomainEnrichment {
  return {
    age: `${liveAge ?? 1} year${liveAge === 1 ? "" : "s"}`,
    backlinks: liveBacklinks ?? 10,
    trend: "↑ New",
    aiAnalysis:
      'Run "Analyze with AI" for a full breakdown of this domain.',
    flip: { range: value, timeToSell: "4–8 weeks", confidence: 55 },
    build: {
      description: "Potential build use pending AI analysis.",
      potentialValue: "TBD",
    },
    recommended: "flip",
    comparables: [],
    risk: { spam: "low", demand: "med", competition: "med" },
  };
}

function parseValueLow(value: string) {
  const numbers = value
    .replace(/[$,]/g, "")
    .split(/[–-]/)
    .map((part) => Number(part.trim()))
    .filter((num) => !Number.isNaN(num));
  return numbers.length ? Math.min(...numbers) : 0;
}

function computeCurrentBid(value: string) {
  const low = parseValueLow(value);
  return Math.max(15, Math.round((low * 0.08) / 5) * 5);
}

function getOpportunityTags(tag: "Flip" | "Build", detail: DomainEnrichment) {
  const tags: { label: string; className: string }[] = [
    tag === "Flip"
      ? { label: "Flipable", className: "bg-red-100 text-red-700" }
      : { label: "Buildable", className: "bg-blue-100 text-blue-700" },
  ];
  if (detail.backlinks >= 100) {
    tags.push({ label: "SEO Value", className: "bg-indigo-100 text-indigo-700" });
  }
  const trendPercent = Number(detail.trend.replace(/[^\d]/g, "")) || 0;
  if (trendPercent >= 40) {
    tags.push({ label: "Trending", className: "bg-orange-100 text-orange-700" });
  }
  return tags;
}

function scoreVisual(score: number) {
  if (score >= 80) return { hex: "#10B981", border: "border-l-[#10B981]" };
  if (score >= 60) return { hex: "#F59E0B", border: "border-l-[#F59E0B]" };
  return { hex: "#EF4444", border: "border-l-[#EF4444]" };
}

function AnalyzeButton({
  onOpenDetail,
  compact,
}: {
  onOpenDetail: () => void;
  compact?: boolean;
}) {
  const { isPro } = useAuth();
  if (isPro) {
    return (
      <Button
        size={compact ? "sm" : "default"}
        className="flex-1"
        onClick={(event) => {
          event.stopPropagation();
          onOpenDetail();
        }}
      >
        Analyze with AI →
      </Button>
    );
  }

  return (
    <div className="relative flex-1">
      <Button
        size={compact ? "sm" : "default"}
        className="pointer-events-none w-full select-none blur-[2px]"
        tabIndex={-1}
      >
        Analyze with AI →
      </Button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          openUpgradeModal();
        }}
        className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-lg bg-white/50"
      >
        <Lock className="size-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">Pro only</span>
      </button>
    </div>
  );
}

function SaveButton({ saved, onToggle }: { saved: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
        saved
          ? "border-[#A7F3D0] bg-[#D1FAE5] text-emerald-800"
          : "border-[#E2E8F0] bg-white text-foreground hover:bg-slate-50"
      }`}
    >
      {saved ? (
        <CheckIcon className="size-4" />
      ) : (
        <Bookmark className="size-4" />
      )}
      <SwapText text={saved ? "Saved" : "Save"} />
    </button>
  );
}

type LiveAvailability =
  | { status: "loading" }
  | { status: "available"; price: number | null }
  | { status: "taken"; expiryDate: string | null }
  | { status: "error" };

function ResultCard({
  domain,
  availability,
  score,
  tag,
  value,
  index,
  saved,
  isLive,
  liveAge,
  liveBacklinks,
  onToggleSave,
  onOpenDetail,
}: DomainResult & {
  index: number;
  saved: boolean;
  onToggleSave: () => void;
  onOpenDetail: () => void;
}) {
  const { beginnerMode } = useBeginnerMode();
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const viewerCount = useViewerCount();
  const isAuction = availability === "Auction";
  const detail =
    DOMAIN_DETAILS[domain] ?? buildFallbackDetail(value, liveAge, liveBacklinks);
  const { hex: scoreColor, border: scoreBorderClass } = scoreVisual(score);
  const tags = getOpportunityTags(tag, detail);
  const currentBid = computeCurrentBid(value);
  const highRisk = isHighRiskDomain(score, detail.risk.spam);

  const [liveAvailability, setLiveAvailability] =
    useState<LiveAvailability | null>(isLive ? { status: "loading" } : null);

  useEffect(() => {
    if (!isLive) return;
    let cancelled = false;

    fetch("/api/check-domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.available) {
          setLiveAvailability({
            status: "available",
            price: typeof data.price === "number" ? data.price : null,
          });
        } else if (data?.available === false) {
          setLiveAvailability({
            status: "taken",
            expiryDate: data.expiryDate ?? null,
          });
        } else {
          setLiveAvailability({ status: "error" });
        }
      })
      .catch(() => {
        if (!cancelled) setLiveAvailability({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [domain, isLive]);

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 6;
    const rotateX = (0.5 - py) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.15), transparent 60%)`;
    }
  };

  const handleMouseEnter = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 60ms linear";
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) {
      card.style.transition =
        "transform 1000ms cubic-bezier(0.34, 1.56, 0.64, 1)";
      card.style.transform =
        "perspective(800px) rotateX(0deg) rotateY(0deg)";
    }
    if (glareRef.current) {
      glareRef.current.style.background = "transparent";
    }
  };

  if (beginnerMode && highRisk) {
    return <HighRiskHiddenCard index={index} />;
  }

  return (
    <div
      ref={cardRef}
      onClick={onOpenDetail}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`t-card-reveal relative cursor-pointer rounded-xl border border-[#E2E8F0] border-l-4 ${scoreBorderClass} bg-white p-5 will-change-transform`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{ mixBlendMode: "screen" }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">{domain}</h3>
            {liveAvailability ? (
              liveAvailability.status === "loading" ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
              ) : liveAvailability.status === "available" ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block rounded-full bg-[#10B981]/10 px-2 py-0.5 text-xs font-medium text-[#10B981]">
                    Available
                  </span>
                  <a
                    href={`https://www.namecheap.com/domains/registration/results/?domain=${domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Register for $
                    {liveAvailability.price ?? 12}
                  </a>
                </span>
              ) : liveAvailability.status === "taken" ? (
                <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                  Taken
                  {liveAvailability.expiryDate
                    ? ` — expires ${new Date(liveAvailability.expiryDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
                    : " — check auction"}
                </span>
              ) : (
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    isAuction
                      ? "bg-orange-100 text-orange-700"
                      : "bg-[#10B981]/10 text-[#10B981]"
                  }`}
                >
                  {availability}
                </span>
              )
            ) : (
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  isAuction
                    ? "bg-orange-100 text-orange-700"
                    : "bg-[#10B981]/10 text-[#10B981]"
                }`}
              >
                {availability}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tags.map((cardTag) => (
              <span
                key={cardTag.label}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cardTag.className}`}
              >
                {cardTag.label}
              </span>
            ))}
            {beginnerMode && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  score >= 80
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {score >= 80 ? "Low Risk" : "Moderate — research first"}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <ViewerIndicator count={viewerCount} />
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: scoreColor }}
          >
            <DigitPopIn value={score} />
          </div>
          {beginnerMode && (
            <span className="text-[10px] text-muted-foreground">
              <MetricTooltip
                label="Score"
                tooltip="Our AI rating from 0-100. 80+ is ideal for beginners."
              />
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 border-t border-[#E2E8F0] pt-4 text-center text-xs">
        <div>
          <p className="text-muted-foreground">
            {beginnerMode ? (
              <MetricTooltip
                label="Age"
                tooltip="Older domains often have more trust and SEO history."
              />
            ) : (
              "Age"
            )}
          </p>
          <p className="mt-0.5 font-semibold text-foreground">{detail.age}</p>
        </div>
        <div>
          <p className="text-muted-foreground">
            {beginnerMode ? (
              <MetricTooltip
                label="Backlinks"
                tooltip="Websites linking to this domain. More = more SEO value."
              />
            ) : (
              "Backlinks"
            )}
          </p>
          <p className="mt-0.5 font-semibold text-foreground">
            {detail.backlinks}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Search Trend</p>
          <p className="mt-0.5 font-semibold text-[#10B981]">
            {detail.trend}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">
            {beginnerMode ? (
              <MetricTooltip
                label="Auction Price"
                tooltip="Current bid. Resale value is usually 3-10x this amount."
              />
            ) : (
              "Auction Price"
            )}
          </p>
          <p className="mt-0.5 font-semibold text-foreground">
            ${currentBid}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
        <p className="text-xs text-muted-foreground">
          Current bid:{" "}
          <span className="font-semibold text-foreground">${currentBid}</span>
          <span className="mx-1.5">·</span>
          Est. resale:{" "}
          <span className="font-semibold text-foreground">{value}</span>
        </p>
        <div
          className="flex w-full gap-2 sm:w-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <SaveButton saved={saved} onToggle={onToggleSave} />
          <AnalyzeButton onOpenDetail={onOpenDetail} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Skeleton --------------------------------- */

function SkeletonCard() {
  return (
    <div className="t-skel-skeleton is-pulsing rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded-full bg-slate-200" />
        </div>
        <div className="size-12 shrink-0 rounded-full bg-slate-200" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="h-6 w-16 rounded-full bg-slate-200" />
        <div className="h-4 w-24 rounded bg-slate-200" />
      </div>
      <div className="mt-3 h-4 w-full rounded bg-slate-200" />
      <div className="mt-4 flex gap-2">
        <div className="h-9 flex-1 rounded-lg bg-slate-200" />
        <div className="h-9 flex-1 rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

/* ------------------------------- Results section --------------------------- */

const AI_SUMMARY_PLAIN =
  'AI Analysis: The "AI tools" niche shows strong domain opportunity. Best flip candidate is launchpad.ai (score 93). If building a business, startupforge.co has the strongest backlink foundation.';

function parseValueHigh(value: string) {
  const numbers = value
    .replace(/[$,]/g, "")
    .split(/[–-]/)
    .map((part) => Number(part.trim()))
    .filter((num) => !Number.isNaN(num));
  return numbers.length ? Math.max(...numbers) : 0;
}

type SortOption = "score" | "value" | "newest";

function sortDomains(domains: DomainResult[], sortBy: SortOption) {
  const sorted = [...domains];
  if (sortBy === "score") {
    sorted.sort((a, b) => b.score - a.score);
  } else if (sortBy === "value") {
    sorted.sort((a, b) => parseValueHigh(b.value) - parseValueHigh(a.value));
  } else {
    sorted.reverse();
  }
  return sorted;
}

function ResultsSection({
  query,
  loadingQuery,
  isSearching,
  showSkeleton,
  skeletonFading,
  revealKey,
  mode,
  savedDomains,
  liveResults,
  searchApiError,
  onToggleSave,
  onOpenDetail,
  onRetrySearch,
}: {
  query: string;
  loadingQuery: string;
  isSearching: boolean;
  showSkeleton: boolean;
  skeletonFading: boolean;
  revealKey: number;
  mode: string;
  savedDomains: Set<string>;
  liveResults: DomainResult[] | null;
  searchApiError: string | null;
  onToggleSave: (domain: string) => void;
  onOpenDetail: (data: SelectedDomain) => void;
  onRetrySearch: () => void;
}) {
  const [sortBy, setSortBy] = useState<SortOption>("score");

  const source = liveResults ?? DOMAINS;
  const filtered =
    mode === "seo"
      ? []
      : source.filter((result) => result.tag.toLowerCase() === mode);
  const results = sortDomains(filtered, sortBy);
  const emptyMessage =
    liveResults && mode !== "seo"
      ? "No results found for this search. Try a different keyword."
      : "No SEO-focused domains in this result set yet. Try the Flip or Build tab.";

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Results for &quot;{query}&quot;
          </h2>
          <p className="text-sm text-muted-foreground">
            {results.length} opportunit{results.length === 1 ? "y" : "ies"} found
            {liveResults && (
              <span className="ml-2 text-xs text-primary">
                Searched for: &quot;{query}&quot;
              </span>
            )}
          </p>
        </div>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortOption)}
          className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-foreground focus:outline-none"
        >
          <option value="score">Sort by: Best Score</option>
          <option value="value">Sort by: Estimated Value</option>
          <option value="newest">Sort by: Newest</option>
        </select>
      </div>

      {searchApiError && !isSearching && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>{searchApiError} — showing sample opportunities instead.</span>
          <button
            type="button"
            onClick={onRetrySearch}
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {showSkeleton && (
        <div
          className={`transition-all duration-[400ms] ${
            skeletonFading ? "opacity-0 blur-sm" : "opacity-100 blur-0"
          }`}
        >
          <p className="mt-4 text-sm text-muted-foreground">
            AI is finding opportunities for &quot;{loadingQuery}&quot;...
          </p>
          <div className="mt-2 grid gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div key={revealKey} className="t-fade-blur-in mt-6 grid gap-4">
          {results.map((result, index) => (
            <ResultCard
              key={result.domain}
              {...result}
              index={index}
              saved={savedDomains.has(result.domain)}
              onToggleSave={() => onToggleSave(result.domain)}
              onOpenDetail={() =>
                onOpenDetail({
                  domain: result.domain,
                  availability: result.availability,
                  score: result.score,
                  value: result.value,
                })
              }
            />
          ))}
        </div>
      )}

      {!isSearching && results.length === 0 && (
        <div
          key={revealKey}
          className="t-fade-blur-in mt-6 rounded-xl border border-dashed border-[#E2E8F0] py-14 text-center text-sm text-muted-foreground"
        >
          {emptyMessage}
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 rounded-xl bg-[#EFF6FF] p-4">
        <Bot className="size-5 shrink-0 text-primary" />
        {isSearching ? (
          <p className="text-sm">
            <span className="t-shimmer" data-text={AI_SUMMARY_PLAIN}>
              {AI_SUMMARY_PLAIN}
            </span>
          </p>
        ) : (
          <p className="text-sm text-slate-700">
            <span className="font-semibold">AI Analysis:</span> The &quot;AI
            tools&quot; niche shows strong domain opportunity. Best flip
            candidate is <span className="font-semibold">launchpad.ai</span>{" "}
            (score 93). If building a business,{" "}
            <span className="font-semibold">startupforge.co</span> has the
            strongest backlink foundation.
          </p>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Domain detail data --------------------------- */

type RiskLevel = "low" | "med" | "high";

interface DomainEnrichment {
  age: string;
  backlinks: number;
  trend: string;
  aiAnalysis: string;
  flip: { range: string; timeToSell: string; confidence: number };
  build: { description: string; potentialValue: string };
  recommended: "flip" | "build";
  comparables: { domain: string; price: string; date: string }[];
  risk: { spam: RiskLevel; demand: RiskLevel; competition: RiskLevel };
}

const DOMAIN_DETAILS: Record<string, DomainEnrichment> = {
  "ailaunch.io": {
    age: "3 years",
    backlinks: 142,
    trend: "↑63%",
    aiAnalysis:
      "ailaunch.io pairs a high-intent AI keyword with a short, brandable .io extension. Search interest for “AI launch” terms has grown 63% this quarter, and similarly structured domains have consistently resold in the low four figures. A clean backlink profile keeps flip risk low.",
    flip: { range: "$1,200–2,400", timeToSell: "4–8 weeks", confidence: 82 },
    build: {
      description:
        "A natural fit for an AI product launch directory or a newsletter covering new AI tool releases.",
      potentialValue: "$15K–40K ARR in year one as a niche directory",
    },
    recommended: "flip",
    comparables: [
      { domain: "airelease.io", price: "$1,850", date: "Sep 2026" },
      { domain: "launchmy.ai", price: "$2,100", date: "Aug 2026" },
      { domain: "aidebut.io", price: "$1,400", date: "Jul 2026" },
      { domain: "newai.io", price: "$3,200", date: "Jun 2026" },
    ],
    risk: { spam: "low", demand: "high", competition: "med" },
  },
  "startupforge.co": {
    age: "2 years",
    backlinks: 142,
    trend: "↑38%",
    aiAnalysis:
      "startupforge.co has strong topical relevance for SaaS and startup tooling, backed by 142 referring domains from relevant tech blogs. It reads better as a long-term brand than a quick flip, and the .co extension is well accepted in the startup space.",
    flip: { range: "$800–1,600", timeToSell: "8–12 weeks", confidence: 58 },
    build: {
      description:
        "Ideal for a startup tools directory, SaaS launch community, or founder resource hub.",
      potentialValue: "$25K–60K ARR as a subscription resource hub",
    },
    recommended: "build",
    comparables: [
      { domain: "founderforge.co", price: "$1,100", date: "Sep 2026" },
      { domain: "saaslaunchpad.co", price: "$950", date: "Aug 2026" },
      { domain: "startuprail.co", price: "$1,300", date: "Jul 2026" },
      { domain: "buildstartup.io", price: "$1,750", date: "May 2026" },
    ],
    risk: { spam: "low", demand: "med", competition: "med" },
  },
  "buildfast.ai": {
    age: "4 years",
    backlinks: 96,
    trend: "↑45%",
    aiAnalysis:
      "buildfast.ai is a premium two-word .ai domain with an active auction and multiple bidders already engaged. “Build fast” resonates strongly with the no-code and AI-assisted development space, which has seen rapid search growth.",
    flip: {
      range: "$2,100–3,800",
      timeToSell: "2–5 weeks (auction)",
      confidence: 76,
    },
    build: {
      description:
        "Well suited to a rapid-prototyping tool, AI coding assistant, or no-code app builder brand.",
      potentialValue: "$40K+ ARR if paired with an existing dev-tool product",
    },
    recommended: "flip",
    comparables: [
      { domain: "shipfast.ai", price: "$2,900", date: "Sep 2026" },
      { domain: "quickbuild.ai", price: "$2,300", date: "Aug 2026" },
      { domain: "fastship.io", price: "$1,950", date: "Jul 2026" },
      { domain: "rapidbuild.ai", price: "$3,600", date: "Jun 2026" },
    ],
    risk: { spam: "low", demand: "high", competition: "med" },
  },
  "aitools.io": {
    age: "1 year",
    backlinks: 54,
    trend: "↑29%",
    aiAnalysis:
      "aitools.io is a broad exact-match keyword domain with growing search volume as AI tool discovery searches increase. Its youth and moderate backlink count keep it mid-score, but the generic keyword match keeps flip demand steady.",
    flip: { range: "$600–1,100", timeToSell: "6–10 weeks", confidence: 65 },
    build: {
      description:
        "Could anchor a general AI tool directory or comparison site in a crowded but high-traffic niche.",
      potentialValue: "$10K–25K ARR via affiliate listings",
    },
    recommended: "flip",
    comparables: [
      { domain: "toolsforai.io", price: "$780", date: "Sep 2026" },
      { domain: "aiappdirectory.com", price: "$920", date: "Aug 2026" },
      { domain: "besttools.ai", price: "$1,050", date: "Jul 2026" },
      { domain: "aicatalog.io", price: "$690", date: "Jun 2026" },
    ],
    risk: { spam: "med", demand: "med", competition: "high" },
  },
  "launchpad.ai": {
    age: "5 years",
    backlinks: 187,
    trend: "↑71%",
    aiAnalysis:
      "launchpad.ai is the highest-scoring opportunity today — a memorable, dictionary-word .ai domain with an active multi-bidder auction. Age, backlink profile and category-defining phrasing all point to demand well above the typical .ai domain.",
    flip: {
      range: "$3,200–5,500",
      timeToSell: "1–4 weeks (auction)",
      confidence: 91,
    },
    build: {
      description:
        "Strong foundation for an AI accelerator, startup launch platform, or AI product marketplace.",
      potentialValue: "$80K+ ARR as a launch/marketplace platform",
    },
    recommended: "flip",
    comparables: [
      { domain: "ignite.ai", price: "$4,800", date: "Sep 2026" },
      { domain: "liftoff.ai", price: "$3,900", date: "Aug 2026" },
      { domain: "boost.ai", price: "$6,200", date: "Jul 2026" },
      { domain: "spark.ai", price: "$5,100", date: "May 2026" },
    ],
    risk: { spam: "low", demand: "high", competition: "low" },
  },
  "nova-ai.co": {
    age: "1 year",
    backlinks: 22,
    trend: "↑18%",
    aiAnalysis:
      "nova-ai.co has a clean registration history and a catchy, brandable name, but the hyphen and lighter backlink profile keep resale value modest. It reads better as a long-term brand build than a quick flip.",
    flip: { range: "$400–800", timeToSell: "10–14 weeks", confidence: 41 },
    build: {
      description:
        "A solid brandable base for an AI startup — the hyphenated .co works well for early-stage products.",
      potentialValue: "$8K–20K ARR as an early-stage SaaS brand",
    },
    recommended: "build",
    comparables: [
      { domain: "nova-labs.co", price: "$520", date: "Sep 2026" },
      { domain: "getnova.ai", price: "$1,900", date: "Aug 2026" },
      { domain: "nova-app.io", price: "$680", date: "Jul 2026" },
      { domain: "novahq.co", price: "$450", date: "Jun 2026" },
    ],
    risk: { spam: "low", demand: "low", competition: "med" },
  },
  "healthlane.io": {
    age: "3 years",
    backlinks: 168,
    trend: "↑52%",
    aiAnalysis:
      "healthlane.io combines a health-niche keyword with a professional .io extension, backed by strong referring domains from wellness publications. Digital health search demand keeps climbing, making this a strong target for telehealth or wellness brands.",
    flip: { range: "$2,800–4,200", timeToSell: "3–6 weeks", confidence: 79 },
    build: {
      description:
        "Great fit for a telehealth platform, wellness marketplace, or health content hub.",
      potentialValue: "$50K+ ARR as a health services platform",
    },
    recommended: "flip",
    comparables: [
      { domain: "wellnesslane.io", price: "$3,100", date: "Sep 2026" },
      { domain: "healthhub.co", price: "$2,600", date: "Aug 2026" },
      { domain: "medlane.io", price: "$3,900", date: "Jul 2026" },
      { domain: "carepath.io", price: "$3,400", date: "Jun 2026" },
    ],
    risk: { spam: "low", demand: "high", competition: "med" },
  },
  "cryptopulse.io": {
    age: "2 years",
    backlinks: 130,
    trend: "↑47%",
    aiAnalysis:
      "cryptopulse.io captures rising interest in crypto market-tracking tools with a punchy, brandable name. Backlink growth has accelerated alongside renewed crypto market activity, making this a timely flip opportunity.",
    flip: { range: "$2,100–3,800", timeToSell: "3–7 weeks", confidence: 74 },
    build: {
      description:
        "Suited to a crypto market dashboard, price-alert tool, or trading signal newsletter.",
      potentialValue: "$30K–70K ARR via subscription alerts",
    },
    recommended: "flip",
    comparables: [
      { domain: "cryptosignal.io", price: "$2,400", date: "Sep 2026" },
      { domain: "coinpulse.co", price: "$1,900", date: "Aug 2026" },
      { domain: "marketpulse.ai", price: "$3,300", date: "Jul 2026" },
      { domain: "tokentrack.io", price: "$2,750", date: "Jun 2026" },
    ],
    risk: { spam: "med", demand: "high", competition: "high" },
  },
  "novahealth.co": {
    age: "2 years",
    backlinks: 88,
    trend: "↑34%",
    aiAnalysis:
      "novahealth.co blends a modern brandable prefix with a clear health-industry signal. It's gaining organic backlinks from health directories, and the .co extension is increasingly accepted for health-tech startups.",
    flip: { range: "$900–1,800", timeToSell: "6–9 weeks", confidence: 60 },
    build: {
      description:
        "A strong brand base for a digital health startup, clinic booking platform, or wellness app.",
      potentialValue: "$20K–45K ARR as a booking or wellness app",
    },
    recommended: "build",
    comparables: [
      { domain: "healthnova.io", price: "$1,600", date: "Sep 2026" },
      { domain: "carenova.co", price: "$1,100", date: "Aug 2026" },
      { domain: "novaclinic.io", price: "$1,950", date: "Jul 2026" },
      { domain: "wellnova.co", price: "$850", date: "Jun 2026" },
    ],
    risk: { spam: "low", demand: "med", competition: "med" },
  },
  "fintechly.io": {
    age: "1 year",
    backlinks: 61,
    trend: "↑26%",
    aiAnalysis:
      "fintechly.io is a clean, keyword-rich domain for the fintech space with steadily growing backlinks from finance blogs. It's young, but the exact-niche match keeps demand consistent among fintech founders.",
    flip: { range: "$700–1,400", timeToSell: "7–11 weeks", confidence: 55 },
    build: {
      description:
        "Fits a fintech news outlet, banking API directory, or financial tools comparison site.",
      potentialValue: "$15K–35K ARR via sponsored listings",
    },
    recommended: "flip",
    comparables: [
      { domain: "fintechhub.io", price: "$1,200", date: "Sep 2026" },
      { domain: "bankingly.co", price: "$850", date: "Aug 2026" },
      { domain: "fintechradar.io", price: "$1,050", date: "Jul 2026" },
      { domain: "payflow.io", price: "$1,650", date: "Jun 2026" },
    ],
    risk: { spam: "low", demand: "med", competition: "med" },
  },
};

/* ------------------------------ Domain detail modal ------------------------- */

function DetailScoreRing({ score }: { score: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = score >= 80 ? "#10B981" : "#2563EB";

  return (
    <div className="relative inline-flex size-20 shrink-0 items-center justify-center">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="7"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">
        <DigitPopIn value={score} />
      </div>
    </div>
  );
}

const RISK_WIDTH: Record<RiskLevel, string> = {
  low: "33%",
  med: "66%",
  high: "100%",
};
const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Low",
  med: "Medium",
  high: "High",
};

function RiskBar({
  label,
  level,
  goodWhenHigh = false,
}: {
  label: string;
  level: RiskLevel;
  goodWhenHigh?: boolean;
}) {
  const goodness = goodWhenHigh
    ? level === "high"
      ? "good"
      : level === "med"
        ? "warn"
        : "bad"
    : level === "low"
      ? "good"
      : level === "med"
        ? "warn"
        : "bad";
  const color =
    goodness === "good" ? "#10B981" : goodness === "warn" ? "#F59E0B" : "#EF4444";

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium" style={{ color }}>
          {RISK_LABEL[level]}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{ width: RISK_WIDTH[level], backgroundColor: color }}
        />
      </div>
    </div>
  );
}

type AnalysisState = "loading" | "error" | DomainAnalysis;

function DomainDetailModal({
  selected,
  onClose,
  analysisCache,
  onRequestAnalysis,
}: {
  selected: SelectedDomain;
  onClose: () => void;
  analysisCache: Record<string, AnalysisState>;
  onRequestAnalysis: (domain: string) => void;
}) {
  const { beginnerMode } = useBeginnerMode();
  const { isPro } = useAuth();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const liveAnalysis = analysisCache[selected.domain];

  useEffect(() => {
    if (isPro && liveAnalysis === undefined) {
      onRequestAnalysis(selected.domain);
    }
    // Only re-run when the selected domain changes — onRequestAnalysis and
    // liveAnalysis are stable/derived from the same cache this effect reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.domain]);

  const detail =
    DOMAIN_DETAILS[selected.domain] ?? buildFallbackDetail(selected.value);

  const isAuction = selected.availability === "Auction";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 py-10">
      <div
        className="fixed inset-0 bg-black/50 t-overlay-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[860px] rounded-2xl bg-white shadow-2xl t-modal-in">
        <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] p-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              {selected.domain}
            </h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                isAuction
                  ? "bg-orange-100 text-orange-700"
                  : "bg-[#10B981]/10 text-[#10B981]"
              }`}
            >
              {selected.availability}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              nativeButton={false}
              render={
                <a
                  href="https://www.namecheap.com"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Register on Namecheap
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-[#E2E8F0] p-6 sm:grid-cols-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <DetailScoreRing score={selected.score} />
            <span className="text-xs text-muted-foreground">
              Opportunity Score
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-2xl font-bold text-foreground">
              {detail.age}
            </span>
            <span className="text-xs text-muted-foreground">Age</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-2xl font-bold text-foreground">
              {detail.backlinks}
            </span>
            <span className="text-xs text-muted-foreground">Backlinks</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-2xl font-bold text-[#10B981]">
              {detail.trend}
            </span>
            <span className="text-xs text-muted-foreground">
              Search trend
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-3 rounded-xl bg-[#EFF6FF] p-4">
            <Bot className="size-5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">AI Analysis</p>
              {beginnerMode && (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-amber-700">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  Tip: Always check if the niche is something you understand
                  before buying.
                </p>
              )}
              {isPro ? (
                liveAnalysis === "loading" || liveAnalysis === undefined ? (
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="size-4 animate-spin" />
                    Claude is analyzing {selected.domain}...
                  </p>
                ) : liveAnalysis === "error" ? (
                  <div className="mt-1 flex items-center gap-3">
                    <p className="text-sm text-slate-600">
                      Analysis unavailable — try again
                    </p>
                    <button
                      type="button"
                      onClick={() => onRequestAnalysis(selected.domain)}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex flex-col gap-3">
                    <p className="text-sm text-slate-700">
                      {detail.aiAnalysis}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-primary">
                        Live score: {liveAnalysis.opportunityScore}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-600">
                        Est. value: ${liveAnalysis.estimatedValue.low.toLocaleString()}–$
                        {liveAnalysis.estimatedValue.high.toLocaleString()}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-600">
                        {liveAnalysis.niche}
                      </span>
                      {liveAnalysis.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Why it&apos;s interesting
                      </p>
                      <ul className="mt-1.5 flex flex-col gap-1">
                        {liveAnalysis.whyInteresting.map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-1.5 text-sm text-slate-700"
                          >
                            <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-[#10B981]" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {liveAnalysis.risks.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Risks
                        </p>
                        <ul className="mt-1.5 flex flex-col gap-1">
                          {liveAnalysis.risks.map((risk) => (
                            <li
                              key={risk}
                              className="text-sm text-slate-600"
                            >
                              ⚠️ {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {liveAnalysis.flipStrategy && (
                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                        <p className="text-xs font-semibold text-blue-800">
                          💰 Flip Strategy
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500">Max buy price</span>
                            <p className="font-semibold text-slate-800">${liveAnalysis.flipStrategy.buyPrice.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">List at</span>
                            <p className="font-semibold text-slate-800">${liveAnalysis.flipStrategy.listPrice.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Quick sale</span>
                            <p className="font-semibold text-slate-800">${liveAnalysis.flipStrategy.quickSalePrice.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Time to sell</span>
                            <p className="font-semibold text-slate-800">{liveAnalysis.flipStrategy.timeToSell}</p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-blue-700">
                          <span className="font-medium">Where to sell:</span> {liveAnalysis.flipStrategy.wherToSell}
                        </p>
                      </div>
                    )}
                    {liveAnalysis.comparableSales && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          📊 Comparable Sales
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{liveAnalysis.comparableSales}</p>
                      </div>
                    )}
                    {liveAnalysis.potentialBuyers && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          🎯 Potential Buyers
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{liveAnalysis.potentialBuyers}</p>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="relative mt-1">
                  <p className="select-none text-sm text-slate-700 blur-[5px]">
                    {detail.aiAnalysis}
                  </p>
                  <button
                    type="button"
                    onClick={openUpgradeModal}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-white/50 text-center backdrop-blur-[1px]"
                  >
                    <Lock className="size-5 text-primary" />
                    <span className="max-w-xs text-sm font-semibold text-foreground">
                      Pro feature — Upgrade to unlock full AI analysis
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative mt-6">
            <div
              className={`grid gap-4 sm:grid-cols-2 ${
                isPro ? "" : "select-none blur-[5px]"
              }`}
            >
              <div
                className={`rounded-xl border p-5 ${
                  detail.recommended === "flip"
                    ? "border-primary bg-primary/5"
                    : "border-[#E2E8F0]"
                }`}
              >
                {detail.recommended === "flip" && (
                  <span className="mb-2 inline-block rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                    Recommended
                  </span>
                )}
                <p className="font-semibold text-foreground">
                  Flip this domain
                </p>
                <dl className="mt-3 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      Estimated resale
                    </dt>
                    <dd className="font-medium text-foreground">
                      {detail.flip.range}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Time to sell</dt>
                    <dd className="font-medium text-foreground">
                      {detail.flip.timeToSell}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Confidence</dt>
                    <dd className="font-medium text-foreground">
                      {detail.flip.confidence}%
                    </dd>
                  </div>
                </dl>
              </div>

              <div
                className={`rounded-xl border p-5 ${
                  detail.recommended === "build"
                    ? "border-primary bg-primary/5"
                    : "border-[#E2E8F0]"
                }`}
              >
                {detail.recommended === "build" && (
                  <span className="mb-2 inline-block rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                    Recommended
                  </span>
                )}
                <p className="font-semibold text-foreground">
                  Build on this domain
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  {detail.build.description}
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {detail.build.potentialValue}
                </p>
              </div>
            </div>

            {!isPro && (
              <button
                type="button"
                onClick={openUpgradeModal}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/40 text-center backdrop-blur-[1px]"
              >
                <Lock className="size-5 text-primary" />
                <span className="max-w-xs text-sm font-semibold text-foreground">
                  Upgrade to Pro to see the full flip vs. build recommendation
                </span>
              </button>
            )}
          </div>

          <div className="relative mt-6">
            <p className="font-semibold text-foreground">
              Similar Domains Sold Recently
            </p>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Domain</th>
                  <th className="pb-2 font-medium">Sale Price</th>
                  <th className="pb-2 font-medium">Date Sold</th>
                </tr>
              </thead>
              <tbody>
                {detail.comparables.map((row, index) => {
                  const locked = !isPro && index > 0;
                  return (
                    <tr
                      key={row.domain}
                      className="border-b border-[#E2E8F0] last:border-0"
                    >
                      <td
                        className={`py-2 font-medium text-foreground ${
                          locked ? "select-none blur-[3px]" : ""
                        }`}
                      >
                        {row.domain}
                      </td>
                      <td
                        className={`py-2 text-slate-600 ${
                          locked ? "select-none blur-[3px]" : ""
                        }`}
                      >
                        {row.price}
                      </td>
                      <td
                        className={`py-2 text-slate-600 ${
                          locked ? "select-none blur-[3px]" : ""
                        }`}
                      >
                        {row.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!isPro && detail.comparables.length > 1 && (
              <button
                type="button"
                onClick={openUpgradeModal}
                className="absolute inset-x-0 bottom-0 flex h-[calc(100%-2.75rem)] items-center justify-center bg-gradient-to-t from-white via-white/85 to-transparent"
              >
                <span className="rounded-full border border-primary/30 bg-white px-4 py-1.5 text-sm font-semibold text-primary shadow-sm">
                  {detail.comparables.length - 1} more results — Upgrade to
                  Pro
                </span>
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <p className="font-semibold text-foreground">Risk Assessment</p>
            <RiskBar label="Spam Risk" level={detail.risk.spam} />
            <RiskBar
              label="Market Demand"
              level={detail.risk.demand}
              goodWhenHigh
            />
            <RiskBar label="Competition" level={detail.risk.competition} />
          </div>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              nativeButton={false}
              render={
                <a
                  href="https://www.namecheap.com"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Register on Namecheap — $12.99
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={
                <a
                  href="https://www.godaddy.com/auctions"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              View on GoDaddy Auctions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Daily Top 10 ------------------------------ */

interface Top10Domain {
  domain: string;
  score: number;
  trendTag: "Hot" | "Trending" | "Rising";
  value: string;
  availability: "Available" | "Auction";
}

const TOP_10_DOMAINS: Top10Domain[] = [
  { domain: "launchpad.ai", score: 96, trendTag: "Hot", value: "$3,200–5,500", availability: "Auction" },
  { domain: "healthlane.io", score: 93, trendTag: "Trending", value: "$2,800–4,200", availability: "Available" },
  { domain: "ailaunch.io", score: 91, trendTag: "Rising", value: "$1,200–2,400", availability: "Available" },
  { domain: "cryptopulse.io", score: 89, trendTag: "Hot", value: "$2,100–3,800", availability: "Available" },
  { domain: "novahealth.co", score: 87, trendTag: "Rising", value: "$900–1,800", availability: "Available" },
  { domain: "startupforge.co", score: 84, trendTag: "Trending", value: "$800–1,600", availability: "Available" },
  { domain: "buildfast.ai", score: 83, trendTag: "Rising", value: "$1,400–2,200", availability: "Auction" },
  { domain: "fintechly.io", score: 81, trendTag: "Trending", value: "$700–1,400", availability: "Available" },
  { domain: "aitools.io", score: 79, trendTag: "Rising", value: "$600–1,100", availability: "Available" },
  { domain: "nova-ai.co", score: 72, trendTag: "Trending", value: "$400–800", availability: "Available" },
];

const TOP10_RANK_CHANGES = [
  "NEW",
  "↑2",
  "↑1",
  "—",
  "↑3",
  "↓2",
  "↑1",
  "↓1",
  "—",
  "↓3",
];

function RankChangeBadge({ change }: { change: string }) {
  const className =
    change === "NEW"
      ? "bg-blue-100 text-blue-700"
      : change === "—"
        ? "bg-slate-100 text-slate-500"
        : change.startsWith("↑")
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700";
  return (
    <span
      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${className}`}
    >
      {change}
    </span>
  );
}

const SPARKLINE_BARS = [30, 45, 40, 60, 75, 90];

function Sparkline() {
  return (
    <div className="flex h-6 shrink-0 items-end gap-0.5">
      {SPARKLINE_BARS.map((height, index) => (
        <div
          key={index}
          className="w-1 rounded-t bg-[#10B981]/70"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function useCountdown() {
  const START = 3 * 3600;
  const [seconds, setSeconds] = useState(START);

  useEffect(() => {
    const initTimeout = setTimeout(() => {
      setSeconds(randomInt(3 * 3600, 8 * 3600));
    }, 0);

    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(interval);
    };
  }, []);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function Top10Card({
  item,
  index,
  rankChange,
  onOpenDetail,
  saved,
  onToggleSave,
}: {
  item: Top10Domain;
  index: number;
  rankChange: string;
  onOpenDetail: () => void;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const { beginnerMode } = useBeginnerMode();
  const viewerCount = useViewerCount();
  const { hex: scoreColor, border: scoreBorderClass } = scoreVisual(
    item.score
  );
  const detail = DOMAIN_DETAILS[item.domain];
  const currentBid = computeCurrentBid(item.value);
  const highRisk = isHighRiskDomain(item.score, detail.risk.spam);
  const dotIndex = item.domain.lastIndexOf(".");
  const name = item.domain.slice(0, dotIndex);
  const tld = item.domain.slice(dotIndex);

  const trendClass =
    item.trendTag === "Hot"
      ? "bg-orange-100 text-orange-700"
      : item.trendTag === "Trending"
        ? "bg-[#10B981]/10 text-[#10B981]"
        : "bg-blue-100 text-blue-700";

  if (beginnerMode && highRisk) {
    return <HighRiskHiddenCard index={index} />;
  }

  return (
    <div
      onClick={onOpenDetail}
      className={`t-card-reveal cursor-pointer rounded-xl border border-[#E2E8F0] border-l-4 ${scoreBorderClass} bg-white p-4 transition-shadow hover:shadow-md`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-7 shrink-0 text-xl font-bold text-slate-300">
          {String(index + 1).padStart(2, "0")}
        </span>
        <RankChangeBadge change={rankChange} />

        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-bold text-foreground">
            {name}
            <span className="text-primary">{tld}</span>
          </span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${trendClass}`}
          >
            {item.trendTag}
          </span>
          {beginnerMode && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                item.score >= 80
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {item.score >= 80 ? "Low Risk" : "Moderate — research first"}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: scoreColor }}
          >
            <DigitPopIn value={item.score} />
          </div>
          <span className="text-sm text-muted-foreground">{item.value}</span>
        </div>

        <Sparkline />

        <ViewerIndicator count={viewerCount} />

        <div
          className="ml-auto flex shrink-0 gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <SaveButton saved={saved} onToggle={onToggleSave} />
          <AnalyzeButton onOpenDetail={onOpenDetail} compact />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-[#E2E8F0] pt-3 text-xs text-muted-foreground">
        <span>
          {beginnerMode ? (
            <MetricTooltip
              label="Age"
              tooltip="Older domains often have more trust and SEO history."
            />
          ) : (
            "Age"
          )}{" "}
          <span className="font-semibold text-foreground">{detail.age}</span>
        </span>
        <span>
          {beginnerMode ? (
            <MetricTooltip
              label="Backlinks"
              tooltip="Websites linking to this domain. More = more SEO value."
            />
          ) : (
            "Backlinks"
          )}{" "}
          <span className="font-semibold text-foreground">
            {detail.backlinks}
          </span>
        </span>
        <span>
          Trend <span className="font-semibold text-[#10B981]">{detail.trend}</span>
        </span>
        <span>
          {beginnerMode ? (
            <MetricTooltip
              label="Current bid"
              tooltip="Current bid. Resale value is usually 3-10x this amount."
            />
          ) : (
            "Current bid"
          )}{" "}
          <span className="font-semibold text-foreground">${currentBid}</span>
        </span>
      </div>
    </div>
  );
}

function DailyTop10View({
  onOpenDetail,
  savedDomains,
  onToggleSave,
}: {
  onOpenDetail: (data: SelectedDomain) => void;
  savedDomains: Set<string>;
  onToggleSave: (domain: string) => void;
}) {
  const { isPro } = useAuth();
  const countdown = useCountdown();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mt-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Today&apos;s Top 10 Opportunities
      </h1>
      <p className="mt-2 text-muted-foreground">{today}</p>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <span className="text-xs text-muted-foreground">
          Refreshes in:{" "}
          <span className="font-mono font-semibold text-foreground">
            {countdown}
          </span>
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {TOP_10_DOMAINS.slice(0, 3).map((item, index) => (
          <Top10Card
            key={item.domain}
            item={item}
            index={index}
            rankChange={TOP10_RANK_CHANGES[index]}
            saved={savedDomains.has(item.domain)}
            onToggleSave={() => onToggleSave(item.domain)}
            onOpenDetail={() =>
              onOpenDetail({
                domain: item.domain,
                availability: item.availability,
                score: item.score,
                value: item.value,
              })
            }
          />
        ))}

        {isPro ? (
          TOP_10_DOMAINS.slice(3).map((item, index) => (
            <Top10Card
              key={item.domain}
              item={item}
              index={index + 3}
              rankChange={TOP10_RANK_CHANGES[index + 3]}
              saved={savedDomains.has(item.domain)}
              onToggleSave={() => onToggleSave(item.domain)}
              onOpenDetail={() =>
                onOpenDetail({
                  domain: item.domain,
                  availability: item.availability,
                  score: item.score,
                  value: item.value,
                })
              }
            />
          ))
        ) : (
          <div className="relative">
            <div
              aria-hidden="true"
              className="flex flex-col gap-3 select-none blur-[5px]"
            >
              {TOP_10_DOMAINS.slice(3).map((item, index) => (
                <Top10Card
                  key={item.domain}
                  item={item}
                  index={index + 3}
                  rankChange={TOP10_RANK_CHANGES[index + 3]}
                  saved={false}
                  onToggleSave={() => {}}
                  onOpenDetail={() => {}}
                />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center shadow-xl">
                <p className="font-semibold text-foreground">
                  Upgrade to see all 10
                </p>
                <Button onClick={openUpgradeModal}>Upgrade to Pro</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Offers inbox ------------------------------ */

interface OfferMessage {
  from: "buyer" | "seller";
  author: string;
  text: string;
  timeAgo: string;
}

interface OfferThread {
  id: string;
  domain: string;
  buyerName: string;
  timeAgo: string;
  unread: boolean;
  offerAmount: number;
  listedAt: string;
  messages: OfferMessage[];
}

const INITIAL_OFFER_THREADS: OfferThread[] = [
  {
    id: "aiinvoice",
    domain: "aiinvoice.com",
    buyerName: "Marcus Johnson",
    timeAgo: "2h ago",
    unread: true,
    offerAmount: 450,
    listedAt: "Make an Offer",
    messages: [
      {
        from: "buyer",
        author: "Marcus Johnson",
        timeAgo: "2 hours ago",
        text: "Hi, I'm interested in purchasing aiinvoice.com. I think $450 would be a fair price. The domain fits our new AI invoicing product we're launching next month. Please let me know if you're open to this offer.",
      },
    ],
  },
  {
    id: "techpulse",
    domain: "techpulse.io",
    buyerName: "Sarah Chen",
    timeAgo: "Yesterday",
    unread: false,
    offerAmount: 1200,
    listedAt: "$1,800",
    messages: [
      {
        from: "buyer",
        author: "Sarah Chen",
        timeAgo: "Yesterday",
        text: "Would you consider $1,200 for techpulse.io? We're building a developer tools platform and this name fits perfectly. Happy to close quickly if you're interested.",
      },
    ],
  },
  {
    id: "nordicai",
    domain: "nordicai.com",
    buyerName: "Alex Mueller",
    timeAgo: "2 days ago",
    unread: false,
    offerAmount: 300,
    listedAt: "Make an Offer",
    messages: [
      {
        from: "buyer",
        author: "Alex Mueller",
        timeAgo: "2 days ago",
        text: "I'd like to make an offer on nordicai.com. I run a small AI consultancy in the Nordics and this domain would be a great fit for our rebrand. Let me know your thoughts on $300.",
      },
    ],
  },
  {
    id: "smartlease",
    domain: "smartlease.com",
    buyerName: "Emma Wilson",
    timeAgo: "3 days ago",
    unread: false,
    offerAmount: 2800,
    listedAt: "$3,500",
    messages: [
      {
        from: "buyer",
        author: "Emma Wilson",
        timeAgo: "3 days ago",
        text: "We are a startup looking for a domain for our property leasing platform. smartlease.com is exactly what we need. Would $2,800 work for you?",
      },
    ],
  },
];

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

const AI_SUGGESTION_OVERRIDES: Record<
  string,
  { label: string; text: string }[]
> = {
  aiinvoice: [
    {
      label: "Counter offer",
      text: "Hi Marcus, thank you for your interest in aiinvoice.com. Given the domain's strong SEO value and relevance to the AI invoicing market, I'm looking for $1,500. Would you be open to meeting somewhere in the middle at $975?",
    },
    {
      label: "Ask for more info",
      text: "Hi Marcus, thanks for reaching out! I'd love to learn more about your project before discussing price. Could you share more about your AI invoicing product? This helps me understand the domain's value to your business.",
    },
    {
      label: "Firm on price",
      text: "Hi Marcus, I appreciate your offer. aiinvoice.com is priced competitively given its age, backlinks, and growing niche demand. I can do $1,200 as a final price. Let me know if that works for you.",
    },
  ],
};

function roundTo25(value: number) {
  return Math.max(25, Math.round(value / 25) * 25);
}

function getAiSuggestions(thread: OfferThread) {
  const override = AI_SUGGESTION_OVERRIDES[thread.id];
  if (override) return override;

  const firstName = thread.buyerName.split(" ")[0];
  const counterPrice = roundTo25(thread.offerAmount * 2.2);
  const middlePrice = roundTo25((thread.offerAmount + counterPrice) / 2);
  const firmPrice = roundTo25(thread.offerAmount * 1.6);

  return [
    {
      label: "Counter offer",
      text: `Hi ${firstName}, thank you for your interest in ${thread.domain}. Given the domain's strong SEO value and relevance to its market, I'm looking for $${counterPrice.toLocaleString()}. Would you be open to meeting somewhere in the middle at $${middlePrice.toLocaleString()}?`,
    },
    {
      label: "Ask for more info",
      text: `Hi ${firstName}, thanks for reaching out! I'd love to learn more about your plans before discussing price. Could you share more about how you'll use ${thread.domain}? This helps me understand the domain's value to your business.`,
    },
    {
      label: "Firm on price",
      text: `Hi ${firstName}, I appreciate your offer. ${thread.domain} is priced competitively given its age, backlinks, and growing niche demand. I can do $${firmPrice.toLocaleString()} as a final price. Let me know if that works for you.`,
    },
  ];
}

function OfferThreadRow({
  thread,
  selected,
  declining,
  onSelect,
}: {
  thread: OfferThread;
  selected: boolean;
  declining: boolean;
  onSelect: () => void;
}) {
  const firstMessage = thread.messages[0];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full flex-col gap-1.5 border-b border-[#E2E8F0] px-4 py-3.5 text-left transition-all duration-300 ${
        declining ? "pointer-events-none scale-95 opacity-0" : "opacity-100"
      } ${selected ? "bg-primary/5" : "hover:bg-slate-50"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {thread.unread && (
            <span className="size-2 shrink-0 rounded-full bg-[#10B981]" />
          )}
          <span className="truncate font-bold text-foreground">
            {thread.domain}
          </span>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {thread.timeAgo}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm text-muted-foreground">
          <span className="font-medium text-slate-700">
            {thread.buyerName}
          </span>
          {" — "}
          {truncateText(firstMessage.text, 32)}
        </p>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
          ${thread.offerAmount.toLocaleString()}
        </span>
      </div>
    </button>
  );
}

function ChatBubble({ message }: { message: OfferMessage }) {
  const isSeller = message.from === "seller";
  return (
    <div className={`flex ${isSeller ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
          isSeller ? "bg-primary text-white" : "bg-slate-100 text-slate-700"
        }`}
      >
        <p>{message.text}</p>
        <p
          className={`mt-2 text-xs ${
            isSeller ? "text-white/70" : "text-muted-foreground"
          }`}
        >
          {message.author} · {message.timeAgo}
        </p>
      </div>
    </div>
  );
}

function AiSuggestPanel({
  thread,
  onUse,
}: {
  thread: OfferThread;
  onUse: (text: string) => void;
}) {
  const { isPro } = useAuth();
  const suggestions = getAiSuggestions(thread);

  return (
    <div className="t-fade-blur-in relative mt-4 overflow-hidden rounded-xl border-l-4 border-primary bg-gradient-to-br from-primary/5 to-purple-50 p-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Sparkles className="size-4 text-primary" />
        AI Suggested Replies
      </div>

      <div
        className={`mt-3 flex flex-col gap-3 ${
          isPro ? "" : "select-none blur-[4px]"
        }`}
      >
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.label}
            className="rounded-lg border border-[#E2E8F0] bg-white p-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {suggestion.label}
            </p>
            <p className="mt-1.5 text-sm text-slate-700">{suggestion.text}</p>
            <button
              type="button"
              onClick={() => onUse(suggestion.text)}
              className="mt-2 text-xs font-semibold text-primary hover:underline"
            >
              Use this reply
            </button>
          </div>
        ))}
      </div>

      {!isPro && (
        <button
          type="button"
          onClick={openUpgradeModal}
          className="absolute inset-x-4 bottom-4 top-11 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/70 text-center backdrop-blur-[1px]"
        >
          <Lock className="size-5 text-primary" />
          <span className="max-w-xs text-sm font-semibold text-foreground">
            AI negotiation replies are a Pro feature — Upgrade to unlock
          </span>
        </button>
      )}
    </div>
  );
}

function CounterOfferModal({
  thread,
  onClose,
  onSend,
}: {
  thread: OfferThread;
  onClose: () => void;
  onSend: (price: string, note: string) => void;
}) {
  const [price, setPrice] = useState(String(thread.offerAmount));
  const [note, setNote] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
      <div
        className="fixed inset-0 bg-black/50 t-overlay-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-2xl t-modal-in">
        <h2 className="text-xl font-bold text-foreground">
          Send Counter Offer
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Counter {thread.buyerName}&apos;s offer on {thread.domain}.
        </p>

        <label className="mt-5 flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Your price
          </span>
          <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-white px-3 focus-within:border-primary">
            <span className="text-muted-foreground">$</span>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full bg-transparent px-2 py-2.5 text-sm text-foreground focus:outline-none"
            />
          </div>
        </label>

        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Add a note{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Add a note (optional)"
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </label>

        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => onSend(price, note)}>
            Send Counter
          </Button>
        </div>
      </div>
    </div>
  );
}

function AcceptOfferModal({
  thread,
  onClose,
  onConfirm,
}: {
  thread: OfferThread;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
      <div
        className="fixed inset-0 bg-black/50 t-overlay-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl bg-white p-6 text-center shadow-2xl t-modal-in">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#10B981]/10">
          <CheckIcon className="size-6 text-[#10B981]" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">
          Accept Offer from {thread.buyerName}?
        </h2>
        <p className="mt-2 text-lg font-semibold text-foreground">
          Offer amount: ${thread.offerAmount.toLocaleString()}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Once accepted, we&apos;ll connect you with the buyer to arrange
          payment and transfer.
        </p>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-[#10B981] text-white hover:bg-[#10B981]/90"
            onClick={onConfirm}
          >
            Confirm Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

function OffersView() {
  const [threads, setThreads] = useState<OfferThread[]>(
    INITIAL_OFFER_THREADS
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    INITIAL_OFFER_THREADS[0]?.id ?? null
  );
  const [decliningIds, setDecliningIds] = useState<Set<string>>(new Set());
  const [replyDraft, setReplyDraft] = useState("");
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  const selectedThread =
    threads.find((thread) => thread.id === selectedId) ?? null;

  const selectThread = (id: string) => {
    setSelectedId(id);
    setShowAiSuggestions(false);
    setReplyDraft("");
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === id ? { ...thread, unread: false } : thread
      )
    );
  };

  const appendSellerMessage = (threadId: string, text: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              messages: [
                ...thread.messages,
                { from: "seller", author: "You", text, timeAgo: "Just now" },
              ],
            }
          : thread
      )
    );
  };

  const handleSendReply = () => {
    if (!selectedThread || !replyDraft.trim()) return;
    appendSellerMessage(selectedThread.id, replyDraft.trim());
    setReplyDraft("");
    setShowAiSuggestions(false);
  };

  const handleSendCounter = (price: string, note: string) => {
    if (!selectedThread) return;
    const amount = Number(price) || selectedThread.offerAmount;
    const text = note.trim()
      ? `I'd like to counter with $${amount.toLocaleString()}. ${note.trim()}`
      : `I'd like to counter with $${amount.toLocaleString()}.`;
    appendSellerMessage(selectedThread.id, text);
    setCounterModalOpen(false);
  };

  const handleConfirmAccept = () => {
    if (!selectedThread) return;
    setAcceptedIds((prev) => new Set(prev).add(selectedThread.id));
    setAcceptModalOpen(false);
  };

  const handleDecline = (id: string) => {
    setDecliningIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setThreads((prev) => {
        const next = prev.filter((thread) => thread.id !== id);
        setSelectedId((current) => (current === id ? next[0]?.id ?? null : current));
        return next;
      });
      setDecliningIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  return (
    <div className="mt-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Offers
      </h1>
      <p className="mt-2 text-muted-foreground">
        Negotiate offers from buyers interested in your saved domains.
      </p>

      <div
        className="mt-6 flex overflow-hidden rounded-xl border border-[#E2E8F0] bg-white"
        style={{ minHeight: "560px" }}
      >
        <div className="w-[35%] shrink-0 overflow-y-auto border-r border-[#E2E8F0]">
          {threads.map((thread) => (
            <OfferThreadRow
              key={thread.id}
              thread={thread}
              selected={thread.id === selectedId}
              declining={decliningIds.has(thread.id)}
              onSelect={() => selectThread(thread.id)}
            />
          ))}
          {threads.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No offers right now.
            </p>
          )}
        </div>

        <div className="flex w-[65%] flex-col p-6">
          {selectedThread ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">
                      {selectedThread.domain}
                    </h2>
                    <span className="rounded-full bg-[#10B981]/10 px-2.5 py-1 text-sm font-semibold text-[#10B981]">
                      ${selectedThread.offerAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Listed at: {selectedThread.listedAt}
                  </p>
                </div>
                {acceptedIds.has(selectedThread.id) ? (
                  <span className="rounded-full bg-[#10B981]/10 px-3 py-1.5 text-sm font-semibold text-[#10B981]">
                    Offer accepted
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      className="bg-[#10B981] text-white hover:bg-[#10B981]/90"
                      onClick={() => setAcceptModalOpen(true)}
                    >
                      Accept
                    </Button>
                    <Button onClick={() => setCounterModalOpen(true)}>
                      Counter
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleDecline(selectedThread.id)}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto">
                {selectedThread.messages.map((message, index) => (
                  <ChatBubble key={index} message={message} />
                ))}
              </div>

              <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                <p className="text-sm font-medium text-foreground">
                  Your Reply
                </p>
                <textarea
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  rows={3}
                  placeholder="Write your response..."
                  className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="gap-1.5 border-primary text-primary hover:bg-primary/5"
                    onClick={() => setShowAiSuggestions((prev) => !prev)}
                  >
                    <Sparkles className="size-4" />
                    AI Suggest
                  </Button>
                  <Button
                    className="gap-1.5"
                    disabled={!replyDraft.trim()}
                    onClick={handleSendReply}
                  >
                    <Send className="size-4" />
                    Send Reply
                  </Button>
                </div>

                {showAiSuggestions && (
                  <AiSuggestPanel
                    thread={selectedThread}
                    onUse={(text) => {
                      setReplyDraft(text);
                      setShowAiSuggestions(false);
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No offer selected.
            </div>
          )}
        </div>
      </div>

      {counterModalOpen && selectedThread && (
        <CounterOfferModal
          thread={selectedThread}
          onClose={() => setCounterModalOpen(false)}
          onSend={handleSendCounter}
        />
      )}

      {acceptModalOpen && selectedThread && (
        <AcceptOfferModal
          thread={selectedThread}
          onClose={() => setAcceptModalOpen(false)}
          onConfirm={handleConfirmAccept}
        />
      )}
    </div>
  );
}

/* --------------------------------- Other views ------------------------------ */

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

function getSavedDomainRecord(domain: string): SelectedDomain | undefined {
  const fromSearch = DOMAINS.find((result) => result.domain === domain);
  if (fromSearch) {
    return {
      domain: fromSearch.domain,
      availability: fromSearch.availability,
      score: fromSearch.score,
      value: fromSearch.value,
    };
  }
  const fromTop10 = TOP_10_DOMAINS.find((result) => result.domain === domain);
  if (fromTop10) {
    return {
      domain: fromTop10.domain,
      availability: fromTop10.availability,
      score: fromTop10.score,
      value: fromTop10.value,
    };
  }
  return undefined;
}

function SavedCard({
  record,
  onOpenDetail,
  onRemove,
  onShare,
}: {
  record: SelectedDomain;
  onOpenDetail: () => void;
  onRemove: () => void;
  onShare: () => void;
}) {
  const isAuction = record.availability === "Auction";
  const scoreColor =
    record.score >= 80 ? "#10B981" : record.score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {record.domain}
          </h3>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              isAuction
                ? "bg-orange-100 text-orange-700"
                : "bg-[#10B981]/10 text-[#10B981]"
            }`}
          >
            {record.availability}
          </span>
        </div>
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
          style={{ backgroundColor: scoreColor }}
        >
          {record.score}
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{record.value}</p>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onOpenDetail}>
          View Details
        </Button>
        <SaveButton saved onToggle={onRemove} />
      </div>
      <div className="mt-2 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          nativeButton={false}
          render={
            <a
              href={`/for-sale/${record.domain}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          View Listing
        </Button>
        <Button variant="outline" className="flex-1" onClick={onShare}>
          Share Listing
        </Button>
      </div>
    </div>
  );
}

function SavedDomainsView({
  savedDomains,
  onToggleSave,
  onOpenDetail,
  onShare,
  onStartSearching,
}: {
  savedDomains: Set<string>;
  onToggleSave: (domain: string) => void;
  onOpenDetail: (data: SelectedDomain) => void;
  onShare: (domain: string) => void;
  onStartSearching: () => void;
}) {
  const records = Array.from(savedDomains)
    .map(getSavedDomainRecord)
    .filter((record): record is SelectedDomain => Boolean(record));

  if (records.length === 0) {
    return (
      <EmptyState
        title="Your Saved Domains"
        message="No saved domains yet. Search and save domains to see them here."
      >
        <Button onClick={onStartSearching}>Start Searching →</Button>
      </EmptyState>
    );
  }

  return (
    <div className="mt-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Your Saved Domains
      </h1>
      <p className="mt-2 text-muted-foreground">
        {records.length} domain{records.length === 1 ? "" : "s"} saved from
        your searches.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {records.map((record) => (
          <SavedCard
            key={record.domain}
            record={record}
            onOpenDetail={() => onOpenDetail(record)}
            onRemove={() => onToggleSave(record.domain)}
            onShare={() => onShare(record.domain)}
          />
        ))}
      </div>
    </div>
  );
}

function PortfolioStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

type MonetizationMode = "sale" | "lease" | "holding";

interface LeaseConfig {
  monthlyPrice: string;
  minTerm: "1" | "3" | "6" | "12";
  depositEnabled: boolean;
  depositAmount: string;
  includesDns: boolean;
  includesEmailForwarding: boolean;
  includesMonthlyReport: boolean;
  includesTransferOption: boolean;
}

function createDefaultLeaseConfig(): LeaseConfig {
  return {
    monthlyPrice: "",
    minTerm: "3",
    depositEnabled: false,
    depositAmount: "",
    includesDns: true,
    includesEmailForwarding: false,
    includesMonthlyReport: false,
    includesTransferOption: false,
  };
}

interface PortfolioDomainEntry {
  domain: string;
  sellEstimate: number;
}

const PORTFOLIO_DOMAINS: PortfolioDomainEntry[] = [
  { domain: "aiinvoice.com", sellEstimate: 1200 },
  { domain: "nordicai.com", sellEstimate: 1800 },
  { domain: "smartlease.com", sellEstimate: 2600 },
  { domain: "aitools.io", sellEstimate: 900 },
];

const LEASE_INCLUDES: {
  key: keyof Pick<
    LeaseConfig,
    | "includesDns"
    | "includesEmailForwarding"
    | "includesMonthlyReport"
    | "includesTransferOption"
  >;
  label: string;
}[] = [
  { key: "includesDns", label: "DNS management" },
  { key: "includesEmailForwarding", label: "Email forwarding setup" },
  { key: "includesMonthlyReport", label: "Monthly performance report" },
  {
    key: "includesTransferOption",
    label: "Transfer option at end of term (at agreed price)",
  },
];

function MonetizationModeSelector({
  mode,
  onChange,
}: {
  mode: MonetizationMode;
  onChange: (mode: MonetizationMode) => void;
}) {
  const options: { value: MonetizationMode; label: string }[] = [
    { value: "sale", label: "For Sale" },
    { value: "lease", label: "For Lease" },
    { value: "holding", label: "Holding" },
  ];

  return (
    <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-slate-50 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === option.value
              ? "bg-primary text-white"
              : "text-slate-600 hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function LeaseConfigPanel({
  domain,
  config,
  onChange,
}: {
  domain: string;
  config: LeaseConfig;
  onChange: (config: LeaseConfig) => void;
}) {
  const suggestedDeposit = config.monthlyPrice
    ? String(Number(config.monthlyPrice) * 2)
    : "";

  return (
    <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-slate-50 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Monthly price
          </span>
          <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-white px-3 focus-within:border-primary">
            <span className="text-muted-foreground">$</span>
            <input
              type="number"
              min={0}
              value={config.monthlyPrice}
              onChange={(event) =>
                onChange({ ...config, monthlyPrice: event.target.value })
              }
              placeholder="150"
              className="w-full bg-transparent px-2 py-2 text-sm text-foreground focus:outline-none"
            />
          </div>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Minimum term
          </span>
          <select
            value={config.minTerm}
            onChange={(event) =>
              onChange({
                ...config,
                minTerm: event.target.value as LeaseConfig["minTerm"],
              })
            }
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-foreground focus:outline-none"
          >
            <option value="1">1 month</option>
            <option value="3">3 months</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-[#E2E8F0] bg-white p-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Security deposit
          </p>
          {config.depositEnabled && (
            <p className="text-xs text-muted-foreground">
              Suggested: ${suggestedDeposit || "0"} (2x monthly)
            </p>
          )}
        </div>
        <Toggle
          on={config.depositEnabled}
          onChange={(val) =>
            onChange({
              ...config,
              depositEnabled: val,
              depositAmount: val
                ? config.depositAmount || suggestedDeposit
                : config.depositAmount,
            })
          }
        />
      </div>

      {config.depositEnabled && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Deposit amount
          </span>
          <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-white px-3 focus-within:border-primary">
            <span className="text-muted-foreground">$</span>
            <input
              type="number"
              min={0}
              value={config.depositAmount}
              onChange={(event) =>
                onChange({ ...config, depositAmount: event.target.value })
              }
              placeholder={suggestedDeposit || "300"}
              className="w-full bg-transparent px-2 py-2 text-sm text-foreground focus:outline-none"
            />
          </div>
        </label>
      )}

      <div>
        <p className="text-sm font-medium text-foreground">Lease includes</p>
        <div className="mt-2 flex flex-col gap-2">
          {LEASE_INCLUDES.map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={config[item.key]}
                onChange={(event) =>
                  onChange({ ...config, [item.key]: event.target.checked })
                }
                className="size-4 accent-primary"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <Button
        className="w-full sm:w-auto"
        nativeButton={false}
        render={
          <a
            href={`/lease/${domain}`}
            target="_blank"
            rel="noopener noreferrer"
          />
        }
      >
        Generate Lease Listing
      </Button>
    </div>
  );
}

function PortfolioDomainCard({
  entry,
  mode,
  onModeChange,
  leaseConfig,
  onLeaseConfigChange,
}: {
  entry: PortfolioDomainEntry;
  mode: MonetizationMode;
  onModeChange: (mode: MonetizationMode) => void;
  leaseConfig: LeaseConfig;
  onLeaseConfigChange: (config: LeaseConfig) => void;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {entry.domain}
          </h3>
          <p className="text-sm text-muted-foreground">
            Est. value: ${entry.sellEstimate.toLocaleString()}
          </p>
        </div>
        <MonetizationModeSelector mode={mode} onChange={onModeChange} />
      </div>

      {mode === "lease" && (
        <LeaseConfigPanel
          domain={entry.domain}
          config={leaseConfig}
          onChange={onLeaseConfigChange}
        />
      )}
    </div>
  );
}

function PortfolioView() {
  const [modes, setModes] = useState<Record<string, MonetizationMode>>(() =>
    Object.fromEntries(
      PORTFOLIO_DOMAINS.map((entry) => [entry.domain, "sale" as MonetizationMode])
    )
  );
  const [leaseConfigs, setLeaseConfigs] = useState<Record<string, LeaseConfig>>(
    () =>
      Object.fromEntries(
        PORTFOLIO_DOMAINS.map((entry) => [entry.domain, createDefaultLeaseConfig()])
      )
  );

  const totalValue = PORTFOLIO_DOMAINS.reduce(
    (sum, entry) => sum + entry.sellEstimate,
    0
  );
  const monthlyLeaseRevenue = PORTFOLIO_DOMAINS.reduce((sum, entry) => {
    if (modes[entry.domain] === "lease") {
      return sum + (Number(leaseConfigs[entry.domain]?.monthlyPrice) || 0);
    }
    return sum;
  }, 0);

  return (
    <div className="mt-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        My Portfolio
      </h1>
      <p className="mt-2 text-muted-foreground">
        Track the domains you own and choose how to monetize each one.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <PortfolioStat
          label="Domains Owned"
          value={String(PORTFOLIO_DOMAINS.length)}
        />
        <PortfolioStat
          label="Total Value"
          value={`$${totalValue.toLocaleString()}`}
        />
        <PortfolioStat
          label="Monthly Lease Revenue"
          value={`$${monthlyLeaseRevenue.toLocaleString()}`}
        />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {PORTFOLIO_DOMAINS.map((entry) => (
          <PortfolioDomainCard
            key={entry.domain}
            entry={entry}
            mode={modes[entry.domain]}
            onModeChange={(mode) =>
              setModes((prev) => ({ ...prev, [entry.domain]: mode }))
            }
            leaseConfig={leaseConfigs[entry.domain]}
            onLeaseConfigChange={(config) =>
              setLeaseConfigs((prev) => ({ ...prev, [entry.domain]: config }))
            }
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Lease engine ------------------------------ */

interface ActiveLease {
  id: string;
  domain: string;
  lessee: string;
  monthly: number;
  term: string;
  nextPayment: string;
  status: "active" | "due";
  contactEmail: string;
}

const ACTIVE_LEASES: ActiveLease[] = [
  {
    id: "nordicai",
    domain: "nordicai.com",
    lessee: "TechCorp OÜ",
    monthly: 180,
    term: "6 months",
    nextPayment: "Oct 1",
    status: "active",
    contactEmail: "billing@techcorp.ee",
  },
  {
    id: "smartlease",
    domain: "smartlease.com",
    lessee: "StartupXYZ",
    monthly: 95,
    term: "3 months",
    nextPayment: "Oct 15",
    status: "due",
    contactEmail: "contact@startupxyz.com",
  },
  {
    id: "aitools",
    domain: "aitools.io",
    lessee: "Anonymous",
    monthly: 220,
    term: "12 months",
    nextPayment: "Nov 1",
    status: "active",
    contactEmail: "anonymous@proxy.namecheap.com",
  },
];

function parseTermMonths(term: string) {
  return Number(term.split(" ")[0]) || 0;
}

const MONTHLY_RECURRING = ACTIVE_LEASES.reduce(
  (sum, lease) => sum + lease.monthly,
  0
);
const ANNUAL_RUN_RATE = MONTHLY_RECURRING * 12;
const AVG_LEASE_LENGTH = Math.round(
  ACTIVE_LEASES.reduce((sum, lease) => sum + parseTermMonths(lease.term), 0) /
    ACTIVE_LEASES.length
);

interface LeaseOpportunity {
  domain: string;
  sellEstimate: number;
  leaseMonthly: number;
}

const LEASE_OPPORTUNITIES: LeaseOpportunity[] = [
  { domain: "aiinvoice.com", sellEstimate: 1200, leaseMonthly: 120 },
  { domain: "healthlane.io", sellEstimate: 3200, leaseMonthly: 300 },
  { domain: "cryptopulse.io", sellEstimate: 2400, leaseMonthly: 220 },
];

function computeLeaseUplift(opportunity: LeaseOpportunity) {
  const leaseAnnual = opportunity.leaseMonthly * 12;
  const upliftPercent = Math.round(
    ((leaseAnnual - opportunity.sellEstimate) / opportunity.sellEstimate) * 100
  );
  return { leaseAnnual, upliftPercent };
}

function buildReminderMessage(lease: ActiveLease) {
  return `Hi ${lease.lessee}, this is a friendly reminder that your lease payment of $${lease.monthly} for ${lease.domain} is due on ${lease.nextPayment}. Please process payment at your earliest convenience. Reply to this email if you have any questions.`;
}

function RevenueStatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
      <p className="text-xs font-medium text-blue-600">{label}</p>
      <p className="mt-1 text-xl font-bold text-blue-900">{value}</p>
    </div>
  );
}

function LeaseStatusPill({ status }: { status: "active" | "due" }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        status === "active"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {status === "active" ? "Active" : "Payment due"}
    </span>
  );
}

function ActiveLeasesTab({
  onInvoice,
  onMessage,
  onRemind,
}: {
  onInvoice: (lease: ActiveLease) => void;
  onMessage: (lease: ActiveLease) => void;
  onRemind: (lease: ActiveLease) => void;
}) {
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-slate-50 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Domain</th>
              <th className="px-4 py-3 font-medium">Lessee</th>
              <th className="px-4 py-3 font-medium">Monthly $</th>
              <th className="px-4 py-3 font-medium">Term</th>
              <th className="px-4 py-3 font-medium">Next Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ACTIVE_LEASES.map((lease) => (
              <tr
                key={lease.id}
                className="border-b border-[#E2E8F0] last:border-0"
              >
                <td className="px-4 py-3 font-semibold text-foreground">
                  {lease.domain}
                </td>
                <td className="px-4 py-3 text-slate-600">{lease.lessee}</td>
                <td className="px-4 py-3 font-medium text-foreground">
                  ${lease.monthly}/mo
                </td>
                <td className="px-4 py-3 text-slate-600">{lease.term}</td>
                <td className="px-4 py-3 text-slate-600">
                  {lease.nextPayment}
                </td>
                <td className="px-4 py-3">
                  <LeaseStatusPill status={lease.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {lease.status === "due" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemind(lease)}
                      >
                        Remind
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onInvoice(lease)}
                      >
                        Invoice
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMessage(lease)}
                    >
                      Message
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <RevenueStatBox
          label="Monthly recurring"
          value={`$${MONTHLY_RECURRING}`}
        />
        <RevenueStatBox
          label="Annual run rate"
          value={`$${ANNUAL_RUN_RATE.toLocaleString()}`}
        />
        <RevenueStatBox
          label="Avg lease length"
          value={`${AVG_LEASE_LENGTH} months`}
        />
      </div>
    </div>
  );
}

function LeaseOpportunitiesTab({
  onSwitchToLease,
}: {
  onSwitchToLease: (domain: string) => void;
}) {
  const { isProPlus } = useAuth();
  return (
    <div className="relative">
      <p className="text-sm text-muted-foreground">
        Domains in your portfolio that could earn more through leasing than
        selling
      </p>

      <div
        className={`mt-4 grid gap-4 sm:grid-cols-3 ${
          isProPlus ? "" : "select-none blur-[4px]"
        }`}
      >
        {LEASE_OPPORTUNITIES.map((opportunity) => {
          const { leaseAnnual, upliftPercent } =
            computeLeaseUplift(opportunity);
          return (
            <div
              key={opportunity.domain}
              className="rounded-xl border border-[#E2E8F0] bg-white p-5"
            >
              <h3 className="text-lg font-bold text-foreground">
                {opportunity.domain}
              </h3>
              <div className="mt-3 flex flex-col gap-1 text-sm">
                <p className="text-muted-foreground">
                  Sell estimate:{" "}
                  <span className="font-semibold text-foreground">
                    ${opportunity.sellEstimate.toLocaleString()}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Lease potential:{" "}
                  <span className="font-semibold text-foreground">
                    ${opportunity.leaseMonthly}/mo = $
                    {leaseAnnual.toLocaleString()}/yr
                  </span>
                </p>
              </div>
              <p className="mt-3 text-sm font-medium text-primary">
                Recommendation: Lease — {upliftPercent}% more revenue if
                leased for 12 months
              </p>
              <Button
                className="mt-4 w-full"
                onClick={() => onSwitchToLease(opportunity.domain)}
              >
                Switch to Lease Mode
              </Button>
            </div>
          );
        })}
      </div>

      {!isProPlus && (
        <button
          type="button"
          onClick={openUpgradeModal}
          className="absolute inset-x-0 bottom-0 top-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/60 text-center backdrop-blur-[1px]"
        >
          <Lock className="size-5 text-primary" />
          <span className="max-w-xs text-sm font-semibold text-foreground">
            Lease opportunity analysis is a Pro+ feature
          </span>
        </button>
      )}
    </div>
  );
}

function LeaseAgreementsTab({
  onGenerate,
  onDownload,
  onView,
}: {
  onGenerate: () => void;
  onDownload: (lease: ActiveLease) => void;
  onView: (lease: ActiveLease) => void;
}) {
  return (
    <div>
      <div className="flex justify-end">
        <Button onClick={onGenerate}>Generate Agreement</Button>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {ACTIVE_LEASES.map((lease) => (
          <div
            key={lease.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <FileText className="size-5 shrink-0 text-slate-400" />
              <div>
                <p className="font-semibold text-foreground">
                  {lease.domain}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lease.lessee} · Lease Agreement — Oct 2026
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownload(lease)}
              >
                Download PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => onView(lease)}>
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenerateAgreementModal({
  onClose,
  onToast,
}: {
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  const [lesseeName, setLesseeName] = useState("");
  const [lesseeEmail, setLesseeEmail] = useState("");
  const [domain, setDomain] = useState(PORTFOLIO_DOMAINS[0]?.domain ?? "");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [conditions, setConditions] = useState("");
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 py-10">
      <div
        className="fixed inset-0 bg-black/50 t-overlay-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[560px] rounded-2xl bg-white shadow-2xl t-modal-in">
        <div className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] p-6 pb-4">
          <h2 className="text-xl font-bold text-foreground">
            Generate Lease Agreement
          </h2>
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
          {generated ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#10B981]/10">
                <CheckIcon className="size-6 text-[#10B981]" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                Agreement generated — download ready
              </p>
              <Button
                className="mt-2"
                onClick={() => {
                  onToast("Agreement ready for download.");
                  onClose();
                }}
              >
                Download PDF
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setGenerated(true);
              }}
              className="flex flex-col gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Lessor name
                  </span>
                  <input
                    type="text"
                    defaultValue="Andri J."
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Domain name
                  </span>
                  <select
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none"
                  >
                    {PORTFOLIO_DOMAINS.map((entry) => (
                      <option key={entry.domain} value={entry.domain}>
                        {entry.domain}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Lessee name
                  </span>
                  <input
                    type="text"
                    required
                    value={lesseeName}
                    onChange={(event) => setLesseeName(event.target.value)}
                    placeholder="Company or person"
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Lessee email
                  </span>
                  <input
                    type="email"
                    required
                    value={lesseeEmail}
                    onChange={(event) => setLesseeEmail(event.target.value)}
                    placeholder="contact@company.com"
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Monthly fee
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center rounded-lg border border-[#E2E8F0] bg-white px-3 focus-within:border-primary">
                      <span className="text-muted-foreground">$</span>
                      <input
                        type="number"
                        min={0}
                        required
                        value={monthlyFee}
                        onChange={(event) => setMonthlyFee(event.target.value)}
                        placeholder="150"
                        className="w-full bg-transparent px-2 py-2.5 text-sm text-foreground focus:outline-none"
                      />
                    </div>
                    <select
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                      className="rounded-lg border border-[#E2E8F0] bg-white px-2 py-2.5 text-sm text-foreground focus:outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Term start date
                  </span>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Term end date
                  </span>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  Special conditions{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </span>
                <textarea
                  value={conditions}
                  onChange={(event) => setConditions(event.target.value)}
                  rows={3}
                  placeholder="Any additional terms..."
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <Button type="submit" size="lg" className="w-full">
                Generate Agreement
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentReminderModal({
  lease,
  onClose,
  onSend,
}: {
  lease: ActiveLease;
  onClose: () => void;
  onSend: (message: string) => void;
}) {
  const [message, setMessage] = useState(() => buildReminderMessage(lease));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
      <div
        className="fixed inset-0 bg-black/50 t-overlay-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl t-modal-in">
        <h2 className="text-xl font-bold text-foreground">
          Send Payment Reminder to {lease.lessee}
        </h2>
        <label className="mt-5 flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Edit message
          </span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </label>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => onSend(message)}>
            Send Reminder
          </Button>
        </div>
      </div>
    </div>
  );
}

function LeaseEngineView({
  onToast,
}: {
  onToast: (
    message: string,
    action?: { label: string; onClick: () => void }
  ) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "active" | "opportunities" | "agreements"
  >("active");
  const [reminderLease, setReminderLease] = useState<ActiveLease | null>(
    null
  );
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "active", label: "Active Leases" },
    { key: "opportunities", label: "Lease Opportunities" },
    { key: "agreements", label: "Lease Agreements" },
  ];

  return (
    <div className="mt-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Lease Engine
      </h1>
      <p className="mt-2 text-muted-foreground">
        Turn your portfolio into recurring revenue instead of one-time sales.
      </p>

      <div className="mt-6 inline-flex rounded-lg border border-[#E2E8F0] bg-slate-50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "text-slate-600 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "active" && (
          <ActiveLeasesTab
            onInvoice={(lease) =>
              onToast(`Invoice sent to ${lease.contactEmail}`)
            }
            onMessage={(lease) =>
              onToast(`Opened conversation with ${lease.lessee}`)
            }
            onRemind={(lease) => setReminderLease(lease)}
          />
        )}
        {activeTab === "opportunities" && (
          <LeaseOpportunitiesTab
            onSwitchToLease={(domain) =>
              onToast(`Switched ${domain} to Lease Mode`)
            }
          />
        )}
        {activeTab === "agreements" && (
          <LeaseAgreementsTab
            onGenerate={() => setGenerateModalOpen(true)}
            onDownload={(lease) =>
              onToast(`Downloading agreement for ${lease.domain}`)
            }
            onView={(lease) =>
              onToast(`Viewing agreement for ${lease.domain}`)
            }
          />
        )}
      </div>

      {reminderLease && (
        <PaymentReminderModal
          lease={reminderLease}
          onClose={() => setReminderLease(null)}
          onSend={() => {
            onToast(`Reminder sent to ${reminderLease.contactEmail}`);
            setReminderLease(null);
          }}
        />
      )}

      {generateModalOpen && (
        <GenerateAgreementModal
          onClose={() => setGenerateModalOpen(false)}
          onToast={onToast}
        />
      )}
    </div>
  );
}

function SettingsToggleRow({
  label,
  description,
  defaultChecked = false,
  checked: controlledChecked,
  onChange: controlledOnChange,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (value: boolean) => void;
}) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const checked = controlledChecked ?? internalChecked;
  const handleChange = controlledOnChange ?? setInternalChecked;

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Toggle on={checked} onChange={handleChange} />
    </div>
  );
}

/* ------------------------- Cancel subscription flow -------------------------- */

type CancelReason =
  | "It's too expensive"
  | "I'm not finding good domain opportunities"
  | "I don't use it enough"
  | "Missing a feature I need"
  | "Just taking a break"
  | "Other";

const CANCEL_REASONS: CancelReason[] = [
  "It's too expensive",
  "I'm not finding good domain opportunities",
  "I don't use it enough",
  "Missing a feature I need",
  "Just taking a break",
  "Other",
];

const LOSS_FEATURES: {
  icon: typeof Bot;
  name: string;
  value: string;
}[] = [
  {
    icon: Bot,
    name: "AI Domain Analysis",
    value: "Know exactly what you're buying",
  },
  {
    icon: TrendingUp,
    name: "Daily Top 10",
    value: "Today's best opportunities, curated",
  },
  { icon: Mail, name: "Offer Inbox", value: "Manage buyer conversations" },
  {
    icon: Briefcase,
    name: "Portfolio Tracker",
    value: "Track your domain investments",
  },
  { icon: Bell, name: "Price Alerts", value: "Never miss a deal" },
  {
    icon: Target,
    name: "Campaign Builder",
    value: "Automated domain hunting",
  },
];

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4].map((dot) => (
        <span
          key={dot}
          className={`size-1.5 rounded-full transition-colors ${
            dot === step ? "bg-primary" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

function CancelFlowModal({
  savedDomainsCount,
  campaignsCount,
  onClose,
  onCancelled,
  onRetained,
}: {
  savedDomainsCount: number;
  campaignsCount: number;
  onClose: () => void;
  onCancelled: () => void;
  onRetained: (message: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [missingFeatureText, setMissingFeatureText] = useState("");
  const [domainRequestText, setDomainRequestText] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const variant: "pause-or-discount" | "personal-help" | "pause-only" =
    reason === "It's too expensive" || reason === "I don't use it enough"
      ? "pause-or-discount"
      : reason === "I'm not finding good domain opportunities" ||
          reason === "Missing a feature I need"
        ? "personal-help"
        : "pause-only";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 py-10">
      <div
        className="fixed inset-0 bg-black/50 t-overlay-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[560px] rounded-2xl bg-white shadow-2xl t-modal-in">
        <div className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] p-6 pb-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : (
            <span className="size-8" />
          )}
          <ProgressDots step={step} />
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
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Before you go...
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cancelling means losing access to:
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {LOSS_FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.name}
                      className="rounded-xl border border-[#E2E8F0] p-3 text-center"
                    >
                      <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-foreground">
                        {feature.name}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {feature.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Your {savedDomainsCount} saved domain
                {savedDomainsCount === 1 ? "" : "s"} and {campaignsCount}{" "}
                active campaign{campaignsCount === 1 ? "" : "s"} will be
                paused
              </p>

              <Button size="lg" className="mt-5 w-full" onClick={onClose}>
                Keep My Pro Access
              </Button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Continue to cancel →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Help us improve
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Why are you thinking about cancelling?
              </p>

              <div className="mt-5 flex flex-col gap-2">
                {CANCEL_REASONS.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${
                      reason === option
                        ? "border-primary bg-primary/5"
                        : "border-[#E2E8F0] hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel-reason"
                      checked={reason === option}
                      onChange={() => setReason(option)}
                      className="accent-primary"
                    />
                    <span className="text-foreground">{option}</span>
                  </label>
                ))}
              </div>

              {reason === "It's too expensive" && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                  <Lightbulb className="mt-0.5 size-4 shrink-0" />
                  <span>We can help with that — see next step.</span>
                </div>
              )}

              {reason === "Missing a feature I need" && (
                <label className="mt-4 flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    What feature would keep you subscribed?
                  </span>
                  <input
                    type="text"
                    value={missingFeatureText}
                    onChange={(event) =>
                      setMissingFeatureText(event.target.value)
                    }
                    placeholder="Tell us what's missing..."
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
              )}

              <Button
                size="lg"
                className="mt-5 w-full"
                disabled={!reason}
                onClick={() => setStep(3)}
              >
                Continue →
              </Button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>
            </div>
          )}

          {step === 3 && variant === "pause-or-discount" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                How about a pause instead?
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="relative rounded-xl border-2 border-primary bg-primary/5 p-5">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    Recommended
                  </span>
                  <Pause className="size-5 text-primary" />
                  <p className="mt-2 font-semibold text-foreground">
                    Pause for 1 month
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    $0 for 30 days, then back to $19/mo
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Keep all your data and campaigns
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Resume anytime
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() =>
                      onRetained("Subscription paused for 30 days.")
                    }
                  >
                    Pause My Subscription
                  </Button>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] p-5">
                  <Percent className="size-5 text-[#10B981]" />
                  <p className="mt-2 font-semibold text-foreground">
                    Stay at 50% off
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    $9.50/month for 3 months
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    All Pro features included
                  </p>
                  <Button
                    className="mt-4 w-full bg-[#10B981] text-white hover:bg-[#10B981]/90"
                    onClick={() =>
                      onRetained("You're now at 50% off for 3 months.")
                    }
                  >
                    Get 50% Discount
                  </Button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                No thanks, continue cancelling →
              </button>
            </div>
          )}

          {step === 3 && variant === "personal-help" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Let us make it right
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Our team will personally review your account and find
                opportunities for you.
              </p>
              <label className="mt-5 flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  What kind of domains are you looking for?
                </span>
                <textarea
                  value={domainRequestText}
                  onChange={(event) =>
                    setDomainRequestText(event.target.value)
                  }
                  rows={3}
                  placeholder="e.g. short brandable .com names for a fintech startup"
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <Button
                size="lg"
                className="mt-4 w-full"
                onClick={() =>
                  onRetained(
                    "Sent to our team — we'll follow up within 24 hours."
                  )
                }
              >
                Send to our team
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                We&apos;ll reply within 24 hours with personalized picks
              </p>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                No thanks, continue cancelling →
              </button>
            </div>
          )}

          {step === 3 && variant === "pause-only" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Pause instead of cancel?
              </h2>
              <div className="mt-5 rounded-xl border-2 border-primary bg-primary/5 p-5">
                <Pause className="size-5 text-primary" />
                <p className="mt-2 font-semibold text-foreground">
                  Pause for 1 month
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  $0 for 30 days, then back to $19/mo
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Keep all your data and campaigns
                </p>
                <p className="mt-1 text-sm text-slate-600">Resume anytime</p>
                <Button
                  className="mt-4 w-full"
                  onClick={() =>
                    onRetained("Subscription paused for 30 days.")
                  }
                >
                  Pause My Subscription
                </Button>
              </div>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                No thanks, continue cancelling →
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Cancel Pro subscription?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This will take effect at end of your billing period (Oct 15,
                2026)
              </p>

              <div className="mt-5 flex flex-col gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <p>
                  After cancellation you&apos;ll still have Pro access until
                  Oct 15, 2026
                </p>
                <p>
                  Your saved domains will remain but AI analysis will be
                  locked
                </p>
                <p>You can resubscribe anytime</p>
              </div>

              <Button size="lg" className="mt-5 w-full" onClick={onClose}>
                Keep Pro — I changed my mind
              </Button>
              <button
                type="button"
                onClick={onCancelled}
                className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Yes, cancel my subscription
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsView({
  savedDomainsCount,
  campaignsCount,
  onToast,
}: {
  savedDomainsCount: number;
  campaignsCount: number;
  onToast: (message: string) => void;
}) {
  const { beginnerMode, setBeginnerMode } = useBeginnerMode();
  const { user, isPro } = useAuth();
  const [name, setName] = useState("Andri J.");
  const [email, setEmail] = useState("andri@nameflip.com");
  const [savedFlash, setSavedFlash] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "pro" | "cancelled"
  >("pro");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState("all");
  const [billingLoading, setBillingLoading] = useState(false);

  const handleSaveChanges = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

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
    } catch (error) {
      onToast(
        error instanceof Error ? error.message : "Could not open billing portal"
      );
      setBillingLoading(false);
    }
  };

  const handleRetained = (message: string) => {
    setCancelModalOpen(false);
    onToast(message);
  };

  const handleCancelled = () => {
    setSubscriptionStatus("cancelled");
    setCancelModalOpen(false);
    onToast("Subscription cancelled. Access continues until Oct 15.");
  };

  return (
    <div className="mt-8 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Settings
      </h1>

      <div className="mt-6 flex flex-col gap-5 rounded-xl border border-[#E2E8F0] bg-white p-6">
        <p className="font-semibold text-foreground">Account</p>

        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white">
            AJ
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Camera className="size-4" />
            Change photo
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Name
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Email
          </span>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            <span className="shrink-0 rounded-full bg-[#10B981]/10 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
              Verified
            </span>
          </div>
        </label>

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Password
          </p>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <span className="text-sm tracking-widest text-foreground">
              ••••••••
            </span>
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
            >
              Change password
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSaveChanges}>Save Changes</Button>
          {savedFlash && (
            <span className="text-sm font-medium text-[#10B981]">Saved</span>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-6">
        <p className="font-semibold text-foreground">Subscription</p>

        {subscriptionStatus === "pro" ? (
          <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            Pro — $19/month
          </span>
        ) : (
          <span className="w-fit rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600">
            Free plan — Resubscribe
          </span>
        )}

        {subscriptionStatus === "pro" && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Next billing date
              </span>
              <span className="font-medium text-foreground">
                October 15, 2026
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment method</span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <CreditCard className="size-4 text-slate-400" />
                Visa ending in 4242
              </span>
            </div>
          </>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button onClick={openUpgradeModal}>Upgrade to Pro+</Button>
            {isPro && (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={billingLoading}
              >
                {billingLoading && <Loader2 className="size-4 animate-spin" />}
                Manage Billing
              </Button>
            )}
          </div>
          {subscriptionStatus === "pro" ? (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Cancel Subscription
            </button>
          ) : (
            <button
              type="button"
              onClick={openUpgradeModal}
              className="text-sm font-medium text-primary hover:underline"
            >
              Resubscribe
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5 rounded-xl border border-[#E2E8F0] bg-white p-6">
        <p className="font-semibold text-foreground">Notifications</p>
        <SettingsToggleRow
          label="Daily opportunity digest email"
          defaultChecked
        />
        <div className="h-px bg-[#E2E8F0]" />
        <SettingsToggleRow label="New offer received" defaultChecked />
        <div className="h-px bg-[#E2E8F0]" />
        <SettingsToggleRow label="Price drop alerts" defaultChecked />
        <div className="h-px bg-[#E2E8F0]" />
        <SettingsToggleRow label="Weekly domain trend report" />
      </div>

      <div className="mt-6 flex flex-col gap-5 rounded-xl border border-[#E2E8F0] bg-white p-6">
        <p className="font-semibold text-foreground">Search Preferences</p>
        <div>
          <SettingsToggleRow
            label="Beginner Safety Mode — hide high-risk domains"
            checked={beginnerMode}
            onChange={setBeginnerMode}
          />
          {beginnerMode && (
            <div className="mt-3 rounded-lg bg-emerald-50 p-3">
              <p className="flex items-start gap-2 text-sm font-medium text-emerald-800">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-[#10B981]" />
                Beginner mode active — high-risk domains are hidden and
                warnings are shown
              </p>
              <p className="mt-1 pl-6 text-xs text-emerald-700">
                Turn this off anytime as you gain experience
              </p>
            </div>
          )}
        </div>
        <div className="h-px bg-[#E2E8F0]" />
        <SettingsToggleRow label="Show expired domains only" />
        <div className="h-px bg-[#E2E8F0]" />
        <SettingsToggleRow label="Auto-save interesting domains" />
        <div className="h-px bg-[#E2E8F0]" />
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-foreground">
            Default search category
          </span>
          <select
            value={searchCategory}
            onChange={(event) => setSearchCategory(event.target.value)}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-foreground focus:outline-none"
          >
            <option value="all">All</option>
            <option value="flip">Flip</option>
            <option value="build">Build</option>
            <option value="seo">SEO</option>
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-800">Danger Zone</p>
        <p className="mt-1 text-sm text-red-700">
          This will permanently delete all your saved domains, campaigns and
          data.
        </p>
        <Button
          variant="outline"
          className="mt-4 gap-1.5 border-red-300 text-red-700 hover:bg-red-100"
        >
          <Trash2 className="size-4" />
          Delete Account
        </Button>
      </div>

      {cancelModalOpen && (
        <CancelFlowModal
          savedDomainsCount={savedDomainsCount}
          campaignsCount={campaignsCount}
          onClose={() => setCancelModalOpen(false)}
          onCancelled={handleCancelled}
          onRetained={handleRetained}
        />
      )}
    </div>
  );
}

/* ---------------------------------- Dashboard -------------------------------- */

const FADE_DELAY = 400;
const SEARCH_LIMIT = 5;
const SAVE_LIMIT = 3;
const TOAST_DURATION = 4000;

function Toast({
  message,
  action,
}: {
  message: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-[110] flex justify-center px-4">
      <div className="t-toast flex max-w-sm items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl">
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

function BeginnerNudgeToast({
  onOpenSettings,
  onDismiss,
}: {
  onOpenSettings: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[110] w-[calc(100%-3rem)] max-w-sm">
      <div className="t-toast flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xl">
        <div className="flex items-start gap-2.5">
          <Shield className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              New to domain investing?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Turn on Beginner Safety Mode in Settings to get guidance and
              hide risky domains.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button size="sm" onClick={onOpenSettings}>
            Open Settings
          </Button>
          <button
            type="button"
            onClick={onDismiss}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

const CONFETTI_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

function ProWelcomeModal({ onClose }: { onClose: () => void }) {
  const confettiPieces = Array.from({ length: 40 }, (_, index) => ({
    left: (index * 37) % 100,
    delay: (index % 10) * 0.3,
    duration: 2.2 + (index % 5) * 0.4,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  }));

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden p-4">
      <div className="fixed inset-0 bg-black/50 t-overlay-in" onClick={onClose} />
      {confettiPieces.map((piece, index) => (
        <span
          key={index}
          className="t-confetti-piece"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl t-modal-in">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-7 text-primary" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-foreground">
          Welcome to Pro!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Unlimited searches, full AI analysis, and unlimited saves are now
          unlocked.
        </p>
        <Button className="mt-6 w-full" onClick={onClose}>
          Let&apos;s go
        </Button>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [activeView, setActiveView] = useState<View>("search");
  const [inputValue, setInputValue] = useState("AI tools");
  const [submittedQuery, setSubmittedQuery] = useState("AI tools");
  const [mode, setMode] = useState("flip");
  const [isSearching, setIsSearching] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [skeletonFading, setSkeletonFading] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [savedDomains, setSavedDomains] = useState<Set<string>>(new Set());
  const [searchesUsed, setSearchesUsed] = useState(2);
  const [selectedDomain, setSelectedDomain] = useState<SelectedDomain | null>(
    null
  );
  const [liveResults, setLiveResults] = useState<DomainResult[] | null>(null);
  const [searchApiError, setSearchApiError] = useState<string | null>(null);
  const [loadingQuery, setLoadingQuery] = useState(inputValue);
  const [analysisCache, setAnalysisCache] = useState<
    Record<string, AnalysisState>
  >({});
  const [toast, setToast] = useState<{
    message: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [showCampaignSuccess, setShowCampaignSuccess] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(
    null
  );
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [showBeginnerNudge, setShowBeginnerNudge] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan>("free");
  const [showProWelcome, setShowProWelcome] = useState(false);
  const router = useRouter();

  const refreshProfile = () => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (!data.user) {
        setUserPlan("free");
        return;
      }
      supabase
        .from("profiles")
        .select("plan")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.plan) setUserPlan(profile.plan as UserPlan);
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
      .select("domain")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) {
          setSavedDomains(new Set(data.map((row) => row.domain as string)));
        }
      });
  }, [user]);

  const isPro = userPlan === "pro" || userPlan === "pro_plus";
  const isProPlus = userPlan === "pro_plus";

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        if (localStorage.getItem(BEGINNER_MODE_KEY) === "true") {
          setBeginnerMode(true);
        }
      } catch {
        // localStorage unavailable — keep the default (off).
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(BEGINNER_MODE_KEY, String(beginnerMode));
    } catch {
      // Ignore — the preference just won't persist across reloads.
    }
  }, [beginnerMode]);

  useEffect(() => {
    let alreadyShown = true;
    try {
      alreadyShown = localStorage.getItem(BEGINNER_PROMPT_SHOWN_KEY) === "true";
    } catch {
      alreadyShown = true;
    }
    if (alreadyShown) return;
    const timeout = setTimeout(() => setShowBeginnerNudge(true), 3000);
    return () => clearTimeout(timeout);
  }, []);

  const dismissBeginnerNudge = () => {
    setShowBeginnerNudge(false);
    try {
      localStorage.setItem(BEGINNER_PROMPT_SHOWN_KEY, "true");
    } catch {
      // Ignore — the nudge may just reappear next session.
    }
  };

  const showToast = (
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    setToast({ message, action });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), TOAST_DURATION);
  };

  const handleShareListing = async (domain: string) => {
    const url = `${window.location.origin}/for-sale/${domain}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard access can fail (permissions, insecure context); the toast
      // still confirms so the user knows to copy the URL manually if needed.
    }
    showToast("Link copied!");
  };

  const runSearch = (rawValue: string) => {
    const trimmed = rawValue.trim();

    if (!trimmed) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 280);
      return;
    }

    if (isSearching) return;

    if (searchesUsed >= SEARCH_LIMIT) {
      openUpgradeModal();
      return;
    }

    setInputValue(trimmed);
    setLoadingQuery(trimmed);
    setSearchesUsed((prev) => prev + 1);
    setIsSearching(true);
    setShowSkeleton(true);
    setSkeletonFading(false);

    const finishReveal = () => {
      setSubmittedQuery(trimmed);
      setIsSearching(false);
      setRevealKey((key) => key + 1);
      setSkeletonFading(true);
      setTimeout(() => setShowSkeleton(false), FADE_DELAY);
    };

    // Test search: type "AI tools" and click Search — should return 8-12
    // real domain suggestions from Claude once ANTHROPIC_API_KEY is set.
    fetch("/api/search-domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: trimmed, category: mode, limit: 10 }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) {
          throw new Error(
            typeof data?.error === "string" ? data.error : "Search failed"
          );
        }
        setLiveResults(
          (data as ApiSearchResult[]).map((item) =>
            mapApiDomainToCard(item, mode)
          )
        );
        setSearchApiError(null);
      })
      .catch((error: Error) => {
        setLiveResults(null);
        setSearchApiError(error.message || "Search failed");
      })
      .finally(finishReveal);
  };

  const requestAnalysis = (domain: string) => {
    setAnalysisCache((prev) =>
      prev[domain] === "loading" ? prev : { ...prev, [domain]: "loading" }
    );

    // Test analysis: click "Analyze with AI" on any domain — should return
    // real Claude analysis in ~3 seconds once ANTHROPIC_API_KEY is set.
    // Test rate limit: trigger analysis 6 times — the 6th shows the upgrade
    // toast below instead of a result.
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
              "You've used your 5 free analyses today. Upgrade for unlimited.",
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

  const handleSearch = () => runSearch(inputValue);

  const toggleSaved = (domain: string) => {
    if (savedDomains.has(domain)) {
      setSavedDomains((prev) => {
        const next = new Set(prev);
        next.delete(domain);
        return next;
      });
      if (user) {
        supabase
          .from("saved_domains")
          .delete()
          .eq("user_id", user.id)
          .eq("domain", domain)
          .then(() => {});
      }
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    if (!isPro && savedDomains.size >= SAVE_LIMIT) {
      showToast(
        `You've reached your save limit (${SAVE_LIMIT}/${SAVE_LIMIT}). Upgrade to Pro to save unlimited domains.`,
        {
          label: "Upgrade",
          onClick: () => {
            setToast(null);
            openUpgradeModal();
          },
        }
      );
      return;
    }

    const analysis = analysisCache[domain];
    supabase
      .from("saved_domains")
      .insert({
        user_id: user.id,
        domain,
        analysis: typeof analysis === "object" ? analysis : null,
      })
      .then(() => {});

    setSavedDomains((prev) => {
      const next = new Set(prev);
      next.add(domain);
      return next;
    });
  };

  const activeCampaign =
    campaigns.find((campaign) => campaign.id === activeCampaignId) ?? null;

  const handleLaunchCampaign = (draft: CampaignDraft) => {
    if (!draft.goal) return;
    const campaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: draft.name.trim(),
      goal: draft.goal,
      maxTotal: Number(draft.maxTotal) || 0,
      maxPerDomain: Number(draft.maxPerDomain) || 0,
      includeFree: draft.includeFree,
      risk: draft.risk,
    };
    setCampaigns((prev) => [...prev, campaign]);
    setWizardOpen(false);
    setShowCampaignSuccess(true);
    setTimeout(() => {
      setShowCampaignSuccess(false);
      setActiveView("campaigns");
    }, 700);
  };

  const goalToMode: Record<CampaignGoal, string> = {
    "quick-flip": "flip",
    "long-term": "build",
    business: "build",
  };

  const handleFindDomains = (campaign: Campaign) => {
    setActiveCampaignId(campaign.id);
    setMode(goalToMode[campaign.goal]);
    setActiveView("search");
  };

  return (
    <AuthContext.Provider value={{ user, userPlan, isPro, isProPlus }}>
    <BeginnerModeContext.Provider value={{ beginnerMode, setBeginnerMode }}>
    <div className="min-h-screen bg-white">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <div className="ml-60 min-h-screen p-8">
        <DashboardHeader searchesUsed={searchesUsed} />
        <UpgradeNudgeBanner />

        {activeView === "search" && (
          <>
            <BeginnerModeBanner />
            <div className="mt-6">
              <LiveStatsBar />
            </div>
            <HotRightNowBanner onSelect={setInputValue} />
            {searchesUsed >= SEARCH_LIMIT && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <span>
                  You&apos;ve used all 5 free searches this month. Upgrade to
                  Pro for unlimited access.
                </span>
                <button
                  type="button"
                  onClick={openUpgradeModal}
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Upgrade
                </button>
              </div>
            )}
            <SearchSection
              value={inputValue}
              onChange={setInputValue}
              onSearch={handleSearch}
              onSuggestionClick={runSearch}
              isSearching={isSearching}
              isShaking={isShaking}
              mode={mode}
              onModeChange={setMode}
              onCreateCampaign={() => setWizardOpen(true)}
              activeCampaign={activeCampaign}
              onClearCampaign={() => setActiveCampaignId(null)}
            />
            <ResultsSection
              query={submittedQuery}
              loadingQuery={loadingQuery}
              isSearching={isSearching}
              showSkeleton={showSkeleton}
              skeletonFading={skeletonFading}
              revealKey={revealKey}
              mode={mode}
              savedDomains={savedDomains}
              liveResults={liveResults}
              searchApiError={searchApiError}
              onToggleSave={toggleSaved}
              onOpenDetail={setSelectedDomain}
              onRetrySearch={() => runSearch(submittedQuery)}
            />
          </>
        )}
        {activeView === "campaigns" && (
          <CampaignsView
            campaigns={campaigns}
            onNewCampaign={() => setWizardOpen(true)}
            onFindDomains={handleFindDomains}
          />
        )}
        {activeView === "top10" && (
          <DailyTop10View
            onOpenDetail={setSelectedDomain}
            savedDomains={savedDomains}
            onToggleSave={toggleSaved}
          />
        )}
        {activeView === "saved" && (
          <SavedDomainsView
            savedDomains={savedDomains}
            onToggleSave={toggleSaved}
            onOpenDetail={setSelectedDomain}
            onShare={handleShareListing}
            onStartSearching={() => setActiveView("search")}
          />
        )}
        {activeView === "offers" && <OffersView />}
        {activeView === "portfolio" && <PortfolioView />}
        {activeView === "leaseEngine" && <LeaseEngineView onToast={showToast} />}
        {activeView === "settings" && (
          <SettingsView
            savedDomainsCount={savedDomains.size}
            campaignsCount={campaigns.length}
            onToast={showToast}
          />
        )}
      </div>

      {selectedDomain && (
        <DomainDetailModal
          selected={selectedDomain}
          onClose={() => setSelectedDomain(null)}
          analysisCache={analysisCache}
          onRequestAnalysis={requestAnalysis}
        />
      )}

      {toast && <Toast message={toast.message} action={toast.action} />}

      {wizardOpen && (
        <CampaignWizardModal
          onClose={() => setWizardOpen(false)}
          onLaunch={handleLaunchCampaign}
        />
      )}

      {showCampaignSuccess && <CampaignSuccessFlash />}

      {showBeginnerNudge && (
        <BeginnerNudgeToast
          onOpenSettings={() => {
            setActiveView("settings");
            dismissBeginnerNudge();
          }}
          onDismiss={dismissBeginnerNudge}
        />
      )}

      {showProWelcome && (
        <ProWelcomeModal onClose={() => setShowProWelcome(false)} />
      )}
    </div>
    </BeginnerModeContext.Provider>
    </AuthContext.Provider>
  );
}
