export const CRM_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SALES: "SALES",
  SUPPORT: "SUPPORT",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type RoleKey = (typeof CRM_ROLES)[keyof typeof CRM_ROLES];

