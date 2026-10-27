import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  createCdo,
  getCdos,
  updateCdoStatus,
} from "../controllers/adminCdoController.js";

const router = express.Router();

// Super admin only — a CDO can never create or manage other CDOs.
router.get("/", protect, adminOnly, getCdos);
router.post("/", protect, adminOnly, createCdo);
router.patch("/:id/status", protect, adminOnly, updateCdoStatus);

export default router;
