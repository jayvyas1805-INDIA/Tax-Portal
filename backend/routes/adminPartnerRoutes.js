import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminPanelAccess } from "../middleware/adminMiddleware.js";
import {
  getPartnerStats,
  getPartners,
  getPartnerById,
  updatePartnerAccountStatus,
  updateKycDocumentStatus,
  updateBankingVerification,
  updateApplicationStatus,
  exportPartners,
} from "../controllers/adminPartnerController.js";

const router = express.Router();

// NOTE: /stats and /export must come before the /:id param route, or Express
// will treat "stats"/"export" as an :id value.
router.get("/stats", protect, adminPanelAccess, getPartnerStats);
router.get("/export", protect, adminPanelAccess, exportPartners);
router.get("/", protect, adminPanelAccess, getPartners);
router.get("/:id", protect, adminPanelAccess, getPartnerById);
router.patch("/:id/status", protect, adminPanelAccess, updatePartnerAccountStatus);
router.patch("/:id/kyc/:docType", protect, adminPanelAccess, updateKycDocumentStatus);
router.patch("/:id/banking", protect, adminPanelAccess, updateBankingVerification);
router.patch("/:id/application-status", protect, adminPanelAccess, updateApplicationStatus);

export default router;
