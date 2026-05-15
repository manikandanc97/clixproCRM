const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const { permissionMiddleware, hasAnyPermissionMiddleware } = require("../middleware/role.middleware");
const {
  getCustomers,
  getDashboardData,
  getLeads,
  getPipeline,
  getQuotations,
  getReports,
  getTasks,
  getAnalytics,
  getHotLeads,
  getTeamPerformance,
  getMeetings,
  getNotifications,
  getEmployees,
  getRoles,
  getAiInsights,
  getWorkspace,
  getSecuritySettings,
  getBillingSettings,
  getIntegrationSettings,
  getAiSettings,
  getNotificationSettings,
  createLead,
  createCustomer,
  createTask,
  createQuotation,
  createEmployee,
} = require("../controllers/crm.controller");

const router = express.Router();

router.use(authMiddleware);

// Dashboard
router.get("/dashboard", permissionMiddleware("dashboard.view"), getDashboardData);

// Customers
router.get("/customers", permissionMiddleware("customers.read"), getCustomers);
router.post("/customers", permissionMiddleware("customers.create"), createCustomer);

// Leads
router.get("/leads", hasAnyPermissionMiddleware("leads.read", "leads.read_assigned"), getLeads);
router.post("/leads", permissionMiddleware("leads.create"), createLead);

// Pipeline
router.get("/pipeline", permissionMiddleware("pipeline.read"), getPipeline);

// Tasks
router.get("/tasks", hasAnyPermissionMiddleware("tasks.read", "tasks.read_assigned"), getTasks);
router.post("/tasks", permissionMiddleware("tasks.create"), createTask);

// Quotations
router.get("/quotations", hasAnyPermissionMiddleware("quotations.read", "quotations.read_assigned"), getQuotations);
router.post("/quotations", permissionMiddleware("quotations.create"), createQuotation);

// Reports & Analytics
router.get("/reports", permissionMiddleware("reports.read"), getReports);
router.get("/analytics", permissionMiddleware("analytics.read"), getAnalytics);
router.get("/ai-insights", permissionMiddleware("ai.read"), getAiInsights);

// Team & Roles
router.get("/employees", permissionMiddleware("employees.read"), getEmployees);
router.post("/employees", permissionMiddleware("employees.manage"), createEmployee);
router.get("/roles", permissionMiddleware("role_management.read"), getRoles);
router.get("/team-performance", hasAnyPermissionMiddleware("team_performance.read", "analytics.read"), getTeamPerformance);

// Settings
router.get("/workspace", permissionMiddleware("settings.read"), getWorkspace);
router.get("/settings/security", permissionMiddleware("settings.manage"), getSecuritySettings);
router.get("/settings/billing", permissionMiddleware("settings.manage"), getBillingSettings);
router.get("/settings/integrations", permissionMiddleware("settings.manage"), getIntegrationSettings);
router.get("/settings/ai", permissionMiddleware("settings.manage"), getAiSettings);
router.get("/settings/notifications", permissionMiddleware("settings.read"), getNotificationSettings);

// Misc
router.get("/hot-leads", permissionMiddleware("leads.read"), getHotLeads);
router.get("/meetings", permissionMiddleware("calendar.read"), getMeetings);
router.get("/notifications", getNotifications); // Global

module.exports = router;
