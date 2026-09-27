import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, userEmail } = body;

  // `STRIPE_PRO_PRICE_ID`/`STRIPE_PRO_PLUS_PRICE_ID` are server-only env vars
  // (no NEXT_PUBLIC_ prefix), so the client can't read them directly to send
  // as `priceId`. Callers may pass `plan: "pro" | "pro_plus"` instead and this
  // route resolves the real price id itself; `priceId` still works directly
  // for callers that already have one.
  const priceId: string | undefined =
    body.priceId ??
    (body.plan === "pro_plus"
      ? process.env.STRIPE_PRO_PLUS_PRICE_ID
      : body.plan === "pro"
        ? process.env.STRIPE_PRO_PRICE_ID
        : undefined);

  if (!priceId || !userId || !userEmail) {
    return NextResponse.json(
      { error: "priceId (or plan), userId, and userEmail are required" },
      { status: 400 }
    );
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  let customerId = profile?.stripe_customer_id as string | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { userId },
    });
    customerId = customer.id;
    await supabaseAdmin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", userId);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    metadata: { userId },
  });

  return NextResponse.json({ url: session.url });
}
