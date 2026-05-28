export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { parseBody } from "@/lib/api-validate";
import OpenAI from "openai";

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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  let resumeContent = "";
  if (resumeId) {
    const snap = await adminDb().collection("users").doc(uid).collection("resumes").doc(resumeId).get();
    if (snap.exists) {
      resumeContent = JSON.stringify(snap.data()!.content ?? {});
    }
  } else {
    const profileSnap = await adminDb().collection("profiles").doc(uid).get();
    const p = profileSnap.data() ?? {};
    resumeContent = `Name: ${p.fullName ?? ""}\nEmail: ${p.email ?? ""}\nPhone: ${p.phone ?? ""}\nLocation: ${p.location ?? ""}`;
  }

  let content = `Dear Hiring Manager,\n\nI am excited to apply for the ${role ?? "position"} role at ${company ?? "your company"}.\n\n[Customize this cover letter to highlight your experience.]\n\nBest regards,\n`;

  if (process.env.OPENAI_API_KEY) {
    try {
      const systemPrompt = `You are a professional cover letter writer. Write a concise, compelling cover letter (3–4 paragraphs, under 350 words) tailored to the job description and candidate profile. Use a professional tone. Address it to "Dear Hiring Manager". End with "Best regards," followed by a blank line for the signature.`;
      const userPrompt = `Company: ${company ?? "the company"}\nRole: ${role ?? "the position"}\n\nJob Description:\n${jd ?? "(not provided)"}\n\nCandidate Profile:\n${resumeContent}`;

      const completion = await openai.chat.completions.create({
        model: process.env.AI_TAILOR_MODEL ?? "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 700,
      });

      content = completion.choices[0]?.message?.content ?? content;
    } catch {
      // fall through to placeholder
    }
  }

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
