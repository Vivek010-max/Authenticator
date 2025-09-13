import express from "express";
import {
  adminLogin,
  createInstitute,
  getAllInstitutes,
  deactivateInstitute,
  getFailedVerifications,
  getAnalyticsSummary,
  getInstituteVerifications,
  getLatestFailedVerifications,
  getDailyVerificationTrends,
} from "../Controllers/admin.controller.js";
import { adminAuthMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔹 Admin login (env-based, no auth required)
router.post("/login", adminLogin);

// 🔹 Institutes management (admin-only)
router.post("/institutes", adminAuthMiddleware, createInstitute);
router.get("/institutes", adminAuthMiddleware, getAllInstitutes);
router.delete("/institutes/:id", adminAuthMiddleware, deactivateInstitute);

// 🔹 Failed / doubtful verifications
router.get("/verifications/failed", adminAuthMiddleware, getFailedVerifications);

// 🔹 Analytics Endpoints
router.get("/analytics/summary", adminAuthMiddleware, getAnalyticsSummary);
router.get("/analytics/institutes", adminAuthMiddleware, getInstituteVerifications);
router.get("/analytics/failed-latest", adminAuthMiddleware, getLatestFailedVerifications);
router.get("/analytics/daily-trends", adminAuthMiddleware, getDailyVerificationTrends);

export default router;
