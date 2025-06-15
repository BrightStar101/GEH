/**
 * deleteMyDataService.js
 *
 * Handles GDPR/CCPA "Delete My Data" requests
 * Permanently deletes all records linked to a user
 */

const Form = require('../models/formModel');
const Review = require('../models/reviewModel');
const OcrAudit = require('../models/ocrAuditModel');
const UGCSubmission = require('../models/ugcSubmissionModel');
const StorageMetadata = require('../models/storageMetadataModel');
const UpgradeLog = require('../models/upgradeLogsModel');
const PDFDownloadAudit = require('../models/pdfDownloadAuditModel');
const logger = require('../utils/loggerUtils');

/**
 * Deletes all identifiable records linked to a given userId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function deleteAllUserData(userId) {
  try {
    if (!userId) throw new Error('Missing userId');

    await Promise.allSettled([
      Form.deleteMany({ userId }),
      Review.deleteMany({ userId }),
      OcrAudit.deleteMany({ userId }),
      UGCSubmission.deleteMany({ userId }),
      StorageMetadata.deleteMany({ userId }),
      UpgradeLog.deleteMany({ userId }),
      PDFDownloadAudit.deleteMany({ userId }),
    ]);

    logger.logInfo(`GDPR Deletion completed for user: ${userId}`);
    return true;
  } catch (err) {
    logger.logError(`DeleteMyDataService failed: ${err.message}`);
    return false;
  }
}

module.exports = {
  deleteAllUserData,
};
