import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function logAudit({
  tenantId,
  userId,
  targetUserId,
  action,
  module,
  details,
  ipAddress,
  userAgent,
}: {
  tenantId?: string;
  userId?: string;
  targetUserId?: string;
  action: string;
  module?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        targetUserId,
        action,
        module,
        details: (details || {}) as Prisma.InputJsonValue,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
