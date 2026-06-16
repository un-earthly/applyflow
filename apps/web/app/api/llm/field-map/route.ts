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

interface FieldSchema {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fields, resumeId } = (await req.json()) as {
    fields: FieldSchema[];
    resumeId?: string;
  };

  let profileSummary: Record<string, unknown> = {};

  if (resumeId) {
    const snap = await adminDb().collection("users").doc(uid).collection("resumes").doc(resumeId).get();
    if (snap.exists) {
      const jd = (snap.data()!.jsonData ?? {}) as {
        basics?: Record<string, unknown>;
        work?: unknown[];
        skills?: unknown[];
      };
      const basics = jd.basics ?? {};
      profileSummary = {
        fullName: basics.name,
        email: basics.email,
        phone: basics.phone,
        location: basics.location,
        linkedin: basics.url,
        website: basics.url,
        summary: basics.summary,
      };
    }
  }

  // Merge in profile-level data (work auth, LinkedIn URL, etc.)
  const profileSnap = await adminDb().collection("profiles").doc(uid).get();
  if (profileSnap.exists) {
    const p = profileSnap.data()!;
    profileSummary = {
      ...profileSummary,
      fullName: profileSummary.fullName ?? p.fullName,
      email: profileSummary.email ?? p.email,
      phone: profileSummary.phone ?? p.phone,
      location: profileSummary.location ?? p.location,
      linkedin: profileSummary.linkedin ?? p.linkedInUrl,
      website: profileSummary.website ?? p.portfolioUrl,
      workAuthStatus: p.workAuthStatus,
      yearsOfExperience: p.yearsOfExperience,
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ mappings: heuristicMap(fields, profileSummary), confidence: 1 });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are a job application assistant. Given the user profile and a list of form fields, return a JSON object mapping each field's \`name\` to the appropriate value from the profile.

Rules:
- For select/dropdown fields, pick the option text from the "options" array that best matches the profile. Return the exact option text.
- For work authorization fields, use the workAuthStatus value (citizen, permanent_resident, visa_required, etc.)
- For radio/checkbox fields, return "yes" or "no" based on context
- If no match, use an empty string

Profile:
${JSON.stringify(profileSummary, null, 2)}

Fields:
${JSON.stringify(fields, null, 2)}

Respond with ONLY a JSON object like: { "fieldName": "value", ... }`;

    const completion = await client.chat.completions.create({
      model: process.env.AI_FIELD_MAP_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const mappings = JSON.parse(raw) as Record<string, string>;

    return NextResponse.json({ mappings, confidence: 1 });
  } catch {
    return NextResponse.json({ mappings: heuristicMap(fields, profileSummary), confidence: 0.7 });
  }
}

function heuristicMap(
  fields: FieldSchema[],
  profile: Record<string, unknown>,
): Record<string, string> {
  const mappings: Record<string, string> = {};
  for (const field of fields) {
    const key = `${field.name} ${field.label ?? ""} ${field.placeholder ?? ""}`.toLowerCase();
    if (key.includes("first") && key.includes("name"))
      mappings[field.name] = (profile.fullName as string ?? "").split(" ")[0] ?? "";
    else if (key.includes("last") && key.includes("name"))
      mappings[field.name] = (profile.fullName as string ?? "").split(" ").slice(1).join(" ");
    else if (key.includes("name")) mappings[field.name] = (profile.fullName as string) ?? "";
    else if (key.includes("email")) mappings[field.name] = (profile.email as string) ?? "";
    else if (key.includes("phone") || key.includes("tel"))
      mappings[field.name] = (profile.phone as string) ?? "";
    else if (key.includes("location") || key.includes("city"))
      mappings[field.name] = (profile.location as string) ?? "";
    else if (key.includes("linkedin")) mappings[field.name] = (profile.linkedin as string) ?? "";
    else if (key.includes("website") || key.includes("portfolio"))
      mappings[field.name] = (profile.website as string) ?? "";
    else if (key.includes("work auth") || key.includes("authorization") || key.includes("visa"))
      mappings[field.name] = (profile.workAuthStatus as string) ?? "";
  }
  return mappings;
}
