// Core packages import
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const authRoutes = require("./src/routes/auth.routes");
const crmRoutes = require("./src/routes/crm.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const errorMiddleware = require("./src/middleware/error.middleware");
const prisma = require("./src/config/prisma");

// Load env variables
dotenv.config();

// Create express app
const app = express();

// Port setup
const PORT = process.env.PORT || 5000;

/*
 Middleware
*/

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// JSON body read panna
app.use(express.json());

// Frontend-backend connection allow panna
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// Cookies read panna
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/crm", crmRoutes);

/*
 Health Check Route
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ClientRise CRM Backend Running 🚀",
  });
});

// Error handling middleware (must be after routes)
app.use(errorMiddleware);

/*
 Server Start
*/

async function startServer() {
  try {
    // Attempt database connection check
    console.log("Checking database connection...");
    await prisma.$connect();
    console.log("Database connection successful ✅");
  } catch (error) {
    console.error("Database connection failed ❌");
    console.error(error.message);
    console.warn("Server will continue starting in degraded mode (DB-dependent routes may fail).");
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

