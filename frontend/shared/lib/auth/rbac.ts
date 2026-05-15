import type React from "react";
import {
  Building2,
  ShieldCheck,
  Ticket,
  UserSquare2,
  Users,
} from "lucide-react";

// Re-export everything from modular files
export * from "./rbac/roles";
export * from "./rbac/permissions";
export * from "./rbac/menu-config";
export * from "./rbac/route-guards";

import { CRM_ROLES, type RoleKey } from "./rbac/roles";
import { roleMenuConfig } from "./rbac/menu-config";

// Maintain shared types for compatibility
export type RoleAccess = {
  roleName: string;
  description: string;
  permissions: string[];
  routes: string[];
  dashboardWidgets: string[];
  analyticsVisibility: "full" | "team" | "self" | "limited" | "hr";
};

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const defaultRoleAccess: RoleAccess = {
  roleName: "Employee",
  description: "Limited assigned features only.",
  permissions: [],
  routes: ["/dashboard"],
  dashboardWidgets: [],
  analyticsVisibility: "self",
};

/**
 * Role mapping for backward compatibility
 */
const legacyRoleMap: Record<string, RoleKey> = {
  "super_admin": CRM_ROLES.SUPER_ADMIN,
  "admin": CRM_ROLES.ADMIN,
  "sales_manager": CRM_ROLES.MANAGER,
  "sales_executive": CRM_ROLES.SALES,
  "support_executive": CRM_ROLES.SUPPORT,
  "hr_manager": CRM_ROLES.MANAGER,
  "staff": CRM_ROLES.EMPLOYEE,
};

export function normalizeRole(role?: string): RoleKey {
  if (!role) return CRM_ROLES.EMPLOYEE;
  
  // Try direct match
  if (Object.values(CRM_ROLES).includes(role as RoleKey)) {
    return role as RoleKey;
  }

  // Try legacy map
  if (role in legacyRoleMap) {
    return legacyRoleMap[role];
  }

  return CRM_ROLES.EMPLOYEE;
}

export function getRoleMenu(role?: string) {
  return roleMenuConfig[normalizeRole(role)];
}

export const roleAccent: Record<RoleKey, string> = {
  [CRM_ROLES.SUPER_ADMIN]: "from-violet-500 to-purple-600",
  [CRM_ROLES.ADMIN]: "from-indigo-500 to-blue-600",
  [CRM_ROLES.MANAGER]: "from-emerald-500 to-green-600",
  [CRM_ROLES.SALES]: "from-blue-500 to-cyan-600",
  [CRM_ROLES.SUPPORT]: "from-orange-500 to-amber-600",
  [CRM_ROLES.EMPLOYEE]: "from-rose-500 to-pink-600",
};

export const roleIcon: Record<RoleKey, React.ComponentType<{ className?: string }>> = {
  [CRM_ROLES.SUPER_ADMIN]: ShieldCheck,
  [CRM_ROLES.ADMIN]: Building2,
  [CRM_ROLES.MANAGER]: Building2,
  [CRM_ROLES.SALES]: Users,
  [CRM_ROLES.SUPPORT]: Ticket,
  [CRM_ROLES.EMPLOYEE]: UserSquare2,
};
