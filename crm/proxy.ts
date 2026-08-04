import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/shared/lib/auth/jwt";
import { AuthService } from "@/services/auth.service";
import { extractClientIp } from "@/shared/lib/auth/utils";

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
  "/api/auth/me",
];

export async function proxy(request: NextRequest) {
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
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const handleUnauthorized = () => {
    if (isApiRoute) {
      const response = NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized or Expired Token" } },
        { status: 401 }
      );
      response.cookies.delete("auth_token");
      response.cookies.delete("refresh_token");
      return response;
    } else {
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth_token");
      response.cookies.delete("refresh_token");
      return response;
    }
  };

  const attemptRefresh = async () => {
    if (!refreshToken) return null;
    try {
      const ip = extractClientIp(request);
      const userAgent = request.headers.get("user-agent") || undefined;
      const data = await AuthService.refreshSession(refreshToken, { ip, userAgent });

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", data.user.id);
      if (data.user.tenantId) {
        requestHeaders.set("x-tenant-id", data.user.tenantId);
      }
      if (data.user.role) {
        requestHeaders.set("x-role", data.user.role);
      }

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      const commonCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      };

      response.cookies.set("auth_token", data.token, {
        ...commonCookieOptions,
        maxAge: 15 * 60,
      });

      const refreshOptions = {
        ...commonCookieOptions,
        maxAge: data.isExtendedSession ? 30 * 24 * 60 * 60 : undefined,
      };
      response.cookies.set("refresh_token", data.refreshToken, refreshOptions);

      return response;
    } catch (_err) {
      return null;
    }
  };

  if (!token) {
    const refreshResponse = await attemptRefresh();
    if (refreshResponse) {
      return refreshResponse;
    }
    return handleUnauthorized();
  }

  try {
    const payload = await verifyJWT(token);
    
    if (!payload) {
      const refreshResponse = await attemptRefresh();
      if (refreshResponse) {
        return refreshResponse;
      }
      return handleUnauthorized();
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    
    if (payload.tenantId) {
      requestHeaders.set("x-tenant-id", payload.tenantId as string);
    }
    if (payload.roleId) {
      requestHeaders.set("x-role-id", payload.roleId as string);
    }
    if (payload.role) {
      requestHeaders.set("x-role", payload.role as string);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    const refreshResponse = await attemptRefresh();
    if (refreshResponse) {
      return refreshResponse;
    }
    return handleUnauthorized();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
