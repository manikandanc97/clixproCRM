import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";
import { ApiError } from "@/lib/api-error";

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
    const token = cookieStore.get("orbit_token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    ) as AuthSession;

    return {
      userId: decoded.userId || (decoded as any).id,
      tenantId: decoded.tenantId,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
}

export async function requireRole(allowedRoles: string[]) {
  const session = await getAuthSession();
  
  if (!session) {
    throw new ApiError("Unauthorized", 401);
  }

  if (!allowedRoles.includes(session.role)) {
    throw new ApiError("Forbidden", 403);
  }

  return session;
}
