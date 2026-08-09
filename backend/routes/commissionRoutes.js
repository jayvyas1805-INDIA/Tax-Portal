import express from "express";
import {
  getCommissionSummary,
  getTransactions,
  exportTransactions,
  requestWithdrawal,
} from "../controllers/commissionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();



router.get("/summary",protect, getCommissionSummary);
router.get("/transactions",protect, getTransactions);
router.get("/export",protect, exportTransactions);
router.post("/withdraw",  protect,requestWithdrawal);

export default router;
