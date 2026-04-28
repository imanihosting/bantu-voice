import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const authRoutes = ["/sign-in", "/sign-up"];

const publicRoutes = [
  "/api/auth",
  "/api/v1",
  "/api/trpc",
  "/api/profile",
];

// Marketing routes accessible to everyone
const marketingRoutes = [
  "/",
  "/privacy",
  "/terms",
  "/cookies",
  "/contact",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public API routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Marketing routes are accessible to everyone
  if (marketingRoutes.includes(pathname) || pathname.startsWith("/developers")) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = !!sessionCookie;
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Authenticated user visiting auth pages → redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated user visiting protected pages → redirect to sign-in
  if (!isAuthenticated && !isAuthRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Admin route protection — check role from session cookie cache
  if (pathname.startsWith("/admin")) {
    const sessionCookieValue = request.cookies.get("better-auth.session_data")?.value;
    if (sessionCookieValue) {
      try {
        const sessionData = JSON.parse(sessionCookieValue);
        if (sessionData?.session?.user?.role !== "admin") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch {
        // If cookie can't be parsed, let server-side checks handle it
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets with file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
