import express from "express";
import {
  getNotifications,
  markAllAsRead,
  markOneAsRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();



router.get("/",  protect, getNotifications);
router.put("/mark-all-read", protect, markAllAsRead);
router.put("/:id/read", protect, markOneAsRead);

export default router;
