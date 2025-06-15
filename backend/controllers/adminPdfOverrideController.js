// enhancements/controllers/adminPdfOverrideController.js

/**
 * adminPdfOverrideController.js
 *
 * Allows admin users to:
 * - Extend PDF expiry by +30, +60, or +90 days
 * - Manually delete or republish PDFs
 * - Flag PDFs for audit review
 */

const PDF = require('../models/PDF');
const { logComplianceTrigger } = require('../services/loggerService');

/**
 * @route PATCH /api/admin/pdf/:id/extend
 * @desc Extend a PDF’s expiry window
 * @access Admin Only
 */
async function extendPdfExpiry(req, res) {
  try {
    const { id } = req.params;
    const { extensionDays = 30 } = req.body;

    if (![30, 60, 90].includes(extensionDays)) {
      return res.status(400).json({ error: 'Invalid extension window.' });
    }

    const pdf = await PDF.findById(id);
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found.' });
    }

    const newDate = new Date(pdf.createdAt.getTime() + extensionDays * 86400000);
    pdf.createdAt = newDate;
    await pdf.save();

    logComplianceTrigger({
      type: 'PDFExpiryExtended',
      fileId: id,
      newExpiryDate: newDate.toISOString(),
      extendedByDays: extensionDays,
    });

    return res.status(200).json({ message: `PDF expiry extended by ${extensionDays} days.` });
  } catch (err) {
    console.error('[Admin PDF Override] Failed to extend expiry:', err.message);
    return res.status(500).json({ error: 'Failed to extend PDF expiry.' });
  }
}

/**
 * @route DELETE /api/admin/pdf/:id
 * @desc Manually deletes a PDF by ID
 * @access Admin Only
 */
async function deletePdf(req, res) {
  try {
    const { id } = req.params;
    const pdf = await PDF.findById(id);

    if (!pdf) return res.status(404).json({ error: 'PDF not found.' });

    await PDF.findByIdAndDelete(id);

    logComplianceTrigger({
      type: 'PDFManuallyDeleted',
      fileId: id,
    });

    return res.status(200).json({ message: 'PDF deleted.' });
  } catch (err) {
    console.error('[Admin PDF Override] Failed to delete PDF:', err.message);
    return res.status(500).json({ error: 'Delete failed.' });
  }
}

/**
 * @route POST /api/admin/pdf/:id/flag
 * @desc Flags a PDF for audit or CLA review
 * @access Admin Only
 */
async function flagPdfForAudit(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const pdf = await PDF.findById(id);
    if (!pdf) return res.status(404).json({ error: 'PDF not found.' });

    pdf.auditFlag = true;
    pdf.auditReason = reason || 'Flagged manually by admin.';
    await pdf.save();

    logComplianceTrigger({
      type: 'PDFAuditFlagged',
      fileId: id,
      reason: pdf.auditReason,
    });

    return res.status(200).json({ message: 'PDF flagged for audit.' });
  } catch (err) {
    console.error('[Admin PDF Override] Failed to flag PDF:', err.message);
    return res.status(500).json({ error: 'Audit flag failed.' });
  }
}

module.exports = {
  extendPdfExpiry,
  deletePdf,
  flagPdfForAudit,
};
