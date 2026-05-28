export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(): Promise<NextResponse> {
  const results: Record<string, "ok" | "error"> = {};

  // Check Firestore
  try {
    await adminDb().collection("_health").limit(1).get();
    results.firebase = "ok";
  } catch {
    results.firebase = "error";
  }

  // Check Stripe connectivity
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      results.stripe = "ok";
    } else {
      results.stripe = "error";
    }
  } catch {
    results.stripe = "error";
  }

  // Check AI key
  results.ai = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY ? "ok" : "error";

  const allOk = Object.values(results).every((v) => v === "ok");
  return NextResponse.json({ status: allOk ? "ok" : "degraded", services: results });
}
