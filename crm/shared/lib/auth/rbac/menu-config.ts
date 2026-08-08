import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckSquare,
  FileText,
  Handshake,
  KanbanSquare,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Ticket,
  UserRound,
  Users,
  UserSquare2,
} from "lucide-react";
import { CRM_ROLES, type RoleKey } from "./roles";
import type { NavGroup, NavItem } from "../rbac";

export const navLibrary: Record<string, NavItem> = {
  dashboard: { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  leads: { title: "Leads", href: "/leads", icon: Users },
  myLeads: { title: "My Leads", href: "/my-leads", icon: Users },
  companies: { title: "Companies", href: "/companies", icon: Building2 },
  customers: { title: "Customers", href: "/customers", icon: UserRound },
  deals: { title: "Deals", href: "/deals", icon: Handshake },
  pipeline: { title: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  tasks: { title: "Tasks", href: "/tasks", icon: CheckSquare },
  calendar: { title: "Calendar", href: "/calendar", icon: CalendarDays },
  quotations: { title: "Quotations", href: "/quotations", icon: FileText },
  reports: { title: "Reports & Analytics", href: "/reports", icon: BarChart3 },
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
  [CRM_ROLES.ADMIN]: [
    {
      label: "Core",
      items: [
        navLibrary.dashboard,
        navLibrary.leads,
        navLibrary.companies,
        navLibrary.customers,
        navLibrary.deals,
        navLibrary.pipeline,
        navLibrary.tasks,
        navLibrary.calendar,
        navLibrary.quotations,
      ],
    },
    {
      label: "Insights",
      items: [navLibrary.reports],
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
  [CRM_ROLES.MANAGER]: [
    {
      label: "Team Workspace",
      items: [
        navLibrary.dashboard,
        navLibrary.leads,
        navLibrary.companies,
        navLibrary.customers,
        navLibrary.deals,
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
  [CRM_ROLES.SALES]: [
    {
      label: "Sales Workspace",
      items: [
        navLibrary.dashboard,
        navLibrary.myLeads,
        navLibrary.companies,
        navLibrary.customers,
        navLibrary.deals,
        navLibrary.tasks,
        navLibrary.calendar,
        navLibrary.quotations,
      ],
    },
  ],
  [CRM_ROLES.SUPPORT]: [
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
  [CRM_ROLES.EMPLOYEE]: [
    {
      label: "Daily Tasks",
      items: [
        navLibrary.dashboard,
        navLibrary.tasks,
        navLibrary.calendar,
      ],
    },
  ],
};
