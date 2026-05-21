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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = (await req.json()) as { name: string };
  const allowed = ["linkedin", "notion", "calendly", "slack"];
  if (!allowed.includes(name)) {
    return NextResponse.json({ error: "Unknown integration" }, { status: 400 });
  }

  await adminDb().collection("profiles").doc(uid).update({
    [`integrations.${name}`]: FieldValue.delete(),
  });

  return NextResponse.json({ success: true });
}
