// File: /frontend/agents/languageMiddleware.js

import languageConfig from "../../config/languageConfig";
import agentLanguageMatrix from "../../config/agentLanguageMatrix";
import { sanitizeLanguageKey } from "../utils/sanitizeLanguageKey";

/**
 * isAgentLanguageAllowed
 *
 * Prevents an agent from executing if the selected language is not supported or is disabled.
 * Used before triggering agent interactions (e.g., AI form filling, chat requests).
 *
 * @param {string} agentName - e.g., "Mira"
 * @param {string} rawLangCode - e.g., "es-MX" (from i18n or user context)
 * @returns {{ allowed: boolean, tier: string|null, reason?: string }}
 */
export function isAgentLanguageAllowed(agentName, rawLangCode) {
  try {
    if (!agentName || !rawLangCode) {
      return { allowed: false, tier: null, reason: "Missing agent or language" };
    }

    const normalizedLang = sanitizeLanguageKey(rawLangCode);
    const tier = agentLanguageMatrix.getTier(agentName, normalizedLang);
    const isEnabled = agentLanguageMatrix.isSupported(agentName, normalizedLang);

    if (!isEnabled) {
      return {
        allowed: false,
        tier: tier || null,
        reason: `Language ${normalizedLang} is not enabled or supported by ${agentName}`,
      };
    }

    return {
      allowed: true,
      tier,
    };
  } catch (err) {
    console.warn("languageMiddleware: agent language check failed", err);
    return {
      allowed: false,
      tier: null,
      reason: "Middleware failure",
    };
  }
}
