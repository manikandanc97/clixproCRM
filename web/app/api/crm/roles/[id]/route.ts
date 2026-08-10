import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";
import { logAudit } from "@/lib/audit-logger";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

const roleUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional()
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIp(req);
    const identifier = `admin_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.ADMIN);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.ADMIN);

    const session = await requirePermission("Roles");
    const tenantId = session.tenantId;
    const { id: roleId } = await params;

    const body = await req.json();
    const parsedData = roleUpdateSchema.parse(body);

    const currentUserRole = session.role.toUpperCase();

    if (currentUserRole === "EMPLOYEE") {
      return NextResponse.json({ success: false, message: "Unauthorized to edit roles" }, { status: 403 });
    }

    const existingRole = await prisma.role.findFirst({
      where: { tenantId, id: roleId }
    });

    if (!existingRole) {
      return NextResponse.json({ success: false, message: "Role not found" }, { status: 404 });
    }

    if (existingRole.name.toUpperCase() === "SUPER ADMIN" && currentUserRole !== "SUPER ADMIN") {
      return NextResponse.json({ success: false, message: "Only Super Admin can modify the Super Admin role" }, { status: 403 });
    }

    if (existingRole.isSystem && parsedData.name && parsedData.name !== existingRole.name) {
      return NextResponse.json({ success: false, message: "Cannot rename system roles" }, { status: 400 });
    }

    if (existingRole.isSystem && parsedData.isActive === false) {
      return NextResponse.json({ success: false, message: "Cannot disable system roles" }, { status: 400 });
    }

    const updatedRole = await prisma.$transaction(async (tx) => {
      const role = await tx.role.update({
        where: { id: roleId },
        data: {
          name: parsedData.name,
          description: parsedData.description,
          color: parsedData.color,
          priority: parsedData.priority,
          isActive: existingRole.isSystem ? true : (parsedData.isActive ?? true),
        }
      });

      if (parsedData.permissions) {
        // Clear old permissions
        await tx.rolePermission.deleteMany({
          where: { roleId }
        });

        if (parsedData.permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: parsedData.permissions.map((module) => ({
              roleId: role.id,
              module,
              hasAccess: true
            }))
          });
        }
      }

      return role;
    });

    await logAudit({
      tenantId,
      userId: session.userId,
      action: "UPDATE_ROLE",
      module: "Roles",
      details: { roleName: updatedRole.name },
      ipAddress: req.headers.get("x-forwarded-for") || "",
      userAgent: req.headers.get("user-agent") || "",
    });

    return NextResponse.json({ success: true, message: "Role updated successfully", data: updatedRole }, { status: 200 });
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIp(req);
    const identifier = `delete_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.DELETE);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.DELETE);

    const session = await requirePermission("Roles");
    const tenantId = session.tenantId;
    const { id: roleId } = await params;

    const existingRole = await prisma.role.findFirst({
      where: { tenantId, id: roleId },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    if (!existingRole) {
      return NextResponse.json({ success: false, message: "Role not found" }, { status: 404 });
    }

    if (existingRole.isSystem) {
      return NextResponse.json({ success: false, message: "Cannot delete system roles" }, { status: 400 });
    }

    if (existingRole._count.users > 0) {
      return NextResponse.json({ success: false, message: "Cannot delete role because it is assigned to users" }, { status: 400 });
    }

    await prisma.role.delete({
      where: { id: roleId }
    });

    await logAudit({
      tenantId,
      userId: session.userId,
      action: "DELETE_ROLE",
      module: "Roles",
      details: { roleName: existingRole.name },
      ipAddress: req.headers.get("x-forwarded-for") || "",
      userAgent: req.headers.get("user-agent") || "",
    });

    return NextResponse.json({ success: true, message: "Role deleted successfully" }, { status: 200 });
  } catch (error) { return handleApiError(error); }
}
