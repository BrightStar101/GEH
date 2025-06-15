/**
 * GEH Logging Utility - logEvent.js
 * Centralized logging with optional file output for dev/staging.
 */

const fs = require('fs');
const path = require('path');

const LOG_TO_FILE = process.env.NODE_ENV !== 'production';
const LOG_FILE_PATH = path.resolve(__dirname || '.', '../logs/mira-events.log');

async function logEvent(eventName, data = {}) {
  try {
    if (typeof eventName !== 'string' || eventName.length < 2) {
      console.warn('[logEvent] Invalid event name provided');
      return;
    }

    const entry = {
      event: eventName,
      timestamp: new Date().toISOString(),
      metadata: data,
    };

    console.log(`[GEH LOG] ${entry.timestamp} | ${eventName}`, data);

    if (LOG_TO_FILE) {
      const serialized = JSON.stringify(entry) + '\n';
      fs.appendFile(LOG_FILE_PATH, serialized, (err) => {
        if (err) console.error(`[logEvent] Failed to write log to file:`, err);
      });
    }
  } catch (err) {
    console.error(`[logEvent] Logging error:`, err.message);
  }
}

function redactSensitiveFields(data, sensitiveFields = []) {
  if (!data || typeof data !== 'object') return {};

  const redacted = { ...data };
  for (const field of sensitiveFields) {
    if (redacted[field]) {
      redacted[field] = '[REDACTED]';
    }
  }
  return redacted;
}

module.exports = {
  logEvent,
  redactSensitiveFields,
};
