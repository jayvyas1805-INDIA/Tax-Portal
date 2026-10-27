import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminPanelAccess } from "../middleware/adminMiddleware.js";
import {
  getDashboardStats,
  getRevenueOverview,
  getRevenueChart,
  getConversionFunnel,
  getElitePerformers,
  getReferralStream,
} from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get("/stats", protect, adminPanelAccess, getDashboardStats);
router.get("/revenue", protect, adminPanelAccess, getRevenueOverview);
router.get("/revenue-chart", protect, adminPanelAccess, getRevenueChart);
router.get("/funnel", protect, adminPanelAccess, getConversionFunnel);
router.get("/elite-performers", protect, adminPanelAccess, getElitePerformers);
router.get("/referral-stream", protect, adminPanelAccess, getReferralStream);

export default router;
