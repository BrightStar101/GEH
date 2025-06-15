const mongoose = require('mongoose');
const { logError } = require('../utils/loggerUtils');
const { getLanguagePreference } = require('./agentLanguagePreferenceService');
const jwt = require('jsonwebtoken');

const agentUsageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  agent: { type: String, enum: ["mira", "kairo", "lumo"], required: true },
  sessionType: { type: String, enum: ["chat", "form", "ocr"], default: "chat" },
  inputSummary: { type: String, maxlength: 512 },
  confidence: { type: Number, min: 0, max: 1, required: true },
  fallbackUsed: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, enum: ["web", "mobile", "api"], default: "web" },
  intent: { type: String, maxlength: 100 },
  retrainCandidate: { type: Boolean, default: false },
  languagePreference: { type: String, default: 'en' } // ✅ Injected field
});

const AgentUsageLog = mongoose.model("AgentUsageLog", agentUsageSchema);

/**
 * Logs usage of an AI agent with optional language token
 * @param {Object} data - Core usage data
 * @param {string} [token] - Optional JWT to enrich with language preference
 */
async function logAgentUsage(data, token = null) {
  try {
    if (!data || !data.userId || !data.agent || typeof data.confidence !== "number") {
      throw new Error("Missing required usage logging fields.");
    }

    // ✅ Inject languagePreference if token is available
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const langPref = await getLanguagePreference(token);
        data.languagePreference = langPref;
      } catch (err) {
        logError("agentUsageLogger: Failed to attach language preference", err.message);
      }
    }

    const logEntry = new AgentUsageLog(data);
    return await logEntry.save();
  } catch (err) {
    logError("agentUsageLogger.logAgentUsage failed:", err);
    throw err;
  }
}

module.exports = {
  logAgentUsage,
};
