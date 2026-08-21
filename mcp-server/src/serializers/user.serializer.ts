import { SafeUserProfile } from "../types/crm.js";

/**
 * Sanitizes the raw backend user response, stripping password hashes,
 * session tokens, MFA secrets, and raw database internal fields.
 */
export function sanitizeUserProfile(raw: unknown): SafeUserProfile {
  if (!raw || typeof raw !== "object") {
    return { id: "unknown", email: "" };
  }

  const data = (raw as Record<string, unknown>).data || raw;
  const user = ((data as Record<string, unknown>).user || data) as Record<string, unknown>;
  const activeTenant = (data as Record<string, unknown>).activeTenant as Record<string, unknown> | undefined;
  const memberships = (user.memberships as Array<Record<string, unknown>>) || [];
  const primaryMembership = memberships[0];

  const roleName =
    typeof user.role === "string"
      ? user.role
      : typeof primaryMembership?.role === "object"
      ? (primaryMembership.role as Record<string, unknown>).name
      : undefined;

  const permissionsList: string[] = [];
  if (Array.isArray(user.permissions)) {
    permissionsList.push(...user.permissions.map(String));
  } else if (primaryMembership?.role && typeof primaryMembership.role === "object") {
    const roleObj = primaryMembership.role as Record<string, unknown>;
    if (Array.isArray(roleObj.permissions)) {
      for (const p of roleObj.permissions) {
        if (typeof p === "object" && p && "name" in p) {
          permissionsList.push(String((p as Record<string, unknown>).name));
        } else if (typeof p === "string") {
          permissionsList.push(p);
        }
      }
    }
  }

  return {
    id: String(user.id || ""),
    email: String(user.email || ""),
    firstName: user.firstName ? String(user.firstName) : undefined,
    lastName: user.lastName ? String(user.lastName) : undefined,
    name: user.name ? String(user.name) : undefined,
    avatarUrl: user.avatarUrl ? String(user.avatarUrl) : undefined,
    role: roleName ? String(roleName) : undefined,
    status: user.status ? String(user.status) : undefined,
    tenant: activeTenant
      ? {
          id: String(activeTenant.id || ""),
          name: String(activeTenant.name || ""),
          slug: activeTenant.slug ? String(activeTenant.slug) : undefined,
        }
      : undefined,
    permissions: permissionsList.length > 0 ? permissionsList : undefined,
  };
}
