// enhancements/services/loggerService.js

/**
 * loggerService.js
 *
 * Centralized logger for GEH backend. Tracks:
 * - Prompt-level actions
 * - CLA-trigger events
 * - Tier limit violations
 * - Agent/system fallback diagnostics
 *
 * Automatically fails safe — no app logic should break if logging fails.
 */

const fs = require('fs');
const path = require('path');

/**
 * Internal log writer with fallback to console if write fails.
 *
 * @param {string} category - e.g., 'cla', 'tier', 'system'
 * @param {string} level - 'info' | 'warn' | 'error'
 * @param {string} message
 * @param {object} meta
 */
const logEvent = (category, level, message, meta = {}) => {
  try {
    const timestamp = new Date().toISOString();
    const logLine = JSON.stringify({
      timestamp,
      category,
      level,
      message,
      meta,
    });

    const logPath = path.join(__dirname, `../../logs/${category}.log`);
    fs.appendFileSync(logPath, logLine + '\n');
  } catch (err) {
    console.error(`[Logger Fallback] ${level.toUpperCase()} | ${message}`, meta);
  }
};

/**
 * Logs a CLA-trigger event with high priority.
 *
 * @param {object} details
 */
const logComplianceTrigger = (details) => {
  logEvent('cla', 'warn', 'Compliance trigger invoked', details);
};

/**
 * Logs any system-level agent error (e.g., fallback, unknown behavior).
 *
 * @param {string} message
 * @param {object} context
 */
const logAgentFallback = (message, context = {}) => {
  logEvent('system', 'info', message, context);
};

/**
 * Logs a soft tier-limit block without stopping execution.
 *
 * @param {object} payload
 */
const logTierBreach = (payload) => {
  logEvent('tier', 'warn', 'Tier limit breach recorded', payload);
};

module.exports = {
  logEvent,
  logComplianceTrigger,
  logAgentFallback,
  logTierBreach,
};
