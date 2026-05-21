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

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const snap = await adminDb().collection("users").doc(uid).collection("resumes").doc(id).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = snap.data()!;
  const resumeName = (data.name as string | undefined) ?? "Resume";
  const content = (data.content as Record<string, unknown> | undefined) ?? {};

  const pdfBuffer = await renderToBuffer(
    <ResumePDF resume={content} name={resumeName} />,
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
