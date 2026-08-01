import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const session = await requirePermission("Employees", "View");
    const departments = await prisma.department.findMany({
      where: { tenantId: session.tenantId },
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ success: true, data: departments }, { status: 200 });
  } catch (error) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission("Employees", "Manage");
    const body = await req.json();
    const { name, description } = departmentSchema.parse(body);

    const existing = await prisma.department.findFirst({
      where: { tenantId: session.tenantId, name }
    });

    if (existing) {
      return NextResponse.json({ success: false, message: "Department already exists" }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: {
        tenantId: session.tenantId,
        name,
        description
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        tenantId: session.tenantId,
        userId: session.userId,
        action: "CREATE_DEPARTMENT",
        module: "Employees",
        details: { name: department.name }
      }
    });

    return NextResponse.json({ success: true, data: department, message: "Department created successfully" }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
