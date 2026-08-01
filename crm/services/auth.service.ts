import prisma from "@/lib/prisma";
import { RegisterInput, LoginInput } from "@/shared/validators/auth.validator";
import { hashPassword, verifyPassword } from "@/shared/lib/auth/password";
import { signJWT } from "@/shared/lib/auth/jwt";

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

export class AuthService {
  static async register(data: RegisterInput, reqInfo: { ip?: string; userAgent?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error("Email already in use");
    }

    const hashed = await hashPassword(data.password);
    const slug = data.companyName.toLowerCase().replace(/[^a-z0-9]/g, "-");

    return prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: data.companyName, slug },
      });

      const role = await tx.role.create({
        data: { name: "ADMIN", tenantId: tenant.id, isSystem: true },
      });

      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashed,
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

  static async login(data: LoginInput, reqInfo: { ip?: string; userAgent?: string }) {
    const user = await prisma.user.findUnique({ 
      where: { email: data.email },
      include: { 
        memberships: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        } 
      }
    });

    if (!user) {
      throw new AuthError("User not found.", 404);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AuthError("Account is temporarily locked. Please try again later.", 423);
    }

    if (user.status !== "ACTIVE") {
      throw new AuthError("Account inactive.", 403);
    }


    const isValid = await verifyPassword(data.password, user.password);
    if (!isValid) {
      const attempts = user.failedLoginAttempts + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: attempts, lockedUntil }
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN_FAILED",
          module: "Authentication",
          ipAddress: reqInfo.ip,
          userAgent: reqInfo.userAgent,
        }
      });

      throw new AuthError("Incorrect password.", 401);
    }

    if (user.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null }
      });
    }

    const membership = user.memberships[0];
    const tenantId = membership?.tenantId || "";
    const roleId = membership?.roleId || "";
    const roleName = membership?.role?.name || "EMPLOYEE";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const permissions = membership?.role?.permissions?.filter((rp: any) => rp.hasAccess).map((rp: any) => rp.module) || [];

    const jwtPayload = { userId: user.id, tenantId, roleId, role: roleName };
    const token = await signJWT(jwtPayload);

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: token,
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        tenantId,
        action: "LOGIN_SUCCESS",
        module: "Authentication",
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
      }
    });

    return { 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        status: user.status,
        tenantId,
        role: roleName,
        permissions
      }, 
      token 
    };
  }

  static async logout(token: string) {
    // Delete session from database
    await prisma.session.deleteMany({
      where: { tokenHash: token }
    });
  }
}
