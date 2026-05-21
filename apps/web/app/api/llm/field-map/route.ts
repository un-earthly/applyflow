export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

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

interface FieldSchema {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fields, resumeId } = await req.json() as {
    fields: FieldSchema[];
    resumeId?: string;
  };

  let resumeContent: Record<string, unknown> = {};
  if (resumeId) {
    const snap = await adminDb().collection("resumes").doc(resumeId).get();
    if (snap.exists && snap.data()!.userId === uid) {
      resumeContent = snap.data()!.content as Record<string, unknown> ?? {};
    }
  } else {
    const profileSnap = await adminDb().collection("profiles").doc(uid).get();
    resumeContent = profileSnap.data() ?? {};
  }

  // Simple heuristic field mapping — production would use an LLM
  const mappings: Record<string, string> = {};
  for (const field of fields) {
    const key = (field.name + " " + (field.label ?? "") + " " + (field.placeholder ?? "")).toLowerCase();
    if (key.includes("first") && key.includes("name")) mappings[field.name] = (resumeContent.fullName as string ?? "").split(" ")[0] ?? "";
    else if (key.includes("last") && key.includes("name")) mappings[field.name] = (resumeContent.fullName as string ?? "").split(" ").slice(1).join(" ");
    else if (key.includes("name")) mappings[field.name] = resumeContent.fullName as string ?? "";
    else if (key.includes("email")) mappings[field.name] = resumeContent.email as string ?? "";
    else if (key.includes("phone")) mappings[field.name] = resumeContent.phone as string ?? "";
    else if (key.includes("location") || key.includes("city")) mappings[field.name] = resumeContent.location as string ?? "";
    else if (key.includes("linkedin")) mappings[field.name] = resumeContent.linkedin as string ?? "";
    else if (key.includes("website") || key.includes("portfolio")) mappings[field.name] = resumeContent.website as string ?? "";
  }

  return NextResponse.json({ mappings, confidence: Object.keys(mappings).length / fields.length });
}
