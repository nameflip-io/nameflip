import Image from "next/image";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HeroSearch } from "@/components/hero-search";
import { HowItWorks } from "@/components/how-it-works";
import { SiteHeader } from "@/components/site-header";
import { PricingCtaButton } from "@/components/pricing-cta-button";
import { CtaSearch } from "@/components/cta-search";
import { FaqSection } from "@/components/faq-section";
import { FooterColumn } from "@/components/footer-column";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Try NameFlip and see your first opportunities.",
    included: [
      "5 searches per month",
      "Basic AI score (0–100)",
      "Domain availability check",
      "Register via Namecheap/GoDaddy",
    ],
    notIncluded: [
      "Full AI analysis",
      "Saved domains (max 3)",
      "Domain detail reports",
    ] as string[] | null,
    cta: "Start for Free",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For hunters who search every day.",
    included: [
      "Unlimited searches",
      "Full AI analysis",
      "Saved domains",
    ],
    notIncluded: null as string[] | null,
    cta: "Get Started",
    href: "#",
    highlighted: true,
  },
  {
    name: "Pro+",
    price: "$49",
    description: "For power users building a portfolio.",
    included: ["Everything in Pro"],
    notIncluded: null as string[] | null,
    cta: "Get Started",
    href: "#",
    highlighted: false,
  },
];

function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <Image
        src="/hero-clouds.png"
        alt=""
        fill
        priority
        className="object-cover"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-b from-transparent to-white"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs">
          AI-powered domain intelligence
        </Badge>

        <h1 className="text-balance font-heading text-5xl font-bold tracking-tight text-[#0F172A] sm:text-7xl">
          Find domains worth buying.
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-lg text-[#64748B]">
          Describe a niche and your budget. NameFlip suggests domain names,
          checks them, and explains which ones look worth buying.
        </p>

        <HeroSearch />

        <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
          Free to start · No credit card required
        </p>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-muted-foreground">
          Start free. Upgrade when the domains start paying for themselves.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl gap-6 px-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative ${tier.highlighted ? "lg:-translate-y-2" : ""}`}
          >
            {tier.highlighted && (
              <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <Card
              className={`flex h-full flex-col border p-2 ${
                tier.highlighted
                  ? "border-primary/60 bg-card shadow-[0_0_40px_-14px_rgba(37,99,235,0.4)]"
                  : "border-border bg-card"
              }`}
            >
              <CardHeader className="gap-3">
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="flex items-baseline gap-1">
                    <span className="font-heading text-4xl font-semibold">
                      {tier.price}
                    </span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </span>
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6">
                <div className="flex flex-1 flex-col gap-4">
                  <ul className="flex flex-col gap-3 text-sm">
                    {tier.included.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-[#10B981]" />
                        <span className="text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {tier.notIncluded && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="h-px flex-1 bg-border" />
                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Upgrade to unlock
                        </span>
                        <span className="h-px flex-1 bg-border" />
                      </div>
                      <ul className="flex flex-1 flex-col gap-3 text-sm">
                        {tier.notIncluded.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 opacity-80"
                          >
                            <Lock className="mt-0.5 size-3 shrink-0 text-[#9CA3AF]" />
                            <span className="text-[#9CA3AF]">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
                {tier.href === "#" ? (
                  <PricingCtaButton
                    label={tier.cta}
                    highlighted={tier.highlighted}
                  />
                ) : (
                  <Button
                    variant={tier.highlighted ? "default" : "outline"}
                    className="w-full"
                    nativeButton={false}
                    render={<Link href={tier.href} />}
                  >
                    {tier.cta}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #ffffff 0%, #dbeafe 8%, #3b82f6 18%, #1e3a8a 28%, #000008 42%, #000008 58%, #1e3a8a 72%, #3b82f6 82%, #dbeafe 92%, #ffffff 100%)",
      }}
    >
      {/* Subtle side glow blobs for depth */}
      <div className="pointer-events-none absolute inset-0">
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "-10%",
            width: "60%",
            height: "60%",
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "-10%",
            width: "60%",
            height: "60%",
            background:
              "radial-gradient(ellipse, rgba(139,92,246,0.3) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Content centered in the dark middle band */}
      <div
        className="relative z-10 flex flex-col items-center justify-center px-6 text-center"
        style={{ paddingTop: "22%", paddingBottom: "22%" }}
      >
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-blue-400">
          AI Domain Intelligence
        </p>
        <h2 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
          Ready to find your
          <br />
          next domain?
        </h2>
        <p className="mb-10 text-lg text-gray-300">
          Start with a free search. No credit card required.
        </p>

        <CtaSearch />

        <p className="mt-4 text-sm text-gray-400">
          Free to start · No credit card required
        </p>
      </div>
    </section>
  );
}

const FOOTER_COLUMNS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Product",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "X (Twitter)", href: "#" },
      { label: "TikTok", href: "#" },
      { label: "Instagram", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Contact Us", href: "mailto:nameflip.io@gmail.com" },
    ],
  },
];

function Footer() {
  return (
    <footer style={{ backgroundColor: "#F0F4F8" }}>
      <div
        className="mx-auto flex max-w-6xl flex-col items-center px-6 text-center"
        style={{ paddingTop: 80, paddingBottom: 80 }}
      >
        <Image
          src="/nameflip.com.svg"
          alt="NameFlip"
          width={320}
          height={320}
          style={{ height: "clamp(120px, 16vw, 220px)", width: "auto" }}
        />
      </div>

      <div
        style={{
          backgroundColor: "#F0F4F8",
          borderTop: "1px solid #E5E7EB",
          padding: "40px 24px",
        }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 sm:grid-cols-3">
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} {...column} />
          ))}
        </div>
        <p
          className="mt-10 text-center"
          style={{ fontSize: 13, color: "#9CA3AF" }}
        >
          © {new Date().getFullYear()} NameFlip. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Pricing />
        <FinalCta />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
