import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase/admin";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

function getCustomerUserId(customer: Stripe.Customer | Stripe.DeletedCustomer): string | undefined {
  if (customer.deleted) return undefined;
  return (customer as Stripe.Customer).metadata?.userId;
}

function getSubscriptionPeriod(subscription: Stripe.Subscription): { start: number; end: number } {
  const sub = subscription as unknown as { current_period_start: number; current_period_end: number };
  return { start: sub.current_period_start, end: sub.current_period_end };
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const userId = getCustomerUserId(customer);
  if (!userId) return;
  const { start, end } = getSubscriptionPeriod(subscription);

  await db.collection("users").doc(userId).update({
    stripe: {
      customerId,
      subscriptionId: subscription.id,
      plan: subscription.items.data[0]?.price?.metadata?.plan || "pro",
      status: subscription.status,
      currentPeriodStart: start,
      currentPeriodEnd: end,
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const userId = getCustomerUserId(customer);
  if (!userId) return;
  const { end } = getSubscriptionPeriod(subscription);

  await db.collection("users").doc(userId).update({
    stripe: { customerId, status: subscription.status, currentPeriodEnd: end },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const userId = getCustomerUserId(customer);
  if (!userId) return;

  await db.collection("users").doc(userId).update({
    stripe: { status: "canceled", plan: "free" },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook signature verification failed:", msg);
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
  }

  return NextResponse.json({ received: true });
}
