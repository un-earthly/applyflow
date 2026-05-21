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
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fields, resumeId } = (await req.json()) as {
    fields: FieldSchema[];
    resumeId?: string;
  };

  let profileData: Record<string, unknown> = {};
  if (resumeId) {
    const snap = await adminDb().collection("resumes").doc(resumeId).get();
    if (snap.exists && snap.data()!.userId === uid) {
      profileData = (snap.data()!.content as Record<string, unknown>) ?? {};
    }
  } else {
    const profileSnap = await adminDb().collection("profiles").doc(uid).get();
    profileData = profileSnap.data() ?? {};
  }

  const profileSummary = {
    fullName: profileData.fullName,
    email: profileData.email,
    phone: profileData.phone,
    location: profileData.location,
    linkedin: profileData.linkedin,
    website: profileData.website,
  };

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ mappings: heuristicMap(fields, profileSummary), confidence: 1 });
  }

  try {
    const prompt = `You are a job application assistant. Given the user profile and a list of form fields, return a JSON object mapping each field's \`name\` to the appropriate value from the profile. If no match, use an empty string.

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
  }
  return mappings;
}
