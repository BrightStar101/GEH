const sgMail = require('@sendgrid/mail');
const config = require('config/config');
const { logError } = require('utils/loggerUtils');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, html, text = "", from = config.SUPPORT_EMAIL }) {
  try {
    if (!to || !subject || !html) {
      throw new Error("Missing required email parameters.");
    }

    const msg = {
      to,
      from,
      subject,
      text,
      html,
    };

    const response = await sgMail.send(msg);
    return response;
  } catch (err) {
    logError("emailService.sendEmail failed:", err);
    throw err;
  }
}

module.exports = {
  sendEmail,
};
