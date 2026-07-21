import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Paths that do not require authentication
const publicPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const publicApiPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and internal next paths
  if (
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/) ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isPublicApiPath = publicApiPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isApiRoute = pathname.startsWith("/api/");

  if (isPublicPath || isPublicApiPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get("orbit_token")?.value;

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    } else {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "default_secret"
    );
    
    // Verify JWT
    const { payload } = await jwtVerify(token, secret);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.id as string);
    if (payload.tenantId) {
      requestHeaders.set("x-tenant-id", payload.tenantId as string);
    }
    if (payload.role) {
      requestHeaders.set("x-role", payload.role as string);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Middleware JWT verification failed:", error);
    
    // Clear invalid token cookie on response
    if (isApiRoute) {
      const response = NextResponse.json(
        { success: false, message: "Unauthorized or Expired Token" },
        { status: 401 }
      );
      response.cookies.delete("orbit_token");
      return response;
    } else {
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("orbit_token");
      return response;
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
