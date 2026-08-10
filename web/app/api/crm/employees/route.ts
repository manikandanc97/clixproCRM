import { NextResponse } from "next/server";
import { EmployeeService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";
import { employeeSchema, paginationSchema } from "@/shared/validations";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    const url = new URL(req.url);
    const { page, limit } = paginationSchema.parse({
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    });

    const employeesData = await EmployeeService.getEmployees(session.tenantId, page, limit);
    return NextResponse.json({ success: true, data: { employees: employeesData.employees, stats: employeesData.stats, recentActivities: employeesData.activities, pagination: employeesData.pagination } }, { status: 200 });
  } catch (error) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    
    const rawBody = await req.json();
    const body = employeeSchema.parse(rawBody);
    const { email, role } = body;

    if (role === "ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Only ADMIN can assign the ADMIN role" }, { status: 403 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user is already in the tenant
    const existingTenantUser = await prisma.tenantUser.findFirst({
      where: {
        tenantId: session.tenantId,
        user: { email: normalizedEmail }
      }
    });

    if (existingTenantUser) {
      return NextResponse.json({ success: false, message: "User is already an employee in this workspace" }, { status: 400 });
    }

    let roleObj = await prisma.role.findFirst({ where: { tenantId: session.tenantId, name: role } });
    if (!roleObj) {
      roleObj = await prisma.role.create({
        data: { name: role, tenantId: session.tenantId, isSystem: true }
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const invitation = await prisma.invitation.upsert({
      where: { tenantId_email: { tenantId: session.tenantId, email: normalizedEmail } },
      update: { roleId: roleObj.id, token, expiresAt, status: "PENDING" },
      create: { tenantId: session.tenantId, email: normalizedEmail, roleId: roleObj.id, token, expiresAt },
    });

    const inviteResponse = {
      email: invitation.email,
      role: role,
      status: "INVITED",
      createdAt: invitation.createdAt.toISOString(),
      inviteToken: token, // To be sent via email in a real app
    };

    return NextResponse.json({ 
      success: true, 
      data: inviteResponse, 
      message: "Invitation generated successfully. The employee must sign up to accept it." 
    }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
