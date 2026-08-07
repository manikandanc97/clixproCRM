import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJWT } from "@/shared/lib/auth/jwt";
import { cookies } from "next/headers";
import { AuthService } from "@/services/auth.service";
import { extractClientIp } from "@/shared/lib/auth/utils";

 
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;
    
    const payload = token ? await verifyJWT(token) : null;

    // If access token is missing or invalid, try to auto-refresh
    if (!payload) {
      if (!refreshToken) {
        return NextResponse.json({ success: false, data: { user: null }, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
      }

      try {
        const ip = extractClientIp(req);
        const userAgent = req.headers.get("user-agent") || undefined;
        
        const data = await AuthService.refreshSession(refreshToken, { ip, userAgent });

        const commonCookieOptions: {
          httpOnly: boolean;
          secure: boolean;
          sameSite: "lax" | "strict" | "none";
          path: string;
        } = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        };

        cookieStore.set("auth_token", data.token, { ...commonCookieOptions, maxAge: 15 * 60 });
        
        const refreshOptions = { ...commonCookieOptions, maxAge: undefined as number | undefined };
        if (data.isExtendedSession) {
          refreshOptions.maxAge = 30 * 24 * 60 * 60; // 30 days
        }
        cookieStore.set("refresh_token", data.refreshToken, refreshOptions);

        return NextResponse.json({
          success: true,
          data: { user: data.user }
        }, { status: 200 });
      } catch (_refreshError) {
        return NextResponse.json({ success: false, data: { user: null }, error: { code: "UNAUTHORIZED", message: "Session expired" } }, { status: 401 });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        memberships: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, data: { user: null }, error: { code: "UNAUTHORIZED", message: "User not found" } }, { status: 401 });
    }

    // Format permissions and role nicely
    const membership = user.memberships[0];
    const roleName = membership?.role?.name || "EMPLOYEE";
    const permissions = membership?.role?.permissions
      .filter((rp) => rp.hasAccess)
      .map((rp) => rp.module) || [];

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          tenantId: payload.tenantId,
          role: roleName,
          permissions
        }
      }
    }, { status: 200 });
  } catch (error: unknown) {
    // Provide more specific error messages for database connection issues
    if (error instanceof Error && error.name.includes('Prisma')) {
      return NextResponse.json({
        success: false,
        error: { code: "DATABASE_ERROR", message: "Database connection failed. Please check your connection and try again." }
      }, { status: 503 });
    }
    
    console.error("[ME ERROR]", error);
    
    // In development mode, return the actual error message to help with debugging
    const message = process.env.NODE_ENV === "development" && error instanceof Error 
      ? error.message 
      : "An unexpected error occurred";

    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message }
    }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    
    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid token" } }, { status: 401 });

    const data = await req.json();

    // Update user in DB
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: data.name,
        email: data.email,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: (updatedUser as ReturnType<typeof JSON.parse>).phone,
          status: updatedUser.status,
          tenantId: payload.tenantId,
        }
      }
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("[ME PATCH ERROR]", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to update profile" } }, { status: 500 });
  }
}
