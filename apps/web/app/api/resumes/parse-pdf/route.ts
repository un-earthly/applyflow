export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import OpenAI from "openai";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;

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

const SYSTEM_PROMPT = `You are a resume parser. Given raw text from a PDF resume, extract the information and return it as a JSON object matching this exact structure:

{
  "jsonData": {
    "basics": {
      "name": "Full Name",
      "label": "Job title / headline",
      "email": "email@example.com",
      "phone": "+1 555 0000",
      "url": "https://portfolio.com",
      "location": "City, State, Country",
      "summary": "2-3 sentence professional summary"
    },
    "work": [
      {
        "name": "Company Name",
        "position": "Job Title",
        "url": "https://company.com",
        "startDate": "YYYY-MM",
        "endDate": "YYYY-MM or Present",
        "summary": "Key responsibilities and achievements. Combine bullet points into flowing text."
      }
    ],
    "education": [
      {
        "institution": "University Name",
        "studyType": "Bachelor of Science",
        "area": "Computer Science",
        "startDate": "YYYY",
        "endDate": "YYYY",
        "score": "GPA if present"
      }
    ],
    "skills": [
      {
        "name": "Category (e.g. Languages, Frameworks, Tools)",
        "level": "Expert / Advanced / Intermediate",
        "keywords": "Skill1, Skill2, Skill3"
      }
    ],
    "projects": [
      {
        "name": "Project Name",
        "description": "What the project does",
        "url": "https://project.com",
        "highlights": "Achievement 1\nAchievement 2",
        "startDate": "YYYY-MM",
        "endDate": "YYYY-MM or Present"
      }
    ]
  }
}

Rules:
- Group similar skills into logical categories (Languages, Frameworks, DevOps, etc.)
- keywords field is comma-separated
- highlights field uses newline-separated bullet points (no bullet characters)
- If a field is not present, use an empty string
- Return ONLY valid JSON, no markdown fences or explanation`;

const EMPTY_SCAFFOLD = {
  basics: { name: "", label: "", email: "", phone: "", url: "", location: "", summary: "" },
  work: [],
  education: [],
  skills: [],
  projects: [],
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { pdfUrl?: string; rawText?: string; fileName?: string };

  if (!body.pdfUrl && !body.rawText) {
    return NextResponse.json({ error: "pdfUrl or rawText required" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      jsonData: EMPTY_SCAFFOLD,
      warning: "AI parsing requires OPENAI_API_KEY. Resume created with empty fields.",
    });
  }

  let textContent = body.rawText ?? "";

  if (body.pdfUrl && !textContent) {
    try {
      const pdfRes = await fetch(body.pdfUrl);
      if (!pdfRes.ok) throw new Error(`Failed to fetch PDF: ${pdfRes.status}`);
      const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
      const parsed = await pdfParse(pdfBuffer);
      textContent = parsed.text;
    } catch (err) {
      console.warn("[parse-pdf] PDF extraction failed:", err);
      return NextResponse.json({ jsonData: EMPTY_SCAFFOLD, warning: "Could not extract PDF text." });
    }
  }

  if (!textContent.trim()) {
    return NextResponse.json({ jsonData: EMPTY_SCAFFOLD, warning: "PDF appears to be empty or image-only." });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Parse this resume text:\n\n${textContent.slice(0, 12000)}` },
    ],
    response_format: { type: "json_object" },
    max_tokens: 3000,
    temperature: 0,
  });

  const raw = completion.choices[0]?.message.content ?? "{}";

  try {
    const parsed = JSON.parse(raw) as { jsonData?: unknown };
    return NextResponse.json({ jsonData: parsed.jsonData ?? parsed });
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }
}
