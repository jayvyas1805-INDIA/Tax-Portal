import apiClient from "./apiClient";

/**
 * GET /api/admin/reviews/stats
 * Stat cards: Total Reviews, Average Rating, Pending Response, Flagged Feedback
 */
export const getReviewStats = async () => {
  const { data } = await apiClient.get("/admin/reviews/stats");
  return data.data;
};

/**
 * GET /api/admin/reviews?tab=All|Pending|Flagged&page=&limit=
 */
export const getReviews = async ({ tab, page, limit } = {}) => {
  const { data } = await apiClient.get("/admin/reviews", {
    params: { tab, page, limit },
  });
  return data; // { success, data, pagination }
};

/**
 * PATCH /api/admin/reviews/:id/respond
 * Body: { response }
 */
export const respondToReview = async (id, response) => {
  const { data } = await apiClient.patch(`/admin/reviews/${id}/respond`, { response });
  return data.data;
};

/**
 * PATCH /api/admin/reviews/:id/flag
 * Body: { reason? }
 */
export const flagReview = async (id, reason) => {
  const { data } = await apiClient.patch(`/admin/reviews/${id}/flag`, { reason });
  return data.data;
};

/**
 * PATCH /api/admin/reviews/:id/status
 * Body: { status: "Pending" | "Published" | "Flagged" }
 */
export const updateReviewStatus = async (id, status) => {
  const { data } = await apiClient.patch(`/admin/reviews/${id}/status`, { status });
  return data.data;
};
