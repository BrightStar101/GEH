const { sendEmail, templateMap } = require('utils/sendgridClient');
const emailAuditService = require('services/emailAuditService');
const { logInfo, logWarn, logError } = require('utils/loggerUtils');

async function dispatchWaveEmailBatch(contacts, templateGroup, waveNumber, triggeredBy = 'system') {
  const seenEmails = new Set();
  const results = {
    total: contacts.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  const safeLang = (lang) => ['en', 'es', 'hi', 'zh'].includes(lang) ? lang : 'en';

  for (const contact of contacts) {
    const email = (contact.email || '').toLowerCase().trim();
    const language = safeLang(contact.language || 'en');
    const funnelStage = contact.funnelStage || 'unknown';
    const region = contact.region || null;
    const sourceChannel = contact.sourceChannel || null;

    if (!email || seenEmails.has(email)) {
      logWarn(`Skipping duplicate or invalid email: ${email}`);
      continue;
    }

    seenEmails.add(email);

    try {
      const sendResult = await sendEmail({
        to: email,
        templateGroup,
        language,
        dynamicTemplateData: {
          firstName: contact.firstName || 'friend',
        },
      });

      await emailAuditService.logEmailSend({
        email,
        templateId: templateMap[templateGroup][language],
        language,
        status: sendResult.success ? 'sent' : 'failed',
        sendgridMessageId: sendResult.sendgridMessageId || null,
        wave: waveNumber,
        region,
        funnelStage,
        sourceChannel,
        reason: sendResult.error || null,
      });

      if (sendResult.success) {
        results.sent += 1;
      } else {
        results.failed += 1;
        results.errors.push({ email, error: sendResult.error });
      }
    } catch (err) {
      logError(`Wave send error for ${email}: ${err.message}`);
      results.failed += 1;
      results.errors.push({ email, error: err.message });
    }
  }

  logInfo(`Wave ${waveNumber} completed. Sent: ${results.sent}, Failed: ${results.failed}`);
  return results;
}

module.exports = {
  dispatchWaveEmailBatch,
};
