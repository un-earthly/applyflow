import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const rawBody = await req.text();

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = adminDb();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid = session.metadata?.uid;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (uid) {
        await db.collection("profiles").doc(uid).update({
          subscriptionTier: "pro",
          subscriptionStatus: "active",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const customers = await db
        .collection("profiles")
        .where("stripeCustomerId", "==", customerId)
        .get();
      for (const doc of customers.docs) {
        await doc.ref.update({ subscriptionTier: "free", subscriptionStatus: "cancelled" });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const status = sub.status;
      const customers = await db
        .collection("profiles")
        .where("stripeCustomerId", "==", customerId)
        .get();
      for (const doc of customers.docs) {
        await doc.ref.update({
          subscriptionStatus: status,
          subscriptionTier: status === "active" ? "pro" : "free",
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
