import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { userSchema } from "@/shared/validations";

export async function GET() {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    const tenantId = session.tenantId;

    const memberships = await prisma.tenantUser.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        role: true,
      },
    });

    const users = memberships.map((m) => ({
      ...m.user,
      role: m.role?.name || m.roleId,
    }));

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const tenantId = session.tenantId;

    const body = await req.json();
    const { name, email, password, role, status } = userSchema.parse(body);

    const normalizedEmail = email.toLowerCase();
    
    let newUser: { id: string } | undefined;
    try {
      newUser = await prisma.$transaction(async (tx) => {
        let u = await tx.user.findUnique({ where: { email: normalizedEmail } });
        
        if (!u) {
          const hashedPassword = await bcrypt.hash(password as string, 10);
          u = await tx.user.create({
            data: {
              name,
              email: normalizedEmail,
              password: hashedPassword,
              status: status || "ACTIVE",
            },
          });
        } else {
          const existingMembership = await tx.tenantUser.findUnique({
            where: { tenantId_userId: { tenantId, userId: u.id } },
          });

          if (existingMembership) {
            throw new Error("USER_EXISTS_IN_TENANT");
          }
        }

        let finalRoleId: string = role;
        const roleObj = await tx.role.findFirst({ where: { tenantId, name: role } });
        if (roleObj) finalRoleId = roleObj.id;

        await tx.tenantUser.create({
          data: {
            tenantId,
            userId: u.id,
            roleId: finalRoleId,
          },
        });

        return u;
      });
    } catch (err) {
      const txError = err as Error;
      if (txError.message === "USER_EXISTS_IN_TENANT") {
        return NextResponse.json({ success: false, message: "User is already an employee in this workspace" }, { status: 400 });
      }
      return handleApiError(txError);
    }

    return NextResponse.json({ success: true, message: "User created successfully", user: { id: newUser.id } }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
