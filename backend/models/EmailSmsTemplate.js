import mongoose from "mongoose";

export const TEMPLATE_KEYS = [
  "kyc_approved",
  "bank_details_approved",
  "settings_changed",
  "referral_converted",
  "partner_invite",
];

export const CHANNELS = ["email", "sms"];

const templateSchema = new mongoose.Schema(
  {
    key: { type: String, enum: TEMPLATE_KEYS, required: true },
    channel: { type: String, enum: CHANNELS, required: true },
    name: { type: String, required: true },       // display label in UI
    subject: { type: String, trim: true, default: "" }, // email only
    body: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

templateSchema.index({ key: 1, channel: 1 }, { unique: true });

const EmailSmsTemplate = mongoose.model("EmailSmsTemplate", templateSchema);
export default EmailSmsTemplate;