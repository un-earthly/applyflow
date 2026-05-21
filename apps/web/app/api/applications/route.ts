export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { parseBody } from "@/lib/api-validate";

const applicationSchema = z.object({
  companyName: z.string().min(1).max(200),
  roleTitle: z.string().min(1).max(200),
  jobUrl: z.string().url().or(z.literal("")).optional(),
  source: z.enum(["linkedin","indeed","greenhouse","lever","workday","ashby","direct","referral","other"]).default("direct"),
  status: z.enum(["applied","screening","interview","offer","rejected","ghosted"]).default("applied"),
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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb()
    .collection("applications")
    .where("userId", "==", uid)
    .orderBy("appliedAt", "desc")
    .get();

  return NextResponse.json({ applications: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rawBody = await req.json();
  const parsed = parseBody(applicationSchema, rawBody);
  if ("error" in parsed) return parsed.error;

  const ref = await adminDb().collection("applications").add({
    ...parsed.data,
    userId: uid,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
}
