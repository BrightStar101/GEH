/**
 * languageConfig.js
 *
 * Global Entry Hub (GEH)
 * Language Configuration Map
 *
 * Purpose:
 * Declares language support status and fallback behavior for all agents and frontend/localized UX layers.
 * Supports regional trust features, language detection fallback, and PDF label routing.
 */

const languageConfig = {
  supportedLanguages: ['en', 'es', 'hi', 'zh'],

  fallbackLanguages: {
    'fr': 'en',
    'pt': 'en',
    'tl': 'en',
    'uk': 'en',
    'ar': 'en',
    'bn': 'hi',
    'ur': 'hi',
    'ja': 'zh',
    'ko': 'zh'
  },

  comingSoonLanguages: ['de', 'it', 'vi', 'fa', 'sw', 'am'],

  formattingRules: {
    'en': { currency: 'USD', dateFormat: 'MM/DD/YYYY' },
    'es': { currency: 'MXN', dateFormat: 'DD/MM/YYYY' },
    'hi': { currency: 'INR', dateFormat: 'DD-MM-YYYY' },
    'zh': { currency: 'CNY', dateFormat: 'YYYY-MM-DD' }
  }
};

module.exports = languageConfig;
