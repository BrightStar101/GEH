/**
 * i18nService.js
 *
 * Loads localized labels for PDF generation and fallback messaging
 */

const path = require('path');
const fs = require('fs');
const { logError } = require('../utils/loggerUtils');

const FALLBACK_LANGUAGE = "en-US";
const TRANSLATION_PATH = path.join(__dirname, "../i18n/pdfLabels");

/**
 * Attempts to load a translation file by language code
 */
function loadTranslation(languageCode) {
  const normalized = languageCode?.toLowerCase() || FALLBACK_LANGUAGE;
  const filePath = path.join(TRANSLATION_PATH, `pdfLabels.${normalized}.json`);

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Translation file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(content);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Translation schema invalid or empty.");
    }

    return parsed;
  } catch (err) {
    logError("❌ Failed to load translation", { lang: languageCode, err: err.message });

    try {
      const fallbackContent = fs.readFileSync(
        path.join(TRANSLATION_PATH, `pdfLabels.${FALLBACK_LANGUAGE}.json`),
        "utf8"
      );
      return JSON.parse(fallbackContent);
    } catch (fallbackErr) {
      logError("❌ Failed to load fallback translation", fallbackErr);
      return {};
    }
  }
}

/**
 * Returns a label from a translation map, or a placeholder
 */
function getLabel(translationMap, key) {
  if (!translationMap || typeof translationMap !== "object") return "";
  return translationMap[key] || `[${key}]`;
}

module.exports = {
  loadTranslation,
  getLabel,
};
