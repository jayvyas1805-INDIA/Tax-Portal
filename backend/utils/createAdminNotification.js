import AdminNotification from "../models/AdminNotification.js";

/**
 * Fire-and-forget admin notification creation — used by other controllers
 * when something admin-worthy happens (new partner registration, KYC
 * submission, new referral, commission batch ready, etc.). Failures here
 * are logged but never allowed to break the calling request.
 */



const createAdminNotification = async ({
  icon,
  title,
  detail,
  category,
  relatedPartnerId,
  relatedReferralId,
}) => {
  try {
    await AdminNotification.create({
      icon,
      title,
      detail,
      category,
      relatedPartnerId,
      relatedReferralId,
    });
  } catch (error) {
    console.error("createAdminNotification failed ->", error);
  }
};

export default createAdminNotification;
