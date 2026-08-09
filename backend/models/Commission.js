import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
      index: true,
    },

    transactionId: {
      type: String,
      unique: true,
    },

    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
    },

    referralDisplayId: {
      type: String,
      trim: true,
    },

    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    businessValue: {
      type: Number,
      required: true,
      min: 0,
    },

    commissionRate: {
      type: Number,
      required: true,
      min: 0,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    companyFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate a human-friendly transaction ID like TXN-882090
commissionSchema.pre("save", async function () {
  if (this.transactionId) return;

  const random = Math.floor(100000 + Math.random() * 900000);
  this.transactionId = `TXN-${random}`;
});

const Commission = mongoose.model("Commission", commissionSchema);

export default Commission;
