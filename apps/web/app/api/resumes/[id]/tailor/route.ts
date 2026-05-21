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

  const { jd } = await req.json() as { jd: string };
  if (!jd?.trim()) return NextResponse.json({ error: "jd is required" }, { status: 400 });

  const resumeContent = snap.data()!.content as Record<string, unknown>;

  // Real implementation would call OpenAI here.
  // Returning a realistic mock response.
  const resumeText = JSON.stringify(resumeContent).toLowerCase();
  const jdWords = jd.toLowerCase().match(/\b\w{4,}\b/g) ?? [];
  const uniqueKeywords = [...new Set(jdWords)].filter((w) => !["with", "this", "that", "have", "will", "your", "their"].includes(w));

  const matched = uniqueKeywords.filter((k) => resumeText.includes(k)).slice(0, 8);
  const missing = uniqueKeywords.filter((k) => !resumeText.includes(k)).slice(0, 6);

  const suggestions = missing.slice(0, 3).map((keyword) => ({
    section: "Summary",
    original: "Experienced professional with strong background.",
    tailored: `Experienced professional with strong background in ${keyword}.`,
  }));

  return NextResponse.json({ matchedSkills: matched, missingSkills: missing, suggestions });
}
