import express from "express";
import { getKycStatus, resubmitKycDocuments } from "../controllers/kycController.js";
import { kycDocumentsUpload } from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();



router.get("/", protect,getKycStatus);
router.put("/", protect,kycDocumentsUpload, resubmitKycDocuments);

export default router;
