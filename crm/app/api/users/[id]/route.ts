import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("orbit_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { memberships: true },
    });
    return user;
  } catch {
    return null;
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;
    const authUser = await getAuthUser();

    if (!authUser || !authUser.memberships.length) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const adminRole = authUser.memberships[0].role;
    if (adminRole !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden: Requires Admin privileges" }, { status: 403 });
    }

    const tenantId = authUser.memberships[0].tenantId;
    const { name, displayName, role, status, password } = await req.json();

    // Verify target user is in the same tenant
    const targetMembership = await prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId, userId: targetUserId } },
    });

    if (!targetMembership) {
      return NextResponse.json({ success: false, message: "User not found in workspace" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (status !== undefined) updateData.status = status;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      let u;
      if (Object.keys(updateData).length > 0) {
        u = await tx.user.update({
          where: { id: targetUserId },
          data: updateData,
        });
      }

      if (role !== undefined) {
        await tx.tenantUser.update({
          where: { tenantId_userId: { tenantId, userId: targetUserId } },
          data: { role },
        });
      }
      return u;
    });

    return NextResponse.json({ success: true, message: "User updated successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/users/[id] Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;
    const authUser = await getAuthUser();

    if (!authUser || !authUser.memberships.length) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const adminRole = authUser.memberships[0].role;
    if (adminRole !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // A user cannot delete themselves this way
    if (authUser.id === targetUserId) {
      return NextResponse.json({ success: false, message: "Cannot delete yourself" }, { status: 400 });
    }

    const tenantId = authUser.memberships[0].tenantId;

    // Verify target user is in the same tenant
    const targetMembership = await prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId, userId: targetUserId } },
    });

    if (!targetMembership) {
      return NextResponse.json({ success: false, message: "User not found in workspace" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/users/[id] Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
