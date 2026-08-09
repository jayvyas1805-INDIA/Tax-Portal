import CommissionRule from "../models/CommissionRule.js";
import SystemConfig from "../models/SystemConfig.js";
import Commission from "../models/Commission.js";
import Partner from "../models/Partner.js";
import Referral from "../models/Referral.js";
import { notifyAllPartners, notifyPartnersByTier } from "../utils/createNotification.js";
import createNotification from "../utils/createNotification.js";
import { evaluateAllPartnerTiers } from "../Services/tierService.js";
import { NOTIFICATION_CATEGORY } from "../utils/notificationCategories.js";
import createAdminNotification from "../utils/createAdminNotification.js";

const TIERS = ["Emerging Bronze", "Standard Silver", "Strategic Gold"];

/**
 * GET /api/admin/settings/commission-rules
 */
export const getCommissionRules = async (req, res) => {
  try {
    const rules = await CommissionRule.find({}).sort({ basePercent: -1 });
    return res.status(200).json({ success: true, data: rules });
  } catch (error) {
    console.error("getCommissionRules (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching commission rules.",
    });
  }
};

/**
 * POST /api/admin/settings/commission-rules
 * Body: { tier, basePercent, thresholdLabel?, thresholdAmount?, status? }
 */
export const createCommissionRule = async (req, res) => {
  try {
    const { tier, basePercent, thresholdLabel, thresholdAmount, status } = req.body;

    if (!TIERS.includes(tier) || basePercent === undefined) {
      return res.status(400).json({
        success: false,
        message: `tier must be one of: ${TIERS.join(", ")}, and basePercent is required.`,
      });
    }

    const existing = await CommissionRule.findOne({ tier });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A rule for ${tier} already exists — edit it instead of creating a new one.`,
      });
    }

    const rule = await CommissionRule.create({ tier, basePercent, thresholdLabel, thresholdAmount, status });

    await notifyPartnersByTier({
      tier: rule.tier,
      icon: "💰",
      title: "Commission rule created",
      description: `Your ${rule.tier} commission rate has been created to ${rule.basePercent}%.`,
      category: "commission",
    });

    // Threshold now exists — re-check every partner against it.
    await evaluateAllPartnerTiers();

    return res.status(201).json({ success: true, message: "Commission rule created.", data: rule });
  } catch (error) {
    console.error("createCommissionRule (admin) error ->", error);
    return res.status(500).json({ success: false, message: "Something went wrong while creating this commission rule." });
  }
};

export const updateCommissionRule = async (req, res) => {
  try {
    const { basePercent, thresholdLabel, thresholdAmount, status } = req.body;

    const update = {};
    if (basePercent !== undefined) update.basePercent = basePercent;
    if (thresholdLabel !== undefined) update.thresholdLabel = thresholdLabel;
    if (thresholdAmount !== undefined) update.thresholdAmount = thresholdAmount;
    if (status !== undefined) update.status = status;

    const rule = await CommissionRule.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: "Commission rule not found." });
    }

    await notifyPartnersByTier({
      tier: rule.tier,
      icon: "💰",
      title: "Commission rule updated",
      description: `Your ${rule.tier} commission rate has been updated to ${rule.basePercent}%.`,
      category: "commission",
    });

    // Threshold changed — re-check every partner against the new value.
    await evaluateAllPartnerTiers();

    createAdminNotification({
      icon: "💰",
      title: "Commission rule updated",
      detail: `Commission rule for ${rule.tier} has been updated to ${rule.basePercent}%.`,
      category: NOTIFICATION_CATEGORY.FINANCIAL,
    });

    return res.status(200).json({ success: true, message: "Commission rule updated.", data: rule });
  } catch (error) {
    console.error("updateCommissionRule (admin) error ->", error);
    return res.status(500).json({ success: false, message: "Something went wrong while updating this commission rule." });
  }
};

/**
 * GET /api/admin/settings/forecast
 * Quarter-to-date commission volume + how far through the quarter we are.
 */
export const getQuarterlyForecast = async (req, res) => {
  try {
    const now = new Date();
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
    const quarterEnd = new Date(now.getFullYear(), quarterStartMonth + 3, 1);

    const agg = await Commission.aggregate([
      { $match: { createdAt: { $gte: quarterStart, $lt: quarterEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalDays = (quarterEnd - quarterStart) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now - quarterStart) / (1000 * 60 * 60 * 24);
    const percentElapsed = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

    return res.status(200).json({
      success: true,
      data: {
        quarterToDateAmount: agg[0]?.total || 0,
        percentOfQuarterElapsed: percentElapsed,
        quarterLabel: `Q${quarterStartMonth / 3 + 1} ${now.getFullYear()}`,
      },
    });
  } catch (error) {
    console.error("getQuarterlyForecast (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the payout forecast.",
    });
  }
};

/**
 * GET /api/admin/settings/system-config
 */
export const getSystemConfig = async (req, res) => {
  try {
    const config = await SystemConfig.getSingleton();
    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error("getSystemConfig (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching system configuration.",
    });
  }
};

/**
 * PATCH /api/admin/settings/system-config
 * Body: any of { quarterlyRevenueGoal, w9AutoVerify, nec1099Generation, payoutScheduleDay }
 */
export const updateSystemConfig = async (req, res) => {
  try {
    const {
      quarterlyRevenueGoal,
      w9AutoVerify,
      nec1099Generation,
      payoutScheduleDay,
    } = req.body;

    const config = await SystemConfig.getSingleton();

    // Track only the settings that actually changed
    const changes = [];

    // Quarterly revenue goal
    if (
      quarterlyRevenueGoal !== undefined &&
      Number(quarterlyRevenueGoal) !== Number(config.quarterlyRevenueGoal)
    ) {
      const oldGoal = Number(config.quarterlyRevenueGoal);
      const newGoal = Number(quarterlyRevenueGoal);

      changes.push(
        `Quarterly revenue goal changed from $${oldGoal.toLocaleString()} to $${newGoal.toLocaleString()}.`
      );

      config.quarterlyRevenueGoal = newGoal;
    }

    // Payout schedule
    if (
      payoutScheduleDay !== undefined &&
      Number(payoutScheduleDay) !== Number(config.payoutScheduleDay)
    ) {
      const oldDay = Number(config.payoutScheduleDay);
      const newDay = Number(payoutScheduleDay);

      changes.push(
        `Payout schedule changed from the ${oldDay}th to the ${newDay}th of the month.`
      );

      config.payoutScheduleDay = newDay;
    }

    // W-9 auto verification
    if (
      w9AutoVerify !== undefined &&
      Boolean(w9AutoVerify) !== Boolean(config.w9AutoVerify)
    ) {
      const newValue = Boolean(w9AutoVerify);

      changes.push(
        `W-9 auto-verification was ${newValue ? "enabled" : "disabled"
        }.`
      );

      config.w9AutoVerify = newValue;
    }

    // 1099-NEC generation
    if (
      nec1099Generation !== undefined &&
      Boolean(nec1099Generation) !== Boolean(config.nec1099Generation)
    ) {
      const newValue = Boolean(nec1099Generation);

      changes.push(
        `1099-NEC generation was ${newValue ? "enabled" : "disabled"
        }.`
      );

      config.nec1099Generation = newValue;
    }

    // Save only the actual changes
    await config.save();

    // Create ONE notification per save operation
    // only if something actually changed.
    if (changes.length > 0) {
      await notifyAllPartners({
        icon: "⚙️",
        title: "System settings updated",
        description: changes.join(" "),
        category: "system",
      });
    }

    createAdminNotification({
      icon: "⚙️",
      title: "System setting changed",
      detail: `System setting updated to ₹${req.body.quarterlyRevenueGoal} by admin.`,
      category: NOTIFICATION_CATEGORY.SYSTEM,
    });

    return res.status(200).json({
      success: true,
      message:
        changes.length > 0
          ? "System configuration updated."
          : "No changes were made.",
      data: config,
    });
  } catch (error) {
    console.error("updateSystemConfig (admin) error ->", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating system configuration.",
    });
  }
};


export const recalculateAllTiers = async (req, res) => {
  try {
    const results = await evaluateAllPartnerTiers();
    return res.status(200).json({
      success: true,
      message: "Partner tiers recalculated.",
      data: results,
    });
  } catch (error) {
    console.error("recalculateAllTiers error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while recalculating tiers.",
    });
  }
};