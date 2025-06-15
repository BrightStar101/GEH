// File: /config/agentLanguageMatrix.js

/**
 * agentLanguageMatrix.js
 *
 * Maps supported languages to agents (Mira, Kairo, Lumo),
 * with support tier (e.g., verified, beta) and `enabled` toggle.
 */

const agentLanguageMatrix = {
  Mira: {
    supported: [
      { code: "en-US", tier: "verified", enabled: true },
      { code: "es-ES", tier: "verified", enabled: true },
      { code: "zh-CN", tier: "verified", enabled: true },
      { code: "hi-IN", tier: "beta", enabled: true },
      { code: "es-MX", tier: "beta", enabled: false }, // soft-disabled for QA reasons
      { code: "zh-TW", tier: "comingSoon", enabled: true },
    ],
  },
  Kairo: {
    supported: [
      { code: "en-US", tier: "verified", enabled: true },
      { code: "es-ES", tier: "beta", enabled: true },
    ],
  },
  Lumo: {
    supported: [
      { code: "en-US", tier: "beta", enabled: true },
    ],
  },

  /**
   * Returns the support tier for a given agent-language combo.
   * @param {string} agentName
   * @param {string} langCode
   * @returns {string|null}
   */
  getTier(agentName, langCode) {
    const agent = this[agentName];
    if (!agent || !agent.supported) return null;

    const match = agent.supported.find((entry) => entry.code === langCode);
    return match?.tier || null;
  },

  /**
   * Returns whether the agent supports the language AND it's enabled.
   * @param {string} agentName
   * @param {string} langCode
   * @returns {boolean}
   */
  isSupported(agentName, langCode) {
    const agent = this[agentName];
    if (!agent || !agent.supported) return false;

    const match = agent.supported.find((entry) => entry.code === langCode);
    return !!(match && (match.tier === "verified" || match.tier === "beta") && match.enabled !== false);
  },

  /**
   * Filters supported language codes by tier (optional).
   * @param {string} agentName
   * @param {string|null} tierFilter
   * @returns {Array<string>}
   */
  getLanguages(agentName, tierFilter = null) {
    const agent = this[agentName];
    if (!agent || !agent.supported) return [];

    return agent.supported
      .filter((entry) => entry.enabled !== false && (!tierFilter || entry.tier === tierFilter))
      .map((entry) => entry.code);
  },
};

export default agentLanguageMatrix;
