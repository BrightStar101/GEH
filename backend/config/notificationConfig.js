/**
 * notificationConfig.js
 *
 * Stores outbound alert routing, escalation targets, SMTP settings, and throttle windows.
 * Used by moderationNotificationService.js and sendEscalationAlert.js.
 */

const notificationConfig = {
  notificationTargets: {
    violence: { type: "email", to: "legal@globalentryhub.com" },
    fraud: { type: "email", to: "finance@globalentryhub.com" },
    discrimination: { type: "email", to: "hr@globalentryhub.com" },
    privacy: { type: "webhook", to: "https://hooks.slack.com/services/T000/B000/privacy" },
    spam: { type: "webhook", to: "https://hooks.slack.com/services/T000/B000/spam" },
    default: { type: "email", to: "moderation@globalentryhub.com" },
  },

  smtpHost: process.env.SMTP_HOST || "smtp.sendgrid.net",
  smtpPort: parseInt(process.env.SMTP_PORT || "587"),
  smtpSecure: false,
  smtpUser: process.env.SMTP_USER || "apikey",
  smtpPass: process.env.SMTP_PASS || "",
  fromEmail: "alerts@globalentryhub.com",

  alertThrottleMs: 10 * 60 * 1000,
};

module.exports = notificationConfig;
