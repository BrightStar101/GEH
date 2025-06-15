const EmailAuditLog = require('models/emailAuditModel');
const { logError } = require('utils/loggerUtils');

async function logEmailSend(data) {
  try {
    if (!data.email || !data.templateId || !data.status || !data.language) {
      throw new Error('Missing required email log fields.');
    }

    const emailLog = new EmailAuditLog({
      userId: data.userId,
      email: data.email,
      templateId: data.templateId,
      language: data.language,
      status: data.status,
      sendgridMessageId: data.sendgridMessageId || null,
      wave: data.wave || null,
      region: data.region || null,
      sourceChannel: data.sourceChannel || null,
      funnelStage: data.funnelStage || 'unknown',
      reason: data.reason || null,
      retryCount: data.retryCount || 0,
      deliveryLatencyMs: data.deliveryLatencyMs || null,
    });

    return await emailLog.save();
  } catch (err) {
    logError('Email log save failed:', err.message);
    throw new Error('Failed to save email audit log.');
  }
}

async function getEmailLogs(filterOpts = {}) {
  try {
    const query = {};

    if (filterOpts.status) query.status = filterOpts.status;
    if (filterOpts.email) query.email = filterOpts.email.toLowerCase();
    if (filterOpts.templateId) query.templateId = filterOpts.templateId;
    if (filterOpts.wave) query.wave = filterOpts.wave;
    if (filterOpts.startDate || filterOpts.endDate) {
      query.createdAt = {};
      if (filterOpts.startDate) query.createdAt.$gte = new Date(filterOpts.startDate);
      if (filterOpts.endDate) query.createdAt.$lte = new Date(filterOpts.endDate);
    }

    return await EmailAuditLog.find(query).sort({ createdAt: -1 }).limit(500);
  } catch (err) {
    logError('Email log retrieval failed:', err.message);
    throw new Error('Failed to retrieve email logs.');
  }
}

async function getSummaryStats(filterOpts = {}) {
  try {
    const match = {};
    if (filterOpts.wave) match.wave = filterOpts.wave;
    if (filterOpts.startDate || filterOpts.endDate) {
      match.createdAt = {};
      if (filterOpts.startDate) match.createdAt.$gte = new Date(filterOpts.startDate);
      if (filterOpts.endDate) match.createdAt.$lte = new Date(filterOpts.endDate);
    }

    const results = await EmailAuditLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {};
    results.forEach((r) => {
      summary[r._id] = r.count;
    });

    return summary;
  } catch (err) {
    logError('Email summary stats failed:', err.message);
    throw new Error('Failed to generate email summary.');
  }
}

module.exports = {
  logEmailSend,
  getEmailLogs,
  getSummaryStats,
};
