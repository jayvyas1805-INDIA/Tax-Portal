import Review from "../models/Review.js";
import Partner from "../models/Partner.js";

const getPartnerDisplayName = (partner) =>
  partner?.professionalInfo?.companyName ||
  partner?.personalInfo?.fullName ||
  partner?.email ||
  "Unknown Partner";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

const getRelativeTime = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${Math.max(minutes, 1)} minutes ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
};

const toRow = (review) => {
  const partner = review.partnerId;
  const name = getPartnerDisplayName(partner);

  return {
    id: review._id,
    initials: getInitials(review.clientName),
    client: review.clientName,
    partner: name,
    rating: review.rating,
    comment: review.comment,
    service: review.service,
    time: getRelativeTime(review.createdAt),
    status: review.status,
    adminResponse: review.adminResponse?.text || "",
    flagReason: review.flagReason || "",
  };
};

/**
 * GET /api/admin/reviews/stats
 * Stat cards: Total Reviews, Average Rating, Pending Response, Flagged Feedback
 */
export const getReviewStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalReviews,
      avgAgg,
      pendingCount,
      flaggedCount,
      reviewsThisMonth,
      reviewsLastMonth,
    ] = await Promise.all([
      Review.countDocuments({}),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
      Review.countDocuments({ status: "Pending" }),
      Review.countDocuments({ status: "Flagged" }),
      Review.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Review.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
    ]);

    const growthPercent = reviewsLastMonth
      ? Number((((reviewsThisMonth - reviewsLastMonth) / reviewsLastMonth) * 100).toFixed(1))
      : reviewsThisMonth > 0
      ? 100
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalReviews,
        growthPercent,
        averageRating: Number((avgAgg[0]?.avg || 0).toFixed(1)),
        pendingCount,
        flaggedCount,
      },
    });
  } catch (error) {
    console.error("getReviewStats (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching review stats.",
    });
  }
};

/**
 * GET /api/admin/reviews?tab=All|Pending|Flagged&page=&limit=
 */
export const getReviews = async (req, res) => {
  try {
    const { tab = "All" } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);

    const filter = {};
    if (tab === "Pending") filter.status = "Pending";
    if (tab === "Flagged") filter.status = "Flagged";

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("partnerId", "personalInfo.fullName professionalInfo.companyName email"),
      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: reviews.map(toRow),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("getReviews (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching reviews.",
    });
  }
};

/**
 * POST /api/admin/reviews
 * Body: { partnerId, referralId?, clientName, service, rating, comment }
 * Manual entry — there's no client-facing review form yet, so this lets admins
 * log a review that came in through another channel (call, email, etc).
 */
export const createReview = async (req, res) => {
  try {
    const { partnerId, referralId, clientName, service, rating, comment } = req.body;

    if (!partnerId || !clientName || !service || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "partnerId, clientName, service, rating, and comment are required.",
      });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    const review = await Review.create({
      partnerId,
      referralId: referralId || undefined,
      clientName,
      service,
      rating,
      comment,
    });

    await review.populate("partnerId", "personalInfo.fullName professionalInfo.companyName email");

    return res.status(201).json({
      success: true,
      message: "Review logged successfully.",
      data: toRow(review),
    });
  } catch (error) {
    console.error("createReview (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging this review.",
    });
  }
};

/**
 * PATCH /api/admin/reviews/:id/respond
 * Body: { response }
 * Publishes the review with the admin's response attached.
 */
export const respondToReview = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || !response.trim()) {
      return res.status(400).json({ success: false, message: "response is required." });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        "adminResponse.text": response.trim(),
        "adminResponse.respondedAt": new Date(),
        status: "Published",
        flagReason: "",
      },
      { new: true }
    ).populate("partnerId", "personalInfo.fullName professionalInfo.companyName email");

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Response published.",
      data: toRow(review),
    });
  } catch (error) {
    console.error("respondToReview (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while responding to this review.",
    });
  }
};

/**
 * PATCH /api/admin/reviews/:id/flag
 * Body: { reason? }
 */
export const flagReview = async (req, res) => {
  try {
    const { reason = "" } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "Flagged", flagReason: reason },
      { new: true }
    ).populate("partnerId", "personalInfo.fullName professionalInfo.companyName email");

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Review flagged for follow-up.",
      data: toRow(review),
    });
  } catch (error) {
    console.error("flagReview (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while flagging this review.",
    });
  }
};

/**
 * PATCH /api/admin/reviews/:id/status
 * Body: { status: "Pending" | "Published" | "Flagged" }
 * Generic override — mainly used to un-flag a review back to Published.
 */
export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Published", "Flagged"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be 'Pending', 'Published', or 'Flagged'.",
      });
    }

    const update = { status };
    if (status !== "Flagged") update.flagReason = "";

    const review = await Review.findByIdAndUpdate(req.params.id, update, { new: true }).populate(
      "partnerId",
      "personalInfo.fullName professionalInfo.companyName email"
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Review marked as ${status}.`,
      data: toRow(review),
    });
  } catch (error) {
    console.error("updateReviewStatus (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating this review.",
    });
  }
};

/**
 * GET /api/admin/reviews/export?tab=All|Pending|Flagged
 */
export const exportReviews = async (req, res) => {
  try {
    const { tab = "All" } = req.query;
    const filter = {};
    if (tab === "Pending") filter.status = "Pending";
    if (tab === "Flagged") filter.status = "Flagged";

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .populate("partnerId", "personalInfo.fullName professionalInfo.companyName email");

    const header = "Client,Partner,Service,Rating,Comment,Status,Date\n";
    const rows = reviews
      .map((r) =>
        [
          `"${r.clientName.replace(/"/g, '""')}"`,
          `"${getPartnerDisplayName(r.partnerId).replace(/"/g, '""')}"`,
          r.service,
          r.rating,
          `"${r.comment.replace(/"/g, '""')}"`,
          r.status,
          r.createdAt.toISOString().split("T")[0],
        ].join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="reviews.csv"');
    return res.status(200).send(header + rows);
  } catch (error) {
    console.error("exportReviews (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while exporting reviews.",
    });
  }
};
