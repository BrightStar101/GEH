/**
 * driftMonitorAgent.js
 *
 * Global Entry Hub (GEH)
 * Drift Detection Agent
 *
 * Purpose:
 * Detects significant deviations from known immigration baselines in Mira's AI outputs.
 * Used to monitor hallucination risk and ensure GEH maintains factual integrity.
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/loggerUtils');

// Load known-good factual baseline
const BASELINE_FILE = path.join(__dirname, '../../config/ai-baseline-rules.json');
let BASELINE_KNOWLEDGE = [];

try {
  const raw = fs.readFileSync(BASELINE_FILE, 'utf8');
  BASELINE_KNOWLEDGE = JSON.parse(raw);
  logger.logInfo(`DriftMonitor: Loaded ${BASELINE_KNOWLEDGE.length} baseline entries.`);
} catch (err) {
  logger.logError('DriftMonitor: Failed to load AI baseline facts.', err);
  BASELINE_KNOWLEDGE = [];
}

/**
 * Normalize strings for drift comparison.
 * @param {String} str
 * @returns {String}
 */
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes how much an AI output deviates from expected facts.
 * @param {String} aiOutput
 * @returns {Object} Drift result { driftLevel, missingBaselineRefs, totalBaseline }
 */
function assessDrift(aiOutput) {
  if (!aiOutput || typeof aiOutput !== 'string') {
    return {
      driftLevel: 0,
      missingBaselineRefs: [],
      totalBaseline: 0,
    };
  }

  const normalizedAI = normalize(aiOutput);
  const missingRefs = [];

  for (const fact of BASELINE_KNOWLEDGE) {
    const baseline = normalize(fact);
    if (!normalizedAI.includes(baseline)) {
      missingRefs.push(fact);
    }
  }

  const driftRatio = missingRefs.length / BASELINE_KNOWLEDGE.length;
  return {
    driftLevel: driftRatio,
    missingBaselineRefs: missingRefs,
    totalBaseline: BASELINE_KNOWLEDGE.length,
  };
}

/**
 * Evaluates Mira output and triggers logging or admin alerts if drift exceeds threshold.
 * @param {String} responseText
 * @param {String} origin
 * @returns {Object} { flagged: Boolean, driftReport: Object }
 */
function evaluateMiraResponseForDrift(responseText, origin = 'unknown') {
  try {
    const driftReport = assessDrift(responseText);
    const threshold = 0.15;

    if (driftReport.driftLevel > threshold) {
      logger.logWarn(
        `DriftMonitor: Drift detected [${origin}] → ${(driftReport.driftLevel * 100).toFixed(2)}% deviation`
      );
      return {
        flagged: true,
        driftReport,
      };
    } else {
      return {
        flagged: false,
        driftReport,
      };
    }
  } catch (error) {
    logger.logError('DriftMonitor: Error evaluating AI output drift.', error);
    return {
      flagged: false,
      driftReport: null,
    };
  }
}

/**
 * Initializes Drift Monitor Agent at server startup.
 */
async function initializeDriftMonitor() {
  logger.logInfo('DriftMonitor: Initialized.');
}

module.exports = {
  initializeDriftMonitor,
  evaluateMiraResponseForDrift,
};
