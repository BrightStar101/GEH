// backend/services/retrainingQueueService.js

const fs = require('fs');
const path = require('path');
const { logError } = require('../utils/loggerUtils');

const RETRAIN_PATH = path.join(__dirname, '../../logs/retraining-queue.jsonl');

/**
 * Appends a retraining candidate to local queue log
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.agent
 * @param {string} params.input
 * @param {string} params.output
 * @param {number} params.confidence
 */
async function logRetrainingCandidate({ userId, agent, input, output, confidence }) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      userId,
      agent,
      input,
      output,
      confidence,
    };

    fs.appendFileSync(RETRAIN_PATH, JSON.stringify(entry) + '\n');
    return true;
  } catch (err) {
    logError('RetrainingQueueService: Failed to log retraining candidate', err);
    return false;
  }
}

module.exports = {
  logRetrainingCandidate,
};
