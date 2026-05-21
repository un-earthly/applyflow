import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!idToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    const token = randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    await adminDb().collection("extensionTokens").doc(token).set({
      uid: decoded.uid,
      expiresAt,
      createdAt: new Date(),
    });

    return NextResponse.json({ token, expiresAt });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
