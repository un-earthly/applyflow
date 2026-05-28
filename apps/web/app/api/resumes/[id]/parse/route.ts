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

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ref = adminDb().collection("users").doc(uid).collection("resumes").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  await ref.update({
    content: parsed,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ content: parsed });
}
