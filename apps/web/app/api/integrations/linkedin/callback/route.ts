export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const redirectBase = `${origin}/dashboard/settings/integrations`;

  if (!code || !state) {
    return NextResponse.redirect(`${redirectBase}?error=linkedin_denied`);
  }

  let uid: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString()) as { uid: string; ts: number };
    if (Date.now() - decoded.ts > 10 * 60 * 1000) throw new Error("Expired");
    uid = decoded.uid;
  } catch {
    return NextResponse.redirect(`${redirectBase}?error=linkedin_state`);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${origin}/api/integrations/linkedin/callback`,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${redirectBase}?error=linkedin_token`);
  }

  const { access_token, expires_in } = (await tokenRes.json()) as {
    access_token: string;
    expires_in: number;
  };

  // Fetch basic profile
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  let linkedinProfile: { name?: string; email?: string; picture?: string } = {};
  if (profileRes.ok) {
    const p = await profileRes.json() as Record<string, string>;
    linkedinProfile = { name: p.name, email: p.email, picture: p.picture };
  }

  await adminDb().collection("profiles").doc(uid).set(
    {
      "integrations.linkedin": {
        connected: true,
        connectedAt: FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + expires_in * 1000),
        displayName: linkedinProfile.name ?? null,
        email: linkedinProfile.email ?? null,
        picture: linkedinProfile.picture ?? null,
      },
    },
    { merge: true },
  );

  // If we got profile data, optionally backfill the user's ApplyFlow profile
  if (linkedinProfile.name) {
    await adminDb().collection("profiles").doc(uid).set(
      {
        fullName: linkedinProfile.name,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  return NextResponse.redirect(`${redirectBase}?connected=linkedin`);
}
