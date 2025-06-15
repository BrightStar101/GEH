const { sendEmail, templateMap } = require('utils/sendgridClient');
const emailAuditService = require('services/emailAuditService');
const { logError } = require('utils/loggerUtils');

async function sendWelcomeEmail(user) {
  try {
    const sendResult = await sendEmail({
      to: user.email,
      templateGroup: 'welcome_email',
      language: user.language || 'en',
      dynamicTemplateData: {
        firstName: user.firstName || 'there',
      },
      userId: user._id,
    });

    await emailAuditService.logEmailSend({
      userId: user._id,
      email: user.email,
      templateId: templateMap.welcome_email[user.language || 'en'],
      language: user.language || 'en',
      status: sendResult.success ? 'sent' : 'failed',
      sendgridMessageId: sendResult.sendgridMessageId,
      funnelStage: 'free_user',
      reason: sendResult.error || null,
    });

    return sendResult;
  } catch (err) {
    logError('sendWelcomeEmail failed:', err.message);
    return { success: false, error: err.message };
  }
}

async function sendReceiptEmail(user, purchaseData) {
  try {
    const sendResult = await sendEmail({
      to: user.email,
      templateGroup: 'receipt_confirmation',
      language: user.language || 'en',
      dynamicTemplateData: {
        firstName: user.firstName || '',
        planName: purchaseData.planName,
        amount: purchaseData.amount,
        purchaseDate: new Date(purchaseData.timestamp).toLocaleDateString(),
      },
      userId: user._id,
    });

    await emailAuditService.logEmailSend({
      userId: user._id,
      email: user.email,
      templateId: templateMap.receipt_confirmation[user.language || 'en'],
      language: user.language || 'en',
      status: sendResult.success ? 'sent' : 'failed',
      sendgridMessageId: sendResult.sendgridMessageId,
      funnelStage: 'paid_user',
      reason: sendResult.error || null,
    });

    return sendResult;
  } catch (err) {
    logError('sendReceiptEmail failed:', err.message);
    return { success: false, error: err.message };
  }
}

async function sendStoryThankYou(user, story = {}) {
  try {
    const sendResult = await sendEmail({
      to: user.email,
      templateGroup: 'story_thank_you',
      language: user.language || 'en',
      dynamicTemplateData: {
        firstName: user.firstName || '',
        storyTitle: story.title || 'your story',
      },
      userId: user._id,
    });

    await emailAuditService.logEmailSend({
      userId: user._id,
      email: user.email,
      templateId: templateMap.story_thank_you[user.language || 'en'],
      language: user.language || 'en',
      status: sendResult.success ? 'sent' : 'failed',
      sendgridMessageId: sendResult.sendgridMessageId,
      funnelStage: 'ugc_submitter',
      reason: sendResult.error || null,
    });

    return sendResult;
  } catch (err) {
    logError('sendStoryThankYou failed:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendWelcomeEmail,
  sendReceiptEmail,
  sendStoryThankYou,
};
