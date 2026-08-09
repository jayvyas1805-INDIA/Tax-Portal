import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
      index: true,
    },

    referralId: {
      type: String,
      unique: true,
    },

    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },

    clientContact: {
      type: String,
      required: [true, "Client mobile number is required"],
      trim: true,
    },

    service: {
      type: String,
      required: [true, "Service is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["Proposal Shared", "Converted", "Under Review", "Rejected"],
      default: "Proposal Shared",
    },

    estimatedValue: {
      type: Number,
      required: [true, "Estimated value is required"],
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate a human-friendly referral ID like REF-2024-0001 before saving
referralSchema.pre("save", async function () {
  if (this.referralId) return;

  const year = new Date().getFullYear();

  const count = await this.constructor.countDocuments({
    referralId: new RegExp(`^REF-${year}-`),
  });

  this.referralId = `REF-${year}-${String(count + 1).padStart(4, "0")}`;
});

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
