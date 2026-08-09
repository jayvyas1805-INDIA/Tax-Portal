import Partner from "../models/Partner.js";

const DEFAULT_COMMUNICATION_PREFS = {
  emailNotifications: true,
  smsNotifications: true,
  whatsappNotifications: true,
  marketingEmails: false,
};

/**
 * GET /api/partner/settings
 * Protected — returns everything the Account Settings page needs.
 */
export const getSettings = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id);

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    return res.status(200).json({
      success: true,
      settings: {
        email: partner.email,
        partnerId: partner.registration?.referenceNumber || partner._id,
        fullName: partner.personalInfo?.fullName || "",
        lastPasswordChanged: partner.settings?.security?.lastPasswordChanged || null,
        communication: partner.settings?.communication || DEFAULT_COMMUNICATION_PREFS,
        accessControl: {
          activeSessions: partner.settings?.accessControl?.activeSessions ?? 1,
          loginHistory: partner.settings?.accessControl?.loginHistory || [],
        },
        createdAt: partner.createdAt,
      },
    });
  } catch (error) {
    console.error("getSettings error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your settings.",
    });
  }
};

/**
 * PUT /api/partner/settings/password
 * Body: { currentPassword, newPassword, confirmPassword }
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password, new password, and confirmation are all required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    const partner = await Partner.findById(req.user.id).select("+password");

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    const isMatch = await partner.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    partner.password = newPassword; // pre-save hook re-hashes
    partner.settings = partner.settings || {};
    partner.settings.security = { lastPasswordChanged: new Date() };
    await partner.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
      lastPasswordChanged: partner.settings.security.lastPasswordChanged,
    });
  } catch (error) {
    console.error("changePassword error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating your password.",
    });
  }
};

/**
 * PUT /api/partner/settings/communication
 * Body: { emailNotifications, smsNotifications, whatsappNotifications, marketingEmails }
 */
export const updateCommunicationPreferences = async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, whatsappNotifications, marketingEmails } = req.body;

    const partner = await Partner.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          "settings.communication.emailNotifications": Boolean(emailNotifications),
          "settings.communication.smsNotifications": Boolean(smsNotifications),
          "settings.communication.whatsappNotifications": Boolean(whatsappNotifications),
          "settings.communication.marketingEmails": Boolean(marketingEmails),
        },
      },
      { new: true, runValidators: true }
    );

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Communication preferences updated.",
      communication: partner.settings.communication,
    });
  } catch (error) {
    console.error("updateCommunicationPreferences error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating your preferences.",
    });
  }
};
