import Referral from "../models/Referral.js";
import Partner from "../models/Partner.js";
import Commission from "../models/Commission.js";
import CommissionRule from "../models/CommissionRule.js";
import { NOTIFICATION_CATEGORY } from "../utils/notificationCategories.js";
import createAdminNotification from "../utils/createAdminNotification.js";
import { evaluatePartnerTier } from "../Services/tierService.js";

const STATUSES = ["Under Review", "Proposal Shared", "Converted", "Rejected"];
/**
 * GET /api/admin/referrals/export
 * CSV export of referrals, respecting the same status/search filters as the list.
 */
export const exportReferrals = async (req, res) => {
  try {
    const { status = "", search = "" } = req.query;
    const filter = {};
    if (status && STATUSES.includes(status)) filter.status = status;

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ referralId: regex }, { clientName: regex }, { service: regex }];
    }

    const referrals = await Referral.find(filter)
      .sort({ createdAt: -1 })
      .populate("partnerId", "personalInfo.fullName professionalInfo.companyName email");

    const header = "Referral ID,Client Name,Contact,Partner,Service,Value,Status,Date\n";
    const rows = referrals
      .map((r) =>
        [
          r.referralId,
          `"${r.clientName.replace(/"/g, '""')}"`,
          r.clientContact,
          `"${getPartnerDisplayName(r.partnerId).replace(/"/g, '""')}"`,
          r.service,
          r.estimatedValue,
          r.status,
          r.createdAt.toISOString().split("T")[0],
        ].join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="referrals.csv"');
    return res.status(200).send(header + rows);
  } catch (error) {
    console.error("exportReferrals (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while exporting referrals.",
    });
  }
};

const getPartnerDisplayName = (partner) =>
  partner?.professionalInfo?.companyName ||
  partner?.personalInfo?.fullName ||
  partner?.email ||
  "Unknown Partner";

const getRelativeTime = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const toListRow = (referral) => ({
  id: referral._id,
  referralId: referral.referralId,
  clientName: referral.clientName,
  clientContact: referral.clientContact,
  partnerName: getPartnerDisplayName(referral.partnerId),
  service: referral.service,
  status: referral.status,
  value: referral.estimatedValue,
  notes: referral.notes,
  createdAt: referral.createdAt,
});

const toDetailResponse = (referral) => ({
  id: referral._id,
  referralId: referral.referralId,

  partner: {
    id: referral.partnerId?._id,
    name: getPartnerDisplayName(referral.partnerId),
    email: referral.partnerId?.email || "",
  },

  clientName: referral.clientName,
  clientContact: referral.clientContact,

  service: referral.service,

  estimatedValue: referral.estimatedValue,

  status: referral.status,

  notes: referral.notes,

  createdAt: referral.createdAt,

  updatedAt: referral.updatedAt,
});

/**
 * GET /api/admin/referrals/stats
 * Footer stat cards: Conversion Rate, Active Partners, Avg. Deal Value, Pipeline Value
 */
export const getReferralStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalReferrals,
      convertedTotal,
      referralsThisMonth,
      convertedThisMonth,
      referralsLastMonth,
      convertedLastMonth,
      pipelineAgg,
      convertedAvgAgg,
      activePartnerIds,
      topPerformerAgg,
    ] = await Promise.all([
      Referral.countDocuments({}),
      Referral.countDocuments({ status: "Converted" }),
      Referral.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Referral.countDocuments({ status: "Converted", createdAt: { $gte: startOfThisMonth } }),
      Referral.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      Referral.countDocuments({
        status: "Converted",
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      Referral.aggregate([
        { $match: { status: { $in: ["Under Review", "Proposal Shared"] } } },
        { $group: { _id: null, total: { $sum: "$estimatedValue" } } },
      ]),
      Referral.aggregate([
        { $match: { status: "Converted" } },
        { $group: { _id: null, avg: { $avg: "$estimatedValue" } } },
      ]),
      Referral.distinct("partnerId", { createdAt: { $gte: thirtyDaysAgo } }),
      Referral.aggregate([
        { $group: { _id: "$partnerId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const conversionRate = totalReferrals
      ? Number(((convertedTotal / totalReferrals) * 100).toFixed(1))
      : 0;

    const conversionRateThisMonth = referralsThisMonth
      ? (convertedThisMonth / referralsThisMonth) * 100
      : 0;
    const conversionRateLastMonth = referralsLastMonth
      ? (convertedLastMonth / referralsLastMonth) * 100
      : 0;
    const conversionRateChange = Number(
      (conversionRateThisMonth - conversionRateLastMonth).toFixed(1)
    );

    let topPerformerName = "—";
    if (topPerformerAgg[0]?._id) {
      const topPartner = await Partner.findById(topPerformerAgg[0]._id).select(
        "personalInfo.fullName professionalInfo.companyName email"
      );
      topPerformerName = getPartnerDisplayName(topPartner);
    }

    return res.status(200).json({
      success: true,
      data: {
        conversionRate,
        conversionRateChange,
        activePartners: activePartnerIds.length,
        topPerformerName,
        avgDealValue: Math.round(convertedAvgAgg[0]?.avg || 0),
        pipelineValue: pipelineAgg[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("getReferralStats (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching referral stats.",
    });
  }
};

/**
 * GET /api/admin/referrals/board
 * Kanban board grouped by status. Query: limitPerColumn (default 8)
 */
export const getReferralBoard = async (req, res) => {
  try {
    const limitPerColumn = Number(req.query.limitPerColumn) || 8;

    const columns = await Promise.all(
      STATUSES.map(async (status) => {
        const [count, referrals] = await Promise.all([
          Referral.countDocuments({ status }),
          Referral.find({ status })
            .sort({ createdAt: -1 })
            .limit(limitPerColumn)
            .populate("partnerId", "personalInfo.fullName professionalInfo.companyName email"),
        ]);

        return {
          key: status.toLowerCase().replace(/\s+/g, "-"),
          title: status,
          count,
          cards: referrals.map((r) => ({
            id: r._id,
            referralId: r.referralId,
            tag: r.service,
            client: r.clientName,
            refBy: getPartnerDisplayName(r.partnerId),
            value: r.estimatedValue,
            time: getRelativeTime(r.createdAt),
          })),
        };
      })
    );

    return res.status(200).json({ success: true, data: columns });
  } catch (error) {
    console.error("getReferralBoard (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the referral board.",
    });
  }
};

/**
 * GET /api/admin/referrals
 * Query params: status, search, page, limit
 */
export const getReferrals = async (req, res) => {
  try {
    const { status = "", search = "" } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);

    const filter = {};
    if (status && STATUSES.includes(status)) filter.status = status;

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ referralId: regex }, { clientName: regex }, { service: regex }];
    }

    const [referrals, total] = await Promise.all([
      Referral.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("partnerId", "personalInfo.fullName professionalInfo.companyName email"),
      Referral.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: referrals.map(toListRow),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("getReferrals (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching referrals.",
    });
  }
};

/**
 * GET /api/admin/referrals/:id
 */
export const getReferralById = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate(
        "partnerId",
        "personalInfo.fullName professionalInfo.companyName email"
      );

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: toDetailResponse(referral),
    });
  } catch (error) {
    console.error("getReferralById error ->", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching referral.",
    });
  }
};

/**
 * PATCH /api/admin/referrals/:id/status
 * Body: { status: "Under Review" | "Proposal Shared" | "Converted" | "Rejected" }
 */
export const updateReferralStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${STATUSES.join(", ")}`,
      });
    }

    const referral = await Referral.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("partnerId", "personalInfo.fullName professionalInfo.companyName email tier");

    if (!referral) {
      return res.status(404).json({ success: false, message: "Referral not found." });
    }

    if (status === "Converted") {
      const existingCommission = await Commission.findOne({ referralId: referral._id });

      if (!existingCommission) {
        const partnerTier = referral.partnerId?.tier || "Emerging Bronze";
        const rule = await CommissionRule.findOne({ tier: partnerTier, status: "Active" });
        const rate = rule?.basePercent ?? 5;

        const amount = Number(((referral.estimatedValue * rate) / 100).toFixed(2));
        const companyFee = Number((referral.estimatedValue - amount).toFixed(2));

        await Commission.create({
          partnerId: referral.partnerId?._id || referral.partnerId,
          referralId: referral._id,
          referralDisplayId: referral.referralId,
          clientName: referral.clientName,
          businessValue: referral.estimatedValue,
          commissionRate: rate,
          amount,
          companyFee,
        });
      }

      // Re-check tier AFTER commission is recorded, using the real partner ID.
      await evaluatePartnerTier(referral.partnerId?._id || referral.partnerId);
    }
    createAdminNotification({
      icon: "✅",
      title: "Referral converted",
      detail: `Referral #${referral._id} from partner ${referral.relatedPartnerId} has converted.`,
      category: NOTIFICATION_CATEGORY.PARTNER,
      relatedPartnerId: referral.relatedPartnerId,
      relatedReferralId: referral._id,
    });

    return res.status(200).json({
      success: true,
      message: "Referral status updated successfully.",
      data: toDetailResponse(referral),
    });
  } catch (error) {
    console.error("updateReferralStatus (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating referral status.",
    });
  }
};
