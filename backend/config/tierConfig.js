/**
 * tierConfig.js
 *
 * Tier Configuration Module for Mira AI (GEH)
 *
 * Maps user subscription tiers to GPT usage limits,
 * AI access scope, and system-enforced controls.
 */

const tierSettings = {
  free: {
    label: 'Free',
    gptAccess: false,
    maxTokensPerSession: 0,
    maxTokensPerDay: 0,
    aiSupport: false,
    confidenceScoreEnabled: false,
    gptModel: null,
    maxSupportQuestions: 0,
  },
  starter: {
    label: 'Starter Kit ($5)',
    gptAccess: true,
    maxTokensPerSession: 12000,
    maxTokensPerDay: 12000,
    aiSupport: true,
    confidenceScoreEnabled: false,
    gptModel: 'gpt-4o',
    maxSupportQuestions: 15,
  },
  official: {
    label: 'Official Pack ($25)',
    gptAccess: true,
    maxTokensPerSession: 160000,
    maxTokensPerDay: 160000,
    aiSupport: true,
    confidenceScoreEnabled: true,
    gptModel: 'gpt-4o',
    maxSupportQuestions: 30,
  },
  family: {
    label: 'Friends & Family ($75)',
    gptAccess: true,
    maxTokensPerSession: 500000,
    maxTokensPerDay: 500000,
    aiSupport: true,
    confidenceScoreEnabled: true,
    multilingualPriority: true,
    gptModel: 'gpt-4o',
    maxSupportQuestions: 100,
  },
};

/**
 * Retrieves tier config for a user by tier ID.
 * @param {number} tier
 * @returns {Object} Tier settings object
 */
function getUserTierConfig(tier) {
  if (typeof tier !== 'string') {
    throw new Error('Invalid tier value. Expected string.');
  }
  return tierSettings[tier] || tierSettings['free'];
}

/**
 * Validates whether a given tier has GPT access.
 * @param {number} tier
 * @returns {boolean}
 */
function hasGptAccess(tier) {
  return getUserTierConfig(tier).gptAccess === true;
}

/**
 * Retrieves the max tokens per session allowed for this tier.
 * @param {number} tier
 * @returns {number}
 */
function getMaxTokensPerSession(tier) {
  return getUserTierConfig(tier).maxTokensPerSession || 0;
}

module.exports = {
  getUserTierConfig,
  hasGptAccess,
  getMaxTokensPerSession,
};
