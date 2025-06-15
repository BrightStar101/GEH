/**
 * Formats AI-generated responses from Mira with localization,
 * confidence scoring, fallback notices, and legal disclaimers.
 */

const { loadTranslation } = require('../services/i18nService');
const { logError } = require('./loggerUtils');

async function localizeResponse(rawResponse, targetLang, options = {}) {
  try {
    const {
      includeDisclaimer = true,
      includeConfidence = true,
      confidence = null,
    } = options;

    const translations = await loadTranslation(targetLang);
    let formatted = rawResponse;

    if (targetLang === 'es') {
      formatted = formatted.replace(/\b(usted)\b/gi, 'tú');
    }

    const disclaimerText = includeDisclaimer
      ? translations?.disclaimers?.mira || 'Mira is an AI assistant and not a lawyer.'
      : null;

    const tooltip =
      includeConfidence && typeof confidence === 'number'
        ? buildConfidenceTooltip(confidence, targetLang)
        : null;

    return {
      response: formatted,
      disclaimer: disclaimerText,
      tooltip,
    };
  } catch (err) {
    logError('Failed to localize Mira response:', err);
    return {
      response: rawResponse,
      disclaimer: null,
      tooltip: null,
    };
  }
}

function buildConfidenceTooltip(score, lang = 'en') {
  const level = score >= 0.9
    ? 'High confidence'
    : score >= 0.7
    ? 'Moderate confidence'
    : 'Low confidence';

  const tooltipTranslations = {
    en: {
      'High confidence': 'This answer is highly reliable.',
      'Moderate confidence': 'This answer is somewhat reliable.',
      'Low confidence': 'This answer may be incomplete or uncertain.',
    },
    es: {
      'High confidence': 'Esta respuesta es muy confiable.',
      'Moderate confidence': 'Esta respuesta es algo confiable.',
      'Low confidence': 'Esta respuesta podría ser incierta.',
    },
    hi: {
      'High confidence': 'यह उत्तर बहुत विश्वसनीय है।',
      'Moderate confidence': 'यह उत्तर कुछ हद तक विश्वसनीय है।',
      'Low confidence': 'यह उत्तर अधूरा या अनिश्चित हो सकता है।',
    },
  };

  return tooltipTranslations[lang]?.[level] || tooltipTranslations['en'][level];
}

async function getTranslatedDisclaimer(lang) {
  try {
    const translations = {}//await loadTranslation(lang);
    return translations?.disclaimers?.mira || 'Mira is an AI assistant and not a lawyer.';
  } catch (err) {
    logError('Failed to fetch translated disclaimer:', err);
    return 'Mira is an AI assistant and not a lawyer.';
  }
}

module.exports = {
  localizeResponse,
  getTranslatedDisclaimer,
};
