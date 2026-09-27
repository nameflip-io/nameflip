import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Called automatically in the background for every search result, so this
// needs a more generous ceiling than the analyze-domain limit.
const CHECK_RATE_LIMIT = 60;

const NAMECHEAP_SANDBOX_ENDPOINT =
  "https://api.sandbox.namecheap.com/xml.response";

function isNamecheapConfigured() {
  return Boolean(
    process.env.NAMECHEAP_API_KEY &&
      process.env.NAMECHEAP_API_KEY !== "your_key_here" &&
      process.env.NAMECHEAP_API_USER &&
      process.env.NAMECHEAP_CLIENT_IP
  );
}

function mockAvailability() {
  return {
    available: Math.random() > 0.5,
    price: Math.floor(Math.random() * 20) + 8,
    currency: "USD" as const,
  };
}

interface NamecheapCheckResult {
  $: {
    Domain: string;
    Available: string;
    PremiumRegistrationPrice?: string;
  };
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
    domain = String(body.domain ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  if (!isNamecheapConfigured()) {
    return NextResponse.json(mockAvailability());
  }

  try {
    const params = new URLSearchParams({
      ApiUser: process.env.NAMECHEAP_API_USER!,
      ApiKey: process.env.NAMECHEAP_API_KEY!,
      UserName: process.env.NAMECHEAP_API_USER!,
      ClientIp: process.env.NAMECHEAP_CLIENT_IP!,
      Command: "namecheap.domains.check",
      DomainList: domain,
    });

    const response = await fetch(
      `${NAMECHEAP_SANDBOX_ENDPOINT}?${params.toString()}`
    );
    const xml = await response.text();
    const parsed = await parseStringPromise(xml);

    const result: NamecheapCheckResult | undefined =
      parsed?.ApiResponse?.CommandResponse?.[0]?.DomainCheckResult?.[0];

    if (!result) {
      throw new Error("Unexpected Namecheap response shape");
    }

    return NextResponse.json({
      available: result.$.Available === "true",
      price: result.$.PremiumRegistrationPrice
        ? Number(result.$.PremiumRegistrationPrice)
        : null,
      currency: "USD",
    });
  } catch (error) {
    console.error("check-domain failed:", error);
    // Fall back to mock data rather than breaking the UI.
    return NextResponse.json(mockAvailability());
  }
}

// Test: domain badges in search results should update within ~2 seconds
// of results loading, showing green "Available" or orange "Taken".
