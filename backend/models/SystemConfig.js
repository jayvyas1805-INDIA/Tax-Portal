import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    // Used by the Dashboard's "Quarterly Goal Progress" bar — previously a
    // hardcoded constant, now a real, admin-editable value.
    quarterlyRevenueGoal: {
      type: Number,
      default: 3000000,
      min: 0,
    },

    w9AutoVerify: {
      type: Boolean,
      default: true,
    },

    nec1099Generation: {
      type: Boolean,
      default: true,
    },

    // Day of the month payouts go out (used in the forecast note).
    payoutScheduleDay: {
      type: Number,
      default: 15,
      min: 1,
      max: 28,
    },
  },
  {
    timestamps: true,
  }
);

// Singleton accessor — creates the one config document on first use.
systemConfigSchema.statics.getSingleton = async function () {
  let config = await this.findOne();
  if (!config) config = await this.create({});
  return config;
};

const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);

export default SystemConfig;
