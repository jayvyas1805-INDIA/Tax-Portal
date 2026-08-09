import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getCommissionRules,
  createCommissionRule,
  updateCommissionRule,
  getQuarterlyForecast,
  getSystemConfig,
  updateSystemConfig,
  recalculateAllTiers,
} from "../controllers/adminSettingsController.js";
import { getTemplates, updateTemplate } from "../controllers/templateController.js";


const router = express.Router();

router.get("/commission-rules", protect, adminOnly, getCommissionRules);
router.post("/commission-rules", protect, adminOnly, createCommissionRule);
router.patch("/commission-rules/:id", protect, adminOnly, updateCommissionRule);

router.get("/forecast", protect, adminOnly, getQuarterlyForecast);

router.get("/system-config", protect, adminOnly, getSystemConfig);
router.patch("/system-config", protect, adminOnly, updateSystemConfig);
// in your admin settings routes file
router.post("/recalculate-tiers", protect, adminOnly, recalculateAllTiers);


router.get("/settings/templates", getTemplates);
router.patch("/settings/templates/:key/:channel", updateTemplate);

export default router;
