import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { DomainResult, SearchParams } from "@/lib/types";

// NOTE: `@supabase/auth-helpers-nextjs` (0.15.0) has been gutted in favor of
// `@supabase/ssr` — it only exports the modern `createServerClient` (getAll/
// setAll cookie adapters), not the deprecated `createRouteHandlerClient`.
// Same pattern already used in src/app/auth/callback/route.ts.

const PLAN_SEARCH_LIMITS: Record<string, number> = {
  free: 5,
  pro: 50,
  pro_plus: 9999,
};

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

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

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("searches_used_today, last_reset_date, plan")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 500 });
  }

  const month = currentMonth();
  const searchesUsed =
    profile.last_reset_date === month ? profile.searches_used_today ?? 0 : 0;
  const plan = (profile.plan as string) ?? "free";
  const limit = PLAN_SEARCH_LIMITS[plan] ?? PLAN_SEARCH_LIMITS.free;

  if (searchesUsed >= limit) {
    return NextResponse.json(
      { error: "Monthly search limit reached", upgradeRequired: true, plan },
      { status: 429 }
    );
  }

  const { error: incrementError } = await supabase
    .from("profiles")
    .update({ searches_used_today: searchesUsed + 1, last_reset_date: month })
    .eq("id", user.id);

  if (incrementError) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
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

// Test search: log in, type "AI tools" and click Search — should return
// 8-12 real domain suggestions from Claude once ANTHROPIC_API_KEY is set.
// Test quota: search 6 times on a free plan — the 6th returns 429 with
// { error: "Monthly search limit reached", upgradeRequired: true, plan }.
