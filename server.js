require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const apiRoutes = require("./src/routes/api.routes");
const logger = require("./src/utils/logger");

// ─── Environment Validation ────────────────────────────────────────────────────
const requiredEnvVars = ["MONGODB_URI"];
const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ─── Connect to Database ───────────────────────────────────────────────────────
connectDB();

// ─── Health Check Route ────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Base Route ─────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Instagram Analytics API is running.",
    version: "1.0.0",
    docs: "/api/docs (coming soon)",
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
  });
});

// ─── Error Handling Middleware ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error("Unhandled error", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ─── Start Server & Graceful Shutdown ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || "production"} mode on port ${PORT}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`Received ${signal}, initiating graceful shutdown...`);
  server.close(() => {
    logger.info("Server closed gracefully");
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", err);
  shutdown("uncaughtException");
});
