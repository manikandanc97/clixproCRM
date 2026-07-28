import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJWT } from "@/shared/lib/auth/utils";
import { cookies } from "next/headers";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } }, { status: 401 });
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
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "User not found" } }, { status: 401 });
    }

    // Format permissions and role nicely
    const membership = user.memberships[0];
    const roleName = membership?.role?.name || "EMPLOYEE";
    const permissions = membership?.role?.permissions.map(rp => `${rp.permission.resource}:${rp.permission.action}`) || [];

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error: unknown) {
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" }
    }, { status: 500 });
  }
}
