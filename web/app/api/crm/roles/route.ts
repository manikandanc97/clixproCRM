import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  priority: z.number().optional().default(0),
  permissions: z.array(z.string())
});

export async function GET() {
  try {
    const session = await requirePermission("Roles");
    const roles = await prisma.role.findMany({
      where: { tenantId: session.tenantId },
      include: {
        _count: {
          select: { users: true, permissions: true }
        },
        permissions: true
      },
      orderBy: [
        { isSystem: 'desc' },
        { priority: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ success: true, data: roles }, { status: 200 });
  } catch (error) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const identifier = `admin_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.ADMIN);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.ADMIN);

    const session = await requirePermission("Roles");
    const body = await req.json();
    const { name, description, color, priority, permissions } = roleSchema.parse(body);

    const existing = await prisma.role.findFirst({
      where: { tenantId: session.tenantId, name }
    });

    if (existing) {
      return NextResponse.json({ success: false, message: "Role name already exists" }, { status: 400 });
    }

    const role = await prisma.$transaction(async (tx) => {
      const newRole = await tx.role.create({
        data: {
          tenantId: session.tenantId,
          name,
          description,
          color,
          priority,
          isSystem: false
        }
      });

      if (permissions && permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map(module => ({
            roleId: newRole.id,
            module,
            hasAccess: true
          }))
        });
      }

      return newRole;
    });

    await prisma.auditLog.create({
      data: {
        tenantId: session.tenantId,
        userId: session.userId,
        action: "CREATE_ROLE",
        module: "Roles",
        details: { roleName: role.name }
      }
    });

    return NextResponse.json({ success: true, data: role, message: "Role created successfully" }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
