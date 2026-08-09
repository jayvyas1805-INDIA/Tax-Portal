import express from "express";
import { getBankDetails, updateBankDetails } from "../controllers/bankDetailsController.js";
import { cancelledChequeUpload } from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();



router.get("/", protect,getBankDetails);
router.put("/", protect, cancelledChequeUpload, updateBankDetails);

export default router;
