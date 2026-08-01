import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await requirePermission("Roles", "View");
    const tenantId = session.tenantId;

    const [
      totalUsers,
      activeUsers,
      disabledUsers,
      pendingInvites,
      totalRoles,
      customRoles,
      totalPermissions,
      totalDepartments,
      auditEvents
    ] = await Promise.all([
      prisma.tenantUser.count({ where: { tenantId } }),
      prisma.tenantUser.count({ where: { tenantId, status: "ACTIVE" } }),
      prisma.tenantUser.count({ where: { tenantId, status: { not: "ACTIVE" } } }),
      prisma.invitation.count({ where: { tenantId, status: "PENDING" } }),
      prisma.role.count({ where: { tenantId } }),
      prisma.role.count({ where: { tenantId, isSystem: false } }),
      prisma.rolePermission.count({ where: { role: { tenantId } } }),
      prisma.department.count({ where: { tenantId } }),
      prisma.auditLog.count({ where: { tenantId } })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          disabled: disabledUsers,
          pendingInvites
        },
        roles: {
          total: totalRoles,
          custom: customRoles,
          permissions: totalPermissions
        },
        departments: {
          total: totalDepartments
        },
        audit: {
          events: auditEvents
        }
      }
    }, { status: 200 });

  } catch (error) { return handleApiError(error); }
}
