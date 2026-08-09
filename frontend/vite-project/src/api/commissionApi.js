import apiClient from "./apiClient";

/**
 * GET /api/partner/commission/summary?range=6m|1y
 */
export const getCommissionSummary = async (range) => {
  const { data } = await apiClient.get("/partner/commission/summary", {
    params: { range },
  });
  return data;
};

/**
 * GET /api/partner/commission/transactions
 */
export const getTransactions = async (searchTerm, page, pageSize) => {
  const { data } = await apiClient.get("/partner/commission/transactions", {
    params: { search: searchTerm || undefined, page, pageSize },
  });
  return data;
};

/**
 * GET /api/partner/commission/export?format=csv|pdf
 * Triggers a real file download in the browser.
 */
export const exportTransactions = async (format) => {
  const response = await apiClient.get("/partner/commission/export", {
    params: { format },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = `commission-statement.${format === "pdf" ? "pdf" : "csv"}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * POST /api/partner/commission/withdraw
 */
export const requestWithdrawal = async () => {
  const { data } = await apiClient.post("/partner/commission/withdraw");
  return data;
};
