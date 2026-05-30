export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// POST with { code } — exchange a short-lived pairing code for an ID token
// The code was written to /pairings/{code} by the web login page after ?return=extension
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { code } = body;
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  const pairingRef = adminDb().collection("pairings").doc(code);
  let snap;
  try {
    snap = await pairingRef.get();
  } catch (e) {
    console.error("[extension-token] Firestore read failed:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  if (!snap.exists) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
  }

  const data = snap.data()!;
  if (Date.now() > (data.expiresAt as number)) {
    await pairingRef.delete().catch(() => {});
    return NextResponse.json({ error: "Code expired" }, { status: 410 });
  }

  const idToken = data.idToken as string;
  if (!idToken || typeof idToken !== "string") {
    await pairingRef.delete().catch(() => {});
    return NextResponse.json({ error: "Corrupted pairing record" }, { status: 500 });
  }

  // Verify the stored token is still valid before handing it to the extension
  try {
    await adminAuth().verifyIdToken(idToken);
  } catch {
    await pairingRef.delete().catch(() => {});
    return NextResponse.json({ error: "Token invalid, please sign in again" }, { status: 410 });
  }

  await pairingRef.delete().catch(() => {});

  // Return the ID token — extension stores it as session:token for API calls
  return NextResponse.json({ idToken, expiresIn: 3600 });
}
