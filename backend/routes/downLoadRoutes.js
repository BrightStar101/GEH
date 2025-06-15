// routes/downloadController.js

const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const logger = require('../utils/loggerUtils');
const { isNoAIMode } = require('../utils/noAIMode');
// const { hasUsedFreeForm } = require('../utils/firstFormTracker');
const { ForbiddenError, NotFoundError } = require('../utils/errorUtils');
const Form = require('../models/formModel'); // tracks PDF paths + metadata
const { authenticate } = require('../middleware/authMiddleware');
const { getUserById } = require('../services/userProfileService');
const { formAvailable } = require('../utils/tierUtils');
const AuditLog = require('../models/AuditLog');

/**
 * GET /api/download/:formId
 * Allows user to download a generated PDF if permitted.
 */
router.get('/:formId', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    const { formId } = req.params;

    if (!formId) throw new Error('Missing form ID');

    const pdfRecord = await Form.findOne({ userId: user.id, formId }).sort({ createdAt: -1 });

    if (!pdfRecord || !fs.existsSync(pdfRecord.filePath)) {
      logger.logWarn({ action: 'pdf_not_found', userId: user.id, formId });
      throw new NotFoundError('Your completed form was not found.');
    }

    // Enforce expiration (if set)
    if (pdfRecord.expiresAt && new Date(pdfRecord.expiresAt) < new Date()) {
      logger.logInfo({
        action: 'pdf_expired',
        userId: user.id,
        formId,
        expiredAt: pdfRecord.expiresAt,
      });

      throw new ForbiddenError('Your form has expired. Upgrade to restore access.');
    }

    // If free user already used free form and isn't admin, block
    const userInfo = await getUserById(user?.id);
    if (!formAvailable(userInfo)) {
      logger.logWarn({
        action: 'pdf_blocked_free',
        userId: user.id,
        formId,
        reason: user?.planTier === 'free' ? 'Free form already used' : 'Limit exceeded',
      });

      // logger.triggerCLA({
      //   event: 'pdf_download_denied',
      //   userId: user.id,
      //   tier: user?.planTier,
      //   formId,
      // });

      throw new ForbiddenError('You’ve already used your free form. Upgrade to access more downloads.');
    }

    // Log successful download
    await new AuditLog({
      userId: user.id,
      action: 'PDF download',
      metadata: {
        formId
      }
    }).save();
    
    logger.logInfo({
      action: 'pdf_downloaded',
      userId: user.id,
      formId,
      path: pdfRecord.filePath,
    });

    // Serve file
    return res.download(pdfRecord.filePath);
  } catch (err) {
    logger.logError({
      action: 'pdf_download_failed',
      userId: req.user?.id || 'unknown',
      error: err.message,
    });
    console.log(err)

    next(err);
  }
});

module.exports = router;
