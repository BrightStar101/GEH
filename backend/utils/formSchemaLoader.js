// utils/formSchemaLoader.js

const fs = require('fs');
const path = require('path');
const logger = require('../utils/loggerUtils');
// const { getUserPlanMetadata } = require('../services/planMetadataService');
// const { supportedLanguages } = require('../config/languageSupport');
const { ForbiddenError, NotFoundError } = require('../utils/errorUtils');
const formIndex = require('../config/formIndex'); // preload index
const NodeCache = require('node-cache'); // lightweight memory cache
const { getUserById } = require('../services/userProfileService');
const { getUserPlanStatusById } = require('../services/subscriptionService');

// Setup in-memory schema cache (30min TTL)
const schemaCache = new NodeCache({ stdTTL: 1800 });

/**
 * Loads and validates a form schema with caching, CLA triggers, and access logic.
 *
 * @param {string} formId - Target form (e.g., "I-130")
 * @param {string} userId - Authenticated user ID
 * @param {string} language - Preferred language
 * @returns {Object} Schema + metadata
 * @throws {ForbiddenError|NotFoundError|Error}
 */
async function loadFormSchema(formId, userId, language = 'en') {
  try {
    if (!formId || typeof formId !== 'string') throw new Error('Invalid formId');
    const lang = language;//supportedLanguages.includes(language) ? language : 'en';

    // Ensure formId exists in global formIndex
    const formMeta = formIndex.find(f => f.formId === formId);
    if (!formMeta) throw new NotFoundError(`Form ${formId} not registered`);

    // Check language support
    const resolvedLang = formMeta.languages.includes(lang) ? lang : 'en';

    // Check access tier
  // const metadata = await getUserPlanMetadata(userId);
    // const allowedForms = metadata?.allowedForms || [];
    // const maxForms = metadata?.maxForms || 0;
    const user = await getUserById(userId);
    const userPlan = await getUserPlanStatusById(userId);
    const isEligible =
      user?.role === 'admin' || userPlan?.maxForms > user?.formUsed;

    if (!isEligible) {
      logger.logInfo(`User ${userId} blocked from accessing ${formId}`);
      throw new ForbiddenError('Upgrade required to access this form.');
    }

    const cacheKey = `${formId}-${resolvedLang}`;
    if (schemaCache.has(cacheKey)) {
      logger.logInfo({ action: 'form_schema_loaded_cache', formId, userId, lang: resolvedLang });
      return {
        schema: schemaCache.get(cacheKey),
        confidence: 1.0,
        source: 'cache',
      };
    }

    // Load schema file
    const schemaPath = path.resolve(
      __dirname,
      `../schemas/formSchemas/${formId}.${resolvedLang}.json`
    );
    if (!fs.existsSync(schemaPath)) {
      throw new NotFoundError(`Form schema not found for ${formId} in ${resolvedLang}`);
    }

    const rawSchema = fs.readFileSync(schemaPath, 'utf-8');
    const parsedSchema = JSON.parse(rawSchema);

    // Cache for future access
    schemaCache.set(cacheKey, parsedSchema);

    // CLA trigger (form accessed)
    // logger.triggerCLA({
    //   event: 'form_schema_load',
    //   userId,
    //   formId,
    //   lang: resolvedLang,
    //   accessTier: user?.planTier || 'unknown',
    // });

    return {
      schema: parsedSchema,
      confidence: 1.0,
      source: 'disk',
    };
  } catch (err) {
    logger.logError({
      action: 'form_schema_failed',
      userId,
      formId,
      lang: language,
      error: err.message,
      fallbackAttempted: language !== 'en',
    });

    // Optional: drift monitor hook
    // logger.triggerDriftMonitor({
    //   type: 'form',
    //   formId,
    //   userId,
    //   lang: language,
    //   issue: err.message,
    // });
    
    throw err;
  }
}

module.exports = {
  loadFormSchema,
};
