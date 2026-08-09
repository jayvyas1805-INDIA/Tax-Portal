import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getReviewStats,
  getReviews,
  createReview,
  respondToReview,
  flagReview,
  updateReviewStatus,
  exportReviews,
} from "../controllers/adminReviewController.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getReviewStats);
router.get("/export", protect, adminOnly, exportReviews);
router.get("/", protect, adminOnly, getReviews);
router.post("/", protect, adminOnly, createReview);
router.patch("/:id/respond", protect, adminOnly, respondToReview);
router.patch("/:id/flag", protect, adminOnly, flagReview);
router.patch("/:id/status", protect, adminOnly, updateReviewStatus);

export default router;
