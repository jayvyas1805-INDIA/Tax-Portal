import Referral from "../models/Referral.js";
import Partner from "../models/Partner.js";
import Commission from "../models/Commission.js"
import CommissionRule from "../models/CommissionRule.js";
import SystemConfig from "../models/SystemConfig.js";
import { evaluatePartnerTier } from "../Services/tierService.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {
    const partnerId = req.user.id;

    const [
      totalReferrals,
      converted,
      underReview,
      proposalShared,
      rejected,
      partner,
    ] = await Promise.all([
      Referral.countDocuments({ partnerId }),

      Referral.countDocuments({
        partnerId,
        status: "Converted",
      }),

      Referral.countDocuments({
        partnerId,
        status: "Under Review",
      }),

      Referral.countDocuments({
        partnerId,
        status: "Proposal Shared",
      }),

      Referral.countDocuments({
        partnerId,
        status: "Rejected",
      }),

      Partner.findById(partnerId).select("tier"),
    ]);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found.",
      });
    }

    // Find the commission rule for this partner's tier
    const commissionRule = await CommissionRule.findOne({
      tier: partner.tier,
      status: "Active",
    }).select("tier basePercent");

    res.status(200).json({
      success: true,
      data: {
        totalReferrals,
        converted,
        underReview,
        proposalShared,
        rejected,

        // Partner tier information
        tier: partner.tier,

        // Current commission percentage for that tier
        commissionPercent: commissionRule?.basePercent ?? 0,
      },
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const getReferralTrends = async (req, res) => {
  try {
    // Get logged-in partner id
    const partnerId = new mongoose.Types.ObjectId(req.user.id);

    const year = Number(req.query.year) || new Date().getFullYear();

    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    // Aggregate monthly referrals
    const aggregateResult = await Referral.aggregate([
      {
        $match: {
          partnerId: partnerId,
          createdAt: {
            $gte: start,
            $lt: end,
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
          },
          referrals: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const data = months.map((month) => ({
      month,
      referrals: 0,
    }));

    aggregateResult.forEach((item) => {
      data[item._id.month - 1].referrals = item.referrals;
    });

    // Debug information
    const allReferrals = await Referral.find({ partnerId });
    const yearReferrals = await Referral.find({
      partnerId,
      createdAt: {
        $gte: start,
        $lt: end,
      },
    });

    res.status(200).json({
      success: true,
      year,
      data,

      // Debug (remove later)
      partnerId,
      totalPartnerReferrals: allReferrals.length,
      totalYearReferrals: yearReferrals.length,
      aggregateResult,
      allReferrals,
      yearReferrals,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



export const getAvailableYears = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id).select("createdAt");

    const joinYear = partner.createdAt.getFullYear();
    const currentYear = new Date().getFullYear();

    const years = [];

    for (let year = currentYear; year >= joinYear; year--) {
      years.push(year);
    }

    res.json({
      success: true,
      years,
      selectedYear: currentYear,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const getCommissionChart = async (req, res) => {
  try {
    const partnerId = req.user.id;

    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const monthlyData = await Commission.aggregate([
      {
        $match: {
          partnerId: new mongoose.Types.ObjectId(partnerId),
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $month: "$createdAt",
          },
          earnings: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          "_id": 1,
        },
      },
    ]);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const chartData = months.map((month, index) => ({
      month,
      earnings: 0,
    }));

    monthlyData.forEach((item) => {
      chartData[item._id - 1].earnings = item.earnings;
    });

    const cumulativeTotal = chartData.reduce(
      (sum, month) => sum + month.earnings,
      0
    );

    const availableYears = await Commission.aggregate([
      {
        $match: {
          partnerId: new mongoose.Types.ObjectId(partnerId),
        },
      },
      {
        $group: {
          _id: {
            $year: "$createdAt",
          },
        },
      },
      {
        $sort: {
          "_id": -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      year,
      cumulativeTotal,
      chartData,
      availableYears: availableYears.map((item) => item._id),
    });
  } catch (error) {
    console.error("getCommissionChart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch commission chart.",
    });
  }
};

export const getCurrentPartnerSettings = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id).select("tier");

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found.",
      });
    }

    const [systemConfig, commissionRule] = await Promise.all([
      SystemConfig.getSingleton(),

      CommissionRule.findOne({
        tier: partner.tier,
        status: "Active",
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        systemConfig: {
          quarterlyRevenueGoal: systemConfig.quarterlyRevenueGoal,
          payoutScheduleDay: systemConfig.payoutScheduleDay,
          w9AutoVerify: systemConfig.w9AutoVerify,
          nec1099Generation: systemConfig.nec1099Generation,
        },

        commission: commissionRule
          ? {
              tier: commissionRule.tier,
              basePercent: commissionRule.basePercent,
              thresholdLabel: commissionRule.thresholdLabel,
              thresholdAmount: commissionRule.thresholdAmount,
              status: commissionRule.status,
            }
          : null,
      },
    });
  } catch (error) {
    console.error(
      "getCurrentPartnerSettings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch current partner settings.",
    });
  }
};

export const getPartnerTier = async (req, res) => {
  try {
    const partnerId = req.user.id;

    // Make sure the partner's tier is currently correct.
    await evaluatePartnerTier(partnerId);

    const partner = await Partner.findById(partnerId).select("tier");

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found.",
      });
    }

    const rules = await CommissionRule.find({
      status: "Active",
    }).sort({
      thresholdAmount: 1,
    });

    const currentRule = rules.find(
      (rule) => rule.tier === partner.tier
    );

    const now = new Date();

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    const result = await Referral.aggregate([
      {
        $match: {
          partnerId: new mongoose.Types.ObjectId(partnerId),
          status: "Converted",
          createdAt: {
            $gte: monthStart,
            $lt: nextMonthStart,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $ifNull: ["$estimatedValue", 0],
            },
          },
        },
      },
    ]);

    const monthlyAmount = result[0]?.totalAmount || 0;

    // Find next tier.
    const currentIndex = rules.findIndex(
      (rule) => rule.tier === partner.tier
    );

    const nextRule = rules[currentIndex + 1] || null;

    const progress = nextRule
      ? Math.min(
          100,
          Math.round(
            (monthlyAmount / nextRule.thresholdAmount) * 100
          )
        )
      : 100;

    return res.status(200).json({
      success: true,
      data: {
        tier: partner.tier,
        commissionPercent: currentRule?.basePercent || 0,

        monthlyAmount,

        nextTier: nextRule?.tier || null,
        nextTierThreshold: nextRule?.thresholdAmount || null,

        progress,
      },
    });
  } catch (error) {
    console.error("getPartnerTier error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch partner tier information.",
    });
  }
};