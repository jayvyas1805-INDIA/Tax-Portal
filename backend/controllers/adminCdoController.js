import Admin from "../models/Admin.js";
import Partner from "../models/Partner.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toCdoDto = (cdo) => ({
  id: cdo._id,
  name: cdo.name,
  email: cdo.email,
  role: cdo.role,
  isActive: cdo.isActive,
  lastLogin: cdo.lastLogin,
  createdAt: cdo.createdAt,
});

/**
 * POST /api/admin/cdos
 * Body: { name, email, password, confirmPassword }
 * Super admin registers a new Admin CDO. This is NOT the partner-invite flow:
 * the account is created immediately and the CDO signs in from the normal
 * login page with the credentials the admin sets here.
 */
export const createCdo = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Enter a valid email address." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password must match.",
      });
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include a letter and a number.",
      });
    }

    // Login checks the Admin collection first and then Partner, so an email
    // that exists in either one would make sign-in ambiguous.
    const [existingAdmin, existingPartner] = await Promise.all([
      Admin.findOne({ email: normalizedEmail }).select("_id"),
      Partner.findOne({ email: normalizedEmail }).select("_id"),
    ]);

    if (existingAdmin || existingPartner) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Plain password here — the Admin model's pre-save hook hashes it once.
    const cdo = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "admin_cdo",
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: `Admin CDO account created for ${cdo.email}.`,
      data: toCdoDto(cdo),
    });
  } catch (error) {
    console.error("createCdo error ->", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the Admin CDO.",
    });
  }
};

/**
 * GET /api/admin/cdos
 */
export const getCdos = async (req, res) => {
  try {
    const cdos = await Admin.find({ role: "admin_cdo" }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: cdos.map(toCdoDto),
    });
  } catch (error) {
    console.error("getCdos error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching Admin CDOs.",
    });
  }
};

/**
 * PATCH /api/admin/cdos/:id/status
 * Body: { isActive: boolean }
 * Deactivating also revokes the CDO's refresh token, so they are signed out
 * as soon as their current access token is rejected.
 */
export const updateCdoStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const cdo = await Admin.findOne({ _id: req.params.id, role: "admin_cdo" });

    if (!cdo) {
      return res.status(404).json({ success: false, message: "Admin CDO not found." });
    }

    cdo.isActive = isActive;
    if (!isActive) cdo.refreshTokenHash = undefined;
    await cdo.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: isActive ? "Admin CDO activated." : "Admin CDO deactivated.",
      data: toCdoDto(cdo),
    });
  } catch (error) {
    // Invalid ObjectId in the URL
    if (error.name === "CastError") {
      return res.status(404).json({ success: false, message: "Admin CDO not found." });
    }

    console.error("updateCdoStatus error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the Admin CDO.",
    });
  }
};
