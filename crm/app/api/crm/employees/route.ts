import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { requireRole } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { handleApiError } from "@/lib/api-error";
import { employeeSchema } from "@/shared/validations";

export async function GET(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const employeesData = await CrmService.getEmployees(session.tenantId, page, limit);
    return NextResponse.json({ success: true, data: employeesData.employees, stats: employeesData.stats, pagination: employeesData.pagination }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    
    const rawBody = await req.json();
    const body = employeeSchema.parse(rawBody);
    const { name, email, password, role } = body;

    if (role === "ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Only ADMIN can assign the ADMIN role" }, { status: 403 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let tenantUser;
    let generatedPassword: string | null = null;
    
    try {
      tenantUser = await prisma.$transaction(async (tx) => {
        let user = await tx.user.findUnique({
          where: { email: normalizedEmail }
        });

        if (user) {
          throw new Error("USER_ALREADY_EXISTS_OTHER_TENANT");
        } else {
          let passwordToHash = password;
          if (!password) {
            generatedPassword = crypto.randomBytes(8).toString('hex');
            passwordToHash = generatedPassword;
          }
          const hashedPassword = await bcrypt.hash(passwordToHash as string, 10);
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
      if (txError.message === "USER_ALREADY_EXISTS_OTHER_TENANT") {
        return NextResponse.json({ success: false, message: "User with this email already belongs to an account. Invitation flow is required." }, { status: 400 });
      }
      return handleApiError(txError);
    }

    const newEmployee = {
      id: tenantUser.userId,
      name: tenantUser.user.name,
      email: tenantUser.user.email,
      role: tenantUser.role,
      status: tenantUser.user.status,
      createdAt: tenantUser.user.createdAt.toISOString(),
      ...(generatedPassword ? { temporaryPassword: generatedPassword } : {})
    };

    return NextResponse.json({ success: true, data: newEmployee, message: "Employee created successfully" }, { status: 201 });
  } catch (error: any) { return handleApiError(error); }
}
