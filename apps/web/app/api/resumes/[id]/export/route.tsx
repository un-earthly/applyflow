export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumePDF } from "@/lib/pdf/resume-template";

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

// Map the editor's JsonData format → the PDF renderer's ResumeContent format
function mapJsonDataToPDF(jsonData: Record<string, unknown>) {
  const basics = (jsonData.basics ?? {}) as Record<string, string>;
  const work = ((jsonData.work ?? []) as Record<string, string>[]).map((w) => ({
    company: w.name ?? "",
    role: w.position ?? "",
    startDate: w.startDate ?? "",
    endDate: w.endDate ?? "",
    current: !w.endDate || w.endDate.toLowerCase() === "present",
    description: w.summary ?? "",
    highlights: w.summary ? [w.summary] : [],
  }));
  const education = ((jsonData.education ?? []) as Record<string, string>[]).map((e) => ({
    institution: e.institution ?? "",
    degree: e.studyType ?? "",
    field: e.area ?? "",
    startDate: e.startDate ?? "",
    endDate: e.endDate ?? "",
  }));
  const skills = ((jsonData.skills ?? []) as Record<string, string>[]).flatMap((s) =>
    (s.keywords ?? "").split(",").map((kw: string) => ({ name: kw.trim(), level: s.level ?? "" })),
  ).filter((s) => s.name);
  const projects = ((jsonData.projects ?? []) as Record<string, string>[]).map((p) => ({
    name: p.name ?? "",
    description: p.description ?? "",
    url: p.url ?? "",
    highlights: p.highlights ? p.highlights.split("\n").filter(Boolean) : [],
  }));

  return {
    basics: {
      name: basics.name ?? "",
      label: basics.label ?? "",
      email: basics.email ?? "",
      phone: basics.phone ?? "",
      url: basics.url ?? "",
      summary: basics.summary ?? "",
      location: { city: basics.location ?? "" },
    },
    work,
    education,
    skills,
    projects,
  };
}

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const snap = await adminDb().collection("users").doc(uid).collection("resumes").doc(id).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = snap.data()!;
  const resumeName = (data.name as string | undefined) ?? "Resume";

  // Support both old (content) and new (jsonData) field names
  const jsonData = (data.jsonData ?? data.content ?? {}) as Record<string, unknown>;
  const pdfContent = mapJsonDataToPDF(jsonData);

  const pdfBuffer = await renderToBuffer(
    <ResumePDF resume={pdfContent} name={resumeName} />,
  );

  const safeName = resumeName.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "resume";

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      "Content-Length": String(pdfBuffer.byteLength),
    },
  });
}
