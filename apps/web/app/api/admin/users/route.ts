export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

async function assertAdmin(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.slice(7);
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const profile = await adminDb().collection("profiles").doc(decoded.uid).get();
    if (profile.data()?.role !== "admin") return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const uid = await assertAdmin(req);
  if (!uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan");
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);

  let q = adminDb().collection("profiles").orderBy("createdAt", "desc").limit(limit);
  if (plan) q = q.where("subscriptionTier", "==", plan) as typeof q;

  const snap = await q.get();
  const users = snap.docs.map((d) => ({
    id: d.id,
    email: d.data().email,
    displayName: d.data().displayName,
    subscriptionTier: d.data().subscriptionTier ?? "free",
    createdAt: d.data().createdAt,
    lastActiveAt: d.data().lastActiveAt,
    role: d.data().role,
  }));

  return NextResponse.json({ users });
}
