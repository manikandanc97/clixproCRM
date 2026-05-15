import { CRM_ROLES, type RoleKey } from "./roles";

export const roleRouteConfig: Record<RoleKey, string[]> = {
  [CRM_ROLES.SUPER_ADMIN]: [
    "/dashboard",
    "/leads",
    "/customers",
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
    "/support-tickets",
    "/attendance",
    "/performance",
    "/team-performance",
  ],
  [CRM_ROLES.ADMIN]: [
    "/dashboard",
    "/leads",
    "/customers",
    "/pipeline",
    "/tasks",
    "/calendar",
    "/quotations",
    "/reports",
    "/support-tickets",
    "/employees",
    "/settings",
  ],
  [CRM_ROLES.MANAGER]: [
    "/dashboard",
    "/leads",
    "/customers",
    "/pipeline",
    "/tasks",
    "/calendar",
    "/quotations",
    "/reports",
    "/team-performance",
  ],
  [CRM_ROLES.SALES]: [
    "/dashboard",
    "/my-leads",
    "/customers",
    "/tasks",
    "/calendar",
    "/quotations",
  ],
  [CRM_ROLES.SUPPORT]: [
    "/dashboard",
    "/customers",
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

  return allowedRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}
