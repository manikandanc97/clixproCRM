import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { handleApiError } from "@/lib/api-error";
import { employeeSchema } from "@/shared/validations";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireRole(["ADMIN", "MANAGER"]);

    const rawBody = await req.json();
    const body = employeeSchema.partial().parse(rawBody);
    const { name, email, password, role } = body;

    if (role === "ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Only ADMIN can assign the ADMIN role" }, { status: 403 });
    }

    const existingUser = await prisma.tenantUser.findFirst({
      where: { userId: id, tenantId: session.tenantId },
      include: { user: true },
    });

    if (!existingUser) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      const userData: any = { name, email };
      
      if (password) {
        userData.password = await bcrypt.hash(password, 10);
      }

      await tx.user.update({
        where: { id: id },
        data: userData,
      });

      if (role !== undefined) {
        let finalRoleId: string = role;
        const roleObj = await tx.role.findFirst({ where: { tenantId: session.tenantId, name: role } });
        if (roleObj) finalRoleId = roleObj.id;

        await tx.tenantUser.update({
          where: { id: existingUser.id },
          data: { roleId: finalRoleId },
        });
      }
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) { return handleApiError(error); }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireRole(["ADMIN", "MANAGER"]);

    const rawBody = await req.json();
    const body = employeeSchema.partial().parse(rawBody);
    const { status } = body;

    const existingUser = await prisma.tenantUser.findFirst({
      where: { userId: id, tenantId: session.tenantId },
    });

    if (!existingUser) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) { return handleApiError(error); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireRole(["ADMIN", "MANAGER"]);

    const existingUser = await prisma.tenantUser.findFirst({
      where: { userId: id, tenantId: session.tenantId },
    });

    if (!existingUser) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.tenantUser.delete({
        where: { id: existingUser.id },
      });

      const remainingMemberships = await tx.tenantUser.count({
        where: { userId: id },
      });

      if (remainingMemberships === 0) {
        await tx.user.delete({
          where: { id: id },
        });
      }
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) { return handleApiError(error); }
}
