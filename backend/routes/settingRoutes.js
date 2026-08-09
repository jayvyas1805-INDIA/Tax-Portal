import express from "express";
import {
  getSettings,
  changePassword,
  updateCommunicationPreferences,
} from "../controllers/settingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();



router.get("/", protect, getSettings);
router.put("/password", protect, changePassword);
router.put("/communication", protect, updateCommunicationPreferences);

export default router;
