import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { DomainResult, SearchParams } from "@/lib/types";

const SEARCH_RATE_LIMIT = 30;

const SYSTEM_PROMPT = `You are a domain research tool. Given a search query and an optional TLD filter, suggest realistic expired or available domain names that would match. Return a JSON array of domain objects, each with:
- domain: string (full domain with TLD, e.g. 'aiinvoice.com')
- age: number (years, estimated)
- referringDomains: number (estimated backlinks)
- auctionPrice: number (USD, realistic auction starting bid)
- tld: string ('.com', '.io', '.net', etc.)
Suggest 8-12 domains. Make them realistic and relevant to the query. If a TLD filter other than "all" is given, every domain MUST use that TLD. Respond with ONLY a JSON array.`;

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
          content: `Search query: "${params.query}". TLD filter: ${tldFilter}. Suggest domains.`,
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
