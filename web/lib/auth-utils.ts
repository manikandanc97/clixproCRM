import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api-error";
import prisma from "@/lib/prisma";

interface AuthSession {
  userId: string;
  tenantId: string;
  role: string;
}

export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // SECURITY: tenantId is always derived from the authenticated user's DB record.
    // No client-controlled x-tenant-id header is accepted.
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        status: true,
        memberships: {
          select: {
            tenantId: true,
            role: { select: { name: true } },
          },
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!userRecord || userRecord.status !== "ACTIVE" || userRecord.memberships.length === 0) {
      return null;
    }

    const membership = userRecord.memberships[0];

    return {
      userId: userRecord.id,
      tenantId: membership.tenantId,
      role: membership.role.name,
    };
  } catch {
    return null;
  }
}

export async function requireRole(allowedRoles: string[]) {
  const session = await getAuthSession();
  
  if (!session) {
    throw new ApiError("Unauthorized", 401);
  }

  if (!allowedRoles.includes(session.role.toUpperCase())) {
    throw new ApiError("Forbidden", 403);
  }

  return session;
}

 
export async function requirePermission(module: string, _action?: string) {
  const session = await getAuthSession();
  
  if (!session) {
    throw new ApiError("Unauthorized", 401);
  }

  // Fetch latest user role and permissions from DB

  const tenantUser = await prisma.tenantUser.findUnique({
    where: { tenantId_userId: { tenantId: session.tenantId, userId: session.userId } },
    include: {
      role: {
        include: {
          permissions: true
        }
      }
    }
  });

  if (!tenantUser) {
    throw new ApiError("Forbidden", 403);
  }

  const roleName = tenantUser.role.name.toUpperCase();
  if (roleName === "SUPER ADMIN" || roleName === "ADMIN") {
    return { ...session, role: tenantUser.role.name };
  }

  const hasPerm = tenantUser.role.permissions.some(
    (rp) => rp.module === module && rp.hasAccess
  );

  if (!hasPerm && !tenantUser.role.isSystem) {
    throw new ApiError(`Forbidden: Missing access to ${module}`, 403);
  }

  return { ...session, role: tenantUser.role.name };
}

export async function verifyUserInTenant(tenantId: string, targetUserId: string): Promise<boolean> {
  if (!targetUserId) return false;
  try {
    const membership = await prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId, userId: targetUserId } },
      include: { user: true }
    });
    return !!membership && membership.user?.status === "ACTIVE";
  } catch {
    return false;
  }
}

