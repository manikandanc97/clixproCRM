import prisma from "@/lib/prisma";
import { RegisterInput, LoginInput } from "@/shared/validators/auth.validator";
import { hashPassword, verifyPassword, signJWT } from "@/shared/lib/auth/utils";

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

      await tx.authAuditLog.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          eventType: "REGISTER_SUCCESS",
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
      include: { memberships: true }
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error("Account is temporarily locked. Please try again later.");
    }

    const isValid = await verifyPassword(data.password, user.password);
    if (!isValid) {
      const attempts = user.failedLoginAttempts + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: attempts, lockedUntil }
      });

      await prisma.authAuditLog.create({
        data: {
          userId: user.id,
          eventType: "LOGIN_FAILED",
          ipAddress: reqInfo.ip,
          userAgent: reqInfo.userAgent,
        }
      });

      throw new Error("Invalid credentials");
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

    const jwtPayload = { userId: user.id, tenantId, roleId };
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

    await prisma.authAuditLog.create({
      data: {
        userId: user.id,
        tenantId,
        eventType: "LOGIN_SUCCESS",
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
      }
    });

    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }

  static async logout(token: string) {
    // Delete session from database
    await prisma.session.deleteMany({
      where: { tokenHash: token }
    });
  }
}
