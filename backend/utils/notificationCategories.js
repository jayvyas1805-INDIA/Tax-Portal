// constants/notificationCategories.js
export const NOTIFICATION_CATEGORY = {
  CRITICAL: "critical",
  PARTNER: "partner",
  FINANCIAL: "financial",
  SYSTEM: "system",
};

// Must match the TABS array in NotificationCenter.jsx exactly
export const TAB_TO_CATEGORY = {
  "All Notifications": null, // null = no category filter
  "Critical Alerts": NOTIFICATION_CATEGORY.CRITICAL,
  "Partner Updates": NOTIFICATION_CATEGORY.PARTNER,
  "Financial": NOTIFICATION_CATEGORY.FINANCIAL,
};