import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { BUDGET_TIERS } from "@/lib/types";
import type { BudgetTier, DomainResult, SearchParams } from "@/lib/types";

const SEARCH_RATE_LIMIT = 30;

const SYSTEM_PROMPT = `You are a domain research tool for a flipping platform. Given a search query, an optional TLD filter, and a buyer's budget tier, suggest realistic expired or available domain names that would match — and that the buyer can actually afford and realistically resell.

Return a JSON array of domain objects, each with:
- domain: string (full domain with TLD, e.g. 'aiinvoice.com')
- age: number (years, estimated)
- referringDomains: number (estimated backlinks)
- auctionPrice: number (USD, realistic auction starting bid — MUST fall within the buyer's stated buy range)
- tld: string ('.com', '.io', '.net', etc.)

BUDGET DISCIPLINE — this is the most important rule:
- Every domain's auctionPrice MUST realistically fall within the buyer's buy range for their tier. Do not suggest $30,000 one-word .com domains to a Starter buyer with a $10-50 budget — that's useless to them.
- Starter ($10-50 buy): fresh-drop/expired domains, 2-4 word brandables, newer TLDs, little to no backlink history. Realistic starter-flip inventory, not fantasy domains.
- Growth ($50-500 buy): domains with some age/backlinks, decent 2-word .com or .io names, early-niche keyword matches.
- Pro ($500-5,000 buy): established aged domains, strong keyword or brandable .com/.io names, some exact-match value.
- Expert ($5,000+ buy): premium one/two-word .com domains, exact-match high-value keywords, domains with real sale comps in the tens of thousands.
Suggest 8-12 domains. Make them realistic and relevant to the query. If a TLD filter other than "all" is given, every domain MUST use that TLD. Respond with ONLY a JSON array.`;

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
    const tldFilter =
      params.category === "all" ? "all" : `.${params.category}`;
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Search query: "${params.query}". TLD filter: ${tldFilter}. ${budgetContext(params.budget)} Suggest domains that fit this buyer's budget.`,
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
