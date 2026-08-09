import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getDashboardStats,
  getRevenueOverview,
  getRevenueChart,
  getConversionFunnel,
  getElitePerformers,
  getReferralStream,
} from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/revenue", protect, adminOnly, getRevenueOverview);
router.get("/revenue-chart", protect, adminOnly, getRevenueChart);
router.get("/funnel", protect, adminOnly, getConversionFunnel);
router.get("/elite-performers", protect, adminOnly, getElitePerformers);
router.get("/referral-stream", protect, adminOnly, getReferralStream);

export default router;
