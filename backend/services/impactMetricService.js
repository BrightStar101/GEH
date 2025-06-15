/**
 * impactMetricService.js
 *
 * Collects internal usage metrics for the Admin Impact Dashboard.
 * Fully anonymized. Serves dashboard at /admin-impact.
 */

const Form = require('../models/formModel');
const ChatAudit = require('../models/chatAuditModel'); // create if not yet added
const PDFDownloadAudit = require('../models/pdfDownloadAuditModel'); // already used
const logger = require('../utils/loggerUtils');

/**
 * Returns all metrics needed for /admin-impact
 */
async function getImpactMetrics() {
  try {
    const [totalForms, totalAISessions, totalDownloads] = await Promise.all([
      Form.countDocuments({}),
      ChatAudit.countDocuments({}),
      PDFDownloadAudit.countDocuments({}),
    ]);

    // Top language usage (chat sessions)
    const langAgg = await ChatAudit.aggregate([
      { $group: { _id: "$lang", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topLanguages = langAgg.map(l => ({
      name: l._id || "unknown",
      count: l.count,
    }));

    // Top access by country (PDF downloads)
    const countryAgg = await PDFDownloadAudit.aggregate([
      { $group: { _id: "$geo.country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topCountries = countryAgg.map(c => ({
      name: c._id || "unknown",
      count: c.count,
    }));

    return {
      totalForms,
      totalAISessions,
      totalDownloads,
      topLanguages,
      topCountries,
    };
  } catch (err) {
    logger.logError("ImpactMetricService: Failed to collect dashboard metrics", err);
    throw err;
  }
}

module.exports = {
  getImpactMetrics,
};
