import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Called automatically in the background for every search result, so this
// needs a more generous ceiling than the analyze-domain limit.
const CHECK_RATE_LIMIT = 60;

interface DomainCheckResult {
  available: boolean | null;
  price: number | null;
  currency: string;
  expiryDate: string | null;
}

// GoDaddy public availability API — no key required, works from Vercel
async function checkViaGodaddy(domain: string): Promise<{ available: boolean | null; price: number | null }> {
  try {
    const url = `https://api.godaddy.com/v1/domains/available?domain=${encodeURIComponent(domain)}&checkType=FAST&forTransfer=false`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) return { available: null, price: null };

    const data = await response.json();
    const available = data.available === true;
    // GoDaddy returns price in micros (millionths of a dollar)
    const price = available && data.price ? Math.round(data.price / 1000000) : null;

    return { available, price: price && price > 0 ? price : available ? 12 : null };
  } catch {
    return { available: null, price: null };
  }
}

// RDAP lookup for expiry date on registered domains
async function getExpiryViaRdap(domain: string): Promise<string | null> {
  try {
    const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: { Accept: "application/rdap+json" },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const events: Array<{ eventAction: string; eventDate: string }> = data.events ?? [];
    const expiry = events.find((e) => e.eventAction === "expiration");
    return expiry?.eventDate ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`check:${ip}`, CHECK_RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit reached", upgradeRequired: true },
      { status: 429 }
    );
  }

  let domain: string;
  try {
    const body = await request.json();
    domain = String(body.domain ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  try {
    const { available, price } = await checkViaGodaddy(domain);

    // If taken, try to get expiry date from RDAP in parallel — best effort
    let expiryDate: string | null = null;
    if (available === false) {
      expiryDate = await getExpiryViaRdap(domain);
    }

    const result: DomainCheckResult = {
      available,
      price: available ? (price ?? 12) : null,
      currency: "USD",
      expiryDate,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("check-domain failed:", error);
    return NextResponse.json({ available: null, price: null, currency: "USD", expiryDate: null });
  }
}

// Test: domain badges in search results should update within ~5 seconds
// of results loading, showing green "Available $12" or red "Taken (expires YYYY-MM-DD)".
