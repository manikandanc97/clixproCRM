const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;
