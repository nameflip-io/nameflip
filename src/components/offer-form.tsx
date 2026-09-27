"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfferForm({ domain }: { domain: string }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#10B981]/10">
          <Check className="size-6 text-[#10B981]" />
        </div>
        <p className="text-lg font-semibold text-foreground">
          Offer sent for {domain}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your info is never shared. We respond within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
      className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Name</span>
          <input
            type="text"
            required
            placeholder="Jane Cooper"
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Email</span>
          <input
            type="email"
            required
            placeholder="jane@company.com"
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Offer Amount ($)
          </span>
          <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-white px-3 focus-within:border-primary">
            <span className="text-muted-foreground">$</span>
            <input
              type="number"
              min={0}
              required
              placeholder="2,500"
              className="w-full bg-transparent px-2 py-2.5 text-sm text-foreground focus:outline-none"
            />
          </div>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Message <span className="font-normal text-muted-foreground">(optional)</span>
          </span>
          <input
            type="text"
            placeholder="Tell the seller a bit about your plans"
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </label>
      </div>

      <Button type="submit" size="lg" className="mt-5 w-full sm:w-auto">
        Submit Offer
      </Button>

      <p className="mt-4 text-xs text-muted-foreground">
        Your info is never shared. We respond within 24 hours.
      </p>
    </form>
  );
}
