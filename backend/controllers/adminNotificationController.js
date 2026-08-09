import AdminNotification from "../models/AdminNotification.js";
import Partner from "../models/Partner.js";
import Commission from "../models/Commission.js";
import { TAB_TO_CATEGORY, NOTIFICATION_CATEGORY } from "../utils/notificationCategories.js";
import { formatRelativeTime } from "../utils/formatRelativeTime.js";

const CATEGORY_BY_TAB = {
  "All Notifications": null,
  "Critical Alerts": "critical",
  "Partner Updates": "partner",
  Financial: "financial",
};

const getRelativeTime = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
};

const toClientShape = (doc) => ({
  id: doc._id.toString(),
  icon: doc.icon,
  title: doc.title,
  detail: doc.detail,
  time: formatRelativeTime(doc.createdAt),
  unread: !doc.isRead,
  category: doc.category,
});


/**
 * GET /api/admin/notifications/stats
 * Stat cards: New Partners, Pending Verif., Approvals, All Unread
 * (First 3 are drawn from the real underlying entities so they stay accurate
 * even if a notification is missed/deleted; the last is the actual unread count.)
 */
export const getNotificationStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const allUnread = await AdminNotification.countDocuments({ isRead: false });

    const [newPartners, pendingVerification, pendingApprovals] = await Promise.all([
      Partner.countDocuments({ status: "new" }),
      Partner.countDocuments({ kycStatus: "pending" }),
      Partner.countDocuments({ status: "pending_approval" }),
    ]);

    return res.json({
      success: true,
      newPartners,
      pendingVerification,
      pendingApprovals,
      allUnread,
    });
  } catch (error) {
    console.error("getNotificationStats failed ->", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stats." });
  }
};


/**
 * GET /api/admin/notifications?tab=All Notifications|Critical Alerts|Partner Updates|Financial&page=&limit=
 */
export const getNotifications = async (req, res) => {
   try {
     const { tab = "All Notifications", page = 1, limit = 10 } = req.query;
 
     if (!(tab in TAB_TO_CATEGORY)) {
       return res.status(400).json({ success: false, message: `Unknown tab: ${tab}` });
     }
 
     const category = TAB_TO_CATEGORY[tab];
     const filter = category ? { category } : {};
 
     const pageNum = Math.max(1, parseInt(page, 10) || 1);
     const limitNum = Math.max(1, parseInt(limit, 10) || 10);
     const skip = (pageNum - 1) * limitNum;
 
     const [docs, total] = await Promise.all([
       AdminNotification.find(filter)
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limitNum)
         .lean(),
       AdminNotification.countDocuments(filter),
     ]);
 
     return res.json({
       success: true,
       data: docs.map(toClientShape),
       pagination: {
         total,
         page: pageNum,
         totalPages: Math.max(1, Math.ceil(total / limitNum)),
       },
     });
   } catch (error) {
     console.error("getNotifications failed ->", error);
     return res.status(500).json({ success: false, message: "Failed to fetch notifications." });
   }
 };


/**
 * PATCH /api/admin/notifications/:id/read
 */
export const markOneAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await AdminNotification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    return res.json({ success: true, data: toClientShape(updated) });
  } catch (error) {
    console.error("markOneAsRead failed ->", error);
    return res.status(500).json({ success: false, message: "Failed to mark as read." });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await AdminNotification.updateMany({ isRead: false }, { isRead: true });
    return res.json({ success: true });
  } catch (error) {
    console.error("markAllAsRead failed ->", error);
    return res.status(500).json({ success: false, message: "Failed to mark all as read." });
  }
};

// Matches the frontend comment: "Read notifications are gone server-side"
// i.e. Clear History deletes only already-read notifications, unread stay.
export const clearHistory = async (req, res) => {
  try {
    await AdminNotification.deleteMany({ isRead: true });
    return res.json({ success: true });
  } catch (error) {
    console.error("clearHistory failed ->", error);
    return res.status(500).json({ success: false, message: "Failed to clear history." });
  }
};