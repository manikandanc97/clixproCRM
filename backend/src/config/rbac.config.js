const CRM_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  SALES: "sales",
  SUPPORT: "support",
  EMPLOYEE: "employee",
};

const rolePermissionConfig = {
  [CRM_ROLES.SUPER_ADMIN]: {
    roleName: "Super Admin",
    description: "Full platform owner with organization-wide control.",
    permissions: [
      "dashboard.view",
      "leads.create", "leads.read", "leads.update", "leads.delete",
      "customers.create", "customers.read", "customers.update", "customers.delete",
      "pipeline.create", "pipeline.read", "pipeline.update", "pipeline.delete",
      "tasks.create", "tasks.read", "tasks.update", "tasks.delete",
      "calendar.read",
      "quotations.create", "quotations.read", "quotations.update", "quotations.delete",
      "reports.read", "analytics.read", "ai.read",
      "employees.read", "employees.manage",
      "role_management.read", "role_management.manage",
      "settings.read", "settings.manage",
      "support_tickets.read", "support_tickets.manage",
      "attendance.read", "performance.read",
    ],
    routes: [
      "/dashboard", "/leads", "/customers", "/pipeline", "/tasks", "/calendar",
      "/quotations", "/reports", "/analytics", "/ai-insights", "/employees",
      "/role-management", "/settings", "/support-tickets", "/attendance",
      "/performance", "/team-performance",
    ],
    dashboardWidgets: [
      "revenue", "activeDeals", "newLeads", "winRate", "salesChart",
      "upcomingMeetings", "hotLeads", "teamPerformance", "leadFunnel",
      "revenueTracker", "recentActivities", "pendingFollowups", "aiInsights",
      "calendarWidget",
    ],
    analyticsVisibility: "full",
  },
  [CRM_ROLES.ADMIN]: {
    roleName: "Admin",
    description: "Administrative access with system management capabilities.",
    permissions: [
      "dashboard.view",
      "leads.read", "leads.update",
      "customers.read", "customers.update",
      "pipeline.read", "pipeline.update",
      "tasks.create", "tasks.read", "tasks.update",
      "calendar.read",
      "quotations.read", "quotations.update",
      "reports.read",
      "support_tickets.read",
      "employees.read",
      "settings.read",
    ],
    routes: [
      "/dashboard", "/leads", "/customers", "/pipeline", "/tasks", "/calendar",
      "/quotations", "/reports", "/support-tickets", "/employees", "/settings",
    ],
    dashboardWidgets: [
      "revenue", "activeDeals", "newLeads", "teamPerformance",
      "recentActivities", "pendingFollowups", "calendarWidget",
    ],
    analyticsVisibility: "team",
  },
  [CRM_ROLES.MANAGER]: {
    roleName: "Manager",
    description: "Leads, pipeline, quotations, and team performance ownership.",
    permissions: [
      "dashboard.view",
      "leads.create", "leads.read", "leads.update",
      "customers.read", "customers.update",
      "pipeline.read", "pipeline.update",
      "tasks.create", "tasks.read", "tasks.update",
      "calendar.read",
      "quotations.create", "quotations.read", "quotations.update", "quotations.approve",
      "reports.read",
      "team_performance.read",
    ],
    routes: [
      "/dashboard", "/leads", "/customers", "/pipeline", "/tasks", "/calendar",
      "/quotations", "/reports", "/team-performance",
    ],
    dashboardWidgets: [
      "activeDeals", "newLeads", "winRate", "salesChart", "hotLeads",
      "teamPerformance", "leadFunnel", "pendingFollowups", "calendarWidget",
    ],
    analyticsVisibility: "team",
  },
  [CRM_ROLES.SALES]: {
    roleName: "Sales",
    description: "Handles assigned leads and customer follow-ups.",
    permissions: [
      "dashboard.view",
      "leads.read_assigned", "leads.update_assigned",
      "customers.read",
      "tasks.read_assigned", "tasks.update_assigned",
      "calendar.read",
      "quotations.create", "quotations.read_assigned", "quotations.update_assigned",
    ],
    routes: [
      "/dashboard", "/my-leads", "/customers", "/tasks", "/calendar", "/quotations",
    ],
    dashboardWidgets: [
      "newLeads", "upcomingMeetings", "pendingFollowups", "calendarWidget",
    ],
    analyticsVisibility: "self",
  },
  [CRM_ROLES.SUPPORT]: {
    roleName: "Support",
    description: "Owns customer support requests and communication logs.",
    permissions: [
      "dashboard.view",
      "customers.read", "customers.update",
      "support_tickets.read", "support_tickets.manage",
      "tasks.read", "tasks.update",
      "calendar.read",
    ],
    routes: ["/dashboard", "/customers", "/support-tickets", "/tasks", "/calendar"],
    dashboardWidgets: [
      "recentActivities", "pendingFollowups", "calendarWidget",
    ],
    analyticsVisibility: "limited",
  },
  [CRM_ROLES.EMPLOYEE]: {
    roleName: "Employee",
    description: "Limited assigned features only.",
    permissions: [
      "dashboard.view",
      "tasks.read_assigned", "tasks.update_assigned",
      "calendar.read",
    ],
    routes: ["/dashboard", "/tasks", "/calendar"],
    dashboardWidgets: [
      "pendingFollowups", "calendarWidget",
    ],
    analyticsVisibility: "self",
  },
};

function getRoleAccess(role) {
  // Backward compatibility mapping
  const legacyMap = {
    "sales_manager": CRM_ROLES.MANAGER,
    "sales_executive": CRM_ROLES.SALES,
    "support_executive": CRM_ROLES.SUPPORT,
    "hr_manager": CRM_ROLES.MANAGER,
    "staff": CRM_ROLES.EMPLOYEE,
  };

  const normalizedRole = legacyMap[role] || role;
  return rolePermissionConfig[normalizedRole] || rolePermissionConfig[CRM_ROLES.EMPLOYEE];
}

module.exports = {
  CRM_ROLES,
  getRoleAccess,
  rolePermissionConfig,
};
