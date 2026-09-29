import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { BUDGET_TIERS } from "@/lib/types";
import type { BudgetTier, DomainResult, SearchParams } from "@/lib/types";

const SEARCH_RATE_LIMIT = 30;

const SYSTEM_PROMPT = `You are the AI Discovery Engine behind a domain-flipping platform, in the same vein as AIFlipDomains or Atom.com. Given a niche/topic, a buying goal, and a buyer's budget tier, surface realistic expired or available domain names worth buying — the same way a real domainer's discovery feed works, not a keyword permutation script.

CRITICAL — how to read the search query:
The query describes a NICHE or TOPIC the buyer is interested in, NOT a string to paste into a domain name. Understand what business/industry it points to, then suggest names the way real buyers of that niche would want — short, brandable, memorable, or exact-match ONLY when the exact match itself has real standalone value.

NEVER produce lazy keyword-stuffed patterns like "affordable" + niche-word, "best" + niche-word, "the" + niche-word, or niche-word + "hub"/"pro"/"zone" tacked on. A real LED lighting brand looks like "Nordicli" or "Luminexa" — not "affordableledlighting.com". If you wouldn't see a real company use the name as their actual brand or a domainer list it for real money, don't suggest it.

Use a mix of these techniques (weighted by the buying goal below):
- Invented/brandable: fused compounds, clipped words, suffix coinage, clean spelling twists (e.g. "Luminexa", "Glowlyte", "Voltique" for an LED-lighting niche) — short, pronounceable, trademark-safe.
- Exact-match keyword ONLY when it's a genuinely strong standalone asset (short, clean, no filler words like "best/top/affordable/pro/hub/zone/site/store" glued on) — these carry real SEO/direct-navigation value.
- Real dictionary or evocative words adjacent to the niche (metaphors, synonyms, industry jargon) that a buyer in that space would recognize.

Return a JSON array of domain objects, each with:
- domain: string (full domain with TLD, e.g. 'luminexa.com')
- age: number (years, estimated; 0 for a fresh/available registration)
- referringDomains: number (estimated backlinks; 0 if fresh)
- auctionPrice: number (USD, realistic auction/registration price — MUST fall within the buyer's stated buy range)
- tld: string (pick whatever TLD genuinely fits the name and niche — .com, .io, .ai, .co, .net, etc. — never force one TLD across all results)
- verdict: "buy" | "consider" | "avoid" — your honest call, like a real discovery engine's Buy/Avoid/Hold signal
- verdictReason: string, ONE short sentence — the specific length/keyword-strength/comparable-sale/demand signal behind the verdict (e.g. "Short, brandable, no direct comps but strong in-niche fit" or "Generic phrase, weak resale demand at this price")

SCORING — decide each verdict using the same signals a real discovery engine weighs:
- Length and cleanliness (shorter and cleaner = stronger)
- Keyword strength (does it signal the niche without being a stuffed phrase?)
- Comparable sales / demand signal (would similar names have sold, or is there active buyer demand in this niche?)
- Fit to the buyer's budget tier (a domain outside their realistic resale range is a weaker "buy" even if the name itself is good)
Mix verdicts honestly — not everything should be "buy"; a realistic feed has some "consider" and even a couple "avoid" included as context, exactly like a real tool would show.

BUDGET DISCIPLINE:
- Every domain's auctionPrice MUST realistically fall within the buyer's buy range for their tier. Do not suggest $30,000 one-word .com domains to a Starter buyer with a $10-50 budget — that's useless to them.
- Starter ($10-50 buy): fresh-drop/available domains, invented short brandables, newer TLDs, little to no backlink history.
- Growth ($50-500 buy): some age/backlinks, decent invented or clean 2-word names, early-niche keyword matches.
- Pro ($500-5,000 buy): established aged domains, strong keyword or brandable .com/.io names, some exact-match value.
- Expert ($5,000+ buy): premium one/two-word .com domains, exact-match high-value keywords, domains with real sale comps in the tens of thousands.

GOAL — the buyer picked one of these, which should shape the mix of names above:
- "flip": optimize for fast resale — a healthy mix of brandable and strong exact-match names, whatever moves fastest at this budget.
- "build": weight toward invented/brandable names a real company would build a lasting brand on — like the buyer's own store name, not a generic keyword string.
- "seo": weight toward clean exact-match or strong keyword-adjacent names with real content/SEO value — but still no filler-word stuffing.

Suggest 8-12 domains. Respond with ONLY a JSON array.`;

function budgetContext(budget: BudgetTier): string {
  const tier = BUDGET_TIERS.find((t) => t.key === budget) ?? BUDGET_TIERS[0];
  const buyHigh = tier.buyRange.high ? `$${tier.buyRange.high}` : "no upper limit";
  const sellHigh = tier.sellRange.high ? `$${tier.sellRange.high}` : "no upper limit";
  return `Buyer tier: ${tier.label} (${tier.description}). Buy budget: $${tier.buyRange.low}-${buyHigh}. Target resale range: $${tier.sellRange.low}-${sellHigh}.`;
}

function extractJsonArray(text: string): unknown[] {
  const trimmed = text.trim();
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error("No JSON array found in Claude response");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`search:${ip}`, SEARCH_RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit reached", upgradeRequired: true },
      { status: 429 }
    );
  }

  let params: SearchParams;
  try {
    const body = await request.json();
    params = {
      query: String(body.query ?? "").trim(),
      category: (body.category ?? "all") as SearchParams["category"],
      budget: (body.budget ?? "growth") as SearchParams["budget"],
      limit: Number(body.limit) || 10,
    };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!params.query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    // NOTE: params.category is the buyer's GOAL (flip / build / seo), not a
    // TLD filter — do not force a single TLD across results from it.
    const goal = params.category === "all" ? "flip" : params.category;
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 3072,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Niche/topic: "${params.query}". Buying goal: ${goal}. ${budgetContext(params.budget)} Surface domains from your discovery feed that fit this niche, goal, and budget.`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in Claude response");
    }

    const domains = extractJsonArray(textBlock.text) as DomainResult[];
    return NextResponse.json(domains.slice(0, params.limit));
  } catch (error) {
    console.error("search-domains failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

// Test: type "AI tools" and click Search — should return 8-12 real domain
// suggestions from Claude once ANTHROPIC_API_KEY is set in .env.local.
