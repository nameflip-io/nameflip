import type { Metadata } from "next";
import Link from "next/link";
import { Check, Lock, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { OfferForm } from "@/components/offer-form";
import { getListingData } from "@/lib/domain-listing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  return {
    title: `${domain} — Domain For Sale | NameFlip`,
    description: `${domain} is available for sale. Make an offer or buy now via NameFlip.`,
  };
}

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-bold text-foreground ${valueClassName ?? ""}`}>
        {value}
      </p>
    </div>
  );
}

export default async function ForSaleDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: rawDomain } = await params;
  const data = getListingData(rawDomain);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <span className="text-sm font-medium text-muted-foreground">
            Domain For Sale
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <section className="text-center">
          <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            {data.domain}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8">
            {data.hasFixedPrice ? (
              <p className="text-4xl font-bold text-foreground">
                {data.price}
              </p>
            ) : (
              <p className="text-2xl font-semibold text-muted-foreground">
                Make an Offer
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" nativeButton={false} render={<a href="#offer" />}>
              Make an Offer
            </Button>
            {data.hasFixedPrice && (
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<a href="#offer" />}
              >
                Buy Now — {data.price}
              </Button>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-[#10B981]" />
              Secure Transfer
            </span>
            <span className="hidden h-4 w-px bg-[#E2E8F0] sm:block" />
            <span className="flex items-center gap-1.5">
              <Lock className="size-4 text-[#10B981]" />
              Escrow Available
            </span>
            <span className="hidden h-4 w-px bg-[#E2E8F0] sm:block" />
            <span className="flex items-center gap-1.5">
              <Zap className="size-4 text-[#10B981]" />
              Fast Delivery
            </span>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-xl font-bold text-foreground">Domain Stats</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <StatCard label="Domain Age" value={data.age} />
            <StatCard label="Global Searches" value={data.monthlySearches} />
            <StatCard label="Backlinks" value={String(data.backlinks)} />
            <StatCard
              label="Trend"
              value={data.trend}
              valueClassName="text-[#10B981]"
            />
            <StatCard label="Estimated Value" value={data.estimatedValue} />
            <StatCard label="Category" value={data.category} />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground">
            Why This Domain
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            {data.reasons.map((reason) => (
              <li
                key={reason}
                className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4"
              >
                <Check className="mt-0.5 size-5 shrink-0 text-[#10B981]" />
                <span className="text-sm text-slate-700">{reason}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="offer" className="mt-16 scroll-mt-8">
          <h2 className="text-xl font-bold text-foreground">
            Make an Offer
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Interested in {data.domain}? Send your offer below.
          </p>
          <div className="mt-5">
            <OfferForm domain={data.domain} />
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E2E8F0] py-8 text-center text-sm text-muted-foreground">
        Powered by{" "}
        <Link href="/" className="font-semibold text-primary hover:underline">
          NameFlip
        </Link>
      </footer>
    </div>
  );
}
