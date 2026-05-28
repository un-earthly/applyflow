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

  const snap = await adminDb().collection("featureFlags").orderBy("name").get();
  const flags = snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    description: d.data().description,
    enabled: d.data().enabled ?? false,
    rolloutPercent: d.data().rolloutPercent ?? 100,
    updatedAt: d.data().updatedAt,
  }));

  return NextResponse.json({ flags });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const uid = await assertAdmin(req);
  if (!uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, enabled, rolloutPercent } = await req.json() as {
    id: string;
    enabled?: boolean;
    rolloutPercent?: number;
  };

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (enabled !== undefined) update.enabled = enabled;
  if (rolloutPercent !== undefined) update.rolloutPercent = rolloutPercent;

  await adminDb().collection("featureFlags").doc(id).update(update);

  return NextResponse.json({ ok: true });
}
