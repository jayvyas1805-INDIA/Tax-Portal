import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminPanelAccess } from "../middleware/adminMiddleware.js";
import {
  getReferralStats,
  getReferralBoard,
  getReferrals,
  getReferralById,
  updateReferralStatus,
  exportReferrals,
} from "../controllers/adminReferralController.js";

const router = express.Router();

router.get("/stats", protect, adminPanelAccess, getReferralStats);
router.get("/board", protect, adminPanelAccess, getReferralBoard);
router.get("/export", protect, adminPanelAccess, exportReferrals);
router.get("/", protect, adminPanelAccess, getReferrals);
router.get("/:id", protect, adminPanelAccess, getReferralById);
router.patch("/:id/status", protect, adminPanelAccess, updateReferralStatus);


export default router;
