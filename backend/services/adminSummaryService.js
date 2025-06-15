/**
 * adminAuditService.js
 *
 * Generates summarized audit reports for admin panel graphs or alerts
 */

const Review = require('../models/reviewModel');
const OcrAudit = require('../models/ocrAuditModel');
const PDFDownloadAudit = require('../models/pdfDownloadAuditModel');
const { logError } = require('../utils/loggerUtils');

/**
 * Returns total review count grouped by language
 */
async function getReviewSummaryByLang() {
  try {
    const summary = await Review.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 },
        },
      },
    ]);

    return summary.map((s) => ({
      language: s._id,
      count: s.count,
    }));
  } catch (err) {
    logError('AdminAuditService: Failed to summarize reviews by language', err.message);
    return [];
  }
}

/**
 * Returns count of OCR scans grouped by date
 */
async function getOcrActivityTrend() {
  try {
    const summary = await OcrAudit.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
    ]);

    return summary.map((s) => ({
      date: `${s._id.year}-${s._id.month}-${s._id.day}`,
      count: s.count,
    }));
  } catch (err) {
    logError('AdminAuditService: Failed to get OCR activity trend', err.message);
    return [];
  }
}

/**
 * Returns recent PDF download volumes for audit graphs
 */
async function getPdfDownloadSummary() {
  try {
    const result = await PDFDownloadAudit.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return result;
  } catch (err) {
    logError('AdminAuditService: Failed to get PDF download logs', err.message);
    return [];
  }
}

module.exports = {
  getReviewSummaryByLang,
  getOcrActivityTrend,
  getPdfDownloadSummary,
};
