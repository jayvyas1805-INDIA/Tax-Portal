import apiClient from "./apiClient";

/**
 * GET /api/admin/notifications/stats
 * Stat cards: New Partners, Pending Verif., Approvals, All Unread
 */
export const getNotificationStats = async () => {
  const { data } = await apiClient.get("/admin/notifications/stats");
  return data.data;
};

/**
 * GET /api/admin/notifications?tab=&page=&limit=
 */
export const getNotifications = async ({ tab, page, limit } = {}) => {
  const { data } = await apiClient.get("/admin/notifications", {
    params: { tab, page, limit },
  });
  return data; // { success, data, pagination }
};

/**
 * PATCH /api/admin/notifications/:id/read
 */
export const markOneAsRead = async (id) => {
  const { data } = await apiClient.patch(`/admin/notifications/${id}/read`);
  return data.data;
};

/**
 * PATCH /api/admin/notifications/mark-all-read
 */
export const markAllAsRead = async () => {
  const { data } = await apiClient.patch("/admin/notifications/mark-all-read");
  return data;
};

/**
 * DELETE /api/admin/notifications/history
 * Clears every already-read notification.
 */
export const clearHistory = async () => {
  const { data } = await apiClient.delete("/admin/notifications/history");
  return data;
};
