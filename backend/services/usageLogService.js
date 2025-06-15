const fs = require('fs');
const path = require('path');
const { logInfo, logError } = require('../utils/loggerUtils');

const LOG_DIR = path.join(__dirname, "../logs");
const USAGE_LOG_FILE = path.join(LOG_DIR, "apiUsage.log");

/**
 * Logs a structured usage event to disk
 */
function logUsageEvent(payload) {
  try {
    if (
      !payload ||
      typeof payload !== "object" ||
      !payload.userId ||
      !payload.action
    ) {
      throw new Error("Invalid usage event payload.");
    }

    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR);
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: payload.userId,
      action: payload.action,
      agent: payload.agent || null,
      meta: payload.meta || {},
    };

    fs.appendFileSync(USAGE_LOG_FILE, JSON.stringify(logEntry) + "\n");
    logInfo("📝 Usage event logged", logEntry);
  } catch (err) {
    logError("❌ Failed to log usage event", err);
  }
}

/**
 * Simulates a log (dry run)
 */
function simulateUsage(reason) {
  try {
    if (!reason) throw new Error("Missing simulation reason");
    logInfo("🔄 Simulated usage event", { reason, timestamp: new Date().toISOString() });
  } catch (err) {
    logError("❌ Failed to simulate usage event", err);
  }
}

module.exports = {
  logUsageEvent,
  simulateUsage,
};
