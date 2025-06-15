const EmailAuditLog = require('models/emailAuditModel');
const { sendEmail, templateMap } = require('utils/sendgridClient');
const emailAuditService = require('services/emailAuditService');
const { logInfo, logError } = require('utils/loggerUtils');

async function retryFailedEmails(waveId, adminTrigger = 'system') {
  const results = {
    waveId,
    triggeredBy: adminTrigger,
    attempted: 0,
    resent: 0,
    failed: 0,
    errors: [],
  };

  try {
    const failedLogs = await EmailAuditLog.find({ wave: waveId, status: 'failed' }).lean();
    if (!failedLogs.length) {
      logInfo(`No failed logs found for retry on wave ${waveId}`);
      return { ...results, message: 'No failed emails to retry.' };
    }

    results.attempted = failedLogs.length;

    for (const log of failedLogs) {
      const lang = ['en', 'es', 'hi', 'zh'].includes(log.language) ? log.language : 'en';
      const templateGroup = getTemplateGroupFromId(log.templateId, lang);

      try {
        const sendResult = await sendEmail({
          to: log.email,
          templateGroup,
          language: lang,
          dynamicTemplateData: {
            firstName: log.firstName || 'friend',
          },
        });

        await emailAuditService.logEmailSend({
          email: log.email,
          templateId: templateMap[templateGroup][lang],
          language: lang,
          status: sendResult.success ? 'sent' : 'failed',
          sendgridMessageId: sendResult.sendgridMessageId || null,
          wave: waveId,
          funnelStage: log.funnelStage || 'unknown',
          region: log.region || '',
          sourceChannel: log.sourceChannel || 'wave_retry',
          reason: sendResult.error || null,
        });

        if (sendResult.success) {
          results.resent += 1;
        } else {
          results.failed += 1;
          results.errors.push({ email: log.email, error: sendResult.error });
        }
      } catch (sendErr) {
        logError(`Retry error for ${log.email}: ${sendErr.message}`);
        results.failed += 1;
        results.errors.push({ email: log.email, error: sendErr.message });
      }
    }

    return results;
  } catch (err) {
    logError('retryFailedEmails global failure:', err.message);
    return { ...results, message: 'Retry operation failed', error: err.message };
  }
}

function getTemplateGroupFromId(templateId, language) {
  for (const groupKey of Object.keys(templateMap)) {
    if (templateMap[groupKey][language] === templateId) {
      return groupKey;
    }
  }
  return 'unknown_template';
}

module.exports = retryFailedEmails;
