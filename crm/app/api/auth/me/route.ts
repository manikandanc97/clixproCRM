import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJWT } from "@/shared/lib/auth/jwt";
import { cookies } from "next/headers";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, data: { user: null }, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 200 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ success: false, data: { user: null }, error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } }, { status: 200 });
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
      return NextResponse.json({ success: false, data: { user: null }, error: { code: "UNAUTHORIZED", message: "User not found" } }, { status: 200 });
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
