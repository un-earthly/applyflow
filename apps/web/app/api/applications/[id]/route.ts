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

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const snap = await adminDb().collection("applications").doc(id).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (snap.data()!.userId !== uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ id: snap.id, ...snap.data() });
}

export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ref = adminDb().collection("applications").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (snap.data()!.userId !== uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json() as Record<string, unknown>;
  await ref.update({ ...body, updatedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ref = adminDb().collection("applications").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (snap.data()!.userId !== uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await ref.delete();
  return NextResponse.json({ success: true });
}
