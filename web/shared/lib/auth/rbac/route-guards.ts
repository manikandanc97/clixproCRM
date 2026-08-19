import { CRM_ROLES, type RoleKey } from "./roles";

export const roleRouteConfig: Record<RoleKey, string[]> = {
  [CRM_ROLES.SUPER_ADMIN]: [
    "*",
    "/super-admin",
    "/super-admin/organizations",
    "/super-admin/users",
    "/super-admin/plans",
    "/super-admin/analytics",
    "/super-admin/audit-logs",
    "/super-admin/settings",
    "/dashboard",
    "/contacts",
    "/leads",
    "/customers",
    "/companies",
    "/deals",
    "/pipeline",
    "/tasks",
    "/calendar",
    "/quotations",
    "/reports",
    "/analytics",
    "/ai-insights",
    "/employees",
    "/role-management",
    "/settings",
    "/help",
  ],
  [CRM_ROLES.ADMIN]: [
    "/dashboard",
    "/contacts",
    "/leads",
    "/customers",
    "/companies",
    "/deals",
    "/pipeline",
    "/tasks",
    "/calendar",
    "/quotations",
    "/reports",
    "/analytics",
    "/ai-insights",
    "/employees",
    "/role-management",
    "/settings",
  ],
  [CRM_ROLES.MANAGER]: [
    "/dashboard",
    "/contacts",
    "/leads",
    "/customers",
    "/companies",
    "/deals",
    "/pipeline",
    "/tasks",
    "/calendar",
    "/quotations",
    "/reports",
    "/team-performance",
  ],
  [CRM_ROLES.SALES]: [
    "/dashboard",
    "/contacts",
    "/my-leads",
    "/customers",
    "/companies",
    "/deals",
    "/tasks",
    "/calendar",
    "/quotations",
  ],
  [CRM_ROLES.SUPPORT]: [
    "/dashboard",
    "/contacts",
    "/customers",
    "/companies",
    "/support-tickets",
    "/tasks",
    "/calendar",
  ],
  [CRM_ROLES.EMPLOYEE]: [
    "/dashboard",
    "/tasks",
    "/calendar",
  ],
};

export function isRouteAllowed(pathname: string, allowedRoutes: string[]): boolean {
  if (pathname === "/" || pathname === "/unauthorized") {
    return true;
  }

  if (allowedRoutes.includes("*")) {
    return true;
  }

  return allowedRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}
