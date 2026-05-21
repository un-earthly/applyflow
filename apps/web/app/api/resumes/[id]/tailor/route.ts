export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import OpenAI from "openai";

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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const snap = await adminDb().collection("resumes").doc(id).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (snap.data()!.userId !== uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { jd } = (await req.json()) as { jd: string };
  if (!jd?.trim()) return NextResponse.json({ error: "jd is required" }, { status: 400 });

  const resumeContent = snap.data()!.content as Record<string, unknown>;
  const resumeText = JSON.stringify(resumeContent);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(heuristicTailor(resumeText, jd));
  }

  try {
    const prompt = `You are a resume tailoring assistant. Given the resume JSON and job description, return a JSON object with:
- matchedSkills: string[] — skills in the resume that match the JD (max 10)
- missingSkills: string[] — important skills from the JD not in the resume (max 8)
- suggestions: Array<{ section: string; original: string; tailored: string }> — 3 specific improvements to make the resume better match the JD

Resume:
${resumeText.slice(0, 3000)}

Job Description:
${jd.slice(0, 3000)}

Respond with ONLY valid JSON.`;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_TAILOR_MODEL ?? "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1024,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(raw) as {
      matchedSkills?: string[];
      missingSkills?: string[];
      suggestions?: { section: string; original: string; tailored: string }[];
    };

    return NextResponse.json({
      matchedSkills: result.matchedSkills ?? [],
      missingSkills: result.missingSkills ?? [],
      suggestions: result.suggestions ?? [],
    });
  } catch {
    return NextResponse.json(heuristicTailor(resumeText, jd));
  }
}

function heuristicTailor(resumeText: string, jd: string) {
  const lower = resumeText.toLowerCase();
  const jdWords = jd.toLowerCase().match(/\b\w{4,}\b/g) ?? [];
  const unique = [...new Set(jdWords)].filter(
    (w) => !["with", "this", "that", "have", "will", "your", "their", "from", "about"].includes(w),
  );
  const matched = unique.filter((k) => lower.includes(k)).slice(0, 10);
  const missing = unique.filter((k) => !lower.includes(k)).slice(0, 8);
  const suggestions = missing.slice(0, 3).map((kw) => ({
    section: "Summary",
    original: "Experienced professional.",
    tailored: `Experienced professional with expertise in ${kw}.`,
  }));
  return { matchedSkills: matched, missingSkills: missing, suggestions };
}
