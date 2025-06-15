/**
 * fallbackLanguagePicker.js
 * Fallback Language Selector (Batch 33)
 */

const { logWarn, logError } = require('./loggerUtils');

const supportedLanguages = ['en', 'es', 'fr', 'hi', 'zh', 'pt', 'tl', 'uk', 'ar'];

const regionalFallbackMap = {
  'bn': 'hi',
  'ur': 'hi',
  'ja': 'zh',
  'de': 'en',
  'fa': 'ar',
  'pl': 'uk',
  'vi': 'en',
  'ko': 'zh'
};

function pickFallbackLanguage(requestedLang) {
  try {
    if (!requestedLang || typeof requestedLang !== 'string') {
      logWarn('Invalid or missing requested language, defaulting to English.');
      return 'en';
    }

    const normalizedLang = requestedLang.toLowerCase();

    if (supportedLanguages.includes(normalizedLang)) {
      return normalizedLang;
    }

    const mapped = regionalFallbackMap[normalizedLang];
    if (mapped && supportedLanguages.includes(mapped)) {
      return mapped;
    }

    logWarn(`Unsupported language '${requestedLang}' — defaulting to 'en'.`);
    return 'en';
  } catch (err) {
    logError('Error in fallbackLanguagePicker:', err);
    return 'en';
  }
}

module.exports = {
  pickFallbackLanguage
};
