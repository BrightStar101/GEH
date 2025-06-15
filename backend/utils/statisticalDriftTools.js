/**
 * statisticalDriftTools.js
 *
 * Provides statistical tools to detect model drift or prompt inconsistency
 */

const { logDebug } = require('../utils/loggerUtils');

/**
 * Basic drift detection using a moving average confidence window
 * @param {number[]} scores - array of recent confidence scores
 * @param {number} threshold - drift trigger threshold (default: 0.2)
 * @returns {boolean}
 */
function detectConfidenceDrift(scores, threshold = 0.2) {
  if (!Array.isArray(scores) || scores.length < 5) return false;

  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
  const stddev = Math.sqrt(variance);

  logDebug('Drift check:', { avg, stddev });

  return stddev > threshold;
}

/**
 * Computes a rolling average and stddev over N buckets
 * @param {number[]} values
 * @returns {{ avg: number, stddev: number }}
 */
function summarizeScores(values) {
  if (!Array.isArray(values) || values.length === 0) return { avg: 0, stddev: 0 };

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  return { avg, stddev: Math.sqrt(variance) };
}

module.exports = {
  detectConfidenceDrift,
  summarizeScores,
};
