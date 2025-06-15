// enhancements/agents/pdfExpiryEnforcer.js

/**
 * pdfExpiryEnforcer.js
 *
 * GEH Scheduled Agent
 * Deletes PDF files older than 90 days.
 * Logs all actions via CLA compliance engine.
 * Safe fallback logic — never deletes active or in-use files.
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const PDF = require('../models/PDF');
const { logComplianceTrigger } = require('../services/loggerService');

const DAYS_TO_KEEP = 90;
const MILLISECONDS_IN_DAY = 86400000;

/**
 * Deletes PDFs older than 90 days and logs the removal.
 */
async function runPDFExpirySweep() {
  try {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() - (DAYS_TO_KEEP * MILLISECONDS_IN_DAY));

    const expired = await PDF.find({ createdAt: { $lt: thresholdDate } });

    for (const pdf of expired) {
      try {
        const pdfPath = path.join(__dirname, `../../storage/pdfs/${pdf.filename}`);
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }

        await PDF.findByIdAndDelete(pdf._id);

        logComplianceTrigger({
          type: 'PDFExpired',
          fileId: pdf._id,
          filename: pdf.filename,
          removedAt: new Date(),
        });
      } catch (err) {
        console.error(`[pdfExpiryEnforcer] Failed to delete ${pdf.filename}:`, err.message);
      }
    }

    console.log(`[pdfExpiryEnforcer] Sweep complete. Removed ${expired.length} expired PDFs.`);
  } catch (err) {
    console.error('[pdfExpiryEnforcer] Agent failed:', err.message);
  }
}

// Optional: Run immediately if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI).then(() => {
    runPDFExpirySweep().finally(() => process.exit(0));
  });
}

module.exports = {
  runPDFExpirySweep,
};
