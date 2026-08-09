import apiClient from "./apiClient";

/**
 * POST /api/auth/login
 * Single endpoint for both Admin and Partner — backend checks Admin first,
 * then falls back to Partner. Response includes { role, redirectTo, token }.
 */
export const login = async (email, password) => {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
};

/**
 * POST /api/auth/partner/register
 * Sends the full 7-step wizard formData (including the 3 KYC files) as
 * multipart/form-data.
 */
export const registerPartner = async (formData, agreements) => {
  const payload = new FormData();

  // Text fields — everything except the File objects
  const {
    panCardFile,
    aadhaarCardFile,
    passportPhotoFile,
    reEnterAccountNumber,
    ...textFields
  } = formData;

  Object.entries(textFields).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      payload.append(key, value);
    }
  });

  // Agreement checkboxes (Steps 6 & 7)
  payload.append("agreedToTerms", agreements.agreedToTerms);
  payload.append("agreedToTermsConditions", agreements.agreedToTermsConditions);
  payload.append("agreedToPrivacyPolicy", agreements.agreedToPrivacyPolicy);

  // Files — only appended if the person actually selected one
  if (panCardFile) payload.append("panCardFile", panCardFile);
  if (aadhaarCardFile) payload.append("aadhaarCardFile", aadhaarCardFile);
  if (passportPhotoFile) payload.append("passportPhotoFile", passportPhotoFile);

  const { data } = await apiClient.post("/auth/partner/register", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

/**
 * GET /api/auth/me
 * Protected — returns the currently logged-in Admin or Partner.
 */
export const getCurrentUser = async () => {
  const { data } = await apiClient.get("/auth/me");
  return data;
};

/**
 * POST /api/auth/forgot-password
 * Works for both Admin and Partner emails. Always resolves with a
 * generic success message — the backend doesn't reveal whether the
 * email actually matched an account.
 */
export const forgotPassword = async (email) => {
  const { data } = await apiClient.post("/auth/forgot-password", { email });
  return data;
};

/**
 * POST /api/auth/reset-password/:token
 */
export const resetPassword = async (token, newPassword, confirmPassword) => {
  const { data } = await apiClient.post(`/auth/reset-password/${token}`, {
    newPassword,
    confirmPassword,
  });
  return data;
};

/**
 * POST /api/auth/refresh-token
 * Not usually called directly — apiClient's response interceptor calls
 * this automatically when an access token expires.
 */
export const refreshAccessToken = async (refreshToken) => {
  const { data } = await apiClient.post("/auth/refresh-token", { refreshToken });
  return data;
};

/**
 * POST /api/auth/logout
 * Protected — invalidates the refresh token server-side.
 */
export const logout = async () => {
  const { data } = await apiClient.post("/auth/logout");
  return data;
};

/**
 * GET /api/auth/verify-email/:token
 */
export const verifyEmail = async (token) => {
  const { data } = await apiClient.get(`/auth/verify-email/${token}`);
  return data;
};


export const sendPartnerInvite = async ({ name, email }) => {
  const res = await apiClient.post("/auth/invite", { name, email });
  return res.data;
};