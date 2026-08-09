import apiClient from "./apiClient";

/**
 * GET /api/admin/analytics/overview
 * Stat cards: Total Referrals, Active Partners, Conversion Rate, Total Revenue
 */
export const getAnalyticsOverview = async () => {
  const { data } = await apiClient.get("/admin/analytics/overview");
  return data.data;
};

/**
 * GET /api/admin/analytics/referral-trend?weeks=
 */
export const getReferralTrend = async (weeks) => {
  const { data } = await apiClient.get("/admin/analytics/referral-trend", {
    params: { weeks },
  });
  return data.data;
};

/**
 * GET /api/admin/analytics/referral-source
 */
export const getReferralSource = async () => {
  const { data } = await apiClient.get("/admin/analytics/referral-source");
  return data.data;
};

/**
 * GET /api/admin/analytics/funnel
 */
export const getConversionFunnel = async () => {
  const { data } = await apiClient.get("/admin/analytics/funnel");
  return data.data;
};

/**
 * GET /api/admin/analytics/top-partners?limit=
 */
export const getTopPartnersByRevenue = async (limit) => {
  const { data } = await apiClient.get("/admin/analytics/top-partners", {
    params: { limit },
  });
  return data.data;
};
