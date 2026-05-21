import { type NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/pricing", "/features", "/about", "/contact", "/blog", "/changelog"];
const PUBLIC_PREFIXES = ["/legal/", "/_next/", "/api/auth/", "/auth/"];

async function verifySession(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get("session")?.value;
  if (!sessionCookie) return false;
  try {
    await adminAuth().verifySessionCookie(sessionCookie, true);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Always allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const isAuthed = await verifySession(request);

  // Redirect unauthenticated users to login
  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/admin")) &&
    !isAuthed
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from guest-only pages
  if ((pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password") && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Admin role gate
  if (pathname.startsWith("/admin") && isAuthed) {
    try {
      const sessionCookie = request.cookies.get("session")?.value;
      if (sessionCookie) {
        const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
        if (!decoded.admin) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
