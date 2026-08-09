import mongoose from "mongoose";

const commissionRuleSchema = new mongoose.Schema(
  {
    tier: {
      type: String,
      enum: ["Emerging Bronze", "Standard Silver", "Strategic Gold"],
      required: true,
      unique: true,
    },

    basePercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Human-readable threshold shown in the UI (e.g. "$500k ARR", "None").
    thresholdLabel: {
      type: String,
      default: "None",
      trim: true,
    },

    // Optional numeric ARR threshold — kept alongside the label so it can
    // eventually be used to auto-promote partners between tiers.
    thresholdAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

const CommissionRule = mongoose.model("CommissionRule", commissionRuleSchema);

export default CommissionRule;
