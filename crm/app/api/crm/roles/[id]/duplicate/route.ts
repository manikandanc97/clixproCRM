import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { logAudit } from "@/lib/audit-logger";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("Roles", "Manage");
    const tenantId = session.tenantId;
    const { id: roleId } = await params;

    const existingRole = await prisma.role.findFirst({
      where: { tenantId, id: roleId },
      include: {
        permissions: true
      }
    });

    if (!existingRole) {
      return NextResponse.json({ success: false, message: "Role not found" }, { status: 404 });
    }

    const newRoleName = `${existingRole.name} (Copy)`;

    // Check if copy name already exists
    const duplicateNameExists = await prisma.role.findFirst({
      where: { tenantId, name: newRoleName }
    });

    if (duplicateNameExists) {
      return NextResponse.json({ success: false, message: "A copy of this role already exists. Rename it first." }, { status: 400 });
    }

    const newRole = await prisma.$transaction(async (tx) => {
      const createdRole = await tx.role.create({
        data: {
          tenantId,
          name: newRoleName,
          description: existingRole.description,
          color: existingRole.color,
          priority: existingRole.priority,
          isSystem: false // Copies are never system roles
        }
      });

      if (existingRole.permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: existingRole.permissions.map((rp) => ({
            roleId: createdRole.id,
            module: rp.module,
            hasAccess: rp.hasAccess,
          }))
        });
      }

      return createdRole;
    });

    await logAudit({
      tenantId,
      userId: session.userId,
      action: "DUPLICATE_ROLE",
      module: "Roles",
      details: { originalRole: existingRole.name, newRole: newRole.name },
      ipAddress: req.headers.get("x-forwarded-for") || "",
      userAgent: req.headers.get("user-agent") || "",
    });

    return NextResponse.json({ success: true, message: "Role duplicated successfully", data: newRole }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
