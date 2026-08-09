import apiClient from "./apiClient";

/**
 * GET /api/admin/referrals/stats
 * Footer stat cards: Conversion Rate, Active Partners, Avg. Deal Value, Pipeline Value
 */
export const getReferralStats = async () => {
  const { data } = await apiClient.get("/admin/referrals/stats");
  return data.data;
};

/**
 * GET /api/admin/referrals/board?limitPerColumn=
 * Kanban board grouped by status
 */
export const getReferralBoard = async (limitPerColumn) => {
  const { data } = await apiClient.get("/admin/referrals/board", {
    params: { limitPerColumn },
  });
  return data.data;
};

/**
 * GET /api/admin/referrals?status=&search=&page=&limit=
 * Referral list table (with pagination)
 */
export const getReferrals = async ({ status, search, page, limit } = {}) => {
  const { data } = await apiClient.get("/admin/referrals", {
    params: { status, search, page, limit },
  });
  return data; // { success, data, pagination }
};

/**
 * GET /api/admin/referrals/:id
 */
export const getReferralById = async (id) => {
  const { data } = await apiClient.get(`/admin/referrals/${id}`);
  return data.data;
};

/**
 * PATCH /api/admin/referrals/:id/status
 */
export const updateReferralStatus = async (id, status) => {
  const { data } = await apiClient.patch(`/admin/referrals/${id}/status`, {
    status,
  });
  return data.data;
};
