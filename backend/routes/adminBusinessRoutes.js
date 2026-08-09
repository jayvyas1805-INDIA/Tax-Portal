import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getBusinessStats,
  getBusinessRegister,
  getClientLifecycle,
} from "../controllers/adminBusinessController.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getBusinessStats);
router.get("/register", protect, adminOnly, getBusinessRegister);
router.get("/lifecycle", protect, adminOnly, getClientLifecycle);

export default router;
