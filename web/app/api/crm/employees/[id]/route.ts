import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";
import { employeeSchema } from "@/shared/validations";
import { Prisma } from "@prisma/client";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireRole(["ADMIN", "MANAGER"]);

    const rawBody = await req.json();
    const body = employeeSchema.partial().parse(rawBody);
    const { name, email, role } = body;

    if (role === "ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Only ADMIN can assign the ADMIN role" }, { status: 403 });
    }

    const existingUser = await prisma.tenantUser.findFirst({
      where: { userId: id, tenantId: session.tenantId },
      include: { user: true, role: true },
    });

    if (!existingUser) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    if (existingUser.role.name === "ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Only an ADMIN can modify an ADMIN" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      const userData: Prisma.UserUpdateInput = {};
      if (name) userData.name = name;
      if (email) userData.email = email;

      await tx.user.update({
        where: { id: id },
        data: userData,
      });

      if (role !== undefined && role !== existingUser.role.name) {
        if (existingUser.role.name === "ADMIN") {
          const adminCount = await tx.tenantUser.count({
            where: { tenantId: session.tenantId, role: { name: "ADMIN" }, status: "ACTIVE" }
          });
          if (adminCount <= 1) {
            throw new Error("Cannot demote the last active ADMIN.");
          }
        }
        
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
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Cannot demote the last active ADMIN")) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return handleApiError(error); 
  }
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
      include: { role: true }
    });

    if (!existingUser) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    if (existingUser.role.name === "ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Only an ADMIN can deactivate an ADMIN" }, { status: 403 });
    }

    if (existingUser.role.name === "ADMIN" && status === "INACTIVE") {
      const adminCount = await prisma.tenantUser.count({
        where: { tenantId: session.tenantId, role: { name: "ADMIN" }, status: "ACTIVE" }
      });
      if (adminCount <= 1) {
        return NextResponse.json({ success: false, message: "Cannot deactivate the last active ADMIN." }, { status: 400 });
      }
    }

    await prisma.user.update({
      where: { id: id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: unknown) { return handleApiError(error); }
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

    const { id } = await params;
    const session = await requireRole(["ADMIN", "MANAGER"]);

    const existingUser = await prisma.tenantUser.findFirst({
      where: { userId: id, tenantId: session.tenantId },
      include: { role: true }
    });

    if (!existingUser) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    if (existingUser.role.name === "ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Only an ADMIN can delete an ADMIN" }, { status: 403 });
    }

    if (existingUser.role.name === "ADMIN") {
      const adminCount = await prisma.tenantUser.count({
        where: { tenantId: session.tenantId, role: { name: "ADMIN" }, status: "ACTIVE" }
      });
      if (adminCount <= 1) {
        return NextResponse.json({ success: false, message: "Cannot delete the last active ADMIN." }, { status: 400 });
      }
    }

    // Check for destructive deletion (historical business data)
    const [leadsCount, dealsCount, tasksCount, customersCount] = await Promise.all([
      prisma.lead.count({ where: { OR: [{ createdById: id }, { assignedToId: id }], tenantId: session.tenantId } }),
      prisma.deal.count({ where: { ownerId: id, tenantId: session.tenantId } }),
      prisma.task.count({ where: { OR: [{ createdById: id }, { assignedToId: id }], tenantId: session.tenantId } }),
      prisma.customer.count({ where: { assignedToId: id, tenantId: session.tenantId } }),
    ]);

    if (leadsCount > 0 || dealsCount > 0 || tasksCount > 0 || customersCount > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Cannot delete employee with historical CRM activity. Please DEACTIVATE the employee instead to preserve data."
      }, { status: 400 });
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
  } catch (error: unknown) { return handleApiError(error); }
}
