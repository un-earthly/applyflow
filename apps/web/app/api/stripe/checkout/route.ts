import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { headers } from "next/headers";

const PRICE_ID_MAP: Record<string, string> = {
  pro: STRIPE_PRICE_IDS.monthly,
  "pro-annual": STRIPE_PRICE_IDS.yearly,
};

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json();

    if (planId === "free") {
      return NextResponse.json({ error: "Cannot checkout free plan" }, { status: 400 });
    }

    const priceId = PRICE_ID_MAP[planId];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const headersList = await headers();
    const origin = headersList.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
