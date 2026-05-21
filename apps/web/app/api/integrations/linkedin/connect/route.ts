export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

async function getUid(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    const cookie = req.cookies.get("__session")?.value;
    if (!cookie) return null;
    try {
      const decoded = await adminAuth().verifySessionCookie(cookie, true);
      return decoded.uid;
    } catch { return null; }
  }
  try {
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7));
    return decoded.uid;
  } catch { return null; }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const uid = await getUid(req);
  if (!uid) return NextResponse.redirect(new URL("/login", req.url));

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "LinkedIn integration not configured" }, { status: 503 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const state = Buffer.from(JSON.stringify({ uid, ts: Date.now() })).toString("base64url");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${origin}/api/integrations/linkedin/callback`,
    scope: "openid profile email w_member_social",
    state,
  });

  return NextResponse.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
}
