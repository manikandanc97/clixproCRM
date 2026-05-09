import type React from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckSquare,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  Lightbulb,
  PieChart,
  Settings,
  ShieldCheck,
  Ticket,
  UserRound,
  Users,
  UserSquare2,
} from "lucide-react";

export const CRM_ROLES = {
  SUPER_ADMIN: "super_admin",
  SALES_MANAGER: "sales_manager",
  SALES_EXECUTIVE: "sales_executive",
  SUPPORT_EXECUTIVE: "support_executive",
  HR_MANAGER: "hr_manager",
} as const;

export type RoleKey = (typeof CRM_ROLES)[keyof typeof CRM_ROLES];

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

const navLibrary: Record<string, NavItem> = {
  dashboard: { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  leads: { title: "Leads", href: "/leads", icon: Users },
  myLeads: { title: "My Leads", href: "/my-leads", icon: Users },
  customers: { title: "Customers", href: "/customers", icon: UserRound },
  pipeline: { title: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  tasks: { title: "Tasks", href: "/tasks", icon: CheckSquare },
  calendar: { title: "Calendar", href: "/calendar", icon: CalendarDays },
  quotations: { title: "Quotations", href: "/quotations", icon: FileText },
  reports: { title: "Reports", href: "/reports", icon: BarChart3 },
  analytics: { title: "Analytics", href: "/analytics", icon: PieChart },
  aiInsights: { title: "AI Insights", href: "/ai-insights", icon: Lightbulb },
  employees: { title: "Employees", href: "/employees", icon: UserSquare2 },
  roleManagement: {
    title: "Role Management",
    href: "/role-management",
    icon: ShieldCheck,
  },
  settings: { title: "Settings", href: "/settings", icon: Settings },
  supportTickets: { title: "Support Tickets", href: "/support-tickets", icon: Ticket },
  teamPerformance: {
    title: "Team Performance",
    href: "/team-performance",
    icon: BriefcaseBusiness,
  },
  attendance: { title: "Attendance", href: "/attendance", icon: CalendarDays },
  performance: { title: "Performance", href: "/performance", icon: BarChart3 },
};

export const roleMenuConfig: Record<RoleKey, NavGroup[]> = {
  [CRM_ROLES.SUPER_ADMIN]: [
    {
      label: "Core",
      items: [
        navLibrary.dashboard,
        navLibrary.leads,
        navLibrary.customers,
        navLibrary.pipeline,
        navLibrary.tasks,
        navLibrary.calendar,
        navLibrary.quotations,
      ],
    },
    {
      label: "Insights",
      items: [navLibrary.reports, navLibrary.analytics, navLibrary.aiInsights],
    },
    {
      label: "Administration",
      items: [
        navLibrary.employees,
        navLibrary.roleManagement,
        navLibrary.settings,
      ],
    },
  ],
  [CRM_ROLES.SALES_MANAGER]: [
    {
      label: "Sales Workspace",
      items: [
        navLibrary.dashboard,
        navLibrary.leads,
        navLibrary.customers,
        navLibrary.pipeline,
        navLibrary.tasks,
        navLibrary.calendar,
        navLibrary.quotations,
      ],
    },
    {
      label: "Performance",
      items: [navLibrary.reports, navLibrary.teamPerformance],
    },
  ],
  [CRM_ROLES.SALES_EXECUTIVE]: [
    {
      label: "Daily Workspace",
      items: [
        navLibrary.dashboard,
        navLibrary.myLeads,
        navLibrary.customers,
        navLibrary.tasks,
        navLibrary.calendar,
        navLibrary.quotations,
      ],
    },
  ],
  [CRM_ROLES.SUPPORT_EXECUTIVE]: [
    {
      label: "Support Workspace",
      items: [
        navLibrary.dashboard,
        navLibrary.customers,
        navLibrary.supportTickets,
        navLibrary.tasks,
        navLibrary.calendar,
      ],
    },
  ],
  [CRM_ROLES.HR_MANAGER]: [
    {
      label: "People Operations",
      items: [
        navLibrary.dashboard,
        navLibrary.employees,
        navLibrary.attendance,
        navLibrary.performance,
        navLibrary.tasks,
        navLibrary.calendar,
      ],
    },
  ],
};

export const defaultRoleAccess: RoleAccess = {
  roleName: "Sales Executive",
  description: "Handles assigned leads and customer follow-ups.",
  permissions: [],
  routes: ["/dashboard"],
  dashboardWidgets: [],
  analyticsVisibility: "self",
};

export function normalizeRole(role?: string): RoleKey {
  if (role && role in roleMenuConfig) {
    return role as RoleKey;
  }

  return CRM_ROLES.SALES_EXECUTIVE;
}

export function getRoleMenu(role?: string) {
  return roleMenuConfig[normalizeRole(role)];
}

export function isRouteAllowed(pathname: string, routes: string[]) {
  if (pathname === "/") {
    return true;
  }

  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export const roleAccent: Record<RoleKey, string> = {
  [CRM_ROLES.SUPER_ADMIN]: "from-violet-500 to-purple-600",
  [CRM_ROLES.SALES_MANAGER]: "from-emerald-500 to-green-600",
  [CRM_ROLES.SALES_EXECUTIVE]: "from-blue-500 to-cyan-600",
  [CRM_ROLES.SUPPORT_EXECUTIVE]: "from-orange-500 to-amber-600",
  [CRM_ROLES.HR_MANAGER]: "from-rose-500 to-pink-600",
};

export const roleIcon: Record<RoleKey, React.ComponentType<{ className?: string }>> = {
  [CRM_ROLES.SUPER_ADMIN]: ShieldCheck,
  [CRM_ROLES.SALES_MANAGER]: Building2,
  [CRM_ROLES.SALES_EXECUTIVE]: Users,
  [CRM_ROLES.SUPPORT_EXECUTIVE]: Ticket,
  [CRM_ROLES.HR_MANAGER]: UserSquare2,
};
