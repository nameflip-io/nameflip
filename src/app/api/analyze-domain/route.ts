import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { DomainAnalysis } from "@/lib/types";

// Free users: max 5 analyze-domain calls per hour, tracked by IP.
const ANALYZE_RATE_LIMIT = 5;

const SYSTEM_PROMPT = `You are an expert domain flipper and investor with 10+ years experience. You have sold hundreds of domains on Sedo, Flippa, Afternic, and GoDaddy Auctions. You know real market prices.

Analyze the given domain and return a JSON object with EXACTLY these fields. Be specific and actionable — no vague advice.

PRICING RULES (use these as baselines):
- .com 1 word, generic: $500–50,000+
- .com 2 words, brandable: $200–5,000
- .com 2 words, exact match keyword: $500–10,000
- .io 1-2 words, tech: $300–3,000
- .co/.net/.org: 30-50% of .com equivalent
- .ai domains: premium, 2-5x .io prices
- Domains with "AI", "crypto", "health", "finance" keywords: +50-200% premium
- Short (under 6 chars): significant premium
- Numbers or hyphens: -70% discount

Return this exact JSON structure:
{
  "opportunityScore": <0-100, be realistic: 90+ only for exceptional domains>,
  "estimatedValue": { "low": <USD>, "high": <USD> },
  "flipStrategy": {
    "buyPrice": <what to pay max, USD>,
    "listPrice": <where to list it first, USD>,
    "quickSalePrice": <accept this if you need fast cash, USD>,
    "timeToSell": <realistic estimate, e.g. "2-6 months">,
    "wherToSell": <specific platforms, e.g. "Sedo, Afternic, GoDaddy Auctions">
  },
  "comparableSales": <2-3 real or realistic comparable domain sales with prices, as a string, e.g. "aitools.io sold $3,200 (2023), aisearch.co sold $1,800 (2022)">,
  "tags": <array of max 4 strings from: 'Premium .com', 'AI Niche', 'Crypto Niche', 'Health Niche', 'Finance Niche', 'Short Name', 'Exact Match', 'Brandable', 'Flipable', 'SEO Value', 'Build It', 'Hold Asset'>,
  "whyInteresting": <array of 3-4 SPECIFIC bullet points — mention the niche, keyword value, who would buy it, why now>,
  "risks": <array of 1-2 specific risks — e.g. trademark issues, saturated niche, TLD disadvantage>,
  "recommendedUse": <"flip" | "build" | "seo" | "hold">,
  "searchTrend": <"rising" | "stable" | "declining">,
  "niche": <specific niche, e.g. "AI / SaaS", "Health Tech", "DeFi / Crypto", "E-commerce">,
  "potentialBuyers": <who would pay top dollar — specific types of companies or individuals>
}

Respond with ONLY valid JSON. No explanation outside the JSON.`;

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in Claude response");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`analyze:${ip}`, ANALYZE_RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit reached", upgradeRequired: true },
      { status: 429 }
    );
  }

  let domain: string;
  try {
    const body = await request.json();
    domain = String(body.domain ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `Analyze this domain: ${domain}` },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in Claude response");
    }

    const analysis = extractJsonObject(textBlock.text) as DomainAnalysis;
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("analyze-domain failed:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

// Test: click "Analyze with AI" on any domain card — should return real
// Claude analysis in ~3 seconds once ANTHROPIC_API_KEY is set in .env.local.
// Test rate limit: call this route 6 times in an hour from the same IP —
// the 6th call should return { error, upgradeRequired: true } with 429.
