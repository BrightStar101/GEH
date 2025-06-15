const sgMail = require('@sendgrid/mail');
const { logError } = require('utils/loggerUtils');

if (!process.env.SENDGRID_API_KEY) {
  logError('Missing SENDGRID_API_KEY. Cannot initialize SendGrid.');
  throw new Error('SendGrid API key not found in environment.');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const templateMap = {
  welcome_email: {
    en: 'd-WELCOME-EN123',
    es: 'd-WELCOME-ES456',
    hi: 'd-WELCOME-HI789',
    zh: 'd-WELCOME-ZH321',
  },
  receipt_confirmation: {
    en: 'd-RECEIPT-EN123',
    es: 'd-RECEIPT-ES456',
    hi: 'd-RECEIPT-HI789',
    zh: 'd-RECEIPT-ZH321',
  },
  story_thank_you: {
    en: 'd-STORY-EN123',
    es: 'd-STORY-ES456',
    hi: 'd-STORY-HI789',
    zh: 'd-STORY-ZH321',
  },
  expiration_warning: {
    en: 'd-EXPIRE-EN123',
    es: 'd-EXPIRE-ES456',
    hi: 'd-EXPIRE-HI789',
    zh: 'd-EXPIRE-ZH321',
  },
};

async function sendEmail({
  to,
  templateGroup,
  language = 'en',
  dynamicTemplateData = {},
  userId = null,
}) {
  const safeLang = ['en', 'es', 'hi', 'zh'].includes(language) ? language : 'en';

  try {
    const templateId =
      templateMap[templateGroup] && templateMap[templateGroup][safeLang];

    if (!templateId) {
      throw new Error(`No SendGrid template found for ${templateGroup} (${safeLang})`);
    }

    const msg = {
      to,
      from: process.env.SENDGRID_SENDER_EMAIL || 'noreply@globalentryhub.com',
      templateId,
      dynamicTemplateData,
    };

    const response = await sgMail.send(msg);
    const messageId = response[0]?.headers['x-message-id'] || null;

    return {
      success: true,
      sendgridMessageId: messageId,
      templateId,
      statusCode: response[0]?.statusCode,
    };
  } catch (err) {
    logError('SendGrid sendEmail failed:', err.message);
    return {
      success: false,
      error: err.message,
      templateGroup,
      language,
    };
  }
}

module.exports = {
  sendEmail,
  templateMap,
};
