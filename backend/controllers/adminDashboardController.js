import mongoose from "mongoose";
import Partner from "../models/Partner.js";
import Referral from "../models/Referral.js";
import Commission from "../models/Commission.js";
import SystemConfig from "../models/SystemConfig.js";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Quarterly revenue target now lives in SystemConfig (Settings > System Config),
// editable by admins instead of hardcoded here.

const getGrowthPercent = (current, previous) => {
  // previous = Number(previous || 0);
  if (!previous) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const getPartnerDisplayName = (partner) =>
  partner?.professionalInfo?.companyName ||
  partner?.personalInfo?.fullName ||
  partner?.email ||
  "Unknown Partner";

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

/**
 * GET /api/admin/dashboard/stats
 * Top stat cards: Total Partners, Active Partners, Total Referrals, Converted Leads
 */
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalPartners,
      partnersThisMonth,
      partnersLastMonth,
      activePartners24h,
      totalReferrals,
      referralsThisMonth,
      referralsLastMonth,
      convertedLeads,
    ] = await Promise.all([
      Partner.countDocuments({}),
      Partner.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Partner.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      Partner.countDocuments({ lastLogin: { $gte: twentyFourHoursAgo } }),
      Referral.countDocuments({}),
      Referral.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Referral.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      Referral.countDocuments({ status: "Converted" }),
    ]);

    const activePartnersPercent = totalPartners
      ? Number(((activePartners24h / totalPartners) * 100).toFixed(1))
      : 0;

    const conversionRate = totalReferrals
      ? Number(((convertedLeads / totalReferrals) * 100).toFixed(1))
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalPartners,
        partnerGrowthPercent: getGrowthPercent(partnersThisMonth, partnersLastMonth),
        activePartners: activePartners24h,
        activePartnersPercent,
        totalReferrals,
        referralGrowthPercent: getGrowthPercent(referralsThisMonth, referralsLastMonth),
        convertedLeads,
        conversionRate,
      },
    });
  } catch (error) {
    console.error("getDashboardStats (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching dashboard stats.",
    });
  }
};

/**
 * GET /api/admin/dashboard/revenue
 * Revenue Generated / Total Payable / Paid / Pending block
 */
export const getRevenueOverview = async (req, res) => {
  try {
    const [totals, paidTotals, pendingTotals, systemConfig] = await Promise.all([
      Commission.aggregate([
        {
          $group: {
            _id: null,
            revenueGenerated: { $sum: "$businessValue" },
            totalPayable: { $sum: "$amount" },
          },
        },
      ]),
      Commission.aggregate([
        { $match: { status: "Paid" } },
        { $group: { _id: null, paid: { $sum: "$amount" } } },
      ]),
      Commission.aggregate([
        { $match: { status: "Pending" } },
        {
          $group: {
            _id: null,
            pending: { $sum: "$amount" },
            pendingApprovalsCount: { $sum: 1 },
          },
        },
      ]),
      SystemConfig.getSingleton(),
    ]);

    const revenueGenerated = totals[0]?.revenueGenerated || 0;
    const totalPayable = totals[0]?.totalPayable || 0;
    const paid = paidTotals[0]?.paid || 0;
    const pending = pendingTotals[0]?.pending || 0;
    const pendingApprovalsCount = pendingTotals[0]?.pendingApprovalsCount || 0;

    const paidPercent = totalPayable
      ? Number(((paid / totalPayable) * 100).toFixed(1))
      : 0;

    const goalProgressPercent = Math.min(
      100,
      Number(((revenueGenerated / systemConfig.quarterlyRevenueGoal) * 100).toFixed(1))
    );

    return res.status(200).json({
      success: true,
      data: {
        revenueGenerated,
        goalProgressPercent,
        totalPayable,
        paid,
        paidPercent,
        pending,
        pendingApprovalsCount,
      },
    });
  } catch (error) {
    console.error("getRevenueOverview (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the revenue overview.",
    });
  }
};

/**
 * GET /api/admin/dashboard/revenue-chart?year=2026
 * Monthly Revenue Dynamics chart (sum of businessValue per month)
 */
export const getRevenueChart = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const aggregateResult = await Commission.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          revenue: { $sum: "$businessValue" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const data = MONTHS.map((month) => ({ month, revenue: 0 }));
    aggregateResult.forEach((item) => {
      data[item._id.month - 1].revenue = item.revenue;
    });

    const availableYearsResult = await Commission.aggregate([
      { $group: { _id: { $year: "$createdAt" } } },
      { $sort: { _id: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      year,
      data,
      availableYears: availableYearsResult.map((item) => item._id),
    });
  } catch (error) {
    console.error("getRevenueChart (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the revenue chart.",
    });
  }
};

/**
 * GET /api/admin/dashboard/funnel
 * Lead Conversion Funnel: Inquiries -> Qualified -> Proposals -> Converted
 */
export const getConversionFunnel = async (req, res) => {
  try {
    const [inquiries, qualified, proposals, converted] = await Promise.all([
      Referral.countDocuments({}),
      Referral.countDocuments({ status: { $ne: "Rejected" } }),
      Referral.countDocuments({ status: { $in: ["Proposal Shared", "Converted"] } }),
      Referral.countDocuments({ status: "Converted" }),
    ]);

    const pct = (value) =>
      inquiries ? Number(((value / inquiries) * 100).toFixed(0)) : 0;

    const funnel = [
      { label: "Inquiries", value: inquiries, pct: 100 },
      { label: "Qualified", value: qualified, pct: pct(qualified) },
      { label: "Proposals", value: proposals, pct: pct(proposals) },
      { label: "Converted", value: converted, pct: pct(converted) },
    ];

    return res.status(200).json({ success: true, data: funnel });
  } catch (error) {
    console.error("getConversionFunnel (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the conversion funnel.",
    });
  }
};

/**
 * GET /api/admin/dashboard/elite-performers?limit=4
 * Top partners ranked by total commission earnings
 */
export const getElitePerformers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 4;

    const topEarners = await Commission.aggregate([
      { $group: { _id: "$partnerId", totalEarnings: { $sum: "$amount" } } },
      { $sort: { totalEarnings: -1 } },
      { $limit: limit },
    ]);

    if (topEarners.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const partnerIds = topEarners.map((item) => item._id);

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [partners, thisMonthByPartner, lastMonthByPartner] = await Promise.all([
      Partner.find({ _id: { $in: partnerIds } }).select(
        "personalInfo.fullName professionalInfo.companyName email"
      ),
      Commission.aggregate([
        {
          $match: {
            partnerId: { $in: partnerIds },
            createdAt: { $gte: startOfThisMonth },
          },
        },
        { $group: { _id: "$partnerId", total: { $sum: "$amount" } } },
      ]),
      Commission.aggregate([
        {
          $match: {
            partnerId: { $in: partnerIds },
            createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
          },
        },
        { $group: { _id: "$partnerId", total: { $sum: "$amount" } } },
      ]),
    ]);

    const partnerById = new Map(partners.map((p) => [String(p._id), p]));
    const thisMonthMap = new Map(
      thisMonthByPartner.map((item) => [String(item._id), item.total])
    );
    const lastMonthMap = new Map(
      lastMonthByPartner.map((item) => [String(item._id), item.total])
    );

    const data = topEarners.map((item) => {
      const partner = partnerById.get(String(item._id));
      const name = getPartnerDisplayName(partner);
      const current = thisMonthMap.get(String(item._id)) || 0;
      const previous = lastMonthMap.get(String(item._id)) || 0;

      return {
        partnerId: item._id,
        initials: getInitials(name),
        name,
        totalEarnings: item.totalEarnings,
        changePercent: getGrowthPercent(current, previous),
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getElitePerformers (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching elite performers.",
    });
  }
};

/**
 * GET /api/admin/dashboard/referral-stream?limit=5
 * Live Referral Stream: most recently created referrals across all partners
 */
export const getReferralStream = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const [referrals, totalReferrals] = await Promise.all([
      Referral.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("partnerId", "personalInfo.fullName professionalInfo.companyName email"),
      Referral.countDocuments({}),
    ]);

    const data = referrals.map((referral) => ({
      id: referral._id,
      referralId: referral.referralId,
      clientName: referral.clientName,
      service: referral.service,
      partnerName: getPartnerDisplayName(referral.partnerId),
      value: referral.estimatedValue,
      status: referral.status,
      createdAt: referral.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data,
      totalReferrals,
    });
  } catch (error) {
    console.error("getReferralStream (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the referral stream.",
    });
  }
};
