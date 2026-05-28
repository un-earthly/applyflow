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

  const clientId = process.env.CALENDLY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Calendly integration not configured" }, { status: 503 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const state = Buffer.from(JSON.stringify({ uid, ts: Date.now() })).toString("base64url");
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: `${origin}/api/integrations/calendly/callback`,
    state,
  });

  return NextResponse.redirect(`https://auth.calendly.com/oauth/authorize?${params}`);
}
