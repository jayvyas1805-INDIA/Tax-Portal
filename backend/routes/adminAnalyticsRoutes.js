import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getAnalyticsOverview,
  getReferralTrend,
  getReferralSource,
  getConversionFunnel,
  getTopPartnersByRevenue,
  exportAnalytics,
} from "../controllers/adminAnalyticsController.js";

const router = express.Router();

router.get("/overview", protect, adminOnly, getAnalyticsOverview);
router.get("/referral-trend", protect, adminOnly, getReferralTrend);
router.get("/referral-source", protect, adminOnly, getReferralSource);
router.get("/funnel", protect, adminOnly, getConversionFunnel);
router.get("/top-partners", protect, adminOnly, getTopPartnersByRevenue);
router.get("/export", protect, adminOnly, exportAnalytics);

export default router;
