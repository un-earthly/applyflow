import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-04-30.basil",
});

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

  const profileSnap = await adminDb().collection("profiles").doc(uid).get();
  const stripeCustomerId = profileSnap.data()?.stripeCustomerId as string | undefined;

  if (!stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
  });

  return NextResponse.json({ url: session.url });
}
