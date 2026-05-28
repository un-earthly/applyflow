import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

async function getUidFromCustomer(customerId: string): Promise<string | null> {
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return null;
  const uid = (customer as Stripe.Customer).metadata?.userId;
  return uid ?? null;
}

function tierFromPriceMetadata(sub: Stripe.Subscription): string {
  const meta = sub.items.data[0]?.price?.metadata;
  return meta?.plan ?? "pro";
}

function periodEnd(sub: Stripe.Subscription): number {
  return (sub as unknown as { current_period_end: number }).current_period_end;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    console.error("Webhook signature failed:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;
        const uid = session.customer
          ? await getUidFromCustomer(session.customer as string)
          : null;
        if (!uid) break;
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await adminDb().collection("profiles").doc(uid).set(
          {
            subscriptionTier: tierFromPriceMetadata(sub),
            subscriptionStatus: sub.status,
            subscriptionCurrentPeriodEnd: new Date(periodEnd(sub) * 1000),
            stripeCustomerId: session.customer,
            stripeSubscriptionId: sub.id,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const uid = await getUidFromCustomer(sub.customer as string);
        if (!uid) break;
        await adminDb().collection("profiles").doc(uid).set(
          {
            subscriptionTier: sub.status === "active" ? tierFromPriceMetadata(sub) : "free",
            subscriptionStatus: sub.status,
            subscriptionCurrentPeriodEnd: new Date(periodEnd(sub) * 1000),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const uid = await getUidFromCustomer(sub.customer as string);
        if (!uid) break;
        await adminDb().collection("profiles").doc(uid).set(
          {
            subscriptionTier: "free",
            subscriptionStatus: "canceled",
            subscriptionCurrentPeriodEnd: null,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const uid = invoice.customer
          ? await getUidFromCustomer(invoice.customer as string)
          : null;
        if (!uid) break;
        await adminDb()
          .collection("profiles")
          .doc(uid)
          .set({ subscriptionStatus: "past_due", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
