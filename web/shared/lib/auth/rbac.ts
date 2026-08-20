import type React from "react";
import {
  Building2,
  Crown,
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
  "super_admin": CRM_ROLES.SUPER_ADMIN,
  "superadmin": CRM_ROLES.SUPER_ADMIN,
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

export const MODULE_SYNONYMS: Record<string, string[]> = {
  "Dashboard": ["dashboard", "dashboard.view"],
  "Contacts": ["contacts", "contacts.read", "contacts.create", "contacts.update", "contacts.delete"],
  "Companies": ["companies", "companies.read", "companies.create", "companies.update", "companies.delete"],
  "Deals": ["deals", "deals.read", "deals.create", "deals.update", "deals.delete"],
  "Tasks": ["tasks", "tasks.read", "tasks.create", "tasks.update", "tasks.delete"],
  "Calendar": ["calendar"],
  "Quotations": ["quotations", "quotations.read", "quotations.create", "quotations.update", "quotations.delete", "quotations.approve"],
  "Reports & Analytics": ["reports & analytics", "reports", "report", "analytics", "reports.read", "reports:read", "reports:view", "reports.view"],
  "Employees": ["employees", "employee", "employees.read", "employees.manage", "employees:view", "employees:manage"],
  "Role Management": ["role management", "roles", "role", "role_management", "roles:manage", "roles:view", "rolemanagement", "role_management.read", "role_management.manage", "roles.read", "roles.manage"],
  "Settings": ["settings", "settings.read", "settings.manage", "settings:view", "settings:manage"],
  "Support Tickets": ["support tickets", "support", "ticket", "tickets", "support_tickets", "support_tickets.read", "support_tickets.manage"],
  "Team Performance": ["team performance", "teamperformance", "performance", "reports", "employees"],
  "Attendance": ["attendance", "attendance.read"],
  "Performance": ["performance", "performance.read"],
  "Help Center": ["help center", "help"],
};

export function normalizeToModuleTitle(perm: string): string | null {
  if (!perm) return null;
  const p = perm.trim().toLowerCase();
  for (const [title, synonyms] of Object.entries(MODULE_SYNONYMS)) {
    if (title.toLowerCase() === p || synonyms.some(s => s.toLowerCase() === p)) {
      return title;
    }
  }
  return null;
}

export function hasModuleAccess(itemTitle: string, permissions?: string[], role?: string): boolean {
  const roleKey = normalizeRole(role);
  if (roleKey === CRM_ROLES.SUPER_ADMIN || roleKey === CRM_ROLES.ADMIN) return true;
  if (!permissions || permissions.length === 0) return false;
  
  const titleLower = itemTitle.toLowerCase();
  const synonyms = MODULE_SYNONYMS[itemTitle]?.map(s => s.toLowerCase()) || [titleLower];
  
  return permissions.some(p => {
    const pLower = p.trim().toLowerCase();
    if (pLower === titleLower || synonyms.includes(pLower)) return true;
    const normalized = normalizeToModuleTitle(p);
    return normalized === itemTitle;
  });
}

export function getRoleMenu(role?: string, permissions?: string[]) {
  const roleKey = normalizeRole(role);
  const baseMenu = roleMenuConfig[roleKey] || roleMenuConfig[CRM_ROLES.EMPLOYEE];
  
  // SUPER_ADMIN and ADMIN roles always get full base menu
  if (roleKey === CRM_ROLES.SUPER_ADMIN || roleKey === CRM_ROLES.ADMIN) {
    return baseMenu;
  }
  
  if (!permissions || permissions.length === 0) {
    return baseMenu;
  }
  
  const resultGroups: NavGroup[] = [];
  const handledTitles = new Set<string>();
  
  // 1. Filter base menu using permissions
  for (const group of baseMenu) {
    const filteredItems = group.items.filter(item => {
      const hasPerm = hasModuleAccess(item.title, permissions, role);
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
  const missingItems: NavItem[] = [];
  for (const perm of permissions) {
    if (perm === "Help Center" || perm.toLowerCase() === "help") continue;
    const title = normalizeToModuleTitle(perm);
    if (title && !handledTitles.has(title)) {
      const navItem = Object.values(navLibrary).find(n => n.title === title);
      if (navItem && !handledTitles.has(navItem.title)) {
        handledTitles.add(navItem.title);
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
  [CRM_ROLES.SUPER_ADMIN]: "from-amber-500 to-indigo-600",
  [CRM_ROLES.ADMIN]: "from-violet-500 to-purple-600",
  [CRM_ROLES.MANAGER]: "from-emerald-500 to-green-600",
  [CRM_ROLES.SALES]: "from-blue-500 to-cyan-600",
  [CRM_ROLES.SUPPORT]: "from-orange-500 to-amber-600",
  [CRM_ROLES.EMPLOYEE]: "from-rose-500 to-pink-600",
};

export const roleIcon: Record<RoleKey, React.ComponentType<{ className?: string }>> = {
  [CRM_ROLES.SUPER_ADMIN]: Crown,
  [CRM_ROLES.ADMIN]: ShieldCheck,
  [CRM_ROLES.MANAGER]: Building2,
  [CRM_ROLES.SALES]: Users,
  [CRM_ROLES.SUPPORT]: Ticket,
  [CRM_ROLES.EMPLOYEE]: UserSquare2,
};

export function getRoleBadge(role?: string) {
  const roleKey = normalizeRole(role);
  return {
    roleKey,
    style: {
      badge: "bg-primary/10 text-primary border-primary/20",
      text: "text-primary",
      bg: "bg-primary/10",
    },
    Icon: roleIcon[roleKey] || roleIcon[CRM_ROLES.EMPLOYEE],
  };
}

