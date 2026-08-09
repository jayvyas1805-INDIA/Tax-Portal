import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
      index: true,
    },

    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
    },

    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    service: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    // Pending -> awaiting an admin/partner response before it goes live.
    // Published -> live and visible.
    // Flagged -> held back for review (e.g. abusive, disputed, or low-rating escalation).
    status: {
      type: String,
      enum: ["Pending", "Published", "Flagged"],
      default: "Pending",
    },

    adminResponse: {
      text: { type: String, trim: true },
      respondedAt: { type: Date },
    },

    flagReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
