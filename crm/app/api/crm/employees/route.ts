import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    // Using PascalCase for method name mapping
    const moduleName = "employees";
    const methodName = "get" + moduleName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    
    const data = await (CrmService as any)[methodName](session.tenantId);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ success: false, message: "Missing required fields: name, email, and role." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let tenantUser;
    
    try {
      tenantUser = await prisma.$transaction(async (tx) => {
        let user = await tx.user.findUnique({
          where: { email: normalizedEmail }
        });

        if (user) {
          const existingTenantUser = await tx.tenantUser.findUnique({
            where: {
              tenantId_userId: {
                tenantId: session.tenantId,
                userId: user.id
              }
            }
          });
          if (existingTenantUser) {
            throw new Error("USER_EXISTS_IN_TENANT");
          }
        } else {
          const passwordToHash = password || Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(passwordToHash, 10);
          user = await tx.user.create({
            data: {
              name,
              email: normalizedEmail,
              password: hashedPassword,
            }
          });
        }

        return await tx.tenantUser.create({
          data: {
            tenantId: session.tenantId,
            userId: user.id,
            role: role,
          },
          include: {
            user: true
          }
        });
      });
    } catch (txError: any) {
      if (txError.message === "USER_EXISTS_IN_TENANT") {
        return NextResponse.json({ success: false, message: "User is already an employee in this workspace" }, { status: 400 });
      }
      throw txError;
    }

    const newEmployee = {
      id: tenantUser.userId,
      name: tenantUser.user.name,
      email: tenantUser.user.email,
      role: tenantUser.role,
      status: tenantUser.user.status,
      createdAt: tenantUser.user.createdAt.toISOString()
    };

    return NextResponse.json({ success: true, data: newEmployee, message: "Employee created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Employee Creation Error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }
    return NextResponse.json({ success: false, message: "Failed to create employee" }, { status: 500 });
  }
}
