import apiClient from "./apiClient";

/**
 * GET /api/admin/commissions/stats
 * Stat cards: Total Commission Generated, Total Paid, Pending Approval, Pending Payment
 */
export const getCommissionStats = async () => {
  const { data } = await apiClient.get("/admin/commissions/stats");
  return data.data;
};

/**
 * GET /api/admin/commissions?tab=All|Due&page=&limit=
 * Pending Processing table
 */
export const getCommissions = async ({ tab, page, limit } = {}) => {
  const { data } = await apiClient.get("/admin/commissions", {
    params: { tab, page, limit },
  });
  return data; // { success, data, pagination }
};

/**
 * GET /api/admin/commissions/payout-velocity?days=
 * Daily Pending vs Paid amount, for the bar chart
 */
export const getPayoutVelocity = async (days) => {
  const { data } = await apiClient.get("/admin/commissions/payout-velocity", {
    params: { days },
  });
  return data.data;
};

/**
 * PATCH /api/admin/commissions/:id/status
 * Body: { status: "Paid" | "Pending" }
 */
export const updateCommissionStatus = async (id, status) => {
  const { data } = await apiClient.patch(`/admin/commissions/${id}/status`, {
    status,
  });
  return data.data;
};
