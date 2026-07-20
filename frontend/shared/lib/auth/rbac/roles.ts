export const CRM_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SALES: "SALES",
  SUPPORT: "SUPPORT",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type RoleKey = (typeof CRM_ROLES)[keyof typeof CRM_ROLES];

export const ROLE_HIERARCHY: Record<RoleKey, number> = {
  [CRM_ROLES.ADMIN]: 100,
  [CRM_ROLES.MANAGER]: 60,
  [CRM_ROLES.SALES]: 40,
  [CRM_ROLES.SUPPORT]: 40,
  [CRM_ROLES.EMPLOYEE]: 20,
};

export function isAtLeast(userRole: RoleKey, requiredRole: RoleKey): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
