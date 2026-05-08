const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");

// Protected dashboard route
router.get("/", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Dashboard 🔥",
    user: req.user,
  });
});

// Admin only route
router.get("/admin", authMiddleware, roleMiddleware("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin 👑",
  });
});

module.exports = router;
