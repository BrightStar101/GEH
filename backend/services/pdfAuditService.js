const PDFDownloadAudit = require('../models/pdfDownloadAuditModel');
const { anonymizeIP } = require('../utils/ipUtils');
const { resolveGeoMetadata } = require('./geoResolverService');
const logger = require('../utils/loggerUtils');

/**
 * Records PDF download activity with anonymized and geo-enriched metadata.
 */
async function recordPDFDownload({ userId, formId, ip, locale = 'en', timestamp = new Date() }) {
  try {
    if (!userId || !formId) {
      logger.logWarn('PDFAuditService: Missing userId or formId. Audit skipped.');
      return;
    }

    const maskedIP = anonymizeIP(ip);
    const geo = await resolveGeoMetadata(ip);

    const auditEntry = new PDFDownloadAudit({
      userId,
      formId,
      ip: maskedIP,
      locale,
      timestamp,
      geo,
    });

    await auditEntry.save();
    logger.logInfo(`PDFAuditService: Recorded PDF download for form ${formId} by user ${userId}.`);
  } catch (error) {
    logger.logError('PDFAuditService: Failed to record audit log.', error);
  }
}

async function getRecentPDFDownloads(limit = 100) {
  try {
    return await PDFDownloadAudit.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    logger.logError('PDFAuditService: Error fetching audit logs.', error);
    return [];
  }
}

module.exports = {
  recordPDFDownload,
  getRecentPDFDownloads,
};
