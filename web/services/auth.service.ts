import crypto from "crypto";
import prisma from "@/lib/prisma";

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

interface RegisterInput {
  userId: string;
  name: string;
  email: string;
  companyName: string;
}

export class AuthService {
  static async register(data: RegisterInput, reqInfo: { ip?: string; userAgent?: string }) {
    let slug = data.companyName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    
    // Ensure slug is unique
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
    }

    return prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: data.companyName, slug },
      });

      const role = await tx.role.create({
        data: { name: "ADMIN", tenantId: tenant.id, isSystem: true },
      });

      const user = await tx.user.create({
        data: {
          id: data.userId, // Mapping directly to Supabase auth.users.id
          name: data.name,
          email: data.email,
        },
      });

      await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          roleId: role.id,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          action: "REGISTER_SUCCESS",
          module: "Authentication",
          ipAddress: reqInfo.ip,
          userAgent: reqInfo.userAgent,
        }
      });

      return { user, tenant };
    });
  }
}
