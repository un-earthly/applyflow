export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Support both session cookie (web) and Bearer token (extension)
    const bearerToken = request.headers.get("authorization")?.startsWith("Bearer ")
      ? request.headers.get("authorization")!.slice(7)
      : null;

    let uid: string;
    let email: string | undefined;
    let name: string | undefined;

    if (bearerToken) {
      const decoded = await adminAuth().verifyIdToken(bearerToken);
      uid = decoded.uid;
      email = decoded.email;
      name = decoded.name;
    } else {
      const sessionCookie = request.cookies.get("session")?.value;
      if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
      uid = decoded.uid;
      email = decoded.email;
      name = decoded.name;
    }

    const profileSnap = await adminDb().collection("profiles").doc(uid).get();
    const profile = profileSnap.data() ?? {};

    return NextResponse.json({
      uid,
      email,
      displayName: (profile.fullName as string | undefined) ?? name,
      fullName: (profile.fullName as string | undefined) ?? name,
      phone: profile.phone,
      location: profile.location,
      linkedin: profile.linkedin,
      website: profile.website,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
