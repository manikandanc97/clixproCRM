import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";
import { ApiError } from "@/lib/api-error";
import prisma from "@/lib/prisma";

interface AuthSession {
  userId: string;
  tenantId: string;
  role: string;
}

export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const tenantId = headersList.get("x-tenant-id");
    const role = headersList.get("x-role");

    if (userId && tenantId && role) {
      return { userId, tenantId, role };
    }

    // Fallback if headers are not set
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    ) as AuthSession;

    return {
      userId: decoded.userId || (decoded as { id?: string }).id || "",
      tenantId: decoded.tenantId,
      role: decoded.role,
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

