import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const apiClient = axios.create({ baseURL: BASE_URL });

// A separate, interceptor-free instance used only for the refresh-token
// call itself — this avoids infinite loops (a failed refresh call would
// otherwise trigger another refresh attempt on itself).
const rawClient = axios.create({ baseURL: BASE_URL });

const getStoredToken = () =>
  localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

const getStoredRefreshToken = () =>
  localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

const getActiveStorage = () =>
  localStorage.getItem("authToken") ? localStorage : sessionStorage;

const clearAuthStorage = () => {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem("authToken");
    storage.removeItem("refreshToken");
    storage.removeItem("authUser");
  });
};

const redirectToLogin = () => {
  if (window.location.pathname !== "/partner-login") {
    window.location.href = "/partner-login";
  }
};

// Attach the JWT (if we have one) to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401, try refreshing the access token once and retrying the
// original request. If refresh itself fails, clear storage and bounce
// to login.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      if (error.response?.status === 401) {
        clearAuthStorage();
        redirectToLogin();
      }
      return Promise.reject(error);
    }

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      clearAuthStorage();
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await rawClient.post("/auth/refresh-token", { refreshToken });

      const storage = getActiveStorage();
      storage.setItem("authToken", data.token);
      storage.setItem("refreshToken", data.refreshToken);

      originalRequest.headers.Authorization = `Bearer ${data.token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthStorage();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
