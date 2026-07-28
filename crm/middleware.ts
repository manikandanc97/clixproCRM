import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/shared/lib/auth/utils";

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
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Missing authentication token" } },
        { status: 401 }
      );
    } else {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  try {
    const payload = await verifyJWT(token);
    
    if (!payload) {
      throw new Error("Invalid Token");
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    
    if (payload.tenantId) {
      requestHeaders.set("x-tenant-id", payload.tenantId as string);
    }
    if (payload.roleId) {
      requestHeaders.set("x-role-id", payload.roleId as string);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    if (isApiRoute) {
      const response = NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized or Expired Token" } },
        { status: 401 }
      );
      response.cookies.delete("auth_token");
      return response;
    } else {
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth_token");
      return response;
    }
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
