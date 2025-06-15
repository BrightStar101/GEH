/**
 * loggerUtils.js
 *
 * Lightweight logging utility for GEH microservices
 * Wraps console methods for clarity and future extensibility
 */

function logInfo(message, context = {}) {
  const timestamp = new Date().toISOString();
  console.info(`[INFO] [${timestamp}] ${message}`, context);
}

function logWarn(message, context = {}) {
  const timestamp = new Date().toISOString();
  console.warn(`[WARN] [${timestamp}] ${message}`, context);
}

function logError(message, error = {}) {
  const timestamp = new Date().toISOString();
  const errMsg = error?.message || error;
  console.error(`[ERROR] [${timestamp}] ${message}`, errMsg);
}

function logDebug(message, context = {}) {
  const timestamp = new Date().toISOString();
  console.debug(`[DEBUG] [${timestamp}] ${message}`, context);
}

module.exports = {
  logInfo,
  logWarn,
  logError,
  logDebug,
};
