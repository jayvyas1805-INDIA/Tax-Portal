import apiClient from "./apiClient";

/**
 * GET /api/partner/kyc
 */
export const getKycStatus = async () => {
  const { data } = await apiClient.get("/partner/kyc");
  return data;
};

/**
 * PUT /api/partner/kyc
 * Sends only whatever's actually being resubmitted — any subset of
 * panNumber, aadhaarNumber, panCardFile, aadhaarCardFile, passportPhotoFile.
 */
export const resubmitKycDocuments = async ({ panNumber, aadhaarNumber, files }) => {
  const payload = new FormData();

  if (panNumber) payload.append("panNumber", panNumber);
  if (aadhaarNumber) payload.append("aadhaarNumber", aadhaarNumber);

  Object.entries(files).forEach(([key, file]) => {
    if (file) payload.append(key, file);
  });

  const { data } = await apiClient.put("/partner/kyc", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};
