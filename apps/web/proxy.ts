import { type NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

<<<<<<< HEAD
const AUTH_ONLY_PATHS = ["/login", "/signup", "/forgot-password"];
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/admin"];
=======
const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/pricing", "/features", "/about", "/contact", "/blog", "/changelog"];
const PUBLIC_PREFIXES = ["/legal/", "/_next/", "/api/auth/", "/auth/"];
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef

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

<<<<<<< HEAD
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Support both old "session" cookie and new "__session" cookie
  const hasSession = request.cookies.has("session") || request.cookies.has("__session");

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthOnly && hasSession) {
    const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = next;
    url.search = "";
    return NextResponse.redirect(url);
=======
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
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
  }

  return NextResponse.next();
}

export const config = {
<<<<<<< HEAD
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
=======
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
};
