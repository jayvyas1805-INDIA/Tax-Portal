import apiClient from "./apiClient";

export const getDashboardStats = async () => {
  const { data } = await apiClient.get("/partner/dashboard");
  return data.data;
};

export const getReferralTrends = async (year) => {
  const { data } = await apiClient.get(
    `/partner/dashboard/chart?year=${year}`
  );

  return data.data;
};

export const getAvailableYears = async () => {
  const { data } = await apiClient.get("/partner/dashboard/years");
  return data;
};

export const getCommissionChart = async (year) => {
  const response = await apiClient.get(
    `/partner/dashboard/commission-chart?year=${year}`
  );

  return response.data;
};

export const getCurrentPartnerSettings = async () => {
  const { data } = await apiClient.get(
    "/partner/dashboard/current"
  );

  return data.data;
};

export const getPartnerTier = async () => {
  const { data } = await apiClient.get(
    "/partner/dashboard/tier"
  );

  return data.data;
};