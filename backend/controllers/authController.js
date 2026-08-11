import crypto from "crypto";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Partner from "../models/Partner.js";
import generateToken from "../utils/generateToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import sendEmail from "../utils/sendEmail.js";
import createAdminNotification from "../utils/createAdminNotification.js";
import { NOTIFICATION_CATEGORY } from "../utils/notificationCategories.js";
// import createAdminNotification from "../utils/createAdminNotification.js";
import { UAParser } from 'ua-parser-js'
import dotenv from "dotenv";
dotenv.config();
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

/**
 * POST /api/auth/partner/register
 * Multipart form-data: all Step 1-7 fields + panCardFile, aadhaarCardFile, passportPhotoFile
 */
export const registerPartner = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      emailAddress,
      dateOfBirth,
      gender,
      password,
      confirmPassword,
      occupation,
      companyName,
      experienceYears,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      panNumber,
      aadhaarNumber,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      accountType,
      agreedToTerms,
      agreedToTermsConditions,
      agreedToPrivacyPolicy,
    } = req.body;

    if (!password || password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password must match.",
      });
    }

    const existingPartner = await Partner.findOne({ email: emailAddress });
    if (existingPartner) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Upload KYC files to Cloudinary (if provided) — allSettled so we can
    // report exactly which file failed instead of one generic 500.
    const files = req.files || {};
    const uploadJobs = [
      { key: "panCardFile", label: "PAN Card", folder: "pan-card" },
      { key: "aadhaarCardFile", label: "Aadhaar Card", folder: "aadhaar-card" },
      { key: "passportPhotoFile", label: "Passport Photo", folder: "passport-photo" },
    ];

    const uploadResults = await Promise.allSettled(
      uploadJobs.map((job) =>
        files[job.key]?.[0]
          ? uploadToCloudinary(files[job.key][0].buffer, "kyc", job.folder)
          : Promise.resolve("")
      )
    );

    const failedUploads = uploadResults
      .map((result, index) => ({ result, job: uploadJobs[index] }))
      .filter(({ result, job }) => files[job.key]?.[0] && result.status === "rejected")
      .map(({ job }) => job.label);

    if (failedUploads.length > 0) {
      console.error("Cloudinary upload failed for:", failedUploads);
      return res.status(502).json({
        success: false,
        message: `We couldn't upload: ${failedUploads.join(", ")}. Please go back to the KYC step, re-select the file(s), and try again.`,
        failedUploads,
      });
    }

    const [panCardFileUrl, aadhaarCardFileUrl, passportPhotoFileUrl] = uploadResults.map(
      (result) => (result.status === "fulfilled" ? result.value : "")
    );

    const referenceNumber = `TP-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;

    const rawVerificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = hashToken(rawVerificationToken);

    const partner = await Partner.create({
      email: emailAddress,
      password,
      personalInfo: { fullName, mobileNumber, dateOfBirth, gender },
      professionalInfo: { occupation, companyName, experienceYears },
      addressInfo: { addressLine1, addressLine2, city, state, pincode },
      kycInfo: {
        panNumber,
        aadhaarNumber,
        panCard: { fileUrl: panCardFileUrl, submittedAt: new Date() },
        aadhaarCard: { fileUrl: aadhaarCardFileUrl, submittedAt: new Date() },
        photo: { fileUrl: passportPhotoFileUrl, submittedAt: new Date() },
        history: [
          panCardFileUrl && {
            documentType: "PAN Card Copy",
            fileUrl: panCardFileUrl,
            status: "pending",
            submittedAt: new Date(),
          },
          aadhaarCardFileUrl && {
            documentType: "Aadhaar Front & Back",
            fileUrl: aadhaarCardFileUrl,
            status: "pending",
            submittedAt: new Date(),
          },
          passportPhotoFileUrl && {
            documentType: "Live Photograph",
            fileUrl: passportPhotoFileUrl,
            status: "pending",
            submittedAt: new Date(),
          },
        ].filter(Boolean),
      },
      bankingInfo: { accountHolderName, bankName, accountNumber, ifscCode, accountType },
      agreement: {
        agreedToTerms: agreedToTerms === "true" || agreedToTerms === true,
        agreedToTermsConditions: agreedToTermsConditions === "true" || agreedToTermsConditions === true,
        agreedToPrivacyPolicy: agreedToPrivacyPolicy === "true" || agreedToPrivacyPolicy === true,
        agreedAt: new Date(),
      },
      registration: { referenceNumber },
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Fire off the verification email — non-blocking for the registration
    // flow itself (login isn't gated on this), just informational.
    const verificationUrl = `${process.env.FRONTEND_DEV_URL}/verify-email/${rawVerificationToken}`;
    // sendEmail({
    //   to: partner.email,
    //   subject: "Verify your email — TaxPartner Portal",
    //   html: `
    //     <p>Welcome, ${fullName}!</p>
    //     <p>Please verify your email to secure your partner account.</p>
    //     <p><a href="${verificationUrl}">Click here to verify your email</a></p>
    //     <p>This link expires in 24 hours.</p>
    //   `,
    // }).catch((err) => console.error("Verification email failed to send ->", err));

    
    const token = generateToken(partner);
    const refreshToken = generateRefreshToken(partner);
    partner.refreshTokenHash = hashToken(refreshToken);
    await partner.save({ validateBeforeSave: false });
    
    createAdminNotification({
      icon: "🧑‍💼",
      title: "New partner registered",
      detail: `${partner.name} (${partner.email}) just signed up.`,
      category: NOTIFICATION_CATEGORY.PARTNER,
      relatedPartnerId: partner._id,
    });
  

    return res.status(201).json({
      success: true,
      message: "Registration submitted successfully.",
      token,
      refreshToken,
      referenceNumber,
      user: {
        id: partner._id,
        email: partner.email,
        fullName: partner.personalInfo.fullName,
        role: partner.role,
        isEmailVerified: partner.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("registerPartner error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while submitting your registration.",
    });
  }
};

/**
 * POST /api/auth/login
 * Single login endpoint for both Admin and Partner.
 * Checks Admin collection first, then falls back to Partner collection.
 */
export const login = async (req, res) => {

  try {

    const userAgent = req.headers["user-agent"] || "";



    const parser = new UAParser(userAgent);



    const os = parser.getOS();

    const browser = parser.getBrowser();



    const device = `${os.name || "Unknown"} ${os.version || ""} • ${browser.name || "Browser"

      } ${browser.major || ""}`.trim();

    const { email, password } = req.body;



    if (!email || !password) {

      return res.status(400).json({

        success: false,

        message: "Email and password are required.",

      });

    }



    // 1. Check Admin collection first

    const admin = await Admin.findOne({ email }).select("+password");

    if (admin) {

      const isMatch = await admin.comparePassword(password);

      if (!isMatch) {

        return res.status(401).json({ success: false, message: "Invalid email or password." });

      }



      admin.lastLogin = new Date();



      const token = generateToken(admin);

      const refreshToken = generateRefreshToken(admin);

      admin.refreshTokenHash = hashToken(refreshToken);

      await admin.save({ validateBeforeSave: false });



      return res.status(200).json({

        success: true,

        token,

        refreshToken,

        role: "admin",

        redirectTo: "/admin/dashboard",

        user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },

      });

    }



    // 2. Fall back to Partner collection — match by email OR mobile number

    const partner = await Partner.findOne({

      $or: [{ email }, { "personalInfo.mobileNumber": email }],

    }).select("+password");

    if (partner) {

      const isMatch = await partner.comparePassword(password);

      if (!isMatch) {

        return res.status(401).json({ success: false, message: "Invalid email or password." });

      }



      partner.lastLogin = new Date();



      partner.settings = partner.settings || {};

      partner.settings.accessControl = partner.settings.accessControl || {

        activeSessions: 0,

        loginHistory: [],

      };

      partner.settings.accessControl.loginHistory.unshift({

        loginAt: new Date(),

        ipAddress: req.ip,

        device,

      });

      // Keep only the 10 most recent entries

      partner.settings.accessControl.loginHistory =

        partner.settings.accessControl.loginHistory.slice(0, 10);

      partner.settings.accessControl.activeSessions =

        (partner.settings.accessControl.activeSessions || 0) + 1;



      const token = generateToken(partner);

      const refreshToken = generateRefreshToken(partner);

      partner.refreshTokenHash = hashToken(refreshToken);

      await partner.save({ validateBeforeSave: false });



      return res.status(200).json({

        success: true,

        token,

        refreshToken,

        role: "partner",

        redirectTo: "/partner-dashboard",

        user: {

          id: partner._id,

          email: partner.email,

          fullName: partner.personalInfo.fullName,

          role: partner.role,

          applicationStatus: partner.registration.applicationStatus,

          isEmailVerified: partner.isEmailVerified,

        },

      });

    }



    // 3. Neither collection matched — generic message, don't reveal which

    return res.status(401).json({ success: false, message: "Invalid email or password." });

  } catch (error) {

    console.error("login error ->", error);

    return res.status(500).json({

      success: false,

      message: "Something went wrong while logging in.",

    });

  }

};

/**
 * GET /api/auth/me
 * Protected — returns the currently logged-in Admin or Partner.
 */
export const getMe = async (req, res) => {
  try {
    const { id, role } = req.user;

    const Model = role === "admin" ? Admin : Partner;
    const user = await Model.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("getMe error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your profile.",
    });
  }
};

/**
 * POST /api/auth/forgot-password
 * Body: { email } — works for both Admin and Partner accounts.
 * Always responds with the same generic message, whether or not the
 * email matched anything, so we don't leak which emails are registered.
 */
export const forgotPassword = async (req, res) => {
  const genericResponse = {
    success: true,
    message: "If an account exists with that email, a password reset link has been sent.",
  };

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const admin = await Admin.findOne({ email });
    const user = admin || (await Partner.findOne({ email }));

    if (!user) {
      // Don't reveal whether the email exists — respond as if it worked.
      return res.status(200).json(genericResponse);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_DEV_URL}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your TaxPartner Portal password",
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 30 minutes. If you didn't request this, you can ignore this email.</p>
      `,
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("forgotPassword error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

/**
 * POST /api/auth/reset-password/:token
 * Body: { newPassword, confirmPassword }
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password must match.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const query = {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    };

    const admin = await Admin.findOne(query).select("+resetPasswordToken +resetPasswordExpires");
    const user = admin || (await Partner.findOne(query).select("+resetPasswordToken +resetPasswordExpires"));

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("resetPassword error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

/**
 * POST /api/auth/refresh-token
 * Body: { refreshToken }
 * Verifies the refresh token, checks it against the hash stored on the
 * user document (so a logged-out/revoked token can't be reused), then
 * issues a brand new access token AND rotates the refresh token.
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token is required." });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: "Refresh token is invalid or expired." });
    }

    const Model = decoded.role === "admin" ? Admin : Partner;
    const user = await Model.findById(decoded.id).select("+refreshTokenHash");

    if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: "Refresh token has been revoked. Please log in again.",
      });
    }

    // Rotate: issue a new refresh token and invalidate the old one
    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("refreshAccessToken error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while refreshing your session.",
    });
  }
};

/**
 * POST /api/auth/logout
 * Protected — invalidates the stored refresh token so it can't be reused.
 */
export const logout = async (req, res) => {
  try {
    const { id, role } = req.user;
    const Model = role === "admin" ? Admin : Partner;

    const update = { $unset: { refreshTokenHash: 1 } };
    if (role === "partner") {
      update.$inc = { "settings.accessControl.activeSessions": -1 };
    }

    await Model.findByIdAndUpdate(id, update);

    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("logout error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging out.",
    });
  }
};

/**
 * GET /api/auth/verify-email/:token
 * Partner-only — marks the account's email as verified.
 * Not required to log in; purely informational/trust-building for now.
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = hashToken(token);

    const partner = await Partner.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!partner) {
      return res.status(400).json({
        success: false,
        message: "This verification link is invalid or has expired.",
      });
    }

    partner.isEmailVerified = true;
    partner.emailVerificationToken = undefined;
    partner.emailVerificationExpires = undefined;
    await partner.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    console.error("verifyEmail error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying your email.",
    });
  }
};


// controllers/partnerInviteController.js
import PartnerInvite from "../models/PartnerInvite.js";
// import Partner from "../models/Partner.js";
// import { sendEmail } from "../utils/sendEmail.js";

const INVITE_EXPIRY_DAYS = 7;

export const invitePartner = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid email address." });
    }

    // Don't invite someone who's already a partner
    const existingPartner = await Partner.findOne({ email: email.toLowerCase() });
    if (existingPartner) {
      return res.status(409).json({ success: false, message: "This email is already a registered partner." });
    }

    const token = PartnerInvite.generateToken();
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const invite = await PartnerInvite.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      token,
      expiresAt,
      invitedBy: req.user?._id, // requires auth middleware to populate req.user
    });

    const registrationLink = `${process.env.FRONTEND_URL}/partner-registration?token=${invite.token}`;

    await sendEmail({
      to: invite.email,
      subject: "You're invited to join PartnerPortal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Hi ${invite.name},</h2>
          <p>You've been invited to join PartnerPortal as a partner.</p>
          <p>Click below to complete your registration:</p>
          <p style="margin: 24px 0;">
            <a href="${registrationLink}" target="_blank" rel="noopener noreferrer"
               style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">
              Complete Registration
            </a>
          </p>
          <p style="color:#666;font-size:13px;">This link expires in ${INVITE_EXPIRY_DAYS} days.
          If you weren't expecting this invite, you can ignore this email.</p>
        </div>
      `,
    });

    return res.status(201).json({
      success: true,
      message: `Invite sent to ${invite.email}.`,
      invite: { id: invite._id, name: invite.name, email: invite.email, expiresAt: invite.expiresAt },
    });
  } catch (error) {
    console.error("invitePartner failed ->", error);

    // Duplicate token is astronomically unlikely, but duplicate pending invite to same email is realistic
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "An invite is already pending for this email." });
    }

    return res.status(500).json({ success: false, message: "Failed to send invite." });
  }
};

// Used by the actual partner registration page to validate the token
// before showing the signup form.
export const validateInviteToken = async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await PartnerInvite.findOne({ token });

    if (!invite) {
      return res.status(404).json({ success: false, message: "Invalid invite link." });
    }
    if (invite.status !== "pending") {
      return res.status(410).json({ success: false, message: "This invite has already been used." });
    }
    if (invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();
      return res.status(410).json({ success: false, message: "This invite link has expired." });
    }

    return res.json({ success: true, invite: { name: invite.name, email: invite.email } });
  } catch (error) {
    console.error("validateInviteToken failed ->", error);
    return res.status(500).json({ success: false, message: "Failed to validate invite." });
  }
};