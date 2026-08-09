import mongoose from "mongoose";
import Partner from "../models/Partner.js";
import Referral from "../models/Referral.js";
import CommissionRule from "../models/CommissionRule.js";
import createNotification from "../utils/createNotification.js";

const TIER_ORDER = [
  "Emerging Bronze",
  "Standard Silver",
  "Strategic Gold",
];

export const evaluatePartnerTier = async (partnerId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      throw new Error("Invalid partner ID.");
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      throw new Error("Partner not found.");
    }

    // All-time converted referral value (no date filter).
    const result = await Referral.aggregate([
      {
        $match: {
          partnerId: new mongoose.Types.ObjectId(partnerId),
          status: "Converted",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: { $ifNull: ["$estimatedValue", 0] } },
        },
      },
    ]);

    const totalAmount = result[0]?.totalAmount || 0;

    const rules = await CommissionRule.find({ status: "Active" }).sort({
      thresholdAmount: 1,
    });

    if (!rules.length) {
      return {
        changed: false,
        tier: partner.tier,
        totalAmount,
        message: "No active commission rules found.",
      };
    }

    let newTier = TIER_ORDER[0];
    for (const rule of rules) {
      if (totalAmount >= Number(rule.thresholdAmount || 0)) {
        newTier = rule.tier;
      }
    }

    const oldTier = partner.tier;

    if (oldTier === newTier) {
      return { changed: false, oldTier, newTier, totalAmount };
    }

    partner.tier = newTier;
    await partner.save();

    const oldIndex = TIER_ORDER.indexOf(oldTier);
    const newIndex = TIER_ORDER.indexOf(newTier);
    const newRule = rules.find((rule) => rule.tier === newTier);
    const commissionPercent = newRule?.basePercent ?? 0;
    const direction = newIndex > oldIndex ? "upgraded" : "changed";

    await createNotification(partner._id, {
      icon: direction === "upgraded" ? "🎉" : "📊",
      title: `Partner tier ${direction}`,
      description:
        direction === "upgraded"
          ? `Congratulations! Your partner tier has been upgraded from ${oldTier} to ${newTier}. Your current commission rate is ${commissionPercent}%.`
          : `Your partner tier has changed from ${oldTier} to ${newTier} based on your total performance. Your current commission rate is ${commissionPercent}%.`,
      category: "commission",
    });

    return { changed: true, direction, oldTier, newTier, totalAmount, commissionPercent };
  } catch (error) {
    console.error("evaluatePartnerTier error:", error);
    throw error;
  }
};

// Re-check every partner — call this whenever an admin creates/edits a threshold.
export const evaluateAllPartnerTiers = async () => {
  const partners = await Partner.find({}).select("_id");
  const results = [];
  for (const p of partners) {
    try {
      const r = await evaluatePartnerTier(p._id);
      results.push({ partnerId: p._id, ...r });
    } catch (err) {
      console.error(`evaluateAllPartnerTiers -> failed for ${p._id}:`, err);
    }
  }
  return results;
};