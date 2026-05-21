export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { parseBody } from "@/lib/api-validate";

const coverLetterCreateSchema = z.object({
  company: z.string().max(200).optional(),
  role: z.string().max(200).optional(),
  jd: z.string().max(20000).optional(),
  resumeId: z.string().optional(),
});

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
    .collection("coverLetters")
    .where("userId", "==", uid)
    .orderBy("createdAt", "desc")
    .get();

  return NextResponse.json({ coverLetters: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rawBody = await req.json();
  const parsed = parseBody(coverLetterCreateSchema, rawBody);
  if ("error" in parsed) return parsed.error;
  const { company, role, jd, resumeId } = parsed.data;

  // In production, generate with OpenAI using the resume content + JD
  const content = `Dear Hiring Manager,\n\nI am excited to apply for the ${role ?? "position"} role at ${company ?? "your company"}.\n\n[AI-generated content will appear here in production]\n\nBest regards`;

  const ref = await adminDb().collection("coverLetters").add({
    userId: uid,
    company: company ?? "",
    role: role ?? "",
    resumeId: resumeId ?? null,
    content,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: ref.id, content }, { status: 201 });
}
