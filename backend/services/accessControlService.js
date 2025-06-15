const fs = require('fs');
const path = require('path');
const { getLatestActivePlan, interpretPlanEntitlements } = require('services/purchaseHistoryService');

function logAccessEvent({ userId, action, allowed, reason = '' }) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] user=${userId} action=${action} allowed=${allowed} reason=${reason}\n`;
    const logPath = path.join(__dirname, '../../logs/access-events.log');
    fs.appendFileSync(logPath, logEntry);
  } catch (err) {
    console.error('AccessControlService: Failed to write audit log', err.message);
  }
}

async function checkUserAccess({ userId, action }) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Missing or invalid user ID');
    }

    const plan = await getLatestActivePlan(userId);
    if (!plan) {
      logAccessEvent({ userId, action, allowed: false, reason: 'No active plan' });
      return { allowed: false, reason: 'No active plan found' };
    }

    const summary = interpretPlanEntitlements(plan);
    const { maxForms, maxPdfs } = summary.entitlements;
    const { formsUsed, pdfDownloads } = summary.usage;
    const { aiStatus } = summary;

    let result = { allowed: true, tier: summary.tier };

    if (action === 'fillForm' && formsUsed >= maxForms) {
      result = { allowed: false, reason: 'Form limit reached', tier: summary.tier };
    }

    if (action === 'downloadPdf' && pdfDownloads >= maxPdfs) {
      result = { allowed: false, reason: 'Download limit reached', tier: summary.tier };
    }

    if (action === 'useAi' && !aiStatus.active) {
      result = { allowed: false, reason: 'AI access window expired', tier: summary.tier };
    }

    logAccessEvent({
      userId,
      action,
      allowed: result.allowed,
      reason: result.reason || '',
    });

    return result;
  } catch (err) {
    console.error('AccessControlService: Access check failed', err.message);
    logAccessEvent({
      userId,
      action,
      allowed: false,
      reason: 'Internal access control failure',
    });
    return {
      allowed: false,
      reason: 'Access check failed',
    };
  }
}

module.exports = { checkUserAccess };
