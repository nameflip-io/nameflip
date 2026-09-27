"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const OPEN_EVENT = "nameflip:open-upgrade-modal";

export function openUpgradeModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_EVENT));
  }
}

const PRO_FEATURES = [
  "Unlimited searches",
  "Daily Top 10 feed",
  "Full AI analysis",
  "Saved domains",
  "Domain detail reports",
];

const PRO_PLUS_FEATURES = [
  "Everything in Pro",
  "Auction alerts",
  "Niche trend radar",
  "Portfolio tracker",
  "AI negotiation suggestions",
];

const WHAT_YOU_UNLOCK = [
  "Full AI analysis on every domain",
  "Complete Daily Top 10 feed",
  "Unlimited domain saves",
];

export function UpgradeModal() {
  const [open, setOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<
    "pro" | "pro_plus" | null
  >(null);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleUpgrade = async (plan: "pro" | "pro_plus") => {
    setCheckoutLoading(plan);
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      window.location.href = "/login";
      return;
    }
    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          userId: data.user.id,
          userEmail: data.user.email,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) {
        throw new Error(result.error || "Checkout failed");
      }
      window.location.href = result.url;
    } catch {
      setCheckoutLoading(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
      <div
        className="fixed inset-0 bg-black/50 t-overlay-in"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-10 my-8 w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-2xl t-modal-in sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Unlock Full Access
            </h2>
            <p className="mt-1 text-muted-foreground">
              You&apos;ve discovered what NameFlip can do. Now go further.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          You&apos;re on Free — 5 searches/month
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="relative rounded-xl border-2 border-primary p-5">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
              Most users choose this
            </span>
            <p className="font-semibold text-foreground">Pro</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  $19
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </span>
              <span className="text-sm text-muted-foreground line-through">
                $39/mo
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Save 51%
              </span>
            </div>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#10B981]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="mt-5 w-full"
              onClick={() => handleUpgrade("pro")}
              disabled={checkoutLoading !== null}
            >
              {checkoutLoading === "pro" && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Upgrade to Pro
            </Button>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] p-5">
            <p className="font-semibold text-foreground">Pro+</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  $49
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </span>
              <span className="text-sm text-muted-foreground line-through">
                $99/mo
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Save 51%
              </span>
            </div>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
              {PRO_PLUS_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#10B981]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="mt-5 w-full"
              onClick={() => handleUpgrade("pro_plus")}
              disabled={checkoutLoading !== null}
            >
              {checkoutLoading === "pro_plus" && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Upgrade to Pro+
            </Button>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Prices increase at the end of the month
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-5">
          <p className="text-sm font-semibold text-foreground">
            What you unlock right now
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-700">
            {WHAT_YOU_UNLOCK.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Cancel anytime. No contracts. Instant access after payment.
        </p>
      </div>
    </div>
  );
}
