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
} = require("../controllers/crm.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/dashboard", getDashboardData);
router.get("/customers", getCustomers);
router.get("/leads", getLeads);
router.get("/pipeline", getPipeline);
router.get("/tasks", getTasks);
router.get("/quotations", getQuotations);
router.get("/reports", getReports);

module.exports = router;
