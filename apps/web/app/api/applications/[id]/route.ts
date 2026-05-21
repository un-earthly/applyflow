export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { parseBody } from "@/lib/api-validate";

const applicationUpdateSchema = z.object({
  company: z.string().min(1).max(200).optional(),
  role: z.string().min(1).max(200).optional(),
  url: z.string().url().or(z.literal("")).optional(),
  source: z
    .enum(["linkedin", "indeed", "greenhouse", "lever", "workday", "ashby", "direct", "referral", "other"])
    .optional(),
  status: z.enum(["applied", "screening", "interview", "offer", "rejected", "ghosted"]).optional(),
  location: z.string().max(200).optional(),
  salaryRange: z.string().max(100).optional(),
  notes: z.string().max(10000).optional(),
  appliedAt: z.string().datetime().optional(),
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

function appRef(uid: string, id: string) {
  return adminDb().collection("users").doc(uid).collection("applications").doc(id);
}

export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const snap = await appRef(uid, id).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id: snap.id, ...snap.data() });
}

export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ref = appRef(uid, id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const rawBody = await req.json();
  const parsed = parseBody(applicationUpdateSchema, rawBody);
  if ("error" in parsed) return parsed.error;
  await ref.update({ ...parsed.data, updatedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ref = appRef(uid, id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await ref.delete();
  return NextResponse.json({ success: true });
}
