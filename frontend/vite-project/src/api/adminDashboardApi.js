import apiClient from "./apiClient";

/**
 * GET /api/admin/dashboard/stats
 * Top stat cards: Total Partners, Active Partners, Total Referrals, Converted Leads
 */
export const getDashboardStats = async () => {
  const { data } = await apiClient.get("/admin/dashboard/stats");
  return data.data;
};

/**
 * GET /api/admin/dashboard/revenue
 * Revenue Generated / Total Payable / Paid / Pending block
 */
export const getRevenueOverview = async () => {
  const { data } = await apiClient.get("/admin/dashboard/revenue");
  return data.data;
};

/**
 * GET /api/admin/dashboard/revenue-chart?year=
 * Monthly Revenue Dynamics chart
 */
export const getRevenueChart = async (year) => {
  const { data } = await apiClient.get("/admin/dashboard/revenue-chart", {
    params: { year },
  });
  return data;
};

/**
 * GET /api/admin/dashboard/funnel
 * Lead Conversion Funnel
 */
export const getConversionFunnel = async () => {
  const { data } = await apiClient.get("/admin/dashboard/funnel");
  return data.data;
};

/**
 * GET /api/admin/dashboard/elite-performers?limit=
 * Top partners ranked by commission earnings
 */
export const getElitePerformers = async (limit) => {
  const { data } = await apiClient.get("/admin/dashboard/elite-performers", {
    params: { limit },
  });
  return data.data;
};

/**
 * GET /api/admin/dashboard/referral-stream?limit=
 * Most recent referrals across all partners
 */
export const getReferralStream = async (limit) => {
  const { data } = await apiClient.get("/admin/dashboard/referral-stream", {
    params: { limit },
  });
  return data;
};
