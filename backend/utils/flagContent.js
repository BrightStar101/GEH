/**
 * flagContent.js
 *
 * Lightweight moderation engine for GEH
 * Flags inappropriate or sensitive language in user content
 */

const moderationConfig = require('../config/moderationConfig');

function flagContent({ text, langCode = 'en' }) {
  if (!text || typeof text !== 'string') return { flagged: false, matches: [] };

  const lower = text.toLowerCase();
  const matches = [];

  for (const rule of moderationConfig.rules) {
    const found = rule.triggers.some((trigger) => lower.includes(trigger));
    if (found) {
      matches.push({
        tag: rule.tag,
        tier: rule.tier,
        trace: rule.triggers.filter((t) => lower.includes(t)),
      });
    }
  }

  return {
    flagged: matches.length > 0,
    matches,
  };
}

module.exports = {
  flagContent,
};
