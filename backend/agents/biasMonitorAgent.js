/**
 * biasMonitorAgent.js
 *
 * Global Entry Hub (GEH)
 * Bias Detection Agent
 *
 * Purpose:
 * Analyzes AI outputs (Mira) to detect tone, region, or demographic bias.
 * Helps GEH enforce fairness, neutrality, and compliance with international standards.
 */

const logger = require('../utils/loggerUtils');

// GEH-controlled sensitivity thresholds
const REGION_BIAS_THRESHOLD = 0.3;
const KEYWORD_BIAS_THRESHOLD = 0.25;

const REGION_KEYWORDS = ['asia', 'africa', 'europe', 'latin america', 'middle east', 'north america'];
const RED_FLAG_TERMS = [
  'illegal alien',
  'preferred race',
  'priority country',
  'english speakers only',
  'deportation by default',
];

/**
 * Normalizes text for scanning (lowercase, remove punctuation).
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

/**
 * Scans AI output for regional overrepresentation.
 * @param {string} aiText
 * @returns {Object} { regionBiasRatio, flaggedRegions }
 */
function checkRegionBias(aiText) {
  const result = {
    regionBiasRatio: 0,
    flaggedRegions: [],
  };

  const counts = {};
  const normText = normalizeText(aiText);

  for (const region of REGION_KEYWORDS) {
    const occurrences = normText.split(region).length - 1;
    counts[region] = occurrences;
  }

  const totalMentions = Object.values(counts).reduce((sum, count) => sum + count, 0);
  if (totalMentions === 0) return result;

  for (const [region, count] of Object.entries(counts)) {
    const ratio = count / totalMentions;
    if (ratio > REGION_BIAS_THRESHOLD) {
      result.flaggedRegions.push(region);
    }
  }

  result.regionBiasRatio = result.flaggedRegions.length / REGION_KEYWORDS.length;
  return result;
}

/**
 * Scans AI output for red-flagged terms or phrases.
 * @param {string} aiText
 * @returns {Array<string>} Detected problematic phrases
 */
function scanForRedFlags(aiText) {
  const normText = normalizeText(aiText);
  const detected = [];

  for (const phrase of RED_FLAG_TERMS) {
    if (normText.includes(phrase)) {
      detected.push(phrase);
    }
  }

  return detected;
}

/**
 * Evaluates AI output for bias and flags if thresholds are exceeded.
 * @param {string} responseText - Full AI response from Mira
 * @param {string} origin - Optional origin trace (e.g., 'Form I-130 Explanation')
 * @returns {Object} result { flagged: Boolean, report: Object }
 */
function evaluateMiraResponseForBias(responseText, origin = 'unknown') {
  try {
    if (!responseText || typeof responseText !== 'string') {
      return { flagged: false, report: null };
    }

    const regionScan = checkRegionBias(responseText);
    const redFlags = scanForRedFlags(responseText);

    const biasTriggered = regionScan.flaggedRegions.length > 0 || redFlags.length > 0;

    if (biasTriggered) {
      logger.logWarn(
        `BiasMonitor: Bias detected in Mira response from ${origin} — Regions: [${regionScan.flaggedRegions.join(
          ', '
        )}], Red Flags: [${redFlags.join(', ')}]`
      );
    }

    return {
      flagged: biasTriggered,
      report: {
        regionBias: regionScan,
        redFlags,
        origin,
      },
    };
  } catch (error) {
    logger.logError('BiasMonitor: Error while evaluating Mira output.', error);
    return {
      flagged: false,
      report: null,
    };
  }
}

/**
 * Initializes Bias Monitor Agent at server boot.
 */
async function initializeBiasMonitor() {
  logger.logInfo('BiasMonitor: Initialized.');
}

module.exports = {
  initializeBiasMonitor,
  evaluateMiraResponseForBias,
};
