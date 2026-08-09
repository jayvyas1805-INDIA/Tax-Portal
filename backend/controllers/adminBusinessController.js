import Referral from "../models/Referral.js";
import Commission from "../models/Commission.js";

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

  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
};

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 };

/**
 * GET /api/admin/business/stats
 * Stat cards: Total Value, Net Revenue, Active Clients, Conversion Rate
 */
export const getBusinessStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalValueAgg,
      valueThisMonthAgg,
      valueLastMonthAgg,
      netRevenueAgg,
      netRevenueThisMonthAgg,
      netRevenueLastMonthAgg,
      distinctClients,
      newRegistrationsThisMonth,
      totalReferrals,
      convertedReferrals,
    ] = await Promise.all([
      Referral.aggregate([
        { $match: { status: "Converted" } },
        { $group: { _id: null, total: { $sum: "$estimatedValue" } } },
      ]),
      Referral.aggregate([
        { $match: { status: "Converted", createdAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$estimatedValue" } } },
      ]),
      Referral.aggregate([
        {
          $match: {
            status: "Converted",
            createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$estimatedValue" } } },
      ]),
      Commission.aggregate([{ $group: { _id: null, total: { $sum: "$companyFee" } } }]),
      Commission.aggregate([
        { $match: { createdAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$companyFee" } } },
      ]),
      Commission.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$companyFee" } } },
      ]),
      Referral.distinct("clientName", { status: "Converted" }),
      Referral.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Referral.countDocuments({}),
      Referral.countDocuments({ status: "Converted" }),
    ]);

    const pctChange = (current, previous) => {
      if (!previous) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const totalValue = totalValueAgg[0]?.total || 0;
    const netRevenue = netRevenueAgg[0]?.total || 0;
    const conversionRate = totalReferrals
      ? Number(((convertedReferrals / totalReferrals) * 100).toFixed(1))
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalValue,
        totalValueChangePercent: pctChange(
          valueThisMonthAgg[0]?.total || 0,
          valueLastMonthAgg[0]?.total || 0
        ),
        netRevenue,
        netRevenueChangePercent: pctChange(
          netRevenueThisMonthAgg[0]?.total || 0,
          netRevenueLastMonthAgg[0]?.total || 0
        ),
        activeClients: distinctClients.length,
        newRegistrationsThisMonth,
        conversionRate,
      },
    });
  } catch (error) {
    console.error("getBusinessStats (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching business stats.",
    });
  }
};

/**
 * GET /api/admin/business/register
 * Converted Business Register table.
 * Query: service, range ("7d"|"30d"|"90d"), page, limit
 */
export const getBusinessRegister = async (req, res) => {
  try {
    const { service = "", range = "30d" } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 5);

    const filter = { status: "Converted" };

    if (service.trim()) filter.service = service.trim();

    const days = RANGE_DAYS[range] || 30;
    filter.createdAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };

    const [referrals, total] = await Promise.all([
      Referral.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("partnerId", "personalInfo.fullName professionalInfo.companyName email"),
      Referral.countDocuments(filter),
    ]);

    const data = referrals.map((r) => {
      const partnerName = getPartnerDisplayName(r.partnerId);
      return {
        id: r._id,
        businessId: r.referralId,
        initials: getInitials(r.clientName),
        clientName: r.clientName,
        partnerName,
        service: r.service,
        value: r.estimatedValue,
        createdAt: r.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("getBusinessRegister (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the business register.",
    });
  }
};

/**
 * GET /api/admin/business/lifecycle?limit=6
 * A reconstructed activity feed — there's no dedicated event-log model, so this
 * merges the real timestamps we do have: referral creation, conversion, and
 * commission payment.
 */
export const getClientLifecycle = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6;

    const [recentReferrals, recentConverted, recentPaidCommissions] = await Promise.all([
      Referral.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("partnerId", "personalInfo.fullName professionalInfo.companyName email"),
      Referral.find({ status: "Converted" })
        .sort({ updatedAt: -1 })
        .limit(limit),
      Commission.find({ status: "Paid" })
        .sort({ paidAt: -1 })
        .limit(limit)
        .populate("partnerId", "personalInfo.fullName professionalInfo.companyName email"),
    ]);

    const events = [];

    recentReferrals.forEach((r) => {
      events.push({
        title: "Lead Registered",
        detail: `${getPartnerDisplayName(r.partnerId)} added ${r.clientName} as a potential referral for ${r.service}.`,
        time: r.createdAt,
        status: r.status === "Converted" ? "done" : "pending",
      });
    });

    recentConverted.forEach((r) => {
      events.push({
        title: "Conversion Completed",
        detail: `${r.clientName} finalized the '${r.service}' package.`,
        meta: `Referral ${r.referralId}`,
        time: r.updatedAt,
        status: "done",
      });
    });

    recentPaidCommissions.forEach((c) => {
      events.push({
        title: "Payment Processed",
        detail: `Commission of $${c.amount.toLocaleString()} paid to ${getPartnerDisplayName(c.partnerId)} for ${c.clientName}.`,
        meta: `Transaction ${c.transactionId}`,
        time: c.paidAt,
        status: "done",
      });
    });

    const data = events
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, limit)
      .map((e) => ({ ...e, time: getRelativeTime(e.time) }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getClientLifecycle (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the client lifecycle feed.",
    });
  }
};
