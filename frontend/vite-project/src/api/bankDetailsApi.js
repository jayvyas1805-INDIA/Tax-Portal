import apiClient from "./apiClient";

/**
 * GET /api/partner/bank-details
 */
export const getBankDetails = async () => {
  const { data } = await apiClient.get("/partner/bank-details");
  return data;
};

/**
 * PUT /api/partner/bank-details
 * multipart/form-data — cancelledChequeFile is optional.
 */
export const updateBankDetails = async (formData, cancelledChequeFile) => {
  const payload = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    payload.append(key, value);
  });

  if (cancelledChequeFile) {
    payload.append("cancelledChequeFile", cancelledChequeFile);
  }

  const { data } = await apiClient.put("/partner/bank-details", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};
