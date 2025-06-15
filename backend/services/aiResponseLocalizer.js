const languageConfig = require('config/languageConfig');
const agentLanguageMatrix = require('config/agentLanguageMatrix');
const { sanitizeLanguageKey } = require('utils/sanitizeLanguageKey');
const { logger } = require('utils/loggerUtils');

const translationMap = {
  "Form completed successfully.": {
    "en-US": "Form completed successfully.",
    "es-ES": "Formulario completado con éxito.",
    "zh-CN": "表格已成功填写。",
    "hi-IN": "फॉर्म सफलतापूर्वक पूरा हो गया है।",
  },
};

function cleanFormatting(input) {
  try {
    return input
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch (err) {
    logger.logWarn("cleanFormatting failed:", err);
    return input;
  }
}

function logFallbackTelemetry(langCode, agentName) {
  try {
    fetch("https://geh.api/debugger/logAIFallback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent: agentName,
        langCode,
        fallbackTo: languageConfig.defaultLanguage,
        event: "ai-localization-fallback",
      }),
    });
  } catch (err) {
    // silent fail
  }
}

function localizeAiResponse({ agentName, rawResponse, langCode }) {
  try {
    if (!agentName || !rawResponse || !langCode) {
      throw new Error("Missing required input for AI response localization.");
    }

    const normalizedLang = sanitizeLanguageKey(langCode);
    const tier = agentLanguageMatrix.getTier(agentName, normalizedLang);

    if (!tier || tier === "comingSoon") {
      logFallbackTelemetry(normalizedLang, agentName);
      return cleanFormatting(rawResponse);
    }

    const localizedResponse = Object.entries(translationMap).reduce((output, [sourceText, translations]) => {
      const localizedText = translations[normalizedLang] || translations[languageConfig.defaultLanguage];
      return output.replace(sourceText, localizedText);
    }, rawResponse);

    return cleanFormatting(localizedResponse);
  } catch (err) {
    logger.logError("localizeAiResponse failed:", err);
    return rawResponse;
  }
}

module.exports = {
  localizeAiResponse,
};
