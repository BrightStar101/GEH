/**
 * sendgridSignatureValidator.js
 *
 * Validates SendGrid webhook authenticity using signature headers
 * Protects against spoofed POST events
 */

const crypto = require('crypto');

/**
 * Returns true if the webhook signature is valid
 * @param {Object} headers - from Express req.headers
 * @param {string} rawBody - raw body string from req
 * @returns {boolean}
 */
function isSendgridWebhookValid(headers, rawBody) {
  try {
    const timestamp = headers['x-twilio-email-event-webhook-timestamp'];
    const signature = headers['x-twilio-email-event-webhook-signature'];
    const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;

    if (!timestamp || !signature || !publicKey) return false;

    const verifier = crypto.createVerify('sha256');
    verifier.update(timestamp + rawBody);
    verifier.end();

    return verifier.verify(publicKey, signature, 'base64');
  } catch (err) {
    console.error('SendGridSignatureValidator error:', err.message);
    return false;
  }
}

module.exports = {
  isSendgridWebhookValid,
};
