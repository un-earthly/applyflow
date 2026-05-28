import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { FieldValue } from "firebase-admin/firestore";

const PRICE_ID_MAP: Record<string, string> = {
  pro: STRIPE_PRICE_IDS.monthly,
  "pro-annual": STRIPE_PRICE_IDS.yearly,
};

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

export async function POST(request: NextRequest) {
  try {
    const uid = await getUid(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { planId } = (await request.json()) as { planId: string };
    if (planId === "free") {
      return NextResponse.json({ error: "Cannot checkout free plan" }, { status: 400 });
    }

    const priceId = PRICE_ID_MAP[planId];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const profileSnap = await adminDb().collection("profiles").doc(uid).get();
    let stripeCustomerId = profileSnap.data()?.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      const userRecord = await adminAuth().getUser(uid);
      const customer = await stripe.customers.create({
        email: userRecord.email,
        name: userRecord.displayName,
        metadata: { userId: uid },
      });
      stripeCustomerId = customer.id;
      await adminDb()
        .collection("profiles")
        .doc(uid)
        .set({ stripeCustomerId }, { merge: true });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/dashboard/settings/billing?success=1`,
      cancel_url: `${origin}/dashboard/settings/billing/upgrade?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
