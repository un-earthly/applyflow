export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

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

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids, updates } = await req.json() as { ids: string[]; updates: Record<string, unknown> };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array is required" }, { status: 400 });
  }

  const db = adminDb();
  const batch = db.batch();

  for (const id of ids.slice(0, 100)) {
    const ref = db.collection("applications").doc(id);
    const snap = await ref.get();
    if (snap.exists && snap.data()!.userId === uid) {
      batch.update(ref, { ...updates, updatedAt: FieldValue.serverTimestamp() });
    }
  }

  await batch.commit();
  return NextResponse.json({ success: true, updated: ids.length });
}
