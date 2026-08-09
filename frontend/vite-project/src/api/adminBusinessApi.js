import apiClient from "./apiClient";

/**
 * GET /api/admin/business/stats
 * Stat cards: Total Value, Net Revenue, Active Clients, Conversion Rate
 */
export const getBusinessStats = async () => {
  const { data } = await apiClient.get("/admin/business/stats");
  return data.data;
};

/**
 * GET /api/admin/business/register?service=&range=7d|30d|90d&page=&limit=
 * Converted Business Register table
 */
export const getBusinessRegister = async ({ service, range, page, limit } = {}) => {
  const { data } = await apiClient.get("/admin/business/register", {
    params: { service, range, page, limit },
  });
  return data; // { success, data, pagination }
};

/**
 * GET /api/admin/business/lifecycle?limit=
 * Client Lifecycle activity feed
 */
export const getClientLifecycle = async (limit) => {
  const { data } = await apiClient.get("/admin/business/lifecycle", {
    params: { limit },
  });
  return data.data;
};
