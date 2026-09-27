import Stripe from "stripe";

// NOTE: the spec's original apiVersion string ("2024-11-20.acacia") predates
// the installed `stripe` SDK version, whose types only accept its own
// current pinned version. Using that string here to stay type-safe.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-08-26.dahlia",
});
