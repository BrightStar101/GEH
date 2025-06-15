// File: /frontend/agents/multilingualResponseManager.js

import i18n from "../i18n";
import languageConfig from "../config/languageConfig";
import agentLanguageMatrix from "../config/agentLanguageMatrix";
import { sanitizeLanguageKey } from "../utils/sanitizeLanguageKey";
import { isAgentLanguageAllowed } from "./languageMiddleware";

/**
 * agentPromptVariants
 *
 * Provides agent-specific intros by language.
 * Fallbacks to English if localized string not found.
 */
const agentPromptVariants = {
  Mira: {
    "en-US": "You are Mira, a compassionate immigration assistant who simplifies paperwork for humans.",
    "es-ES": "Eres Mira, una asistente compasiva de inmigración que simplifica el papeleo para los humanos.",
    "zh-CN": "你是Mira，一个富有同情心的移民助手，致力于简化人工流程。",
    "hi-IN": "आप Mira हैं — एक सहानुभूतिपूर्ण सहायक जो आप्रवासन प्रक्रिया को सरल बनाती हैं।",
  },
  Kairo: {
    "en-US": "You are Kairo, a financial intelligence agent who guides users with clarity and confidence.",
    "es-ES": "Eres Kairo, un agente de inteligencia financiera que guía a los usuarios con claridad y confianza.",
  },
  Lumo: {
    "en-US": "You are Lumo, a motivational career coach who inspires users to grow professionally.",
  },
};

/**
 * getLocalizedAgentPrompt
 *
 * Constructs a localized, agent-specific system prompt wrapper based on user language.
 * Returns null if the agent is not allowed to respond in the current language.
 *
 * @param {string} agentName - "Mira", "Kairo", or "Lumo"
 * @param {string} rawPrompt - The base task prompt to embed after the intro
 * @returns {{ prompt: string, lang: string, tier: string } | null}
 */
export function getLocalizedAgentPrompt(agentName, rawPrompt) {
  try {
    const currentLang = sanitizeLanguageKey(i18n.language);
    const agentCheck = isAgentLanguageAllowed(agentName, currentLang);

    if (!agentCheck.allowed) {
      return null;
    }

    const fallbackLang = languageConfig.defaultLanguage;

    const agentPrompt =
      (agentPromptVariants[agentName] && agentPromptVariants[agentName][currentLang]) ||
      (agentPromptVariants[agentName] && agentPromptVariants[agentName][fallbackLang]) ||
      "You are a helpful assistant.";

    const prompt = `${agentPrompt}\n\n${rawPrompt}`;

    return {
      prompt,
      lang: currentLang,
      tier: agentCheck.tier,
    };
  } catch (err) {
    console.warn("multilingualResponseManager.getLocalizedAgentPrompt failed:", err);
    return null;
  }
}
