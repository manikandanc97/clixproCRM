import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { getRolePermissions } from "@/shared/lib/auth/rbac/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const tenantId = headersList.get("x-tenant-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            tenant: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const userRole = user.memberships?.find(m => m.tenantId === tenantId)?.role || user.memberships?.[0]?.role || "EMPLOYEE";
    const userPermissions = getRolePermissions(userRole);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          role: userRole,
          tenantId: tenantId || user.memberships?.[0]?.tenantId,
          permissions: userPermissions,
        },
      },
      { status: 200 }
    );
  } catch (error: any) { return handleApiError(error); }
}
