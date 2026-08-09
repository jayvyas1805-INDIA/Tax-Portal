import Notification from "../models/Notification.js";
import Partner from "../models/Partner.js";

/**
 * Create notification for one partner.
 */
export const createNotification = async (
  partnerId,
  { icon, title, description, category }
) => {
  try {
    await Notification.create({
      partnerId,
      icon,
      title,
      description,
      category,
    });
  } catch (error) {
    console.error("createNotification failed ->", error);
  }
};

/**
 * Create notification for all partners.
 */
export const notifyAllPartners = async ({
  icon = "⚙️",
  title,
  description,
  category = "system",
}) => {
  try {
    const partners = await Partner.find({}, "_id");

    if (!partners.length) return;

    const notifications = partners.map((partner) => ({
      partnerId: partner._id,
      icon,
      title,
      description,
      category,
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("notifyAllPartners failed ->", error);
  }
};

/**
 * Create notification only for partners belonging
 * to the specified commission tier.
 */
export const notifyPartnersByTier = async ({
  tier,
  icon = "💰",
  title,
  description,
  category = "commission",
}) => {
  try {
    const partners = await Partner.find(
      { tier },
      "_id"
    );

    if (!partners.length) return;

    const notifications = partners.map((partner) => ({
      partnerId: partner._id,
      icon,
      title,
      description,
      category,
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("notifyPartnersByTier failed ->", error);
  }
};

export default createNotification;