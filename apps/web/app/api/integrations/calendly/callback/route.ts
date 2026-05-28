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
    return NextResponse.redirect(`${redirectBase}?error=calendly_denied`);
  }

  let uid: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString()) as { uid: string; ts: number };
    if (Date.now() - decoded.ts > 10 * 60 * 1000) throw new Error("Expired");
    uid = decoded.uid;
  } catch {
    return NextResponse.redirect(`${redirectBase}?error=calendly_state`);
  }

  const clientId = process.env.CALENDLY_CLIENT_ID!;
  const clientSecret = process.env.CALENDLY_CLIENT_SECRET!;

  const tokenRes = await fetch("https://auth.calendly.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${origin}/api/integrations/calendly/callback`,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${redirectBase}?error=calendly_token`);
  }

  const { access_token, refresh_token, expires_in, owner } = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    owner?: string;
  };

  // Fetch user info to get display name
  let displayName: string | null = null;
  const meRes = await fetch("https://api.calendly.com/users/me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (meRes.ok) {
    const me = await meRes.json() as { resource?: { name?: string } };
    displayName = me.resource?.name ?? null;
  }

  await adminDb().collection("profiles").doc(uid).set(
    {
      "integrations.calendly": {
        connected: true,
        connectedAt: FieldValue.serverTimestamp(),
        accessToken: access_token,
        refreshToken: refresh_token ?? null,
        expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
        ownerUri: owner ?? null,
        displayName,
      },
    },
    { merge: true },
  );

  return NextResponse.redirect(`${redirectBase}?connected=calendly`);
}
