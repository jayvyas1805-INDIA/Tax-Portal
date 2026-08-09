import apiClient from "./apiClient";

/**
 * GET /api/partner/notifications?category=all|referrals|commission|system&page=&pageSize=
 */
export const getNotifications = async (category, page, pageSize) => {
  const { data } = await apiClient.get("/partner/notifications", {
    params: { category, page, pageSize },
  });
  return data;
};

/**
 * PUT /api/partner/notifications/mark-all-read
 */
export const markAllAsRead = async () => {
  const { data } = await apiClient.put("/partner/notifications/mark-all-read");
  return data;
};

/**
 * PUT /api/partner/notifications/:id/read
 */
export const markOneAsRead = async (id) => {
  const { data } = await apiClient.put(`/partner/notifications/${id}/read`);
  return data;
};
