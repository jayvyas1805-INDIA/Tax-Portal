import Referral from "../models/Referral.js";
import Partner from "../models/Partner.js";
import Commission from "../models/Commission.js";

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 };

const getPartnerDisplayName = (partner) =>
  partner?.professionalInfo?.companyName ||
  partner?.personalInfo?.fullName ||
  partner?.email ||
  "Unknown Partner";

const pctChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

/**
 * GET /api/admin/analytics/overview?range=7d|30d|90d
 * Top stat cards: Total Referrals, Active Partners, Conversion Rate, Total Revenue
 */
export const getAnalyticsOverview = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalReferrals,
      referralsThisMonth,
      referralsLastMonth,
      activePartners,
      partnersThisMonth,
      partnersLastMonth,
      convertedTotal,
      convertedThisMonth,
      convertedLastMonth,
      revenueTotalAgg,
      revenueThisMonthAgg,
      revenueLastMonthAgg,
    ] = await Promise.all([
      Referral.countDocuments({}),
      Referral.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Referral.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      Partner.countDocuments({ isActive: true }),
      Partner.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Partner.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      Referral.countDocuments({ status: "Converted" }),
      Referral.countDocuments({ status: "Converted", createdAt: { $gte: startOfThisMonth } }),
      Referral.countDocuments({
        status: "Converted",
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
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
    ]);

    const conversionRateThisMonth = referralsThisMonth ? (convertedThisMonth / referralsThisMonth) * 100 : 0;
    const conversionRateLastMonth = referralsLastMonth ? (convertedLastMonth / referralsLastMonth) * 100 : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalReferrals,
        referralGrowthPercent: pctChange(referralsThisMonth, referralsLastMonth),
        activePartners,
        partnerGrowthPercent: pctChange(partnersThisMonth, partnersLastMonth),
        conversionRate: totalReferrals ? Number(((convertedTotal / totalReferrals) * 100).toFixed(1)) : 0,
        conversionRateChangePercent: Number((conversionRateThisMonth - conversionRateLastMonth).toFixed(1)),
        totalRevenue: revenueTotalAgg[0]?.total || 0,
        revenueGrowthPercent: pctChange(
          revenueThisMonthAgg[0]?.total || 0,
          revenueLastMonthAgg[0]?.total || 0
        ),
      },
    });
  } catch (error) {
    console.error("getAnalyticsOverview (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the analytics overview.",
    });
  }
};

/**
 * GET /api/admin/analytics/referral-trend?weeks=8
 * Weekly referral counts for the current N weeks vs the N weeks before that.
 */
export const getReferralTrend = async (req, res) => {
  try {
    const weeks = Math.min(26, Number(req.query.weeks) || 8);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const currentStart = new Date(now - weeks * msPerWeek);
    const previousStart = new Date(now - weeks * 2 * msPerWeek);

    const referrals = await Referral.find({ createdAt: { $gte: previousStart } }).select("createdAt");

    const current = Array(weeks).fill(0);
    const previous = Array(weeks).fill(0);

    referrals.forEach((r) => {
      const created = r.createdAt.getTime();
      if (created >= currentStart.getTime()) {
        const idx = Math.min(weeks - 1, Math.floor((created - currentStart.getTime()) / msPerWeek));
        current[idx] += 1;
      } else {
        const idx = Math.min(weeks - 1, Math.floor((created - previousStart.getTime()) / msPerWeek));
        previous[idx] += 1;
      }
    });

    const labels = Array.from({ length: weeks }, (_, i) => `WK ${i + 1}`);

    return res.status(200).json({ success: true, data: { labels, current, previous } });
  } catch (error) {
    console.error("getReferralTrend (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the referral trend.",
    });
  }
};

const DONUT_COLORS = ["#0b1a3a", "#2f5bd8", "#7ea2ff", "#c7d0e6", "#9aa4c2"];

/**
 * GET /api/admin/analytics/referral-source
 * Referrals broken down by service type (top 4 + "Others"), as donut chart data.
 * NOTE: your Referral schema has no dedicated "source" field (partner/affiliate/
 * direct), so this uses service type as the closest real breakdown available.
 */
export const getReferralSource = async (req, res) => {
  try {
    const totalReferrals = await Referral.countDocuments({});

    const byService = await Referral.aggregate([
      { $group: { _id: "$service", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const top = byService.slice(0, 4);
    const othersCount = byService.slice(4).reduce((sum, item) => sum + item.count, 0);

    const data = top.map((item, index) => ({
      label: item._id || "Unspecified",
      count: item.count,
      pct: totalReferrals ? Number(((item.count / totalReferrals) * 100).toFixed(1)) : 0,
      color: DONUT_COLORS[index % DONUT_COLORS.length],
    }));

    if (othersCount > 0) {
      data.push({
        label: "Others",
        count: othersCount,
        pct: totalReferrals ? Number(((othersCount / totalReferrals) * 100).toFixed(1)) : 0,
        color: DONUT_COLORS[DONUT_COLORS.length - 1],
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getReferralSource (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching referral source breakdown.",
    });
  }
};

/**
 * GET /api/admin/analytics/funnel
 * Same real conversion funnel used in Referral Management, surfaced here too.
 */
export const getConversionFunnel = async (req, res) => {
  try {
    const [inquiries, qualified, proposals, converted] = await Promise.all([
      Referral.countDocuments({}),
      Referral.countDocuments({ status: { $ne: "Rejected" } }),
      Referral.countDocuments({ status: { $in: ["Proposal Shared", "Converted"] } }),
      Referral.countDocuments({ status: "Converted" }),
    ]);

    const data = [
      { label: "Inquiries", value: inquiries },
      { label: "Qualified", value: qualified },
      { label: "Proposals", value: proposals },
      { label: "Converted", value: converted },
    ];

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getConversionFunnel (admin analytics) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the conversion funnel.",
    });
  }
};

/**
 * GET /api/admin/analytics/top-partners?limit=2
 * Top partners ranked by total converted business value.
 */
export const getTopPartnersByRevenue = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const topAgg = await Commission.aggregate([
      { $group: { _id: "$partnerId", total: { $sum: "$businessValue" } } },
      { $sort: { total: -1 } },
      { $limit: limit },
    ]);

    if (topAgg.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const partners = await Partner.find({ _id: { $in: topAgg.map((t) => t._id) } }).select(
      "personalInfo.fullName professionalInfo.companyName email"
    );
    const partnerById = new Map(partners.map((p) => [String(p._id), p]));

    const maxValue = topAgg[0].total || 1;

    const data = topAgg.map((item) => ({
      partnerId: item._id,
      name: getPartnerDisplayName(partnerById.get(String(item._id))),
      value: item.total,
      pct: Number(((item.total / maxValue) * 100).toFixed(0)),
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getTopPartnersByRevenue (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching top partners.",
    });
  }
};

/**
 * GET /api/admin/analytics/export?range=7d|30d|90d
 * CSV summary export combining the overview stats and top partners.
 */
export const exportAnalytics = async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const days = RANGE_DAYS[range] || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [referrals, converted, revenueAgg] = await Promise.all([
      Referral.countDocuments({ createdAt: { $gte: since } }),
      Referral.countDocuments({ status: "Converted", createdAt: { $gte: since } }),
      Referral.aggregate([
        { $match: { status: "Converted", createdAt: { $gte: since } } },
        { $group: { _id: null, total: { $sum: "$estimatedValue" } } },
      ]),
    ]);

    const conversionRate = referrals ? ((converted / referrals) * 100).toFixed(1) : "0.0";

    const header = "Metric,Value\n";
    const rows = [
      `Range,Last ${days} Days`,
      `Total Referrals,${referrals}`,
      `Converted,${converted}`,
      `Conversion Rate,${conversionRate}%`,
      `Revenue Generated,${revenueAgg[0]?.total || 0}`,
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="reports-analytics-summary.csv"');
    return res.status(200).send(header + rows);
  } catch (error) {
    console.error("exportAnalytics (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while exporting the analytics report.",
    });
  }
};
