import apiClient from "./apiClient";

/**
 * GET /api/admin/partners/stats
 * Stat cards: Total Partners, Pending KYC, Active Partners, New This Month
 */
export const getPartnerStats = async () => {
  const { data } = await apiClient.get("/admin/partners/stats");
  return data.data;
};

/**
 * GET /api/admin/partners?tab=&search=&page=&limit=
 * Partner directory table (with pagination)
 */
export const getPartners = async ({ tab, search, page, limit } = {}) => {
  const { data } = await apiClient.get("/admin/partners", {
    params: { tab, search, page, limit },
  });
  return data; // { success, data, pagination }
};

/**
 * GET /api/admin/partners/:id
 * Full partner profile
 */
export const getPartnerById = async (id) => {
  const { data } = await apiClient.get(`/admin/partners/${id}`);
  return data.data;
};

/**
 * PATCH /api/admin/partners/:id/status
 * Suspend or reactivate a partner account
 */
export const updatePartnerAccountStatus = async (id, isActive) => {
  const { data } = await apiClient.patch(`/admin/partners/${id}/status`, {
    isActive,
  });
  return data.data;
};

/**
 * PATCH /api/admin/partners/:id/kyc/:docType
 * docType: "panCard" | "aadhaarCard" | "photo"
 * Approve or reject a single KYC document.
 */
export const updateKycDocumentStatus = async (id, docType, { status, adminRemarks }) => {
  const { data } = await apiClient.patch(`/admin/partners/${id}/kyc/${docType}`, {
    status,
    adminRemarks,
  });
  return data.data;
};

/**
 * PATCH /api/admin/partners/:id/banking
 * Approve or reject a partner's banking details.
 */
export const updateBankingVerification = async (id, { verificationStatus, adminRemarks }) => {
  const { data } = await apiClient.patch(`/admin/partners/${id}/banking`, {
    verificationStatus,
    adminRemarks,
  });
  return data.data;
};

/**
 * PATCH /api/admin/partners/:id/application-status
 * Approve or reject a partner's registration application.
 */
export const updateApplicationStatus = async (id, applicationStatus) => {
  const { data } = await apiClient.patch(`/admin/partners/${id}/application-status`, {
    applicationStatus,
  });
  return data.data;
};

/**
 * GET /api/admin/partners/export?tab=&search=
 * CSV export of the partner directory, respecting current tab/search filters.
 */
export const exportPartners = async ({ tab, search } = {}) => {
  const { data } = await apiClient.get("/admin/partners/export", {
    params: { tab, search },
    responseType: "blob",
  });
  return data; // CSV blob
};