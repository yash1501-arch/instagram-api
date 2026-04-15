const express = require("express");
const router = express.Router();
const apiController = require("../controllers/api.controller");
const rateLimit = require("express-rate-limit");

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Stricter for scraping endpoints
  skipSuccessfulRequests: true,
});

// Apply rate limiting to all /api routes
router.use(apiLimiter);

// ─── Routes ────────────────────────────────────────────────────────────────────
router.get("/profile/:username", apiController.getProfileBasic);
router.get("/engagement/:username", apiController.getEngagement);
router.get("/posts/:username", apiController.getPosts);
router.get("/analytics/:username", strictLimiter, apiController.getFullAnalytics);
router.get("/history/:username", apiController.getHistory);

module.exports = router;
