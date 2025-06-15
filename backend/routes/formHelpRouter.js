// routes/formHelpRouter.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const logger = require('../services/loggerService');
const { supportedLanguages } = require('../config/languageSupport');
const { ForbiddenError } = require('../utils/errorUtils');

/**
 * GET /api/help/:formId/:questionName
 * Returns static help content for a given form + question + language
 */
router.get('/api/help/:formId/:questionName', async (req, res, next) => {
  try {
    const { formId, questionName } = req.params;
    const userLang = req.query.lang || 'en';
    const lang = supportedLanguages.includes(userLang) ? userLang : 'en';

    if (!formId || !questionName) {
      throw new ForbiddenError('Invalid form or question identifier.');
    }

    const helpPath = path.resolve(
      __dirname,
      `../schemas/formHelp/${formId}/${questionName}.${lang}.json`
    );

    if (!fs.existsSync(helpPath)) {
      logger.info({
        action: 'help_missing',
        formId,
        questionName,
        lang,
      });

      // Trigger retraining if users request missing help repeatedly
      logger.triggerCLA({
        event: 'help_missing_request',
        userId: req.user._id,
        formId,
        questionName,
        lang,
      });

      return res.json({
        help: null,
        fallback: `Sorry, there's no guidance available for this field in ${lang.toUpperCase()} yet.`,
        cta: 'Want personalized help? Upgrade to chat with Mira.',
        aiUpgradeAvailable: true,
      });
    }

    const helpContent = JSON.parse(fs.readFileSync(helpPath, 'utf-8'));

    logger.success({
      action: 'help_served',
      userId: req.user._id,
      formId,
      questionName,
      lang,
    });

    return res.json({
      help: helpContent,
      aiUpgradeAvailable: true,
    });
  } catch (err) {
    logger.error({
      action: 'help_request_failed',
      userId: req.user?._id,
      error: err.message,
    });

    next(err);
  }
});

module.exports = router;
