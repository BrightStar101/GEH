const fs = require('fs');
const path = require('path');
const { logInfo, logError } = require('utils/loggerUtils');

const TOGGLE_PATH = path.join(__dirname, "../config/adminFeatureToggles.json");
const AUDIT_LOG_PATH = path.join(__dirname, "../logs/adminToggleAudit.jsonl");
const RETRY_LIMIT = 3;

function getFeatureToggles() {
  try {
    if (!fs.existsSync(TOGGLE_PATH)) return {};
    const raw = fs.readFileSync(TOGGLE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    logError("❌ Failed to read admin feature toggles", err);
    return {};
  }
}

function writeTogglesToFile(toggles) {
  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
    try {
      fs.writeFileSync(TOGGLE_PATH, JSON.stringify(toggles, null, 2), "utf8");
      return true;
    } catch (err) {
      logError(`🛑 Toggle write failed (attempt ${attempt})`, err);
    }
  }
  return false;
}

function updateFeatureToggle(featureKey, enabled, adminEmail = "unknown") {
  try {
    if (typeof featureKey !== "string" || !featureKey.trim()) {
      throw new Error("Feature key must be a non-empty string.");
    }

    if (typeof enabled !== "boolean") {
      throw new Error("Enabled value must be a boolean.");
    }

    const toggles = getFeatureToggles();
    toggles[featureKey] = enabled;

    const success = writeTogglesToFile(toggles);
    if (!success) throw new Error("Failed to write toggle config to disk");

    logInfo("✅ Admin toggle updated", { featureKey, enabled });

    const auditRecord = {
      timestamp: new Date().toISOString(),
      action: "toggle_update",
      featureKey,
      enabled,
      modifiedBy: adminEmail,
    };

    fs.appendFileSync(AUDIT_LOG_PATH, JSON.stringify(auditRecord) + "\n");

    return true;
  } catch (err) {
    logError("❌ Failed to update admin toggle", err);
    return false;
  }
}

function getAuditLog(limit = 25) {
  try {
    if (!fs.existsSync(AUDIT_LOG_PATH)) return [];

    const lines = fs.readFileSync(AUDIT_LOG_PATH, "utf8").trim().split("\n");
    return lines
      .slice(-limit)
      .map((line) => JSON.parse(line))
      .reverse();
  } catch (err) {
    logError("❌ Failed to load admin toggle audit log", err);
    return [];
  }
}

module.exports = {
  getFeatureToggles,
  updateFeatureToggle,
  getAuditLog,
};
