// models/PartnerInvite.js
import mongoose from "mongoose";
import crypto from "crypto";

const partnerInviteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

partnerInviteSchema.statics.generateToken = () => crypto.randomBytes(32).toString("hex");

const PartnerInvite = mongoose.model("PartnerInvite", partnerInviteSchema);
export default PartnerInvite;