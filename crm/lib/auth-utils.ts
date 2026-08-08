import { headers } from "next/headers";
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

    // Optional: Allow x-tenant-id override from headers if client specifies it
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        memberships: {
          include: { role: true },
        },
      },
    });

    if (!userRecord || userRecord.status !== "ACTIVE" || userRecord.memberships.length === 0) {
      return null;
    }

    const membership = tenantId
      ? userRecord.memberships.find(m => m.tenantId === tenantId) || userRecord.memberships[0]
      : userRecord.memberships[0];

    return {
      userId: userRecord.id,
      tenantId: membership.tenantId,
      role: membership.role.name,
    };
  } catch (_error) {
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

