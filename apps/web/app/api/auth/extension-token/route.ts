export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// POST with { code } — exchange a short-lived pairing code for an ID token
// The code was written to /pairings/{code} by the web login page after ?return=extension
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({})) as { code?: string };
  const { code } = body;

  if (!code) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  const pairingRef = adminDb().collection("pairings").doc(code);
  const snap = await pairingRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  const data = snap.data()!;
  if (Date.now() > (data.expiresAt as number)) {
    await pairingRef.delete();
    return NextResponse.json({ error: "Code expired" }, { status: 401 });
  }

  const idToken = data.idToken as string;

  // Verify the stored token is still valid before handing it to the extension
  try {
    await adminAuth().verifyIdToken(idToken);
  } catch {
    await pairingRef.delete();
    return NextResponse.json({ error: "Token invalid, please sign in again" }, { status: 401 });
  }

  await pairingRef.delete();

  // Return the ID token — extension stores it as session:token for API calls
  return NextResponse.json({ idToken, expiresIn: 3600 });
}
