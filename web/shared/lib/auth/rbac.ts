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
import { roleMenuConfig, navLibrary } from "./rbac/menu-config";

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
  "super_admin": CRM_ROLES.ADMIN,
  "admin": CRM_ROLES.ADMIN,
  "sales_manager": CRM_ROLES.MANAGER,
  "sales_executive": CRM_ROLES.SALES,
  "support_executive": CRM_ROLES.SUPPORT,
  "hr_manager": CRM_ROLES.MANAGER,
  "staff": CRM_ROLES.EMPLOYEE,
};

export function normalizeRole(role?: string): RoleKey {
  if (!role) return CRM_ROLES.EMPLOYEE;
  
  role = role.toUpperCase();
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

export function getRoleMenu(role?: string, permissions?: string[]) {
  const roleKey = normalizeRole(role);
  const baseMenu = roleMenuConfig[roleKey];
  
  if (!permissions || permissions.length === 0) {
    return baseMenu;
  }
  
  const resultGroups: NavGroup[] = [];
  const handledTitles = new Set<string>();
  
  // 1. Filter base menu using permissions
  for (const group of baseMenu) {
    const filteredItems = group.items.filter(item => {
      const hasPerm = permissions.includes(item.title);
      if (hasPerm) handledTitles.add(item.title);
      return hasPerm;
    });
    
    if (filteredItems.length > 0) {
      resultGroups.push({
        label: group.label,
        items: filteredItems,
      });
    }
  }
  
  // 2. Add items that are in permissions but not in base menu
  const missingItems = [];
  for (const perm of permissions) {
    if (perm === "Help Center") continue; // Handled separately
    if (!handledTitles.has(perm)) {
      const navItem = Object.values(navLibrary).find(n => n.title === perm);
      if (navItem) {
        missingItems.push(navItem);
      }
    }
  }
  
  if (missingItems.length > 0) {
    if (resultGroups.length > 0) {
      // Append to the first group (e.g. Workspace / Daily Tasks)
      resultGroups[0].items.push(...missingItems);
    } else {
      resultGroups.push({
        label: "Modules",
        items: missingItems,
      });
    }
  }
  
  return resultGroups;
}

export const roleAccent: Record<RoleKey, string> = {
  [CRM_ROLES.ADMIN]: "from-violet-500 to-purple-600",
  [CRM_ROLES.MANAGER]: "from-emerald-500 to-green-600",
  [CRM_ROLES.SALES]: "from-blue-500 to-cyan-600",
  [CRM_ROLES.SUPPORT]: "from-orange-500 to-amber-600",
  [CRM_ROLES.EMPLOYEE]: "from-rose-500 to-pink-600",
};

export const roleIcon: Record<RoleKey, React.ComponentType<{ className?: string }>> = {
  [CRM_ROLES.ADMIN]: ShieldCheck,
  [CRM_ROLES.MANAGER]: Building2,
  [CRM_ROLES.SALES]: Users,
  [CRM_ROLES.SUPPORT]: Ticket,
  [CRM_ROLES.EMPLOYEE]: UserSquare2,
};
