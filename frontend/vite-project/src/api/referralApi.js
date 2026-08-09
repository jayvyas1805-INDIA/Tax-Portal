import apiClient from "./apiClient";

/**
 * POST /api/partner/referrals
 */
export const createReferral = async (referral) => {
  const { data } = await apiClient.post("/partner/referrals", referral);
  return data;
};

/**
 * GET /api/partner/referrals
 * Query: search, status, dateFrom, dateTo, page, pageSize
 */
export const getReferrals = async (filters, page, pageSize) => {
  const params = {
    search: filters.searchTerm || undefined,
    status: filters.status !== "All Statuses" ? filters.status : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    page,
    pageSize,
  };

  const { data } = await apiClient.get("/partner/referrals", { params });
  return data;
};

/**
 * GET /api/partner/referrals/export?format=csv|pdf
 * Downloads the file directly in the browser using the same filters
 * currently applied to the table.
 */
export const exportReferrals = async (filters, format) => {
  const params = {
    search: filters.searchTerm || undefined,
    status: filters.status !== "All Statuses" ? filters.status : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    format,
  };

  const response = await apiClient.get("/partner/referrals/export", {
    params,
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = `referrals.${format === "pdf" ? "pdf" : "csv"}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
