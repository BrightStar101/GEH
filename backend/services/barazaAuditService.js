const fs = require('fs');
const path = require('path');
const { logInfo, logError } = require('../utils/loggerUtils');

function recordBarazaInjection(payload) {
  try {
    if (
      !payload ||
      typeof payload !== "object" ||
      !payload.sessionId ||
      !payload.formId ||
      !payload.injectionSource ||
      !payload.contents
    ) {
      throw new Error("Invalid or incomplete audit payload provided to recordBarazaInjection()");
    }

    const timestamp = new Date(payload.timestamp || Date.now()).toISOString();

    const auditEntry = {
      type: "BARAZA_INJECTION",
      timestamp,
      sessionId: payload.sessionId,
      formId: payload.formId,
      injectionSource: payload.injectionSource,
      contents: payload.contents,
    };

    const auditDir = path.join(__dirname, "../logs");
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir);
    }

    const logPath = path.join(auditDir, "barazaAudit.jsonl");
    fs.appendFileSync(logPath, JSON.stringify(auditEntry) + "\n");

    logInfo("✅ Baraza injection logged", {
      sessionId: payload.sessionId,
      formId: payload.formId,
    });
  } catch (err) {
    logError("❌ Failed to record Baraza audit entry", err);
  }
}

module.exports = {
  recordBarazaInjection,
};
