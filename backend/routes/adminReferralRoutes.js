import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getReferralStats,
  getReferralBoard,
  getReferrals,
  getReferralById,
  updateReferralStatus,
  exportReferrals,
} from "../controllers/adminReferralController.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getReferralStats);
router.get("/board", protect, adminOnly, getReferralBoard);
router.get("/export", protect, adminOnly, exportReferrals);
router.get("/", protect, adminOnly, getReferrals);
router.get("/:id", protect, adminOnly, getReferralById);
router.patch("/:id/status", protect, adminOnly, updateReferralStatus);


export default router;
