import apiClient from "./apiClient";

/**
 * GET /api/admin/cdos
 * Super admin only — list every Admin CDO account.
 */
export const getCdos = async () => {
  const { data } = await apiClient.get("/admin/cdos");
  return data.data;
};

/**
 * POST /api/admin/cdos
 * Registers a new Admin CDO. Body: { name, email, password, confirmPassword }
 */
export const createCdo = async ({ name, email, password, confirmPassword }) => {
  const { data } = await apiClient.post("/admin/cdos", {
    name,
    email,
    password,
    confirmPassword,
  });
  return data;
};

/**
 * PATCH /api/admin/cdos/:id/status
 * Activate or deactivate an Admin CDO.
 */
export const updateCdoStatus = async (id, isActive) => {
  const { data } = await apiClient.patch(`/admin/cdos/${id}/status`, { isActive });
  return data.data;
};
