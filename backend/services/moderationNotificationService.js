const { sendEscalationAlert } = require('utils/sendEscalationAlert');
const moderationConfig = require('config/moderationConfig');
const { logger } = require('utils/loggerUtils');

const throttleCache = new Map();

async function sendNotificationIfNeeded(flagRecord) {
  try {
    if (!flagRecord || flagRecord.highestTier !== "high") return false;

    const primaryTag = flagRecord.matches[0]?.tag || "generic";
    const routeTarget = moderationConfig.notificationTargets[primaryTag] || moderationConfig.notificationTargets.default;
    const cacheKey = `${primaryTag}-${new Date().toISOString().slice(0, 10)}`;

    if (isThrottled(cacheKey)) {
      logger.logInfo(`[MODERATION] Alert for tag "${primaryTag}" skipped due to throttle.`);
      return false;
    }

    const payload = {
      subject: `⚠️ GEH High-Tier Flag Triggered: ${primaryTag}`,
      body: buildMessageBody(flagRecord),
      target: routeTarget,
    };

    await sendEscalationAlert(payload);
    logger.logInfo(`[MODERATION] Escalation alert sent for flag: ${flagRecord._id}`);

    throttleCache.set(cacheKey, Date.now());
    return true;
  } catch (err) {
    logger.logError("sendNotificationIfNeeded failed:", err);
    return false;
  }
}

function isThrottled(key) {
  const lastSent = throttleCache.get(key);
  const now = Date.now();
  const throttleWindowMs = moderationConfig.alertThrottleMs || 10 * 60 * 1000;
  return lastSent && now - lastSent < throttleWindowMs;
}

function buildMessageBody(flag) {
  return `
GEH Moderation Alert

Flag ID: ${flag._id}
Tag(s): ${flag.matches.map((m) => m.tag).join(", ")}
Tier: ${flag.highestTier}
Language: ${flag.langCode}
Source: ${flag.source}
Created At: ${new Date(flag.createdAt).toLocaleString()}

Text:
"${flag.originalText}"

Traces:
${flag.matches.map((m) => `• ${m.trace.join("; ")}`).join("\n")}
  `.trim();
}

module.exports = {
  sendNotificationIfNeeded,
};
