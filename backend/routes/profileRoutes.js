// routes/profileRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { profileImageUpload } from "../middleware/upload.js";
import { getProfile,updateProfile,uploadProfilePhoto,getProfileCompletion} from "../controllers/profileController.js";

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.get("/profile-completion",protect, getProfileCompletion);

router.patch(
    "/photo",
    protect,
    profileImageUpload,
    uploadProfilePhoto
);

export default router;