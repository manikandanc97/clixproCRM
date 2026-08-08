import { NextResponse } from "next/server";
import { EmployeeService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";
import { employeeSchema, paginationSchema } from "@/shared/validations";

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
    const { name, email, password, role } = body;

    if (role === "ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Only ADMIN can assign the ADMIN role" }, { status: 403 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let tenantUser: {
      userId: string;
      user: {
        id: string;
        name: string;
        email: string;
        status: string;
        createdAt: Date;
      };
    };
    const generatedPassword: string | null = null;
    
    try {
      tenantUser = await prisma.$transaction(async (tx) => {
        let user = await tx.user.findUnique({
          where: { email: normalizedEmail }
        });

        if (user) {
          throw new Error("USER_ALREADY_EXISTS_OTHER_TENANT");
        } else {
          user = await tx.user.create({
            data: {
              name,
              email: normalizedEmail,
            }
          });
        }


        let roleObj = await tx.role.findFirst({ where: { tenantId: session.tenantId, name: role } });
        if (!roleObj) {
          roleObj = await tx.role.create({
            data: {
              name: role,
              tenantId: session.tenantId,
              isSystem: true
            }
          });
        }
        const finalRoleId = roleObj.id;

        return await tx.tenantUser.create({
          data: {
            tenantId: session.tenantId,
            userId: user.id,
            roleId: finalRoleId,
          },
          include: {
            user: true
          }
        });
      });
    } catch (err) {
      const txError = err as Error;
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
      role: role,
      status: tenantUser.user.status,
      createdAt: tenantUser.user.createdAt.toISOString(),
      ...(generatedPassword ? { temporaryPassword: generatedPassword } : {})
    };

    return NextResponse.json({ success: true, data: newEmployee, message: "Employee created successfully" }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
