export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const response = NextResponse.redirect(new URL("/login", req.url));
  // Clear the session cookie if one is set
  response.cookies.delete("session");
  return response;
}
