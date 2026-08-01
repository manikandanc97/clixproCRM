import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { logAudit } from "@/lib/audit-logger";
import { z } from "zod";

const departmentUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("Employees", "Manage");
    const tenantId = session.tenantId;
    const { id: departmentId } = await params;

    const body = await req.json();
    const { name, description } = departmentUpdateSchema.parse(body);

    const existing = await prisma.department.findFirst({
      where: { tenantId, id: departmentId }
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Department not found" }, { status: 404 });
    }

    if (name && name !== existing.name) {
      const duplicate = await prisma.department.findFirst({
        where: { tenantId, name }
      });
      if (duplicate) {
        return NextResponse.json({ success: false, message: "Department name already in use" }, { status: 400 });
      }
    }

    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: { name, description }
    });

    await logAudit({
      tenantId,
      userId: session.userId,
      action: "UPDATE_DEPARTMENT",
      module: "Employees",
      details: { departmentId, name: updatedDepartment.name },
      ipAddress: req.headers.get("x-forwarded-for") || "",
      userAgent: req.headers.get("user-agent") || "",
    });

    return NextResponse.json({ success: true, message: "Department updated successfully", data: updatedDepartment }, { status: 200 });
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("Employees", "Manage");
    const tenantId = session.tenantId;
    const { id: departmentId } = await params;

    const existing = await prisma.department.findFirst({
      where: { tenantId, id: departmentId },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Department not found" }, { status: 404 });
    }

    if (existing._count.users > 0) {
      return NextResponse.json({ success: false, message: "Cannot delete department with assigned users" }, { status: 400 });
    }

    await prisma.department.delete({
      where: { id: departmentId }
    });

    await logAudit({
      tenantId,
      userId: session.userId,
      action: "DELETE_DEPARTMENT",
      module: "Employees",
      details: { departmentName: existing.name },
      ipAddress: req.headers.get("x-forwarded-for") || "",
      userAgent: req.headers.get("user-agent") || "",
    });

    return NextResponse.json({ success: true, message: "Department deleted successfully" }, { status: 200 });
  } catch (error) { return handleApiError(error); }
}
