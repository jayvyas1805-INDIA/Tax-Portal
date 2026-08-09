import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getNotificationStats,
  getNotifications,
  markOneAsRead,
  markAllAsRead,
  clearHistory,
} from "../controllers/adminNotificationController.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getNotificationStats);
router.get("/", protect, adminOnly, getNotifications);
router.patch("/mark-all-read", protect, adminOnly, markAllAsRead);
router.patch("/:id/read", protect, adminOnly, markOneAsRead);
router.delete("/history", protect, adminOnly, clearHistory);

export default router;
