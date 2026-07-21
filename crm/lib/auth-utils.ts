import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";

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
      process.env.JWT_SECRET || "default_secret"
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
    throw new Error("Unauthorized");
  }

  if (!allowedRoles.includes(session.role)) {
    throw new Error("Forbidden");
  }

  return session;
}
