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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb()
    .collection("resumes")
    .where("userId", "==", uid)
    .orderBy("updatedAt", "desc")
    .get();

  const resumes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ resumes });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { name?: string; content?: Record<string, unknown> };
  const ref = await adminDb().collection("resumes").add({
    userId: uid,
    name: body.name ?? "Untitled resume",
    content: body.content ?? {},
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: ref.id }, { status: 201 });
}
