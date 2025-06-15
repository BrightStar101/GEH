/**
 * sendgridWebhookController.js
 *
 * Secure webhook controller for SendGrid's Event Notification system.
 * Verifies authenticity using SendGrid's Ed25519 signature validation.
 * 
 * Docs: https://docs.sendgrid.com/for-developers/tracking-events/event
 */

const crypto = require('crypto');
const { logInfo, logError } = require('../utils/loggerUtils');

const SENDGRID_PUBLIC_KEY = process.env.SENDGRID_SIGNING_KEY;

/**
 * Verifies SendGrid's signature using Ed25519
 */
function isValidSignature(signature, timestamp, payload) {
  try {
    if (!SENDGRID_PUBLIC_KEY) {
      throw new Error("SendGrid signing key not configured");
    }

    const decodedSignature = Buffer.from(signature, "base64");
    const signedPayload = Buffer.from(timestamp + payload);
    const publicKeyBuffer = Buffer.from(SENDGRID_PUBLIC_KEY, "base64");

    return crypto.verify(
      null,
      signedPayload,
      {
        key: publicKeyBuffer,
        format: "der",
        type: "spki",
      },
      decodedSignature
    );
  } catch (err) {
    logError("❌ SendGrid signature validation failed", err);
    return false;
  }
}

/**
 * POST /api/webhooks/sendgrid
 */
async function handleSendgridWebhook(req, res) {
  try {
    const signature = req.headers["x-twilio-email-event-webhook-signature"];
    const timestamp = req.headers["x-twilio-email-event-webhook-timestamp"];
    const rawBody = JSON.stringify(req.body);

    if (!isValidSignature(signature, timestamp, rawBody)) {
      return res.status(401).json({ success: false, message: "Invalid SendGrid signature" });
    }

    const events = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({ success: false, message: "Expected array of events" });
    }

    for (const event of events) {
      const { email, event: eventType, timestamp, sg_event_id, category } = event;

      if (!email || !eventType || !timestamp) {
        logError("⚠️ Incomplete webhook event", event);
        continue;
      }

      logInfo("📬 SendGrid Event Received", {
        email,
        eventType,
        timestamp: new Date(timestamp * 1000).toISOString(),
        sg_event_id,
        category,
      });

      // Extend: Save to database, update delivery state
    }

    return res.status(200).json({ success: true, received: events.length });
  } catch (err) {
    logError("❌ SendGrid webhook handler failed", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
}

module.exports = {
  handleSendgridWebhook,
};
