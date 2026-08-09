import express from "express";
import {
  registerPartner,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logout,
  verifyEmail,
  invitePartner,
  validateInviteToken,
} from "../controllers/authController.js";
import { partnerRegistrationUpload } from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.post("/partner/register", partnerRegistrationUpload, registerPartner);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh-token", refreshAccessToken);
router.get("/verify-email/:token", verifyEmail);
router.post("/invite",protect, adminOnly, invitePartner);
router.get("/invite/:token", validateInviteToken); // public — used on the registration page

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
