// File: /config/languageConfig.js

/**
 * languageConfig.js
 *
 * Defines supported languages for GEH platform-wide multilingual support,
 * including region codes, tier labels (beta/verified), directionality,
 * and flag icons for UI display.
 */

const languageConfig = {
  defaultLanguage: "en-US",
  fallbackLanguage: "en-US",

  supportedLanguages: [
    {
      code: "en-US",
      name: "English (United States)",
      nativeName: "English",
      direction: "ltr",
      tier: "verified",
      flagIcon: "/flags/us.svg",
    },
    {
      code: "es-ES",
      name: "Spanish (Spain)",
      nativeName: "Español",
      direction: "ltr",
      tier: "verified",
      flagIcon: "/flags/es.svg",
    },
    {
      code: "es-MX",
      name: "Spanish (Mexico)",
      nativeName: "Español (México)",
      direction: "ltr",
      tier: "beta",
      flagIcon: "/flags/mx.svg",
    },
    {
      code: "hi-IN",
      name: "Hindi (India)",
      nativeName: "हिन्दी",
      direction: "ltr",
      tier: "beta",
      flagIcon: "/flags/in.svg",
    },
    {
      code: "zh-CN",
      name: "Chinese (Simplified)",
      nativeName: "中文 (简体)",
      direction: "ltr",
      tier: "verified",
      flagIcon: "/flags/cn.svg",
    },
    {
      code: "zh-TW",
      name: "Chinese (Traditional)",
      nativeName: "中文 (繁體)",
      direction: "ltr",
      tier: "comingSoon",
      flagIcon: "/flags/tw.svg",
    },
  ],

  /**
   * Returns the full language object for a given code.
   * Falls back to default if code is invalid.
   * @param {string} code
   * @returns {object}
   */
  getByCode(code) {
    const lang = this.supportedLanguages.find((l) => l.code === code);
    return lang || this.supportedLanguages.find((l) => l.code === this.fallbackLanguage);
  },

  /**
   * Validates a given language code.
   * @param {string} code
   * @returns {boolean}
   */
  isValid(code) {
    return this.supportedLanguages.some((lang) => lang.code === code);
  },

  /**
   * Returns a filtered list of supported languages by tier.
   * @param {string} tierFilter - e.g., 'verified', 'beta', 'comingSoon'
   * @returns {Array}
   */
  getByTier(tierFilter) {
    return this.supportedLanguages.filter((lang) => lang.tier === tierFilter);
  },

  /**
   * Returns all languages excluding comingSoon for selector use.
   * @returns {Array}
   */
  getActiveLanguages() {
    return this.supportedLanguages.filter((lang) => lang.tier !== "comingSoon");
  },
};

export default languageConfig;
