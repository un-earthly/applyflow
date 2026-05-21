<<<<<<< HEAD
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const rawBody = await req.text();

  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
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
=======
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase/admin";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const metadata = customer.metadata as any;
  const userId = metadata?.userId;

  if (!userId) return;

  await db.collection("users").doc(userId).update({
    stripe: {
      customerId,
      subscriptionId: subscription.id,
      plan: subscription.items.data[0]?.price?.metadata?.plan || "pro",
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const metadata = customer.metadata as any;
  const userId = metadata?.userId;

  if (!userId) return;

  await db.collection("users").doc(userId).update({
    stripe: {
      customerId,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const metadata = customer.metadata as any;
  const userId = metadata?.userId;

  if (!userId) return;

  await db.collection("users").doc(userId).update({
    stripe: {
      status: "canceled",
      plan: "free",
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Handle invoice paid - could send receipt email, update usage, etc.
  console.log("Invoice paid:", invoice.id);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
  }

  return NextResponse.json({ received: true });
}
