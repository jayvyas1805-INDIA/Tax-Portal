export const DEFAULT_TEMPLATES = [
  {
    key: "kyc_approved",
    channel: "email",
    name: "KYC Approved",
    subject: "Your KYC has been approved ✅",
    body: `<p>Hi {{partnerName}},</p>
<p>Your KYC verification has been approved. You're all set to start referring clients on the partner portal.</p>
<p>— Team</p>`,
  },
  {
    key: "kyc_approved",
    channel: "sms",
    name: "KYC Approved",
    body: "Hi {{partnerName}}, your KYC has been approved. You're good to go!",
  },
  {
    key: "bank_details_approved",
    channel: "email",
    name: "Bank Details Approved",
    subject: "Your bank details have been verified ✅",
    body: `<p>Hi {{partnerName}},</p>
<p>Your bank account details have been verified and approved. Future payouts will be sent to this account.</p>
<p>— Team</p>`,
  },
  {
    key: "bank_details_approved",
    channel: "sms",
    name: "Bank Details Approved",
    body: "Hi {{partnerName}}, your bank details are verified and approved for payouts.",
  },
  {
    key: "settings_changed",
    channel: "email",
    name: "Commission Rule / System Config Changed",
    subject: "Partner program settings have been updated",
    body: `<p>Hi {{partnerName}},</p>
<p>{{changeSummary}}</p>
<p>— Team</p>`,
  },
  {
    key: "settings_changed",
    channel: "sms",
    name: "Commission Rule / System Config Changed",
    body: "Update: {{changeSummary}}",
  },
  {
    key: "referral_converted",
    channel: "email",
    name: "Referral Converted",
    subject: "🎉 Your referral just converted!",
    body: `<p>Hi {{partnerName}},</p>
<p>Great news — your referral for {{clientName}} has converted. You've earned a commission of {{commissionAmount}} at {{commissionRate}}%.</p>
<p>— Team</p>`,
  },
  {
    key: "referral_converted",
    channel: "sms",
    name: "Referral Converted",
    body: "🎉 Your referral for {{clientName}} converted! Commission earned: {{commissionAmount}}.",
  },
  {
    key: "partner_invite",
    channel: "email",
    name: "Invite Partner",
    subject: "You're invited to join our Partner Program",
    body: `<p>Hi {{inviteeName}},</p>
<p>You've been invited to join our partner program. Click below to set up your account:</p>
<p><a href="{{inviteLink}}">{{inviteLink}}</a></p>
<p>— Team</p>`,
  },
  {
    key: "partner_invite",
    channel: "sms",
    name: "Invite Partner",
    body: "You're invited to join our Partner Program! Sign up here: {{inviteLink}}",
  },
];