import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/logo";
import { LeaseInquiryForm } from "@/components/lease-inquiry-form";
import { getLeaseListingData } from "@/lib/lease-listing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  return {
    title: `${domain} — Available for Lease | NameFlip`,
    description: `Lease ${domain} instead of buying outright. Flexible terms via NameFlip.`,
  };
}

const INCLUDED_ITEMS = [
  "DNS Management",
  "Email Forwarding",
  "Monthly Reports",
  "Priority Support",
  "Transfer Option",
  "Dedicated Setup",
];

function ComparisonRow({
  label,
  lease,
  buy,
}: {
  label: string;
  lease: string;
  buy: string;
}) {
  return (
    <tr className="border-b border-[#E2E8F0] last:border-0">
      <td className="py-3 text-sm text-muted-foreground">{label}</td>
      <td className="py-3 text-center text-sm font-semibold text-primary">
        {lease}
      </td>
      <td className="py-3 text-center text-sm font-medium text-foreground">
        {buy}
      </td>
    </tr>
  );
}

export default async function LeaseDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: rawDomain } = await params;
  const data = getLeaseListingData(rawDomain);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <span className="text-sm font-medium text-muted-foreground">
            Domain For Lease
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <section className="text-center">
          <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            {data.domain}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              Available for Lease
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {data.minTermMonths}-month minimum
            </span>
          </div>

          <p className="mt-8 text-4xl font-bold text-foreground">
            ${data.monthlyPrice}
            <span className="text-lg font-medium text-muted-foreground">
              /month
            </span>
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#inquire"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Request Lease Info
            </a>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-xl font-bold text-foreground">
            What&apos;s Included
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {INCLUDED_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white p-4"
              >
                <Check className="size-4 shrink-0 text-[#10B981]" />
                <span className="text-sm font-medium text-foreground">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground">
            Lease vs. Buy Outright
          </h2>
          <div className="mt-5 overflow-hidden rounded-xl border border-[#E2E8F0]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-slate-50 text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium"> </th>
                  <th className="px-4 py-3 text-center font-medium text-primary">
                    Lease
                  </th>
                  <th className="px-4 py-3 text-center font-medium">
                    Buy Outright
                  </th>
                </tr>
              </thead>
              <tbody className="px-4">
                <ComparisonRow
                  label="Monthly cost"
                  lease={`$${data.monthlyPrice}`}
                  buy="—"
                />
                <ComparisonRow
                  label="Upfront cost"
                  lease={`$${data.depositAmount} deposit`}
                  buy={`$${data.buyPrice.toLocaleString()}`}
                />
                <ComparisonRow
                  label="Commitment"
                  lease={`${data.minTermMonths} month${data.minTermMonths === 1 ? "" : "s"}`}
                  buy="Permanent"
                />
                <ComparisonRow
                  label="Try before you buy"
                  lease="Yes"
                  buy="No"
                />
                <ComparisonRow
                  label="Cancel anytime after min. term"
                  lease="Yes"
                  buy="No"
                />
              </tbody>
            </table>
          </div>
        </section>

        <section id="inquire" className="mt-16 scroll-mt-8">
          <h2 className="text-xl font-bold text-foreground">
            Request Lease Info
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Interested in leasing {data.domain}? Tell us about your plans.
          </p>
          <div className="mt-5">
            <LeaseInquiryForm domain={data.domain} />
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
