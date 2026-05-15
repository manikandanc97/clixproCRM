export const CRM_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  SALES: "sales",
  SUPPORT: "support",
  EMPLOYEE: "employee",
} as const;

export type RoleKey = (typeof CRM_ROLES)[keyof typeof CRM_ROLES];

export const ROLE_HIERARCHY: Record<RoleKey, number> = {
  [CRM_ROLES.SUPER_ADMIN]: 100,
  [CRM_ROLES.ADMIN]: 80,
  [CRM_ROLES.MANAGER]: 60,
  [CRM_ROLES.SALES]: 40,
  [CRM_ROLES.SUPPORT]: 40,
  [CRM_ROLES.EMPLOYEE]: 20,
};

export function isAtLeast(userRole: RoleKey, requiredRole: RoleKey): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
