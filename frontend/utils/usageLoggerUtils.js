// File: frontend/utils/usageLoggerUtils.js
// Global Entry Hub – GPT usage logger for analytics + CLA support

import analyticsTracker from "./analyticsTracker";

/**
 * logGptUsage
 * Logs GPT usage to analytics tracker for CLA, audit, and debugging.
 * Supports fallback, tier awareness, and redaction.
 *
 * @param {Object} payload - Usage metadata
 * @param {string} payload.prompt - Original user prompt
 * @param {string} payload.response - GPT response (redacted)
 * @param {string} payload.model - e.g. "gpt-4o"
 * @param {string} payload.tier - User plan (e.g. "starter")
 * @param {boolean} payload.fallbackUsed - Whether GPT fallback logic was triggered
 * @param {number} [payload.confidenceScore] - Optional float (0.0–1.0)
 */
export function logGptUsage({
  prompt,
  response,
  model = "gpt-4o",
  tier = "unknown",
  fallbackUsed = false,
  confidenceScore = null,
}) {
  try {
    const redactedPrompt = prompt?.slice(0, 300);
    const redactedResponse = response?.slice(0, 500);

    analyticsTracker.logEvent("gpt_usage", {
      planTier: tier,
      modelUsed: model,
      fallbackTriggered: fallbackUsed,
      confidenceScore,
      userPrompt: redactedPrompt,
      gptResponse: redactedResponse,
    });
  } catch (err) {
    console.error("⚠️ GPT usage logging failed", err);
  }
}
