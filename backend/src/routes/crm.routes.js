const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
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

// Existing routes
router.get("/dashboard", getDashboardData);
router.get("/customers", getCustomers);
router.post("/customers", createCustomer);
router.get("/leads", getLeads);
router.post("/leads", createLead);
router.get("/pipeline", getPipeline);
router.get("/tasks", getTasks);
router.post("/tasks", createTask);
router.get("/quotations", getQuotations);
router.post("/quotations", createQuotation);
router.get("/reports", getReports);

// New dynamic data routes
router.get("/analytics", getAnalytics);
router.get("/hot-leads", getHotLeads);
router.get("/team-performance", getTeamPerformance);
router.get("/meetings", getMeetings);
router.get("/notifications", getNotifications);
router.get("/employees", getEmployees);
router.post("/employees", createEmployee);
router.get("/roles", getRoles);
router.get("/ai-insights", getAiInsights);
router.get("/workspace", getWorkspace);
router.get("/settings/security", getSecuritySettings);
router.get("/settings/billing", getBillingSettings);
router.get("/settings/integrations", getIntegrationSettings);
router.get("/settings/ai", getAiSettings);
router.get("/settings/notifications", getNotificationSettings);

module.exports = router;
