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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jd, resumeId } = await req.json() as { jd: string; resumeId?: string };
  if (!jd?.trim()) return NextResponse.json({ error: "jd is required" }, { status: 400 });

  let resumeText = "";
  if (resumeId) {
    const snap = await adminDb().collection("resumes").doc(resumeId).get();
    if (snap.exists && snap.data()!.userId === uid) {
      resumeText = JSON.stringify(snap.data()!.content ?? "").toLowerCase();
    }
  }

  const jdWords = [...new Set(jd.toLowerCase().match(/\b\w{4,}\b/g) ?? [])];
  const matched = jdWords.filter((w) => resumeText.includes(w));
  const score = jdWords.length > 0 ? Math.round((matched.length / jdWords.length) * 100) : 0;

  return NextResponse.json({
    score,
    matchedSkills: matched.slice(0, 10),
    missingSkills: jdWords.filter((w) => !resumeText.includes(w)).slice(0, 10),
  });
}
