<<<<<<< HEAD
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });
}

async function getUid(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.slice(7);
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { interval = "month" } = await req.json() as { interval?: "month" | "year" };

  const profileSnap = await adminDb().collection("profiles").doc(uid).get();
  const email = profileSnap.data()?.email as string | undefined;

  const priceId = interval === "year"
    ? process.env.STRIPE_PRICE_YEARLY
    : process.env.STRIPE_PRICE_MONTHLY;

  if (!priceId) {
    return NextResponse.json({ error: "Stripe price ID not configured" }, { status: 500 });
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    metadata: { uid },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing/upgrade`,
  });

  return NextResponse.json({ url: session.url });
}
=======
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

    const headersList = headers();
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
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
