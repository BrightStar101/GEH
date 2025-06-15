// enhancements/utils/retryBackoff.js

/**
 * retryBackoff.js
 *
 * Utility for retrying async operations using exponential backoff.
 * Supports retry limit, delay customization, and failure-safe exit.
 *
 * Used by agents, controllers, and webhook handlers needing retry tolerance.
 */

const logger = require('../services/loggerService');

/**
 * Retries a provided async function using exponential backoff strategy.
 *
 * @param {Function} asyncFn - The async function to execute.
 * @param {Object} options
 * @param {number} [options.retries=3] - Max retry attempts.
 * @param {number} [options.delay=500] - Initial delay in ms.
 * @param {string} [options.contextLabel] - Optional label for logs.
 * @returns {Promise<any>} Result of the async function or error.
 */
async function retryWithBackoff(asyncFn, options = {}) {
  const {
    retries = 3,
    delay = 500,
    contextLabel = 'retryBackoff',
  } = options;

  let attempt = 0;
  let backoff = delay;

  while (attempt < retries) {
    try {
      return await asyncFn();
    } catch (err) {
      attempt += 1;
      logger.logEvent('system', 'warn', `Retry ${attempt} failed`, {
        label: contextLabel,
        error: err.message,
      });

      if (attempt >= retries) {
        logger.logEvent('system', 'error', `All ${retries} attempts failed`, {
          label: contextLabel,
          finalError: err.message,
        });
        throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, backoff));
      backoff *= 2; // Exponential
    }
  }
}

module.exports = {
  retryWithBackoff,
};
