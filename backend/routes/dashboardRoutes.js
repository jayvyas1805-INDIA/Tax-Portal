import express from 'express';
import {protect} from "../middleware/authMiddleware.js"
import {
  getDashboardStats,
  getReferralTrends,
  getAvailableYears,
  getCommissionChart,
  getCurrentPartnerSettings,
  getPartnerTier
} from "../controllers/dashboardController.js";

const router =express.Router();

router.get("/", protect, getDashboardStats)
router.get("/chart", protect, getReferralTrends)
router.get(
  "/years",
  protect,
  getAvailableYears
);
router.get(
  "/commission-chart",
  protect,
  getCommissionChart
);

router.get(
  "/current",
  protect,
  getCurrentPartnerSettings
);

router.get(
  "/tier",
  protect,
  getPartnerTier
);



export default router