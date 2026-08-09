import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getCommissionStats,
  getCommissions,
  getPayoutVelocity,
  updateCommissionStatus,
  exportCommissions,
} from "../controllers/adminCommissionController.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getCommissionStats);
router.get("/payout-velocity", protect, adminOnly, getPayoutVelocity);
router.get("/export", protect, adminOnly, exportCommissions);
router.get("/", protect, adminOnly, getCommissions);
router.patch("/:id/status", protect, adminOnly, updateCommissionStatus);

export default router;
