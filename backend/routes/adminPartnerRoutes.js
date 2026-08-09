import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
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
router.get("/stats", protect, adminOnly, getPartnerStats);
router.get("/export", protect, adminOnly, exportPartners);
router.get("/", protect, adminOnly, getPartners);
router.get("/:id", protect, adminOnly, getPartnerById);
router.patch("/:id/status", protect, adminOnly, updatePartnerAccountStatus);
router.patch("/:id/kyc/:docType", protect, adminOnly, updateKycDocumentStatus);
router.patch("/:id/banking", protect, adminOnly, updateBankingVerification);
router.patch("/:id/application-status", protect, adminOnly, updateApplicationStatus);

export default router;
