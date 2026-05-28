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
    return NextResponse.redirect(`${redirectBase}?error=notion_denied`);
  }

  let uid: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString()) as { uid: string; ts: number };
    if (Date.now() - decoded.ts > 10 * 60 * 1000) throw new Error("Expired");
    uid = decoded.uid;
  } catch {
    return NextResponse.redirect(`${redirectBase}?error=notion_state`);
  }

  const clientId = process.env.NOTION_CLIENT_ID!;
  const clientSecret = process.env.NOTION_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${origin}/api/integrations/notion/callback`,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${redirectBase}?error=notion_token`);
  }

  const { access_token, workspace_name, workspace_id, owner } = (await tokenRes.json()) as {
    access_token: string;
    workspace_name?: string;
    workspace_id?: string;
    owner?: { user?: { name?: string } };
  };

  await adminDb().collection("profiles").doc(uid).set(
    {
      "integrations.notion": {
        connected: true,
        connectedAt: FieldValue.serverTimestamp(),
        accessToken: access_token,
        workspaceName: workspace_name ?? null,
        workspaceId: workspace_id ?? null,
        ownerName: owner?.user?.name ?? null,
      },
    },
    { merge: true },
  );

  return NextResponse.redirect(`${redirectBase}?connected=notion`);
}
