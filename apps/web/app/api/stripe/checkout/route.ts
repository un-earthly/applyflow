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
