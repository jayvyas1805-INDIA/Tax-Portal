import Notification from "../models/Notification.js";

/**
 * GET /api/partner/notifications?category=all|referrals|commission|system&page=&pageSize=
 * Supports "Load Older Notifications" via page-based pagination — the
 * frontend appends each page's results to what it already has.
 */
export const getNotifications = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { category } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.max(1, parseInt(req.query.pageSize, 10) || 5);

    const query = { partnerId };
    if (category && category !== "all") {
      query.category = category;
    }

    const [notifications, totalItems, totalUnreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      Notification.countDocuments(query),
      Notification.countDocuments({ partnerId, isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      notifications,
      totalItems,
      hasMore: page * pageSize < totalItems,
      currentPage: page,
      totalUnreadCount,
    });
  } catch (error) {
    console.error("getNotifications error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your notifications.",
    });
  }
};

/**
 * PUT /api/partner/notifications/mark-all-read
 * Marks every notification as read, regardless of which tab is active.
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { partnerId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    console.error("markAllAsRead error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating your notifications.",
    });
  }
};

/**
 * PUT /api/partner/notifications/:id/read
 * Marks a single notification as read (e.g. when the person clicks it).
 */
export const markOneAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, partnerId: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("markOneAsRead error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating this notification.",
    });
  }
};
