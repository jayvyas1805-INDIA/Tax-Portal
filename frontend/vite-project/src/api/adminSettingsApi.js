import apiClient from "./apiClient";

/**
 * GET /api/admin/settings/commission-rules
 */
export const getCommissionRules = async () => {
  const { data } = await apiClient.get("/admin/settings/commission-rules");
  return data.data;
};

/**
 * POST /api/admin/settings/commission-rules
 * Body: { tier, basePercent, thresholdLabel?, thresholdAmount?, status? }
 */
export const createCommissionRule = async (payload) => {
  const { data } = await apiClient.post("/admin/settings/commission-rules", payload);
  return data.data;
};

/**
 * PATCH /api/admin/settings/commission-rules/:id
 */
export const updateCommissionRule = async (id, payload) => {
  const { data } = await apiClient.patch(`/admin/settings/commission-rules/${id}`, payload);
  return data.data;
};

/**
 * GET /api/admin/settings/forecast
 */
export const getQuarterlyForecast = async () => {
  const { data } = await apiClient.get("/admin/settings/forecast");
  return data.data;
};

/**
 * GET /api/admin/settings/system-config
 */
export const getSystemConfig = async () => {
  const { data } = await apiClient.get("/admin/settings/system-config");
  return data.data;
};

/**
 * PATCH /api/admin/settings/system-config
 */
export const updateSystemConfig = async (payload) => {
  const { data } = await apiClient.patch("/admin/settings/system-config", payload);
  return data.data;
};

export const checkPartnerTier = async (tier) => {
  const { data } = await apiClient.get(`/admin/settings/commission-rules/check-tier/${tier}`);
  return data.data;
}

export const getTemplates = () =>
  api.get("/admin/settings/templates").then((res) => res.data.data);

export const updateTemplate = (key, channel, payload) =>
  api.patch(`/admin/settings/templates/${key}/${channel}`, payload).then((res) => res.data.data);