import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check for the new session-token cookie
  const sessionToken = request.cookies.get("session-token")?.value;
  const isAuthenticated = !!sessionToken;

  // Extra check for redirect cycle detection - check if we're being redirected in a loop
  const isRedirectLoop =
    request.headers.get("x-middleware-rewrite") ||
    request.headers.get("x-middleware-next");
  if (isRedirectLoop) {
    console.log(
      `Middleware: Detected potential redirect loop on ${pathname}, allowing through`,
    );
    return NextResponse.next();
  }

  // Log the authentication state for debugging
  console.log(`Middleware: Path=${pathname}, Authenticated=${isAuthenticated}`);

  // Public routes - accessible to everyone
  const publicRoutes = ["/", "/about", "/home", "/explore"];

  // Auth routes - redirect authenticated users away from these
  const authRoutes = [
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/reset-password",
    "/auth/forgot-password",
  ];

  // Protected routes - redirect unauthenticated users away from these
  const protectedRoutes = ["/project", "/dashboard", "/settings", "/profile"];

  // Handle authenticated users
  if (isAuthenticated) {
    // Redirect authenticated users away from landing page or auth pages
    if (
      pathname === "/" ||
      authRoutes.some((route) => pathname.startsWith(route))
    ) {
      console.log(
        `Middleware: Authenticated user trying to access landing page or auth page, redirecting to /project/new`,
      );
      return NextResponse.redirect(new URL("/project/new", request.url));
    }

    // Allow authenticated users to access any other page
    return NextResponse.next();
  }
  // Handle unauthenticated users
  else {
    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    // Redirect unauthenticated users away from protected pages
    if (isProtectedRoute) {
      console.log(
        `Middleware: Unauthenticated user trying to access protected page, redirecting to /auth/sign-in`,
      );
      // Remember where they were trying to go
      const signInUrl = new URL("/auth/sign-in", request.url);
      signInUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Allow unauthenticated users to access public pages and auth pages
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all routes
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
