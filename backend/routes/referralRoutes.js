import express from "express";
import {
  createReferral,
  getReferrals,
  exportReferrals,
} from "../controllers/referralController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect ,createReferral);
router.get("/", protect ,getReferrals);
router.get("/export", protect ,exportReferrals);

export default router;
