export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

// OAuth callback handler — Firebase handles the OAuth exchange client-side via
// signInWithPopup/signInWithRedirect. This route exists as a fallback redirect
// target for providers that require a server-side callback URL.
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const returnTo = searchParams.get("return") ?? "/dashboard";
  return NextResponse.redirect(new URL(returnTo, req.url));
}
