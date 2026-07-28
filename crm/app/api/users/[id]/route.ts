import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { userSchema } from "@/shared/validations";
import { Prisma } from "@prisma/client";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN"]);
    const tenantId = session.tenantId;

    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;

    const body = await req.json();
    const { name, displayName, role, status, password } = userSchema.partial().parse(body);

    // Verify target user is in the same tenant
    const targetMembership = await prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId, userId: targetUserId } },
    });

    if (!targetMembership) {
      return NextResponse.json({ success: false, message: "User not found in workspace" }, { status: 404 });
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) (updateData as Record<string, unknown>).displayName = displayName;
    if (status !== undefined) updateData.status = status;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _updatedUser = await prisma.$transaction(async (tx) => {
      let u;
      if (Object.keys(updateData).length > 0) {
        u = await tx.user.update({
          where: { id: targetUserId },
          data: updateData,
        });
      }

      if (role !== undefined) {
        let finalRoleId: string = role;
        const roleObj = await tx.role.findFirst({ where: { tenantId, name: role } });
        if (roleObj) finalRoleId = roleObj.id;
        
        await tx.tenantUser.update({
          where: { tenantId_userId: { tenantId, userId: targetUserId } },
          data: { roleId: finalRoleId },
        });
      }
      return u;
    });

    return NextResponse.json({ success: true, message: "User updated successfully" }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN"]);
    const tenantId = session.tenantId;

    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;

    // A user cannot delete themselves this way
    if (session.userId === targetUserId) {
      return NextResponse.json({ success: false, message: "Cannot delete yourself" }, { status: 400 });
    }

    // Verify target user is in the same tenant
    const targetMembership = await prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId, userId: targetUserId } },
    });

    if (!targetMembership) {
      return NextResponse.json({ success: false, message: "User not found in workspace" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.tenantUser.update({
        where: { tenantId_userId: { tenantId, userId: targetUserId } },
        data: { status: "INACTIVE" }
      });

      const remainingMemberships = await tx.tenantUser.count({
        where: { userId: targetUserId, status: "ACTIVE" },
      });

      if (remainingMemberships === 0) {
        await tx.user.update({
          where: { id: targetUserId },
          data: { status: "INACTIVE", deletedAt: new Date() }
        });
      }
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

