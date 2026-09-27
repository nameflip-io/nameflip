import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { DomainAnalysis } from "@/lib/types";

// Free users: max 5 analyze-domain calls per hour, tracked by IP.
const ANALYZE_RATE_LIMIT = 5;

const SYSTEM_PROMPT = `You are a domain investment analyst. Analyze the given domain name and return a JSON object with exactly these fields:
- opportunityScore: number 0-100
- estimatedValue: { low: number, high: number } (USD)
- tags: string[] (max 4, e.g. ['SEO Value', 'Flipable', 'Trending', 'Premium .com'])
- whyInteresting: string[] (3-4 bullet points explaining value)
- risks: string[] (1-2 potential downsides)
- recommendedUse: 'flip' | 'build' | 'seo' | 'hold'
- searchTrend: 'rising' | 'stable' | 'declining'
- niche: string (e.g. 'AI / SaaS', 'Health Tech', 'Finance')
Respond with ONLY valid JSON, no explanation.`;

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
