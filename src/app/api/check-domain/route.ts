import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const CHECK_RATE_LIMIT = 60;

async function checkViaRdap(domain: string): Promise<boolean | null> {
  const tld = domain.split(".").pop()?.toLowerCase();
  if (!tld) return null;

  const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(domain)}`;

  const response = await fetch(rdapUrl, {
    headers: { Accept: "application/rdap+json" },
    signal: AbortSignal.timeout(5000),
  });

  if (response.status === 404) return true;
  if (response.ok) return false;
  return null;
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
    const available = await checkViaRdap(domain);

    if (available === null) {
      return NextResponse.json({ available: null, price: null, currency: "USD" });
    }

    return NextResponse.json({
      available,
      price: available ? 12 : null,
      currency: "USD",
    });
  } catch (error) {
    console.error("check-domain failed:", error);
    return NextResponse.json({ available: null, price: null, currency: "USD" });
  }
}