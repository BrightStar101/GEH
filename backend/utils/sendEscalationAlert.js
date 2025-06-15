/**
 * sendEscalationAlert.js
 *
 * Sends an alert email to internal support/admin team for flagged AI outputs
 */

const sgMail = require('@sendgrid/mail');
const { SENDGRID_ALERT_TEMPLATE_ID } = require('../config/emailConfig');
const { supportEmail } = require('../config/platformConfig');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Triggers an internal alert email
 * @param {Object} payload
 * @param {string} payload.userId
 * @param {string} payload.input
 * @param {string} payload.output
 * @param {number} [payload.confidence]
 * @param {string} [payload.agent="mira"]
 * @param {Array<string>} [payload.flags]
 */
async function sendEscalationAlert({
  userId,
  input,
  output,
  confidence = null,
  agent = 'mira',
  flags = [],
}) {
  try {
    const msg = {
      to: supportEmail,
      from: supportEmail,
      templateId: SENDGRID_ALERT_TEMPLATE_ID,
      dynamic_template_data: {
        userId,
        input,
        output,
        confidence,
        agent,
        flags: flags.join(', '),
        timestamp: new Date().toISOString(),
      },
    };

    await sgMail.send(msg);
  } catch (err) {
    console.error('SendEscalationAlert: Failed to send alert email.', err.message);
  }
}

module.exports = {
  sendEscalationAlert,
};
