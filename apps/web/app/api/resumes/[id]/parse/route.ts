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

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const snap = await adminDb().collection("resumes").doc(id).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (snap.data()!.userId !== uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // In production, this would parse the uploaded PDF/DOCX from Firebase Storage
  // and extract structured resume sections using an AI model.
  const parsed = {
    basics: { name: "", email: "", phone: "", location: "", summary: "" },
    work: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  };

  await adminDb().collection("resumes").doc(id).update({
    content: parsed,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ content: parsed });
}
