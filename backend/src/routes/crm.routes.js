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
} = require("../controllers/crm.controller");

const router = express.Router();

router.use(authMiddleware);

// Existing routes
router.get("/dashboard", getDashboardData);
router.get("/customers", getCustomers);
router.get("/leads", getLeads);
router.get("/pipeline", getPipeline);
router.get("/tasks", getTasks);
router.get("/quotations", getQuotations);
router.get("/reports", getReports);

// New dynamic data routes
router.get("/analytics", getAnalytics);
router.get("/hot-leads", getHotLeads);
router.get("/team-performance", getTeamPerformance);
router.get("/meetings", getMeetings);
router.get("/notifications", getNotifications);
router.get("/employees", getEmployees);
router.get("/roles", getRoles);
router.get("/ai-insights", getAiInsights);

module.exports = router;
