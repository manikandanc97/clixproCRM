import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function getAuthSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("orbit_token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        memberships: true,
      }
    });

    if (!user || user.memberships.length === 0) return null;

    // For simplicity in this migration, we assume the first membership is the active tenant.
    // In a full implementation, you would store the 'activeTenantId' in the session or cookie.
    const activeTenantId = user.memberships[0].tenantId;

    return { user, activeTenantId };
  } catch (error) {
    return null;
  }
}
