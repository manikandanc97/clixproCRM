export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: "dashboard.view",

  // Leads
  LEADS_CREATE: "leads.create",
  LEADS_READ: "leads.read",
  LEADS_READ_ASSIGNED: "leads.read_assigned",
  LEADS_UPDATE: "leads.update",
  LEADS_UPDATE_ASSIGNED: "leads.update_assigned",
  LEADS_DELETE: "leads.delete",

  // Customers
  CUSTOMERS_CREATE: "customers.create",
  CUSTOMERS_READ: "customers.read",
  CUSTOMERS_UPDATE: "customers.update",
  CUSTOMERS_DELETE: "customers.delete",

  // Pipeline
  PIPELINE_CREATE: "pipeline.create",
  PIPELINE_READ: "pipeline.read",
  PIPELINE_UPDATE: "pipeline.update",
  PIPELINE_DELETE: "pipeline.delete",

  // Tasks
  TASKS_CREATE: "tasks.create",
  TASKS_READ: "tasks.read",
  TASKS_READ_ASSIGNED: "tasks.read_assigned",
  TASKS_UPDATE: "tasks.update",
  TASKS_UPDATE_ASSIGNED: "tasks.update_assigned",
  TASKS_DELETE: "tasks.delete",

  // Quotations
  QUOTATIONS_CREATE: "quotations.create",
  QUOTATIONS_READ: "quotations.read",
  QUOTATIONS_READ_ASSIGNED: "quotations.read_assigned",
  QUOTATIONS_UPDATE: "quotations.update",
  QUOTATIONS_UPDATE_ASSIGNED: "quotations.update_assigned",
  QUOTATIONS_DELETE: "quotations.delete",
  QUOTATIONS_APPROVE: "quotations.approve",

  // Employees
  EMPLOYEES_READ: "employees.read",
  EMPLOYEES_MANAGE: "employees.manage",

  // Roles
  ROLES_READ: "role_management.read",
  ROLES_MANAGE: "role_management.manage",

  // Reports & Analytics
  REPORTS_READ: "reports.read",
  ANALYTICS_READ: "analytics.read",
  AI_INSIGHTS_READ: "ai.read",

  // Settings
  SETTINGS_READ: "settings.read",
  SETTINGS_MANAGE: "settings.manage",

  // Support
  SUPPORT_TICKETS_READ: "support_tickets.read",
  SUPPORT_TICKETS_MANAGE: "support_tickets.manage",

  // HRM
  ATTENDANCE_READ: "attendance.read",
  PERFORMANCE_READ: "performance.read",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
