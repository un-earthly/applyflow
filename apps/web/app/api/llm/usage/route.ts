export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profileSnap = await adminDb().collection("profiles").doc(uid).get();
  const tier = profileSnap.data()?.subscriptionTier ?? "free";

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const usageSnap = await adminDb()
    .collection("llmUsage")
    .where("userId", "==", uid)
    .where("createdAt", ">=", Timestamp.fromDate(monthStart))
    .get();

  const used = usageSnap.size;
  const cap = tier === "pro" ? 500 : 10;

  return NextResponse.json({ used, cap, remaining: Math.max(0, cap - used), tier });
}
