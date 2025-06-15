/**
 * confidenceUtils.js
 *
 * Tools for normalizing and interpreting LLM confidence levels
 * Used by scoring, fallback routing, and retraining triggers
 */

/**
 * Normalizes a raw score to a [0.0, 1.0] range using basic clipping
 * @param {number} rawScore
 * @returns {number}
 */
function normalizeScore(rawScore) {
  if (typeof rawScore !== 'number') return 0.5;
  return Math.max(0.0, Math.min(1.0, parseFloat(rawScore.toFixed(3))));
}

/**
 * Maps confidence to labels (for UI badges, logs, etc.)
 * @param {number} confidence
 * @returns {string}
 */
function labelConfidence(confidence) {
  if (confidence >= 0.9) return 'very high';
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.6) return 'moderate';
  if (confidence >= 0.4) return 'low';
  return 'very low';
}

/**
 * Returns boolean if confidence is low enough to consider fallback
 * @param {number} score
 * @returns {boolean}
 */
function shouldFallback(score) {
  return score < 0.4;
}

module.exports = {
  normalizeScore,
  labelConfidence,
  shouldFallback,
};
