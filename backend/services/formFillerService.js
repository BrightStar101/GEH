// services/formFillerService.js

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
// const sanitizeInput = require('../utils/sanitizeInput');
const logger = require('../utils/loggerUtils');
// const { recordFreeFormUsed } = require('../utils/firstFormTracker');
// const { saveUserPDFMetadata } = require('../utils/pdfTracker');
const { ForbiddenError, ValidationError } = require('../utils/errorUtils');
const { getUserById } = require('./userProfileService');

/**
 * Fills a form using schema-defined fields and user responses.
 * Generates a downloadable PDF, applies monetization gating.
 *
 * @param {Object} options - Includes userId, formId, schema, answers, plan info
 * @returns {Promise<string>} - Path to generated PDF file
 */
async function generateFormPDF({ userId, formId, schema, answers }) {
  try {
    if (!userId || !formId || !schema || !answers) {
      throw new ValidationError('Missing required input to generate PDF');
    }

    // Enforce field completion based on schema
    const missingFields = schema.questions.filter(q => {
      const key = q.name;
      return q.required && (!answers[key] || answers[key].trim() === '');
    });

    if (missingFields.length > 0) {
      throw new ValidationError(`Incomplete form: missing ${missingFields.length} required fields.`);
    }

    // Create PDF
    const pdf = new PDFDocument();
    const fileName = `${formId}_${userId}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../storage/forms/', fileName);

    pdf.pipe(fs.createWriteStream(filePath));

    pdf.fontSize(16).text(`Form: ${formId}`, { underline: true });
    pdf.moveDown();

    schema.questions.forEach((question, index) => {
      const key = question.name;
      const value = answers[key] || '—';//sanitizeInput(answers[key]) || '—';
      pdf.fontSize(12).text(`${index + 1}. ${question.label}: ${value}`);
    });

    pdf.end();

    // Record PDF metadata for download tracking + expiry
    // await saveUserPDFMetadata({
    //   userId,
    //   formId,
    //   filePath,
    //   expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
    // });

    // If free, log usage
    // if (isFree) {
    //   await recordFreeFormUsed(userId);
    // }

    const user = getUserById(userId);

    logger.logInfo({
      action: 'form_pdf_generated',
      userId,
      formId,
      plan: user?.planTier || 'free',
      filePath,
    });

    return filePath;
  } catch (err) {
    logger.logError({
      action: 'form_pdf_generation_failed',
      userId,
      formId,
      error: err.message,
    });

    throw err;
  }
}

module.exports = {
  generateFormPDF,
};
