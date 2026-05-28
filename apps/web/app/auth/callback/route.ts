import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const next = searchParams.get("next") || "/dashboard";

  // Firebase Auth handles OAuth client-side; this route is a redirect landing page.
  // The client will exchange the token and create the session cookie via /api/auth/session.
  return NextResponse.redirect(new URL(next, request.url));
}
