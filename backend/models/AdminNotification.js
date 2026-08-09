import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      default: "🔔",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    detail: {
      type: String,
      required: true,
      trim: true,
    },

    // Drives the tab filters in the Notification Center UI.
    category: {
      type: String,
      enum: ["critical", "partner", "financial", "system"],
      required: true,
    },

    // Optional deep-link context — most events are about a specific partner.
    relatedPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
    },
    relatedReferralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const AdminNotification = mongoose.model("AdminNotification", adminNotificationSchema);

export default AdminNotification;
