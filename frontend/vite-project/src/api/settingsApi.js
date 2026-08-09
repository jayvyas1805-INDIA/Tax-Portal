import apiClient from "./apiClient";

/**
 * GET /api/partner/settings
 */
export const getSettings = async () => {
  const { data } = await apiClient.get("/partner/settings");
  return data;
};

/**
 * PUT /api/partner/settings/password
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  const { data } = await apiClient.put("/partner/settings/password", {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return data;
};

/**
 * PUT /api/partner/settings/communication
 */
export const updateCommunicationPreferences = async (preferences) => {
  const { data } = await apiClient.put("/partner/settings/communication", preferences);
  return data;
};
